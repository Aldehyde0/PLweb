import type { Metadata } from 'next';
import { BookmarksView } from '@/components/bookmarks-view';
export const metadata:Metadata={title:'我的收藏 · how to learn AI',description:'保存在当前浏览器中的 AI 学习概念。'};
export default function BookmarksPage(){return <BookmarksView/>}
