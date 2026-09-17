/**
 * Browser verification against a running production Workers preview.
 *
 * Drives the locally installed Chrome over the DevTools Protocol using Node's
 * built-in fetch and WebSocket, so it adds no dependencies to the project.
 *
 * Usage:
 *   npm run build
 *   npx wrangler dev --config dist/server/wrangler.json --port 8788
 *   node --experimental-strip-types scripts/verify-browser.ts http://127.0.0.1:8788
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import {
  generatePlan,
  PLAN_STATE_VERSION,
  type PlanConcept,
  type PlanFormInput,
} from '../lib/plan-engine.ts';

const baseUrl = (process.argv[2] ?? 'http://127.0.0.1:8788').replace(/\/$/, '');

/**
 * Builds the plan state injected into the browser, using the real engine so the
 * UI is exercised against genuinely generated tasks and stage-test questions.
 */
function buildVerificationPlanState(title: string) {
  const concepts: PlanConcept[] = [
    {
      slug: 'gradient-descent',
      title: '梯度下降',
      category: 'machine-learning',
      difficulty: '入门',
      prerequisites: ['导数'],
      hasCode: true,
      hasInteractive: true,
      hasFormula: true,
      definition: [
        '梯度下降是一种沿目标函数负梯度方向迭代更新参数的优化方法，它利用局部斜率逐步寻找更低的损失值。',
      ],
      summary: '它解决模型参数无法直接求得最优解时的数值优化问题。',
      principles: ['学习率决定每次更新步长，梯度方向决定参数变化方向。'],
      relatedConcepts: ['learning-rate-selection'],
    },
    {
      slug: 'supervised-learning',
      title: '监督学习',
      category: 'machine-learning',
      difficulty: '入门',
      prerequisites: ['Python 基础'],
      hasCode: true,
      hasInteractive: false,
      definition: ['从带标签样本中学习输入到目标的映射。'],
      summary: '像带答案练习：模型看过许多“题目—答案”对，再尝试回答新题。',
      principles: ['选择参数化函数，用训练样本上的损失衡量预测误差。'],
    },
  ];
  const input: PlanFormInput = {
    title,
    goal: '浏览器端验证',
    categories: ['machine-learning'],
    method: 'knowledge-route',
    level: '入门',
    weeklyMinutes: 300,
    targetDate: '2027-06-30',
    includeCode: true,
    includeTests: true,
    includeReview: true,
  };
  const plan = generatePlan(input, concepts, { learned: [], bookmarks: [] }, new Date());
  return {
    version: PLAN_STATE_VERSION,
    plans: [plan],
    activities: [],
    reminder: {
      activePlanId: plan.id,
      lastStudyAt: null,
      lastStudyDate: null,
      lastOpenedAt: new Date().toISOString(),
      lastReminderDate: null,
      reminderDismissedDate: null,
    },
    completedTaskIds: [],
  };
}

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter((value): value is string => Boolean(value));

const resolvedChromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!resolvedChromePath) {
  console.error(
    `No Chrome/Edge binary found. Set CHROME_PATH to run the browser verification.\nTried:\n  ${CHROME_CANDIDATES.join('\n  ')}`,
  );
  process.exit(2);
}
const chromePath: string = resolvedChromePath;

const port = 9222 + Math.floor(Math.random() * 200);
const profileDir = mkdtempSync(join(tmpdir(), 'dsh-cdp-'));
const chromeProcesses: ChildProcess[] = [];
const failures: string[] = [];
const checks: string[] = [];

/**
 * Guards the temporary-profile removal: the generator must resolve to a path
 * inside the OS temp directory, otherwise cleanup is skipped rather than
 * deleting something unexpected. Returns false instead of throwing so the
 * `finally` block can never mask a real failure.
 */
function isInsideTempDirectory(directory: string): boolean {
  try {
    const resolved = realpathSync(directory);
    const tempRoot = realpathSync(tmpdir());
    return resolved !== tempRoot && resolved.startsWith(tempRoot + sep);
  } catch {
    return false;
  }
}

function check(name: string, condition: boolean, detail = '') {
  checks.push(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!condition) failures.push(name);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CdpMessage {
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: { message?: string };
  sessionId?: string;
}

/** Minimal DevTools Protocol client for one page target. */
class CdpClient {
  private socket!: WebSocket;
  private nextId = 1;
  private pending = new Map<number, (message: CdpMessage) => void>();
  readonly events: CdpMessage[] = [];

  static async attach(webSocketDebuggerUrl: string) {
    const client = new CdpClient();
    client.socket = new WebSocket(webSocketDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      client.socket.addEventListener('open', () => resolve(), { once: true });
      client.socket.addEventListener(
        'error',
        () => reject(new Error('DevTools socket failed')),
        { once: true },
      );
    });
    client.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as CdpMessage;
      if (message.id && client.pending.has(message.id)) {
        client.pending.get(message.id)!(message);
        client.pending.delete(message.id);
        return;
      }
      if (message.method) client.events.push(message);
    });
    return client;
  }

  send<T = Record<string, unknown>>(
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, (message) => {
        if (message.error) reject(new Error(`${method}: ${message.error.message}`));
        else resolve((message.result ?? {}) as T);
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    try {
      this.socket.close();
    } catch {
      /* already closed */
    }
  }
}

