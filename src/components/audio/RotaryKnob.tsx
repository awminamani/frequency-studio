'use client';

import React from 'react';
import { useKnobGesture } from '@/hooks/useKnobGesture';
import { cn, mapRange } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RotaryKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  color?: 'volt' | 'orange' | 'cyan' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  formatValue?: (val: number) => string;
  onChange: (val: number) => void;
  className?: string;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue = min + (max - min) / 2,
  unit = '',
  color = 'volt',
  size = 'md',
  formatValue,
  onChange,
  className,
}) => {
  const {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
    handleKeyDown,
  } = useKnobGesture({
    value,
    min,
    max,
    step,
    defaultValue,
    onChange,
  });

  // Calculate rotation angle (-135° to +135°)
  const angle = mapRange(value, min, max, -135, 135);
  const normalized = mapRange(value, min, max, 0, 1);

  const colorConfig = {
    volt: {
      stroke: '#D4FF00',
      glow: 'rgba(212, 255, 0, 0.4)',
      text: 'text-accent-volt',
    },
    orange: {
      stroke: '#FF5500',
      glow: 'rgba(255, 85, 0, 0.4)',
      text: 'text-accent-orange',
    },
    cyan: {
      stroke: '#00F0FF',
      glow: 'rgba(0, 240, 255, 0.4)',
      text: 'text-accent-cyan',
    },
    purple: {
      stroke: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.4)',
      text: 'text-accent-purple',
    },
  }[color];

  const sizeConfig = {
    sm: { dim: 40, r: 15, strokeWidth: 3, font: 'text-[9px]' },
    md: { dim: 52, r: 20, strokeWidth: 3.5, font: 'text-[10px]' },
    lg: { dim: 64, r: 25, strokeWidth: 4, font: 'text-xs' },
  }[size];

  const { dim, r, strokeWidth } = sizeConfig;
  const center = dim / 2;
  const circumference = 2 * Math.PI * r;
  // 270 degrees arc = 0.75 of circle
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength * (1 - normalized);

  const displayVal = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex flex-col items-center select-none cursor-ns-resize group focus:outline-none',
              className
            )}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
          >
            {/* Knob Outer Housing */}
            <div className="relative flex items-center justify-center">
              <svg width={dim} height={dim} className="transform rotate-[135deg]">
                {/* Background Track Arc */}
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeLinecap="round"
                />
                {/* Active Value Track Arc */}
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="transparent"
                  stroke={colorConfig.stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    filter: isDragging ? `drop-shadow(0 0 6px ${colorConfig.glow})` : undefined,
                    transition: isDragging ? 'none' : 'stroke-dashoffset 0.1s ease-out',
                  }}
                />
              </svg>

              {/* Central Physical Potentiometer Disc */}
              <div
                className={cn(
                  'absolute rounded-full bg-[#1e2229] border border-neutral-700/80 shadow-inner-bezel transition-transform flex items-center justify-center',
                  isDragging ? 'border-neutral-400 scale-105' : 'group-hover:border-neutral-500'
                )}
                style={{
                  width: `${dim - 16}px`,
                  height: `${dim - 16}px`,
                  transform: `rotate(${angle}deg)`,
                }}
              >
                {/* Pointer Notch */}
                <div
                  className="w-0.5 rounded-full bg-white absolute top-1 shadow-sm"
                  style={{
                    height: `${(dim - 16) / 3.5}px`,
                    backgroundColor: isDragging ? colorConfig.stroke : '#FFFFFF',
                  }}
                />
              </div>
            </div>

            {/* Label & Value Readout */}
            <div className="mt-1 text-center font-mono leading-tight">
              <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
                {label}
              </span>
              <span
                className={cn(
                  'block text-[10px] font-semibold tabular-nums',
                  isDragging ? colorConfig.text : 'text-neutral-300'
                )}
              >
                {displayVal}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-mono text-xs">
            {label}: <span className="font-semibold text-white">{displayVal}</span> (Double-click to reset)
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
