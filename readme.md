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
| `npm run deploy` | `build` + `wrangler deploy`（正式发布，本次未执行） |
| `npm run generate:katex-fonts` | 从 `katex/dist/katex.min.css` 重新生成 `app/katex-fonts.css` |
| `node --experimental-strip-types scripts/verify-browser.ts <url>` | 用本机 Chrome 做真实浏览器验收（见下） |

## 部署到 Cloudflare Workers

目标平台是 **Cloudflare Workers**（不是 Pages，也不是静态托管）。

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

### 4. 发布（本次未执行）

```bash
npm run deploy
# 等价于 npx wrangler deploy --config dist/server/wrangler.json
```

> 本次交付**没有**执行任何正式发布，也没有配置 push 后自动部署。

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
- **未验证项**：没有在真实 Cloudflare 账号上执行 `wrangler deploy`（本次不发布）；未在
  `*.workers.dev` 或自定义域名上验证线上表现；未做跨浏览器（Safari / Firefox）手工验证。

## 本次唯一的依赖升级

`vinext` `1.0.0-beta.5` → `1.0.0-beta.10`（同时把它的 peer 依赖
`@vitejs/plugin-rsc` 由 `0.5.26` 提到 `0.5.35`）。原因是 beta.5 的**生产构建**产物存在打包
缺陷：客户端 chunk 的导出表缺少 `getPrefetchInterceptionContext`、`navigateClientSide` 等
入口，导致构建产物中链接点击不会发起任何 RSC 请求、客户端跳转完全失效（开发服务器正常）。
beta.10 修复了该导出/分块问题，已用浏览器验收确认。除此之外没有升级任何依赖，也没有使用
`npm audit fix --force`。
