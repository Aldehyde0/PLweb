import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDefinitionParagraph,
  buildLocalDate,
  buildReminder,
  deletePlanFromState,
  moveTask,
  scoreStageTest,
  substepsComplete,
  syncLearnedTasks,
  taskMarksConceptLearned,
  updateTask,
  updateSubstep,
  generatePlan,
  migratePlanState,
  parseWeeklyMinutes,
  planPreview,
  recomputePlan,
  type PlanConcept,
  type PlanFormInput,
  type TaskType,
} from '../lib/plan-engine.ts';

const concepts: PlanConcept[] = [
  {
    slug: 'intro',
    title: '入门',
    category: 'machine-learning',
    difficulty: '入门',
    prerequisites: [],
    hasCode: true,
    hasInteractive: false,
  },
  {
    slug: 'core',
    title: '核心',
    category: 'machine-learning',
    difficulty: '进阶',
    prerequisites: ['intro'],
    hasCode: true,
    hasInteractive: true,
  },
  {
    slug: 'advanced',
    title: '挑战',
    category: 'machine-learning',
    difficulty: '挑战',
    prerequisites: ['core', 'missing'],
    hasCode: true,
    hasInteractive: false,
  },
];

const richConcept: PlanConcept = {
  slug: 'gradient-descent',
  title: '梯度下降',
  category: 'machine-learning',
  difficulty: '入门',
  prerequisites: ['导数'],
  hasCode: true,
  hasInteractive: true,
  hasFormula: true,
  definition: [
    '梯度下降是一种沿目标函数负梯度方向迭代更新参数的优化方法，它利用局部斜率逐步寻找更低的损失值。',
  ],
  summary:
    '它解决模型参数无法直接求得最优解时的数值优化问题，是训练线性模型和神经网络的基础。',
  principles: [
    '学习率决定每次更新步长，梯度方向决定参数变化方向；二者共同影响收敛速度与稳定性。',
  ],
  relatedConcepts: ['learning-rate-selection', 'gradient-descent-convergence'],
};

const baseInput: PlanFormInput = {
  title: '机器学习计划',
  goal: '理解并实践核心模型',
  categories: ['machine-learning'],
  method: 'knowledge-route',
  level: '入门',
  weeklyMinutes: 300,
  targetDate: '2026-09-30',
  includeCode: true,
  includeTests: true,
  includeReview: true,
};

void test('migrates missing fields without losing legacy plans', () => {
  const migrated = migratePlanState(
    JSON.stringify({ plans: [{ id: 'p1', title: '旧计划', phases: [] }] }),
  );
  assert.equal(migrated.version, 1);
  assert.equal(migrated.plans[0]?.title, '旧计划');
  assert.equal(migrated.plans[0]?.status, 'active');
  assert.deepEqual(migrated.completedTaskIds, []);
  assert.equal(migrated.reminder.activePlanId, 'p1');
});

void test('knowledge route only links existing concepts and reports broken prerequisites', () => {
  const plan = generatePlan(
    baseInput,
    concepts,
    { learned: ['intro'], bookmarks: ['core'] },
    new Date('2026-08-31T08:00:00'),
  );
  const linked = plan.phases
    .flatMap((phase) => phase.tasks)
    .filter((task) => task.conceptSlug);
  assert.ok(
    linked.every((task) =>
      concepts.some((concept) => concept.slug === task.conceptSlug),
    ),
  );
  assert.ok(
    plan.generationWarnings.some((warning) => warning.includes('missing')),
  );
  assert.equal(
    linked.find(
      (task) =>
        task.conceptSlug === 'intro' && task.type === 'concept-understanding',
    )?.status,
    'completed',
  );
});

