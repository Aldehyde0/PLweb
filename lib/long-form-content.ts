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
import type { Concept } from './content-base';
import {
  longFormConcepts,
  type CodeLanguage,
  type LongFormConcept,
} from './long-form-core';
import { preprocessingLongForms } from './preprocessing-long-form';
import { fundamentalsLongForms } from './fundamentals-long-form';
import { modelsLongForms } from './models-long-form';
import { evaluationLongForms } from './evaluation-long-form';
import { projectsLongForms } from './projects-long-form';
import { deepLearningFoundations } from './deep-learning-foundations';
import { deepLearningSequences } from './deep-learning-sequences';
import { deepLearningAdvanced } from './deep-learning-advanced';
import { aiLongForms } from './ai-long-form';
import { applyAICodeOverrides } from './ai-code-overrides';
import { rlLongForms } from './rl-long-form';
const enrichedAI = applyAICodeOverrides(aiLongForms);
export const allLongFormConcepts: LongFormConcept[] = [
  ...longFormConcepts,
  ...fundamentalsLongForms,
  ...preprocessingLongForms,
  ...modelsLongForms,
  ...evaluationLongForms,
  ...projectsLongForms,
  ...deepLearningFoundations,
  ...deepLearningSequences,
  ...deepLearningAdvanced,
  ...enrichedAI,
  ...rlLongForms,
];
const mapLanguage = (language: CodeLanguage): 'Python' | 'NumPy' | 'PyTorch' =>
  language === 'NumPy'
    ? 'NumPy'
    : language === 'PyTorch'
      ? 'PyTorch'
      : 'Python';
export const documentConcepts: Concept[] = allLongFormConcepts.map((item) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  category: item.category,
  difficulty: item.difficulty,
  summary: item.summary,
  prerequisites: item.prerequisites,
  explanation: item.intuition.join(' '),
  principle: item.corePrinciple.join(' '),
  formula: {
    expression: item.formulas[0]?.expression ?? '—',
    description: item.formulas[0]?.description ?? '—',
  },
  workflow: item.algorithmSteps,
  code: {
    language: mapLanguage(item.codeExamples[0]?.language ?? 'Python'),
    source: item.codeExamples[0]?.source ?? '',
    highlights: item.codeExamples[0]?.explanation ?? [],
  },
  codeExplanation: item.codeExplanation.join(' '),
  applications: item.applications,
  pitfalls: item.pitfalls,
  relatedConcepts: item.relatedConcepts,
}));
export const longFormMap = Object.fromEntries(
  allLongFormConcepts.map((item) => [item.slug, item]),
) as Record<string, LongFormConcept>;
