'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  storageProblemMessage,
  type ReadOutcome,
  type StorageProblem,
  type WriteOutcome,
} from '@/lib/browser-storage';

export type PersistenceKey = 'learning' | 'plans' | 'resources' | 'theme';

export interface PersistenceIssue {
  key: PersistenceKey;
  problem: StorageProblem;
  message: string;
  at: string;
}

interface PersistenceValue {
  issues: PersistenceIssue[];
  /** Records the outcome of a write. Clears the issue for that key on success. */
  reportWrite: (key: PersistenceKey, outcome: WriteOutcome) => void;
  /** Records a failed read so the learner knows data could not be loaded. */
  reportRead: (key: PersistenceKey, outcome: ReadOutcome<unknown>) => void;
  /** Registers the writer used by the retry action. */
  registerSaver: (key: PersistenceKey, save: () => void) => void;
  retry: () => void;
  dismiss: () => void;
}

const PersistenceContext = createContext<PersistenceValue | null>(null);
const EMPTY_ISSUES: PersistenceIssue[] = [];

export function PersistenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [issues, setIssues] = useState<PersistenceIssue[]>([]);
  const [dismissedAt, setDismissedAt] = useState<string | null>(null);
  const savers = useRef(new Map<PersistenceKey, () => void>());

  const reportWrite = useCallback(
    (key: PersistenceKey, outcome: WriteOutcome) => {
      setIssues((prev) => {
        const rest = prev.filter((issue) => issue.key !== key);
        if (outcome.ok) return rest;
        return [
          ...rest,
          {
            key,
            problem: outcome.problem,
            message: storageProblemMessage(outcome.problem),
            at: new Date().toISOString(),
          },
        ];
      });
    },
    [],
  );

  const reportRead = useCallback(
    (key: PersistenceKey, outcome: ReadOutcome<unknown>) => {
      if (outcome.status !== 'corrupt' && outcome.status !== 'unavailable')
        return;
      const problem: StorageProblem =
        outcome.status === 'corrupt' ? 'corrupt' : 'unavailable';
      setIssues((prev) => [
        ...prev.filter((issue) => issue.key !== key),
        {
          key,
          problem,
          message: storageProblemMessage(problem),
          at: new Date().toISOString(),
        },
      ]);
    },
    [],
  );

  const registerSaver = useCallback(
    (key: PersistenceKey, save: () => void) => {
      savers.current.set(key, save);
    },
    [],
  );

  const retry = useCallback(() => {
    setDismissedAt(null);
    for (const save of savers.current.values()) save();
  }, []);

  const newestAt = issues.reduce<string | null>(
    (latest, issue) => (!latest || issue.at > latest ? issue.at : latest),
    null,
  );
  const dismiss = useCallback(() => {
    const latest = issues.reduce<string | null>(
      (value, issue) => (!value || issue.at > value ? issue.at : value),
      null,
    );
    setDismissedAt(latest);
  }, [issues]);
  // A newer failure re-opens the banner; a successful save (which removes the
  // issue) hides it again because nothing is left to show.
  const visible = issues.length > 0 && dismissedAt !== newestAt;

  const visibleIssues = visible ? issues : EMPTY_ISSUES;
  const value = useMemo<PersistenceValue>(
    () => ({
      issues: visibleIssues,
      reportWrite,
      reportRead,
      registerSaver,
      retry,
      dismiss,
    }),
    [
      visibleIssues,
      reportWrite,
      reportRead,
      registerSaver,
      retry,
      dismiss,
    ],
  );

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistence() {
  const value = useContext(PersistenceContext);
  if (!value)
    throw new Error('usePersistence must be used inside PersistenceProvider');
  return value;
}

export const PERSISTENCE_LABELS: Record<PersistenceKey, string> = {
  learning: '学习记录、笔记与收藏',
  plans: '学习计划',
  resources: '资源库进度',
  theme: '显示主题',
};

export function PersistenceBanner() {
  const { issues, retry, dismiss } = usePersistence();
  if (!issues.length) return null;
  const keys = issues.map((issue) => issue.key);
  return (
    <div
      className="persistence-banner"
      role="alert"
      aria-live="assertive"
      data-testid="persistence-banner"
    >
      <div className="persistence-banner__body">
        <strong>本次修改尚未保存到当前浏览器</strong>
        <p>
          {issues.map((issue) => (
            <span key={issue.key}>
              {PERSISTENCE_LABELS[issue.key]}：{issue.message}
            </span>
          ))}
        </p>
        <p className="persistence-banner__hint">
          页面仍可继续使用。请检查浏览器隐私模式或站点存储权限，清理部分空间后再重试；
          未保存前刷新页面会丢失本次修改。
        </p>
      </div>
      <div className="persistence-banner__actions">
        <button type="button" onClick={retry}>
          重新保存
        </button>
        <button type="button" onClick={dismiss}>
          暂时忽略
        </button>
      </div>
      <span className="sr-only">{keys.join(',')}</span>
    </div>
  );
}
