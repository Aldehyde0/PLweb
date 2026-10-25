import assert from 'node:assert/strict';
import test from 'node:test';
import { parseArticle, validateArticles, compileArticle } from '../scripts/mdx-pipeline.mjs';
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
 assert.deepEqual(article.sections.map(x=>x.id), ['definition','code']);
 assert.match(article.searchText, /普通 Markdown/);
 assert.equal(article.longForm.codeExamples[0].source, 'print(1)');
 const compiled = await compileArticle(source, 'sample.mdx');
 assert.match(String(compiled), /ArticleSection/);
 assert.match(String(compiled), /InlineMath/);
});
void test('invalid metadata, duplicate identities and dangling internal references fail clearly', () => {
 assert.throws(()=>parseArticle(source.replace('title: 示例\n',''), 'bad.mdx'), /bad.mdx.*title/);
 const a=parseArticle(source,'sample.mdx');
 assert.throws(()=>validateArticles([a,a]), /重复.*(ID|slug)/);
 const b=parseArticle(source.replace('prerequisites: []','prerequisites: [missing-concept]'),'bad-ref.mdx');
 assert.throws(()=>validateArticles([b]), /missing-concept/);
 assert.throws(()=>parseArticle(source+'\n## 重复 {#definition}\n','duplicate.mdx'), /重复.*definition/);
});
void test('MDX syntax errors and unsupported demo mappings cannot silently pass', async () => {
 await assert.rejects(()=>compileArticle(source+'\n<Broken>\n','broken.mdx'), /broken.mdx/);
 await assert.rejects(()=>compileArticle(source+'\n<UnknownDemo />\n','unknown.mdx'), /UnknownDemo/);
});
