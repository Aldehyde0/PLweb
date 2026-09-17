import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  // The live-region role belongs on the host element, so the icon itself is
  // marked decorative and the visible/announced text comes from the caller.
  return (
    <Loader2Icon
      data-slot="spinner"
      aria-hidden="true"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
