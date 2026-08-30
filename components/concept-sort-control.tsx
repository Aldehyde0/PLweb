'use client';

import { ArrowDownUp } from 'lucide-react';
import type { ConceptSortMode } from '@/lib/concept-utils';
import { sortModeLabels } from '@/lib/concept-utils';
import { useLearning } from '@/components/learning-store';

export function ConceptSortControl({compact=false}:{compact?:boolean}){const{sortMode,setSortMode}=useLearning();return <label className={compact?'sort-control sort-control-compact':'sort-control'}><span className="flex items-center gap-1.5"><ArrowDownUp size={13}/>{compact?'排序':'概念排序'}</span><select value={sortMode} onChange={(event)=>setSortMode(event.target.value as ConceptSortMode)} aria-label="选择概念排序方式"><option value="difficulty-asc">{sortModeLabels['difficulty-asc']}</option><option value="difficulty-desc">{sortModeLabels['difficulty-desc']}</option></select></label>}
