import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Verification {
  page: {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };
  evaluate: <T>(expression: string) => Promise<T>;
  goto: (path: string, waitMs?: number) => Promise<unknown>;
  waitFor: (
    expression: string,
    timeoutMs?: number,
    label?: string,
  ) => Promise<boolean>;
  check: (name: string, passed: boolean, detail?: string) => void;
}

export async function verifyTouchTargets({
  page,
  evaluate,
  goto,
  waitFor,
  check,
}: Verification) {
  const measurements: unknown[] = [];
  mkdirSync(resolve('outputs/ux'), { recursive: true });
  const snapshot = async (name: string) => {
    const { data } = (await page.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })) as { data: string };
    writeFileSync(
      resolve('outputs/ux', `${name}.png`),
      Buffer.from(data, 'base64'),
    );
  };
  for (const { width, coarse } of [
    { width: 375, coarse: true },
    { width: 1440, coarse: false },
    { width: 1440, coarse: true },
  ]) {
    const touch = width === 375 || coarse;
    const device = `${width}px ${coarse ? 'coarse' : 'fine'}`;
    await page.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width === 375,
    });
    await page.send('Emulation.setTouchEmulationEnabled', {
      enabled: coarse,
    });
    for (const theme of ['light', 'dark']) {
      await goto('/resources');
      await evaluate(
        `document.documentElement.dataset.theme=${JSON.stringify(theme)};document.documentElement.classList.toggle('dark',${JSON.stringify(theme)}==='dark')`,
      );
      const links = await evaluate<{
        count: number;
        minimumHeight: number;
        tooSmall: unknown[];
      }>(`(() => {
        const links=[...document.querySelectorAll('.resource-concepts a')];
        const sizes=links.map((link)=>({text:link.textContent,width:link.getBoundingClientRect().width,height:link.getBoundingClientRect().height}));
        return {count:sizes.length,minimumHeight:Math.min(...sizes.map((size)=>size.height)),tooSmall:sizes.filter((size)=>size.width<43.99||size.height<43.99)};
      })()`);
      measurements.push({ width, coarse, theme, links });
      check(
        `${theme} ${device} resource concept links ${touch ? 'meet 44px' : 'retain compact desktop height'}`,
        links.count > 0 &&
          (touch ? links.tooSmall.length === 0 : links.minimumHeight < 44),
        JSON.stringify(links),
      );
      if (touch) {
        check(
          `${theme} ${device} resource concept links receive hits at their lower edge`,
          await evaluate<boolean>(
            `(() => { const link=document.querySelector('.resource-concepts a');link.scrollIntoView({block:'center',behavior:'instant'});const rect=link.getBoundingClientRect();return link.contains(document.elementFromPoint(rect.x+rect.width/2,rect.bottom-1)); })()`,
          ),
        );
        await snapshot(
          `resource-concepts-${theme}-${width}-${coarse ? 'coarse' : 'fine'}`,
        );
      }
      for (const path of [
        '/concept/learning-rate-selection',
        '/concept/numerical-standardization',
      ]) {
        await goto(path);
        await evaluate(
          `document.documentElement.dataset.theme=${JSON.stringify(theme)};document.documentElement.classList.toggle('dark',${JSON.stringify(theme)}==='dark')`,
        );
        await waitFor(`document.querySelector('[data-slot="slider-thumb"]')`);
        const sliders = await evaluate<{
          count: number;
          sizes: {
            controlHeight: number;
            thumbSize: number;
            trackHeight: number;
            hitWidth: number;
            hitHeight: number;
          }[];
        }>(`(() => {
          const sizes=[...document.querySelectorAll('[data-slot="slider"]')].map((slider)=>{
            const control=slider.querySelector('[data-base-ui-slider-control]');const thumb=slider.querySelector('[data-slot="slider-thumb"]');
            const rect=thumb.getBoundingClientRect();const after=getComputedStyle(thumb,'::after');
            return {controlHeight:control.getBoundingClientRect().height,thumbSize:rect.width,trackHeight:slider.querySelector('[data-slot="slider-track"]').getBoundingClientRect().height,hitWidth:parseFloat(after.width),hitHeight:parseFloat(after.height)};
          });return {count:sizes.length,sizes};
        })()`);
        measurements.push({ width, coarse, theme, path, sliders });
        check(
          `${theme} ${device} ${path} slider ${touch ? 'hit regions meet 44px' : 'visual dimensions remain compact'}`,
          sliders.count > 0 &&
            sliders.sizes.every((size) =>
              touch
                ? size.controlHeight >= 44 &&
                  size.hitWidth >= 44 &&
                  size.hitHeight >= 44 &&
                  size.thumbSize === 12 &&
                  size.trackHeight === 4
                : size.thumbSize === 12 &&
                  size.trackHeight === 4 &&
                  size.controlHeight === 4,
            ),
          JSON.stringify(sliders),
        );
        if (touch) {
          const target = await evaluate<{
            x: number;
            y: number;
            endX: number;
            before: string;
            hitsThumb: boolean;
            hitsControl: boolean;
          }>(`(() => {
            const slider=document.querySelector('[data-slot="slider"]');slider.scrollIntoView({block:'center',behavior:'instant'});
            const thumb=slider.querySelector('[data-slot="slider-thumb"]');const control=slider.querySelector('[data-base-ui-slider-control]');
            const rect=control.getBoundingClientRect();const thumbRect=thumb.getBoundingClientRect();
            const y=rect.y+rect.height/2+20;const x=rect.x+rect.width*0.1;
            return {x,y,endX:rect.x+rect.width*0.8,before:slider.querySelector('input').value,hitsThumb:thumb.contains(document.elementFromPoint(thumbRect.x+thumbRect.width/2,thumbRect.y+thumbRect.height/2+20)),hitsControl:control.contains(document.elementFromPoint(x,y))};
          })()`);
          check(
            `${theme} ${device} ${path} slider accepts hits 20px away from its visual track`,
            target.hitsThumb && target.hitsControl,
            JSON.stringify(target),
          );
          await page.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [{ x: target.x, y: target.y, id: 1 }],
          });
          await page.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: target.endX, y: target.y, id: 1 }],
          });
          await page.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: [],
          });
          const changed = await evaluate<string>(
            `document.querySelector('[data-slot="slider"] input').value`,
          );
          check(
            `${theme} ${device} ${path} off-track touch changes its value`,
            changed !== target.before,
            `${target.before} → ${changed}`,
          );
          await evaluate(
            `document.querySelector('[data-slot="slider"] input').focus()`,
          );
          await page.send('Input.dispatchKeyEvent', {
            type: 'keyDown',
            key: 'ArrowRight',
            code: 'ArrowRight',
            windowsVirtualKeyCode: 39,
          });
          await page.send('Input.dispatchKeyEvent', {
            type: 'keyUp',
            key: 'ArrowRight',
            code: 'ArrowRight',
            windowsVirtualKeyCode: 39,
          });
          check(
            `${theme} ${device} ${path} slider retains keyboard adjustment`,
            await evaluate<boolean>(
              `Number(document.querySelector('[data-slot="slider"] input').value) > ${Number(changed)}`,
            ),
          );
          await evaluate(
            `document.querySelector('[data-slot="slider"]').scrollIntoView({block:'center',behavior:'instant'})`,
          );
          await snapshot(
            `slider-${path.split('/').at(-1)}-${theme}-${width}-${coarse ? 'coarse' : 'fine'}`,
          );
        }
      }
    }
  }
  writeFileSync(
    resolve('outputs/ux/touch-targets.json'),
    JSON.stringify(measurements, null, 2),
  );
}
