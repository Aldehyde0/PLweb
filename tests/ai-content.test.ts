import assert from 'node:assert/strict';
import test from 'node:test';
import { aiLongForms } from '../lib/ai-long-form.ts';
import { applyAICodeOverrides } from '../lib/ai-code-overrides.ts';
import { getLongFormSections } from '../lib/section-utils.ts';
const items = applyAICodeOverrides(structuredClone(aiLongForms));
void test('AI foundations explain concepts without injected formulas or code', () => {
  for (const slug of ['ai-overview', 'ai-history', 'ai-ml-dl-relationship', 'symbolic-connectionist-behaviorist']) {
    const item = items.find(item => item.slug === slug)!;
    assert.equal(item.formulas.length, 0, slug);
    assert.equal(item.codeExamples.length, 0, slug);
    assert.equal(item.numericalExample, undefined, slug);
    assert.equal(item.variableDefinitions.length, 0, slug);
    const ids = getLongFormSections(item).map(section => section.id);
    assert.ok(!ids.includes('formulas') && !ids.includes('variables') && !ids.includes('code'), slug);
  }
});
void test('AI formulas appear at most twice and the reliability example has one home', () => {
  const counts = new Map<string, number>();
  for (const item of items) for (const formula of item.formulas) {
    counts.set(formula.expression, (counts.get(formula.expression) ?? 0) + 1);
  }
  assert.ok([...counts.values()].every(count => count <= 2));
  assert.deepEqual(items.filter(item => item.numericalExample).map(item => item.slug), ['agent-reliability']);
});
void test('AI code is topic-specific rather than a repeated default loop', () => {
  const code = items.flatMap(item => item.codeExamples.map(example => example.source.trim()));
  assert.equal(new Set(code).size, code.length);
  assert.ok(items.find(item => item.slug === 'agent-loop')!.codeExamples.length > 0);
  assert.ok(items.find(item => item.slug === 'function-calling')!.codeExamples.length > 0);
});
void test('all existing AI routes remain and boilerplate prose is removed', () => {
  assert.equal(items.length, 35);
  assert.equal(new Set(items.map(item => item.slug)).size, 35);
  assert.ok(items.every(item => item.definition.length && item.corePrinciple.length));
  assert.ok(items.every(item => !item.definition.some(text => text.includes('不是一个孤立名词'))));
});