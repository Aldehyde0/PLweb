import { additionalResources } from './resources-additions.ts';
import type { CategorySlug, Difficulty } from './content-base';

export const resourceCategories = [
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'reinforcement-learning',
] as const satisfies readonly CategorySlug[];

export const resourceTypes = [
  '官方文档',
  '技术文章',
  '视频',
  '视频课程',
  '论文',
  'GitHub 仓库',
  '书籍',
  '交互式工具',
  '代码教程',
  '数据集',
] as const;

export type ResourceType = (typeof resourceTypes)[number];
export type RecommendationLevel = 'A' | 'B' | 'C';
export type ResourceLanguage = '中文' | '英语' | '中英双语';

export interface GitHubResourceMeta {
  purpose: string;
  primaryLanguage: string;
  includesDatasetOrExperiments: boolean;
  requiresExtraEnvironment: boolean;
}

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  category: CategorySlug;
  subcategory: string;
  summary: string;
  author: string;
  platform: string;
  difficulty: Difficulty;
  language: ResourceLanguage;
  duration: string | null;
  isFree: boolean;
  url: string;
  conceptSlugs: string[];
  prerequisites: string[];
  tags: string[];
  recommendationLevel: RecommendationLevel;
  lastVerifiedAt: string;
  notes: string;
  github?: GitHubResourceMeta;
}

type ResourceSeed = Omit<
  LearningResource,
  | 'language'
  | 'duration'
  | 'isFree'
  | 'prerequisites'
  | 'tags'
  | 'lastVerifiedAt'
  | 'notes'
> &
  Partial<
    Pick<
      LearningResource,
      | 'language'
      | 'duration'
      | 'isFree'
      | 'prerequisites'
      | 'tags'
      | 'lastVerifiedAt'
      | 'notes'
    >
  >;

const resource = (seed: ResourceSeed): LearningResource => ({
  language: '英语',
  duration: null,
  isFree: true,
  prerequisites: [],
  tags: [],
  lastVerifiedAt: '2026-09-01',
  notes: '',
  ...seed,
});

