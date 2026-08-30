import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/category-view';
import { categories, categoryMap, getConceptsByCategory, type CategorySlug } from '@/lib/content';

export function generateStaticParams(){return categories.map((category)=>({category:category.slug}))}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){const {category:slug}=await params;const category=categoryMap[slug as CategorySlug];if(!category)notFound();return <CategoryView category={category} concepts={getConceptsByCategory(slug)}/>}
