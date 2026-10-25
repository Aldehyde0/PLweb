import { contentIndex } from './content-index.ts';
import type { LongFormConcept } from './long-form-content';
export function getLongFormSections(content: LongFormConcept) {
  return contentIndex[content.slug]?.sections ?? [];
}
