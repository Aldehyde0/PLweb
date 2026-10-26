import { ResourcesView } from '@/components/resources-view';
import { Suspense } from 'react';
import { WorkspaceFrame } from '@/components/layerwise/workspace-frame';

export default function ResourcesPage() {
  return (
    <Suspense fallback={<main aria-busy="true">正在读取资料筛选…</main>}>
      <WorkspaceFrame kind="resources">
        <ResourcesView />
      </WorkspaceFrame>
    </Suspense>
  );
}
