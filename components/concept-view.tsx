'use client';

import Link from 'next/link';
import { Bookmark, Check, ChevronRight, ListChecks, Star } from 'lucide-react';
import { useEffect } from 'react';
import type { Category, Concept } from '@/lib/content';
import { getConceptsByCategory } from '@/lib/content';
import { useLearning } from '@/components/learning-store';
import { ConceptResources } from '@/components/concept-resources';
import {
  DesktopConceptDirectory,
  MobileConceptDirectory,
} from '@/components/concept-directory';
import {
  DesktopConceptMemo,
  MobileConceptMemo,
} from '@/components/concept-memo';
import { ConceptNavigation } from '@/components/concept-navigation';
import { Button } from '@/components/ui/button';
import { contentIndex } from '@/lib/content-index';

export function ConceptView({
  concept,
  category,
  children,
}: {
  concept: Concept;
  category: Category;
  children: React.ReactNode;
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
  const longForm = contentIndex[concept.slug].longForm;
  const categoryConcepts = getConceptsByCategory(category.slug);
  const sections = contentIndex[concept.slug].sections;
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
        {children}
        <ConceptResources conceptSlug={concept.slug} />
        <ConceptNavigation current={concept} concepts={categoryConcepts} />
      </article>
      <DesktopConceptMemo concept={concept} sections={sections} />
    </main>
  );
}
