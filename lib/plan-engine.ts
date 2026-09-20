import type { CategorySlug, Difficulty } from './content-base';
import { curatedQuestionsFor } from './stage-test-bank.ts';
import {
  gradingOf,
  isAnswerAccepted,
  isPlaceholderStageQuestion,
  questionTypeLabel,
  sameOptionSet,
  type StageQuestionInput,
} from './stage-test.ts';

export { questionTypeLabel };
export type { StageQuestionInput };

export const PLAN_STORAGE_KEY = 'how-to-learn-ai-plans-v1';
export const PLAN_STATE_VERSION = 1;

export type PlanMethod =
  | 'knowledge-route'
  | 'deep-understanding'
  | 'code-practice'
  | 'spaced-review';
export type PlanLevel = '入门' | '进阶' | '挑战';
export type PlanStatus = 'active' | 'paused' | 'completed';
export type PhaseStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'paused';
export type TaskStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'paused'
  | 'skipped'
  | 'blocked';
export type TaskType =
  | 'concept-understanding'
  | 'principle-practice'
  | 'phase-review'
  | 'context'
  | 'related-concepts'
  | 'concept-reading'
  | 'definition-reading'
  | 'intuition'
  | 'principle'
  | 'formula'
  | 'code-reading'
  | 'parameter-change'
  | 'interactive-experiment'
  | 'result-note'
  | 'exercise'
  | 'project'
  | 'self-explanation'
  | 'understanding-question'
  | 'review'
  | 'resource-article'
  | 'resource-video'
  | 'resource-paper'
  | 'resource-docs'
  | 'resource-github'
  | 'resource-code'
  | 'resource-review'
  | 'custom';
export type TestQuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'true-false'
  | 'concept-explanation'
  | 'formula-fill'
  | 'code-reading'
  | 'code-output'
  | 'calculation';
export type StageTestStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'later'
  | 'skipped';

export interface PlanConcept {
  subcategory?: string;
  slug: string;
  title: string;
  category: CategorySlug;
  difficulty: Difficulty;
  prerequisites: string[];
  hasCode: boolean;
  hasInteractive: boolean;
  hasFormula?: boolean;
  definition?: string[];
  summary?: string;
  principles?: string[];
  relatedConcepts?: string[];
  inputs?: string[];
  outputs?: string[];
  resources?: PlanResourceRef[];
}

export interface PlanResourceRef {
  id: string;
  title: string;
  type: string;
  url: string;
  summary: string;
  estimatedMinutes: number;
  recommendationLevel: 'A' | 'B' | 'C';
}

export interface PlanSubstep {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: TaskStatus;
  completedAt: string | null;
  targetSection: string | null;
  dueDate: string | null;
}

export type StageQuestionGrading = 'objective' | 'self-assessed';

export interface StageQuestion {
  id: string;
  type: TestQuestionType;
  prompt: string;
  options?: string[];
  /** Accepted answers for objective questions; empty for self-assessed ones. */
  correctAnswers: string[];
  conceptSlug: string | null;
  explanation: string;
  /** How the question is judged. Absent on legacy data, treated as objective. */
  grading?: StageQuestionGrading;
  /** Reference answer for self-assessed questions; never auto-compared. */
  exampleAnswer?: string;
}

/**
 * Per-question judging result.
 * `correct` is null when the question cannot be auto-graded and the learner has
 * not self-assessed it yet, so it is excluded from the score instead of being
 * counted right or wrong.
 */
export interface StageTestGrade {
  questionId: string;
  correct: boolean | null;
  autoGraded: boolean;
  selfAssessed: boolean;
}

export interface StageTest {
  id: string;
  phaseId: string;
  title: string;
  questions: StageQuestion[];
  status: StageTestStatus;
  score: number | null;
  completedAt: string | null;
  weakConcepts: string[];
  incorrectQuestionIds: string[];
  addWeakToReview: boolean;
  /** Absent on legacy data; recomputed on submit. */
  grades?: StageTestGrade[];
  /** True when some questions still await the learner's own judgement. */
  hasUngradedQuestions?: boolean;
  /** True when the phase has no gradable questions at all. */
  notGradable?: boolean;
}

export interface PlanTask {
  id: string;
  phaseId: string;
  type: TaskType;
  title: string;
  conceptSlug: string | null;
  description: string;
  category: CategorySlug | null;
  difficulty: Difficulty | null;
  estimatedMinutes: number;
  dueDate: string;
  order: number;
  status: TaskStatus;
  isImportant: boolean;
  completedAt: string | null;
  notes: string;
  targetSection: string | null;
  substeps: PlanSubstep[];
  resourceId?: string | null;
  resourceUrl?: string | null;
}

export interface PlanPhase {
  id: string;
  planId: string;
  title: string;
  description: string;
  order: number;
  targetDate: string;
  status: PhaseStatus;
  completionRate: number;
  mastered: boolean;
  tasks: PlanTask[];
  test: StageTest;
}

export interface LearningPlan {
  taskLayoutVersion?: 2;
  id: string;
  title: string;
  goal: string;
  categories: CategorySlug[];
  method: PlanMethod;
  level: PlanLevel;
  startDate: string;
  targetDate: string;
  estimatedCompletionDate: string;
  weeklyMinutes: number;
  status: PlanStatus;
  activePhaseId: string;
  createdAt: string;
  updatedAt: string;
  includeCode: boolean;
  includeTests: boolean;
  includeReview: boolean;
  includeResources: boolean;
  completionRate: number;
  phases: PlanPhase[];
  generationWarnings: string[];
  lastTaskId: string | null;
}

export interface LearningActivity {
  id: string;
  planId: string;
  taskId: string | null;
  actionType: 'reading' | 'code' | 'test' | 'task' | 'plan-adjustment';
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number;
}

export interface ReminderState {
  activePlanId: string | null;
  lastStudyAt: string | null;
  lastStudyDate: string | null;
  lastOpenedAt: string | null;
  lastReminderDate: string | null;
  reminderDismissedDate: string | null;
}

export interface PlanState {
  version: 1;
  plans: LearningPlan[];
  activities: LearningActivity[];
  reminder: ReminderState;
  completedTaskIds: string[];
}

export interface PlanFormInput {
  title: string;
  goal: string;
  categories: CategorySlug[];
  method: PlanMethod;
  level: PlanLevel;
  weeklyMinutes: number;
  targetDate: string;
  includeCode: boolean;
  includeTests: boolean;
  includeReview: boolean;
  includeResources?: boolean;
}

export interface ReminderView {
  daysAway: number;
  lastStudyLabel: string;
  suggestedTasks: PlanTask[];
  estimatedMinutes: number;
  paused: boolean;
}

export const PLAN_METHODS: {
  value: PlanMethod;
  label: string;
  summary: string;
}[] = [
  {
    value: 'knowledge-route',
    label: '知识路线法',
    summary: '按板块目录顺序学习，每个概念一张卡，预计最多 10 分钟。',
  },
  {
    value: 'deep-understanding',
    label: '深度理解法',
    summary: '先建立完整名词理解，再用原理、公式、代码和复述验证。',
  },
  {
    value: 'code-practice',
    label: '代码实践法',
    summary: '在一张概念卡内阅读代码、调整参数并记录结果。',
  },
  {
    value: 'spaced-review',
    label: '间隔复习法',
    summary: '在当天、1、3、7、14 天后安排复习。',
  },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  'not-started': '未开始',
  'in-progress': '进行中',
  completed: '已完成',
  paused: '已暂停',
  skipped: '已跳过',
  blocked: '已阻塞',
};

