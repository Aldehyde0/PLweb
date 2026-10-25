/** Shared by Vite, the index generator and migration verification. Build-time only. */
import { createProcessor, compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import { parse as parseYaml } from 'yaml';
import { aliases, normalize } from '../lib/concept-identifiers.ts';

export const demoNames = [
  'LearningRateDemo',
  'StandardizationDemo',
  'AIInteractiveDemo',
  'RLInteractiveDemo',
  'RLAlgorithmMatrix',
  'ConceptPrerequisites',
  'ConceptRelated',
  'ArticleFlags',
];
export const categories = [
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'reinforcement-learning',
];
const remarkPlugins = [
  remarkGfm,
  [remarkMath, { singleDollarTextMath: true }],
  remarkDirective,
];
const coreKeys = [
  'id',
  'slug',
  'title',
  'category',
  'difficulty',
  'summary',
  'prerequisites',
  'relatedConcepts',
];
const prepareBody = (body) =>
  body.replace(/^(## .+ )\{#([\w-]+)\}$/gm, '$1\\{#$2\\}');
export function splitSource(source, file) {
  // Git's Windows checkout can use CRLF. Anchor preprocessing and Markdown
  // parsing share canonical LF; the teaching content itself is unchanged.
  source = source.replaceAll('\r\n', '\n');
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error(`${file}: 缺少 YAML frontmatter`);
  return {
    metadata: parseYaml(match[1], { uniqueKeys: true }),
    body: source.slice(match[0].length),
  };
}
function walk(node, fn) {
  fn(node);
  for (const child of node.children ?? []) walk(child, fn);
}
export function plain(node) {
  if (node.type === 'inlineMath') return `$${node.value}$`;
  if (node.type === 'math') return node.value;
  if (node.type === 'break') return '\n';
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map(plain).join('');
}
function valueOf(node) {
  const children = node.children ?? [];
  const type = node.attributes?.type ?? 'text';
  if (
    ![
      'text',
      'paragraphs',
      'list',
      'ordered',
      'code',
      'table',
      'math',
    ].includes(type)
  )
    throw new Error(`字段 ${node.attributes.path} 使用未知类型 ${type}`);
  if (
    ['list', 'ordered'].includes(type) &&
    children.some((c) => c.type !== 'list')
  )
    throw new Error(`字段 ${node.attributes.path} 必须使用 Markdown 列表`);
  if (type === 'table' && !children.some((c) => c.type === 'table'))
    throw new Error(`字段 ${node.attributes.path} 缺少 Markdown 表格`);
  switch (node.attributes?.type) {
    case 'list':
    case 'ordered':
      return children.flatMap((c) =>
        c.type === 'list' ? c.children.map(plain) : [],
      );
    case 'paragraphs':
      return children.map(plain);
    case 'code': {
      const code = children.find((c) => c.type === 'code');
      if (!code) throw new Error(`字段 ${node.attributes.path} 缺少代码块`);
      return code.value + '\n'.repeat(Number(node.attributes.trailing ?? 0));
    }
    case 'table':
      return children.flatMap((c) =>
        c.type === 'table'
          ? c.children.slice(1).map((row) => ({
              symbol: plain(row.children[0]),
              meaning: plain(row.children[1]),
            }))
          : [],
      );
    default:
      return children.map(plain).join('\n\n');
  }
}
function put(object, path, value) {
  const keys = path.split('.');
  if (
    keys.some(
      (k) =>
        !/^([a-zA-Z][\w-]*|\d+)$/.test(k) ||
        ['__proto__', 'constructor', 'prototype'].includes(k),
    )
  )
    throw new Error(`无效字段路径 ${path}`);
  let target = object;
  for (let i = 0; i < keys.length - 1; i++)
    target = target[keys[i]] ??= /^\d+$/.test(keys[i + 1]) ? [] : {};
  target[keys.at(-1)] = value;
}
function headingInfo(node, file) {
  const text = plain(node);
  const match = /^(.*?)\s+\{#([a-zA-Z][\w-]*)\}$/.exec(text);
  if (!match)
    throw new Error(
      `${file}: 二级标题必须保留稳定锚点，例如 ## 概念定义 {#definition}`,
    );
  return { id: match[2], title: match[1] };
}
function getSection(tree, id) {
  let active = false;
  const nodes = [];
  for (const n of tree.children) {
    if (n.type === 'heading' && n.depth === 2) {
      active = plain(n).endsWith(`{#${id}}`);
      continue;
    }
    if (active) nodes.push(n);
  }
  return nodes;
}
export function parseArticle(source, file) {
  const { metadata: m, body } = splitSource(source, file);
  for (const key of [
    'id',
    'slug',
    'title',
    'category',
    'difficulty',
    'summary',
    'directory',
  ])
    if (typeof m?.[key] !== 'string' || !m[key].trim())
      throw new Error(`${file}: 缺少或无效元数据 ${key}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug))
    throw new Error(`${file}: 无效 slug ${m.slug}`);
  if (
    !categories.includes(m.category) ||
    !['入门', '进阶', '挑战'].includes(m.difficulty)
  )
    throw new Error(`${file}: category/difficulty 无效`);
  if (!Number.isSafeInteger(m.order) || m.order < 0)
    throw new Error(`${file}: order 必须是非负整数`);
  for (const key of ['prerequisites', 'relatedConcepts'])
    if (
      !Array.isArray(m[key]) ||
      m[key].some((x) => typeof x !== 'string' || !x.trim())
    )
      throw new Error(`${file}: ${key} 必须是字符串数组`);
  if (m.kind !== undefined && !['legacy', 'long-form'].includes(m.kind))
    throw new Error(`${file}: 无效 kind ${m.kind}`);
  if (
    m.preserved !== undefined &&
    (!m.preserved ||
      Array.isArray(m.preserved) ||
      typeof m.preserved !== 'object')
  )
    throw new Error(`${file}: preserved 必须为对象`);
  for (const key of coreKeys)
    if (Object.hasOwn(m.preserved ?? {}, key))
      throw new Error(`${file}: ${key} 不能在 preserved 中重复维护`);
  let tree;
  try {
    tree = createProcessor({ remarkPlugins }).parse(prepareBody(body));
  } catch (error) {
    throw new Error(`${file}: ${error.message}`, { cause: error });
  }
  const sections = tree.children
    .filter((n) => n.type === 'heading' && n.depth === 2)
    .map((n) => headingInfo(n, file));
  if (!sections.length) throw new Error(`${file}: 文章缺少二级章节`);
  const ids = new Set();
  for (const s of sections) {
    if (ids.has(s.id)) throw new Error(`${file}: 重复章节锚点 ${s.id}`);
    ids.add(s.id);
  }
  const data = {
    ...Object.fromEntries(coreKeys.map((k) => [k, m[k]])),
    ...m.preserved,
  };
  const fields = new Set();
  const demos = [];
  const links = [];
  walk(tree, (n) => {
    if (n.type === 'containerDirective' && n.name === 'field') {
      const path = n.attributes?.path;
      if (!path || fields.has(path))
        throw new Error(`${file}: 缺少或重复字段 ${path}`);
      if (coreKeys.includes(path.split('.')[0]))
        throw new Error(`${file}: ${path} 只能在 frontmatter 维护`);
      fields.add(path);
      put(data, path, valueOf(n));
    }
    if (n.type === 'mdxjsEsm')
      throw new Error(`${file}: 请使用集中组件映射，不在文章中 import/export`);
    if (n.type === 'textDirective' || n.type === 'leafDirective')
      throw new Error(`${file}: 未知指令 ${n.name}；字面冒号请写成 \\:`);
    if (n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') {
      if (!demoNames.includes(n.name))
        throw new Error(`${file}: 未知交互组件 ${n.name}`);
      demos.push({ name: n.name, attributes: n.attributes });
      const kinds = {
        AIInteractiveDemo: [
          'agent-loop',
          'tool-call',
          'capability-comparison',
          'mcp-flow',
          'single-multi',
        ],
        RLInteractiveDemo: [
          'gridworld',
          'q-sarsa',
          'dqn',
          'policy-gradient',
          'ppo',
          'dpo-grpo',
          'algorithm-comparison',
        ],
      };
      if (kinds[n.name]) {
        const kind = n.attributes.find((x) => x.name === 'kind')?.value;
        if (typeof kind !== 'string' || !kinds[n.name].includes(kind))
          throw new Error(`${file}: ${n.name} 的 kind 无效：${kind}`);
      }
    }
    if (n.type === 'link' || n.type === 'definition') links.push(n.url);
  });
  const sectionParagraphs = (id) =>
    getSection(tree, id).flatMap((n) =>
      n.type === 'paragraph'
        ? [plain(n)]
        : n.type === 'list'
          ? n.children.map(plain)
          : [],
    );
  // Authors can write a new article using only Markdown. Field directives are
  // optional and preserve the richer structured data of migrated articles.
  const defaults = {
    definition: sectionParagraphs('definition'),
    background: sectionParagraphs('background'),
    intuition: sectionParagraphs('intuition'),
    corePrinciple: sectionParagraphs('core-principle'),
    algorithmSteps: sectionParagraphs('algorithm-steps'),
    applications: sectionParagraphs('applications'),
    pitfalls: sectionParagraphs('pitfalls'),
    extensionNotes: [],
    formulas: [],
    variableDefinitions: [],
    codeExamples: [],
    codeExplanation: [],
    sourceDocuments: m.sources?.documents ?? [],
    sourceSections: m.sources?.sections ?? [],
  };
  if (m.kind !== 'legacy')
    for (const [key, value] of Object.entries(defaults))
      if (data[key] === undefined) data[key] = value;
  if (!fields.size) {
    walk(tree, (n) => {
      if (n.type === 'math')
        data.formulas.push({
          label: '数学表达',
          expression: n.value,
          description: '',
        });
      if (n.type === 'code')
        data.codeExamples.push({
          title: '代码示例',
          language: n.lang ?? 'text',
          purpose: '',
          source: n.value,
          explanation: [],
          expectedOutput: '',
        });
    });
  }
  const strings = (value) =>
    Array.isArray(value) && value.every((x) => typeof x === 'string');
  if (m.kind !== 'legacy') {
    for (const key of [
      'definition',
      'background',
      'intuition',
      'corePrinciple',
      'algorithmSteps',
      'codeExplanation',
      'applications',
      'pitfalls',
      'extensionNotes',
      'sourceSections',
    ])
      if (!strings(data[key]))
        throw new Error(`${file}: ${key} 必须是文本数组`);
    for (const key of [
      'formulas',
      'variableDefinitions',
      'codeExamples',
      'sourceDocuments',
    ])
      if (!Array.isArray(data[key]))
        throw new Error(`${file}: ${key} 必须是数组`);
    for (const [i, code] of data.codeExamples.entries())
      if (
        !code ||
        !['title', 'language', 'purpose', 'source', 'expectedOutput'].every(
          (k) => typeof code[k] === 'string',
        ) ||
        !strings(code.explanation)
      )
        throw new Error(`${file}: codeExamples.${i} 缺少或损坏必要字段`);
    for (const [i, formula] of data.formulas.entries())
      if (
        !formula ||
        !['label', 'expression', 'description'].every(
          (k) => typeof formula[k] === 'string',
        )
      )
        throw new Error(`${file}: formulas.${i} 缺少或损坏必要字段`);
  }
  const longForm = m.kind === 'legacy' ? null : data;
  const concept = m.kind === 'legacy' ? data : toConcept(data);
  const searchText = [m.title, m.summary, ...tree.children.map(plain)].join(
    '\n',
  );
  return {
    file,
    metadata: m,
    tree,
    sections,
    longForm,
    concept,
    searchText,
    demos,
    links,
  };
}
export function toConcept(item) {
  return {
    ...Object.fromEntries(coreKeys.map((k) => [k, item[k]])),
    explanation: item.intuition.join(' '),
    principle: item.corePrinciple.join(' '),
    formula: {
      expression: item.formulas[0]?.expression ?? '—',
      description: item.formulas[0]?.description ?? '—',
    },
    workflow: item.algorithmSteps,
    code: {
      language: ['NumPy', 'PyTorch'].includes(item.codeExamples[0]?.language)
        ? item.codeExamples[0].language
        : 'Python',
      source: item.codeExamples[0]?.source ?? '',
      highlights: item.codeExamples[0]?.explanation ?? [],
    },
    codeExplanation: item.codeExplanation.join(' '),
    applications: item.applications,
    pitfalls: item.pitfalls,
  };
}
export function validateArticles(articles, externalKnowledge = []) {
  const ids = new Set(),
    slugs = new Set(),
    orders = new Set();
  const byKey = new Map();
  for (const a of articles) {
    for (const key of ['id', 'slug', 'order']) {
      const set = key === 'id' ? ids : key === 'slug' ? slugs : orders;
      if (set.has(a.metadata[key]))
        throw new Error(
          `${a.file}: 重复 ${key === 'id' ? 'ID' : key} ${a.metadata[key]}`,
        );
      set.add(a.metadata[key]);
    }
    for (const key of [
      a.metadata.id,
      a.metadata.slug,
      normalize(a.metadata.title),
    ])
      byKey.set(key, a);
  }
  for (const a of articles) {
    for (const ref of [
      ...a.metadata.prerequisites,
      ...a.metadata.relatedConcepts,
    ]) {
      const alias = aliases[ref.trim()];
      if (
        alias
          ? !byKey.has(alias)
          : !byKey.has(ref) &&
            !byKey.has(normalize(ref)) &&
            !externalKnowledge.includes(ref)
      )
        throw new Error(`${a.file}: 无效概念引用 ${ref}`);
    }
    for (const link of a.links) {
      const match = /^\/concept\/([^/?#]+)(?:[/?#]|$)/.exec(link);
      if (match) {
        const target = byKey.get(decodeURIComponent(match[1]));
        const fragment = link.includes('#')
          ? decodeURIComponent(link.split('#')[1])
          : '';
        if (
          !target ||
          (fragment &&
            !target.sections.some((s) => s.id === fragment) &&
            !Object.hasOwn(target.metadata.anchorAliases ?? {}, fragment))
        )
          throw new Error(`${a.file}: 无效文章链接 ${link}`);
      } else if (
        link.startsWith('#') &&
        !a.sections.some((s) => s.id === link.slice(1)) &&
        !Object.hasOwn(a.metadata.anchorAliases ?? {}, link.slice(1))
      )
        throw new Error(`${a.file}: 无效章节链接 ${link}`);
    }
  }
}
const attr = (name, value) => ({
  type: 'mdxJsxAttribute',
  name,
  value: String(value),
});
function jsx(name, props, children = []) {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: Object.entries(props).map(([k, v]) => attr(k, v)),
    children,
  };
}
/** Turn author Markdown into existing interactive React components. */
export function articleRemark(metadata, file) {
  return () => (tree) => {
    // Reparse once to share exactly the same extraction rules as the index.
    const a = parseArticle(metadata.source, file);
    function transform(node) {
      if (node.type === 'containerDirective') {
        if (node.name === 'field') {
          node.data = { hName: 'div', hProperties: { className: 'mdx-field' } };
          if (node.attributes.type === 'code') {
            const code = node.children.find((n) => n.type === 'code');
            node.children = [
              jsx('ArticleCodeBlock', {
                language: code.lang ?? 'text',
                source: valueOf(node),
              }),
            ];
          }
          const key = node.attributes.path.split('.').at(-1);
          const labels = {
            given: '已知条件',
            steps: '计算步骤',
            result: '计算结果',
            comparison: '处理前后对比',
            inputs: '输入',
            outputs: '输出',
            capabilities: '能力',
            permissions: '权限',
            securityRisks: '风险',
            trustBoundary: '信任边界',
            performanceNotes: '性能考虑',
            failureModes: '失败模式',
            objectiveFunction: '目标函数',
            referencePolicy: 'Reference Policy',
            rewardModel: 'Reward Model',
            preferenceData: 'Preference Data',
            groupData: 'Group Data',
            advantageEstimator: 'Advantage',
            klConstraint: 'KL 约束',
            clipRange: 'Clip Range',
            dataBoundary: '数据边界',
          };
          if (labels[key])
            node.children.unshift({
              type: 'heading',
              depth: 4,
              children: [{ type: 'text', value: labels[key] }],
            });
        } else if (node.name === 'code-example') {
          const i = Number(node.attributes.index);
          if (!a.longForm?.codeExamples[i])
            throw new Error(`${file}: 无效代码示例 ${i}`);
          return jsx('ArticleCodeExample', { slug: a.metadata.slug, index: i });
        } else if (node.name === 'formula') {
          const i = Number(node.attributes.index);
          if (!a.longForm?.formulas[i])
            throw new Error(`${file}: 无效公式 ${i}`);
          return jsx('ArticleFormula', { slug: a.metadata.slug, index: i });
        } else if (node.name === 'variables')
          return jsx('ArticleVariables', { slug: a.metadata.slug });
        else throw new Error(`${file}: 未知 Markdown 指令 ${node.name}`);
      }
      if (node.type === 'math' || node.type === 'inlineMath')
        return {
          ...jsx(node.type === 'math' ? 'BlockMath' : 'InlineMath', {
            latex: node.value,
          }),
          type:
            node.type === 'math' ? 'mdxJsxFlowElement' : 'mdxJsxTextElement',
        };
      if (node.type === 'code')
        return jsx('ArticleCodeBlock', {
          language: node.lang ?? 'text',
          source: node.value,
        });
      if (node.children) node.children = node.children.map(transform);
      return node;
    }
    const children = tree.children.map(transform);
    const result = [];
    let current;
    for (const n of children) {
      if (
        n.type === 'mdxJsxFlowElement' &&
        ['ConceptPrerequisites', 'ConceptRelated', 'ArticleFlags'].includes(
          n.name,
        )
      )
        n.attributes.push(attr('slug', a.metadata.slug));
      if (n.type === 'heading' && n.depth === 2) {
        const s = headingInfo(n, file);
        current = jsx('ArticleSection', {
          conceptSlug: a.metadata.slug,
          sectionId: s.id,
          title: s.title,
        });
        result.push(current);
      } else if (current) current.children.push(n);
      else result.push(n);
    }
    for (const [alias, target] of Object.entries(
      a.metadata.anchorAliases ?? {},
    )) {
      if (!a.sections.some((s) => s.id === target))
        throw new Error(`${file}: 锚点别名 ${alias} 的目标 ${target} 不存在`);
      const section = result.find(
        (n) =>
          n.name === 'ArticleSection' &&
          n.attributes.some(
            (x) => x.name === 'sectionId' && x.value === target,
          ),
      );
      section.children.unshift(
        jsx('span', { id: alias, 'data-anchor-alias': target }),
      );
    }
    for (const section of result) {
      if (section.name !== 'ArticleSection' || section.children.length)
        continue;
      const id = section.attributes.find((x) => x.name === 'sectionId')?.value;
      if (id === 'prerequisites' || id === 'related')
        section.children = [
          jsx(
            id === 'prerequisites' ? 'ConceptPrerequisites' : 'ConceptRelated',
            { slug: a.metadata.slug },
          ),
        ];
    }
    tree.children = result;
  };
}
export async function compileArticle(source, file) {
  const { body } = splitSource(source, file);
  parseArticle(source, file);
  return compile(
    { value: prepareBody(body), path: file },
    {
      remarkPlugins: [...remarkPlugins, articleRemark({ source }, file)],
      development: false,
    },
  );
}
