import { asStringArray, asStringRecord } from './browser-storage.ts';
import { PLAN_STORAGE_KEY, PLAN_METHODS } from './plan-engine.ts';
import { THEME_STORAGE_KEY } from './theme.ts';

export const BACKUP_MAX_BYTES = 10 * 1024 * 1024;
export const BACKUP_STORAGE_KEYS = {
  learning: 'what-is-learning',
  plans: PLAN_STORAGE_KEY,
  resources: 'how-to-learn-ai-resources-v1',
  theme: THEME_STORAGE_KEY,
} as const;

type Validator<T = unknown> = (value: unknown, path: string) => T;
function invalid(path: string): never {
  throw new Error(
    `备份中的 ${path} 格式不正确。请选择本站导出的完整进度 JSON。`,
  );
}
const text: Validator<string> = (value, path) =>
  typeof value === 'string' ? value : invalid(path);
const flag: Validator<boolean> = (value, path) =>
  typeof value === 'boolean' ? value : invalid(path);
const number: Validator<number> = (value, path) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : invalid(path);
const strings: Validator<string[]> = (value, path) => {
  const result = asStringArray(value);
  return result && Array.isArray(value) && result.length === value.length
    ? result
    : invalid(path);
};
const stringMap: Validator<Record<string, string>> = (value, path) => {
  const result = asStringRecord(value);
  return result &&
    Object.keys(result).length === Object.keys(value as object).length
    ? result
    : invalid(path);
};
function literal<const T extends string | number>(expected: T): Validator<T> {
  return (value, path) =>
    value === expected ? expected : invalid(`${path}（不支持的版本或格式）`);
}
function oneOf<const T extends string>(values: readonly T[]): Validator<T> {
  return (value, path) =>
    typeof value === 'string' && values.includes(value as T)
      ? (value as T)
      : invalid(path);
}
function nullable<T>(validate: Validator<T>): Validator<T | null> {
  return (value, path) => (value === null ? null : validate(value, path));
}
function optional<T>(validate: Validator<T>): Validator<T | undefined> {
  return (value, path) =>
    value === undefined ? undefined : validate(value, path);
}
function array<T>(validate: Validator<T>): Validator<T[]> {
  return (value, path) =>
    Array.isArray(value)
      ? value.map((item, index) => validate(item, `${path}[${index}]`))
      : invalid(path);
}
function object<S extends Record<string, Validator>>(
  fields: S,
): Validator<{ [K in keyof S]: ReturnType<S[K]> }> {
  return (value, path) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      invalid(path);
    return Object.fromEntries(
      Object.entries(fields)
        .map(([key, validate]) => [
          key,
          validate((value as Record<string, unknown>)[key], `${path}.${key}`),
        ])
        .filter(([, field]) => field !== undefined),
    ) as { [K in keyof S]: ReturnType<S[K]> };
  };
}
const stringArrays: Validator<Record<string, string[]>> = (value, path) => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    invalid(path);
  return Object.fromEntries(
    Object.entries(value).map(([key, list]) => [
      key,
      strings(list, `${path}.${key}`),
    ]),
  );
};

const taskStatus = oneOf([
  'not-started',
  'in-progress',
  'completed',
  'paused',
  'skipped',
  'blocked',
]);
const category = oneOf([
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'reinforcement-learning',
]);
const difficulty = oneOf(['入门', '进阶', '挑战']);
const substep = object({
  id: text,
  type: text,
  title: text,
  description: text,
  estimatedMinutes: number,
  status: taskStatus,
  completedAt: nullable(text),
  targetSection: nullable(text),
  dueDate: nullable(text),
});
const question = object({
  id: text,
  type: oneOf([
    'single-choice',
    'multiple-choice',
    'true-false',
    'concept-explanation',
    'formula-fill',
    'code-reading',
    'code-output',
    'calculation',
  ]),
  prompt: text,
  options: optional(strings),
  correctAnswers: strings,
  conceptSlug: nullable(text),
  explanation: text,
  grading: optional(oneOf(['objective', 'self-assessed'])),
  exampleAnswer: optional(text),
});
const stageTest = object({
  id: text,
  phaseId: text,
  title: text,
  questions: array(question),
  status: oneOf([
    'not-started',
    'in-progress',
    'completed',
    'later',
    'skipped',
  ]),
  score: nullable(number),
  completedAt: nullable(text),
  weakConcepts: strings,
  incorrectQuestionIds: strings,
  addWeakToReview: flag,
  grades: optional(
    array(
      object({
        questionId: text,
        correct: nullable(flag),
        autoGraded: flag,
        selfAssessed: flag,
      }),
    ),
  ),
  hasUngradedQuestions: optional(flag),
  notGradable: optional(flag),
});
const task = object({
  id: text,
  phaseId: text,
  type: text,
  title: text,
  conceptSlug: nullable(text),
  description: text,
  category: nullable(category),
  difficulty: nullable(difficulty),
  estimatedMinutes: number,
  dueDate: text,
  order: number,
  status: taskStatus,
  isImportant: flag,
  completedAt: nullable(text),
  notes: text,
  targetSection: nullable(text),
  substeps: array(substep),
  resourceId: optional(nullable(text)),
  resourceUrl: optional(nullable(text)),
});
const phase = object({
  id: text,
  planId: text,
  title: text,
  description: text,
  order: number,
  targetDate: text,
  status: oneOf(['not-started', 'in-progress', 'completed', 'paused']),
  completionRate: number,
  mastered: flag,
  tasks: array(task),
  test: stageTest,
});
const plan = object({
  taskLayoutVersion: optional(literal(2)),
  id: text,
  title: text,
  goal: text,
  categories: array(category),
  method: oneOf(PLAN_METHODS.map((method) => method.value)),
  level: difficulty,
  startDate: text,
  targetDate: text,
  estimatedCompletionDate: text,
  weeklyMinutes: number,
  status: oneOf(['active', 'paused', 'completed']),
  activePhaseId: text,
  createdAt: text,
  updatedAt: text,
  includeCode: flag,
  includeTests: flag,
  includeReview: flag,
  includeResources: flag,
  completionRate: number,
  phases: array(phase),
  generationWarnings: strings,
  lastTaskId: nullable(text),
});

