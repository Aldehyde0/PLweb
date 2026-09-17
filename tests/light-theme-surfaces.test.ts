import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readProjectFile = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

/** Splits a stylesheet into `{ selector, body }` pairs, ignoring comments. */
function parseRules(css: string) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: Array<{ selector: string; body: string }> = [];
  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1]!.replace(/\s+/g, ' ').trim();
    if (!selector || selector.startsWith('@')) continue;
    rules.push({ selector, body: match[2]!.trim() });
  }
  return rules;
}

/** Returns the declarations for the single rule whose selector matches exactly. */
function ruleFor(css: string, selector: string) {
  // Selectors are compared in the same normalized form the parser produces, so
  // a selector list written across several lines still matches.
  const wanted = selector.replace(/\s+/g, ' ').trim();
  const rules = parseRules(css).filter((rule) => rule.selector === wanted);
  assert.equal(
    rules.length,
    1,
    `expected exactly one rule for ${wanted}, found ${rules.length}`,
  );
  return rules[0]!.body;
}

const lightTheme = readProjectFile('app/light-theme.css');

void test('defines a neutral reading surface distinct from form controls', () => {
  const tokens = readProjectFile('tokens.css');

  assert.match(tokens, /--color-learning-surface:\s*oklch\(96\.5% 0\.004 258\)/);
  assert.match(tokens, /--color-input-surface:\s*oklch\(99% 0\.004 258\)/);
  // The light reading surface must no longer be the warm ivory palette.
  assert.doesNotMatch(tokens, /--color-learning-surface:\s*oklch\(97% 0\.015 85\)/);
});

void test('uses the learning surface for content cards while keeping code blocks dark', () => {
  const globals = readProjectFile('app/globals.css');
  const learning = readProjectFile('app/learning-features.css');
  const conceptCard = readProjectFile('components/concept-card.tsx');

  assert.match(globals, /\.definition-callout[\s\S]*var\(--color-learning-surface\)/);
  assert.match(learning, /\.note-card[\s\S]*var\(--color-learning-surface\)/);
  assert.match(conceptCard, /className="[^"]*concept-card/);
  assert.match(learning, /\.concept-card[\s\S]*var\(--color-learning-surface\)/);
  assert.doesNotMatch(globals, /\.code-figure\s*\{[^}]*color-learning-surface/);
});

void test('semantic demo states keep distinct hues instead of collapsing to one colour', () => {
  const good = ruleFor(
    lightTheme,
    [
      "[data-theme='light'] .demo-status-good,",
      "[data-theme='light'] .preference-grid article.chosen",
    ].join(' '),
  );
  assert.match(good, /border-color:\s*var\(--color-success\)/);

  const warn = ruleFor(lightTheme, "[data-theme='light'] .demo-status-warn");
  assert.match(warn, /border-color:\s*var\(--color-warning\)/);

  const danger = ruleFor(lightTheme, "[data-theme='light'] .demo-status-danger");
  assert.match(danger, /border-color:\s*var\(--color-error\)/);

  // The three tones must not resolve to the same token.
  const used = [good, warn, danger].map(
    (body) => /border-color:\s*var\((--[a-z-]+)\)/.exec(body)?.[1],
  );
  assert.deepEqual(used, ['--color-success', '--color-warning', '--color-error']);
  assert.equal(new Set(used).size, 3, 'status tones lost their distinction');
});

void test('grid-world states stay distinguishable in light mode', () => {
  const blocked = ruleFor(lightTheme, "[data-theme='light'] .grid-world .blocked");
  const goal = ruleFor(lightTheme, "[data-theme='light'] .grid-world .goal");
  const path = ruleFor(lightTheme, "[data-theme='light'] .grid-world .path");

  assert.match(blocked, /background:\s*var\(--color-learning-surface-raised\)/);
  assert.match(goal, /background:\s*var\(--color-success-tint\)/);
  assert.match(goal, /color:\s*var\(--color-success\)/);
  // Path is a boundary marker, not a fill, so it must not reuse the goal fill.
  assert.match(path, /box-shadow:/);
  assert.doesNotMatch(path, /background:\s*var\(--color-success-tint\)/);
});

