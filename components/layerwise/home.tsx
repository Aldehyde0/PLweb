'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useLearning } from '@/components/learning-store';
import { useAppliedTheme, useMedia } from '@/hooks/use-appearance';
import { concepts } from '@/lib/content';
import { recommendConcept } from '@/lib/learning-recommendation';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  Code2,
  Copy,
  Layers3,
  Pause,
  Play,
  Waypoints,
} from 'lucide-react';
import SwarmCursor from './swarm-cursor.jsx';

const site = '';
const categoryHref = (slug: string) => '/category/' + slug;
const directions = [
  {
    code: 'AI',
    title: 'Artificial intelligence',
    icon: BrainCircuit,
    slug: 'artificial-intelligence',
    description:
      'Explore search, reasoning, and agents. Build your first map of AI.',
    topics: 'Foundations · Search · Reasoning',
  },
  {
    code: 'ML',
    title: 'Machine learning',
    icon: Waypoints,
    slug: 'machine-learning',
    description:
      'Find patterns in data. Understand how models learn and generalize.',
    topics: 'Data · Models · Evaluation',
  },
  {
    code: 'DL',
    title: 'Deep learning',
    icon: Layers3,
    slug: 'deep-learning',
    description:
      'Go inside neural networks, from a forward pass to modern architectures.',
    topics: 'Networks · Training · Architecture',
  },
  {
    code: 'RL',
    title: 'Reinforcement learning',
    icon: Code2,
    slug: 'reinforcement-learning',
    description:
      'Learn how agents make decisions through actions and feedback.',
    topics: 'Environments · Policies · Rewards',
  },
];
const learningSource = `import numpy as np

# A small dataset. A pattern to discover.
x = np.array([1., 2., 3., 4.])
y = 2 * x + 1
w, b = 0., 0.

for step in range(200):
    error = (w * x + b) - y
    w -= 0.05 * (2 * error * x).mean()
    b -= 0.05 * (2 * error).mean()

print(f"w={w:.3f}, b={b:.3f}")`;

