'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, PauseCircle, Plus } from 'lucide-react';
import { PLAN_METHODS } from '@/lib/plan-engine';
import { usePlans } from '@/components/plan-store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function PlansView() {
  const { plans, ready } = usePlans();
  return (
    <main className="plan-page">
      <div className="plan-container">
        <nav aria-label="面包屑" className="breadcrumbs"><Link href="/">知识库</Link><span>/</span><span>学习计划</span></nav>
        <header className="plan-page-header">
          <div><p className="eyebrow">本地学习规划</p><h1>学习计划</h1><p>把现有知识目录组织成可调整的阶段和任务。计划数据只保存在当前浏览器。</p></div>
          <Button size="lg" render={<Link href="/plans/new" />}><Plus />创建学习计划</Button>
        </header>
        {!ready ? <div className="plan-empty" aria-busy="true">正在读取本地计划…</div> : plans.length === 0 ? (
          <section className="plan-empty">
            <CalendarDays />
            <h2>还没有学习计划</h2>
            <p>先选择目标、方向、方法和可用时间，生成预览后再决定是否保存。</p>
            <Button render={<Link href="/plans/new" />}><Plus />创建第一个计划</Button>
          </section>
        ) : (
          <section className="plan-card-list" aria-label="已保存计划">
            {plans.map((plan) => {
              const method = PLAN_METHODS.find((item) => item.value === plan.method)?.label ?? plan.method;
              const remaining = plan.phases.flatMap((phase) => phase.tasks).filter((task) => task.status !== 'completed' && task.status !== 'skipped').length;
              return (
                <article className="plan-card" key={plan.id}>
                  <div className="plan-card-top">
                    <span className={`plan-status plan-status-${plan.status}`}>{plan.status === 'active' ? <CheckCircle2 /> : <PauseCircle />}{plan.status === 'active' ? '进行中' : plan.status === 'paused' ? '已暂停' : '已完成'}</span>
                    <span>{method}</span>
                  </div>
                  <h2>{plan.title}</h2>
                  <p>{plan.goal || '尚未填写学习目标'}</p>
                  <div className="plan-progress-label"><span>总体进度</span><strong>{plan.completionRate}%</strong></div>
                  <Progress value={plan.completionRate} aria-label={`${plan.title}总体进度 ${plan.completionRate}%`} />
                  <div className="plan-card-meta">
                    <span><CalendarDays />预计 {plan.estimatedCompletionDate}</span>
                    <span><Clock3 />每周 {plan.weeklyMinutes} 分钟</span>
                    <span>{plan.phases.length} 个阶段 · {remaining} 个待办</span>
                  </div>
                  <Link href={`/plans/${plan.id}`} className="plan-card-link">查看计划<ArrowRight /></Link>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
