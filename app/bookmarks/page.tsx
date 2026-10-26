import type { Metadata } from 'next';
import { BookmarksView } from '@/components/bookmarks-view';
import { WorkspaceFrame } from '@/components/layerwise/workspace-frame';
import { Suspense } from 'react';
export const metadata: Metadata = {
  title: 'Bookmarks · Layerwise',
  description: '保存在当前浏览器中的 AI 学习概念。',
};
export default function BookmarksPage() {
  return (
    <Suspense fallback={<p>正在读取收藏…</p>}>
      <WorkspaceFrame kind="bookmarks">
        <BookmarksView />
      </WorkspaceFrame>
    </Suspense>
  );
}
