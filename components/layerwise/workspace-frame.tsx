'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CalendarRange,
  LibraryBig,
  ListChecks,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useRef } from 'react';
import { categories } from '@/lib/content';
import { exercises } from '@/lib/exercises';
import { learningResources, resourceTypes } from '@/lib/resources';
import { exerciseFilterSchema } from '@/lib/filter-query';
import { libraryFilterSchema, planFilterSchema } from '@/lib/workspace-filters';
import { useFilterQuery } from '@/hooks/use-filter-query';
import { useLearning } from '@/components/learning-store';
import { useResources } from '@/components/resource-store';
import { usePlans } from '@/components/plan-store';

type Kind = 'plans' | 'resources' | 'practice' | 'bookmarks';
const names = {
  plans: 'Planning',
  resources: 'Resources',
  practice: 'Practice',
  bookmarks: 'Bookmarks',
};
const routes = {
  plans: '/plans',
  resources: '/resources',
  practice: '/exercises',
  bookmarks: '/bookmarks',
};
const icons = {
  plans: CalendarRange,
  resources: LibraryBig,
  practice: ListChecks,
  bookmarks: BookOpen,
};

function RailButton({
  selected,
  children,
  onClick,
  count,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      className="lw-rail-item"
      aria-pressed={selected}
      onClick={onClick}
    >
      <span>{children}</span>
      {count !== undefined && <small>{count}</small>}
    </button>
  );
}

function ResourcesRail() {
  const { filters, update } = useFilterQuery(libraryFilterSchema);
  const { bookmarkIds, viewedIds } = useResources();
  return (
    <>
      <div className="lw-rail-section">
        <p>资料库</p>
        {(
          [
            ['all', '全部资料', learningResources.length],
            ['bookmarked', '我的收藏', bookmarkIds.length],
            ['viewed', '已查看', viewedIds.length],
          ] as const
        ).map(([view, label, count]) => (
          <RailButton
            key={view}
            selected={filters.view === view}
            count={count}
            onClick={() => update({ view })}
          >
            {label}
          </RailButton>
        ))}
      </div>
      <div className="lw-rail-section">
        <p>学习方向</p>
        <RailButton
          selected={filters.category === 'all'}
          onClick={() => update({ category: 'all' })}
        >
          全部方向
        </RailButton>
        {categories.map((c) => (
          <RailButton
            key={c.slug}
            selected={filters.category === c.slug}
            onClick={() => update({ category: c.slug })}
            count={
              learningResources.filter((r) => r.category === c.slug).length
            }
          >
            {c.title}
          </RailButton>
        ))}
      </div>
      <div className="lw-rail-section">
        <p>资料类型</p>
        {resourceTypes.map((type) => (
          <RailButton
            key={type}
            selected={filters.type === type}
            onClick={() =>
              update({ type: filters.type === type ? 'all' : type })
            }
          >
            {type}
          </RailButton>
        ))}
      </div>
    </>
  );
}

function PracticeRail() {
  const { filters, update } = useFilterQuery(exerciseFilterSchema);
  const { practiced } = useLearning();
  const done = exercises.filter((e) => practiced.includes(e.id)).length;
  return (
    <>
      <div className="lw-rail-section">
        <p>练习进度</p>
        {(['全部', '未完成', '已完成'] as const).map((status, i) => (
          <RailButton
            key={status}
            selected={filters.status === status}
            count={[exercises.length, exercises.length - done, done][i]}
            onClick={() => update({ status, page: '1' })}
          >
            {status === '全部' ? '全部练习' : status}
          </RailButton>
        ))}
      </div>
      <div className="lw-rail-section">
        <p>学习方向</p>
        <RailButton
          selected={filters.category === 'all'}
          onClick={() => update({ category: 'all', page: '1' })}
        >
          全部方向
        </RailButton>
        {categories
          .filter((c) => exercises.some((e) => e.category === c.slug))
          .map((c) => (
            <RailButton
              key={c.slug}
              selected={filters.category === c.slug}
              onClick={() => update({ category: c.slug, page: '1' })}
              count={exercises.filter((e) => e.category === c.slug).length}
            >
              {c.title}
            </RailButton>
          ))}
      </div>
      <div className="lw-rail-section">
        <p>练习方式</p>
        {(['全部', '概念', '计算', '代码', '诊断', '项目'] as const).map(
          (type) => (
            <RailButton
              key={type}
              selected={filters.type === type}
              onClick={() => update({ type, page: '1' })}
            >
              {type === '全部' ? '全部题型' : type}
            </RailButton>
          ),
        )}
      </div>
    </>
  );
}

