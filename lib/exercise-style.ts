import type { ExerciseType } from './exercises';

export type ExerciseTypeGroup =
  | 'concept'
  | 'calculation'
  | 'code'
  | 'diagnostic'
  | 'project';

const exerciseTypeGroups = {
  概念: 'concept',
  计算: 'calculation',
  代码: 'code',
  诊断: 'diagnostic',
  项目: 'project',
} as const satisfies Record<ExerciseType, ExerciseTypeGroup>;

export function getExerciseTypeGroup(type: ExerciseType): ExerciseTypeGroup {
  return exerciseTypeGroups[type];
}
