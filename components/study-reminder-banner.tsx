'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  PauseCircle,
  Settings2,
  X,
} from 'lucide-react';
import { usePlans } from '@/components/plan-store';
import { Button } from '@/components/ui/button';

export function StudyReminderBanner() {
  const { activePlan, reminderView, dismissReminder, setPlanStatus } =
    usePlans();
  if (!activePlan || !reminderView) return null;
  return (
    <aside className="study-reminder" aria-label="本地学习提醒">
      <div className="study-reminder-inner">
        <span className="study-reminder-icon">
          {reminderView.paused ? <PauseCircle /> : <CalendarDays />}
        </span>
        <div className="study-reminder-copy">
          <strong>
            {reminderView.paused
              ? '你的学习计划目前处于暂停状态。'
              : `你上次学习到：${reminderView.lastStudyLabel}。`}
          </strong>
          <p>
            {reminderView.paused
              ? '需要时可以恢复计划，不必赶进度。'
              : `已经有 ${reminderView.daysAway} 天没有继续学习了。今天可以从以下任务中选择：`}
          </p>
          {!reminderView.paused && (
            <ul>
              {reminderView.suggestedTasks.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          )}
          <span className="study-reminder-time">
            <Clock3 />
            预计用时：{reminderView.estimatedMinutes} 分钟
          </span>
        </div>
        <div className="study-reminder-actions">
          {reminderView.paused ? (
            <Button
              size="sm"
              onClick={() => setPlanStatus(activePlan.id, 'active')}
            >
              <ArrowRight />
              恢复计划
            </Button>
          ) : (
            <Button
              size="sm"
              render={<Link href={`/plans/${activePlan.id}`} />}
            >
              <ArrowRight />
              继续上次学习
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/plans/${activePlan.id}/today`} />}
          >
            查看今日任务
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/plans/${activePlan.id}#adjust-plan`} />}
          >
            <Settings2 />
            调整计划
          </Button>
          <Button size="sm" variant="ghost" onClick={dismissReminder}>
            稍后提醒
          </Button>
        </div>
        <button
          type="button"
          className="study-reminder-close"
          aria-label="关闭今日提醒"
          onClick={dismissReminder}
        >
          <X />
        </button>
      </div>
    </aside>
  );
}
