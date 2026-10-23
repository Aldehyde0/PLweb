import assert from 'node:assert/strict';
import test from 'node:test';
import {
  exerciseFilterSchema,
  resourceFilterSchema,
  readFilters,
  writeFilters,
  defaultFilters,
} from '../lib/filter-query.ts';

void test('exercise filters round-trip Chinese search text and page positions', () => {
  const params = writeFilters(new URLSearchParams(), exerciseFilterSchema, {
    category: 'machine-learning',
    difficulty: '入门',
    type: '计算',
    status: '未完成',
    query: '均值 & 方差',
    page: '2',
  });
  assert.deepEqual(readFilters(params, exerciseFilterSchema), {
    category: 'machine-learning',
    difficulty: '入门',
    type: '计算',
    status: '未完成',
    query: '均值 & 方差',
    page: '2',
  });
});
void test('invalid filter values and unsafe page numbers fall back to defaults', () => {
  for (const page of ['-1', '0', 'Infinity', '2x', '1.5', '9007199254740992']) {
    assert.deepEqual(
      readFilters(
        new URLSearchParams(
          `dir=unknown&level=unknown&type=unknown&status=unknown&page=${page}`,
        ),
        exerciseFilterSchema,
      ),
      defaultFilters(exerciseFilterSchema),
    );
  }
});
void test('default values disappear from URLs and clearing preserves unrelated parameters', () => {
  const params = writeFilters(
    new URLSearchParams('dir=machine-learning&q=test&page=3&ref=plan'),
    exerciseFilterSchema,
    defaultFilters(exerciseFilterSchema),
  );
  assert.equal(params.toString(), 'ref=plan');
});
void test('all resource filter controls round-trip and defaults stay absent', () => {
  const filters = {
    query: 'PyTorch',
    category: 'deep-learning',
    type: '官方文档',
    difficulty: '进阶',
    language: '英语',
    cost: 'free',
    recommendation: 'A',
    sort: 'updated',
  } as const;
  assert.deepEqual(
    readFilters(
      writeFilters(new URLSearchParams(), resourceFilterSchema, filters),
      resourceFilterSchema,
    ),
    filters,
  );
  assert.equal(
    writeFilters(
      new URLSearchParams(),
      resourceFilterSchema,
      defaultFilters(resourceFilterSchema),
    ).toString(),
    '',
  );
});
