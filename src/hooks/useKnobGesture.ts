'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { clamp } from '@/lib/utils';

interface UseKnobGestureProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  onChange: (val: number) => void;
}

export function useKnobGesture({
  value,
  min,
  max,
  step = 1,
  defaultValue = min + (max - min) / 2,
  onChange,
}: UseKnobGestureProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(value);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      startYRef.current = e.clientY;
      startValRef.current = value;
    },
    [value]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const deltaY = startYRef.current - e.clientY;
      const isFineTune = e.shiftKey;
      const sensitivity = isFineTune ? 0.2 : 1.0;
      
      const range = max - min;
      const deltaVal = (deltaY / 150) * range * sensitivity;
      const rawNewVal = startValRef.current + deltaVal;

      // Quantize to step
      const steppedVal = Math.round(rawNewVal / step) * step;
      const finalVal = clamp(steppedVal, min, max);

      onChange(finalVal);
    },
    [isDragging, min, max, step, onChange]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    onChange(defaultValue);
  }, [defaultValue, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const mult = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        onChange(clamp(value + step * mult, min, max));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        onChange(clamp(value - step * mult, min, max));
      } else if (e.key === 'Home') {
        e.preventDefault();
        onChange(min);
      } else if (e.key === 'End') {
        e.preventDefault();
        onChange(max);
      }
    },
    [value, min, max, step, onChange]
  );

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
    handleKeyDown,
  };
}
