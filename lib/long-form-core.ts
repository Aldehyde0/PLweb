import type { CategorySlug, Concept, Difficulty } from './content-base';

export type CodeLanguage = 'Python' | 'NumPy' | 'scikit-learn' | 'PyTorch';
export interface FormulaEntry {
  label: string;
  expression: string;
  description: string;
}
export interface VariableDefinition {
  symbol: string;
  meaning: string;
}
export interface NumericalExample {
  title: string;
  given: string[];
  steps: string[];
  result: string;
  comparison: string[];
}
export interface CodeExample {
  title: string;
  language: CodeLanguage;
  purpose: string;
  source: string;
  explanation: string[];
  expectedOutput: string;
}
export interface SourceDocument {
  path: string;
  title: string;
  kind: '原始文档' | '扩展资料';
}

export interface LongFormConcept {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  difficulty: Difficulty;
  summary: string;
  definition: string[];
  background: string[];
  intuition: string[];
  corePrinciple: string[];
  formulas: FormulaEntry[];
  variableDefinitions: VariableDefinition[];
  numericalExample?: NumericalExample;
  algorithmSteps: string[];
  codeExamples: CodeExample[];
  codeExplanation: string[];
  applications: string[];
  pitfalls: string[];
  prerequisites: string[];
  relatedConcepts: string[];
  sourceDocuments: SourceDocument[];
  sourceSections: string[];
  extensionNotes: string[];
}

