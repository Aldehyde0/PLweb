import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { parseArticle } from './mdx-pipeline.mjs';
import { concepts } from '../lib/content.ts';
import {
  directoryConcepts,
  conceptDirectory,
} from '../lib/category-directory.ts';
const baseline = JSON.parse(
  readFileSync('outputs/mdx-migration/baseline.json', 'utf8'),
);
const canonical = (value) =>
  JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort((a, b) => a.localeCompare(b))
            .map((k) => [k, v[k]]),
        )
      : v,
  );
const hash = (value) =>
  createHash('sha256').update(canonical(value)).digest('hex');
const leaves = (v, path = '', out = {}) => {
  if (v && typeof v === 'object' && Object.keys(v).length)
    for (const [k, value] of Object.entries(v))
      leaves(value, path ? `${path}.${k}` : k, out);
  else out[path] = hash(v);
  return out;
};
assert.deepEqual(
  concepts,
  baseline.concepts,
  '全部最终 Concept 必须逐字段一致',
);
assert.deepEqual(
  directoryConcepts([...concepts]).map((c) => c.slug),
  baseline.directory,
  '目录与计划顺序',
);
const entries = [];
for (const [order, c] of baseline.concepts.entries()) {
  const file = `content/concepts/${c.category}/${c.slug}.mdx`;
  const a = parseArticle(readFileSync(file, 'utf8'), file);
  assert.deepEqual(a.concept, c, `${c.slug} concept`);
  if (baseline.longFormMap[c.slug])
    assert.deepEqual(
      a.longForm,
      baseline.longFormMap[c.slug],
      `${c.slug} longForm`,
    );
  assert.equal(a.metadata.order, order);
  assert.equal(conceptDirectory(c), baseline.groups[c.slug]);
  for (const section of baseline.sections[c.slug])
    assert.ok(
      a.sections.some((s) => s.id === section.id) ||
        Object.hasOwn(a.metadata.anchorAliases ?? {}, section.id),
      `${c.slug} 丢失锚点 ${section.id}`,
    );
  const object = a.longForm ?? a.concept;
  entries.push({
    id: c.id,
    slug: c.slug,
    category: c.category,
    difficulty: c.difficulty,
    order,
    directory: baseline.groups[c.slug],
    file,
    contributors: Object.entries(baseline.sourceLayers ?? {})
      .filter(([, items]) => items.some((item) => item.slug === c.slug))
      .map(([source]) => source),
    prerequisites: c.prerequisites,
    relatedConcepts: c.relatedConcepts,
    sections: a.sections,
    anchorAliases: a.metadata.anchorAliases ?? {},
    conceptHash: hash(c),
    longFormHash: a.longForm ? hash(a.longForm) : null,
    fieldHashes: leaves(object),
    formulas: object.formulas?.length ?? 1,
    codeExamples: object.codeExamples?.length ?? 1,
    demos: a.demos.map((d) => ({
      name: d.name,
      kind: d.attributes.find((x) => x.name === 'kind')?.value,
    })),
    status: 'equal',
  });
}
const report = {
  baselineRevision: '48cbd50',
  concepts: concepts.length,
  longForms: Object.keys(baseline.longFormMap).length,
  legacy: concepts.length - Object.keys(baseline.longFormMap).length,
  categories: Object.fromEntries(
    baseline.categories.map((c) => [
      c.slug,
      concepts.filter((x) => x.category === c.slug).length,
    ]),
  ),
  fieldChecks: entries.reduce(
    (s, e) => s + Object.keys(e.fieldHashes).length,
    0,
  ),
  sourceLayers: Object.fromEntries(
    Object.entries(baseline.sourceLayers ?? {}).map(([s, items]) => [
      s,
      items.length,
    ]),
  ),
  entries,
};
mkdirSync('migration', { recursive: true });
writeFileSync(
  'migration/content-manifest.json',
  JSON.stringify(report, null, 2) + '\n',
);
writeFileSync(
  'migration/CONTENT_MIGRATION_REPORT.md',
  `# Layerwise MDX 迁移核对\n\n基准提交：48cbd50。${report.concepts} 篇，${report.longForms} 篇长文、${report.legacy} 篇旧式正文。逐字段比较全部一致，共 ${report.fieldChecks} 个叶字段校验。\n\n| 方向 | 数量 |\n| --- | ---: |\n${Object.entries(
    report.categories,
  )
    .map(([k, n]) => `| ${k} | ${n} |`)
    .join(
      '\n',
    )}\n\n## 合并依据\n\n- base → expanded → document：同 slug 后者完整替换前者，不是浅层合并。\n- document 内 AI 先 applyAICodeOverrides，再派生 Concept。\n- 长文的完整字段与最终 Concept 均做 deepStrictEqual；目录分组及排序单独比较。\n- AI/DL/RL 专属章节、数值示例、公式变量、代码解释、预期输出、演示映射及来源字段均包含在逐字段比较中。\n- 来源元数据保留在 MDX 中；来源 UI 改为隐藏锚点别名，不恢复来源章节。\n\n每篇文件、原始来源层、顺序、引用、稳定锚点及 SHA-256 可查同目录 content-manifest.json。清单仅作审计，不作为应用内容来源。\n\n## 复现\n\nnpm run content:audit-migration 从 Git 读取基准提交，写入忽略的 outputs/mdx-migration/baseline.json，再与 MDX 数据比较；不切换工作目录、不恢复旧正文到应用。node scripts/migrate-content.mjs 可再次导出，默认拒绝覆盖已有文件。迁移验收后有意修改教学内容时，历史哈希会变化；日常使用 npm run content:check。\n\n## 旧体系\n\n旧正文数组、构造器和 AI 代码覆盖表已移除。lib/content.ts、long-form-content.ts、ai-long-form.ts、rl-long-form.ts 只导出 MDX 生成数据；content-base.ts 和 long-form-core.ts 保留类型及分类元数据。旧正文可以从 Git 基准完整恢复。\n\n资源库四处旧引用经公共别名接入现有文章：mcp-architecture → mcp-client-server；mcp-server → local-mcp-server；mcp-tools-resources-prompts → mcp-client-server；value-q-function → value-functions。原资源对象未改写。\n`,
);
console.log(
  `PASS ${report.concepts} articles; ${report.fieldChecks} fields; identities, order, directories, references and anchors unchanged`,
);