function highlightPython(line: string) {
  return line
    .split(
      /(#.*$|f?"[^"\n]*"|\b(?:import|as|for|in|range|print)\b|\b\d+(?:\.\d*)?\b)/g,
    )
    .filter(Boolean)
    .map((part, index) => {
      const type = part.startsWith('#')
        ? 'comment'
        : /^(?:f)?"/.test(part)
          ? 'string'
          : /^(import|as|for|in|range|print)$/.test(part)
            ? 'keyword'
            : /^\d/.test(part)
              ? 'number'
              : 'plain';
      return (
        <span key={index} className={`syntax-${type}`}>
          {part}
        </span>
      );
    });
}

function sampleResult() {
  const x = [1, 2, 3, 4];
  let w = 0,
    b = 0;
  for (let step = 0; step < 200; step++) {
    const error = x.map((value) => w * value + b - (2 * value + 1));
    w -=
      (0.05 * error.reduce((sum, value, i) => sum + 2 * value * x[i], 0)) /
      x.length;
    b -= (0.05 * error.reduce((sum, value) => sum + 2 * value, 0)) / x.length;
  }
  return `w=${w.toFixed(3)}, b=${b.toFixed(3)}`;
}
const expectedOutput = sampleResult();

function CodeShowcase() {
  const [copyState, setCopyState] = useState('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(learningSource);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState('idle'), 2500);
  }
  return (
    <section
      className="code-showcase content-width"
      aria-labelledby="code-title"
    >
      <div className="section-heading reveal" data-reveal>
        <div>
          <p className="section-label">IDEAS BECOME CLEARER IN CODE</p>
          <h2 id="code-title">Read it. Run it. Make it click.</h2>
        </div>
        <p className="section-note">
          A small example can unlock a big idea.
          <br />
          Start with the pattern. See how a model finds it.
        </p>
      </div>
      <div className="code-stage reveal" data-reveal>
        <article className="source-panel" aria-label="Python learning example">
          <header className="source-header">
            <span>
              <Code2 aria-hidden="true" />
              learn.py
            </span>
            <div>
              <span className="language-label">Python / NumPy</span>
              <button
                className="icon-button code-copy"
                onClick={copyCode}
                aria-label={
                  copyState === 'copied' ? 'Code copied' : 'Copy Python code'
                }
              >
                {copyState === 'copied' ? <Check /> : <Copy />}
              </button>
            </div>
          </header>
          <pre className="source-code">
            <code>
              {learningSource.split('\n').map((line, index) => (
                <span className="code-line" key={index}>
                  <span className="line-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{highlightPython(line) || ' '}</span>
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
          <output className="sr-only" aria-live="polite">
            {copyState === 'copied'
              ? 'Code copied to clipboard.'
              : copyState === 'error'
                ? 'Clipboard unavailable. Select the example to copy it.'
                : ''}
          </output>
        </article>
        <div className="code-companion">
          <article className="output-panel">
            <header>
              <span className="output-dot" />
              Expected output
            </header>
            <div className="output-content">
              <p>
                <span className="terminal-prompt">$</span> python learn.py
              </p>
              <output>{expectedOutput}</output>
              <p className="output-note">
                The model approaches <code>y = 2x + 1</code>.
              </p>
            </div>
          </article>
          <div className="example-notes">
            <span className="example-label">
              ONE EXAMPLE, THREE CONNECTIONS
            </span>
            <div>
              <span>01</span>
              <p>
                Find the pattern
                <small>Understand the relationship in the data.</small>
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                Follow the gradient
                <small>Watch small updates reduce the error.</small>
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                Build your intuition
                <small>Connect the equation to working code.</small>
              </p>
            </div>
            <Link href={`${site}/concept/gradient-descent`}>
              Explore gradient descent
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export function LayerwiseHome() {
  const scope = useRef<HTMLDivElement>(null);
  const { ready, learned, recent } = useLearning();
  const recommended =
    recommendConcept(concepts, learned, recent) ?? concepts[0];
  const theme = useAppliedTheme();
  const [paused, setPaused] = useState(false);
  const mobile = useMedia('(max-width: 640px)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    const elements = [
      ...(scope.current?.querySelectorAll('[data-reveal]') ?? []),
    ];
    if (reduced || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [reduced]);
  return (
    <div className="current-home" ref={scope}>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <SwarmCursor
            dpr={undefined}
            style={undefined}
            key={reduced ? 'reduced' : 'motion'}
            count={mobile ? 650 : 1200}
            size={mobile ? 3 : 3.6}
            spread={mobile ? 120 : 170}
            speed={0.85}
            swirl={0.65}
            tail={0.62}
            trail={0.65}
            wander={0.55}
            depth={0.8}
            color={theme === 'dark' ? '#c6a2ff' : '#3c8cdb'}
            accentColor={theme === 'dark' ? '#a855f7' : '#176bd6'}
            lightMode={theme === 'light'}
            paused={paused || reduced}
            idle="roam"
            clickEffect="burst"
            className="hero-swarm"
            aria-hidden={undefined}
          >
            <div className="hero-content">
              <Link className="hero-tag" href="#directions">
                <span className="status-mark" aria-hidden="true" />A place to
                understand AI
                <ArrowUpRight aria-hidden="true" />
              </Link>
              <h1 id="hero-title">
                Understand AI.<span>One layer at a time.</span>
              </h1>
              <p className="hero-description">
                Connect ideas, code, and practice into understanding.
                <br />
                Follow your curiosity. Build at your own pace.
              </p>
              <div className="hero-actions">
                <Link
                  className="button button-primary"
                  href={`/concept/${recommended.slug}`}
                >
                  {ready && recent.length
                    ? 'Continue learning'
                    : 'Start learning'}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link className="button button-secondary" href={'/plans'}>
                  Open learning plan
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </SwarmCursor>
          <div className="hero-bottom">
            <span className="hero-hint">
              <span className="hint-mark" aria-hidden="true" />
              Move your cursor. Follow your curiosity.
            </span>
            <button
              className="icon-button pause-button"
              disabled={reduced}
              onClick={() => setPaused(!paused)}
              aria-label={
                paused || reduced
                  ? 'Play particle animation'
                  : 'Pause particle animation'
              }
              aria-pressed={!paused && !reduced}
            >
              {paused || reduced ? <Play /> : <Pause />}
            </button>
          </div>
        </section>
        <CodeShowcase />
        <section
          className="directions content-width"
          id="directions"
          aria-labelledby="directions-title"
        >
          <div className="section-heading reveal" data-reveal>
            <div>
              <p className="section-label">BUILD YOUR KNOWLEDGE MAP</p>
              <h2 id="directions-title">Choose your next layer.</h2>
            </div>
            <span className="section-note">
              Four paths. A connected way to learn.
            </span>
          </div>
          <div className="direction-grid">
            {directions.map(
              (
                { code, title, icon: Icon, slug, description, topics },
                index,
              ) => (
                <Link
                  className="direction-card reveal"
                  data-reveal
                  style={
                    { '--reveal-delay': `${index * 85}ms` } as CSSProperties
                  }
                  key={code}
                  href={categoryHref(slug)}
                >
                  <div className="card-top">
                    <span className="direction-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="direction-code">{code}</span>
                  </div>
                  <h3>
                    {title}
                    <ArrowUpRight aria-hidden="true" />
                  </h3>
                  <p>{description}</p>
                  <span className="card-topics">{topics}</span>
                </Link>
              ),
            )}
          </div>
        </section>
        <section className="reading-note content-width">
          <BookOpen aria-hidden="true" />
          <p>
            You don’t have to learn it all at once.
            <span>Understand an idea. Run the code. Solve a problem.</span>
          </p>
          <Link href={'/exercises'}>
            Try an exercise
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}
