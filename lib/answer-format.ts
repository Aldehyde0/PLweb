export type AnswerToken = {
  type: 'text' | 'code' | 'math';
  content: string;
  language?: string;
};

export function parseAnswerInline(text: string): AnswerToken[] {
  const tokens: AnswerToken[] = [];
  const pattern = /`([^`\n]+)`|\$([^$\n]+)\$|\\\((.+?)\\\)/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor)
      tokens.push({ type: 'text', content: text.slice(cursor, match.index) });
    tokens.push({
      type: match[1] !== undefined ? 'code' : 'math',
      content: match[1] ?? match[2] ?? match[3],
    });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length)
    tokens.push({ type: 'text', content: text.slice(cursor) });
  return tokens;
}

export function parseAnswerBlocks(text: string): AnswerToken[] {
  const tokens: AnswerToken[] = [];
  const pattern =
    /```([^\n`]*)\r?\n([\s\S]*?)```|\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor)
      tokens.push({ type: 'text', content: text.slice(cursor, match.index) });
    tokens.push(
      match[2] !== undefined
        ? {
            type: 'code',
            content: match[2],
            language: match[1].trim() || 'text',
          }
        : { type: 'math', content: match[3] ?? match[4] },
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length)
    tokens.push({ type: 'text', content: text.slice(cursor) });
  return tokens;
}
