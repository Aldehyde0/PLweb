import { mkdirSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';

const out = 'outputs/layerwise-integration/reference';
mkdirSync(out, { recursive: true });
const browser = await launchBrowser();
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  for (const theme of ['dark', 'light']) {
    for (const [name, file] of Object.entries({
      home: 'index',
      docs: 'docs',
      plans: 'plans',
      resources: 'resources',
      practice: 'practice',
    })) {
      await page.goto(
        `http://127.0.0.1:8792/${file}.html?theme=${theme}${name === 'docs' ? '&concept=numerical-standardization' : ''}`,
        {
          waitUntil: 'networkidle',
        },
      );
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${out}/${name}-${theme}.png` });
    }
    for (const slug of [
      'artificial-intelligence',
      'machine-learning',
      'deep-learning',
      'reinforcement-learning',
    ]) {
      await page.goto(
        `http://127.0.0.1:8792/reader.html?theme=${theme}&route=${encodeURIComponent(`/category/${slug}`)}`,
        { waitUntil: 'networkidle' },
      );
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/${slug}-${theme}.png` });
    }
  }
  await page.goto('http://localhost:8793', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/formal-current.png` });
} finally {
  await browser.close();
}
