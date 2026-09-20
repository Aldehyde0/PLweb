import type { Concept } from './content-base';
import { longFormMap } from './long-form-content';
import { fundamentalsLongForms } from './fundamentals-long-form';
import { preprocessingLongForms } from './preprocessing-long-form';
import { modelsLongForms } from './models-long-form';
import { evaluationLongForms } from './evaluation-long-form';
import { projectsLongForms } from './projects-long-form';

const mlGroups = new Map([
  ...fundamentalsLongForms.map(
    (item) => [item.slug, '入门与数学基础'] as const,
  ),
  ...preprocessingLongForms.map(
    (item) => [item.slug, '数据预处理与特征工程'] as const,
  ),
  ...modelsLongForms.map((item) => [item.slug, '模型与算法'] as const),
  ...evaluationLongForms.map((item) => [item.slug, '评估与模型选择'] as const),
  ...projectsLongForms.map((item) => [item.slug, '项目与部署'] as const),
]);
const fallbackGroups: Record<string, string> = {
  'data-preprocessing': '数据预处理与特征工程',
  'feature-engineering': '数据预处理与特征工程',
  'model-evaluation': '评估与模型选择',
  'overfitting-regularization': '评估与模型选择',
  'pca-clustering': '模型与算法',
  'neural-networks': '基础组件',
  'convolutional-neural-networks': '计算机视觉',
  transformer: '序列与 Transformer',
  backpropagation: '自动微分',
  'gradient-descent': '入门与数学基础',
};

export function conceptDirectory(
  concept: Pick<Concept, 'slug' | 'category'>,
): string {
  if (concept.category === 'machine-learning')
    return (
      mlGroups.get(concept.slug) ??
      fallbackGroups[concept.slug] ??
      '入门与数学基础'
    );
  const long = longFormMap[concept.slug];
  return long && 'subcategory' in long && typeof long.subcategory === 'string'
    ? long.subcategory
    : (fallbackGroups[concept.slug] ?? '基础概念');
}

/** Stable directory order shared by the category page and generated plans. */
export function directoryConcepts<
  T extends Pick<Concept, 'slug' | 'category' | 'difficulty'>,
>(concepts: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const concept of concepts) {
    const key = `${concept.category}/${conceptDirectory(concept)}`;
    const group = groups.get(key) ?? [];
    group.push(concept);
    groups.set(key, group);
  }
  const rank = { 入门: 0, 进阶: 1, 挑战: 2 };
  return [...groups.values()].flatMap((items) =>
    items.sort((a, b) => rank[a.difficulty] - rank[b.difficulty]),
  );
}
