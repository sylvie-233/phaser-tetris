import type Phaser from 'phaser';
import type { GameState, Piece, TetrominoType } from '@tetris/core';
import { COLS, ROWS, getShape } from '@tetris/core';
import { COLORS, PIECE_COLORS } from '../theme';

export interface BoardRendererOptions {
  x: number;
  y: number;
  cellSize: number;
  depth?: number;
}

/**
 * 棋盘渲染器: 绘制网格、已落定方块、幽灵块与当前活动块。
 * 通过 setPosition / setCellSize 重新布局, 适配不同屏幕。
 */
export class BoardRenderer {
  readonly graphics: Phaser.GameObjects.Graphics;

  private x: number;
  private y: number;
  private cellSize: number;

  constructor(scene: Phaser.Scene, options: BoardRendererOptions) {
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

  get boardWidth(): number {
    return COLS * this.cellSize;
  }

  get boardHeight(): number {
    return ROWS * this.cellSize;
  }

  /** 全量重绘棋盘 */
  render(state: GameState): void {
    const g = this.graphics;
    const cs = this.cellSize;
    const w = COLS * cs;
    const h = ROWS * cs;
    g.clear();

    // 背景
    g.fillStyle(COLORS.grid, 1);
    g.fillRect(this.x, this.y, w, h);

    // 网格线
    g.lineStyle(1, COLORS.gridLine, 1);
    for (let col = 1; col < COLS; col++) {
      g.lineBetween(this.x + col * cs, this.y, this.x + col * cs, this.y + h);
    }
    for (let row = 1; row < ROWS; row++) {
      g.lineBetween(this.x, this.y + row * cs, this.x + w, this.y + row * cs);
    }

    // 已落定的方块
    state.board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== 0) this.drawCell(c, r, cell, 1);
      });
    });

    // 幽灵块
    if (state.ghost) this.drawPiece(state.ghost, 0.22);
    // 当前活动块
    if (state.active) this.drawPiece(state.active, 1);

    // 边框
    g.lineStyle(2, COLORS.panelBorder, 1);
    g.strokeRect(this.x - 1, this.y - 1, w + 2, h + 2);
  }

  destroy(): void {
    this.graphics.destroy();
  }

  private drawCell(col: number, row: number, type: TetrominoType, alpha: number): void {
    const g = this.graphics;
    const cs = this.cellSize;
    const x = this.x + col * cs;
    const y = this.y + row * cs;
    const pal = PIECE_COLORS[type];

    // 深色描边
    g.fillStyle(pal.dark, alpha);
    g.fillRect(x + 1, y + 1, cs - 2, cs - 2);
    // 主体
    g.fillStyle(pal.base, alpha);
    g.fillRect(x + 2, y + 2, cs - 4, cs - 4);
    // 左上高光
    g.fillStyle(pal.light, alpha * 0.9);
    g.fillRect(x + 2, y + 2, cs - 4, 2);
    g.fillRect(x + 2, y + 2, 2, cs - 4);
  }

  private drawPiece(piece: Piece, alpha: number): void {
    const shape = getShape(piece.type, piece.rotation);
    for (const [ox, oy] of shape) {
      const col = piece.x + ox;
      const row = piece.y + oy;
      if (row < 0 || row >= ROWS) continue;
      if (col < 0 || col >= COLS) continue;
      this.drawCell(col, row, piece.type, alpha);
    }
  }
}
