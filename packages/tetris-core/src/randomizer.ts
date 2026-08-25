import { TETROMINO_TYPES } from './tetrominoes';
import type { TetrominoType } from './types';

/** 7-bag 随机数发生器: 每袋包含全部 7 种方块, 洗牌后逐个发放 */
export class SevenBag {
  private bag: TetrominoType[] = [];
  private random: () => number;

  constructor(random: () => number = Math.random) {
    this.random = random;
  }

  private refill(): void {
    const rest = TETROMINO_TYPES.slice();
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    this.bag = rest;
  }

  /** 取出下一个方块 */
  next(): TetrominoType {
    if (this.bag.length === 0) this.refill();
    return this.bag.shift() as TetrominoType;
  }

  /** 预览接下来 n 个方块(不消耗) */
  peek(n: number): TetrominoType[] {
    while (this.bag.length < n) this.refill();
    return this.bag.slice(0, n);
  }
}
