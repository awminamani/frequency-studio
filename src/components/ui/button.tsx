import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-mono font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-volt disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-surface-elevated text-neutral-100 hover:bg-neutral-800 border border-border-subtle hover:border-border-glow shadow-sm',
        volt:
          'bg-accent-volt text-obsidian font-semibold hover:bg-[#e0ff33] shadow-glow-volt border border-accent-volt',
        orange:
          'bg-accent-orange text-white font-semibold hover:bg-[#ff6a1a] shadow-glow-orange border border-accent-orange',
        cyan:
          'bg-accent-cyan text-obsidian font-semibold hover:bg-[#33f3ff] shadow-glow-cyan border border-accent-cyan',
        outline:
          'border border-border-subtle bg-transparent text-neutral-300 hover:bg-surface-panel hover:text-white hover:border-neutral-500',
        ghost:
          'text-neutral-400 hover:bg-surface-elevated hover:text-white',
        danger:
          'bg-red-950/60 text-red-400 border border-red-800/60 hover:bg-red-900/80 hover:text-red-300',
        hardware:
          'bg-[#1a1d24] text-neutral-200 border border-neutral-700/80 hover:border-neutral-500 shadow-inner-bezel active:bg-[#15171c]',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        xs: 'h-6 px-2 text-[10px]',
        sm: 'h-7 px-2.5 text-xs',
        lg: 'h-10 px-4 text-sm',
        icon: 'h-8 w-8',
        'icon-sm': 'h-6 w-6',
        'icon-xs': 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
