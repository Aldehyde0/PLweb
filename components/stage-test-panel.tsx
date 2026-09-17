'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { conceptMap } from '@/lib/content';
import { getConceptHref } from '@/lib/concept-utils';
import {
  questionTypeLabel,
  type LearningPlan,
  type PlanPhase,
  type StageQuestion,
} from '@/lib/plan-engine';
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
  if (phase.test.notGradable || !phase.test.questions.length)
    return <TestUnavailable phase={phase} onClose={onClose} />;
  if (phase.test.status === 'completed')
    return (
      <TestResult
        planId={plan.id}
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
              共 {phase.test.questions.length} 题。客观题由系统判分，
              需要解释的题目在提交后由你自评；测试完成、学习完成与重点掌握分别保存。
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

function TestUnavailable({
  phase,
  onClose,
}: {
  phase: PlanPhase;
  onClose: () => void;
}) {
  return (
    <main className="plan-page">
      <div className="plan-container plan-test-container">
        <header className="plan-page-header">
          <div>
            <p className="eyebrow">题库覆盖不足</p>
            <h1>暂无测试</h1>
            <p>
              {phase.title} 还没有可判分的题目，因此没有生成测试，也不会记录分数或薄弱概念。
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft />
            返回计划
          </Button>
        </header>
        <p className="test-unavailable-note">
          阶段学习进度仍然照常统计。等该阶段的题库补充完成后，可以再回来完成测试。
        </p>
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
          placeholder={
            question.grading === 'self-assessed'
              ? '用自己的话作答，提交后自评'
              : '填写答案'
          }
        />
      )}
      {question.grading === 'self-assessed' && (
        <p className="stage-question-note">
          此题没有可靠的自动判分，提交后请对照参考答案自评。
        </p>
      )}
    </fieldset>
  );
}

function TestResult({
  planId,
  phase,
  onClose,
  onRetry,
}: {
  planId: string;
  phase: PlanPhase;
  onClose: () => void;
  onRetry: () => void;
}) {
  const store = usePlans();
  const [selfAssessment, setSelfAssessment] = useState<
    Record<string, boolean>
  >({});
  const grades = phase.test.grades ?? [];
  // A question is still pending only when its own grade row exists and has not
  // been judged yet, so a coarse phase-level flag cannot mask real self-review.
  const pending = phase.test.questions.filter(
    (question) =>
      grades.find((grade) => grade.questionId === question.id)?.correct == null,
  );
  const judged = grades.filter((grade) => grade.correct !== null).length;
  const pendingCount = pending.length;
  const [prevPendingCount, setPrevPendingCount] = useState(pendingCount);
  if (pendingCount !== prevPendingCount) {
    // Re-sync only when the pending set actually changes size, which happens
    // after a submit or retry rather than on every keystroke.
    setPrevPendingCount(pendingCount);
    setSelfAssessment({});
  }
  const gradeFor = (questionId: string) =>
    grades.find((grade) => grade.questionId === questionId);
  const incorrect = phase.test.questions.filter(
    (question) => gradeFor(question.id)?.correct === false,
  );
  const score = phase.test.score;
  return (
    <main className="plan-page">
      <div className="plan-container plan-test-container">
        <header className="test-result-hero">
          <CheckCircle2 />
          <div>
            <p className="eyebrow">阶段测试结果</p>
            <h1>{score === null ? '待自评' : `${score} 分`}</h1>
            <p>
              {score === null
                ? `本阶段全部 ${phase.test.questions.length} 题都需要自评，提交自评后才会生成分数。`
                : `已判定 ${judged} / ${phase.test.questions.length} 题 · ${incorrect.length} 道题需要复习`}
            </p>
          </div>
        </header>
        {pending.length > 0 && (
          <section className="stage-self-assessment">
            <h2>
              <CircleHelp />
              需要你自己判断的题目（{pending.length}）
            </h2>
            <p>
              这些是自由解释题，系统不会自动判分。请对照参考答案逐题自评，
              自评结果会计入分数。
            </p>
            {pending.map((question) => (
              <div key={question.id} className="stage-self-assessment__item">
                <strong>{question.prompt}</strong>
                {question.exampleAnswer && (
                  <p className="stage-reference">
                    参考答案：{question.exampleAnswer}
                  </p>
                )}
                <p className="stage-explanation">{question.explanation}</p>
                <div className="stage-self-assessment__actions">
                  <Button
                    size="sm"
                    variant={
                      selfAssessment[question.id] === true
                        ? 'default'
                        : 'outline'
                    }
                    aria-pressed={selfAssessment[question.id] === true}
                    onClick={() => {
                      const next = {
                        ...selfAssessment,
                        [question.id]: true,
                      };
                      setSelfAssessment(next);
                      store.gradeStageSelfAssessment(planId, phase.id, next);
                    }}
                  >
                    我答对了
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selfAssessment[question.id] === false
                        ? 'default'
                        : 'outline'
                    }
                    aria-pressed={selfAssessment[question.id] === false}
                    onClick={() => {
                      const next = {
                        ...selfAssessment,
                        [question.id]: false,
                      };
                      setSelfAssessment(next);
                      store.gradeStageSelfAssessment(planId, phase.id, next);
                    }}
                  >
                    还需要复习
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}
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
                    {question.grading !== 'self-assessed' && (
                      <small>
                        参考答案：{question.correctAnswers.join(' / ')}
                      </small>
                    )}
                    {question.exampleAnswer && (
                      <small>参考答案：{question.exampleAnswer}</small>
                    )}
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
