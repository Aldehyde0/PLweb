'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Search,
  Waypoints,
} from 'lucide-react';
import { useMemo } from 'react';
import type { Category, Concept } from '@/lib/content';
import { conceptDirectory, directoryConcepts } from '@/lib/category-directory';
import { sortConcepts, type ConceptSortMode } from '@/lib/concept-utils';
import { contentIndex } from '@/lib/content-index';
import { useLearning } from '@/components/learning-store';
import { useFilterQuery } from '@/hooks/use-filter-query';
import type { FilterSchema } from '@/lib/filter-query';
import { topicNames } from '@/lib/topic-display';
import { CategoryScene } from './category-scene.jsx';

const profiles = {
  'artificial-intelligence': {
    mode: 'ai',
    title: 'Artificial intelligence',
    line: 'Think in connections.',
    description:
      'Explore knowledge, reasoning, agents, and AI infrastructure. Follow models from first principles to reliable services.',
    visual: 'A constellation of ideas',
  },
  'machine-learning': {
    mode: 'ml',
    title: 'Machine learning',
    line: 'Find the pattern beneath the data.',
    description:
      'Discover how models learn from examples, make predictions, and generalize. Choose where you want to begin.',
    visual: 'From observations to a fitted surface',
  },
  'deep-learning': {
    mode: 'dl',
    title: 'Deep learning',
    line: 'Go deeper. Layer by layer.',
    description:
      'Follow information through neural networks, then explore the architectures and techniques that make them work.',
    visual: 'Signals moving through connected layers',
  },
  'reinforcement-learning': {
    mode: 'rl',
    title: 'Reinforcement learning',
    line: 'Learn through action.',
    description:
      'Explore agents, environments, and feedback. Follow a path through the ideas behind better decisions.',
    visual: 'An agent exploring a path',
  },
};
type Filters = {
  topic: string;
  query: string;
  level: string;
  status: string;
  sort: string;
};

