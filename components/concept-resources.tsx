import Link from 'next/link';
import { ArrowRight, LibraryBig } from 'lucide-react';
import { resourcesForConcept } from '@/lib/resources';
import { ImportantSection } from '@/components/important-section';
import { ResourceCard } from '@/components/resource-card';

export function ConceptResources({ conceptSlug }: { conceptSlug: string }) {
  const resources = resourcesForConcept(conceptSlug);
  return (
    <ImportantSection
      conceptSlug={conceptSlug}
      sectionId="recommended-resources"
      title="推荐学习资料"
    >
      {resources.length ? (
        <>
          <div className="resource-grid concept-resource-grid">
            {resources.slice(0, 6).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          <Link className="concept-resource-more" href="/resources">
            查看资料参考库
            <ArrowRight />
          </Link>
        </>
      ) : (
        <div className="concept-resource-empty">
          <LibraryBig />
          <div>
            <strong>暂未收录相关资料</strong>
            <p>参考库不会生成虚假资源或无效外部链接。</p>
          </div>
        </div>
      )}
    </ImportantSection>
  );
}
