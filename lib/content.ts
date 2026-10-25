export type {
  Category,
  CategorySlug,
  Concept,
  Difficulty,
} from './content-base.ts';
export { categories, categoryMap } from './content-base.ts';
import { contentIndex } from './content-index.ts';
export const concepts = Object.values(contentIndex)
  .sort((a, b) => a.order - b.order)
  .map((a) => a.concept);
export const conceptMap = Object.fromEntries(
  concepts.map((item) => [item.slug, item]),
);
export const getConceptsByCategory = (category: string) =>
  concepts.filter((item) => item.category === category);
