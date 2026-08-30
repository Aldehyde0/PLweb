import type { Concept, Difficulty } from './content';
import { conceptMap, concepts } from './content';

export type ConceptSortMode='difficulty-asc'|'difficulty-desc';
export const difficultyOrder:Record<string,number>={入门:1,进阶:2,挑战:3};

const aliases:Record<string,string>={
  'Python 基础':'numpy-data-operations','基础 Python':'numpy-data-operations','基本 Python':'numpy-data-operations',
  '高中数学':'math-data-foundations','基础数学':'math-data-foundations','线性代数':'scalars-vectors-matrices',
  '概率基础':'probability-and-thresholds','概率':'probability-and-thresholds','微积分':'gradient-descent',
  '均值、方差与标准差':'mean-variance-standard-deviation','训练集、验证集和测试集':'train-validation-test-split',
  '训练/验证/测试职责':'train-validation-test-split','训练测试划分':'train-validation-test-split',
  'NumPy 数组':'numpy-data-operations','矩阵':'scalars-vectors-matrices','向量':'scalars-vectors-matrices',
  '损失函数':'loss-functions','神经网络':'neural-networks','MDP':'markov-decision-process',
  '状态与奖励':'state-action-reward','梯度下降':'gradient-descent','交叉验证':'cross-validation',
  'Pipeline':'sklearn-pipeline-column-transformer','标准化':'numerical-standardization','决策树':'decision-trees',
};

const normalizedTitleMap=new Map(concepts.map((concept)=>[normalize(concept.title),concept]));
function normalize(value:string){return value.trim().toLowerCase().replace(/[、，,\/（）()\s·：:]/g,'')}

export function getConceptBySlug(slug:string){return conceptMap[slug]??null}
export function getConceptById(id:string){return concepts.find((concept)=>concept.id===id)??null}
export function getConceptHref(concept:Concept){return `/concept/${encodeURIComponent(concept.slug)}`}

export function resolveConceptLink(identifier:string){
  const alias=aliases[identifier.trim()];
  const concept=getConceptBySlug(alias??identifier)||getConceptById(identifier)||normalizedTitleMap.get(normalize(identifier))||null;
  return{identifier,label:concept?.title??identifier,concept,href:concept?getConceptHref(concept):null,exists:Boolean(concept)};
}
export function hasConceptRoute(identifier:string){return resolveConceptLink(identifier).exists}

export function getDifficultyRank(difficulty:Difficulty|string|undefined){return difficultyOrder[difficulty??'']??2}
export function sortConcepts(items:Concept[],bookmarks:string[],mode:ConceptSortMode='difficulty-asc'){
  const saved=new Set(bookmarks);const direction=mode==='difficulty-desc'?-1:1;
  return items.map((concept,index)=>({concept,index})).sort((a,b)=>{
    const bookmarkDifference=Number(saved.has(b.concept.slug))-Number(saved.has(a.concept.slug));
    if(bookmarkDifference!==0)return bookmarkDifference;
    const difficultyDifference=(getDifficultyRank(a.concept.difficulty)-getDifficultyRank(b.concept.difficulty))*direction;
    return difficultyDifference!==0?difficultyDifference:a.index-b.index;
  }).map(({concept})=>concept);
}

export function sectionIdFromTitle(title:string){const known:Record<string,string>={'学习前需要掌握':'prerequisites','前置知识':'prerequisites','背景与问题':'background','概念定义':'definition','直观理解':'intuition','通俗直觉':'intuition','核心原理':'core-principle','数学表达':'formulas','数学公式':'formulas','变量解释':'variables','完整数值示例':'numerical-example','计算与实现步骤':'algorithm-steps','工作流程':'algorithm-steps','代码实现':'code','代码示例':'code','实际应用':'applications','应用场景':'applications','常见错误':'pitfalls','常见误区':'pitfalls','与其他概念的关系':'related','相关概念':'related','文档来源':'sources','扩展内容说明':'extension'};return known[title]??`section-${normalize(title)}`}

export const sortModeLabels:Record<ConceptSortMode,string>={'difficulty-asc':'收藏优先，难度递增','difficulty-desc':'收藏优先，难度递减'};
