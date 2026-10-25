export const aliases: Record<string, string> = {
  // Existing resource records used these names before the concepts were split.
  'mcp-architecture': 'mcp-client-server',
  'mcp-server': 'local-mcp-server',
  'mcp-tools-resources-prompts': 'mcp-client-server',
  'value-q-function': 'value-functions',
  'Python 基础': 'numpy-data-operations',
  '基础 Python': 'numpy-data-operations',
  '基本 Python': 'numpy-data-operations',
  高中数学: 'math-data-foundations',
  基础数学: 'math-data-foundations',
  线性代数: 'scalars-vectors-matrices',
  概率基础: 'probability-and-thresholds',
  概率: 'probability-and-thresholds',
  微积分: 'gradient-descent',
  '均值、方差与标准差': 'mean-variance-standard-deviation',
  '训练集、验证集和测试集': 'train-validation-test-split',
  '训练/验证/测试职责': 'train-validation-test-split',
  训练测试划分: 'train-validation-test-split',
  'NumPy 数组': 'numpy-data-operations',
  矩阵: 'scalars-vectors-matrices',
  向量: 'scalars-vectors-matrices',
  损失函数: 'loss-functions',
  神经网络: 'neural-networks',
  MDP: 'markov-decision-process',
  状态与奖励: 'state-action-reward',
  梯度下降: 'gradient-descent',
  交叉验证: 'cross-validation',
  Pipeline: 'sklearn-pipeline-column-transformer',
  标准化: 'numerical-standardization',
  决策树: 'decision-trees',
};

export function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[、，,/（）()\s·：:]/g, '');
}
