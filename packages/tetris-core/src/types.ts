/** 可见棋盘宽(列数) */
export const COLS = 10;
/** 可见棋盘高(行数) */
export const ROWS = 20;

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Rotation = 0 | 1 | 2 | 3;

/** 0 = 空格, 否则为方块类型 */
export type CellValue = 0 | TetrominoType;

/** 棋盘, board[row][col], row 0 为最顶可见行 */
export type Board = CellValue[][];

export interface Piece {
  type: TetrominoType;
  rotation: Rotation;
  /** 包围盒左上角所在的列 */
  x: number;
  /** 包围盒左上角所在的行(可为负, 表示位于视野上方) */
  y: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'over';

export interface GameState {
  status: GameStatus;
  board: Board;
  active: Piece | null;
  ghost: Piece | null;
  hold: TetrominoType | null;
  canHold: boolean;
  queue: TetrominoType[];
  score: number;
  lines: number;
  level: number;
  combo: number;
}

export interface FinalStats {
  score: number;
  lines: number;
  level: number;
}

export interface EngineOptions {
  /** 每次状态变更后回调 */
  onChange?: (state: GameState) => void;
  /** 消行后回调(绝对行号) */
  onLinesCleared?: (rows: number[]) => void;
  /** 游戏结束回调 */
  onGameOver?: (stats: FinalStats) => void;
  /** 注入随机源, 便于测试 */
  random?: () => number;
}
