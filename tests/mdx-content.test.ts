import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { articleLoaders } from '../lib/generated/mdx-registry.ts';
import { planConcepts } from '../lib/plan-content.ts';
import { contentIndex } from '../lib/content-index.ts';
import { generatePlan } from '../lib/plan-engine.ts';
import {
  parseArticle,
  validateArticles,
  compileArticle,
} from '../scripts/mdx-pipeline.mjs';
const source = `---
id: sample
slug: sample
title: 示例
category: machine-learning
difficulty: 入门
summary: 测试正文
prerequisites: []
relatedConcepts: []
order: 1
directory: 入门与数学基础
---
## 定义 {#definition}

普通 **Markdown**，公式 $x^2$。

## 代码 {#code}

\`\`\`python
print(1)
\`\`\`
`;
void test('ordinary Markdown yields searchable content and stable sections without JSX', async () => {
  const article = parseArticle(source, 'sample.mdx');
  assert.deepEqual(
    article.sections.map((x) => x.id),
    ['definition', 'code'],
  );
  assert.match(article.searchText, /普通 Markdown/);
  assert.equal(article.longForm.codeExamples[0].source, 'print(1)');
  const compiled = await compileArticle(source, 'sample.mdx');
  assert.match(String(compiled), /ArticleSection/);
  assert.match(String(compiled), /InlineMath/);
  const windowsSource = source.replaceAll('\n', '\r\n');
  assert.deepEqual(
    parseArticle(windowsSource, 'windows.mdx').concept,
    article.concept,
  );
  await compileArticle(windowsSource, 'windows.mdx');
});
void test('invalid metadata, duplicate identities and dangling internal references fail clearly', () => {
  assert.throws(
    () => parseArticle(source.replace('title: 示例\n', ''), 'bad.mdx'),
    /bad.mdx.*title/,
  );
  const a = parseArticle(source, 'sample.mdx');
  assert.throws(() => validateArticles([a, a]), /重复.*(ID|slug)/);
  const b = parseArticle(
    source.replace('prerequisites: []', 'prerequisites: [missing-concept]'),
    'bad-ref.mdx',
  );
  assert.throws(() => validateArticles([b]), /missing-concept/);
  assert.throws(
    () => parseArticle(source + '\n## 重复 {#definition}\n', 'duplicate.mdx'),
    /重复.*definition/,
  );
});
void test('MDX syntax errors and unsupported demo mappings cannot silently pass', async () => {
  await assert.rejects(
    () => compileArticle(source + '\n<Broken>\n', 'broken.mdx'),
    /broken.mdx/,
  );
  await assert.rejects(
    () => compileArticle(source + '\n<UnknownDemo />\n', 'unknown.mdx'),
    /UnknownDemo/,
  );
  await assert.rejects(
    () =>
      compileArticle(
        source + '\n<AIInteractiveDemo kind="typo" />\n',
        'bad-kind.mdx',
      ),
    /bad-kind.mdx.*kind/,
  );
});
void test('malformed structured fields cannot silently discard content', () => {
  assert.throws(
    () =>
      parseArticle(
        source + '\n:::field{path="pitfalls" type="list"}\n不是列表\n:::\n',
        'bad-list.mdx',
      ),
    /pitfalls.*列表/,
  );
  assert.throws(
    () =>
      parseArticle(
        source + '\n:::field{path="title" type="text"}\n覆盖标题\n:::\n',
        'bad-field.mdx',
      ),
    /frontmatter/,
  );
  const duplicate = parseArticle(
    source.replace('id: sample', 'id: another'),
    'another.mdx',
  );
  assert.throws(
    () => validateArticles([parseArticle(source, 'sample.mdx'), duplicate]),
    /重复 slug/,
  );
});
void test('the copyable template compiles with no JSX or structured field directives', async () => {
  const template = readFileSync(
    new URL('../content/templates/article.mdx', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(template, /<[A-Z]/);
  const a = parseArticle(template, 'template.mdx');
  assert.equal(a.longForm.codeExamples[0].source.includes('print'), true);
  assert.ok(a.longForm.formulas.length);
  const compiled = String(await compileArticle(template, 'template.mdx'));
  assert.match(compiled, /ConceptPrerequisites/);
  assert.match(compiled, /ConceptRelated/);
});
void test('every discovered concept MDX compiles and has exactly one registered route', async () => {
  const root = new URL('../content/concepts/', import.meta.url);
  const files = readdirSync(root, { recursive: true }).filter(
    (name): name is string => typeof name === 'string' && name.endsWith('.mdx'),
  );
  const slugs = [];
  for (const file of files) {
    const path = join(root.pathname.replace(/^\/([A-Z]:)/i, '$1'), file);
    const text = readFileSync(path, 'utf8');
    const a = parseArticle(text, file);
    slugs.push(a.metadata.slug);
    await compileArticle(text, file);
  }
  assert.deepEqual(
    slugs.sort((a, b) => a.localeCompare(b)),
    Object.keys(articleLoaders).sort((a, b) => a.localeCompare(b)),
  );
});
void test('all four generated plans and their stage tests use the complete MDX catalog', () => {
  assert.equal(planConcepts.length, Object.keys(contentIndex).length);
  for (const category of [
    'artificial-intelligence',
    'machine-learning',
    'deep-learning',
    'reinforcement-learning',
  ] as const) {
    const plan = generatePlan(
      {
        title: '迁移数据验证',
        goal: '保留全部概念',
        categories: [category],
        method: 'knowledge-route',
        level: '入门',
        weeklyMinutes: 300,
        targetDate: '2026-12-25',
        includeCode: true,
        includeTests: true,
        includeReview: true,
        includeResources: true,
      },
      planConcepts,
      { learned: [], bookmarks: [] },
      new Date('2026-10-25T02:00:00Z'),
    );
    const tasks = plan.phases.flatMap((phase) => phase.tasks);
    for (const concept of planConcepts.filter((c) => c.category === category))
      assert.ok(
        tasks.some((task) => task.conceptSlug === concept.slug),
        `${category}: missing ${concept.slug}`,
      );
    for (const phase of plan.phases) {
      assert.ok(phase.test.questions.length > 0);
      for (const q of phase.test.questions) {
        assert.ok(q.prompt && q.explanation);
        assert.ok(!q.conceptSlug || contentIndex[q.conceptSlug]);
      }
    }
  }
});
