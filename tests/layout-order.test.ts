import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

void test('renders the study reminder after page content so the floating header cannot cover it', () => {
  const layout = readFileSync(
    new URL('../app/layout.tsx', import.meta.url),
    'utf8',
  );
  const contentIndex = layout.indexOf('{children}');
  const reminderIndex = layout.indexOf('<StudyReminderBanner />');

  assert.ok(contentIndex >= 0, 'layout should render its page content');
  assert.ok(reminderIndex > contentIndex, 'reminder should follow page content');
});
