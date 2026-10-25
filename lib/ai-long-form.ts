import type { LongFormConcept } from './long-form-core';

export interface AILongFormConcept extends LongFormConcept {
  subcategory: string;
  importance: string[];
  learningObjectives: string[];
  workflow: string[];
  inputs: string[];
  outputs: string[];
  expectedOutput: string;
  interactiveDemo?: string;
  securityRisks: string[];
  performanceNotes: string[];
  sourceUrls: string[];
  versionDate: string;
  entityType:
    | 'theory'
    | 'model'
    | 'agent'
    | 'skill'
    | 'tool'
    | 'mcp'
    | 'comparison';
  capabilities: string[];
  permissions: string[];
  inputsSchema?: string;
  outputsSchema?: string;
  transport?: string[];
  executionEnvironment: string;
  approvalRequired: boolean;
  readOnly: boolean;
  failureModes: string[];
  trustBoundary: string[];
  commonQuestions: { question: string; answer: string }[];
}

import { allLongFormConcepts } from './long-form-content.ts';
/** Compatibility view generated solely from MDX. */
export const aiLongForms = allLongFormConcepts.filter(
  (item) => item.category === 'artificial-intelligence',
) as AILongFormConcept[];
