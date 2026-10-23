import assert from 'node:assert/strict';
import test from 'node:test';
import { sortExercises } from '../lib/exercise-utils.ts';

void test('exercise order follows direction, difficulty, type and original order', () => {
  const items = [
    { id: 'dl', category: 'deep-learning', difficulty: '入门', type: '概念' },
    {
      id: 'hard',
      category: 'machine-learning',
      difficulty: '挑战',
      type: '概念',
    },
    {
      id: 'code',
      category: 'machine-learning',
      difficulty: '入门',
      type: '代码',
    },
    {
      id: 'first',
      category: 'machine-learning',
      difficulty: '入门',
      type: '概念',
    },
    {
      id: 'second',
      category: 'machine-learning',
      difficulty: '入门',
      type: '概念',
    },
    {
      id: 'calc',
      category: 'machine-learning',
      difficulty: '入门',
      type: '计算',
    },
    {
      id: 'project',
      category: 'machine-learning',
      difficulty: '入门',
      type: '项目',
    },
    {
      id: 'diagnose',
      category: 'machine-learning',
      difficulty: '入门',
      type: '诊断',
    },
  ];
  const before = structuredClone(items);
  const result = sortExercises(items, ['machine-learning', 'deep-learning']);
  assert.deepEqual(
    result.map((item) => item.id),
    ['first', 'second', 'calc', 'code', 'diagnose', 'project', 'hard', 'dl'],
  );
  assert.deepEqual(items, before);
  assert.equal(result.length, items.length);
  assert.deepEqual(sortExercises([], []), []);
});
