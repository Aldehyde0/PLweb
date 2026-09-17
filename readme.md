# how to learn AI · 个人学习知识库

从直觉、原理、代码到练习，系统学习人工智能、机器学习、深度学习与强化学习。

学习数据（学习状态、笔记、收藏、计划）**只保存在当前浏览器**，不涉及登录、数据库或云同步。

技术栈：React 19 · TypeScript · vinext（Next.js API on Vite）· Cloudflare Workers。

---

## 运行方法

在项目根目录（即本仓库的克隆位置）执行：

```bash
npm ci            # 按 package-lock.json 可复现安装
npm run dev       # 开发服务器
```

开发服务器启动后，在浏览器打开：<http://localhost:3000>。

如果终端提示已有 vinext 服务、但该地址无法访问，请确认没有残留 Node.js 开发进程后，
删除 `.vinext/dev/lock.json`，再重新运行 `npm run dev`。

## 可重复的命令

| 命令 | 作用 |
| --- | --- |
| `npm ci` | 依据 `package-lock.json` 严格安装（验证依赖可复现） |
| `npm run dev` | 开发服务器（含 HMR） |
| `npm test` | Node 内置测试运行器，`tests/*.test.ts` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | oxlint（0 error / 0 warning 为通过标准） |
| `npm run build` | 生成 `dist/`（server + client），并先生成 KaTeX 字体样式 |
| `npm start` | 用 `wrangler dev` 在本地 Workers 运行时跑**构建产物** |
| `npm run preview` | `build` + `start` 一步完成 |
| `npm run deploy:dry-run` | 构建后只做 dry-run，不发布（发布前检查用） |
| `npm run deploy` | `build` + `wrangler deploy` 发布到现有 Worker `plweb` |
| `npm run deployments` | 查看 `plweb` 的部署历史（拿到可回滚的 version id） |
| `npm run rollback` | 回滚到上一个部署（交互式选择） |
| `npm run generate:katex-fonts` | 从 `katex/dist/katex.min.css` 重新生成 `app/katex-fonts.css` |
| `node --experimental-strip-types scripts/verify-browser.ts <url>` | 用本机 Chrome 做真实浏览器验收（见下） |

## 部署到 Cloudflare Workers

目标平台是 **Cloudflare Workers**（不是 Pages，也不是静态托管）。

线上对应关系（已核对）：

| 项目 | 值 |
| --- | --- |
| Worker 名 | `plweb` |
| 自定义域 | `https://ruliks.org` |
| 账号内 Worker 数量 | 仅 `plweb`（不存在第二个同名或近似名的 Worker） |
| 发布命令 | `npm run deploy` |

Worker 名来自 `package.json` 的 `name` 字段，由 `@cloudflare/vite-plugin` 生成到
`dist/server/wrangler.json`；改名字要改源文件后重新构建，不要手改 `dist`。

### 1. 认证与账号

```bash
npx wrangler login            # 交互式，推荐本地使用
# 或在 CI 中设置 CLOUDFLARE_API_TOKEN（Edit Cloudflare Workers 模板）
# 以及 CLOUDFLARE_ACCOUNT_ID
```

仓库中**没有**硬编码任何账号、域名或资源 ID。`.openai/hosting.json` 中的 D1/R2 均为
`null`，因此 `vite.config.ts` 生成的 Worker 配置不含任何数据库或存储绑定。

### 2. 配置分享域名（可选但推荐）

`metadataBase`、`og:image` 等分享元数据按以下优先级解析，**不会**写死任何历史域名：

1. 构建时环境变量 `SITE_ORIGIN`（例如 `https://learn.example.com`）；
2. 未设置时使用请求实际到达的域名（读取 `x-forwarded-host` / `x-forwarded-proto`）。

```bash
# bash / zsh
SITE_ORIGIN=https://your-domain.example npm run build
```

```powershell
# Windows PowerShell
$env:SITE_ORIGIN='https://your-domain.example'; npm run build
```

### 3. 构建与本地生产预览

