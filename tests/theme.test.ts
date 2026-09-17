import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import {
  getNextTheme,
  normalizeTheme,
  resolveTheme,
  themeBootScript,
  THEME_STORAGE_KEY,
} from '../lib/theme.ts';

void test('normalizes only supported persisted theme values', () => {
  assert.equal(normalizeTheme('light'), 'light');
  assert.equal(normalizeTheme('dark'), 'dark');
  assert.equal(normalizeTheme('system'), null);
  assert.equal(normalizeTheme(null), null);
});

void test('uses a saved theme before the operating-system preference', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});

void test('falls back to the operating-system preference when no theme is saved', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
});

void test('theme toggle always switches to the opposite explicit theme', () => {
  assert.equal(getNextTheme('light'), 'dark');
  assert.equal(getNextTheme('dark'), 'light');
});

/**
 * Runs the inline boot script against a minimal fake document, so a mismatch
 * between what the app writes and what the pre-paint script reads is caught by a
 * test instead of by a page that silently reverts to the OS preference.
 */
function runBootScript(options: {
  stored?: string | null;
  storedThrows?: boolean;
  prefersDark?: boolean;
}): { theme: string | null; darkClass: boolean } {
  const documentElement = {
    dataset: {} as Record<string, string>,
    classList: {
      dark: false,
      toggle(name: string, on: boolean) {
        if (name === 'dark') this.dark = on;
      },
    },
  };
  const localStorage = {
    getItem(key: string) {
      if (options.storedThrows) {
        const error = new Error('blocked');
        error.name = 'SecurityError';
        throw error;
      }
      return key === THEME_STORAGE_KEY ? (options.stored ?? null) : null;
    },
  };
  const matchMedia = () => ({ matches: options.prefersDark ?? false });
  // The boot script is a plain string (it is inlined into the document), so it
  // is executed in a sandbox with only the globals a browser would provide.
  runInNewContext(themeBootScript(THEME_STORAGE_KEY), {
    document: { documentElement },
    localStorage,
    matchMedia,
  });
  return {
    theme: documentElement.dataset.theme ?? null,
    darkClass: documentElement.classList.dark,
  };
}

void test('the boot script reads the JSON form the app now writes', () => {
  const applied = runBootScript({
    stored: JSON.stringify('light'),
    prefersDark: true,
  });
  assert.equal(applied.theme, 'light', 'a saved light theme must win over the OS');
  assert.equal(applied.darkClass, false);
});

void test('the boot script still reads the bare string older builds wrote', () => {
  const applied = runBootScript({ stored: 'light', prefersDark: true });
  assert.equal(applied.theme, 'light', 'legacy stored values must keep working');
  assert.equal(applied.darkClass, false);
});

void test('the boot script falls back to the OS preference for junk values', () => {
  for (const stored of [null, 'system', '"system"', '{', '""', '"dark" '.trim()])
    assert.equal(
      runBootScript({ stored, prefersDark: true }).theme,
      'dark',
      `stored=${String(stored)} should fall back to the OS preference`,
    );
  assert.equal(
    runBootScript({ stored: '"dark"', prefersDark: false }).theme,
    'dark',
    'a saved dark theme must win over a light OS preference',
  );
});

void test('the boot script keeps the page usable when storage is blocked', () => {
  const applied = runBootScript({ storedThrows: true, prefersDark: true });
  assert.equal(applied.theme, 'light');
  assert.equal(applied.darkClass, false);
});

void test('the boot script sets the dark class together with data-theme', () => {
  const dark = runBootScript({ stored: '"dark"', prefersDark: false });
  assert.equal(dark.theme, 'dark');
  assert.equal(dark.darkClass, true);
});
