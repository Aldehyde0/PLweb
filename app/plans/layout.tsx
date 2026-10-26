import { Suspense } from 'react';
import { WorkspaceFrame } from '@/components/layerwise/workspace-frame';

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p>正在读取学习计划…</p>}>
      <WorkspaceFrame kind="plans">{children}</WorkspaceFrame>
    </Suspense>
  );
}
