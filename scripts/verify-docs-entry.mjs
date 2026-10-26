/** Verify the exact Home → Docs interaction, including the reader's chrome. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';

const base = process.argv[2] ?? 'http://localhost:8793';
const out = 'outputs/layerwise-integration/docs-entry';
mkdirSync(out, { recursive: true });
const browser = await launchBrowser();
const results = [],
  errors = [];
function check(name, pass) {
  results.push({ name, pass });
  assert.ok(pass, name);
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page
    .locator('.site-nav__links')
    .getByRole('link', { name: 'Docs', exact: true })
    .click();
  await page.waitForURL('**/concept/gradient-descent');
  await page.locator('.mdx-article #definition').waitFor();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${out}/entry.png` });
  check(
    'Home → Docs keeps the English global navigation',
    !/\p{Script=Han}/u.test(await page.locator('.site-header').innerText()),
  );
  check(
    'Docs breadcrumbs use English interface labels',
    !/\p{Script=Han}/u.test(
      await page.locator('.concept-article > .breadcrumbs').innerText(),
    ),
  );
  check(
    'Docs toolbar uses English interface labels',
    !/\p{Script=Han}/u.test(await page.locator('.doc-action-row').innerText()),
  );
  check(
    'Original article title and Chinese MDX remain intact',
    (await page.locator('.concept-header h1').innerText()).includes(
      '梯度下降',
    ) &&
      (await page.locator('.mdx-article #definition').innerText()).includes(
        '梯度',
      ),
  );
  check(
    'Approved reader heading scale is applied',
    (await page
      .locator('.concept-header h1')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) <= 40,
  );
  check(
    'Reader provides the approved directory filter',
    (await page
      .getByRole('textbox', { name: 'Filter concepts', exact: true })
      .count()) === 1,
  );
  const toolbar = page.locator('.doc-action-row');
  check(
    'All reader toolbar buttons retain 44px targets',
    await toolbar.locator('button').evaluateAll((buttons) =>
      buttons.every((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width >= 43.9 && rect.height >= 43.9;
      }),
    ),
  );
  await toolbar
    .getByRole('button', { name: 'Mark as learned', exact: true })
    .click();
  await toolbar.getByRole('button', { name: 'Bookmark', exact: true }).click();
  await toolbar
    .getByRole('button', { name: 'Mark important', exact: true })
    .click();
  await page.reload({ waitUntil: 'networkidle' });
  check(
    'English controls preserve learned, bookmarked and important state',
    (await toolbar
      .getByRole('button', { name: 'Learned', exact: true })
      .getAttribute('aria-pressed')) === 'true' &&
      (await toolbar
        .getByRole('button', { name: 'Bookmarked', exact: true })
        .getAttribute('aria-pressed')) === 'true' &&
      (await toolbar
        .getByRole('button', { name: 'Remove important mark', exact: true })
        .getAttribute('aria-pressed')) === 'true',
  );
  await toolbar.getByRole('button', { name: 'Notes', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('textbox')
    .fill('Docs entry regression note');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '添加笔记', exact: true })
    .click();
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle' });
  await toolbar.getByRole('button', { name: 'Notes', exact: true }).click();
  check(
    'Notes toolbar preserves real saved notes',
    (await page
      .getByRole('dialog')
      .getByText('Docs entry regression note', { exact: true })
      .count()) === 1,
  );
  await page.keyboard.press('Escape');
  await page
    .getByRole('textbox', { name: 'Filter concepts', exact: true })
    .fill('Standardization');
  check(
    'Directory filters real bilingual concept names',
    await page
      .locator(
        '.doc-directory-scroll a[href="/concept/numerical-standardization"]',
      )
      .isVisible(),
  );
  await page
    .getByRole('combobox', { name: 'Learning path', exact: true })
    .selectOption('artificial-intelligence');
  check(
    'Switching the directory path keeps the current article open',
    page.url().includes('/concept/gradient-descent') &&
      (await page
        .locator('.doc-directory-scroll a[href="/concept/ai-overview"]')
        .count()) === 1,
  );
  for (const theme of ['light', 'dark'])
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }, theme);
      await page.screenshot({ path: `${out}/${theme}-${width}.png` });
      check(
        `${theme} ${width}px keeps English reader controls and fits`,
        !/\p{Script=Han}/u.test(
          (await page.locator('.concept-article > .breadcrumbs').innerText()) +
            (await toolbar.innerText()),
        ) &&
          (await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          )),
      );
    }
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.getByRole('button', { name: 'On this page', exact: true }).click();
  await page.getByRole('dialog').locator('a[href="#definition"]').click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.waitForURL('**#definition');
  check(
    'Mobile table of contents closes and jumps to the real section',
    (await page.getByRole('dialog').count()) === 0 &&
      page.url().endsWith('#definition'),
  );
  check('No page errors on Docs entry', errors.length === 0);
} catch (error) {
  results.push({ name: error.message, pass: false });
  process.exitCode = 1;
} finally {
  await browser.close();
  writeFileSync(
    `${out}/results.json`,
    JSON.stringify({ base, results, errors }, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
}