export const learningResources: LearningResource[] = [
  ...additionalResources,
  resource({
    id: 'ai-openai-agents-docs',
    title: 'OpenAI Agents SDK 文档',
    type: '官方文档',
    category: 'artificial-intelligence',
    subcategory: 'Agent',
    summary:
      '系统介绍 Agent、工具、Handoff、Guardrail、Session 与追踪等核心组件。',
    author: 'OpenAI',
    platform: 'OpenAI',
    difficulty: '进阶',
    url: 'https://openai.github.io/openai-agents-python/',
    conceptSlugs: ['agent-architecture', 'agent-loop', 'tools'],
    tags: ['官方', '推荐', '包含代码'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ai-openai-tools-guide',
    title: 'OpenAI Tools Guide',
    type: '官方文档',
    category: 'artificial-intelligence',
    subcategory: 'Tool',
    summary:
      '说明模型如何调用函数、搜索、计算机操作及其他工具，并展示结构化参数。',
    author: 'OpenAI',
    platform: 'OpenAI Platform',
    difficulty: '进阶',
    url: 'https://platform.openai.com/docs/guides/tools',
    conceptSlugs: ['tools', 'function-calling', 'tool-calling'],
    tags: ['官方', '包含代码'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ai-mcp-introduction',
    title: 'Model Context Protocol Introduction',
    type: '官方文档',
    category: 'artificial-intelligence',
    subcategory: 'MCP',
    summary: '从客户端、服务器、工具、资源和提示等对象解释 MCP 的连接模型。',
    author: 'Model Context Protocol',
    platform: 'MCP',
    difficulty: '进阶',
    url: 'https://modelcontextprotocol.io/docs/getting-started/intro',
    conceptSlugs: ['mcp-overview', 'mcp-architecture'],
    tags: ['官方', '推荐'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ai-cs50-ai',
    title: 'CS50’s Introduction to Artificial Intelligence with Python',
    type: '视频课程',
    category: 'artificial-intelligence',
    subcategory: '综合基础',
    summary: '通过搜索、知识表示、概率、优化、机器学习与语言项目学习 AI 基础。',
    author: 'Brian Yu / David J. Malan',
    platform: 'Harvard CS50',
    difficulty: '进阶',
    duration: '7 周',
    url: 'https://cs50.harvard.edu/ai/',
    conceptSlugs: [
      'ai-overview',
      'state-space-search',
      'knowledge-representation',
    ],
    prerequisites: ['Python 基础'],
    tags: ['视频', '公开课', '包含代码', '包含实验'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ai-berkeley-cs188',
    title: 'UC Berkeley CS188 Introduction to AI',
    type: '视频课程',
    category: 'artificial-intelligence',
    subcategory: '搜索与推理',
    summary: '覆盖智能体、搜索、博弈、概率推理、MDP、强化学习和机器学习。',
    author: 'UC Berkeley EECS',
    platform: 'UC Berkeley',
    difficulty: '挑战',
    duration: '一学期',
    url: 'https://inst.eecs.berkeley.edu/~cs188/',
    conceptSlugs: [
      'intelligent-agent',
      'state-space-search',
      'markov-decision-process',
    ],
    prerequisites: ['概率基础', 'Python'],
    tags: ['视频', '公开课', '需要数学基础'],
    recommendationLevel: 'B',
  }),
  resource({
    id: 'ai-aima-book',
    title: 'Artificial Intelligence: A Modern Approach',
    type: '书籍',
    category: 'artificial-intelligence',
    subcategory: '综合理论',
    summary:
      '以统一框架组织搜索、知识、推理、规划、学习、智能体和机器人等主题。',
    author: 'Stuart Russell / Peter Norvig',
    platform: 'AIMA',
    difficulty: '挑战',
    isFree: false,
    url: 'https://aima.cs.berkeley.edu/',
    conceptSlugs: [
      'ai-overview',
      'state-space-search',
      'knowledge-representation',
    ],
    tags: ['经典教材', '需要数学基础', '需要付费'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ai-openai-agents-github',
    title: 'openai/openai-agents-python',
    type: 'GitHub 仓库',
    category: 'artificial-intelligence',
    subcategory: 'Agent',
    summary: 'OpenAI Agents SDK 的 Python 源码、文档、示例与集成测试仓库。',
    author: 'OpenAI',
    platform: 'GitHub',
    difficulty: '挑战',
    url: 'https://github.com/openai/openai-agents-python',
    conceptSlugs: ['agent-architecture', 'tools', 'handoffs'],
    prerequisites: ['Python', 'API 基础'],
    tags: ['GitHub', '官方', '包含代码', '包含实验'],
    recommendationLevel: 'A',
    github: {
      purpose: '构建和研究多 Agent 工作流',
      primaryLanguage: 'Python',
      includesDatasetOrExperiments: true,
      requiresExtraEnvironment: true,
    },
  }),
  resource({
    id: 'ai-mcp-servers-github',
    title: 'modelcontextprotocol/servers',
    type: 'GitHub 仓库',
    category: 'artificial-intelligence',
    subcategory: 'MCP',
    summary: 'MCP 官方参考服务器与 SDK 使用示例，适合学习工具和资源暴露方式。',
    author: 'MCP Steering Group',
    platform: 'GitHub',
    difficulty: '挑战',
    url: 'https://github.com/modelcontextprotocol/servers',
    conceptSlugs: ['mcp-overview', 'mcp-server', 'mcp-tools-resources-prompts'],
    prerequisites: ['TypeScript 或 Python', '进程通信基础'],
    tags: ['GitHub', '官方', '包含代码'],
    recommendationLevel: 'A',
    notes: '参考实现并不等同于可直接投入生产的服务器。',
    github: {
      purpose: '展示 MCP 服务器能力和协议用法',
      primaryLanguage: 'TypeScript / Python',
      includesDatasetOrExperiments: false,
      requiresExtraEnvironment: true,
    },
  }),

  resource({
    id: 'ml-sklearn-user-guide',
    title: 'scikit-learn User Guide',
    type: '官方文档',
    category: 'machine-learning',
    subcategory: '模型与评估',
    summary: '覆盖监督学习、无监督学习、预处理、模型选择、评估和常见陷阱。',
    author: 'scikit-learn Contributors',
    platform: 'scikit-learn',
    difficulty: '进阶',
    url: 'https://scikit-learn.org/stable/user_guide',
    conceptSlugs: [
      'supervised-learning',
      'unsupervised-learning',
      'model-evaluation',
      'numerical-standardization',
    ],
    tags: ['官方', '推荐', '包含代码'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ml-google-crash-course',
    title: 'Google Machine Learning Crash Course',
    type: '视频课程',
    category: 'machine-learning',
    subcategory: '机器学习基础',
    summary:
      '以短视频、可视化和练习讲解回归、分类、数据、过拟合与神经网络基础。',
    author: 'Google',
    platform: 'Google for Developers',
    difficulty: '入门',
    duration: '约 15 小时',
    url: 'https://developers.google.com/machine-learning/crash-course/',
    conceptSlugs: [
      'machine-learning-overview',
      'linear-regression',
      'classification-vs-regression',
      'numerical-standardization',
    ],
    tags: ['视频', '交互式', '适合入门'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ml-isl-book',
    title: 'An Introduction to Statistical Learning',
    type: '书籍',
    category: 'machine-learning',
    subcategory: '统计学习',
    summary:
      '以较低数学门槛系统讲解回归、分类、重采样、树模型、正则化与无监督学习。',
    author: 'James / Witten / Hastie / Tibshirani / Taylor',
    platform: 'StatLearning',
    difficulty: '进阶',
    url: 'https://www.statlearning.com/',
    conceptSlugs: [
      'linear-regression',
      'logistic-regression',
      'decision-trees',
    ],
    prerequisites: ['统计学基础'],
    tags: ['经典教材', '推荐', '包含代码'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ml-statquest-video',
    title: 'StatQuest Machine Learning Videos',
    type: '视频',
    category: 'machine-learning',
    subcategory: '算法直觉',
    summary: '用图形和分步推理讲解回归、分类、树模型、聚类、PCA 与评估指标。',
    author: 'Josh Starmer',
    platform: 'YouTube',
    difficulty: '入门',
    duration: '系列视频',
    url: 'https://www.youtube.com/c/joshstarmer/featured',
    conceptSlugs: [
      'linear-regression',
      'decision-trees',
      'principal-component-analysis',
      'numerical-standardization',
    ],
    tags: ['视频', '适合入门'],
    recommendationLevel: 'B',
  }),
  resource({
    id: 'ml-sklearn-github',
    title: 'scikit-learn/scikit-learn',
    type: 'GitHub 仓库',
    category: 'machine-learning',
    subcategory: '工程实现',
    summary: '经典机器学习算法、模型选择、预处理和评估工具的核心实现仓库。',
    author: 'scikit-learn Contributors',
    platform: 'GitHub',
    difficulty: '挑战',
    url: 'https://github.com/scikit-learn/scikit-learn',
    conceptSlugs: [
      'model-family-comparison',
      'model-evaluation',
      'data-preprocessing',
      'numerical-standardization',
    ],
    prerequisites: ['Python', 'NumPy', 'Cython'],
    tags: ['GitHub', '官方', '包含代码'],
    recommendationLevel: 'B',
    github: {
      purpose: '研究 scikit-learn 实现和贡献流程',
      primaryLanguage: 'Python / Cython',
      includesDatasetOrExperiments: true,
      requiresExtraEnvironment: true,
    },
  }),
  resource({
    id: 'ml-uci-datasets',
    title: 'UCI Machine Learning Repository',
    type: '数据集',
    category: 'machine-learning',
    subcategory: '数据集',
    summary: '提供分类、回归、聚类等任务常用的公开数据集和字段说明。',
    author: 'UC Irvine',
    platform: 'UCI',
    difficulty: '入门',
    url: 'https://archive.ics.uci.edu/',
    conceptSlugs: [
      'dataset-shapes',
      'classification-vs-regression',
      'ml-project-lifecycle',
    ],
    tags: ['数据集', '公开数据'],
    recommendationLevel: 'B',
  }),
  resource({
    id: 'ml-sklearn-examples',
    title: 'scikit-learn Examples',
    type: '代码教程',
    category: 'machine-learning',
    subcategory: '实验代码',
    summary: '按算法和应用组织可运行示例，展示预处理、训练、评估与可视化流程。',
    author: 'scikit-learn Contributors',
    platform: 'scikit-learn',
    difficulty: '进阶',
    url: 'https://scikit-learn.org/stable/auto_examples/index.html',
    conceptSlugs: [
      'data-preprocessing',
      'model-evaluation',
      'feature-engineering',
      'numerical-standardization',
    ],
    prerequisites: ['Python', 'NumPy'],
    tags: ['官方', '包含代码', '包含实验'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'ml-rules-of-ml',
    title: 'Rules of Machine Learning',
    type: '技术文章',
    category: 'machine-learning',
    subcategory: '机器学习工程',
    summary: '从指标、特征、管线和迭代方式总结构建真实机器学习系统的实践原则。',
    author: 'Martin Zinkevich',
    platform: 'Google for Developers',
    difficulty: '挑战',
    url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
    conceptSlugs: [
      'ml-project-lifecycle',
      'feature-engineering',
      'model-evaluation',
    ],
    tags: ['技术文章', '推荐', '工程实践'],
    recommendationLevel: 'B',
  }),

  resource({
    id: 'dl-pytorch-tutorials',
    title: 'PyTorch Tutorials',
    type: '官方文档',
    category: 'deep-learning',
    subcategory: 'PyTorch',
    summary:
      '从张量、数据加载、自动微分和网络训练逐步进入视觉、NLP、性能与部署。',
    author: 'PyTorch Contributors',
    platform: 'PyTorch',
    difficulty: '入门',
    url: 'https://docs.pytorch.org/tutorials/',
    conceptSlugs: [
      'pytorch-tensors-modules',
      'backpropagation',
      'training-engineering',
    ],
    tags: ['官方', '推荐', '包含代码'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'dl-d2l-book',
    title: 'Dive into Deep Learning',
    type: '书籍',
    category: 'deep-learning',
    subcategory: '综合教材',
    summary:
      '把数学、图示、文字与可执行代码结合，系统覆盖深度学习基础和现代模型。',
    author: 'Zhang / Lipton / Li / Smola',
    platform: 'D2L.ai',
    difficulty: '进阶',
    url: 'https://d2l.ai/',
    conceptSlugs: [
      'neural-networks',
      'convolutional-neural-networks',
      'transformer',
    ],
    tags: ['书籍', '交互式', '包含代码'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'dl-fastai-course',
    title: 'Practical Deep Learning for Coders',
    type: '视频课程',
    category: 'deep-learning',
    subcategory: '实践课程',
    summary: '以项目驱动方式学习视觉、NLP、表格模型、协同过滤和模型部署。',
    author: 'Jeremy Howard',
    platform: 'fast.ai',
    difficulty: '进阶',
    duration: '9 课，每课约 90 分钟',
    url: 'https://course.fast.ai/',
    conceptSlugs: [
      'neural-networks',
      'transfer-learning',
      'model-saving-inference',
    ],
    prerequisites: ['Python 编程'],
    tags: ['视频', '包含代码', '包含实验'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'dl-mit-course',
    title: 'MIT Introduction to Deep Learning',
    type: '视频课程',
    category: 'deep-learning',
    subcategory: '综合课程',
    summary: '以密集讲座和实验介绍神经网络、序列模型、生成模型和深度学习应用。',
    author: 'MIT 6.S191 Team',
    platform: 'MIT',
    difficulty: '进阶',
    duration: '年度课程',
    url: 'https://introtodeeplearning.com/',
    conceptSlugs: ['neural-networks', 'rnn-lstm-gru', 'deep-generative-models'],
    prerequisites: ['Python', '线性代数'],
    tags: ['视频', '公开课', '包含实验'],
    recommendationLevel: 'B',
  }),
  resource({
    id: 'dl-deep-learning-book',
    title: 'Deep Learning',
    type: '书籍',
    category: 'deep-learning',
    subcategory: '理论基础',
    summary:
      '系统讲解线性代数、优化、前馈网络、正则化、卷积、序列模型与研究主题。',
    author: 'Goodfellow / Bengio / Courville',
    platform: 'DeepLearningBook.org',
    difficulty: '挑战',
    url: 'https://www.deeplearningbook.org/',
    conceptSlugs: [
      'neural-networks',
      'deep-learning-regularization',
      'optimizers-schedulers',
    ],
    prerequisites: ['线性代数', '概率', '微积分'],
    tags: ['经典教材', '需要数学基础'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'dl-pytorch-examples-github',
    title: 'pytorch/examples',
    type: 'GitHub 仓库',
    category: 'deep-learning',
    subcategory: '代码实现',
    summary: '提供视觉、文本、强化学习和分布式训练等 PyTorch 参考示例。',
    author: 'PyTorch',
    platform: 'GitHub',
    difficulty: '进阶',
    url: 'https://github.com/pytorch/examples',
    conceptSlugs: [
      'pytorch-tensors-modules',
      'convolutional-neural-networks',
      'training-engineering',
    ],
    prerequisites: ['Python', 'PyTorch'],
    tags: ['GitHub', '官方', '包含代码', '包含实验'],
    recommendationLevel: 'A',
    github: {
      purpose: '运行和研究常见 PyTorch 模型示例',
      primaryLanguage: 'Python',
      includesDatasetOrExperiments: true,
      requiresExtraEnvironment: true,
    },
  }),
  resource({
    id: 'dl-tensorflow-playground',
    title: 'TensorFlow Playground',
    type: '交互式工具',
    category: 'deep-learning',
    subcategory: '神经网络',
    summary: '在浏览器中调整特征、隐藏层、激活函数和学习率，观察分类边界变化。',
    author: 'TensorFlow Team',
    platform: 'TensorFlow',
    difficulty: '入门',
    url: 'https://playground.tensorflow.org/',
    conceptSlugs: [
      'neural-networks',
      'activation-functions',
      'learning-rate-selection',
    ],
    tags: ['交互式', '适合入门'],
    recommendationLevel: 'B',
  }),
  resource({
    id: 'dl-attention-paper',
    title: 'Attention Is All You Need',
    type: '论文',
    category: 'deep-learning',
    subcategory: 'Transformer',
    summary:
      '提出完全基于注意力机制的 Transformer 架构，并用于序列建模和机器翻译。',
    author: 'Vaswani et al.',
    platform: 'arXiv / NeurIPS',
    difficulty: '挑战',
    url: 'https://arxiv.org/abs/1706.03762',
    conceptSlugs: ['transformer', 'embeddings-sequences'],
    prerequisites: ['神经网络', '序列模型', '概率'],
    tags: ['原始论文', '需要数学基础'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'dl-distill-feature-visualization',
    title: 'Feature Visualization',
    type: '技术文章',
    category: 'deep-learning',
    subcategory: '模型解释',
    summary: '通过优化输入和可视化神经元响应解释深度网络内部学到的特征。',
    author: 'Olah / Mordvintsev / Schubert',
    platform: 'Distill',
    difficulty: '挑战',
    url: 'https://distill.pub/2017/feature-visualization/',
    conceptSlugs: ['convolutional-neural-networks', 'model-debugging'],
    prerequisites: ['CNN', '梯度下降'],
    tags: ['技术文章', '可视化', '需要数学基础'],
    recommendationLevel: 'B',
  }),

  resource({
    id: 'rl-sutton-barto-book',
    title: 'Reinforcement Learning: An Introduction',
    type: '书籍',
    category: 'reinforcement-learning',
    subcategory: '强化学习基础',
    summary:
      '从多臂赌博机、MDP、动态规划、蒙特卡洛和 TD 方法建立强化学习理论主线。',
    author: 'Richard Sutton / Andrew Barto',
    platform: 'MIT Press',
    difficulty: '进阶',
    isFree: false,
    url: 'https://mitpress.mit.edu/9780262039246/reinforcement-learning/',
    conceptSlugs: [
      'reinforcement-learning-overview',
      'markov-decision-process',
      'td-learning',
    ],
    prerequisites: ['概率基础'],
    tags: ['经典教材', '推荐', '需要数学基础', '需要付费'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-spinning-up',
    title: 'Spinning Up in Deep RL',
    type: '技术文章',
    category: 'reinforcement-learning',
    subcategory: '深度强化学习',
    summary:
      '从术语、数学背景和算法分类进入 VPG、TRPO、PPO、DDPG、TD3 与 SAC。',
    author: 'OpenAI',
    platform: 'OpenAI',
    difficulty: '进阶',
    url: 'https://spinningup.openai.com/en/latest/',
    conceptSlugs: ['reinforcement-learning-overview', 'policy-gradient', 'ppo'],
    prerequisites: ['Python', '概率', '深度学习'],
    tags: ['技术文章', '包含代码', '可能过时'],
    recommendationLevel: 'A',
    notes: '适合作为教学资料；实现版本较早，生产代码需另行核对。',
  }),
  resource({
    id: 'rl-hf-course',
    title: 'Hugging Face Deep Reinforcement Learning Course',
    type: '视频课程',
    category: 'reinforcement-learning',
    subcategory: '深度强化学习',
    summary:
      '从 Q-Learning、DQN、Policy Gradient 和 Actor-Critic 逐步进入 PPO 与多智能体。',
    author: 'Hugging Face',
    platform: 'Hugging Face',
    difficulty: '入门',
    duration: '8+ 单元',
    url: 'https://huggingface.co/learn/deep-rl-course/en/unit0/introduction',
    conceptSlugs: ['q-learning', 'dqn', 'policy-gradient', 'ppo'],
    prerequisites: ['Python', 'PyTorch 基础'],
    tags: ['视频', '代码教程', '包含实验'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-david-silver-video',
    title: 'David Silver Reinforcement Learning Course',
    type: '视频',
    category: 'reinforcement-learning',
    subcategory: '强化学习理论',
    summary:
      '沿 MDP、动态规划、价值函数、TD、策略梯度和函数近似讲解经典强化学习。',
    author: 'David Silver',
    platform: 'Google DeepMind / YouTube',
    difficulty: '进阶',
    duration: '10 讲',
    url: 'https://www.youtube.com/watch?v=2pWv7GOvuf0',
    conceptSlugs: [
      'markov-decision-process',
      'value-q-function',
      'policy-gradient',
    ],
    prerequisites: ['概率基础', '线性代数'],
    tags: ['视频', '经典课程', '需要数学基础'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-dqn-paper',
    title: 'Playing Atari with Deep Reinforcement Learning',
    type: '论文',
    category: 'reinforcement-learning',
    subcategory: 'DQN',
    summary:
      '提出使用深度网络、经验回放和目标网络从像素输入学习 Atari 控制策略。',
    author: 'Mnih et al.',
    platform: 'arXiv',
    difficulty: '挑战',
    url: 'https://arxiv.org/abs/1312.5602',
    conceptSlugs: ['dqn', 'experience-replay-target-network'],
    prerequisites: ['Q-Learning', '神经网络'],
    tags: ['原始论文', '需要数学基础'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-ppo-paper',
    title: 'Proximal Policy Optimization Algorithms',
    type: '论文',
    category: 'reinforcement-learning',
    subcategory: 'PPO',
    summary:
      '提出基于概率比率裁剪的策略优化目标，限制单次更新幅度并复用 rollout。',
    author: 'Schulman et al.',
    platform: 'arXiv',
    difficulty: '挑战',
    url: 'https://arxiv.org/abs/1707.06347',
    conceptSlugs: ['ppo', 'actor-critic', 'gae'],
    prerequisites: ['策略梯度', 'Actor-Critic'],
    tags: ['原始论文', '推荐'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-cql-paper',
    title: 'Conservative Q-Learning for Offline Reinforcement Learning',
    type: '论文',
    category: 'reinforcement-learning',
    subcategory: 'Offline RL',
    summary:
      '在 Bellman 误差之外加入保守价值正则，降低固定数据外动作的乐观估计。',
    author: 'Kumar et al.',
    platform: 'arXiv / NeurIPS',
    difficulty: '挑战',
    url: 'https://arxiv.org/abs/2006.04779',
    conceptSlugs: ['cql', 'offline-data-distribution-shift'],
    prerequisites: ['DQN 或 SAC', 'Offline RL'],
    tags: ['原始论文', '需要数学基础'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-iql-paper',
    title: 'Offline Reinforcement Learning with Implicit Q-Learning',
    type: '论文',
    category: 'reinforcement-learning',
    subcategory: 'Offline RL',
    summary:
      '通过 expectile value、数据动作 TD 更新和优势加权行为克隆完成隐式策略改进。',
    author: 'Kostrikov / Nair / Levine',
    platform: 'arXiv',
    difficulty: '挑战',
    url: 'https://arxiv.org/abs/2110.06169',
    conceptSlugs: ['iql', 'behavior-policy-constraints'],
    prerequisites: ['Q Function', '行为克隆'],
    tags: ['原始论文', '需要数学基础'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-dpo-paper',
    title: 'Direct Preference Optimization',
    type: '论文',
    category: 'reinforcement-learning',
    subcategory: '偏好优化',
    summary:
      '把带参考策略约束的偏好优化转写为直接训练 chosen/rejected 概率差的目标。',
    author: 'Rafailov et al.',
    platform: 'arXiv / NeurIPS',
    difficulty: '挑战',
    url: 'https://arxiv.org/abs/2305.18290',
    conceptSlugs: ['dpo', 'reward-model-rlhf-rlaif-rft'],
    prerequisites: ['语言模型', '偏好数据'],
    tags: ['原始论文', '大模型对齐'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-grpo-paper',
    title: 'DeepSeekMath: Pushing the Limits of Mathematical Reasoning',
    type: '论文',
    category: 'reinforcement-learning',
    subcategory: 'GRPO',
    summary:
      '介绍 DeepSeekMath 训练流程及以组内相对奖励替代独立 Value Model 的 GRPO。',
    author: 'Shao et al.',
    platform: 'arXiv',
    difficulty: '挑战',
    url: 'https://arxiv.org/abs/2402.03300',
    conceptSlugs: ['grpo', 'ppo-grpo-dpo-comparison'],
    prerequisites: ['PPO', 'RLHF'],
    tags: ['原始论文', '大模型对齐'],
    recommendationLevel: 'A',
  }),
  resource({
    id: 'rl-cleanrl-github',
    title: 'vwxyzjn/cleanrl',
    type: 'GitHub 仓库',
    category: 'reinforcement-learning',
    subcategory: '算法实现',
    summary: '以单文件实现和实验报告呈现 DQN、PPO、SAC 等深度强化学习算法。',
    author: 'CleanRL Contributors',
    platform: 'GitHub',
    difficulty: '挑战',
    url: 'https://github.com/vwxyzjn/cleanrl',
    conceptSlugs: ['dqn', 'ppo', 'sac'],
    prerequisites: ['Python', 'PyTorch', 'Gymnasium'],
    tags: ['GitHub', '包含代码', '包含实验'],
    recommendationLevel: 'B',
    github: {
      purpose: '阅读可复现的单文件 RL 算法实现',
      primaryLanguage: 'Python',
      includesDatasetOrExperiments: true,
      requiresExtraEnvironment: true,
    },
  }),
  resource({
    id: 'rl-minari-github',
    title: 'Farama-Foundation/Minari',
    type: 'GitHub 仓库',
    category: 'reinforcement-learning',
    subcategory: 'Offline RL 数据集',
    summary: '为离线强化学习提供标准化数据集 API、数据集目录和数据收集工具。',
    author: 'Farama Foundation',
    platform: 'GitHub',
    difficulty: '进阶',
    url: 'https://github.com/Farama-Foundation/Minari',
    conceptSlugs: ['online-vs-offline-rl', 'offline-data-distribution-shift'],
    prerequisites: ['Gymnasium', 'Offline RL'],
    tags: ['GitHub', '数据集', '包含代码'],
    recommendationLevel: 'B',
    github: {
      purpose: '加载、创建和管理离线 RL 数据集',
      primaryLanguage: 'Python',
      includesDatasetOrExperiments: true,
      requiresExtraEnvironment: true,
    },
  }),
];

export interface ResourceFilters {
  query: string;
  category: CategorySlug | 'all';
  type: ResourceType | 'all';
  difficulty: Difficulty | 'all';
  language: ResourceLanguage | 'all';
  cost: 'all' | 'free' | 'paid';
  recommendation: RecommendationLevel | 'all';
  sort: 'recommendation' | 'updated';
}

export function filterResources(
  resources: LearningResource[],
  filters: ResourceFilters,
) {
  const query = filters.query.trim().toLowerCase();
  const rank: Record<RecommendationLevel, number> = { A: 0, B: 1, C: 2 };
  return resources
    .filter((item) => {
      const haystack = [
        item.title,
        item.summary,
        item.author,
        item.platform,
        item.subcategory,
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase();
      return (
        (!query || haystack.includes(query)) &&
        (filters.category === 'all' || item.category === filters.category) &&
        (filters.type === 'all' || item.type === filters.type) &&
        (filters.difficulty === 'all' ||
          item.difficulty === filters.difficulty) &&
        (filters.language === 'all' || item.language === filters.language) &&
        (filters.cost === 'all' ||
          (filters.cost === 'free' ? item.isFree : !item.isFree)) &&
        (filters.recommendation === 'all' ||
          item.recommendationLevel === filters.recommendation)
      );
    })
    .sort((a, b) =>
      filters.sort === 'updated'
        ? b.lastVerifiedAt.localeCompare(a.lastVerifiedAt)
        : rank[a.recommendationLevel] - rank[b.recommendationLevel] ||
          a.title.localeCompare(b.title, 'zh-CN'),
    );
}

export function resourcesForConcept(slug: string) {
  return learningResources
    .filter((resource) => resource.conceptSlugs.includes(slug))
    .sort((a, b) => a.recommendationLevel.localeCompare(b.recommendationLevel));
}

export function validateResourceLibrary(resources: LearningResource[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of resources) {
    if (ids.has(item.id)) errors.push(`重复资源 ID：${item.id}`);
    ids.add(item.id);
    if (!item.title || !item.summary || !item.author || !item.platform)
      errors.push(`${item.id} 缺少必要文本字段`);
    if (!item.url.startsWith('https://'))
      errors.push(`${item.id} 网址不是 HTTPS`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.lastVerifiedAt))
      errors.push(`${item.id} 最后验证时间格式不正确`);
    if (!item.conceptSlugs.length) errors.push(`${item.id} 没有关联概念`);
    if (item.type === 'GitHub 仓库' && !item.github)
      errors.push(`${item.id} 缺少 GitHub 元数据`);
  }
  return errors;
}
