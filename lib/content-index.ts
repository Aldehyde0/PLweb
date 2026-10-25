import generated from './generated/content-index.json';
import type { Concept } from './content-base';
import type { LongFormConcept } from './long-form-content';

export interface ArticleEntry {
  concept: Concept;
  longForm: (LongFormConcept & { interactiveDemo?: string; inputs?: string[]; outputs?: string[] }) | null;
  sections: { id: string; title: string }[];
  order: number;
  directory: string;
  file: string;
  searchText: string;
  anchorAliases: Record<string,string>;
  demos: { name: string; kind?: string }[];
}
export const contentIndex = generated as unknown as Record<string, ArticleEntry>;