```bash
npm run preview
# 等价于：
# npm run build
# npx wrangler dev --config dist/server/wrangler.json
```

`dist/server/wrangler.json` 由 `@cloudflare/vite-plugin` 依据 `vite.config.ts` 在构建时生成。
**不要手工修改 `dist` 中的配置**：请改源文件后重新构建。

### 4. 发布

```bash
npm run deploy:dry-run        # 先看将要上传的内容，不发布
npm run deploy                # 发布到 Worker plweb；ruliks.org 立即生效
```

发布后先用 `npm run deployments` 记下本次 version id，便于回滚：

```bash
npm run deployments           # 列出部署历史
npm run rollback              # 回滚到上一个部署
```

> 不要部署到 `dist` 里可能残留的其它 Worker 名。发布前请确认
> `node -e "console.log(require('./dist/server/wrangler.json').name)"` 输出为 `plweb`；
> 若输出其它名字，说明 `package.json` 的 `name` 被改过，应先改回再构建。

### 关于 Sites 插件

`@openai/sites-vite-plugin` 只提供两件事：开发服务器上的 Sites 本地登录中间件，以及把
`.openai/hosting.json` 复制到 `dist/.openai`。二者都不参与 Worker 运行，也不被应用读取。
为了让独立 Workers 构建不依赖该服务，`vite.config.ts` 默认**不注册**该插件；
需要回到 Sites 流水线时设置 `SITES_PLUGIN=1` 即可恢复：

```bash
SITES_PLUGIN=1 npm run build
```

---

## 浏览器验收

`scripts/verify-browser.ts` 通过 Chrome DevTools Protocol 驱动本机已安装的 Chrome/Edge
（使用 Node 内置 `fetch` 与 `WebSocket`，**不新增任何依赖**）。它针对**构建产物**运行，
覆盖路由渲染、直接访问与刷新、客户端跳转、404、字体请求、计划生命周期、学习状态持久化、
存储失败提示、明暗主题与移动端视口。

```bash
npm run build
npx wrangler dev --config dist/server/wrangler.json --port 8788   # 另开一个终端
node --experimental-strip-types scripts/verify-browser.ts http://127.0.0.1:8788
```

没有 Chrome/Edge 时可用 `CHROME_PATH` 指定可执行文件；两者都不存在时脚本会以退出码 2
明确报告“未验证”，而不是假装通过。

---

## 关键实现说明

### KaTeX 字体

`katex/dist/katex.min.css` 里的 `url(fonts/...)` 是相对路径，一旦被 Vite 打进
`/_next/static/css/`，浏览器就会去请求 `/_next/static/css/fonts/*` 并 404。
因此 `scripts/generate-katex-fonts.ts` 会在构建前把它重写为绝对路径 `/fonts/*.woff2`
输出到 `app/katex-fonts.css`（只保留 `public/fonts` 中真实存在的格式，不产生多余 404）。
升级 katex 后重新运行 `npm run generate:katex-fonts` 即可。

### 阶段测试题库

`lib/stage-test-bank.ts` 是按概念整理的真实题库；没有收录的概念会退化为
**基于该概念自身定义 / 前置知识 / 分类 / 难度**生成的题目，答案全部可核对，绝不编造。
评分按题型区分：

- 选择题、判断题、公式填空、计算题、代码输出题 → 自动判分；
- 概念解释题、代码阅读题 → 标记为“自评”，提交后由学习者对照参考答案判断，未自评前不计入
  分数（不会伪装成自动评估）。

旧版本生成的占位题（题干统一为“请完成关于……”，答案固定为“正确”）会在迁移时被清除，
连同它们产生的分数、薄弱概念和复习任务一起作废，避免旧数据继续产生虚假评分。
某个阶段确实没有可用题目时显示“暂无测试”，不计分。

### 学习状态同步

“直接完成整个理解卡”和“逐个完成子步骤”走同一条规则（`taskMarksConceptLearned`）：
只有 `concept-understanding`（以及旧数据的 `concept-reading` / `definition-reading`）
在完成时才把概念标记为已学习。实践、复习、练习、项目和资源任务**不会**被当作已掌握。

