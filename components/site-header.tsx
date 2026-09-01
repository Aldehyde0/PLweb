'use client';

import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  CalendarRange,
  Dumbbell,
  LibraryBig,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: '/', label: '知识', icon: BookOpen },
    { href: '/resources', label: '资源', icon: LibraryBig },
    { href: '/plans', label: '计划', icon: CalendarRange },
    { href: '/exercises', label: '练习', icon: Dumbbell },
    { href: '/bookmarks', label: '收藏', icon: Bookmark },
  ];
  return (
    <header className="site-header">
      <div className="site-nav">
        <Link href="/" className="site-nav__brand">
          how to learn AI<span className="text-primary">.</span>
        </Link>
        <nav aria-label="主导航" className="site-nav__links">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="site-nav__link">
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <button
          type="button"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          className="site-nav__menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav aria-label="移动端导航" className="site-nav__mobile">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              onClick={() => setOpen(false)}
              href={href}
              className="site-nav__mobile-link"
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
