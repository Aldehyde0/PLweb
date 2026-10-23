import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createProgressBackup,
  parseProgressBackup,
  restoreProgressBackup,
  BACKUP_STORAGE_KEYS,
  type ProgressBackup,
} from '../lib/progress-backup.ts';
import { generatePlan, migratePlanState } from '../lib/plan-engine.ts';

const learning = {
  learned: ['gradient-descent'],
  bookmarks: [],
  recent: ['gradient-descent'],
  practiced: ['ml-task-type'],
  importantConcepts: [],
  importantSections: { 'gradient-descent': ['definition'] },
  notes: [
    {
      id: 'note',
      conceptSlug: 'gradient-descent',
      sectionId: 'general',
      text: '<script>literal note</script>',
      isImportant: false,
      updatedAt: '2026-10-23T00:00:00.000Z',
    },
  ],
  sortMode: 'difficulty-asc',
};
const data = () => ({
  learning: structuredClone(learning),
  plans: migratePlanState(null),
  resources: {
    version: 1,
    viewedIds: ['doc'],
    bookmarkIds: [],
    notes: { doc: '笔记' },
  },
  theme: 'dark',
});

void test('backup round-trips only the four allowed data groups', () => {
  const source = { ...data(), unrelatedToken: 'must not export' };
  const backup = createProgressBackup(source);
  assert.deepEqual(parseProgressBackup(JSON.stringify(backup)), backup);
  assert.equal(JSON.stringify(backup).includes('must not export'), false);
  assert.equal(backup.data.learning.notes[0].text, learning.notes[0].text);
});
void test('backup rejects malformed JSON, unknown versions and broken nested records without salvaging them', () => {
  assert.throws(() => parseProgressBackup('{'), /JSON/);
  for (const mutate of [
    (b: ProgressBackup) => {
      Reflect.set(b, 'version', 99);
    },
    (b: ProgressBackup) => {
      Reflect.set(b.data.resources, 'version', 99);
    },
    (b: ProgressBackup) => {
      Reflect.set(b.data.plans, 'version', 99);
    },
    (b: ProgressBackup) => {
      Reflect.set(b.data.learning, 'learned', ['valid', 42]);
    },
    (b: ProgressBackup) => {
      Reflect.set(b.data.learning.notes[0], 'text', {});
    },
    (b: ProgressBackup) => {
      Reflect.set(b.data, 'theme', 'unknown');
    },
    (b: ProgressBackup) => {
      Reflect.deleteProperty(b.data, 'plans');
    },
  ]) {
    const backup = createProgressBackup(data());
    mutate(backup);
    assert.throws(() => parseProgressBackup(JSON.stringify(backup)));
  }
});
void test('generated plans with phases and questions survive export and import', () => {
  const source = data();
  const plan = generatePlan(
    {
      title: '备份计划',
      goal: '复习',
      categories: ['machine-learning'],
      method: 'knowledge-route',
      level: '入门',
      weeklyMinutes: 60,
      targetDate: '2027-01-01',
      includeCode: true,
      includeTests: true,
      includeReview: true,
    },
    [
      {
        slug: 'gradient-descent',
        title: '梯度下降',
        category: 'machine-learning',
        difficulty: '入门',
        prerequisites: [],
        hasCode: true,
        hasInteractive: false,
      },
    ],
    learning,
  );
  source.plans.plans = [plan];
  const backup = createProgressBackup(source);
  assert.deepEqual(
    parseProgressBackup(JSON.stringify(backup)).data.plans,
    source.plans,
  );
  const broken = structuredClone(backup);
  Reflect.set(broken.data.plans.plans[0].phases[0].tasks[0], 'substeps', [
    null,
  ]);
  assert.throws(() => parseProgressBackup(JSON.stringify(broken)));
});
void test('restore writes only allowed keys and rolls all changes back on write failure', () => {
  const original = new Map<string, string>(
    Object.values(BACKUP_STORAGE_KEYS).map((key) => [key, 'old']),
  );
  original.set('unrelated', 'untouched');
  const values = new Map(original);
  let writes = 0;
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (++writes === 2) throw new Error('quota');
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  assert.throws(
    () => restoreProgressBackup(createProgressBackup(data()), storage),
    /已恢复/,
  );
  assert.deepEqual(values, original);
  restoreProgressBackup(createProgressBackup(data()), storage);
  assert.equal(values.get('unrelated'), 'untouched');
  assert.equal(values.get(BACKUP_STORAGE_KEYS.theme), '"dark"');
});
