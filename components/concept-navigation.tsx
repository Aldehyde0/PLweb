'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Concept } from '@/lib/content';
import { getConceptHref } from '@/lib/concept-utils';
import { getConceptNeighbors } from '@/lib/concept-order';
import { useLearning } from '@/components/learning-store';
import { HistoryNavigation } from '@/components/history-navigation';

export function ConceptNavigation({
  current,
  concepts,
}: {
  current: Concept;
  concepts: Concept[];
}) {
  const { bookmarks, sortMode } = useLearning();
  const { previous, next } = getConceptNeighbors(
    concepts,
    current,
    bookmarks,
    sortMode,
  );
  return (
    <div className="concept-navigation-footer">
      <nav className="concept-navigation" aria-label="同方向概念学习导航">
        <ConceptStep concept={previous} previous />
        <ConceptStep concept={next} />
      </nav>
      <details className="concept-reading-history">
        <summary>阅读历史</summary>
        <HistoryNavigation current={current} />
      </details>
    </div>
  );
}

function ConceptStep({
  concept,
  previous = false,
}: {
  concept: Concept | null;
  previous?: boolean;
}) {
  const label = previous ? '上一概念' : '下一概念';
  const content = (
    <>
      {previous ? (
        <ArrowLeft aria-hidden="true" />
      ) : (
        <ArrowRight aria-hidden="true" />
      )}
      <span>
        <small>{label}</small>
        <strong>
          {concept?.title ??
            (previous ? '已到本方向首个概念' : '已到本方向最后一个概念')}
        </strong>
      </span>
    </>
  );
  return concept ? (
    <Link
      className="concept-step"
      href={getConceptHref(concept)}
      aria-label={`${label}：${concept.title}`}
    >
      {content}
    </Link>
  ) : (
    <span className="concept-step" aria-disabled="true">
      {content}
    </span>
  );
}
