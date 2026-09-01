'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Code2,
  FlaskConical,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { categories, concepts, type CategorySlug } from '@/lib/content';
import { resolveConceptLink } from '@/lib/concept-utils';
import { longFormMap, type LongFormConcept } from '@/lib/long-form-content';
import {
  buildLocalDate,
  daysInMonth,
  generatePlan,
  localDate,
  parseWeeklyMinutes,
  PLAN_METHODS,
  planPreview,
  type LearningPlan,
  type PlanFormInput,
  type PlanLevel,
  type PlanMethod,
} from '@/lib/plan-engine';
import { useLearning } from '@/components/learning-store';
import { usePlans } from '@/components/plan-store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDate(date);
}

const initialForm: PlanFormInput = {
  title: '',
  goal: '',
  categories: ['machine-learning'],
  method: 'knowledge-route',
  level: '入门',
  weeklyMinutes: 300,
  targetDate: futureDate(56),
  includeCode: true,
  includeTests: true,
  includeReview: true,
};

export function PlanCreateView() {
  const router = useRouter();
  const { learned, bookmarks } = useLearning();
  const { savePlan } = usePlans();
  const [form, setForm] = useState(initialForm);
  const [weeklyInput, setWeeklyInput] = useState(
    String(initialForm.weeklyMinutes),
  );
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [targetParts, setTargetParts] = useState(() => {
    const [year, month, day] = initialForm.targetDate.split('-').map(Number);
    return { year, month, day };
  });
  const [draft, setDraft] = useState<LearningPlan | null>(null);
  const previewRef = useRef<HTMLHeadingElement>(null);
  const planConcepts = useMemo(
    () =>
      concepts.map((concept) => {
        const long = longFormMap[concept.slug] as
          | (LongFormConcept & {
              interactiveDemo?: string;
              inputs?: string[];
              outputs?: string[];
            })
          | undefined;
        return {
          slug: concept.slug,
          title: concept.title,
          category: concept.category,
          difficulty: concept.difficulty,
          prerequisites: concept.prerequisites.map(
            (identifier) =>
              resolveConceptLink(identifier).concept?.slug ?? identifier,
          ),
          hasCode: Boolean(concept.code?.source),
          hasInteractive: Boolean(long?.interactiveDemo),
          hasFormula: Boolean(
            long?.formulas.some((formula) => formula.expression !== '—') ??
            concept.formula.expression !== '—',
          ),
          definition: long?.definition ?? [concept.explanation],
          summary: concept.summary,
          principles: long?.corePrinciple ?? [concept.principle],
          relatedConcepts: concept.relatedConcepts.flatMap((identifier) => {
            const resolved = resolveConceptLink(identifier).concept;
            return resolved ? [resolved.title] : [];
          }),
          inputs: long?.inputs ?? [],
          outputs: long?.outputs ?? [],
        };
      }),
    [],
  );

  function set<K extends keyof PlanFormInput>(key: K, value: PlanFormInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function toggleCategory(slug: CategorySlug) {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(slug)
        ? current.categories.filter((item) => item !== slug)
        : [...current.categories, slug],
    }));
  }
  function commitWeekly(raw: string) {
    const parsed = parseWeeklyMinutes(raw);
    setWeeklyError(parsed.error);
    if (parsed.value !== null) set('weeklyMinutes', parsed.value);
    return parsed.value;
  }
  function applyWeeklyPreset(value: number) {
    setWeeklyInput(String(value));
    setWeeklyError(null);
    set('weeklyMinutes', value);
  }
  function changeTargetPart(key: 'year' | 'month' | 'day', value: number) {
    const next = { ...targetParts, [key]: value };
    const maxDay = daysInMonth(next.year, next.month);
    if (next.day > maxDay) next.day = maxDay;
    const targetDate = buildLocalDate(next.year, next.month, next.day);
    setTargetParts(next);
    setDateError(null);
    if (targetDate) set('targetDate', targetDate);
  }
  function generate() {
    const weeklyMinutes = commitWeekly(weeklyInput);
    const targetDate = buildLocalDate(
      targetParts.year,
      targetParts.month,
      targetParts.day,
    );
    if (!targetDate || targetDate < localDate(new Date())) {
      setDateError('目标日期需要是今天或之后的有效日期');
      return;
    }
    if (weeklyMinutes === null) return;
    const next = generatePlan(
      { ...form, weeklyMinutes, targetDate },
      planConcepts,
      { learned, bookmarks },
      new Date(),
    );
    setDraft(next);
    requestAnimationFrame(() => previewRef.current?.focus());
  }
  function confirm() {
    if (!draft) return;
    savePlan(draft);
    router.push(`/plans/${draft.id}`);
  }

  if (draft)
    return (
      <PlanPreview
        plan={draft}
        onBack={() => setDraft(null)}
        onRegenerate={generate}
        onConfirm={confirm}
        headingRef={previewRef}
      />
    );
  return (
    <main className="plan-page">
      <div className="plan-container plan-create-container">
        <nav aria-label="面包屑" className="breadcrumbs">
          <Link href="/">知识库</Link>
          <span>/</span>
          <Link href="/plans">学习计划</Link>
          <span>/</span>
          <span>创建</span>
        </nav>
        <header className="plan-page-header">
          <div>
            <p className="eyebrow">交互式创建</p>
            <h1>创建学习计划</h1>
            <p>先填写设置并生成预览。此时不会写入 localStorage。</p>
          </div>
        </header>
        <form
          className="plan-form"
          onSubmit={(event) => {
            event.preventDefault();
            generate();
          }}
        >
          <section className="plan-form-section">
            <div className="plan-form-heading">
              <span>01</span>
              <div>
                <h2>目标与方向</h2>
                <p>说明这段时间想完成什么，以及从哪些知识目录选取任务。</p>
              </div>
            </div>
            <div className="plan-form-grid">
              <Field label="计划名称" htmlFor="plan-title">
                <Input
                  id="plan-title"
                  required
                  value={form.title}
                  onChange={(event) => set('title', event.target.value)}
                  placeholder="例如：8 周机器学习基础巩固"
                />
              </Field>
              <Field label="当前学习水平" htmlFor="plan-level">
                <select
                  id="plan-level"
                  value={form.level}
                  onChange={(event) =>
                    set('level', event.target.value as PlanLevel)
                  }
                >
                  <option>入门</option>
                  <option>进阶</option>
                  <option>挑战</option>
                </select>
              </Field>
              <Field label="学习目标（可选）" htmlFor="plan-goal" wide>
                <Textarea
                  id="plan-goal"
                  value={form.goal}
                  onChange={(event) => set('goal', event.target.value)}
                  placeholder="可选：希望最终能够解释、实现或解决什么问题？"
                />
              </Field>
            </div>
            <fieldset className="plan-check-grid">
              <legend>学习方向（可多选）</legend>
              {categories.map((category) => (
                <label
                  key={category.slug}
                  className="plan-check"
                  htmlFor={`plan-category-${category.slug}`}
                >
                  <Checkbox
                    id={`plan-category-${category.slug}`}
                    checked={form.categories.includes(category.slug)}
                    onCheckedChange={() => toggleCategory(category.slug)}
                  />
                  <span>
                    <strong>{category.title}</strong>
                    <small>{category.description}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            {form.categories.length > 1 && (
              <p className="plan-inline-note">
                <Sparkles />
                已启用多方向组合，将按各方向的前置关系和难度统一排序。
              </p>
            )}
          </section>
          <section className="plan-form-section">
            <div className="plan-form-heading">
              <span>02</span>
              <div>
                <h2>预设学习方法</h2>
                <p>默认使用知识路线法，也可以切换成理解、代码或复习优先。</p>
              </div>
            </div>
            <fieldset className="plan-method-grid">
              <legend className="sr-only">选择学习方法</legend>
              {PLAN_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`plan-method ${form.method === method.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={method.value}
                    checked={form.method === method.value}
                    onChange={() => set('method', method.value as PlanMethod)}
                  />
                  <span>
                    <Check />
                    <strong>{method.label}</strong>
                    <small>{method.summary}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
          <section className="plan-form-section">
            <div className="plan-form-heading">
              <span>03</span>
              <div>
                <h2>时间与任务偏好</h2>
                <p>计划会按每周预算和目标日期限制首版概念数量。</p>
              </div>
            </div>
            <div className="plan-form-grid">
              <div className="plan-field">
                <label htmlFor="weekly-minutes">每周可投入时间（分钟）</label>
                <Input
                  id="weekly-minutes"
                  type="text"
                  inputMode="numeric"
                  value={weeklyInput}
                  aria-invalid={Boolean(weeklyError)}
                  aria-describedby={
                    weeklyError ? 'weekly-minutes-error' : undefined
                  }
                  onChange={(event) => {
                    setWeeklyInput(event.target.value);
                    if (weeklyError) setWeeklyError(null);
                  }}
                  onBlur={() => commitWeekly(weeklyInput)}
                  placeholder="例如 300"
                />
                <div className="plan-time-presets" aria-label="常用每周时间">
                  {[120, 300, 480, 600].map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => applyWeeklyPreset(value)}
                    >
                      {value} 分钟
                    </button>
                  ))}
                </div>
                {weeklyError && (
                  <small id="weekly-minutes-error" role="alert">
                    {weeklyError}
                  </small>
                )}
              </div>
              <fieldset className="plan-field plan-date-field">
                <legend>目标完成日期</legend>
                <div>
                  <label>
                    <span className="sr-only">年份</span>
                    <select
                      value={targetParts.year}
                      onChange={(event) =>
                        changeTargetPart('year', Number(event.target.value))
                      }
                    >
                      {Array.from(
                        { length: 6 },
                        (_, index) => new Date().getFullYear() + index,
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year} 年
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">月份</span>
                    <select
                      value={targetParts.month}
                      onChange={(event) =>
                        changeTargetPart('month', Number(event.target.value))
                      }
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map(
                        (month) => (
                          <option key={month} value={month}>
                            {month} 月
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">日期</span>
                    <select
                      value={targetParts.day}
                      onChange={(event) =>
                        changeTargetPart('day', Number(event.target.value))
                      }
                    >
                      {Array.from(
                        {
                          length: daysInMonth(
                            targetParts.year,
                            targetParts.month,
                          ),
                        },
                        (_, index) => index + 1,
                      ).map((day) => (
                        <option key={day} value={day}>
                          {day} 日
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {dateError && <small role="alert">{dateError}</small>}
              </fieldset>
            </div>
            <div className="plan-option-list">
              <Option
                id="plan-option-code"
                checked={form.includeCode}
                onChange={() => set('includeCode', !form.includeCode)}
                icon={<Code2 />}
                title="包含代码练习"
                note="在有代码示例的概念中加入阅读或修改任务"
              />
              <Option
                id="plan-option-tests"
                checked={form.includeTests}
                onChange={() => set('includeTests', !form.includeTests)}
                icon={<FlaskConical />}
                title="包含阶段性测试"
                note="测试独立保存，不阻塞后续学习"
              />
              <Option
                id="plan-option-review"
                checked={form.includeReview}
                onChange={() => set('includeReview', !form.includeReview)}
                icon={<RefreshCw />}
                title="包含间隔复习"
                note="按 1、3、7、14 天安排复习；复习法额外包含当天"
              />
            </div>
          </section>
          <div className="plan-form-actions">
            <Button variant="outline" render={<Link href="/plans" />}>
              <ArrowLeft />
              返回计划列表
            </Button>
            <Button
              size="lg"
              type="submit"
              disabled={!form.title.trim() || form.categories.length === 0}
            >
              <Sparkles />
              生成计划
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function PlanPreview({
  plan,
  onBack,
  onRegenerate,
  onConfirm,
  headingRef,
}: {
  plan: LearningPlan;
  onBack: () => void;
  onRegenerate: () => void;
  onConfirm: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const summary = planPreview(plan);
  const method = PLAN_METHODS.find((item) => item.value === plan.method)?.label;
  const stats = [
    ['阶段', summary.phaseCount],
    ['概念', summary.conceptCount],
    ['代码练习', summary.codeCount],
    ['复习任务', summary.reviewCount],
    ['阶段测试', summary.testCount],
    ['预计总时长', `${summary.totalMinutes} 分钟`],
  ];
  return (
    <main className="plan-page">
      <div className="plan-container">
        <nav aria-label="面包屑" className="breadcrumbs">
          <Link href="/plans">学习计划</Link>
          <span>/</span>
          <span>生成预览</span>
        </nav>
        <header className="plan-page-header">
          <div>
            <p className="eyebrow">尚未保存</p>
            <h1 tabIndex={-1} ref={headingRef}>
              计划预览
            </h1>
            <p>
              核对阶段和任务后再保存。返回修改或重新生成都不会产生计划记录。
            </p>
          </div>
        </header>
        <section className="plan-preview-hero">
          <div>
            <span>{method}</span>
            <h2>{plan.title}</h2>
            <p>{plan.goal || '未设置具体学习目标，可稍后在计划详情中补充。'}</p>
            <div className="plan-preview-meta">
              <span>
                {plan.categories
                  .map(
                    (slug) =>
                      categories.find((item) => item.slug === slug)?.title,
                  )
                  .join(' · ')}
              </span>
              <span>每周 {plan.weeklyMinutes} 分钟</span>
              <span>预计完成 {plan.estimatedCompletionDate}</span>
            </div>
          </div>
          <CalendarDays />
        </section>
        <section className="plan-preview-stats">
          {stats.map(([label, value]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>
        {plan.generationWarnings.length > 0 && (
          <section className="plan-warning">
            <strong>生成检查</strong>
            {plan.generationWarnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </section>
        )}
        <section className="plan-preview-phases">
          {plan.phases.map((phase) => (
            <article key={phase.id}>
              <header>
                <span>阶段 {phase.order + 1}</span>
                <h2>{phase.title}</h2>
                <p>{phase.description}</p>
              </header>
              <ol>
                {phase.tasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.order + 1}</span>
                    <div>
                      <strong>{task.title}</strong>
                      {task.description && (
                        <p className="plan-preview-task-description">
                          {task.description}
                        </p>
                      )}
                      <small>
                        {task.estimatedMinutes} 分钟 · 截止 {task.dueDate}
                        {task.status === 'completed'
                          ? ' · 已按现有学习状态完成'
                          : ''}
                      </small>
                      <details className="plan-preview-substeps">
                        <summary>
                          查看 {task.substeps.length} 个学习步骤
                        </summary>
                        <div>
                          {task.substeps.map((step) => (
                            <p key={step.id}>
                              <span>{step.title}</span>
                              <em>{step.estimatedMinutes} 分钟</em>
                            </p>
                          ))}
                        </div>
                      </details>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>
        <div className="plan-form-actions sticky-actions">
          <Button variant="outline" onClick={onBack}>
            <RotateCcw />
            返回修改
          </Button>
          <Button variant="outline" onClick={onRegenerate}>
            <RefreshCw />
            重新生成
          </Button>
          <Button size="lg" onClick={onConfirm}>
            <Save />
            确认并保存
          </Button>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  wide,
  children,
}: {
  label: string;
  htmlFor: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`plan-field ${wide ? 'wide' : ''}`} htmlFor={htmlFor}>
      <span>{label}</span>
      {children}
    </label>
  );
}
function Option({
  id,
  checked,
  onChange,
  icon,
  title,
  note,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <label className="plan-option" htmlFor={id}>
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <span className="plan-option-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{note}</small>
      </span>
    </label>
  );
}
