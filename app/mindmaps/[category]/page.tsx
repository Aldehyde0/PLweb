import { notFound } from 'next/navigation';
import {
  categories,
  categoryMap,
  concepts,
  type CategorySlug,
} from '@/lib/content';
import { conceptDirectory, directoryConcepts } from '@/lib/category-directory';
import { resolveConceptLink } from '@/lib/concept-utils';
import { buildMindMap } from '@/lib/mindmap';
import { MindMapView } from '@/components/mindmap-view';

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}
export default async function MindMapPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const all = directoryConcepts(concepts).map((concept) => ({
    slug: concept.slug,
    title: concept.title,
    category: concept.category,
    group: conceptDirectory(concept),
    prerequisites: concept.prerequisites.map(
      (id) => resolveConceptLink(id).concept?.slug ?? id,
    ),
    relatedConcepts: concept.relatedConcepts.map(
      (id) => resolveConceptLink(id).concept?.slug ?? id,
    ),
  }));
  const graph = buildMindMap(category.slug, all);
  return (
    <MindMapView
      key={category.slug}
      category={categoryMap[category.slug as CategorySlug]}
      graph={graph}
      catalog={all}
    />
  );
}