void test('selection and hover stay different from each other', () => {
  const hoverSelector = [
    "[data-theme='light'] .ai-directory-tabs button:hover",
    "[data-theme='light'] .demo-tabs button:hover",
    "[data-theme='light'] .demo-progress button:hover",
    "[data-theme='light'] .demo-pipeline button:hover",
    "[data-theme='light'] .mcp-flow button:hover",
    "[data-theme='light'] .dqn-flow button:hover",
    "[data-theme='light'] .role-map button:hover",
    "[data-theme='light'] .important-toggle:hover",
    "[data-theme='light'] .concept-important-toggle:hover",
    "[data-theme='light'] .note-actions button:hover",
    "[data-theme='light'] .reference-available:hover",
    "[data-theme='light'] .history-link:hover:not(:disabled)",
  ].join(', ');
  const activeSelector = [
    "[data-theme='light'] .ai-directory-tabs button.active",
    "[data-theme='light'] .demo-tabs button.active",
    "[data-theme='light'] .demo-progress button.active",
    "[data-theme='light'] .demo-pipeline button.active",
    "[data-theme='light'] .mcp-flow button.active",
    "[data-theme='light'] .dqn-flow button.active",
    "[data-theme='light'] .role-map button.active",
  ].join(', ');

  const hover = ruleFor(lightTheme, hoverSelector);
  const active = ruleFor(lightTheme, activeSelector);
  assert.match(hover, /background:\s*var\(--color-learning-surface-raised\)/);
  assert.doesNotMatch(hover, /color-accent/);
  // Selection is the only state allowed to spend the accent colour, and its fill
  // is derived from the accent rather than from the neutral hover surface.
  assert.match(active, /border-color:\s*var\(--color-accent\)/);
  assert.match(active, /background:\s*color-mix\([^)]*var\(--color-accent\)/);
  assert.doesNotMatch(active, /background:\s*var\(--color-learning-surface-raised\)/);
  assert.match(active, /color:\s*var\(--color-focus\)/);
});

void test('covers every dark literal used by the legacy feature styles', () => {
  const components = [
    'components/concept-memo.tsx',
    'components/concept-directory.tsx',
    'components/learning-rate-demo.tsx',
    'components/standardization-demo.tsx',
  ]
    .map((path) => readProjectFile(path))
    .join('\n');

  const literals = new Set(
    [...components.matchAll(/bg-\[(#[0-9a-fA-F]{3,8})\]/g)].map((match) =>
      match[1]!.toLowerCase(),
    ),
  );
  assert.ok(literals.size > 0, 'expected dark literals in the legacy components');

  const escaped = (value: string) =>
    `.bg-\\[\\${value.toUpperCase()}\\]`.toUpperCase();
  const covered = lightTheme.toUpperCase();
  for (const literal of literals) {
    assert.ok(
      covered.includes(escaped(literal)),
      `light-theme.css does not cover the dark surface ${literal}`,
    );
  }
});

void test('code blocks are deliberately left dark', () => {
  // The syntax palette is tuned for the dark code surface; restyling it here
  // would make the highlighted code unreadable.
  assert.doesNotMatch(lightTheme, /\.code-figure/);
  assert.doesNotMatch(lightTheme, /\.code-lines/);
  assert.doesNotMatch(lightTheme, /\.syntax-(comment|string|number|keyword)/);
});

void test('every rule is scoped to the light theme or is a wrapping guard', () => {
  const allowed = [
    '.reference-related',
    '.official-source-panel a',
    '.resource-card h3',
    '.ai-info-card',
    '.demo-info',
    '.doc-section-body',
    '.direction-card',
    '.learning-routes article',
    '.preference-grid article',
  ];
  for (const { selector } of parseRules(lightTheme)) {
    if (selector.includes("[data-theme='light']")) continue;
    const parts = selector.split(',').map((part) => part.trim());
    const allAllowed = parts.every((part) => allowed.includes(part));
    assert.ok(
      allAllowed,
      `unscoped rule would leak into dark mode: ${selector}`,
    );
  }
});

void test('link-shaped cards are allowed to wrap their text', () => {
  const hallmark = readProjectFile('app/hallmark-design.css');
  assert.match(hallmark, /button\s*\{[^}]*white-space:\s*nowrap/);
  // The homepage description must opt out of that nowrap.
  assert.match(
    lightTheme,
    /\.direction-card[\s\S]{0,200}white-space:\s*normal/,
  );
});
