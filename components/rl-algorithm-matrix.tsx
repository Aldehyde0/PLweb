const rows = [
  [
    'Q-Learning',
    'Value-based',
    'off-policy',
    '离散',
    '否',
    '否',
    '否',
    '否',
    '低/中',
    '表格控制',
  ],
  [
    'SARSA',
    'Value-based',
    'on-policy',
    '离散',
    '否',
    '否',
    '否',
    '否',
    '低/中',
    '风险敏感在线控制',
  ],
  [
    'DQN',
    'Deep Value',
    'off-policy',
    '离散',
    '是',
    '是',
    '否',
    '否',
    '中',
    '高维离散控制',
  ],
  [
    'REINFORCE',
    'Policy-based',
    'on-policy',
    '离散/连续',
    '否',
    '否',
    '否',
    '否',
    '低',
    '教学与概率策略',
  ],
  [
    'Actor-Critic',
    'Actor-Critic',
    '常见 on-policy',
    '离散/连续',
    '可选',
    '可选',
    '否',
    '否',
    '中',
    '低方差策略学习',
  ],
  [
    'A2C',
    'Actor-Critic',
    'on-policy',
    '离散/连续',
    '否',
    '否',
    '否',
    '否',
    '中',
    '同步并行环境',
  ],
  [
    'A3C',
    'Actor-Critic',
    'on-policy',
    '离散/连续',
    '否',
    '否',
    '否',
    '否',
    '中',
    '异步并行环境',
  ],
  [
    'DDPG',
    'Actor-Critic',
    'off-policy',
    '连续',
    '是',
    '是',
    '否',
    '否',
    '高',
    '确定性连续控制',
  ],
  [
    'TD3',
    'Actor-Critic',
    'off-policy',
    '连续',
    '是',
    '是',
    '否',
    '否',
    '中/高',
    '稳健连续控制',
  ],
  [
    'SAC',
    'Actor-Critic',
    'off-policy',
    '连续',
    '是',
    '是',
    '否',
    '否',
    '高',
    '最大熵连续控制',
  ],
  [
    'CQL',
    'Offline conservative Q',
    '固定离线数据',
    '离散/连续',
    '静态数据集',
    'Target network',
    '否',
    '否',
    '高（离线）',
    '数据外价值保守化',
  ],
  [
    'IQL',
    'Offline implicit Q',
    '固定离线数据',
    '离散/连续',
    '静态数据集',
    'Target Q / V',
    '否',
    '否',
    '高（离线）',
    '数据动作上的隐式改进',
  ],
  [
    'PPO',
    'Actor-Critic',
    'on-policy',
    '离散/连续',
    'rollout',
    '否',
    'RLHF 可用',
    '否',
    '中',
    '机器人、游戏、RLHF',
  ],
  [
    'GRPO',
    'Policy optimization',
    'on-policy 组采样',
    '文本序列',
    '组内 rollout',
    'reference',
    '规则或模型奖励',
    '组奖励',
    '中',
    '可验证推理任务',
  ],
  [
    'DPO',
    'Preference objective',
    '离线',
    '文本序列',
    '偏好对',
    'reference',
    '无需显式 RM',
    '是',
    '高',
    '离线偏好对齐',
  ],
];
export function RLAlgorithmMatrix() {
  return (
    <section className="rl-demo">
      <div className="rl-demo-head">
        <p className="eyebrow">完整比较表</p>
        <h2>15 种算法的训练属性</h2>
        <p>“样本效率”是相对、定性的教学标记，不能脱离环境和实现直接排名。</p>
      </div>
      <div className="rl-table">
        <table>
          <thead>
            <tr>
              {[
                '算法',
                '方法类别',
                '策略归属',
                '动作空间',
                'Replay/数据复用',
                'Target/Reference',
                'Reward Model',
                'Preference Data',
                '样本效率',
                '典型场景',
              ].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((x, i) => (
                  <td key={`${row[0]}-${i}`}>{x}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="learning-routes">
        <article>
          <h3>初学者</h3>
          <p>GridWorld → Q-Learning → SARSA → Bellman/TD</p>
        </article>
        <article>
          <h3>深度强化学习</h3>
          <p>DQN → Actor-Critic → PPO / SAC</p>
        </article>
        <article>
          <h3>Offline RL</h3>
          <p>固定数据边界 → 分布偏移 → 行为约束 → CQL / IQL → 离线评测</p>
        </article>
        <article>
          <h3>大模型对齐</h3>
          <p>Reward/Preference → PPO → GRPO → DPO 对照</p>
        </article>
        <article>
          <h3>实践项目</h3>
          <p>环境协议 → 基线 → 多 seed → 评测与错误分析</p>
        </article>
      </div>
    </section>
  );
}
