# 渐进学习路线 V2

## Phase 1: Logic Foundation

- [x] Task 1: 添加路线、内容、时间和输入校验失败测试
  - 验收：覆盖依赖闭包、循环、自然段定义、两卡结构、时间求和、空数字和无效日期。
  - 验证：运行 npm test，新增测试在实现前按预期失败。
  - 依赖：无。
  - 文件：tests/plan-engine.test.ts、lib/plan-engine.ts。

- [x] Task 2: 规范化前置关系并建立严格拓扑顺序
  - 验收：标题、别名、ID 和 slug 均能解析；跨方向前置自动补入；收藏不越过依赖。
  - 验证：focused tests + npx tsc --noEmit。
  - 依赖：Task 1。
  - 文件：lib/plan-engine.ts、components/plan-create-view.tsx、tests/plan-engine.test.ts。

- [x] Task 3: 增加定义自然段和任务子步骤兼容模型
  - 验收：定义为自然段；目标 120～180 字；不含标签式冒号或一句话记忆点；旧任务可安全读取。
  - 验证：迁移、定义去重和完整句裁剪测试。
  - 依赖：Task 1。
  - 文件：lib/plan-engine.ts、components/plan-store.tsx、tests/plan-engine.test.ts。

## Checkpoint: Foundation

- [x] 依赖顺序、定义段落和旧数据迁移测试通过。
- [x] TypeScript 检查通过。

## Phase 2: Route Generation

- [x] Task 4: 实现知识路线法 V2
  - 验收：每概念两张主卡；严格逐概念推进；不存在无效链接。
  - 验证：生成器测试与任务数量断言。
  - 依赖：Tasks 2、3。
  - 文件：lib/plan-engine.ts、tests/plan-engine.test.ts。

- [x] Task 5: 实现深度理解法 V2
  - 验收：“名词与理解”“原理与实践”覆盖原有必要步骤，不生成一句话记忆点。
  - 验证：子步骤类型、顺序和完成状态测试。
  - 依赖：Tasks 2、3。
  - 文件：lib/plan-engine.ts、tests/plan-engine.test.ts。

- [x] Task 6: 统一分钟计算和聚合复习
  - 验收：定义 5 分钟；任务与计划分钟均由子步骤求和；普通路线复习按阶段聚合。
  - 验证：总分钟一致性、容量和复习数量测试。
  - 依赖：Tasks 4、5。
  - 文件：lib/plan-engine.ts、tests/plan-engine.test.ts。

## Checkpoint: Generation

- [x] 两种路线均没有前置跳跃。
- [x] 主任务数量相较当前实现显著下降。
- [x] 所有生成器测试通过。

## Phase 3: Interaction

- [x] Task 7: 更新预览和详情任务卡
  - 验收：自然段定义可读；子步骤可展开和单独完成；主列表每概念最多两项。
  - 验证：定向 lint、TypeScript、本地页面响应。
  - 依赖：Tasks 4～6。
  - 文件：components/plan-create-view.tsx、components/plan-task-list.tsx、app/plan-features.css。

- [x] Task 8: 增加下一步推荐和完成阶段折叠
  - 验收：顶部显示下一条未完成任务；已完成阶段默认折叠；支持只看未完成。
  - 验证：桌面和移动端本地检查。
  - 依赖：Task 7。
  - 文件：components/plan-detail-view.tsx、components/plan-task-list.tsx、app/plan-features.css。

- [x] Task 9: 修复每周时间输入
  - 验收：可以删空再输入；非法值有行内错误；快捷值正常工作。
  - 验证：输入解析测试和 TypeScript 检查。
  - 依赖：Task 1。
  - 文件：components/plan-create-view.tsx、lib/plan-engine.ts、tests/plan-engine.test.ts。

- [x] Task 10: 实现年月日分段日期选择
  - 验收：日选项随月份和闰年变化；不能选择 42 日；目标日期不能早于开始日期。
  - 验证：闰年、月末和非法日期测试。
  - 依赖：Task 1。
  - 文件：components/plan-create-view.tsx、lib/plan-engine.ts、tests/plan-engine.test.ts。

## Checkpoint: Interaction

- [x] 创建、预览、保存和详情流程本地可用。
- [x] 移动端无横向溢出，键盘操作正常。
- [x] 空数字与非法日期问题已复现并修复。

## Phase 4: Compatibility and Verification

- [x] Task 11: 完成旧计划迁移与状态联动回归
  - 验收：旧完成状态、已学习、收藏、重点、备忘录均保留。
  - 验证：迁移和联动测试。
  - 依赖：Tasks 3～10。
  - 文件：lib/plan-engine.ts、components/plan-store.tsx、tests/plan-engine.test.ts。

- [x] Task 12: 最终质量门禁
  - 验收：测试、定向 lint、TypeScript 和本地构建通过；不执行部署。
  - 验证：npm test、npx tsc --noEmit、定向 oxlint、npm run build、localhost 路由检查。
  - 依赖：Task 11。

## Final Checkpoint

- [x] 所有验收标准满足。
- [x] 项目保持本地运行。
- [x] 未调用远程 API，未部署。
