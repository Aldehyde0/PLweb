import { readFileSync, writeFileSync } from 'node:fs';
const b = JSON.parse(
  readFileSync('outputs/mdx-migration/baseline.json', 'utf8'),
);
const norm = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[、，,/（）()\s·：:]/g, '');
const known = new Set(b.concepts.flatMap((c) => [c.slug, c.id, norm(c.title)]));
const refs = [
  ...new Set(
    b.concepts.flatMap((c) => [...c.prerequisites, ...c.relatedConcepts]),
  ),
]
  .filter((x) => !known.has(x) && !known.has(norm(x)))
  .sort((a, b) => a.localeCompare(b));
writeFileSync(
  'content/external-knowledge.json',
  JSON.stringify(refs, null, 2) + '\n',
);
console.log('Existing non-canonical knowledge labels:', refs.length);