export const longFormConcepts: LongFormConcept[] = [
  {
    id: 'numerical-standardization',
    slug: 'numerical-standardization',
    title: '数值标准化（Z-score）',
    category: 'machine-learning',
    difficulty: '入门',
    summary:
      '使用训练集均值和标准差把不同量纲的数值特征转换到均值约为 0、标准差约为 1 的尺度。',
    definition: [
      '数值标准化是对每一列数值特征分别做中心化与尺度缩放：先减去该特征在训练集中的均值，再除以训练集标准差。',
      '标准化后的数值不再保留原单位，而表示“当前值距离训练集均值多少个标准差”。例如 z=1.5 表示该值比训练集均值高 1.5 个标准差。',
    ],
    background: [
      '真实数据的特征量纲经常不同。房屋面积可能是数百平方米，卧室数量只有个位数；Wine 数据中的 hue 约为 0～2，而 proline 可达到数百至上千。',
      '如果直接计算欧氏距离，大尺度特征会主导 KNN、K-Means 等算法；如果直接做梯度下降，损失等高线会变得狭长，不同参数方向的梯度尺度悬殊，更新容易震荡或迫使学习率非常小。',
      'L1/L2 正则化直接惩罚权重大小。若特征单位差异很大，相同预测贡献需要完全不同的权重，正则化会因为单位而不公平地压制某些特征。',
    ],
    intuition: [
      '可以把标准化理解为给每个特征换一把统一的尺子。原来“平方米”“万元”“次数”无法直接比较，转换后都用“距离自己的平均水平几个标准差”来描述。',
      '它不会让所有特征拥有相同分布，也不会自动消除偏态和异常值；它只统一中心与典型波动尺度。',
    ],
    corePrinciple: [
      '对第 j 个特征，只使用训练集的 m 个样本计算均值 μⱼ 和总体标准差 σⱼ。之后训练集、验证集、测试集以及未来线上样本都复用同一组 μⱼ、σⱼ。',
      '训练阶段的 fit 学习均值和标准差；transform 只应用已经学到的参数。验证集和测试集绝不能再次 fit，否则评价数据的整体分布会进入模型流程，形成数据泄漏。',
      '标准化通常适用于 KNN、K-Means、SVM、PCA、线性/逻辑回归及其正则化版本、神经网络。决策树、随机森林和梯度提升树主要比较单特征阈值，线性缩放不改变样本相对顺序，因此通常不要求标准化。',
    ],
    formulas: [
      {
        label: '训练集均值',
        expression: 'μⱼ = (1/m) Σᵢ₌₁ᵐ xⱼ⁽ⁱ⁾',
        description:
          '对训练集中第 j 列的 m 个数值求平均，描述该特征的中心位置。',
      },
      {
        label: '训练集总体标准差',
        expression: 'σⱼ = √[(1/m) Σᵢ₌₁ᵐ (xⱼ⁽ⁱ⁾ - μⱼ)²]',
        description:
          '描述训练集第 j 个特征围绕均值的典型波动大小。StandardScaler 使用总体方差约定。',
      },
      {
        label: 'Z-score 变换',
        expression: 'zⱼ⁽ⁱ⁾ = (xⱼ⁽ⁱ⁾ - μⱼ) / σⱼ',
        description:
          '先中心化，再按标准差缩放。若 σⱼ=0，说明该列是常量特征，需要删除或单独处理。',
      },
      {
        label: '逆变换',
        expression: 'xⱼ⁽ⁱ⁾ = zⱼ⁽ⁱ⁾σⱼ + μⱼ',
        description: '需要回到原始单位时，可以用保存的均值和标准差还原。',
      },
    ],
    variableDefinitions: [
      {
        symbol: 'm',
        meaning: '训练集样本数量。验证集和测试集样本不参与统计。',
      },
      { symbol: 'j', meaning: '特征列编号，每一列独立计算自己的参数。' },
      { symbol: 'xⱼ⁽ⁱ⁾', meaning: '第 i 个样本在第 j 个特征上的原始值。' },
      { symbol: 'μⱼ', meaning: '第 j 个特征在训练集中的均值。' },
      { symbol: 'σⱼ', meaning: '第 j 个特征在训练集中的总体标准差。' },
      {
        symbol: 'zⱼ⁽ⁱ⁾',
        meaning: '标准化后的数值，表示相对训练均值的标准差距离。',
      },
    ],
    numericalExample: {
      title: '对训练特征 [50, 60, 70] 手工标准化',
      given: [
        '训练集某特征：50、60、70',
        '验证集同一特征：80',
        '使用总体标准差，即分母为 m=3',
      ],
      steps: [
        '均值 μ=(50+60+70)/3=60。',
        '平方偏差分别为 (50-60)²=100、(60-60)²=0、(70-60)²=100。',
        '总体方差为 (100+0+100)/3=66.667，标准差 σ≈8.165。',
        '训练集 Z-score 约为 [-1.225, 0, 1.225]。',
        '验证值 80 必须复用训练参数：z=(80-60)/8.165≈2.449，不能用验证集重新计算均值。',
      ],
      result:
        '训练列从原单位 [50,60,70] 变为无单位的 [-1.225,0,1.225]，均值约 0、总体标准差约 1。验证值 80 表示比训练均值高约 2.449 个标准差。',
      comparison: [
        '标准化前：数值保留原单位，中心在 60，尺度约 8.165。',
        '标准化后：中心约为 0，尺度约为 1，大小顺序不变。',
        '标准化不会限制范围；80 被转换为 2.449，完全可以大于 1。',
      ],
    },
    algorithmSteps: [
      '先按真实使用场景划分训练集、验证集和测试集。',
      '只在训练集上检查缺失值和常量列。缺失值应先按 Pipeline 中约定方式处理。',
      '对训练集每一列计算并保存均值与标准差，即执行 scaler.fit(X_train)。',
      '使用保存的参数转换训练集，即 scaler.transform(X_train)。',
      '对验证集、测试集和未来数据只调用 transform，不再重新拟合。',
      '把 StandardScaler 与需要缩放的模型放在同一个 Pipeline 中，使每个交叉验证训练折独立拟合参数。',
      '记录特征顺序和列名；部署时必须以相同结构输入。',
    ],
    codeExamples: [
      {
        title: '使用 NumPy 手工实现训练集标准化',
        language: 'NumPy',
        purpose:
          '直接观察均值、标准差、广播、验证集复用参数和逆变换之间的关系。',
        source: `import numpy as np\n\nX_train = np.array([[50.0], [60.0], [70.0]])\nX_valid = np.array([[80.0]])\n\n# 只能使用训练集计算参数；axis=0 表示逐列统计。\nmean = X_train.mean(axis=0)\nstd = X_train.std(axis=0)\n\nif np.any(std == 0):\n    raise ValueError("存在标准差为 0 的常量特征")\n\nX_train_scaled = (X_train - mean) / std\nX_valid_scaled = (X_valid - mean) / std\nX_train_restored = X_train_scaled * std + mean\n\nprint("mean:", mean.round(3))\nprint("std:", std.round(3))\nprint("train scaled:", X_train_scaled.ravel().round(3))\nprint("valid scaled:", X_valid_scaled.ravel().round(3))\nprint("restored:", X_train_restored.ravel().round(3))`,
        explanation: [
          'mean 与 std 的形状是 [特征数]，NumPy 通过广播把它们应用到每一行。',
          '验证集使用训练参数，因此它相对训练分布的位置得到真实保留。',
          '逆变换验证标准化没有丢失原始数值信息（浮点误差除外）。',
        ],
        expectedOutput:
          'mean: [60.]；std: [8.165]；train scaled: [-1.225 0. 1.225]；valid scaled: [2.449]；restored: [50. 60. 70.]',
      },
      {
        title: 'StandardScaler 与 Pipeline 的正确用法',
        language: 'scikit-learn',
        purpose:
          '把标准化和逻辑回归放进同一条防泄漏流程，并展示训练、验证、测试的职责。',
        source: `from sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y\n)\n\nmodel = make_pipeline(\n    StandardScaler(),\n    LogisticRegression(max_iter=2000),\n)\n\n# Pipeline 内部：scaler.fit(X_train)，然后训练分类器。\nmodel.fit(X_train, y_train)\n\n# 测试阶段只 transform 和 predict，不会重新拟合 scaler。\nprint("test accuracy:", model.score(X_test, y_test))\n\nscaler = model.named_steps["standardscaler"]\nprint("training means:", scaler.mean_)\nprint("training scales:", scaler.scale_)`,
        explanation: [
          'fit 只接收 X_train、y_train，所以 scaler.mean_ 和 scaler.scale_ 不含测试集信息。',
          '在交叉验证中使用完整 Pipeline，每一折都会只用该折训练部分拟合 StandardScaler。',
          '保存 Pipeline 时，缩放参数会和分类器一起保存，避免推理遗漏预处理。',
        ],
        expectedOutput:
          '输出一个 0～1 之间的测试准确率，以及长度等于特征数的 training means 和 training scales。具体分数取决于数据集。',
      },
    ],
    codeExplanation: [
      'NumPy 示例对应公式本身，适合检查 axis、广播和逆变换。',
      'scikit-learn 示例对应真实项目边界：StandardScaler 不是独立提前运行，而是 Pipeline 的一部分。',
      '示例只展示和复制代码，不在网页中执行。',
    ],
    applications: [
      'KNN 和 K-Means 的距离计算',
      'SVM 的间隔和 RBF 核',
      '带正则化的线性/逻辑回归',
      'PCA 主成分分析',
      '神经网络梯度优化',
      '不同量纲连续特征的统一处理',
    ],
    pitfalls: [
      '先对完整数据 fit_transform，再划分训练集和测试集。',
      '对验证集或测试集再次调用 fit 或 fit_transform。',
      '认为标准化会把数据限制到 [0,1]；这是 Min-Max 缩放的典型目标，不是 Z-score。',
      '忽略标准差为 0 的常量列，导致除零。',
      '存在强异常值时仍机械使用均值和标准差；异常值会显著改变两者。',
      '对 One-Hot 列、类别编号或树模型不加区分地全部标准化。',
      '训练与线上输入列顺序不一致，导致把某列的均值和标准差应用到另一列。',
      '认为标准化可以修复偏态、错误单位、缺失值或数据泄漏；它不能替代数据质量处理。',
    ],
    prerequisites: [
      '标量、向量和矩阵',
      '均值、方差与标准差',
      '训练集、验证集和测试集',
      'NumPy 的 axis 与广播',
      'fit 与 transform 的区别',
    ],
    relatedConcepts: [
      'mean-variance-standard-deviation',
      'euclidean-distance',
      'preprocessing-fit-transform-boundary',
      'min-max-scaling',
      'robust-scaling-and-outliers',
      'sklearn-pipeline-column-transformer',
      'data-leakage',
    ],
    sourceDocuments: [
      {
        path: '学习资料/learning_tech/02_preprocessing_feature_engineering.md',
        title: '02｜数据预处理与特征工程',
        kind: '原始文档',
      },
      {
        path: '学习资料/learning_tech/01_math_data_foundations.md',
        title: '01｜数学与数据基础',
        kind: '原始文档',
      },
      {
        path: '学习资料/learning_tech/11_l1_regularization.md',
        title: '11｜L1 正则化：稀疏模型与特征选择',
        kind: '原始文档',
      },
    ],
    sourceSections: [
      '02 / §1 先划分，再学习预处理参数',
      '02 / §5 数值标准化与特征缩放',
      '02 / §12 使用 Pipeline 防止泄漏',
      '01 / §3 均值、方差和标准差',
      '01 / §5.2 为什么距离模型需要标准化',
      '11 / §5 使用 L1 前为什么要标准化',
    ],
    extensionNotes: [],
  },
];

const mapLanguage = (language: CodeLanguage): 'Python' | 'NumPy' | 'PyTorch' =>
  language === 'NumPy'
    ? 'NumPy'
    : language === 'PyTorch'
      ? 'PyTorch'
      : 'Python';
export const documentConcepts: Concept[] = longFormConcepts.map((item) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  category: item.category,
  difficulty: item.difficulty,
  summary: item.summary,
  prerequisites: item.prerequisites,
  explanation: item.intuition.join(' '),
  principle: item.corePrinciple.join(' '),
  formula: {
    expression: item.formulas[0]?.expression ?? '—',
    description: item.formulas[0]?.description ?? '—',
  },
  workflow: item.algorithmSteps,
  code: {
    language: mapLanguage(item.codeExamples[0]?.language ?? 'Python'),
    source: item.codeExamples[0]?.source ?? '# 本概念不需要代码',
    highlights: item.codeExamples[0]?.explanation ?? [],
  },
  codeExplanation: item.codeExplanation.join(' '),
  applications: item.applications,
  pitfalls: item.pitfalls,
  relatedConcepts: item.relatedConcepts,
}));

export const longFormMap = Object.fromEntries(
  longFormConcepts.map((item) => [item.slug, item]),
) as Record<string, LongFormConcept>;
