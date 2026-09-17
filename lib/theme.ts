import { readStored, writeStored, type WriteOutcome } from './browser-storage.ts';

export const THEME_STORAGE_KEY = 'how-to-learn-ai-theme';

export type Theme = 'light' | 'dark';

export function normalizeTheme(value: string | null): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function resolveTheme(
  savedTheme: string | null,
  prefersDark: boolean,
): Theme {
  return normalizeTheme(savedTheme) ?? (prefersDark ? 'dark' : 'light');
}

export function getNextTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light';
}

/**
 * Source of the inline boot script that runs before first paint.
 *
 * The stored value is parsed defensively: builds before this one wrote the bare
 * string `dark`, while the current writer stores JSON (`"dark"`). Reading only
 * one of the two shapes is exactly what made a saved theme silently revert, so
 * both are accepted here and covered by tests.
 */
export function themeBootScript(storageKey = THEME_STORAGE_KEY): string {
  return `(function(){try{
var raw=localStorage.getItem(${JSON.stringify(storageKey)});
var saved=null;
try{saved=JSON.parse(raw)}catch(e){saved=raw}
if(saved!=='light'&&saved!=='dark'){saved=null}
var theme=saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
document.documentElement.dataset.theme=theme;
document.documentElement.classList.toggle('dark',theme==='dark');
}catch(e){document.documentElement.dataset.theme='light'}})()`;
}

/**
 * Reads the theme currently applied to the document. The inline boot script in
 * `app/layout.tsx` always sets `data-theme`, so this is the source of truth and
 * it keeps working when storage is blocked.
 */
export function readThemePreference(): Theme {
  if (typeof document === 'undefined') return 'light';
  const applied = document.documentElement.dataset.theme;
  const normalized = normalizeTheme(applied ?? null);
  if (normalized) return normalized;
  const stored = readStored('local', THEME_STORAGE_KEY, (parsed) =>
    typeof parsed === 'string' ? parsed : '',
  );
  return normalizeTheme(stored.value ?? null) ?? 'light';
}

export function saveThemePreference(theme: Theme): WriteOutcome {
  return writeStored('local', THEME_STORAGE_KEY, theme);
}
