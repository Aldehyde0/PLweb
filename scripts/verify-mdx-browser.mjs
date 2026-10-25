import { launchBrowser } from './browser-runtime.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { isVerifiedNavigationCancellation } from './browser-network.ts';
const base = (process.argv[2] ?? 'http://127.0.0.1:8794').replace(/\/$/, '');
const output = resolve('outputs/mdx-migration');
mkdirSync(output, { recursive: true });
const index = JSON.parse(
  readFileSync('lib/generated/content-index.json', 'utf8'),
);
const fixture = JSON.parse(
  readFileSync('migration/learning-record.fixture.json', 'utf8').replace(
    /^\uFEFF/,
    '',
  ),
);
const browser = await launchBrowser();
const results = [],
  errors = [],
  warnings = [],
  requests = [];
function check(name, condition, detail = {}) {
  results.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(name + ' ' + JSON.stringify(detail));
}
const routes = [];
const networkEvents = [],
  cdpFailures = [],
  verifiedCancellations = [];
try {
  // Verify EVERY route against actual Workers output, including its compiled MDX sections.
  const remaining = Object.entries(index);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (remaining.length) {
        const [slug, a] = remaining.shift();
        const response = await fetch(`${base}/concept/${slug}`);
        const html = await response.text();
        const absent = a.sections.filter((s) => !html.includes(`id="${s.id}"`));
        assert.equal(response.status, 200, slug);
        assert.match(html, /class="article-flow mdx-article"/, slug);
        assert.equal(
          absent.length,
          0,
          `${slug}: missing ${absent.map((s) => s.id)}`,
        );
        assert.doesNotMatch(
          html,
          /class="math-(?:inline-)?fallback"/,
          `${slug}: formula fallback`,
        );
        routes.push({
          slug,
          status: response.status,
          sections: a.sections.length,
        });
      }
    }),
  );
  check(
    'all MDX routes return rendered sections',
    routes.length === Object.keys(index).length,
    { count: routes.length },
  );
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  // Only a fresh, isolated browser context receives the old-schema synthetic data.
  await context.addInitScript(
    ({ fixture }) => {
      if (!sessionStorage.getItem('fixture-loaded')) {
        localStorage.setItem('what-is-learning', JSON.stringify(fixture));
        localStorage.setItem('how-to-learn-ai-theme', JSON.stringify('dark'));
        sessionStorage.setItem('fixture-loaded', '1');
      }
    },
    { fixture },
  );
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Page.enable');
  for (const method of [
    'Network.requestWillBeSent',
    'Network.loadingFinished',
    'Network.loadingFailed',
    'Page.navigatedWithinDocument',
  ])
    cdp.on(method, (params) => {
      networkEvents.push({ method, params });
      if (method === 'Network.loadingFailed') {
        const start = networkEvents.find(
          (e) =>
            e.method === 'Network.requestWillBeSent' &&
            e.params.requestId === params.requestId,
        );
        cdpFailures.push({
          requestId: params.requestId,
          url: start?.params.request.url ?? '',
          type: params.type,
          errorText: params.errorText,
          canceled: params.canceled === true,
        });
      }
    });
  page.on('pageerror', (e) =>
    errors.push({ url: page.url(), message: e.message }),
  );
  page.on('console', (msg) => {
    if (msg.type() === 'error')
      errors.push({ url: page.url(), message: msg.text() });
    if (msg.type() === 'warning')
      warnings.push({ url: page.url(), message: msg.text() });
  });
  page.on('response', (r) => {
    if (r.status() >= 400)
      errors.push({ url: r.url(), message: 'HTTP ' + r.status() });
  });
  page.on('requestfailed', (r) =>
    requests.push({
      url: r.url(),
      type: r.resourceType(),
      navigation: r.isNavigationRequest(),
      reason: r.failure()?.errorText,
    }),
  );
  async function goto(slug) {
    await page.goto(`${base}/concept/${slug}`, {
      waitUntil: 'networkidle',
      timeout: 90000,
    });
    await page.waitForSelector('.mdx-article');
    await page.evaluate(() =>
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' }),
    );
  }
  async function screenshot(name) {
    await page.screenshot({
      path: join(output, name + '.png'),
      fullPage: false,
    });
  }
  await goto('numerical-standardization');
  const restoredRecent = await page.evaluate(
    () => JSON.parse(localStorage.getItem('what-is-learning')).recent,
  );
  check(
    'pre-migration recent records restore',
    fixture.recent.every((slug) => restoredRecent.includes(slug)),
  );
  check(
    'pre-migration bookmarks and important flags restore',
    (await page
      .getByRole('button', { name: '已收藏', exact: true })
      .count()) === 1 &&
      (await page.locator('#formulas').getAttribute('data-important')) ===
        'true',
  );
  check(
    'formula, table and both code examples render',
    (await page.locator('.katex').count()) > 8 &&
      (await page.locator('#variables tbody tr').count()) > 0 &&
      (await page.locator('.code-example-stack').count()) === 2,
  );
  check(
    'source section stays hidden and old anchor remains',
    (await page.locator('#sources[data-anchor-alias]').count()) === 1 &&
      (await page.locator('.article-toc a[href="#sources"]').count()) === 0 &&
      (await page.locator('.official-source-panel,.source-card').count()) === 0,
  );
  const layout = await page.evaluate(() => {
    const r = (s) => {
      const x = document.querySelector(s).getBoundingClientRect();
      return { x: x.x, width: x.width };
    };
    return {
      directory: r('.concept-directory'),
      article: r('.concept-article'),
      nav: r('.site-nav__links'),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  check(
    'Layerwise desktop layout',
    layout.directory.x === 0 &&
      layout.directory.width === 240 &&
      layout.article.width >= 900 &&
      !layout.overflow &&
      Math.abs(layout.nav.x + layout.nav.width / 2 - 720) < 1,
    layout,
  );
  await screenshot('ml-desktop-dark');
  await page
    .locator('.concept-memo-desktop')
    .getByRole('button', { name: /备忘录与重点/ })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  check(
    'both old notes, including removed source-section note, remain accessible',
    (await dialog.getByText(fixture.notes[0].text, { exact: true }).count()) ===
      1 &&
      (await dialog
        .getByText(fixture.notes[1].text, { exact: true })
        .count()) === 1,
  );
  await dialog.getByRole('combobox').selectOption('definition');
  await dialog.getByRole('textbox').fill('MDX 浏览器验证笔记');
  await dialog.getByRole('button', { name: '添加笔记', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle' });
  await page
    .locator('.concept-memo-desktop')
    .getByRole('button', { name: /备忘录与重点/ })
    .click();
  check(
    'new section note survives refresh',
    (await page
      .getByRole('dialog')
      .getByText('MDX 浏览器验证笔记', { exact: true })
      .count()) === 1,
  );
  await page.keyboard.press('Escape');
  await page.locator('.article-toc a[href="#formulas"]').click();
  await page.waitForFunction(
    () =>
      document.querySelector('#formulas').getBoundingClientRect().top >= 60 &&
      document.querySelector('#formulas').getBoundingClientRect().top < 130,
  );
  check(
    'TOC scroll and active section',
    (await page
      .locator('.article-toc a[href="#formulas"]')
      .getAttribute('aria-current')) === 'location',
  );
  await page.locator('#definition .important-toggle').click();
  await page.reload({ waitUntil: 'networkidle' });
  check(
    'chapter highlight persists',
    (await page.locator('#definition').getAttribute('data-important')) ===
      'true',
  );
  await page
    .locator('.code-figure')
    .first()
    .getByRole('button', { name: /^复制 / })
    .click();
  await page
    .locator('.code-figure')
    .first()
    .getByText('代码已复制到剪贴板', { exact: true })
    .waitFor();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const original =
    index['numerical-standardization'].longForm.codeExamples[0].source;
  check(
    'code copy preserves complete source',
    copied.replaceAll('\r\n', '\n') === original,
    {
      actualLength: copied.length,
      expectedLength: original.length,
      actualStart: copied.slice(0, 70),
      expectedStart: original.slice(0, 70),
    },
  );
  const demo = page.locator('.interactive-demo').first();
  const before = await demo.innerText();
  const sliders = demo.getByRole('slider');
  for (let i = 0; i < (await sliders.count()); i++) {
    await sliders.nth(i).focus();
    await page.keyboard.press('ArrowRight');
  }
  check(
    'standardization controls change live output',
    before !== (await demo.innerText()),
  );
  const z = await demo.locator('.math-block').innerText();
  const values = await sliders.evaluateAll((xs) =>
    xs.map((x) => Number(x.getAttribute('aria-valuenow') ?? x.value)),
  );
  const expectedZ = ((values[0] - values[1]) / values[2]).toFixed(3);
  check(
    'standardization output follows all three parameters',
    z.includes(expectedZ),
    { formula: z, values, expectedZ },
  );
  // Each unique mapped demo must mount and respond to a real control.
  const representatives = new Map();
  for (const [slug, a] of Object.entries(index))
    for (const d of a.demos) {
      if (
        !['ConceptPrerequisites', 'ConceptRelated', 'ArticleFlags'].includes(
          d.name,
        )
      )
        representatives.set(`${d.name}:${d.kind ?? ''}`, slug);
    }
  for (const [kind, slug] of representatives) {
    await goto(slug);
    const root = page
      .locator('.interactive-demo,.ai-demo,.rl-demo,.rl-algorithm-matrix')
      .first();
    if (
      kind.startsWith('RLAlgorithmMatrix') ||
      kind === 'RLInteractiveDemo:algorithm-comparison'
    ) {
      check(
        `demo ${kind} table mounts`,
        (await page.locator('.rl-demo table tbody tr').count()) >= 9,
      );
      continue;
    }
    await root.waitFor();
    const old = await root.innerText();
    const controls = root.locator('input[type="range"],[role="slider"]');
    const selects = root.locator('select');
    if (await controls.count()) {
      await controls.first().focus();
      await page.keyboard.press('ArrowRight');
    } else if (await selects.count()) {
      const options = await selects
        .first()
        .locator('option')
        .evaluateAll((xs) => xs.map((x) => x.value));
      const current = await selects.first().inputValue();
      await selects.first().selectOption(options.find((x) => x !== current));
    } else {
      const buttons = root.getByRole('button');
      const count = await buttons.count();
      await buttons.nth(count > 1 ? 1 : 0).click();
    }
    check(`demo ${kind} responds`, old !== (await root.innerText()), { slug });
  }
  await page.setViewportSize({ width: 375, height: 1000 });
  await goto('numerical-standardization');
  await page.getByRole('button', { name: /当前目录/ }).click();
  await page
    .getByRole('dialog')
    .locator('a[href="/concept/gradient-descent"]')
    .first()
    .waitFor();
  check('mobile concept directory opens', true);
  await page
    .getByRole('dialog')
    .locator('a[href="/concept/gradient-descent"]')
    .first()
    .click();
  await page.waitForURL('**/concept/gradient-descent');
  await page
    .getByRole('heading', {
      level: 1,
      name: index['gradient-descent'].concept.title,
      exact: true,
    })
    .waitFor();
  await page
    .locator('.mdx-article #definition')
    .getByText(index['gradient-descent'].longForm.definition[0], {
      exact: true,
    })
    .waitFor();
  await page.waitForLoadState('networkidle');
  const { frameTree } = await cdp.send('Page.getFrameTree');
  networkEvents.push({
    method: 'Verification.routeVerified',
    params: {
      url: page.url(),
      frameId: frameTree.frame.id,
      loaderId: frameTree.frame.loaderId,
      label: 'MDX title and exact definition rendered after client navigation',
    },
  });
  check('client navigation loads the next MDX article', true);
  await page.keyboard.press('Escape');
  await page
    .locator('.mobile-detail-tools')
    .getByRole('button', { name: /备忘录与重点/ })
    .click();
  await page.getByRole('dialog').getByRole('textbox').waitFor();
  check('mobile memo opens', true);
  await page.keyboard.press('Escape');
  // Both themes and sizes in every learning direction, plus a legacy article.
  const samples = [
    'agent-loop',
    'transformer',
    'ppo',
    'numerical-standardization',
    'knowledge-representation',
  ];
  for (const slug of samples)
    for (const width of [1440, 375])
      for (const theme of ['dark', 'light']) {
        await page.setViewportSize({ width, height: 1000 });
        await goto(slug);
        if ((await page.locator('html').getAttribute('data-theme')) !== theme)
          await page
            .getByRole('button', { name: '切换浅色或深色显示' })
            .click();
        const view = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth > innerWidth,
          width: innerWidth,
          article: document
            .querySelector('.concept-article')
            .getBoundingClientRect().width,
        }));
        check(
          `${slug} ${width}px ${theme}`,
          view.theme === theme && !view.overflow && view.article > 300,
          view,
        );
        await screenshot(`${slug}-${width}-${theme}`);
      }
  for (const width of [320, 768, 960, 1024, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await goto('numerical-standardization');
    const view = await page.evaluate(() => {
      const nav = document
        .querySelector('.site-nav__links')
        .getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        navCenter: nav.x + nav.width / 2,
        navVisible: nav.width > 0,
        width: innerWidth,
        brand: document
          .querySelector('.site-nav__brand')
          .getBoundingClientRect().width,
      };
    });
    check(
      `responsive shell ${width}px`,
      !view.overflow &&
        view.brand >= 72 &&
        (!view.navVisible || Math.abs(view.navCenter - width / 2) < 1),
      view,
    );
    await screenshot(`shell-${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/category/machine-learning`, {
    waitUntil: 'networkidle',
  });
  await page.locator('#concept-search').fill('Wine 数据中的 hue');
  await page
    .locator('a[href="/concept/numerical-standardization"]')
    .first()
    .waitFor();
  check(
    'search includes actual MDX body',
    (await page
      .locator('a[href="/concept/numerical-standardization"]')
      .count()) > 0,
  );
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('what-is-learning')),
  );
  for (const key of ['learned', 'bookmarks', 'practiced', 'importantConcepts'])
    check(
      `old ${key} records unchanged`,
      JSON.stringify(stored[key]) === JSON.stringify(fixture[key]),
    );
  check(
    'old note records unchanged',
    fixture.notes.every((note) =>
      stored.notes.some((n) => JSON.stringify(n) === JSON.stringify(note)),
    ),
  );
  check('runtime errors', errors.length === 0, { errors });
  verifiedCancellations.push(
    ...cdpFailures.filter((failure) =>
      isVerifiedNavigationCancellation(failure, networkEvents),
    ),
  );
  const unexpectedRequests = requests.filter(
    (request) =>
      !verifiedCancellations.some(
        (c) => c.url === request.url && c.errorText === request.reason,
      ),
  );
  check('no unexplained failed requests', unexpectedRequests.length === 0, {
    unexpectedRequests,
    verifiedCancellations,
  });
  await context.close();
} catch (error) {
  results.push({
    name: 'verification completed',
    pass: false,
    detail: { message: error.message, stack: error.stack },
  });
  process.exitCode = 1;
} finally {
  await browser.close();
  const report = {
    base,
    generatedAt: new Date().toISOString(),
    routes: routes.sort((a, b) => a.slug.localeCompare(b.slug)),
    results,
    errors,
    warnings,
    failedRequests: requests,
    verifiedCancellations,
    cancellationEvidence: networkEvents.filter(
      (e) =>
        e.method === 'Verification.routeVerified' ||
        e.method === 'Page.navigatedWithinDocument' ||
        verifiedCancellations.some((c) => c.requestId === e.params.requestId),
    ),
  };
  writeFileSync(
    join(output, 'browser-results.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(
    JSON.stringify(
      {
        routes: routes.length,
        passed: results.filter((r) => r.pass).length,
        failures: results.filter((r) => !r.pass),
        errors,
        warnings,
        failedRequests: requests,
      },
      null,
      2,
    ),
  );
}
