'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Bookmark,
  Menu,
  Search,
  Waypoints,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MindMapNav } from '@/components/mindmap-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { concepts } from '@/lib/content';
import { contentIndex } from '@/lib/content-index';
import { categoryNames, englishConceptName } from '@/lib/english-display';

const links = [
  ['/', 'Home'],
  ['/concept/gradient-descent', 'Docs'],
  ['/plans', 'Learning plan'],
  ['/exercises', 'Practice'],
  ['/resources', 'Resources'],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const english = pathname === '/' || pathname.startsWith('/category/');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const showSearch = () => {
    dialog.current?.showModal();
    input.current?.focus();
  };
  useEffect(() => {
    dialog.current?.close();
    document.documentElement.lang = english ? 'en' : 'zh-CN';
  }, [pathname, english]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else showSearch();
      }
      if (event.key === 'Escape' && !dialog.current?.open) {
        setOpen(false);
        menuTrigger.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const q = query.trim().toLowerCase();
  const matches = concepts
    .filter((c) =>
      `${englishConceptName(c)} ${c.title} ${contentIndex[c.slug]?.searchText ?? ''}`
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 30);
  const active = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href.split('/').slice(0, 2).join('/'));
  return (
    <>
      <a className="lw-skip" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="site-nav">
          <Link
            href="/"
            className="site-nav__brand"
            aria-label="Layerwise home"
          >
            <Waypoints aria-hidden="true" />
            <span>Layerwise</span>
          </Link>
          <nav aria-label="Main navigation" className="site-nav__links">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="site-nav__link"
                aria-current={active(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="site-nav__tools">
            <button
              ref={searchTrigger}
              className="lw-search-trigger"
              onClick={showSearch}
              aria-label="Search knowledge"
            >
              <Search aria-hidden="true" />
              <span>Search knowledge</span>
              <kbd>Ctrl K</kbd>
            </button>
            <Link
              href="/bookmarks"
              className="lw-bookmarks"
              aria-label="Bookmarks"
            >
              <Bookmark aria-hidden="true" />
            </Link>
            <MindMapNav english />
            <ThemeToggle />
            <button
              ref={menuTrigger}
              type="button"
              aria-label={open ? 'Close navigation' : 'Open navigation'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="site-nav__menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="site-nav__mobile"
          >
            {[...links, ['/bookmarks', 'Bookmarks']].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="site-nav__mobile-link"
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <dialog
        ref={dialog}
        className="lw-search-dialog"
        aria-labelledby="knowledge-search-title"
        onClose={() => searchTrigger.current?.focus()}
      >
        <div className="lw-search-field">
          <Search aria-hidden="true" />
          <label
            className="sr-only"
            id="knowledge-search-title"
            htmlFor="knowledge-search"
          >
            Search knowledge
          </label>
          <input
            ref={input}
            id="knowledge-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search paths or concepts…"
            autoComplete="off"
          />
          <button
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <div className="lw-search-results">
          {!q &&
            Object.entries(categoryNames).map(([slug, title]) => (
              <Link
                key={slug}
                href={`/category/${slug}`}
                onClick={() => dialog.current?.close()}
              >
                <span>
                  <strong>{title}</strong>
                  <small>Learning path</small>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          {matches.length ? (
            matches.map((c) => (
              <Link
                key={c.slug}
                href={`/concept/${c.slug}`}
                onClick={() => dialog.current?.close()}
              >
                <span>
                  <strong>{english ? englishConceptName(c) : c.title}</strong>
                  <small>{categoryNames[c.category]}</small>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))
          ) : (
            <output>No matches. Try “machine learning” or “gradient”.</output>
          )}
        </div>
        <div className="lw-search-bottom">
          Search the complete knowledge library<span>Esc to close</span>
        </div>
      </dialog>
    </>
  );
}
