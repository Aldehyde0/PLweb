'use client';

import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  CirclePause,
  Edit3,
  ExternalLink,
  Flag,
  GripVertical,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { conceptMap } from '@/lib/content';
import { getConceptHref } from '@/lib/concept-utils';
import {
  localDate,
  TASK_STATUS_LABELS,
  type LearningPlan,
  type PlanPhase,
  type PlanTask,
} from '@/lib/plan-engine';
import { usePlans } from '@/components/plan-store';
import { useResources } from '@/components/resource-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function PlanTaskList({
  plan,
  phase,
  tasks,
  onOpenTest,
}: {
  plan: LearningPlan;
  phase: PlanPhase;
  tasks: PlanTask[];
  onOpenTest: () => void;
}) {
  const store = usePlans();
  const resourceStore = useResources();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  return (
    <ol className="plan-task-list">
      {tasks.map((task, index) => {
        const concept = task.conceptSlug ? conceptMap[task.conceptSlug] : null;
        const overdue =
          task.dueDate < localDate(new Date()) &&
          task.status !== 'completed' &&
          task.status !== 'skipped';
        return (
          <li
            key={task.id}
            id={`task-${task.id}`}
            className={`plan-task plan-task-${task.status} ${overdue ? 'overdue' : ''}`}
          >
            <button
              type="button"
              className="plan-task-drag"
              title="拖拽排序"
              draggable
              onDragStart={() => setDraggedId(task.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedId)
                  store.moveTask(plan.id, draggedId, phase.id, index);
                setDraggedId(null);
              }}
            >
              <GripVertical />
              <span className="sr-only">拖拽任务</span>
            </button>
            <div className="plan-task-main">
              <div className="plan-task-title-row">
                <span className="plan-task-type">
                  {taskTypeLabel(task.type)}
                </span>
                {task.isImportant && (
                  <span className="plan-task-important">
                    <Flag />
                    重点
                  </span>
                )}
                {overdue && <span className="plan-task-overdue">逾期</span>}
              </div>
              {task.resourceUrl ? (
                <a
                  className="plan-task-title"
                  href={task.resourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => {
                    if (task.resourceId)
                      resourceStore.markViewed(task.resourceId);
                  }}
                >
                  {task.title}
                  <ExternalLink />
                </a>
              ) : concept ? (
                <Link
                  className="plan-task-title"
                  href={`${getConceptHref(concept)}${task.targetSection ? `#${task.targetSection}` : ''}`}
                >
                  {task.title}
                  <ExternalLink />
                </Link>
              ) : (
                <strong className="plan-task-title">{task.title}</strong>
              )}
              <div className="plan-task-meta">
                <span>
                  {task.category ? categoryLabel(task.category) : '自定义'}
                </span>
                <span>{task.difficulty ?? '自定难度'}</span>
                <span>{task.estimatedMinutes} 分钟</span>
                <span>
                  <CalendarDays />
                  {task.dueDate}
                </span>
                <span>{TASK_STATUS_LABELS[task.status]}</span>
              </div>
              {task.description && <p>{task.description}</p>}
              {task.substeps.length > 0 && (
                <details className="plan-task-substeps">
                  <summary>
                    <span>学习步骤</span>
                    <strong>
                      {
                        task.substeps.filter(
                          (step) => step.status === 'completed',
                        ).length
                      }{' '}
                      / {task.substeps.length}
                    </strong>
                  </summary>
                  <ul>
                    {task.substeps.map((step) => {
                      const stepId = `${task.id}-${step.id}`;
                      return (
                        <li key={step.id}>
                          <input
                            id={stepId}
                            type="checkbox"
                            checked={step.status === 'completed'}
                            onChange={(event) =>
                              store.setSubstepStatus(
                                plan.id,
                                task.id,
                                step.id,
                                event.target.checked
                                  ? 'completed'
                                  : 'not-started',
                              )
                            }
                          />
                          <label htmlFor={stepId}>
                            <span>
                              <strong>{step.title}</strong>
                              {step.description && (
                                <small>{step.description}</small>
                              )}
                            </span>
                            <em>{step.estimatedMinutes} 分钟</em>
                          </label>
                          {concept && step.targetSection && (
                            <Link
                              href={`${getConceptHref(concept)}#${step.targetSection}`}
                              aria-label={`打开${step.title}对应章节`}
                            >
                              <ExternalLink />
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
              <details className="plan-task-edit">
                <summary>
                  <Edit3 />
                  编辑任务
                </summary>
                <TaskEditor plan={plan} task={task} />
              </details>
            </div>
            <div className="plan-task-actions">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="上移任务"
                disabled={index === 0}
                onClick={() =>
                  store.moveTask(plan.id, task.id, phase.id, index - 1)
                }
              >
                <ArrowUp />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="下移任务"
                disabled={index === tasks.length - 1}
                onClick={() =>
                  store.moveTask(plan.id, task.id, phase.id, index + 1)
                }
              >
                <ArrowDown />
              </Button>
              <Button
                size="icon-sm"
                variant={task.isImportant ? 'secondary' : 'ghost'}
                aria-label={task.isImportant ? '取消重点' : '标记重点'}
                onClick={() =>
                  store.updateTaskFields(plan.id, task.id, {
                    isImportant: !task.isImportant,
                  })
                }
              >
                <Flag />
              </Button>
              {task.status !== 'completed' && (
                <Button
                  size="sm"
                  onClick={() =>
                    store.setTaskStatus(plan.id, task.id, 'completed')
                  }
                >
                  <Check />
                  完成
                </Button>
              )}
              {task.status === 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    store.setTaskStatus(plan.id, task.id, 'not-started')
                  }
                >
                  重新打开
                </Button>
              )}
              {(task.type === 'review' || task.type === 'phase-review') &&
                phase.test.questions.length > 0 && (
                  <Button size="sm" variant="outline" onClick={onOpenTest}>
                    阶段测试
                  </Button>
                )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TaskEditor({ plan, task }: { plan: LearningPlan; task: PlanTask }) {
  const store = usePlans();
  const [draft, setDraft] = useState(task);
  const field = (name: string) => `${task.id}-${name}`;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        store.updateTaskFields(plan.id, task.id, {
          title: draft.title,
          estimatedMinutes: draft.estimatedMinutes,
          dueDate: draft.dueDate,
          notes: draft.notes,
        });
        if (draft.status !== task.status) {
          store.setTaskStatus(plan.id, task.id, draft.status);
        }
      }}
    >
      <label htmlFor={field('title')}>
        任务名称
        <Input
          id={field('title')}
          value={draft.title}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
        />
      </label>
      <label htmlFor={field('minutes')}>
        预计分钟
        <Input
          id={field('minutes')}
          type="number"
          min={5}
          value={draft.estimatedMinutes}
          onChange={(event) =>
            setDraft({ ...draft, estimatedMinutes: Number(event.target.value) })
          }
        />
      </label>
      <label htmlFor={field('due')}>
        截止日期
        <Input
          id={field('due')}
          type="date"
          value={draft.dueDate}
          onChange={(event) =>
            setDraft({ ...draft, dueDate: event.target.value })
          }
        />
      </label>
      <label htmlFor={field('phase')}>
        移动到阶段
        <select
          id={field('phase')}
          value={draft.phaseId}
          onChange={(event) => {
            const phaseId = event.target.value;
            store.moveTask(
              plan.id,
              task.id,
              phaseId,
              plan.phases.find((phase) => phase.id === phaseId)?.tasks.length ??
                0,
            );
            setDraft({ ...draft, phaseId });
          }}
        >
          {plan.phases.map((phase) => (
            <option key={phase.id} value={phase.id}>
              {phase.title}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={field('status')}>
        状态
        <select
          id={field('status')}
          value={draft.status}
          onChange={(event) =>
            setDraft({
              ...draft,
              status: event.target.value as PlanTask['status'],
            })
          }
        >
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="wide" htmlFor={field('notes')}>
        备注
        <Textarea
          id={field('notes')}
          value={draft.notes}
          onChange={(event) =>
            setDraft({ ...draft, notes: event.target.value })
          }
        />
      </label>
      <div className="plan-task-edit-actions">
        <Button type="submit" size="sm">
          保存任务
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            store.setTaskStatus(
              plan.id,
              task.id,
              task.status === 'paused'
                ? task.substeps.some((step) => step.status === 'completed')
                  ? 'in-progress'
                  : 'not-started'
                : 'paused',
            )
          }
        >
          <CirclePause />
          {task.status === 'paused' ? '恢复' : '暂停'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => store.setTaskStatus(plan.id, task.id, 'skipped')}
        >
          <SkipForward />
          跳过
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => store.deleteTask(plan.id, task.id)}
        >
          <Trash2 />
          删除
        </Button>
      </div>
    </form>
  );
}

function taskTypeLabel(type: PlanTask['type']) {
  const labels: Partial<Record<PlanTask['type'], string>> = {
    'concept-understanding': '名词与理解',
    'principle-practice': '原理与实践',
    'phase-review': '阶段复习',
    context: '知识位置',
    'related-concepts': '概念关系',
    'concept-reading': '概念阅读',
    'definition-reading': '阅读定义',
    intuition: '理解直觉',
    principle: '核心原理',
    formula: '数学公式',
    'code-reading': '代码阅读',
    'parameter-change': '参数修改',
    'interactive-experiment': '交互实验',
    'result-note': '结果记录',
    exercise: '小练习',
    project: '小项目',
    'self-explanation': '自主解释',
    'understanding-question': '理解问题',
    review: '间隔复习',
    'resource-article': '阅读资料',
    'resource-video': '观看视频',
    'resource-paper': '阅读论文',
    'resource-docs': '官方文档',
    'resource-github': 'GitHub 实践',
    'resource-code': '代码教程',
    'resource-review': '资料复习',
    custom: '自定义',
  };
  return labels[type] ?? type;
}
function categoryLabel(category: string) {
  return (
    (
      {
        'artificial-intelligence': '人工智能',
        'machine-learning': '机器学习',
        'deep-learning': '深度学习',
        'reinforcement-learning': '强化学习',
      } as Record<string, string>
    )[category] ?? category
  );
}
