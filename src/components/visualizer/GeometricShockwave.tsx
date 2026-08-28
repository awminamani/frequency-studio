'use client';

import React, { useEffect, useRef } from 'react';

export interface ShockwaveBurst {
  id: number;
  type: string;
  velocity: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface GeometricShockwaveProps {
  triggerSignal: { type: string; velocity: number; timestamp: number } | null;
  width: number;
  height: number;
}

export const GeometricShockwave: React.FC<GeometricShockwaveProps> = ({
  triggerSignal,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstsRef = useRef<ShockwaveBurst[]>([]);
  const idCounterRef = useRef(0);

  // Spawn new shockwave burst on trigger signal
  useEffect(() => {
    if (!triggerSignal) return;

    let color = '#D4FF00'; // Default Volt
    if (triggerSignal.type === 'kick') color = '#FF3366';
    if (triggerSignal.type === 'snare') color = '#FF9900';
    if (triggerSignal.type === 'hihat') color = '#00F0FF';
    if (triggerSignal.type === 'perc') color = '#A855F7';

    const newBurst: ShockwaveBurst = {
      id: idCounterRef.current++,
      type: triggerSignal.type,
      velocity: triggerSignal.velocity,
      x: width / 2,
      y: height / 2,
      radius: 4,
      maxRadius: Math.min(width, height) * (0.3 + triggerSignal.velocity * 0.35),
      alpha: 0.9,
      color,
    };

    burstsRef.current.push(newBurst);
  }, [triggerSignal, width, height]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const activeBursts: ShockwaveBurst[] = [];

      for (let i = 0; i < burstsRef.current.length; i++) {
        const b = burstsRef.current[i];
        b.radius += (b.maxRadius - b.radius) * 0.12 + 2;
        b.alpha *= 0.88;

        if (b.alpha > 0.02 && b.radius < b.maxRadius) {
          activeBursts.push(b);

          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.strokeStyle = b.color;
          ctx.lineWidth = Math.max(1, 4 * b.alpha);
          ctx.globalAlpha = b.alpha;
          ctx.shadowBlur = 16;
          ctx.shadowColor = b.color;
          ctx.stroke();

          // Polygonal inner ring for kick/snare
          if (b.type === 'kick' || b.type === 'snare') {
            const sides = b.type === 'kick' ? 6 : 8;
            ctx.beginPath();
            for (let s = 0; s < sides; s++) {
              const angle = (s / sides) * Math.PI * 2;
              const px = b.x + Math.cos(angle) * (b.radius * 0.7);
              const py = b.y + Math.sin(angle) * (b.radius * 0.7);
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      burstsRef.current = activeBursts;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};
