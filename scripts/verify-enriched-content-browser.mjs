import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';

const base = process.argv[2] ?? 'http://127.0.0.1:8794';
const output = 'outputs/content-enrichment/browser';
mkdirSync(output, { recursive: true });
const index = JSON.parse(
  readFileSync('lib/generated/content-index.json', 'utf8'),
);
const cohort = JSON.parse(
  readFileSync('outputs/content-enrichment/verification.json', 'utf8'),
).articles.map((a) => a.slug);
const browser = await launchBrowser();
const results = [],
  errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  for (const slug of cohort) {
    const response = await page.goto(`${base}/concept/${slug}`, {
      waitUntil: 'networkidle',
      timeout: 90000,
    });
    assert.equal(response.status(), 200, slug);
    const article = index[slug];
    for (const section of article.sections)
      assert.equal(
        await page.locator(`.mdx-article #${section.id}`).count(),
        1,
        `${slug} missing ${section.id}`,
      );
    for (const paragraph of article.longForm.corePrinciple)
      assert.equal(
        await page
          .locator('#core-principle')
          .getByText(paragraph, { exact: true })
          .count(),
        1,
        `${slug}: missing expanded principle`,
      );
    assert.equal(
      await page.locator('.code-example-stack').count(),
      article.longForm.codeExamples.length,
      `${slug}: missing executable example`,
    );
    assert.equal(
      await page.locator('.math-fallback,.math-inline-fallback').count(),
      0,
      `${slug}: unrendered formula`,
    );
    results.push({
      slug,
      pass: true,
      sections: article.sections.length,
      codeExamples: article.longForm.codeExamples.length,
    });
  }
  await page.goto(
    `${base}/category/artificial-intelligence?topic=all&q=${encodeURIComponent('定制服务')}`,
    { waitUntil: 'networkidle' },
  );
  assert.ok(
    await page
      .locator('.path-concept[href="/concept/retrieval-augmented-generation"]')
      .isVisible(),
    'New MDX case should enter full-text search',
  );
  results.push({ name: 'New examples enter full-text search', pass: true });
  for (const [name, slug, anchor] of [
    ['ai', 'retrieval-augmented-generation', 'intuition'],
    ['ml', 'gradient-descent', 'worked-example'],
    ['dl', 'attention', 'numerical-example'],
    ['rl', 'bellman-equations', 'numerical-example'],
  ]) {
    for (const theme of ['dark', 'light']) {
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${base}/concept/${slug}#${anchor}`, {
          waitUntil: 'networkidle',
        });
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }, theme);
        await page.locator(`#${anchor}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${slug} ${theme} ${width}: overflow`,
        );
        await page.screenshot({
          path: `${output}/${name}-${theme}-${width}.png`,
        });
        results.push({ slug, theme, width, pass: true });
      }
    }
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
} catch (error) {
  process.exitCode = 1;
  results.push({ pass: false, error: error.message });
} finally {
  await browser.close();
  writeFileSync(
    `${output}/results.json`,
    JSON.stringify({ base, results, errors }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        passed: results.filter((r) => r.pass).length,
        failures: results.filter((r) => !r.pass),
        errors,
      },
      null,
      2,
    ),
  );
}
