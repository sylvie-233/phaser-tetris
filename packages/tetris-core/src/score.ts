/** 消行基础分(索引 = 消除行数) */
export const LINE_SCORES: readonly number[] = [0, 100, 300, 500, 800];

/** 各等级下落间隔(毫秒), 参考 guideline 速度曲线, 索引 0 对应第 1 级 */
const LEVEL_SPEEDS: readonly number[] = [
  1000, 793, 618, 473, 355, 262, 190, 135, 94, 71, 53, 39, 30, 22, 16, 11, 8, 6, 4, 2,
];

export function speedForLevel(level: number): number {
  const index = Math.min(Math.max(level, 1), LEVEL_SPEEDS.length) - 1;
  return LEVEL_SPEEDS[index];
}

/** 由消行数换算等级 */
export function levelForLines(lines: number): number {
  return Math.floor(lines / 10) + 1;
}

export const SOFT_DROP_POINTS = 1;
export const HARD_DROP_POINTS = 2;
export const COMBO_POINTS = 50;
