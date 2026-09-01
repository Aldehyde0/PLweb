'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Network,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { useLearning } from '@/components/learning-store';
import {
  categories,
  categoryMap,
  conceptMap,
  concepts,
  getConceptsByCategory,
} from '@/lib/content';
import { exercises } from '@/lib/exercises';

const icons = {
  'artificial-intelligence': Sparkles,
  'machine-learning': Orbit,
  'deep-learning': Network,
  'reinforcement-learning': BrainCircuit,
};

export function Dashboard() {
  const { learned, bookmarks, recent, practiced, ready } = useLearning();
  const recentConcepts = recent
    .map((slug) => conceptMap[slug])
    .filter(Boolean)
    .slice(0, 3);
  const savedConcepts = bookmarks
    .map((slug) => conceptMap[slug])
    .filter(Boolean)
    .slice(0, 3);
  const recommended =
    concepts.find((concept) => !learned.includes(concept.slug)) ?? concepts[0];
  const progress = ready
    ? Math.round((learned.length / Math.max(concepts.length, 1)) * 100)
    : 0;

  return (
    <main className="dashboard">
      <section className="dashboard-hero" aria-labelledby="dashboard-title">
        <div className="dashboard-hero__copy">
          <p className="dashboard-status">
            <span aria-hidden="true" />
            个人 AI 学习工作台
          </p>
          <h1 id="dashboard-title">从理解概念，到独立解决问题。</h1>
          <p className="dashboard-hero__lede">
            沿着本地资料的学习路线，从数学和数据地基走到模型、工程实践与练习。学习记录只保存在当前浏览器。
          </p>
          <div className="dashboard-hero__actions">
            <Link
              href={`/concept/${recommended.slug}`}
              className="dashboard-button dashboard-button--primary"
            >
              继续学习
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/plans"
              className="dashboard-button dashboard-button--secondary"
            >
              查看计划
            </Link>
          </div>
        </div>

        <aside className="learning-console" aria-label="学习状态概览">
          <div className="learning-console__header">
            <div>
              <span>今日工作台</span>
              <strong>{recommended.title}</strong>
            </div>
            <span className="learning-console__state">
              <span aria-hidden="true" />
              本地同步
            </span>
          </div>
          <dl className="learning-console__stats">
            <Stat value={concepts.length} label="概念总数" />
            <Stat value={ready ? learned.length : '—'} label="已学习" />
            <Stat value={exercises.length} label="练习总数" />
            <Stat value={ready ? practiced.length : '—'} label="已完成" />
          </dl>
          <div className="learning-console__progress">
            <div>
              <span>整体进度</span>
              <strong>{ready ? `${progress}%` : '读取中'}</strong>
            </div>
            <progress
              className="sr-only"
              aria-label="整体学习进度"
              max={100}
              value={progress}
            />
            <div className="learning-console__track" aria-hidden="true">
              <span
                style={{ '--progress': `${progress}%` } as React.CSSProperties}
              />
            </div>
          </div>
          <Link
            className="learning-console__next"
            href={`/concept/${recommended.slug}`}
          >
            <span>
              <small>推荐下一步</small>
              <strong>{recommended.title}</strong>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </section>

      <section className="dashboard-section" aria-labelledby="directions">
        <SectionHead
          id="directions"
          title="选择一个学习方向"
          note={`${concepts.length} 个概念，按真实依赖组织`}
        />
        <div className="direction-grid">
          {categories.map((category) => {
            const Icon = icons[category.slug];
            const list = getConceptsByCategory(category.slug);
            const completed = list.filter((concept) =>
              learned.includes(concept.slug),
            ).length;
            const percentage = list.length
              ? (completed / list.length) * 100
              : 0;
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="direction-card"
              >
                <div className="direction-card__title">
                  <Icon aria-hidden="true" />
                  <h3>{category.title}</h3>
                  <ArrowRight
                    className="direction-card__arrow"
                    aria-hidden="true"
                  />
                </div>
                <p>{category.description}</p>
                <div className="direction-card__progress">
                  <span>
                    <i
                      style={
                        {
                          '--progress': `${percentage}%`,
                        } as React.CSSProperties
                      }
                    />
                  </span>
                  <small>
                    {completed} / {list.length}
                  </small>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="practice-strip" aria-labelledby="practice-title">
        <div className="practice-strip__icon">
          <Dumbbell aria-hidden="true" />
        </div>
        <div>
          <h2 id="practice-title">把理解放进题目里检验</h2>
          <p>
            {exercises.length}{' '}
            道题按方向、难度、题型和状态组织。独立作答后，再展开参考答案。
          </p>
        </div>
        <Link
          href="/exercises"
          className="dashboard-button dashboard-button--primary"
        >
          开始练习
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="dashboard-section dashboard-history">
        <HistoryColumn
          title="最近浏览"
          icon={<Clock3 aria-hidden="true" />}
          items={recentConcepts}
          empty="打开任意概念后，这里会保留你的阅读足迹。"
        />
        <HistoryColumn
          title="收藏概念"
          icon={<Bookmark aria-hidden="true" />}
          items={savedConcepts}
          empty="收藏重要概念后，可以从这里直接返回。"
        />
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function SectionHead({
  id,
  title,
  note,
}: {
  id: string;
  title: string;
  note: string;
}) {
  return (
    <div className="dashboard-section__head">
      <h2 id={id}>{title}</h2>
      <p>{note}</p>
    </div>
  );
}

function HistoryColumn({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: (typeof concepts)[number][];
  empty: string;
}) {
  return (
    <div className="history-column">
      <div className="history-column__head">
        <span>{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="history-column__list">
        {items.length ? (
          items.map((concept) => (
            <Link key={concept.slug} href={`/concept/${concept.slug}`}>
              <span>
                <strong>{concept.title}</strong>
                <small>{categoryMap[concept.category].title}</small>
              </span>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))
        ) : (
          <div className="history-column__empty">
            <CheckCircle2 aria-hidden="true" />
            <span>{empty}</span>
          </div>
        )}
      </div>
    </div>
  );
}
