import type { CategorySlug, Difficulty } from './content-base';

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

export interface StageQuestion {
  id: string;
  type: TestQuestionType;
  prompt: string;
  options?: string[];
  correctAnswers: string[];
  conceptSlug: string | null;
  explanation: string;
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
    summary: '严格沿前置关系逐概念推进，每个概念包含理解与实践两张卡。',
  },
  {
    value: 'deep-understanding',
    label: '深度理解法',
    summary: '先建立完整名词理解，再用原理、公式、代码和复述验证。',
  },
  {
    value: 'code-practice',
    label: '代码实践法',
    summary: '概念、代码、参数、实验、记录、练习与小项目。',
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
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12)
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
    parts.push(`学习这个概念前，通常需要先理解${concept.prerequisites.join('、')}`);
  if ((concept.relatedConcepts?.length ?? 0) > 0)
    parts.push(`掌握后可以继续联系${concept.relatedConcepts!.slice(0, 3).join('、')}等相关内容`);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const complete = sentence(part);
    const key = normalizedSentence(complete);
    if (!key || [...seen].some((item) => item.includes(key) || key.includes(item))) continue;
    unique.push(complete);
    seen.add(key);
    if (unique.join('').length >= 120) break;
  }
  let paragraph = unique.join('');
  if (!paragraph) paragraph = sentence(concept.summary || `${concept.title}是当前学习路线中的一个概念`);
  if (paragraph.length <= 180) return paragraph;
  const clipped = paragraph.slice(0, 180);
  const boundary = Math.max(
    clipped.lastIndexOf('。'),
    clipped.lastIndexOf('！'),
    clipped.lastIndexOf('？'),
  );
  return boundary >= 100 ? clipped.slice(0, boundary + 1) : `${clipped.slice(0, 179)}。`;
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
          (id): id is string => typeof id === 'string',
        )
      : [],
  };
}

function migratePlan(value: unknown): LearningPlan {
  const item =
    value && typeof value === 'object' ? (value as Partial<LearningPlan>) : {};
  const now = new Date();
  const id = typeof item.id === 'string' ? item.id : makeId('plan');
  const phases = Array.isArray(item.phases)
    ? item.phases.map((phase, index) => migratePhase(phase, id, index))
    : [];
  const startDate =
    typeof item.startDate === 'string' ? item.startDate : localDate(now);
  const targetDate =
    typeof item.targetDate === 'string' ? item.targetDate : startDate;
  return recomputePlan(
    {
      id,
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
    test: {
      id: item.test?.id ?? makeId('test'),
      phaseId: id,
      title: item.test?.title ?? '阶段练习',
      questions: item.test?.questions ?? [],
      status: item.test?.status ?? 'not-started',
      score: item.test?.score ?? null,
      completedAt: item.test?.completedAt ?? null,
      weakConcepts: item.test?.weakConcepts ?? [],
      incorrectQuestionIds: item.test?.incorrectQuestionIds ?? [],
      addWeakToReview: item.test?.addWeakToReview ?? false,
    },
  };
}

function migrateTask(value: unknown, phaseId: string, order: number): PlanTask {
  const item =
    value && typeof value === 'object' ? (value as Partial<PlanTask>) : {};
  const id = item.id ?? makeId('task');
  const status = item.status ?? 'not-started';
  const completedAt = item.completedAt ?? null;
  const fallbackMinutes = Math.max(5, Number(item.estimatedMinutes) || 25);
  const substeps = Array.isArray(item.substeps) && item.substeps.length
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
      item.completedAt ??
      (status === 'completed' ? fallbackCompletedAt : null),
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
  const candidates = collectRouteConcepts(
    allConcepts,
    input.categories,
    warnings,
  );
  const ordered = orderConcepts(candidates, learning.bookmarks, warnings);
  const days = Math.max(
    7,
    Math.ceil(
      (parseLocal(input.targetDate).getTime() - now.getTime()) / 86_400_000,
    ),
  );
  const weeks = Math.max(1, days / 7);
  const capacity = Math.max(30, input.weeklyMinutes) * weeks;
  const selected: PlanConcept[] = [];
  let usedMinutes = 0;
  for (const concept of ordered.slice(0, 24)) {
    const minutes = tasksForConcept(
      input,
      concept,
      'estimate',
      learning.learned.includes(concept.slug),
      now,
    ).reduce((sum, task) => sum + task.estimatedMinutes, 0);
    if (selected.length > 0 && usedMinutes + minutes > capacity) break;
    selected.push(concept);
    usedMinutes += minutes;
  }
  if (selected.length < candidates.length)
    warnings.push(
      `根据可用时间，本版先安排 ${selected.length} / ${candidates.length} 个概念。`,
    );
  const phaseDefs = [
    {
      title: '基础起步',
      description: '沿前置关系完成最初一组概念，不跨过必要知识。',
    },
    {
      title: '核心推进',
      description: '在已有基础上继续理解核心概念、原理与联系。',
    },
    {
      title: '综合应用',
      description: '完成路线后段的原理验证、代码和综合练习。',
    },
  ];
  const phases: PlanPhase[] = [];
  const phaseCount = Math.min(3, Math.max(1, selected.length));
  const chunkSize = Math.max(1, Math.ceil(selected.length / phaseCount));
  for (const [phaseIndex, def] of phaseDefs
    .slice(0, phaseCount)
    .entries()) {
    const phaseConcepts = selected.slice(
      phaseIndex * chunkSize,
      (phaseIndex + 1) * chunkSize,
    );
    if (!phaseConcepts.length) continue;
    const phaseId = makeId('phase');
    let tasks = phaseConcepts.flatMap((concept) =>
      tasksForConcept(
        input,
        concept,
        phaseId,
        learning.learned.includes(concept.slug),
        now,
      ),
    );
    if (
      input.includeReview &&
      (input.method === 'knowledge-route' ||
        input.method === 'deep-understanding')
    )
      tasks = [
        ...tasks,
        makePhaseReviewTask(phaseId, phaseConcepts, now),
      ];
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
      completionRate: 0,
      phases,
      generationWarnings: warnings,
      lastTaskId: null,
    },
    now,
  );
}

