import type { Metadata } from 'next';
import { ExercisesView } from '@/components/exercises-view';
import { Suspense } from 'react';
import { WorkspaceFrame } from '@/components/layerwise/workspace-frame';
export const metadata: Metadata = {
  title: 'Practice · Layerwise',
  description: '按方向、难度和标签检索 AI 学习练习，展开答案并关联学习内容。',
};
export default function ExercisesPage() {
  return (
    <Suspense fallback={<main aria-busy="true">正在读取练习筛选…</main>}>
      <WorkspaceFrame kind="practice">
        <ExercisesView />
      </WorkspaceFrame>
    </Suspense>
  );
}
