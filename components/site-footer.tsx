'use client';

import { ProgressBackup } from '@/components/progress-backup';
import { usePathname } from 'next/navigation';

export function SiteFooter() {
  const pathname = usePathname();
  const english = pathname === '/' || pathname.startsWith('/category/');
  return (
    <footer className="site-footer">
      <p className="site-footer__statement">
        {english
          ? 'Understand an idea. Run the code. Solve a problem.'
          : '理解一个概念，再独立解决一个问题。'}
      </p>
      <div className="site-footer__meta">
        <span>Layerwise</span>
        <span>
          {english
            ? 'Your learning stays in this browser.'
            : '学习数据仅保存在当前浏览器'}
        </span>
      </div>
      <ProgressBackup english={english} />
    </footer>
  );
}
