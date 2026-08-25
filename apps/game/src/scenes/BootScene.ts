import { Scene } from 'phaser';
import { DEFAULT_BACKGROUND } from '../config';

/** 引导场景: 后续可在此加载资源, 当前直接进入开始场景 */
export class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(DEFAULT_BACKGROUND);
    this.scene.start('StartScene');
  }
}
