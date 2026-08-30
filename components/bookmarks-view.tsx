'use client';

import { BookmarkX } from 'lucide-react';
import { conceptMap } from '@/lib/content';
import { useLearning } from '@/components/learning-store';
import { ConceptCard } from '@/components/concept-card';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';

export function BookmarksView(){const {bookmarks,toggleBookmark,ready}=useLearning();const saved=bookmarks.map((slug)=>conceptMap[slug]).filter(Boolean);return <main><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"><header className="max-w-2xl"><p className="eyebrow">稍后阅读</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">我的收藏</h1><p className="mt-4 text-base leading-7 text-muted-foreground">把值得反复阅读的概念集中在这里。收藏信息仅保存在当前浏览器。</p></header><section className="mt-10">{!ready?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n)=><div key={n} className="h-44 animate-pulse rounded-2xl bg-card"/>)}</div>:saved.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{saved.map((concept)=><div key={concept.slug} className="relative"><ConceptCard concept={concept}/><Button onClick={(event)=>{event.preventDefault();toggleBookmark(concept.slug)}} variant="ghost" size="icon-sm" className="absolute right-11 top-4 z-10 text-muted-foreground hover:text-destructive" aria-label={`取消收藏 ${concept.title}`}><BookmarkX/></Button></div>)}</div>:<EmptyState title="还没有收藏概念" description="浏览概念详情时点击“加入收藏”，重要内容就会出现在这里。"/>}</section></div></main>}
