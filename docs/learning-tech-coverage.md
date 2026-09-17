# learning_tech 文档概念覆盖清单

审计范围：`学习资料/learning_tech` 下全部 Markdown，包括 `README.md`、`00`–`13`、`practice_project_digits/README.md` 与 `REPORT_TEMPLATE.md`。

审计方式：逐份阅读正文、数学公式、表格、代码示例、检查题和项目验收要求；不是依据文件名或标题推断。

状态说明：

- `已有独立页`：网站已有可点击概念页，但仍需升级为长文结构。
- `被合并`：只出现在综合页面中，不满足独立访问要求。
- `遗漏`：当前网站没有对应页面。
- `导航/项目`：适合做路线或项目页面，不等同于普通术语。

## 00｜机器学习导论

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–2 | 机器学习定义、适用边界 | 机器学习 | `/concept/machine-learning-overview` | 被合并 |
| 3.1 | 监督学习 | 机器学习 | `/concept/supervised-learning` | 已有独立页，内容偏短 |
| 3.1 | 分类与回归 | 机器学习 | `/concept/classification-vs-regression` | 遗漏 |
| 3.2 | 无监督学习 | 机器学习 | `/concept/unsupervised-learning` | 已有独立页，内容偏短 |
| 3.3 | 半监督与自监督学习 | 机器学习 | `/concept/semi-and-self-supervised-learning` | 遗漏 |
| 4 | X、y 与样本/特征形状 | 机器学习 | `/concept/dataset-shapes` | 被合并 |
| 5 | fit、predict 与泛化 | 机器学习 | `/concept/training-prediction-generalization` | 被合并 |
| 6 | 训练集、验证集、测试集 | 机器学习 | `/concept/train-validation-test-split` | 被合并 |
| 7 | 机器学习项目生命周期 | 机器学习 | `/concept/ml-project-lifecycle` | 被合并 |
| 8 | 欠拟合、过拟合与合适拟合 | 机器学习 | `/concept/underfitting-overfitting` | 被合并 |

## 01｜数学与数据基础

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1 | 标量、向量、矩阵与形状 | 机器学习 | `/concept/scalars-vectors-matrices` | 被合并 |
| 2 | 点积与加权求和 | 机器学习 | `/concept/dot-product-weighted-sum` | 被合并 |
| 3 | 均值、方差与标准差 | 机器学习 | `/concept/mean-variance-standard-deviation` | 被合并 |
| 4.1 | 概率、分类概率与阈值 | 机器学习 | `/concept/probability-and-thresholds` | 遗漏 |
| 4.2–4.3 | 条件概率与贝叶斯公式 | 机器学习 | `/concept/conditional-probability-bayes` | 被合并到朴素贝叶斯 |
| 5 | 欧氏距离与尺度问题 | 机器学习 | `/concept/euclidean-distance` | 被合并 |
| 6 | 导数、梯度与梯度下降 | 机器学习 | `/concept/gradient-descent` | 被合并 |
| 7.1 | MSE 与 RMSE | 机器学习 | `/concept/mse-rmse` | 被合并到损失函数 |
| 7.2 | 交叉熵与概率质量 | 机器学习 | `/concept/cross-entropy` | 被合并到损失函数 |
| 7.3 | 基尼不纯度与划分增益 | 机器学习 | `/concept/gini-impurity` | 被合并到决策树 |
| 8 | 偏差、方差与学习曲线 | 机器学习 | `/concept/bias-variance-learning-curves` | 被合并 |
| 9 | NumPy 必备操作 | 机器学习 | `/concept/numpy-data-operations` | 被合并 |

