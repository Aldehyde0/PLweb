'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ConceptSortMode } from '@/lib/concept-utils';
import {
  appendVisit,
  moveHistory,
  type VisitHistory,
} from '@/lib/history-utils';

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

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(initial);
  const [history, setHistory] = useState<VisitHistory>(initialHistory);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const saved = localStorage.getItem('what-is-learning');
        if (saved) setStore({ ...initial, ...JSON.parse(saved) });
        const session = sessionStorage.getItem('how-to-learn-ai-history');
        if (session) setHistory({ ...initialHistory, ...JSON.parse(session) });
      } catch {
        /* Invalid browser state falls back to safe defaults. */
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem('what-is-learning', JSON.stringify(store));
  }, [ready, store]);
  useEffect(() => {
    if (ready)
      sessionStorage.setItem(
        'how-to-learn-ai-history',
        JSON.stringify(history),
      );
  }, [ready, history]);

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