function normalizeConceptKey(value: string) {
  return value.trim().toLowerCase().replace(/[、，,/（）()\s·：:]/g, '');
}

function collectRouteConcepts(
  allConcepts: PlanConcept[],
  categories: CategorySlug[],
  warnings: string[],
) {
  const bySlug = new Map(allConcepts.map((concept) => [concept.slug, concept]));
  const byTitle = new Map(
    allConcepts.map((concept) => [normalizeConceptKey(concept.title), concept]),
  );
  const normalized = allConcepts.map((concept) => ({
    ...concept,
    prerequisites: concept.prerequisites.flatMap((identifier) => {
      const resolved =
        bySlug.get(identifier) ??
        byTitle.get(normalizeConceptKey(identifier));
      if (!resolved) {
        warnings.push(`${concept.title} 缺失前置知识链接：${identifier}`);
        return [];
      }
      return [resolved.slug];
    }),
  }));
  const normalizedBySlug = new Map(
    normalized.map((concept) => [concept.slug, concept]),
  );
  const targetSlugs = normalized
    .filter((concept) => categories.includes(concept.category))
    .map((concept) => concept.slug);
  const included = new Set(targetSlugs);
  const visit = (slug: string, visiting: Set<string>) => {
    if (visiting.has(slug)) return;
    const concept = normalizedBySlug.get(slug);
    if (!concept) return;
    const next = new Set(visiting).add(slug);
    for (const prerequisite of concept.prerequisites) {
      included.add(prerequisite);
      visit(prerequisite, next);
    }
  };
  for (const slug of targetSlugs) visit(slug, new Set());
  const bridges = normalized.filter(
    (concept) =>
      included.has(concept.slug) && !categories.includes(concept.category),
  );
  if (bridges.length)
    warnings.push(
      `已加入跨方向前置知识：${bridges.map((concept) => concept.title).join('、')}。`,
    );
  return normalized.filter((concept) => included.has(concept.slug));
}

