import type {
  CodeLanguage,
  LongFormConcept,
  NumericalExample,
  VariableDefinition,
} from './long-form-content';
export type CommonQuestion = { question: string; answer: string };
export interface DeepLearningLongFormConcept extends LongFormConcept {
  subcategory: string;
  importance: string[];
  learningObjectives: string[];
  commonQuestions: CommonQuestion[];
}
type Input = {
  slug: string;
  title: string;
  subcategory: string;
  difficulty?: '入门' | '进阶' | '挑战';
  summary: string;
  definition: string;
  background: string;
  importance: string[];
  objectives: string[];
  intuition: string;
  principle: string;
  details: string;
  formula: string;
  formulaDescription: string;
  variables: VariableDefinition[];
  numeric: NumericalExample;
  steps: string[];
  language?: CodeLanguage;
  code: string;
  codeNotes: string[];
  expected: string;
  applications: string[];
  pitfalls: string[];
  prerequisites: string[];
  related: string[];
  file: string;
  sections: string[];
  questions: CommonQuestion[];
};
export function deep(input: Input): DeepLearningLongFormConcept {
  return {
    id: input.slug,
    slug: input.slug,
    title: input.title,
    category: 'deep-learning',
    subcategory: input.subcategory,
    difficulty: input.difficulty ?? '进阶',
    summary: input.summary,
    importance: input.importance,
    learningObjectives: input.objectives,
    definition: [input.definition],
    background: [input.background],
    intuition: [input.intuition],
    corePrinciple: [input.principle, input.details],
    formulas: [
      {
        label: '核心公式',
        expression: input.formula,
        description: input.formulaDescription,
      },
    ],
    variableDefinitions: input.variables,
    numericalExample: input.numeric,
    algorithmSteps: input.steps,
    codeExamples: [
      {
        title: `${input.title} · PyTorch 示例`,
        language: input.language ?? 'PyTorch',
        purpose: `验证${input.title}的输入、计算和输出。`,
        source: input.code,
        explanation: input.codeNotes,
        expectedOutput: input.expected,
      },
    ],
    codeExplanation: input.codeNotes,
    applications: input.applications,
    pitfalls: input.pitfalls,
    prerequisites: input.prerequisites,
    relatedConcepts: input.related,
    sourceDocuments: [
      {
        title: input.file.replace(/\.md$/, ''),
        kind: '原始文档',
      },
    ],
    sourceSections: input.sections,
    extensionNotes: [],
    commonQuestions: input.questions,
  };
}
