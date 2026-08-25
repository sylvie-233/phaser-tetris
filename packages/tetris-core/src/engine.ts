import type {
  Board,
  EngineOptions,
  FinalStats,
  GameState,
  Piece,
  Rotation,
  TetrominoType,
} from './types';
import { getKicks } from './tetrominoes';
import {
  cellsOf,
  clearRows,
  collides,
  createBoard,
  dropDistance,
  findFullRows,
  mergePiece,
} from './board';
import { SevenBag } from './randomizer';
import {
  COMBO_POINTS,
  HARD_DROP_POINTS,
  LINE_SCORES,
  SOFT_DROP_POINTS,
  levelForLines,
} from './score';

/** 新方块出生时包围盒左上角的列 / 行 */
export const SPAWN_X = 3;
export const SPAWN_Y = 0;
/** 预览队列展示数量 */
export const QUEUE_PREVIEW = 3;

function makePiece(type: TetrominoType): Piece {
  return { type, rotation: 0, x: SPAWN_X, y: SPAWN_Y };
}

/**
 * 俄罗斯方块游戏引擎: 纯逻辑, 不依赖任何渲染层。
 * 通过 onChange / onLinesCleared / onGameOver 回调通知外部。
 */
export class GameEngine {
  private board: Board = createBoard();
  private active: Piece | null = null;
  private heldPiece: TetrominoType | null = null;
  private canHold = true;
  private bag: SevenBag;
  private score = 0;
  private lines = 0;
  private level = 1;
  private combo = 0;
  private status: GameState['status'] = 'idle';
  private backToBack = false;

  private random: () => number;
  private onChange?: (state: GameState) => void;
  private onLinesCleared?: (rows: number[]) => void;
  private onGameOver?: (stats: FinalStats) => void;

  constructor(options: EngineOptions = {}) {
    this.random = options.random ?? Math.random;
    this.bag = new SevenBag(this.random);
    this.onChange = options.onChange;
    this.onLinesCleared = options.onLinesCleared;
    this.onGameOver = options.onGameOver;
  }

  getState(): GameState {
    return {
      status: this.status,
      board: this.board.map((row) => row.slice()),
      active: this.active ? { ...this.active } : null,
      ghost: this.ghostPiece(),
      hold: this.heldPiece,
      canHold: this.canHold,
      queue: this.bag.peek(QUEUE_PREVIEW),
      score: this.score,
      lines: this.lines,
      level: this.level,
      combo: this.combo,
    };
  }

  private emit(): void {
    this.onChange?.(this.getState());
  }

  private ghostPiece(): Piece | null {
    if (!this.active) return null;
    const ghost: Piece = { ...this.active };
    ghost.y += dropDistance(this.board, ghost);
    return ghost;
  }

  private spawn(): void {
    const piece = makePiece(this.bag.next());
    this.active = piece;
    this.canHold = true;
    if (collides(this.board, piece)) {
      this.gameOver();
      return;
    }
  }

  private lock(): void {
    if (!this.active) return;
    const piece = this.active;

    // 顶出判定: 方块落点越过视野顶部
    if (cellsOf(piece).some(([, y]) => y < 0)) {
      this.gameOver();
      return;
    }

    this.board = mergePiece(this.board, piece);
    this.active = null;

    const fullRows = findFullRows(this.board);
    let points = 0;
    if (fullRows.length > 0) {
      this.combo += 1;
      let gained = LINE_SCORES[fullRows.length] * this.level;
      if (fullRows.length === 4) {
        if (this.backToBack) gained = Math.floor(gained * 1.5);
        this.backToBack = true;
      } else {
        this.backToBack = false;
      }
      gained += COMBO_POINTS * this.combo * this.level;
      points += gained;

      this.board = clearRows(this.board, fullRows);
      this.lines += fullRows.length;
      this.level = levelForLines(this.lines);
      this.onLinesCleared?.(fullRows);
    } else {
      this.combo = 0;
    }

    this.score += points;
    this.spawn();
  }

  private gameOver(): void {
    this.status = 'over';
    this.onGameOver?.({ score: this.score, lines: this.lines, level: this.level });
  }

  start(): void {
    this.board = createBoard();
    this.active = null;
    this.heldPiece = null;
    this.canHold = true;
    this.bag = new SevenBag(this.random);
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = 0;
    this.backToBack = false;
    this.status = 'playing';
    this.spawn();
    this.emit();
  }

  pause(): void {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    this.emit();
  }

  resume(): void {
    if (this.status !== 'paused') return;
    this.status = 'playing';
    this.emit();
  }

  moveLeft(): void {
    if (this.status !== 'playing' || !this.active) return;
    const candidate: Piece = { ...this.active, x: this.active.x - 1 };
    if (!collides(this.board, candidate)) this.active = candidate;
    this.emit();
  }

  moveRight(): void {
    if (this.status !== 'playing' || !this.active) return;
    const candidate: Piece = { ...this.active, x: this.active.x + 1 };
    if (!collides(this.board, candidate)) this.active = candidate;
    this.emit();
  }

  /** 软降一格, 返回获得的分数; 无法下落则锁定 */
  softDrop(): number {
    if (this.status !== 'playing' || !this.active) return 0;
    const candidate: Piece = { ...this.active, y: this.active.y + 1 };
    if (!collides(this.board, candidate)) {
      this.active = candidate;
      this.score += SOFT_DROP_POINTS;
      this.emit();
      return SOFT_DROP_POINTS;
    }
    this.lock();
    this.emit();
    return 0;
  }

  /** 硬降到底, 返回获得的分数 */
  hardDrop(): number {
    if (this.status !== 'playing' || !this.active) return 0;
    const dist = dropDistance(this.board, this.active);
    this.score += dist * HARD_DROP_POINTS;
    this.active = { ...this.active, y: this.active.y + dist };
    this.lock();
    this.emit();
    return dist * HARD_DROP_POINTS;
  }

  rotateCW(): void {
    this.rotate(1);
  }

  rotateCCW(): void {
    this.rotate(-1);
  }

  private rotate(dir: 1 | -1): void {
    if (this.status !== 'playing' || !this.active) return;
    const from = this.active.rotation;
    const to = ((((from + dir) % 4) + 4) % 4) as Rotation;
    for (const [dx, dy] of getKicks(this.active.type, from, to)) {
      const candidate: Piece = {
        ...this.active,
        rotation: to,
        x: this.active.x + dx,
        y: this.active.y + dy,
      };
      if (!collides(this.board, candidate)) {
        this.active = candidate;
        break;
      }
    }
    this.emit();
  }

  /** 暂存(换手), 每块只允许一次 */
  hold(): void {
    if (this.status !== 'playing' || !this.active || !this.canHold) return;
    const current = this.active.type;
    this.active = this.heldPiece ? makePiece(this.heldPiece) : makePiece(this.bag.next());
    this.heldPiece = current;
    this.canHold = false;
    if (collides(this.board, this.active)) {
      this.gameOver();
      return;
    }
    this.emit();
  }

  /** 重力步进: 下落一格, 无法下落则锁定 */
  tick(): void {
    if (this.status !== 'playing' || !this.active) return;
    const candidate: Piece = { ...this.active, y: this.active.y + 1 };
    if (!collides(this.board, candidate)) {
      this.active = candidate;
    } else {
      this.lock();
    }
    this.emit();
  }
}
