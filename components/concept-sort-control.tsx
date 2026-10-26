'use client';

import { ArrowDownUp } from 'lucide-react';
import type { ConceptSortMode } from '@/lib/concept-utils';
import { sortModeLabels } from '@/lib/concept-utils';
import { useLearning } from '@/components/learning-store';

export function ConceptSortControl({
  compact = false,
  english = false,
}: {
  compact?: boolean;
  english?: boolean;
}) {
  const { sortMode, setSortMode } = useLearning();
  return (
    <label
      className={compact ? 'sort-control sort-control-compact' : 'sort-control'}
    >
      <span className="flex items-center gap-1.5">
        <ArrowDownUp size={13} />
        {english ? 'Sort concepts' : compact ? '排序' : '概念排序'}
      </span>
      <select
        value={sortMode}
        onChange={(event) => setSortMode(event.target.value as ConceptSortMode)}
        aria-label={english ? 'Sort concepts' : '选择概念排序方式'}
      >
        <option value="difficulty-asc">
          {english
            ? 'Bookmarked first · Easy to advanced'
            : sortModeLabels['difficulty-asc']}
        </option>
        <option value="difficulty-desc">
          {english
            ? 'Bookmarked first · Advanced to easy'
            : sortModeLabels['difficulty-desc']}
        </option>
      </select>
    </label>
  );
}
