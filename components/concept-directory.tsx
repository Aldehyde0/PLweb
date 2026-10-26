'use client';

import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ArrowUpRight,
  Search,
  ListTree,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  categories,
  getConceptsByCategory,
  type Category,
  type Concept,
  type CategorySlug,
} from '@/lib/content';
import { conceptDirectory, directoryConcepts } from '@/lib/category-directory';
import { categoryNames, englishConceptName } from '@/lib/english-display';
import { topicNames } from '@/lib/topic-display';
import { getConceptHref, sortConcepts } from '@/lib/concept-utils';
import { useLearning } from '@/components/learning-store';
import { ConceptSortControl } from '@/components/concept-sort-control';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function DesktopConceptDirectory({
  category,
  concepts,
  currentSlug,
}: {
  category: Category;
  concepts: Concept[];
  currentSlug: string;
}) {
  return (
    <aside
      className="concept-directory hidden xl:block"
      aria-label="Concept directory"
    >
      <DirectoryContent
        key={category.slug}
        category={category}
        concepts={concepts}
        currentSlug={currentSlug}
      />
    </aside>
  );
}
export function MobileConceptDirectory({
  category,
  concepts,
  currentSlug,
}: {
  category: Category;
  concepts: Concept[];
  currentSlug: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="concept-directory-mobile">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          id="mobile-directory-trigger"
          render={
            <Button variant="outline" className="w-full justify-between" />
          }
        >
          <span className="flex items-center gap-2">
            <ListTree />
            Learning directory
          </span>
          <span className="sr-only">{concepts.length} concepts</span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="concept-sheet w-[88vw] max-w-sm gap-0 p-0"
        >
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>Learning directory</SheetTitle>
            <SheetDescription>
              Check marks show learned concepts. Progress stays in this browser.
            </SheetDescription>
          </SheetHeader>
          <div className="doc-directory-sheet-body">
            <DirectoryContent
              key={category.slug}
              category={category}
              concepts={concepts}
              currentSlug={currentSlug}
              prefix="mobile"
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
function DirectoryContent({
  category,
  currentSlug,
  prefix = 'desktop',
  onNavigate,
}: {
  category: Category;
  concepts: Concept[];
  currentSlug: string;
  prefix?: string;
  onNavigate?: () => void;
}) {
  const { bookmarks, learned, sortMode } = useLearning();
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>(
    category.slug,
  );
  const [query, setQuery] = useState('');
  const [closed, setClosed] = useState<string[]>([]);
  const nav = useRef<HTMLElement>(null);
  const all = getConceptsByCategory(selectedCategory);
  const q = query.trim().toLowerCase();
  const ordered = sortConcepts(
    directoryConcepts(all),
    bookmarks,
    sortMode,
  ).filter(
    (c) =>
      !q ||
      `${c.title} ${englishConceptName(c)} ${c.slug}`.toLowerCase().includes(q),
  );
  const groups = [...new Set(directoryConcepts(all).map(conceptDirectory))];
  const saved = new Set(bookmarks),
    completed = new Set(learned);
  useEffect(() => {
    const container = nav.current;
    const active = container?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (container && active && !query)
      container.scrollTop = Math.max(
        0,
        active.offsetTop - container.offsetTop - container.clientHeight * 0.4,
      );
  }, [currentSlug, selectedCategory, query, sortMode]);
  return (
    <div className="doc-directory-panel">
      <div className="doc-directory-controls">
        <Link
          className="doc-directory-home"
          href="/#directions"
          onClick={onNavigate}
        >
          <BookOpen />
          Knowledge library
          <ArrowUpRight />
        </Link>
        <label htmlFor={`${prefix}-directory-category`}>Learning path</label>
        <div className="doc-category-select">
          <select
            id={`${prefix}-directory-category`}
            aria-label="Learning path"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value as CategorySlug);
              setQuery('');
              setClosed([]);
            }}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.shortTitle} · {categoryNames[c.slug]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" />
        </div>
        <label className="doc-directory-filter">
          <Search aria-hidden="true" />
          <input
            aria-label="Filter concepts"
            placeholder="Filter concepts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <details className="doc-directory-sort">
          <summary>Reading order</summary>
          <ConceptSortControl compact english />
        </details>
      </div>
      <nav
        ref={nav}
        className="concept-list doc-directory-scroll"
        aria-label="Concepts"
      >
        {groups.map((group) => {
          const items = ordered.filter((c) => conceptDirectory(c) === group);
          if (!items.length) return null;
          const collapsed = closed.includes(group);
          return (
            <div key={group} className="doc-directory-group">
              <button
                className="doc-directory-group-title"
                aria-expanded={!collapsed}
                onClick={() =>
                  setClosed((prev) =>
                    collapsed
                      ? prev.filter((x) => x !== group)
                      : [...prev, group],
                  )
                }
              >
                <span>{topicNames[group] ?? 'Concepts'}</span>
                <ChevronDown
                  className={collapsed ? 'is-collapsed' : ''}
                  aria-hidden="true"
                />
              </button>
              {!collapsed &&
                items.map((concept) => (
                  <Link
                    key={concept.slug}
                    href={getConceptHref(concept)}
                    onClick={onNavigate}
                    aria-current={
                      concept.slug === currentSlug ? 'page' : undefined
                    }
                    data-learned={
                      completed.has(concept.slug) ? 'true' : 'false'
                    }
                    className="concept-list-link"
                  >
                    <span>{concept.title}</span>
                    {completed.has(concept.slug) && (
                      <CheckCircle2
                        className="learned-directory-state"
                        aria-label="Learned"
                      />
                    )}
                    {saved.has(concept.slug) && (
                      <Bookmark
                        className="size-3 fill-current"
                        aria-label="Bookmarked"
                      />
                    )}
                    {concept.slug === currentSlug && (
                      <i className="doc-current-dot" aria-hidden="true" />
                    )}
                  </Link>
                ))}
            </div>
          );
        })}
        {!ordered.length && (
          <output className="doc-directory-empty">No matching concepts.</output>
        )}
      </nav>
      <div className="doc-directory-footer">
        {all.filter((c) => completed.has(c.slug)).length} learned · {all.length}{' '}
        concepts
      </div>
    </div>
  );
}
