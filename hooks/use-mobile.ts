import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', onChange);
  window.addEventListener('resize', onChange);
  return () => {
    mql.removeEventListener('change', onChange);
    window.removeEventListener('resize', onChange);
  };
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Reads the viewport class as an external store instead of pushing it into state
 * from an effect. The server and the first client render both report `false`,
 * and updates arrive through the media-query listener, so there is no
 * setState-inside-effect cascade and no hydration mismatch.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}
