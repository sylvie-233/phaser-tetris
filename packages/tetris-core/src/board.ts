import { COLS, ROWS } from './types';
import type { Board, CellValue, Piece } from './types';
import { getShape } from './tetrominoes';

/** 创建空棋盘 */
export function createBoard(rows: number = ROWS, cols: number = COLS): Board {
  return Array.from({ length: rows }, () => Array<CellValue>(cols).fill(0));
}

/** 方块所有小方块的绝对坐标 [col, row] */
export function cellsOf(piece: Piece): Array<readonly [number, number]> {
  return getShape(piece.type, piece.rotation).map(([x, y]) => [piece.x + x, piece.y + y] as const);
}

/** 检测方块是否与棋盘碰撞; y < 0(顶部隐藏区)视为空闲 */
export function collides(board: Board, piece: Piece): boolean {
  for (const [x, y] of cellsOf(piece)) {
    if (y < 0) continue;
    if (y >= board.length) return true;
    if (x < 0 || x >= board[0].length) return true;
    if (board[y][x] !== 0) return true;
  }
  return false;
}

/** 将方块写入棋盘(不可变操作, 返回新棋盘); y < 0 的格子被丢弃 */
export function mergePiece(board: Board, piece: Piece): Board {
  const next = board.map((row) => row.slice());
  for (const [x, y] of cellsOf(piece)) {
    if (y >= 0 && y < next.length && x >= 0 && x < next[0].length) {
      next[y][x] = piece.type;
    }
  }
  return next;
}

/** 找出所有完整行(绝对行号) */
export function findFullRows(board: Board): number[] {
  const rows: number[] = [];
  board.forEach((row, i) => {
    if (row.every((cell) => cell !== 0)) rows.push(i);
  });
  return rows;
}

/** 消行: 移除给定行并在顶部补空行, 返回新棋盘 */
export function clearRows(board: Board, rows: number[]): Board {
  if (rows.length === 0) return board;
  const rowSet = new Set(rows);
  const kept = board.filter((_, i) => !rowSet.has(i));
  return [...createBoard(rows.length, board[0].length), ...kept];
}

/** 方块还能下落的最大行数 */
export function dropDistance(board: Board, piece: Piece): number {
  let dist = 0;
  while (!collides(board, { ...piece, y: piece.y + dist + 1 })) dist++;
  return dist;
}
