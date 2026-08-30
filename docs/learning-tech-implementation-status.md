# learning_tech 网站实施状态

对应审计清单：[`learning-tech-coverage.md`](./learning-tech-coverage.md)

## 完成范围

- 已逐份读取 `learning_tech` 全部 16 个 Markdown 文件。
- 当前合并后共有 131 个唯一概念页面。
- 其中 90 个概念使用长文档结构，并显示来源文件与章节。
- 旧版中 8 个简短机器学习页面已由文档深度页覆盖：线性回归、逻辑回归、KNN、朴素贝叶斯、SVM、决策树、交叉验证、端到端项目。
- `02_preprocessing_feature_engineering.md` 的重要主题已全部拆为独立页面。

## 02 独立页面

1. `/concept/preprocessing-fit-transform-boundary`
2. `/concept/data-quality-audit`
3. `/concept/missing-value-imputation`
4. `/concept/categorical-encoding`
5. `/concept/numerical-standardization`
6. `/concept/min-max-scaling`
7. `/concept/robust-scaling-and-outliers`
8. `/concept/learning-rate-selection`
9. `/concept/gradient-descent-convergence`
10. `/concept/class-imbalance`
11. `/concept/feature-construction`
12. `/concept/skewed-and-cyclical-features`
13. `/concept/future-information-leakage`
14. `/concept/feature-selection`
15. `/concept/sklearn-pipeline-column-transformer`

数值标准化页面还映射了 `01` 中的均值/标准差、距离尺度，以及 `11` 中 L1 前标准化的相关章节。

## 长文档结构

每个文档深度页支持：

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

## 文档映射结果

| 文档 | 网站覆盖 |
|---|---|
| 00 导论 | 机器学习定义、任务类型、半/自监督、数据形状、训练/预测/泛化、数据职责、项目生命周期、拟合诊断 |
| 01 数学基础 | 向量矩阵、点积、统计量、概率阈值、贝叶斯、距离、梯度、MSE/RMSE、交叉熵、Gini、偏差方差、NumPy |
| 02 预处理 | 15 个独立深度页，见上方完整列表 |
| 03 线性模型 | 线性回归、逻辑回归、L1/L2/Elastic Net、权重解释、适用边界 |
| 04 KNN/NB/SVM | 三个独立深度模型页与公平比较页 |
| 05 树与集成 | 决策树、Bagging、随机森林、AdaBoost、梯度提升、对比、特征重要性 |
| 06 无监督 | K-Means/轮廓、层次聚类、DBSCAN、PCA、无监督评价 |
| 07 评估调参 | 评价设计、混淆矩阵、分类/回归指标、基线、搜索、泄漏、错误分析 |
| 08 端到端 | Wine 项目、模型保存、输入契约、漂移监控 |
| 09 学习路线 | 用于机器学习方向页的概念排序与阶段顺序 |
| 10 思维导图 | 用于概念关系、覆盖清单和相关概念链接 |
| 11 L1 | L1、软阈值、Lasso、L1 逻辑回归、Elastic Net |
| 12 过拟合 | 诊断顺序、深度学习正则化、无监督过拟合及模型页关联 |
| 13 交叉验证 | KFold/分层/重复、Group、TimeSeries、Pipeline、scoring、嵌套、cross_val_predict、报告 |
| Digits 项目 | 项目协议、模型比较、错误分析、工程交付、实验报告 |

## 扩展内容标注

此次新增的文档深度页均可追溯到上述本地文档，没有把文档外材料伪装成原文内容。`extensionNotes` 字段已预留；未来加入文档外补充时必须在该字段明确说明。
