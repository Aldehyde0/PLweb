'use client';

import { Star } from 'lucide-react';
import { useLearning } from '@/components/learning-store';

export function ImportantSection({conceptSlug,sectionId,title,nested=false,children}:{conceptSlug:string;sectionId:string;title:string;nested?:boolean;children:React.ReactNode}){const{importantSections,toggleImportantSection}=useLearning();const active=(importantSections[conceptSlug]??[]).includes(sectionId);return <section id={sectionId} data-important={active?'true':'false'} className={`${nested?'':'doc-section'} important-section`}><div className="section-heading-row"><h2>{title}</h2><button type="button" aria-label={active?`取消重点：${title}`:`标记重点：${title}`} aria-pressed={active} onClick={()=>toggleImportantSection(conceptSlug,sectionId)} className="important-toggle"><Star className={active?'fill-current':''}/><span>{active?'已标记':'标记重点'}</span></button></div><div className="doc-section-body">{children}</div></section>}