const emptyReminder: ReminderState = {
  activePlanId: null,
  lastStudyAt: null,
  lastStudyDate: null,
  lastOpenedAt: null,
  lastReminderDate: null,
  reminderDismissedDate: null,
};
let sequence = 0;
function makeId(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}
export function localDate(date: Date) {
  if (Number.isNaN(date.getTime())) return localDate(new Date());
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
export function parseWeeklyMinutes(raw: string) {
  const clean = raw.trim();
  if (!clean) return { value: null, error: '请输入每周学习时间' };
  const value = Number(clean);
  if (!Number.isFinite(value) || !Number.isInteger(value))
    return { value: null, error: '每周时间需要是整数分钟' };
  if (value < 30 || value > 10_080)
    return { value: null, error: '每周时间需要在 30～10080 分钟之间' };
  return { value, error: null };
}
export function daysInMonth(year: number, month: number) {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  )
    return 0;
  return new Date(year, month, 0).getDate();
}
export function buildLocalDate(year: number, month: number, day: number) {
  const maxDay = daysInMonth(year, month);
  if (!maxDay || !Number.isInteger(day) || day < 1 || day > maxDay) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function sentence(value: string) {
  const clean = value.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  return /[。！？.!?]$/.test(clean) ? clean : `${clean}。`;
}
function normalizedSentence(value: string) {
  return value.toLowerCase().replace(/[\s，。；、：,.!?！？;:]/g, '');
}
export function buildDefinitionParagraph(concept: PlanConcept) {
  const parts = [
    ...(concept.definition ?? []),
    concept.summary ?? '',
    ...(concept.principles ?? []).slice(0, 1),
  ];
  if ((concept.prerequisites?.length ?? 0) > 0)
    parts.push(
      `学习这个概念前，通常需要先理解${concept.prerequisites.join('、')}`,
    );
  if ((concept.relatedConcepts?.length ?? 0) > 0)
    parts.push(
      `掌握后可以继续联系${concept.relatedConcepts!.slice(0, 3).join('、')}等相关内容`,
    );
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const complete = sentence(part);
    const key = normalizedSentence(complete);
    if (
      !key ||
      [...seen].some((item) => item.includes(key) || key.includes(item))
    )
      continue;
    unique.push(complete);
    seen.add(key);
    if (unique.join('').length >= 120) break;
  }
  let paragraph = unique.join('');
  if (!paragraph)
    paragraph = sentence(
      concept.summary || `${concept.title}是当前学习路线中的一个概念`,
    );
  if (paragraph.length <= 180) return paragraph;
  const clipped = paragraph.slice(0, 180);
  const boundary = Math.max(
    clipped.lastIndexOf('。'),
    clipped.lastIndexOf('！'),
    clipped.lastIndexOf('？'),
  );
  return boundary >= 100
    ? clipped.slice(0, boundary + 1)
    : `${clipped.slice(0, 179)}。`;
}
function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return localDate(copy);
}
function parseLocal(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}
function terminal(status: TaskStatus) {
  return status === 'completed' || status === 'skipped';
}

export function migratePlanState(raw: string | null): PlanState {
  let value: unknown = null;
  try {
    value = raw ? JSON.parse(raw) : null;
  } catch {
    value = null;
  }
  const source =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const sourcePlans = Array.isArray(source.plans)
    ? source.plans
    : Array.isArray(value)
      ? value
      : [];
  const plans = sourcePlans.map((item) => migratePlan(item));
  const reminderSource =
    source.reminder && typeof source.reminder === 'object'
      ? (source.reminder as Partial<ReminderState>)
      : {};
  const active = plans.find((plan) => plan.status === 'active')?.id ?? null;
  return {
    version: PLAN_STATE_VERSION,
    plans,
    activities: Array.isArray(source.activities)
      ? (source.activities as LearningActivity[])
      : [],
    reminder: {
      ...emptyReminder,
      ...reminderSource,
      activePlanId: reminderSource.activePlanId ?? active,
    },
    completedTaskIds: Array.isArray(source.completedTaskIds)
      ? source.completedTaskIds.filter(
          (id): id is string =>
            typeof id === 'string' &&
            plans.some((plan) =>
              plan.phases.some((phase) =>
                phase.tasks.some((task) => task.id === id),
              ),
            ),
        )
      : [],
  };
}

export function deletePlanFromState(
  state: PlanState,
  planId: string,
): PlanState {
  const deletedTaskIds = new Set(
    state.plans
      .find((plan) => plan.id === planId)
      ?.phases.flatMap((phase) => phase.tasks)
      .map((task) => task.id) ?? [],
  );
  const plans = state.plans.filter((plan) => plan.id !== planId);
  const activePlanId =
    state.reminder.activePlanId === planId
      ? (plans.find((plan) => plan.status === 'active')?.id ??
        plans[0]?.id ??
        null)
      : state.reminder.activePlanId;
  return {
    ...state,
    plans,
    activities: state.activities.filter(
      (activity) => activity.planId !== planId,
    ),
    completedTaskIds: state.completedTaskIds.filter(
      (taskId) => !deletedTaskIds.has(taskId),
    ),
    reminder: { ...state.reminder, activePlanId },
  };
}

function migratePlan(value: unknown): LearningPlan {
  const item =
    value && typeof value === 'object' ? (value as Partial<LearningPlan>) : {};
  const now = new Date();
  const id = typeof item.id === 'string' ? item.id : makeId('plan');
  const restoredPhases = Array.isArray(item.phases)
    ? item.phases.map((phase, index) => migratePhase(phase, id, index))
    : [];
  const phases =
    item.taskLayoutVersion === 2
      ? restoredPhases
      : mergeLegacyConceptTasks(restoredPhases);
  const startDate =
    typeof item.startDate === 'string' ? item.startDate : localDate(now);
  const targetDate =
    typeof item.targetDate === 'string' ? item.targetDate : startDate;
  return recomputePlan(
    {
      id,
      taskLayoutVersion: 2,
      title: typeof item.title === 'string' ? item.title : '未命名计划',
      goal: typeof item.goal === 'string' ? item.goal : '',
      categories: Array.isArray(item.categories)
        ? (item.categories as CategorySlug[])
        : [],
      method: item.method ?? 'knowledge-route',
      level: item.level ?? '入门',
      startDate,
      targetDate,
      estimatedCompletionDate: item.estimatedCompletionDate ?? targetDate,
      weeklyMinutes:
        Number(item.weeklyMinutes) > 0 ? Number(item.weeklyMinutes) : 300,
      status: item.status ?? 'active',
      activePhaseId: item.activePhaseId ?? phases[0]?.id ?? '',
      createdAt: item.createdAt ?? now.toISOString(),
      updatedAt: item.updatedAt ?? now.toISOString(),
      includeCode: item.includeCode ?? true,
      includeTests: item.includeTests ?? false,
      includeReview: item.includeReview ?? false,
      includeResources: item.includeResources ?? false,
      completionRate: item.completionRate ?? 0,
      phases,
      generationWarnings: Array.isArray(item.generationWarnings)
        ? item.generationWarnings
        : [],
      lastTaskId: item.lastTaskId ?? null,
    },
    now,
  );
}

