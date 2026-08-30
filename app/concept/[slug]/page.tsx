import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConceptView } from '@/components/concept-view';
import { categoryMap, conceptMap, concepts } from '@/lib/content';

export function generateStaticParams(){return concepts.map((concept)=>({slug:concept.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const concept=conceptMap[slug];if(!concept)return{};const title=`${concept.title} · how to learn AI`;return{title,description:concept.summary,openGraph:{title,description:concept.summary,images:[]},twitter:{title,description:concept.summary,images:[]}}}
export default async function ConceptPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const concept=conceptMap[slug];if(!concept)notFound();return <ConceptView concept={concept} category={categoryMap[concept.category]}/>}