async function waitForJson<T>(url: string, attempts = 60): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return (await response.json()) as T;
    } catch {
      /* not ready yet */
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  chromeProcesses.push(
    spawn(
      chromePath,
      [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-sync',
        '--window-size=1280,900',
        'about:blank',
      ],
      { stdio: 'ignore' },
    ),
  );

  const version = await waitForJson<{ webSocketDebuggerUrl: string }>(
    `http://127.0.0.1:${port}/json/version`,
  );
  const browser = await CdpClient.attach(version.webSocketDebuggerUrl);
  const { targetId } = await browser.send<{ targetId: string }>(
    'Target.createTarget',
    { url: 'about:blank' },
  );
  const page = await CdpClient.attach(
    (await waitForJson<Array<{ id: string; webSocketDebuggerUrl: string }>>(
      `http://127.0.0.1:${port}/json/list`,
    )).find((target) => target.id === targetId)!.webSocketDebuggerUrl,
  );

  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Log.enable');
  await page.send('Network.enable');
  // Capture the real rejection reason: the app logs `undefined` for a rejected
  // promise with no value, so the reason is recorded separately here.
  await page.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      window.__dshRejections = [];
      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        let described;
        if (reason instanceof Error) described = reason.name + ': ' + reason.message + '\\n' + (reason.stack ?? '');
        else if (reason === undefined) described = 'undefined (promise rejected without a value)';
        else if (typeof reason === 'string') described = 'string: ' + reason;
        else { try { described = 'value: ' + JSON.stringify(reason); } catch { described = 'unserializable ' + Object.prototype.toString.call(reason); } }
        window.__dshRejections.push(described);
      });
      window.__dshErrors = [];
      window.addEventListener('error', (event) => {
        window.__dshErrors.push(String(event.message));
      });
    })();`,
  });
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const evaluate = async <T>(expression: string): Promise<T> => {
    const result = await page.send<{
      result: { value?: T };
      exceptionDetails?: { text?: string };
    }>('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails)
      throw new Error(result.exceptionDetails.text ?? 'evaluate failed');
    return result.result.value as T;
  };

  /** Polls an expression until it is truthy, instead of guessing a delay. */
  const waitFor = async (
    expression: string,
    timeoutMs = 15000,
    label = expression,
  ) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        if (await evaluate<boolean>(`Boolean(${expression})`)) return true;
      } catch {
        /* navigation in flight */
      }
      await sleep(150);
    }
    throw new Error(`timed out waiting for ${label}`);
  };

  const consoleErrors: string[] = [];
  page.events.length = 0;

  const navigateMarker = `window.__dshMarker = (window.__dshMarker ?? 0) + 1; window.__dshMarker;`;

  const goto = async (path: string, waitMs = 400) => {
    await page.send('Page.navigate', { url: `${baseUrl}${path}` });
    // Wait for real content rather than a fixed delay: a shell that has not
    // hydrated yet would make the assertions below flaky. The threshold is low
    // because some routes legitimately render mostly empty states.
    await waitFor(
      `document.body && document.querySelector('main') && document.body.innerText.trim().length > 40`,
      20000,
      `content on ${path}`,
    );
    if (waitMs) await sleep(waitMs);
    await evaluate(navigateMarker);
    return evaluate<{
      status: number;
      title: string;
      text: string;
      url: string;
    }>(`(() => ({
      status: 0,
      title: document.title,
      text: document.body ? document.body.innerText.slice(0, 600) : '',
      url: location.pathname,
    }))()`);
  };

  const failedRequests: string[] = [];
  const requestUrls = new Map<string, string>();
  const collectNetwork = () => {
    for (const event of page.events) {
      if (event.method === 'Network.requestWillBeSent') {
        const params = event.params as {
          requestId?: string;
          request?: { url?: string };
        };
        if (params.requestId && params.request?.url)
          requestUrls.set(params.requestId, params.request.url);
      }
      if (event.method === 'Network.loadingFailed') {
        const params = event.params as {
          errorText?: string;
          type?: string;
          requestId?: string;
        };
        if (params.type !== 'Font' || !/aborted/i.test(params.errorText ?? '')) {
          const url = params.requestId
            ? (requestUrls.get(params.requestId) ?? 'unknown-url')
            : 'unknown-url';
          failedRequests.push(
            `${params.type}:${params.errorText}:${url.replace(baseUrl, '')}`,
          );
        }
      }
      if (event.method === 'Runtime.consoleAPICalled') {
        const params = event.params as { type?: string; args?: Array<{ value?: unknown }> };
        if (params.type === 'error')
          consoleErrors.push(
            params.args?.map((arg) => String(arg.value)).join(' ') ?? '',
          );
      }
      if (event.method === 'Log.entryAdded') {
        const params = event.params as { entry?: { level?: string; text?: string } };
        if (params.entry?.level === 'error')
          consoleErrors.push(params.entry.text ?? '');
      }
    }
    page.events.length = 0;
  };

  // ------------------------------------------------------------ route rendering
  const report = (name: string, passed: boolean, detail: string) =>
    console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);

  const routeExpectations: Array<[string, RegExp]> = [
    ['/', /从理解概念|个人 AI 学习工作台/],
    ['/category/machine-learning', /机器学习/],
    ['/concept/gradient-descent', /梯度下降/],
    ['/resources', /资源/],
    ['/bookmarks', /收藏|书签/],
    ['/exercises', /练习/],
    ['/plans', /计划/],
    ['/plans/new', /计划/],
  ];

  for (const [path, pattern] of routeExpectations) {
    await goto(path);
    const state = await evaluate<{ title: string; text: string }>(
      `({ title: document.title, text: document.body.innerText })`,
    );
    const ok = pattern.test(state.title) || pattern.test(state.text);
    check(`${path} is served over Workers and renders`, ok, state.title.trim());
    if (!ok) report(path, false, state.text.slice(0, 120));
  }

  // ------------------------------------------------------------ font requests
  await goto('/concept/gradient-descent', 1500);
  const fontResult = await evaluate<string>(
    `(async () => {
      const faces = [...document.fonts].map((face) => face.family);
      await document.fonts.ready;
      return JSON.stringify({ faces: faces.length, loaded: [...document.fonts].filter((f) => f.status === 'loaded').length });
    })()`,
  );
  check(
    'KaTeX fonts are registered and loaded in the browser',
    JSON.parse(fontResult).faces > 0,
    fontResult,
  );
  const fontRequests = await evaluate<number>(
    `performance.getEntriesByType('resource').filter((e) => e.name.includes('/fonts/') && e.name.endsWith('.woff2')).length`,
  );
  check('font requests target /fonts/*.woff2', fontRequests > 0, `${fontRequests} requests`);

  // ------------------------------------------------------------ client navigation
  // Clicking a real link must be handled by the client router: no document
  // reload, and the marker installed in this document must survive.
  await goto('/plans', 1500);
  const navigated = await evaluate<string>(
    `(async () => {
      const before = window.__dshMarker;
      const link = document.querySelector('a[href="/resources"]');
      if (!link) return JSON.stringify({ ok: false, reason: 'no-link' });
      link.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
        buttons: 0,
        detail: 1,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      }));
      await new Promise((resolve) => setTimeout(resolve, 1800));
      return JSON.stringify({
        ok: location.pathname === '/resources' && window.__dshMarker === before,
        path: location.pathname,
        markerBefore: before,
        markerAfter: window.__dshMarker,
      });
    })()`,
  );
  const navigation = JSON.parse(navigated) as {
    ok: boolean;
    path?: string;
    reason?: string;
    markerBefore?: number;
    markerAfter?: number;
  };
  check(
    'client-side navigation works without a full reload',
    navigation.ok,
    navigated,
  );

  // ------------------------------------------------------------ 404 page
  await goto('/definitely-not-a-page', 1200);
  const notFoundText = await evaluate<string>('document.body.innerText.slice(0, 300)');
  check(
    'an unknown path renders the 404 page',
    /404|找不到|不存在/.test(notFoundText),
    notFoundText.replace(/\s+/g, ' ').slice(0, 80),
  );

  // ------------------------------------------------------------ theme toggle
  await goto('/');
  await waitFor(`Boolean(document.querySelector('.theme-toggle'))`, 15000, 'theme toggle');
  const themeBefore = await evaluate<string>('document.documentElement.dataset.theme ?? ""');
  const themeAfter = await evaluate<string>(
    `(async () => {
      const button = document.querySelector('.theme-toggle');
      if (!button) return 'no-button';
      button.click();
      await new Promise((resolve) => setTimeout(resolve, 300));
      return document.documentElement.dataset.theme ?? '';
    })()`,
  );
  const storedTheme = await evaluate<string>(
    `(() => { const raw = localStorage.getItem('how-to-learn-ai-theme'); try { return JSON.parse(raw) ?? ''; } catch { return raw ?? ''; } })()`,
  );
  check(
    'the theme toggle switches the applied theme and stores the choice',
    themeBefore !== themeAfter &&
      (themeAfter === 'light' || themeAfter === 'dark') &&
      storedTheme === themeAfter,
    `${themeBefore} -> ${themeAfter}, stored=${storedTheme}`,
  );
  await goto('/');
  const themeAfterReload = await evaluate<string>(
    'document.documentElement.dataset.theme ?? ""',
  );
  check(
    'the chosen theme survives a reload',
    themeAfterReload === themeAfter,
    `applied=${themeAfterReload} expected=${themeAfter}`,
  );

  // ------------------------------------------------- theme / layout regressions
  // These run against the built artifacts in the real browser: they measure
  // computed layout and contrast rather than trusting the stylesheet source.
  const REVIEW_DIR = 'outputs/ui-review';
  mkdirSync(REVIEW_DIR, { recursive: true });

  /** Switches the document to `theme` and waits for the attribute to settle. */
  const applyTheme = async (theme: 'light' | 'dark') => {
    await evaluate(
      `(() => {
        const next = ${JSON.stringify(theme)};
        document.documentElement.dataset.theme = next;
        document.documentElement.classList.toggle('dark', next === 'dark');
        try { localStorage.setItem('how-to-learn-ai-theme', JSON.stringify(next)); } catch {}
        return next;
      })()`,
    );
    await waitFor(
      `document.documentElement.dataset.theme === ${JSON.stringify(theme)}`,
      5000,
      `${theme} theme applied`,
    );
  };

  /** Shared helpers injected into every measurement expression. */
  const MEASURE_HELPERS = `
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const rgb = (color) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    const lum = (c) => c.slice(0, 3).map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const background = (el) => {
      while (el) {
        const c = rgb(getComputedStyle(el).backgroundColor);
        if (c[3] === 255) return c;
        el = el.parentElement;
      }
      return rgb('white');
    };
    const contrast = (el) => {
      const a = lum(rgb(getComputedStyle(el).color));
      const b = lum(background(el));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const visible = (el) => el.getClientRects().length > 0;
  `;

  const WIDTHS = [320, 375, 414, 768, 1440];

  for (const theme of ['light', 'dark'] as const) {
    for (const width of WIDTHS) {
      await page.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await goto('/');
      await applyTheme(theme);

      // --- homepage: four equal cards whose text wraps inside the card
      const cards = await evaluate<{
        count: number;
        equalWidth: boolean;
        equalHeight: boolean;
        noOverflow: boolean;
        descriptionsWrap: boolean;
        pageFits: boolean;
      }>(`(() => {
        ${MEASURE_HELPERS}
        const nodes = [...document.querySelectorAll('.direction-card')];
        const rects = nodes.map((c) => c.getBoundingClientRect());
        const paragraphs = nodes.map((c) => c.querySelector('p')).filter(Boolean);
        return {
          count: nodes.length,
          equalWidth: rects.length > 0 && rects.every((r) => Math.abs(r.width - rects[0].width) < 1),
          equalHeight: rects.length > 0 && rects.every((r) => Math.abs(r.height - rects[0].height) < 1),
          noOverflow: nodes.every((c) => c.scrollWidth <= c.clientWidth + 1 && c.scrollHeight <= c.clientHeight + 1),
          descriptionsWrap: paragraphs.every((p) => {
            const style = getComputedStyle(p);
            return style.whiteSpace !== 'nowrap' && p.scrollWidth <= p.clientWidth + 1;
          }),
          pageFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
        };
      })()`);
      check(
        `${theme} home has 4 equal cards with wrapped text at ${width}px`,
        cards.count === 4 &&
          cards.equalWidth &&
          cards.equalHeight &&
          cards.noOverflow &&
          cards.descriptionsWrap &&
          cards.pageFits,
        JSON.stringify(cards),
      );

      for (const route of [
        '/category/artificial-intelligence',
        '/concept/ai-overview',
        '/resources',
      ]) {
        await goto(route);
        await applyTheme(theme);
        const visuals = await evaluate<{
          fits: boolean;
          minContrast: number;
          minContrastSelector: string;
          darkPanels: string[];
        }>(`(() => {
          ${MEASURE_HELPERS}
          const nodes = [...document.querySelectorAll(
            '.ai-directory-index h2, .ai-directory-index p, .ai-directory-tabs button, ' +
            '.ai-info-card h3, .ai-info-card li, .definition-callout, .definition-callout p, ' +
            '.resource-card h3, .demo-status p, .demo-stage p'
          )].filter(visible);
          let minContrast = 21;
          let minContrastSelector = '';
          for (const el of nodes) {
            const value = contrast(el);
            if (value < minContrast) {
              minContrast = value;
              minContrastSelector = el.className || el.tagName;
            }
          }
          // In light mode no content panel may stay dark.
          const panels = [...document.querySelectorAll(
            '.ai-directory-index, .ai-info-card, .definition-callout, .official-source-panel, ' +
            '.demo-info, .demo-stage, .rl-stage, .edu-panel, main > section'
          )].filter(visible);
          const darkPanels = panels
            .filter((el) => lum(background(el)) < 0.5)
            .map((el) => el.className || el.tagName);
          return {
            fits: document.documentElement.scrollWidth <= window.innerWidth + 1,
            minContrast,
            minContrastSelector,
            darkPanels: [...new Set(darkPanels)],
          };
        })()`);
        check(
          `${theme} ${route} readable at ${width}px`,
          visuals.fits &&
            visuals.minContrast >= 4.5 &&
            (theme !== 'light' || visuals.darkPanels.length === 0),
          `contrast=${visuals.minContrast.toFixed(2)} on ${visuals.minContrastSelector}; darkPanels=${JSON.stringify(visuals.darkPanels)}`,
        );

        if (theme === 'light' && (width === 375 || width === 1440)) {
          const shot = await page.send<{ data: string }>('Page.captureScreenshot', {
            format: 'png',
            captureBeyondViewport: false,
          });
          writeFileSync(
            join(REVIEW_DIR, `${route.replaceAll('/', '_')}-${width}.png`),
            Buffer.from(shot.data, 'base64'),
          );
        }
      }
    }
  }

  // --- knowledge map: selection must be visible, and distinct from hover
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await goto('/category/artificial-intelligence');
  await applyTheme('light');
  const mapState = await evaluate<{
    tabCount: number;
    hasActive: boolean;
    activeBorderAccent: boolean;
    activeTinted: boolean;
    activeContrast: number;
    activeBorderContrast: number;
    idleContrast: number;
    idleBorderContrast: number;
    idleIsReadable: boolean;
  }>(`(() => {
    ${MEASURE_HELPERS}
    const root = getComputedStyle(document.documentElement);
    const accent = rgb(root.getPropertyValue('--color-accent').trim());
    const tabs = [...document.querySelectorAll('.ai-directory-tabs button')].filter(visible);
    const active = tabs.find((b) => b.classList.contains('active')) ?? null;
    const idle = tabs.filter((b) => b !== active);
    const contrastWith = (el, against) => {
      const a = lum(rgb(getComputedStyle(el).borderTopColor));
      const b = lum(against);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    return {
      tabCount: tabs.length,
      hasActive: Boolean(active),
      activeBorderAccent: active
        ? Math.abs(lum(rgb(getComputedStyle(active).borderTopColor)) - lum(accent)) < 0.02
        : false,
      activeTinted: active ? lum(background(active)) < 0.95 : false,
      activeContrast: active ? contrast(active) : 0,
      activeBorderContrast: active ? contrastWith(active, background(active)) : 0,
      idleContrast: idle.length ? Math.min(...idle.map((b) => contrast(b))) : 0,
      idleBorderContrast: idle.length ? Math.min(...idle.map((b) => contrastWith(b, background(b)))) : 0,
      idleIsReadable: idle.every((b) => contrast(b) >= 4.5),
    };
  })()`);
  check(
    'light knowledge map marks the selected directory with an accent boundary',
    mapState.tabCount > 1 &&
      mapState.hasActive &&
      mapState.activeBorderAccent &&
      mapState.activeTinted &&
      mapState.activeContrast >= 4.5 &&
      mapState.idleIsReadable,
    JSON.stringify(mapState),
  );
  // The reported complaint was low contrast in the light map: the idle label and
  // the button boundary must both clear a readable threshold, not merely exist.
  check(
    'light knowledge map labels and boundaries are readable',
    mapState.idleContrast >= 4.5 &&
      mapState.activeContrast >= 4.5 &&
      mapState.idleBorderContrast >= 1.5 &&
      mapState.activeBorderContrast >= 3,
    `idleText=${mapState.idleContrast.toFixed(2)} activeText=${mapState.activeContrast.toFixed(2)} idleBorder=${mapState.idleBorderContrast.toFixed(2)} activeBorder=${mapState.activeBorderContrast.toFixed(2)}`,
  );

  // Hover must not look like the selected state.
  const hoverState = await evaluate<{ available: boolean }>(
    `(() => {
      const tabs = [...document.querySelectorAll('.ai-directory-tabs button')];
      return { available: tabs.length > 1 };
    })()`,
  );
  if (hoverState.available) {
    const { root } = await page.send<{ root: { nodeId: number } }>('DOM.getDocument', {
      depth: -1,
    });
    const { nodeId } = await page.send<{ nodeId: number }>('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '.ai-directory-tabs button:not(.active)',
    });
    await page.send('CSS.enable');
    await page.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: ['hover'],
    });
    await sleep(200);
    const hover = await evaluate<{
      hoverBackground: number;
      activeBackground: number;
      hoverIsNeutral: boolean;
    }>(`(() => {
      ${MEASURE_HELPERS}
      const root = getComputedStyle(document.documentElement);
      const neutral = rgb(root.getPropertyValue('--color-learning-surface-raised').trim());
      const tabs = [...document.querySelectorAll('.ai-directory-tabs button')];
      const idle = tabs.find((b) => !b.classList.contains('active'));
      const active = tabs.find((b) => b.classList.contains('active'));
      return {
        hoverBackground: idle ? lum(background(idle)) : 0,
        activeBackground: active ? lum(background(active)) : 0,
        hoverIsNeutral: idle
          ? Math.abs(lum(background(idle)) - lum(neutral)) < 0.02
          : false,
      };
    })()`);
    await page.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
    check(
      'hovered map tab stays neutral and differs from the selected tab',
      hover.hoverIsNeutral &&
        Math.abs(hover.hoverBackground - hover.activeBackground) > 0.02,
      JSON.stringify(hover),
    );
  }

  // --- keyboard focus must stay visible on the primary controls
  await goto('/');
  await applyTheme('light');
  const focusVisible = await evaluate<{ focusRing: boolean; checked: number }>(`(() => {
    const targets = [...document.querySelectorAll('a.direction-card, .theme-toggle, a[href="/resources"]')];
    let focusRing = true;
    let checked = 0;
    for (const el of targets.slice(0, 6)) {
      el.focus();
      const style = getComputedStyle(el);
      const hasOutline =
        style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      const hasRing = style.boxShadow !== 'none';
      if (!hasOutline && !hasRing) focusRing = false;
      checked += 1;
    }
    return { focusRing, checked };
  })()`);
  check(
    'keyboard focus stays visible on links and the theme toggle',
    focusVisible.checked > 0 && focusVisible.focusRing,
    JSON.stringify(focusVisible),
  );
  // ------------------------------------------------------------ learning state
  await goto('/concept/gradient-descent', 1400);
  const saved = await evaluate<string>(
    `(async () => {
      const buttons = [...document.querySelectorAll('button')];
      const bookmark = buttons.find((b) => /收藏/.test(b.textContent || '') && !/已收藏/.test(b.textContent || ''));
      const learned = buttons.find((b) => /标记已学|已学完|标记为已学习/.test(b.textContent || ''));
      bookmark?.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
      learned?.click();
      await new Promise((resolve) => setTimeout(resolve, 400));
      return JSON.stringify({ bookmark: Boolean(bookmark), learned: Boolean(learned), store: localStorage.getItem('what-is-learning')?.slice(0, 300) ?? null });
    })()`,
  );
  const savedState = JSON.parse(saved) as { store: string | null };
  check(
    'bookmark/learned state is written to localStorage',
    Boolean(savedState.store && savedState.store.includes('gradient-descent')),
    (savedState.store ?? 'null').slice(0, 90),
  );
  await goto('/concept/gradient-descent', 1800);
  const afterReload = await evaluate<string>(
    `JSON.stringify({
      hasSlug: (localStorage.getItem('what-is-learning') ?? '').includes('gradient-descent'),
      bodyShowsSaved: /已收藏|已学习/.test(document.body.innerText),
    })`,
  );
  const reloadState = JSON.parse(afterReload) as { hasSlug: boolean; bodyShowsSaved: boolean };
  check(
    'saved learning state survives a reload',
    reloadState.hasSlug && reloadState.bodyShowsSaved,
    afterReload,
  );

  // ------------------------------------------------------------ storage failure
  const storageFailure = await evaluate<string>(
    `(async () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function () {
        const error = new Error('quota');
        error.name = 'QuotaExceededError';
        throw error;
      };
      const buttons = [...document.querySelectorAll('button')];
      const target = buttons.find((b) => /收藏|标记/.test(b.textContent || ''));
      target?.click();
      await new Promise((resolve) => setTimeout(resolve, 600));
      const banner = document.querySelector('[data-testid="persistence-banner"]');
      const result = {
        clicked: Boolean(target),
        bannerShown: Boolean(banner),
        bannerText: banner ? banner.innerText.replace(/\\s+/g, ' ').slice(0, 160) : '',
        stillInteractive: Boolean(document.querySelector('a[href^="/concept/"], .theme-toggle')),
      };
      Storage.prototype.setItem = original;
      return JSON.stringify(result);
    })()`,
  );
  const storageState = JSON.parse(storageFailure) as {
    clicked: boolean;
    bannerShown: boolean;
    bannerText: string;
    stillInteractive: boolean;
  };
  check(
    'a failing storage write shows an explicit "not saved" warning',
    storageState.bannerShown && /尚未保存/.test(storageState.bannerText),
    storageState.bannerText || 'no banner',
  );
  check(
    'the page stays usable when storage fails',
    storageState.stillInteractive,
    'navigation and theme toggle still present',
  );

  // ------------------------------------------------------------ mobile + dark
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await goto('/concept/gradient-descent', 1400);
  const mobile = await evaluate<string>(
    `JSON.stringify({
      width: innerWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hasContent: document.body.innerText.length > 500,
      theme: document.documentElement.dataset.theme,
    })`,
  );
  const mobileState = JSON.parse(mobile) as {
    width: number;
    overflow: number;
    hasContent: boolean;
  };
  check(
    'the concept page renders on a mobile viewport without horizontal overflow',
    mobileState.hasContent && mobileState.overflow <= 2,
    mobile,
  );
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Both themes must apply their own ink; measurement is numeric so the check
  // does not depend on the browser's colour serialization format.
  const measureTheme = async (theme: string) =>
    JSON.parse(
      await evaluate<string>(
        `(() => {
          document.documentElement.dataset.theme = '${theme}';
          document.documentElement.classList.toggle('dark', '${theme}' === 'dark');
          const body = getComputedStyle(document.body);
          const parse = (value) => {
            const match = /lab\\(([-0-9.]+)/.exec(value) ?? /rgba?\\(([0-9.]+)/.exec(value);
            return match ? Number(match[1]) : null;
          };
          return JSON.stringify({ ink: parse(body.color), surface: parse(body.backgroundColor) });
        })()`,
      ),
    ) as { ink: number | null; surface: number | null };

  const lightTheme = await measureTheme('light');
  const darkTheme = await measureTheme('dark');
  check(
    'light theme renders dark ink on a light surface',
    lightTheme.ink !== null &&
      lightTheme.surface !== null &&
      lightTheme.ink < lightTheme.surface,
    JSON.stringify(lightTheme),
  );
  check(
    'dark theme renders light ink on a dark surface',
    darkTheme.ink !== null &&
      darkTheme.surface !== null &&
      darkTheme.ink > darkTheme.surface,
    JSON.stringify(darkTheme),
  );
  check(
    'the two themes produce different surfaces',
    lightTheme.surface !== darkTheme.surface,
    `light=${lightTheme.surface} dark=${darkTheme.surface}`,
  );

  // ------------------------------------------------------------ plan lifecycle
  // A real plan state is produced by the plan engine and injected, so the UI is
  // verified against genuinely generated data rather than a hand-written fixture.
  const planStateJson = JSON.stringify(
    buildVerificationPlanState('浏览器验证计划'),
  );
  await goto('/plans/new');
  const seeded = await evaluate<string>(
    `(() => {
      localStorage.setItem('how-to-learn-ai-plans-v1', ${JSON.stringify(planStateJson)});
      const parsed = JSON.parse(localStorage.getItem('how-to-learn-ai-plans-v1'));
      const plan = parsed.plans[0];
      const questions = plan.phases[0].test.questions;
      return JSON.stringify({
        planId: plan.id,
        planCount: parsed.plans.length,
        questionCount: questions.length,
        allRealQuestions: questions.every((q) => !/^请完成关于/.test(q.prompt)),
      });
    })()`,
  );
  const seededState = JSON.parse(seeded) as {
    planId: string;
    planCount: number;
    questionCount: number;
    allRealQuestions: boolean;
  };
  check(
    'a stored plan carries a real stage test instead of placeholders',
    seededState.planCount === 1 &&
      seededState.questionCount > 0 &&
      seededState.allRealQuestions,
    seeded,
  );

  await goto(`/plans/${seededState.planId}`);
  await waitFor(
    `document.body.innerText.includes('浏览器验证计划')`,
    20000,
    'plan detail content',
  );
  const taskResult = await evaluate<string>(
    `(async () => {
      const planId = ${JSON.stringify(seededState.planId)};
      const read = () => JSON.parse(localStorage.getItem('how-to-learn-ai-plans-v1'));
      const before = read().plans.find((p) => p.id === planId).phases[0].tasks[0];
      const complete = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '完成');
      if (!complete) return JSON.stringify({ error: 'no-complete-button' });
      complete.click();
      await new Promise((resolve) => setTimeout(resolve, 900));
      const after = read().plans.find((p) => p.id === planId).phases[0].tasks[0];
      return JSON.stringify({
        beforeStatus: before.status,
        afterStatus: after.status,
        substepsDone: after.substeps.length > 0 && after.substeps.every((s) => s.status === 'completed'),
      });
    })()`,
  );
  const taskState = JSON.parse(taskResult) as {
    beforeStatus?: string;
    afterStatus?: string;
    substepsDone?: boolean;
  };
  check(
    'completing a task in the UI persists the completed state, including substeps',
    taskState.afterStatus === 'completed' && taskState.substepsDone === true,
    taskResult,
  );

  const reopen = await evaluate<string>(
    `(async () => {
      const planId = ${JSON.stringify(seededState.planId)};
      const button = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '重新打开');
      if (!button) return JSON.stringify({ error: 'no-reopen-button' });
      button.click();
      await new Promise((resolve) => setTimeout(resolve, 900));
      const task = JSON.parse(localStorage.getItem('how-to-learn-ai-plans-v1'))
        .plans.find((p) => p.id === planId).phases[0].tasks[0];
      return JSON.stringify({ status: task.status });
    })()`,
  );
  check(
    're-opening a completed task persists the reopened state',
    (JSON.parse(reopen) as { status?: string }).status === 'not-started',
    reopen,
  );

  await goto(`/plans/${seededState.planId}`);
  const afterReloadPlan = await evaluate<string>(
    `JSON.stringify({
      hasPlan: document.body.innerText.includes('浏览器验证计划'),
      hasStageTest: /阶段练习|进入阶段测试|暂无测试/.test(document.body.innerText),
      taskRows: document.querySelectorAll('.plan-task').length,
    })`,
  );
  const planReloadState = JSON.parse(afterReloadPlan) as {
    hasPlan: boolean;
    hasStageTest: boolean;
    taskRows: number;
  };
  check(
    'the plan, its tasks and its stage-test entry survive a reload',
    planReloadState.hasPlan &&
      planReloadState.hasStageTest &&
      planReloadState.taskRows > 0,
    afterReloadPlan,
  );

  // ------------------------------------------------------------ console health
  collectNetwork();
  const rejectionDetail = await evaluate<string>(
    `JSON.stringify((window.__dshRejections ?? []).slice(0, 3))`,
  );
  const realConsoleErrors = consoleErrors.filter(
    (message) => !/favicon|404 \(Not Found\)/i.test(message),
  );
  check(
    'no unhandled runtime errors in the console',
    realConsoleErrors.length === 0,
    `${realConsoleErrors.slice(0, 2).join(' | ') || 'none'}${realConsoleErrors.length ? ` :: rejections=${rejectionDetail}` : ''}`,
  );

  // A `<link rel="modulepreload">` can report ERR_CACHE_MISS in headless Chrome
  // even though the module is fetched right after by its own importer. Only
  // count a failed request if the browser never obtained that resource.
  const delivered = await evaluate<string[]>(
    `performance.getEntriesByType('resource').map((entry) => entry.name)`,
  );
  const deliveredPaths = new Set(
    delivered.map((url) => url.replace(baseUrl, '')),
  );
  const realFailures = failedRequests.filter((entry) => {
    const path = entry.slice(entry.lastIndexOf(':') + 1);
    const benign =
      entry.includes('ERR_CACHE_MISS') &&
      (path === 'unknown-url' || deliveredPaths.has(path));
    if (benign) console.log(`  (ignored benign preload miss: ${entry})`);
    return !benign;
  });
  check(
    'no failed network requests during the run',
    realFailures.length === 0,
    realFailures.slice(0, 5).join(' | ') || 'none',
  );

  page.close();
  browser.close();
}

try {
  await main();
} catch (error) {
  console.error(`browser verification crashed: ${(error as Error).message}`);
  failures.push('crash');
} finally {
  for (const process_ of chromeProcesses) process_.kill();
  // Never throw from `finally`: it would replace a real failure with a cleanup
  // error. The boundary check stays, but an unsafe path only skips the removal.
  if (isInsideTempDirectory(profileDir)) {
    try {
      rmSync(profileDir, { recursive: true, force: true });
    } catch {
      /* best effort: a leftover temp profile is harmless */
    }
  } else {
    console.error(
      `skipped profile cleanup: ${profileDir} is not inside the temporary directory`,
    );
  }
}

console.log('\n--- browser verification summary ---');
for (const line of checks) console.log(line);
console.log(
  `\n${checks.filter((line) => line.startsWith('PASS')).length}/${checks.length} checks passed`,
);
process.exit(failures.length ? 1 : 0);
