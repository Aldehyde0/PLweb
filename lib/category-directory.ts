import type { Concept } from './content-base';
import { contentIndex } from './content-index.ts';
export function conceptDirectory(
  concept: Pick<Concept, 'slug' | 'category'>,
): string {
  return contentIndex[concept.slug]?.directory ?? '基础概念';
}

/** Stable directory order shared by the category page and generated plans. */
export function directoryConcepts<
  T extends Pick<Concept, 'slug' | 'category' | 'difficulty'>,
>(concepts: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const concept of concepts) {
    const key = `${concept.category}/${conceptDirectory(concept)}`;
    const group = groups.get(key) ?? [];
    group.push(concept);
    groups.set(key, group);
  }
  const rank = { 入门: 0, 进阶: 1, 挑战: 2 };
  return [...groups.values()].flatMap((items) =>
    items.sort((a, b) => rank[a.difficulty] - rank[b.difficulty]),
  );
}
