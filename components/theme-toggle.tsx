'use client';

import { Moon, Sun } from 'lucide-react';
import { getNextTheme, type Theme, THEME_STORAGE_KEY } from '@/lib/theme';

function readCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle() {
  function toggleTheme() {
    const nextTheme = getNextTheme(readCurrentTheme());
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
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