void test('deep understanding keeps required comprehension steps inside one concept card', () => {
  const plan = generatePlan(
    {
      ...baseInput,
      method: 'deep-understanding',
      includeCode: false,
      includeReview: false,
    },
    concepts.slice(0, 1),
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const tasks = plan.phases
    .flatMap((phase) => phase.tasks)
    .filter((task) => task.conceptSlug === 'intro');
  assert.equal(tasks.length, 1);
  const types = new Set(
    tasks.flatMap((task) => task.substeps.map((step) => step.type)),
  );
  const requiredTypes: TaskType[] = [
    'definition-reading',
    'intuition',
    'principle',
    'self-explanation',
    'understanding-question',
  ];
  for (const type of requiredTypes) assert.ok(types.has(type));
});

void test('code practice adds an interactive experiment only for concepts that have one', () => {
  const plan = generatePlan(
    { ...baseInput, method: 'code-practice', includeReview: false },
    concepts,
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const experiments = plan.phases
    .flatMap((phase) => phase.tasks)
    .filter((task) =>
      task.substeps.some((step) => step.type === 'interactive-experiment'),
    );
  assert.deepEqual(
    experiments.map((task) => task.conceptSlug),
    ['core'],
  );
});

void test('spaced review uses day 0, 1, 3, 7 and 14 offsets', () => {
  const plan = generatePlan(
    {
      ...baseInput,
      method: 'spaced-review',
      includeCode: false,
      includeTests: false,
    },
    concepts.slice(0, 1),
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const reviews = plan.phases
    .flatMap((phase) => phase.tasks)
    .flatMap((task) => task.substeps)
    .filter((step) => step.type === 'review');
  assert.deepEqual(
    reviews.map((step) => step.dueDate),
    ['2026-08-31', '2026-09-01', '2026-09-03', '2026-09-07', '2026-09-14'],
  );
});

void test('recompute keeps reading, code, test and mastery states independent', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    concepts.slice(0, 1),
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const tasks = plan.phases[0]!.tasks.map((task, index) => ({
    ...task,
    status: index === 0 ? ('completed' as const) : task.status,
  }));
  const updated = recomputePlan(
    { ...plan, phases: [{ ...plan.phases[0]!, tasks }] },
    new Date('2026-08-31T10:00:00'),
  );
  assert.equal(updated.completionRate, 100);
  assert.notEqual(updated.phases[0]!.test.status, 'completed');
  assert.equal(updated.phases[0]!.mastered, false);
});

void test('reminder appears once per local day only for an active incomplete plan', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    concepts.slice(0, 1),
    { learned: [], bookmarks: [] },
    new Date('2026-08-29T08:00:00'),
  );
  const reminder = buildReminder(
    plan,
    {
      activePlanId: plan.id,
      lastStudyAt: '2026-08-29T08:00:00.000Z',
      lastStudyDate: '2026-08-29',
      lastOpenedAt: null,
      lastReminderDate: null,
      reminderDismissedDate: null,
    },
    new Date('2026-08-31T09:00:00'),
  );
  assert.equal(reminder?.daysAway, 2);
  assert.equal(reminder?.suggestedTasks.length, 1);
  assert.equal(
    buildReminder(
      plan,
      {
        activePlanId: plan.id,
        lastStudyAt: '2026-08-29T08:00:00.000Z',
        lastStudyDate: '2026-08-29',
        lastOpenedAt: null,
        lastReminderDate: '2026-08-31',
        reminderDismissedDate: null,
      },
      new Date('2026-08-31T09:00:00'),
    ),
    null,
  );
});

void test('learned synchronization completes only the matching concept card', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    concepts,
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const synced = syncLearnedTasks(plan, ['intro']);
  const tasks = synced.phases.flatMap((phase) => phase.tasks);
  assert.equal(
    tasks.find((task) => task.conceptSlug === 'intro')?.status,
    'completed',
  );
  assert.ok(
    tasks
      .filter((task) => task.conceptSlug !== 'intro')
      .every((task) => task.status !== 'completed'),
  );
});

