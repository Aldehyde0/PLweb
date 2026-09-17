'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Accessible form label.
 *
 * A `<label>` without an association is unusable with assistive technology, so
 * this component always has one. Pass `htmlFor` (or `controlId`) with the
 * control's id, or wrap the control as a child; without either it still points
 * at a generated id, so it never emits a label that names nothing.
 */
function Label({
  className,
  controlId,
  htmlFor,
  ...props
}: React.ComponentProps<'label'> & { controlId?: string }) {
  const generatedId = React.useId();
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor ?? controlId ?? generatedId}
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
