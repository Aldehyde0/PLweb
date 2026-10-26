import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';

const base = process.argv[2] ?? 'http://127.0.0.1:8794';
const out = 'outputs/layerwise-integration';
mkdirSync(out, { recursive: true });
const browser = await launchBrowser();
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  assert.ok(pass, name);
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.addInitScript(() => {
    window.__motionFrames = 0;
    const gl = WebGL2RenderingContext.prototype;
    const draw = Object.getOwnPropertyDescriptor(
      gl,
      'drawArraysInstanced',
    ).value;
    gl.drawArraysInstanced = function (...args) {
      window.__motionFrames++;
      return draw.apply(this, args);
    };
    const proto = CanvasRenderingContext2D.prototype;
    const clear = Object.getOwnPropertyDescriptor(proto, 'clearRect').value;
    proto.clearRect = function (...args) {
      if (this.canvas.closest('.path-visual')) window.__motionFrames++;
      return clear.apply(this, args);
    };
  });
  const page = await context.newPage();
  for (const route of [
    '/',
    '/category/artificial-intelligence',
    '/category/machine-learning',
    '/category/deep-learning',
    '/category/reinforcement-learning',
  ]) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(100);
    // Drive the visibility listener in an isolated context. Headless Chromium
    // does not consistently hide tabs when another headless tab is selected.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(80);
    const frozen = await page.evaluate(() => window.__motionFrames);
    await page.waitForTimeout(150);
    check(
      `${route} pauses on simulated document-hidden event`,
      await page.evaluate((n) => window.__motionFrames === n, frozen),
    );
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(150);
    check(
      `${route} resumes on document-visible event`,
      await page.evaluate((n) => window.__motionFrames > n, frozen),
    );
  }
  for (const theme of ['dark', 'light']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }, theme);
    const contrast = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      function luminance(token) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = style.getPropertyValue(token).trim();
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data]
          .slice(0, 3)
          .map((v) => v / 255)
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
      }
      return [
        ['--lw-ink', '--lw-paper'],
        ['--lw-secondary', '--lw-paper'],
        ['--lw-muted', '--lw-surface'],
        ['--lw-accent-ink', '--lw-selection'],
      ].map(([text, background]) => {
        const a = luminance(text),
          b = luminance(background);
        return {
          text,
          background,
          ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        };
      });
    });
    check(
      `${theme} primary, secondary, muted and selected-text tokens meet AA`,
      contrast.every((x) => x.ratio >= 4.5),
      contrast,
    );
  }
} catch (error) {
  process.exitCode = 1;
  results.push({ name: error.message, pass: false });
} finally {
  await browser.close();
  writeFileSync(
    `${out}/motion-contrast-results.json`,
    JSON.stringify({ base, results }, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
}
