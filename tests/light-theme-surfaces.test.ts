import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readProjectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

void test('defines a warm reading surface without changing cold form controls', () => {
  const tokens = readProjectFile('tokens.css');

  assert.match(tokens, /--color-learning-surface:\s*oklch\(97% 0\.015 85\)/);
  assert.match(tokens, /--color-input-surface:\s*oklch\(99% 0\.004 258\)/);
});

void test('uses the learning surface for content cards while keeping code blocks dark', () => {
  const globals = readProjectFile('app/globals.css');
  const learning = readProjectFile('app/learning-features.css');
  const conceptCard = readProjectFile('components/concept-card.tsx');

  assert.match(globals, /\.definition-callout[\s\S]*var\(--color-learning-surface\)/);
  assert.match(learning, /\.note-card[\s\S]*var\(--color-learning-surface\)/);
  assert.match(conceptCard, /className="[^"]*concept-card/);
  assert.match(learning, /\.concept-card[\s\S]*var\(--color-learning-surface\)/);
  assert.doesNotMatch(globals, /\.code-figure\s*\{[^}]*color-learning-surface/);
});