void test('only comprehension tasks count as proof that a concept was learned', () => {
  const plan = generatePlan(
    {
      ...baseInput,
      method: 'code-practice',
      includeTests: false,
      includeReview: false,
      includeResources: true,
    },
    [
      {
        ...richConcept,
        resources: [
          {
            id: 'article',
            title: '基础文章',
            type: '技术文章',
            url: 'https://example.com/article',
            summary: '文章摘要',
            estimatedMinutes: 10,
            recommendationLevel: 'A',
          },
        ],
      },
    ],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const tasks = plan.phases.flatMap((phase) => phase.tasks);
  const learnedTypes = new Set(
    tasks
      .filter((task) => taskMarksConceptLearned(task))
      .map((task) => task.type),
  );
  assert.ok(
    learnedTypes.size > 0,
    'some task must be able to mark a concept learned',
  );
  for (const type of learnedTypes)
    assert.ok(
      [
        'concept-understanding',
        'concept-reading',
        'definition-reading',
      ].includes(type),
      `${type} must not mark a concept as learned`,
    );
  // Practice, review, exercise, project and resource work must never imply mastery.
  for (const type of [
    'principle-practice',
    'phase-review',
    'review',
    'exercise',
    'project',
    'resource-article',
    'custom',
  ]) {
    const task = tasks.find((item) => item.type === type);
    if (!task) continue;
    assert.equal(
      taskMarksConceptLearned(task),
      false,
      `${type} must not mark the concept as learned`,
    );
  }
  assert.equal(
    taskMarksConceptLearned({ ...tasks[0]!, conceptSlug: null }),
    false,
    'a task without a concept can never mark a concept as learned',
  );
});

void test('legacy per-substep reading cards still count as comprehension tasks', () => {
  const migrated = migratePlanState(
    JSON.stringify({
      plans: [
        {
          id: 'legacy',
          title: '旧计划',
          phases: [
            {
              id: 'phase-1',
              tasks: [
                {
                  id: 'task-reading',
                  title: '旧阅读任务',
                  type: 'concept-reading',
                  conceptSlug: 'intro',
                  estimatedMinutes: 15,
                  status: 'not-started',
                },
                {
                  id: 'task-definition',
                  title: '旧定义任务',
                  type: 'definition-reading',
                  conceptSlug: 'intro',
                  estimatedMinutes: 10,
                  status: 'not-started',
                },
              ],
            },
          ],
        },
      ],
    }),
  );
  const tasks = migrated.plans[0]!.phases[0]!.tasks;
  for (const task of tasks)
    assert.equal(
      taskMarksConceptLearned(task),
      true,
      `${task.type} is a legacy comprehension card and must still count`,
    );
  const synced = syncLearnedTasks(
    migrated.plans[0]!,
    ['intro'],
    new Date('2026-08-31T09:00:00'),
  );
  assert.ok(
    synced.phases[0]!.tasks.every((task) => task.status === 'completed'),
    'legacy reading cards must still sync from the learned list',
  );
});

void test('substeps are terminal only when every substep is completed or skipped', () => {
  const steps = (
    statuses: Array<'not-started' | 'completed' | 'skipped' | 'paused'>,
  ) =>
    statuses.map((status, index) => ({
      id: `s${index}`,
      type: 'definition-reading' as const,
      title: '步骤',
      description: '',
      estimatedMinutes: 5,
      status,
      completedAt: null,
      targetSection: null,
      dueDate: null,
    }));
  assert.equal(substepsComplete(steps(['completed'])), true);
  assert.equal(substepsComplete(steps(['completed', 'skipped'])), true);
  assert.equal(substepsComplete(steps(['completed', 'not-started'])), false);
  assert.equal(substepsComplete(steps(['skipped', 'paused'])), false);
  assert.equal(
    substepsComplete([]),
    false,
    'a task with no substeps must not look complete',
  );
});

void test('completing a comprehension card directly and by substeps share one rule', () => {
  // Regression guard for the direct-completion vs step-by-step divergence:
  // both paths must be judged by the same learned-task rule.
  const plan = generatePlan(
    {
      ...baseInput,
      method: 'deep-understanding',
      includeCode: false,
      includeReview: false,
    },
    concepts.slice(0, 1),
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const card = phase.tasks.find(
    (task) => task.type === 'concept-understanding',
  )!;
  assert.ok(card.conceptSlug, 'the comprehension card must carry a concept');
  assert.equal(taskMarksConceptLearned(card), true);

  const bySubsteps = card.substeps.reduce(
    (current, step) =>
      updateSubstep(
        current,
        card.id,
        step.id,
        'completed',
        new Date('2026-08-31T09:00:00'),
      ),
    plan,
  );
  assert.equal(
    substepsComplete(bySubsteps.phases[0]!.tasks[0]!.substeps),
    true,
    'step-by-step completion must satisfy the same rule as completing the card',
  );

  const directly = updateTask(plan, card.id, { status: 'completed' });
  assert.equal(directly.phases[0]!.tasks[0]!.status, 'completed');
  assert.equal(substepsComplete(directly.phases[0]!.tasks[0]!.substeps), true);
});

void test('moving a task changes only the current plan and updates phase ownership', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    concepts,
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const source = plan.phases[0]!;
  const target = { ...source, id: 'move-target', tasks: [] };
  plan.phases.push(target);
  const task = source.tasks[0]!;
  const moved = moveTask(
    plan,
    task.id,
    target.id,
    0,
    new Date('2026-08-31T09:00:00'),
  );
  assert.equal(
    moved.phases[0]!.tasks.some((item) => item.id === task.id),
    false,
  );
  assert.equal(moved.phases[1]!.tasks[0]?.id, task.id);
  assert.equal(moved.phases[1]!.tasks[0]?.phaseId, target.id);
});

void test('stage-test score records weak concepts without completing learning or mastery', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const phase = plan.phases[0]!;
  assert.ok(phase.test.questions.length > 0, 'the phase needs real questions');
  const first = phase.test.questions[0]!;
  // Multiple-choice questions need every correct option; single-answer
  // questions need exactly one.
  const correctPayload = (question: (typeof phase.test.questions)[number]) =>
    question.type === 'multiple-choice'
      ? question.correctAnswers
      : question.correctAnswers.slice(0, 1);
  const answers = Object.fromEntries(
    phase.test.questions.map((question) => [
      question.id,
      question.grading === 'self-assessed'
        ? ['我的解释']
        : question.id === first.id
          ? ['这个答案肯定不对']
          : correctPayload(question),
    ]),
  );
  const scored = scoreStageTest(
    plan,
    phase.id,
    answers,
    true,
    new Date('2026-08-31T10:00:00'),
  );
  const result = scored.phases[0]!.test;
  assert.equal(result.status, 'completed');
  assert.equal(result.incorrectQuestionIds.length, 1);
  assert.ok(result.score !== null && result.score < 100);
  assert.equal(scored.phases[0]!.mastered, false);
  assert.ok(
    scored.phases[0]!.tasks.some((task) => task.status !== 'completed'),
    'a test must not complete the phase tasks',
  );
});

