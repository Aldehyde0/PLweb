import { difficultyOrder } from './difficulty.ts';

export type ConceptSortMode = 'difficulty-asc' | 'difficulty-desc';
type OrderedConcept = { slug: string; category: string; difficulty?: string };

export function getDifficultyRank(difficulty: string | undefined) {
  return difficultyOrder[difficulty ?? ''] ?? 2;
}

export function sortConcepts<T extends OrderedConcept>(
  items: readonly T[],
  bookmarks: readonly string[],
  mode: ConceptSortMode = 'difficulty-asc',
) {
  const saved = new Set(bookmarks);
  const direction = mode === 'difficulty-desc' ? -1 : 1;
  return items
    .map((concept, index) => ({ concept, index }))
    .sort((a, b) => {
      const bookmarkDifference =
        Number(saved.has(b.concept.slug)) - Number(saved.has(a.concept.slug));
      if (bookmarkDifference !== 0) return bookmarkDifference;
      const difficultyDifference =
        (getDifficultyRank(a.concept.difficulty) -
          getDifficultyRank(b.concept.difficulty)) *
        direction;
      return difficultyDifference !== 0
        ? difficultyDifference
        : a.index - b.index;
    })
    .map(({ concept }) => concept);
}

export function getConceptNeighbors<T extends OrderedConcept>(
  items: readonly T[],
  current: T,
  bookmarks: readonly string[],
  mode: ConceptSortMode,
) {
  const ordered = sortConcepts(
    items.filter((item) => item.category === current.category),
    bookmarks,
    mode,
  );
  const index = ordered.findIndex((item) => item.slug === current.slug);
  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index >= 0 ? (ordered[index + 1] ?? null) : null,
  };
}
