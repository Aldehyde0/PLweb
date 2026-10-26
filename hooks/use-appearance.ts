'use client';

import { useEffect, useState } from 'react';
import { readThemePreference, type Theme } from '@/lib/theme';

/** SSR-safe subscription: the first client render matches the server. */
export function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export function useAppliedTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    const update = () => setTheme(readThemePreference());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}
