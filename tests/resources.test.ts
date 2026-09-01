import assert from 'node:assert/strict';
import test from 'node:test';
import {
  learningResources,
  resourceCategories,
  resourceTypes,
  validateResourceLibrary,
  resourcesForConcept,
} from '../lib/resources.ts';

void test('resource library has at least eight entries for every learning direction', () => {
  for (const category of resourceCategories) {
    assert.ok(
      learningResources.filter((resource) => resource.category === category)
        .length >= 8,
    );
  }
});

void test('every direction includes clearly typed video and GitHub resources', () => {
  for (const category of resourceCategories) {
    const types = new Set(
      learningResources
        .filter((resource) => resource.category === category)
        .map((resource) => resource.type),
    );
    assert.ok(types.has('视频') || types.has('视频课程'));
    assert.ok(types.has('GitHub 仓库'));
  }
  assert.ok(resourceTypes.includes('技术文章'));
});

void test('resource metadata is complete, unique and link-only', () => {
  const errors = validateResourceLibrary(learningResources);
  assert.deepEqual(errors, []);
  assert.equal(
    new Set(learningResources.map((resource) => resource.id)).size,
    learningResources.length,
  );
  for (const resource of learningResources) {
    assert.match(resource.url, /^https:\/\//);
    assert.ok(resource.summary.length <= 120);
    assert.match(resource.lastVerifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

void test('GitHub resources include repository-specific metadata without star counts', () => {
  const repositories = learningResources.filter(
    (resource) => resource.type === 'GitHub 仓库',
  );
  assert.ok(repositories.length >= 4);
  for (const resource of repositories) {
    assert.ok(resource.github);
    assert.ok(resource.github?.purpose);
    assert.ok(resource.github?.primaryLanguage);
    assert.equal('stars' in (resource.github ?? {}), false);
  }
});

void test('numerical standardization has mixed automatically linked resources', () => {
  const resources = resourcesForConcept('numerical-standardization');
  const types = new Set(resources.map((resource) => resource.type));
  assert.ok(resources.length >= 4);
  assert.ok(types.has('官方文档'));
  assert.ok(types.has('视频') || types.has('视频课程'));
  assert.ok(types.has('GitHub 仓库') || types.has('代码教程'));
});
