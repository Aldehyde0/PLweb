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
  MobileArticleContents,
} from '@/components/concept-memo';
import { ConceptNavigation } from '@/components/concept-navigation';
import { Button } from '@/components/ui/button';
import { contentIndex } from '@/lib/content-index';
import { categoryNames, difficultyNames } from '@/lib/english-display';
import { topicNames } from '@/lib/topic-display';

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
  const categoryConcepts = getConceptsByCategory(category.slug);
  const sections = contentIndex[concept.slug].sections;
  useEffect(() => {
    if (ready) visit(concept.slug);
  }, [ready, concept.slug, visit]);
  return (
    <main id="main" className="concept-shell">
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
          <MobileArticleContents sections={sections} />
        </div>
        <nav aria-label="Breadcrumbs" className="breadcrumbs">
          <Link href="/concept/gradient-descent">Docs</Link>
          <ChevronRight />
          <Link href={`/category/${category.slug}`}>
            {categoryNames[category.slug]}
          </Link>
          <ChevronRight />
          <span>
            {topicNames[contentIndex[concept.slug].directory] ?? 'Concepts'}
          </span>
        </nav>
        <header
          className="concept-header"
          data-important={important ? 'true' : 'false'}
        >
          <div className="doc-eyebrow">
            <span className="category-badge">{category.shortTitle}</span>
            <span className="difficulty-label">
              {difficultyNames[concept.difficulty]}
            </span>
            {important && (
              <span className="concept-important-badge">
                <Star />
                Important
              </span>
            )}
          </div>
          <h1>{concept.title}</h1>
          <p>{concept.summary}</p>
          <div className="doc-action-row">
            <Button
              size="lg"
              onClick={() => toggleLearned(concept.slug)}
              variant="outline"
              disabled={!ready}
              aria-pressed={done}
            >
              {done ? <Check /> : <ListChecks />}
              {done ? 'Learned' : 'Mark as learned'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => toggleBookmark(concept.slug)}
              aria-label={saved ? 'Bookmarked' : 'Bookmark'}
              title={saved ? 'Bookmarked' : 'Bookmark'}
              aria-pressed={saved}
              disabled={!ready}
              className="doc-bookmark-button"
            >
              <Bookmark
                className={saved ? 'fill-primary/25 text-primary' : ''}
              />
            </Button>
            <Button
              size="lg"
              variant={important ? 'secondary' : 'outline'}
              onClick={() => toggleImportantConcept(concept.slug)}
              aria-pressed={important}
              aria-label={
                important ? 'Remove important mark' : 'Mark important'
              }
              disabled={!ready}
            >
              <Star className={important ? 'fill-current' : ''} />
              {important ? 'Important' : 'Mark important'}
            </Button>
            <MobileConceptMemo
              concept={concept}
              sections={sections}
              label="Notes"
            />
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
