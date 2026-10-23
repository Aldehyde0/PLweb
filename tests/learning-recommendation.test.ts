import assert from 'node:assert/strict';
import test from 'node:test';
import { recommendConcept } from '../lib/learning-recommendation.ts';

const concepts = [{ slug: 'first' }, { slug: 'second' }, { slug: 'third' }];
void test('continues the most recent unread concept, ignoring removed and learned entries', () => {
  assert.equal(
    recommendConcept(
      concepts,
      ['third'],
      ['removed', 'third', 'second', 'first'],
    )?.slug,
    'second',
  );
});
void test('new learners start at the first unread concept', () => {
  assert.equal(recommendConcept(concepts, [], [])?.slug, 'first');
  assert.equal(
    recommendConcept(concepts, ['first'], ['first'])?.slug,
    'second',
  );
});
void test('all learned concepts fall back to the first concept', () => {
  assert.equal(
    recommendConcept(
      concepts,
      concepts.map((item) => item.slug),
      ['third'],
    )?.slug,
    'first',
  );
  assert.equal(recommendConcept([], [], []), undefined);
});
