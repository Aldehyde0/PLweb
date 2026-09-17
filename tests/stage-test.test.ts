import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildStageQuestions,
  generatePlan,
  migratePlanState,
  scoreStageTest,
  applyStageSelfAssessment,
  PLAN_STATE_VERSION,
  type PlanConcept,
  type PlanFormInput,
} from '../lib/plan-engine.ts';
import {
  isAnswerAccepted,
  isPlaceholderStageQuestion,
  normalizeAnswer,
  type StageQuestionInput,
} from '../lib/stage-test.ts';
import { questionBank } from '../lib/stage-test-bank.ts';

const bankedConcept: PlanConcept = {
  slug: 'supervised-learning',
  title: '监督学习',
  category: 'machine-learning',
  difficulty: '入门',
  prerequisites: ['Python 基础'],
  hasCode: true,
  hasInteractive: false,
  definition: ['从带标签样本中学习输入到目标的映射。'],
};

/** A concept with no curated entry, to exercise the derived-question path. */
const unbankedConcept: PlanConcept = {
  slug: 'totally-unbanked-concept',
  title: '未收录概念',
  category: 'deep-learning',
  difficulty: '进阶',
  prerequisites: ['神经网络', '线性代数'],
  hasCode: false,
  hasInteractive: false,
  definition: ['这是一个测试用的概念定义文本，用于验证基于定义生成的题目。'],
};

const baseInput: PlanFormInput = {
  title: '题库验证计划',
  goal: '验证阶段测试题目',
  categories: ['machine-learning'],
  method: 'knowledge-route',
  level: '入门',
  weeklyMinutes: 300,
  targetDate: '2026-12-31',
  includeCode: true,
  includeTests: true,
  includeReview: false,
};

void test('question bank has no placeholder prompts and no fixed "正确" answer', () => {
  const entries = Object.values(questionBank).flat();
  assert.ok(entries.length > 100, `expected a substantial bank, got ${entries.length}`);
  for (const question of entries) {
    assert.equal(
      isPlaceholderStageQuestion(question),
      false,
      `placeholder-style question in bank: ${question.id}`,
    );
    assert.ok(
      question.prompt.length >= 8,
      `prompt too short to be a real question: ${question.id}`,
    );
    assert.doesNotMatch(
      question.prompt,
      /^请完成关于/,
      `generic prompt resurfaced: ${question.id}`,
    );
  }
});

void test('every banked question has a checkable answer shape', () => {
  for (const [slug, questions] of Object.entries(questionBank)) {
    const ids = new Set<string>();
    for (const question of questions) {
      assert.ok(!ids.has(question.id), `duplicate question id ${question.id}`);
      ids.add(question.id);
      assert.equal(question.conceptSlug, slug, `wrong conceptSlug on ${question.id}`);
      assert.ok(question.explanation.length > 0, `missing explanation on ${question.id}`);
      if (
        question.type === 'concept-explanation' ||
        question.type === 'code-reading'
      ) {
        assert.ok(
          question.referenceAnswer.length >= 20,
          `self-assessed question needs a usable reference answer: ${question.id}`,
        );
        assert.equal(
          question.referenceAnswer.trim(),
          question.referenceAnswer,
          `reference answer has stray whitespace: ${question.id}`,
        );
        assert.notEqual(
          question.referenceAnswer,
          question.prompt,
          `reference answer must not repeat the prompt: ${question.id}`,
        );
        continue;
      }
      const answers = questionBankAcceptedAnswers(question);
      assert.ok(answers.length > 0, `no accepted answer on ${question.id}`);
      for (const answer of answers)
        assert.ok(answer.trim().length > 0, `blank accepted answer on ${question.id}`);
    }
  }
});

/** Accepted answers for an objective bank entry; empty for self-assessed ones. */
function questionBankAcceptedAnswers(question: StageQuestionInput): string[] {
  switch (question.type) {
    case 'single-choice':
    case 'multiple-choice':
    case 'true-false':
      return question.correctOptions;
    case 'formula-fill':
    case 'code-output':
    case 'calculation':
      return question.accept;
    default:
      return [];
  }
}

