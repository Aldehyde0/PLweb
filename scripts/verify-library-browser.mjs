/** Verify every concept's actual rendered mechanisms, then inspect rich readers. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';

const base = (process.argv[2] ?? 'http://127.0.0.1:8794').replace(/\/$/, '');
const output = 'outputs/content-library-review/browser';
mkdirSync(output, { recursive: true });
const index = JSON.parse(
  readFileSync('lib/generated/content-index.json', 'utf8'),
);
const browser = await launchBrowser();
const results = [],
  errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const entries = Object.entries(index);
  let cursor = 0;
  await Promise.allSettled(
    Array.from({ length: 6 }, async () => {
      while (cursor < entries.length) {
        const [slug, entry] = entries[cursor++];
        try {
          const response = await context.request.get(
            `${base}/concept/${slug}`,
            { timeout: 90000 },
          );
          assert.equal(response.status(), 200, slug);
          const html = await response.text();
          const paragraphs =
            entry.longForm?.corePrinciple ??
            entry.concept.principle.split(/\n\s*\n/);
          const samples = paragraphs
            .map((p) =>
              p
                .split(/\$[^$]+\$/)
                .sort((a, b) => b.length - a.length)[0]
                .trim()
                .slice(0, 22),
            )
            .filter((p) => p.length > 8);
          const rendered = await page.evaluate(
            ({ html, sections, samples }) => {
              const doc = new DOMParser().parseFromString(html, 'text/html');
              const core = doc.querySelector('#core-principle');
              const normalized = (core?.textContent ?? '').replace(/\s/g, '');
              return {
                missingAnchors: sections
                  .filter((s) => !doc.getElementById(s.id))
                  .map((s) => s.id),
                paragraphs: core?.querySelectorAll('p').length ?? 0,
                missingSamples: samples.filter(
                  (s) => !normalized.includes(s.replace(/\s/g, '')),
                ),
                formulaFallbacks: doc.querySelectorAll(
                  '.math-fallback,.math-inline-fallback',
                ).length,
              };
            },
            { html, sections: entry.sections, samples },
          );
          assert.equal(
            rendered.missingAnchors.length,
            0,
            `${slug}: missing anchors ${rendered.missingAnchors}`,
          );
          assert.ok(
            rendered.paragraphs >= 3,
            `${slug}: only ${rendered.paragraphs} rendered mechanism paragraphs`,
          );
          assert.equal(
            rendered.missingSamples.length,
            0,
            `${slug}: expanded prose missing ${rendered.missingSamples}`,
          );
          assert.equal(
            rendered.formulaFallbacks,
            0,
            `${slug}: formula fallback`,
          );
          results.push({ slug, pass: true, ...rendered });
        } catch (error) {
          results.push({ slug, pass: false, error: error.message });
        }
      }
    }),
  );
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  const samples = [
    ['ai-legacy', 'state-space-search'],
    ['ai-modern', 'mcp-overview'],
    ['ml-legacy', 'supervised-learning'],
    ['ml-model', 'support-vector-machines'],
    ['ml-evaluation', 'nested-cross-validation'],
    ['ml-project', 'digits-error-analysis'],
    ['dl-legacy', 'loss-functions'],
    ['dl-sequence', 'transformer'],
    ['dl-generation', 'diffusion-models'],
    ['rl-policy', 'actor-critic'],
    ['rl-modern', 'ppo'],
    ['rl-offline', 'cql'],
  ];
  for (const [name, slug] of samples) {
    for (const theme of ['dark', 'light'])
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${base}/concept/${slug}#core-principle`, {
          waitUntil: 'networkidle',
          timeout: 90000,
        });
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }, theme);
        await page.locator('#core-principle').scrollIntoViewIfNeeded();
        await page.waitForTimeout(80);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${slug} ${theme} ${width}: page overflow`,
        );
        await page.screenshot({
          path: `${output}/${name}-${theme}-${width}.png`,
        });
        results.push({
          slug,
          theme,
          width,
          pass: true,
          check: 'reader-layout',
        });
      }
  }
  await page.goto(
    `${base}/category/machine-learning?topic=all&q=${encodeURIComponent('零分母')}`,
    { waitUntil: 'networkidle' },
  );
  assert.ok(
    await page
      .locator('.path-concept[href="/concept/feature-construction"]')
      .isVisible(),
    'Expanded text not searchable',
  );
  results.push({ pass: true, check: 'new-text-enters-search' });
  assert.equal(errors.length, 0, JSON.stringify(errors));
} catch (error) {
  results.push({ pass: false, error: error.message });
} finally {
  await browser.close();
  const summary = {
    routes: results.filter((r) => r.slug && !r.check && !r.theme).length,
    passed: results.filter((r) => r.pass).length,
    failures: results.filter((r) => !r.pass),
    errors,
  };
  writeFileSync(
    `${output}/results.json`,
    JSON.stringify({ base, summary, results }, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length || errors.length) process.exitCode = 1;
}