/**
 * Removes the placeholder stage-test questions shipped by earlier builds.
 * They all shared one generic prompt and the fixed answer "正确", so anyone
 * scored 100 by answering "正确" everywhere. Keeping them would keep producing
 * fake scores for existing local plans, so they are dropped, together with any
 * score, weak-concept list or review task that was derived from them.
 */
function migrateStageTest(
  value: Partial<StageTest> | undefined,
  phaseId: string,
): StageTest {
  const rawQuestions = Array.isArray(value?.questions) ? value.questions : [];
  const questions = rawQuestions.filter(
    (question) => !isPlaceholderStageQuestion(question),
  );
  const removedPlaceholders = questions.length !== rawQuestions.length;
  // Only a phase with no questions at all is "暂无测试"; a short but real test
  // is kept as-is so the learner still gets a gradable stage test.
  const notGradable = questions.length === 0;
  const status: StageTestStatus = notGradable
    ? 'skipped'
    : (value?.status ?? 'not-started');
  return {
    id: value?.id ?? makeId('test'),
    phaseId,
    title: value?.title ?? '阶段练习',
    questions,
    status,
    // A score computed from placeholders is not a real measurement.
    score: removedPlaceholders ? null : (value?.score ?? null),
    completedAt: removedPlaceholders ? null : (value?.completedAt ?? null),
    weakConcepts: removedPlaceholders ? [] : (value?.weakConcepts ?? []),
    incorrectQuestionIds: removedPlaceholders
      ? []
      : (value?.incorrectQuestionIds ?? []),
    addWeakToReview: value?.addWeakToReview ?? false,
    grades: Array.isArray(value?.grades)
      ? value.grades.filter((grade) =>
          questions.some((question) => question.id === grade.questionId),
        )
      : [],
    hasUngradedQuestions: value?.hasUngradedQuestions ?? false,
    notGradable,
  };
}

function migratePhase(
  value: unknown,
  planId: string,
  order: number,
): PlanPhase {
  const item =
    value && typeof value === 'object' ? (value as Partial<PlanPhase>) : {};
  const id = item.id ?? makeId('phase');
  const tasks = Array.isArray(item.tasks)
    ? item.tasks.map((task, index) => migrateTask(task, id, index))
    : [];
  return {
    id,
    planId,
    title: item.title ?? `阶段 ${order + 1}`,
    description: item.description ?? '',
    order: item.order ?? order,
    targetDate: item.targetDate ?? localDate(new Date()),
    status: item.status ?? 'not-started',
    completionRate: item.completionRate ?? 0,
    mastered: item.mastered ?? false,
    tasks,
    test: migrateStageTest(item.test, id),
  };
}

function isEmptyPractice(item: {
  type?: TaskType;
  targetSection?: string | null;
  resourceUrl?: string | null;
}) {
  return (
    (item.type === 'exercise' || item.type === 'project') && !item.resourceUrl
  );
}

function mergeLegacyConceptTasks(phases: PlanPhase[]): PlanPhase[] {
  const byConcept = new Map<string, PlanTask>();
  return phases.map((phase) => {
    const tasks: PlanTask[] = [];
    for (const task of phase.tasks) {
      if (isEmptyPractice(task)) continue;
      task.substeps = task.substeps.filter((step) => !isEmptyPractice(step));
      if (
        (!task.conceptSlug && !task.resourceUrl) ||
        task.type === 'phase-review' ||
        task.type === 'custom'
      ) {
        tasks.push(task);
        continue;
      }
      const key = task.resourceUrl
        ? `resource:${task.resourceUrl}`
        : `concept:${task.conceptSlug}`;
      const previous = byConcept.get(key);
      if (!previous) {
        byConcept.set(key, task);
        tasks.push(task);
        continue;
      }
      previous.substeps.push(...task.substeps);
      previous.notes = [previous.notes, task.notes]
        .filter(Boolean)
        .join('\n\n');
      previous.description = [
        ...new Set([previous.description, task.description].filter(Boolean)),
      ].join('\n');
      previous.isImportant ||= task.isImportant;
      if (taskMarksConceptLearned(task))
        previous.type = 'concept-understanding';
      previous.status = previous.substeps.every((step) => terminal(step.status))
        ? 'completed'
        : previous.substeps.some((step) => step.status !== 'not-started')
          ? 'in-progress'
          : 'not-started';
      previous.completedAt =
        previous.status === 'completed'
          ? (previous.completedAt ?? task.completedAt)
          : null;
    }
    tasks.forEach((task, order) => {
      task.order = order;
    });
    return { ...phase, tasks };
  });
}

function migrateTask(value: unknown, phaseId: string, order: number): PlanTask {
  const item =
    value && typeof value === 'object' ? (value as Partial<PlanTask>) : {};
  const id = item.id ?? makeId('task');
  const status = item.status ?? 'not-started';
  const completedAt = item.completedAt ?? null;
  const fallbackMinutes = Math.max(5, Number(item.estimatedMinutes) || 25);
  const substeps =
    Array.isArray(item.substeps) && item.substeps.length
      ? item.substeps.map((step, index) =>
          migrateSubstep(step, id, index, status, completedAt),
        )
      : [
          {
            id: `${id}-step-1`,
            type: item.type ?? 'custom',
            title: item.title ?? '未命名任务',
            description: item.description ?? '',
            estimatedMinutes: fallbackMinutes,
            status,
            completedAt,
            targetSection: item.targetSection ?? null,
            dueDate: item.dueDate ?? null,
          },
        ];
  return {
    id,
    phaseId,
    type: item.type ?? 'custom',
    title: item.title ?? '未命名任务',
    conceptSlug: item.conceptSlug ?? null,
    description: item.description ?? '',
    category: item.category ?? null,
    difficulty: item.difficulty ?? null,
    estimatedMinutes: substeps.reduce(
      (sum, step) => sum + step.estimatedMinutes,
      0,
    ),
    dueDate: item.dueDate ?? localDate(new Date()),
    order: item.order ?? order,
    status,
    isImportant: item.isImportant ?? false,
    completedAt,
    notes: item.notes ?? '',
    targetSection: item.targetSection ?? null,
    substeps,
    resourceId: item.resourceId ?? null,
    resourceUrl: item.resourceUrl ?? null,
  };
}

function migrateSubstep(
  value: unknown,
  taskId: string,
  index: number,
  fallbackStatus: TaskStatus,
  fallbackCompletedAt: string | null,
): PlanSubstep {
  const item =
    value && typeof value === 'object' ? (value as Partial<PlanSubstep>) : {};
  const status = item.status ?? fallbackStatus;
  return {
    id: item.id ?? `${taskId}-step-${index + 1}`,
    type: item.type ?? 'custom',
    title: item.title ?? `步骤 ${index + 1}`,
    description: item.description ?? '',
    estimatedMinutes: Math.max(1, Number(item.estimatedMinutes) || 5),
    status,
    completedAt:
      item.completedAt ?? (status === 'completed' ? fallbackCompletedAt : null),
    targetSection: item.targetSection ?? null,
    dueDate: item.dueDate ?? null,
  };
}

