import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildReminder,
  moveTask,
  scoreStageTest,
  syncLearnedTasks,
  updateTask,
  generatePlan,
  migratePlanState,
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
      (task) => task.conceptSlug === 'intro' && task.type === 'concept-reading',
    )?.status,
    'completed',
  );
});

void test('deep understanding creates every required comprehension task type', () => {
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
  const types = new Set(
    plan.phases.flatMap((phase) => phase.tasks).map((task) => task.type),
  );
  const requiredTypes: TaskType[] = [
    'definition-reading',
    'intuition',
    'principle',
    'formula',
    'code-reading',
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
    .filter((task) => task.type === 'interactive-experiment');
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
    .filter((task) => task.type === 'review');
  assert.deepEqual(
    reviews.map((task) => task.dueDate),
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
  assert.ok(updated.completionRate > 0 && updated.completionRate < 100);
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
  assert.equal(reminder?.suggestedTasks.length, 2);
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

void test('task updates and learned synchronization only complete concept-reading work', () => {
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
  const reading = plan.phases[0]!.tasks.find(
    (task) => task.type === 'definition-reading',
  )!;
  const code = plan.phases[0]!.tasks.find(
    (task) => task.type === 'code-reading',
  )!;
  const synced = syncLearnedTasks(
    plan,
    ['intro'],
    new Date('2026-08-31T09:00:00'),
  );
  assert.equal(
    synced.phases[0]!.tasks.find((task) => task.id === reading.id)?.status,
    'completed',
  );
  assert.notEqual(
    synced.phases[0]!.tasks.find((task) => task.id === code.id)?.status,
    'completed',
  );
  const paused = updateTask(
    synced,
    code.id,
    { status: 'paused' },
    new Date('2026-08-31T10:00:00'),
  );
  assert.equal(
    paused.phases[0]!.tasks.find((task) => task.id === code.id)?.status,
    'paused',
  );
});

void test('moving a task changes only the current plan and updates phase ownership', () => {
  const plan = generatePlan(
    { ...baseInput, includeReview: false },
    concepts,
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const source = plan.phases[0]!;
  const target = plan.phases[1]!;
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
    concepts.slice(0, 1),
    { learned: [], bookmarks: [] },
    new Date('2026-08-31T08:00:00'),
  );
  const phase = plan.phases[0]!;
  const answers = Object.fromEntries(
    phase.test.questions.map((question, index) => [
      question.id,
      index === 0 ? ['错误'] : ['正确'],
    ]),
  );
  const scored = scoreStageTest(
    plan,
    phase.id,
    answers,
    true,
    new Date('2026-08-31T10:00:00'),
  );
  assert.equal(scored.phases[0]!.test.status, 'completed');
  assert.ok((scored.phases[0]!.test.score ?? 100) < 100);
  assert.equal(scored.phases[0]!.test.incorrectQuestionIds.length, 1);
  assert.deepEqual(scored.phases[0]!.test.weakConcepts, ['intro']);
  assert.equal(scored.phases[0]!.mastered, false);
  assert.ok(
    scored.phases[0]!.tasks.some((task) => task.status !== 'completed'),
  );
});

void test('stage-test can append a dedicated weak-concept review even when scheduled reviews exist', () => {
  const plan = generatePlan(baseInput, concepts.slice(0, 1), { learned: [], bookmarks: [] }, new Date('2026-08-31T08:00:00'));
  const phase = plan.phases[0]!;
  const before = phase.tasks.filter((task) => task.type === 'review').length;
  const answers = Object.fromEntries(phase.test.questions.map((question) => [question.id, ['错误']]));
  const scored = scoreStageTest(plan, phase.id, answers, true, new Date('2026-08-31T10:00:00'));
  assert.equal(scored.phases[0]!.tasks.filter((task) => task.type === 'review').length, before + 1);
});
