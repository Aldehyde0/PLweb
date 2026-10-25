import { launchBrowser } from './browser-runtime.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const expectedSections = JSON.parse(
  readFileSync('lib/generated/content-index.json', 'utf8'),
)['numerical-standardization'].sections.length;
const base = process.argv[2] ?? 'http://localhost:8793';
const browser = await launchBrowser();
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/concept/numerical-standardization', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  const result = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent,
    math: document.querySelectorAll('.katex').length,
    code: document.querySelectorAll('.code-example-stack').length,
    sections: document.querySelectorAll('.mdx-article .important-section')
      .length,
  }));
  assert.equal(result.code, 2);
  assert.ok(result.math >= 10);
  assert.equal(result.sections, expectedSections);
  assert.deepEqual(errors, []);
  await page.screenshot({
    path:
      'outputs/mdx-migration/sample-' +
      (process.argv[2] ? 'production' : 'dev') +
      '.png',
  });
  console.log(result);
} finally {
  await browser.close();
}
