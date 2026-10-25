/** Exercise discovery, HMR, search and cleanup using one temporary real article. */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';
import { generateContent } from './generate-content.mjs';
import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://localhost:8793';
const file = 'content/concepts/machine-learning/mdx-authoring-check.mdx';
if (existsSync(file)) throw new Error(`Refusing to overwrite ${file}`);
const source = readFileSync('content/templates/article.mdx', 'utf8')
  .replace('your-stable-id', 'mdx-authoring-check')
  .replace('your-concept-slug', 'mdx-authoring-check')
  .replace('概念标题', 'MDX 新增文章验证')
  .replace('说明问题发生的场景。', 'authoring-discovery-unique-token');
const browser = await launchBrowser();
const results = [];
const check = (name, value) => {
  assert.ok(value, name);
  results.push({ name, pass: true });
};
const index = () =>
  JSON.parse(readFileSync('lib/generated/content-index.json', 'utf8'));
async function waitFor(test) {
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    if (test()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('MDX watch update timed out');
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  await page.goto(`${base}/concept/numerical-standardization`, {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  // The server must discover a newly added file, without a manual generation command.
  writeFileSync(file, source);
  await waitFor(() => Boolean(index()['mdx-authoring-check']));
  check(
    'new article enters generated index automatically',
    index()['mdx-authoring-check'].longForm.codeExamples.length === 1,
  );
  await page.goto(`${base}/concept/mdx-authoring-check`, {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  check(
    'new pure Markdown article renders with formula and code',
    (await page
      .getByRole('heading', { level: 1, name: 'MDX 新增文章验证' })
      .count()) === 1 &&
      (await page.locator('.katex').count()) > 0 &&
      (await page.locator('.code-figure').count()) === 1,
  );
  await page.goto(`${base}/category/machine-learning`, {
    waitUntil: 'networkidle',
  });
  await page
    .locator('#concept-search')
    .fill('authoring-discovery-unique-token');
  await page
    .locator('a[href="/concept/mdx-authoring-check"]')
    .first()
    .waitFor();
  check('new article enters full-text search', true);
  writeFileSync(file, source.replace('MDX 新增文章验证', 'MDX 修改文章验证'));
  await waitFor(
    () => index()['mdx-authoring-check']?.concept.title === 'MDX 修改文章验证',
  );
  await page.goto(`${base}/concept/mdx-authoring-check`, {
    waitUntil: 'networkidle',
  });
  check(
    'edited article reloads through MDX',
    (await page
      .getByRole('heading', { level: 1, name: 'MDX 修改文章验证' })
      .count()) === 1,
  );
  unlinkSync(file);
  await waitFor(() => !index()['mdx-authoring-check']);
  check('removed article leaves index automatically', true);
  await context.close();
} catch (error) {
  process.exitCode = 1;
  results.push({ name: error.message, pass: false });
} finally {
  if (existsSync(file)) unlinkSync(file);
  await generateContent();
  await browser.close();
  writeFileSync(
    'outputs/mdx-migration/authoring-results.json',
    JSON.stringify({ base, results }, null, 2) + '\n',
  );
  console.log(JSON.stringify(results, null, 2));
}
