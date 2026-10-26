import { resourceFilterSchema, type FilterSchema } from './filter-query';
import type { ResourceFilters } from './resources';

export interface LibraryFilters extends ResourceFilters {
  view: 'all' | 'bookmarked' | 'viewed';
}
export const libraryFilterSchema: FilterSchema<LibraryFilters> = {
  ...resourceFilterSchema,
  view: { parameter: 'view', initial: 'all', values: ['bookmarked', 'viewed'] },
};
export const planFilterSchema: FilterSchema<{ status: string }> = {
  status: {
    parameter: 'status',
    initial: 'all',
    values: ['active', 'paused', 'completed'],
  },
};