export function generatePlan(
  input: PlanFormInput,
  allConcepts: PlanConcept[],
  learning: { learned: string[]; bookmarks: string[] },
  now = new Date(),
): LearningPlan {
  const planId = makeId('plan');
  const warnings: string[] = [];
  // The category directory is the route: do not reorder, expand or truncate it.
  const selected = allConcepts.filter((concept) =>
    input.categories.includes(concept.category),
  );
  const known = new Set(
    allConcepts.flatMap((concept) => [concept.slug, concept.title]),
  );
  for (const concept of selected) {
    for (const prerequisite of concept.prerequisites) {
      if (!known.has(prerequisite))
        warnings.push(`${concept.title} 缺失前置知识链接：${prerequisite}`);
    }
  }
  const days = Math.max(
    7,
    Math.ceil(
      (parseLocal(input.targetDate).getTime() - now.getTime()) / 86_400_000,
    ),
  );
  const phaseGroups: { title: string; concepts: PlanConcept[] }[] = [];
  for (const concept of selected) {
    const title = `${CATEGORY_LABELS[concept.category]} · ${concept.subcategory ?? '学习目录'}`;
    const last = phaseGroups.at(-1);
    if (last?.title === title) last.concepts.push(concept);
    else phaseGroups.push({ title, concepts: [concept] });
  }
  const seenResources = new Set<string>();
  const phases: PlanPhase[] = [];
  for (const group of phaseGroups) {
    const phaseConcepts = group.concepts;
    const def = {
      title: group.title,
      description: '按目录顺序逐项学习，每个概念对应一张任务卡。',
    };
    const phaseId = makeId('phase');
    const tasks = phaseConcepts
      .flatMap((concept) =>
        tasksForConcept(
          input,
          concept,
          phaseId,
          learning.learned.includes(concept.slug),
          now,
        ),
      )
      .filter((task) => {
        if (!task.resourceUrl) return true;
        if (seenResources.has(task.resourceUrl)) return false;
        seenResources.add(task.resourceUrl);
        return true;
      });
    const test = makeStageTest(
      phaseId,
      def.title,
      phaseConcepts,
      input.includeTests,
    );
    phases.push({
      id: phaseId,
      planId,
      title: def.title,
      description: def.description,
      order: phases.length,
      targetDate: input.targetDate,
      status: 'not-started',
      completionRate: 0,
      mastered: false,
      tasks,
      test,
    });
  }
  const flat = phases.flatMap((phase) => phase.tasks);
  const totalMinutes = flat.reduce(
    (sum, task) => sum + task.estimatedMinutes,
    0,
  );
  if (totalMinutes > (Math.max(30, input.weeklyMinutes) * days) / 7)
    warnings.push(
      '已保留完整目录；当前每周时间可能不足以在目标日期前完成，可延长日期或增加每周时间。',
    );
  if (input.includeTests) {
    const unavailable = phases.filter((phase) => phase.test.notGradable);
    if (unavailable.length)
      warnings.push(
        `题库覆盖不足：${unavailable
          .map((phase) => phase.title)
          .join('、')}暂无测试，不计入分数。`,
      );
  }
  flat.forEach((task, index) => {
    task.order = index;
    if (
      task.type !== 'phase-review' &&
      (input.method !== 'spaced-review' || task.type !== 'review')
    ) {
      const span = Math.max(
        0,
        Math.floor(((index + 1) / Math.max(1, flat.length)) * (days - 1)),
      );
      task.dueDate = addDays(now, span);
    }
  });
  phases.forEach((phase) => {
    phase.tasks = flat
      .filter((task) => task.phaseId === phase.id)
      .map((task, index) => ({ ...task, order: index }));
    phase.targetDate = phase.tasks.at(-1)?.dueDate ?? input.targetDate;
  });
  const iso = now.toISOString();
  return recomputePlan(
    {
      id: planId,
      taskLayoutVersion: 2,
      title: input.title.trim() || '我的学习计划',
      goal: input.goal.trim(),
      categories: [...input.categories],
      method: input.method,
      level: input.level,
      startDate: localDate(now),
      targetDate: input.targetDate,
      estimatedCompletionDate: input.targetDate,
      weeklyMinutes: Math.max(30, input.weeklyMinutes),
      status: 'active',
      activePhaseId: phases[0]?.id ?? '',
      createdAt: iso,
      updatedAt: iso,
      includeCode: input.includeCode,
      includeTests: input.includeTests,
      includeReview: input.includeReview,
      includeResources: input.includeResources ?? false,
      completionRate: 0,
      phases,
      generationWarnings: warnings,
      lastTaskId: null,
    },
    now,
  );
}

function makeSubstep(
  type: TaskType,
  title: string,
  description: string,
  estimatedMinutes: number,
  targetSection: string | null,
  complete = false,
  dueDate: string | null = null,
): PlanSubstep {
  return {
    id: makeId('step'),
    type,
    title,
    description,
    estimatedMinutes,
    status: complete ? 'completed' : 'not-started',
    completedAt: complete ? new Date().toISOString() : null,
    targetSection,
    dueDate,
  };
}

function resourceTaskType(type: string): TaskType {
  if (type === '视频' || type === '视频课程') return 'resource-video';
  if (type === '论文') return 'resource-paper';
  if (type === '官方文档') return 'resource-docs';
  if (type === 'GitHub 仓库') return 'resource-github';
  if (type === '代码教程') return 'resource-code';
  return 'resource-article';
}

function resourceTaskTitle(resource: PlanResourceRef) {
  const verb: Record<string, string> = {
    'resource-video': '观看',
    'resource-paper': '阅读论文',
    'resource-docs': '查看官方文档',
    'resource-github': '实践 GitHub 仓库',
    'resource-code': '完成代码教程',
    'resource-review': '复习参考资料',
  };
  const type = resourceTaskType(resource.type);
  return `${verb[type] ?? '阅读'} · ${resource.title}`;
}

function resourceTasksForConcept(
  input: PlanFormInput,
  concept: PlanConcept,
  phaseId: string,
  now: Date,
) {
  if (!input.includeResources || !concept.resources?.length) return [];
  const priorityByMethod: Record<PlanMethod, string[]> = {
    'knowledge-route': [
      '技术文章',
      '官方文档',
      '视频',
      '视频课程',
      'GitHub 仓库',
      '代码教程',
      '论文',
    ],
    'deep-understanding': [
      '技术文章',
      '官方文档',
      '论文',
      '视频',
      '视频课程',
      'GitHub 仓库',
    ],
    'code-practice': [
      '代码教程',
      'GitHub 仓库',
      '官方文档',
      '技术文章',
      '视频',
    ],
    'spaced-review': ['技术文章', '官方文档', '视频', '论文', 'GitHub 仓库'],
  };
  const typePriority = priorityByMethod[input.method];
  const recommendationRank = { A: 0, B: 1, C: 2 } as const;
  const limit = input.method === 'spaced-review' ? 1 : 3;
  return [...concept.resources]
    .sort(
      (a, b) =>
        (typePriority.indexOf(a.type) < 0 ? 99 : typePriority.indexOf(a.type)) -
          (typePriority.indexOf(b.type) < 0
            ? 99
            : typePriority.indexOf(b.type)) ||
        recommendationRank[a.recommendationLevel] -
          recommendationRank[b.recommendationLevel],
    )
    .slice(0, limit)
    .map((resource) => {
      const type =
        input.method === 'spaced-review'
          ? ('resource-review' as const)
          : resourceTaskType(resource.type);
      const title =
        input.method === 'spaced-review'
          ? `复习参考资料 · ${resource.title}`
          : resourceTaskTitle(resource);
      const minutes = Math.min(10, Math.max(1, resource.estimatedMinutes));
      const substeps = [
        makeSubstep(type, title, resource.summary, minutes, null),
      ];
      return {
        id: makeId('task'),
        phaseId,
        type,
        title,
        conceptSlug: concept.slug,
        description: resource.summary,
        category: concept.category,
        difficulty: concept.difficulty,
        estimatedMinutes: minutes,
        dueDate: localDate(now),
        order: 0,
        status: 'not-started' as const,
        isImportant: resource.recommendationLevel === 'A',
        completedAt: null,
        notes: '',
        targetSection: null,
        substeps,
        resourceId: resource.id,
        resourceUrl: resource.url,
      } satisfies PlanTask;
    });
}

