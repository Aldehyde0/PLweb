import type { TestQuestionType } from './plan-engine';

/**
 * How a question is judged.
 * - `objective`: the answer has a stable, checkable form (option id, true/false,
 *   number, or a short exact term), so it can be auto-graded.
 * - `self-assessed`: a free-form explanation. There is no reliable automatic
 *   grader for free prose, so the app must ask the learner to judge it instead of
 *   pretending to score it.
 */
export type QuestionGrading = 'objective' | 'self-assessed';

export type StageQuestionInput =
  | {
      id: string;
      type: 'single-choice' | 'multiple-choice' | 'true-false';
      prompt: string;
      options: string[];
      correctOptions: string[];
      /** Terms that also count as correct without exposing the option letter. */
      accept?: string[];
      conceptSlug: string;
      explanation: string;
    }
  | {
      id: string;
      type: 'formula-fill' | 'code-output' | 'calculation';
      prompt: string;
      accept: string[];
      conceptSlug: string;
      explanation: string;
    }
  | {
      id: string;
      type: 'concept-explanation' | 'code-reading';
      prompt: string;
      /** Reference answer shown after submission; never compared automatically. */
      referenceAnswer: string;
      conceptSlug: string;
      explanation: string;
    };

/** Anything a learner can be asked, after the question bank is normalized. */
export type StageTestQuestion = StageQuestionInput & {
  grading: QuestionGrading;
};

export function gradingOf(input: StageQuestionInput): QuestionGrading {
  return input.type === 'concept-explanation' || input.type === 'code-reading'
    ? 'self-assessed'
    : 'objective';
}

export function questionTypeLabel(type: TestQuestionType) {
  return (
    {
      'single-choice': '单选题',
      'multiple-choice': '多选题',
      'true-false': '判断题',
      'concept-explanation': '概念解释题（自评）',
      'formula-fill': '公式填写题',
      'code-reading': '代码阅读题（自评）',
      'code-output': '代码输出题',
      calculation: '计算题',
    } as const
  )[type];
}

/**
 * Normalizes an answer so that harmless differences (full-width punctuation,
 * spaces, LaTeX wrappers, Chinese/ASCII comparators) do not decide correctness.
 * It never turns two genuinely different answers into the same string.
 */
export function normalizeAnswer(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。；：！？、“”‘’（）【】《》]/g, (char) =>
      (
        {
          '，': ',',
          '。': '.',
          '；': ';',
          '：': ':',
          '！': '!',
          '？': '?',
          '、': ',',
          '“': '"',
          '”': '"',
          '‘': "'",
          '’': "'",
          '（': '(',
          '）': ')',
          '【': '[',
          '】': ']',
          '《': '<',
          '》': '>',
        } as Record<string, string>
      )[char] ?? char,
    )
    .replace(/[\\$]/g, '')
    .replace(/[{}]/g, '')
    .replace(/[()]/g, '')
    .replace(/·|⋅|×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[–—−]/g, '-')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≈/g, '=')
    .replace(/。$/, '')
    .trim();
}

/**
 * Parses a value that is *entirely* a number, optionally written with a leading
 * variable name or trailing unit (`x=12`, `0.5 元`, `12 条`). Deliberately
 * strict: a sentence that merely contains a digit must not be read as an answer,
 * otherwise free text could match a numeric question by accident.
 */
export function parseNumeric(value: string): number | null {
  const cleaned = value
    .normalize('NFKC')
    .replace(/[，,](?=\d{3}\b)/g, '')
    .replace(/\s+/g, '')
    .replace(/^[a-zα-ω]+=/i, '');
  const match = /^(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)(?:[a-z%°℃个条元秒分时天次]*)$/i.exec(
    cleaned,
  );
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parses a LaTeX-ish fraction such as `2/3` or `\frac{1}{7}` so an equivalent
 * decimal is accepted. Only exact forms are parsed; nothing is approximated.
 */
export function parseRatio(value: string): number | null {
  const normalized = value.normalize('NFKC').replace(/\s+/g, '');
  const frac = /^\\?frac\{(-?\d+(?:\.\d+)?)\}\{(\d+(?:\.\d+)?)\}$/.exec(
    normalized,
  );
  const plain = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(normalized);
  const match = frac ?? plain;
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0)
    return null;
  return numerator / denominator;
}

function numbersMatch(left: string, right: string) {
  const leftNumber = parseNumeric(left);
  const rightNumber = parseNumeric(right);
  const leftRatio = parseRatio(left);
  const rightRatio = parseRatio(right);
  const pairs: Array<[number, number]> = [];
  // A plain number may stand in for an equal fraction and vice versa; the two
  // readings are never mixed with unrelated text.
  if (leftNumber !== null && rightNumber !== null) pairs.push([leftNumber, rightNumber]);
  if (leftRatio !== null && rightRatio !== null) pairs.push([leftRatio, rightRatio]);
  if (leftRatio !== null && rightNumber !== null) pairs.push([leftRatio, rightNumber]);
  if (leftNumber !== null && rightRatio !== null) pairs.push([leftNumber, rightRatio]);
  return pairs.some(([a, b]) => {
    const tolerance = Math.max(1e-6, Math.abs(b) * 1e-3);
    return Math.abs(a - b) <= tolerance;
  });
}

/**
 * Judges one answer against the accepted variants.
 * `objective` questions accept exact normalized matches plus numbers and
 * fractions that are equal within a small relative tolerance.
 */
export function isAnswerAccepted(answer: string, accepted: string[]): boolean {
  const actual = normalizeAnswer(answer);
  if (!actual) return false;
  for (const candidate of accepted) {
    const expected = normalizeAnswer(candidate);
    if (!expected) continue;
    if (actual === expected) return true;
    if (numbersMatch(actual, expected)) return true;
  }
  return false;
}

export function sameOptionSet(actual: string[], expected: string[]) {
  const normalize = (list: string[]) =>
    [...new Set(list.map((item) => normalizeAnswer(item)))].sort();
  const left = normalize(actual);
  const right = normalize(expected);
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}

/**
 * Detects the placeholder stage-test questions generated by older builds.
 * Every placeholder shared one generic prompt and the fixed answer "正确",
 * so a completely empty submission scored 100. They must never be graded again.
 */
export function isPlaceholderStageQuestion(question: {
  prompt?: unknown;
  correctAnswers?: unknown;
  options?: unknown;
}): boolean {
  if (!question || typeof question.prompt !== 'string') return true;
  const prompt = question.prompt.trim();
  const genericPrompt = /^请完成关于.+的(单选题|多选题|判断题|概念解释题|公式填写题|代码阅读题|代码输出判断题|简单计算题)。?$/.test(
    prompt,
  );
  const answers = Array.isArray(question.correctAnswers)
    ? question.correctAnswers.filter(
        (item): item is string => typeof item === 'string',
      )
    : [];
  const fixedAnswer =
    answers.length === 1 && normalizeAnswer(answers[0] ?? '') === '正确';
  const placeholderOptions =
    !Array.isArray(question.options) ||
    (question.options.length === 2 &&
      question.options.every(
        (item) => typeof item === 'string' && /^(正确|错误)$/.test(item),
      ));
  return genericPrompt && fixedAnswer && placeholderOptions;
}
