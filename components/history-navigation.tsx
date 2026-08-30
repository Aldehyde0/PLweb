'use client';

import { ArrowLeft,ArrowRight,History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Concept } from '@/lib/content';
import { categoryMap,conceptMap } from '@/lib/content';
import { getConceptHref } from '@/lib/concept-utils';
import { useLearning } from '@/components/learning-store';

export function HistoryNavigation({current}:{current:Concept}){const router=useRouter();const{items,index,goHistory}=useLearning();const previous=index>0?conceptMap[items[index-1]]:null;const next=index>=0&&index<items.length-1?conceptMap[items[index+1]]:null;function navigate(direction:-1|1){const slug=goHistory(direction);const target=slug?conceptMap[slug]:null;if(target)router.push(getConceptHref(target))}return <nav className="history-navigation" aria-label="访问历史导航"><HistoryLink concept={previous} direction="previous" onClick={()=>navigate(-1)}/><div className="history-current"><History/><span>当前阅读位置</span><strong>{items.length?`${index+1} / ${items.length}`:'1 / 1'}</strong><small>{current.title}</small></div><HistoryLink concept={next} direction="next" onClick={()=>navigate(1)}/></nav>}
function HistoryLink({concept,direction,onClick}:{concept:Concept|null;direction:'previous'|'next';onClick:()=>void}){const previous=direction==='previous';return <button type="button" disabled={!concept} onClick={onClick} className={`history-link history-link-${direction}`}>{previous&&<ArrowLeft/>}<span><small>{previous?'上一条访问':'下一条访问'}</small><strong>{concept?.title??'已到历史边界'}</strong>{concept&&<em>{categoryMap[concept.category].title}</em>}</span>{!previous&&<ArrowRight/>}</button>}
