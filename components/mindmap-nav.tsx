'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, GitFork } from 'lucide-react';
import { categories } from '@/lib/content';

export function MindMapNav() {
  const [open, setOpen] = useState(false);
  const holder = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!holder.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  return (
    <div
      role="presentation"
      ref={holder}
      className="mindmap-nav"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') {
          clear();
          setOpen(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') {
          clear();
          timer.current = setTimeout(() => setOpen(false), 180);
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            trigger.current?.focus();
          }
        }}
        ref={trigger}
        type="button"
        className="site-nav__link mindmap-nav-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          clear();
          setOpen((value) => !value);
        }}
      >
        <GitFork size={16} aria-hidden="true" />
        思维导图
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={id}
          className="mindmap-nav-panel"
          aria-label="选择思维导图方向"
        >
          {categories.map((category) => (
            <Link
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  trigger.current?.focus();
                }
              }}
              key={category.slug}
              href={`/mindmaps/${category.slug}`}
              onClick={() => setOpen(false)}
            >
              <span>{category.title}</span>
              <small>{category.shortTitle}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
