import type { CategorySlug, Difficulty } from './content-base';

export type CodeLanguage = 'Python' | 'NumPy' | 'scikit-learn' | 'PyTorch';
export interface FormulaEntry {
  label: string;
  expression: string;
  description: string;
}
export interface VariableDefinition {
  symbol: string;
  meaning: string;
}
export interface NumericalExample {
  title: string;
  given: string[];
  steps: string[];
  result: string;
  comparison: string[];
}
export interface CodeExample {
  title: string;
  language: CodeLanguage;
  purpose: string;
  source: string;
  explanation: string[];
  expectedOutput: string;
}
export interface SourceDocument {
  path: string;
  title: string;
  kind: '原始文档' | '扩展资料';
}

export interface LongFormConcept {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  difficulty: Difficulty;
  summary: string;
  definition: string[];
  background: string[];
  intuition: string[];
  corePrinciple: string[];
  formulas: FormulaEntry[];
  variableDefinitions: VariableDefinition[];
  numericalExample?: NumericalExample;
  algorithmSteps: string[];
  codeExamples: CodeExample[];
  codeExplanation: string[];
  applications: string[];
  pitfalls: string[];
  prerequisites: string[];
  relatedConcepts: string[];
  sourceDocuments: SourceDocument[];
  sourceSections: string[];
  extensionNotes: string[];
}
