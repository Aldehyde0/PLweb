import { PlanDetailView } from '@/components/plan-detail-view';

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlanDetailView planId={id} view="all" />;
}