function tasksForConcept(
  input: PlanFormInput,
  concept: PlanConcept,
  phaseId: string,
  learned: boolean,
  now: Date,
): PlanTask[] {
  const definition = buildDefinitionParagraph(concept);
  const substeps = [
    makeSubstep(
      'definition-reading',
      `阅读定义 · ${concept.title}`,
      definition,
      2,
      'definition',
      learned,
    ),
    makeSubstep(
      'intuition',
      '理解直觉与背景',
      concept.summary ?? definition,
      1,
      'intuition',
      learned,
    ),
    makeSubstep(
      'principle',
      '理解核心原理',
      concept.principles?.[0] ?? definition,
      2,
      'core-principle',
      learned,
    ),
    ...(concept.hasFormula
      ? [
          makeSubstep(
            'formula',
            '阅读公式与例子',
            '对照变量含义理解计算过程。',
            1,
            'formulas',
            learned,
          ),
        ]
      : []),
    ...(input.includeCode && concept.hasCode
      ? [
          makeSubstep(
            'code-reading',
            '阅读代码与观察结果',
            '将代码的输入、计算和输出与原理对应。',
            2,
            'code',
            learned,
          ),
        ]
      : []),
    ...(concept.hasInteractive
      ? [
          makeSubstep(
            'interactive-experiment',
            '交互实验',
            '调整参数并观察变化。',
            1,
            'algorithm-steps',
            learned,
          ),
        ]
      : []),
    makeSubstep(
      'self-explanation',
      '用自己的话解释',
      '说明核心原理及其适用边界。',
      1,
      null,
      learned,
    ),
    makeSubstep(
      'understanding-question',
      '检查理解',
      '回想它是什么、解决什么问题。',
      1,
      null,
      learned,
    ),
  ];
  if (input.includeReview || input.method === 'spaced-review') {
    const offsets =
      input.method === 'spaced-review' ? [0, 1, 3, 7, 14] : [1, 3, 7, 14];
    for (const offset of offsets)
      substeps.push(
        makeSubstep(
          'review',
          `${offset === 0 ? '当天' : `${offset} 天后`}复习`,
          '回顾定义与原理，记录仍不清楚的地方。',
          1,
          'definition',
          learned,
          addDays(now, offset),
        ),
      );
  }
  if (input.method === 'deep-understanding')
    substeps.splice(
      1,
      0,
      makeSubstep(
        'context',
        '梳理背景与知识关系',
        concept.summary ?? definition,
        1,
        'background',
        learned,
      ),
    );
  if (
    input.method === 'code-practice' &&
    input.includeCode &&
    concept.hasCode
  ) {
    substeps.push(
      makeSubstep(
        'parameter-change',
        '调整代码参数',
        '修改示例中的一个参数，对比输出。',
        1,
        'code',
        learned,
      ),
      makeSubstep(
        'result-note',
        '记录代码观察',
        '记录参数变化和结果之间的关系。',
        1,
        null,
        learned,
      ),
    );
  }
  const steps = resizeSubsteps(substeps, 10);
  const task: PlanTask = {
    id: makeId('task'),
    phaseId,
    type: 'concept-understanding',
    title: `学习 · ${concept.title}`,
    conceptSlug: concept.slug,
    description: definition,
    category: concept.category,
    difficulty: concept.difficulty,
    estimatedMinutes: 10,
    dueDate: localDate(now),
    order: 0,
    status: learned ? 'completed' : 'not-started',
    isImportant: false,
    completedAt: learned ? now.toISOString() : null,
    notes: '',
    targetSection: 'definition',
    substeps: steps,
  };
  return [task, ...resourceTasksForConcept(input, concept, phaseId, now)];
}

/** Target number of questions per stage test; coverage is capped, never faked. */
const STAGE_TEST_QUESTION_TARGET = 8;

/** Minimum questions needed before a phase test is worth offering. */
export const STAGE_TEST_MIN_QUESTIONS = 3;

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  'artificial-intelligence': '人工智能',
  'machine-learning': '机器学习',
  'deep-learning': '深度学习',
  'reinforcement-learning': '强化学习',
};
const CATEGORY_ORDER: CategorySlug[] = [
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'reinforcement-learning',
];
const DIFFICULTY_ORDER: Difficulty[] = ['入门', '进阶', '挑战'];

function rotate<T>(items: T[], offset: number): T[] {
  const size = items.length;
  if (!size) return items;
  const start = ((offset % size) + size) % size;
  return [...items.slice(start), ...items.slice(0, start)];
}

function stableOffset(seed: string, modulo: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1)
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000_003;
  return modulo > 0 ? hash % modulo : 0;
}

/**
 * Builds questions for concepts without a curated entry, using only text the
 * concept itself stores: its real definition, its declared prerequisites, its
 * category and its difficulty. Every answer is checkable, and nothing is
 * invented, so an unbanked phase still gets a meaningful, gradable test.
 */
