import type {
  LongFormConcept,
  FormulaEntry,
  CodeExample,
} from './long-form-core';
export interface RLLongFormConcept extends LongFormConcept {
  subcategory: string;
  importance: string[];
  learningObjectives: string[];
  algorithmType: string;
  onPolicy: boolean;
  offPolicy: boolean;
  actionSpace: string;
  modelFree: boolean;
  modelBased: boolean;
  inputs: string[];
  outputs: string[];
  workflow: string[];
  expectedOutput: string;
  interactiveDemo?: string;
  failureModes: string[];
  securityRisks: string[];
  performanceNotes: string[];
  sourceUrls: string[];
  versionDate: string;
  objectiveFunction?: string;
  referencePolicy?: string;
  rewardModel?: string;
  preferenceData?: string;
  groupData?: string;
  advantageEstimator?: string;
  klConstraint?: string;
  clipRange?: string;
  dataBoundary?: string[];
  trainingLoop?: string[];
  comparisonNotes?: string[];
  commonQuestions: { question: string; answer: string }[];
}
type Seed = {
  slug: string;
  title: string;
  difficulty: '入门' | '进阶' | '挑战';
  subcategory: string;
  summary: string;
  definition: string;
  intuition: string;
  principles: string[];
  steps: string[];
  algorithmType?: string;
  on?: boolean;
  off?: boolean;
  action?: string;
  modelFree?: boolean;
  modelBased?: boolean;
  formula?: FormulaEntry;
  variables?: { symbol: string; meaning: string }[];
  code?: CodeExample;
  applications?: string[];
  pitfalls?: string[];
  prereq?: string[];
  related?: string[];
  sources?: string[];
  sections?: string[];
  interactiveDemo?: string;
  extra?: Partial<RLLongFormConcept>;
};
const date = '2026-08-30';
const book = 'https://mitpress.mit.edu/9780262039246/reinforcement-learning/';
const ppoPaper = 'https://arxiv.org/abs/1707.06347';
const grpoPaper = 'https://arxiv.org/abs/2402.03300';
const dpoPaper = 'https://arxiv.org/abs/2305.18290';
const defaultCode = (title: string): CodeExample => ({
  title: `${title}的本地数值骨架`,
  language: 'Python',
  purpose:
    '用确定性数组展示状态、更新和结果，不连接远程环境，也不在网页内执行。',
  source: `rewards = [0.0, 0.0, 1.0]\ngamma = 0.9\nG = 0.0\nfor reward in reversed(rewards):\n    G = reward + gamma * G\nprint(round(G, 3))`,
  explanation: [
    'rewards 是一条固定轨迹的即时奖励。',
    '从后向前递推对应折扣回报公式。',
    '输出用于核对概念，不代表完整训练系统。',
  ],
  expectedOutput: '0.81',
});
function make(s: Seed): RLLongFormConcept {
  const formula = s.formula ?? {
    label: '折扣回报',
    expression: 'G_t=R_{t+1}+\\gamma G_{t+1}',
    description: '当前回报由下一奖励与折扣后的未来回报组成。',
  };
  return {
    id: s.slug,
    slug: s.slug,
    title: s.title,
    category: 'reinforcement-learning',
    difficulty: s.difficulty,
    subcategory: s.subcategory,
    summary: s.summary,
    importance: [
      `${s.title}位于“状态—行动—反馈—更新”学习链中的关键位置。`,
      `掌握它能帮助学习者判断算法使用的数据、策略归属和稳定性边界。`,
    ],
    learningObjectives: [
      `定义${s.title}并复述输入输出。`,
      `从公式计算一个最小数值例子。`,
      `说明它与相邻算法的区别、失败模式和适用场景。`,
    ],
    definition: [
      s.definition,
      `本页使用“问题定义—数学目标—更新过程—代码—失败诊断”的顺序组织，避免只记算法缩写。`,
    ],
    background: [
      '强化学习面对序贯决策：动作会改变之后能看到的状态和奖励，因此样本通常并非独立同分布。',
      '同一算法的效果取决于环境、探索策略、函数近似、随机种子和评测协议，单次曲线不足以下结论。',
    ],
    intuition: [
      s.intuition,
      '把价值看作“未来累计收益的估计”，把策略看作“在状态下如何选动作的规则”；算法差异主要在估计谁、使用谁生成的数据以及如何更新。',
    ],
    corePrinciple: s.principles,
    formulas: [formula],
    variableDefinitions: s.variables ?? [
      { symbol: 'G_t', meaning: '从时刻 t 开始的折扣累计回报。' },
      { symbol: 'R_{t+1}', meaning: '执行动作后收到的下一步奖励。' },
      { symbol: 'γ', meaning: '折扣因子，通常位于 [0,1)。' },
    ],
    numericalExample: {
      title: `${s.title}的最小计算`,
      given: [
        '即时奖励为 1',
        '下一状态估计为 2',
        '折扣因子 γ=0.9',
        '当前估计为 0.5',
      ],
      steps: [
        '计算 bootstrap 目标：1+0.9×2=2.8。',
        '目标与当前估计差为 2.8−0.5=2.3。',
        '若学习率 α=0.1，新估计为 0.5+0.1×2.3=0.73。',
      ],
      result:
        '一次更新后估计从 0.5 变为 0.73；是否收敛需要持续采样与满足相应条件。',
      comparison: [
        '较大 α 更新快但噪声和震荡更强。',
        '较大 γ 更重视远期奖励，但误差传播范围更长。',
        '使用真实回报与 bootstrap 目标会带来不同偏差—方差权衡。',
      ],
    },
    algorithmSteps: s.steps,
    workflow: s.steps,
    algorithmType: s.algorithmType ?? '强化学习基础',
    onPolicy: s.on ?? false,
    offPolicy: s.off ?? false,
    actionSpace: s.action ?? '离散或连续，取决于具体算法',
    modelFree: s.modelFree ?? true,
    modelBased: s.modelBased ?? false,
    inputs: ['状态或观察', '动作', '奖励', '下一状态或轨迹'],
    outputs: ['价值估计、策略参数或训练诊断'],
    codeExamples: [s.code ?? defaultCode(s.title)],
    codeExplanation: [
      '代码与本页第一条公式逐项对应。',
      '网站只展示、复制代码，不执行用户输入或训练真实模型。',
    ],
    expectedOutput:
      s.code?.expectedOutput ?? '得到固定的数值更新结果，便于手工复核。',
    applications: s.applications ?? ['序贯决策', '控制与资源分配'],
    pitfalls: s.pitfalls ?? [
      '只报告最好的一次随机种子',
      '训练回报与评测回报混用',
      '终止状态仍错误 bootstrap',
    ],
    failureModes: s.extra?.failureModes ??
      s.pitfalls ?? ['探索不足', '目标漂移', '函数近似不稳定'],
    securityRisks: s.extra?.securityRisks ?? [
      '奖励函数与真实目标不一致会诱发奖励黑客。',
      '部署策略的行动权限必须由环境和应用层约束。',
    ],
    performanceNotes: s.extra?.performanceNotes ?? [
      '样本效率、墙钟时间和显存占用需要分别报告。',
      '应使用多个随机种子、置信区间和固定评测策略。',
    ],
    prerequisites: s.prereq ?? ['概率基础', 'Python 与 NumPy'],
    relatedConcepts: s.related ?? [],
    sourceDocuments: [
      {
        path: '外部原始教材或论文',
        title: '强化学习可靠资料',
        kind: '扩展资料',
      },
    ],
    sourceSections: s.sections ?? ['相关定义、公式与算法章节'],
    sourceUrls: s.sources ?? [book],
    versionDate: date,
    extensionNotes: [
      '未找到可直接映射的本地强化学习文档；中文直觉、数值例子、代码和交互演示属于扩展解释，算法定义与公式以所列教材或原论文为依据。',
    ],
    commonQuestions: [
      {
        question: `${s.title}是 on-policy 还是 off-policy？`,
        answer: s.on
          ? '本页算法/方法按 on-policy 组织。'
          : s.off
            ? '本页算法/方法按 off-policy 组织。'
            : '这是基础或比较概念，具体归属取决于所讨论算法。',
      },
      {
        question: '网页是否会训练模型？',
        answer:
          '不会。所有图表使用固定种子或解析公式在浏览器本地计算，不执行页面中的示例代码。',
      },
    ],
    ...s.extra,
  };
}
const qCode: CodeExample = {
  title: '表格型 Q-Learning：确定性 GridWorld',
  language: 'NumPy',
  purpose: '完整展示 epsilon-greedy、TD 目标、Q 值更新和策略提取。',
  source: `import numpy as np\n\nrng = np.random.default_rng(7)\nQ = np.zeros((6, 2))  # 动作 0=左，1=右\nalpha, gamma, epsilon = 0.2, 0.95, 0.2\n\ndef step(state, action):\n    next_state = np.clip(state + (-1 if action == 0 else 1), 0, 5)\n    reward = 1.0 if next_state == 5 else -0.01\n    done = next_state == 5\n    return next_state, reward, done\n\nfor episode in range(300):\n    state = 0\n    for _ in range(30):\n        if rng.random() < epsilon:\n            action = rng.integers(2)\n        else:\n            action = int(np.argmax(Q[state]))\n        next_state, reward, done = step(state, action)\n        bootstrap = 0.0 if done else np.max(Q[next_state])\n        td_target = reward + gamma * bootstrap\n        Q[state, action] += alpha * (td_target - Q[state, action])\n        state = next_state\n        if done:\n            break\n\nprint('policy:', np.argmax(Q, axis=1))\nprint('Q[0]:', np.round(Q[0], 3))`,
  explanation: [
    '固定 rng 保证演示可复现。',
    'epsilon-greedy 生成行为数据，但目标使用下一状态最大 Q，因此是 off-policy。',
    '终止状态 bootstrap 设为 0，避免把终点之后的虚构价值加入目标。',
  ],
  expectedOutput: '策略在非终止状态主要选择向右；Q[0,右] 高于 Q[0,左]。',
};
const sarsaCode: CodeExample = {
  title: 'SARSA：同一行为策略生成动作并参与目标',
  language: 'NumPy',
  purpose: '展示 S,A,R,S′,A′ 五元组与 on-policy 更新。',
  source: `import numpy as np\n\nrng = np.random.default_rng(7)\nQ = np.zeros((6, 2))\nalpha, gamma, epsilon = 0.2, 0.95, 0.2\n\ndef choose(state):\n    return rng.integers(2) if rng.random() < epsilon else int(np.argmax(Q[state]))\n\ndef step(state, action):\n    next_state = np.clip(state + (-1 if action == 0 else 1), 0, 5)\n    return next_state, (1.0 if next_state == 5 else -0.01), next_state == 5\n\nfor episode in range(300):\n    state, action = 0, choose(0)\n    for _ in range(30):\n        next_state, reward, done = step(state, action)\n        next_action = choose(next_state)\n        bootstrap = 0.0 if done else Q[next_state, next_action]\n        Q[state, action] += alpha * (reward + gamma * bootstrap - Q[state, action])\n        state, action = next_state, next_action\n        if done:\n            break\n\nprint(np.argmax(Q, axis=1))`,
  explanation: [
    '当前 action 与 next_action 都来自同一 epsilon-greedy 行为策略。',
    '目标使用 Q(S′,A′)，而非 max Q。',
    '探索动作的风险会进入价值估计，因此 Cliff Walking 中往往更保守。',
  ],
  expectedOutput:
    '非终止状态主要选择向右；在含悬崖风险的环境中通常学到离悬崖更远的路径。',
};
const dqnCode: CodeExample = {
  title: 'PyTorch DQN：Online、Target 与 Replay 的最小训练步',
  language: 'PyTorch',
  purpose:
    '完整展示批次张量、DQN target、Huber loss、反向传播和 Target Network 同步。',
  source: `import random\nfrom collections import deque\nimport torch\nfrom torch import nn\n\ntorch.manual_seed(7)\nonline = nn.Sequential(nn.Linear(4, 32), nn.ReLU(), nn.Linear(32, 2))\ntarget = nn.Sequential(nn.Linear(4, 32), nn.ReLU(), nn.Linear(32, 2))\ntarget.load_state_dict(online.state_dict())\ntarget.eval()\noptimizer = torch.optim.Adam(online.parameters(), lr=1e-3)\nreplay = deque(maxlen=1000)\n\nfor i in range(64):\n    state = torch.tensor([i % 4 == j for j in range(4)], dtype=torch.float32)\n    next_state = torch.roll(state, 1)\n    replay.append((state, i % 2, 1.0 if i % 7 == 0 else 0.0, next_state, False))\n\nbatch = random.Random(7).sample(list(replay), 32)\nstates = torch.stack([x[0] for x in batch])\nactions = torch.tensor([x[1] for x in batch]).unsqueeze(1)\nrewards = torch.tensor([x[2] for x in batch])\nnext_states = torch.stack([x[3] for x in batch])\ndones = torch.tensor([x[4] for x in batch], dtype=torch.float32)\n\nq_sa = online(states).gather(1, actions).squeeze(1)\nwith torch.no_grad():\n    next_q = target(next_states).max(1).values\n    td_target = rewards + 0.99 * (1 - dones) * next_q\nloss = nn.SmoothL1Loss()(q_sa, td_target)\noptimizer.zero_grad()\nloss.backward()\nnn.utils.clip_grad_norm_(online.parameters(), 10.0)\noptimizer.step()\ntarget.load_state_dict(online.state_dict())\nprint('loss:', round(loss.item(), 4))`,
  explanation: [
    'Replay 打破连续样本相关性，并允许重复利用数据。',
    'Online Network 产生 Q(s,a)，Target Network 产生相对稳定的 TD 目标。',
    'SmoothL1Loss、梯度裁剪和周期性 Target 同步共同改善稳定性。',
  ],
  expectedOutput: '打印一个有限的正损失值；具体数值由固定初始化与批次决定。',
};
const reinforceCode: CodeExample = {
  title: 'REINFORCE：轨迹回报乘对数概率',
  language: 'PyTorch',
  purpose: '展示概率策略、轨迹回报、baseline 与熵奖励如何进入损失。',
  source: `import torch\nfrom torch.distributions import Categorical\n\ntorch.manual_seed(7)\nlogits = torch.tensor([0.2, -0.1], requires_grad=True)\npolicy = Categorical(logits=logits)\naction = policy.sample()\nlog_prob = policy.log_prob(action)\nentropy = policy.entropy()\ntrajectory_return = torch.tensor(2.0)\nbaseline = torch.tensor(1.2)\nadvantage = trajectory_return - baseline\nloss = -(log_prob * advantage + 0.01 * entropy)\nloss.backward()\nprint('action:', action.item())\nprint('probabilities:', policy.probs.detach())\nprint('gradient:', logits.grad)`,
  explanation: [
    'Categorical 表示随机策略，采样动作保留探索。',
    '回报减 baseline 得到 advantage；baseline 不改变期望梯度但可降低方差。',
    '熵项鼓励分布不要过早塌缩。',
  ],
  expectedOutput: '打印采样动作、两个动作概率和方向相反的 logits 梯度。',
};
const ppoCode: CodeExample = {
  title: 'PPO clipped surrogate objective',
  language: 'PyTorch',
  purpose: '直接计算概率比率、未裁剪目标和裁剪目标。',
  source: `import torch\n\nold_log_prob = torch.log(torch.tensor([0.40, 0.55, 0.25]))\nnew_log_prob = torch.log(torch.tensor([0.52, 0.45, 0.50], requires_grad=True))\nadvantage = torch.tensor([1.2, -0.7, 0.4])\nclip_range = 0.2\n\nratio = torch.exp(new_log_prob - old_log_prob)\nunclipped = ratio * advantage\nclipped_ratio = torch.clamp(ratio, 1 - clip_range, 1 + clip_range)\nclipped = clipped_ratio * advantage\npolicy_loss = -torch.minimum(unclipped, clipped).mean()\npolicy_loss.backward()\n\nprint('ratio:', ratio.detach())\nprint('clipped ratio:', clipped_ratio.detach())\nprint('loss:', round(policy_loss.item(), 4))`,
  explanation: [
    'ratio 比较新旧策略对同一动作的概率。',
    'clamp 将比率限制在 [1−ε,1+ε]；minimum 构造保守代理目标。',
    '真实 PPO 还组合 value loss、entropy bonus、GAE 与多轮 mini-batch 更新。',
  ],
  expectedOutput:
    '超出 [0.8,1.2] 的 ratio 被截到边界，并打印可反向传播的 policy loss。',
};
const dpoCode: CodeExample = {
  title: 'DPO loss：chosen / rejected 与 reference 的对数概率差',
  language: 'PyTorch',
  purpose:
    '根据 DPO 原论文目标计算一个偏好对损失，不训练 Reward Model、不采样在线轨迹。',
  source: `import torch\nimport torch.nn.functional as F\n\nbeta = 0.1\npolicy_chosen = torch.tensor([-1.2, -0.8], requires_grad=True)\npolicy_rejected = torch.tensor([-2.0, -1.1], requires_grad=True)\nreference_chosen = torch.tensor([-1.4, -0.9])\nreference_rejected = torch.tensor([-1.8, -1.0])\n\npolicy_margin = policy_chosen - policy_rejected\nreference_margin = reference_chosen - reference_rejected\nlogits = beta * (policy_margin - reference_margin)\nloss = -F.logsigmoid(logits).mean()\nloss.backward()\nprint('preference logits:', logits.detach())\nprint('DPO loss:', round(loss.item(), 4))`,
  explanation: [
    '每行数据包含 chosen 与 rejected 响应的序列对数概率。',
    '策略偏好 margin 与 reference margin 的差经 beta 缩放。',
    '负 log-sigmoid 是二分类式偏好损失；这不是标准 MDP 在线交互循环。',
  ],
  expectedOutput: '打印两个 preference logits 和一个有限正 DPO loss。',
};
const grpoCode: CodeExample = {
  title: 'GRPO：组内奖励标准化与 clipped objective',
  language: 'PyTorch',
  purpose:
    '按 DeepSeekMath 的组相对思想，展示同一 prompt 多个输出如何形成相对 advantage。',
  source: `import torch\n\nrewards = torch.tensor([1.0, 0.2, 0.8, -0.2])\nold_log_prob = torch.log(torch.tensor([0.25, 0.25, 0.25, 0.25]))\nnew_log_prob = torch.log(torch.tensor([0.30, 0.20, 0.28, 0.22], requires_grad=True))\nclip_range = 0.2\n\nmean = rewards.mean()\nstd = rewards.std(unbiased=False).clamp_min(1e-6)\nadvantage = (rewards - mean) / std\nratio = torch.exp(new_log_prob - old_log_prob)\nclipped_ratio = torch.clamp(ratio, 1 - clip_range, 1 + clip_range)\nsurrogate = torch.minimum(ratio * advantage, clipped_ratio * advantage)\nkl_penalty = 0.01 * (new_log_prob - old_log_prob).square()\nloss = -(surrogate - kl_penalty).mean()\nloss.backward()\nprint('group advantage:', advantage)\nprint('loss:', round(loss.item(), 4))`,
  explanation: [
    '四个 rewards 属于同一 prompt 的输出组。',
    '每个奖励减组均值并除组标准差，得到 group-relative advantage。',
    '策略比率使用 PPO 式裁剪，并加入教学化 KL penalty；生产公式与估计细节应按具体 GRPO 实现核对。',
  ],
  expectedOutput:
    '组内高奖励样本 advantage 为正，低奖励样本为负；打印有限的代理损失。',
};
const offlineShiftCode: CodeExample = {
  title: '固定数据中的覆盖缺口与 OOD 动作',
  language: 'NumPy',
  purpose: '用动作计数展示静态数据未覆盖动作如何被函数近似器高估。',
  source: `import numpy as np\n\nactions = np.array([0, 0, 0, 1, 0, 1])  # 数据里没有动作 2\ncounts = np.bincount(actions, minlength=3)\nsupport = counts > 0\nq_estimate = np.array([1.0, 1.3, 4.8])\nnaive_action = int(q_estimate.argmax())\nmasked_q = np.where(support, q_estimate, -np.inf)\nsupported_action = int(masked_q.argmax())\nprint('counts:', counts)\nprint('naive greedy:', naive_action)\nprint('support-aware:', supported_action)`,
  explanation: [
    'counts 是经验数据在该状态附近的动作覆盖代理。',
    '普通 max 会选择没有样本证据的动作 2。',
    'support mask 只是离散教学示例；连续空间需要密度、距离、生成模型或保守价值方法。',
  ],
  expectedOutput:
    'naive greedy 选择未覆盖动作 2；support-aware 只在数据动作中选择 1。',
};
const behaviorConstraintCode: CodeExample = {
  title: '优势加权的行为克隆',
  language: 'NumPy',
  purpose: '展示行为约束仍可在数据支持内提高高优势动作的权重。',
  source: `import numpy as np\n\nbehavior_prob = np.array([0.70, 0.25, 0.05])\nadvantage = np.array([-0.4, 0.5, 1.2])\nbeta = 2.0\nweights = np.exp(np.clip(beta * advantage, -5, 5))\npolicy = behavior_prob * weights\npolicy = policy / policy.sum()\nkl = np.sum(policy * np.log(policy / behavior_prob))\nprint('behavior:', np.round(behavior_prob, 3))\nprint('constrained policy:', np.round(policy, 3))\nprint('KL(policy || behavior):', round(float(kl), 3))`,
  explanation: [
    'behavior_prob 代表数据收集策略的动作分布。',
    '指数优势权重提高数据中较好动作的概率，同时保留行为分布作为锚点。',
    'beta 越大，改进更激进、有效样本数通常更低。',
  ],
  expectedOutput:
    '新策略提高高优势动作概率，但不会给行为策略概率为零的动作凭空分配质量。',
};
const cqlCode: CodeExample = {
  title: '离散动作 CQL 正则项',
  language: 'PyTorch',
  purpose: '在 Bellman 误差之外计算 logsumexp(Q)−Q(data action) 的保守惩罚。',
  source: `import torch\nimport torch.nn.functional as F\n\nq_all = torch.tensor([[1.0, 1.4, 4.0],\n                      [0.8, 1.1, 3.5]], requires_grad=True)\ndata_actions = torch.tensor([0, 1])\nrewards = torch.tensor([1.0, 0.5])\nnext_v = torch.tensor([0.7, 0.4])\nq_data = q_all.gather(1, data_actions[:, None]).squeeze(1)\ntd_target = rewards + 0.99 * next_v\nbellman_loss = F.mse_loss(q_data, td_target)\nconservative_gap = torch.logsumexp(q_all, 1).mean() - q_data.mean()\nloss = bellman_loss + conservative_gap\nloss.backward()\nprint('Bellman:', round(bellman_loss.item(), 3))\nprint('CQL gap:', round(conservative_gap.item(), 3))\nprint('OOD-action gradients:', q_all.grad[:, 2])`,
  explanation: [
    'Bellman 部分只拟合数据动作的 TD 目标。',
    'logsumexp 减数据动作 Q 会压低未被数据支持的高 Q。',
    '连续动作 CQL 通常用策略与均匀分布采样近似这一项。',
  ],
  expectedOutput:
    'CQL gap 为正；未在 batch 中出现且 Q 很高的动作得到正梯度，梯度下降会压低它。',
};
const iqlCode: CodeExample = {
  title: 'IQL 的 expectile、TD 与优势加权 BC',
  language: 'PyTorch',
  purpose:
    '用固定 transition 批次对应 IQL 的 V、Q、policy 三个目标，全程不查询策略生成的新动作。',
  source: `import torch\n\ntau, beta, gamma = 0.7, 3.0, 0.99\nq_data = torch.tensor([1.4, 0.4, 2.0], requires_grad=True)\nv = torch.tensor([0.9, 0.7, 1.3], requires_grad=True)\nv_next = torch.tensor([0.6, 0.2, 0.0])\nrewards = torch.tensor([0.5, 0.1, 2.0])\ndone = torch.tensor([0.0, 0.0, 1.0])\nlog_prob = torch.tensor([-0.8, -1.1, -0.5], requires_grad=True)\ndiff = q_data.detach() - v\nexpectile_weight = torch.where(diff > 0, tau, 1 - tau)\nv_loss = (expectile_weight * diff.square()).mean()\ntd_target = rewards + gamma * (1 - done) * v_next\nq_loss = (q_data - td_target).square().mean()\nadv = q_data.detach() - v.detach()\npolicy_weight = torch.exp(beta * adv).clamp(max=100.0)\npolicy_loss = -(policy_weight * log_prob).mean()\n(v_loss + q_loss + policy_loss).backward()\nprint('expectile weights:', expectile_weight)\nprint('policy weights:', policy_weight)\nprint('losses:', [round(x.item(), 3) for x in (v_loss,q_loss,policy_loss)])`,
  explanation: [
    'V 用非对称平方损失逼近 Q(s,a) 的上 expectile。',
    'Q 的目标使用下一状态 V(s′)，不需要对策略动作求 Q。',
    '策略只对数据动作做优势加权最大似然；指数权重需要裁剪。',
  ],
  expectedOutput:
    '高于 V 的 Q 使用 0.7 权重；高优势数据动作获得更大的 policy weight。',
};
const seeds: Seed[] = [
  {
    slug: 'reinforcement-learning-overview',
    title: '强化学习是什么',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '智能体通过与环境交互，在延迟反馈下学习最大化长期回报的行为。',
    definition:
      '强化学习研究 Agent 如何在环境中依据状态选择动作、接收奖励并改进策略。',
    intuition:
      '像在没有标准答案的游戏中反复尝试：奖励只告诉你结果好坏，算法要把结果归因到之前的动作。',
    principles: [
      '目标是期望累计回报而非单步奖励。',
      '数据分布会随策略改变。',
      '探索获取信息，利用使用当前最优知识。',
    ],
    steps: [
      '观察状态',
      '按策略选择动作',
      '环境转移并给奖励',
      '更新价值或策略',
      '重复并独立评测',
    ],
    related: [
      'agent-environment',
      'state-action-reward',
      'markov-decision-process',
    ],
  },
  {
    slug: 'rl-vs-supervised-unsupervised',
    title: '强化学习与监督/无监督学习',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '比较标签、反馈时机、数据分布和优化目标。',
    definition:
      '监督学习学习给定标签映射，无监督学习发现数据结构，强化学习用环境反馈优化序贯行为。',
    intuition:
      '监督学习像带答案练习，无监督学习像整理材料，强化学习像在真实后果中练习决策。',
    principles: [
      'RL 奖励不是每一步的正确动作标签。',
      '动作改变未来数据。',
      '离线 RL 虽使用固定数据，仍需处理策略分布偏移。',
    ],
    steps: [
      '确认反馈类型',
      '检查动作是否影响未来',
      '定义长期目标',
      '选择学习范式',
    ],
    related: [
      'reinforcement-learning-overview',
      'supervised-learning',
      'unsupervised-learning',
    ],
  },
  {
    slug: 'agent-environment',
    title: 'Agent 与 Environment',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: 'Agent 决策，Environment 执行转移并返回观察、奖励和终止信号。',
    definition:
      'Agent 持有策略；Environment 定义状态转移、奖励和 episode 边界。',
    intuition: '玩家是 Agent，游戏规则和世界是 Environment。',
    principles: [
      '训练代码不能让 Agent 偷看环境内部状态。',
      'step 接口应区分 terminated 与 truncated。',
      '随机性和 seed 属于实验协议。',
    ],
    steps: [
      'reset 环境',
      '观察状态',
      '选择动作',
      'step',
      '记录 transition',
      '终止后重新开始',
    ],
    related: ['state-action-reward', 'policy-episode-trajectory'],
  },
  {
    slug: 'state-action-reward',
    title: 'State、Action 与 Reward',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '状态支持决策，动作改变环境，奖励提供局部反馈。',
    definition:
      'State 是决策所需信息，Action 是允许选择，Reward 是转移后收到的标量反馈。',
    intuition: '导航中位置是状态、转弯是动作、到达目标得到奖励。',
    principles: [
      '状态应尽可能满足马尔可夫性。',
      '奖励设计不等同于真实目标。',
      '动作空间决定算法选择。',
    ],
    steps: ['定义状态', '定义合法动作', '设计奖励', '检查奖励黑客'],
    related: ['markov-property', 'reward-shaping-safe-robust'],
  },
  {
    slug: 'policy-episode-trajectory',
    title: 'Policy、Episode 与 Trajectory',
    difficulty: '入门',
    subcategory: '入门基础',
    summary:
      '策略产生动作分布，Episode 定义一次交互边界，Trajectory 保存完整经历。',
    definition:
      'Policy π(a|s) 给出动作规则；trajectory 是状态、动作、奖励序列；episode 是有起止的一条轨迹。',
    intuition: '策略是驾驶习惯，一趟行程是 episode，行车记录是 trajectory。',
    principles: [
      '随机策略输出概率分布。',
      '轨迹概率由策略和环境转移共同决定。',
      '评测时常关闭或固定探索。',
    ],
    steps: ['reset', '按策略采样', '记录 transition', '终止后计算回报'],
    formula: {
      label: '轨迹概率',
      expression:
        'p_\\theta(\\tau)=p(s_0)\\prod_t\\pi_\\theta(a_t|s_t)p(s_{t+1}|s_t,a_t)',
      description: '策略与环境转移共同决定轨迹分布。',
    },
    related: ['return-discount-factor', 'policy-gradient'],
  },
  {
    slug: 'return-discount-factor',
    title: 'Return 与 Discount Factor',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '回报汇总未来奖励，γ 控制远期反馈的权重。',
    definition: 'Return 是从某时刻开始的奖励和；折扣回报对第 k 步奖励乘 γ^k。',
    intuition: '越远的收益通常越不确定，γ 像远期权重。',
    principles: [
      'γ=0 只看一步。',
      '接近 1 更重视长期但误差传播更远。',
      '终止任务与持续任务的回报定义需区分。',
    ],
    steps: ['列出奖励', '选择 γ', '从后向前递推', '比较不同 γ'],
    formula: {
      label: '折扣回报',
      expression: 'G_t=\\sum_{k=0}^{T-t-1}\\gamma^kR_{t+k+1}',
      description: '从 t 开始累积至 episode 结束。',
    },
    variables: [
      { symbol: 'G_t', meaning: '时刻 t 的回报。' },
      { symbol: 'γ', meaning: '折扣因子。' },
      { symbol: 'R_{t+k+1}', meaning: '未来第 k+1 个奖励。' },
    ],
    related: ['value-functions'],
  },
  {
    slug: 'exploration-exploitation',
    title: 'Exploration 与 Exploitation',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '探索获取未知动作信息，利用选择当前估计最优动作。',
    definition:
      '探索—利用权衡决定策略如何在学习新信息与收获已有知识之间分配行为。',
    intuition: '总去熟悉餐馆稳定，但偶尔试新店可能发现更好选择。',
    principles: [
      '探索率应与训练阶段匹配。',
      '评测策略通常与行为策略分开。',
      '复杂环境需要结构化探索而非纯随机。',
    ],
    steps: ['定义行为策略', '设置 epsilon 或 entropy', '衰减探索', '单独评测'],
    related: ['q-learning', 'baseline-advantage-entropy'],
  },
  {
    slug: 'markov-property',
    title: 'Markov Property',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '给定当前状态后，未来转移不再依赖更早历史。',
    definition: '若状态充分，下一状态分布只依赖当前状态与动作。',
    intuition: '当前棋盘若完整，预测下一步无需知道棋子怎样走到这里。',
    principles: [
      '观察不等于真实状态。',
      '缺失历史会破坏马尔可夫性。',
      'RNN 或 belief state 可处理部分可观测。',
    ],
    steps: [
      '列出预测未来所需信息',
      '检查当前表示是否包含',
      '必要时加入历史或 belief',
    ],
    formula: {
      label: '马尔可夫性质',
      expression: 'p(s_{t+1}|s_t,a_t,s_{t-1},\\ldots)=p(s_{t+1}|s_t,a_t)',
      description: '历史在给定当前状态动作后不再提供额外转移信息。',
    },
    related: ['markov-decision-process', 'pomdp'],
  },
  {
    slug: 'markov-decision-process',
    title: 'MDP 与五元组',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '用状态、动作、转移、奖励和折扣统一描述序贯决策。',
    definition: 'MDP 五元组通常写作 (S,A,P,R,γ)。',
    intuition:
      '它是游戏规则书：有哪些局面、能做什么、怎么转移、得多少分、未来多重要。',
    principles: [
      'P 描述环境动力学。',
      '策略不属于环境五元组。',
      'model-free 方法不要求显式知道 P。',
    ],
    steps: ['定义 S', '定义 A', '定义 P', '定义 R', '设置 γ'],
    formula: {
      label: 'MDP 五元组',
      expression: '\\mathcal{M}=(\\mathcal{S},\\mathcal{A},P,R,\\gamma)',
      description: '序贯决策问题的标准抽象。',
    },
    related: ['value-functions', 'bellman-equations'],
  },
  {
    slug: 'gridworld',
    title: 'GridWorld 示例',
    difficulty: '入门',
    subcategory: '入门基础',
    summary: '在小网格中观察状态、动作、障碍、终点和奖励。',
    definition:
      'GridWorld 把格子位置作为状态、上下左右作为动作，是验证 RL 更新的最小环境。',
    intuition: '每走一步付代价，到终点获奖励，障碍阻止移动。',
    principles: [
      '边界与障碍需定义确定行为。',
      '终止状态不再 bootstrap。',
      '小环境可打印完整 Q 表。',
    ],
    steps: [
      'reset 起点',
      'epsilon-greedy 选动作',
      '执行移动',
      '更新 Q',
      '到终点结束',
    ],
    interactiveDemo: 'gridworld',
    related: ['q-learning', 'sarsa'],
  },
  {
    slug: 'value-functions',
    title: 'Value Function 与 Q Function',
    difficulty: '进阶',
    subcategory: '基础理论',
    summary: 'V 评价状态，Q 评价状态—动作对。',
    definition:
      'Vπ(s) 是按策略 π 从状态 s 出发的期望回报；Qπ(s,a) 固定第一动作 a 后继续按 π 的期望回报。',
    intuition: 'V 问“这个局面好不好”，Q 问“在这个局面做这个动作好不好”。',
    principles: [
      'Q 可直接 argmax 选离散动作。',
      'V 需要结合模型或 Actor 选动作。',
      '最优价值对应最优策略。',
    ],
    steps: ['定义策略', '采样或计算回报', '估计 V/Q', '用于改进策略'],
    formula: {
      label: '状态与动作价值',
      expression:
        'V^\\pi(s)=\\mathbb{E}_\\pi[G_t|S_t=s],\\quad Q^\\pi(s,a)=\\mathbb{E}_\\pi[G_t|S_t=s,A_t=a]',
      description: '两者条件不同。',
    },
    related: ['bellman-equations', 'value-based-methods'],
  },
  {
    slug: 'bellman-equations',
    title: 'Bellman 期望与最优方程',
    difficulty: '进阶',
    subcategory: '基础理论',
    summary: '把长期价值递归分解为即时奖励与下一状态价值。',
    definition:
      'Bellman 期望方程针对固定策略，Bellman 最优方程在动作上取最大。',
    intuition: '长期价值可以“一步奖励 + 下一局面的长期价值”递归计算。',
    principles: [
      '期望方程评估策略。',
      '最优方程定义最优性。',
      '函数近似与采样会引入误差。',
    ],
    steps: ['写一步转移', '加入 γ', '对策略动作求期望或取 max', '迭代求不动点'],
    formula: {
      label: 'Bellman 最优方程',
      expression:
        'Q^*(s,a)=\\mathbb{E}[R_{t+1}+\\gamma\\max_{a\\prime}Q^*(S_{t+1},a\\prime)|s,a]',
      description: '最优 Q 等于一步奖励加下一状态最优价值。',
    },
    related: ['dynamic-programming', 'td-learning', 'q-learning'],
  },
  {
    slug: 'dynamic-programming',
    title: 'Dynamic Programming、Policy/Value Iteration',
    difficulty: '进阶',
    subcategory: '基础理论',
    summary: '已知环境模型时，通过全状态备份进行策略评估和改进。',
    definition: 'DP 使用完整转移概率和奖励模型计算 Bellman 期望。',
    intuition: '如果游戏规则全部已知，可系统扫描所有状态而不必靠采样。',
    principles: [
      'Policy Iteration 交替评估与改进。',
      'Value Iteration 合并为最优备份。',
      '大状态空间中全扫描不可行。',
    ],
    steps: ['初始化价值', 'Bellman sweep', '贪心改进', '直到变化足够小'],
    related: ['bellman-equations', 'model-free-vs-based'],
  },
  {
    slug: 'monte-carlo-methods',
    title: 'Monte Carlo Method',
    difficulty: '进阶',
    subcategory: '基础理论',
    summary: '等 episode 结束后用完整真实回报更新价值。',
    definition: 'MC 不 bootstrap，直接用采样到的 Gt 作为目标。',
    intuition: '整局结束后复盘每个状态最终得到多少回报。',
    principles: [
      '无 bootstrap 偏差较小但方差高。',
      '需要 episode 终止。',
      '可用 first-visit 或 every-visit。',
    ],
    steps: ['采样完整轨迹', '计算每步 G', '按访问更新均值'],
    related: ['td-learning', 'reinforce'],
  },
  {
    slug: 'td-learning',
    title: 'TD Error、TD(0) 与 n-step',
    difficulty: '进阶',
    subcategory: '基础理论',
    summary: '在轨迹未结束时用下一状态估计 bootstrap 更新。',
    definition: 'TD 学习结合 MC 采样与 DP bootstrap。',
    intuition: '不用等比赛结束，每一步都用当前比分和下一局势修正预测。',
    principles: [
      'TD(0) 一步 bootstrap。',
      'n-step 在偏差与方差之间折中。',
      'TD error 可作为 advantage 估计。',
    ],
    steps: ['观察 transition', '计算 δ', '更新价值', '继续交互'],
    formula: {
      label: 'TD error',
      expression: '\\delta_t=R_{t+1}+\\gamma V(S_{t+1})-V(S_t)',
      description: '目标与当前估计之差。',
    },
    variables: [
      { symbol: 'δ_t', meaning: '时刻 t 的 TD 误差。' },
      { symbol: 'V(S_t)', meaning: '当前状态价值。' },
      { symbol: 'V(S_{t+1})', meaning: '下一状态 bootstrap 价值。' },
    ],
    related: ['q-learning', 'actor-critic'],
  },
  {
    slug: 'value-based-methods',
    title: 'Value-based Methods',
    difficulty: '进阶',
    subcategory: 'Value-based',
    summary: '学习 V 或 Q，并由价值比较导出策略。',
    definition: 'Value-based 方法以价值函数为主要可学习对象。',
    intuition: '先给每个选择打长期分，再选分最高动作。',
    principles: [
      '离散动作可直接 argmax Q。',
      '连续动作 argmax 困难。',
      '函数近似时需稳定化机制。',
    ],
    steps: ['收集 transition', '构造 TD 目标', '更新价值', '从价值导出行为'],
    related: ['q-learning', 'dqn', 'policy-based-methods'],
  },
  {
    slug: 'q-learning',
    title: 'Q-Learning',
    difficulty: '进阶',
    subcategory: 'Value-based',
    summary:
      '用行为数据学习贪心目标策略的动作价值，是经典 off-policy TD 控制。',
    definition: 'Q-Learning 更新当前 Q(s,a) 向 r+γ max Q(s′,a′) 靠近。',
    intuition: '即使行为在探索，学习目标仍假设下一步采取当前最优动作。',
    principles: [
      'max 使目标策略为贪心策略，因此与 epsilon-greedy 行为策略不同。',
      '表格收敛要求充分访问和合适递减学习率等条件。',
      '终止状态的下一价值为 0。',
    ],
    steps: [
      'epsilon-greedy 选动作',
      '执行得到 s′,r',
      '计算 max 下一 Q',
      '计算 TD error',
      '更新 Q(s,a)',
      '衰减 epsilon',
    ],
    algorithmType: 'Value-based TD control',
    off: true,
    action: '离散',
    formula: {
      label: 'Q-Learning 更新',
      expression:
        'Q(S_t,A_t)\\leftarrow Q(S_t,A_t)+\\alpha[R_{t+1}+\\gamma\\max_a Q(S_{t+1},a)-Q(S_t,A_t)]',
      description: 'off-policy TD 控制更新。',
    },
    variables: [
      { symbol: 'α', meaning: '学习率。' },
      { symbol: 'γ', meaning: '折扣因子。' },
      { symbol: 'ε', meaning: 'epsilon-greedy 探索概率。' },
      { symbol: 'Q(s,a)', meaning: '从状态 s 先做 a 的长期回报估计。' },
    ],
    code: qCode,
    interactiveDemo: 'gridworld',
    related: ['sarsa', 'double-q-learning', 'dqn'],
  },
  {
    slug: 'sarsa',
    title: 'SARSA 与 Cliff Walking',
    difficulty: '进阶',
    subcategory: 'Value-based',
    summary: '使用实际下一动作 A′ 的 on-policy TD 控制。',
    definition: 'SARSA 名称来自 S,A,R,S′,A′ 五个更新元素。',
    intuition:
      '它评价“我实际会继续探索”的策略，因此会把探索跌落悬崖的风险算进去。',
    principles: [
      '下一动作来自当前行为策略。',
      'epsilon-greedy 会直接影响目标。',
      'Cliff Walking 中常比 Q-Learning 更保守。',
    ],
    steps: [
      '选 A',
      '执行得 R,S′',
      '按同策略选 A′',
      '用 Q(S′,A′) 更新',
      '令 S,A=S′,A′',
    ],
    algorithmType: 'Value-based TD control',
    on: true,
    action: '离散',
    formula: {
      label: 'SARSA 更新',
      expression:
        'Q(S_t,A_t)\\leftarrow Q(S_t,A_t)+\\alpha[R_{t+1}+\\gamma Q(S_{t+1},A_{t+1})-Q(S_t,A_t)]',
      description: '目标包含实际下一动作。',
    },
    code: sarsaCode,
    interactiveDemo: 'q-sarsa',
    related: ['q-learning', 'expected-sarsa'],
  },
  {
    slug: 'expected-sarsa',
    title: 'Expected SARSA',
    difficulty: '进阶',
    subcategory: 'Value-based',
    summary: '用下一状态行为策略下 Q 的期望替代单个采样动作。',
    definition: 'Expected SARSA 对 A′ 按行为策略概率加权。',
    intuition: '不只看下一次抽到哪个动作，而看所有可能动作的平均。',
    principles: [
      '降低下一动作采样方差。',
      '可 on-policy，也可通过不同目标策略构造 off-policy 形式。',
    ],
    steps: ['得到 s′', '计算 Σπ(a|s′)Q', '构造 TD 目标', '更新'],
    formula: {
      label: 'Expected SARSA',
      expression:
        'Q(s,a)\\leftarrow Q(s,a)+\\alpha[r+\\gamma\\sum_{a\\prime}\\pi(a\\prime|s\\prime)Q(s\\prime,a\\prime)-Q(s,a)]',
      description: '下一动作价值取策略期望。',
    },
    related: ['sarsa', 'q-learning'],
  },
  {
    slug: 'double-q-learning',
    title: 'Double Q-Learning',
    difficulty: '挑战',
    subcategory: 'Value-based',
    summary: '用两套估计分离动作选择与动作评价，缓解 max 过估计。',
    definition: '随机更新 QA 或 QB，并用另一张表评价由当前表选出的动作。',
    intuition: '一个评委选候选，另一个独立评分，减少同一噪声被 max 放大。',
    principles: ['max 对噪声估计有正偏。', '双估计不保证消除所有偏差。'],
    steps: ['随机选择更新表', '一表 argmax', '另一表评价', '更新选中表'],
    related: ['q-learning', 'double-dqn'],
  },
  {
    slug: 'dqn',
    title: 'Deep Q-Network（DQN）',
    difficulty: '挑战',
    subcategory: 'Value-based',
    summary:
      '用神经网络近似高维状态的 Q 值，并以 Replay 与 Target Network 稳定训练。',
    definition: 'DQN 输入状态，输出每个离散动作的 Q 值。',
    intuition: '不再维护巨大 Q 表，而用网络从状态特征预测所有动作分数。',
    principles: [
      'Replay 打乱相关样本。',
      'Target Network 延缓目标漂移。',
      'Online Network 选择/拟合当前 Q。',
      'DQN loss 常用 MSE 或 Huber。',
    ],
    steps: [
      '与环境交互并写 Replay',
      '采样 mini-batch',
      'Online 计算 Q(s,a)',
      'Target 计算 y',
      '优化 TD loss',
      '周期同步 Target',
    ],
    algorithmType: 'Deep value-based',
    off: true,
    action: '离散',
    formula: {
      label: 'DQN loss',
      expression:
        'L(\\theta)=\\mathbb{E}[(R+\\gamma\\max_{a\\prime}Q_{\\theta^-}(S\\prime,a\\prime)-Q_\\theta(S,A))^2]',
      description: 'Target 参数 θ⁻ 在一段时间内固定。',
    },
    code: dqnCode,
    interactiveDemo: 'dqn',
    related: ['experience-replay-target-network', 'double-dqn', 'dueling-dqn'],
  },
  {
    slug: 'experience-replay-target-network',
    title: 'Experience Replay 与 Target Network',
    difficulty: '挑战',
    subcategory: 'Value-based',
    summary: 'DQN 的两项核心稳定化机制。',
    definition:
      'Replay 保存 transitions 并随机采样；Target Network 提供延迟更新目标。',
    intuition: '把连续经历打乱复习，并用较慢变化的老师网络提供目标。',
    principles: [
      'Replay 让数据更接近混合分布。',
      '旧数据造成 off-policy 分布。',
      'Target 更新太快或太慢都可能有问题。',
    ],
    steps: [
      '写 buffer',
      '均匀或优先采样',
      '计算 target',
      '优化 online',
      '硬/软更新 target',
    ],
    interactiveDemo: 'dqn',
    related: ['dqn', 'prioritized-experience-replay'],
  },
  {
    slug: 'double-dqn',
    title: 'Double DQN',
    difficulty: '挑战',
    subcategory: 'Value-based',
    summary: 'Online 选动作，Target 评价该动作，缓解 DQN 过估计。',
    definition: 'Double DQN 将 argmax 与 value evaluation 分给不同网络。',
    intuition: '学生选答案，老师给所选答案评分。',
    principles: ['区别于直接在 Target Network 上同时 max 和评价。'],
    steps: [
      'Online 对 s′ argmax',
      'Target 取对应 Q',
      '构造 target',
      '更新 Online',
    ],
    formula: {
      label: 'Double DQN target',
      expression:
        'y=r+\\gamma Q_{\\theta^-}(s\\prime,\\arg\\max_a Q_\\theta(s\\prime,a))',
      description: '选择与评价分离。',
    },
    related: ['double-q-learning', 'dqn'],
  },
  {
    slug: 'dueling-dqn',
    title: 'Dueling DQN',
    difficulty: '挑战',
    subcategory: 'Value-based',
    summary: '网络分解状态价值 V 与动作优势 A 后再聚合 Q。',
    definition: 'Dueling 架构分别估计状态好坏和动作相对优势。',
    intuition: '先判断局面总体好不好，再判断各动作比平均好多少。',
    principles: ['需去除 V/A 分解不可辨识性。', '常用减去 A 的均值。'],
    steps: ['共享编码', 'V head', 'A head', '中心化 A', '组合 Q'],
    formula: {
      label: 'Dueling 聚合',
      expression:
        'Q(s,a)=V(s)+A(s,a)-\\frac{1}{|\\mathcal A|}\\sum_{a\\prime}A(s,a\\prime)',
      description: '均值中心化优势。',
    },
    related: ['dqn', 'rainbow-dqn'],
  },
  {
    slug: 'prioritized-experience-replay',
    title: 'Prioritized Experience Replay',
    difficulty: '挑战',
    subcategory: 'Value-based',
    summary:
      '按 TD error 优先采样更有学习价值的 transition，并用重要性权重校正偏差。',
    definition: 'PER 使采样概率与 priority 相关。',
    intuition: '错得多的题优先复习，但要修正这种偏科采样。',
    principles: [
      'priority 常取 |δ|+ε。',
      '重要性采样权重缓解偏差。',
      '需更新 priority。',
    ],
    steps: [
      '按 priority 采样',
      '计算 IS weight',
      '加权 loss',
      '更新网络和 priority',
    ],
    related: ['experience-replay-target-network', 'rainbow-dqn'],
  },
  {
    slug: 'rainbow-dqn',
    title: 'Rainbow DQN',
    difficulty: '挑战',
    subcategory: 'Value-based',
    summary:
      '组合 Double、Dueling、PER、multi-step、distributional RL 与 noisy nets。',
    definition: 'Rainbow 是多项 DQN 改进的集成。',
    intuition: '不是单一新更新，而是一套相互配合的增强包。',
    principles: ['组合收益需通过消融实验理解。', '实现复杂度和调参成本更高。'],
    steps: [
      '构建组合网络',
      '分布式 target',
      '优先 replay',
      '多步更新',
      'noisy exploration',
    ],
    related: ['double-dqn', 'dueling-dqn', 'prioritized-experience-replay'],
  },
  {
    slug: 'policy-based-methods',
    title: 'Policy-based Methods',
    difficulty: '进阶',
    subcategory: 'Policy-based',
    summary: '直接参数化并优化策略，适合随机和连续动作。',
    definition: 'Policy-based 方法直接学习 πθ(a|s) 或确定性动作映射。',
    intuition: '不先给每个动作打完整分，而直接调整“怎么选”。',
    principles: [
      '随机策略自然支持探索。',
      '梯度估计通常高方差。',
      'on-policy 数据不能无限复用。',
    ],
    steps: ['采样策略轨迹', '估计回报/advantage', '构造策略目标', '梯度更新'],
    related: ['policy-gradient', 'reinforce', 'actor-critic'],
  },
  {
    slug: 'policy-gradient',
    title: 'Policy Gradient',
    difficulty: '进阶',
    subcategory: 'Policy-based',
    summary: '沿期望回报对策略参数的梯度直接更新策略。',
    definition:
      '策略梯度定理把环境动力学的未知导数消去，使用 score function 估计。',
    intuition: '提高带来正 advantage 的动作概率，降低负 advantage 动作概率。',
    principles: [
      '使用 log probability 梯度。',
      'baseline 不应依赖当前动作以保持无偏。',
      '重要性比率可用于新旧策略比较。',
    ],
    steps: ['采样轨迹', '估计 G 或 A', '累加 logπ×A', '梯度上升'],
    algorithmType: 'Policy-based',
    on: true,
    formula: {
      label: 'Policy Gradient',
      expression:
        '\\nabla_\\theta J(\\theta)=\\mathbb{E}[\\nabla_\\theta\\log\\pi_\\theta(A_t|S_t)\\,A_t^\\pi]',
      description: '优势为正时提升所选动作概率。',
    },
    related: ['reinforce', 'actor-critic', 'ppo'],
  },
  {
    slug: 'reinforce',
    title: 'REINFORCE',
    difficulty: '进阶',
    subcategory: 'Policy-based',
    summary: '用完整轨迹回报作为策略梯度权重的 Monte Carlo 算法。',
    definition: 'REINFORCE 在 episode 后用 Gt∇logπ 更新。',
    intuition: '整局表现好就强化其中动作，表现差就削弱。',
    principles: [
      '无 bootstrap 但方差高。',
      '概率策略支持探索。',
      'baseline 和 entropy 改善训练。',
    ],
    steps: [
      '采样 episode',
      '计算每步 G',
      '减 baseline',
      '计算 policy loss',
      '更新',
    ],
    algorithmType: 'Monte Carlo policy gradient',
    on: true,
    formula: {
      label: 'REINFORCE 更新',
      expression:
        '\\theta\\leftarrow\\theta+\\alpha G_t\\nabla_\\theta\\log\\pi_\\theta(A_t|S_t)',
      description: '轨迹回报加权对数概率梯度。',
    },
    code: reinforceCode,
    interactiveDemo: 'policy-gradient',
    related: ['baseline-advantage-entropy', 'actor-critic', 'q-learning'],
  },
  {
    slug: 'baseline-advantage-entropy',
    title: 'Baseline、Advantage 与 Entropy',
    difficulty: '进阶',
    subcategory: 'Policy-based',
    summary: '用 baseline 降低方差、advantage 衡量相对好坏、entropy 维持探索。',
    definition: 'A(s,a)=Q(s,a)−V(s)；熵奖励鼓励更分散动作概率。',
    intuition: '不问绝对得分，而问“比这个局面的正常水平好多少”。',
    principles: [
      'baseline 不应引入动作依赖偏差。',
      'entropy 系数过大妨碍收敛。',
    ],
    steps: ['估计 V', '计算 A', '标准化可选', '加入 entropy bonus'],
    formula: {
      label: 'Advantage',
      expression: 'A^\\pi(s,a)=Q^\\pi(s,a)-V^\\pi(s)',
      description: '动作相对状态平均水平的优势。',
    },
    related: ['reinforce', 'gae', 'ppo'],
  },
  {
    slug: 'actor-critic',
    title: 'Actor-Critic',
    difficulty: '进阶',
    subcategory: 'Actor-Critic',
    summary: 'Actor 输出策略，Critic 估计价值并提供低方差学习信号。',
    definition: 'Actor 负责行动分布，Critic 用 TD 学习评价状态/动作。',
    intuition: '演员负责表演，评论家及时指出比预期好还是差。',
    principles: [
      'Critic 引入 bootstrap 偏差换取较低方差。',
      'TD error 可作为 advantage。',
      '两者学习速度失衡会不稳定。',
    ],
    steps: [
      'Actor 采样动作',
      '环境返回 transition',
      'Critic 计算 δ',
      '更新 Critic',
      '用 δ 更新 Actor',
    ],
    algorithmType: 'Actor-Critic',
    on: true,
    formula: {
      label: 'Actor-Critic 更新信号',
      expression:
        '\\delta_t=R_{t+1}+\\gamma V_w(S_{t+1})-V_w(S_t),\\quad \\theta\\leftarrow\\theta+\\alpha_\\theta\\delta_t\\nabla_\\theta\\log\\pi_\\theta(A_t|S_t)',
      description: 'Critic 的 TD error 指导 Actor。',
    },
    interactiveDemo: 'policy-gradient',
    related: ['a2c-a3c', 'gae', 'ppo'],
  },
  {
    slug: 'a2c-a3c',
    title: 'A2C 与 A3C',
    difficulty: '挑战',
    subcategory: 'Actor-Critic',
    summary: '同步或异步并行环境收集 Actor-Critic 数据。',
    definition: 'A3C 异步更新共享参数，A2C 常同步聚合多个环境。',
    intuition: '多个探索者并行采样；同步像统一开会，异步像随到随报。',
    principles: ['并行减少样本相关性。', '异步更新存在参数陈旧。'],
    steps: [
      '并行 rollout',
      '计算 n-step return',
      '聚合/异步梯度',
      '更新共享模型',
    ],
    related: ['actor-critic', 'ppo'],
  },
  {
    slug: 'gae',
    title: 'Generalized Advantage Estimation（GAE）',
    difficulty: '挑战',
    subcategory: 'Actor-Critic',
    summary: '用 λ 加权多步 TD residual，在偏差与方差间调节 advantage。',
    definition: 'GAE 是折扣 TD error 的指数加权和。',
    intuition: '综合一步到多步的评价，而不是只信一个时间尺度。',
    principles: [
      'λ=0 接近一步 TD。',
      'λ→1 接近长回报。',
      '终止 mask 必须正确。',
    ],
    steps: ['计算每步 δ', '反向递推 GAE', '构造 return', '标准化 advantage'],
    formula: {
      label: 'GAE',
      expression:
        '\\hat A_t^{GAE(\\gamma,\\lambda)}=\\sum_{l=0}^{\\infty}(\\gamma\\lambda)^l\\delta_{t+l}',
      description: 'λ 控制多步权重衰减。',
    },
    related: ['actor-critic', 'ppo'],
  },
  {
    slug: 'ddpg',
    title: 'DDPG',
    difficulty: '挑战',
    subcategory: 'Actor-Critic',
    summary: '连续动作下的 off-policy 确定性 Actor-Critic。',
    definition:
      'Actor 输出确定性动作，Critic 估计 Q，使用 replay 和 target networks。',
    intuition: 'Actor 直接给油门值，Critic 对这个连续动作打分。',
    principles: ['需要探索噪声。', '易受 Q 过估计与超参数影响。'],
    steps: [
      '行为加噪声',
      '存 Replay',
      '更新 Critic',
      '通过 Critic 梯度更新 Actor',
      '软更新 Target',
    ],
    algorithmType: 'Deterministic Actor-Critic',
    off: true,
    action: '连续',
    related: ['td3', 'sac'],
  },
  {
    slug: 'td3',
    title: 'TD3',
    difficulty: '挑战',
    subcategory: 'Actor-Critic',
    summary: '以双 Critic、延迟 Actor 和目标策略平滑改进 DDPG。',
    definition: 'TD3 取两个 target Q 的最小值，并降低 Actor 更新频率。',
    intuition: '两个评委取更保守分数，演员不必每次都跟着噪声调整。',
    principles: ['缓解过估计。', 'target action 加平滑噪声。'],
    steps: ['采样 Replay', '双 Critic 更新', '延迟 Actor', '软更新 Target'],
    algorithmType: 'Deterministic Actor-Critic',
    off: true,
    action: '连续',
    related: ['ddpg', 'sac'],
  },
  {
    slug: 'sac',
    title: 'Soft Actor-Critic（SAC）',
    difficulty: '挑战',
    subcategory: 'Actor-Critic',
    summary: '最大熵 off-policy Actor-Critic，在回报与策略熵之间优化。',
    definition: 'SAC 学习随机策略，并把 entropy 纳入目标。',
    intuition: '不仅追求高分，也保留多样选择，避免过早确定。',
    principles: [
      'Replay 提高样本效率。',
      '温度 α 控制熵。',
      '常用于连续动作。',
    ],
    steps: [
      '采样 Replay',
      '更新双 Q',
      '更新随机 Actor',
      '调节温度',
      '软更新 target',
    ],
    algorithmType: 'Stochastic Actor-Critic',
    off: true,
    action: '连续',
    formula: {
      label: '最大熵目标',
      expression:
        'J(\\pi)=\\mathbb{E}[\\sum_t R_t+\\alpha\\mathcal{H}(\\pi(\\cdot|S_t))]',
      description: '同时奖励回报与策略熵。',
    },
    related: ['td3', 'ppo'],
  },
  {
    slug: 'ppo',
    title: 'PPO：Proximal Policy Optimization',
    difficulty: '挑战',
    subcategory: '现代策略与偏好优化',
    summary:
      '用概率比率裁剪限制策略单次更新幅度的 on-policy Actor-Critic 方法。',
    definition:
      'PPO 交替采样当前策略数据并对 clipped surrogate objective 做多轮 mini-batch 优化。',
    intuition:
      '允许策略改进，但若新策略偏离旧策略太远，就停止继续放大这部分收益。',
    principles: [
      '普通策略梯度更新过大会破坏策略。',
      'ratio 比较新旧策略动作概率。',
      'clip 不是硬性 KL 保证，但构造保守代理目标。',
      '真实训练还组合 value loss、entropy bonus 与 GAE。',
    ],
    steps: [
      '用 old policy 收集 rollout',
      '估计 returns/GAE',
      '保存 old log probability',
      '多 epoch mini-batch',
      '优化 clipped policy loss + value loss − entropy bonus',
      '丢弃旧 rollout 再采样',
    ],
    algorithmType: 'On-policy Actor-Critic',
    on: true,
    action: '离散或连续',
    formula: {
      label: 'PPO clipped objective',
      expression:
        'L^{CLIP}(\\theta)=\\mathbb{E}_t[\\min(r_t(\\theta)\\hat A_t,\\operatorname{clip}(r_t(\\theta),1-\\epsilon,1+\\epsilon)\\hat A_t)]',
      description: '取未裁剪与裁剪目标的较小值。',
    },
    variables: [
      { symbol: 'r_t(θ)', meaning: '新旧策略对已采样动作的概率比。' },
      { symbol: 'Â_t', meaning: 'Advantage 估计，常用 GAE。' },
      { symbol: 'ε', meaning: 'clip range。' },
      { symbol: 'π_old', meaning: '收集当前 rollout 的旧策略。' },
    ],
    code: ppoCode,
    interactiveDemo: 'ppo',
    sources: [ppoPaper],
    sections: [
      'PPO 原论文 / §3 Clipped Surrogate Objective',
      'PPO 原论文 / Algorithm 1',
    ],
    related: ['gae', 'actor-critic', 'grpo', 'dpo'],
    extra: {
      objectiveFunction: 'clipped surrogate + value loss + entropy bonus',
      advantageEstimator: '常用 GAE',
      clipRange: '常见 0.1–0.2，需按任务调节',
      trainingLoop: ['rollout', 'GAE', 'mini-batch 多 epoch', '重新采样'],
      comparisonNotes: [
        '传统意义策略优化算法',
        'on-policy',
        '通常不使用跨 rollout replay buffer',
      ],
    },
  },
  {
    slug: 'reward-model-rlhf-rlaif-rft',
    title: 'Reward Model、RLHF、RLAIF 与 RFT',
    difficulty: '挑战',
    subcategory: '现代策略与偏好优化',
    summary: '区分奖励建模、反馈来源和强化微调训练循环。',
    definition:
      'RLHF 使用人类反馈，RLAIF 使用 AI 反馈；RFT 泛指通过可评分反馈进行强化微调，具体产品定义需查对应文档。',
    intuition: '先定义怎样评分输出，再让策略提高得分，但评分器本身可能有偏差。',
    principles: [
      'Reward Model 近似偏好。',
      '策略优化需限制偏离参考策略。',
      '可验证奖励与主观偏好具有不同噪声结构。',
    ],
    steps: [
      '收集/生成反馈',
      '训练或定义奖励',
      '策略采样',
      '评分',
      '策略更新',
      '评测奖励黑客',
    ],
    related: ['ppo', 'grpo', 'dpo', 'alignment-training-risks'],
  },
  {
    slug: 'dpo',
    title: 'DPO：Direct Preference Optimization',
    difficulty: '挑战',
    subcategory: '现代策略与偏好优化',
    summary:
      '直接用 chosen/rejected 偏好对优化策略相对 reference 的概率差，不运行传统在线 RL 循环。',
    definition: 'DPO 将带 KL 约束的 RLHF 最优策略关系转写为二分类式偏好目标。',
    intuition:
      '让策略相对参考模型更偏向 chosen、远离 rejected，而不是先训练显式 Reward Model 再在线采样优化。',
    principles: [
      '输入是离线 preference pairs。',
      '不需要显式训练独立 Reward Model。',
      '训练时不需要传统在线环境采样循环。',
      'DPO 不应简单描述为标准 MDP 在线 RL 算法。',
    ],
    steps: [
      '准备 prompt/chosen/rejected',
      '计算 policy 序列 log-prob',
      '计算 reference log-prob',
      '构造相对 margin',
      'log-sigmoid loss',
      '离线优化并评测',
    ],
    algorithmType: 'Offline preference optimization objective',
    on: false,
    off: false,
    action: '文本响应序列',
    formula: {
      label: 'DPO loss',
      expression:
        '\\mathcal{L}_{DPO}=-\\mathbb{E}_{(x,y_w,y_l)}\\log\\sigma(\\beta[\\log\\frac{\\pi_\\theta(y_w|x)}{\\pi_{ref}(y_w|x)}-\\log\\frac{\\pi_\\theta(y_l|x)}{\\pi_{ref}(y_l|x)}])',
      description: '提高 chosen 相对 reference 的优势，并降低 rejected。',
    },
    variables: [
      { symbol: 'y_w', meaning: 'chosen response。' },
      { symbol: 'y_l', meaning: 'rejected response。' },
      { symbol: 'π_ref', meaning: '冻结参考策略。' },
      { symbol: 'β', meaning: '偏好间隔缩放/隐含 KL 强度相关参数。' },
    ],
    code: dpoCode,
    interactiveDemo: 'dpo-grpo',
    sources: [dpoPaper],
    sections: [
      'DPO 原论文 / §4 Direct Preference Optimization',
      'DPO 原论文 / Eq. 7',
    ],
    related: ['ppo', 'grpo', 'reward-model-rlhf-rlaif-rft'],
    extra: {
      objectiveFunction: '二分类式 DPO loss',
      referencePolicy: '冻结 reference model',
      rewardModel: '不显式训练独立 Reward Model',
      preferenceData: 'prompt + chosen + rejected 离线偏好对',
      klConstraint: '通过相对 reference 的目标隐式体现',
      comparisonNotes: [
        '不是传统在线 MDP RL',
        '无需 rollout/replay buffer',
        '高度依赖偏好数据覆盖与质量',
      ],
    },
  },
  {
    slug: 'grpo',
    title: 'GRPO：Group Relative Policy Optimization',
    difficulty: '挑战',
    subcategory: '现代策略与偏好优化',
    summary:
      '对同一输入采样一组输出，用组内相对奖励估计 advantage，再进行带裁剪与 KL 的策略优化。',
    definition:
      'DeepSeekMath 提出的 GRPO 是 PPO 的变体，以组内奖励标准化替代独立 Value Model 的 advantage 估计。',
    intuition: '同一道题生成多份答案，不问绝对难度，而比较同组中谁明显更好。',
    principles: [
      'Group 是同一 prompt 的多条采样输出。',
      '组均值与标准差形成 relative advantage。',
      '原始 GRPO 设计避免独立 Critic/Value Model。',
      '仍需 reference policy/KL 与概率比率裁剪控制更新。',
    ],
    steps: [
      '对每个 prompt 从 old policy 采样 G 个输出',
      '奖励模型或规则评分',
      '组内标准化得到 advantage',
      '计算新旧策略 ratio',
      'clipped surrogate',
      '加入 KL 约束并更新',
      '重新采样新组',
    ],
    algorithmType: 'Group-relative policy optimization',
    on: true,
    action: '文本响应序列',
    formula: {
      label: '组相对 Advantage',
      expression:
        '\\hat A_i=\\frac{r_i-\\operatorname{mean}(r_1,\\ldots,r_G)}{\\operatorname{std}(r_1,\\ldots,r_G)+\\varepsilon}',
      description: '同一组内中心化和缩放奖励。',
    },
    variables: [
      { symbol: 'G', meaning: '同一 prompt 的采样输出数量。' },
      { symbol: 'r_i', meaning: '第 i 个输出奖励。' },
      { symbol: 'Â_i', meaning: '组相对 advantage。' },
      { symbol: 'π_ref', meaning: '用于 KL 约束的参考策略。' },
    ],
    code: grpoCode,
    interactiveDemo: 'dpo-grpo',
    sources: [grpoPaper],
    sections: [
      'DeepSeekMath / §4.1 Group Relative Policy Optimization',
      'DeepSeekMath / Figure 2 与公式',
    ],
    related: ['ppo', 'dpo', 'reward-model-rlhf-rlaif-rft'],
    extra: {
      objectiveFunction: 'group-relative clipped surrogate with KL',
      referencePolicy: '用于 KL 约束',
      rewardModel: '可用奖励模型或可验证规则奖励',
      groupData: '同一 prompt 的多条在线采样输出',
      advantageEstimator: '组内标准化奖励，不使用独立 Value Model',
      klConstraint: '限制策略偏离 reference',
      clipRange: 'PPO 风格 ratio clipping',
      comparisonNotes: [
        'PPO 变体',
        '原始设计不需要独立 Value Model',
        '奖励组质量和方差直接影响信号',
      ],
    },
  },
  {
    slug: 'ppo-grpo-dpo-comparison',
    title: 'PPO、GRPO 与 DPO 的区别',
    difficulty: '挑战',
    subcategory: '现代策略与偏好优化',
    summary: '区分在线策略优化、组相对在线优化和离线偏好目标。',
    definition:
      'PPO 是传统策略优化；GRPO 用组相对奖励进行策略优化；DPO 是离线偏好优化目标。',
    intuition:
      'PPO 用 rollout+critic，GRPO 用同题多答案相对评分，DPO 用已有 chosen/rejected 对。',
    principles: [
      '三者数据生成方式不同。',
      '是否需要 Value Model、Reward Model 和在线采样不同。',
      '不能仅因都用于对齐就视为同一算法。',
    ],
    steps: [
      '判断是否有在线采样',
      '判断是否有成对偏好或组奖励',
      '选择目标',
      '设置 reference/KL',
      '独立评测',
    ],
    interactiveDemo: 'dpo-grpo',
    related: ['ppo', 'grpo', 'dpo'],
  },
  {
    slug: 'alignment-training-risks',
    title: '对齐训练风险：奖励黑客、过拟合与分布偏移',
    difficulty: '挑战',
    subcategory: '现代策略与偏好优化',
    summary: '分析奖励模型误差、长度偏差、分布外偏好和训练不稳定。',
    definition: '当代理奖励与真实目标错位时，策略可能提高分数却降低真实质量。',
    intuition: '学生学会迎合评分漏洞而非真正掌握能力。',
    principles: [
      '奖励模型在策略分布外可能失真。',
      '偏好数据可能含长度/风格偏差。',
      'KL 约束、holdout 评测和对抗测试是缓解手段而非保证。',
    ],
    steps: [
      '审计奖励与偏好',
      '监测 KL 和长度',
      '保留独立评测',
      '红队奖励漏洞',
      '人工复核',
    ],
    related: ['reward-model-rlhf-rlaif-rft', 'dpo', 'grpo'],
  },
  {
    slug: 'model-free-vs-based',
    title: 'Model-free 与 Model-based RL',
    difficulty: '进阶',
    subcategory: '方法分类',
    summary: '区分直接学习价值/策略与学习或使用环境模型进行规划。',
    definition:
      'Model-free 不显式学习 P,R；Model-based 使用已知或学习模型预测。',
    intuition: '前者靠练习形成策略，后者还学习“世界如何变化”并在内部预演。',
    principles: ['模型可提高样本效率但引入模型偏差。', '规划成本可能很高。'],
    steps: ['判断模型可得性', '学习/使用模型', '规划或直接更新'],
    related: ['world-model-mpc', 'value-based-methods'],
  },
  {
    slug: 'on-vs-off-policy',
    title: 'On-policy 与 Off-policy',
    difficulty: '进阶',
    subcategory: '方法分类',
    summary: '区分生成数据的行为策略与被优化的目标策略是否相同。',
    definition:
      'On-policy 使用当前策略数据更新自身；off-policy 可用另一行为策略或旧数据学习目标策略。',
    intuition: '是在复盘自己当前打法，还是从别人/旧记录中学习另一打法。',
    principles: [
      'off-policy 需要处理分布差异。',
      'on-policy 数据通常更新后较快过期。',
    ],
    steps: [
      '标记 behavior policy',
      '标记 target policy',
      '判断是否相同',
      '选择校正机制',
    ],
    related: ['q-learning', 'sarsa', 'ppo'],
  },
  {
    slug: 'online-vs-offline-rl',
    title: 'Online Learning 与 Offline RL',
    difficulty: '挑战',
    subcategory: 'Offline RL',
    summary: '在线 RL 可继续探索环境，离线 RL 只能使用固定数据集。',
    definition:
      'Offline RL 从静态 transition 数据学习策略，训练阶段不能通过新试验纠正数据盲区。',
    intuition:
      '在线像边开车边练，离线像只看旧行车记录：记录之外的动作后果不能靠试一次来确认。',
    principles: [
      '固定数据把探索问题改造成覆盖与外推问题。',
      '分布外动作价值可能被严重高估。',
      '行为数据覆盖决定可学策略范围。',
      'DQN/SAC 虽是 off-policy，但其常规训练仍用环境交互刷新 replay；直接冻结 replay 并不自动成为可靠的 Offline RL。',
    ],
    steps: [
      '冻结并版本化数据集',
      '审计状态—动作—回报覆盖',
      '建立 BC 与朴素 DQN/SAC 基线',
      '使用约束、保守或隐式目标',
      '离线评测',
      '小流量或受保护部署',
    ],
    sources: [
      'https://arxiv.org/abs/2004.07219',
      'https://arxiv.org/abs/2006.04779',
    ],
    sections: [
      'D4RL / Abstract 与 §1：固定数据设定和数据集性质',
      'CQL / §1：标准 off-policy 方法在分布偏移下的过估计问题',
    ],
    related: [
      'offline-data-distribution-shift',
      'behavior-policy-constraints',
      'cql',
      'iql',
      'dqn',
      'sac',
    ],
    extra: {
      objectiveFunction:
        '从固定数据集 D 学习策略；训练期间不新增环境 transition',
      dataBoundary: [
        '允许读取固定的 (s,a,r,s′,done) 或轨迹数据。',
        '训练阶段禁止用当前策略向环境索取新样本；调参不能偷看测试环境回报。',
        '数据未覆盖区域没有反事实保证，部署必须受行动权限与回退策略保护。',
      ],
      comparisonNotes: [
        'DQN：离散动作、max backup，冻结数据后容易选择 OOD 高估动作。',
        'SAC：连续动作、最大熵 actor-critic；actor 可能提出数据外动作并被 critic 错误奖励。',
        'Offline RL：额外管理策略支持、价值保守性或仅对数据动作更新。',
      ],
      sourceDocuments: [
        {
          path: 'arXiv:2004.07219',
          title: 'D4RL: Datasets for Deep Data-Driven Reinforcement Learning',
          kind: '原始文档',
        },
        {
          path: 'arXiv:2006.04779',
          title: 'Conservative Q-Learning',
          kind: '原始文档',
        },
      ],
      extensionNotes: [
        '页面中的驾驶类比、六步学习流程、DQN/SAC 对照和部署边界是本站扩展解释；固定数据定义与分布偏移判断依据所列论文。',
      ],
    },
  },
  {
    slug: 'offline-data-distribution-shift',
    title: '离线数据分布偏移与外推误差',
    difficulty: '挑战',
    subcategory: 'Offline RL',
    summary:
      '理解数据占用分布、分布外动作、bootstrap 误差累积以及为什么固定 replay 会让朴素 DQN/SAC 失效。',
    definition:
      '离线数据由未知或混合行为策略 β 生成，而学习策略 π 会改变状态—动作占用分布；当 π 查询数据低密度区域的 Q 值时，函数近似误差可能经 Bellman backup 被反复放大。',
    intuition:
      '数据像一张只标出走过道路的地图。普通 greedy 更新可能把地图空白处的随机高分当成捷径，并在每次 bootstrap 中继续抬高它。',
    principles: [
      '分布偏移同时发生在动作条件分布 π(a|s) 与长期状态访问分布 d^π(s)。',
      '监督学习式训练误差小，不代表策略选择的动作上误差小。',
      'DQN 的 max_a Q(s′,a) 与 SAC 的 actor 采样都会主动寻找 critic 的高值，因而可能放大 OOD 乐观误差。',
      '覆盖是可辨识边界：没有数据或结构假设，就不能可靠比较任意未见动作。',
    ],
    steps: [
      '确认数据收集策略与时间范围',
      '按终止、任务、状态簇和动作统计覆盖',
      '比较行为动作与候选策略动作',
      '检查 Q 在数据动作和候选动作上的间隙',
      '用 BC/DQN/SAC 基线定位外推故障',
      '采用约束、CQL 或 IQL 并做压力测试',
    ],
    formula: {
      label: '占用分布密度比',
      expression: 'w(s,a)=\\frac{d^\\pi(s,a)}{d^\\beta(s,a)}',
      description:
        '当行为占用 d^β(s,a) 接近 0 而目标策略仍访问该区域时，密度比不可稳定估计，离线数据无法支持该决策。',
    },
    variables: [
      {
        symbol: 'd^β(s,a)',
        meaning: '行为策略及环境动力学在数据中诱导的折扣占用分布。',
      },
      { symbol: 'd^π(s,a)', meaning: '待部署策略诱导的目标占用分布。' },
      {
        symbol: 'w(s,a)',
        meaning: '目标与行为占用密度比；极大值提示覆盖风险。',
      },
      { symbol: 'OOD', meaning: '相对数据支持而言的分布外状态或动作。' },
    ],
    code: offlineShiftCode,
    sources: [
      'https://arxiv.org/abs/1906.00949',
      'https://arxiv.org/abs/2004.07219',
    ],
    sections: [
      'BEAR / Abstract、§3：OOD 动作上的 bootstrapping error 与误差传播',
      'D4RL / §2–§3：离线数据集的分布性质与基准设计',
    ],
    related: [
      'online-vs-offline-rl',
      'behavior-policy-constraints',
      'cql',
      'iql',
      'dqn',
      'sac',
      'bellman-equation',
    ],
    extra: {
      objectiveFunction: '识别并限制 d^π 相对 d^β 的不受支持偏移',
      dataBoundary: [
        '行为策略 β 可能未知、非平稳或由多策略混合。',
        '覆盖统计只能证明看见过，不能证明奖励正确、长时序后果充分或部署安全。',
        '离线调参若反复依据在线回报，会把评测环境变成隐式训练数据。',
      ],
      failureModes: [
        '把 replay buffer 大误当作覆盖充分',
        '只看边际动作频率，忽略状态条件覆盖',
        '终止/超时标记错误导致虚假 bootstrap',
        '用训练集 Q 值代替策略价值评测',
      ],
      securityRisks: [
        '历史日志可能含隐私、异常操作或已废止权限。',
        '策略会利用日志中的奖励漏洞，数据清洗不能替代环境侧硬约束。',
      ],
      performanceNotes: [
        '报告数据规模、轨迹数、行为策略混合和 return 分布。',
        '按数据子集与随机种子报告不确定性；OOD 分数本身也需校准。',
      ],
      comparisonNotes: [
        'DQN 的离散 max backup 明确枚举并偏好最高估动作。',
        'SAC 的 actor 在连续空间优化 Q−αlogπ，可能找到数据外的 critic 漏洞。',
        'CQL 压低广泛动作的 Q；IQL 避免对策略生成的新动作求 Q。',
      ],
      sourceDocuments: [
        {
          path: 'arXiv:1906.00949',
          title:
            'Stabilizing Off-Policy Q-Learning via Bootstrapping Error Reduction',
          kind: '原始文档',
        },
        { path: 'arXiv:2004.07219', title: 'D4RL', kind: '原始文档' },
      ],
      extensionNotes: [
        '道路地图直觉、覆盖审计清单、NumPy support mask 与 DQN/SAC 教学对照均为本站扩展解释；bootstrapping error 与数据集性质依据所列论文。',
      ],
    },
  },
  {
    slug: 'behavior-policy-constraints',
    title: '行为策略约束：在数据支持内改进',
    difficulty: '挑战',
    subcategory: 'Offline RL',
    summary:
      '用行为克隆、KL/MMD 距离、生成模型或优势加权回归控制策略偏离数据分布。',
    definition:
      '行为策略约束把策略改进限制在数据支持附近，避免 actor 或 Bellman backup 选择行为数据几乎未覆盖的动作。约束对象可以是显式估计的 β、样本集合或隐式加权的行为克隆。',
    intuition:
      '不是禁止超越示范者，而是要求每次改进都有历史证据：先沿着走过的路挑更好路段，再谨慎决定是否扩大边界。',
    principles: [
      '纯 Behavior Cloning 最稳但通常不能利用奖励超越行为策略。',
      '显式 KL 需要可靠的行为策略密度；多峰数据被单峰模型拟合时可能制造不存在的中间动作。',
      'BEAR 用样本 MMD 约束策略动作与行为数据动作；BCQ 通过生成候选并做小扰动限制动作。',
      'IQL 的优势加权行为克隆是一种隐式支持约束；CQL 则主要约束价值而非直接约束策略距离。',
    ],
    steps: [
      '训练 BC 并检查验证集负对数似然',
      '按状态生成行为支持内候选动作',
      '定义 KL、MMD、扰动半径或优势权重',
      '在约束内最大化 Q 或加权似然',
      '监测策略—行为距离和有效样本数',
      '对低支持状态回退到安全策略',
    ],
    formula: {
      label: '受行为分布约束的策略改进',
      expression:
        '\\max_\\pi\\;\\mathbb{E}_{s\\sim\\mathcal D,a\\sim\\pi}[Q(s,a)]\\quad\\text{s.t.}\\quad D(\\pi(\\cdot|s),\\beta(\\cdot|s))\\le\\varepsilon',
      description: 'D 可取 KL、MMD 或其他支持距离；ε 控制改进幅度与外推风险。',
    },
    variables: [
      { symbol: 'β(a|s)', meaning: '产生离线数据的行为策略或其估计。' },
      { symbol: 'π(a|s)', meaning: '待学习策略。' },
      { symbol: 'D(π,β)', meaning: '策略与行为分布之间的距离或支持差异。' },
      { symbol: 'ε', meaning: '允许偏离行为策略的预算。' },
    ],
    code: behaviorConstraintCode,
    sources: [
      'https://arxiv.org/abs/1906.00949',
      'https://arxiv.org/abs/1812.02900',
      'https://arxiv.org/abs/2110.06169',
    ],
    sections: [
      'BEAR / §4：MMD 行为支持约束与算法',
      'BCQ / Abstract 与方法：生成式行为候选和小扰动',
      'IQL / §4：advantage-weighted behavioral cloning 策略提取',
    ],
    related: [
      'offline-data-distribution-shift',
      'iql',
      'cql',
      'imitation-inverse-rl',
      'sac',
    ],
    extra: {
      objectiveFunction: '在行为支持约束内最大化估计价值',
      referencePolicy: '数据行为策略 β、其生成模型或数据动作本身',
      dataBoundary: [
        '若 β 未记录，只能从有限数据估计；低密度状态的约束可信度更低。',
        '行为支持包含危险动作并不代表它们可部署，安全约束仍应独立执行。',
        '过强约束退化为 BC，过弱约束重新暴露 OOD 价值误差。',
      ],
      failureModes: [
        '行为模型 mode collapse 丢失合法动作模式',
        '用单一 KL 阈值覆盖所有状态',
        '指数优势权重溢出或有效样本数塌缩',
        '把接近历史行为误当作安全证明',
      ],
      securityRisks: [
        '历史行为可能违反新法规或权限边界。',
        '部署必须保留拒绝、回退、人工审批与审计日志。',
      ],
      performanceNotes: [
        '同时报告 return、策略—行为距离和权重有效样本数。',
        '连续动作约束通常需要多次动作采样，计算成本随候选数增长。',
      ],
      comparisonNotes: [
        'DQN 没有显式 actor，约束通常施加在 backup 的可选动作或 Q 上。',
        'SAC actor 可直接加 KL/BC 项，但固定数据下仅靠 entropy 不能防止 OOD。',
        'CQL 通过保守 Q 间接改变 actor；IQL 用数据动作的优势加权 BC 提取策略。',
      ],
      sourceDocuments: [
        { path: 'arXiv:1906.00949', title: 'BEAR', kind: '原始文档' },
        { path: 'arXiv:1812.02900', title: 'BCQ', kind: '原始文档' },
        {
          path: 'arXiv:2110.06169',
          title: 'Implicit Q-Learning',
          kind: '原始文档',
        },
      ],
      extensionNotes: [
        '道路类比、约束选型清单、NumPy 优势加权示例和安全回退建议为本站扩展解释；算法依据来自 BEAR、BCQ 与 IQL 原论文。',
      ],
    },
  },
  {
    slug: 'cql',
    title: 'CQL：Conservative Q-Learning',
    difficulty: '挑战',
    subcategory: 'Offline RL',
    summary:
      '在 Bellman 误差之外惩罚数据外高 Q，并相对抬高数据动作，学习保守的价值函数。',
    definition:
      'CQL 是可叠加到 DQN 或 actor-critic 骨架上的离线 RL 方法族；其核心正则项扩大广泛动作与数据动作的 Q 差异惩罚，使策略不易利用缺少数据证据的乐观价值。',
    intuition:
      '普通 critic 像容易被陌生选项的夸张评分骗过；CQL 给“没在历史记录里却得分很高”的选项收取怀疑税。',
    principles: [
      '离散动作 CQL 可用 logsumexp 聚合所有动作；连续动作常以均匀分布和当前策略采样近似。',
      '保守项与 Bellman 项共同优化，α 过小防不住外推，过大会压低真正有价值的动作。',
      'CQL 的理论结论依赖论文中的采样、函数类和优化假设，不能把经验 Q 一律解释为逐点真实下界。',
      'CQL-DQN 对应离散动作；CQL-SAC 常保留双 critic、actor 与温度结构，再给 critic 加保守正则。',
    ],
    steps: [
      '从固定数据采样 transition batch',
      '计算数据动作 Q 与 TD target',
      '采样或枚举比较动作',
      '计算 logsumexp 或重要性修正的保守 gap',
      '更新 critic',
      '用保守 critic 更新 actor 或取 greedy',
      '独立调节 α 并离线评测',
    ],
    formula: {
      label: '离散动作 CQL(H) 目标（教学化写法）',
      expression:
        '\\min_Q\\;\\alpha\\,\\mathbb{E}_{s\\sim\\mathcal D}\\left[\\log\\sum_a e^{Q(s,a)}-\\mathbb{E}_{a\\sim\\beta(\\cdot|s)}Q(s,a)\\right]+\\frac12\\mathbb{E}_{(s,a,s\\prime)\\sim\\mathcal D}\\left[Q(s,a)-\\mathcal B^\\pi\\bar Q(s,a)\\right]^2',
      description:
        '第一项压低广泛动作相对数据动作的价值，第二项保持 Bellman 一致性；连续动作实现需采样近似。',
    },
    variables: [
      { symbol: 'α', meaning: '保守正则强度。' },
      { symbol: 'β', meaning: '数据行为策略。' },
      {
        symbol: 'B^π Q̄',
        meaning: '由 target critic 与目标策略构造的 Bellman target。',
      },
      { symbol: 'log∑exp Q', meaning: '对高 Q 动作敏感的平滑最大值。' },
    ],
    code: cqlCode,
    sources: ['https://arxiv.org/abs/2006.04779'],
    sections: [
      'CQL 原论文 / §3.1：保守 Q 目标与下界性质',
      'CQL 原论文 / Eq. 4：CQL(H) 实际目标',
      'CQL 原论文 / Appendix F：基于 SAC 的实现细节',
    ],
    related: [
      'offline-data-distribution-shift',
      'behavior-policy-constraints',
      'iql',
      'dqn',
      'sac',
      'bellman-equation',
    ],
    extra: {
      objectiveFunction: 'Bellman error + α × conservative Q regularizer',
      dataBoundary: [
        '需要带奖励、下一状态与终止标记的固定 transition；不是只靠 (s,a) 的行为克隆。',
        '连续动作 logsumexp 依赖有限采样近似，proposal 覆盖不足会漏掉高估区域。',
        'α 是数据质量相关参数；不能用测试环境反复在线试出来后仍声称纯离线选择。',
      ],
      failureModes: [
        'α 太大导致过度保守，优质稀有动作被压低',
        'α 太小退化为朴素 DQN/SAC',
        '连续动作重要性修正或 log-prob 符号错误',
        '超时 transition 被当成真实终止',
      ],
      securityRisks: [
        '保守价值不是安全约束，仍需限制动作集合与成本。',
        '数据投毒可通过虚假高奖励 transition 改变数据动作基准。',
      ],
      performanceNotes: [
        'CQL-SAC 比普通 SAC 多次采样动作并计算 logsumexp，计算与显存开销更高。',
        '报告 α、自动拉格朗日版本、候选动作数、数据版本和多 seed 结果。',
      ],
      comparisonNotes: [
        'DQN：同样可用 target network 和 Bellman loss；CQL 额外压低非数据动作的高 Q。',
        'SAC：同样可用双 Q 和随机 actor；CQL-SAC 的关键差异在 critic 的保守正则。',
        'IQL：不显式枚举或采样 OOD 动作做价值惩罚，而以 expectile V 和数据动作策略回归完成隐式改进。',
      ],
      sourceDocuments: [
        {
          path: 'arXiv:2006.04779',
          title: 'Conservative Q-Learning for Offline Reinforcement Learning',
          kind: '原始文档',
        },
      ],
      extensionNotes: [
        '“怀疑税”直觉、PyTorch 两样本示例、DQN/SAC/IQL 对照、工程检查项均为本站扩展解释；目标与算法性质以 CQL 原论文为准。',
      ],
    },
  },
  {
    slug: 'iql',
    title: 'IQL：Implicit Q-Learning',
    difficulty: '挑战',
    subcategory: 'Offline RL',
    summary:
      '用上 expectile 价值、只含数据动作的 Q 更新和优势加权行为克隆，避免训练时评价策略生成的未见动作。',
    definition:
      'IQL 交替拟合数据动作 Q 的状态条件上 expectile V、用 V(s′) 更新 Q，再以 exp(β(Q−V)) 加权数据动作的对数似然提取策略。',
    intuition:
      '先从每个状态已有记录中估计“较好但仍有证据”的门槛，再更认真模仿超过门槛的动作；不要求 critic 给从未记录的新动作打分。',
    principles: [
      'expectile τ>0.5 更重视 Q 高于 V 的数据动作，但它不是分位数。',
      'Q target 使用 V(s′)，策略训练只评价数据动作的 log probability。',
      '指数优势权重必须裁剪或归一化，否则极少数样本会主导 actor。',
      'IQL 避免显式 OOD action query，但函数近似泛化、状态覆盖和部署分布偏移仍存在。',
    ],
    steps: [
      '从固定数据采样 batch',
      '冻结 Q 目标计算 Q(s,a)−V(s)',
      '用非对称平方损失更新 V',
      '用 r+γV(s′) 更新 Q',
      '计算数据动作 advantage',
      '用裁剪后的 exp(βA) 做行为克隆',
      '评测并可选在线微调',
    ],
    formula: {
      label: 'IQL 的三个目标',
      expression:
        'L_V=\\mathbb E_{(s,a)\\sim\\mathcal D}[L_2^\\tau(\\bar Q(s,a)-V(s))],\\quad L_Q=\\mathbb E_{\\mathcal D}[(r+\\gamma V(s\\prime)-Q(s,a))^2],\\quad L_\\pi=-\\mathbb E_{\\mathcal D}[e^{\\beta(\\bar Q-V)}\\log\\pi(a|s)]',
      description:
        'V 做 expectile regression，Q 只对数据 transition 做 TD，策略只对数据动作做优势加权最大似然。',
    },
    variables: [
      {
        symbol: 'τ',
        meaning: 'expectile 参数；τ>0.5 偏向数据动作中的较高 Q。',
      },
      { symbol: 'L₂^τ(u)', meaning: '|τ−1(u<0)|u² 的非对称平方损失。' },
      { symbol: 'β', meaning: '优势权重的逆温度，越大越偏向高优势样本。' },
      { symbol: 'Q̄', meaning: '停止梯度或 target Q，用于稳定 V 与策略目标。' },
    ],
    code: iqlCode,
    sources: ['https://arxiv.org/abs/2110.06169'],
    sections: [
      'IQL 原论文 / §4.1：上 expectile value function',
      'IQL 原论文 / Eq. 5–7：V、Q 与策略提取目标',
      'IQL 原论文 / Algorithm 1：完整训练循环',
    ],
    related: [
      'offline-data-distribution-shift',
      'behavior-policy-constraints',
      'cql',
      'sac',
      'advantage-baseline-entropy',
    ],
    extra: {
      objectiveFunction:
        'expectile V regression + TD Q regression + advantage-weighted behavioral cloning',
      advantageEstimator: 'A(s,a)=Q(s,a)−V(s)，仅在数据动作上计算',
      dataBoundary: [
        '训练需要固定 transition 和数据动作；策略目标不对新动作求 Q，但最终策略仍可能因泛化产生数据外动作。',
        'τ 与 β 决定保守—改进权衡，应随数据质量验证。',
        '在线微调是单独阶段；一旦新增环境数据，必须与纯离线结果分开报告。',
      ],
      failureModes: [
        '把 expectile 当成 quantile 实现',
        'Q/V target 未停止梯度导致耦合不稳',
        'exp(βA) 溢出或有效样本数过低',
        '数据回报尺度变化后沿用原 β',
      ],
      securityRisks: [
        '高优势历史动作可能来自奖励漏洞或越权行为。',
        '部署仍需动作过滤、回退策略和分阶段放量。',
      ],
      performanceNotes: [
        '无需为每个状态采样大量候选动作，通常比采样式 CQL 简洁。',
        '报告 τ、β、权重上限、奖励归一化、target 更新与多 seed。',
      ],
      comparisonNotes: [
        'DQN：使用 max_a Q(s′,a)；IQL 改用 V(s′)，避免下一步 OOD max。',
        'SAC：actor 采样动作并通过 Q 更新；IQL actor 仅对数据动作做加权最大似然。',
        'CQL：显式惩罚可能的 OOD 高 Q；IQL 通过不查询这些动作来规避训练时外推。',
      ],
      sourceDocuments: [
        {
          path: 'arXiv:2110.06169',
          title: 'Offline Reinforcement Learning with Implicit Q-Learning',
          kind: '原始文档',
        },
      ],
      extensionNotes: [
        '门槛类比、PyTorch 三损失教学代码、部署边界与 DQN/SAC/CQL 对照均为本站扩展解释；expectile 与 Algorithm 1 依据 IQL 原论文。',
      ],
    },
  },
  {
    slug: 'pomdp',
    title: 'Partial Observability 与 POMDP',
    difficulty: '挑战',
    subcategory: '挑战专题',
    summary: '观察不足以确定真实状态时，用历史、belief 或记忆决策。',
    definition: 'POMDP 增加隐藏状态与观测模型。',
    intuition: '只看到雾中局部信息，需要根据历史推断位置。',
    principles: ['Observation 不等于 State。', 'belief 是状态概率分布。'],
    steps: ['收集观察历史', '更新 belief', '按 belief 决策'],
    related: ['markov-property', 'rnn-lstm-gru'],
  },
  {
    slug: 'sparse-delay-credit',
    title: '稀疏/延迟奖励与 Credit Assignment',
    difficulty: '挑战',
    subcategory: '挑战专题',
    summary: '解决奖励少、来得晚以及如何归因到早期动作。',
    definition: 'Credit assignment 决定哪些历史动作应对结果负责。',
    intuition: '项目最后成功，难点是判断前面哪些决定真正贡献。',
    principles: [
      '更长 horizon 增加方差。',
      'reward shaping 可能改变最优策略。',
    ],
    steps: ['分析奖励时延', '设计可保持最优性的 shaping', '使用多步/trace'],
    related: ['reward-shaping-safe-robust', 'td-learning'],
  },
  {
    slug: 'multi-agent-hierarchical-rl',
    title: 'Multi-Agent 与 Hierarchical RL',
    difficulty: '挑战',
    subcategory: '挑战专题',
    summary: '处理多主体相互影响或高层目标—低层技能分解。',
    definition:
      'MARL 中环境随其他 Agent 学习而非平稳；HRL 用 option/skill 分层决策。',
    intuition: '团队协作与公司层级都增加协调问题。',
    principles: ['联合动作空间爆炸。', '集中训练分散执行是一类常见范式。'],
    steps: ['定义角色/层级', '设计共享信息', '训练与独立评测'],
    related: ['agent-orchestration', 'reinforcement-learning-overview'],
  },
  {
    slug: 'imitation-inverse-rl',
    title: 'Imitation Learning 与 Inverse RL',
    difficulty: '挑战',
    subcategory: '挑战专题',
    summary: '从专家行为直接模仿，或反推出潜在奖励。',
    definition: '行为克隆做监督学习；Inverse RL 推断解释专家轨迹的奖励。',
    intuition: '一个学动作，一个猜专家为什么这样做。',
    principles: ['行为克隆有 compounding error。', '奖励不可辨识。'],
    steps: ['收集专家轨迹', '选择 BC/IRL', '训练', '处理分布偏移'],
    related: ['online-vs-offline-rl', 'reward-model-rlhf-rlaif-rft'],
  },
  {
    slug: 'world-model-mpc',
    title: 'World Model、Planning 与 MPC',
    difficulty: '挑战',
    subcategory: '挑战专题',
    summary: '学习环境动力学并滚动规划未来动作。',
    definition:
      'World Model 预测未来；MPC 每步规划有限 horizon、执行首个动作后重规划。',
    intuition: '在脑中预演几步，只执行当前一步，再根据真实反馈修正。',
    principles: [
      '模型偏差会在多步 rollout 累积。',
      '短 horizon 减少误差但可能短视。',
    ],
    steps: ['学习模型', '采样候选计划', '预测回报', '执行首步', '重规划'],
    related: ['model-free-vs-based', 'search-planning-decision'],
  },
  {
    slug: 'reward-shaping-safe-robust',
    title: 'Reward Shaping、Safe 与 Robust RL',
    difficulty: '挑战',
    subcategory: '挑战专题',
    summary: '在不扭曲目标的前提下改善学习信号，并约束风险和扰动。',
    definition:
      'Shaping 添加辅助奖励；Safe RL 加约束；Robust RL 针对环境变化。',
    intuition: '给学习提示，但不能让提示变成刷分漏洞。',
    principles: [
      'Potential-based shaping 可保持最优策略的一类条件。',
      '安全约束应由环境强制。',
    ],
    steps: ['定义真实目标', '设计 shaping/constraint', '压力测试', '监测违规'],
    related: ['alignment-training-risks', 'agent-security'],
  },
  {
    slug: 'rl-evaluation-reproducibility',
    title: 'RL Evaluation、稳定性与可复现性',
    difficulty: '挑战',
    subcategory: '挑战专题',
    summary: '用多随机种子、置信区间、独立评测策略和资源指标报告结果。',
    definition:
      'RL 评测需区分训练回报、评测回报、样本效率、墙钟时间与约束违规。',
    intuition: '不能用最好的一条曲线代表算法。',
    principles: [
      '报告均值与不确定性。',
      '固定评测 episode 和环境版本。',
      '保存配置、seed 与代码版本。',
    ],
    steps: ['定义指标', '多 seed 训练', '周期评测', '统计区间', '复现实验'],
    related: ['model-evaluation', 'rl-algorithm-comparison'],
  },
  {
    slug: 'rl-algorithm-comparison',
    title: '强化学习算法比较与学习路线',
    difficulty: '挑战',
    subcategory: '核心对照',
    summary:
      '从数据、策略归属、动作空间、Replay、Target、保守性与偏好数据比较主要算法。',
    definition:
      '比较页将 Q-Learning、SARSA、DQN、REINFORCE、Actor-Critic、A2C/A3C、DDPG、TD3、SAC、CQL、IQL、PPO、GRPO、DPO 放在同一决策框架。',
    intuition:
      '先问数据从哪来、能否继续交互、学价值还是策略、动作空间是什么，再选算法。',
    principles: [
      '初学：GridWorld→Q-Learning→SARSA。',
      '传统 RL：Bellman→DP→MC→TD。',
      '深度 RL：DQN→Actor-Critic→PPO/SAC。',
      '离线 RL：固定数据边界→分布偏移→行为约束→CQL/IQL→离线评测。',
      '大模型对齐：Reward/Preference→PPO/GRPO/DPO 区别。',
      '实践：固定协议、基线、多 seed、错误分析。',
    ],
    steps: [
      '先判断训练阶段能否新增环境数据',
      '选择在线或离线学习路线',
      '完成最小数值例',
      '运行教学代码',
      '比较回报、偏移与失败',
      '写含数据版本的实验报告',
    ],
    interactiveDemo: 'algorithm-comparison',
    related: [
      'q-learning',
      'sarsa',
      'dqn',
      'sac',
      'online-vs-offline-rl',
      'offline-data-distribution-shift',
      'behavior-policy-constraints',
      'cql',
      'iql',
      'ppo',
      'grpo',
      'dpo',
    ],
  },
];
export const rlLongForms: RLLongFormConcept[] = seeds.map(make);
