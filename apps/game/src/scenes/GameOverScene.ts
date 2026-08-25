import { Scene } from 'phaser';
import type { GameObjects } from 'phaser';
import type { FinalStats } from '@tetris/core';
import { Button, COLORS, FONT_FAMILY, StatPanel } from '@tetris/ui';

/** 结束场景: 展示本局成绩, 提供重开/返回主页 */
export class GameOverScene extends Scene {
  private stats: FinalStats = { score: 0, lines: 0, level: 1 };
  private title!: GameObjects.Text;
  private statPanel!: StatPanel;
  private restartButton!: Button;
  private menuButton!: Button;

  constructor() {
    super('GameOverScene');
  }

  init(data: Partial<FinalStats>): void {
    this.stats = { score: 0, lines: 0, level: 1, ...data };
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);

    this.title = this.add
      .text(0, 0, '游戏结束', {
        fontFamily: FONT_FAMILY,
        fontSize: '48px',
        color: '#ff6b6b',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        resolution: 2,
      })
      .setOrigin(0.5);

    this.statPanel = new StatPanel(this, {
      x: 0,
      y: 0,
      entries: [
        { key: 'score', label: '分数' },
        { key: 'lines', label: '消除行数' },
        { key: 'level', label: '到达等级' },
      ],
      gap: 30,
      depth: 8,
    });
    this.statPanel
      .setValue('score', this.stats.score)
      .setValue('lines', this.stats.lines)
      .setValue('level', this.stats.level);

    this.restartButton = new Button(this, {
      x: 0,
      y: 0,
      width: 260,
      height: 56,
      label: '再来一局',
      fontSize: 22,
      onPress: () => this.scene.start('GameScene'),
    });

    this.menuButton = new Button(this, {
      x: 0,
      y: 0,
      width: 260,
      height: 56,
      label: '返回主页',
      fontSize: 22,
      fillColor: COLORS.panel,
      fillColorPressed: COLORS.panelBorder,
      onPress: () => this.scene.start('StartScene'),
    });

    this.scale.on('resize', this.layout, this);
    this.layout();
  }

  private layout(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.title.setFontSize(Math.min(48, Math.floor(w * 0.12)));
    this.title.setPosition(w / 2, Math.floor(h * 0.24));
    this.statPanel.setPosition(w / 2, Math.floor(h * 0.5));
    const btnW = Math.min(w * 0.72, 280);
    this.restartButton.setSize(btnW, 56).setPosition(w / 2, Math.floor(h * 0.68));
    this.menuButton.setSize(btnW, 56).setPosition(w / 2, Math.floor(h * 0.68) + 72);
  }

  shutdown(): void {
    this.scale.off('resize', this.layout, this);
  }
}
