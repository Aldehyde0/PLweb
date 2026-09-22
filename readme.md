# Cloudflare Workers 部署

## 环境准备

- 安装 Node.js 22.13.0 或更高版本及 npm。
- 准备 Cloudflare 账号，并克隆本仓库。
- 在项目根目录执行命令。当前 Worker 名称为 `plweb`。

## 方式一：连接 GitHub 自动部署

在 Cloudflare 控制台的 **Workers & Pages** 中，打开目标 Worker，连接本仓库，并在 **Settings → Build** 中设置：

| 配置项 | 值 |
| --- | --- |
| 根目录 | 仓库根目录 |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --config dist/server/wrangler.json` |

保存设置后，向远端 `main` 推送提交以触发构建和部署：

```bash
git push origin main
```

部署完成后，在 Cloudflare 控制台确认构建成功，且 **Active Deployment** 对应此次提交生成的版本。生产发布命令使用 `wrangler deploy`；`wrangler versions upload` 只上传版本，不会自动切换线上流量。

## 方式二：本地命令行部署

安装依赖并登录 Cloudflare：

```bash
npm ci
npx wrangler login
npx wrangler whoami
```

确认登录到目标账号后，可先预览生产构建：

```bash
npm run preview
```

按终端提示访问本地地址。预览完成后按 `Ctrl+C` 停止服务，再执行发布，避免 Windows 下构建目录被占用：

```bash
npm run deploy:dry-run
npm run deploy
```

以上两条命令均会先构建项目；第一条只检查上传内容，第二条正式发布。

构建生成的 Worker 配置位于 `dist/server/wrangler.json`。请修改源配置后重新构建，不要手工编辑生成文件。

## 域名配置

在目标 Worker 的域名设置中绑定自己的自定义域名，或使用已启用的 `workers.dev` 地址。

如需固定分享元数据的站点地址，可在 Cloudflare 构建环境中设置 `SITE_ORIGIN`，值为完整 HTTPS 地址，例如 `https://learn.example.com`。本地部署时，在执行部署命令前设置：

```bash
# Bash / Zsh
export SITE_ORIGIN=https://learn.example.com
npm run deploy
```

```powershell
# PowerShell
$env:SITE_ORIGIN = 'https://learn.example.com'
npm run deploy
```

未设置 `SITE_ORIGIN` 时使用请求域名。该变量只配置站点元数据，不会自动创建域名绑定。

## 部署历史与回滚

本地已有构建产物并完成 Cloudflare 认证后，执行：

```bash
npm run deployments
npm run rollback
```

第一条查看部署历史；第二条按 Wrangler 提示确认回滚。Cloudflare 控制台也可查看当前活动部署和历史版本。

