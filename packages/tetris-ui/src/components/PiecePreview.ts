import type Phaser from 'phaser';
import type { TetrominoType } from '@tetris/core';
import { BOX_SIZE, getShape } from '@tetris/core';
import { PIECE_COLORS } from '../theme';

export interface PiecePreviewOptions {
  x: number;
  y: number;
  cellSize: number;
  depth?: number;
}

/**
 * 单块预览(用于 Next / Hold): 以出生朝向居中绘制一个方块。
 */
export class PiecePreview {
  readonly graphics: Phaser.GameObjects.Graphics;

  private x: number;
  private y: number;
  private cellSize: number;

  constructor(scene: Phaser.Scene, options: PiecePreviewOptions) {
    this.x = options.x;
    this.y = options.y;
    this.cellSize = options.cellSize;
    this.graphics = scene.add.graphics().setDepth(options.depth ?? 5);
  }

  setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  setCellSize(cellSize: number): this {
    this.cellSize = cellSize;
    return this;
  }

  /** 绘制预览; type 为 null 时清空 */
  render(type: TetrominoType | null): void {
    const g = this.graphics;
    g.clear();
    if (!type) return;

    const cs = this.cellSize;
    const box = BOX_SIZE[type];
    const total = box * cs;
    const ox = this.x - total / 2;
    const oy = this.y - total / 2;

    const shape = getShape(type, 0);
    for (const [mx, my] of shape) {
      const x = ox + mx * cs;
      const y = oy + my * cs;
      const pal = PIECE_COLORS[type];
      g.fillStyle(pal.dark, 1);
      g.fillRect(x + 1, y + 1, cs - 2, cs - 2);
      g.fillStyle(pal.base, 1);
      g.fillRect(x + 2, y + 2, cs - 4, cs - 4);
      g.fillStyle(pal.light, 0.9);
      g.fillRect(x + 2, y + 2, cs - 4, 2);
      g.fillRect(x + 2, y + 2, 2, cs - 4);
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
