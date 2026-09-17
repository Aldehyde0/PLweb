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
import type { ConceptSortMode } from '@/lib/concept-utils';
import {
  appendVisit,
  moveHistory,
  type VisitHistory,
} from '@/lib/history-utils';
import {
  asRecordOfStringArrays,
  asStringArray,
  readStored,
  writeStored,
} from '@/lib/browser-storage';
import { usePersistence } from '@/components/persistence-store';

export type SectionNote = {
  id: string;
  conceptSlug: string;
  sectionId: string;
  text: string;
  isImportant: boolean;
  updatedAt: string;
};
type Store = {
  learned: string[];
  bookmarks: string[];
  recent: string[];
  practiced: string[];
  importantConcepts: string[];
  importantSections: Record<string, string[]>;
  notes: SectionNote[];
  sortMode: ConceptSortMode;
};
type LearningContextValue = Store &
  VisitHistory & {
    ready: boolean;
    toggleLearned: (slug: string) => void;
    markLearned: (slug: string) => void;
    toggleBookmark: (slug: string) => void;
    togglePractice: (id: string) => void;
    toggleImportantConcept: (slug: string) => void;
    toggleImportantSection: (slug: string, sectionId: string) => void;
    addNote: (slug: string, sectionId: string, text: string) => void;
    updateNote: (id: string, text: string) => void;
    deleteNote: (id: string) => void;
    setSortMode: (mode: ConceptSortMode) => void;
    visit: (slug: string) => void;
    goHistory: (direction: -1 | 1) => string | null;
  };

export const LEARNING_STORAGE_KEY = 'what-is-learning';
export const HISTORY_STORAGE_KEY = 'how-to-learn-ai-history';

const SORT_MODES: ConceptSortMode[] = ['difficulty-asc', 'difficulty-desc'];

const initial: Store = {
  learned: [],
  bookmarks: [],
  recent: [],
  practiced: [],
  importantConcepts: [],
  importantSections: {},
  notes: [],
  sortMode: 'difficulty-asc',
};
const initialHistory: VisitHistory = { items: [], index: -1 };
const LearningContext = createContext<LearningContextValue | null>(null);

function isSectionNote(value: unknown): value is SectionNote {
  if (!value || typeof value !== 'object') return false;
  const note = value as Record<string, unknown>;
  return (
    typeof note.id === 'string' &&
    typeof note.conceptSlug === 'string' &&
    typeof note.sectionId === 'string' &&
    typeof note.text === 'string'
  );
}

/**
 * Rebuilds the store field by field. A single malformed field degrades to its
 * default instead of discarding the learner's whole history, and the caller is
 * told when anything had to be repaired.
 */
function validateStore(parsed: unknown): Store | { value: Store; recovered: true } {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('learning store is not an object');
  const source = parsed as Record<string, unknown>;
  let recovered = false;
  const list = (key: keyof Store): string[] => {
    const value = asStringArray(source[key]);
    if (value) return value;
    if (source[key] !== undefined) recovered = true;
    return [...(initial[key] as string[])];
  };
  const sections = asRecordOfStringArrays(source.importantSections);
  if (!sections && source.importantSections !== undefined) recovered = true;
  const rawNotes = source.notes;
  let notes: SectionNote[] = [];
  if (Array.isArray(rawNotes)) {
    notes = rawNotes.filter(isSectionNote).map((note) => ({
      id: note.id,
      conceptSlug: note.conceptSlug,
      sectionId: note.sectionId,
      text: note.text,
      isImportant: note.isImportant === true,
      updatedAt:
        typeof note.updatedAt === 'string'
          ? note.updatedAt
          : new Date().toISOString(),
    }));
    if (notes.length !== rawNotes.length) recovered = true;
  } else if (rawNotes !== undefined) recovered = true;
  const sortMode = SORT_MODES.includes(source.sortMode as ConceptSortMode)
    ? (source.sortMode as ConceptSortMode)
    : initial.sortMode;
  if (source.sortMode !== undefined && sortMode !== source.sortMode)
    recovered = true;
  const value: Store = {
    learned: list('learned'),
    bookmarks: list('bookmarks'),
    recent: list('recent'),
    practiced: list('practiced'),
    importantConcepts: list('importantConcepts'),
    importantSections: sections ?? {},
    notes,
    sortMode,
  };
  return recovered ? { value, recovered: true } : value;
}

