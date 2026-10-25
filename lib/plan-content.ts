import { concepts } from './content.ts';
import { contentIndex } from './content-index.ts';
import { conceptDirectory, directoryConcepts } from './category-directory.ts';
import { resolveConceptLink } from './concept-utils.ts';
import { resourcesForConcept } from './resources.ts';
import type { PlanConcept } from './plan-engine.ts';
/** One MDX-derived contract shared by the plan UI and content integration tests. */
export const planConcepts: PlanConcept[] = directoryConcepts(concepts).map(
  (concept) => {
    const long = contentIndex[concept.slug].longForm;
    return {
      slug: concept.slug,
      subcategory: conceptDirectory(concept),
      title: concept.title,
      category: concept.category,
      difficulty: concept.difficulty,
      prerequisites: concept.prerequisites.map(
        (identifier) =>
          resolveConceptLink(identifier).concept?.slug ?? identifier,
      ),
      hasCode: Boolean(concept.code?.source),
      hasInteractive: contentIndex[concept.slug].demos.some((d) =>
        d.name.endsWith('Demo'),
      ),
      hasFormula: Boolean(
        long?.formulas.some((formula) => formula.expression !== '—') ??
        concept.formula.expression !== '—',
      ),
      definition: long?.definition ?? [concept.explanation],
      summary: concept.summary,
      principles: long?.corePrinciple ?? [concept.principle],
      relatedConcepts: concept.relatedConcepts.flatMap((identifier) => {
        const resolved = resolveConceptLink(identifier).concept;
        return resolved ? [resolved.title] : [];
      }),
      inputs: long?.inputs ?? [],
      outputs: long?.outputs ?? [],
      resources: resourcesForConcept(concept.slug).map((resource) => ({
        id: resource.id,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        summary: resource.summary,
        estimatedMinutes:
          resource.type === '视频' || resource.type === '视频课程'
            ? 20
            : resource.type === 'GitHub 仓库' || resource.type === '代码教程'
              ? 30
              : resource.type === '论文'
                ? 25
                : 12,
        recommendationLevel: resource.recommendationLevel,
      })),
    };
  },
);
