import type { TetrominoType } from '@tetris/core';

/** 中文字体栈, 覆盖主流移动端与桌面系统 */
export const FONT_FAMILY =
  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif';

export const COLORS = {
  background: 0x0f0f1a,
  panel: 0x1b1b2c,
  panelBorder: 0x34344d,
  grid: 0x20203a,
  gridLine: 0x2a2a46,
  ghost: 0xffffff,
  accent: 0x7c5cff,
  accentDark: 0x5940cc,
  danger: 0xe74c3c,
  success: 0x2ecc71,
  text: '#eceaf6',
  textDim: '#9a98b0',
} as const;

export interface PiecePalette {
  base: number;
  dark: number;
  light: number;
}

/** 每种方块的配色(base 主体 / dark 描边 / light 高光) */
export const PIECE_COLORS: Record<TetrominoType, PiecePalette> = {
  I: { base: 0x00d2ff, dark: 0x0096b8, light: 0x8ceaff },
  O: { base: 0xffd400, dark: 0xb89600, light: 0xffe97a },
  T: { base: 0xb256e8, dark: 0x7d3aa8, light: 0xdda3f5 },
  S: { base: 0x2ecc71, dark: 0x1f9d52, light: 0x84e8ad },
  Z: { base: 0xe74c3c, dark: 0xa83529, light: 0xf59d92 },
  J: { base: 0x2e86de, dark: 0x1f5fa0, light: 0x7eb1f0 },
  L: { base: 0xff8c00, dark: 0xb56400, light: 0xffc266 },
};
