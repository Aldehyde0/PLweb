import { parseAnswerBlocks, parseAnswerInline } from '@/lib/answer-format';
import { BlockMath, InlineMath } from '@/components/math';
import { CodeBlock } from '@/components/code-block';

export function ExerciseAnswer({ answer }: { answer: string }) {
  return (
    <div className="exercise-answer">
      {parseAnswerBlocks(answer).map((block, index) => {
        if (block.type === 'code')
          return (
            <CodeBlock
              key={index}
              source={block.content}
              language={block.language ?? 'text'}
              title="参考答案代码"
            />
          );
        if (block.type === 'math')
          return <BlockMath key={index} latex={block.content} />;
        return (
          <p key={index}>
            {parseAnswerInline(block.content).map((token, tokenIndex) =>
              token.type === 'code' ? (
                <code key={tokenIndex}>{token.content}</code>
              ) : token.type === 'math' ? (
                <InlineMath key={tokenIndex} latex={token.content} />
              ) : (
                token.content
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}
