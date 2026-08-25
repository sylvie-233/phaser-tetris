import { createGame } from './index';

const container = document.getElementById('app');
if (container) {
  createGame({ parent: container });
} else {
  console.warn('[tetris] 未找到 #app 容器, 游戏未启动');
}
