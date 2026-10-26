import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';

const base = process.argv[2] ?? 'http://127.0.0.1:8794';
const output = 'outputs/code-theme';
mkdirSync(output, { recursive: true });
const browser = await launchBrowser();
const results = [];
const errors = [];

try {
  for (const width of [1440, 375, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      colorScheme: 'light',
      reducedMotion: 'reduce',
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    for (const route of [
      '/',
      '/concept/gradient-descent',
      '/concept/function-calling',
      '/concept/dropout',
      '/concept/q-learning',
    ]) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const home = route === '/';
      const block = page
        .locator(home ? '.source-panel' : '.code-figure')
        .first();
      await block.waitFor();
      for (const theme of ['light', 'dark']) {
        if ((await page.locator('html').getAttribute('data-theme')) !== theme) {
          await page.locator('.theme-toggle').click();
          await page.waitForFunction(
            (t) => document.documentElement.dataset.theme === t,
            theme,
          );
          await page.evaluate(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              ),
          );
          await page.waitForFunction(() =>
            document.getAnimations().every((a) => a.playState !== 'running'),
          );
        }
        const metrics = await page.evaluate(
          ({ home }) => {
            const style = (el) => getComputedStyle(el);
            const colors = new Map();
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext('2d');
            function rgba(color) {
              if (!colors.has(color)) {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, 1, 1);
                colors.set(color, [...ctx.getImageData(0, 0, 1, 1).data]);
              }
              return colors.get(color);
            }
            function background(el) {
              for (let node = el; node; node = node.parentElement) {
                const c = rgba(style(node).backgroundColor);
                if (c[3] === 255) return c;
              }
              throw new Error('Code must have an opaque theme surface');
            }
            function luminance(rgb) {
              const [r, g, b] = rgb.slice(0, 3).map((v) => {
                const c = v / 255;
                return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
              });
              return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            }
            const root = style(document.documentElement);
            const expectedPaper = rgba(
              root.getPropertyValue('--lw-code-paper'),
            );
            const expectedHeader = rgba(
              root.getPropertyValue('--lw-code-header'),
            );
            const panels = [
              ...document.querySelectorAll(
                home
                  ? '.source-panel,.output-panel'
                  : '.code-figure,.analysis-snippet',
              ),
            ];
            const headers = [
              ...document.querySelectorAll(
                home ? '.source-header,.output-panel header' : '.code-caption',
              ),
            ];
            const textSelector = home
              ? '.source-code code,.source-code [class^="syntax-"],.line-number,.source-header,.code-copy,.output-content,.output-content output,.output-note'
              : '.code-line-content,.code-line-number,.code-figure [class^="syntax-"],.code-caption strong,.code-caption .text-muted-foreground,.code-purpose,.analysis-snippet';
            const contrast = [...document.querySelectorAll(textSelector)].map(
              (el) => {
                const a = luminance(rgba(style(el).color));
                const b = luminance(background(el));
                return {
                  selector: el.className || el.tagName,
                  ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
                };
              },
            );
            return {
              paper: expectedPaper,
              header: expectedHeader,
              panels: panels.map((el) => rgba(style(el).backgroundColor)),
              headers: headers.map((el) => rgba(style(el).backgroundColor)),
              font: style(
                document.querySelector(
                  home ? '.source-code code' : '.code-lines code',
                ),
              ).fontSize,
              minContrast: Math.min(...contrast.map((x) => x.ratio)),
              unreadable: contrast.filter((x) => x.ratio < 4.5),
              pageOverflow: document.documentElement.scrollWidth > innerWidth,
            };
          },
          { home },
        );
        assert.ok(metrics.panels.length > 0);
        for (const actual of metrics.panels)
          assert.deepEqual(
            actual,
            metrics.paper,
            `${route}: code surface must match the shared theme`,
          );
        for (const actual of metrics.headers)
          assert.deepEqual(actual, metrics.header);
        assert.equal(
          metrics.font,
          width <= 640 ? '13.5px' : '15px',
          `${route}: readable code size`,
        );
        assert.deepEqual(
          metrics.unreadable,
          [],
          `${theme} ${route}: syntax / labels must meet AA`,
        );
        assert.equal(
          metrics.pageOverflow,
          false,
          `${width} ${route}: local scrolling only`,
        );
        const copy = block.locator(
          home ? '.code-copy' : '.code-caption button',
        );
        await copy.click();
        await page.waitForFunction(
          () =>
            document
              .querySelector('.source-panel output,.code-figure output')
              ?.textContent.includes('copied') ||
            document
              .querySelector('.code-figure output')
              ?.textContent.includes('已复制'),
        );
        const clipboard = await page.evaluate(() =>
          navigator.clipboard.readText(),
        );
        const displayed = await block
          .locator(home ? '.source-code' : '.code-lines')
          .evaluate((el) => {
            const clone = el.cloneNode(true);
            clone
              .querySelectorAll('.line-number,.code-line-number')
              .forEach((line) => line.remove());
            return clone.textContent.trimEnd();
          });
        assert.equal(
          clipboard.replace(/\r\n/g, '\n').trimEnd(),
          displayed,
          'Copy preserves source without line numbers',
        );
        const scroll = block.locator(home ? '.source-code' : '.code-scroll');
        const scrolls = await scroll.evaluate((el) => {
          const overflow = el.scrollWidth > el.clientWidth;
          el.scrollLeft = el.scrollWidth;
          const moved = el.scrollLeft > 0;
          el.scrollLeft = 0;
          return { overflow, moved };
        });
        if (scrolls.overflow)
          assert.equal(
            scrolls.moved,
            true,
            'Long code lines must remain scrollable',
          );
        if (!home) {
          await block.locator('.code-scroll button').focus();
          await page.keyboard.press('Enter');
          assert.equal(
            await block
              .locator('.code-lines')
              .evaluate((el) => el === document.activeElement),
            true,
          );
        }
        if (route === '/' || route === '/concept/gradient-descent') {
          await block.evaluate((el) =>
            el.scrollIntoView({ block: 'start', behavior: 'instant' }),
          );
          await page.evaluate(() => document.activeElement?.blur());
          await page.screenshot({
            path: `${output}/${home ? 'home' : 'article'}-${width}-${theme}.png`,
          });
        }
        results.push({ route, width, theme, ...metrics, scrolls, copy: true });
      }
    }
    // Reload must retain the last selection and its code surfaces.
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await context.close();
  }
  assert.deepEqual(errors, [], 'No browser errors');
} catch (error) {
  errors.push(error.message);
  throw error;
} finally {
  writeFileSync(
    `${output}/browser-results.json`,
    JSON.stringify({ base, results, errors }, null, 2),
  );
  await browser.close();
}
console.log(
  JSON.stringify({
    checks: results.length,
    errors,
    minContrast: Math.min(...results.map((r) => r.minContrast)),
    screenshots: output,
  }),
);
