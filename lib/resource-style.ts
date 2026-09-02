import type { ResourceType } from './resources';

export type ResourceTypeGroup =
  | 'book'
  | 'paper'
  | 'official'
  | 'article'
  | 'video'
  | 'github'
  | 'research';

const resourceTypeGroups = {
  书籍: 'book',
  论文: 'paper',
  官方文档: 'official',
  技术文章: 'article',
  代码教程: 'article',
  视频: 'video',
  视频课程: 'video',
  'GitHub 仓库': 'github',
  数据集: 'research',
  交互式工具: 'research',
} as const satisfies Record<ResourceType, ResourceTypeGroup>;

export function getResourceTypeGroup(type: ResourceType): ResourceTypeGroup {
  return resourceTypeGroups[type];
}
