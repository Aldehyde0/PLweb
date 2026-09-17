# deeplearning 文档覆盖清单

审计目录：`学习资料/deeplearning`

- 实际存在：是
- 相近路径 `学习资料/machine_learning/deeplearning`：不存在
- 文件总数：30
- 文件格式：全部为 Markdown
- 无 PDF、DOCX、图片扫描件或无法读取文件
- 审计方式：逐份完整阅读正文、公式、代码、练习与错误清单

| 源文件 | 文件标题 | 主要章节/概念 | 网站方向 | 对应页面 | 当前状态 | 需要扩展 | 优先级 | 备注 |
|---|---|---|---|---|---|---|---|---|
| `00_学习路线与总目录.md` | 深度学习学习路线与总目录 | 六阶段路线、视觉/NLP/工程路线、验收目标 | 深度学习 | 深度学习分类页与本清单 | 部分 | 是 | P0 | 用于页面顺序和前置关系，不单独伪造术语页 |
| `01_人工神经元.md` | 人工神经元 | 输入、权重、偏置、激活、训练 | 深度学习 | `/concept/artificial-neuron` | 已有短页 | 是 | P0 | 覆盖公式、手算和 PyTorch Linear |
| `02_神经网络的训练与优化.md` | 神经网络的训练与优化 | 前向、损失、反向、梯度、优化器、学习率 | 深度学习 | `/concept/neural-network-training-loop`、`/concept/forward-propagation` | 被合并 | 是 | P0 | 必须拆成训练循环和前向传播 |
| `03_Epoch_Batch与Iteration.md` | Epoch、Batch Size 与 Iteration | batch、iteration、epoch、梯度累积 | 深度学习 | `/concept/epoch-batch-iteration` | 已有短页 | 是 | P0 | 补换算、drop_last、batch size 影响 |
| `04_过拟合欠拟合与数据集划分.md` | 过拟合、欠拟合与数据集划分 | 泛化、曲线、train/val/test、Dropout、早停 | 深度学习 | `/concept/deep-overfitting-and-validation`、`/concept/dropout` | 被合并 | 是 | P0 | 验证与测试必须独立 |
| `05_激活函数与非线性.md` | 激活函数与非线性 | ReLU、LeakyReLU、Sigmoid、Tanh、GELU、Softmax | 深度学习 | `/concept/activation-functions` | 已有短页 | 是 | P0 | 输出激活与隐藏层需区分 |
| `06_输出层与损失函数.md` | 输出层与损失函数的选择 | 回归、二分类、多分类、多标签、logits | 深度学习 | `/concept/output-layers-and-losses`、`/concept/loss-functions` | 被合并 | 是 | P0 | 独立任务映射页 |
| `07_CNN卷积神经网络详解.md` | CNN 卷积神经网络详解 | 局部连接、权重共享、卷积、池化、感受野、训练 | 深度学习 | `/concept/convolutional-neural-networks`、`/concept/convolution-operation`、`/concept/pooling` | 已有短页 | 是 | P0 | 需拆卷积和池化 |
| `08_CNN张量形状与参数量计算.md` | CNN 张量形状与参数量计算 | NCHW、输出尺寸、Flatten、参数量 | 深度学习 | `/concept/cnn-shapes-and-parameters` | 遗漏 | 是 | P0 | 公式、三道练习和断言 |
| `09_深度学习数学基础速查.md` | 深度学习数学基础速查 | 张量、矩阵、梯度、链式法则、概率、交叉熵、KL | 深度学习 | `/concept/deep-learning-math-foundations` | 被合并 | 是 | P1 | 与机器学习数学页关联，不重复冲突 |
| `10_PyTorch张量与模块基础.md` | PyTorch 张量与模块基础 | Tensor、dtype、device、reshape、Module、Parameter、buffer | 深度学习 | `/concept/pytorch-tensors-modules`、`/concept/pytorch-tensor-shape-device` | 已有短页 | 是 | P0 | 拆张量状态与 Module 状态 |
| `11_数据管道与预处理.md` | 数据管道与预处理 | Dataset、DataLoader、transform、collate、设备传输 | 深度学习 | `/concept/data-pipeline`、`/concept/pytorch-dataset-dataloader` | 已有短页 | 是 | P0 | 变长序列和 Windows workers |
| `12_自动微分与反向传播详解.md` | 自动微分与反向传播详解 | 动态图、叶子张量、梯度累加、detach、no_grad | 深度学习 | `/concept/backpropagation`、`/concept/pytorch-autograd` | 已有短页 | 是 | P0 | Autograd 独立页 |
| `13_梯度问题与权重初始化.md` | 梯度问题与权重初始化 | 消失、爆炸、裁剪、Xavier、Kaiming | 深度学习 | `/concept/gradient-initialization`、`/concept/gradient-clipping` | 已有短页 | 是 | P0 | 初始化与激活对应 |
| `14_归一化方法_BatchNorm与LayerNorm.md` | BatchNorm 与 LayerNorm | 统计轴、running stats、小 batch、Pre/Post Norm | 深度学习 | `/concept/normalization`、`/concept/batch-normalization`、`/concept/layer-normalization` | 已有短页 | 是 | P0 | BN/LN 必须独立 |
| `15_优化器与学习率调度进阶.md` | 优化器与学习率调度进阶 | SGD、Momentum、Adam、AdamW、scheduler、warmup | 深度学习 | `/concept/optimizers-schedulers`、`/concept/adam-and-adamw`、`/concept/learning-rate-schedulers` | 已有短页 | 是 | P0 | 区分调度频率 |
| `16_模型评估与类别不平衡.md` | 模型评估与类别不平衡 | 分类/回归指标、阈值、AUC、校准、padding mask | 深度学习 | `/concept/dl-evaluation-imbalance` | 已有短页 | 是 | P1 | 补完整 PyTorch 指标代码 |
| `17_Embedding与序列数据基础.md` | Embedding 与序列数据基础 | token、词表、padding、mask、位置、Embedding | 深度学习 | `/concept/embeddings-sequences`、`/concept/sequence-padding-and-masks` | 已有短页 | 是 | P0 | mask 方向需明确 |
| `18_RNN_LSTM与GRU.md` | RNN、LSTM 与 GRU | 状态、BPTT、门、packing、双向 | 深度学习 | `/concept/rnn-lstm-gru`、`/concept/recurrent-neural-network`、`/concept/lstm`、`/concept/gru` | 已有合并页 | 是 | P0 | 三模型拆页，保留总览 |
| `19_注意力机制与Transformer.md` | 注意力机制与 Transformer | QKV、缩放点积、多头、位置、mask、Encoder/Decoder | 深度学习 | `/concept/transformer`、`/concept/attention`、`/concept/multi-head-attention`、`/concept/transformer-masks` | 已有短页 | 是 | P0 | 文档最大章节，必须拆分 |
| `20_残差连接与现代CNN.md` | 残差连接与现代 CNN | shortcut、1×1、瓶颈、现代 CNN | 深度学习 | `/concept/residual-networks` | 已有短页 | 是 | P1 | 补形状投影和块实现 |
| `21_迁移学习与微调.md` | 迁移学习与微调 | 冻结、解冻、分层 LR、BN、头替换 | 深度学习 | `/concept/transfer-learning` | 已有短页 | 是 | P1 | 补阶段式微调 |
| `22_目标检测与图像分割.md` | 目标检测与图像分割 | boxes、分割、IoU、NMS、AP/mAP | 深度学习 | `/concept/detection-segmentation` | 已有短页 | 是 | P1 | 来源真实，保留协议说明 |
| `23_生成模型_VAE_GAN与扩散模型.md` | AE、VAE、GAN 与扩散 | 重建、KL、重参数化、对抗、去噪 | 深度学习 | `/concept/deep-generative-models`、`/concept/vae`、`/concept/gan`、`/concept/diffusion-models` | 已有合并页 | 是 | P1 | 三类生成方法拆页 |
| `24_深度学习其他方向概览.md` | 其他方向概览 | GNN、自监督、多模态、RL、语音、时序、推荐 | 深度学习 | `/concept/deep-learning-directions` | 遗漏 | 是 | P2 | 做方向地图；子方向不无依据扩写 |
| `25_训练工程实践_GPU混合精度复现与检查点.md` | 训练工程实践 | device、AMP、复现、累积、检查点、性能 | 深度学习 | `/concept/training-engineering`、`/concept/automatic-mixed-precision` | 已有短页 | 是 | P1 | AMP 和恢复训练需详细 |
| `26_深度学习模型调试指南.md` | 深度学习模型调试指南 | 极小 batch、shape、梯度、NaN、参数更新 | 深度学习 | `/concept/model-debugging` | 已有短页 | 是 | P0 | 调试顺序完整录入 |
| `27_模型保存加载推理与部署.md` | 模型保存、加载、推理与部署 | state_dict、artifact、eval、导出、监控 | 深度学习 | `/concept/model-saving-inference` | 已有短页 | 是 | P1 | 保持本地展示，不增加云服务 |
| `28_端到端项目_MNIST手写数字分类.md` | 端到端 MNIST 项目 | 数据、CNN、训练、验证、最佳模型、推理 | 深度学习 | `/concept/mnist-end-to-end-project` | 遗漏 | 是 | P0 | 完整项目页 |
| `29_深度学习术语表.md` | 深度学习术语表 | 全课程术语与易混淆词 | 深度学习 | 所有相关概念页与本清单 | 导航用途 | 是 | P2 | 用于查漏和别名，不为每个词重复建冲突页 |

## 数据结构审计

当前长文结构已支持定义、背景、直觉、原理、公式、变量、数值例、步骤、代码、输出、应用、错误、前置、关系和来源。需要增量加入：

- `subcategory`
- `importance`
- `learningObjectives`
- `commonQuestions`

用户状态 `isBookmarked`、`isLearned`、`isImportant`、`importantSections` 已由统一的 `LearningProvider` 保存在 localStorage，不重复写入静态内容数据。