## 02｜数据预处理与特征工程（最高优先级）

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1 | 预处理 fit/transform 边界 | 机器学习 | `/concept/preprocessing-fit-transform-boundary` | 被合并 |
| 2 | 数据质量检查 | 机器学习 | `/concept/data-quality-audit` | 遗漏 |
| 3 | 缺失值处理与缺失指示 | 机器学习 | `/concept/missing-value-imputation` | 被合并 |
| 4 | One-Hot 与有序编码 | 机器学习 | `/concept/categorical-encoding` | 被合并 |
| 5 | Z-score 数值标准化 | 机器学习 | `/concept/numerical-standardization` | **遗漏，必须独立深度页** |
| 5 | Min-Max 归一化 | 机器学习 | `/concept/min-max-scaling` | 遗漏 |
| 5、8 | Robust Scaling 与异常值 | 机器学习 | `/concept/robust-scaling-and-outliers` | 遗漏 |
| 6 | 学习率选择 | 机器学习 | `/concept/learning-rate-selection` | 被合并 |
| 7 | 梯度下降收敛诊断 | 机器学习 | `/concept/gradient-descent-convergence` | 遗漏 |
| 9 | 类别不平衡、阈值与重采样边界 | 机器学习 | `/concept/class-imbalance` | 被合并到评估 |
| 10 | 领域、比率、交互、多项式特征 | 机器学习 | `/concept/feature-construction` | 被合并 |
| 10 | 偏态与周期特征变换 | 机器学习 | `/concept/skewed-and-cyclical-features` | 遗漏 |
| 10 | 未来信息泄漏 | 机器学习 | `/concept/future-information-leakage` | 被合并 |
| 11 | 特征选择方法与限制 | 机器学习 | `/concept/feature-selection` | 被合并 |
| 12–13 | Pipeline 与 ColumnTransformer | 机器学习 | `/concept/sklearn-pipeline-column-transformer` | 被合并 |

## 03｜线性模型

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–2 | 线性回归、MSE 与权重求解 | 机器学习 | `/concept/linear-regression` | 已有独立页，内容偏短 |
| 3 | 逻辑回归、Sigmoid、Softmax、交叉熵 | 机器学习 | `/concept/logistic-regression` | 已有独立页，内容偏短 |
| 4 | L1、L2 与 C | 机器学习 | `/concept/regularization-l1-l2` | 被合并 |
| 5 | 权重解释、尺度、相关性与因果 | 机器学习 | `/concept/linear-model-interpretation` | 遗漏 |
| 6–8 | 线性模型边界、优缺点与选择 | 机器学习 | `/concept/linear-model-scope` | 被合并 |

## 04｜近邻、贝叶斯与支持向量机

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1 | KNN：存储、距离、投票、K 与维度灾难 | 机器学习 | `/concept/knn` | 已有独立页，内容偏短 |
| 2 | 高斯朴素贝叶斯与对数概率 | 机器学习 | `/concept/naive-bayes` | 已有独立页，内容偏短 |
| 3 | SVM、最大间隔、C、核与 gamma | 机器学习 | `/concept/support-vector-machines` | 已有独立页，内容偏短 |
| 4–5 | 三类模型公平比较 | 机器学习 | `/concept/model-family-comparison` | 遗漏 |

## 05｜决策树与集成学习

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–4 | 决策树、候选阈值、递归与剪枝参数 | 机器学习 | `/concept/decision-trees` | 已有独立页，内容偏短 |
| 5–6 | 集成学习与 Bagging | 机器学习 | `/concept/bagging` | 被合并 |
| 7 | 随机森林、随机特征与 OOB | 机器学习 | `/concept/random-forest` | 被合并 |
| 8 | AdaBoost | 机器学习 | `/concept/adaboost` | 遗漏 |
| 9 | 梯度提升树 | 机器学习 | `/concept/gradient-boosting-trees` | 被合并 |
| 10 | Bagging 与 Boosting 对比 | 机器学习 | `/concept/bagging-vs-boosting` | 被合并 |
| 11 | 特征重要性与因果限制 | 机器学习 | `/concept/tree-feature-importance` | 遗漏 |

