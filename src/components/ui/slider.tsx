'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface CustomSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  colorVariant?: 'volt' | 'orange' | 'cyan';
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  CustomSliderProps
>(({ className, colorVariant = 'volt', ...props }, ref) => {
  const colorMap = {
    volt: 'bg-accent-volt',
    orange: 'bg-accent-orange',
    cyan: 'bg-accent-cyan',
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center cursor-pointer',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-elevated border border-border-subtle">
        <SliderPrimitive.Range className={cn('absolute h-full rounded-full', colorMap[colorVariant])} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn(
        'block h-3.5 w-3.5 rounded-full border border-black bg-white shadow-md ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-volt hover:scale-110 active:scale-95'
      )} />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
