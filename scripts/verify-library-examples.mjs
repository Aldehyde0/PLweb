/** Execute reviewed, trusted local teaching snippets in separate working folders. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import ts from 'typescript';

const output = 'outputs/content-library-review';
const cases = JSON.parse(readFileSync(`${output}/all-examples.json`, 'utf8'));
const python = process.env.CONTENT_PYTHON ?? 'python';
const previous =
  process.argv.includes('--reuse') &&
  existsSync(`${output}/example-results.json`)
    ? JSON.parse(readFileSync(`${output}/example-results.json`, 'utf8')).results
    : [];
const runner = `import contextlib, io, json, sys, traceback, os
item=json.load(sys.stdin)
buffer=io.StringIO()
try:
    with contextlib.redirect_stdout(buffer):
        exec(compile(item['source'], item['file'], 'exec'), {'__name__':'__main__', '__file__':os.path.join(os.getcwd(),'example.py')})
    print(json.dumps({'stdout':buffer.getvalue()},ensure_ascii=False))
except Exception:
    print(json.dumps({'stdout':buffer.getvalue(),'error':traceback.format_exc()},ensure_ascii=False))
    sys.exit(1)
`;
function execute(item) {
  if (item.language === 'JSON') {
    try {
      JSON.parse(item.source);
      return Promise.resolve({
        slug: item.slug,
        index: item.index,
        pass: true,
        validation: 'json-syntax',
      });
    } catch (error) {
      return Promise.resolve({
        slug: item.slug,
        index: item.index,
        pass: false,
        error: error.message,
        validation: 'json-syntax',
      });
    }
  }
  if (item.language === 'TypeScript' || item.language === 'JavaScript') {
    const result = ts.transpileModule(item.source, {
      fileName: 'example.ts',
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    });
    const errors = (result.diagnostics ?? [])
      .filter((d) => d.category === ts.DiagnosticCategory.Error)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    return Promise.resolve({
      slug: item.slug,
      index: item.index,
      pass: errors.length === 0,
      validation: 'sdk-syntax-only',
      error: errors.length ? errors.join('\n') : undefined,
    });
  }
  if (item.language === 'Markdown' || item.language === 'text')
    return Promise.resolve({
      slug: item.slug,
      index: item.index,
      pass: !!item.source.trim(),
      validation: 'document-structure',
    });
  if (!['Python', 'NumPy', 'PyTorch', 'scikit-learn'].includes(item.language))
    return Promise.resolve({
      slug: item.slug,
      index: item.index,
      pass: false,
      error: `Unknown example language ${item.language}`,
    });
  const hash = createHash('sha256').update(item.source).digest('hex');
  const cached = previous.find(
    (r) =>
      r.slug === item.slug &&
      r.index === item.index &&
      r.pass &&
      r.sourceSha256 === hash,
  );
  if (cached) {
    const expected = item.expected?.replaceAll('\r\n', '\n').trim();
    return Promise.resolve({
      ...cached,
      validation: 'python-execution',
      expected,
      expectedMatch: expected === undefined ? null : cached.actual === expected,
      reusedExecution: true,
    });
  }
  return new Promise((resolveResult) => {
    const folder = resolve(output, 'execution', `${item.slug}-${item.index}`);
    mkdirSync(folder, { recursive: true });
    const child = spawn(python, ['-X', 'utf8', '-c', runner], {
      cwd: folder,
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONHASHSEED: '0',
        OMP_NUM_THREADS: '1',
        OPENBLAS_NUM_THREADS: '1',
        MKL_NUM_THREADS: '1',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '',
      launchError;
    child.stdout.on('data', (x) => {
      stdout += x;
    });
    child.stderr.on('data', (x) => {
      stderr += x;
    });
    child.on('error', (error) => {
      launchError = error.message;
    });
    const timer = setTimeout(() => child.kill(), 60000);
    child.on('close', (status) => {
      clearTimeout(timer);
      let parsed;
      try {
        parsed = JSON.parse(stdout);
      } catch {
        parsed = { error: launchError ?? stderr ?? stdout };
      }
      const actual = parsed.stdout?.replaceAll('\r\n', '\n').trim();
      const expected = item.expected?.replaceAll('\r\n', '\n').trim();
      const pass = status === 0 && !parsed.error;
      resolveResult({
        slug: item.slug,
        index: item.index,
        file: item.file,
        validation: 'python-execution',
        sourceSha256: createHash('sha256').update(item.source).digest('hex'),
        pass,
        status,
        actual,
        expected,
        expectedMatch: expected === undefined ? null : actual === expected,
        error: parsed.error,
        stderr,
      });
    });
    child.stdin.end(JSON.stringify(item));
  });
}
const results = [];
let cursor = 0;
await Promise.allSettled(
  Array.from({ length: 3 }, async () => {
    while (cursor < cases.length) {
      const item = cases[cursor++];
      const result = await execute(item);
      results.push(result);
      console.log(
        `${results.length}/${cases.length} ${result.pass ? (result.validation === 'python-execution' ? 'RUN' : 'CHECK') : 'FAIL'} ${item.slug}:${item.index}${result.reusedExecution ? ' [source hash unchanged]' : ''}${result.expectedMatch === false ? ' [expectation requires review]' : ''}`,
      );
    }
  }),
);
results.sort((a, b) => a.slug.localeCompare(b.slug) || a.index - b.index);
const summary = {
  total: cases.length,
  completed: results.length,
  passed: results.filter((r) => r.pass).length,
  python: results.filter((r) => r.validation === 'python-execution').length,
  nonPythonChecks: results
    .filter((r) => r.validation !== 'python-execution')
    .map((r) => ({ slug: r.slug, index: r.index, validation: r.validation })),
  runtimeFailures: results.filter((r) => !r.pass),
  expectationReview: results.filter((r) => r.pass && r.expectedMatch === false),
  withoutLiteralExpectation: results
    .filter((r) => r.expectedMatch === null)
    .map((r) => ({ slug: r.slug, index: r.index, actual: r.actual })),
};
writeFileSync(
  `${output}/example-results.json`,
  JSON.stringify({ summary, results }, null, 2),
);
console.log(JSON.stringify(summary, null, 2));
if (
  summary.runtimeFailures.length ||
  summary.expectationReview.length ||
  results.length !== cases.length
)
  process.exitCode = 1;
