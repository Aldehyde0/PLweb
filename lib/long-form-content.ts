export type {
  CodeExample,
  CodeLanguage,
  FormulaEntry,
  LongFormConcept,
  NumericalExample,
  SourceDocument,
  VariableDefinition,
} from './long-form-core';
export type { AILongFormConcept } from './ai-long-form';
export type { RLLongFormConcept } from './rl-long-form';
import { contentIndex } from './content-index.ts';
import type { LongFormConcept } from './long-form-core';
/** Generated compatibility adapters; MDX is the only authoring source. */
export const allLongFormConcepts = Object.values(contentIndex).flatMap((a) =>
  a.longForm ? [a.longForm] : [],
);
export const longFormMap = Object.fromEntries(
  allLongFormConcepts.map((item) => [item.slug, item]),
) as Record<string, LongFormConcept>;
export const documentConcepts = Object.values(contentIndex)
  .filter((a) => a.longForm)
  .map((a) => a.concept);
