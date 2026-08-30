import { Check, ExternalLink, ShieldAlert, Target } from 'lucide-react';
import type { RLLongFormConcept } from '@/lib/rl-long-form';
import { ImportantSection } from '@/components/important-section';

export function RLIntro({ content }: { content: RLLongFormConcept }) {
  return (
    <div className="article-flow">
      <ImportantSection
        conceptSlug={content.slug}
        sectionId="learning-objectives"
        title="学习目标"
      >
        <ul className="space-y-3">
          {content.learningObjectives.map((x) => (
            <li key={x} className="flex gap-3">
              <Target className="mt-1 text-sky-300" size={17} />
              {x}
            </li>
          ))}
        </ul>
      </ImportantSection>
      <ImportantSection
        conceptSlug={content.slug}
        sectionId="importance"
        title="为什么重要"
      >
        <div className="definition-callout">
          {content.importance.map((x) => (
            <p key={x} className="mb-3 last:mb-0">
              {x}
            </p>
          ))}
        </div>
      </ImportantSection>
    </div>
  );
}

export function RLDetails({ content }: { content: RLLongFormConcept }) {
  const flags = [
    ['算法类别', content.algorithmType],
    [
      '策略归属',
      content.onPolicy
        ? 'on-policy'
        : content.offPolicy
          ? 'off-policy'
          : '基础/离线目标',
    ],
    ['动作空间', content.actionSpace],
    [
      '环境模型',
      content.modelBased
        ? '使用/学习模型'
        : content.modelFree
          ? 'model-free'
          : '不适用',
    ],
  ];
  return (
    <div className="article-flow">
      <ImportantSection
        conceptSlug={content.slug}
        sectionId="algorithm-profile"
        title="算法属性与数据边界"
      >
        <div className="algorithm-profile">
          {flags.map(([k, v]) => (
            <div key={k}>
              <small>{k}</small>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        {content.objectiveFunction && (
          <dl className="rl-extra-fields">
            <div>
              <dt>目标函数</dt>
              <dd>{content.objectiveFunction}</dd>
            </div>
            {content.referencePolicy && (
              <div>
                <dt>Reference Policy</dt>
                <dd>{content.referencePolicy}</dd>
              </div>
            )}
            {content.rewardModel && (
              <div>
                <dt>Reward Model</dt>
                <dd>{content.rewardModel}</dd>
              </div>
            )}
            {content.preferenceData && (
              <div>
                <dt>Preference Data</dt>
                <dd>{content.preferenceData}</dd>
              </div>
            )}
            {content.groupData && (
              <div>
                <dt>Group Data</dt>
                <dd>{content.groupData}</dd>
              </div>
            )}
            {content.advantageEstimator && (
              <div>
                <dt>Advantage</dt>
                <dd>{content.advantageEstimator}</dd>
              </div>
            )}
            {content.klConstraint && (
              <div>
                <dt>KL 约束</dt>
                <dd>{content.klConstraint}</dd>
              </div>
            )}
            {content.clipRange && (
              <div>
                <dt>Clip Range</dt>
                <dd>{content.clipRange}</dd>
              </div>
            )}
          </dl>
        )}
        {content.dataBoundary && (
          <Card title="数据边界" items={content.dataBoundary} warn />
        )}
      </ImportantSection>
      {content.comparisonNotes && (
        <ImportantSection
          conceptSlug={content.slug}
          sectionId="algorithm-comparison"
          title="与 DQN、SAC 及相邻方法对照"
        >
          <Card title="对照要点" items={content.comparisonNotes} />
        </ImportantSection>
      )}
      <ImportantSection
        conceptSlug={content.slug}
        sectionId="failure-performance"
        title="失败模式、风险与性能"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="失败模式" items={content.failureModes} />
          <Card title="目标与安全风险" items={content.securityRisks} warn />
          <Card title="性能与复现" items={content.performanceNotes} />
        </div>
      </ImportantSection>
      <ImportantSection
        conceptSlug={content.slug}
        sectionId="common-questions"
        title="常见问题"
      >
        <div className="space-y-3">
          {content.commonQuestions.map((x) => (
            <article key={x.question} className="analysis-card">
              <div className="analysis-card-icon">
                <Check />
              </div>
              <div>
                <h3>{x.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {x.answer}
                </p>
              </div>
            </article>
          ))}
        </div>
      </ImportantSection>
      <ImportantSection
        conceptSlug={content.slug}
        sectionId="official-sources"
        title="资料来源与核对日期"
      >
        <div className="official-source-panel">
          <p>
            核对日期：<strong>{content.versionDate}</strong>
            。算法定义与公式依据以下外部教材或原论文；中文直觉、教学代码、对照与部署建议属于本站扩展解释。
          </p>
          <ul>
            {content.sourceUrls.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} />
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </ImportantSection>
    </div>
  );
}

function Card({
  title,
  items,
  warn,
}: {
  title: string;
  items: string[];
  warn?: boolean;
}) {
  return (
    <div className="ai-info-card">
      <h3>
        {warn ? <ShieldAlert /> : <Check />}
        {title}
      </h3>
      <ul>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