function orderConcepts(
  concepts: PlanConcept[],
  bookmarks: string[],
  warnings: string[],
) {
  const map = new Map(concepts.map((concept) => [concept.slug, concept]));
  const indegree = new Map(concepts.map((concept) => [concept.slug, 0]));
  const children = new Map<string, string[]>();
  for (const concept of concepts) {
    for (const prerequisite of concept.prerequisites) {
      if (!map.has(prerequisite)) {
        warnings.push(`${concept.title} 缺失前置知识链接：${prerequisite}`);
        continue;
      }
      indegree.set(concept.slug, (indegree.get(concept.slug) ?? 0) + 1);
      children.set(prerequisite, [
        ...(children.get(prerequisite) ?? []),
        concept.slug,
      ]);
    }
  }
  const rank: Record<Difficulty, number> = { 入门: 0, 进阶: 1, 挑战: 2 };
  const sort = (a: PlanConcept, b: PlanConcept) =>
    rank[a.difficulty] - rank[b.difficulty] ||
    Number(bookmarks.includes(b.slug)) - Number(bookmarks.includes(a.slug)) ||
    a.title.localeCompare(b.title, 'zh-CN');
  const queue = concepts
    .filter((concept) => indegree.get(concept.slug) === 0)
    .sort(sort);
  const result: PlanConcept[] = [];
  while (queue.length) {
    const concept = queue.shift()!;
    result.push(concept);
    for (const child of children.get(concept.slug) ?? []) {
      indegree.set(child, (indegree.get(child) ?? 1) - 1);
      if (indegree.get(child) === 0) queue.push(map.get(child)!);
      queue.sort(sort);
    }
  }
  const remaining = concepts
    .filter((concept) => !result.some((item) => item.slug === concept.slug))
    .sort(sort);
  if (remaining.length)
    warnings.push(
      `检测到循环前置关系：${remaining.map((item) => item.title).join('、')}；已按难度降级排序。`,
    );
  return [...result, ...remaining];
}

