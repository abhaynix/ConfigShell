import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Small, subtle keyboard shortcut badge.
 * Designed to look crisp and quiet alongside text, buttons, and inputs.
 */
export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex h-4 min-w-4 select-none items-center justify-center rounded border border-border/80 bg-muted/60 px-1 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs transition-colors',
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {children}
    </kbd>
  );
}