function conceptDerivedQuestions(concept: PlanConcept): StageQuestionInput[] {
  const questions: StageQuestionInput[] = [];
  const definition = (concept.definition ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .join('')
    .trim();
  if (definition) {
    questions.push({
      id: `${concept.slug}-definition`,
      type: 'single-choice',
      prompt: `下列哪一项是“${concept.title}”的定义？`,
      options: [definition, ...(concept.summary ? [concept.summary] : [])],
      correctOptions: [definition],
      conceptSlug: concept.slug,
      explanation: `本项取自“${concept.title}”的定义原文。`,
    });
  }
  const prerequisites = concept.prerequisites
    .map((item) => item.trim())
    .filter((item) => item && item !== concept.title)
    .slice(0, 2);
  if (prerequisites.length) {
    questions.push({
      id: `${concept.slug}-prerequisite`,
      type: prerequisites.length > 1 ? 'multiple-choice' : 'single-choice',
      prompt: `学“${concept.title}”之前，本知识库为它声明了哪些直接前置知识？`,
      options: rotate(
        [
          ...prerequisites,
          ...CATEGORY_ORDER.map((slug) => CATEGORY_LABELS[slug]),
        ],
        stableOffset(concept.slug, CATEGORY_ORDER.length),
      ),
      correctOptions: prerequisites,
      conceptSlug: concept.slug,
      explanation: `该概念直接依赖：${prerequisites.join('、')}。`,
    });
  }
  questions.push({
    id: `${concept.slug}-category`,
    type: 'single-choice',
    prompt: `“${concept.title}”属于本知识库的哪个学习方向？`,
    options: rotate(
      CATEGORY_ORDER.map((slug) => CATEGORY_LABELS[slug]),
      stableOffset(`${concept.slug}-category`, CATEGORY_ORDER.length),
    ),
    correctOptions: [CATEGORY_LABELS[concept.category]],
    conceptSlug: concept.slug,
    explanation: `本知识库把“${concept.title}”归入${CATEGORY_LABELS[concept.category]}。`,
  });
  questions.push({
    id: `${concept.slug}-difficulty`,
    type: 'single-choice',
    prompt: `本知识库把“${concept.title}”标注为哪个难度？`,
    options: rotate(
      DIFFICULTY_ORDER,
      stableOffset(`${concept.slug}-difficulty`, DIFFICULTY_ORDER.length),
    ),
    correctOptions: [concept.difficulty],
    conceptSlug: concept.slug,
    explanation: `该概念的难度标注为${concept.difficulty}。`,
  });
  return questions;
}

export function questionsForConcept(
  concept: PlanConcept,
): StageQuestionInput[] {
  const curated = curatedQuestionsFor(concept.slug);
  return curated.length ? curated : conceptDerivedQuestions(concept);
}

type ChoiceQuestionInput = Extract<
  StageQuestionInput,
  { type: 'single-choice' | 'multiple-choice' | 'true-false' }
>;
type TextQuestionInput = Extract<
  StageQuestionInput,
  { type: 'formula-fill' | 'code-output' | 'calculation' }
>;
type OpenQuestionInput = Extract<
  StageQuestionInput,
  { type: 'concept-explanation' | 'code-reading' }
>;

function isChoiceQuestion(
  input: StageQuestionInput,
): input is ChoiceQuestionInput {
  return (
    input.type === 'single-choice' ||
    input.type === 'multiple-choice' ||
    input.type === 'true-false'
  );
}

function isOpenQuestion(input: StageQuestionInput): input is OpenQuestionInput {
  return input.type === 'concept-explanation' || input.type === 'code-reading';
}

/** Converts an authored question into the shape stored on the plan. */
function materializeQuestion(
  input: StageQuestionInput,
  concept: PlanConcept | undefined,
): StageQuestion {
  const grading = gradingOf(input);
  const base = {
    id: makeId(`q-${input.id}`),
    type: input.type,
    prompt: input.prompt,
    conceptSlug: input.conceptSlug || concept?.slug || null,
    explanation: input.explanation,
    grading,
  };
  if (isOpenQuestion(input))
    return {
      ...base,
      type: input.type,
      correctAnswers: [],
      exampleAnswer: input.referenceAnswer,
    };
  if (isChoiceQuestion(input))
    return {
      ...base,
      type: input.type,
      options: input.options,
      correctAnswers: [...input.correctOptions],
    };
  const typed = input as TextQuestionInput;
  return {
    ...base,
    type: typed.type,
    correctAnswers: [...typed.accept],
  };
}

/**
 * Builds a phase test from the real question bank. Returns an empty question
 * list when nothing gradable exists, so the plan reports "暂无测试" instead of
 * generating placeholder items that everyone can pass.
 */
export function buildStageQuestions(
  concepts: PlanConcept[],
  target = STAGE_TEST_QUESTION_TARGET,
): StageQuestion[] {
  const pools = concepts.map((concept) => ({
    concept,
    inputs: questionsForConcept(concept),
  }));
  const selected: StageQuestion[] = [];
  const used = new Set<string>();
  // Round-robin across concepts so the test follows the phase order, passing
  // over the same concept again only when it holds further distinct questions.
  // Each pass must scan every concept: a concept with fewer questions than the
  // current pass index simply contributes nothing this round.
  for (let pass = 0; selected.length < target; pass += 1) {
    let addedThisPass = 0;
    for (const pool of pools) {
      if (selected.length >= target) break;
      const input = pool.inputs[pass];
      if (!input || used.has(input.id)) continue;
      used.add(input.id);
      selected.push(materializeQuestion(input, pool.concept));
      addedThisPass += 1;
    }
    if (!addedThisPass) break;
  }
  return selected;
}

function makeStageTest(
  phaseId: string,
  phaseTitle: string,
  concepts: PlanConcept[],
  enabled: boolean,
): StageTest {
  const questions =
    enabled && concepts.length ? buildStageQuestions(concepts) : [];
  // A phase without questions reports "暂无测试" and is never scored. A phase
  // with fewer questions than the target still gets a real, gradable test.
  const notGradable = enabled && questions.length === 0;
  return {
    id: makeId('test'),
    phaseId,
    title: `${phaseTitle} · 阶段练习`,
    questions,
    status: enabled && !notGradable ? 'not-started' : 'skipped',
    score: null,
    completedAt: null,
    weakConcepts: [],
    incorrectQuestionIds: [],
    addWeakToReview: false,
    grades: [],
    hasUngradedQuestions: false,
    notGradable,
  };
}

export function recomputePlan(
  plan: LearningPlan,
  now = new Date(),
): LearningPlan {
  const phases = plan.phases.map((originalPhase) => {
    const phase = {
      ...originalPhase,
      tasks: originalPhase.tasks.map((task) => {
        const requested =
          task.substeps.reduce((sum, step) => sum + step.estimatedMinutes, 0) ||
          task.estimatedMinutes;
        const minutes = Math.min(
          10,
          Math.max(1, Number.isFinite(requested) ? Math.round(requested) : 10),
        );
        return {
          ...task,
          estimatedMinutes: Math.round(minutes * 100) / 100,
          substeps: resizeSubsteps(task.substeps, minutes),
        };
      }),
    };
    const done = phase.tasks.filter((task) => terminal(task.status)).length;
    const completionRate = phase.tasks.length
      ? Math.round((done / phase.tasks.length) * 100)
      : 0;
    const status: PhaseStatus =
      phase.status === 'paused'
        ? 'paused'
        : completionRate === 100
          ? 'completed'
          : done > 0
            ? 'in-progress'
            : 'not-started';
    return { ...phase, completionRate, status };
  });
  const tasks = phases.flatMap((phase) => phase.tasks);
  const completionRate = tasks.length
    ? Math.round(
        (tasks.filter((task) => terminal(task.status)).length / tasks.length) *
          100,
      )
    : 0;
  const activePhaseId =
    phases.find(
      (phase) => phase.status !== 'completed' && phase.status !== 'paused',
    )?.id ??
    phases.at(-1)?.id ??
    '';
  const remainingMinutes = tasks
    .filter((task) => !terminal(task.status))
    .reduce(
      (sum, task) =>
        sum +
        task.substeps
          .filter((step) => !terminal(step.status))
          .reduce((stepSum, step) => stepSum + step.estimatedMinutes, 0),
      0,
    );
  const weeks = remainingMinutes / Math.max(30, plan.weeklyMinutes);
  const estimatedCompletionDate = addDays(now, Math.ceil(weeks * 7));
  return {
    ...plan,
    phases,
    completionRate,
    activePhaseId,
    estimatedCompletionDate,
    status:
      completionRate === 100
        ? 'completed'
        : plan.status === 'completed'
          ? 'active'
          : plan.status,
    updatedAt: now.toISOString(),
  };
}

export function buildReminder(
  plan: LearningPlan | null,
  state: ReminderState,
  now = new Date(),
): ReminderView | null {
  if (!plan || plan.status === 'completed' || plan.completionRate === 100)
    return null;
  const today = localDate(now);
  if (
    !state.lastStudyDate ||
    state.lastStudyDate >= today ||
    state.lastReminderDate === today ||
    state.reminderDismissedDate === today
  )
    return null;
  const elapsed = Math.max(
    0,
    Math.floor(
      (parseLocal(today).getTime() -
        parseLocal(state.lastStudyDate).getTime()) /
        86_400_000,
    ),
  );
  if (elapsed < 1) return null;
  const tasks = plan.phases.flatMap((phase) => phase.tasks);
  const suggestedTasks = tasks
    .filter((task) => !terminal(task.status) && task.status !== 'paused')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.order - b.order)
    .slice(0, 2);
  if (!suggestedTasks.length && plan.status !== 'paused') return null;
  const last = tasks.find((task) => task.id === plan.lastTaskId);
  return {
    daysAway: elapsed,
    lastStudyLabel:
      last?.title ??
      plan.phases.find((phase) => phase.id === plan.activePhaseId)?.title ??
      plan.title,
    suggestedTasks,
    estimatedMinutes: suggestedTasks.reduce(
      (sum, task) =>
        sum +
        task.substeps
          .filter((step) => !terminal(step.status))
          .reduce((stepSum, step) => stepSum + step.estimatedMinutes, 0),
      0,
    ),
    paused: plan.status === 'paused',
  };
}

