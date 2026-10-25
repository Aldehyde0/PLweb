import type { Concept } from './content.ts';
import { conceptMap, concepts } from './content.ts';

import type { ConceptSortMode } from './concept-order.ts';
export {
  sortConcepts,
  getDifficultyRank,
  type ConceptSortMode,
} from './concept-order.ts';
export { difficultyOrder } from './difficulty.ts';

import { aliases, normalize } from './concept-identifiers.ts';

const normalizedTitleMap = new Map(
  concepts.map((concept) => [normalize(concept.title), concept]),
);

export function getConceptBySlug(slug: string) {
  return conceptMap[slug] ?? null;
}
export function getConceptById(id: string) {
  return concepts.find((concept) => concept.id === id) ?? null;
}
export function getConceptHref(concept: Concept) {
  return `/concept/${encodeURIComponent(concept.slug)}`;
}

export function resolveConceptLink(identifier: string) {
  const alias = aliases[identifier.trim()];
  const concept =
    getConceptBySlug(alias ?? identifier) ||
    getConceptById(identifier) ||
    normalizedTitleMap.get(normalize(identifier)) ||
    null;
  return {
    identifier,
    label: concept?.title ?? identifier,
    concept,
    href: concept ? getConceptHref(concept) : null,
    exists: Boolean(concept),
  };
}
export function hasConceptRoute(identifier: string) {
  return resolveConceptLink(identifier).exists;
}

export function sectionIdFromTitle(title: string) {
  const known: Record<string, string> = {
    学习前需要掌握: 'prerequisites',
    前置知识: 'prerequisites',
    背景与问题: 'background',
    概念定义: 'definition',
    直观理解: 'intuition',
    通俗直觉: 'intuition',
    核心原理: 'core-principle',
    数学表达: 'formulas',
    数学公式: 'formulas',
    变量解释: 'variables',
    完整数值示例: 'numerical-example',
    计算与实现步骤: 'algorithm-steps',
    工作流程: 'algorithm-steps',
    代码实现: 'code',
    代码示例: 'code',
    实际应用: 'applications',
    应用场景: 'applications',
    常见错误: 'pitfalls',
    常见误区: 'pitfalls',
    与其他概念的关系: 'related',
    相关概念: 'related',
    文档来源: 'sources',
    扩展内容说明: 'extension',
  };
  return known[title] ?? `section-${normalize(title)}`;
}

export const sortModeLabels: Record<ConceptSortMode, string> = {
  'difficulty-asc': '收藏优先，难度递增',
  'difficulty-desc': '收藏优先，难度递减',
};