## 06｜无监督学习

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–2 | 无监督任务与缩放边界 | 机器学习 | `/concept/unsupervised-learning` | 已有独立页，内容偏短 |
| 3–4 | K-Means、K 选择与轮廓系数 | 机器学习 | `/concept/kmeans-and-silhouette` | 被合并 |
| 5 | 层次聚类与 linkage | 机器学习 | `/concept/hierarchical-clustering` | 遗漏 |
| 6 | DBSCAN、核心点、边界点、噪声点 | 机器学习 | `/concept/dbscan` | 遗漏 |
| 7 | PCA、解释方差与限制 | 机器学习 | `/concept/principal-component-analysis` | 被合并 |
| 8–9 | 分类/聚类差异与无监督评价 | 机器学习 | `/concept/unsupervised-evaluation` | 被合并 |

## 07｜模型评估与调参

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–2 | 真实使用场景、时间/分组/来源划分 | 机器学习 | `/concept/evaluation-design` | 被合并 |
| 3 | 交叉验证基础 | 机器学习 | `/concept/cross-validation` | 已有独立页，内容偏短 |
| 4 | 混淆矩阵 | 机器学习 | `/concept/confusion-matrix` | 被合并 |
| 5 | Accuracy、Precision、Recall、F1、AUC | 机器学习 | `/concept/classification-metrics` | 被合并 |
| 6 | MAE、MSE、RMSE、R² | 机器学习 | `/concept/regression-metrics` | 被合并 |
| 7 | Dummy 基线 | 机器学习 | `/concept/baseline-models` | 遗漏 |
| 8–9 | GridSearch、RandomizedSearch 与测试集边界 | 机器学习 | `/concept/hyperparameter-search` | 被合并 |
| 10 | 数据泄漏模式 | 机器学习 | `/concept/data-leakage` | 被合并 |
| 11–12 | 错误分析与可靠评价模板 | 机器学习 | `/concept/error-analysis` | 被合并 |

## 08｜端到端项目

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–7 | Wine 分类实验协议与公平模型比较 | 机器学习 | `/concept/end-to-end-ml-project` | 已有独立页，内容偏短 |
| 8–9 | joblib 保存、可信加载与二维输入 | 机器学习 | `/concept/sklearn-model-persistence` | 被合并 |
| 10–11 | 输入契约与训练/预测分离 | 机器学习 | `/concept/inference-input-contract` | 被合并 |
| 12 | 数据漂移、概念漂移与上线监控 | 机器学习 | `/concept/model-monitoring-and-drift` | 遗漏 |

## 09–10｜学习路线与知识地图

| 文档章节 | 核心概念 | 目标方向 | 目标位置 | 审计发现 |
|---|---|---|---|---|
| 09 全文 | 八阶段学习路线、通过标准、记录模板 | 机器学习 | 机器学习方向页顺序与来源导航 | 部分覆盖，缺少阶段标识 |
| 10 全文 | 问题→数据→模型→评价→工程知识图 | 机器学习 | 覆盖清单与概念关系 | 部分覆盖 |

## 11｜L1 正则化专题

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–4 | L1 数学形式、次梯度、稀疏性、L1/L2 | 机器学习 | `/concept/l1-regularization` | 被合并 |
| 5 | 标准化与公平惩罚 | 机器学习 | `/concept/numerical-standardization` | 遗漏独立页 |
| 6 | 近端梯度与软阈值 | 机器学习 | `/concept/proximal-gradient-soft-thresholding` | 遗漏 |
| 7–9 | Lasso、LassoCV 与正则化路径 | 机器学习 | `/concept/lasso-regression` | 遗漏 |
| 10 | L1 逻辑回归与求解器兼容 | 机器学习 | `/concept/l1-logistic-regression` | 遗漏 |
| 4、11 | Elastic Net、相关特征与限制 | 机器学习 | `/concept/elastic-net` | 遗漏 |

