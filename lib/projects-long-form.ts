import type { LongFormConcept } from './long-form-content';
type I = {
  slug: string;
  title: string;
  summary: string;
  definition: string;
  background: string;
  principle: string;
  steps: string[];
  code: string;
  output: string;
  apps: string[];
  pitfalls: string[];
  related: string[];
  sections: string[];
  doc?: string;
  docTitle?: string;
};
function p(i: I): LongFormConcept {
  return {
    id: i.slug,
    slug: i.slug,
    title: i.title,
    category: 'machine-learning',
    difficulty: '挑战',
    summary: i.summary,
    definition: [i.definition],
    background: [i.background],
    intuition: ['把项目当作一条可复现、可审计的实验链，而不是追求一次最高分。'],
    corePrinciple: [i.principle],
    formulas: [
      {
        label: '项目主线',
        expression: '任务 → 数据 → 协议 → 基线 → 比较 → 测试 → 错误分析 → 交付',
        description: i.principle,
      },
    ],
    variableDefinitions: [],
    algorithmSteps: i.steps,
    codeExamples: [
      {
        title: `${i.title} 核心代码`,
        language: 'scikit-learn',
        purpose: '对应项目要求中的可运行核心步骤。',
        source: i.code,
        explanation: [
          '固定数据协议保证模型公平比较。',
          '测试集在方案锁定前保持不可见。',
        ],
        expectedOutput: i.output,
      },
    ],
    codeExplanation: ['实际项目还需保存图表、版本和报告。'],
    applications: i.apps,
    pitfalls: i.pitfalls,
    prerequisites: ['机器学习基本流程', 'Pipeline', '交叉验证', '分类指标'],
    relatedConcepts: i.related,
    sourceDocuments: [
      {
        title: i.docTitle ?? '综合练习项目｜传统机器学习手写数字识别',
        kind: '原始文档',
      },
    ],
    sourceSections: i.sections,
    extensionNotes: [],
  };
}
export const projectsLongForms: LongFormConcept[] = [
  p({
    slug: 'end-to-end-ml-project',
    title: '端到端 Wine 分类项目',
    summary:
      '从 Wine 数据审计、固定测试集、Pipeline、交叉验证与搜索走到最终评价、保存、预测和监控。',
    definition:
      '端到端项目要求每个阶段都有明确输入、输出和边界，最终产物是完整 Pipeline 与可复现报告。',
    background:
      '只调用 fit 无法保证预处理正确、比较公平、输入一致或上线可维护。',
    principle:
      '模型选择只使用训练部分的交叉验证；测试只在最佳配置锁定后一次评价。保存完整 Pipeline。',
    steps: [
      '加载 Wine 并检查 178×13 数据',
      '按 stratify 保留 20% 测试',
      '注册 LR/KNN/树/随机森林',
      '五折比较 Accuracy 与 macro F1',
      '训练部分 GridSearch',
      '最终测试',
      'joblib 保存加载',
      '输入契约和漂移监控',
    ],
    code: `models={\n "lr":make_pipeline(StandardScaler(),LogisticRegression(max_iter=3000)),\n "knn":make_pipeline(StandardScaler(),KNeighborsClassifier()),\n "tree":DecisionTreeClassifier(max_depth=3,random_state=42),\n "forest":RandomForestClassifier(random_state=42),\n}\nfor name,model in models.items():\n    r=cross_validate(model,X_train,y_train,cv=cv,scoring=["accuracy","f1_macro"])\n    print(name,r["test_f1_macro"].mean())`,
    output: '每个候选模型在同一训练折上的平均 macro F1。',
    apps: ['教学项目', '本地模型交付'],
    pitfalls: ['类别误称质量等级', '测试集选模型', '只保存分类器'],
    related: [
      'cross-validation',
      'sklearn-model-persistence',
      'model-monitoring-and-drift',
    ],
    doc: '08_end_to_end_project.md',
    docTitle: '08｜端到端机器学习项目',
    sections: [
      '§1–5 数据、候选模型与 CV',
      '§6–7 搜索和最终测试',
      '§8–13 保存、输入、监控与检查清单',
    ],
  }),
  p({
    slug: 'digits-ml-project',
    title: 'Digits 传统机器学习项目',
    summary:
      '使用 1797 张 8×8 灰度数字图、64 个像素特征完成十分类传统机器学习项目。',
    definition:
      '输入是展平后的 64 维像素，输出 0～9；项目明确禁止神经网络，用于巩固传统模型完整流程。',
    background:
      '类别数和特征数均高于 Wine，需要 macro F1、混淆矩阵和错误图，而不只是准确率。',
    principle:
      '固定 test_size=0.2、random_state=42、stratify=y；训练内部五折分层 CV，macro F1 为主指标。',
    steps: [
      'load_digits',
      '核对 data/images 对应',
      '固定分层划分',
      '锁定测试集',
      '建立 Dummy',
      '比较传统模型',
      '错误分析',
      '模型交付',
    ],
    code: `from sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nX,y=load_digits(return_X_y=True)\nX_train,X_test,y_train,y_test=train_test_split(X,y,test_size=.2,random_state=42,stratify=y)\nprint(X.shape, y.shape)`,
    output: 'X.shape=(1797,64)，y.shape=(1797,)。',
    apps: ['第一次综合分类项目', '图像像素传统建模'],
    pitfalls: ['使用 CNN 违反任务', '根据测试结果挑随机种子', '删除错误样本'],
    related: [
      'digits-model-comparison',
      'digits-error-analysis',
      'digits-project-delivery',
    ],
    sections: [
      '§1 项目定位',
      '§2 背景',
      '§3 数据说明',
      '§4 核心问题',
      '§5 固定实验协议',
    ],
  }),
  p({
    slug: 'digits-model-comparison',
    title: 'Digits 候选模型公平比较',
    summary:
      '统一比较 Dummy、标准化逻辑回归、标准化 KNN、决策树以及随机森林或 SVM。',
    definition:
      '模型注册表让所有候选共享同一 CV 与指标，同时保留各自必要的 Pipeline。',
    background:
      '逻辑回归/KNN/SVM 需要标准化，树通常不需要。K 和 max_depth 还需观察训练/验证差距。',
    principle:
      '主要按训练部分 CV macro F1 选择，不读取测试结果；报告均值、标准差、训练和验证耗时。',
    steps: [
      '注册 Dummy',
      'LR Pipeline',
      'KNN Pipeline 并比较 K',
      '树比较深度',
      '增加 RF/SVM',
      '同一五折 cross_validate',
      '锁定最终模型',
    ],
    code: `models={\n "dummy":DummyClassifier(strategy="most_frequent"),\n "lr":make_pipeline(StandardScaler(),LogisticRegression(max_iter=3000)),\n "knn":make_pipeline(StandardScaler(),KNeighborsClassifier()),\n "tree":DecisionTreeClassifier(random_state=42),\n}`,
    output: '得到名称到估计器的统一映射，后续同折比较。',
    apps: ['多模型实验', '算法选型'],
    pitfalls: ['不同折比较', '省略 Dummy', '需要缩放的模型脱离 Pipeline'],
    related: [
      'baseline-models',
      'model-family-comparison',
      'hyperparameter-search',
    ],
    sections: [
      '§6 必须完成的模型',
      '§7 推荐增加的模型',
      '§12 FR-04–FR-07',
      '§14 验收评分',
    ],
  }),
  p({
    slug: 'digits-error-analysis',
    title: 'Digits 可视化与错误分析',
    summary:
      '生成样本、分布、模型比较、混淆矩阵和错误样本五类图，并解释主要数字混淆。',
    definition:
      '错误分析把 y_pred!=y_test 的索引还原到 8×8 图像，标注真实值与预测值。',
    background:
      '总体 macro F1 无法说明哪些数字形状相似、哪些类别召回低或是否存在模糊标签。',
    principle:
      '图表必须保存为 PNG、包含完整标签与标题；错误少于 20 条时展示全部，不得删除不利样本。',
    steps: [
      '展示至少 20 个样本',
      '画 0–9 分布',
      '画 CV 平均与误差线',
      '最终模型混淆矩阵',
      '定位错误索引',
      '画至少 20 个错误',
      '总结混淆对',
    ],
    code: `error_idx=np.flatnonzero(y_pred!=y_test)\nfor idx in error_idx[:20]:\n    image=X_test[idx].reshape(8,8)\n    print("true",y_test[idx],"pred",y_pred[idx])`,
    output: '打印前 20 个错误样本的真实和预测数字，可用于绘图。',
    apps: ['分类错误诊断', '报告图表'],
    pitfalls: ['只挑易解释错误', '图不保存', '只有分数无样本'],
    related: ['confusion-matrix', 'error-analysis', 'classification-metrics'],
    sections: ['§8 必须完成的可视化', '§12 FR-08–FR-09', '§17 完成后应能回答'],
  }),
  p({
    slug: 'digits-project-delivery',
    title: 'Digits 项目工程交付与验收',
    summary:
      '按分级验收完成代码、依赖、五张图、模型、报告、预测程序和风险说明。',
    definition:
      '工程交付要求训练、评价和预测逻辑分离，路径基于 pathlib，输入错误给出清晰提示，结果可复现。',
    background:
      '一个高分 notebook 不等同可交付项目；模型文件、输入检查、命令、版本和限制同样重要。',
    principle:
      'Level 1–4 逐级完成；任何测试集泄漏、修改测试样本、使用深度学习替代或无法解释代码均一票否决。',
    steps: [
      '按推荐顺序实现 starter→图表→基线→CV→搜索→测试',
      '保存模型',
      '实现 predict.py 输入校验',
      '自动创建输出目录',
      '记录依赖和随机种子',
      '按评分表自检',
    ],
    code: `from pathlib import Path\nMODEL_PATH=Path(__file__).resolve().parent/"models"/"digits_classifier.joblib"\nif not MODEL_PATH.exists():\n    raise FileNotFoundError(f"模型不存在: {MODEL_PATH}")`,
    output: '使用与脚本位置相关的安全路径，并在模型缺失时给出明确错误。',
    apps: ['本地课程项目', '可复现实验'],
    pitfalls: ['硬编码个人绝对路径', '训练预测混在一起', '没有限制说明'],
    related: [
      'sklearn-model-persistence',
      'inference-input-contract',
      'ml-experiment-reporting',
    ],
    sections: [
      '§9 难度分级',
      '§10 强制限制',
      '§11 预期结构',
      '§13 非功能需求',
      '§14 验收',
      '§15–16 开发顺序与提交物',
    ],
  }),
  p({
    slug: 'ml-experiment-reporting',
    title: '机器学习实验报告',
    summary:
      '用结构化报告记录任务、环境、数据、协议、基线、候选、搜索、测试、错误、交付与限制。',
    definition:
      '报告不是结果截图集合，而是让读者能够复现并审查每个决策的实验档案。',
    background:
      '缺少随机种子、数据划分和预处理边界时，即使最终指标相同也无法判断实验是否可靠。',
    principle:
      '预先写主要指标和协议；结果部分同时记录训练、验证、测试与限制，不隐藏未达预期或错误样本。',
    steps: [
      '摘要与最终结果',
      '环境版本和命令',
      '数据规模与分布',
      '划分/CV/泄漏边界',
      '基线和候选',
      '搜索空间',
      '最终测试',
      '错误分析',
      '保存/输入检查',
      '限制和结论',
    ],
    code: `report={\n "random_state":42,\n "cv":"5-fold stratified",\n "primary_metric":"macro_f1",\n "test_used_once":True,\n}\nprint(report)`,
    output: '输出实验协议的可审计摘要。',
    apps: ['课程报告', '模型审查', '复现'],
    pitfalls: ['只报最好结果', '省略失败实验和限制', '无运行命令'],
    related: ['cross-validation-reporting', 'digits-project-delivery'],
    doc: 'practice_project_digits\\REPORT_TEMPLATE.md',
    docTitle: '手写数字识别项目报告模板',
    sections: [
      '§1–4 摘要、环境、数据与协议',
      '§5–8 模型、搜索与测试',
      '§9–13 错误、交付、限制与结论',
    ],
  }),
];
