import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * `lib/browser-storage.ts` reads `window.localStorage` lazily on every call, so a
 * minimal fake window is enough to exercise the real module in Node — including
 * the failure modes that matter in a browser (blocked storage, quota errors and
 * corrupt JSON).
 */
interface FakeWindow {
  localStorage: FakeStorage;
  sessionStorage: FakeStorage;
}

class FakeStorage {
  readonly items = new Map<string, string>();
  /** When set, every read/write throws with this error. */
  failure: Error | null = null;

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) this.items.set(key, value);
  }

  getItem(key: string) {
    if (this.failure) throw this.failure;
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    if (this.failure) throw this.failure;
    this.items.set(key, value);
  }

  removeItem(key: string) {
    if (this.failure) throw this.failure;
    this.items.delete(key);
  }
}

function installWindow(options: {
  local?: FakeStorage;
  session?: FakeStorage;
  throwOnAccess?: Error;
}): FakeWindow {
  const local = options.local ?? new FakeStorage();
  const session = options.session ?? new FakeStorage();
  const fake = {
    get localStorage() {
      if (options.throwOnAccess) throw options.throwOnAccess;
      return local;
    },
    get sessionStorage() {
      if (options.throwOnAccess) throw options.throwOnAccess;
      return session;
    },
  };
  (globalThis as { window?: unknown }).window = fake;
  return { localStorage: local, sessionStorage: session };
}

function clearWindow() {
  delete (globalThis as { window?: unknown }).window;
}

const {
  classifyStorageError,
  readStored,
  removeStored,
  storageProblemMessage,
  writeStored,
  asStringArray,
  asStringRecord,
  asRecordOfStringArrays,
} = await import('../lib/browser-storage.ts');

const quotaError = () => {
  const error = new Error('quota');
  error.name = 'QuotaExceededError';
  return error;
};
const securityError = () => {
  const error = new Error('blocked');
  error.name = 'SecurityError';
  return error;
};

void test('classifyStorageError maps the browser error names that matter', () => {
  assert.equal(classifyStorageError(quotaError()), 'quota-exceeded');
  assert.equal(classifyStorageError(securityError()), 'unavailable');
  const reachedQuota = new Error('full');
  reachedQuota.name = 'NS_ERROR_DOM_QUOTA_REACHED';
  assert.equal(classifyStorageError(reachedQuota), 'quota-exceeded');
  assert.equal(classifyStorageError(new Error('other')), 'write-failed');
  assert.equal(classifyStorageError(null), 'write-failed');
  assert.equal(classifyStorageError('nope'), 'write-failed');
});

void test('every storage problem has a user-facing message', () => {
  for (const problem of [
    'unavailable',
    'read-failed',
    'write-failed',
    'quota-exceeded',
    'corrupt',
  ] as const) {
    const message = storageProblemMessage(problem);
    assert.equal(typeof message, 'string');
    assert.ok(message.length > 4, `no message for ${problem}`);
  }
});

void test('readStored reports empty, ok, recovered, corrupt and unavailable', () => {
  const { localStorage } = installWindow({});
  try {
    assert.equal(readStored('local', 'missing', (value) => value).status, 'empty');

    localStorage.setItem('ok', JSON.stringify({ a: 1 }));
    const ok = readStored('local', 'ok', (value) => value);
    assert.equal(ok.status, 'ok');
    assert.deepEqual(ok.value, { a: 1 });

    localStorage.setItem('partial', JSON.stringify({ a: 1, b: 'bad' }));
    const recovered = readStored('local', 'partial', (value) => {
      const source = value as { a: number; b: unknown };
      if (typeof source.b !== 'number')
        return { value: { a: source.a }, recovered: true as const };
      return { a: source.a, b: source.b };
    });
    assert.equal(recovered.status, 'recovered');
    assert.deepEqual(recovered.value, { a: 1 });

    localStorage.setItem('broken', '{not json');
    const corrupt = readStored('local', 'broken', (value) => value);
    assert.equal(corrupt.status, 'corrupt');
    assert.equal(corrupt.value, null);
    assert.equal(
      localStorage.getItem('broken'),
      '{not json',
      'a corrupt record must be left on disk so the learner can recover it',
    );

    localStorage.setItem('unusable', JSON.stringify({ a: 1 }));
    const rejected = readStored('local', 'unusable', () => {
      throw new Error('shape is wrong');
    });
    assert.equal(rejected.status, 'corrupt');
  } finally {
    clearWindow();
  }
});

void test('readStored reports unavailable when storage access throws', () => {
  installWindow({ throwOnAccess: securityError() });
  try {
    const outcome = readStored('local', 'anything', (value) => value);
    assert.equal(outcome.status, 'unavailable');
    assert.equal(outcome.value, null);
    assert.equal(writeStored('local', 'anything', { a: 1 }).ok, false);
    assert.equal(removeStored('local', 'anything').ok, false);
  } finally {
    clearWindow();
  }
});

void test('writeStored reports quota exhaustion instead of losing the change silently', () => {
  const { localStorage } = installWindow({});
  try {
    localStorage.failure = quotaError();
    const outcome = writeStored('local', 'plans', { a: 1 });
    assert.equal(outcome.ok, false);
    if (!outcome.ok) assert.equal(outcome.problem, 'quota-exceeded');

    localStorage.failure = null;
    const ok = writeStored('local', 'plans', { a: 1 });
    assert.equal(ok.ok, true);
    assert.deepEqual(JSON.parse(localStorage.getItem('plans')!), { a: 1 });
  } finally {
    clearWindow();
  }
});

void test('writeStored reports failure when the value cannot be serialized', () => {
  installWindow({});
  try {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const outcome = writeStored('local', 'cyclic', cyclic);
    assert.equal(outcome.ok, false);
    if (!outcome.ok) assert.equal(outcome.problem, 'write-failed');
  } finally {
    clearWindow();
  }
});

void test('writeStored and readStored work without a window (server render)', () => {
  clearWindow();
  assert.equal(readStored('local', 'x', (value) => value).status, 'unavailable');
  assert.equal(writeStored('local', 'x', 1).ok, false);
  assert.equal(removeStored('session', 'x').ok, false);
});

void test('session storage failures are isolated from local storage', () => {
  const { sessionStorage } = installWindow({});
  try {
    sessionStorage.failure = securityError();
    const outcome = writeStored('session', 'history', { items: [] });
    assert.equal(outcome.ok, false);
    if (!outcome.ok) assert.equal(outcome.problem, 'unavailable');
    assert.equal(writeStored('local', 'history', { items: [] }).ok, true);
  } finally {
    clearWindow();
  }
});

void test('validators keep good fields and drop only the broken ones', () => {
  assert.deepEqual(asStringArray(['a', 1, null, 'b']), ['a', 'b']);
  assert.equal(asStringArray('nope'), null);
  assert.deepEqual(asStringRecord({ a: 'x', b: 2, c: 'y' }), { a: 'x', c: 'y' });
  assert.equal(asStringRecord(['a']), null);
  assert.deepEqual(asRecordOfStringArrays({ s: ['a', 1], t: 'no' }), { s: ['a'] });
  assert.equal(asRecordOfStringArrays(null), null);
});
