/** Check the complete authoring corpus, not just the selected enrichment batch. */
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parseArticle } from './mdx-pipeline.mjs';

const output = 'outputs/content-library-review';
mkdirSync(output, { recursive: true });
const savedReview = JSON.parse(
  readFileSync('content/reviews/library-2026-10-26.json', 'utf8'),
);
const before =
  !process.argv.includes('--saved-review') &&
  existsSync(`${output}/before.json`)
    ? JSON.parse(readFileSync(`${output}/before.json`, 'utf8'))
    : savedReview.baseline;
const hashText = (value) => createHash('sha256').update(value).digest('hex');
const manifests = [
  'ai-review.json',
  'dl-review.json',
  'rl-review.json',
  'ml-review.json',
  'ml-ai-review.json',
  'ml-dl-review.json',
  'ml-rl-review.json',
  'ml-project-review.json',
];
const reviewed = new Map();
for (const name of manifests) {
  if (process.argv.includes('--saved-review')) break;
  if (!existsSync(`${output}/${name}`)) continue;
  const value = JSON.parse(readFileSync(`${output}/${name}`, 'utf8'));
  for (const row of Array.isArray(value) ? value : value.articles) {
    assert.ok(
      !reviewed.has(row.slug),
      `Conflicting review owners: ${row.slug}`,
    );
    reviewed.set(row.slug, { ...row, evidence: name });
  }
}
for (const row of savedReview.articles)
  if (!reviewed.has(row.slug))
    reviewed.set(row.slug, {
      ...row,
      evidence: 'content/reviews/library-2026-10-26.json',
    });
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : entry.name.endsWith('.mdx')
        ? [join(dir, entry.name)]
        : [],
  );
const failures = [],
  articles = [],
  examples = [],
  paragraphOwners = new Map();