## 12｜过拟合专题

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–4 | 泛化差距、排除泄漏/漂移、学习曲线、解决顺序 | 机器学习 | `/concept/overfitting-diagnosis` | 被合并 |
| 5–12 | 各传统模型的复杂度控制 | 机器学习 | 各模型页面的“过拟合控制”章节 | 多数遗漏 |
| 13 | 神经网络的容量、权重衰减、Dropout、增强、早停 | 深度学习 | `/concept/deep-learning-regularization` | 遗漏 |
| 14 | 无监督学习中的过拟合 | 机器学习 | `/concept/unsupervised-overfitting` | 遗漏 |

## 13｜交叉验证专题

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| 1–2 | K 折平均、标准差与测试集角色 | 机器学习 | `/concept/cross-validation` | 已有独立页，内容偏短 |
| 3–6 | KFold、StratifiedKFold、折数、重复 CV | 机器学习 | `/concept/cross-validation-splitters` | 被合并 |
| 7 | GroupKFold、StratifiedGroupKFold | 机器学习 | `/concept/group-cross-validation` | 被合并 |
| 8 | TimeSeriesSplit、gap 与因果特征 | 机器学习 | `/concept/time-series-cross-validation` | 被合并 |
| 9 | Pipeline、特征选择与重采样折内边界 | 机器学习 | `/concept/cv-pipeline-leakage` | 被合并 |
| 10–11 | cross_validate 与 scoring | 机器学习 | `/concept/cross-validation-scoring` | 被合并 |
| 12 | GridSearchCV 与 RandomizedSearchCV | 机器学习 | `/concept/hyperparameter-search` | 被合并 |
| 13 | 嵌套交叉验证 | 机器学习 | `/concept/nested-cross-validation` | 遗漏 |
| 14 | cross_val_predict 的用途和限制 | 机器学习 | `/concept/cross-val-predict` | 遗漏 |
| 17–19 | 结果报告与常见错误 | 机器学习 | `/concept/cross-validation-reporting` | 遗漏 |

## 综合项目｜Digits 传统机器学习识别

| 文档章节 | 核心概念 | 目标方向 | 目标路由 | 审计发现 |
|---|---|---|---|---|
| README 1–5 | Digits 数据、十分类、macro F1、固定协议 | 机器学习 | `/concept/digits-ml-project` | 遗漏 |
| README 6–9 | Dummy、逻辑回归、KNN、树、RF/SVM、公平比较 | 机器学习 | `/concept/digits-model-comparison` | 遗漏 |
| README 8、12–14 | 图表、错误样本、功能需求与评分 | 机器学习 | `/concept/digits-error-analysis` | 遗漏 |
| README 10–17 | 限制、工程结构、交付与验收 | 机器学习 | `/concept/digits-project-delivery` | 遗漏 |
| REPORT_TEMPLATE | 可复现实验报告结构 | 机器学习 | `/concept/ml-experiment-reporting` | 遗漏 |

## 当前数据结构审计

当前结构只有单个 `summary`、`explanation`、`principle`、单公式、单代码块和若干列表，无法完整承载文档。需要增加：

- `definition`
- `background`
- `intuition`
- `corePrinciple`
- `formulas[]`
- `variableDefinitions[]`
- `numericalExample`
- `algorithmSteps[]`
- `codeExamples[]`
- `codeExplanation`
- `expectedOutput`
- `applications[]`
- `pitfalls[]`
- `prerequisites[]`
- `relatedConcepts[]`
- `sourceDocuments[]`
- `sourceSections[]`
- `extensionNotes[]`

## 实施优先级

1. `02`：数值标准化、缺失值、类别编码、缩放比较、异常值、类别不平衡、特征构造/选择、Pipeline。
2. `00–01`：任务类型、数据形状、统计量、概率、距离、梯度与损失。
3. `07、13`：评价指标、基线、交叉验证划分器、搜索、嵌套 CV、报告。
4. `03–06、11–12`：独立模型页、正则化、集成学习、无监督方法和过拟合控制。
5. `08` 与 Digits 项目：工程闭环、模型持久化、输入契约、漂移、项目验收。

文档之外的内容必须在页面 `extensionNotes` 中明确标记为“扩展内容”。
