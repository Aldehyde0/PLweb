import { AlertTriangle, ArrowRight, Check, ExternalLink, ShieldCheck, Target } from 'lucide-react';
import type { AILongFormConcept } from '@/lib/ai-long-form';
import { ImportantSection } from '@/components/important-section';

export function AIIntro({content}:{content:AILongFormConcept}){return <div className="article-flow ai-intro">
  <ImportantSection conceptSlug={content.slug} sectionId="learning-objectives" title="学习目标"><ul className="space-y-3">{content.learningObjectives.map(item=><li key={item} className="flex gap-3"><Target className="mt-1 shrink-0 text-sky-300" size={17}/><span>{item}</span></li>)}</ul></ImportantSection>
  <ImportantSection conceptSlug={content.slug} sectionId="importance" title="为什么重要"><div className="definition-callout">{content.importance.map(item=><p key={item} className="mb-3 last:mb-0">{item}</p>)}</div></ImportantSection>
</div>}

export function AIDetails({content}:{content:AILongFormConcept}){return <div className="article-flow ai-details">
  <ImportantSection conceptSlug={content.slug} sectionId="inputs-outputs" title="输入、输出与执行边界"><div className="ai-io-grid"><Info title="输入" items={content.inputs}/><Info title="输出" items={content.outputs}/><Info title="能力" items={content.capabilities}/><Info title="权限" items={content.permissions}/></div><div className="ai-runtime"><span>{content.executionEnvironment}</span><span>{content.readOnly?'只读优先':'可能产生写入'}</span><span>{content.approvalRequired?'敏感动作需要审批':'默认不要求审批'}</span></div></ImportantSection>
  <ImportantSection conceptSlug={content.slug} sectionId="security-risks" title="安全风险与信任边界"><div className="grid gap-4 md:grid-cols-2"><Info title="风险" items={content.securityRisks} icon="warning"/><Info title="信任边界" items={content.trustBoundary}/></div></ImportantSection>
  <ImportantSection conceptSlug={content.slug} sectionId="performance-notes" title="性能与失败模式"><div className="grid gap-4 md:grid-cols-2"><Info title="性能考虑" items={content.performanceNotes}/><Info title="失败模式" items={content.failureModes} icon="warning"/></div></ImportantSection>
  <ImportantSection conceptSlug={content.slug} sectionId="common-questions" title="常见问题"><div className="space-y-4">{content.commonQuestions.map(item=><article key={item.question} className="analysis-card"><div className="analysis-card-icon"><ShieldCheck/></div><div><h3>{item.question}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p></div></article>)}</div></ImportantSection>
  <ImportantSection conceptSlug={content.slug} sectionId="official-sources" title="官方来源与时效"><div className="official-source-panel"><p>内容访问与核对日期：<strong>{content.versionDate}</strong>。产品能力、SDK 参数和协议状态可能变化，请以链接页面的当前版本为准。</p><ul>{content.sourceUrls.map(url=><li key={url}><a href={url} target="_blank" rel="noreferrer"><ExternalLink size={14}/>{url}</a></li>)}</ul></div></ImportantSection>
</div>}

function Info({title,items,icon}:{title:string;items:string[];icon?:'warning'}){return <div className="ai-info-card"><h3>{icon?<AlertTriangle/>:<Check/>}{title}</h3><ul>{items.map(item=><li key={item}><ArrowRight/>{item}</li>)}</ul></div>}
