import type { CategorySlug, Difficulty } from '@/lib/content';

export type ExerciseType = '概念' | '计算' | '代码' | '诊断' | '项目';
export interface Exercise {
  id: string;
  title: string;
  question: string;
  answer: string;
  category: CategorySlug;
  difficulty: Difficulty;
  type: ExerciseType;
  tags: string[];
  conceptSlug: string;
  source: string;
}

export const exercises: Exercise[] = [
  {
    id: 'infra-system-boundaries',
    title: '定位 AI Infra 的职责',
    question:
      '问答模型离线回答正常，但并发后首 token 变慢、显存耗尽。应从哪些 Infra 层次收集证据？',
    answer:
      '记录输入输出长度、到达率与并发；推理层检查排队、prefill/decode、KV Cache 和批调度；计算层检查显存容量、带宽与算子时间；运维层核对成功率、延迟目标和版本。不能仅凭模型能回答一次就判定服务容量达标。',
    category: 'artificial-intelligence',
    difficulty: '入门',
    type: '诊断',
    tags: ['AI Infra', '系统分层', '容量'],
    conceptSlug: 'ai-infra-overview',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-roofline-bound',
    title: '算力还是带宽受限',
    question:
      '某算子完成 100 GFLOP 并搬运 10 GB。假设峰值算力 100 TFLOP/s、带宽 1 TB/s，忽略其他开销，耗时下界是多少？',
    answer:
      '计算下界为 100e9/100e12=1 ms，搬运下界为 10e9/1e12=10 ms，整体至少为两者最大值 10 ms。算术强度为 10 FLOP/byte，带宽约束更强；真实耗时通常更高。',
    category: 'artificial-intelligence',
    difficulty: '入门',
    type: '计算',
    tags: ['AI Infra', 'GPU', 'Roofline', '带宽'],
    conceptSlug: 'gpu-memory-bandwidth',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-bf16-budget',
    title: '7B 模型的权重账本',
    question:
      '恰好 70 亿参数的 BF16 模型，权重占多少 GB 和 GiB？为什么不能直接用 24 GiB 减去权重来承诺缓存容量？',
    answer:
      '每参数 2 byte，共 14 GB，除以 2^30 得约 13.04 GiB。剩余约 10.96 GiB 还要容纳激活、运行时工作空间、分配碎片及余量；训练时另有梯度与优化器状态。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '计算',
    tags: ['AI Infra', '显存', 'BF16'],
    conceptSlug: 'llm-memory-budget',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-padding-mask',
    title: 'Padding 的利用率与掩码',
    question:
      '三个样本长度为 6、3、3，全部补到 8，位置利用率是多少？attention mask 与 loss mask 能否互相替代？',
    answer:
      '原始 token 共 12，补齐后 24 个位置，利用率 50%。attention mask 控制可关注的位置，loss mask 控制计入损失的目标，不能互相替代。语言模型还需检查标签右移、padding 忽略与 packing 边界。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '计算',
    tags: ['AI Infra', '数据流水线', 'Padding', 'Mask'],
    conceptSlug: 'training-data-pipeline',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-global-batch',
    title: '混合并行的全局 Batch',
    question:
      '8 张 GPU，TP=2、PP=2，微批量为 4，梯度累积 8 次，全局 batch 是多少？TP 和 PP 为什么不应再乘入？',
    answer:
      'DP=8/(2×2)=2，全局 batch=4×8×2=64。TP 与 PP 拆分同一个模型副本的计算，不增加独立样本副本数；长度可变时还需记录每次更新的有效 token 数。',
    category: 'artificial-intelligence',
    difficulty: '挑战',
    type: '计算',
    tags: ['AI Infra', 'DP', 'TP', 'PP'],
    conceptSlug: 'distributed-training-parallelism',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-collective-meaning',
    title: 'AllReduce 后还要除一次吗',
    question:
      '两个 rank 的梯度为 [1,3] 与 [5,7]。求和 AllReduce 后得到什么？使用训练框架时为什么不能盲目再除以 rank 数？',
    answer:
      '每个 rank 都得到 [6,10]；手工平均为 [3,5]。框架可能已按其梯度归约语义完成平均，再除一次会使梯度缩小，必须核对实际实现。',
    category: 'artificial-intelligence',
    difficulty: '挑战',
    type: '概念',
    tags: ['AI Infra', 'NCCL', 'AllReduce'],
    conceptSlug: 'gpu-collectives-topology',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-zero-peak',
    title: '全分片为什么仍然 OOM',
    question:
      '训练状态总计 112 GB，四卡全分片的理想稳态为 28 GB/卡。为什么不能据此保证 32 GB 显卡可运行？',
    answer:
      '28 GB 只涵盖所假设的均匀分片状态；还需激活、参数 AllGather、通信缓冲、运行时和碎片。计算、反向与保存期间都可能出现更高峰值，需按实际 dtype 和分组实测。',
    category: 'artificial-intelligence',
    difficulty: '挑战',
    type: '诊断',
    tags: ['AI Infra', 'ZeRO', 'FSDP', 'OOM'],
    conceptSlug: 'zero-fsdp',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-checkpoint-commit',
    title: '分片检查点的完整性',
    question:
      '对象存储出现了 8 个预期分片中的 7 个，可以更新 latest 指针吗？恢复训练还需要哪些非权重状态？',
    answer:
      '不能。应写完并校验全部分片，最后发布完成 manifest，再让读者选择该版本。恢复还需优化器、调度器、随机数、采样器与消费位置、step/token 数和配置版本，必要时包括精度缩放器。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '诊断',
    tags: ['AI Infra', 'Checkpoint', '故障恢复'],
    conceptSlug: 'training-checkpoints-recovery',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-fusion-traffic',
    title: '融合减少了哪些读写',
    question:
      '100 万个 float32 元素计算 y=x*scale+bias，scale/bias 为标量。忽略它们及缓存，分开乘加与融合的理想流量分别是多少？',
    answer:
      '每个数组 4 MB。分开时读 x、写中间、读中间、写 y，共 16 MB；融合只读 x 和写 y，共 8 MB。流量减半不保证耗时减半，还受启动、计算、寄存器和缓存影响。',
    category: 'artificial-intelligence',
    difficulty: '挑战',
    type: '计算',
    tags: ['AI Infra', 'Kernel', '算子融合', 'torch.compile'],
    conceptSlug: 'gpu-kernels-compilation',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-token-latency',
    title: '从 TTFT 推算最后一个 Token',
    question:
      'TTFT 为 300 ms，输出共 21 token，首 token 后平均间隔 40 ms，最后一个 token 大约何时到达？',
    answer:
      '300+(21−1)×40=1100 ms。首 token 已计入 TTFT，后续只有 20 个间隔；该估计截止到最后一个 token，不一定包含流关闭等额外耗时。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '计算',
    tags: ['AI Infra', 'Prefill', 'Decode', 'TTFT', 'TPOT'],
    conceptSlug: 'llm-prefill-decode',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-kv-capacity',
    title: 'KV Cache 的每条序列开销',
    question:
      '32 层、8 个 KV 头、每头 128 维、BF16 缓存，一条 4096 token 序列的缓存多大？分页能消除这部分增长吗？',
    answer:
      '每 token 为 2×32×8×128×2=131072 byte=128 KiB；4096 token 为 0.5 GiB。分页可减少预留与连续分配浪费，但不能消除缓存随 token 数增长的基本成本。',
    category: 'artificial-intelligence',
    difficulty: '挑战',
    type: '计算',
    tags: ['AI Infra', 'KV Cache', 'GQA', 'PagedAttention'],
    conceptSlug: 'kv-cache-paged-attention',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-continuous-schedule',
    title: '短请求完成后的空位',
    question:
      '三个同时到达的请求输出长度为 2、4、2，最多同时执行两条，每条每轮生成一个 token且忽略 prefill。固定批次和连续调度分别需要几轮？',
    answer:
      '固定批次先处理前两条需 4 轮，再处理第三条需 2 轮，共 6 轮。连续调度在第 2 轮后补入第三条，到第 4 轮全部完成。真实每轮耗时并不恒定，不能直接把轮数比例视为 GPU 加速比。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '计算',
    tags: ['AI Infra', '连续批处理', '请求调度'],
    conceptSlug: 'continuous-batching',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-quantization-scope',
    title: '权重变小，缓存也变小吗',
    question:
      '把 BF16 权重变成 W4A16 后，KV Cache 是否自动缩到四分之一？为什么模型文件也不一定恰好缩小四倍？',
    answer:
      '不会。W4A16 描述权重与激活，不自动改变 KV dtype；KV 需要单独量化配置。文件另有 scale、zero point、对齐和未量化层。是否更快还取决于后端 kernel、硬件与工作负载，必须同时验证质量。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '概念',
    tags: ['AI Infra', '量化', 'W4A16', '质量回归'],
    conceptSlug: 'inference-quantization',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-ready-not-listening',
    title: '监听端口是否代表服务就绪',
    question:
      '进程已监听端口但模型还在加载，是否应接入流量？流式接口已经返回 HTTP 200，能否直接算完整成功？',
    answer:
      '应等模型加载完成并通过就绪及小请求检查后再接流量。HTTP 200 后流仍可能中断，应核对完整结束事件、结束原因与输出。发布还需固定权重、tokenizer、模板和运行时，并保留回滚版本。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '诊断',
    tags: ['AI Infra', 'vLLM', '部署', 'Readiness'],
    conceptSlug: 'llm-serving-deployment',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-benchmark-goodput',
    title: '吞吐与 Goodput',
    question:
      '60 秒内发起 100 个请求，90 个完整成功并输出 9000 token，其中 72 个满足延迟门槛。成功吞吐、输出吞吐、goodput 和失败率分别是多少？',
    answer:
      '成功吞吐 90/60=1.5 req/s；输出吞吐 9000/60=150 token/s；按请求计 goodput 为 72/60=1.2 req/s；失败率 (100−90)/100=10%。质量门槛若另有要求，也必须纳入合格定义。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '计算',
    tags: ['AI Infra', '压测', 'Goodput', '吞吐'],
    conceptSlug: 'inference-benchmarking',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-scaling-cold-start',
    title: '有空闲 GPU 为什么仍无法启动',
    question:
      '作业要求单机四卡，集群两台机器各空闲两卡，能否仅凭空闲总数承诺启动？新增推理副本为何也不能立即计入容量？',
    answer:
      '不能，资源布局不满足单机四卡约束，还需检查设备与互联。新服务副本需要模型下载、加载、预热和就绪验证，前缀缓存也可能是冷的；扩容应预留提前量，缩容前应 drain。',
    category: 'artificial-intelligence',
    difficulty: '挑战',
    type: '诊断',
    tags: ['AI Infra', 'Kubernetes', 'GPU 调度', '扩缩容'],
    conceptSlug: 'gpu-cluster-scheduling',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-slo-budget',
    title: 'SLO 的错误预算与消耗速率',
    question:
      '10000 个范围内请求的 SLO 为 99% 合格，已有 70 个不合格，还剩多少预算？近期窗口不合格率 3% 对应多少倍消耗速率？',
    answer:
      '允许 100 个不合格，剩余 30 个；近期 burn rate=3%/(1−99%)=3 倍。近期速率与完整窗口累计预算是不同口径，不能据此直接说 30 天预算已经耗尽。',
    category: 'artificial-intelligence',
    difficulty: '进阶',
    type: '计算',
    tags: ['AI Infra', 'SLO', '可观测性', '成本'],
    conceptSlug: 'ai-infra-observability',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'infra-capacity-acceptance',
    title: '把预算变成可验收方案',
    question:
      '预算显示最多可容纳 15 条序列；四条合成日志中仅两条完整且 TTFT 不超过 1 秒。能否宣布达到 95% 服务目标并上线？还需交付什么证据？',
    answer:
      '不能。内存预算只是候选，合成日志只验证统计逻辑，2/4=50% 也未达到示例门槛。需真实模型配置、硬件和运行时版本、目标负载压测原始记录、充分样本、质量回归、成本口径以及灰度回滚条件。',
    category: 'artificial-intelligence',
    difficulty: '挑战',
    type: '项目',
    tags: ['AI Infra', '综合实验', '容量规划', '验收'],
    conceptSlug: 'ai-infra-serving-lab',
    source: 'Layerwise / AI Infra',
  },
  {
    id: 'ml-task-type',
    title: '分类还是回归',
    question:
      '分类和回归的输出有什么本质区别？“预测明天的温度”和“判断邮件是否垃圾”分别属于哪一种？',
    answer:
      '分类输出离散类别或类别概率，回归输出连续数值。温度预测是回归，垃圾邮件判断是分类。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '概念',
    tags: ['监督学习', '分类', '回归'],
    conceptSlug: 'supervised-learning',
    source: 'learning_tech / 00 机器学习导论',
  },
  {
    id: 'ml-split-roles',
    title: '训练、验证与测试的职责',
    question: '为什么测试集不能参与模型选择？请分别说明三类数据的职责。',
    answer:
      '训练集学习参数；验证集或交叉验证选择算法和超参数；测试集只在所有选择完成后做最终评价。让测试集参与选择会造成信息泄漏，使结果过于乐观。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '概念',
    tags: ['数据划分', '数据泄漏', '泛化'],
    conceptSlug: 'data-preprocessing',
    source: 'learning_tech / 00 机器学习导论',
  },
  {
    id: 'ml-numpy-column-mean',
    title: '矩阵每列均值',
    question:
      '创建一个 3×4 的 NumPy 矩阵，并计算每一列的均值。应使用哪个 axis？',
    answer:
      '使用 axis=0：`X = np.arange(12).reshape(3,4); X.mean(axis=0)`。沿第 0 维聚合三行，结果为每列一个均值。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '代码',
    tags: ['NumPy', '矩阵', '统计量'],
    conceptSlug: 'math-data-foundations',
    source: 'learning_tech / 01 数学与数据基础',
  },
  {
    id: 'ml-distance-scaling',
    title: '为什么 KNN 要标准化',
    question: '为什么决策树通常不要求标准化，而 KNN 通常要求？',
    answer:
      'KNN 直接用特征距离，数值尺度大的特征会主导距离，因此需标准化。决策树只比较单个特征与阈值，单调缩放不会改变样本排序，通常不影响划分。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '概念',
    tags: ['KNN', '标准化', '决策树'],
    conceptSlug: 'knn',
    source: 'learning_tech / 01 数学与数据基础',
  },
  {
    id: 'ml-preprocess-before-split',
    title: '先划分还是先标准化',
    question:
      '为什么不能用整个数据集的均值和标准差完成标准化后再划分训练集与测试集？',
    answer:
      '全数据统计量包含测试集信息，测试分布通过均值和标准差泄漏进训练流程。应先划分，再只在训练集 fit 标准化器，把相同 transform 应用于验证和测试。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '诊断',
    tags: ['标准化', '数据泄漏', 'Pipeline'],
    conceptSlug: 'data-preprocessing',
    source: 'learning_tech / 02 数据预处理与特征工程',
  },
  {
    id: 'ml-future-leakage',
    title: '识别未来信息泄漏',
    question:
      '为“贷款发放时预测未来是否违约”的模型举一个包含未来信息的危险特征，并说明问题。',
    answer:
      '例如“贷款发放后 90 天的逾期次数”。预测时该信息尚不存在，却在训练数据中直接透露了未来结果，会让离线分数虚高，线上无法使用。',
    category: 'machine-learning',
    difficulty: '进阶',
    type: '诊断',
    tags: ['特征工程', '数据泄漏', '业务时间'],
    conceptSlug: 'feature-engineering',
    source: 'learning_tech / 02 数据预处理与特征工程',
  },
  {
    id: 'ml-l1-l2',
    title: 'L1 与 L2 正则化',
    question:
      'L1 与 L2 正则化对参数有什么不同影响？逻辑回归中的 C 变小时正则化变强还是变弱？',
    answer:
      'L1 倾向产生稀疏参数，可用于特征选择；L2 平滑地缩小权重，通常更稳定。scikit-learn 逻辑回归中 C 是正则强度的倒数，C 变小意味着正则更强。',
    category: 'machine-learning',
    difficulty: '进阶',
    type: '概念',
    tags: ['正则化', '逻辑回归', 'L1', 'L2'],
    conceptSlug: 'overfitting-regularization',
    source: 'learning_tech / 03 线性模型',
  },
  {
    id: 'ml-knn-k',
    title: 'K 值过小与过大',
    question: 'KNN 中 K 太小和太大分别容易产生什么问题？',
    answer:
      'K 太小时边界对噪声和个别样本敏感，方差高、容易过拟合；K 太大时会过度平均局部差异，偏差高、容易欠拟合。应通过交叉验证选择。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '概念',
    tags: ['KNN', '偏差方差', '交叉验证'],
    conceptSlug: 'knn',
    source: 'learning_tech / 04 近邻、贝叶斯与支持向量机',
  },
  {
    id: 'ml-svm-parameters',
    title: 'SVM 的 C 与 gamma',
    question: 'RBF 核 SVM 中，C 和 gamma 分别主要控制什么？',
    answer:
      'C 控制违反间隔和大间隔之间的权衡：C 大时更重视训练误差。gamma 控制单个样本影响范围：gamma 大时影响更局部，边界可能更曲折。二者都应在标准化后的 Pipeline 中交叉验证。',
    category: 'machine-learning',
    difficulty: '进阶',
    type: '概念',
    tags: ['SVM', '超参数', 'RBF'],
    conceptSlug: 'support-vector-machines',
    source: 'learning_tech / 04 近邻、贝叶斯与支持向量机',
  },
  {
    id: 'ml-tree-overfit',
    title: '深树为什么容易过拟合',
    question: '为什么不断加深的决策树会记住训练噪声？给出两个控制方法。',
    answer:
      '深树不断细分，叶节点可能只剩极少样本，于是异常值和偶然模式也成为规则。可限制 max_depth、提高 min_samples_leaf、剪枝或改用带约束的集成模型。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '诊断',
    tags: ['决策树', '过拟合', '剪枝'],
    conceptSlug: 'decision-trees',
    source: 'learning_tech / 05 决策树与集成学习',
  },
  {
    id: 'ml-cluster-labels',
    title: '聚类编号不是类别编号',
    question: '为什么 K-Means 的簇编号不能直接与真实类别编号比较？',
    answer:
      '簇编号只是算法为分组分配的任意标识，编号置换不改变聚类结果；而真实类别有固定语义。比较时需做最佳匹配，且数学相似群体也不一定等同业务类别。',
    category: 'machine-learning',
    difficulty: '入门',
    type: '概念',
    tags: ['K-Means', '聚类', '无监督学习'],
    conceptSlug: 'pca-clustering',
    source: 'learning_tech / 06 无监督学习',
  },
  {
    id: 'ml-metrics',
    title: '误报还是漏报',
    question:
      '癌症初筛和垃圾邮件拦截分别更应优先关注 Recall 还是 Precision？为什么？',
    answer:
      '癌症初筛通常更怕漏诊，应优先关注 Recall；垃圾邮件拦截若误删正常邮件代价高，应更关注 Precision。实际还需结合阈值、成本和后续复核流程。',
    category: 'machine-learning',
    difficulty: '进阶',
    type: '概念',
    tags: ['Precision', 'Recall', '业务指标'],
    conceptSlug: 'model-evaluation',
    source: 'learning_tech / 07 模型评估与调参',
  },
  {
    id: 'ml-group-split',
    title: '同一用户的记录如何划分',
    question:
      '每位用户有多条行为记录时，为什么普通随机划分可能不可靠？应改用什么方式？',
    answer:
      '同一用户的记录可能同时出现在训练和测试中，模型会记住个体特征，测试分数无法代表新用户。应按用户 ID 做 GroupKFold 或分组留出。',
    category: 'machine-learning',
    difficulty: '进阶',
    type: '诊断',
    tags: ['交叉验证', '分组划分', '泄漏'],
    conceptSlug: 'cross-validation',
    source: 'learning_tech / 07 模型评估与调参',
  },
  {
    id: 'ml-wine-project',
    title: 'Wine 项目的正确顺序',
    question:
      '把“保留测试集、建立 Pipeline、交叉验证比较、调参、最终测试、保存模型”排成正确顺序，并说明测试集可使用几次。',
    answer:
      '顺序正如题目所列：先保留测试集，再在训练部分建立 Pipeline、交叉验证比较与调参，之后只做一次最终测试，最后保存包含预处理的模型。测试集不参与选择。',
    category: 'machine-learning',
    difficulty: '进阶',
    type: '项目',
    tags: ['端到端', 'Pipeline', '模型保存'],
    conceptSlug: 'end-to-end-ml-project',
    source: 'learning_tech / 08 端到端机器学习项目',
  },
  {
    id: 'dl-neuron-parameters',
    title: '人工神经元的组成',
    question:
      '写出人工神经元公式，并解释输入、权重、偏置和激活函数分别扮演什么角色。',
    answer:
      'y=f(wᵀx+b)。x 是输入证据，w 表示每个特征的重要性和方向，b 调整整体阈值，f 引入非线性并决定输出范围。',
    category: 'deep-learning',
    difficulty: '入门',
    type: '概念',
    tags: ['神经元', '权重', '激活函数'],
    conceptSlug: 'artificial-neuron',
    source: 'deeplearning / 01 人工神经元',
  },
  {
    id: 'dl-epoch-iterations',
    title: '计算每个 Epoch 的迭代数',
    question:
      '训练集有 1050 个样本，batch size=100。drop_last=False 与 True 时每个 epoch 分别有多少次 iteration？训练 5 个 epoch 时各更新多少次？',
    answer:
      'drop_last=False 向上取整为 11 次/epoch，共 55 次；drop_last=True 丢弃最后 50 个样本，为 10 次/epoch，共 50 次。',
    category: 'deep-learning',
    difficulty: '入门',
    type: '计算',
    tags: ['Epoch', 'Batch', 'Iteration'],
    conceptSlug: 'epoch-batch-iteration',
    source: 'deeplearning / 03 Epoch、Batch 与 Iteration',
  },
  {
    id: 'dl-output-loss',
    title: '输出层与损失函数搭配',
    question: '十分类、二分类和回归的典型输出形状与损失函数分别是什么？',
    answer:
      '十分类通常输出 [N,10] logits，配 CrossEntropyLoss 和 [N] long 类别索引；二分类输出 [N] 或 [N,1] logits，配 BCEWithLogitsLoss 和同形状浮点目标；回归输出与连续目标同形状，常用 MSELoss 或 L1Loss。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '概念',
    tags: ['输出层', '损失函数', 'Logits'],
    conceptSlug: 'loss-functions',
    source: 'deeplearning / 06 输出层与损失函数',
  },
  {
    id: 'dl-cnn-shape',
    title: '卷积与池化后的形状',
    question:
      '输入 [10,1,28,28]，依次经过 Conv2d(1,8,3,stride=1,padding=1) 和 MaxPool2d(2)，两个输出形状是什么？',
    answer:
      '卷积保持高宽并将通道变为 8，得到 [10,8,28,28]；池化让高宽减半，得到 [10,8,14,14]。',
    category: 'deep-learning',
    difficulty: '入门',
    type: '计算',
    tags: ['CNN', '张量形状', 'PyTorch'],
    conceptSlug: 'convolutional-neural-networks',
    source: 'deeplearning / 08 CNN 张量形状与参数量计算',
  },
  {
    id: 'dl-conv-params',
    title: '卷积层参数量',
    question: 'Conv2d(3,32,kernel_size=3,bias=True) 有多少个可学习参数？',
    answer:
      '每个输出通道有 3×3×3 个核权重和 1 个偏置，共 32×(27+1)=896 个参数。参数量与输入图像的高宽无关。',
    category: 'deep-learning',
    difficulty: '入门',
    type: '计算',
    tags: ['CNN', '参数量', '卷积核'],
    conceptSlug: 'convolutional-neural-networks',
    source: 'deeplearning / 07 CNN 卷积神经网络详解',
  },
  {
    id: 'dl-dataloader-boundary',
    title: 'Dataset 与 DataLoader 的职责',
    question:
      'Dataset.__getitem__ 通常返回单样本还是 batch？batch 维是谁添加的？训练和验证的 shuffle 通常如何设置？',
    answer:
      '__getitem__ 通常返回单个样本，没有 batch 维；DataLoader 的 collate 过程把样本组成 batch。训练集通常 shuffle=True，验证和测试通常 False。',
    category: 'deep-learning',
    difficulty: '入门',
    type: '概念',
    tags: ['Dataset', 'DataLoader', '数据管道'],
    conceptSlug: 'data-pipeline',
    source: 'deeplearning / 11 数据管道与预处理',
  },
  {
    id: 'dl-autograd-grad',
    title: '自动微分与梯度累积',
    question:
      '为什么训练循环每次 backward 前通常要调用 optimizer.zero_grad()？',
    answer:
      'PyTorch 默认把新梯度累加到已有 `.grad`。若不清零，多次 batch 的梯度会意外累加，更新方向与预期不同。只有明确做梯度累积时才按计划延迟清零。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '概念',
    tags: ['Autograd', '梯度', '训练循环'],
    conceptSlug: 'backpropagation',
    source: 'deeplearning / 12 自动微分与反向传播详解',
  },
  {
    id: 'dl-bn-eval',
    title: 'model.eval 与 inference_mode',
    question: '为什么 `torch.inference_mode()` 不能替代 `model.eval()`？',
    answer:
      'inference_mode 关闭 autograd、节省开销，但不会改变模块状态；model.eval 会让 BatchNorm 使用运行统计并关闭 Dropout 随机性，却不会自动关闭梯度。评估时通常两者同时使用。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '诊断',
    tags: ['BatchNorm', 'eval', '推理'],
    conceptSlug: 'normalization',
    source: 'deeplearning / 14 BatchNorm 与 LayerNorm',
  },
  {
    id: 'dl-imbalance',
    title: '不平衡分类看什么指标',
    question:
      '一个正类占 1% 的模型全部预测为负类，Accuracy 是多少？为什么这个结果没有价值？',
    answer:
      'Accuracy 约为 99%，但正类 Recall 为 0，一个真正关心的正例都没找到。应查看混淆矩阵、Precision、Recall、F1、PR-AUC 和每类指标。',
    category: 'deep-learning',
    difficulty: '入门',
    type: '计算',
    tags: ['类别不平衡', 'Accuracy', 'Recall'],
    conceptSlug: 'dl-evaluation-imbalance',
    source: 'deeplearning / 16 模型评估与类别不平衡',
  },
  {
    id: 'dl-rnn-last-valid',
    title: '变长序列的最后有效位置',
    question:
      '长度为 [5,3,4]、补齐长度为 5 的单向 RNN 输出 [3,5,H]，三个样本分别应取哪个时间下标？',
    answer:
      '零起始下标分别是 4、2、3，也就是 length-1。直接取 output[:,-1] 会让后两个样本读到 padding 位置。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '计算',
    tags: ['RNN', 'Padding', '序列长度'],
    conceptSlug: 'rnn-lstm-gru',
    source: 'deeplearning / 18 RNN、LSTM 与 GRU',
  },
  {
    id: 'dl-attention-shape',
    title: '注意力张量形状',
    question:
      'Q=[16,12,64]、K=[16,20,64]、V=[16,20,32]。注意力分数、权重和输出形状分别是什么？',
    answer:
      'QKᵀ 得到分数 [16,12,20]，softmax 后权重形状不变；权重乘 V 得到输出 [16,12,32]。12 是 query 长度，20 是 key/value 长度。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '计算',
    tags: ['Attention', 'QKV', '张量形状'],
    conceptSlug: 'transformer',
    source: 'deeplearning / 19 注意力机制与 Transformer',
  },
  {
    id: 'dl-causal-mask',
    title: '为什么需要 Causal Mask',
    question:
      '训练下一 token 预测器时为什么必须遮住未来位置？长度从 512 增至 2048 时注意力分数元素约增加多少倍？',
    answer:
      '若能看到未来 token，训练目标会泄漏，推理时却无法获得这些信息。全局注意力分数按 L² 增长，长度扩大 4 倍，元素数约扩大 16 倍。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '概念',
    tags: ['Transformer', 'Causal Mask', '复杂度'],
    conceptSlug: 'transformer',
    source: 'deeplearning / 19 注意力机制与 Transformer',
  },
  {
    id: 'dl-residual-shortcut',
    title: '残差 Shortcut 形状匹配',
    question:
      '输入 [8,64,32,32]，主分支输出 [8,128,16,16]。shortcut 至少需要怎样的卷积才能相加？',
    answer:
      '使用 Conv2d(64,128,kernel_size=1,stride=2)（通常不需 padding），把通道从 64 调到 128，同时把高宽减半为 16×16。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '计算',
    tags: ['ResNet', 'Shortcut', '1×1卷积'],
    conceptSlug: 'residual-networks',
    source: 'deeplearning / 20 残差连接与现代 CNN',
  },
  {
    id: 'dl-transfer-experiment',
    title: '迁移学习对照实验',
    question:
      '如何用实验区分“预训练特征有效”与“只是模型更大”？至少列出三组对照及记录项。',
    answer:
      '可比较随机初始化从头训练、冻结预训练骨干只训练头、只解冻最后阶段、全量微调。记录可训练参数量、训练时间、训练/验证指标和最佳 epoch，并保持数据划分与评价协议一致。',
    category: 'deep-learning',
    difficulty: '挑战',
    type: '项目',
    tags: ['迁移学习', '微调', '对照实验'],
    conceptSlug: 'transfer-learning',
    source: 'deeplearning / 21 迁移学习与微调',
  },
  {
    id: 'dl-iou',
    title: '手算 IoU',
    question:
      '真实框 A=[0,0,4,4]，预测框 B=[2,2,6,6]，按连续坐标面积计算 IoU。',
    answer:
      'A、B 面积各 16；交集为 [2,2,4,4]，面积 4；并集为 16+16-4=28，因此 IoU=4/28=1/7≈0.143。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '计算',
    tags: ['目标检测', 'IoU', '边界框'],
    conceptSlug: 'detection-segmentation',
    source: 'deeplearning / 22 目标检测与图像分割',
  },
  {
    id: 'dl-debug-small-batch',
    title: '先拟合一个极小 Batch',
    question:
      '分类模型 Loss 长期不下降。为什么应先反复拟合 8～32 个样本？若仍失败，优先检查什么？',
    answer:
      '容量足够的模型通常应能记住极小数据。若做不到，应优先检查输入标签对应、shape/dtype、输出层与损失、学习率、梯度链路、优化器参数和预处理，而不是盲目更换大模型。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '诊断',
    tags: ['调试', '训练循环', '梯度'],
    conceptSlug: 'model-debugging',
    source: 'deeplearning / 26 深度学习模型调试指南',
  },
  {
    id: 'dl-checkpoint',
    title: '权重与训练检查点',
    question:
      '只保存 model.state_dict 与保存完整训练检查点有什么区别？各自适合什么场景？',
    answer:
      'state_dict 只含模型权重，适合推理产物，但仍需另存结构配置、预处理和标签映射。可恢复训练的检查点还应含 optimizer、scheduler、epoch、最佳指标和随机状态等。',
    category: 'deep-learning',
    difficulty: '进阶',
    type: '概念',
    tags: ['模型保存', 'Checkpoint', '推理'],
    conceptSlug: 'model-saving-inference',
    source: 'deeplearning / 25-27 训练工程与模型保存',
  },
  {
    id: 'dl-mnist-project',
    title: 'MNIST 项目验收',
    question:
      '一个可靠的 MNIST 项目在开始训练前、训练中和最终评价时分别至少检查什么？',
    answer:
      '训练前检查样本标签、shape/dtype、数值范围和随机输入输出；训练中区分 train/eval、记录损失与验证指标并保存最佳模型；最终加载最佳权重，只在测试集评价，并查看混淆矩阵、每类准确率与错误样本。',
    category: 'deep-learning',
    difficulty: '挑战',
    type: '项目',
    tags: ['MNIST', '端到端', '验收'],
    conceptSlug: 'training-engineering',
    source: 'deeplearning / 28 端到端 MNIST 项目',
  },
];

export const exerciseTags = [
  ...new Set(exercises.flatMap((item) => item.tags)),
].sort();
