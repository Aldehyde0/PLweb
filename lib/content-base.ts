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
    description: '理解让机器表现出感知、推理、规划与生成能力的基本思想。',
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

const shared = {
  prerequisites: ['Python 基础', '高中数学'],
  applications: ['理解现代 AI 系统', '建立后续学习框架'],
  pitfalls: ['只记术语而忽略问题设定', '把模型效果等同于真正理解'],
  relatedConcepts: [] as string[],
};

export const concepts: Concept[] = [
  {
    ...shared,
    id: 'ai-overview',
    slug: 'ai-overview',
    title: '人工智能概述',
    category: 'artificial-intelligence',
    difficulty: '入门',
    summary: '人工智能是让机器完成通常需要人类智能的感知、推理与决策任务。',
    explanation:
      '把 AI 想成一个工具箱：搜索负责找路，知识表示负责保存常识，学习算法从经验中改进，生成模型负责创造新内容。',
    principle:
      'AI 系统通常把现实问题抽象为输入、内部表示、求解过程与输出，再用规则、搜索或数据驱动模型完成映射。',
    formula: {
      expression: '智能行为 = 感知 + 表示 + 推理/学习 + 行动',
      description: '这不是严格数学等式，而是理解 AI 系统组成的结构化框架。',
    },
    workflow: [
      '明确任务与成功标准',
      '选择知识或数据表示',
      '使用搜索、规则或学习算法',
      '评估输出并迭代',
    ],
    code: {
      language: 'Python',
      source: `def intelligent_agent(observation):\n    if observation == "obstacle":\n        return "turn_left"\n    return "move_forward"\n\nprint(intelligent_agent("obstacle"))`,
      highlights: ['函数把观察映射为行动', '规则系统是最简单的智能体形式'],
    },
    codeExplanation:
      '示例展示最小的“感知—决策—行动”闭环。真实 AI 会用更丰富的状态和学习模型替代手写规则。',
    relatedConcepts: ['state-space-search', 'knowledge-representation'],
  },
  {
    ...shared,
    id: 'state-space-search',
    slug: 'state-space-search',
    title: '状态空间搜索',
    category: 'artificial-intelligence',
    difficulty: '入门',
    summary: '把问题表示成状态和动作，在可能路径中寻找通往目标的方案。',
    explanation:
      '像在迷宫中找出口：每个位置是状态，每次移动是动作，搜索算法决定先探索哪条路。',
    principle:
      '广度优先搜索按层扩展节点，在边代价相同的图上可以找到步数最少的解。',
    formula: {
      expression: 'b^0 + b^1 + … + b^d = O(b^d)',
      description: 'b 是分支因子，d 是最浅解深度，说明搜索空间会指数增长。',
    },
    workflow: [
      '建立初始状态队列',
      '取出最早加入的状态',
      '扩展未访问邻居',
      '遇到目标后回溯路径',
    ],
    code: {
      language: 'Python',
      source: `from collections import deque\n\ndef bfs(graph, start, goal):\n    queue = deque([(start, [start])])\n    visited = {start}\n    while queue:\n        node, path = queue.popleft()\n        if node == goal:\n            return path\n        for nxt in graph[node]:\n            if nxt not in visited:\n                visited.add(nxt)\n                queue.append((nxt, path + [nxt]))`,
      highlights: ['deque 保证先进先出', 'visited 防止在环中重复搜索'],
    },
    codeExplanation:
      '队列保存当前节点及其完整路径。先进入队列的浅层节点会先被探索，因此得到最短步数路径。',
    applications: ['路径规划', '游戏求解', '任务调度'],
    pitfalls: ['忘记处理重复状态', '把最少步数误认为最低代价'],
    relatedConcepts: ['ai-overview', 'markov-decision-process'],
  },
  {
    ...shared,
    id: 'knowledge-representation',
    slug: 'knowledge-representation',
    title: '知识表示',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    summary: '用机器可操作的结构表达实体、属性、关系与规则。',
    explanation:
      '人知道“猫是动物，动物需要呼吸”。知识表示把这些事实整理成机器能查询和推理的图或规则。',
    principle:
      '语义网络用节点表示实体或概念，用有方向的边表示关系；规则系统则通过前提推出结论。',
    formula: {
      expression: 'Cat(x) → Animal(x)',
      description: '若 x 是猫，则可以推出 x 是动物。',
    },
    workflow: [
      '定义领域实体',
      '建立关系和属性',
      '编码事实与规则',
      '执行查询或逻辑推理',
    ],
    code: {
      language: 'Python',
      source: `facts = {"猫": {"is_a": "动物"}, "动物": {"needs": "呼吸"}}\n\ndef inherit(entity, relation):\n    current = entity\n    while current in facts:\n        if relation in facts[current]:\n            return facts[current][relation]\n        current = facts[current].get("is_a")\n\nprint(inherit("猫", "needs"))`,
      highlights: ['沿 is_a 关系继承属性', '字典模拟一个最小知识图谱'],
    },
    codeExplanation:
      '程序沿着类别层级向上查找属性，体现了知识继承。工业知识图谱会提供更严格的模式、查询语言和一致性约束。',
    applications: ['知识图谱', '专家系统', '语义搜索'],
    pitfalls: ['把事实存储当成完整推理', '忽略知识的不确定性与时效性'],
    relatedConcepts: ['ai-overview', 'generative-ai'],
  },
  {
    ...shared,
    id: 'generative-ai',
    slug: 'generative-ai',
    title: '生成式人工智能',
    category: 'artificial-intelligence',
    difficulty: '入门',
    summary: '学习数据分布，并从中采样生成新的文本、图像、音频或代码。',
    explanation:
      '生成模型像读过许多例子的创作者：它不直接复制某一个样本，而是学习常见模式并组合出新的结果。',
    principle:
      '自回归模型把复杂序列的联合概率拆成逐个预测下一个元素的条件概率。',
    formula: {
      expression: 'P(x₁…xₙ) = ∏ᵢ P(xᵢ | x₁…xᵢ₋₁)',
      description: '整个序列的概率等于每一步条件概率的乘积。',
    },
    workflow: [
      '收集并清理训练数据',
      '学习数据分布参数',
      '根据上下文预测概率',
      '按采样策略生成内容',
    ],
    code: {
      language: 'Python',
      source: `import random\n\nnext_word = {\n    "人工智能": ["正在", "可以"],\n    "正在": ["改变", "学习"],\n}\ntext = ["人工智能"]\nfor _ in range(2):\n    choices = next_word.get(text[-1], ["未来"] )\n    text.append(random.choice(choices))\nprint("".join(text))`,
      highlights: ['词表保存简化条件分布', '采样让输出具有多样性'],
    },
    codeExplanation:
      '这是极简的词级生成器：只看前一个词并随机选择下一个词。大模型使用 Transformer 和大规模参数学习更长上下文。',
    applications: ['内容创作', '代码补全', '智能检索'],
    pitfalls: ['认为生成内容天然正确', '混淆流畅度与事实可靠性'],
    relatedConcepts: ['transformer', 'knowledge-representation'],
  },
  {
    ...shared,
    id: 'supervised-learning',
    slug: 'supervised-learning',
    title: '监督学习',
    category: 'machine-learning',
    difficulty: '入门',
    summary: '从带标签样本中学习输入到目标的映射。',
    explanation: '像带答案练习：模型看过许多“题目—答案”对，再尝试回答新题。',
    principle:
      '选择参数化函数，用训练样本上的损失衡量预测误差，并通过优化降低平均损失。',
    formula: {
      expression: 'θ* = argminθ (1/n) Σ L(fθ(xᵢ), yᵢ)',
      description: '寻找使平均训练损失最小的模型参数 θ。',
    },
    workflow: [
      '准备带标签数据',
      '拆分训练与验证集',
      '训练模型降低损失',
      '在未见数据上评估',
    ],
    code: {
      language: 'Python',
      source: `from sklearn.linear_model import LogisticRegression\n\nX = [[0], [1], [2], [3]]\ny = [0, 0, 1, 1]\nmodel = LogisticRegression().fit(X, y)\nprint(model.predict([[2.5]]))`,
      highlights: ['fit 使用带标签样本学习', 'predict 对新输入进行分类'],
    },
    codeExplanation:
      '逻辑回归从四个带标签样本中学习分类边界，并判断新样本 2.5 更接近哪一类。',
    applications: ['垃圾邮件识别', '图像分类', '销量预测'],
    pitfalls: ['训练集准确不代表泛化好', '标签质量会限制模型上限'],
    relatedConcepts: ['linear-regression', 'overfitting-regularization'],
  },
  {
    ...shared,
    id: 'unsupervised-learning',
    slug: 'unsupervised-learning',
    title: '无监督学习',
    category: 'machine-learning',
    difficulty: '入门',
    summary: '在没有人工标签的数据中发现结构、分组或低维表示。',
    explanation:
      '把一盒没有说明书的积木按相似性自动分组，模型只依据数据之间的距离和分布。',
    principle:
      'K-Means 交替执行样本分配与中心更新，使样本到所属簇中心的平方距离总和尽量小。',
    formula: {
      expression: 'J = Σᵢ ||xᵢ - μcᵢ||²',
      description: '目标是让每个样本靠近它所属簇的中心 μ。',
    },
    workflow: [
      '选择表示和相似度',
      '初始化簇中心',
      '分配样本到最近中心',
      '更新中心直到稳定',
    ],
    code: {
      language: 'NumPy',
      source: `import numpy as np\n\nX = np.array([[1,1], [1,2], [8,8], [9,8]])\ncenters = np.array([[1,1], [8,8]], dtype=float)\nfor _ in range(5):\n    labels = ((X[:, None] - centers) ** 2).sum(2).argmin(1)\n    centers = np.array([X[labels == k].mean(0) for k in range(2)])\nprint(labels, centers)`,
      highlights: ['广播计算样本到所有中心的距离', '按标签重新计算均值'],
    },
    codeExplanation:
      '代码手写了 K-Means 的两步迭代。真实任务还需处理初始化、空簇与簇数选择。',
    applications: ['用户分群', '异常检测', '降维可视化'],
    pitfalls: ['簇不一定对应真实类别', '距离尺度会改变结果'],
    relatedConcepts: ['supervised-learning', 'overfitting-regularization'],
  },
  {
    ...shared,
    id: 'linear-regression',
    slug: 'linear-regression',
    title: '线性回归',
    category: 'machine-learning',
    difficulty: '入门',
    summary: '用输入特征的加权和预测连续数值。',
    explanation: '画一条最贴近数据点的直线，用它估计趋势和未来数值。',
    principle: '最小二乘法选择权重，使预测值与真实值之间的平方误差之和最小。',
    formula: {
      expression: 'ŷ = wᵀx + b,  MSE = (1/n)Σ(ŷ-y)²',
      description: '线性模型产生预测，均方误差衡量偏离程度。',
    },
    workflow: ['构造特征矩阵', '计算预测值', '求均方误差', '更新权重直到收敛'],
    code: {
      language: 'NumPy',
      source: `import numpy as np\n\nX = np.array([1., 2., 3., 4.])\ny = np.array([2.2, 3.9, 6.1, 8.0])\nA = np.c_[X, np.ones_like(X)]\nw, b = np.linalg.lstsq(A, y, rcond=None)[0]\nprint(w, b, w * 5 + b)`,
      highlights: ['增加常数列以同时求偏置', 'lstsq 求最小二乘解'],
    },
    codeExplanation:
      '矩阵 A 的第一列是输入，第二列是常数 1。最小二乘一次求出斜率和截距。',
    applications: ['价格预测', '趋势分析', '变量关系解释'],
    pitfalls: ['相关性不代表因果', '异常值会显著影响平方误差'],
    relatedConcepts: ['supervised-learning', 'loss-functions'],
  },
  {
    ...shared,
    id: 'overfitting-regularization',
    slug: 'overfitting-regularization',
    title: '过拟合与正则化',
    category: 'machine-learning',
    difficulty: '进阶',
    summary: '过拟合是记住训练噪声；正则化通过约束复杂度改善泛化。',
    explanation:
      '像把练习题答案背下来，却不会做新题。正则化要求模型用更简单稳定的规律作答。',
    principle:
      '在数据损失之外加入参数惩罚，控制模型自由度，在偏差与方差之间取得平衡。',
    formula: {
      expression: 'J(θ) = Ldata(θ) + λ||θ||²₂',
      description: 'λ 决定拟合训练数据与限制参数大小之间的权衡。',
    },
    workflow: [
      '观察训练/验证误差差距',
      '选择正则化方法',
      '用验证集调整强度',
      '在测试集确认泛化',
    ],
    code: {
      language: 'Python',
      source: `from sklearn.linear_model import Ridge\n\nmodel = Ridge(alpha=1.0)\nmodel.fit([[1], [2], [3]], [1.2, 1.9, 3.4])\nprint(model.coef_)`,
      highlights: ['Ridge 使用 L2 正则化', 'alpha 越大约束通常越强'],
    },
    codeExplanation:
      'Ridge 在线性回归损失中加入权重平方惩罚，减少参数对少量训练样本的过度适配。',
    applications: ['小样本建模', '高维特征选择', '稳定模型参数'],
    pitfalls: ['正则越强不一定越好', '用测试集调参会造成信息泄漏'],
    relatedConcepts: ['supervised-learning', 'loss-functions'],
  },
];

