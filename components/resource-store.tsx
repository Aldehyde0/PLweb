'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const RESOURCE_STORAGE_KEY = 'how-to-learn-ai-resources-v1';
interface ResourceState {
  version: 1;
  viewedIds: string[];
  bookmarkIds: string[];
  notes: Record<string, string>;
}
type ResourceContextValue = ResourceState & {
  ready: boolean;
  toggleViewed: (id: string) => void;
  markViewed: (id: string) => void;
  toggleBookmark: (id: string) => void;
  setNote: (id: string, note: string) => void;
};
const initialState: ResourceState = {
  version: 1,
  viewedIds: [],
  bookmarkIds: [],
  notes: {},
};
const ResourceContext = createContext<ResourceContextValue | null>(null);

function migrateResourceState(raw: string | null): ResourceState {
  try {
    const source = raw ? (JSON.parse(raw) as Partial<ResourceState>) : {};
    return {
      version: 1,
      viewedIds: Array.isArray(source.viewedIds)
        ? source.viewedIds.filter((id): id is string => typeof id === 'string')
        : [],
      bookmarkIds: Array.isArray(source.bookmarkIds)
        ? source.bookmarkIds.filter(
            (id): id is string => typeof id === 'string',
          )
        : [],
      notes:
        source.notes && typeof source.notes === 'object' ? source.notes : {},
    };
  } catch {
    return initialState;
  }
}

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ResourceState>(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      setState(
        migrateResourceState(localStorage.getItem(RESOURCE_STORAGE_KEY)),
      );
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready)
      localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);
  const toggle = useCallback(
    (key: 'viewedIds' | 'bookmarkIds', id: string) =>
      setState((current) => ({
        ...current,
        [key]: current[key].includes(id)
          ? current[key].filter((item) => item !== id)
          : [...current[key], id],
      })),
    [],
  );
  const setNote = useCallback(
    (id: string, note: string) =>
      setState((current) => ({
        ...current,
        notes: { ...current.notes, [id]: note },
      })),
    [],
  );
  const markViewed = useCallback(
    (id: string) =>
      setState((current) =>
        current.viewedIds.includes(id)
          ? current
          : { ...current, viewedIds: [...current.viewedIds, id] },
      ),
    [],
  );
  const value = useMemo<ResourceContextValue>(
    () => ({
      ...state,
      ready,
      toggleViewed: (id) => toggle('viewedIds', id),
      markViewed,
      toggleBookmark: (id) => toggle('bookmarkIds', id),
      setNote,
    }),
    [state, ready, toggle, markViewed, setNote],
  );
  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const value = useContext(ResourceContext);
  if (!value)
    throw new Error('useResources must be used inside ResourceProvider');
  return value;
}