function validateHistory(
  parsed: unknown,
): VisitHistory | { value: VisitHistory; recovered: true } {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('history is not an object');
  const source = parsed as Record<string, unknown>;
  let recovered = false;
  let items: string[] = [];
  if (Array.isArray(source.items))
    items = source.items.filter(
      (item): item is string => typeof item === 'string',
    );
  else if (source.items !== undefined) recovered = true;
  if (items.length !== (Array.isArray(source.items) ? source.items.length : 0))
    recovered = true;
  const rawIndex = Number(source.index);
  const index = Number.isInteger(rawIndex) ? rawIndex : -1;
  if (source.index !== undefined && index !== rawIndex) recovered = true;
  const value: VisitHistory = {
    items,
    index: index >= -1 && index < items.length ? index : items.length - 1,
  };
  return recovered ? { value, recovered: true } : value;
}

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { reportWrite, reportRead, registerSaver } = usePersistence();
  const [store, setStore] = useState<Store>(initial);
  const [history, setHistory] = useState<VisitHistory>(initialHistory);
  const [ready, setReady] = useState(false);
  // Set when the stored record could not be read at all. Automatic saving then
  // stays off so an unreadable record is preserved rather than overwritten.
  const blocked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const loaded = readStored('local', LEARNING_STORAGE_KEY, validateStore);
      if (loaded.value) setStore(loaded.value);
      if (loaded.status === 'corrupt' || loaded.status === 'unavailable') {
        blocked.current = true;
        reportRead('learning', loaded);
      }
      const session = readStored('session', HISTORY_STORAGE_KEY, validateHistory);
      if (session.value) setHistory(session.value);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [reportRead]);

  const saveStore = useCallback(
    (value: Store) => {
      if (blocked.current) return;
      reportWrite('learning', writeStored('local', LEARNING_STORAGE_KEY, value));
    },
    [reportWrite],
  );
  const saveHistory = useCallback(
    (value: VisitHistory) => {
      writeStored('session', HISTORY_STORAGE_KEY, value);
    },
    [],
  );

  useEffect(() => {
    if (ready) saveStore(store);
  }, [ready, store, saveStore]);
  useEffect(() => {
    if (ready) saveHistory(history);
  }, [ready, history, saveHistory]);
  useEffect(() => {
    registerSaver('learning', () => {
      blocked.current = false;
      saveStore(store);
      saveHistory(history);
    });
  }, [registerSaver, saveStore, saveHistory, store, history]);

  const toggle = useCallback(
    (
      key: 'learned' | 'bookmarks' | 'practiced' | 'importantConcepts',
      value: string,
    ) => {
      setStore((prev) => ({
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      }));
    },
    [],
  );
  const markLearned = useCallback((slug: string) => {
    setStore((prev) =>
      prev.learned.includes(slug)
        ? prev
        : { ...prev, learned: [...prev.learned, slug] },
    );
  }, []);
  const visit = useCallback((slug: string) => {
    setStore((prev) => ({
      ...prev,
      recent: [slug, ...prev.recent.filter((item) => item !== slug)].slice(
        0,
        12,
      ),
    }));
    setHistory((prev) => appendVisit(prev, slug));
  }, []);
  const goHistory = useCallback(
    (direction: -1 | 1) => {
      const result = moveHistory(history, direction);
      if (!result.target) return null;
      setHistory(result.history);
      return result.target;
    },
    [history],
  );
  const toggleImportantSection = useCallback(
    (slug: string, sectionId: string) => {
      setStore((prev) => {
        const current = prev.importantSections[slug] ?? [];
        return {
          ...prev,
          importantSections: {
            ...prev.importantSections,
            [slug]: current.includes(sectionId)
              ? current.filter((item) => item !== sectionId)
              : [...current, sectionId],
          },
        };
      });
    },
    [],
  );
  const addNote = useCallback(
    (conceptSlug: string, sectionId: string, text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setStore((prev) => ({
        ...prev,
        notes: [
          ...prev.notes,
          {
            id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            conceptSlug,
            sectionId,
            text: clean,
            isImportant: false,
            updatedAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [],
  );
  const updateNote = useCallback(
    (id: string, text: string) =>
      setStore((prev) => ({
        ...prev,
        notes: prev.notes.map((note) =>
          note.id === id
            ? {
                ...note,
                text: text.trim(),
                updatedAt: new Date().toISOString(),
              }
            : note,
        ),
      })),
    [],
  );
  const deleteNote = useCallback(
    (id: string) =>
      setStore((prev) => ({
        ...prev,
        notes: prev.notes.filter((note) => note.id !== id),
      })),
    [],
  );

  const value = useMemo(
    () => ({
      ...store,
      ...history,
      ready,
      toggleLearned: (slug: string) => toggle('learned', slug),
      markLearned,
      toggleBookmark: (slug: string) => toggle('bookmarks', slug),
      togglePractice: (id: string) => toggle('practiced', id),
      toggleImportantConcept: (slug: string) =>
        toggle('importantConcepts', slug),
      toggleImportantSection,
      addNote,
      updateNote,
      deleteNote,
      setSortMode: (sortMode: ConceptSortMode) =>
        setStore((prev) => ({ ...prev, sortMode })),
      visit,
      goHistory,
    }),
    [
      store,
      history,
      ready,
      toggle,
      markLearned,
      toggleImportantSection,
      addNote,
      updateNote,
      deleteNote,
      visit,
      goHistory,
    ],
  );
  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value)
    throw new Error('useLearning must be used inside LearningProvider');
  return value;
}
