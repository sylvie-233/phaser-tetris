import type Phaser from 'phaser';
import { COLORS, FONT_FAMILY } from '../theme';

export interface PanelOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  titleSize?: number;
  cornerRadius?: number;
  depth?: number;
}

/**
 * 圆角面板: 半透明深色底 + 可选标题文字。
 */
export class Panel {
  readonly container: Phaser.GameObjects.Container;

  private readonly background: Phaser.GameObjects.Graphics;
  private readonly title?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: PanelOptions) {
    const { x, y, width, height, title, titleSize = 14 } = options;
    const r = options.cornerRadius ?? 12;

    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.28);
    this.background.fillRoundedRect(-width / 2, -height / 2 + 2, width, height, r);
    this.background.fillStyle(COLORS.panel, 1);
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, r);
    this.background.lineStyle(1, COLORS.panelBorder, 1);
    this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, r);

    const children: Phaser.GameObjects.GameObject[] = [this.background];
    if (title) {
      this.title = scene.add
        .text(0, -height / 2 + 4, title, {
          fontFamily: FONT_FAMILY,
          fontSize: `${titleSize}px`,
          color: COLORS.textDim,
          resolution: 2,
        })
        .setOrigin(0.5, 0);
      children.push(this.title);
    }

    this.container = scene.add.container(x, y, children);
    this.container.setDepth(options.depth ?? 6);
  }

  setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  setDepth(depth: number): this {
    this.container.setDepth(depth);
    return this;
  }

  destroy(): void {
    this.container.destroy();
  }
}
