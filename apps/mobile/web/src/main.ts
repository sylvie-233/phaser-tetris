import { createGame } from '@tetris/game';

// 复用 @tetris/game 的游戏实例(同渲染代码, 仅宿主容器不同)
const container = document.getElementById('app');
if (container) {
  createGame({ parent: container });
} else {
  console.warn('[tetris] 未找到 #app 容器, 游戏未启动');
}
