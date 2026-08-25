# 俄罗斯方块 · Phaser 4 + TypeScript

基于 **TypeScript + Phaser 4** 的网页版俄罗斯方块游戏，使用 **pnpm monorepo** 组织，核心逻辑与渲染解耦，便于复用与测试。

## 技术栈

- 游戏框架：Phaser 4
- 编程语言：TypeScript(strict, ES2022)
- 项目结构：pnpm monorepo + Turborepo 2
- 前端构建：Vite 7
- 移动端：Capacitor(仅 Android)

## Monorepo 结构

```
apps/
├── game/        # @tetris/game     Web 游戏(Vite + Phaser 4)
└── mobile/      # @tetris/mobile   Capacitor 移动壳(Android)
packages/
├── tetris-core/  # @tetris/core     纯游戏逻辑(不依赖 Phaser)
└── tetris-ui/    # @tetris/ui       Phaser UI 组件库
```

注意：**目录名与包名不一致**(tetris-core → `@tetris/core`，tetris-ui → `@tetris/ui`)，依赖时以包名为准。

内部包直接以源码形式被消费：`main` / `exports` 指向 `./src/index.ts`，**没有独立构建步骤**，由 Vite 直接编译。新增内部包时沿用此约定即可。

## 常用命令

```bash
pnpm install       # 安装依赖(根目录执行)
pnpm dev           # 开发:Vite dev server(localhost:5173)
pnpm build         # 全仓生产构建(turbo)
pnpm format:check  # 校验格式
```

## 界面要求

适配手机界面（因为游戏是运行在移动端的浏览器或者app上的），上面为游戏界面，下面为操作按钮
有开始场景和结束场景

## 架构约定

## 开发注意事项

- **包管理器**：使用 pnpm(`onlyBuiltDependencies` 含 esbuild等)，Node ≥ 22(代码用到 `import.meta.dirname`)。