function baseTask(
  concept: PlanConcept,
  phaseId: string,
  type: TaskType,
  title: string,
  minutes: number,
  section: string | null,
  complete = false,
): PlanTask {
  const substeps = [
    makeSubstep(
      type,
      title,
      concept.title,
      minutes,
      section,
      complete,
    ),
  ];
  return {
    id: makeId('task'),
    phaseId,
    type,
    title,
    conceptSlug: concept.slug,
    description: concept.title,
    category: concept.category,
    difficulty: concept.difficulty,
    estimatedMinutes: minutes,
    dueDate: localDate(new Date()),
    order: 0,
    status: complete ? 'completed' : 'not-started',
    isImportant: false,
    completedAt: complete ? new Date().toISOString() : null,
    notes: '',
    targetSection: section,
    substeps,
  };
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

function groupedTask(
  concept: PlanConcept,
  phaseId: string,
  type: 'concept-understanding' | 'principle-practice',
  title: string,
  description: string,
  substeps: PlanSubstep[],
  complete = false,
): PlanTask {
  const normalized = complete
    ? substeps.map((step) => ({
        ...step,
        status: 'completed' as const,
        completedAt: step.completedAt ?? new Date().toISOString(),
      }))
    : substeps;
  return {
    id: makeId('task'),
    phaseId,
    type,
    title,
    conceptSlug: concept.slug,
    description,
    category: concept.category,
    difficulty: concept.difficulty,
    estimatedMinutes: normalized.reduce(
      (sum, step) => sum + step.estimatedMinutes,
      0,
    ),
    dueDate: localDate(new Date()),
    order: 0,
    status: complete ? 'completed' : 'not-started',
    isImportant: false,
    completedAt: complete ? new Date().toISOString() : null,
    notes: '',
    targetSection: normalized[0]?.targetSection ?? null,
    substeps: normalized,
  };
}

function progressiveConceptTasks(
  input: PlanFormInput,
  concept: PlanConcept,
  phaseId: string,
  learned: boolean,
): PlanTask[] {
  const deep = input.method === 'deep-understanding';
  const definition = buildDefinitionParagraph(concept);
  const understanding = [
    makeSubstep(
      'definition-reading',
      `阅读定义 · ${concept.title}`,
      definition,
      5,
      'definition',
      learned,
    ),
    makeSubstep(
      'context',
      '理解它解决的问题与知识位置',
      concept.summary ?? definition,
      deep ? 5 : 3,
      'background',
      learned,
    ),
    makeSubstep(
      'intuition',
      `理解直觉 · ${concept.title}`,
      concept.summary ?? concept.title,
      deep ? 5 : 4,
      'intuition',
      learned,
    ),
    makeSubstep(
      'related-concepts',
      '确认前置与后续关系',
      [...concept.prerequisites, ...(concept.relatedConcepts ?? [])]
        .filter(Boolean)
        .join('、'),
      deep ? 5 : 3,
      'related',
      learned,
    ),
    makeSubstep(
      'understanding-question',
      `完成理解检查 · ${concept.title}`,
      '用自己的话说明这个概念是什么，以及它解决什么问题。',
      5,
      'related',
      learned,
    ),
  ];
  const practice = [
    makeSubstep(
      'principle',
      `学习核心原理 · ${concept.title}`,
      concept.principles?.[0] ?? concept.summary ?? concept.title,
      deep ? 8 : 6,
      'core-principle',
    ),
    ...(concept.hasFormula
      ? [
          makeSubstep(
            'formula',
            `阅读公式或最小例子 · ${concept.title}`,
            '对照变量含义和最小计算，确认公式如何表达核心原理。',
            deep ? 8 : 6,
            'formulas',
          ),
        ]
      : []),
    ...(input.includeCode && concept.hasCode
      ? [
          makeSubstep(
            'code-reading',
            `阅读代码 · ${concept.title}`,
            '把代码中的变量、步骤和输出与概念原理逐项对应。',
            deep ? 12 : 10,
            'code',
          ),
        ]
      : []),
    ...(concept.hasInteractive
      ? [
          makeSubstep(
            'interactive-experiment',
            `交互实验 · ${concept.title}`,
            '修改一个关键参数，观察变化并记录结果。',
            deep ? 15 : 12,
            'algorithm-steps',
          ),
        ]
      : []),
    makeSubstep(
      'self-explanation',
      `用自己的话解释 · ${concept.title}`,
      '不查看正文，说明核心原理及其适用边界。',
      5,
      'core-principle',
    ),
    makeSubstep(
      'exercise',
      `完成巩固练习 · ${concept.title}`,
      '完成一个简短问题或最小练习，检查是否真正理解。',
      5,
      'pitfalls',
    ),
  ];
  return [
    groupedTask(
      concept,
      phaseId,
      'concept-understanding',
      `名词与理解 · ${concept.title}`,
      definition,
      understanding,
      learned,
    ),
    groupedTask(
      concept,
      phaseId,
      'principle-practice',
      `原理与实践 · ${concept.title}`,
      concept.principles?.[0] ?? concept.summary ?? concept.title,
      practice,
    ),
  ];
}

function makePhaseReviewTask(
  phaseId: string,
  concepts: PlanConcept[],
  now: Date,
): PlanTask {
  const names = concepts.map((concept) => concept.title).join('、');
  const substeps = [1, 3, 7, 14].map((offset) =>
    makeSubstep(
      'review',
      `${offset} 天后复习本阶段`,
      `复习${names}，优先回看定义、核心原理和未完成的练习。`,
      offset === 14 ? 8 : 6,
      offset % 2 ? 'formulas' : 'code',
      false,
      addDays(now, offset),
    ),
  );
  return {
    id: makeId('task'),
    phaseId,
    type: 'phase-review',
    title: '阶段聚合复习',
    conceptSlug: null,
    description: `按 1、3、7、14 天节奏复习：${names}`,
    category: null,
    difficulty: null,
    estimatedMinutes: substeps.reduce(
      (sum, step) => sum + step.estimatedMinutes,
      0,
    ),
    dueDate: addDays(now, 1),
    order: 0,
    status: 'not-started',
    isImportant: false,
    completedAt: null,
    notes: '',
    targetSection: null,
    substeps,
  };
}

function tasksForConcept(
  input: PlanFormInput,
  concept: PlanConcept,
  phaseId: string,
  learned: boolean,
  now: Date,
): PlanTask[] {
  let tasks: PlanTask[];
  if (
    input.method === 'knowledge-route' ||
    input.method === 'deep-understanding'
  ) {
    tasks = progressiveConceptTasks(input, concept, phaseId, learned);
  } else if (input.method === 'code-practice') {
    tasks = [
      baseTask(
        concept,
        phaseId,
        'concept-reading',
        `学习概念 · ${concept.title}`,
        20,
        'definition',
        learned,
      ),
      baseTask(
        concept,
        phaseId,
        'code-reading',
        `阅读代码 · ${concept.title}`,
        25,
        'code',
      ),
      baseTask(
        concept,
        phaseId,
        'parameter-change',
        `修改参数 · ${concept.title}`,
        25,
        'code',
      ),
      ...(concept.hasInteractive
        ? [
            baseTask(
              concept,
              phaseId,
              'interactive-experiment',
              `交互实验 · ${concept.title}`,
              25,
              'algorithm-steps',
            ),
          ]
        : []),
      baseTask(
        concept,
        phaseId,
        'result-note',
        `记录实验结果 · ${concept.title}`,
        15,
        'code',
      ),
      baseTask(
        concept,
        phaseId,
        'exercise',
        `完成小练习 · ${concept.title}`,
        30,
        'pitfalls',
      ),
      baseTask(
        concept,
        phaseId,
        'project',
        `完成小项目 · ${concept.title}`,
        45,
        'applications',
      ),
    ];
  } else if (input.method === 'spaced-review') {
    tasks = [
      baseTask(
        concept,
        phaseId,
        'concept-reading',
        `首次学习 · ${concept.title}`,
        25,
        'definition',
        learned,
      ),
    ];
    for (const offset of [0, 1, 3, 7, 14]) {
      const task = baseTask(
        concept,
        phaseId,
        'review',
        `${offset === 0 ? '当天' : `${offset} 天后`}复习 · ${concept.title}`,
        15,
        offset % 2 ? 'code' : 'formulas',
      );
      task.dueDate = addDays(now, offset);
      tasks.push(task);
    }
  } else tasks = [];
  if (
    input.includeCode &&
    concept.hasCode &&
    !tasks.some(
      (task) =>
        task.type === 'code-reading' ||
        task.substeps.some((step) => step.type === 'code-reading'),
    )
  )
    tasks.push(
      baseTask(
        concept,
        phaseId,
        'code-reading',
        `代码练习 · ${concept.title}`,
        25,
        'code',
      ),
    );
  if (
    input.includeReview &&
    input.method !== 'spaced-review' &&
    input.method !== 'knowledge-route' &&
    input.method !== 'deep-understanding'
  ) {
    for (const offset of [1, 3, 7, 14]) {
      const task = baseTask(
        concept,
        phaseId,
        'review',
        `${offset} 天后复习 · ${concept.title}`,
        12,
        offset % 2 ? 'formulas' : 'code',
      );
      task.dueDate = addDays(now, offset);
      tasks.push(task);
    }
  }
  return tasks;
}

function makeStageTest(
  phaseId: string,
  phaseTitle: string,
  concepts: PlanConcept[],
  enabled: boolean,
): StageTest {
  const questionTypes: TestQuestionType[] = [
    'single-choice',
    'multiple-choice',
    'true-false',
    'concept-explanation',
    'formula-fill',
    'code-reading',
    'code-output',
    'calculation',
  ];
  const questions = enabled
    ? questionTypes.map((type, index) => {
        const concept = concepts[index % concepts.length]!;
        return {
          id: makeId('question'),
          type,
          prompt: `请完成关于“${concept.title}”的${testTypeLabel(type)}。`,
          options:
            type === 'single-choice' ||
            type === 'multiple-choice' ||
            type === 'true-false'
              ? ['正确', '错误']
              : undefined,
          correctAnswers: ['正确'],
          conceptSlug: concept.slug,
          explanation: `回到“${concept.title}”的定义、公式或代码章节核对。`,
        };
      })
    : [];
  return {
    id: makeId('test'),
    phaseId,
    title: `${phaseTitle} · 阶段练习`,
    questions,
    status: enabled ? 'not-started' : 'skipped',
    score: null,
    completedAt: null,
    weakConcepts: [],
    incorrectQuestionIds: [],
    addWeakToReview: false,
  };
}
function testTypeLabel(type: TestQuestionType) {
  return (
    {
      'single-choice': '单选题',
      'multiple-choice': '多选题',
      'true-false': '判断题',
      'concept-explanation': '概念解释题',
      'formula-fill': '公式填写题',
      'code-reading': '代码阅读题',
      'code-output': '代码输出判断题',
      calculation: '简单计算题',
    } as const
  )[type];
}

export function recomputePlan(
  plan: LearningPlan,
  now = new Date(),
): LearningPlan {
  const phases = plan.phases.map((phase) => {
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
    .reduce((sum, task) => sum + task.estimatedMinutes, 0);
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
      (sum, task) => sum + task.estimatedMinutes,
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
          ['code-reading', 'parameter-change', 'interactive-experiment'].includes(
            step.type,
          ),
        ),
    ).length,
    reviewCount: tasks.filter(
      (task) => task.type === 'review' || task.type === 'phase-review',
    ).length,
    testCount: plan.phases.filter((phase) => phase.test.questions.length > 0)
      .length,
    totalMinutes: tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
  };
}

