import { Scene } from 'phaser';
import type { GameObjects, Time } from 'phaser';
import type { FinalStats } from '@tetris/core';
import { COLS, ROWS, GameEngine, speedForLevel } from '@tetris/core';
import {
  BoardRenderer,
  Button,
  COLORS,
  FONT_FAMILY,
  Panel,
  PiecePreview,
  StatPanel,
} from '@tetris/ui';

interface ControlSpec {
  key: string;
  label: string;
  action: () => void;
  /** 是否需要按住连发 */
  repeat?: boolean;
}

/** 控制区按钮在 4×2 网格中的排布(行优先) */
const CONTROL_ORDER: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
];

const CONTROL_SPECS: readonly ControlSpec[] = [
  { key: 'left', label: '◀', action: () => {}, repeat: true },
  { key: 'rotate', label: '↻', action: () => {} },
  { key: 'right', label: '▶', action: () => {}, repeat: true },
  { key: 'hardDrop', label: '⏬', action: () => {} },
  { key: 'hold', label: '存', action: () => {} },
  { key: 'softDrop', label: '▼', action: () => {}, repeat: true },
  { key: 'rotateCCW', label: '↺', action: () => {} },
  { key: 'pause', label: '⏸', action: () => {} },
];

/**
 * 游戏主场景: 上为棋盘与 HUD, 下为触控操作区。
 * 支持触控(按住连发)与键盘两种输入。
 */
export class GameScene extends Scene {
  private engine!: GameEngine;

  private boardRenderer!: BoardRenderer;
  private holdPreview!: PiecePreview;
  private nextPreview!: PiecePreview;
  private holdPanel!: Panel;
  private nextPanel!: Panel;
  private stats!: StatPanel;
  private comboText!: GameObjects.Text;

  private controls: Array<{ key: string; button: Button }> = [];
  private buttons = new Map<string, Button>();

  // 暂停遮罩
  private overlayDim!: GameObjects.Rectangle;
  private overlayTitle!: GameObjects.Text;
  private resumeButton!: Button;
  private menuButton!: Button;

  // 布局缓存(消行动画等需要)
  private boardX = 0;
  private boardY = 0;
  private cellSize = 24;

  private gravityTimer: Time.TimerEvent | null = null;
  private repeatTimer: Time.TimerEvent | null = null;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.engine = new GameEngine({
      onChange: () => this.renderState(),
      onLinesCleared: (rows) => this.flashRows(rows),
      onGameOver: (stats: FinalStats) => {
        // 稍作停顿让玩家看到终局, 再进入结算
        this.time.delayedCall(500, () => this.scene.start('GameOverScene', stats));
      },
    });

    this.boardRenderer = new BoardRenderer(this, { x: 0, y: 0, cellSize: 24, depth: 5 });
    this.holdPreview = new PiecePreview(this, { x: 0, y: 0, cellSize: 10, depth: 7 });
    this.nextPreview = new PiecePreview(this, { x: 0, y: 0, cellSize: 10, depth: 7 });

    this.stats = new StatPanel(this, {
      x: 0,
      y: 0,
      entries: [
        { key: 'score', label: '分数' },
        { key: 'lines', label: '行数' },
        { key: 'level', label: '等级' },
      ],
      gap: 22,
      depth: 8,
    });

    this.holdPanel = new Panel(this, {
      x: 0,
      y: 0,
      width: 92,
      height: 78,
      title: '暂存',
      depth: 6,
    });
    this.nextPanel = new Panel(this, {
      x: 0,
      y: 0,
      width: 92,
      height: 78,
      title: '下一个',
      depth: 6,
    });

