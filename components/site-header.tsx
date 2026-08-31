'use client';

import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  CalendarRange,
  Dumbbell,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: '/', label: '知识库', icon: BookOpen },
    { href: '/plans', label: '学习计划', icon: CalendarRange },
    { href: '/exercises', label: '练习', icon: Dumbbell },
    { href: '/bookmarks', label: '收藏', icon: Bookmark },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="rounded-md text-base font-semibold tracking-[-0.035em] outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-lg"
        >
          how to learn AI<span className="text-primary">.</span>
        </Link>
        <nav aria-label="主导航" className="hidden items-center gap-1 sm:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <Button
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav
          aria-label="移动端导航"
          className="border-t border-border px-5 py-3 sm:hidden"
        >
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              onClick={() => setOpen(false)}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
