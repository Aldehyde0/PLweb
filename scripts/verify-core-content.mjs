/** Run this reviewed cohort's trusted local examples and check displayed claims. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { parseArticle } from './mdx-pipeline.mjs';

export const coreArticles = [
  'ai-overview',
  'ai-ml-dl-relationship',
  'intelligent-agent',
  'retrieval-augmented-generation',
  'gradient-descent',
  'linear-regression',
  'train-validation-test-split',
  'underfitting-overfitting',
  'artificial-neuron',
  'neural-networks',
  'backpropagation',
  'attention',
  'markov-decision-process',
  'return-discount-factor',
  'bellman-equations',
  'q-learning',
];
const index = JSON.parse(
  readFileSync('lib/generated/content-index.json', 'utf8'),
);
const output = 'outputs/content-enrichment';
mkdirSync(output, { recursive: true });
const python = process.env.CONTENT_PYTHON ?? 'python';
const runner = `import contextlib, io, json, sys, traceback
item = json.load(sys.stdin)
buffer = io.StringIO()
try:
    with contextlib.redirect_stdout(buffer):
        exec(compile(item['source'], item['file'], 'exec'), {'__name__': '__main__'})
    print(json.dumps({'stdout': buffer.getvalue()}, ensure_ascii=False))
except Exception:
    print(json.dumps({'error': traceback.format_exc()}, ensure_ascii=False))
    sys.exit(1)
`;
const results = [],
  articles = [];
try {
  for (const slug of coreArticles) {
    const entry = index[slug];
    const file = entry.file;
    const source = readFileSync(file, 'utf8');
    const current = parseArticle(source, file);
    const old = parseArticle(
      execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8' }),
      file,
    );
    for (const key of [
      'id',
      'slug',
      'title',
      'category',
      'difficulty',
      'order',
      'directory',
      'prerequisites',
      'relatedConcepts',
    ]) {
      assert.deepEqual(
        current.metadata[key],
        old.metadata[key],
        `${slug}: changed stable metadata ${key}`,
      );
    }
    const ids = new Set(current.sections.map((s) => s.id));
    for (const section of old.sections)
      assert.ok(ids.has(section.id), `${slug}: removed anchor ${section.id}`);
    articles.push({
      slug,
      file,
      beforeCharacters: old.searchText.length,
      afterCharacters: current.searchText.length,
      preservedAnchors: old.sections.length,
    });
    for (const [i, example] of current.longForm.codeExamples.entries()) {
      const result = spawnSync(python, ['-X', 'utf8', '-c', runner], {
        input: JSON.stringify({
          source: example.source,
          file: `${file}:example-${i}`,
        }),
        encoding: 'utf8',
        timeout: 45000,
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
          OMP_NUM_THREADS: '1',
        },
      });
      assert.ifError(result.error);
      assert.equal(
        result.status,
        0,
        `${slug} example ${i}: ${result.stdout}\n${result.stderr}`,
      );
      const actual = JSON.parse(result.stdout)
        .stdout.replaceAll('\r\n', '\n')
        .trim();
      const expected = example.expectedOutput.replaceAll('\r\n', '\n').trim();
      results.push({
        slug,
        index: i,
        title: example.title,
        expected,
        actual,
        pass: actual === expected,
      });
      assert.equal(
        actual,
        expected,
        `${slug} example ${i}: output differs from the article`,
      );
    }
  }
} catch (error) {
  process.exitCode = 1;
  results.push({ pass: false, error: error.message });
} finally {
  writeFileSync(
    `${output}/verification.json`,
    JSON.stringify({ articles, examples: results }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        articles: articles.length,
        examples: results.filter((r) => r.pass).length,
        failures: results.filter((r) => !r.pass),
      },
      null,
      2,
    ),
  );
}
