import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';
import { exercises } from '../lib/exercises.ts';
import { additionalExercises } from '../lib/exercise-additions.ts';
import { additionalResources } from '../lib/resources-additions.ts';
import { learningResources, resourceCategories } from '../lib/resources.ts';

// The app uses extensionless relative imports; resolve its data modules in Node.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(
      specifier.startsWith('.') && !extname(specifier)
        ? specifier + '.ts'
        : specifier,
      context,
    );
  },
});
const { conceptMap } = await import('../lib/content.ts');
hooks.deregister();

void test('exercise expansion covers every direction and preserves unique practice IDs', () => {
  assert.equal(
    new Set(exercises.map((item) => item.id)).size,
    exercises.length,
  );
  assert.equal(
    new Set(exercises.map((item) => item.question.trim())).size,
    exercises.length,
  );
  for (const category of resourceCategories) {
    const items = additionalExercises.filter(
      (item) => item.category === category,
    );
    assert.ok(items.length >= 12, category);
    assert.ok(
      items.some((item) => item.type === '计算'),
      category,
    );
    assert.ok(
      items.some((item) => item.type === '诊断'),
      category,
    );
    assert.ok(
      items.some((item) => item.type === '项目'),
      category,
    );
  }
});

void test('new exercises have valid learning links, substantive answers and public provenance', () => {
  for (const item of additionalExercises) {
    assert.ok(conceptMap[item.conceptSlug], item.id + ': missing concept');
    assert.equal(conceptMap[item.conceptSlug].category, item.category, item.id);
    assert.ok(item.question.length >= 20 && item.answer.length >= 35, item.id);
    assert.ok(item.tags.length >= 2, item.id);
    assert.equal(new URL(item.sourceUrl!).protocol, 'https:', item.id);
    assert.match(item.source, /本站原创练习/, item.id);
    assert.doesNotMatch(
      item.source,
      /[A-Z]:[\\/]|学习资料\/|Users[\\/]/,
      item.id,
    );
  }
});

void test('new resources have valid concept links and no duplicate URLs', () => {
  const urls = learningResources.map((item) =>
    new URL(item.url).href.replace(/\/$/, ''),
  );
  assert.equal(new Set(urls).size, urls.length);
  for (const category of resourceCategories) {
    assert.ok(
      additionalResources.filter((item) => item.category === category).length >=
        6,
    );
  }
  for (const item of additionalResources) {
    for (const slug of item.conceptSlugs) {
      assert.ok(conceptMap[slug], item.id + ': ' + slug);
      assert.equal(
        conceptMap[slug].category,
        item.category,
        item.id + ': ' + slug,
      );
    }
  }
});
void test('all exercise sources omit local directory metadata', () => {
  for (const item of exercises) {
    assert.doesNotMatch(
      item.source,
      /learning_tech\s*\/|deeplearning\s*\/|[A-Z]:[\\/]|学习资料[\\/]|Users[\\/]/,
      item.id,
    );
    assert.ok(conceptMap[item.conceptSlug], item.id + ': missing concept');
  }
});
