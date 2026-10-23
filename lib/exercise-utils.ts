import { difficultyOrder } from './difficulty.ts';

const types = ['概念', '计算', '代码', '诊断', '项目'];

export function sortExercises<
  T extends { category: string; difficulty: string; type: string },
>(items: readonly T[], categoryOrder: readonly string[]): T[] {
  const rank = (order: readonly string[], value: string) => {
    const index = order.indexOf(value);
    return index < 0 ? order.length : index;
  };
  return items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        rank(categoryOrder, a.item.category) -
          rank(categoryOrder, b.item.category) ||
        (difficultyOrder[a.item.difficulty] ?? 2) -
          (difficultyOrder[b.item.difficulty] ?? 2) ||
        rank(types, a.item.type) - rank(types, b.item.type) ||
        a.index - b.index,
    )
    .map(({ item }) => item);
}
