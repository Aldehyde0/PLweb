/** Formal routes only. Isolated contexts never touch the user's browser data. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { launchBrowser } from './browser-runtime.mjs';
import { isVerifiedNavigationCancellation } from './browser-network.ts';

const base = (process.argv[2] ?? 'http://localhost:8793').replace(/\/$/, '');
const out = 'outputs/layerwise-integration';
mkdirSync(out, { recursive: true });
const browser = await launchBrowser();
const results = [],
  errors = [],
  failedRequests = [],
  consoleErrors = [];
const networkEvents = [],
  cdpFailures = [],
  verifiedCancellations = [];
async function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail });
  console.log(
    `${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` ${JSON.stringify(detail)}` : ''}`,
  );
  assert.ok(pass, name);
  const { frameTree } = await cdp.send('Page.getFrameTree');
  networkEvents.push({
    method: 'Verification.routeVerified',
    params: {
      url: page.url(),
      frameId: frameTree.frame.id,
      loaderId: frameTree.frame.loaderId,
    },
  });
}
const slugs = [
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'reinforcement-learning',
];
const routes = {
  home: '/',
  ...Object.fromEntries(slugs.map((s) => [s, `/category/${s}`])),
  docs: '/concept/numerical-standardization',
  plans: '/plans',
  resources: '/resources',
  practice: '/exercises',
  bookmarks: '/bookmarks',
  mindmap: '/mindmaps/machine-learning',
  'plan-create': '/plans/new',
};
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ['clipboard-read', 'clipboard-write'],
  timezoneId: 'Asia/Shanghai',
});
await context.addInitScript(() => {
  window.__draws = { swarm: 0, scene: 0, count: 0, uniforms: {}, disposed: 0 };
  const names = new WeakMap();
  const gl = WebGL2RenderingContext.prototype;
  const get = Object.getOwnPropertyDescriptor(gl, 'getUniformLocation').value;
  gl.getUniformLocation = function (program, name) {
    const result = get.call(this, program, name);
    if (result) names.set(result, name);
    return result;
  };
  const set = Object.getOwnPropertyDescriptor(gl, 'uniform3fv').value;
  gl.uniform3fv = function (location, value, ...args) {
    window.__draws.uniforms[names.get(location)] = [...value];
    return set.call(this, location, value, ...args);
  };
  const draw = Object.getOwnPropertyDescriptor(gl, 'drawArraysInstanced').value;
  gl.drawArraysInstanced = function (...args) {
    window.__draws.swarm++;
    window.__draws.count = args[3];
    return draw.apply(this, args);
  };
  const dispose = Object.getOwnPropertyDescriptor(gl, 'deleteProgram').value;
  gl.deleteProgram = function (...args) {
    window.__draws.disposed++;
    return dispose.apply(this, args);
  };
  const clear = Object.getOwnPropertyDescriptor(
    CanvasRenderingContext2D.prototype,
    'clearRect',
  ).value;
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    if (this.canvas.closest('.path-visual')) window.__draws.scene++;
    return clear.apply(this, args);
  };
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Page.enable');
for (const method of [
  'Network.requestWillBeSent',
  'Network.loadingFinished',
  'Network.loadingFailed',
  'Page.navigatedWithinDocument',
]) {
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
}
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('requestfailed', (r) =>
  failedRequests.push({ url: r.url(), error: r.failure()?.errorText }),
);
async function goto(route) {
  await page.waitForLoadState('networkidle');
  const response = await page.goto(base + route, {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  assert.equal(response.status(), 200, route);
  await page.locator('main').waitFor();
}
async function theme(value) {
  await page.evaluate((value) => {
    document.documentElement.dataset.theme = value;
    document.documentElement.classList.toggle('dark', value === 'dark');
    localStorage.setItem('how-to-learn-ai-theme', JSON.stringify(value));
  }, value);
  await page.waitForTimeout(100);
}
async function english(name) {
  const content = await page.evaluate(() => ({
    text: document.body.innerText,
    labels: [
      ...document.querySelectorAll('[aria-label], [title], input[placeholder]'),
    ]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => [
        el.getAttribute('aria-label'),
        el.getAttribute('title'),
        el.getAttribute('placeholder'),
      ])
      .flat()
      .join(' '),
    title: document.title,
  }));
  await check(
    name,
    !/\p{Script=Han}/u.test(content.text + content.labels + content.title),
  );
}
try {
  await goto('/');
  await theme('dark');
  await page.waitForTimeout(1800);
  await check(
    'formal homepage draws 1200 live WebGL particles',
    await page.evaluate(
      () => window.__draws.swarm > 5 && window.__draws.count === 1200,
    ),
  );
  await english(
    'homepage text, title, tooltips and accessible names are English',
  );
  const purple = await page.evaluate(() => window.__draws.uniforms.uColor);
  await check(
    'dark particles are purple',
    purple[2] > purple[0] && purple[0] > purple[1],
    purple,
  );
  const before = await page
    .locator('.hero')
    .screenshot({ path: `${out}/animation-home-a.png` });
  await page.mouse.move(980, 440, { steps: 15 });
  await page.mouse.click(980, 440);
  await page.waitForTimeout(250);
  await check(
    'particles change pixels after pointer interaction',
    !before.equals(
      await page
        .locator('.hero')
        .screenshot({ path: `${out}/animation-home-b.png` }),
    ),
  );
  await page
    .getByRole('button', { name: 'Pause particle animation', exact: true })
    .click();
  await page.waitForTimeout(150);
  const frozen = await page
    .locator('.hero')
    .screenshot({ path: `${out}/animation-home-paused-a.png` });
  await page.waitForTimeout(250);
  await check(
    'pause freezes the rendered image',
    frozen.equals(
      await page
        .locator('.hero')
        .screenshot({ path: `${out}/animation-home-paused-b.png` }),
    ),
  );
  await page.locator('.theme-toggle').click();
  await page.waitForTimeout(150);
  const blue = await page.evaluate(() => window.__draws.uniforms.uColor);
  await check(
    'theme control recolors paused particles blue',
    blue[2] > blue[1] && blue[1] > blue[0],
    blue,
  );
  await page
    .getByRole('button', { name: 'Play particle animation', exact: true })
    .click();
  await page.locator('#directions').scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  const offscreen = await page.evaluate(() => window.__draws.swarm);
  await page.waitForTimeout(250);
  await check(
    'offscreen home stops drawing',
    await page.evaluate((n) => window.__draws.swarm === n, offscreen),
  );
  await page
    .getByRole('button', { name: 'Copy Python code', exact: true })
    .click();
  await check(
    'copy includes the actual Python example',
    (await page.evaluate(() => navigator.clipboard.readText())).includes(
      'for step in range(200)',
    ),
  );
  await page.locator('.lw-search-trigger').click();
  await page.locator('#knowledge-search').fill('梯度');
  await english('homepage search displays English labels for Chinese queries');
  await check(
    'homepage search finds real MDX articles',
    (await page
      .locator('.lw-search-results a[href="/concept/gradient-descent"]')
      .count()) === 1,
  );
  await page.locator('#knowledge-search').fill('zzzz-no-results');
  await check(
    'search has an English empty state',
    await page
      .getByText('No matches. Try “machine learning” or “gradient”.', {
        exact: true,
      })
      .isVisible(),
  );
  await page.keyboard.press('Escape');
  await check(
    'search Escape returns focus',
    await page
      .locator('.lw-search-trigger')
      .evaluate((el) => el === document.activeElement),
  );
  await page.locator('.site-nav__links a[href="/plans"]').click();
  await page.locator('.plan-page').waitFor();
  const cleanup = await page.evaluate(() => ({ ...window.__draws }));
  await page.waitForTimeout(250);
  await check(
    'home unmount releases WebGL and stops frames',
    cleanup.disposed > 0 &&
      (await page.evaluate((n) => window.__draws.swarm === n, cleanup.swarm)),
  );

  for (const slug of slugs) {
    await goto(`/category/${slug}`);
    await page.waitForTimeout(350);
    await check(
      `${slug} waits for explicit topic selection`,
      (await page.locator('.topic-tags [aria-pressed="true"]').count()) === 0 &&
        (await page.locator('.path-concept').count()) === 0,
    );
    await english(`${slug} initial chrome is English`);
    const a = await page
      .locator('.path-visual')
      .screenshot({ path: `${out}/animation-${slug}-a.png` });
    await page.waitForTimeout(200);
    await check(
      `${slug} changes actual Canvas pixels`,
      !a.equals(
        await page
          .locator('.path-visual')
          .screenshot({ path: `${out}/animation-${slug}-b.png` }),
      ),
    );
    await page
      .getByRole('button', { name: 'Pause animation', exact: true })
      .click();
    await page.waitForTimeout(100);
    const still = await page
      .locator('.path-visual')
      .screenshot({ path: `${out}/animation-${slug}-paused-a.png` });
    await page.waitForTimeout(180);
    await check(
      `${slug} freezes pixels when paused`,
      still.equals(
        await page
          .locator('.path-visual')
          .screenshot({ path: `${out}/animation-${slug}-paused-b.png` }),
      ),
    );
    await page.getByRole('button', { name: /^All concepts/ }).click();
    await check(
      `${slug} opens real concept titles`,
      (await page.locator('.path-concept').count()) > 0,
    );
  }
  await goto('/category/machine-learning?topic=all');
  await page.locator('#concept-search').fill('Wine 数据中的 hue');
  await page.waitForURL(
    (url) => url.searchParams.get('q') === 'Wine 数据中的 hue',
  );
  await page.waitForLoadState('networkidle');
  await page
    .locator('.path-concept[href="/concept/numerical-standardization"]')
    .waitFor();
  await check(
    'category full-text query commits its actual matching article',
    await page
      .locator('.path-concept[href="/concept/numerical-standardization"]')
      .isVisible(),
  );
  await page
    .getByRole('combobox', { name: 'Difficulty', exact: true })
    .selectOption('入门');
  await page.waitForURL((url) => url.searchParams.get('level') === '入门');
  await page.waitForLoadState('networkidle');
  await page
    .getByRole('combobox', { name: 'Sort concepts', exact: true })
    .selectOption('difficulty-desc');
  await page.waitForURL(
    (url) => url.searchParams.get('sort') === 'difficulty-desc',
  );
  await page.waitForLoadState('networkidle');
  await check(
    'category sort and difficulty commit before refresh',
    (await page
      .getByRole('combobox', { name: 'Difficulty', exact: true })
      .inputValue()) === '入门' &&
      (await page
        .getByRole('combobox', { name: 'Sort concepts', exact: true })
        .inputValue()) === 'difficulty-desc',
  );
  await page.reload({ waitUntil: 'networkidle' });
  await check(
    'category URL restores query, level, sort and topic after refresh',
    (await page.locator('#concept-search').inputValue()) ===
      'Wine 数据中的 hue' &&
      (await page
        .getByRole('combobox', { name: 'Difficulty', exact: true })
        .inputValue()) === '入门' &&
      (await page
        .getByRole('combobox', { name: 'Sort concepts', exact: true })
        .inputValue()) === 'difficulty-desc',
  );
  await page
    .getByRole('combobox', { name: 'Learning status', exact: true })
    .selectOption('learned');
  await page.waitForURL((url) => url.searchParams.get('status') === 'learned');
  await page.waitForLoadState('networkidle');
  await page.goBack({ waitUntil: 'networkidle' });
  await check(
    'category Back restores previous filters',
    (await page
      .getByRole('combobox', { name: 'Learning status', exact: true })
      .inputValue()) === 'all',
  );
  await page
    .getByRole('button', { name: 'Clear filters', exact: true })
    .click();
  await page.waitForURL((url) => !url.search);
  await page.locator('.topic-welcome').waitFor();
  await check(
    'clearing category restores unselected welcome',
    (await page.locator('.topic-welcome').isVisible()) &&
      !page.url().includes('?'),
  );

  await goto('/resources');
  const card = page.locator('.resource-card').first();
  const title = await card.locator('h2').innerText();
  await card.getByRole('button', { name: '收藏资料', exact: true }).click();
  await card.getByRole('button', { name: '标记已查看', exact: true }).click();
  await card.locator('.resource-note summary').click();
  await card.locator('textarea').fill('Layerwise integration: resource note');
  await page.reload({ waitUntil: 'networkidle' });
  const savedCard = page
    .locator('.resource-card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  await check(
    'resource bookmark, read state and note survive refresh',
    (await savedCard
      .getByRole('button', { name: '取消收藏资料', exact: true })
      .getAttribute('aria-pressed')) === 'true' &&
      (await savedCard
        .getByRole('button', { name: '已查看', exact: true })
        .getAttribute('aria-pressed')) === 'true' &&
      (await savedCard.locator('textarea').inputValue()) ===
        'Layerwise integration: resource note',
  );
  await page
    .locator('.lw-workspace-sidebar')
    .getByRole('button', { name: /^我的收藏/ })
    .click();
  await page.waitForURL((url) => url.searchParams.get('view') === 'bookmarked');
  await page.waitForLoadState('networkidle');
  await check(
    'resource bookmark filter uses original store',
    (await page.locator('.resource-card').count()) === 1 &&
      page.url().includes('view=bookmarked'),
  );
  await page.reload({ waitUntil: 'networkidle' });
  await check(
    'resource filter restores from URL',
    (await page.locator('.resource-card').count()) === 1,
  );

  await goto('/exercises');
  const exercise = page.locator('[data-exercise]').first();
  await exercise.getByRole('button', { name: '查看答案', exact: true }).click();
  await check(
    'practice expands formatted real answer',
    (await exercise
      .getByRole('button', { name: '收起答案', exact: true })
      .getAttribute('aria-expanded')) === 'true',
  );
  await exercise
    .getByRole('button', { name: '标记为已练习', exact: true })
    .click();
  await page.reload({ waitUntil: 'networkidle' });
  await check(
    'practice completion persists',
    (await page
      .locator('[data-exercise]')
      .first()
      .getByRole('button', { name: '已完成', exact: true })
      .getAttribute('aria-pressed')) === 'true',
  );
  const firstPage = await page
    .locator('[data-exercise]')
    .evaluateAll((els) => els.map((el) => el.dataset.exercise));
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await page.waitForURL((url) => url.searchParams.get('page') === '2');
  await page.waitForLoadState('networkidle');
  const secondPage = await page
    .locator('[data-exercise]')
    .evaluateAll((els) => els.map((el) => el.dataset.exercise));
  await check(
    'pagination has no duplicates and covers all 32 exercises',
    new Set([...firstPage, ...secondPage]).size === 32 &&
      firstPage.length === 20 &&
      secondPage.length === 12,
  );
  await page.reload({ waitUntil: 'networkidle' });
  await check(
    'practice page restores on refresh',
    page.url().includes('page=2') &&
      (await page.locator('[data-exercise]').count()) === 12,
  );

  await goto('/plans/new');
  await page.locator('#plan-title').fill('Layerwise integration test plan');
  await page.locator('#weekly-minutes').fill('120');
  await page.locator('label[for="plan-option-resources"]').click();
  await page.getByRole('button', { name: '生成计划', exact: true }).click();
  await page.getByRole('heading', { name: '计划预览', exact: true }).waitFor();
  await check(
    'plan generation leaves storage empty before confirmation',
    await page.evaluate(
      () =>
        !localStorage.getItem('how-to-learn-ai-plans-v1') ||
        JSON.parse(localStorage.getItem('how-to-learn-ai-plans-v1')).plans
          .length === 0,
    ),
  );
  await page.getByRole('button', { name: '确认并保存', exact: true }).click();
  await page.locator('.plan-detail-header').waitFor();
  const planUrl = new URL(page.url()).pathname;
  await page.getByRole('button', { name: '暂停计划', exact: true }).click();
  await check(
    'plan pauses',
    await page
      .getByRole('button', { name: '恢复计划', exact: true })
      .isVisible(),
  );
  await page.reload({ waitUntil: 'networkidle' });
  await check(
    'saved plan and paused state restore',
    (await page
      .getByRole('heading', {
        name: 'Layerwise integration test plan',
        exact: true,
      })
      .isVisible()) &&
      (await page
        .getByRole('button', { name: '恢复计划', exact: true })
        .isVisible()),
  );
  await goto('/category/machine-learning');
  await english('category remains English with an existing paused plan');
  await goto(planUrl);
  await page.getByRole('button', { name: '恢复计划', exact: true }).click();
  const resourceTask = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('how-to-learn-ai-plans-v1'))
      .plans[0].phases.flatMap((p) => p.tasks)
      .find((t) => t.resourceId),
  );
  await check(
    'reference-resource tasks are generated from the real library',
    Boolean(resourceTask),
  );
  const learnedBeforeResource = await page.evaluate(
    () => JSON.parse(localStorage.getItem('what-is-learning')).learned,
  );
  await page
    .locator(`[id="task-${resourceTask.id}"]`)
    .getByRole('button', { name: '完成', exact: true })
    .click();
  await check(
    'completing a resource task does not mark a concept learned',
    JSON.stringify(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('what-is-learning')).learned,
      ),
    ) === JSON.stringify(learnedBeforeResource),
  );
  const task = page
    .locator('.plan-task')
    .filter({ has: page.locator('.plan-task-substeps') })
    .first();
  await task.locator('.plan-task-substeps summary').click();
  const substep = task
    .locator('.plan-task-substeps input[type="checkbox"]')
    .first();
  const substepId = await substep.getAttribute('id');
  await substep.check();
  await page.reload({ waitUntil: 'networkidle' });
  await check(
    'plan substep progress restores after refresh',
    await page.locator(`[id="${substepId}"]`).isChecked(),
  );
  await page
    .getByRole('button', { name: '调整计划', exact: true })
    .first()
    .click();
  await page
    .locator('.plan-inline-form textarea')
    .fill('Verified editable learning goal');
  await page.getByRole('button', { name: '保存调整', exact: true }).click();
  await check(
    'plan edits use the original persistent store',
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('how-to-learn-ai-plans-v1')).plans[0]
          .goal === 'Verified editable learning goal',
    ),
  );
  await page
    .getByRole('button', { name: '进入阶段测试', exact: true })
    .first()
    .click();
  await page
    .getByRole('button', { name: '提交并查看结果', exact: true })
    .click();
  while (
    await page.getByRole('button', { name: '还需要复习', exact: true }).count()
  )
    await page
      .getByRole('button', { name: '还需要复习', exact: true })
      .first()
      .click();
  await check(
    'empty stage-test submission scores zero after honest self-assessment',
    (await page.locator('.test-result-hero h1').innerText()) === '0 分',
  );
  await page.getByRole('button', { name: '返回计划详情', exact: true }).click();
  await goto(`${planUrl}/today`);
  await check(
    'today view retains formal workspace',
    await page.locator('.lw-workspace-sidebar').isVisible(),
  );
  await goto(`${planUrl}/week`);
  await check(
    'week view retains formal workspace',
    await page.locator('.lw-workspace-sidebar').isVisible(),
  );
  await goto(planUrl);
  await page.screenshot({ path: `${out}/plan-detail.png` });
  await goto('/');
  await english(
    'homepage remains English with a saved plan and learning history',
  );
  const download = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Export progress', exact: true })
    .click();
  const backupFile = await download;
  await backupFile.saveAs(`${out}/test-progress-backup.json`);
  const backup = JSON.parse(
    readFileSync(`${out}/test-progress-backup.json`, 'utf8'),
  );
  await check(
    'backup exports real learning, plans and resources',
    backup.data.plans.plans.length === 1 &&
      backup.data.resources.bookmarkIds.length === 1,
  );
  await page
    .locator('input[type="file"]')
    .setInputFiles(`${out}/test-progress-backup.json`);
  await page
    .getByRole('button', { name: 'Import and replace', exact: true })
    .click();
  await page.waitForTimeout(200);
  await check(
    'backup restore retains data',
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('how-to-learn-ai-resources-v1'))
          .bookmarkIds.length === 1,
    ),
  );
  await goto('/plans');
  await page.locator('.plan-delete-trigger').click();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await check(
    'canceling plan deletion preserves its record',
    (await page.locator('.plan-card').count()) === 1,
  );
  await page.locator('.plan-delete-trigger').click();
  await page.getByRole('button', { name: '确认删除', exact: true }).click();
  await check(
    'confirmed deletion removes only the plan and keeps learning data',
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('how-to-learn-ai-plans-v1')).plans
          .length === 0 &&
        JSON.parse(localStorage.getItem('how-to-learn-ai-resources-v1'))
          .bookmarkIds.length === 1,
    ),
  );
  // Restore the verified backup for the screenshot set containing a real plan.
  await goto('/');
  await page
    .locator('input[type="file"]')
    .setInputFiles(`${out}/test-progress-backup.json`);
  await page
    .getByRole('button', { name: 'Import and replace', exact: true })
    .click();

  for (const [name, route] of Object.entries(routes)) {
    for (const mode of ['dark', 'light']) {
      await goto(route);
      await theme(mode);
      for (const width of [320, 375, 768, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.waitForTimeout(60);
        const layout = await page.evaluate(() => {
          const brand = document
            .querySelector('.site-nav__brand')
            .getBoundingClientRect();
          const nav = document
            .querySelector('.site-nav__links')
            .getBoundingClientRect();
          const tools = document
            .querySelector('.site-nav__tools')
            .getBoundingClientRect();
          const overflowing = [...document.querySelectorAll('main *')]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              const s = getComputedStyle(el);
              return (
                r.width > 0 &&
                (r.right > innerWidth + 1 || r.left < -1) &&
                s.position !== 'fixed' &&
                !el.closest(
                  'pre,.katex-display,.code-lines,.overflow-x-auto,.mindmap-viewport,[hidden]',
                )
              );
            })
            .slice(0, 4)
            .map((el) => el.className);
          return {
            width: innerWidth,
            document: document.documentElement.scrollWidth,
            nav: nav.width > 0,
            center: nav.x + nav.width / 2,
            collision:
              brand.right > tools.left ||
              (nav.width > 0 &&
                (brand.right > nav.left || nav.right > tools.left)),
            overflowing,
          };
        });
        await check(
          `${name} ${mode} ${width}px fits and navigation is centered`,
          layout.document <= width &&
            layout.overflowing.length === 0 &&
            !layout.collision &&
            (!layout.nav || Math.abs(layout.center - width / 2) < 1),
          layout,
        );
        if (width === 375) {
          const smallTargets = await page.evaluate(() =>
            [
              ...document.querySelectorAll(
                '.site-nav button,.site-nav__brand,.path-explore,.topic-tags button,.current-home .button,.current-home .icon-button,.lw-workspace button,.lw-workspace select,.lw-workspace summary,.resource-concepts a,.concept-actions button,.mobile-detail-tools button',
              ),
            ]
              .map((el) => ({
                text: el.getAttribute('aria-label') ?? el.textContent.trim(),
                rect: el.getBoundingClientRect(),
              }))
              .filter(
                (x) =>
                  x.rect.width > 0 &&
                  x.rect.height > 0 &&
                  (x.rect.width < 43.9 || x.rect.height < 43.9),
              )
              .map((x) => ({
                text: x.text,
                width: x.rect.width,
                height: x.rect.height,
              })),
          );
          await check(
            `${name} ${mode} mobile controls meet 44px targets`,
            smallTargets.length === 0,
            smallTargets,
          );
        }
        if ([375, 1440].includes(width)) {
          if (name === 'home') {
            await page.mouse.move(width * 0.7, 420, { steps: 8 });
            await page.waitForTimeout(900);
          }
          await page.screenshot({
            path: `${out}/${name}-${mode}-${width}.png`,
          });
        }
      }
    }
  }
  await goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(250);
  const reduced = await page.evaluate(() => window.__draws.swarm);
  await page.waitForTimeout(200);
  await check(
    'reduced motion freezes home rendering',
    (await page
      .getByRole('button', { name: 'Play particle animation', exact: true })
      .isDisabled()) &&
      (await page.evaluate((n) => window.__draws.swarm <= n + 1, reduced)),
  );
  for (const slug of slugs) {
    await goto(`/category/${slug}`);
    await page.waitForTimeout(100);
    const n = await page.evaluate(() => window.__draws.scene);
    await page.waitForTimeout(200);
    await check(
      `${slug} honors reduced motion`,
      (await page
        .getByRole('button', { name: 'Play animation', exact: true })
        .isDisabled()) &&
        (await page.evaluate((n) => window.__draws.scene <= n + 1, n)),
    );
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await goto('/category/machine-learning?topic=all');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  const sceneOffscreen = await page.evaluate(() => window.__draws.scene);
  await page.waitForTimeout(200);
  await check(
    'offscreen category stops rendering',
    await page.evaluate((n) => window.__draws.scene === n, sceneOffscreen),
  );
  await page.locator('.site-nav__links a[href="/plans"]').click();
  await page.waitForLoadState('networkidle');
  const sceneUnmounted = await page.evaluate(() => window.__draws.scene);
  await page.waitForTimeout(150);
  await check(
    'category unmount stops rendering',
    await page.evaluate((n) => window.__draws.scene === n, sceneUnmounted),
  );

  await page.setViewportSize({ width: 375, height: 900 });
  await goto('/');
  await page.waitForFunction(() => window.__draws.count === 650);
  await check(
    'mobile home draws the approved 650-particle configuration',
    await page.evaluate(() => window.__draws.count === 650),
  );
  await goto('/resources');
  await page.getByRole('button', { name: '筛选与导航', exact: true }).click();
  await check(
    'mobile workspace drawer opens',
    await page.locator('.lw-workspace-drawer').isVisible(),
  );
  await page.keyboard.press('Escape');
  await check(
    'drawer Escape returns keyboard focus',
    await page
      .getByRole('button', { name: '筛选与导航', exact: true })
      .evaluate((el) => el === document.activeElement),
  );
  await page
    .getByRole('button', { name: 'Open navigation', exact: true })
    .click();
  await check(
    'mobile global navigation retains bookmarks',
    await page
      .locator('#mobile-nav')
      .getByRole('link', { name: 'Bookmarks', exact: true })
      .isVisible(),
  );
  await page.keyboard.press('Escape');
  await check(
    'global navigation Escape closes and returns focus',
    await page
      .getByRole('button', { name: 'Open navigation', exact: true })
      .evaluate((el) => el === document.activeElement),
  );

  const fallbackContext = await browser.newContext({
    viewport: { width: 375, height: 900 },
  });
  await fallbackContext.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.goto(base, { waitUntil: 'networkidle' });
  await check(
    'home fallback keeps content and learning CTA usable',
    await fallbackPage.locator('.button-primary').isVisible(),
  );
  await fallbackPage.goto(`${base}/category/machine-learning`, {
    waitUntil: 'networkidle',
  });
  await check(
    'category has an explicit no-Canvas fallback',
    (await fallbackPage.locator('.path-fallback').isVisible()) &&
      (await fallbackPage
        .getByRole('button', { name: 'Pause animation', exact: true })
        .isDisabled()),
  );
  await fallbackPage.screenshot({ path: `${out}/category-no-canvas.png` });
  await fallbackContext.close();

  const corruptContext = await browser.newContext();
  await corruptContext.addInitScript(() =>
    localStorage.setItem('what-is-learning', '{broken-original-record'),
  );
  const corruptPage = await corruptContext.newPage();
  await corruptPage.goto(base, { waitUntil: 'networkidle' });
  await check(
    'corrupt learning records are preserved with an English alert',
    (await corruptPage.locator('.persistence-banner').isVisible()) &&
      (await corruptPage.evaluate(
        () =>
          localStorage.getItem('what-is-learning') ===
            '{broken-original-record' &&
          !/\p{Script=Han}/u.test(document.body.innerText),
      )),
  );
  await corruptContext.close();

  const quotaContext = await browser.newContext();
  await quotaContext.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Test storage quota', 'QuotaExceededError');
    };
  });
  const quotaPage = await quotaContext.newPage();
  await quotaPage.goto(base, { waitUntil: 'networkidle' });
  await quotaPage.locator('.theme-toggle').click();
  await check(
    'write failure remains visible and English on home',
    (await quotaPage.locator('.persistence-banner').isVisible()) &&
      (await quotaPage.evaluate(
        () => !/\p{Script=Han}/u.test(document.body.innerText),
      )),
  );
  await quotaPage.screenshot({ path: `${out}/home-storage-failure.png` });
  await quotaContext.close();
  await check(
    'formal runtime has no page or console errors',
    errors.length === 0 && consoleErrors.length === 0,
    { errors, consoleErrors },
  );
  verifiedCancellations.push(
    ...cdpFailures.filter((failure) =>
      isVerifiedNavigationCancellation(failure, networkEvents),
    ),
  );
  const unexplained = failedRequests.filter(
    (request) =>
      !verifiedCancellations.some(
        (c) => c.url === request.url && c.errorText === request.error,
      ),
  );
  await check(
    'formal runtime has no unexplained failed requests',
    unexplained.length === 0,
    { unexplained, verifiedCancellations },
  );
} catch (error) {
  results.push({ name: error.message, pass: false });
  console.error(error);
  await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  writeFileSync(
    `${out}/browser-results.json`,
    JSON.stringify(
      {
        base,
        results,
        errors,
        consoleErrors,
        failedRequests,
        verifiedCancellations,
      },
      null,
      2,
    ),
  );
}