void test('stage-test can append a dedicated weak-concept review even when scheduled reviews exist', () => {
  const plan = generatePlan(
    baseInput,
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const before = phase.tasks.filter((task) => task.type === 'review').length;
  const answers = Object.fromEntries(
    phase.test.questions.map((question) => [question.id, ['这个答案肯定不对']]),
  );
  const scored = scoreStageTest(
    plan,
    phase.id,
    answers,
    true,
    new Date('2026-08-31T10:00:00'),
  );
  assert.equal(
    scored.phases[0]!.tasks.filter((task) => task.type === 'review').length,
    before + 1,
  );
});

void test('route keeps selected category scope without inserting cross-category prerequisites', () => {
  const routeConcepts: PlanConcept[] = [
    {
      slug: 'calculus',
      title: '微积分基础',
      category: 'artificial-intelligence',
      difficulty: '入门',
      prerequisites: [],
      hasCode: false,
      hasInteractive: false,
    },
    {
      slug: 'optimization',
      title: '优化方法',
      category: 'machine-learning',
      difficulty: '进阶',
      prerequisites: ['微积分基础'],
      hasCode: true,
      hasInteractive: false,
    },
  ];
  const plan = generatePlan(
    { ...baseInput, includeCode: false, includeReview: false },
    routeConcepts,
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const slugs = plan.phases
    .flatMap((phase) => phase.tasks)
    .filter((task) => task.type === 'concept-understanding')
    .map((task) => task.conceptSlug);
  assert.deepEqual(slugs, ['optimization']);
});

void test('definition paragraph is natural prose without labeled colon sections or memory slogans', () => {
  const paragraph = buildDefinitionParagraph(richConcept);
  assert.ok(paragraph.length >= 120 && paragraph.length <= 180);
  assert.doesNotMatch(paragraph, /(定义|用途|边界|记忆点)：/);
  assert.doesNotMatch(paragraph, /一句话记忆点/);
  assert.match(paragraph, /梯度下降/);
  assert.match(paragraph, /神经网络/);
});

void test('knowledge route uses one card per concept and derives minutes from substeps', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const tasks = plan.phases.flatMap((phase) => phase.tasks);
  assert.equal(tasks.length, 1);
  assert.deepEqual(
    tasks.map((task) => task.type),
    ['concept-understanding'],
  );
  const definition = tasks
    .flatMap((task) => task.substeps)
    .find((step) => step.type === 'definition-reading');
  assert.ok(definition && definition.estimatedMinutes > 0);
  for (const task of tasks) {
    assert.equal(
      task.estimatedMinutes,
      task.substeps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
    );
  }
});

void test('knowledge and deep routes keep review work inside concept cards', () => {
  for (const method of ['knowledge-route', 'deep-understanding'] as const) {
    const plan = generatePlan(
      { ...baseInput, method, includeReview: true },
      concepts,
      { learned: [], bookmarks: [] },
      new Date('2026-08-31T08:00:00'),
    );
    const tasks = plan.phases.flatMap((phase) => phase.tasks);
    assert.equal(tasks.length, concepts.length);
    assert.ok(
      tasks.every((task) =>
        task.substeps.some((step) => step.type === 'review' && step.dueDate),
      ),
    );
  }
});

void test('weekly minutes parser allows an empty editing state and validates on commit', () => {
  assert.deepEqual(parseWeeklyMinutes(''), {
    value: null,
    error: '请输入每周学习时间',
  });
  assert.deepEqual(parseWeeklyMinutes('300'), { value: 300, error: null });
  assert.equal(parseWeeklyMinutes('0').value, null);
  assert.equal(parseWeeklyMinutes('10081').value, null);
});

void test('segmented local date rejects impossible days and supports leap years', () => {
  assert.equal(buildLocalDate(2026, 4, 42), null);
  assert.equal(buildLocalDate(2026, 2, 29), null);
  assert.equal(buildLocalDate(2028, 2, 29), '2028-02-29');
  assert.equal(buildLocalDate(2026, 9, 1), '2026-09-01');
});

void test('substep completion updates its parent card without completing sibling cards', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    [richConcept, { ...richConcept, slug: 'second', title: '第二概念' }],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const card = plan.phases[0]!.tasks[0]!;
  const first = updateSubstep(
    plan,
    card.id,
    card.substeps[0]!.id,
    'completed',
    new Date('2026-08-31T09:00:00'),
  );
  assert.equal(first.phases[0]!.tasks[0]!.status, 'in-progress');
  const completed = card.substeps.reduce(
    (current, step) =>
      updateSubstep(
        current,
        card.id,
        step.id,
        'completed',
        new Date('2026-08-31T09:00:00'),
      ),
    plan,
  );
  assert.equal(completed.phases[0]!.tasks[0]!.status, 'completed');
  assert.notEqual(
    completed.phases
      .flatMap((phase) => phase.tasks)
      .find((task) => task.conceptSlug === 'second')!.status,
    'completed',
  );
});

