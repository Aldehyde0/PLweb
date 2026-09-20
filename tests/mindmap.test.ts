import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMindMap,
  layoutMindMap,
  type MapConcept,
} from '../lib/mindmap.ts';
const items: MapConcept[] = [
  {
    slug: 'machine-learning-overview',
    title: '机器学习',
    category: 'machine-learning',
    group: '基础',
    prerequisites: [],
    relatedConcepts: [],
  },
  ...Array.from({ length: 60 }, (_, i) => ({
    slug: `topic-${i}`,
    title: `概念 ${i}`,
    category: 'machine-learning',
    group: `目录 ${i % 5}`,
    prerequisites: i ? [`topic-${i - 1}`] : [],
    relatedConcepts: i ? ['topic-0', 'topic-0', 'missing'] : [],
  })),
  {
    slug: 'external',
    title: '其他方向',
    category: 'deep-learning',
    group: '其他',
    prerequisites: [],
    relatedConcepts: [],
  },
];
void test('includes every category concept once without truncation', () => {
  const graph = buildMindMap('machine-learning', items);
  assert.equal(graph.conceptCount, 61);
  assert.equal(
    new Set(graph.nodes.flatMap((n) => (n.concept ? [n.concept.slug] : [])))
      .size,
    61,
  );
  assert.ok(graph.nodes.every((n) => n.concept?.category !== 'deep-learning'));
});
void test('relations are resolved, deduplicated and never invent missing nodes', () => {
  const graph = buildMindMap('machine-learning', items);
  const ids = new Set(graph.nodes.map((n) => n.id));
  assert.ok(
    graph.edges.every(
      (e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to,
    ),
  );
  assert.equal(
    new Set(graph.edges.map((e) => `${e.kind}/${e.from}/${e.to}`)).size,
    graph.edges.length,
  );
  assert.ok(graph.edges.some((e) => e.kind === 'prerequisite'));
  assert.ok(graph.edges.some((e) => e.kind === 'related'));
  assert.ok(graph.unresolvedCount > 0);
});
void test('cyclic prerequisite relationships do not affect the directory tree', () => {
  const graph = buildMindMap(
    'machine-learning',
    items.map((c) => ({
      ...c,
      prerequisites: c.slug === 'topic-0' ? ['topic-1'] : c.prerequisites,
    })),
  );
  assert.equal(graph.nodes.filter((n) => n.concept).length, 61);
  const hierarchy = graph.edges.filter((e) => e.kind === 'hierarchy');
  assert.equal(hierarchy.length, graph.nodes.length - 1);
});
void test('desktop and touch layouts contain nonoverlapping nodes', () => {
  const graph = buildMindMap('machine-learning', items);
  for (const width of [320, 768, 1280]) {
    const layout = layoutMindMap(graph, width);
    for (const n of layout.nodes) {
      assert.ok(n.x >= 0 && n.x + n.width <= width + 0.01);
      assert.ok(n.y >= 0 && n.y + n.height <= layout.height);
    }
    const leaves = layout.nodes.filter((n) => n.kind === 'concept');
    for (let i = 0; i < leaves.length; i++)
      for (let j = i + 1; j < leaves.length; j++) {
        const a = leaves[i]!,
          b = leaves[j]!;
        assert.ok(
          a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y,
        );
      }
  }
});
