# Design — how to learn AI

<!-- Hallmark · studied: yes · DNA-source: url · source: https://www.usehallmark.com/examples/tally/ · designed-as-app -->

这是此应用锁定的设计系统。后续页面改造先读取本文件，只扩展系统，不为单独页面重新发明主题。

## Genre

modern-minimal。产品界面优先，学习状态与下一步行动先于介绍性叙事。

## Macrostructure family

- 首页：Marquee Hero 与 Workbench 混合，H2 7/5 分栏，右侧展示真实学习状态。
- 应用页：Workbench，功能区本身就是页面证据，不增加装饰性插图。
- 内容页：Long Document，正文保持连续阅读与稳定目录。

## System

- 导航：N5 Floating pill，内容宽度、顶端居中、半透明背景；窄屏折叠菜单。
- 页脚：Ft5 Statement，以一句学习原则收束，再放本地数据说明。
- Display：Geist 700，正体，tracking `-0.035em`。
- Body：Geist 400。
- Mono：Geist Mono 500，仅用于状态、数据与微标签。
- 图标：Lucide React，保持单一图标体系。
- 浅色/深色共享 258° 冷色锚点与 268° 靛蓝强调色，只改变明度与适量降低深色模式色度。
- 分类标签允许使用小面积语义色：书籍琥珀、论文青绿、文档靛蓝、文章天蓝、视频玫红、GitHub 石墨、数据与交互工具湖蓝；这些颜色不替代品牌强调色。

## Provenance

从 `https://www.usehallmark.com/examples/tally/` 作为用户品牌的公开设计参考提取，日期 2026-09-01。结构、字体声明与颜色来自页面 CSS；不复制其文案、品牌或产品图形。URL 模式无法单独判断视觉节奏，因此应用内节奏按真实内容与断点校准。

## Theme

- Light paper：`oklch(98.4% 0.005 258)`
- Dark paper：`oklch(15% 0.014 258)`
- Light ink：`oklch(18% 0.03 258)`
- Dark ink：`oklch(94% 0.008 258)`
- Light accent：`oklch(54% 0.22 268)`
- Dark accent：`oklch(64% 0.19 268)`
- Accent footprint：每个视口不超过 5%。
- 浅色输入表面：`oklch(99% 0.004 258)`；悬浮表面：`oklch(96.2% 0.01 258)`。

## Spacing

使用 `tokens.css` 中的 4-point 命名尺度。新 CSS 必须引用 token，不写页面级任意间距值。

## Motion

- 只动画 `transform` 与 `opacity`。
- 主题切换不做整页转场，避免闪烁与不必要动画。
- 页面最多使用 CTA 轻移与功能状态变化两类动效。
- `prefers-reduced-motion` 下空间位移取消，反馈不超过 150 ms。

## Microinteractions stance

- 成功默认静默，失败提供明确恢复动作。
- 焦点环立即出现，不参与动画。
- 所有触控目标至少 44 × 44 CSS px。
- 可逆操作优先即时更新与撤销，不新增低风险确认弹窗。

## CTA voice

- 主操作：墨色填充胶囊，具体动词，单行标签。
- 次操作：细边框胶囊或文字箭头，避免与主操作争夺层级。

## Per-page allowances

- 首页可用纯 CSS 网格作为结构提示，但不制作代表性插画。
- 应用页不使用装饰性 enrichment，功能承担视觉重点。
- 内容页只使用排版、规则线和真实代码/公式内容。

## What pages MUST share

- `how to learn AI` 字标、靛蓝强调色、Geist / Geist Mono 字体角色。
- 按钮高度、焦点环、输入边界、浅色/深色切换行为。
- 状态与数据采用等宽字体和 tabular numerals。

## What pages MAY differ on

- 首页、应用页、长文页使用各自宏观结构。
- 信息密度与栏目数量根据真实内容变化，不补虚构指标。

## Exports

### tokens.css

完整浅色与深色 token 位于项目根目录 `tokens.css`。

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: var(--color-paper);
  --color-paper-2: var(--color-paper-2);
  --color-paper-3: var(--color-paper-3);
  --color-ink: var(--color-ink);
  --color-ink-2: var(--color-ink-2);
  --color-accent: var(--color-accent);
  --color-focus: var(--color-focus);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-outlier: var(--font-outlier);
  --spacing-md: var(--space-md);
  --spacing-xl: var(--space-xl);
  --ease-out: var(--ease-out);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper-light": { "$value": "oklch(98.4% 0.005 258)", "$type": "color" },
    "paper-dark": { "$value": "oklch(15% 0.014 258)", "$type": "color" },
    "accent-light": { "$value": "oklch(54% 0.22 268)", "$type": "color" },
    "accent-dark": { "$value": "oklch(64% 0.19 268)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Geist, Microsoft YaHei, ui-sans-serif, sans-serif", "$type": "fontFamily" },
    "mono": { "$value": "Geist Mono, Cascadia Code, ui-monospace, monospace", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "3rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: var(--color-paper);
  --foreground: var(--color-ink);
  --card: var(--color-paper-2);
  --card-foreground: var(--color-ink);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-accent-ink);
  --secondary: var(--color-paper-3);
  --secondary-foreground: var(--color-ink-2);
  --muted: var(--color-paper-3);
  --muted-foreground: var(--color-muted);
  --border: var(--color-rule);
  --input: var(--color-rule-2);
  --ring: var(--color-focus);
  --radius: var(--radius-input);
}
```

## Notes

- 不继承参考页的斜体标题强调。
- 不使用无限滚动信息带，除非内容确实表达实时状态。
- 不使用三张同构功能卡、AI 标准导航、四栏 SaaS 页脚或伪造指标。
