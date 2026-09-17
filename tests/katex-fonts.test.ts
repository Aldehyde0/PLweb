import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generatedCssPath = join(projectRoot, 'app', 'katex-fonts.css');
const publicFontsDir = join(projectRoot, 'public', 'fonts');
const globalsCssPath = join(projectRoot, 'app', 'globals.css');
const generatorPath = join(projectRoot, 'scripts', 'generate-katex-fonts.ts');

const css = readFileSync(generatedCssPath, 'utf8');

void test('the generated KaTeX stylesheet exists and is wired into globals.css', () => {
  assert.ok(
    existsSync(generatedCssPath),
    'app/katex-fonts.css is missing; run `npm run generate:katex-fonts`',
  );
  const globals = readFileSync(globalsCssPath, 'utf8');
  assert.match(
    globals,
    /@import\s+['"]\.\/katex-fonts\.css['"]/,
    'globals.css must import the generated KaTeX stylesheet',
  );
  // Importing the package stylesheet directly reintroduces relative font URLs.
  assert.doesNotMatch(
    globals,
    /@import\s+['"]katex\/dist\/katex\.min\.css['"]/,
    'globals.css must not import katex CSS directly; its font URLs break once bundled',
  );
  assert.ok(
    existsSync(generatorPath),
    'the generator script that keeps the stylesheet in sync is missing',
  );
});

void test('every KaTeX font request is an absolute /fonts URL', () => {
  const urls = [...css.matchAll(/url\(([^)]*)\)/g)].map((match) =>
    match[1]!.replace(/['"]/g, '').trim(),
  );
  assert.ok(urls.length >= 20, `expected the full KaTeX font set, got ${urls.length}`);
  for (const url of urls) {
    assert.ok(
      url.startsWith('/fonts/'),
      `relative font URL would resolve against the bundled CSS location: ${url}`,
    );
    assert.match(url, /\.woff2$/, `unexpected font format: ${url}`);
  }
  // A relative `fonts/...` reference is exactly what produced the 404s.
  assert.equal(
    /url\(\s*['"]?(?:\.\/)?fonts\//.test(css),
    false,
    'the generated stylesheet still contains a relative fonts/ URL',
  );
});

void test('every referenced font file exists in public/fonts', () => {
  const referenced = [...css.matchAll(/url\(\/fonts\/([^)]+)\)/g)].map((match) =>
    match[1]!.replace(/['"]/g, '').trim(),
  );
  assert.ok(referenced.length > 0);
  for (const fileName of referenced)
    assert.ok(
      existsSync(join(publicFontsDir, fileName)),
      `public/fonts/${fileName} is referenced but missing`,
    );
});

void test('no font file in public/fonts is left unreferenced', () => {
  const onDisk = readdirSync(publicFontsDir).filter((name) => name.endsWith('.woff2'));
  assert.ok(onDisk.length > 0);
  for (const fileName of onDisk)
    assert.ok(
      css.includes(`/fonts/${fileName}`),
      `public/fonts/${fileName} is shipped but never requested`,
    );
});

void test('the stylesheet keeps the KaTeX layout rules, not just the fonts', () => {
  // Rewriting @font-face must not drop the rest of katex.min.css.
  assert.ok(css.includes('.katex'), 'KaTeX layout classes are missing');
  assert.ok(css.includes('.katex-display'), '.katex-display rules are missing');
  assert.ok(
    css.includes('.mathnormal') || css.includes('KaTeX_Math'),
    'KaTeX font-family mappings are missing',
  );
  const fontFaces = [...css.matchAll(/@font-face\s*\{/g)].length;
  assert.ok(fontFaces >= 20, `expected 20 @font-face rules, got ${fontFaces}`);
});
