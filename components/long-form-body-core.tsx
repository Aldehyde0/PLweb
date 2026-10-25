import { Sigma } from 'lucide-react';
import type { FormulaEntry, LongFormConcept } from '@/lib/long-form-content';
import { BlockMath, RichText } from '@/components/math';
export function FormulaCard({
  formula,
  content,
}: {
  formula: FormulaEntry;
  content: LongFormConcept;
}) {
  return (
    <article className="formula-card">
      <div className="flex items-center gap-2">
        <Sigma size={16} />
        <h3>{formula.label}</h3>
      </div>
      <BlockMath latex={formula.expression} label={formula.label} />
      <p className="formula-description">
        <RichText>{formula.description}</RichText>
      </p>
      <div className="formula-context">
        <div>
          <h4>变量含义</h4>
          {content.variableDefinitions.length ? (
            <ul>
              {content.variableDefinitions.slice(0, 6).map((item) => (
                <li key={item.symbol}>
                  <code>{item.symbol}</code>
                  <span>{item.meaning}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>变量定义与本页概念定义一致，代码中的同名变量保持相同语义。</p>
          )}
        </div>
        <div>
          <h4>计算步骤</h4>
          <ol>
            {(content.numericalExample?.steps ?? content.algorithmSteps)
              .slice(0, 4)
              .map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <RichText>{step}</RichText>
                </li>
              ))}
          </ol>
        </div>
        {content.codeExamples.length > 0 && (
          <div>
            <h4>代码对应位置</h4>
            <ul>
              {content.codeExamples.slice(0, 3).map((example, index) => (
                <li key={example.title}>
                  <code>示例 {index + 1}</code>
                  <span>
                    {example.title}：{example.purpose}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
export function VariableTable({ content }: { content: LongFormConcept }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr>
            <th>变量</th>
            <th>含义</th>
          </tr>
        </thead>
        <tbody>
          {content.variableDefinitions.map((item) => (
            <tr key={item.symbol}>
              <td>
                <code>{item.symbol}</code>
              </td>
              <td>{item.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
