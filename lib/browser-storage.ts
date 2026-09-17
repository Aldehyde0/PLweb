/**
 * Defensive browser-storage helpers.
 *
 * Learning data lives only in this browser, so a failed read or write must never
 * be silent: the UI has to tell the learner that the current edit was not saved.
 * In private mode, with storage disabled by policy, or after a quota error,
 * `localStorage`/`sessionStorage` property access itself can throw, which is why
 * every access goes through these helpers.
 */

export type StorageArea = 'local' | 'session';

export type StorageProblem =
  | 'unavailable'
  | 'read-failed'
  | 'write-failed'
  | 'quota-exceeded'
  | 'corrupt';

export type ReadOutcome<T> =
  | { status: 'empty'; value: null }
  | { status: 'ok'; value: T }
  /** Part of the record was unusable; the salvaged fields are kept. */
  | { status: 'recovered'; value: T }
  /** Nothing could be parsed. The stored text is left untouched. */
  | { status: 'corrupt'; value: null }
  /** The storage area itself is unreachable. */
  | { status: 'unavailable'; value: null };

export type WriteOutcome =
  | { ok: true }
  | { ok: false; problem: StorageProblem };

function area(which: StorageArea): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const store = which === 'local' ? window.localStorage : window.sessionStorage;
    return store ?? null;
  } catch {
    // Accessing the property throws when storage is blocked by policy.
    return null;
  }
}

export function classifyStorageError(error: unknown): StorageProblem {
  const name =
    error && typeof error === 'object' && 'name' in error
      ? String((error as { name?: unknown }).name)
      : '';
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED')
    return 'quota-exceeded';
  if (name === 'SecurityError') return 'unavailable';
  return 'write-failed';
}

/**
 * Reads and validates a stored record.
 * `validate` receives the parsed value and returns either the accepted value or
 * `{ value, recovered: true }` when only part of the record was usable. Throwing
 * from `validate` means the record is unusable; it is then left on disk so the
 * learner can still recover it manually.
 */
export function readStored<T>(
  which: StorageArea,
  key: string,
  validate: (parsed: unknown) => T | { value: T; recovered: true },
): ReadOutcome<T> {
  const store = area(which);
  if (!store) return { status: 'unavailable', value: null };
  let raw: string | null;
  try {
    raw = store.getItem(key);
  } catch {
    return { status: 'unavailable', value: null };
  }
  if (raw === null || raw === '') return { status: 'empty', value: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'corrupt', value: null };
  }
  try {
    const result = validate(parsed);
    if (result && typeof result === 'object' && 'recovered' in result)
      return { status: 'recovered', value: result.value };
    return { status: 'ok', value: result as T };
  } catch {
    return { status: 'corrupt', value: null };
  }
}

export function writeStored(
  which: StorageArea,
  key: string,
  value: unknown,
): WriteOutcome {
  const store = area(which);
  if (!store) return { ok: false, problem: 'unavailable' };
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return { ok: false, problem: 'write-failed' };
  }
  try {
    store.setItem(key, serialized);
    return { ok: true };
  } catch (error) {
    return { ok: false, problem: classifyStorageError(error) };
  }
}

export function removeStored(which: StorageArea, key: string): WriteOutcome {
  const store = area(which);
  if (!store) return { ok: false, problem: 'unavailable' };
  try {
    store.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, problem: classifyStorageError(error) };
  }
}

export function storageProblemMessage(problem: StorageProblem): string {
  return (
    {
      unavailable:
        '当前浏览器不允许使用本地存储（可能是隐私模式或站点权限限制）',
      'read-failed': '读取本地学习数据失败',
      'write-failed': '写入本地学习数据失败',
      'quota-exceeded': '浏览器本地存储空间已满',
      corrupt: '本地学习数据格式异常，已保留原数据未覆盖',
    } as const
  )[problem];
}

// ---------------------------------------------------------------- validators

export function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === 'string');
}

export function asRecordOfStringArrays(
  value: unknown,
): Record<string, string[]> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result: Record<string, string[]> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const list = asStringArray(item);
    if (list) result[key] = list;
  }
  return result;
}

export function asStringRecord(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === 'string') result[key] = item;
  }
  return result;
}
