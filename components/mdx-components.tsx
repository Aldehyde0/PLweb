import type { MDXComponents } from 'mdx/types';
import { contentIndex } from '@/lib/content-index';
import { ImportantSection } from '@/components/important-section';
import { BlockMath, InlineMath } from '@/components/math';
import { CodeBlock } from '@/components/code-block';
import { CodeExamplePanel } from '@/components/code-example-panel';
import { FormulaCard, VariableTable } from '@/components/long-form-body-core';
import { ConceptReferenceList } from '@/components/concept-reference';
import { LearningRateDemo } from '@/components/learning-rate-demo';
import { StandardizationDemo } from '@/components/standardization-demo';
import { AIInteractiveDemo } from '@/components/ai-interactive-demos';
import { RLInteractiveDemo } from '@/components/rl-interactive-demos';
import { RLAlgorithmMatrix } from '@/components/rl-algorithm-matrix';

function ArticleCodeExample({slug,index}:{slug:string;index:string}) {
  const content=contentIndex[slug].longForm!;
  return <CodeExamplePanel example={content.codeExamples[Number(index)]} index={Number(index)} conceptPitfalls={content.pitfalls} />;
}
function ArticleFormula({slug,index}:{slug:string;index:string}) {
  const content=contentIndex[slug].longForm!;
  return <FormulaCard formula={content.formulas[Number(index)]} content={content} />;
}
function ArticleVariables({slug}:{slug:string}) {return <VariableTable content={contentIndex[slug].longForm!} />;}
function ArticleCodeBlock({language,source}:{language:string;source:string}) {
  return <CodeBlock language={language} source={source} title="代码示例" filename="example.py" />;
}
function ConceptPrerequisites({slug}:{slug:string}) {return <ConceptReferenceList identifiers={contentIndex[slug].concept.prerequisites} />;}
function ConceptRelated({slug}:{slug:string}) {return <ConceptReferenceList identifiers={contentIndex[slug].concept.relatedConcepts} variant="related" />;}
export const mdxComponents: MDXComponents={
  ArticleSection:ImportantSection, ArticleCodeExample, ArticleFormula, ArticleVariables, ArticleCodeBlock,
  BlockMath,InlineMath,ConceptPrerequisites,ConceptRelated,
  LearningRateDemo,StandardizationDemo,AIInteractiveDemo,RLInteractiveDemo,RLAlgorithmMatrix,
};