export function planPreview(plan: LearningPlan) {
  const tasks = plan.phases.flatMap((phase) => phase.tasks);
  return {
    phaseCount: plan.phases.length,
    conceptCount: new Set(tasks.map((task) => task.conceptSlug).filter(Boolean))
      .size,
    codeCount: tasks.filter(
      (task) =>
        [
          'code-reading',
          'parameter-change',
          'interactive-experiment',
          'result-note',
          'project',
        ].includes(task.type) ||
        task.substeps.some((step) =>
          [
            'code-reading',
            'parameter-change',
            'interactive-experiment',
          ].includes(step.type),
        ),
    ).length,
    reviewCount: tasks.filter(
      (task) =>
        task.type === 'review' ||
        task.type === 'phase-review' ||
        task.substeps.some((step) => step.type === 'review'),
    ).length,
    resourceCount: tasks.filter((task) => Boolean(task.resourceId)).length,
    testCount: plan.phases.filter((phase) => phase.test.questions.length > 0)
      .length,
    totalMinutes: tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
  };
}

function resizeSubsteps(substeps: PlanSubstep[], requestedMinutes: number) {
  if (!substeps.length) return substeps;
  const target = Math.min(
    10,
    Math.max(
      1,
      Number.isFinite(requestedMinutes) ? Math.round(requestedMinutes) : 10,
    ),
  );
  const weights = substeps.map((step) =>
    Math.max(0.1, Number(step.estimatedMinutes) || 1),
  );
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - target) < 1e-9) return substeps;
  // Use exact halves/quarters for long legacy checklists, avoiding rounding drift.
  const denominator =
    2 ** Math.max(0, Math.ceil(Math.log2(substeps.length / target)));
  const units = Math.round(target * denominator);
  const distributable = units - substeps.length;
  let allocated = 0;
  return substeps.map((step, index) => {
    const share =
      index === substeps.length - 1
        ? units - allocated
        : 1 + Math.floor((weights[index] / total) * distributable);
    allocated += share;
    return { ...step, estimatedMinutes: share / denominator };
  });
}

export function updateTask(
  plan: LearningPlan,
  taskId: string,
  patch: Partial<PlanTask>,
  now = new Date(),
) {
  const phases = plan.phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((task) =>
      task.id === taskId
        ? (() => {
            const cascadeStatus =
              patch.status === 'completed' ||
              patch.status === 'skipped' ||
              patch.status === 'not-started';
            let substeps = cascadeStatus
              ? task.substeps.map((step) => ({
                  ...step,
                  status: patch.status as TaskStatus,
                  completedAt:
                    patch.status === 'completed' ? now.toISOString() : null,
                }))
              : (patch.substeps ?? task.substeps);
            if (
              !patch.status &&
              !patch.substeps &&
              patch.estimatedMinutes !== undefined
            )
              substeps = resizeSubsteps(substeps, patch.estimatedMinutes);
            return {
              ...task,
              ...patch,
              substeps,
              estimatedMinutes: substeps.reduce(
                (sum, step) => sum + step.estimatedMinutes,
                0,
              ),
              completedAt:
                patch.status === 'completed'
                  ? now.toISOString()
                  : patch.status
                    ? null
                    : (patch.completedAt ?? task.completedAt),
            };
          })()
        : task,
    ),
  }));
  const changed = phases
    .flatMap((phase) => phase.tasks)
    .find((task) => task.id === taskId);
  return recomputePlan(
    { ...plan, phases, lastTaskId: changed?.id ?? plan.lastTaskId },
    now,
  );
}

export function updateSubstep(
  plan: LearningPlan,
  taskId: string,
  substepId: string,
  status: TaskStatus,
  now = new Date(),
) {
  const phases = plan.phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((task) => {
      if (task.id !== taskId) return task;
      const substeps = task.substeps.map((step) =>
        step.id === substepId
          ? {
              ...step,
              status,
              completedAt: status === 'completed' ? now.toISOString() : null,
            }
          : step,
      );
      const complete = substeps.every((step) => terminal(step.status));
      const started = substeps.some((step) => step.status !== 'not-started');
      const nextDue = substeps
        .filter((step) => !terminal(step.status) && step.dueDate)
        .map((step) => step.dueDate!)
        .sort()[0];
      return {
        ...task,
        substeps,
        estimatedMinutes: substeps.reduce(
          (sum, step) => sum + step.estimatedMinutes,
          0,
        ),
        dueDate: nextDue ?? task.dueDate,
        status: complete
          ? ('completed' as const)
          : started
            ? ('in-progress' as const)
            : ('not-started' as const),
        completedAt: complete ? now.toISOString() : null,
      };
    }),
  }));
  return recomputePlan({ ...plan, phases, lastTaskId: taskId }, now);
}

/**
 * Task types whose completion genuinely means "this concept is learned".
 *
 * `concept-understanding` is the composite comprehension card; the legacy
 * routes also used per-substep cards named `concept-reading`/`definition-reading`.
 * Practice, review, exercise, project and resource tasks must never be treated
 * as proof that a concept was understood.
 */
export const CONCEPT_LEARNING_TASK_TYPES: ReadonlySet<TaskType> = new Set([
  'concept-understanding',
  'concept-reading',
  'definition-reading',
]);

/** True only for tasks whose completion marks the concept as learned. */
export function taskMarksConceptLearned(task: PlanTask): boolean {
  return (
    Boolean(task.conceptSlug) && CONCEPT_LEARNING_TASK_TYPES.has(task.type)
  );
}

/** True when every substep has reached a terminal state. */
export function substepsComplete(substeps: PlanSubstep[]): boolean {
  return (
    substeps.length > 0 &&
    substeps.every(
      (step) => step.status === 'completed' || step.status === 'skipped',
    )
  );
}

