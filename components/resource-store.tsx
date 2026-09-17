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
  asStringArray,
  asStringRecord,
  readStored,
  writeStored,
} from '@/lib/browser-storage';
import { usePersistence } from '@/components/persistence-store';

export const RESOURCE_STORAGE_KEY = 'how-to-learn-ai-resources-v1';
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

function migrateResourceState(
  parsed: unknown,
): ResourceState | { value: ResourceState; recovered: true } {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('resource state is not an object');
  const source = parsed as Record<string, unknown>;
  let recovered = false;
  const viewedIds = asStringArray(source.viewedIds);
  const bookmarkIds = asStringArray(source.bookmarkIds);
  const notes = asStringRecord(source.notes);
  if (!viewedIds && source.viewedIds !== undefined) recovered = true;
  if (!bookmarkIds && source.bookmarkIds !== undefined) recovered = true;
  if (!notes && source.notes !== undefined) recovered = true;
  const value: ResourceState = {
    version: 1,
    viewedIds: viewedIds ?? [],
    bookmarkIds: bookmarkIds ?? [],
    notes: notes ?? {},
  };
  return recovered ? { value, recovered: true } : value;
}

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const { reportWrite, reportRead, registerSaver } = usePersistence();
  const [state, setState] = useState<ResourceState>(initialState);
  const [ready, setReady] = useState(false);
  const blocked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const loaded = readStored(
        'local',
        RESOURCE_STORAGE_KEY,
        migrateResourceState,
      );
      if (loaded.value) setState(loaded.value);
      if (loaded.status === 'corrupt' || loaded.status === 'unavailable') {
        blocked.current = true;
        reportRead('resources', loaded);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [reportRead]);

  const save = useCallback(
    (value: ResourceState) => {
      if (blocked.current) return;
      reportWrite(
        'resources',
        writeStored('local', RESOURCE_STORAGE_KEY, value),
      );
    },
    [reportWrite],
  );

  useEffect(() => {
    if (ready) save(state);
  }, [ready, state, save]);
  useEffect(() => {
    registerSaver('resources', () => {
      blocked.current = false;
      save(state);
    });
  }, [registerSaver, save, state]);

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
