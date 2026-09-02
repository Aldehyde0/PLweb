import assert from 'node:assert/strict';
import test from 'node:test';
import { getExerciseTypeGroup } from '../lib/exercise-style.ts';
import { getResourceTypeGroup } from '../lib/resource-style.ts';

void test('maps every resource type to an intentional visual family', () => {
  assert.equal(getResourceTypeGroup('书籍'), 'book');
  assert.equal(getResourceTypeGroup('论文'), 'paper');
  assert.equal(getResourceTypeGroup('官方文档'), 'official');
  assert.equal(getResourceTypeGroup('技术文章'), 'article');
  assert.equal(getResourceTypeGroup('代码教程'), 'article');
  assert.equal(getResourceTypeGroup('视频'), 'video');
  assert.equal(getResourceTypeGroup('视频课程'), 'video');
  assert.equal(getResourceTypeGroup('GitHub 仓库'), 'github');
  assert.equal(getResourceTypeGroup('数据集'), 'research');
  assert.equal(getResourceTypeGroup('交互式工具'), 'research');
});

void test('maps every exercise type to a distinct semantic color group', () => {
  assert.equal(getExerciseTypeGroup('概念'), 'concept');
  assert.equal(getExerciseTypeGroup('计算'), 'calculation');
  assert.equal(getExerciseTypeGroup('代码'), 'code');
  assert.equal(getExerciseTypeGroup('诊断'), 'diagnostic');
  assert.equal(getExerciseTypeGroup('项目'), 'project');
});
