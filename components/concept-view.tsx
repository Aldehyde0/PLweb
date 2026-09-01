'use client';

import Link from 'next/link';
import {
  Bookmark,
  Check,
  ChevronRight,
  CircleAlert,
  Lightbulb,
  ListChecks,
  Star,
} from 'lucide-react';
import { useEffect } from 'react';
import type { Category, Concept } from '@/lib/content';
import { getConceptsByCategory } from '@/lib/content';
import { longFormMap } from '@/lib/long-form-content';
import { getLongFormSections, legacySections } from '@/lib/section-utils';
import { useLearning } from '@/components/learning-store';
import { ConceptReferenceList } from '@/components/concept-reference';
import { ConceptResources } from '@/components/concept-resources';
import {
  DesktopConceptDirectory,
  MobileConceptDirectory,
} from '@/components/concept-directory';
import {
  DesktopConceptMemo,
  MobileConceptMemo,
} from '@/components/concept-memo';
import { HistoryNavigation } from '@/components/history-navigation';
import { ImportantSection } from '@/components/important-section';
import { LongFormBody } from '@/components/long-form-body';
import { BlockMath } from '@/components/math';
import { CodeBlock } from '@/components/code-block';
import { Button } from '@/components/ui/button';

export function ConceptView({
  concept,
  category,
}: {
  concept: Concept;
  category: Category;
}) {
  const {
    ready,
    learned,
    bookmarks,
    importantConcepts,
    toggleLearned,
    toggleBookmark,
    toggleImportantConcept,
    visit,
  } = useLearning();
  const done = learned.includes(concept.slug);
  const saved = bookmarks.includes(concept.slug);
  const important = importantConcepts.includes(concept.slug);
  const longForm = longFormMap[concept.slug];
  const categoryConcepts = getConceptsByCategory(category.slug);
  const sections = longForm ? getLongFormSections(longForm) : legacySections;
  useEffect(() => {
    if (ready) visit(concept.slug);
  }, [ready, concept.slug, visit]);
  return (
    <main className="concept-shell">
      <DesktopConceptDirectory
        category={category}
        concepts={categoryConcepts}
        currentSlug={concept.slug}
      />
      <article className="concept-article">
        <div className="mobile-detail-tools">
          <MobileConceptDirectory
            category={category}
            concepts={categoryConcepts}
            currentSlug={concept.slug}
          />
          <MobileConceptMemo concept={concept} sections={sections} />
        </div>
        <nav aria-label="面包屑" className="breadcrumbs">
          <Link href="/">知识库</Link>
          <ChevronRight />
          <Link href={`/category/${category.slug}`}>{category.title}</Link>
          <ChevronRight />
          <span>{concept.title}</span>
        </nav>
        <header
          className="concept-header"
          data-important={important ? 'true' : 'false'}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="category-badge">{category.title}</span>
            <span className={`difficulty difficulty-${concept.difficulty}`}>
              {concept.difficulty ?? '进阶'}
            </span>
            <span className="doc-kind-badge">
              {longForm ? '文档深度页' : '扩展内容'}
            </span>
            {important && (
              <span className="concept-important-badge">
                <Star />
                重点掌握
              </span>
            )}
          </div>
          <h1>{concept.title}</h1>
          <p>{concept.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => toggleLearned(concept.slug)}
              variant={done ? 'secondary' : 'default'}
            >
              {done ? <Check /> : <ListChecks />}
              {done ? '已学习' : '标记为已学习'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => toggleBookmark(concept.slug)}
            >
              <Bookmark
                className={saved ? 'fill-primary/25 text-primary' : ''}
              />
              {saved ? '已收藏' : '加入收藏'}
            </Button>
            <Button
              size="lg"
              variant={important ? 'secondary' : 'outline'}
              onClick={() => toggleImportantConcept(concept.slug)}
              aria-pressed={important}
              aria-label={important ? '取消重点掌握' : '标记整个概念为重点掌握'}
            >
              <Star className={important ? 'fill-current' : ''} />
              {important ? '重点掌握' : '设为重点'}
            </Button>
          </div>
        </header>
        {longForm ? (
          <LongFormBody content={longForm} />
        ) : (
          <LegacyBody concept={concept} />
        )}
        <ConceptResources conceptSlug={concept.slug} />
        <HistoryNavigation current={concept} />
      </article>
      <DesktopConceptMemo concept={concept} sections={sections} />
    </main>
  );
}

function LegacyBody({ concept }: { concept: Concept }) {
  const slug = concept.slug;
  return (
    <div className="article-flow">
      <ImportantSection
        conceptSlug={slug}
        sectionId="prerequisites"
        title="前置知识"
      >
        <ConceptReferenceList identifiers={concept.prerequisites} />
      </ImportantSection>
      <ImportantSection
        conceptSlug={slug}
        sectionId="intuition"
        title="通俗直觉"
      >
        <div className="doc-callout">
          <Lightbulb />
          <p>{concept.explanation}</p>
        </div>
      </ImportantSection>
      <ImportantSection
        conceptSlug={slug}
        sectionId="core-principle"
        title="核心原理"
      >
        <p>{concept.principle}</p>
      </ImportantSection>
      <ImportantSection
        conceptSlug={slug}
        sectionId="formulas"
        title="数学公式"
      >
        <div className="formula-card">
          <BlockMath latex={concept.formula.expression} />
          <p className="formula-description">{concept.formula.description}</p>
        </div>
      </ImportantSection>
      <ImportantSection
        conceptSlug={slug}
        sectionId="algorithm-steps"
        title="工作流程"
      >
        <ol className="space-y-3">
          {concept.workflow.map((step, index) => (
            <li key={step} className="step-row">
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </ImportantSection>
      <ImportantSection conceptSlug={slug} sectionId="code" title="代码示例">
        <CodeBlock
          language={concept.code.language}
          source={concept.code.source}
          title={`${concept.title} 示例`}
          filename="example.py"
          purpose={concept.codeExplanation}
        />
        <div className="code-analysis mt-4">
          <h3 className="text-sm font-semibold text-foreground">代码解析</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {concept.codeExplanation}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {concept.code.highlights.map((item) => (
              <li key={item}>— {item}</li>
            ))}
          </ul>
        </div>
      </ImportantSection>
      <div className="grid gap-10 border-t border-border pt-10 md:grid-cols-2">
        <ImportantSection
          conceptSlug={slug}
          sectionId="applications"
          title="应用场景"
          nested
        >
          <BulletList items={concept.applications} />
        </ImportantSection>
        <ImportantSection
          conceptSlug={slug}
          sectionId="pitfalls"
          title="常见误区"
          nested
        >
          <div className="space-y-3">
            {concept.pitfalls.map((item) => (
              <div key={item} className="pitfall-row">
                <CircleAlert />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </ImportantSection>
      </div>
      <ImportantSection conceptSlug={slug} sectionId="related" title="相关概念">
        <ConceptReferenceList
          identifiers={concept.relatedConcepts}
          variant="related"
        />
      </ImportantSection>
    </div>
  );
}
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-2 shrink-0 text-primary" size={16} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
