/** Small, serializable map model; only resolved knowledge links become edges. */
export interface MapConcept {
  slug: string;
  title: string;
  category: string;
  group: string;
  prerequisites: string[];
  relatedConcepts: string[];
}
export interface MapNode {
  id: string;
  title: string;
  kind: 'root' | 'group' | 'concept';
  branch: number;
  group: string;
  concept?: MapConcept;
}
export interface MapEdge {
  from: string;
  to: string;
  kind: 'hierarchy' | 'prerequisite' | 'related';
  branch: number;
}
export interface MindMapGraph {
  category: string;
  nodes: MapNode[];
  edges: MapEdge[];
  conceptCount: number;
  unresolvedCount: number;
}
export interface PositionedNode extends MapNode {
  x: number;
  y: number;
  width: number;
  height: number;
}
const overview: Record<string, string> = {
  'machine-learning': 'machine-learning-overview',
  'deep-learning': 'neural-networks',
  'artificial-intelligence': 'ai-overview',
  'reinforcement-learning': 'agent-environment',
};
export function buildMindMap(
  category: string,
  all: MapConcept[],
): MindMapGraph {
  const concepts = [
    ...new Map(
      all.filter((c) => c.category === category).map((c) => [c.slug, c]),
    ).values(),
  ];
  const root =
    concepts.find((c) => c.slug === overview[category]) ?? concepts[0];
  if (!root)
    return {
      category,
      nodes: [],
      edges: [],
      conceptCount: 0,
      unresolvedCount: 0,
    };
  const groups = [...new Set(concepts.map((c) => c.group))];
  const nodes: MapNode[] = [
    {
      id: root.slug,
      title: root.title,
      kind: 'root',
      branch: 0,
      group: root.group,
      concept: root,
    },
  ];
  const edges: MapEdge[] = [];
  groups.forEach((group, branch) => {
    const children = concepts.filter(
      (c) => c.group === group && c.slug !== root.slug,
    );
    if (!children.length) return;
    const id = `directory:${group}`;
    nodes.push({ id, title: group, kind: 'group', branch, group });
    edges.push({ from: root.slug, to: id, kind: 'hierarchy', branch });
    for (const concept of children) {
      nodes.push({
        id: concept.slug,
        title: concept.title,
        kind: 'concept',
        branch,
        group,
        concept,
      });
      edges.push({ from: id, to: concept.slug, kind: 'hierarchy', branch });
    }
  });
  const ids = new Map(nodes.map((n) => [n.id, n]));
  const known = new Set(all.map((c) => c.slug));
  const seen = new Set<string>();
  let unresolvedCount = 0;
  for (const c of concepts)
    for (const kind of ['prerequisite', 'related'] as const) {
      const refs =
        kind === 'prerequisite' ? c.prerequisites : c.relatedConcepts;
      for (const other of new Set(refs)) {
        if (!known.has(other)) {
          unresolvedCount++;
          continue;
        }
        if (!ids.has(other) || other === c.slug) continue;
        const from =
          kind === 'prerequisite' ? other : [other, c.slug].sort()[0]!;
        const to =
          kind === 'prerequisite' ? c.slug : [other, c.slug].sort()[1]!;
        const key = `${kind}/${from}/${to}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ from, to, kind, branch: ids.get(c.slug)!.branch });
      }
    }
  return {
    category,
    nodes,
    edges,
    conceptCount: concepts.length,
    unresolvedCount,
  };
}

/** Balance complete directory branches on both sides without moving concept order. */
export function layoutMindMap(graph: MindMapGraph, width: number) {
  const compact = width < 680;
  const groups = graph.nodes.filter((n) => n.kind === 'group');
  const positioned: PositionedNode[] = [];
  const cursors = [compact ? 160 : 48, 48];
  const padding = 16,
    inner = width - padding * 2,
    row = 60;
  for (const group of groups) {
    const children = graph.nodes.filter(
      (n) => n.kind === 'concept' && n.group === group.group,
    );
    const side = compact ? 0 : cursors[0]! <= cursors[1]! ? 0 : 1;
    const start = cursors[side]!;
    const columns = width >= 1200 && children.length >= 8 ? 2 : 1;
    const rows = Math.ceil(children.length / columns);
    const center = start + (rows * row - 12) / 2;
    const groupWidth = inner * (compact ? 0.28 : 0.16);
    const leafWidth = inner * (compact ? 0.47 : columns === 2 ? 0.115 : 0.22);
    const groupCenter =
      padding + inner * (compact ? 0.2 : side === 0 ? 0.34 : 0.66);
    const leafCenter =
      padding + inner * (compact ? 0.755 : side === 0 ? 0.11 : 0.89);
    positioned.push({
      ...group,
      x: groupCenter - groupWidth / 2,
      y: center - 24,
      width: groupWidth,
      height: 48,
    });
    children.forEach((node, i) =>
      positioned.push({
        ...node,
        x:
          (columns === 2
            ? padding +
              inner *
                (side === 0 ? [0.0625, 0.205][i % 2]! : [0.795, 0.9375][i % 2]!)
            : leafCenter) -
          leafWidth / 2,
        y: start + Math.floor(i / columns) * row,
        width: leafWidth,
        height: 48,
      }),
    );
    cursors[side] = start + rows * row + 40;
  }
  const height = Math.max(440, ...cursors) + 32;
  const root = graph.nodes.find((n) => n.kind === 'root');
  if (root) {
    const rootWidth = compact ? Math.min(200, inner * 0.7) : inner * 0.14;
    positioned.unshift({
      ...root,
      x: (width - rootWidth) / 2,
      y: compact ? 32 : height / 2 - 32,
      width: rootWidth,
      height: 64,
    });
  }
  return { nodes: positioned, height, compact };
}

/** Scale around the pointer, accounting for centering when the map is smaller than its viewport. */
export function zoomMindMap(
  scale: number,
  requested: number,
  left: number,
  top: number,
  x: number,
  y: number,
  canvasWidth: number,
  viewportWidth: number,
) {
  const next = Math.min(
    2.5,
    Math.max(0.2, Number.isFinite(requested) ? requested : scale),
  );
  const oldOffset = Math.max(0, (viewportWidth - canvasWidth * scale) / 2);
  const newOffset = Math.max(0, (viewportWidth - canvasWidth * next) / 2);
  return {
    scale: next,
    left: Math.max(0, ((left + x - oldOffset) * next) / scale + newOffset - x),
    top: Math.max(0, ((top + y) * next) / scale - y),
  };
}