function PlansRail() {
  const { plans, activePlan } = usePlans();
  const { filters, update } = useFilterQuery(planFilterSchema);
  const pathname = usePathname();
  return (
    <>
      <Link href="/plans/new" className="lw-rail-create">
        + 创建学习计划
      </Link>
      <div className="lw-rail-section">
        <p>计划状态</p>
        {(['all', 'active', 'paused', 'completed'] as const).map((status, i) =>
          pathname === '/plans' ? (
            <RailButton
              key={status}
              selected={filters.status === status}
              count={
                status === 'all'
                  ? plans.length
                  : plans.filter((p) => p.status === status).length
              }
              onClick={() => update({ status })}
            >
              {['全部计划', '进行中', '已暂停', '已完成'][i]}
            </RailButton>
          ) : (
            <Link
              key={status}
              className="lw-rail-item"
              href={`/plans${status === 'all' ? '' : `?status=${status}`}`}
            >
              {['全部计划', '进行中', '已暂停', '已完成'][i]}
            </Link>
          ),
        )}
      </div>
      {activePlan && (
        <div className="lw-rail-section">
          <p>当前计划</p>
          <Link className="lw-rail-item" href={`/plans/${activePlan.id}`}>
            {activePlan.title}
          </Link>
          <Link className="lw-rail-item" href={`/plans/${activePlan.id}/today`}>
            今日任务
          </Link>
          <Link className="lw-rail-item" href={`/plans/${activePlan.id}/week`}>
            本周安排
          </Link>
        </div>
      )}
      <div className="lw-rail-section lw-method-note">
        <p>学习方法</p>
        <strong>从理解到实践</strong>
        <span>选择适合自己的节奏。任务、子步骤和阶段测试帮助你检验理解。</span>
      </div>
    </>
  );
}

export function WorkspaceFrame({
  kind,
  children,
}: {
  kind: Kind;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const Icon = icons[kind];
  const rail = (
    <>
      <Link className="lw-rail-heading" href={routes[kind]}>
        <Icon />
        <span>{names[kind]}</span>
      </Link>
      {kind === 'resources' ? (
        <ResourcesRail />
      ) : kind === 'practice' ? (
        <PracticeRail />
      ) : kind === 'plans' ? (
        <PlansRail />
      ) : (
        <Link href="/" className="lw-rail-item">
          探索学习方向
        </Link>
      )}
      <p className="lw-rail-footnote">
        学习记录保存在当前浏览器
        <br />
        可在页脚导入或导出备份
      </p>
    </>
  );
  return (
    <div className={`lw-workspace lw-workspace-${kind}`}>
      <aside
        className="lw-workspace-sidebar"
        aria-label={`${names[kind]} navigation`}
      >
        {rail}
      </aside>
      <div className="lw-workspace-body">
        <div className="lw-workspace-mobile-tools">
          <button ref={trigger} onClick={() => dialog.current?.showModal()}>
            <SlidersHorizontal />
            筛选与导航
          </button>
        </div>
        {children}
      </div>
      <dialog
        ref={dialog}
        className="lw-workspace-drawer"
        aria-label="筛选与导航"
        onClose={() => trigger.current?.focus()}
      >
        <header>
          <strong>{names[kind]}</strong>
          <button aria-label="关闭筛选" onClick={() => dialog.current?.close()}>
            <X />
          </button>
        </header>
        {rail}
      </dialog>
    </div>
  );
}
