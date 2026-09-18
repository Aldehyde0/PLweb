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