export function CategoryLanding({
  category,
  concepts,
}: {
  category: Category;
  concepts: Concept[];
}) {
  const profile = profiles[category.slug];
  const ordered = useMemo(() => directoryConcepts(concepts), [concepts]);
  const groups = useMemo(
    () => [...new Set(ordered.map(conceptDirectory))],
    [ordered],
  );
  const schema = useMemo<FilterSchema<Filters>>(
    () => ({
      topic: { parameter: 'topic', initial: '', values: ['all', ...groups] },
      query: { parameter: 'q', initial: '' },
      level: {
        parameter: 'level',
        initial: 'all',
        values: ['入门', '进阶', '挑战'],
      },
      status: {
        parameter: 'status',
        initial: 'all',
        values: ['learned', 'unlearned'],
      },
      sort: {
        parameter: 'sort',
        initial: '',
        values: ['difficulty-asc', 'difficulty-desc'],
      },
    }),
    [groups],
  );
  const { filters, update, clear } = useFilterQuery(schema);
  const { topic: selected, query, level, status } = filters;
  const { learned, bookmarks, sortMode, setSortMode } = useLearning();
  const sort = (filters.sort || sortMode) as ConceptSortMode;
  const q = query.trim().toLowerCase();
  const matches = sortConcepts(
    ordered.filter(
      (c) =>
        (selected === 'all' || conceptDirectory(c) === selected) &&
        (!q ||
          `${c.title} ${c.slug} ${c.summary} ${contentIndex[c.slug]?.searchText ?? ''}`
            .toLowerCase()
            .includes(q)) &&
        (level === 'all' || c.difficulty === level) &&
        (status === 'all' ||
          (status === 'learned'
            ? learned.includes(c.slug)
            : !learned.includes(c.slug))),
    ),
    bookmarks,
    sort,
  );
  return (
    <div className={`category-landing landing-${profile.mode}`}>
      <main id="main" className="path-main">
        <Link className="back-to-paths" href="/#directions">
          <ArrowLeft />
          All learning paths
        </Link>
        <section className="path-hero">
          <div className="path-intro">
            <span className="path-eyebrow">
              {category.shortTitle} / YOUR NEXT LAYER
            </span>
            <h1>{profile.title}</h1>
            <h2>{profile.line}</h2>
            <p>{profile.description}</p>
            <a className="path-explore" href="#topics">
              Explore the topics
              <ArrowRight />
            </a>
          </div>
          <CategoryScene mode={profile.mode} label={profile.visual} />
        </section>
        <section
          className="path-topics"
          id="topics"
          aria-labelledby="topics-title"
        >
          <div className="topics-heading">
            <div>
              <span className="path-eyebrow">CHOOSE YOUR STARTING POINT</span>
              <h2 id="topics-title">What would you like to explore?</h2>
            </div>
            <span>
              {concepts.length} concepts · {groups.length} topics
            </span>
          </div>
          <div className="topic-tags" aria-label="Topics">
            <button
              aria-pressed={selected === 'all'}
              onClick={() => update({ topic: 'all', query: '' })}
            >
              All concepts<span>{concepts.length}</span>
            </button>
            {groups.map((group) => (
              <button
                key={group}
                aria-pressed={selected === group}
                onClick={() => update({ topic: group, query: '' })}
              >
                {topicNames[group] ?? 'More topics'}
                <span>
                  {ordered.filter((c) => conceptDirectory(c) === group).length}
                </span>
              </button>
            ))}
          </div>
          {!selected ? (
            <div className="topic-welcome">
              <Waypoints />
              <p>Choose a topic above to reveal its concepts.</p>
              <span>
                Take a moment to explore. There is no automatic starting point.
              </span>
            </div>
          ) : (
            <div className="topic-browser">
              <div className="topic-controls">
                <label>
                  <Search />
                  <input
                    id="concept-search"
                    aria-label="Search concepts"
                    value={query}
                    onChange={(e) => update({ query: e.target.value }, true)}
                    placeholder="Search concepts, keywords…"
                  />
                </label>
                <select
                  aria-label="Difficulty"
                  value={level}
                  onChange={(e) => update({ level: e.target.value })}
                >
                  <option value="all">All levels</option>
                  <option value="入门">Beginner</option>
                  <option value="进阶">Intermediate</option>
                  <option value="挑战">Advanced</option>
                </select>
                <select
                  aria-label="Learning status"
                  value={status}
                  onChange={(e) => update({ status: e.target.value })}
                >
                  <option value="all">All progress</option>
                  <option value="unlearned">Not learned</option>
                  <option value="learned">Learned</option>
                </select>
                <select
                  aria-label="Sort concepts"
                  value={sort}
                  onChange={(e) => {
                    setSortMode(e.target.value as ConceptSortMode);
                    update({ sort: e.target.value });
                  }}
                >
                  <option value="difficulty-asc">Easy to advanced</option>
                  <option value="difficulty-desc">Advanced to easy</option>
                </select>
                <output aria-live="polite">{matches.length} results</output>
                <button className="topic-reset" onClick={clear}>
                  Clear filters
                </button>
              </div>
              <div className="topic-concepts">
                {matches.map((concept) => (
                  <Link
                    key={concept.slug}
                    className="path-concept"
                    href={`/concept/${concept.slug}`}
                  >
                    <div>
                      <span
                        className={`difficulty difficulty-${concept.difficulty}`}
                      >
                        {concept.difficulty === '入门'
                          ? 'BEGINNER'
                          : concept.difficulty === '挑战'
                            ? 'ADVANCED'
                            : 'INTERMEDIATE'}
                      </span>
                      {learned.includes(concept.slug) && (
                        <Check aria-label="Learned" />
                      )}
                    </div>
                    <h3>
                      {concept.title}
                      <ArrowUpRight />
                    </h3>
                    <p>{concept.summary}</p>
                  </Link>
                ))}
              </div>
              {!matches.length && (
                <p className="topic-empty">
                  No matches. Try another keyword or difficulty.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
