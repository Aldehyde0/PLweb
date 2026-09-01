'use client';

import { useRouter } from 'next/navigation';
import { Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { usePlans } from '@/components/plan-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function PlanDeleteButton({
  planId,
  title,
  redirectTo,
}: {
  planId: string;
  title: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { deletePlan } = usePlans();
  const [open, setOpen] = useState(false);
  function confirmDelete() {
    deletePlan(planId);
    setOpen(false);
    if (redirectTo) router.push(redirectTo);
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button size="sm" variant="ghost" className="plan-delete-trigger" />
        }
      >
        <Trash2 />
        删除
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>删除“{title}”？</AlertDialogTitle>
          <AlertDialogDescription>
            计划、阶段、任务和相关学习活动将从当前浏览器永久删除。已学习、收藏、重点和备忘录不会受到影响。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirmDelete}>
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
