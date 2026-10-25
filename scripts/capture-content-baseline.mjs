import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, relative, dirname } from 'node:path';
const revision = process.argv[2] ?? '48cbd50';
const root = process.cwd();
const gitSnapshot = {
  name: 'read-content-at-revision',
  setup(b) {
    b.onResolve({ filter: /^\./ }, (args) => ({
      path: resolve(args.resolveDir, args.path).replace(/\.ts$/, '') + '.ts',
      namespace: 'git',
    }));
    b.onLoad({ filter: /.*/, namespace: 'git' }, (args) => ({
      contents: execFileSync(
        'git',
        [
          'show',
          `${revision}:${relative(root, args.path).replaceAll('\\', '/')}`,
        ],
        { encoding: 'utf8' },
      ),
      loader: 'ts',
      resolveDir: dirname(args.path),
    }));
  },
};
mkdirSync('outputs/mdx-migration', { recursive: true });
const sourceExports = [
  ['content-base', 'concepts'],
  ['expanded-content', 'expandedConcepts'],
  ['long-form-core', 'longFormConcepts'],
  ['fundamentals-long-form', 'fundamentalsLongForms'],
  ['preprocessing-long-form', 'preprocessingLongForms'],
  ['models-long-form', 'modelsLongForms'],
  ['evaluation-long-form', 'evaluationLongForms'],
  ['projects-long-form', 'projectsLongForms'],
  ['deep-learning-foundations', 'deepLearningFoundations'],
  ['deep-learning-sequences', 'deepLearningSequences'],
  ['deep-learning-advanced', 'deepLearningAdvanced'],
  ['ai-long-form', 'aiLongForms'],
  ['rl-long-form', 'rlLongForms'],
];
const sourceImports = sourceExports
  .map(
    ([file, name], i) => `import {${name} as layer${i}} from './lib/${file}';`,
  )
  .join('\n');
const sourceObject = `sourceLayers:{${sourceExports.map(([file], i) => `'lib/${file}.ts':layer${i}.map(c=>({id:c.id,slug:c.slug}))`).join(',')}},`;

await build({
  plugins: [gitSnapshot],
  stdin: {
    contents:
      sourceImports +
      `import {concepts,categories} from './lib/content'; import {longFormMap} from './lib/long-form-content'; import {conceptDirectory,directoryConcepts} from './lib/category-directory'; import {getLongFormSections,legacySections} from './lib/section-utils'; export default {${sourceObject}concepts,categories,longFormMap,directory:directoryConcepts([...concepts]).map(x=>x.slug),groups:Object.fromEntries(concepts.map(x=>[x.slug,conceptDirectory(x)])),sections:Object.fromEntries(concepts.map(x=>[x.slug,longFormMap[x.slug]?getLongFormSections(longFormMap[x.slug]):legacySections]))};`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'outputs/mdx-migration/baseline.mjs',
});
const { default: data } = await import('../outputs/mdx-migration/baseline.mjs');
writeFileSync(
  'outputs/mdx-migration/baseline.json',
  JSON.stringify(data, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    concepts: data.concepts.length,
    longforms: Object.keys(data.longFormMap).length,
    categories: Object.fromEntries(
      data.categories.map((x) => [
        x.slug,
        data.concepts.filter((c) => c.category === x.slug).length,
      ]),
    ),
    fields: [...new Set(Object.values(data.longFormMap).flatMap(Object.keys))],
  }),
);
