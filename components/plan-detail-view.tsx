'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  ListChecks,
  Pause,
  Play,
  Plus,
  Settings2,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { localDate, PLAN_METHODS, type LearningPlan } from '@/lib/plan-engine';
import { usePlans } from '@/components/plan-store';
import { PlanTaskList } from '@/components/plan-task-list';
import { StageTestPanel } from '@/components/stage-test-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

export function PlanDetailView({
  planId,
  view,
}: {
  planId: string;
  view: 'all' | 'today' | 'week';
}) {
  const store = usePlans();
  const plan = store.plans.find((item) => item.id === planId);
  const [testPhaseId, setTestPhaseId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  if (!store.ready)
    return (
      <main className="plan-page">
        <div className="plan-container">
          <div className="plan-empty" aria-busy="true">
            正在读取本地计划…
          </div>
        </div>
      </main>
    );
  if (!plan)
    return (
      <main className="plan-page">
        <div className="plan-container">
          <div className="plan-empty">
            <AlertTriangle />
            <h1>没有找到这个计划</h1>
            <p>它可能已被删除，或者这个链接来自另一个浏览器。</p>
            <Button render={<Link href="/plans" />}>
              <ArrowLeft />
              返回计划列表
            </Button>
          </div>
        </div>
      </main>
    );
  const activePhase =
    plan.phases.find((phase) => phase.id === plan.activePhaseId) ??
    plan.phases[0];
  const allTasks = plan.phases.flatMap((phase) => phase.tasks);
  const today = localDate(new Date());
  const weekEndDate = new Date();
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEnd = localDate(weekEndDate);
  const isOpen = (status: string) =>
    status !== 'completed' && status !== 'skipped';
  const todayTasks = allTasks.filter(
    (task) => task.dueDate === today && isOpen(task.status),
  );
  const weekTasks = allTasks.filter(
    (task) =>
      task.dueDate >= today && task.dueDate <= weekEnd && isOpen(task.status),
  );
  const overdue = allTasks.filter(
    (task) => task.dueDate < today && isOpen(task.status),
  );
  const lastTask = allTasks.find((task) => task.id === plan.lastTaskId);
  const visiblePhases =
    view === 'all'
      ? plan.phases
      : plan.phases
          .map((phase) => ({
            ...phase,
            tasks: phase.tasks.filter((task) =>
              view === 'today'
                ? task.dueDate === today
                : task.dueDate >= today && task.dueDate <= weekEnd,
            ),
          }))
          .filter((phase) => phase.tasks.length);
  const viewTitle =
    view === 'today' ? '今日任务' : view === 'week' ? '本周任务' : plan.title;

  if (testPhaseId) {
    const phase = plan.phases.find((item) => item.id === testPhaseId);
    if (phase)
      return (
        <StageTestPanel
          plan={plan}
          phase={phase}
          onClose={() => setTestPhaseId(null)}
        />
      );
  }

  return (
    <main className="plan-page">
      <div className="plan-container">
        <nav aria-label="面包屑" className="breadcrumbs">
          <Link href="/">知识库</Link>
          <span>/</span>
          <Link href="/plans">学习计划</Link>
          <span>/</span>
          <span>{viewTitle}</span>
        </nav>
        <header className="plan-detail-header">
          <div>
            <div className="plan-title-badges">
              <span>
                {PLAN_METHODS.find((item) => item.value === plan.method)?.label}
              </span>
              <span className={`plan-status plan-status-${plan.status}`}>
                {plan.status === 'active'
                  ? '进行中'
                  : plan.status === 'paused'
                    ? '已暂停'
                    : '已完成'}
              </span>
            </div>
            <h1>{viewTitle}</h1>
            {view !== 'all' && <p>{plan.title}</p>}
            <p>{plan.goal}</p>
          </div>
          <div className="plan-header-actions">
            <Button
              variant="outline"
              render={<Link href={`/plans/${plan.id}/today`} />}
            >
              <CalendarDays />
              今日
            </Button>
            <Button
              variant="outline"
              render={<Link href={`/plans/${plan.id}/week`} />}
            >
              <CalendarRange />
              本周
            </Button>
            {view !== 'all' && (
              <Button
                variant="outline"
                render={<Link href={`/plans/${plan.id}`} />}
              >
                <ArrowLeft />
                完整计划
              </Button>
            )}
          </div>
        </header>
        {view === 'all' && (
          <>
            <section className="plan-overview-grid">
              <Metric
                icon={<Target />}
                label="总体进度"
                value={`${plan.completionRate}%`}
                note={`${allTasks.filter((task) => task.status === 'completed').length} / ${allTasks.length} 个任务完成`}
              />
              <Metric
                icon={<ListChecks />}
                label="当前阶段"
                value={activePhase?.title ?? '暂无阶段'}
                note={
                  activePhase
                    ? `${activePhase.completionRate}% 完成`
                    : '请重新生成计划'
                }
              />
              <Metric
                icon={<Clock3 />}
                label="上次学习进度"
                value={lastTask?.title ?? '尚未开始'}
                note={
                  lastTask?.completedAt
                    ? new Date(lastTask.completedAt).toLocaleString('zh-CN')
                    : '完成首个任务后记录'
                }
              />
              <Metric
                icon={<CalendarDays />}
                label="预计完成日期"
                value={plan.estimatedCompletionDate}
                note={`目标日期 ${plan.targetDate}`}
              />
            </section>
            <section className="plan-progress-card">
              <div className="plan-progress-label">
                <span>总体进度</span>
                <strong>{plan.completionRate}%</strong>
              </div>
              <Progress
                value={plan.completionRate}
                aria-label={`总体进度 ${plan.completionRate}%`}
              />
            </section>
            <section className="plan-today-grid">
              <TaskSummary
                title="今日任务"
                count={todayTasks.length}
                tasks={todayTasks}
                href={`/plans/${plan.id}/today`}
              />
              <TaskSummary
                title="本周任务"
                count={weekTasks.length}
                tasks={weekTasks}
                href={`/plans/${plan.id}/week`}
              />
              <TaskSummary
                title="逾期任务"
                count={overdue.length}
                tasks={overdue}
                warn
              />
            </section>
            <section className="plan-toolbar" id="adjust-plan">
              <div>
                <h2>阶段时间线</h2>
                <p>
                  阶段测试不会阻塞后续任务，任务调整也不会改变全局知识目录。
                </p>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                >
                  <Settings2 />
                  调整计划
                </Button>
                <Button onClick={() => setCustomOpen(!customOpen)}>
                  <Plus />
                  添加自定义任务
                </Button>
              </div>
            </section>
            {settingsOpen && (
              <PlanSettings
                plan={plan}
                onSave={(next) => {
                  store.updatePlan(next);
                  setSettingsOpen(false);
                }}
              />
            )}
            {customOpen && (
              <CustomTaskForm
                plan={plan}
                onSave={(phaseId, input) => {
                  store.addCustomTask(plan.id, phaseId, input);
                  setCustomOpen(false);
                }}
              />
            )}
          </>
        )}
        <section className="plan-timeline" aria-label="计划阶段">
          {visiblePhases.length === 0 ? (
            <div className="plan-empty">
              <CalendarDays />
              <h2>这个时间范围没有任务</h2>
              <p>返回完整计划调整截止日期或查看其他阶段。</p>
            </div>
          ) : (
            visiblePhases.map((phase) => (
              <article className="plan-phase" key={phase.id}>
                <aside>
                  <span className="plan-phase-index">
                    {String(phase.order + 1).padStart(2, '0')}
                  </span>
                  <div className="plan-phase-line" />
                </aside>
                <div className="plan-phase-body">
                  <header>
                    <div>
                      <p className="eyebrow">
                        {phase.status === 'completed'
                          ? '阶段已完成'
                          : phase.status === 'in-progress'
                            ? '正在学习'
                            : '等待开始'}
                      </p>
                      <h2>{phase.title}</h2>
                      <p>{phase.description}</p>
                    </div>
                    <div className="plan-phase-progress">
                      <strong>{phase.completionRate}%</strong>
                      <span>截止 {phase.targetDate}</span>
                    </div>
                  </header>
                  <Progress
                    value={phase.completionRate}
                    aria-label={`${phase.title}完成度 ${phase.completionRate}%`}
                  />
                  {phase.completionRate === 100 &&
                    phase.test.status === 'not-started' && (
                      <div className="phase-complete-prompt">
                        <CheckCircle2 />
                        <div>
                          <strong>本阶段已经完成，是否进行阶段练习？</strong>
                          <span>测试结果独立保存，不影响后续阶段。</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setTestPhaseId(phase.id)}
                        >
                          现在开始
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            store.setStageTestStatus(plan.id, phase.id, 'later')
                          }
                        >
                          稍后再做
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            store.setStageTestStatus(
                              plan.id,
                              phase.id,
                              'skipped',
                            )
                          }
                        >
                          跳过本次测试
                        </Button>
                      </div>
                    )}
                  <div className="plan-phase-actions">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTestPhaseId(phase.id)}
                      disabled={!phase.test.questions.length}
                    >
                      {phase.test.status === 'completed'
                        ? `阶段测试 ${phase.test.score} 分`
                        : '进入阶段测试'}
                    </Button>
                    <button
                      type="button"
                      className={phase.mastered ? 'mastered' : ''}
                      onClick={() =>
                        store.setPhaseMastered(
                          plan.id,
                          phase.id,
                          !phase.mastered,
                        )
                      }
                      aria-pressed={phase.mastered}
                    >
                      {phase.mastered ? '已标记重点掌握' : '标记重点掌握'}
                    </button>
                  </div>
                  <PlanTaskList
                    plan={plan}
                    phase={phase}
                    tasks={phase.tasks}
                    onOpenTest={() => setTestPhaseId(phase.id)}
                  />
                </div>
              </article>
            ))
          )}
        </section>
        {view === 'all' && (
          <div className="plan-bottom-actions">
            <Button
              variant="outline"
              onClick={() =>
                store.setPlanStatus(
                  plan.id,
                  plan.status === 'paused' ? 'active' : 'paused',
                )
              }
            >
              {plan.status === 'paused' ? <Play /> : <Pause />}
              {plan.status === 'paused' ? '恢复计划' : '暂停计划'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="plan-metric">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{note}</p>
      </div>
    </article>
  );
}
function TaskSummary({
  title,
  count,
  tasks,
  href,
  warn,
}: {
  title: string;
  count: number;
  tasks: LearningPlan['phases'][number]['tasks'];
  href?: string;
  warn?: boolean;
}) {
  return (
    <article className={`plan-task-summary ${warn && count ? 'warn' : ''}`}>
      <header>
        <h2>{title}</h2>
        <strong>{count}</strong>
      </header>
      {tasks.slice(0, 2).map((task) => (
        <p key={task.id}>
          {task.title}
          <span>{task.estimatedMinutes} 分钟</span>
        </p>
      ))}
      {!tasks.length && <p className="quiet">当前没有任务</p>}
      {href && <Link href={href}>查看全部</Link>}
    </article>
  );
}

function PlanSettings({
  plan,
  onSave,
}: {
  plan: LearningPlan;
  onSave: (plan: LearningPlan) => void;
}) {
  const [draft, setDraft] = useState(plan);
  return (
    <form
      className="plan-inline-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h2>调整计划信息</h2>
      <label htmlFor={`${plan.id}-settings-title`}>
        计划名称
        <Input
          id={`${plan.id}-settings-title`}
          value={draft.title}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
        />
      </label>
      <label htmlFor={`${plan.id}-settings-weekly`}>
        每周分钟
        <Input
          id={`${plan.id}-settings-weekly`}
          type="number"
          min={30}
          value={draft.weeklyMinutes}
          onChange={(event) =>
            setDraft({ ...draft, weeklyMinutes: Number(event.target.value) })
          }
        />
      </label>
      <label htmlFor={`${plan.id}-settings-date`}>
        目标日期
        <Input
          id={`${plan.id}-settings-date`}
          type="date"
          value={draft.targetDate}
          onChange={(event) =>
            setDraft({ ...draft, targetDate: event.target.value })
          }
        />
      </label>
      <label className="wide" htmlFor={`${plan.id}-settings-goal`}>
        学习目标
        <Textarea
          id={`${plan.id}-settings-goal`}
          value={draft.goal}
          onChange={(event) => setDraft({ ...draft, goal: event.target.value })}
        />
      </label>
      <Button type="submit">保存调整</Button>
    </form>
  );
}
function CustomTaskForm({
  plan,
  onSave,
}: {
  plan: LearningPlan;
  onSave: (
    phaseId: string,
    input: {
      title: string;
      description: string;
      estimatedMinutes: number;
      dueDate: string;
      notes: string;
    },
  ) => void;
}) {
  const [phaseId, setPhaseId] = useState(
    plan.activePhaseId || plan.phases[0]?.id || '',
  );
  const [input, setInput] = useState({
    title: '',
    description: '',
    estimatedMinutes: 25,
    dueDate: localDate(new Date()),
    notes: '',
  });
  return (
    <form
      className="plan-inline-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(phaseId, input);
      }}
    >
      <h2>添加自定义任务</h2>
      <label htmlFor={`${plan.id}-custom-title`}>
        任务名称
        <Input
          id={`${plan.id}-custom-title`}
          required
          value={input.title}
          onChange={(event) =>
            setInput({ ...input, title: event.target.value })
          }
        />
      </label>
      <label htmlFor={`${plan.id}-custom-phase`}>
        所属阶段
        <select
          id={`${plan.id}-custom-phase`}
          value={phaseId}
          onChange={(event) => setPhaseId(event.target.value)}
        >
          {plan.phases.map((phase) => (
            <option key={phase.id} value={phase.id}>
              {phase.title}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${plan.id}-custom-minutes`}>
        预计分钟
        <Input
          id={`${plan.id}-custom-minutes`}
          type="number"
          min={5}
          value={input.estimatedMinutes}
          onChange={(event) =>
            setInput({ ...input, estimatedMinutes: Number(event.target.value) })
          }
        />
      </label>
      <label htmlFor={`${plan.id}-custom-date`}>
        截止日期
        <Input
          id={`${plan.id}-custom-date`}
          type="date"
          value={input.dueDate}
          onChange={(event) =>
            setInput({ ...input, dueDate: event.target.value })
          }
        />
      </label>
      <label className="wide" htmlFor={`${plan.id}-custom-description`}>
        说明
        <Textarea
          id={`${plan.id}-custom-description`}
          value={input.description}
          onChange={(event) =>
            setInput({ ...input, description: event.target.value })
          }
        />
      </label>
      <label className="wide" htmlFor={`${plan.id}-custom-notes`}>
        备注
        <Textarea
          id={`${plan.id}-custom-notes`}
          value={input.notes}
          onChange={(event) =>
            setInput({ ...input, notes: event.target.value })
          }
        />
      </label>
      <Button type="submit">
        <Plus />
        添加任务
      </Button>
    </form>
  );
}
