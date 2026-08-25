import { AUTO, Game, Scale } from 'phaser';
import { DEFAULT_BACKGROUND } from './config';
import { BootScene } from './scenes/BootScene';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export interface CreateGameOptions {
  parent?: string | HTMLElement;
  backgroundColor?: string;
}

/**
 * 创建俄罗斯方块 Phaser 游戏实例。
 * 供 apps/game 自身与 apps/mobile 复用。
 */
export function createGame(options: CreateGameOptions = {}): Game {
  return new Game({
    type: AUTO,
    parent: options.parent ?? 'app',
    backgroundColor: options.backgroundColor ?? DEFAULT_BACKGROUND,
    scale: {
      mode: Scale.RESIZE,
      width: '100%',
      height: '100%',
      autoCenter: Scale.CENTER_BOTH,
    },
    scene: [BootScene, StartScene, GameScene, GameOverScene],
  });
}

export { DEFAULT_BACKGROUND } from './config';
export { BootScene, StartScene, GameScene, GameOverScene };
