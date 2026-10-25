import type { LongFormConcept } from './long-form-core';
export interface RLLongFormConcept extends LongFormConcept {
  subcategory: string;
  importance: string[];
  learningObjectives: string[];
  algorithmType: string;
  onPolicy: boolean;
  offPolicy: boolean;
  actionSpace: string;
  modelFree: boolean;
  modelBased: boolean;
  inputs: string[];
  outputs: string[];
  workflow: string[];
  expectedOutput: string;
  interactiveDemo?: string;
  failureModes: string[];
  securityRisks: string[];
  performanceNotes: string[];
  sourceUrls: string[];
  versionDate: string;
  objectiveFunction?: string;
  referencePolicy?: string;
  rewardModel?: string;
  preferenceData?: string;
  groupData?: string;
  advantageEstimator?: string;
  klConstraint?: string;
  clipRange?: string;
  dataBoundary?: string[];
  trainingLoop?: string[];
  comparisonNotes?: string[];
  commonQuestions: { question: string; answer: string }[];
}
import { allLongFormConcepts } from './long-form-content.ts';
/** Compatibility view generated solely from MDX. */
export const rlLongForms = allLongFormConcepts.filter(
  (item) => item.category === 'reinforcement-learning',
) as RLLongFormConcept[];