function outputFence(tree, path) {
  if (
    tree.type === 'containerDirective' &&
    tree.name === 'field' &&
    tree.attributes?.path === path
  ) {
    return tree.children?.find(
      (child) =>
        child.type === 'code' && (!child.lang || child.lang === 'text'),
    );
  }
  for (const child of tree.children ?? []) {
    const found = outputFence(child, path);
    if (found) return found;
  }
}
function check(condition, slug, message) {
  if (!condition) failures.push({ slug, message });
}
for (const path of files('content/concepts')) {
  const file = path.replaceAll('\\', '/');
  const text = readFileSync(file, 'utf8');
  const a = parseArticle(text, file),
    slug = a.metadata.slug,
    old = before[slug];
  const review = reviewed.get(slug);
  check(Boolean(old), slug, 'Missing baseline identity');
  check(Boolean(review), slug, 'Article was not individually reviewed');
  if (old) {
    for (const key of [
      'id',
      'slug',
      'title',
      'category',
      'difficulty',
      'summary',
      'prerequisites',
      'relatedConcepts',
    ]) {
      check(
        JSON.stringify(a.concept[key]) === JSON.stringify(old.concept[key]),
        slug,
        `Changed stable metadata: ${key}`,
      );
    }
    check(
      a.metadata.order === old.order && a.metadata.directory === old.directory,
      slug,
      'Changed directory/order',
    );
    check(
      Boolean(a.longForm) === Boolean(old.longForm),
      slug,
      'Changed legacy/long-form architecture',
    );
    check(
      JSON.stringify(a.metadata.anchorAliases ?? {}) ===
        JSON.stringify(old.anchorAliases ?? {}),
      slug,
      'Changed legacy anchor aliases',
    );
    for (const section of old.sections)
      check(
        a.sections.some((s) => s.id === section.id),
        slug,
        `Lost anchor: ${section.id}`,
      );
  }
  const principle =
    a.longForm?.corePrinciple ?? a.concept.principle.split(/\n\s*\n/);
  const mechanism = principle.filter((p) => p.trim());
  const mechanismCharacters = mechanism.join('').length;
  check(
    mechanism.length >= 3 && mechanismCharacters >= 180,
    slug,
    `Mechanism still too terse: ${mechanism.length} paragraphs / ${mechanismCharacters} characters`,
  );
  check(
    Boolean(review?.example ?? review?.concreteExample),
    slug,
    'Missing topic-specific example review',
  );
  const emptySections = [];
  for (const section of a.sections) {
    const escaped = section.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const body = new RegExp(
      `^## [^\\n]*\\{#${escaped}\\}\\s*\\n([\\s\\S]*?)(?=^## |$)`,
      'm',
    )
      .exec(text)?.[1]
      ?.trim();
    if (!body) emptySections.push(section.id);
  }
  check(
    emptySections.length === 0,
    slug,
    `Empty published sections: ${emptySections.join(', ')}`,
  );
  for (const paragraph of mechanism) {
    if (paragraph.length < 50) continue;
    const owners = paragraphOwners.get(paragraph) ?? [];
    owners.push(slug);
    paragraphOwners.set(paragraph, owners);
  }
  const proseCharacters = a.longForm
    ? ['background', 'definition', 'intuition', 'corePrinciple'].reduce(
        (n, k) => n + (a.longForm[k] ?? []).join('').length,
        0,
      )
    : a.concept.explanation.length + a.concept.principle.length;
  articles.push({
    slug,
    file,
    category: a.metadata.category,
    legacy: !a.longForm,
    status: review?.status,
    example: review?.example ?? review?.concreteExample,
    evidence: review?.evidence,
    mechanismParagraphs: mechanism.length,
    mechanismCharacters,
    proseCharacters,
    preservedAnchors: old?.sections.length ?? 0,
    changed:
      old?.searchText !== undefined
        ? a.searchText !== old.searchText
        : hashText(a.searchText) !== old?.searchSha256,
    beforeCharacters: old?.searchText?.length ?? old?.searchCharacters ?? 0,
    afterCharacters: a.searchText.length,
    emptySections,
  });
  const cases =
    a.longForm?.codeExamples ??
    (a.concept.code.source
      ? [{ ...a.concept.code, expectedOutput: undefined }]
      : []);
  for (const [index, example] of cases.entries()) {
    const fence = outputFence(
      a.tree,
      a.longForm ? `codeExamples.${index}.expectedOutput` : 'codeExplanation',
    );
    const expected =
      fence?.value ??
      example.expectedOutput ??
      review?.codeVerification?.expectedOutput ??
      review?.snippet?.expectedOutput ??
      review?.snippets?.find?.((r) => r.field === 'code.source')
        ?.actualOutput ??
      review?.codeVerification?.find?.((r) => r.index === index || index === 0)
        ?.stdout;
    const baselineCase =
      old?.longForm?.codeExamples?.[index] ??
      (index === 0 ? old?.concept.code : undefined);
    const baselineHash =
      baselineCase?.sourceSha256 ??
      (baselineCase?.source !== undefined
        ? hashText(baselineCase.source)
        : undefined);
    examples.push({
      slug,
      file,
      index,
      language: example.language,
      source: example.source,
      expected,
      expectedKind: fence
        ? 'literal-output-fence'
        : expected === undefined
          ? 'not-specified'
          : 'text',
      changed: hashText(example.source) !== baselineHash,
      reviewEvidence: review?.evidence,
    });
  }
}
check(
  articles.length === Object.keys(before).length,
  '*',
  'Catalog count changed',
);
const duplicateMechanisms = [...paragraphOwners.entries()]
  .filter(([, owners]) => owners.length > 1)
  .map(([paragraph, owners]) => ({ paragraph, owners }));
const summary = {
  reviewed: reviewed.size,
  articles: articles.length,
  changed: articles.filter((a) => a.changed).length,
  proseUnder500: articles.filter((a) => a.proseCharacters < 500).length,
  preservedAnchors: articles.reduce((n, a) => n + a.preservedAnchors, 0),
  executableExamples: examples.length,
  failures,
  duplicateMechanisms,
};
writeFileSync(
  `${output}/audit.json`,
  JSON.stringify({ summary, articles }, null, 2),
);
writeFileSync(`${output}/all-examples.json`, JSON.stringify(examples, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