### 浏览器存储

所有 `localStorage` / `sessionStorage` 读写都经过 `lib/browser-storage.ts`：
存储不可用、配额耗尽、非法 JSON、字段结构错误都会被分类处理。读取时逐字段校验，只丢弃坏
字段并保留其余合法记录；无法解析时**保留原数据不覆盖**。写入失败时页面底部出现明确提示
（“本次修改尚未保存到当前浏览器”），页面继续可用，并可点击“重新保存”重试。

### 构建体积

客户端 JS 原始体积约 1.9 MB，gzip 后约 627 KB；单路由（首页）原始体积约 1.06 MB。
最大的两个 chunk 是 `concept-view`（684 KB）与 `content`（428 KB），主要来自 238 个概念的
正文与元数据，用于概念页渲染和标题/摘要搜索。本次未做拆分：没有证据表明它造成了实际体验
问题，而拆分需要重构内容数据结构。若后续需要优化，建议先做内容懒加载再考虑拆包。

---

## 已知限制

- **服务器函数 DoS 公告（未修复，风险低）**：`react-server-dom-webpack@19.2.6` 命中
  GHSA-wx67-qw84-cm4g。该公告只影响使用 React Server Functions 的应用，本项目没有
  `"use server"` 代码、表单动作或服务器动作端点。可用的修复版本尚未随 React 19.2 正式发布
  （19.2.8 / 19.3 在该公告范围内同样受影响），因此本次只在报告中记录，不做强制升级。
- **开发服务器依赖公告（不影响部署产物）**：`vite`、`ws`、`undici`、`sharp`、`miniflare`、
  `esbuild`、`wrangler`、`@cloudflare/vite-plugin` 的公告全部位于构建/开发链路，不进入
  Worker 运行时产物。未使用 `npm audit fix --force`。
- **未验证项**：未做跨浏览器（Safari / Firefox）手工验证；线上只检查了 Chrome。浏览器对
  `/favicon.ico` 的默认回退请求返回 404（站点声明的是 `/favicon.svg`），与本次改动无关。

## 浅色主题的改动边界

浅色模式的适配集中在 `app/light-theme.css`，所有规则都限定在 `[data-theme='light']` 下，
深色主题沿用原有样式。修改这份文件时必须遵守三条：

1. **不能抹平语义状态**：`demo-status` 的 good / warn / danger / muted、`grid-world` 的
   goal / blocked / path、`transport-status` 的 current / deprecated、演示进度的
   done / active 必须保持可区分，分别映射到 `--color-success` / `--color-warning` /
   `--color-error` 等语义 token。
2. **代码块保持深色**：`code-figure` 与 `.syntax-*` 是刻意的深色孤岛，不要在这里改。
3. **选中态与 hover 不能用同一个填充**：选中用强调色描边加由强调色派生的更深填充，hover
   保持中性面并提升边界与文字色。

`tests/light-theme-surfaces.test.ts` 会对以上三点做静态断言（含“所有规则必须限定在浅色
主题下”和“遗留深色任意值必须全部被覆盖”），`scripts/verify-browser.ts` 会在真实浏览器里
测量对比度与面板亮度。

## 本次唯一的依赖升级

`vinext` `1.0.0-beta.5` → `1.0.0-beta.10`（同时把它的 peer 依赖
`@vitejs/plugin-rsc` 由 `0.5.26` 提到 `0.5.35`）。原因是 beta.5 的**生产构建**产物存在打包
缺陷：客户端 chunk 的导出表缺少 `getPrefetchInterceptionContext`、`navigateClientSide` 等
入口，导致构建产物中链接点击不会发起任何 RSC 请求、客户端跳转完全失效（开发服务器正常）。
beta.10 修复了该导出/分块问题，已用浏览器验收确认。除此之外没有升级任何依赖，也没有使用
`npm audit fix --force`。
