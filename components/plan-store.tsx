'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PLAN_STORAGE_KEY,
  applyStageSelfAssessment,
  buildReminder,
  deletePlanFromState,
  localDate,
  migratePlanState,
  moveTask as moveTaskInPlan,
  recomputePlan,
  scoreStageTest,
  substepsComplete,
  syncLearnedTasks,
  taskMarksConceptLearned,
  updateSubstep,
  updateTask,
  type LearningActivity,
  type LearningPlan,
  type PlanState,
  type PlanTask,
  type ReminderView,
  type StageTestStatus,
  type TaskStatus,
} from '@/lib/plan-engine';
import { writeStored } from '@/lib/browser-storage';
import { useLearning } from '@/components/learning-store';
import { usePersistence } from '@/components/persistence-store';

type PlanContextValue = PlanState & {
  ready: boolean;
  activePlan: LearningPlan | null;
  reminderView: ReminderView | null;
  savePlan: (plan: LearningPlan) => void;
  deletePlan: (planId: string) => void;
  updatePlan: (plan: LearningPlan) => void;
  setPlanStatus: (planId: string, status: LearningPlan['status']) => void;
  setTaskStatus: (planId: string, taskId: string, status: TaskStatus) => void;
  setSubstepStatus: (
    planId: string,
    taskId: string,
    substepId: string,
    status: TaskStatus,
  ) => void;
  updateTaskFields: (
    planId: string,
    taskId: string,
    patch: Partial<PlanTask>,
  ) => void;
  moveTask: (
    planId: string,
    taskId: string,
    phaseId: string,
    index: number,
  ) => void;
  deleteTask: (planId: string, taskId: string) => void;
  addCustomTask: (
    planId: string,
    phaseId: string,
    input: Pick<
      PlanTask,
      'title' | 'description' | 'estimatedMinutes' | 'dueDate' | 'notes'
    >,
  ) => void;
  setStageTestStatus: (
    planId: string,
    phaseId: string,
    status: StageTestStatus,
  ) => void;
  submitStageTest: (
    planId: string,
    phaseId: string,
    answers: Record<string, string[]>,
    addWeakToReview: boolean,
  ) => void;
  gradeStageSelfAssessment: (
    planId: string,
    phaseId: string,
    selfAssessment: Record<string, boolean>,
  ) => void;
  setPhaseMastered: (
    planId: string,
    phaseId: string,
    mastered: boolean,
  ) => void;
  dismissReminder: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { learned, markLearned, ready: learningReady } = useLearning();
  const { reportWrite, reportRead, registerSaver } = usePersistence();
  const [state, setState] = useState<PlanState>(() => migratePlanState(null));
  const [ready, setReady] = useState(false);
  const [reminderView, setReminderView] = useState<ReminderView | null>(null);
  const reminderChecked = useRef(false);
  const learningSyncInitialized = useRef(false);
  // Set when the stored plan record could not be read at all, so the unreadable
  // record is preserved instead of being overwritten by an empty default state.
  const blocked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(PLAN_STORAGE_KEY);
      } catch {
        blocked.current = true;
        reportRead('plans', { status: 'unavailable', value: null });
      }
      if (!blocked.current && raw !== null && raw !== '') {
        try {
          JSON.parse(raw);
        } catch {
          blocked.current = true;
          reportRead('plans', { status: 'corrupt', value: null });
        }
      }
      const loaded = blocked.current
        ? migratePlanState(null)
        : migratePlanState(raw);
      loaded.reminder.lastOpenedAt = new Date().toISOString();
      setState(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [reportRead]);

  const saveState = useCallback(
    (value: PlanState) => {
      if (blocked.current) return;
      reportWrite('plans', writeStored('local', PLAN_STORAGE_KEY, value));
    },
    [reportWrite],
  );

  useEffect(() => {
    if (ready) saveState(state);
  }, [ready, state, saveState]);
  useEffect(() => {
    registerSaver('plans', () => {
      blocked.current = false;
      saveState(state);
    });
  }, [registerSaver, saveState, state]);
  useEffect(() => {
    if (!ready || !learningReady) return;
    const shouldRecordStudy = learningSyncInitialized.current;
    queueMicrotask(() => {
      setState((prev) => {
        let changed = false;
        const plans = prev.plans.map((plan) => {
          const synced = syncLearnedTasks(plan, learned);
          changed ||= synced !== plan;
          return synced;
        });
        if (!changed) return prev;
        const completedTaskIds = plans
          .flatMap((plan) => plan.phases.flatMap((phase) => phase.tasks))
          .filter((task) => task.status === 'completed')
          .map((task) => task.id);
        const now = new Date();
        return {
          ...prev,
          plans,
          completedTaskIds,
          reminder: shouldRecordStudy
            ? {
                ...prev.reminder,
                lastStudyAt: now.toISOString(),
                lastStudyDate: localDate(now),
              }
            : prev.reminder,
        };
      });
      learningSyncInitialized.current = true;
    });
  }, [ready, learningReady, learned]);
  useEffect(() => {
    if (!ready || reminderChecked.current) return;
    reminderChecked.current = true;
    const active =
      state.plans.find((plan) => plan.id === state.reminder.activePlanId) ??
      null;
    const view = buildReminder(active, state.reminder, new Date());
    if (!view) return;
    queueMicrotask(() => {
      setReminderView(view);
      setState((prev) => ({
        ...prev,
        reminder: { ...prev.reminder, lastReminderDate: localDate(new Date()) },
      }));
    });
  }, [ready, state]);

  const mutatePlan = useCallback(
    (
      planId: string,
      mutation: (plan: LearningPlan) => LearningPlan,
      activity?: Omit<LearningActivity, 'id' | 'planId' | 'startedAt'>,
    ) => {
      const now = new Date();
      setState((prev) => {
        const plans = prev.plans.map((plan) =>
          plan.id === planId ? mutation(plan) : plan,
        );
        const completedTaskIds = plans
          .flatMap((plan) => plan.phases.flatMap((phase) => phase.tasks))
          .filter((task) => task.status === 'completed')
          .map((task) => task.id);
        const activities = activity
          ? [
              ...prev.activities,
              {
                id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                planId,
                taskId: activity.taskId,
                actionType: activity.actionType,
                startedAt: now.toISOString(),
                completedAt: activity.completedAt,
                durationMinutes: activity.durationMinutes,
              },
            ]
          : prev.activities;
        const reminder = activity
          ? {
              ...prev.reminder,
              activePlanId: planId,
              lastStudyAt: now.toISOString(),
              lastStudyDate: localDate(now),
            }
          : prev.reminder;
        return { ...prev, plans, completedTaskIds, activities, reminder };
      });
    },
    [],
  );

  const savePlan = useCallback((plan: LearningPlan) => {
    setState((prev) => ({
      ...prev,
      plans: [
        ...prev.plans.map((item) =>
          item.status === 'active'
            ? { ...item, status: 'paused' as const }
            : item,
        ),
        plan,
      ],
      reminder: { ...prev.reminder, activePlanId: plan.id },
    }));
  }, []);
  const deletePlan = useCallback(
    (planId: string) => setState((prev) => deletePlanFromState(prev, planId)),
    [],
  );
  const updatePlanValue = useCallback(
    (plan: LearningPlan) =>
      setState((prev) => ({
        ...prev,
        plans: prev.plans.map((item) =>
          item.id === plan.id ? recomputePlan(plan) : item,
        ),
      })),
    [],
  );
  const setPlanStatus = useCallback(
    (planId: string, status: LearningPlan['status']) =>
      mutatePlan(planId, (plan) => recomputePlan({ ...plan, status })),
    [mutatePlan],
  );
  const setTaskStatus = useCallback(
    (planId: string, taskId: string, status: TaskStatus) => {
      const plan = state.plans.find((item) => item.id === planId);
      const task = plan?.phases
        .flatMap((phase) => phase.tasks)
        .find((item) => item.id === taskId);
      if (!plan || !task) return;
      // Completing a comprehension card by hand and completing all of its
      // substeps one by one must reach the same learning state, so both paths
      // go through the same rule. Practice, review, exercise, project and
      // resource tasks never mark a concept as learned.
      if (status === 'completed' && taskMarksConceptLearned(task))
        markLearned(task.conceptSlug!);
      mutatePlan(
        planId,
        (current) => updateTask(current, taskId, { status }),
        status === 'completed'
          ? {
              taskId,
              actionType:
                task.type.includes('code') ||
                task.type === 'interactive-experiment'
                  ? 'code'
                  : 'task',
              completedAt: new Date().toISOString(),
              durationMinutes: task.estimatedMinutes,
            }
          : undefined,
      );
    },
    [state.plans, markLearned, mutatePlan],
  );
  const updateTaskFields = useCallback(
    (planId: string, taskId: string, patch: Partial<PlanTask>) =>
      mutatePlan(planId, (plan) => updateTask(plan, taskId, patch)),
    [mutatePlan],
  );
  const setSubstepStatus = useCallback(
    (planId: string, taskId: string, substepId: string, status: TaskStatus) => {
      const task = state.plans
        .find((plan) => plan.id === planId)
        ?.phases.flatMap((phase) => phase.tasks)
        .find((item) => item.id === taskId);
      const nextSubsteps =
        task?.substeps.map((step) =>
          step.id === substepId ? { ...step, status } : step,
        ) ?? [];
      // Same rule as completing the whole card directly: once the comprehension
      // card is fully done, the concept counts as learned.
      const willComplete =
        nextSubsteps.length > 0 && substepsComplete(nextSubsteps);
      if (willComplete && task && taskMarksConceptLearned(task))
        markLearned(task.conceptSlug!);
      mutatePlan(
        planId,
        (plan) => updateSubstep(plan, taskId, substepId, status),
        status === 'completed'
          ? {
              taskId,
              actionType: 'task',
              completedAt: new Date().toISOString(),
              durationMinutes:
                task?.substeps.find((step) => step.id === substepId)
                  ?.estimatedMinutes ?? 0,
            }
          : undefined,
      );
    },
    [state.plans, markLearned, mutatePlan],
  );
  const moveTask = useCallback(
    (planId: string, taskId: string, phaseId: string, index: number) =>
      mutatePlan(planId, (plan) =>
        moveTaskInPlan(plan, taskId, phaseId, index),
      ),
    [mutatePlan],
  );
  const deleteTask = useCallback(
    (planId: string, taskId: string) =>
      mutatePlan(planId, (plan) =>
        recomputePlan({
          ...plan,
          phases: plan.phases.map((phase) => ({
            ...phase,
            tasks: phase.tasks
              .filter((task) => task.id !== taskId)
              .map((task, order) => ({ ...task, order })),
          })),
        }),
      ),
    [mutatePlan],
  );
  const addCustomTask = useCallback(
    (
      planId: string,
      phaseId: string,
      input: Pick<
        PlanTask,
        'title' | 'description' | 'estimatedMinutes' | 'dueDate' | 'notes'
      >,
    ) =>
      mutatePlan(
        planId,
        (plan) => {
          const taskId = `task-custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const minutes = Math.max(5, input.estimatedMinutes);
          const phases = plan.phases.map((phase) =>
            phase.id === phaseId
              ? {
                  ...phase,
                  tasks: [
                    ...phase.tasks,
                    {
                      id: taskId,
                      phaseId,
                      type: 'custom' as const,
                      title: input.title.trim() || '自定义任务',
                      conceptSlug: null,
                      description: input.description,
                      category: null,
                      difficulty: null,
                      estimatedMinutes: minutes,
                      dueDate: input.dueDate,
                      order: phase.tasks.length,
                      status: 'not-started' as const,
                      isImportant: false,
                      completedAt: null,
                      notes: input.notes,
                      targetSection: null,
                      substeps: [
                        {
                          id: `${taskId}-step-1`,
                          type: 'custom' as const,
                          title: input.title.trim() || '自定义任务',
                          description: input.description,
                          estimatedMinutes: minutes,
                          status: 'not-started' as const,
                          completedAt: null,
                          targetSection: null,
                          dueDate: input.dueDate,
                        },
                      ],
                    },
                  ],
                }
              : phase,
          );
          return recomputePlan({ ...plan, phases });
        },
        {
          taskId: null,
          actionType: 'plan-adjustment',
          completedAt: new Date().toISOString(),
          durationMinutes: 0,
        },
      ),
    [mutatePlan],
  );
  const setStageTestStatus = useCallback(
    (planId: string, phaseId: string, status: StageTestStatus) =>
      mutatePlan(planId, (plan) =>
        recomputePlan({
          ...plan,
          phases: plan.phases.map((phase) =>
            phase.id === phaseId
              ? { ...phase, test: { ...phase.test, status } }
              : phase,
          ),
        }),
      ),
    [mutatePlan],
  );
  const submitStageTest = useCallback(
    (
      planId: string,
      phaseId: string,
      answers: Record<string, string[]>,
      addWeakToReview: boolean,
    ) =>
      mutatePlan(
        planId,
        (plan) => scoreStageTest(plan, phaseId, answers, addWeakToReview),
        {
          taskId: null,
          actionType: 'test',
          completedAt: new Date().toISOString(),
          durationMinutes: 15,
        },
      ),
    [mutatePlan],
  );
  const gradeStageSelfAssessment = useCallback(
    (
      planId: string,
      phaseId: string,
      selfAssessment: Record<string, boolean>,
    ) =>
      mutatePlan(planId, (plan) =>
        applyStageSelfAssessment(plan, phaseId, selfAssessment),
      ),
    [mutatePlan],
  );
  const setPhaseMastered = useCallback(
    (planId: string, phaseId: string, mastered: boolean) =>
      mutatePlan(planId, (plan) => ({
        ...plan,
        phases: plan.phases.map((phase) =>
          phase.id === phaseId ? { ...phase, mastered } : phase,
        ),
      })),
    [mutatePlan],
  );
  const dismissReminder = useCallback(() => {
    setReminderView(null);
    setState((prev) => ({
      ...prev,
      reminder: {
        ...prev.reminder,
        reminderDismissedDate: localDate(new Date()),
      },
    }));
  }, []);

  const activePlan =
    state.plans.find((plan) => plan.id === state.reminder.activePlanId) ?? null;
  const value = useMemo<PlanContextValue>(
    () => ({
      ...state,
      ready,
      activePlan,
      reminderView,
      savePlan,
      deletePlan,
      updatePlan: updatePlanValue,
      setPlanStatus,
      setTaskStatus,
      setSubstepStatus,
      updateTaskFields,
      moveTask,
      deleteTask,
      addCustomTask,
      setStageTestStatus,
      submitStageTest,
      gradeStageSelfAssessment,
      setPhaseMastered,
      dismissReminder,
    }),
    [
      state,
      ready,
      activePlan,
      reminderView,
      savePlan,
      deletePlan,
      updatePlanValue,
      setPlanStatus,
      setTaskStatus,
      setSubstepStatus,
      updateTaskFields,
      moveTask,
      deleteTask,
      addCustomTask,
      setStageTestStatus,
      submitStageTest,
      gradeStageSelfAssessment,
      setPhaseMastered,
      dismissReminder,
    ],
  );
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlans() {
  const value = useContext(PlanContext);
  if (!value) throw new Error('usePlans must be used inside PlanProvider');
  return value;
}
