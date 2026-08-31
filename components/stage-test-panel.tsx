'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { conceptMap } from '@/lib/content';
import { getConceptHref } from '@/lib/concept-utils';
import type { LearningPlan, PlanPhase, StageQuestion } from '@/lib/plan-engine';
import { usePlans } from '@/components/plan-store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export function StageTestPanel({
  plan,
  phase,
  onClose,
}: {
  plan: LearningPlan;
  phase: PlanPhase;
  onClose: () => void;
}) {
  const store = usePlans();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [addReview, setAddReview] = useState(true);
  const complete = phase.test.status === 'completed';
  if (complete)
    return (
      <TestResult
        phase={phase}
        onClose={onClose}
        onRetry={() =>
          store.setStageTestStatus(plan.id, phase.id, 'not-started')
        }
      />
    );
  return (
    <main className="plan-page">
      <div className="plan-container plan-test-container">
        <nav aria-label="面包屑" className="breadcrumbs">
          <Link href="/plans">学习计划</Link>
          <span>/</span>
          <button type="button" onClick={onClose}>
            {plan.title}
          </button>
          <span>/</span>
          <span>阶段测试</span>
        </nav>
        <header className="plan-page-header">
          <div>
            <p className="eyebrow">不阻塞后续学习</p>
            <h1>{phase.test.title}</h1>
            <p>
              共 {phase.test.questions.length}{' '}
              题。测试完成、学习完成与重点掌握分别保存。
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft />
            返回计划
          </Button>
        </header>
        <form
          className="stage-test-form"
          onSubmit={(event) => {
            event.preventDefault();
            store.submitStageTest(plan.id, phase.id, answers, addReview);
          }}
        >
          {phase.test.questions.map((question, index) => (
            <Question
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id] ?? []}
              onChange={(value) =>
                setAnswers({ ...answers, [question.id]: value })
              }
            />
          ))}
          <label className="plan-option" htmlFor={`${phase.id}-add-review`}>
            <Checkbox
              id={`${phase.id}-add-review`}
              checked={addReview}
              onCheckedChange={() => setAddReview(!addReview)}
            />
            <span>
              <strong>将薄弱概念重新加入复习任务</strong>
              <small>测试提交后可在结果页查看推荐内容。</small>
            </span>
          </label>
          <div className="plan-form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                store.setStageTestStatus(plan.id, phase.id, 'later')
              }
            >
              稍后再做
            </Button>
            <Button type="submit">提交并查看结果</Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Question({
  question,
  index,
  value,
  onChange,
}: {
  question: StageQuestion;
  index: number;
  value: string[];
  onChange: (answers: string[]) => void;
}) {
  const choice = question.options?.length;
  const multiple = question.type === 'multiple-choice';
  return (
    <fieldset className="stage-question">
      <legend>
        <span>{index + 1}</span>
        <div>
          <small>{questionTypeLabel(question.type)}</small>
          <strong>{question.prompt}</strong>
        </div>
      </legend>
      {choice ? (
        <div className="stage-options">
          {question.options!.map((option) => (
            <label key={option} htmlFor={`${question.id}-${option}`}>
              {multiple ? (
                <input
                  id={`${question.id}-${option}`}
                  type="checkbox"
                  checked={value.includes(option)}
                  onChange={() =>
                    onChange(
                      value.includes(option)
                        ? value.filter((item) => item !== option)
                        : [...value, option],
                    )
                  }
                />
              ) : (
                <input
                  id={`${question.id}-${option}`}
                  type="radio"
                  name={question.id}
                  checked={value.includes(option)}
                  onChange={() => onChange([option])}
                />
              )}
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <Input
          aria-label={question.prompt}
          value={value[0] ?? ''}
          onChange={(event) => onChange([event.target.value])}
          placeholder="用自己的话作答"
        />
      )}
    </fieldset>
  );
}

function TestResult({
  phase,
  onClose,
  onRetry,
}: {
  phase: PlanPhase;
  onClose: () => void;
  onRetry: () => void;
}) {
  const incorrect = phase.test.questions.filter((question) =>
    phase.test.incorrectQuestionIds.includes(question.id),
  );
  return (
    <main className="plan-page">
      <div className="plan-container plan-test-container">
        <header className="test-result-hero">
          <CheckCircle2 />
          <div>
            <p className="eyebrow">阶段测试结果</p>
            <h1>{phase.test.score} 分</h1>
            <p>
              正确率 {phase.test.score}% · {incorrect.length} 道题需要复习
            </p>
          </div>
        </header>
        <section className="test-result-grid">
          <article>
            <h2>错误题目</h2>
            {incorrect.length ? (
              incorrect.map((question) => (
                <div key={question.id}>
                  <AlertCircle />
                  <span>
                    <strong>{question.prompt}</strong>
                    <small>{question.explanation}</small>
                  </span>
                </div>
              ))
            ) : (
              <p>本次没有错误题目。</p>
            )}
          </article>
          <article>
            <h2>薄弱概念与推荐复习</h2>
            {phase.test.weakConcepts.length ? (
              phase.test.weakConcepts.map((slug) => {
                const concept = conceptMap[slug];
                return concept ? (
                  <Link key={slug} href={getConceptHref(concept)}>
                    {concept.title}
                    <span>查看定义、公式和代码</span>
                  </Link>
                ) : null;
              })
            ) : (
              <p>没有识别到薄弱概念。</p>
            )}
            <p className="test-independent-note">
              阶段测试：已完成 · 阶段学习：独立计算 · 重点掌握：
              {phase.mastered ? '已标记' : '未标记'}
            </p>
          </article>
        </section>
        <div className="plan-form-actions">
          <Button
            variant="outline"
            onClick={() => {
              onRetry();
            }}
          >
            <RotateCcw />
            重新测试
          </Button>
          <Button onClick={onClose}>返回计划详情</Button>
        </div>
      </div>
    </main>
  );
}
function questionTypeLabel(type: StageQuestion['type']) {
  return (
    {
      'single-choice': '单选题',
      'multiple-choice': '多选题',
      'true-false': '判断题',
      'concept-explanation': '概念解释题',
      'formula-fill': '公式填写题',
      'code-reading': '代码阅读题',
      'code-output': '代码输出判断题',
      calculation: '简单计算题',
    } as const
  )[type];
}
