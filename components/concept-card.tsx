'use client';

import Link from 'next/link';
import { ArrowUpRight, Bookmark, Check } from 'lucide-react';
import type { Concept } from '@/lib/content';
import { useLearning } from '@/components/learning-store';

export function ConceptCard({ concept }: { concept: Concept }) {
  const { learned, bookmarks } = useLearning();
  const done = learned.includes(concept.slug); const saved = bookmarks.includes(concept.slug);
  return <Link href={`/concept/${concept.slug}`} className="group flex min-h-44 flex-col rounded-2xl border border-border bg-card p-5 outline-none transition-colors hover:border-primary/35 hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-ring">
    <div className="flex items-center justify-between gap-3"><span className={`difficulty difficulty-${concept.difficulty}`}>{concept.difficulty}</span><span className="flex gap-2 text-muted-foreground">{done&&<Check size={16} className="text-primary" aria-label="已学习"/>}{saved&&<Bookmark size={16} className="fill-primary/25 text-primary" aria-label="已收藏"/>}<ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></span></div>
    <h3 className="mt-5 text-lg font-medium tracking-tight">{concept.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{concept.summary}</p>
    <p className="mt-auto pt-5 text-xs text-muted-foreground">{concept.code.language} 示例</p>
  </Link>;
}
