'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3 } from 'lucide-react';
import { conceptMap } from '@/lib/content';
import { getConceptHref } from '@/lib/concept-utils';
import type { LearningPlan } from '@/lib/plan-engine';
import { Button } from '@/components/ui/button';

export function PlanNextStep({ plan }: { plan: LearningPlan }) {
  const task = plan.phases
    .flatMap((phase) => phase.tasks)
    .find((item) => item.status !== 'completed' && item.status !== 'skipped');
  if (!task)
    return (
      <section className="plan-next-step complete">
        <CheckCircle2 />
        <div>
          <p className="eyebrow">下一步</p>
          <h2>计划任务已经全部完成</h2>
          <p>可以继续阶段测试或回顾重点概念。</p>
        </div>
      </section>
    );
  const step = task.substeps.find(
    (item) => item.status !== 'completed' && item.status !== 'skipped',
  );
  const concept = task.conceptSlug ? conceptMap[task.conceptSlug] : null;
  const href = concept
    ? `${getConceptHref(concept)}#${step?.targetSection ?? task.targetSection ?? 'definition'}`
    : `#task-${task.id}`;
  return (
    <section className="plan-next-step">
      <div>
        <p className="eyebrow">下一条建议任务</p>
        <h2>{step?.title ?? task.title}</h2>
        <p>{step?.description || task.description}</p>
        <span>
          <Clock3 />
          预计 {step?.estimatedMinutes ?? task.estimatedMinutes} 分钟
        </span>
      </div>
      <Button render={<Link href={href} />}>
        开始下一步
        <ArrowRight />
      </Button>
    </section>
  );
}
