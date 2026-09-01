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