export function syncLearnedTasks(
  plan: LearningPlan,
  learned: string[],
  now = new Date(),
) {
  let changed = false;
  const phases = plan.phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((task) => {
      if (
        !taskMarksConceptLearned(task) ||
        !task.conceptSlug ||
        !learned.includes(task.conceptSlug) ||
        task.status === 'completed'
      )
        return task;
      changed = true;
      return {
        ...task,
        status: 'completed' as const,
        completedAt: now.toISOString(),
        substeps: task.substeps.map((step) => ({
          ...step,
          status: 'completed' as const,
          completedAt: now.toISOString(),
        })),
      };
    }),
  }));
  return changed ? recomputePlan({ ...plan, phases }, now) : plan;
}

export function moveTask(
  plan: LearningPlan,
  taskId: string,
  targetPhaseId: string,
  targetIndex: number,
  now = new Date(),
) {
  const task = plan.phases
    .flatMap((phase) => phase.tasks)
    .find((item) => item.id === taskId);
  if (!task || !plan.phases.some((phase) => phase.id === targetPhaseId))
    return plan;
  const phases = plan.phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.filter((item) => item.id !== taskId),
  }));
  const target = phases.find((phase) => phase.id === targetPhaseId)!;
  const index = Math.max(0, Math.min(targetIndex, target.tasks.length));
  target.tasks.splice(index, 0, { ...task, phaseId: targetPhaseId });
  for (const phase of phases)
    phase.tasks = phase.tasks.map((item, order) => ({ ...item, order }));
  return recomputePlan({ ...plan, phases }, now);
}

/** Judges one submitted answer. Returns null when it awaits self-assessment. */
function gradeQuestion(
  question: StageQuestion,
  answers: Record<string, string[]>,
): StageTestGrade {
  const submitted = answers[question.id] ?? [];
  if (question.grading === 'self-assessed')
    return {
      questionId: question.id,
      correct: null,
      autoGraded: false,
      selfAssessed: false,
    };
  const answered = submitted.some((item) => item.trim() !== '');
  if (!answered)
    return {
      questionId: question.id,
      correct: false,
      autoGraded: true,
      selfAssessed: false,
    };
  let correct: boolean;
  if (question.type === 'single-choice' || question.type === 'multiple-choice')
    correct = sameOptionSet(submitted, question.correctAnswers);
  else if (question.type === 'true-false')
    correct = sameOptionSet(submitted, question.correctAnswers);
  else
    correct =
      submitted.length === 1 &&
      isAnswerAccepted(submitted[0]!, question.correctAnswers);
  return {
    questionId: question.id,
    correct,
    autoGraded: true,
    selfAssessed: false,
  };
}

/**
 * Score = share of questions judged correct.
 * Only auto-graded questions and learner self-assessments count; a question that
 * cannot be graded yet is excluded rather than silently marked wrong, and an
 * empty test never yields a score.
 */
export function computeStageTestScore(grades: StageTestGrade[]) {
  const judged = grades.filter((grade) => grade.correct !== null);
  if (!judged.length)
    return {
      score: null as number | null,
      judged: 0,
      correct: 0,
      pending: grades.length,
    };
  const correct = judged.filter((grade) => grade.correct).length;
  return {
    score: Math.round((correct / judged.length) * 100),
    judged: judged.length,
    correct,
    pending: grades.length - judged.length,
  };
}

export function scoreStageTest(
  plan: LearningPlan,
  phaseId: string,
  answers: Record<string, string[]>,
  addWeakToReview: boolean,
  now = new Date(),
) {
  const phases = (plan.phases ?? []).map((phase) => {
    const questions = phase.test?.questions ?? [];
    if (phase.id !== phaseId || questions.length === 0) return phase;
    const grades = questions.map((question) =>
      gradeQuestion(question, answers),
    );
    const { score, pending } = computeStageTestScore(grades);
    const wrong = questions.filter(
      (question) =>
        grades.find((grade) => grade.questionId === question.id)?.correct ===
        false,
    );
    const weakConcepts = [
      ...new Set(
        wrong
          .map((question) => question.conceptSlug)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    ];
    let tasks = phase.tasks ?? [];
    if (addWeakToReview) {
      const additions = weakConcepts
        .filter(
          (slug) =>
            !tasks.some(
              (task) =>
                task.type === 'review' &&
                task.conceptSlug === slug &&
                task.description === '阶段测试后重新加入的复习任务',
            ),
        )
        .map((slug) => {
          const source = tasks.find((task) => task.conceptSlug === slug);
          const sourceTitle =
            source?.title.replace(/^(名词与理解|原理与实践) · /, '') ?? slug;
          const substeps = [
            makeSubstep(
              'review',
              `复习薄弱概念 · ${sourceTitle}`,
              '回看定义、核心原理和本次错误题目。',
              20,
              'core-principle',
              false,
              addDays(now, 3),
            ),
          ];
          const review: PlanTask = {
            id: makeId('task'),
            phaseId,
            type: 'review',
            title: `薄弱概念复习 · ${sourceTitle}`,
            conceptSlug: slug,
            description: '阶段测试后重新加入的复习任务',
            category: source?.category ?? null,
            difficulty: source?.difficulty ?? null,
            estimatedMinutes: 20,
            dueDate: addDays(now, 3),
            order: tasks.length,
            status: 'not-started',
            isImportant: true,
            completedAt: null,
            notes: '',
            targetSection: 'core-principle',
            substeps,
          };
          return review;
        });
      tasks = [...tasks, ...additions].map((task, order) => ({
        ...task,
        order,
      }));
    }
    return {
      ...phase,
      tasks,
      test: {
        ...phase.test,
        status: 'completed' as const,
        score,
        completedAt: now.toISOString(),
        weakConcepts,
        incorrectQuestionIds: wrong.map((question) => question.id),
        addWeakToReview,
        grades,
        hasUngradedQuestions: pending > 0,
      },
    };
  });
  return recomputePlan({ ...plan, phases }, now);
}

/** Applies the learner's own judgement to questions that have no auto-grader. */
export function applyStageSelfAssessment(
  plan: LearningPlan,
  phaseId: string,
  selfAssessment: Record<string, boolean>,
  now = new Date(),
) {
  const phases = (plan.phases ?? []).map((phase) => {
    const questions = phase.test?.questions ?? [];
    if (phase.id !== phaseId || questions.length === 0) return phase;
    const grades = questions.map((question) => {
      const existing = phase.test.grades?.find(
        (grade) => grade.questionId === question.id,
      );
      const base: StageTestGrade = existing ?? {
        questionId: question.id,
        correct: null,
        autoGraded: false,
        selfAssessed: false,
      };
      if (base.autoGraded) return base;
      const judged = selfAssessment[question.id];
      if (judged === undefined)
        return { ...base, correct: null, selfAssessed: false };
      return { ...base, correct: judged, selfAssessed: true };
    });
    const { score, pending } = computeStageTestScore(grades);
    const incorrectQuestionIds = questions
      .filter(
        (question) =>
          grades.find((grade) => grade.questionId === question.id)?.correct ===
          false,
      )
      .map((question) => question.id);
    return {
      ...phase,
      test: {
        ...phase.test,
        score,
        grades,
        incorrectQuestionIds,
        hasUngradedQuestions: pending > 0,
      },
    };
  });
  return recomputePlan({ ...plan, phases }, now);
}
