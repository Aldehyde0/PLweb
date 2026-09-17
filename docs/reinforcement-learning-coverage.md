# 强化学习资料与概念覆盖审计

更新时间：2026-08-30

## 本地资料检查

- 已检查 `本仓库`（排除构建产物和依赖）。
- 已检查 `学习资料`。
- 关键词包括 reinforcement learning、reinforcement_learning、reinforcementlearning、reinforcement、RL、强化学习、policy gradient、value based、actor critic、PPO、GRPO、DPO。
- 未找到可作为强化学习正文来源的本地 Markdown、PDF 或 DOCX。现有网站仅有 Agent/Environment、State/Action/Reward、MDP、Q-Learning、Policy Gradient 五个浅层条目。

因此，新增页面中的算法定义和公式标记为“外部原始教材/论文依据”；中文直觉、数值例子、代码、图表和学习路线标记为“扩展解释”，没有伪称来自本地文档。

## 核心来源

| 来源 | 章节或标题 | 对应页面 | 来源性质 |
|---|---|---|---|
| Sutton & Barto, *Reinforcement Learning: An Introduction*, 2nd ed. | MDP、DP、MC、TD、Control、Policy Gradient | 基础、Value、Policy、Actor-Critic | 原始教材 |
| Watkins & Dayan, Q-Learning | Q-Learning update / convergence | Q-Learning | 原始论文 |
| Rummery & Niranjan / Sutton & Barto | SARSA | SARSA | 原始算法资料/教材 |
| Mnih et al., *Human-level control through deep reinforcement learning* | DQN、Replay、Target Network | DQN | 原始论文 |
| Williams, *Simple statistical gradient-following algorithms* | REINFORCE | REINFORCE | 原始论文 |
| Schulman et al., *Proximal Policy Optimization Algorithms* | §3、Algorithm 1 | PPO | 原始论文 |
| Shao et al., *DeepSeekMath* | §4.1、Figure 2 | GRPO | 原始论文 |
| Rafailov et al., *Direct Preference Optimization* | §4、Eq. 7 | DPO | 原始论文 |
| Fu et al., *D4RL* | §1–§3 | Offline RL 总览、数据边界 | 原始论文 |
| Kumar et al., *BEAR* | §3–§4 | 分布偏移、行为策略约束 | 原始论文 |
| Fujimoto et al., *BCQ* | 方法与算法 | 行为策略约束 | 原始论文 |
| Kumar et al., *Conservative Q-Learning* | §3.1、Eq. 4、Appendix F | CQL | 原始论文 |
| Kostrikov et al., *Implicit Q-Learning* | §4、Eq. 5–7、Algorithm 1 | IQL | 原始论文 |

## 术语确认

- 用户输入 `pro`：本轮暂按 **PPO — Proximal Policy Optimization** 处理。
- 用户输入 `gpro`：本轮暂按 **GRPO — Group Relative Policy Optimization** 处理。
- **DPO — Direct Preference Optimization**。
- 如果用户原意是其他缩写，需要人工确认；网站没有把原拼写静默当作正式名称。

## 网站概念分组

- 入门基础：RL 概述、与监督/无监督区别、Agent/Environment、State/Action/Reward、Policy/Episode/Trajectory、Return/Discount、探索利用、Markov、MDP、GridWorld。
- 基础理论：Value/Q、Bellman、DP、MC、TD/TD error/n-step。
- Value-based：Q-Learning、SARSA、Expected SARSA、Double Q、DQN、Replay/Target、Double DQN、Dueling、PER、Rainbow。
- Policy-based：Policy methods、Policy Gradient、REINFORCE、Baseline/Advantage/Entropy。
- Actor-Critic：Actor-Critic、A2C/A3C、GAE、DDPG、TD3、SAC。
- Offline RL：在线/离线边界、离线数据分布偏移、行为策略约束、CQL、IQL。
- 现代策略与偏好优化：PPO、Reward Model/RLHF/RLAIF/RFT、DPO、GRPO、三者比较、对齐风险。
- 方法分类与挑战：model-free/model-based、on/off-policy、online/offline、POMDP、稀疏延迟奖励、MARL/HRL、模仿/逆 RL、World Model/MPC、Safe/Robust、评测复现。
- 核心对照：强化学习算法比较与学习路线。

## 仍可继续扩展

- 可继续扩展 Offline RL 的 OPE（重要性采样、FQE）、Decision Transformer、TD3+BC 与数据集诊断交互演示。
- A2C 与 A3C 当前为同一对照页；如需实现级深度，可拆为两个页面。
- GRPO 代码为严格标注的组相对目标教学实现，不是训练真实大模型的生产脚本。
