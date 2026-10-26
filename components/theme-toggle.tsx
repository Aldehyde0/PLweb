'use client';

import { Moon, Sun } from 'lucide-react';
import { useAppliedTheme } from '@/hooks/use-appearance';
import { usePathname } from 'next/navigation';
import { getNextTheme, saveThemePreference } from '@/lib/theme';
import { usePersistence } from '@/components/persistence-store';

export function ThemeToggle() {
  const { reportWrite } = usePersistence();
  const theme = useAppliedTheme();
  const pathname = usePathname();
  const english = pathname === '/' || pathname.startsWith('/category/');

  function toggleTheme() {
    const nextTheme = getNextTheme(theme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    // The theme still switches when storage is unavailable; the learner is told
    // that the choice will not be remembered instead of losing the visual change.
    reportWrite('theme', saveThemePreference(nextTheme));
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={english ? 'Switch color theme' : '切换浅色或深色显示'}
      title="Switch color theme"
      onClick={toggleTheme}
    >
      <Sun className="theme-toggle__sun" aria-hidden="true" />
      <Moon className="theme-toggle__moon" aria-hidden="true" />
    </button>
  );
}
