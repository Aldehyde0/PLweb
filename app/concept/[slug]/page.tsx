import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConceptView } from '@/components/concept-view';
import { categoryMap, conceptMap, concepts } from '@/lib/content';
import { articleLoaders } from '@/lib/generated/mdx-registry';
import { mdxComponents } from '@/components/mdx-components';

export function generateStaticParams() {
  return concepts.map((concept) => ({ slug: concept.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concept = conceptMap[slug];
  if (!concept) return {};
  const title = `${concept.title} · Layerwise`;
  return {
    title,
    description: concept.summary,
    openGraph: { title, description: concept.summary, images: [] },
    twitter: { title, description: concept.summary, images: [] },
  };
}
export default async function ConceptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = conceptMap[slug];
  if (!concept) notFound();
  const loader = articleLoaders[slug as keyof typeof articleLoaders];
  if(!loader) throw new Error(`MDX 路由缺少编译模块：${slug}`);
  const Article = (await loader()).default;
  return (
    <ConceptView concept={concept} category={categoryMap[concept.category]}>
      <div className="article-flow mdx-article"><Article components={mdxComponents} /></div>
    </ConceptView>
  );
}