function resizeSubsteps(
  substeps: PlanSubstep[],
  requestedMinutes: number,
) {
  if (!substeps.length) return substeps;
  const target = Math.max(substeps.length, Math.round(requestedMinutes));
  const current = Math.max(
    1,
    substeps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
  );
  let allocated = 0;
  return substeps.map((step, index) => {
    const minutes =
      index === substeps.length - 1
        ? Math.max(1, target - allocated)
        : Math.max(
            1,
            Math.floor((step.estimatedMinutes / current) * target),
          );
    allocated += minutes;
    return { ...step, estimatedMinutes: minutes };
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
            let substeps = patch.status
              ? task.substeps.map((step) => ({
                  ...step,
                  status: patch.status as TaskStatus,
                  completedAt:
                    patch.status === 'completed'
                      ? now.toISOString()
                      : null,
                }))
              : (patch.substeps ?? task.substeps);
            if (
              !patch.status &&
              !patch.substeps &&
              patch.estimatedMinutes !== undefined
            )
              substeps = resizeSubsteps(
                substeps,
                patch.estimatedMinutes,
              );
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
              completedAt:
                status === 'completed' ? now.toISOString() : null,
            }
          : step,
      );
      const complete = substeps.every((step) => terminal(step.status));
      const started = substeps.some(
        (step) => step.status !== 'not-started',
      );
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

export function syncLearnedTasks(
  plan: LearningPlan,
  learned: string[],
  now = new Date(),
) {
  let changed = false;
  const phases = plan.phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((task) => {
      const reading =
        task.type === 'concept-reading' ||
        task.type === 'definition-reading' ||
        task.type === 'concept-understanding';
      if (
        !reading ||
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

export function scoreStageTest(
  plan: LearningPlan,
  phaseId: string,
  answers: Record<string, string[]>,
  addWeakToReview: boolean,
  now = new Date(),
) {
  const phases = plan.phases.map((phase) => {
    if (phase.id !== phaseId) return phase;
    const wrong = phase.test.questions.filter((question) => {
      const actual = [...(answers[question.id] ?? [])].sort();
      const expected = [...question.correctAnswers].sort();
      return (
        actual.length !== expected.length ||
        actual.some((answer, index) => answer !== expected[index])
      );
    });
    const weakConcepts = [
      ...new Set(
        wrong
          .map((question) => question.conceptSlug)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    ];
    const score = phase.test.questions.length
      ? Math.round(
          ((phase.test.questions.length - wrong.length) /
            phase.test.questions.length) *
            100,
        )
      : 0;
    let tasks = phase.tasks;
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
            source?.title.replace(/^(名词与理解|原理与实践) · /, '') ??
            slug;
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
      },
    };
  });
  return recomputePlan({ ...plan, phases }, now);
}
