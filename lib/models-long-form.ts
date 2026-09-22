import type { CodeLanguage, LongFormConcept } from './long-form-content';
type I = {
  slug: string;
  title: string;
  summary: string;
  definition: string;
  background: string;
  intuition: string;
  principle: string;
  formula: string;
  steps: string[];
  code: string;
  output: string;
  apps: string[];
  pitfalls: string[];
  pre: string[];
  related: string[];
  doc: string;
  docTitle: string;
  sections: string[];
  language?: CodeLanguage;
  difficulty?: '入门' | '进阶' | '挑战';
};
function m(i: I): LongFormConcept {
  return {
    id: i.slug,
    slug: i.slug,
    title: i.title,
    category: 'machine-learning',
    difficulty: i.difficulty ?? '进阶',
    summary: i.summary,
    definition: [i.definition],
    background: [i.background],
    intuition: [i.intuition],
    corePrinciple: [i.principle],
    formulas: [
      { label: '核心表达', expression: i.formula, description: i.principle },
    ],
    variableDefinitions: [],
    algorithmSteps: i.steps,
    codeExamples: [
      {
        title: `${i.title} 实现`,
        language: i.language ?? 'scikit-learn',
        purpose: '对应文档中的训练与预测逻辑。',
        source: i.code,
        explanation: [
          '代码先建立符合输入要求的估计器。',
          '参数应在交叉验证中选择，测试集不参与。',
        ],
        expectedOutput: i.output,
      },
    ],
    codeExplanation: ['代码展示而不在浏览器执行。'],
    applications: i.apps,
    pitfalls: i.pitfalls,
    prerequisites: i.pre,
    relatedConcepts: i.related,
    sourceDocuments: [
      {
        title: i.docTitle,
        kind: '原始文档',
      },
    ],
    sourceSections: i.sections,
    extensionNotes: [],
  };
}
export const modelsLongForms: LongFormConcept[] = [
  m({
    slug: 'linear-regression',
    title: '线性回归',
    summary: '用特征加权和预测连续数值，通过最小化平方误差学习权重与偏置。',
    definition: '多元线性回归假设预测值是输入特征的仿射组合。',
    background:
      '它是回归任务的重要基线，可用解析方法或梯度优化求参数。加入多项式特征后仍对转换后特征线性。',
    intuition: '寻找一条线或超平面，使所有样本到预测面的平方偏差总体最小。',
    principle:
      '权重和偏置由训练数据 fit；MSE 强调大误差。尺度、异常值、共线性和高维会影响稳定性。',
    formula: 'ŷ=Xw+b；MSE=(1/n)||y-ŷ||²',
    steps: [
      '检查连续目标',
      '划分数据',
      '建立均值基线',
      '拟合线性回归',
      '查看权重与残差',
      '用 MAE/RMSE/R² 评价',
    ],
    code: `from sklearn.linear_model import LinearRegression\nmodel=LinearRegression().fit(X_train,y_train)\nprint(model.coef_, model.intercept_)\nprint(model.score(X_test,y_test))`,
    output: '输出特征权重、偏置和测试 R²。',
    apps: ['房价预测', '趋势基线'],
    pitfalls: ['相关性当因果', '异常值主导 MSE', '非线性关系仍强行解释'],
    pre: ['点积', 'MSE'],
    related: [
      'mse-rmse',
      'regularization-l1-l2',
      'linear-model-interpretation',
    ],
    doc: '03_linear_models.md',
    docTitle: '03｜线性模型',
    sections: ['§1 什么是线性模型', '§2 线性回归'],
  }),
  m({
    slug: 'logistic-regression',
    title: '逻辑回归',
    summary: '先计算线性分数，再用 Sigmoid 或 Softmax 得到类别概率。',
    definition:
      '逻辑回归是分类模型而非回归模型；二分类建模 log-odds，多分类计算多个类别分数。',
    background:
      '它训练快、参数较少、可输出概率，是高维稀疏和小数据任务的重要基线。',
    intuition:
      '线性分数表示证据强弱，Sigmoid 把分数压到 0～1，再由阈值决定行动。',
    principle:
      '通常最小化交叉熵并加入 L1/L2。StandardScaler 让优化和正则化更稳定；C 是正则强度倒数。',
    formula: 'p=1/(1+e⁻ᶻ)，z=wᵀx+b',
    steps: [
      '标准化连续特征',
      '拟合交叉熵目标',
      '查看 predict_proba',
      '在验证集选择阈值/C',
      '测试并检查校准',
    ],
    code: `from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nmodel=make_pipeline(StandardScaler(),LogisticRegression(C=1,max_iter=2000))\nmodel.fit(X_train,y_train)\nprint(model.predict_proba(X_test[:3]))`,
    output: '每行输出各类别概率且总和约为 1。',
    apps: ['二分类', '多分类', '概率基线'],
    pitfalls: ['C 方向理解反', '未缩放就比较权重', '概率等同可信度'],
    pre: ['点积', '交叉熵'],
    related: [
      'cross-entropy',
      'probability-and-thresholds',
      'regularization-l1-l2',
    ],
    doc: '03_linear_models.md',
    docTitle: '03｜线性模型',
    sections: ['§3 逻辑回归', '§4 为什么需要正则化'],
  }),
  m({
    slug: 'regularization-l1-l2',
    title: 'L1、L2 与 Elastic Net',
    summary: '在数据损失上加入权重惩罚，控制复杂度并改善未见数据稳定性。',
    definition:
      'L1 惩罚绝对值和并产生稀疏权重；L2 惩罚平方和并平滑收缩；Elastic Net 混合二者。',
    background: '高维、小样本、噪声与共线性可能让线性模型权重过大且不稳定。',
    intuition: '不仅要求答对训练题，还对过于极端的参数收费。',
    principle:
      '特征需先标准化以保证惩罚公平。正则过强会欠拟合，强度必须在训练集内部交叉验证。',
    formula: 'J=Jdata+λ₁||w||₁+λ₂||w||²₂',
    steps: [
      '标准化',
      '选择惩罚类型',
      '设对数候选强度',
      '交叉验证',
      '检查训练/验证和非零权重',
      '最终测试',
    ],
    code: `from sklearn.linear_model import ElasticNet\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nmodel=make_pipeline(StandardScaler(),ElasticNet(alpha=0.1,l1_ratio=0.5))`,
    output: '得到同时受 L1 与 L2 约束的回归模型。',
    apps: ['高维回归', '稳定权重', '特征选择'],
    pitfalls: ['未标准化', '正则越强越好', '零权重解释为无因果作用'],
    pre: ['线性模型', '标准化'],
    related: ['l1-regularization', 'elastic-net', 'overfitting-diagnosis'],
    doc: '03_linear_models.md',
    docTitle: '03｜线性模型',
    sections: ['§4 为什么需要正则化'],
  }),
  m({
    slug: 'linear-model-interpretation',
    title: '线性模型权重解释',
    summary: '权重描述控制其他特征后，特征变化与模型分数之间的统计关系。',
    definition:
      '在线性分数中，wⱼ 表示 xⱼ 增加一个单位时 score 的变化；标准化后可比较一个标准差变化的影响。',
    background:
      '尺度、共线性、多分类参数和正则化都会改变权重，模型关联不是因果。',
    intuition: '权重像模型内部的方向和力度，不是现实世界的原因证明。',
    principle:
      '解释前说明预处理、目标编码、类别基准和不确定性；相关特征可能分摊或交换权重。',
    formula: 'Δscore=wⱼΔxⱼ',
    steps: [
      '确认特征尺度',
      '提取正确类别权重',
      '结合方向与单位',
      '检查相关性和稳定性',
      '避免因果语言',
    ],
    code: `logreg=model.named_steps["logisticregression"]\nprint(logreg.coef_.shape)\nprint(logreg.coef_)`,
    output: '二分类或多分类对应的权重矩阵。',
    apps: ['模型审查', '特征方向分析'],
    pitfalls: ['不同尺度直接比绝对值', '权重当因果', '忽略类别基准'],
    pre: ['线性模型', '标准化'],
    related: ['logistic-regression', 'tree-feature-importance'],
    doc: '03_linear_models.md',
    docTitle: '03｜线性模型',
    sections: ['§5 权重如何解释'],
  }),
  m({
    slug: 'linear-model-scope',
    title: '线性模型的适用边界',
    summary:
      '线性模型快速稳定且适合稀疏高维，但复杂非线性需特征构造或其他模型。',
    definition:
      '线性边界在原始特征空间是超平面；模型容量由特征表示和正则化共同决定。',
    background:
      '模型简单不等于任务简单。文本 TF-IDF 可在高维空间近似线性分开，而环形二维数据则不适合原始线性边界。',
    intuition:
      '是否线性取决于模型看到的坐标系；改变 φ(x) 可以让弯曲关系在新空间变直。',
    principle:
      '先把线性模型作为基线，再通过残差和验证结果决定是否构造特征、用核方法或树。',
    formula: 'f(x)=wᵀφ(x)+b',
    steps: [
      '建立线性基线',
      '检查残差/错误区域',
      '尝试有意义特征',
      '交叉验证比较',
      '权衡解释与成本',
    ],
    code: `from sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.linear_model import Ridge\nfrom sklearn.pipeline import make_pipeline\nmodel=make_pipeline(PolynomialFeatures(2,include_bias=False),Ridge(alpha=1))`,
    output: '得到对二阶特征线性的非线性回归器。',
    apps: ['稀疏文本', '快速基线'],
    pitfalls: ['复杂模型一定更好', '盲目高阶多项式'],
    pre: ['线性回归', '特征工程'],
    related: ['feature-construction', 'support-vector-machines'],
    doc: '03_linear_models.md',
    docTitle: '03｜线性模型',
    sections: [
      '§6 线性模型的优缺点',
      '§7 什么时候优先尝试',
      '§8 线性与非线性边界',
    ],
  }),
  m({
    slug: 'knn',
    title: 'K 近邻',
    summary: '保存训练样本，预测时按标准化后的距离寻找 K 个邻居并投票或平均。',
    definition:
      'KNN 是基于实例的非参数方法，fit 主要保存数据，计算成本集中在 predict。',
    background:
      'K 控制偏差方差：太小追随噪声，太大抹平局部结构；高维中距离区分能力下降。',
    intuition: '新样本向最相似的已知样本询问答案。',
    principle:
      '距离必须在合理尺度与特征空间中计算。K、距离权重和特征选择通过交叉验证确定。',
    formula: 'ŷ=mode{yᵢ|xᵢ∈Nₖ(x)}',
    steps: [
      '填补与标准化',
      '选择距离',
      '交叉验证 K',
      '拟合保存样本',
      '预测邻居投票',
      '检查速度',
    ],
    code: `from sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nmodel=make_pipeline(StandardScaler(),KNeighborsClassifier(n_neighbors=5,weights="distance"))`,
    output: '得到距离加权的 KNN Pipeline。',
    apps: ['中小数据分类', '相似检索'],
    pitfalls: ['未标准化', 'K 用测试集选择', '无关高维特征'],
    pre: ['欧氏距离', '标准化'],
    related: ['euclidean-distance', 'cross-validation'],
    doc: '04_neighbors_bayes_svm.md',
    docTitle: '04｜近邻、贝叶斯与支持向量机',
    sections: ['§1 K近邻'],
  }),
  m({
    slug: 'naive-bayes',
    title: '高斯朴素贝叶斯',
    summary:
      '学习各类别先验与每个连续特征的类别条件高斯分布，在对数空间比较后验。',
    definition:
      '模型假设给定类别后特征条件独立，并为每类每特征估计均值和方差。',
    background: '假设常不完全真实，但参数少、速度快，小数据也可作为概率基线。',
    intuition: '把每项特征对各类别的匹配证据相乘，再乘类别本身常见程度。',
    principle:
      '实际用对数相加避免下溢；概率可能未校准，特征相关性会重复计算证据。',
    formula: 'log P(C|x)=log P(C)+Σⱼlog P(xⱼ|C)+const',
    steps: [
      '估计先验',
      '按类估计均值方差',
      '计算各特征似然',
      '对数求和',
      '归一化或 argmax',
    ],
    code: `from sklearn.naive_bayes import GaussianNB\nmodel=GaussianNB().fit(X_train,y_train)\nprint(model.theta_.shape, model.var_.shape)\nprint(model.predict_proba(X_test[:2]))`,
    output: '输出每类每特征统计量形状和两条样本概率。',
    apps: ['小数据分类', '快速概率基线'],
    pitfalls: ['独立假设当事实', '概率未经校准', '方差接近零'],
    pre: ['贝叶斯公式', '均值方差'],
    related: ['conditional-probability-bayes', 'model-family-comparison'],
    doc: '04_neighbors_bayes_svm.md',
    docTitle: '04｜近邻、贝叶斯与支持向量机',
    sections: ['§2 高斯朴素贝叶斯'],
  }),
  m({
    slug: 'support-vector-machines',
    title: '支持向量机',
    summary: '寻找最大间隔分类边界，软间隔允许错误，核函数表达非线性。',
    definition:
      'SVM 的边界由最靠近间隔的支持向量决定；C 控制错误惩罚，RBF gamma 控制局部影响范围。',
    background:
      '中小型高维数据常表现良好，但对尺度和参数敏感，大数据训练成本可能较高。',
    intuition: '不仅分开两类，还在两侧留出尽量宽的安全走廊。',
    principle:
      'C 小正则更强、边界更平滑；gamma 大影响更局部。两者和标准化必须在 Pipeline 内交叉验证。',
    formula: 'min ½||w||²+CΣξᵢ；Krbf(x,x′)=exp(-γ||x-x′||²)',
    steps: [
      '标准化',
      '选择核',
      '设 C/gamma 对数范围',
      '分层 CV',
      '检查支持向量与验证稳定性',
    ],
    code: `from sklearn.svm import SVC\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nmodel=make_pipeline(StandardScaler(),SVC(kernel="rbf",C=1,gamma="scale"))`,
    output: '得到标准化加 RBF SVM 的分类 Pipeline。',
    apps: ['中小分类', '高维特征'],
    pitfalls: ['未缩放', 'C/gamma 都过大', '无需求却开启 probability'],
    pre: ['距离', '线性边界'],
    related: ['model-family-comparison', 'hyperparameter-search'],
    doc: '04_neighbors_bayes_svm.md',
    docTitle: '04｜近邻、贝叶斯与支持向量机',
    sections: ['§3 支持向量机'],
  }),
  m({
    slug: 'model-family-comparison',
    title: 'KNN、贝叶斯与 SVM 对比',
    summary:
      '三类模型分别依赖邻居、概率假设和最大间隔，应在同一验证协议下公平比较。',
    definition:
      '模型比较不是只看最高平均分，还要比较尺度需求、训练/预测成本、稳定性、概率和解释方式。',
    background:
      '不同预处理要求必须由各自 Pipeline 体现，不能为了统一而省略必要步骤。',
    intuition: '让每位选手使用合法装备、在同一赛道和计分规则下比赛。',
    principle:
      '固定折、指标和随机种子；报告平均、标准差和耗时；测试集不参与候选选择。',
    formula: '选择 = 性能 + 波动 + 成本 + 解释 + 部署约束',
    steps: [
      '注册候选 Pipeline',
      '固定 StratifiedKFold',
      'cross_validate 多指标',
      '比较均值/波动/耗时',
      '锁定模型',
      '最终测试',
    ],
    code: `models={"knn":knn,"gnb":gnb,"svm":svm}\nfor name,model in models.items():\n    scores=cross_val_score(model,X,y,cv=cv)\n    print(name,scores.mean(),scores.std())`,
    output: '每个模型的交叉验证平均分和标准差。',
    apps: ['算法选型', '基线比较'],
    pitfalls: ['不同折比较', '测试分数选模型', '忽略预处理成本'],
    pre: ['交叉验证'],
    related: ['knn', 'naive-bayes', 'support-vector-machines'],
    doc: '04_neighbors_bayes_svm.md',
    docTitle: '04｜近邻、贝叶斯与支持向量机',
    sections: ['§4 三种模型的直接比较', '§5 在同一数据上公平比较'],
  }),
  m({
    slug: 'decision-trees',
    title: '决策树',
    summary:
      '递归枚举特征与阈值，选择不纯度下降最大的划分，叶节点输出多数类别或均值。',
    definition:
      '树由判断节点和叶子组成；每个判断把样本分为左右子集并继续递归。',
    background:
      '树能表达非线性和交互且无需标准化，但贪心、对数据变化敏感并易生成深层噪声规则。',
    intuition: '连续提出最能把类别分开的“是否小于阈值”问题。',
    principle:
      '候选阈值通常来自相邻不同值中点，选择 Gain 最大者。max_depth、min_samples_leaf 和 ccp_alpha 控制复杂度。',
    formula: 'Gain=I(parent)-Σc(nc/n)I(childc)',
    steps: [
      '排序候选特征值',
      '生成阈值',
      '计算左右不纯度',
      '选最大增益',
      '递归',
      '按停止条件生成叶',
    ],
    code: `from sklearn.tree import DecisionTreeClassifier\nmodel=DecisionTreeClassifier(max_depth=3,min_samples_leaf=5,random_state=42)\nmodel.fit(X_train,y_train)`,
    output: '得到受深度和叶节点样本限制的分类树。',
    apps: ['规则型表格任务', '可视化决策'],
    pitfalls: ['无限深树', '特征重要性当因果', '只凭外观选深度'],
    pre: ['Gini', '分类'],
    related: ['gini-impurity', 'bagging', 'overfitting-diagnosis'],
    doc: '05_tree_and_ensemble.md',
    docTitle: '05｜决策树与集成学习',
    sections: [
      '§1 决策树的模型结构',
      '§2 决策树如何学习',
      '§3 重要超参数',
      '§4 优缺点',
    ],
  }),
  m({
    slug: 'bagging',
    title: 'Bagging',
    summary: '对多个自助采样子集并行训练高方差模型，再投票或平均降低不稳定性。',
    definition:
      'Bootstrap Aggregating 允许有放回抽样，每个基学习器看到不同样本集合。',
    background:
      '单棵树对训练样本变化敏感；多个错误不完全相关的树平均后方差下降。',
    intuition: '让多位略有不同的评审独立判断，再汇总意见。',
    principle: '基模型需要有能力且保持差异。树越相关，平均收益越小。',
    formula: '分类 ŷ=mode{h₁(x)…hB(x)}；回归 ŷ=(1/B)Σhᵦ(x)',
    steps: [
      '生成 B 个 bootstrap 样本',
      '独立训练基模型',
      '收集预测',
      '投票/平均',
      '用 OOB 或 CV 评价',
    ],
    code: `from sklearn.ensemble import BaggingClassifier\nfrom sklearn.tree import DecisionTreeClassifier\nmodel=BaggingClassifier(DecisionTreeClassifier(),n_estimators=100,random_state=42)`,
    output: '得到由 100 棵 bootstrap 树组成的 Bagging 分类器。',
    apps: ['降低树方差', '并行集成'],
    pitfalls: ['基模型高度相关', '把 OOB 完全替代业务测试'],
    pre: ['决策树', '方差'],
    related: ['random-forest', 'bagging-vs-boosting'],
    doc: '05_tree_and_ensemble.md',
    docTitle: '05｜决策树与集成学习',
    sections: ['§5 集成学习的核心', '§6 Bagging'],
  }),
  m({
    slug: 'random-forest',
    title: '随机森林',
    summary: '在 Bagging 基础上让每个节点只看随机特征子集，降低树间相关性。',
    definition:
      '每棵树使用 bootstrap 样本，节点分裂时从 max_features 指定的随机子集中寻找最佳划分。',
    background:
      '强特征若总被首先选择，所有树会相似；随机特征迫使树产生不同视角。',
    intuition: '不仅给每位评审不同样本，也限制他们看到的特征清单。',
    principle:
      'n_estimators 增加主要提升平均稳定性；单树深度、min_samples_leaf、max_features 控制偏差方差。OOB 提供近似验证。',
    formula: 'forest(x)=vote(treeᵦ(x))',
    steps: [
      'bootstrap 抽样',
      '节点随机选特征',
      '深树训练',
      '多数投票',
      '检查 OOB/CV',
    ],
    code: `from sklearn.ensemble import RandomForestClassifier\nmodel=RandomForestClassifier(n_estimators=300,min_samples_leaf=2,max_features="sqrt",oob_score=True,n_jobs=-1,random_state=42)`,
    output: '训练后可查看 oob_score_ 和测试预测。',
    apps: ['表格分类回归', '稳定非线性基线'],
    pitfalls: ['重要性当因果', '树越多越能解决偏差', '忽略推理成本'],
    pre: ['Bagging', '决策树'],
    related: ['bagging', 'tree-feature-importance', 'overfitting-diagnosis'],
    doc: '05_tree_and_ensemble.md',
    docTitle: '05｜决策树与集成学习',
    sections: ['§7 随机森林'],
  }),
  m({
    slug: 'adaboost',
    title: 'AdaBoost',
    summary: '顺序训练弱学习器，提高误分类样本权重，并按学习器表现加权投票。',
    definition: 'AdaBoost 常使用浅树桩；每轮集中关注前面难以分类的样本。',
    background:
      '简单弱模型组合后可形成复杂边界，但错误标签和异常点也会被持续放大。',
    intuition: '错题在下一轮获得更高复习优先级。',
    principle:
      '后续学习器依赖当前样本权重，训练难以完全并行；学习率和学习器数量控制累积。',
    formula: 'F(x)=Σₜαₜhₜ(x)',
    steps: [
      '初始化等权',
      '训练弱学习器',
      '计算错误率',
      '提高错分权重',
      '计算模型权重',
      '加权投票',
    ],
    code: `from sklearn.ensemble import AdaBoostClassifier\nfrom sklearn.tree import DecisionTreeClassifier\nmodel=AdaBoostClassifier(estimator=DecisionTreeClassifier(max_depth=1),n_estimators=100,learning_rate=0.05,random_state=42)`,
    output: '得到由 100 个树桩顺序组合的分类器。',
    apps: ['结构化分类', '弱学习器集成'],
    pitfalls: ['噪声标签被反复关注', '只增加轮数不验证'],
    pre: ['决策树', '加权投票'],
    related: ['gradient-boosting-trees', 'bagging-vs-boosting'],
    doc: '05_tree_and_ensemble.md',
    docTitle: '05｜决策树与集成学习',
    sections: ['§8 AdaBoost'],
  }),
  m({
    slug: 'gradient-boosting-trees',
    title: '梯度提升树',
    summary: '按顺序添加树，拟合当前损失的负梯度方向，逐步修正已有模型。',
    definition: '梯度提升是加法模型，初始预测后每棵新树贡献 learning_rate×hₘ。',
    background:
      '小学习率配更多弱树通常稳定，但训练成本增加；树过深或迭代过多会拟合噪声。',
    intuition: '每一轮专门学习当前模型还没解释好的残差方向。',
    principle:
      'learning_rate、迭代数和单树复杂度联动；验证早停与子采样用于控制过拟合。',
    formula: 'Fₘ(x)=Fₘ₋₁(x)+ηhₘ(x)',
    steps: [
      '初始化常数模型',
      '计算损失负梯度',
      '训练弱树拟合',
      '按 η 加入',
      '验证早停',
    ],
    code: `from sklearn.ensemble import HistGradientBoostingClassifier\nmodel=HistGradientBoostingClassifier(learning_rate=0.05,max_iter=200,max_leaf_nodes=15,early_stopping=True,random_state=42)`,
    output: '得到带早停的直方图梯度提升分类器。',
    apps: ['高性能表格模型', '非线性分类回归'],
    pitfalls: ['学习率和轮数分开调', '树过深', '测试集决定停止'],
    pre: ['决策树', '梯度概念'],
    related: ['adaboost', 'bagging-vs-boosting'],
    doc: '05_tree_and_ensemble.md',
    docTitle: '05｜决策树与集成学习',
    sections: ['§9 梯度提升树'],
  }),
  m({
    slug: 'bagging-vs-boosting',
    title: 'Bagging 与 Boosting',
    summary: 'Bagging 独立训练并平均以降低方差，Boosting 顺序纠错以降低偏差。',
    definition: '两者都是集成，但训练依赖、组合方式、并行性和噪声敏感性不同。',
    background:
      '混淆二者会导致错误的调参直觉，例如以为随机森林后树专门修正前树。',
    intuition: 'Bagging 是多人独立投票，Boosting 是接力式纠错。',
    principle:
      '选择取决于基模型稳定性、训练资源、噪声与目标；都必须与单模型和业务基线比较。',
    formula: 'Bagging: average(hᵦ)；Boosting: Σηₘhₘ',
    steps: [
      '识别主要偏差/方差',
      '选择并行或顺序策略',
      '固定验证协议',
      '调单模型复杂度',
      '比较稳定性和成本',
    ],
    code: `models={"forest":RandomForestClassifier(random_state=42),"boost":HistGradientBoostingClassifier(random_state=42)}\nfor name,model in models.items():\n    print(name,cross_val_score(model,X,y,cv=cv).mean())`,
    output: '输出两种集成在同一折上的平均分。',
    apps: ['集成选型'],
    pitfalls: ['Boosting 天然总更好', '只看平均分'],
    pre: ['Bagging', 'Boosting'],
    related: ['bagging', 'random-forest', 'gradient-boosting-trees'],
    doc: '05_tree_and_ensemble.md',
    docTitle: '05｜决策树与集成学习',
    sections: ['§10 Bagging 与 Boosting 的区别'],
  }),
  m({
    slug: 'tree-feature-importance',
    title: '树模型特征重要性',
    summary: '不纯度重要性统计特征为树划分带来的累计改善，但不能解释因果。',
    definition: 'feature_importances_ 汇总特征用于分裂时加权不纯度下降。',
    background:
      '高基数特征、相关特征和训练偏差会扭曲重要性；相关特征可能分摊贡献。',
    intuition:
      '它回答“模型在这组树里多常靠该特征降低不纯度”，不回答“现实中它造成了结果”。',
    principle:
      '配合置换重要性、跨折稳定性和领域实验；重要性计算也必须基于可靠评价。',
    formula: 'Importance(j)=Σnodes using j weighted_gain(node)',
    steps: [
      '训练可靠模型',
      '提取不纯度重要性',
      '在验证数据做置换重要性',
      '检查相关特征',
      '跨折比较',
      '限制解释语言',
    ],
    code: `from sklearn.inspection import permutation_importance\nr=permutation_importance(model,X_test,y_test,n_repeats=10,random_state=42)\nprint(r.importances_mean)`,
    output: '每个特征被打乱后测试分数的平均下降。',
    apps: ['模型诊断', '特征审查'],
    pitfalls: ['重要性当因果', '用训练集置换', '忽略相关特征'],
    pre: ['决策树', '评价指标'],
    related: ['linear-model-interpretation', 'feature-selection'],
    doc: '05_tree_and_ensemble.md',
    docTitle: '05｜决策树与集成学习',
    sections: ['§11 特征重要性应谨慎解释'],
  }),
  m({
    slug: 'kmeans-and-silhouette',
    title: 'K-Means 与轮廓系数',
    summary:
      '交替把样本分给最近中心并更新均值，最小化簇内平方距离；轮廓系数辅助评价 K。',
    definition:
      'K-Means 需要预先给 K，学习 K 个中心；轮廓系数比较本簇紧密度与最近其他簇距离。',
    background: '对尺度、初始化、异常值和非球形簇敏感；编号不带业务语义。',
    intuition: '不断重复“按最近中心分组”和“把中心移到组均值”。',
    principle:
      '使用多次初始化并标准化。K 增大会单调降低簇内误差，肘部和轮廓只是参考，还需稳定性与业务解释。',
    formula: 'min Σᵢ||xᵢ-μcᵢ||²；s=(b-a)/max(a,b)',
    steps: [
      '标准化',
      '选择 K 和多次初始化',
      '分配最近中心',
      '更新中心',
      '收敛',
      '比较轮廓和稳定性',
    ],
    code: `from sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\nlabels=KMeans(n_clusters=3,n_init=20,random_state=42).fit_predict(X_scaled)\nprint(silhouette_score(X_scaled,labels))`,
    output: '输出 -1 到 1 之间的轮廓系数。',
    apps: ['用户分群', '探索结构'],
    pitfalls: ['簇号当真实标签', '只看肘部', '未标准化'],
    pre: ['欧氏距离', '标准化'],
    related: ['unsupervised-learning', 'hierarchical-clustering', 'dbscan'],
    doc: '06_unsupervised_learning.md',
    docTitle: '06｜无监督学习',
    sections: ['§3 K-Means', '§4 如何选择 K'],
  }),
  m({
    slug: 'hierarchical-clustering',
    title: '层次聚类',
    summary:
      '凝聚式方法从单样本簇开始按 linkage 逐步合并，形成可切割的树状层级。',
    definition: 'single、complete、average 和 ward 用不同规则定义簇间距离。',
    background:
      '无需算法开始时固定最终簇数，适合小数据层级分析，但早期错误合并通常不可撤销。',
    intuition: '先每人一组，再不断合并最相似的两个组，记录完整家谱树。',
    principle:
      'linkage 改变簇形状偏好；特征缩放和距离选择决定结果。大数据的距离矩阵成本高。',
    formula: 'Ward: 选择使簇内方差增加最少的合并',
    steps: [
      '标准化',
      '选择距离和 linkage',
      '每点成簇',
      '寻找最近簇',
      '合并并更新距离',
      '切割树状图',
    ],
    code: `from sklearn.cluster import AgglomerativeClustering\nmodel=AgglomerativeClustering(n_clusters=3,linkage="ward")\nlabels=model.fit_predict(X_scaled)`,
    output: '每条样本一个 0～2 的簇编号。',
    apps: ['层级客户分群', '小样本探索'],
    pitfalls: ['忽略 linkage', '大数据直接使用', '簇号语义化'],
    pre: ['距离', '聚类'],
    related: ['kmeans-and-silhouette', 'unsupervised-evaluation'],
    doc: '06_unsupervised_learning.md',
    docTitle: '06｜无监督学习',
    sections: ['§5 层次聚类'],
  }),
  m({
    slug: 'dbscan',
    title: 'DBSCAN 密度聚类',
    summary: '从核心点扩展高密度区域，识别任意形状簇并把孤立样本标为噪声。',
    definition:
      'eps 定义邻域半径，min_samples 定义核心点密度；样本分核心点、边界点与噪声点。',
    background: '无需预设簇数并能发现弯曲结构，但对尺度、eps 和密度差异敏感。',
    intuition: '从人群足够密集的位置出发，把相连的高密度邻域扩成一组。',
    principle:
      '标准化后根据距离分布选择 eps；高维中距离失去区分力，统一 eps 难覆盖密度差异大的簇。',
    formula: 'core(x) ⇔ |Nε(x)|≥min_samples',
    steps: [
      '标准化',
      '设置 eps/min_samples',
      '找核心点',
      '扩展相连核心邻域',
      '加入边界点',
      '噪声标 -1',
    ],
    code: `from sklearn.cluster import DBSCAN\nlabels=DBSCAN(eps=0.8,min_samples=5).fit_predict(X_scaled)\nprint(set(labels))`,
    output: '输出簇编号集合，可能包含噪声标记 -1。',
    apps: ['空间形状聚类', '噪声识别'],
    pitfalls: ['未缩放', '把 -1 当普通簇', '一组参数处理差异密度'],
    pre: ['距离', '密度'],
    related: ['kmeans-and-silhouette', 'hierarchical-clustering'],
    doc: '06_unsupervised_learning.md',
    docTitle: '06｜无监督学习',
    sections: ['§6 DBSCAN'],
  }),
  m({
    slug: 'principal-component-analysis',
    title: 'PCA 主成分分析',
    summary:
      '寻找互相正交、依次最大化投影方差的线性方向，用更少维度保留主要变化。',
    definition:
      'PCA 学习训练均值、主成分方向和解释方差；transform 把样本投影到这些方向。',
    background:
      '高维可视化、压缩与去冗余常用，但方差大不保证对预测有用，主成分解释可能困难。',
    intuition: '旋转坐标轴，让第一根轴沿数据云最伸展的方向。',
    principle:
      '特征尺度不同通常先标准化；PCA 必须位于 CV Pipeline 内。降维维数通过解释方差和下游验证选择。',
    formula: 'v₁=argmax||v||=1 Var(Xv)',
    steps: [
      '只在训练数据拟合缩放',
      '中心化/标准化',
      '求主方向',
      '选择成分数',
      '投影验证测试',
      '评估信息与下游表现',
    ],
    code: `from sklearn.decomposition import PCA\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nmodel=make_pipeline(StandardScaler(),PCA(n_components=2))\nX2=model.fit_transform(X)`,
    output: 'X2 形状为 (样本数,2)。',
    apps: ['二维可视化', '压缩与去相关'],
    pitfalls: ['不标准化', '把主成分当原始特征', '完整数据先 PCA'],
    pre: ['矩阵', '方差'],
    related: ['unsupervised-evaluation', 'cv-pipeline-leakage'],
    doc: '06_unsupervised_learning.md',
    docTitle: '06｜无监督学习',
    sections: ['§7 PCA 主成分分析'],
  }),
  m({
    slug: 'unsupervised-evaluation',
    title: '无监督学习结果评价',
    summary:
      '从内部结构、稳定性、外部标签、下游价值和领域解释多角度评价无标签结果。',
    definition:
      '没有标准标签时不能只用准确率；内部指标衡量数学结构，业务意义必须另行验证。',
    background:
      '高轮廓系数不保证分组可行动，降维保留方差也不保证保留预测信息。',
    intuition:
      '算法找到“像”的群体，但“像什么、是否有用”需要领域和独立实验回答。',
    principle:
      '检查随机种子与参数稳定性、专家解释、下游任务提升和独立数据复现。真实标签若存在只能用于事后外部评价。',
    formula: '评价 = 内部指标 + 稳定性 + 外部验证 + 业务价值',
    steps: [
      '计算内部指标',
      '改变参数/种子',
      '检查簇规模和样本',
      '领域命名',
      '独立数据验证',
      '评估下游价值',
    ],
    code: `for seed in [1,2,3,4,5]:\n    labels=KMeans(3,n_init=20,random_state=seed).fit_predict(X_scaled)\n    print(seed,silhouette_score(X_scaled,labels))`,
    output: '输出多个随机种子下的轮廓系数，用于观察稳定性。',
    apps: ['聚类审查', '降维验证'],
    pitfalls: ['簇直接命名业务类别', '只追求内部指标', '偷用标签训练'],
    pre: ['聚类', '评价'],
    related: ['kmeans-and-silhouette', 'principal-component-analysis'],
    doc: '06_unsupervised_learning.md',
    docTitle: '06｜无监督学习',
    sections: ['§8 聚类和分类的区别', '§9 无监督结果如何评价'],
  }),
];
