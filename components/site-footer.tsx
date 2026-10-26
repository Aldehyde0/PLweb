'use client';

import { ProgressBackup } from '@/components/progress-backup';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__statement">
        Understand an idea. Run the code. Solve a problem.
      </p>
      <div className="site-footer__meta">
        <span>Layerwise</span>
        <span>Your learning stays in this browser.</span>
      </div>
      <ProgressBackup english />
    </footer>
  );
}
