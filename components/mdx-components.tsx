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

function ArticleCodeExample({ slug, index }: { slug: string; index: string }) {
  const content = contentIndex[slug].longForm!;
  return (
    <CodeExamplePanel
      example={content.codeExamples[Number(index)]}
      index={Number(index)}
      conceptPitfalls={content.pitfalls}
    />
  );
}
function ArticleFormula({ slug, index }: { slug: string; index: string }) {
  const content = contentIndex[slug].longForm!;
  return (
    <FormulaCard formula={content.formulas[Number(index)]} content={content} />
  );
}
function ArticleVariables({ slug }: { slug: string }) {
  return <VariableTable content={contentIndex[slug].longForm!} />;
}
function ArticleCodeBlock({
  language,
  source,
}: {
  language: string;
  source: string;
}) {
  return (
    <CodeBlock
      language={language}
      source={source}
      title="代码示例"
      filename="example.py"
    />
  );
}
function ConceptPrerequisites({ slug }: { slug: string }) {
  return (
    <ConceptReferenceList
      identifiers={contentIndex[slug].concept.prerequisites}
    />
  );
}
function ConceptRelated({ slug }: { slug: string }) {
  return (
    <ConceptReferenceList
      identifiers={contentIndex[slug].concept.relatedConcepts}
      variant="related"
    />
  );
}
function ArticleFlags({ slug }: { slug: string }) {
  const content = contentIndex[slug].longForm!;
  if ('entityType' in content) {
    const c = content as import('@/lib/ai-long-form').AILongFormConcept;
    return (
      <div className="ai-runtime">
        <span>{c.executionEnvironment}</span>
        <span>{c.readOnly ? '只读优先' : '可能产生写入'}</span>
        <span>
          {c.approvalRequired ? '敏感动作需要审批' : '默认不要求审批'}
        </span>
      </div>
    );
  }
  const c = content as import('@/lib/rl-long-form').RLLongFormConcept;
  const flags = [
    ['算法类别', c.algorithmType],
    [
      '策略归属',
      c.onPolicy ? 'on-policy' : c.offPolicy ? 'off-policy' : '基础/离线目标',
    ],
    ['动作空间', c.actionSpace],
    [
      '环境模型',
      c.modelBased ? '使用/学习模型' : c.modelFree ? 'model-free' : '不适用',
    ],
  ];
  return (
    <div className="algorithm-profile">
      {flags.map(([label, value]) => (
        <div key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
export const mdxComponents: MDXComponents = {
  ArticleSection: ImportantSection,
  ArticleCodeExample,
  ArticleFormula,
  ArticleVariables,
  ArticleCodeBlock,
  BlockMath,
  InlineMath,
  ConceptPrerequisites,
  ConceptRelated,
  ArticleFlags,
  LearningRateDemo,
  StandardizationDemo,
  AIInteractiveDemo,
  RLInteractiveDemo,
  RLAlgorithmMatrix,
};
