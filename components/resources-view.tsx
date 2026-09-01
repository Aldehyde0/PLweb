'use client';

import Link from 'next/link';
import { LibraryBig, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { categories, type CategorySlug, type Difficulty } from '@/lib/content';
import {
  filterResources,
  learningResources,
  resourceTypes,
  type RecommendationLevel,
  type ResourceFilters,
  type ResourceLanguage,
  type ResourceType,
} from '@/lib/resources';
import { ResourceCard } from '@/components/resource-card';
import { Input } from '@/components/ui/input';

const initialFilters: ResourceFilters = {
  query: '',
  category: 'all',
  type: 'all',
  difficulty: 'all',
  language: 'all',
  cost: 'all',
  recommendation: 'all',
  sort: 'recommendation',
};

export function ResourcesView() {
  const [filters, setFilters] = useState(initialFilters);
  const resources = useMemo(
    () => filterResources(learningResources, filters),
    [filters],
  );
  function set<K extends keyof ResourceFilters>(
    key: K,
    value: ResourceFilters[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }
  return (
    <main className="resources-page">
      <div className="resources-container">
        <nav aria-label="面包屑" className="breadcrumbs">
          <Link href="/">知识库</Link>
          <span>/</span>
          <span>学习资料参考库</span>
        </nav>
        <header className="resources-header">
          <div>
            <p className="eyebrow">外部资料索引</p>
            <h1>学习资料参考库</h1>
            <p>
              只保存简短介绍、关联概念和外部链接，不复制外部文章或课程内容。
            </p>
          </div>
          <div>
            <LibraryBig />
            <strong>{learningResources.length}</strong>
            <span>条已核对资料</span>
          </div>
        </header>
        <section className="resource-filters" aria-label="筛选学习资料">
          <label className="resource-search" htmlFor="resource-search">
            <Search />
            <Input
              id="resource-search"
              value={filters.query}
              onChange={(event) => set('query', event.target.value)}
              placeholder="搜索标题、作者、平台或关键词…"
            />
          </label>
          <div className="resource-filter-grid">
            <Filter label="方向">
              <select
                value={filters.category}
                onChange={(event) =>
                  set('category', event.target.value as CategorySlug | 'all')
                }
              >
                <option value="all">全部方向</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.title}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter label="类型">
              <select
                value={filters.type}
                onChange={(event) =>
                  set('type', event.target.value as ResourceType | 'all')
                }
              >
                <option value="all">全部类型</option>
                {resourceTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Filter>
            <Filter label="难度">
              <select
                value={filters.difficulty}
                onChange={(event) =>
                  set('difficulty', event.target.value as Difficulty | 'all')
                }
              >
                <option value="all">全部难度</option>
                <option>入门</option>
                <option>进阶</option>
                <option>挑战</option>
              </select>
            </Filter>
            <Filter label="语言">
              <select
                value={filters.language}
                onChange={(event) =>
                  set(
                    'language',
                    event.target.value as ResourceLanguage | 'all',
                  )
                }
              >
                <option value="all">全部语言</option>
                <option>中文</option>
                <option>英语</option>
                <option>中英双语</option>
              </select>
            </Filter>
            <Filter label="费用">
              <select
                value={filters.cost}
                onChange={(event) =>
                  set('cost', event.target.value as ResourceFilters['cost'])
                }
              >
                <option value="all">免费与付费</option>
                <option value="free">免费</option>
                <option value="paid">付费</option>
              </select>
            </Filter>
            <Filter label="推荐等级">
              <select
                value={filters.recommendation}
                onChange={(event) =>
                  set(
                    'recommendation',
                    event.target.value as RecommendationLevel | 'all',
                  )
                }
              >
                <option value="all">全部等级</option>
                <option value="A">A · 核心推荐</option>
                <option value="B">B · 辅助学习</option>
                <option value="C">C · 拓展阅读</option>
              </select>
            </Filter>
            <Filter label="排序">
              <select
                value={filters.sort}
                onChange={(event) =>
                  set('sort', event.target.value as ResourceFilters['sort'])
                }
              >
                <option value="recommendation">推荐顺序</option>
                <option value="updated">最近验证</option>
              </select>
            </Filter>
          </div>
        </section>
        <div className="resources-result-row">
          <span>
            <SlidersHorizontal />
            {resources.length} 条结果
          </span>
          {JSON.stringify(filters) !== JSON.stringify(initialFilters) && (
            <button type="button" onClick={() => setFilters(initialFilters)}>
              清除筛选
            </button>
          )}
        </div>
        {resources.length ? (
          <section className="resource-grid" aria-label="学习资料列表">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </section>
        ) : (
          <section className="resource-empty">
            <LibraryBig />
            <h2>没有匹配的资料</h2>
            <p>尝试缩短关键词或清除部分筛选条件。</p>
          </section>
        )}
      </div>
    </main>
  );
}

function Filter({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="resource-filter">
      <span>{label}</span>
      {children}
    </label>
  );
}