void test('manual task duration is capped at ten minutes and redistributed across substeps', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const task = plan.phases[0]!.tasks[0]!;
  const updated = updateTask(plan, task.id, { estimatedMinutes: 30 });
  const result = updated.phases[0]!.tasks[0]!;
  assert.equal(result.estimatedMinutes, 10);
  assert.equal(
    result.substeps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
    10,
  );
});

void test('migration wraps legacy tasks in a compatible fallback substep', () => {
  const migrated = migratePlanState(
    JSON.stringify({
      plans: [
        {
          id: 'legacy',
          title: '旧计划',
          phases: [
            {
              id: 'phase-1',
              tasks: [
                {
                  id: 'task-1',
                  title: '旧阅读任务',
                  type: 'concept-reading',
                  estimatedMinutes: 15,
                  status: 'completed',
                },
              ],
            },
          ],
        },
      ],
    }),
  );
  const task = migrated.plans[0]!.phases[0]!.tasks[0]!;
  assert.equal(task.substeps.length, 1);
  assert.equal(task.substeps[0]!.estimatedMinutes, 10);
  assert.equal(task.substeps[0]!.status, 'completed');
});

void test('pausing and resuming a card preserves completed substeps', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const task = plan.phases[0]!.tasks[0]!;
  const partial = updateSubstep(
    plan,
    task.id,
    task.substeps[0]!.id,
    'completed',
    new Date('2026-08-31T09:00:00'),
  );
  const paused = updateTask(partial, task.id, { status: 'paused' });
  const resumed = updateTask(paused, task.id, { status: 'in-progress' });
  assert.equal(resumed.phases[0]!.tasks[0]!.substeps[0]!.status, 'completed');
});

