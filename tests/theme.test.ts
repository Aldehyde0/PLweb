import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getNextTheme,
  normalizeTheme,
  resolveTheme,
} from '../lib/theme.ts';

void test('normalizes only supported persisted theme values', () => {
  assert.equal(normalizeTheme('light'), 'light');
  assert.equal(normalizeTheme('dark'), 'dark');
  assert.equal(normalizeTheme('system'), null);
  assert.equal(normalizeTheme(null), null);
});

void test('uses a saved theme before the operating-system preference', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});

void test('falls back to the operating-system preference when no theme is saved', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
});

void test('theme toggle always switches to the opposite explicit theme', () => {
  assert.equal(getNextTheme('light'), 'dark');
  assert.equal(getNextTheme('dark'), 'light');
});
