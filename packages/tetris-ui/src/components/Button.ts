import type Phaser from 'phaser';
import { COLORS, FONT_FAMILY } from '../theme';

export interface ButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  fontSize?: number;
  fillColor?: number;
  fillColorPressed?: number;
  labelColor?: string;
  cornerRadius?: number;
  depth?: number;
  /** 按下即触发 onPress(适合游戏操作键); 默认松开时触发 */
  fireOnDown?: boolean;
  onPress?: () => void;
  /** 按下/松开回调(用于实现按住连发) */
  onDown?: () => void;
  onUp?: () => void;
}

/**
 * 移动端友好的圆角按钮: 自带点击高亮、按压缩放与触控区域。
 */
export class Button {
  readonly container: Phaser.GameObjects.Container;

  private readonly background: Phaser.GameObjects.Graphics;
  private readonly hitArea: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly options: ButtonOptions;

  private enabled = true;
  private isDown = false;

  constructor(scene: Phaser.Scene, options: ButtonOptions) {
    this.options = options;
    const { x, y, width, height } = options;

    this.background = scene.add.graphics();
    this.hitArea = scene.add
      .rectangle(x, y, width, height, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    this.label = scene.add
      .text(x, y, options.label, {
        fontFamily: FONT_FAMILY,
        fontSize: `${options.fontSize ?? Math.max(14, Math.floor(height * 0.4))}px`,
        color: options.labelColor ?? '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        resolution: 2,
      })
      .setOrigin(0.5);

    this.container = scene.add.container(x, y, [this.background, this.hitArea, this.label]);
    this.container.setDepth(options.depth ?? 10);

    this.hitArea.on('pointerdown', this.onPointerDown, this);
    this.hitArea.on('pointerup', this.onPointerUp, this);
    this.hitArea.on('pointerout', this.onPointerOut, this);

    this.redraw();
  }

  private redraw(): void {
    const o = this.options;
    const w = o.width;
    const h = o.height;
    const r = o.cornerRadius ?? Math.min(14, Math.floor(h / 3));
    const g = this.background;

    const fill = this.isDown
      ? (o.fillColorPressed ?? COLORS.accentDark)
      : (o.fillColor ?? COLORS.accent);
    const alpha = this.enabled ? 1 : 0.45;

    g.clear();
    // 底部投影
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + 3, w, h, r);
    // 主体
    g.fillStyle(fill, alpha);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    // 顶部高光
    g.fillStyle(0xffffff, this.enabled ? 0.12 : 0.06);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, Math.max(2, Math.floor(h * 0.26)), r);
  }

  private onPointerDown(): void {
    if (!this.enabled) return;
    this.isDown = true;
    this.redraw();
    this.container.setScale(0.94);
    this.options.onDown?.();
    if (this.options.fireOnDown) this.options.onPress?.();
  }

  private onPointerUp(): void {
    if (!this.enabled) return;
    this.isDown = false;
    this.redraw();
    this.container.setScale(1);
    this.options.onUp?.();
    if (!this.options.fireOnDown) this.options.onPress?.();
  }

  private onPointerOut(): void {
    this.isDown = false;
    this.redraw();
    this.container.setScale(1);
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.hitArea.disableInteractive();
    if (enabled) {
      this.hitArea.setInteractive({ useHandCursor: true });
    }
    this.redraw();
    return this;
  }

  setLabel(label: string): this {
    this.label.setText(label);
    return this;
  }

  setSize(width: number, height: number): this {
    this.options.width = width;
    this.options.height = height;
    this.hitArea.setSize(width, height);
    this.redraw();
    return this;
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