void test('choice questions are internally consistent', () => {
  for (const questions of Object.values(questionBank)) {
    for (const question of questions) {
      if (
        question.type !== 'single-choice' &&
        question.type !== 'multiple-choice' &&
        question.type !== 'true-false'
      )
        continue;
      assert.ok(
        question.options.length >= 2,
        `${question.id} needs at least two options`,
      );
      assert.equal(
        new Set(question.options).size,
        question.options.length,
        `${question.id} repeats an option`,
      );
      for (const correct of question.correctOptions)
        assert.ok(
          question.options.includes(correct),
          `${question.id} accepts an option that is not offered: ${correct}`,
        );
      if (question.type === 'single-choice' || question.type === 'true-false')
        assert.equal(
          question.correctOptions.length,
          1,
          `${question.id} must have exactly one correct option`,
        );
      if (question.type === 'multiple-choice')
        assert.ok(
          question.correctOptions.length >= 2,
          `${question.id} is a multiple-choice question with one answer`,
        );
    }
  }
});

void test('answer matching tolerates formatting but not wrong answers', () => {
  assert.ok(isAnswerAccepted('０．６６７', ['0.667']));
  assert.ok(isAnswerAccepted(' (3, 4) ', ['(3,4)']));
  assert.ok(isAnswerAccepted('θ = θ - α∇J(θ)', ['θ=θ-α∇J(θ)']));
  assert.ok(isAnswerAccepted('0.667', ['2/3']));
  assert.ok(isAnswerAccepted('2/3', ['0.667']));
  assert.ok(isAnswerAccepted('200 条', ['200']));
  assert.equal(isAnswerAccepted('正确', ['错误']), false);
  assert.equal(isAnswerAccepted('', ['正确']), false);
  assert.equal(isAnswerAccepted('100', ['200']), false);
  // A sentence that merely contains a digit must not be graded as that number.
  assert.equal(isAnswerAccepted('这个答案肯定不对', ['12']), false);
  assert.equal(isAnswerAccepted('我认为大概是 12 左右', ['12']), false);
  assert.equal(isAnswerAccepted('我的解释里有 3 个要点', ['3']), false);
  assert.equal(normalizeAnswer('  正确  '), normalizeAnswer('正确'));
});

