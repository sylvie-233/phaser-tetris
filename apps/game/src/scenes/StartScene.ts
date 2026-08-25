import { Scene } from 'phaser';
import type { GameObjects } from 'phaser';
import { Button, COLORS, FONT_FAMILY } from '@tetris/ui';

/** 开始场景: 标题 + 开始按钮 + 操作提示 */
export class StartScene extends Scene {
  private title!: GameObjects.Text;
  private subtitle!: GameObjects.Text;
  private hint!: GameObjects.Text;
  private startButton!: Button;

  constructor() {
    super('StartScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);

    this.title = this.add
      .text(0, 0, '俄罗斯方块', {
        fontFamily: FONT_FAMILY,
        fontSize: '54px',
        color: COLORS.text,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        resolution: 2,
      })
      .setOrigin(0.5);

    this.subtitle = this.add
      .text(0, 0, 'Phaser 4 · TypeScript', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: COLORS.textDim,
        resolution: 2,
      })
      .setOrigin(0.5);

    this.startButton = new Button(this, {
      x: 0,
      y: 0,
      width: 260,
      height: 60,
      label: '开始游戏',
      fontSize: 26,
      onPress: () => this.scene.start('GameScene'),
    });

    this.hint = this.add
      .text(0, 0, '左右移动 · 旋转 · 下键软降 · 空格硬降\n按住左右键可连续移动', {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        color: COLORS.textDim,
        align: 'center',
        lineSpacing: 8,
        resolution: 2,
      })
      .setOrigin(0.5);

    this.scale.on('resize', this.layout, this);
    this.layout();
  }

  private layout(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.title.setFontSize(Math.min(54, Math.floor(w * 0.13)));
    this.title.setPosition(w / 2, Math.floor(h * 0.26));
    this.subtitle.setPosition(w / 2, Math.floor(h * 0.26) + 58);
    this.startButton.setSize(Math.min(w * 0.72, 280), 60).setPosition(w / 2, Math.floor(h * 0.52));
    this.hint.setPosition(w / 2, Math.floor(h * 0.8));
  }

  shutdown(): void {
    this.scale.off('resize', this.layout, this);
  }
}
