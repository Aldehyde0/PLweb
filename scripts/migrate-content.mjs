/** One-way exporter. Input is the audited effective runtime snapshot, never base arrays. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { stringify } from 'yaml';

const baseline = JSON.parse(
  readFileSync(
    process.argv.find((x) => x.startsWith('--baseline='))?.slice(11) ??
      'outputs/mdx-migration/baseline.json',
    'utf8',
  ).replace(/^\uFEFF/, ''),
);
const sample = process.argv.includes('--sample');
// Existing strings were rendered literally (except $math$). Escape Markdown
// punctuation so migration cannot reinterpret prose as JSX or emphasis.
function escapeText(value) {
  return value
    .split(/(\$[^$]+\$)/g)
    .map((s) =>
      s.startsWith('$') && s.endsWith('$')
        ? s
        : s.replaceAll('&', '&amp;').replace(/[\\`*_{}[\]<>|:]/g, '\\$&'),
    )
    .join('');
}
const titlePath = (path) => /\.(title|label|question)$/.test(path);
function field(path, value, context = {}) {
  let type = 'text',
    body = '',
    extra = '';
  if (Array.isArray(value) && value.every((x) => typeof x === 'string')) {
    type = [
      'definition',
      'background',
      'intuition',
      'corePrinciple',
      'importance',
      'extensionNotes',
    ].includes(path)
      ? 'paragraphs'
      : path === 'algorithmSteps' || path.endsWith('.steps')
        ? 'ordered'
        : 'list';
    body = value
      .map(
        (x, i) =>
          (type === 'list' ? '- ' : type === 'ordered' ? `${i + 1}. ` : '') +
          escapeText(x).replaceAll('\n', '\n  '),
      )
      .join(type === 'paragraphs' ? '\n\n' : '\n');
  } else if (path === 'variableDefinitions') {
    type = 'table';
    body =
      '| 变量 | 含义 |\n| --- | --- |\n' +
      value
        .map((x) => `| ${escapeText(x.symbol)} | ${escapeText(x.meaning)} |`)
        .join('\n');
  } else if (path.endsWith('.expression') || path === 'formula.expression') {
    type = 'math';
    body = `$$\n${value}\n$$`;
  } else if (path.endsWith('.source')) {
    type = 'code';
    const trailing = (value.match(/\n*$/)?.[0] ?? '').length;
    extra = ` trailing="${trailing}"`;
    const fence = '`'.repeat(
      Math.max(3, ...[...value.matchAll(/`+/g)].map((x) => x[0].length + 1)),
    );
    body = `${fence}${context.language ?? 'python'}\n${value.replace(/\n*$/, '')}\n${fence}`;
  } else if (typeof value === 'string')
    body = (titlePath(path) ? '### ' : '') + escapeText(value);
  else if (Array.isArray(value))
    return value.map((x, i) => field(`${path}.${i}`, x, context)).join('\n');
  else if (value && typeof value === 'object')
    return Object.entries(value)
      .map(([k, v]) =>
        field(`${path}.${k}`, v, {
          ...context,
          language: value.language ?? context.language,
        }),
      )
      .join('\n');
  else throw new Error(`不能导出字段 ${path}`);
  return `:::field{path="${path}" type="${type}"${extra}}\n${body}\n:::\n`;
}
const section = (id, title, body) => `\n## ${title} {#${id}}\n\n${body}\n`;
function exportArticle(concept, index) {
  const long = baseline.longFormMap[concept.slug],
    data = long ?? concept;
  const m = Object.fromEntries(
    [
      'id',
      'slug',
      'title',
      'category',
      'difficulty',
      'summary',
      'prerequisites',
      'relatedConcepts',
    ].map((k) => [k, data[k]]),
  );
  Object.assign(m, {
    order: index,
    directory: baseline.groups[concept.slug],
    kind: long ? 'long-form' : 'legacy',
  });
  const rest = { ...data };
  for (const k of Object.keys(m)) delete rest[k];
  let body = '';
  const add = (id, title, keys) => {
    const content = keys
      .filter((k) => Object.hasOwn(rest, k))
      .map((k) => {
        const value = rest[k];
        delete rest[k];
        if (Array.isArray(value) && !value.length) {
          (m.preserved ??= {})[k] = value;
          return '';
        }
        return field(k, value);
      })
      .join('\n');
    if (content) body += section(id, title, content);
  };
  const demo = (name, kind) =>
    `\n<${name}${kind ? ` kind="${kind}"` : ''} />\n`;
  if (concept.slug === 'numerical-standardization')
    body += demo('StandardizationDemo');
  if (long) {
    add('learning-objectives', '学习目标', ['learningObjectives']);
    add(
      'importance',
      concept.category === 'deep-learning'
        ? '为什么需要这个概念'
        : '为什么重要',
      ['importance'],
    );
    body += section(
      'prerequisites',
      '学习前需要掌握',
      '<ConceptPrerequisites />',
    );
    for (const [id, title, key] of [
      ['background', '背景与问题', 'background'],
      ['definition', '概念定义', 'definition'],
      ['intuition', '直观理解', 'intuition'],
      ['core-principle', '核心原理', 'corePrinciple'],
    ])
      add(id, title, [key]);
    if (data.formulas.length)
      body += section(
        'formulas',
        '数学表达',
        data.formulas
          .map(
            (v, i) =>
              `::::formula{index="${i}"}\n${field(`formulas.${i}`, v)}\n::::`,
          )
          .join('\n\n'),
      );
    delete rest.formulas;
    if (data.variableDefinitions.length)
      body += section(
        'variables',
        '变量解释',
        `::::variables\n${field('variableDefinitions', data.variableDefinitions)}\n::::`,
      );
    delete rest.variableDefinitions;
    if (data.numericalExample)
      add('numerical-example', '完整数值示例', ['numericalExample']);
    if (
      [
        'gradient-descent',
        'learning-rate-selection',
        'gradient-descent-convergence',
      ].includes(concept.slug)
    )
      body += demo('LearningRateDemo');
    add(
      'algorithm-steps',
      concept.category === 'artificial-intelligence'
        ? '理解与实践步骤'
        : '计算与实现步骤',
      ['algorithmSteps'],
    );
    if (data.codeExamples.length)
      body += section(
        'code',
        '代码实现',
        data.codeExamples
          .map(
            (v, i) =>
              `::::code-example{index="${i}"}\n${field(`codeExamples.${i}`, v)}\n::::`,
          )
          .join('\n\n'),
      );
    delete rest.codeExamples;
  } else {
    body += section('prerequisites', '前置知识', '<ConceptPrerequisites />');
    add('intuition', '通俗直觉', ['explanation']);
    add('core-principle', '核心原理', ['principle']);
    add('formulas', '数学公式', ['formula']);
    add('algorithm-steps', '工作流程', ['workflow']);
    add('code', '代码示例', ['code', 'codeExplanation']);
  }
  add('applications', long ? '实际应用' : '应用场景', ['applications']);
  add('pitfalls', long ? '常见错误' : '常见误区', ['pitfalls']);
  body += section(
    'related',
    long ? '与其他概念的关系' : '相关概念',
    '<ConceptRelated />',
  );
  add('extension', '扩展内容说明', ['extensionNotes']);
  if (concept.category === 'artificial-intelligence' && data.interactiveDemo)
    body += demo('AIInteractiveDemo', data.interactiveDemo);
  if (concept.category === 'reinforcement-learning' && data.interactiveDemo)
    body += demo('RLInteractiveDemo', data.interactiveDemo);
  if (concept.slug === 'rl-algorithm-comparison')
    body += demo('RLAlgorithmMatrix');
  if (long) {
    const canShowIO =
      concept.category !== 'artificial-intelligence' ||
      !['theory', 'model', 'comparison'].includes(data.entityType);
    if (canShowIO && concept.category === 'artificial-intelligence') {
      add('inputs-outputs', '输入、输出与执行边界', [
        'inputs',
        'outputs',
        'capabilities',
        'permissions',
      ]);
      body += '\n<ArticleFlags />\n';
    }
    if (concept.category !== 'reinforcement-learning') {
      add('security-risks', '安全风险与信任边界', [
        'securityRisks',
        'trustBoundary',
      ]);
      add('performance-notes', '性能与失败模式', [
        'performanceNotes',
        'failureModes',
      ]);
    }
    if (concept.category === 'reinforcement-learning')
      body += section(
        'algorithm-profile',
        '算法属性与数据边界',
        '<ArticleFlags />',
      );
    const profileKeys = [
      'objectiveFunction',
      'referencePolicy',
      'rewardModel',
      'preferenceData',
      'groupData',
      'advantageEstimator',
      'klConstraint',
      'clipRange',
      'dataBoundary',
    ];
    if (concept.category === 'reinforcement-learning')
      for (const k of profileKeys)
        if (rest[k] !== undefined) {
          body += field(k, rest[k]);
          delete rest[k];
        }
    add('algorithm-comparison', '与 DQN、SAC 及相邻方法对照', [
      'comparisonNotes',
    ]);
    if (concept.category === 'reinforcement-learning')
      add('failure-performance', '失败模式、风险与性能', [
        'failureModes',
        'securityRisks',
        'performanceNotes',
      ]);
    add('common-questions', '常见问题', ['commonQuestions']);
  }
  // Non-rendered information remains in frontmatter, including provenance.
  // Empty arrays and scalar flags must retain their exact original shape.
  m.preserved = { ...rest, ...m.preserved };
  if (long) {
    if (!data.formulas.length) m.preserved.formulas = [];
    if (!data.variableDefinitions.length) m.preserved.variableDefinitions = [];
    if (!data.codeExamples.length) m.preserved.codeExamples = [];
  }
  // Deprecated source sections stay addressable without restoring their UI.
  const ids = new Set(
    [...body.matchAll(/^## .* \{#([^}]+)\}/gm)].map((x) => x[1]),
  );
  const aliases = {};
  for (const old of baseline.sections[concept.slug])
    if (!ids.has(old.id))
      aliases[old.id] =
        old.id === 'failure-performance'
          ? 'performance-notes'
          : old.id === 'algorithm-profile'
            ? 'definition'
            : old.id === 'learning-objectives'
              ? 'definition'
              : 'related';
  if (Object.keys(aliases).length) m.anchorAliases = aliases;
  const file = `content/concepts/${concept.category}/${concept.slug}.mdx`;
  if (existsSync(file) && !process.argv.includes('--overwrite'))
    throw new Error(`${file} 已存在；迁移不会覆盖作者修改`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `---\n${stringify(m, { lineWidth: 0 })}---\n${body}`);
  return file;
}
for (const [index, c] of baseline.concepts.entries())
  if (!sample || c.slug === 'numerical-standardization')
    console.log(exportArticle(c, index));
