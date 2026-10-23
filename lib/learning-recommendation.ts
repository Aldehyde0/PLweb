export function recommendConcept<T extends { slug: string }>(
  concepts: readonly T[],
  learned: readonly string[],
  recent: readonly string[],
): T | undefined {
  const completed = new Set(learned);
  const bySlug = new Map(concepts.map((concept) => [concept.slug, concept]));
  for (const slug of recent) {
    const concept = bySlug.get(slug);
    if (concept && !completed.has(slug)) return concept;
  }
  return (
    concepts.find((concept) => !completed.has(concept.slug)) ?? concepts[0]
  );
}
