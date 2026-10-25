import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function launchBrowser() {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    const entry =
      process.env.PLAYWRIGHT_PACKAGE ??
      join(
        homedir(),
        '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs',
      );
    playwright = await import(pathToFileURL(entry).href);
  }
  const executablePath = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => p && existsSync(p));
  return playwright.chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
}
