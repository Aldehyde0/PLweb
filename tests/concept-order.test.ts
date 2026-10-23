import assert from 'node:assert/strict';
import test from 'node:test';
import { getConceptNeighbors } from '../lib/concept-order.ts';

const items = [
  { slug: 'easy', category: 'ml', difficulty: '入门' },
  { slug: 'hard', category: 'ml', difficulty: '挑战' },
  { slug: 'middle', category: 'ml', difficulty: '进阶' },
  { slug: 'other', category: 'dl', difficulty: '入门' },
];
void test('concept navigation stays in the category and respects directory order and boundaries', () => {
  assert.deepEqual(getConceptNeighbors(items, items[2], [], 'difficulty-asc'), {
    previous: items[0],
    next: items[1],
  });
  assert.deepEqual(getConceptNeighbors(items, items[0], [], 'difficulty-asc'), {
    previous: null,
    next: items[2],
  });
  assert.deepEqual(getConceptNeighbors(items, items[1], [], 'difficulty-asc'), {
    previous: items[2],
    next: null,
  });
  assert.deepEqual(getConceptNeighbors(items, items[3], [], 'difficulty-asc'), {
    previous: null,
    next: null,
  });
});
void test('concept navigation follows bookmarked-first and descending directory settings', () => {
  assert.deepEqual(
    getConceptNeighbors(items, items[0], ['easy'], 'difficulty-desc'),
    { previous: null, next: items[1] },
  );
  assert.deepEqual(
    getConceptNeighbors(items, items[2], [], 'difficulty-desc'),
    { previous: items[1], next: items[0] },
  );
});