    this.comboText = this.add
      .text(0, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#ffd400',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
        resolution: 2,
      })
      .setOrigin(1, 0.5)
      .setDepth(9)
      .setVisible(false);

    this.createControls();
    this.createPauseOverlay();

    this.scale.on('resize', this.layout, this);
    this.input.keyboard?.on('keydown', this.onKeyDown, this);

    this.layout();
    this.engine.start();
    this.scheduleGravity();
  }

  // ---------- 输入 ----------

  private createControls(): void {
    // 动作在 create 时挂到引擎实例上
    const actions: Record<string, () => void> = {
      left: () => this.engine.moveLeft(),
      right: () => this.engine.moveRight(),
      softDrop: () => this.engine.softDrop(),
      hardDrop: () => this.engine.hardDrop(),
      rotate: () => this.engine.rotateCW(),
      rotateCCW: () => this.engine.rotateCCW(),
      hold: () => this.engine.hold(),
      pause: () => this.togglePause(),
    };

    for (const spec of CONTROL_SPECS) {
      const action = actions[spec.key];
      const button = new Button(this, {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        label: spec.label,
        fontSize: 30,
        fillColor: COLORS.panel,
        fillColorPressed: COLORS.panelBorder,
        fireOnDown: true,
        depth: 12,
        onDown: spec.repeat ? () => this.startRepeat(action) : action,
        onUp: spec.repeat ? () => this.stopRepeat() : undefined,
      });
      this.buttons.set(spec.key, button);
      this.controls.push({ key: spec.key, button });
    }
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        event.preventDefault();
        this.engine.moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        event.preventDefault();
        this.engine.moveRight();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        event.preventDefault();
        this.engine.softDrop();
        break;
      case 'ArrowUp':
      case 'x':
      case 'X':
        event.preventDefault();
        this.engine.rotateCW();
        break;
      case ' ':
        event.preventDefault();
        this.engine.hardDrop();
        break;
      case 'z':
      case 'Z':
        this.engine.rotateCCW();
        break;
      case 'c':
      case 'C':
        this.engine.hold();
        break;
      case 'p':
      case 'P':
        this.togglePause();
        break;
    }
  };

  /** 按住连发: 先立即触发一次, 短暂停顿后每 55ms 触发 */
  private startRepeat(action: () => void): void {
    this.stopRepeat();
    action();
    this.repeatTimer = this.time.delayedCall(160, () => {
      this.repeatTimer = this.time.addEvent({ delay: 55, loop: true, callback: action });
    });
  }

  private stopRepeat(): void {
    if (this.repeatTimer) {
      this.repeatTimer.remove();
      this.repeatTimer = null;
    }
  }

  // ---------- 暂停 ----------

  private createPauseOverlay(): void {
    this.overlayDim = this.add
      .rectangle(0, 0, 1, 1, 0x000000, 0.65)
      .setOrigin(0, 0)
      .setDepth(40);

    this.overlayTitle = this.add
      .text(0, 0, '已暂停', {
        fontFamily: FONT_FAMILY,
        fontSize: '44px',
        color: COLORS.text,
        fontStyle: 'bold',
        resolution: 2,
      })
      .setOrigin(0.5)
      .setDepth(41);

    this.resumeButton = new Button(this, {
      x: 0,
      y: 0,
      width: 220,
      height: 56,
      label: '继续游戏',
      fontSize: 22,
      depth: 42,
      onPress: () => this.togglePause(),
    });

    this.menuButton = new Button(this, {
      x: 0,
      y: 0,
      width: 220,
      height: 56,
      label: '返回主页',
      fontSize: 22,
      fillColor: COLORS.danger,
      fillColorPressed: 0xc0392b,
      depth: 42,
      onPress: () => {
        this.engine.pause();
        this.scene.start('StartScene');
      },
    });

    this.setPauseOverlayVisible(false);
  }

  private setPauseOverlayVisible(show: boolean): void {
    this.overlayDim.setVisible(show);
    this.overlayTitle.setVisible(show);
    this.resumeButton.container.setVisible(show);
    this.resumeButton.setEnabled(show);
    this.menuButton.container.setVisible(show);
    this.menuButton.setEnabled(show);
  }

  private togglePause(): void {
    const status = this.engine.getState().status;
    if (status === 'playing') {
      this.engine.pause();
      this.stopGravity();
      this.setPauseOverlayVisible(true);
    } else if (status === 'paused') {
      this.engine.resume();
      this.setPauseOverlayVisible(false);
      this.scheduleGravity();
    }
  }

  // ---------- 布局 ----------

  private layout(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const margin = Math.max(8, Math.floor(w * 0.025));

    // 底部操作区与顶部 HUD 高度
    const controlsH = Math.min(190, Math.floor(h * 0.3));
    const hudH = Math.min(110, Math.floor(h * 0.16));

    // 棋盘: 优先撑满剩余高度, 同时不超宽
    const availH = h - controlsH - hudH - margin * 2;
    this.cellSize = Math.max(12, Math.floor(Math.min((w - margin * 2) / COLS, availH / ROWS)));
    const boardW = COLS * this.cellSize;
    const boardH = ROWS * this.cellSize;
    this.boardX = Math.round((w - boardW) / 2);
    this.boardY = Math.round(hudH + margin + (availH - boardH) / 2);
    this.boardRenderer.setPosition(this.boardX, this.boardY).setCellSize(this.cellSize);

    // 顶栏: 左侧暂存 / 中间统计 / 右侧下一个
    const sideW = Math.max(72, Math.floor(this.cellSize * 3));
    const hudPad = Math.max(margin, Math.floor(w * 0.035));
    const hudCY = Math.round(hudH / 2);
    const previewCell = Math.max(6, Math.floor(this.cellSize * 0.72));

    this.holdPanel.setPosition(hudPad + sideW / 2, hudCY);
    this.holdPreview.setPosition(hudPad + sideW / 2, hudCY + 10).setCellSize(previewCell);
    this.nextPanel.setPosition(w - hudPad - sideW / 2, hudCY);
    this.nextPreview.setPosition(w - hudPad - sideW / 2, hudCY + 10).setCellSize(previewCell);

    this.stats.setPosition(w / 2, hudCY);

    // 连击提示: 棋盘右侧边缘
    this.comboText.setPosition(w - hudPad, this.boardY + boardH / 2);

    // 底部操作区
    const gap = Math.max(8, Math.floor(w * 0.015));
    const btnW = Math.floor((w - hudPad * 2 - gap * 3) / 4);
    const btnH = Math.floor((controlsH - 12 - gap) / 2);
    const ox = hudPad + btnW / 2;
    const oy = h - controlsH + 6 + btnH / 2;

    this.controls.forEach(({ button }, i) => {
      const [cx, cy] = CONTROL_ORDER[i];
      button.setSize(btnW, btnH).setPosition(ox + cx * (btnW + gap), oy + cy * (btnH + gap));
    });

    // 暂停遮罩
    this.overlayDim.setPosition(0, 0).setSize(w, h);
    this.overlayTitle.setPosition(w / 2, Math.floor(h * 0.36));
    this.resumeButton.setPosition(w / 2, Math.floor(h * 0.5));
    this.menuButton.setPosition(w / 2, Math.floor(h * 0.5) + 76);
  }

  // ---------- 渲染 ----------

  private renderState(): void {
    const s = this.engine.getState();
    this.boardRenderer.render(s);

    this.stats.setValue('score', s.score).setValue('lines', s.lines).setValue('level', s.level);

    this.holdPreview.render(s.hold);
    this.nextPreview.render(s.queue[0] ?? null);
    this.buttons.get('hold')?.setEnabled(s.canHold);

    const showCombo = s.combo >= 2 && s.status === 'playing';
    this.comboText.setVisible(showCombo);
    if (showCombo) this.comboText.setText(`${s.combo} 连击`);
  }

  private flashRows(rows: number[]): void {
    const cs = this.cellSize;
    const g = this.add.graphics().setDepth(6);
    g.fillStyle(0xffffff, 1);
    for (const row of rows) {
      g.fillRect(this.boardX, this.boardY + row * cs, COLS * cs, cs);
    }
    this.tweens.add({
      targets: g,
      alpha: 0,
      duration: 240,
      ease: 'Quad.easeOut',
      onComplete: () => g.destroy(),
    });
  }

  // ---------- 重力 ----------

  private scheduleGravity(): void {
    this.stopGravity();
    const state = this.engine.getState();
    if (state.status !== 'playing') return;
    const delay = speedForLevel(state.level);
    this.gravityTimer = this.time.delayedCall(delay, () => {
      this.gravityTimer = null;
      this.engine.tick();
      this.scheduleGravity();
    });
  }

  private stopGravity(): void {
    if (this.gravityTimer) {
      this.gravityTimer.remove();
      this.gravityTimer = null;
    }
  }

  shutdown(): void {
    this.scale.off('resize', this.layout, this);
    this.input.keyboard?.off('keydown', this.onKeyDown, this);
    this.stopGravity();
    this.stopRepeat();
  }
}