const more: Concept[] = [
  {
    id: 'neural-networks',
    slug: 'neural-networks',
    title: '神经网络',
    category: 'deep-learning',
    difficulty: '入门',
    summary: '神经网络通过多层可学习变换逐步提取数据表示。',
    explanation:
      '每一层像一组可调节的过滤器，把原始输入逐步变成更适合任务的特征。',
    principle: '线性变换与非线性激活交替堆叠，使模型能表达复杂函数。',
    formula: {
      expression: 'h = σ(Wx + b)',
      description: '权重 W 和偏置 b 完成线性变换，σ 引入非线性。',
    },
    workflow: [
      '输入特征',
      '逐层线性变换',
      '应用激活函数',
      '输出预测并计算损失',
    ],
    code: {
      language: 'PyTorch',
      source: `import torch\nfrom torch import nn\n\nmodel = nn.Sequential(\n    nn.Linear(4, 8),\n    nn.ReLU(),\n    nn.Linear(8, 2),\n)\nprint(model(torch.randn(1, 4)))`,
      highlights: ['Sequential 串联网络层', '最后一层输出两个数值'],
    },
    codeExplanation:
      '第一层把 4 维输入映射到 8 维隐藏表示，ReLU 加入非线性，输出层产生两个得分。',
    prerequisites: ['线性代数', 'Python 基础'],
    applications: ['分类与回归', '表征学习'],
    pitfalls: ['层数多不等于效果好', '忽略数据尺度'],
    relatedConcepts: ['activation-functions', 'backpropagation'],
  },
  {
    id: 'activation-functions',
    slug: 'activation-functions',
    title: '激活函数',
    category: 'deep-learning',
    difficulty: '入门',
    summary: '激活函数为网络加入非线性，决定神经元如何传递信号。',
    explanation:
      '如果每层都只是线性变换，叠再多层也仍是一条直线；激活函数让网络能够弯曲。',
    principle:
      'ReLU 保留正输入并截断负输入，计算简单且能缓解深层网络的梯度衰减。',
    formula: {
      expression: 'ReLU(x) = max(0, x)',
      description: '负值输出 0，正值保持不变。',
    },
    workflow: [
      '接收线性层输出',
      '逐元素计算激活',
      '把结果送入下一层',
      '反向传播局部梯度',
    ],
    code: {
      language: 'PyTorch',
      source: `import torch\n\nx = torch.tensor([-2., -0.5, 0., 3.])\ny = torch.relu(x)\nprint(y)`,
      highlights: ['torch.relu 逐元素工作', '正输入的梯度为 1'],
    },
    codeExplanation:
      '输出为 [0, 0, 0, 3]。在负半轴 ReLU 不激活，在正半轴直接传递信号。',
    prerequisites: ['函数与导数'],
    applications: ['深层神经网络', '稀疏特征学习'],
    pitfalls: ['ReLU 可能产生死亡神经元', '所有任务都用同一输出激活'],
    relatedConcepts: ['neural-networks', 'backpropagation'],
  },
  {
    id: 'loss-functions',
    slug: 'loss-functions',
    title: '损失函数',
    category: 'deep-learning',
    difficulty: '入门',
    summary: '损失函数把预测质量转成一个可优化的标量。',
    explanation: '它像模型的评分规则：分数越差，优化器就越需要调整参数。',
    principle:
      '不同任务需要匹配概率假设的损失；分类常用交叉熵，回归常用均方误差。',
    formula: {
      expression: 'CE = -Σ yᵢ log pᵢ',
      description: '交叉熵惩罚模型给正确类别分配过低概率。',
    },
    workflow: [
      '模型输出 logits',
      '转换或直接计算损失',
      '对批次求平均',
      '反向传播损失梯度',
    ],
    code: {
      language: 'PyTorch',
      source: `import torch\nfrom torch import nn\n\nlogits = torch.tensor([[2.0, 0.4, -1.0]])\ntarget = torch.tensor([0])\nloss = nn.CrossEntropyLoss()(logits, target)\nprint(loss.item())`,
      highlights: ['CrossEntropyLoss 接收原始 logits', '目标使用类别索引'],
    },
    codeExplanation:
      '正确类别是索引 0，它的 logit 最大，因此损失较小。函数内部完成 softmax 与对数计算。',
    prerequisites: ['概率基础', '神经网络'],
    applications: ['模型训练目标', '模型比较'],
    pitfalls: ['对 logits 重复做 softmax', '只看损失不看业务指标'],
    relatedConcepts: ['backpropagation', 'linear-regression'],
  },
  {
    id: 'backpropagation',
    slug: 'backpropagation',
    title: '反向传播',
    category: 'deep-learning',
    difficulty: '进阶',
    summary: '反向传播用链式法则高效计算每个参数对损失的影响。',
    explanation: '像从最终误差倒查每个环节的责任，再按责任大小调整旋钮。',
    principle: '计算图保存局部运算，反向阶段从损失开始逐节点乘上局部导数。',
    formula: {
      expression: '∂L/∂x = (∂L/∂y)(∂y/∂x)',
      description: '链式法则把下游梯度与当前操作的局部梯度相乘。',
    },
    workflow: [
      '前向计算并记录图',
      '从损失初始化梯度',
      '沿计算图反向传播',
      '优化器更新参数',
    ],
    code: {
      language: 'PyTorch',
      source: `import torch\n\nw = torch.tensor(2.0, requires_grad=True)\nx = torch.tensor(3.0)\nloss = (w * x - 5) ** 2\nloss.backward()\nprint(w.grad)`,
      highlights: ['requires_grad 开启梯度跟踪', 'backward 累积参数梯度'],
    },
    codeExplanation:
      '预测是 6，误差平方为 1；对 w 的梯度是 2(6-5)×3=6，PyTorch 自动得到相同结果。',
    prerequisites: ['微积分', '损失函数'],
    applications: ['训练神经网络', '可微分编程'],
    pitfalls: ['忘记清空累计梯度', '原地操作破坏计算图'],
    relatedConcepts: ['loss-functions', 'neural-networks'],
  },
  {
    id: 'convolutional-neural-networks',
    slug: 'convolutional-neural-networks',
    title: '卷积神经网络',
    category: 'deep-learning',
    difficulty: '进阶',
    summary: '卷积神经网络用共享局部滤波器提取空间模式。',
    explanation: '同一个小窗口在图像上滑动，寻找边缘、纹理，再逐层组合成物体。',
    principle: '局部连接减少参数，共享卷积核让相同模式可以在不同位置被识别。',
    formula: {
      expression: 'Y[i,j] = ΣₘΣₙ K[m,n]X[i+m,j+n]',
      description: '卷积核 K 在输入局部窗口上做加权求和。',
    },
    workflow: [
      '输入图像张量',
      '卷积提取局部特征',
      '激活与下采样',
      '高层特征用于预测',
    ],
    code: {
      language: 'PyTorch',
      source: `import torch\nfrom torch import nn\n\nconv = nn.Conv2d(3, 16, kernel_size=3, padding=1)\nimage = torch.randn(1, 3, 32, 32)\nfeatures = conv(image)\nprint(features.shape)`,
      highlights: ['3 个输入通道映射为 16 个特征图', 'padding 保持空间尺寸'],
    },
    codeExplanation:
      '一个 32×32 的 RGB 图像经过 16 个卷积核，得到 16 张同尺寸特征图。',
    prerequisites: ['神经网络', '矩阵运算'],
    applications: ['图像分类', '目标检测', '医学影像'],
    pitfalls: ['混淆通道与空间维度', '忽略感受野大小'],
    relatedConcepts: ['neural-networks', 'transformer'],
  },
  {
    id: 'transformer',
    slug: 'transformer',
    title: 'Transformer',
    category: 'deep-learning',
    difficulty: '挑战',
    summary: 'Transformer 用注意力机制让序列中的元素直接交换信息。',
    explanation:
      '阅读一句话时，每个词都可以按需要“关注”其他词，而不必只沿固定顺序传递信息。',
    principle: '缩放点积注意力用查询与键的相似度计算权重，再对值向量加权汇总。',
    formula: {
      expression: 'Attention(Q,K,V)=softmax(QKᵀ/√dₖ)V',
      description: '除以维度平方根可防止点积过大导致 softmax 饱和。',
    },
    workflow: [
      '词元转为向量',
      '生成 Q/K/V',
      '计算注意力权重',
      '残差连接与前馈变换',
    ],
    code: {
      language: 'PyTorch',
      source: `import torch\nfrom torch import nn\n\nattention = nn.MultiheadAttention(32, 4, batch_first=True)\nx = torch.randn(2, 6, 32)\ny, weights = attention(x, x, x)\nprint(y.shape, weights.shape)`,
      highlights: ['自注意力中 Q/K/V 都来自 x', '4 个注意力头并行建模关系'],
    },
    codeExplanation:
      '批次含 2 个长度为 6 的序列，每个词元 32 维。输出保持形状，权重描述词元间的关注程度。',
    prerequisites: ['神经网络', '线性代数', '概率基础'],
    applications: ['大语言模型', '视觉模型', '多模态系统'],
    pitfalls: ['把注意力权重当作完整解释', '忽略位置编码'],
    relatedConcepts: ['generative-ai', 'neural-networks'],
  },
  {
    id: 'agent-environment',
    slug: 'agent-environment',
    title: 'Agent 与 Environment',
    category: 'reinforcement-learning',
    difficulty: '入门',
    summary: '智能体选择动作，环境返回新状态与反馈，两者构成交互闭环。',
    explanation:
      '像玩家操作游戏：玩家是 Agent，游戏世界是 Environment，双方一步一步交互。',
    principle: '环境定义状态转移和奖励，智能体的策略根据观察选择动作。',
    formula: {
      expression: 'aₜ ~ π(a|sₜ),  (sₜ₊₁,rₜ) ~ Env(sₜ,aₜ)',
      description: '策略产生动作，环境据此返回下一状态与奖励。',
    },
    workflow: [
      '智能体观察状态',
      '策略选择动作',
      '环境执行转移',
      '智能体接收奖励并学习',
    ],
    code: {
      language: 'Python',
      source: `class LineWorld:\n    def __init__(self): self.state = 0\n    def step(self, action):\n        self.state += 1 if action == "right" else -1\n        reward = 1 if self.state == 3 else 0\n        return self.state, reward\n\nenv = LineWorld()\nprint(env.step("right"))`,
      highlights: ['step 是环境交互接口', '状态和奖励由环境产生'],
    },
    codeExplanation:
      'LineWorld 是一维环境。智能体向右移动时状态加一，到达位置 3 才得到奖励。',
    prerequisites: ['Python 基础'],
    applications: ['机器人控制', '游戏 AI'],
    pitfalls: ['把环境模型当成策略', '奖励设计与目标不一致'],
    relatedConcepts: ['state-action-reward', 'markov-decision-process'],
  },
  {
    id: 'state-action-reward',
    slug: 'state-action-reward',
    title: '状态、动作与奖励',
    category: 'reinforcement-learning',
    difficulty: '入门',
    summary: '状态描述处境，动作改变处境，奖励评价动作的即时结果。',
    explanation: '导航中，当前位置是状态，向左或向右是动作，到达目标获得奖励。',
    principle:
      '好的状态应包含决策所需信息；奖励是学习信号，但不总等于长期目标价值。',
    formula: {
      expression: 'Gₜ = rₜ₊₁ + γrₜ₊₂ + γ²rₜ₊₃ + …',
      description: '回报 G 是未来奖励的折扣和，γ 控制远期奖励的重要性。',
    },
    workflow: [
      '编码当前状态',
      '列出可行动作',
      '环境给出即时奖励',
      '累计折扣回报',
    ],
    code: {
      language: 'Python',
      source: `rewards = [0, 0, 1]\ngamma = 0.9\nG = 0\nfor reward in reversed(rewards):\n    G = reward + gamma * G\nprint(G)`,
      highlights: ['从后向前递推回报', 'gamma 小于 1 时远期奖励会衰减'],
    },
    codeExplanation: '三步后得到奖励 1，从第一步看它的折扣回报为 0.81。',
    prerequisites: ['数列基础'],
    applications: ['奖励设计', '轨迹评估'],
    pitfalls: ['只追逐即时奖励', '状态遗漏关键信息'],
    relatedConcepts: ['agent-environment', 'markov-decision-process'],
  },
  {
    id: 'markov-decision-process',
    slug: 'markov-decision-process',
    title: '马尔可夫决策过程',
    category: 'reinforcement-learning',
    difficulty: '进阶',
    summary: 'MDP 用状态、动作、转移、奖励和折扣统一描述序贯决策。',
    explanation:
      '它是一套游戏规则：当前位置、可选动作、动作后去哪、得多少分都被明确描述。',
    principle: '马尔可夫性质要求在给定当前状态后，未来与更早历史条件独立。',
    formula: {
      expression: 'P(sₜ₊₁|sₜ,aₜ,…)=P(sₜ₊₁|sₜ,aₜ)',
      description: '当前状态应浓缩预测未来所需的信息。',
    },
    workflow: [
      '定义状态集合',
      '定义动作与转移概率',
      '定义奖励函数',
      '寻找最大长期回报的策略',
    ],
    code: {
      language: 'NumPy',
      source: `import numpy as np\n\nP = np.array([[0.8, 0.2], [0.1, 0.9]])\nvalue = np.array([1.0, 3.0])\nnext_value = P @ value\nprint(next_value)`,
      highlights: ['P 的每行是下一状态分布', '矩阵乘法计算期望价值'],
    },
    codeExplanation:
      '两个状态的转移概率乘以状态价值，得到执行固定动作后的期望下一步价值。',
    prerequisites: ['概率基础', '状态与奖励'],
    applications: ['库存控制', '调度与规划'],
    pitfalls: ['现实状态常不完全可观测', '转移概率未必已知'],
    relatedConcepts: ['q-learning', 'policy-gradient'],
  },
  {
    id: 'q-learning',
    slug: 'q-learning',
    title: 'Q-Learning',
    category: 'reinforcement-learning',
    difficulty: '进阶',
    summary: 'Q-Learning 无需环境模型，直接学习每个状态动作对的长期价值。',
    explanation:
      '不断尝试并记录“在这个位置做这个动作有多划算”，最终选价值最高的动作。',
    principle:
      '用即时奖励和下一状态的最佳估计构造时序差分目标，逐步修正 Q 值。',
    formula: {
      expression: 'Q(s,a) ← Q(s,a)+α[r+γ maxₐ′Q(s′,a′)-Q(s,a)]',
      description: '括号中是时序差分误差，α 是学习率。',
    },
    workflow: [
      '按探索策略选择动作',
      '观察奖励和下一状态',
      '计算 TD 目标',
      '更新当前 Q 值',
    ],
    code: {
      language: 'NumPy',
      source: `import numpy as np\n\nQ = np.zeros((4, 2))\ns, a, reward, next_s = 1, 0, 1.0, 2\nalpha, gamma = 0.1, 0.9\ntarget = reward + gamma * Q[next_s].max()\nQ[s, a] += alpha * (target - Q[s, a])\nprint(Q[s, a])`,
      highlights: ['max 选择下一状态最佳动作价值', '只更新经历过的状态动作对'],
    },
    codeExplanation:
      '表格初始为零，这次获得奖励 1，因此对应 Q 值向目标 1 移动 10%，变为 0.1。',
    prerequisites: ['MDP', 'NumPy'],
    applications: ['离散控制', '小游戏策略'],
    pitfalls: ['大状态空间无法用表格', '探索不足导致次优策略'],
    relatedConcepts: ['markov-decision-process', 'policy-gradient'],
  },
  {
    id: 'policy-gradient',
    slug: 'policy-gradient',
    title: '策略梯度',
    category: 'reinforcement-learning',
    difficulty: '挑战',
    summary: '策略梯度直接调整策略参数，提高高回报动作出现的概率。',
    explanation: '表现好的动作以后更常选，表现差的动作逐渐少选。',
    principle:
      '对期望回报求梯度，可用采样轨迹的回报乘以动作对数概率梯度进行估计。',
    formula: {
      expression: '∇J(θ)=E[∇log πθ(a|s) · G]',
      description: '回报 G 为策略更新提供方向和强度。',
    },
    workflow: [
      '策略采样完整轨迹',
      '计算每步折扣回报',
      '构造负对数概率损失',
      '梯度更新策略参数',
    ],
    code: {
      language: 'PyTorch',
      source: `import torch\n\nlog_prob = torch.tensor(-0.7, requires_grad=True)\nreward = torch.tensor(2.0)\nloss = -log_prob * reward\nloss.backward()\nprint(log_prob.grad)`,
      highlights: ['负号把梯度上升转为损失下降', '高正回报增强所选动作概率'],
    },
    codeExplanation:
      '正回报乘在所选动作的对数概率上。最小化负值会推动策略提高该动作概率。',
    prerequisites: ['MDP', '梯度下降', '概率基础'],
    applications: ['连续控制', '生成策略优化'],
    pitfalls: ['梯度估计方差很大', '奖励尺度影响稳定性'],
    relatedConcepts: ['q-learning', 'backpropagation'],
  },
];

concepts.push(...more);

export const categoryMap = Object.fromEntries(
  categories.map((item) => [item.slug, item]),
) as Record<CategorySlug, Category>;
export const conceptMap = Object.fromEntries(
  concepts.map((item) => [item.slug, item]),
) as Record<string, Concept>;
export const getConceptsByCategory = (category: string) =>
  concepts.filter((item) => item.category === category);
