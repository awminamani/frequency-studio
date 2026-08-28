import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'border-border-subtle bg-surface-elevated text-neutral-300',
        volt: 'border-accent-volt/40 bg-accent-volt/10 text-accent-volt',
        orange: 'border-accent-orange/40 bg-accent-orange/10 text-accent-orange',
        cyan: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
        outline: 'border-border-subtle text-neutral-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
