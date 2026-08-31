'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  PLAN_STORAGE_KEY,
  buildReminder,
  localDate,
  migratePlanState,
  moveTask as moveTaskInPlan,
  recomputePlan,
  scoreStageTest,
  syncLearnedTasks,
  updateTask,
  type LearningActivity,
  type LearningPlan,
  type PlanState,
  type PlanTask,
  type ReminderView,
  type StageTestStatus,
  type TaskStatus,
} from '@/lib/plan-engine';
import { useLearning } from '@/components/learning-store';

type PlanContextValue = PlanState & {
  ready: boolean;
  activePlan: LearningPlan | null;
  reminderView: ReminderView | null;
  savePlan: (plan: LearningPlan) => void;
  deletePlan: (planId: string) => void;
  updatePlan: (plan: LearningPlan) => void;
  setPlanStatus: (planId: string, status: LearningPlan['status']) => void;
  setTaskStatus: (planId: string, taskId: string, status: TaskStatus) => void;
  updateTaskFields: (planId: string, taskId: string, patch: Partial<PlanTask>) => void;
  moveTask: (planId: string, taskId: string, phaseId: string, index: number) => void;
  deleteTask: (planId: string, taskId: string) => void;
  addCustomTask: (planId: string, phaseId: string, input: Pick<PlanTask, 'title' | 'description' | 'estimatedMinutes' | 'dueDate' | 'notes'>) => void;
  setStageTestStatus: (planId: string, phaseId: string, status: StageTestStatus) => void;
  submitStageTest: (planId: string, phaseId: string, answers: Record<string, string[]>, addWeakToReview: boolean) => void;
  setPhaseMastered: (planId: string, phaseId: string, mastered: boolean) => void;
  dismissReminder: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { learned, markLearned, ready: learningReady } = useLearning();
  const [state, setState] = useState<PlanState>(() => migratePlanState(null));
  const [ready, setReady] = useState(false);
  const [reminderView, setReminderView] = useState<ReminderView | null>(null);
  const reminderChecked = useRef(false);

  useEffect(() => {
    const loaded = migratePlanState(localStorage.getItem(PLAN_STORAGE_KEY));
    loaded.reminder.lastOpenedAt = new Date().toISOString();
    setState(loaded);
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(state)); }, [ready, state]);
  useEffect(() => {
    if (!ready || !learningReady) return;
    setState((prev) => {
      let changed = false;
      const plans = prev.plans.map((plan) => {
        const synced = syncLearnedTasks(plan, learned);
        changed ||= synced !== plan;
        return synced;
      });
      if (!changed) return prev;
      const completedTaskIds = plans.flatMap((plan) => plan.phases.flatMap((phase) => phase.tasks)).filter((task) => task.status === 'completed').map((task) => task.id);
      return { ...prev, plans, completedTaskIds };
    });
  }, [ready, learningReady, learned]);
  useEffect(() => {
    if (!ready || reminderChecked.current) return;
    reminderChecked.current = true;
    const active = state.plans.find((plan) => plan.id === state.reminder.activePlanId) ?? null;
    const view = buildReminder(active, state.reminder, new Date());
    if (!view) return;
    setReminderView(view);
    setState((prev) => ({ ...prev, reminder: { ...prev.reminder, lastReminderDate: localDate(new Date()) } }));
  }, [ready, state]);

  const mutatePlan = useCallback((planId: string, mutation: (plan: LearningPlan) => LearningPlan, activity?: Omit<LearningActivity, 'id' | 'planId' | 'startedAt'>) => {
    const now = new Date();
    setState((prev) => {
      const plans = prev.plans.map((plan) => plan.id === planId ? mutation(plan) : plan);
      const completedTaskIds = plans.flatMap((plan) => plan.phases.flatMap((phase) => phase.tasks)).filter((task) => task.status === 'completed').map((task) => task.id);
      const activities = activity ? [...prev.activities, {
        id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, planId,
        taskId: activity.taskId, actionType: activity.actionType, startedAt: now.toISOString(),
        completedAt: activity.completedAt, durationMinutes: activity.durationMinutes,
      }] : prev.activities;
      const reminder = activity ? { ...prev.reminder, activePlanId: planId, lastStudyAt: now.toISOString(), lastStudyDate: localDate(now) } : prev.reminder;
      return { ...prev, plans, completedTaskIds, activities, reminder };
    });
  }, []);

  const savePlan = useCallback((plan: LearningPlan) => {
    setState((prev) => ({
      ...prev,
      plans: [...prev.plans.map((item) => item.status === 'active' ? { ...item, status: 'paused' as const } : item), plan],
      reminder: { ...prev.reminder, activePlanId: plan.id },
    }));
  }, []);
  const deletePlan = useCallback((planId: string) => setState((prev) => {
    const plans = prev.plans.filter((plan) => plan.id !== planId);
    return { ...prev, plans, reminder: { ...prev.reminder, activePlanId: prev.reminder.activePlanId === planId ? plans.find((plan) => plan.status === 'active')?.id ?? null : prev.reminder.activePlanId } };
  }), []);
  const updatePlanValue = useCallback((plan: LearningPlan) => setState((prev) => ({ ...prev, plans: prev.plans.map((item) => item.id === plan.id ? recomputePlan(plan) : item) })), []);
  const setPlanStatus = useCallback((planId: string, status: LearningPlan['status']) => mutatePlan(planId, (plan) => recomputePlan({ ...plan, status })), [mutatePlan]);
  const setTaskStatus = useCallback((planId: string, taskId: string, status: TaskStatus) => {
    const plan = state.plans.find((item) => item.id === planId);
    const task = plan?.phases.flatMap((phase) => phase.tasks).find((item) => item.id === taskId);
    if (!plan || !task) return;
    if (status === 'completed' && task.conceptSlug && (task.type === 'concept-reading' || task.type === 'definition-reading')) markLearned(task.conceptSlug);
    mutatePlan(planId, (current) => updateTask(current, taskId, { status }), status === 'completed' ? {
      taskId, actionType: task.type.includes('code') || task.type === 'interactive-experiment' ? 'code' : 'task',
      completedAt: new Date().toISOString(), durationMinutes: task.estimatedMinutes,
    } : undefined);
  }, [state.plans, markLearned, mutatePlan]);
  const updateTaskFields = useCallback((planId: string, taskId: string, patch: Partial<PlanTask>) => mutatePlan(planId, (plan) => updateTask(plan, taskId, patch)), [mutatePlan]);
  const moveTask = useCallback((planId: string, taskId: string, phaseId: string, index: number) => mutatePlan(planId, (plan) => moveTaskInPlan(plan, taskId, phaseId, index)), [mutatePlan]);
  const deleteTask = useCallback((planId: string, taskId: string) => mutatePlan(planId, (plan) => recomputePlan({ ...plan, phases: plan.phases.map((phase) => ({ ...phase, tasks: phase.tasks.filter((task) => task.id !== taskId).map((task, order) => ({ ...task, order })) })) })), [mutatePlan]);
  const addCustomTask = useCallback((planId: string, phaseId: string, input: Pick<PlanTask, 'title' | 'description' | 'estimatedMinutes' | 'dueDate' | 'notes'>) => mutatePlan(planId, (plan) => {
    const phases = plan.phases.map((phase) => phase.id === phaseId ? { ...phase, tasks: [...phase.tasks, {
      id: `task-custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, phaseId, type: 'custom' as const,
      title: input.title.trim() || '自定义任务', conceptSlug: null, description: input.description,
      category: null, difficulty: null, estimatedMinutes: Math.max(5, input.estimatedMinutes),
      dueDate: input.dueDate, order: phase.tasks.length, status: 'not-started' as const,
      isImportant: false, completedAt: null, notes: input.notes, targetSection: null,
    }] } : phase);
    return recomputePlan({ ...plan, phases });
  }, { taskId: null, actionType: 'plan-adjustment', completedAt: new Date().toISOString(), durationMinutes: 0 }), [mutatePlan]);
  const setStageTestStatus = useCallback((planId: string, phaseId: string, status: StageTestStatus) => mutatePlan(planId, (plan) => recomputePlan({ ...plan, phases: plan.phases.map((phase) => phase.id === phaseId ? { ...phase, test: { ...phase.test, status } } : phase) })), [mutatePlan]);
  const submitStageTest = useCallback((planId: string, phaseId: string, answers: Record<string, string[]>, addWeakToReview: boolean) => mutatePlan(planId, (plan) => scoreStageTest(plan, phaseId, answers, addWeakToReview), {
    taskId: null, actionType: 'test', completedAt: new Date().toISOString(), durationMinutes: 15,
  }), [mutatePlan]);
  const setPhaseMastered = useCallback((planId: string, phaseId: string, mastered: boolean) => mutatePlan(planId, (plan) => ({ ...plan, phases: plan.phases.map((phase) => phase.id === phaseId ? { ...phase, mastered } : phase) })), [mutatePlan]);
  const dismissReminder = useCallback(() => {
    setReminderView(null);
    setState((prev) => ({ ...prev, reminder: { ...prev.reminder, reminderDismissedDate: localDate(new Date()) } }));
  }, []);

  const activePlan = state.plans.find((plan) => plan.id === state.reminder.activePlanId) ?? null;
  const value = useMemo<PlanContextValue>(() => ({
    ...state, ready, activePlan, reminderView, savePlan, deletePlan, updatePlan: updatePlanValue,
    setPlanStatus, setTaskStatus, updateTaskFields, moveTask, deleteTask, addCustomTask,
    setStageTestStatus, submitStageTest, setPhaseMastered, dismissReminder,
  }), [state, ready, activePlan, reminderView, savePlan, deletePlan, updatePlanValue, setPlanStatus, setTaskStatus, updateTaskFields, moveTask, deleteTask, addCustomTask, setStageTestStatus, submitStageTest, setPhaseMastered, dismissReminder]);
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlans() {
  const value = useContext(PlanContext);
  if (!value) throw new Error('usePlans must be used inside PlanProvider');
  return value;
}
