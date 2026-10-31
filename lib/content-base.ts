export type CategorySlug =
  | 'artificial-intelligence'
  | 'machine-learning'
  | 'deep-learning'
  | 'reinforcement-learning';
export type Difficulty = '入门' | '进阶' | '挑战';

export interface Category {
  slug: CategorySlug;
  title: string;
  shortTitle: string;
  description: string;
}
export interface Concept {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  difficulty: Difficulty;
  summary: string;
  prerequisites: string[];
  explanation: string;
  principle: string;
  formula: { expression: string; description: string };
  workflow: string[];
  code: {
    language: 'Python' | 'NumPy' | 'PyTorch';
    source: string;
    highlights: string[];
  };
  codeExplanation: string;
  applications: string[];
  pitfalls: string[];
  relatedConcepts: string[];
}

export const categories: Category[] = [
  {
    slug: 'artificial-intelligence',
    title: '人工智能',
    shortTitle: 'AI',
    description:
      '理解感知、推理、规划与生成，以及支撑模型训练和可靠服务的 AI 基础设施。',
  },
  {
    slug: 'machine-learning',
    title: '机器学习',
    shortTitle: 'ML',
    description: '研究系统如何从数据中学习规律，并对未见样本作出可靠预测。',
  },
  {
    slug: 'deep-learning',
    title: '深度学习',
    shortTitle: 'DL',
    description: '用多层神经网络自动学习表示，理解现代智能系统的核心组件。',
  },
  {
    slug: 'reinforcement-learning',
    title: '强化学习',
    shortTitle: 'RL',
    description: '研究智能体如何通过与环境交互，在长期反馈中学会决策。',
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((item) => [item.slug, item]),
) as Record<CategorySlug, Category>;