void test('generated stage test uses real questions instead of placeholders', () => {
  const plan = generatePlan(
    baseInput,
    [bankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  const phase = plan.phases[0]!;
  assert.equal(phase.test.notGradable, false);
  assert.ok(phase.test.questions.length > 0);
  for (const question of phase.test.questions) {
    assert.equal(isPlaceholderStageQuestion(question), false);
    assert.ok(question.prompt.length > 8);
    assert.ok(question.grading === 'objective' || question.grading === 'self-assessed');
    if (question.grading === 'objective')
      assert.ok(question.correctAnswers.length > 0, `${question.id} has no answer`);
    else assert.ok((question.exampleAnswer ?? '').length > 0);
  }
});

void test('answering "正确" everywhere no longer scores 100', () => {
  const plan = generatePlan(
    baseInput,
    [bankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const cheat = Object.fromEntries(
    phase.test.questions.map((question) => [question.id, ['正确']]),
  );
  const scored = scoreStageTest(
    plan,
    phase.id,
    cheat,
    false,
    new Date('2026-09-01T10:00:00'),
  );
  const result = scored.phases[0]!.test;
  assert.notEqual(result.score, 100);
  assert.ok(result.score !== null && result.score < 100, `score was ${result.score}`);
  assert.ok(result.incorrectQuestionIds.length > 0);
  assert.ok(result.weakConcepts.length > 0);
});

void test('a fully empty submission never scores above zero', () => {
  const plan = generatePlan(
    baseInput,
    [bankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const scored = scoreStageTest(plan, phase.id, {}, false, new Date('2026-09-01T10:00:00'));
  assert.equal(scored.phases[0]!.test.score, 0);
  assert.equal(
    scored.phases[0]!.test.incorrectQuestionIds.length,
    phase.test.questions.length,
  );
});

void test('correct answers score 100 and self-assessed questions stay out of the score', () => {
  const plan = generatePlan(
    baseInput,
    [bankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const selfAssessed = phase.test.questions.filter(
    (question) => question.grading === 'self-assessed',
  );
  const answers = Object.fromEntries(
    phase.test.questions.map((question) => [
      question.id,
      question.grading === 'self-assessed' ? ['我的解释'] : question.correctAnswers,
    ]),
  );
  const scored = scoreStageTest(
    plan,
    phase.id,
    answers,
    false,
    new Date('2026-09-01T10:00:00'),
  );
  const result = scored.phases[0]!.test;
  assert.equal(result.score, 100);
  assert.equal(result.hasUngradedQuestions, selfAssessed.length > 0);
  for (const question of selfAssessed) {
    const grade = result.grades?.find((item) => item.questionId === question.id);
    assert.equal(grade?.correct, null, 'self-assessed question must not be auto-graded');
    assert.equal(grade?.autoGraded, false);
  }
});

void test('self-assessment changes the score and can add the concept to review', () => {
  const plan = generatePlan(
    baseInput,
    [bankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const selfAssessed = phase.test.questions.filter(
    (question) => question.grading === 'self-assessed',
  );
  if (!selfAssessed.length) return;
  const answers = Object.fromEntries(
    phase.test.questions.map((question) => [
      question.id,
      question.grading === 'self-assessed' ? ['我的解释'] : question.correctAnswers,
    ]),
  );
  const scored = scoreStageTest(plan, phase.id, answers, true, new Date('2026-09-01T10:00:00'));
  const judgedWrong = applyStageSelfAssessment(
    scored,
    phase.id,
    Object.fromEntries(selfAssessed.map((question) => [question.id, false])),
    new Date('2026-09-01T11:00:00'),
  );
  const result = judgedWrong.phases[0]!.test;
  assert.equal(result.hasUngradedQuestions, false);
  assert.ok(result.score !== null && result.score < 100);
  for (const question of selfAssessed)
    assert.ok(
      result.incorrectQuestionIds.includes(question.id),
      'self-assessed failure should be listed for review',
    );
  assert.ok(result.weakConcepts.includes(bankedConcept.slug));
  assert.ok(
    judgedWrong.phases[0]!.tasks.some(
      (task) => task.type === 'review' && task.conceptSlug === bankedConcept.slug,
    ),
    'self-assessed weak concept should be added to review',
  );
});

void test('derived questions are only used when a concept has no curated entry', () => {
  const questions = buildStageQuestions([unbankedConcept]);
  assert.ok(questions.length >= 3, `expected derived questions, got ${questions.length}`);
  for (const question of questions) {
    assert.equal(question.conceptSlug, unbankedConcept.slug);
    assert.equal(isPlaceholderStageQuestion(question), false);
    assert.ok(question.correctAnswers.length > 0);
  }
  // The derived definition question must use the stored definition verbatim.
  const definitionQuestion = questions.find((question) =>
    question.correctAnswers.includes(unbankedConcept.definition![0]!),
  );
  assert.ok(definitionQuestion, 'derived questions must quote the real definition');
  // Curated concepts never fall back to metadata-only questions.
  const curatedPrompts = new Set(
    questionBank[bankedConcept.slug]!.map((entry) => entry.prompt),
  );
  const curated = buildStageQuestions([bankedConcept]);
  assert.ok(curated.length > 0);
  for (const question of curated)
    assert.ok(
      curatedPrompts.has(question.prompt),
      `banked concept used a non-curated question: ${question.prompt}`,
    );
});

void test('an empty concept list yields no questions rather than placeholders', () => {
  assert.deepEqual(buildStageQuestions([]), []);
});

void test('disabling tests records no score and no gradable questions', () => {
  const plan = generatePlan(
    { ...baseInput, includeTests: false },
    [bankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  for (const phase of plan.phases) {
    assert.deepEqual(phase.test.questions, []);
    assert.equal(phase.test.status, 'skipped');
    assert.equal(phase.test.score, null);
  }
  const scored = scoreStageTest(
    plan,
    plan.phases[0]!.id,
    {},
    true,
    new Date('2026-09-01T10:00:00'),
  );
  assert.equal(scored.phases[0]!.test.score, null);
  assert.ok(
    scored.phases[0]!.tasks.every((task) => task.type !== 'review'),
    'no review task without a measurement',
  );
});

void test('generated tests round-trip through storage without losing questions', () => {
  const plan = generatePlan(
    baseInput,
    [bankedConcept, unbankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  const before = plan.phases.map((phase) => phase.test.questions.length);
  const migrated = migratePlanState(
    JSON.stringify({
      version: PLAN_STATE_VERSION,
      plans: [plan],
      activities: [],
      reminder: { activePlanId: plan.id },
      completedTaskIds: [],
    }),
  );
  assert.deepEqual(
    migrated.plans[0]!.phases.map((phase) => phase.test.questions.length),
    before,
  );
});

void test('legacy placeholder tests lose their score, weak concepts and review tasks', () => {
  const legacyQuestions = Array.from({ length: 8 }, (_, index) => ({
    id: `question-${index}`,
    type: 'single-choice',
    prompt: '请完成关于“监督学习”的单选题。',
    options: ['正确', '错误'],
    correctAnswers: ['正确'],
    conceptSlug: 'supervised-learning',
    explanation: '回到“监督学习”的定义、公式或代码章节核对。',
  }));
  const migrated = migratePlanState(
    JSON.stringify({
      version: 1,
      plans: [
        {
          id: 'legacy-plan',
          title: '旧计划',
          phases: [
            {
              id: 'legacy-phase',
              title: '旧阶段',
              tasks: [],
              test: {
                id: 'legacy-test',
                phaseId: 'legacy-phase',
                title: '旧阶段 · 阶段练习',
                questions: legacyQuestions,
                status: 'completed',
                score: 100,
                completedAt: '2026-08-01T00:00:00.000Z',
                weakConcepts: ['supervised-learning'],
                incorrectQuestionIds: ['question-0'],
                addWeakToReview: true,
              },
            },
          ],
        },
      ],
      activities: [],
      reminder: { activePlanId: 'legacy-plan' },
      completedTaskIds: [],
    }),
  );
  const test_ = migrated.plans[0]!.phases[0]!.test;
  assert.deepEqual(test_.questions, [], 'placeholder questions must be dropped');
  assert.equal(test_.score, null, 'a placeholder-derived score is not a measurement');
  assert.equal(test_.completedAt, null);
  assert.deepEqual(test_.weakConcepts, []);
  assert.deepEqual(test_.incorrectQuestionIds, []);
  assert.equal(test_.notGradable, true);
  assert.equal(test_.status, 'skipped');
});

void test('legacy placeholder tests are not resurrected by answering "正确"', () => {
  const migrated = migratePlanState(
    JSON.stringify({
      version: 1,
      plans: [
        {
          id: 'p',
          title: '旧计划',
          phases: [
            {
              id: 'ph',
              tasks: [],
              test: {
                questions: [
                  {
                    id: 'q1',
                    type: 'true-false',
                    prompt: '请完成关于“K 近邻”的判断题。',
                    options: ['正确', '错误'],
                    correctAnswers: ['正确'],
                    conceptSlug: 'knn',
                    explanation: '回到定义核对。',
                  },
                ],
              },
            },
          ],
        },
      ],
      reminder: {},
    }),
  );
  const scored = scoreStageTest(
    migrated.plans[0]!,
    migrated.plans[0]!.phases[0]!.id,
    { q1: ['正确'] },
    true,
    new Date('2026-09-01T10:00:00'),
  );
  assert.equal(scored.phases[0]!.test.score, null);
  assert.equal(scored.phases[0]!.mastered, false);
  assert.ok(
    scored.phases[0]!.tasks.every((task) => task.type !== 'review'),
    'no review task should be created without a real measurement',
  );
});

void test('a real question set is preserved through migration', () => {
  const plan = generatePlan(
    baseInput,
    [bankedConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-09-01T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const answers = Object.fromEntries(
    phase.test.questions.map((question) => [question.id, question.correctAnswers]),
  );
  const scored = scoreStageTest(plan, phase.id, answers, false, new Date('2026-09-01T10:00:00'));
  const migrated = migratePlanState(
    JSON.stringify({
      version: 1,
      plans: [scored],
      activities: [],
      reminder: { activePlanId: scored.id },
      completedTaskIds: [],
    }),
  );
  const result = migrated.plans[0]!.phases[0]!.test;
  assert.equal(result.questions.length, phase.test.questions.length);
  assert.equal(result.score, 100, 'a genuine 100 must survive migration');
  assert.equal(result.status, 'completed');
});
