'use client';
import Link from 'next/link';
import {
  BookOpen,
  Bot,
  Cable,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Category, Concept, Difficulty } from '@/lib/content';
import { longFormMap } from '@/lib/long-form-content';
import { sortConcepts } from '@/lib/concept-utils';
import { ConceptCard } from '@/components/concept-card';
import { ConceptSortControl } from '@/components/concept-sort-control';
import { EmptyState } from '@/components/empty-state';
import { Input } from '@/components/ui/input';
import { useLearning } from '@/components/learning-store';
const ai = [
  ['全部', '全部知识'],
  ['Agent', 'Agent 学习目录'],
  ['Skill', 'Skill 学习目录'],
  ['Tool', 'Tool 学习目录'],
  ['MCP', 'MCP 学习目录'],
  ['核心对照', '核心对照'],
];
const rl = [
  ['全部', '全部知识'],
  ['入门基础', '入门基础'],
  ['基础理论', '基础理论'],
  ['Value-based', 'Value-based'],
  ['Policy-based', 'Policy-based'],
  ['Actor-Critic', 'Actor-Critic'],
  ['Offline RL', 'Offline RL'],
  ['现代策略与偏好优化', 'PPO / GRPO / DPO'],
  ['挑战专题', '挑战专题'],
  ['核心对照', '算法比较'],
];
const sub = (c: Concept) =>
  longFormMap[c.slug] && 'subcategory' in longFormMap[c.slug]
    ? ((longFormMap[c.slug] as { subcategory?: string }).subcategory ??
      '基础概念')
    : '基础概念';
export function CategoryView({
  category,
  concepts,
}: {
  category: Category;
  concepts: Concept[];
}) {
  const [q, setQ] = useState(''),
    [difficulty, setDifficulty] = useState<'全部' | Difficulty>('全部'),
    [status, setStatus] = useState<'全部' | '未学习' | '已学习'>('全部'),
    [dimension, setDimension] = useState('全部');
  const { learned, bookmarks, sortMode } = useLearning();
  const grouped =
      category.slug === 'artificial-intelligence' ||
      category.slug === 'reinforcement-learning',
    tabs = category.slug === 'reinforcement-learning' ? rl : ai;
  const filtered = useMemo(
    () =>
      sortConcepts(
        concepts.filter((c) => {
          const query = q.trim().toLowerCase(),
            done = learned.includes(c.slug);
          return (
            (!query ||
              c.title.toLowerCase().includes(query) ||
              c.summary.toLowerCase().includes(query)) &&
            (difficulty === '全部' || c.difficulty === difficulty) &&
            (status === '全部' || (status === '已学习' ? done : !done)) &&
            (!grouped || dimension === '全部' || sub(c) === dimension)
          );
        }),
        bookmarks,
        sortMode,
      ),
    [
      concepts,
      q,
      difficulty,
      status,
      dimension,
      grouped,
      learned,
      bookmarks,
      sortMode,
    ],
  );
  const groups = useMemo(() => {
    const m = new Map<string, Concept[]>();
    for (const c of filtered) {
      const k = sub(c);
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return [...m.entries()];
  }, [filtered]);
  const intro =
    category.slug === 'artificial-intelligence'
      ? '从理论、模型到 Agent、Skill、Tool 与 MCP，建立带来源、权限和安全边界的完整人工智能知识体系。'
      : category.slug === 'reinforcement-learning'
        ? '从 MDP、Bellman 与 TD，到 DQN、SAC，再进入 Offline RL 的分布偏移、行为约束、CQL / IQL，最后对照 PPO、GRPO 与 DPO。'
        : category.description;
  return (
    <main>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <nav aria-label="面包屑" className="text-sm text-muted-foreground">
          <Link href="/">知识库</Link>
          <span className="mx-2">/</span>
          <span>{category.title}</span>
        </nav>
        <header className="mt-7 max-w-3xl">
          <p className="eyebrow">{category.shortTitle} · 学习方向</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">
            {category.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {intro}
          </p>
        </header>
        {grouped && (
          <section className="ai-directory-index">
            <div>
              <p className="eyebrow">分层知识地图</p>
              <h2>选择一个学习目录</h2>
              <p>
                分组来自真实概念数据，收藏、已学习、排序和搜索状态继续生效。
              </p>
            </div>
            <div className="ai-directory-tabs">
              {tabs.map(([k, label], i) => {
                const Icon =
                  i === 0
                    ? Sparkles
                    : i % 4 === 1
                      ? Bot
                      : i % 4 === 2
                        ? BookOpen
                        : i % 4 === 3
                          ? Wrench
                          : Cable;
                return (
                  <button
                    key={k}
                    className={dimension === k ? 'active' : ''}
                    onClick={() => setDimension(k)}
                    aria-pressed={dimension === k}
                  >
                    <Icon />
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        )}
        <section className="mt-10 rounded-2xl border border-border bg-card p-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1" htmlFor="concept-search">
              <span className="sr-only">搜索概念</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                id="concept-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索标题或摘要…"
                className="h-10 border-0 bg-background/65 pl-9"
              />
            </label>
            <div className="flex gap-2">
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as typeof difficulty)
                }
                className="select-control"
              >
                <option>全部</option>
                <option>入门</option>
                <option>进阶</option>
                <option>挑战</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="select-control"
              >
                <option>全部</option>
                <option>未学习</option>
                <option>已学习</option>
              </select>
            </div>
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <ConceptSortControl />
          </div>
        </section>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <SlidersHorizontal size={15} />
            {filtered.length} 个结果
          </span>
          {(q ||
            difficulty !== '全部' ||
            status !== '全部' ||
            dimension !== '全部') && (
            <button
              className="text-primary hover:underline"
              onClick={() => {
                setQ('');
                setDifficulty('全部');
                setStatus('全部');
                setDimension('全部');
              }}
            >
              清除筛选
            </button>
          )}
        </div>
        <section className="mt-5">
          {filtered.length ? (
            grouped ? (
              <div className="space-y-10">
                {groups.map(([name, items]) => (
                  <section key={name} className="ai-concept-group">
                    <div className="ai-group-heading">
                      <h2>{name}</h2>
                      <span>{items.length} 个概念</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((c) => (
                        <ConceptCard key={c.slug} concept={c} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((c) => (
                  <ConceptCard key={c.slug} concept={c} />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              title="没有找到匹配的概念"
              description="试试更短的关键词，或清除筛选。"
            />
          )}
        </section>
      </div>
    </main>
  );
}
