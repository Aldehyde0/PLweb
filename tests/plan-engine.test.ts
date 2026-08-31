import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildReminder,
  generatePlan,
  migratePlanState,
  recomputePlan,
  type PlanConcept,
  type PlanFormInput,
  type TaskType,
} from '../lib/plan-engine.ts';

const concepts: PlanConcept[] = [
  { slug: 'intro', title: '入门', category: 'machine-learning', difficulty: '入门', prerequisites: [], hasCode: true, hasInteractive: false },
  { slug: 'core', title: '核心', category: 'machine-learning', difficulty: '进阶', prerequisites: ['intro'], hasCode: true, hasInteractive: true },
  { slug: 'advanced', title: '挑战', category: 'machine-learning', difficulty: '挑战', prerequisites: ['core', 'missing'], hasCode: true, hasInteractive: false },
];

const baseInput: PlanFormInput = {
  title: '机器学习计划', goal: '理解并实践核心模型', categories: ['machine-learning'],
  method: 'knowledge-route', level: '入门', weeklyMinutes: 300,
  targetDate: '2026-09-30', includeCode: true, includeTests: true, includeReview: true,
};

test('migrates missing fields without losing legacy plans', () => {
  const migrated = migratePlanState(JSON.stringify({ plans: [{ id: 'p1', title: '旧计划', phases: [] }] }));
  assert.equal(migrated.version, 1);
  assert.equal(migrated.plans[0]?.title, '旧计划');
  assert.equal(migrated.plans[0]?.status, 'active');
  assert.deepEqual(migrated.completedTaskIds, []);
  assert.equal(migrated.reminder.activePlanId, 'p1');
});

test('knowledge route only links existing concepts and reports broken prerequisites', () => {
  const plan = generatePlan(baseInput, concepts, { learned: ['intro'], bookmarks: ['core'] }, new Date('2026-08-31T08:00:00'));
  const linked = plan.phases.flatMap((phase) => phase.tasks).filter((task) => task.conceptSlug);
  assert.ok(linked.every((task) => concepts.some((concept) => concept.slug === task.conceptSlug)));
  assert.ok(plan.generationWarnings.some((warning) => warning.includes('missing')));
  assert.equal(linked.find((task) => task.conceptSlug === 'intro' && task.type === 'concept-reading')?.status, 'completed');
});

test('deep understanding creates every required comprehension task type', () => {
  const plan = generatePlan({ ...baseInput, method: 'deep-understanding', includeCode: false, includeReview: false }, concepts.slice(0, 1), { learned: [], bookmarks: [] }, new Date('2026-08-31T08:00:00'));
  const types = new Set(plan.phases.flatMap((phase) => phase.tasks).map((task) => task.type));
  const requiredTypes: TaskType[] = ['definition-reading','intuition','principle','formula','code-reading','self-explanation','understanding-question'];
  for (const type of requiredTypes) assert.ok(types.has(type));
});

test('code practice adds an interactive experiment only for concepts that have one', () => {
  const plan = generatePlan({ ...baseInput, method: 'code-practice', includeReview: false }, concepts, { learned: [], bookmarks: [] }, new Date('2026-08-31T08:00:00'));
  const experiments = plan.phases.flatMap((phase) => phase.tasks).filter((task) => task.type === 'interactive-experiment');
  assert.deepEqual(experiments.map((task) => task.conceptSlug), ['core']);
});

test('spaced review uses day 0, 1, 3, 7 and 14 offsets', () => {
  const plan = generatePlan({ ...baseInput, method: 'spaced-review', includeCode: false, includeTests: false }, concepts.slice(0, 1), { learned: [], bookmarks: [] }, new Date('2026-08-31T08:00:00'));
  const reviews = plan.phases.flatMap((phase) => phase.tasks).filter((task) => task.type === 'review');
  assert.deepEqual(reviews.map((task) => task.dueDate), ['2026-08-31','2026-09-01','2026-09-03','2026-09-07','2026-09-14']);
});

test('recompute keeps reading, code, test and mastery states independent', () => {
  const plan = generatePlan({ ...baseInput, includeReview: false }, concepts.slice(0, 1), { learned: [], bookmarks: [] }, new Date('2026-08-31T08:00:00'));
  const tasks = plan.phases[0]!.tasks.map((task, index) => ({ ...task, status: index === 0 ? 'completed' as const : task.status }));
  const updated = recomputePlan({ ...plan, phases: [{ ...plan.phases[0]!, tasks }] }, new Date('2026-08-31T10:00:00'));
  assert.ok(updated.completionRate > 0 && updated.completionRate < 100);
  assert.notEqual(updated.phases[0]!.test.status, 'completed');
  assert.equal(updated.phases[0]!.mastered, false);
});

test('reminder appears once per local day only for an active incomplete plan', () => {
  const plan = generatePlan({ ...baseInput, includeReview: false }, concepts.slice(0, 1), { learned: [], bookmarks: [] }, new Date('2026-08-29T08:00:00'));
  const reminder = buildReminder(plan, { activePlanId: plan.id, lastStudyAt: '2026-08-29T08:00:00.000Z', lastStudyDate: '2026-08-29', lastOpenedAt: null, lastReminderDate: null, reminderDismissedDate: null }, new Date('2026-08-31T09:00:00'));
  assert.equal(reminder?.daysAway, 2);
  assert.equal(reminder?.suggestedTasks.length, 2);
  assert.equal(buildReminder(plan, { activePlanId: plan.id, lastStudyAt: '2026-08-29T08:00:00.000Z', lastStudyDate: '2026-08-29', lastOpenedAt: null, lastReminderDate: '2026-08-31', reminderDismissedDate: null }, new Date('2026-08-31T09:00:00')), null);
});
