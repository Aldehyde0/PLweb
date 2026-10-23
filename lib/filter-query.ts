import {
  resourceCategories,
  resourceTypes,
  type ResourceFilters,
} from './resources.ts';
import type { CategorySlug, Difficulty } from './content-base';
import type { ExerciseType } from './exercises';

export type FilterSchema<T> = {
  [K in keyof T]: {
    parameter: string;
    initial: T[K];
    values?: readonly string[];
    page?: boolean;
  };
};
export interface ExerciseFilters {
  query: string;
  category: 'all' | CategorySlug;
  difficulty: '全部' | Difficulty;
  type: '全部' | ExerciseType;
  status: '全部' | '未完成' | '已完成';
  page: string;
}
export const exerciseFilterSchema: FilterSchema<ExerciseFilters> = {
  query: { parameter: 'q', initial: '' },
  category: { parameter: 'dir', initial: 'all', values: resourceCategories },
  difficulty: {
    parameter: 'level',
    initial: '全部',
    values: ['入门', '进阶', '挑战'],
  },
  type: {
    parameter: 'type',
    initial: '全部',
    values: ['概念', '计算', '代码', '诊断', '项目'],
  },
  status: {
    parameter: 'status',
    initial: '全部',
    values: ['未完成', '已完成'],
  },
  page: { parameter: 'page', initial: '1', page: true },
};
export const resourceFilterSchema: FilterSchema<ResourceFilters> = {
  query: { parameter: 'q', initial: '' },
  category: { parameter: 'dir', initial: 'all', values: resourceCategories },
  difficulty: {
    parameter: 'level',
    initial: 'all',
    values: ['入门', '进阶', '挑战'],
  },
  type: { parameter: 'type', initial: 'all', values: resourceTypes },
  language: {
    parameter: 'lang',
    initial: 'all',
    values: ['中文', '英语', '中英双语'],
  },
  cost: { parameter: 'cost', initial: 'all', values: ['free', 'paid'] },
  recommendation: {
    parameter: 'rank',
    initial: 'all',
    values: ['A', 'B', 'C'],
  },
  sort: {
    parameter: 'sort',
    initial: 'recommendation',
    values: ['recommendation', 'updated'],
  },
};
export function defaultFilters<T extends { [K in keyof T]: string }>(
  schema: FilterSchema<T>,
): T {
  return Object.fromEntries(
    Object.entries(schema).map(([key, rule]) => [
      key,
      (rule as { initial: string }).initial,
    ]),
  ) as T;
}
export function readFilters<T extends { [K in keyof T]: string }>(
  params: URLSearchParams,
  schema: FilterSchema<T>,
): T {
  const result = defaultFilters(schema);
  for (const key of Object.keys(schema) as (keyof T)[]) {
    const rule = schema[key];
    const value = params.get(rule.parameter);
    if (value === null || (rule.values && !rule.values.includes(value)))
      continue;
    if (
      rule.page &&
      (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
    )
      continue;
    result[key] = value as T[keyof T];
  }
  return result;
}
export function writeFilters<T extends { [K in keyof T]: string }>(
  params: URLSearchParams,
  schema: FilterSchema<T>,
  patch: Partial<T>,
): URLSearchParams {
  const next = new URLSearchParams(params);
  const state = readFilters(params, schema);
  Object.assign(state, patch);
  for (const key of Object.keys(schema) as (keyof T)[]) {
    const { parameter, initial } = schema[key];
    if (state[key] === initial || !state[key]) next.delete(parameter);
    else next.set(parameter, state[key]);
  }
  return next;
}
