'use client';

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import {
  getNextTheme,
  readThemePreference,
  saveThemePreference,
  type Theme,
} from '@/lib/theme';
import { usePersistence } from '@/components/persistence-store';

export function ThemeToggle() {
  const { reportWrite } = usePersistence();
  const [theme, setTheme] = useState<Theme>(() => readThemePreference());

  function toggleTheme() {
    const nextTheme = getNextTheme(theme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    setTheme(nextTheme);
    // The theme still switches when storage is unavailable; the learner is told
    // that the choice will not be remembered instead of losing the visual change.
    reportWrite('theme', saveThemePreference(nextTheme));
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="切换浅色或深色显示"
      title="切换显示主题"
      onClick={toggleTheme}
    >
      <Sun className="theme-toggle__sun" aria-hidden="true" />
      <Moon className="theme-toggle__moon" aria-hidden="true" />
    </button>
  );
}
