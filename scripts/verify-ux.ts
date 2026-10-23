/** UX acceptance checks run by verify-browser.ts against the production build. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseProgressBackup } from '../lib/progress-backup.ts';
import { learningResources } from '../lib/resources.ts';
import { verifyTouchTargets } from './verify-touch-targets.ts';

interface Devtools {
  send(method: string, params?: Record<string, unknown>): Promise<unknown>;
}
interface Verification {
  page: Devtools;
  browser: Devtools;
  evaluate: <T>(expression: string) => Promise<T>;
  goto: (path: string, waitMs?: number) => Promise<unknown>;
  waitFor: (
    expression: string,
    timeoutMs?: number,
    label?: string,
  ) => Promise<boolean>;
  check: (name: string, condition: boolean, detail?: string) => void;
}

export async function verifyUx({
  page,
  browser,
  evaluate,
  goto,
  waitFor,
  check,
}: Verification) {
  const directory = resolve('outputs/ux');
  mkdirSync(directory, { recursive: true });
  const evidence: Record<string, unknown>[] = [];
  const snapshot = async (name: string) => {
    const result = (await page.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })) as { data: string };
    writeFileSync(
      join(directory, `${name}.png`),
      Buffer.from(result.data, 'base64'),
    );
  };
  const theme = async (value: string) => {
    await evaluate(
      `(() => { const value = ${JSON.stringify(value)}; document.documentElement.dataset.theme = value; document.documentElement.classList.toggle('dark', value === 'dark'); localStorage.setItem('how-to-learn-ai-theme', JSON.stringify(value)); })()`,
    );
  };
  const measureTargets = async (selector: string) =>
    evaluate<{ count: number; tooSmall: unknown[] }>(`(() => {
    const items = [...document.querySelectorAll(${JSON.stringify(selector)})].filter((el) => el.getClientRects().length && !el.classList.contains('sr-only'));
    return { count: items.length, tooSmall: items.map((el) => ({ label: el.getAttribute('aria-label') || el.textContent?.trim().slice(0,40), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })).filter((item) => item.width < 43.99 || item.height < 43.99) };
  })()`);

  // First-time recommendation, then real visits with no learned marker.
  await verifyTouchTargets({ page, evaluate, goto, waitFor, check });
  await goto('/');
  await evaluate(
    `localStorage.setItem('what-is-learning', JSON.stringify({learned:[],bookmarks:[],recent:[],practiced:[],importantConcepts:[],importantSections:{},notes:[],sortMode:'difficulty-asc'}))`,
  );
  await goto('/');
  const initialRecommendation = await evaluate<string>(
    `document.querySelector('.dashboard-continue').getAttribute('href')`,
  );
  check(
    'new learners receive the first concept',
    initialRecommendation === '/concept/ai-overview',
    initialRecommendation,
  );
  await goto('/concept/supervised-learning');
  await goto('/concept/gradient-descent');

  for (const width of [375, 1440]) {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width === 375,
    });
    await page.send('Emulation.setTouchEmulationEnabled', {
      enabled: width === 375,
    });
    for (const mode of ['light', 'dark']) {
      await theme(mode);
      await goto('/');
      const home = await evaluate<{
        href: string;
        actions: number;
        fits: boolean;
      }>(
        `({href:document.querySelector('.dashboard-continue').getAttribute('href'), actions:document.querySelectorAll('.dashboard-hero a[href^="/concept/"]').length, fits:document.documentElement.scrollWidth <= innerWidth})`,
      );
      check(
        `${mode} ${width}px home continues the latest unread visit with one action`,
        home.href === '/concept/gradient-descent' &&
          home.actions === 1 &&
          home.fits,
        JSON.stringify(home),
      );
      await snapshot(`home-${mode}-${width}`);
      await goto('/concept/gradient-descent');
      const important = await measureTargets(
        '.important-toggle, .concept-header [data-slot="button"]',
      );
      if (width === 375)
        check(
          `${mode} 375px concept controls meet 44px`,
          important.count > 0 && important.tooSmall.length === 0,
          JSON.stringify(important),
        );
      const inactive = await evaluate<boolean>(
        `[...document.querySelectorAll('.important-toggle[aria-pressed="false"]')].every((button) => button.textContent.trim() === '' && !!button.getAttribute('aria-label'))`,
      );
      check(
        `${mode} ${width}px inactive section stars retain accessible names without text`,
        inactive,
      );

      if (width === 375) {
        for (const label of ['当前目录', '备忘录与重点']) {
          await evaluate(
            `[...document.querySelectorAll('.mobile-detail-tools button')].find((button) => button.textContent.includes(${JSON.stringify(label)})).click()`,
          );
          await waitFor(
            `(() => { const sheet=document.querySelector('.concept-sheet'); if(!sheet)return false;const rect=sheet.getBoundingClientRect();return Number(getComputedStyle(sheet).opacity)>=0.99 && rect.left>=-1 && rect.right<=innerWidth+1; })()`,
          );
          const colors = await evaluate<{
            background: string;
            border: string;
            contrast: number;
            light: boolean;
            inputLight: boolean;
            outsideShell: boolean;
            closeHit: boolean;
          }>(`(() => {
            const sheet = document.querySelector('.concept-sheet');
            const style = getComputedStyle(sheet);
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
            const context = canvas.getContext('2d');
            const rgb = (color) => { context.clearRect(0,0,1,1); context.fillStyle=color; context.fillRect(0,0,1,1); return [...context.getImageData(0,0,1,1).data].slice(0,3); };
            const luminance = (color) => rgb(color).map((c) => { const v=c/255; return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4; }).reduce((sum,v,i) => sum+v*[0.2126,0.7152,0.0722][i],0);
            const bg = luminance(style.backgroundColor); const fg=luminance(style.color);
            const input=sheet.querySelector('textarea');
            const close=sheet.querySelector('[data-slot="sheet-close"]'); const rect=close.getBoundingClientRect();
            return {background:style.backgroundColor,border:style.borderColor,contrast:(Math.max(bg,fg)+0.05)/(Math.min(bg,fg)+0.05),light:bg>0.75,inputLight:input?luminance(getComputedStyle(input).backgroundColor)>0.75:true,outsideShell:!sheet.closest('.concept-shell'),closeHit:sheet.contains(document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2))};
          })()`);
          evidence.push({ mode, width, label, ...colors });
          check(
            `${mode} 375px portal ${label} uses readable theme surfaces`,
            colors.outsideShell &&
              colors.closeHit &&
              colors.contrast >= 4.5 &&
              colors.light === (mode === 'light') &&
              (mode !== 'light' || colors.inputLight),
            JSON.stringify(colors),
          );
          check(
            `${mode} 375px ${label} title clears the close button`,
            await evaluate<boolean>(
              `document.querySelector('.concept-sheet [data-slot="sheet-title"]').getBoundingClientRect().right <= document.querySelector('.concept-sheet [data-slot="sheet-close"]').getBoundingClientRect().left`,
            ),
          );
          const targets = await measureTargets(
            '.concept-sheet button, .concept-sheet select, .concept-sheet .concept-list-link',
          );
          check(
            `${mode} 375px ${label} targets meet 44px`,
            targets.count > 0 && targets.tooSmall.length === 0,
            JSON.stringify(targets),
          );
          await snapshot(
            `drawer-${label === '当前目录' ? 'directory' : 'memo'}-${mode}-375`,
          );
          await page.send('Input.dispatchKeyEvent', {
            type: 'keyDown',
            key: 'Escape',
            code: 'Escape',
            windowsVirtualKeyCode: 27,
          });
          await page.send('Input.dispatchKeyEvent', {
            type: 'keyUp',
            key: 'Escape',
            code: 'Escape',
            windowsVirtualKeyCode: 27,
          });
          await waitFor(`!document.querySelector('.concept-sheet')`);
        }
      }
      const navigation = await evaluate<{
        matches: boolean;
        next: string;
        first: string;
        last: string;
        focused: boolean;
      }>(`(() => {
        const links=[...document.querySelectorAll('.concept-directory .concept-list-link')];
        const index=links.findIndex((link) => link.getAttribute('aria-current') === 'page');
        const previous=document.querySelector('.concept-step[aria-label^="上一概念"]');
        const next=document.querySelector('.concept-step[aria-label^="下一概念"]');
        (next || previous)?.focus();
        document.querySelector('.concept-navigation-footer').scrollIntoView({block:'end',behavior:'instant'});
        return {matches:(previous?.getAttribute('href')??null)===(links[index-1]?.getAttribute('href')??null) && (next?.getAttribute('href')??null)===(links[index+1]?.getAttribute('href')??null),next:next?.getAttribute('href'),first:links[0]?.getAttribute('href'),last:links.at(-1)?.getAttribute('href'),focused:document.activeElement?.classList.contains('concept-step')};
      })()`);
      check(
        `${mode} ${width}px concept links match the directory and accept keyboard focus`,
        navigation.matches && navigation.focused,
        JSON.stringify(navigation),
      );
      await snapshot(`concept-navigation-${mode}-${width}`);
      await evaluate(
        `document.querySelector('.concept-step[aria-label^="下一概念"]').click()`,
      );
      await waitFor(`location.pathname === ${JSON.stringify(navigation.next)}`);
      await waitFor(
        `JSON.parse(localStorage.getItem('what-is-learning')).recent[0] === ${JSON.stringify(navigation.next.split('/').at(-1))}`,
      );
      check(
        `${mode} ${width}px sequential concept navigation records a visit`,
        true,
      );
      // Return to gradient descent so the next home check has the same latest visit.
      await goto('/concept/gradient-descent');
    }
  }

  // Both boundary links are noninteractive, with no cross-category jump.
  const endpoints = await evaluate<string[]>(
    `(() => { const links=[...document.querySelectorAll('.concept-directory .concept-list-link')];return [links[0].getAttribute('href'),links.at(-1).getAttribute('href')]; })()`,
  );
  for (const [index, path] of endpoints.entries()) {
    await goto(path);
    check(
      `concept ${index === 0 ? 'first' : 'last'} boundary is disabled`,
      await evaluate<boolean>(
        `document.querySelector('.concept-step:${index === 0 ? 'first' : 'last'}-child').getAttribute('aria-disabled') === 'true'`,
      ),
    );
  }

  await goto('/resources');
  check(
    '1440px resource buttons retain their compact desktop size',
    await evaluate<boolean>(
      `[...document.querySelectorAll('.resource-card-actions [data-slot="button"]')].every((button) => Math.abs(button.getBoundingClientRect().height-28)<0.1)`,
    ),
  );
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await goto('/resources');
  const resources = await measureTargets(
    '.resource-card-actions [data-slot="button"], .resource-filters select',
  );
  check(
    '375px resource buttons, bookmark icons and filters meet 44px',
    resources.count > 0 && resources.tooSmall.length === 0,
    JSON.stringify(resources),
  );
  await goto('/exercises');
  const exercises = await measureTargets('main button, main select');
  check(
    '375px exercise actions, tags and filters meet 44px',
    exercises.count > 0 && exercises.tooSmall.length === 0,
    JSON.stringify(exercises),
  );
  check(
    'exercise pagination initially shows 20 of 32 questions',
    await evaluate<boolean>(
      `document.querySelectorAll('main section > article').length === 20 && document.querySelector('.exercise-pagination').textContent.includes('1 / 2')`,
    ),
  );
  const firstPageTitles = await evaluate<string[]>(
    `[...document.querySelectorAll('main article h2')].map((heading) => heading.textContent)`,
  );
  await evaluate(
    `[...document.querySelectorAll('.exercise-pagination button')].find((button) => button.textContent.includes('下一页')).click()`,
  );
  await waitFor(
    `new URLSearchParams(location.search).get('page') === '2' && document.querySelectorAll('main section > article').length === 12`,
  );
  await goto('/exercises?page=2');
  check(
    'exercise page 2 survives reload',
    await evaluate<boolean>(
      `document.querySelectorAll('main section > article').length === 12 && document.querySelector('.exercise-pagination').textContent.includes('2 / 2')`,
    ),
  );
  const secondPageTitles = await evaluate<string[]>(
    `[...document.querySelectorAll('main article h2')].map((heading) => heading.textContent)`,
  );
  check(
    'both exercise pages preserve all 32 unique questions',
    new Set([...firstPageTitles, ...secondPageTitles]).size === 32,
  );
  await evaluate(
    `document.querySelector('select[aria-label="难度筛选"]').value='入门';document.querySelector('select[aria-label="难度筛选"]').dispatchEvent(new Event('change',{bubbles:true}))`,
  );
  await waitFor(
    `new URLSearchParams(location.search).get('level') === '入门' && !new URLSearchParams(location.search).has('page')`,
  );
  await page.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Alt',
    code: 'AltLeft',
    modifiers: 1,
  });
  await evaluate('history.back()');
  await waitFor(
    `new URLSearchParams(location.search).get('page') === '2' && document.querySelector('select[aria-label="难度筛选"]').value === '全部'`,
  );
  check('back restores exercise filter controls and page position', true);
  await page.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Alt',
    code: 'AltLeft',
  });

  await theme('light');
  await goto('/exercises?q=axis');
  await evaluate(
    `document.querySelector('main article [data-slot="button"]').click()`,
  );
  await waitFor(
    `document.querySelector('.exercise-answer code')?.textContent.includes('X.mean(axis=0)')`,
  );
  check(
    'real exercise inline code renders as code',
    await evaluate<boolean>(
      `!document.querySelector('.exercise-answer').textContent.includes(String.fromCharCode(96))`,
    ),
  );
  await snapshot('exercise-inline-code-light-375');
  await evaluate(
    `[...document.querySelectorAll('main article button')].find((button) => button.textContent.trim().startsWith('#')).click()`,
  );
  await waitFor(
    `new URLSearchParams(location.search).get('q')?.length > 0 && new URLSearchParams(location.search).get('q') !== 'axis'`,
  );
  check('exercise tag search writes the URL', true);
  await evaluate(
    `[...document.querySelectorAll('main button')].find((button) => button.textContent.trim()==='清除筛选').click()`,
  );
  await waitFor(`location.search === ''`);
  check('clearing exercise filters removes their URL parameters', true);

  await goto(
    '/resources?dir=deep-learning&type=官方文档&level=进阶&lang=英语&cost=free&rank=A&sort=updated&q=PyTorch',
  );
  check(
    'all resource filter controls restore from a shared URL',
    await evaluate<boolean>(
      `(() => {const values=[...document.querySelectorAll('.resource-filter select')].map((select) => select.value);return JSON.stringify(values)===JSON.stringify(['deep-learning','官方文档','进阶','英语','free','A','updated']) && document.querySelector('#resource-search').value==='PyTorch';})()`,
    ),
  );
  await evaluate(
    `document.querySelector('.resources-result-row button').click()`,
  );
  await waitFor(`location.search === ''`);
  check('clearing resource filters removes their URL parameters', true);

  // Verify a genuine JSON download, cancel, invalid input and successful import.
  await browser.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: directory,
    eventsEnabled: true,
  });
  await evaluate(
    `(() => {window.__uxExport=null;const original=URL.createObjectURL;URL.createObjectURL=(blob)=>{blob.text().then((raw)=>window.__uxExport=raw);return original(blob);};document.querySelector('.progress-backup-actions button').click();URL.createObjectURL=original;})()`,
  );
  await waitFor(`typeof window.__uxExport === 'string'`);
  const raw = await evaluate<string>('window.__uxExport');
  const backup = parseProgressBackup(raw);
  check(
    'downloaded progress JSON validates and includes only four data groups',
    Object.keys(backup.data).length === 4,
  );
  const selectFile = async (contents: string) => {
    await evaluate(
      `(() => {const input=document.querySelector('.progress-backup input');const transfer=new DataTransfer();transfer.items.add(new File([${JSON.stringify(contents)}],'progress.json',{type:'application/json'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`,
    );
  };
  await selectFile('{bad json');
  await waitFor(
    `document.querySelector('.progress-backup [role="alert"]')?.textContent.includes('JSON')`,
  );
  check(
    'invalid import gives a recoverable error without opening confirmation',
    await evaluate<boolean>(
      `!document.querySelector('[data-slot="alert-dialog-content"]')`,
    ),
  );
  await selectFile(raw);
  await waitFor(`document.querySelector('[data-slot="alert-dialog-content"]')`);
  await evaluate(
    `document.querySelector('[data-slot="alert-dialog-cancel"]').click()`,
  );
  await waitFor(
    `!document.querySelector('[data-slot="alert-dialog-content"]')`,
  );
  check(
    'canceling import leaves existing progress untouched',
    await evaluate<boolean>(
      `JSON.stringify(JSON.parse(localStorage.getItem('what-is-learning')).learned) === ${JSON.stringify(JSON.stringify(backup.data.learning.learned))}`,
    ),
  );
  backup.data.learning.learned = ['gradient-descent'];
  backup.data.learning.notes.push({
    id: 'ux-note',
    conceptSlug: 'gradient-descent',
    sectionId: 'general',
    text: '导入后的笔记',
    isImportant: false,
    updatedAt: new Date().toISOString(),
  });
  backup.data.theme = 'light';
  backup.data.resources.viewedIds = learningResources.map(
    (resource) => resource.id,
  );
  await selectFile(JSON.stringify(backup));
  await waitFor(`document.querySelector('[data-slot="alert-dialog-content"]')`);
  await evaluate(
    `window.__uxImportMarker=42;document.querySelector('[data-slot="alert-dialog-action"]').click()`,
  );
  await waitFor(
    `!document.querySelector('[data-slot="alert-dialog-content"]') && document.documentElement.dataset.theme === 'light'`,
  );
  await waitFor(
    `document.querySelector('.resource-card-actions button')?.textContent.includes('已查看')`,
  );
  check(
    'successful import updates resource controls without a document reload',
    await evaluate<boolean>(
      `window.__uxImportMarker===42 && document.querySelector('.resource-card-actions button').getAttribute('aria-pressed')==='true'`,
    ),
  );
  await goto('/concept/gradient-descent');
  await evaluate(
    `[...document.querySelectorAll('.mobile-detail-tools button')].find((button) => button.textContent.includes('备忘录')).click()`,
  );
  await waitFor(
    `document.querySelector('.concept-sheet')?.textContent.includes('导入后的笔记')`,
  );
  const notes = await measureTargets('.concept-sheet .note-actions button');
  check(
    'import refreshes learned state, theme and memo without reloading the document',
    notes.count > 0 && notes.tooSmall.length === 0,
    JSON.stringify(notes),
  );
  await page.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await page.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await waitFor(`!document.querySelector('.concept-sheet')`);
  await evaluate(`document.querySelector('.important-toggle').click()`);
  await waitFor(
    `document.querySelector('.important-toggle').getAttribute('aria-pressed') === 'true'`,
  );
  check(
    'active important section shows its label and updates the memo',
    await evaluate<boolean>(
      `document.querySelector('.important-toggle').textContent.includes('已标记')`,
    ),
  );
  await evaluate(
    `[...document.querySelectorAll('.mobile-detail-tools button')].find((button) => button.textContent.includes('备忘录')).click()`,
  );
  check(
    'marked sections still appear in the memo summary',
    await evaluate<boolean>(
      `document.querySelectorAll('.concept-sheet .marked-sections button').length > 0`,
    ),
  );

  writeFileSync(
    join(directory, 'measurements.json'),
    JSON.stringify(evidence, null, 2),
  );
}
