import type { LongFormConcept } from './long-form-content';
export type CommonQuestion = { question: string; answer: string };
export interface DeepLearningLongFormConcept extends LongFormConcept {
  subcategory: string;
  importance: string[];
  learningObjectives: string[];
  commonQuestions: CommonQuestion[];
}
