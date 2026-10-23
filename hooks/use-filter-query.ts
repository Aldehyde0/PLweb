'use client';

import { startTransition, useOptimistic } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  defaultFilters,
  readFilters,
  writeFilters,
  type FilterSchema,
} from '@/lib/filter-query';

export function useFilterQuery<T extends { [K in keyof T]: string }>(
  schema: FilterSchema<T>,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setOptimisticQuery] = useOptimistic(searchParams.toString());
  const filters = readFilters(new URLSearchParams(query), schema);
  function update(patch: Partial<T>, replace = false) {
    const next = writeFilters(
      new URLSearchParams(query),
      schema,
      patch,
    ).toString();
    if (next === query) return;
    startTransition(() => {
      setOptimisticQuery(next);
      router[replace ? 'replace' : 'push'](
        `${pathname}${next ? `?${next}` : ''}`,
        { scroll: false },
      );
    });
  }
  return { filters, update, clear: () => update(defaultFilters(schema)) };
}
