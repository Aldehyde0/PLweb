'use client';

import { useRef, useState } from 'react';
import { useLearning } from '@/components/learning-store';
import { usePlans } from '@/components/plan-store';
import { useResources } from '@/components/resource-store';
import { usePersistence } from '@/components/persistence-store';
import { readThemePreference } from '@/lib/theme';
import {
  BACKUP_MAX_BYTES,
  createProgressBackup,
  parseProgressBackup,
  restoreProgressBackup,
  type ProgressBackup as Backup,
} from '@/lib/progress-backup';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export function ProgressBackup() {
  const learning = useLearning();
  const plans = usePlans();
  const resources = useResources();
  const { reloadProgress } = usePersistence();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const ready = learning.ready && plans.ready && resources.ready;

  function download() {
    setError('');
    try {
      const backup = createProgressBackup({
        learning,
        plans,
        resources,
        theme: readThemePreference(),
      });
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(backup, null, 2)], {
          type: 'application/json',
        }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `how-to-learn-ai-progress-${backup.exportedAt.slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('无法导出进度。请重试，当前学习记录仍保留在本页。');
    }
  }
  async function readFile(file: File | undefined) {
    if (!file) return;
    setReading(true);
    setError('');
    try {
      if (file.size > BACKUP_MAX_BYTES)
        throw new Error('文件超过 10 MB，请选择较小的进度备份。');
      setPending(parseProgressBackup(await file.text()));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : '无法读取文件，请重新选择进度 JSON。',
      );
    } finally {
      setReading(false);
    }
  }
  function restore() {
    if (!pending) return;
    try {
      restoreProgressBackup(pending, window.localStorage);
      document.documentElement.dataset.theme = pending.data.theme;
      document.documentElement.classList.toggle(
        'dark',
        pending.data.theme === 'dark',
      );
      reloadProgress();
    } catch (cause) {
      setPending(null);
      setError(
        cause instanceof Error
          ? cause.message
          : '无法访问浏览器存储，请检查站点存储权限后重试。',
      );
    }
  }
  return (
    <div className="progress-backup">
      <div className="progress-backup-actions">
        <button type="button" disabled={!ready || reading} onClick={download}>
          导出进度
        </button>
        <button
          type="button"
          disabled={!ready || reading}
          onClick={() => input.current?.click()}
        >
          {reading ? '读取备份…' : '导入进度'}
        </button>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          hidden
          aria-label="选择进度备份 JSON"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            void readFile(file);
          }}
        />
      </div>
      {error && <p role="alert">{error} 可重新选择文件或导出当前进度。</p>}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>覆盖当前浏览器的学习进度？</AlertDialogTitle>
            <AlertDialogDescription>
              将用备份中的学习记录、笔记、收藏、练习、计划、资料进度和显示主题覆盖当前数据。建议先导出当前进度。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={restore}>
              确认导入并覆盖
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
