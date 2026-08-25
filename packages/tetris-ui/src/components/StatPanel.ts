import type Phaser from 'phaser';
import { COLORS, FONT_FAMILY } from '../theme';

export interface StatEntry {
  key: string;
  label: string;
}

export interface StatPanelOptions {
  x: number;
  y: number;
  entries: StatEntry[];
  /** 每个条目垂直间距 */
  gap?: number;
  labelSize?: number;
  valueSize?: number;
  depth?: number;
}

/**
 * 竖直排布的「标签 + 数值」统计面板(分数/等级/行数等)。
 */
export class StatPanel {
  readonly container: Phaser.GameObjects.Container;

  private readonly entries = new Map<string, Phaser.GameObjects.Text>();
  private readonly labelSize: number;
  private readonly valueSize: number;

  constructor(scene: Phaser.Scene, options: StatPanelOptions) {
    const { x, y, entries, gap = 26 } = options;
    this.labelSize = options.labelSize ?? 12;
    this.valueSize = options.valueSize ?? 24;

    const children: Phaser.GameObjects.GameObject[] = [];
    entries.forEach((entry, i) => {
      const cy = i * gap;
      const label = scene.add
        .text(0, cy - 8, entry.label, {
          fontFamily: FONT_FAMILY,
          fontSize: `${this.labelSize}px`,
          color: COLORS.textDim,
          resolution: 2,
        })
        .setOrigin(0.5);
      const value = scene.add
        .text(0, cy + 8, '0', {
          fontFamily: FONT_FAMILY,
          fontSize: `${this.valueSize}px`,
          color: COLORS.text,
          fontStyle: 'bold',
          resolution: 2,
        })
        .setOrigin(0.5);
      this.entries.set(entry.key, value);
      children.push(label, value);
    });

    this.container = scene.add.container(x, y, children);
    this.container.setDepth(options.depth ?? 8);
  }

  setValue(key: string, value: string | number): this {
    const text = this.entries.get(key);
    if (text) text.setText(String(value));
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
