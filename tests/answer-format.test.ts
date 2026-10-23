import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAnswerBlocks, parseAnswerInline } from '../lib/answer-format.ts';

void test('answer parsing keeps plain text, line breaks, HTML and unmatched delimiters literal', () => {
  const text = '<script>alert(1)</script>\n未配对 `code 和 $formula';
  assert.deepEqual(parseAnswerBlocks(text), [{ type: 'text', content: text }]);
  assert.deepEqual(parseAnswerInline(text), [{ type: 'text', content: text }]);
});
void test('real inline-code answers separate code from the explanatory sentence', () => {
  assert.deepEqual(parseAnswerInline('已有 `.grad`。'), [
    { type: 'text', content: '已有 ' },
    { type: 'code', content: '.grad' },
    { type: 'text', content: '。' },
  ]);
});
void test('fenced code retains its literal contents and formulas use explicit delimiters', () => {
  assert.deepEqual(
    parseAnswerBlocks('计算\n$$x^2$$\n```python\nprint("$x$")\n```'),
    [
      { type: 'text', content: '计算\n' },
      { type: 'math', content: 'x^2' },
      { type: 'text', content: '\n' },
      { type: 'code', content: 'print("$x$")\n', language: 'python' },
    ],
  );
  assert.deepEqual(parseAnswerInline('$x$ 与 \\(y\\)'), [
    { type: 'math', content: 'x' },
    { type: 'text', content: ' 与 ' },
    { type: 'math', content: 'y' },
  ]);
});
