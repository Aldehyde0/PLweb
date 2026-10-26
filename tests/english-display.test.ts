import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { conceptNames, englishConceptName } from '../lib/english-display.ts';

void test('every existing concept has an intentional English display name', () => {
  const index = JSON.parse(
    readFileSync(
      new URL('../lib/generated/content-index.json', import.meta.url),
      'utf8',
    ),
  );
  for (const [slug, entry] of Object.entries(index)) {
    const concept = (entry as { concept: { slug: string; category: string } })
      .concept;
    assert.ok(conceptNames[slug], `Missing English display name: ${slug}`);
    assert.doesNotMatch(englishConceptName(concept), /\p{Script=Han}/u);
  }
});

void test('newly authored concepts keep an English homepage fallback', () => {
  assert.equal(
    englishConceptName({ slug: 'new-article', category: 'machine-learning' }),
    'New concept in machine learning',
  );
});
