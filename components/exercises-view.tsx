'use client';

import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { categoryMap, type CategorySlug, type Difficulty } from '@/lib/content';
import { exercises, type ExerciseType } from '@/lib/exercises';
import { getExerciseTypeGroup } from '@/lib/exercise-style';
import { useLearning } from '@/components/learning-store';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type All<T> = '全部' | T;
export function ExercisesView() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | CategorySlug>('all');
  const [difficulty, setDifficulty] = useState<All<Difficulty>>('全部');
  const [type, setType] = useState<All<ExerciseType>>('全部');
  const [status, setStatus] = useState<'全部' | '未完成' | '已完成'>('全部');
  const [open, setOpen] = useState<string[]>([]);
  const { practiced, togglePractice } = useLearning();
  const filtered = useMemo(
    () =>
      exercises.filter((item) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.question.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q));
        const done = practiced.includes(item.id);
        return (
          matchesQuery &&
          (category === 'all' || item.category === category) &&
          (difficulty === '全部' || item.difficulty === difficulty) &&
          (type === '全部' || item.type === type) &&
          (status === '全部' || (status === '已完成' ? done : !done))
        );
      }),
    [query, category, difficulty, type, status, practiced],
  );
  const clear = () => {
    setQuery('');
    setCategory('all');
    setDifficulty('全部');
    setType('全部');
    setStatus('全部');
  };
  return (
    <main>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="grid gap-7 border-b border-border pb-9 lg:grid-cols-[1fr_280px] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow flex items-center gap-2">
              <Dumbbell size={15} />
              练习
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">
              把理解变成能独立作答的能力。
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              题目整理自本地机器学习与深度学习资料。先独立作答，再展开答案，并通过标签或来源回到对应学习位置。
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">练习进度</span>
              <strong className="text-xl tabular-nums">
                {practiced.length}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / {exercises.length}
                </span>
              </strong>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${exercises.length ? (practiced.length / exercises.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </header>
        <section
          aria-label="练习筛选"
          className="mt-8 rounded-2xl border border-border bg-card p-3"
        >
          <label className="relative block" htmlFor="exercise-search">
            <span className="sr-only">搜索练习</span>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              id="exercise-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索题目、标签或来源章节…"
              className="h-10 border-0 bg-background/65 pl-9"
            />
          </label>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select
              className="select-control"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              aria-label="方向筛选"
            >
              <option value="all">全部方向</option>
              <option value="machine-learning">机器学习</option>
              <option value="deep-learning">深度学习</option>
            </select>
            <select
              className="select-control"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as typeof difficulty)
              }
              aria-label="难度筛选"
            >
              <option>全部</option>
              <option>入门</option>
              <option>进阶</option>
              <option>挑战</option>
            </select>
            <select
              className="select-control"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              aria-label="题型筛选"
            >
              <option>全部</option>
              <option>概念</option>
              <option>计算</option>
              <option>代码</option>
              <option>诊断</option>
              <option>项目</option>
            </select>
            <select
              className="select-control"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              aria-label="完成状态筛选"
            >
              <option>全部</option>
              <option>未完成</option>
              <option>已完成</option>
            </select>
          </div>
        </section>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <SlidersHorizontal size={15} />
            {filtered.length} 道题
          </span>
          {(query ||
            category !== 'all' ||
            difficulty !== '全部' ||
            type !== '全部' ||
            status !== '全部') && (
            <button
              className="rounded-md text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              onClick={clear}
            >
              清除筛选
            </button>
          )}
        </div>
        <section className="mt-5 space-y-4">
          {filtered.length ? (
            filtered.map((item) => {
              const answered = open.includes(item.id);
              const done = practiced.includes(item.id);
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`exercise-type exercise-type-${getExerciseTypeGroup(item.type)}`}
                    >
                      {item.type}
                    </span>
                    <span
                      className={`difficulty difficulty-${item.difficulty}`}
                    >
                      {item.difficulty}
                    </span>
                    {done && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <Check size={13} />
                        已完成
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {categoryMap[item.category].title}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-medium">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.question}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                  {answered && (
                    <div className="mt-5 rounded-xl border border-primary/20 bg-primary/[.06] p-4">
                      <p className="text-xs font-semibold text-primary">
                        参考答案
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground/85">
                        {item.answer}
                      </p>
                      <Link
                        href={`/concept/${item.conceptSlug}`}
                        className="mt-4 inline-flex rounded-md text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        学习对应概念 · {item.source}
                      </Link>
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setOpen((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id],
                        )
                      }
                    >
                      {answered ? <ChevronUp /> : <ChevronDown />}
                      {answered ? '收起答案' : '查看答案'}
                    </Button>
                    <Button
                      variant={done ? 'secondary' : 'default'}
                      onClick={() => togglePractice(item.id)}
                    >
                      {done && <Check />}
                      {done ? '已完成' : '标记为已练习'}
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState
              title="没有找到匹配的练习"
              description="试试更短的关键词，点击标签，或清除方向、难度、题型与完成状态筛选。"
            />
          )}
        </section>
      </div>
    </main>
  );
}
