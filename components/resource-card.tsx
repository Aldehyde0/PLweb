'use client';

import Link from 'next/link';
import {
  Bookmark,
  Check,
  Code2,
  Database,
  ExternalLink,
  FileText,
  MousePointer2,
  PlaySquare,
} from 'lucide-react';
import { conceptMap } from '@/lib/content';
import { getConceptHref } from '@/lib/concept-utils';
import type { LearningResource, ResourceType } from '@/lib/resources';
import { useResources } from '@/components/resource-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const iconByType: Partial<Record<ResourceType, typeof FileText>> = {
  视频: PlaySquare,
  视频课程: PlaySquare,
  'GitHub 仓库': Code2,
  数据集: Database,
  代码教程: Code2,
  交互式工具: MousePointer2,
};
function typeGroup(type: ResourceType) {
  if (type === '视频' || type === '视频课程') return 'video';
  if (type === 'GitHub 仓库') return 'github';
  if (type === '技术文章') return 'article';
  if (type === '官方文档') return 'official';
  return 'default';
}

export function ResourceCard({ resource }: { resource: LearningResource }) {
  const {
    viewedIds,
    bookmarkIds,
    notes,
    toggleViewed,
    toggleBookmark,
    setNote,
  } = useResources();
  const viewed = viewedIds.includes(resource.id);
  const bookmarked = bookmarkIds.includes(resource.id);
  const Icon = iconByType[resource.type] ?? FileText;
  const concepts = resource.conceptSlugs
    .map((slug) => conceptMap[slug])
    .filter(Boolean);
  return (
    <article className="resource-card">
      <div className="resource-card-top">
        <span
          className={`resource-type resource-type-${typeGroup(resource.type)}`}
        >
          <Icon />
          {resource.type}
        </span>
        <span
          className={`resource-level level-${resource.recommendationLevel}`}
        >
          {resource.recommendationLevel} 级
        </span>
      </div>
      <h2>{resource.title}</h2>
      <p className="resource-summary">{resource.summary}</p>
      <div className="resource-meta">
        <span>{resource.difficulty}</span>
        <span>{resource.language}</span>
        <span>{resource.isFree ? '免费' : '付费'}</span>
        {resource.duration && <span>{resource.duration}</span>}
      </div>
      <p className="resource-source">
        {resource.author} · {resource.platform}
      </p>
      <div className="resource-concepts">
        {concepts.length ? (
          concepts.slice(0, 5).map((concept) => (
            <Link key={concept.slug} href={getConceptHref(concept)}>
              {concept.title}
            </Link>
          ))
        ) : (
          <span>暂未匹配可访问概念</span>
        )}
      </div>
      {resource.github && (
        <details className="resource-github-details">
          <summary>仓库信息</summary>
          <p>{resource.github.purpose}</p>
          <span>主要语言：{resource.github.primaryLanguage}</span>
          <span>
            {resource.github.includesDatasetOrExperiments
              ? '包含数据集或实验'
              : '不包含数据集或实验'}
          </span>
          <span>
            {resource.github.requiresExtraEnvironment
              ? '需要额外环境'
              : '无需额外环境'}
          </span>
        </details>
      )}
      <details className="resource-note">
        <summary>资料笔记</summary>
        <Textarea
          value={notes[resource.id] ?? ''}
          onChange={(event) => setNote(resource.id, event.target.value)}
          placeholder="记录适合复习的章节、观看位置或实践结果…"
          aria-label={`${resource.title}资料笔记`}
        />
      </details>
      <div className="resource-card-actions">
        <Button
          size="sm"
          variant={viewed ? 'secondary' : 'outline'}
          onClick={() => toggleViewed(resource.id)}
          aria-pressed={viewed}
        >
          <Check />
          {viewed ? '已查看' : '标记已查看'}
        </Button>
        <Button
          size="icon-sm"
          variant={bookmarked ? 'secondary' : 'ghost'}
          onClick={() => toggleBookmark(resource.id)}
          aria-label={bookmarked ? '取消收藏资料' : '收藏资料'}
          aria-pressed={bookmarked}
        >
          <Bookmark className={bookmarked ? 'fill-current' : ''} />
        </Button>
        <Button
          size="sm"
          render={
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`打开外部资料：${resource.title}`}
            />
          }
        >
          打开网址
          <ExternalLink />
        </Button>
      </div>
      <footer>
        <span>最后验证：{resource.lastVerifiedAt}</span>
        <span>{resource.subcategory}</span>
      </footer>
    </article>
  );
}