void test('estimated completion uses only unfinished substep minutes', () => {
  const plan = generatePlan(
    { ...baseInput, weeklyMinutes: 7, includeReview: false },
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const task = plan.phases[0]!.tasks[0]!;
  const partial = task.substeps
    .slice(0, -1)
    .reduce(
      (current, step) =>
        updateSubstep(
          current,
          task.id,
          step.id,
          'completed',
          new Date('2026-08-31T09:00:00'),
        ),
      plan,
    );
  assert.ok(partial.estimatedCompletionDate < plan.estimatedCompletionDate);
});

void test('deleting a plan removes its local records without affecting other plans', () => {
  const first = generatePlan(
    { ...baseInput, title: '计划一', includeReview: false },
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const second = generatePlan(
    { ...baseInput, title: '计划二', includeReview: false },
    [richConcept],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const firstTask = first.phases[0]!.tasks[0]!;
  const state = {
    version: 1 as const,
    plans: [first, second],
    activities: [
      {
        id: 'a1',
        planId: first.id,
        taskId: firstTask.id,
        actionType: 'task' as const,
        startedAt: '2026-08-31T08:00:00.000Z',
        completedAt: null,
        durationMinutes: 5,
      },
    ],
    reminder: {
      activePlanId: first.id,
      lastStudyAt: null,
      lastStudyDate: null,
      lastOpenedAt: null,
      lastReminderDate: null,
      reminderDismissedDate: null,
    },
    completedTaskIds: [firstTask.id],
  };
  const result = deletePlanFromState(state, first.id);
  assert.deepEqual(
    result.plans.map((plan) => plan.id),
    [second.id],
  );
  assert.deepEqual(result.activities, []);
  assert.deepEqual(result.completedTaskIds, []);
  assert.equal(result.reminder.activePlanId, second.id);
});

void test('optional reference resources create independent plan tasks in method order', () => {
  const plan = generatePlan(
    {
      ...baseInput,
      method: 'knowledge-route',
      includeReview: false,
      includeResources: true,
    },
    [
      {
        ...richConcept,
        resources: [
          {
            id: 'article',
            title: '基础文章',
            type: '技术文章',
            url: 'https://example.com/article',
            summary: '文章摘要',
            estimatedMinutes: 10,
            recommendationLevel: 'A',
          },
          {
            id: 'video',
            title: '视频讲解',
            type: '视频',
            url: 'https://example.com/video',
            summary: '视频摘要',
            estimatedMinutes: 20,
            recommendationLevel: 'B',
          },
          {
            id: 'repo',
            title: '实验仓库',
            type: 'GitHub 仓库',
            url: 'https://example.com/repo',
            summary: '仓库摘要',
            estimatedMinutes: 30,
            recommendationLevel: 'A',
          },
        ],
      },
    ],
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const resourceTasks = plan.phases
    .flatMap((phase) => phase.tasks)
    .filter((task) => task.resourceId);
  assert.deepEqual(
    resourceTasks.map((task) => task.type),
    ['resource-article', 'resource-video', 'resource-github'],
  );
  assert.ok(resourceTasks.every((task) => task.status === 'not-started'));
  const learned = syncLearnedTasks(
    plan,
    ['gradient-descent'],
    new Date('2026-08-31T09:00:00'),
  );
  assert.ok(
    learned.phases
      .flatMap((phase) => phase.tasks)
      .filter((task) => task.resourceId)
      .every((task) => task.status !== 'completed'),
  );
});

void test('all methods preserve the entire selected block order despite a tiny budget', () => {
  const block: PlanConcept[] = Array.from({ length: 31 }, (_, index) => ({
    ...richConcept,
    slug: `lesson-${index}`,
    title: `课程 ${index}`,
    difficulty: index % 2 ? '入门' : '挑战',
    prerequisites: index < 30 ? [`lesson-${index + 1}`] : [],
  }));
  for (const method of [
    'knowledge-route',
    'deep-understanding',
    'code-practice',
    'spaced-review',
  ] as const) {
    const plan = generatePlan(
      {
        ...baseInput,
        method,
        weeklyMinutes: 1,
        targetDate: '2026-08-31',
        includeReview: true,
      },
      block,
      { learned: ['lesson-5'], bookmarks: ['lesson-28'] },
      new Date('2026-08-31T08:00:00'),
    );
    const tasks = plan.phases.flatMap((phase) => phase.tasks);
    assert.deepEqual(
      tasks.map((task) => task.conceptSlug),
      block.map((concept) => concept.slug),
      method,
    );
    for (const task of tasks) {
      assert.ok(
        task.estimatedMinutes > 0 && task.estimatedMinutes <= 10,
        `${method}: card duration`,
      );
      const minutes = task.substeps.reduce(
        (sum, step) => sum + step.estimatedMinutes,
        0,
      );
      assert.ok(minutes <= 10 + 1e-9, `${method}: substep total`);
      assert.ok(
        Math.abs(task.estimatedMinutes - minutes) < 1e-9,
        `${method}: matching duration`,
      );
      assert.ok(
        task.substeps.every(
          (step) => step.type !== 'exercise' && step.type !== 'project',
        ),
        `${method}: no placeholder exercises`,
      );
    }
  }
});

void test('optional resources deduplicate the same URL across the whole plan', () => {
  const resource = {
    id: 'shared',
    title: '共享文章',
    type: '技术文章',
    url: 'https://example.com/shared',
    summary: '相同学习资料',
    estimatedMinutes: 40,
    recommendationLevel: 'A' as const,
  };
  const source = concepts.map((concept, index) => ({
    ...concept,
    resources: [{ ...resource, id: `reference-${index}` }],
  }));
  const enabled = generatePlan(
    { ...baseInput, includeResources: true },
    source,
    { learned: [], bookmarks: [] },
  );
  const resources = enabled.phases
    .flatMap((phase) => phase.tasks)
    .filter((task) => task.resourceUrl);
  assert.equal(resources.length, 1);
  assert.equal(resources[0]!.resourceUrl, resource.url);
  assert.ok(resources[0]!.estimatedMinutes <= 10);
  const disabled = generatePlan(
    { ...baseInput, includeResources: false },
    source,
    { learned: [], bookmarks: [] },
  );
  assert.ok(
    disabled.phases
      .flatMap((phase) => phase.tasks)
      .every((task) => !task.resourceUrl),
  );
});

void test('migration removes empty exercise jumps and merges old concept cards without losing progress', () => {
  const state = migratePlanState(
    JSON.stringify({
      plans: [
        {
          id: 'legacy',
          phases: [
            {
              id: 'phase',
              tasks: [
                {
                  id: 'reading',
                  type: 'concept-understanding',
                  conceptSlug: 'intro',
                  title: '阅读',
                  estimatedMinutes: 20,
                  substeps: [
                    {
                      id: 'read-step',
                      type: 'definition-reading',
                      title: '定义',
                      status: 'completed',
                      estimatedMinutes: 20,
                      targetSection: 'definition',
                    },
                  ],
                },
                {
                  id: 'practice',
                  type: 'principle-practice',
                  conceptSlug: 'intro',
                  title: '原理',
                  estimatedMinutes: 25,
                  substeps: [
                    {
                      id: 'principle-step',
                      type: 'principle',
                      title: '原理',
                      status: 'not-started',
                      estimatedMinutes: 15,
                      targetSection: 'core-principle',
                    },
                    {
                      id: 'empty-step',
                      type: 'exercise',
                      title: '练习',
                      status: 'not-started',
                      estimatedMinutes: 10,
                      targetSection: 'core-principle',
                    },
                  ],
                },
                {
                  id: 'empty-exercise',
                  type: 'exercise',
                  conceptSlug: 'intro',
                  title: '练习',
                  targetSection: 'core-principle',
                  estimatedMinutes: 30,
                },
                {
                  id: 'empty-project',
                  type: 'project',
                  conceptSlug: 'intro',
                  title: '项目',
                  targetSection: 'code',
                  estimatedMinutes: 30,
                },
              ],
            },
          ],
        },
      ],
    }),
  );
  const tasks = state.plans[0]!.phases.flatMap((phase) => phase.tasks);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0]!.id, 'reading');
  assert.deepEqual(
    tasks[0]!.substeps.map((step) => step.id),
    ['read-step', 'principle-step'],
  );
  assert.equal(tasks[0]!.substeps[0]!.status, 'completed');
  assert.equal(tasks[0]!.substeps[1]!.status, 'not-started');
  assert.ok(tasks[0]!.estimatedMinutes <= 10);
  assert.ok(
    tasks[0]!.substeps.reduce((sum, step) => sum + step.estimatedMinutes, 0) <=
      10,
  );
});

void test('reloading migrated plans is stable and keeps later weak-concept reviews independent', () => {
  const plan = generatePlan(baseInput, concepts, {
    learned: [],
    bookmarks: [],
  });
  const task = plan.phases[0]!.tasks[0]!;
  plan.phases[0]!.tasks.push({
    ...task,
    id: 'weak-review',
    type: 'review',
    title: '薄弱概念复习',
  });
  const first = migratePlanState(JSON.stringify({ plans: [plan] }));
  const second = migratePlanState(JSON.stringify(first));
  assert.deepEqual(second.plans[0]!.phases, first.plans[0]!.phases);
  assert.ok(
    second.plans[0]!.phases.flatMap((phase) => phase.tasks).some(
      (task) => task.id === 'weak-review',
    ),
  );
});

void test('preview counts cards containing scheduled reviews', () => {
  const plan = generatePlan(baseInput, concepts, {
    learned: [],
    bookmarks: [],
  });
  assert.equal(planPreview(plan).reviewCount, concepts.length);
  const task = plan.phases[0]!.tasks[0]!;
  const edited = updateTask(plan, task.id, { estimatedMinutes: 2.4 });
  const changed = edited.phases[0]!.tasks[0]!;
  assert.equal(
    changed.estimatedMinutes,
    changed.substeps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
  );
});