const dataValidator = object({
  learning: object({
    learned: strings,
    bookmarks: strings,
    recent: strings,
    practiced: strings,
    importantConcepts: strings,
    importantSections: stringArrays,
    notes: array(
      object({
        id: text,
        conceptSlug: text,
        sectionId: text,
        text,
        isImportant: flag,
        updatedAt: text,
      }),
    ),
    sortMode: oneOf(['difficulty-asc', 'difficulty-desc']),
  }),
  plans: object({
    version: literal(1),
    plans: array(plan),
    activities: array(
      object({
        id: text,
        planId: text,
        taskId: nullable(text),
        actionType: oneOf([
          'reading',
          'code',
          'test',
          'task',
          'plan-adjustment',
        ]),
        startedAt: text,
        completedAt: nullable(text),
        durationMinutes: number,
      }),
    ),
    reminder: object({
      activePlanId: nullable(text),
      lastStudyAt: nullable(text),
      lastStudyDate: nullable(text),
      lastOpenedAt: nullable(text),
      lastReminderDate: nullable(text),
      reminderDismissedDate: nullable(text),
    }),
    completedTaskIds: strings,
  }),
  resources: object({
    version: literal(1),
    viewedIds: strings,
    bookmarkIds: strings,
    notes: stringMap,
  }),
  theme: oneOf(['light', 'dark']),
});
const backupValidator = object({
  format: literal('how-to-learn-ai-progress'),
  version: literal(1),
  exportedAt: text,
  data: dataValidator,
});
export type ProgressBackup = ReturnType<typeof backupValidator>;

export function createProgressBackup(
  data: unknown,
  now = new Date(),
): ProgressBackup {
  return {
    format: 'how-to-learn-ai-progress',
    version: 1,
    exportedAt: now.toISOString(),
    data: dataValidator(data, '进度'),
  };
}
export function parseProgressBackup(raw: string): ProgressBackup {
  if (new TextEncoder().encode(raw).length > BACKUP_MAX_BYTES)
    throw new Error('文件超过 10 MB，请选择较小的进度备份。');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('无法读取 JSON。请选择本站导出的进度文件，原数据未修改。');
  }
  const backup = backupValidator(parsed, '进度');
  if (!Number.isFinite(Date.parse(backup.exportedAt))) invalid('导出时间');
  return backup;
}

/** All reads happen before writes; a failed write rolls back every earlier key. */
export function restoreProgressBackup(
  backup: ProgressBackup,
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
): void {
  const validated = backupValidator(backup, '进度');
  const entries = Object.entries(BACKUP_STORAGE_KEYS).map(([group, key]) => ({
    key,
    previous: storage.getItem(key),
    next: JSON.stringify(validated.data[group as keyof typeof validated.data]),
  }));
  const written: typeof entries = [];
  try {
    for (const entry of entries) {
      storage.setItem(entry.key, entry.next);
      written.push(entry);
    }
  } catch {
    let recovered = true;
    for (const entry of written.reverse()) {
      try {
        if (entry.previous === null) storage.removeItem(entry.key);
        else storage.setItem(entry.key, entry.previous);
      } catch {
        recovered = false;
      }
    }
    throw new Error(
      recovered
        ? '导入未能保存，已恢复原数据。请检查浏览器存储权限或空间后重试。'
        : '导入失败，部分数据未能恢复。请保留备份，检查浏览器存储权限或空间后重新导入。',
    );
  }
}
