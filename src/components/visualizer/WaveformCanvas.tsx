'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as Tone from 'tone';
import { GeometricShockwave } from './GeometricShockwave';
import { Button } from '@/components/ui/button';
import { Activity, Radio, BarChart3, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type VisualizerMode = 'oscilloscope' | 'polar' | 'spectrum';

interface WaveformCanvasProps {
  analyserNode: Tone.Analyser | null;
  triggerSignal?: { type: string; velocity: number; timestamp: number } | null;
  className?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  analyserNode,
  triggerSignal = null,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<VisualizerMode>('oscilloscope');
  const [dimensions, setDimensions] = useState({ width: 600, height: 180 });

  // Update canvas size on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 180,
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // 60 FPS Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Spectrum peak hold memory
    const peakHold: number[] = new Array(64).fill(0);

    const render = () => {
      const { width, height } = dimensions;

      // 1. Ghost persistence background trail
      ctx.fillStyle = 'rgba(8, 9, 10, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // Grid background markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridStep = 30;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      try {
        const waveform = analyserNode.getValue() as Float32Array;

        if (mode === 'oscilloscope') {
          // 2. Oscilloscope Mode with Neon Glow
          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#D4FF00';
          ctx.shadowColor = '#D4FF00';
          ctx.shadowBlur = 14;

          const sliceWidth = width / (waveform.length - 1);
          let x = 0;

          for (let i = 0; i < waveform.length; i++) {
            const v = waveform[i];
            const y = (v + 1) / 2 * height;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              // Smooth curve with midpoint quadratic bezier
              const prevX = (i - 1) * sliceWidth;
              const prevY = ((waveform[i - 1] + 1) / 2) * height;
              const midX = (prevX + x) / 2;
              const midY = (prevY + y) / 2;
              ctx.quadraticCurveTo(prevX, prevY, midX, midY);
            }
            x += sliceWidth;
          }

          ctx.stroke();

          // Second subtle ghost wave in Cyan
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#00F0FF';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#00F0FF';
          ctx.globalAlpha = 0.5;

          x = 0;
          for (let i = 0; i < waveform.length; i += 2) {
            const v = waveform[i];
            const y = (v + 1) / 2 * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth * 2;
          }
          ctx.stroke();
          ctx.restore();

        } else if (mode === 'polar') {
          // 3. Circular Polar Radar Mode
          ctx.save();
          const centerX = width / 2;
          const centerY = height / 2;
          const baseRadius = Math.min(centerX, centerY) * 0.65;

          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#00F0FF';
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 12;

          for (let i = 0; i < waveform.length; i++) {
            const angle = (i / waveform.length) * Math.PI * 2;
            const amp = waveform[i] * 40;
            const r = Math.max(10, baseRadius + amp);
            const px = centerX + Math.cos(angle) * r;
            const py = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();

          // Inner rotating reticle
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(212, 255, 0, 0.4)';
          ctx.arc(centerX, centerY, baseRadius * 0.4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();

        } else if (mode === 'spectrum') {
          // 4. Multi-Band Spectrum Mode
          ctx.save();
          const barCount = 48;
          const barWidth = (width / barCount) - 2;
          const stepSize = Math.floor(waveform.length / barCount);

          for (let i = 0; i < barCount; i++) {
            let sum = 0;
            for (let j = 0; j < stepSize; j++) {
              sum += Math.abs(waveform[i * stepSize + j] || 0);
            }
            const avg = (sum / stepSize);
            const barHeight = Math.max(4, avg * height * 1.8);

            // Update peak hold
            peakHold[i] = Math.max(barHeight, (peakHold[i] || 0) - 2);

            const x = i * (barWidth + 2);
            const y = height - barHeight;

            // Gradient bar
            const grad = ctx.createLinearGradient(0, y, 0, height);
            grad.addColorStop(0, '#D4FF00');
            grad.addColorStop(0.5, '#FF5500');
            grad.addColorStop(1, '#00F0FF');

            ctx.fillStyle = grad;
            ctx.shadowColor = '#D4FF00';
            ctx.shadowBlur = 6;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Peak tick marker
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, height - peakHold[i] - 2, barWidth, 1.5);
          }
          ctx.restore();
        }
      } catch {}

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyserNode, mode, dimensions]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col w-full h-44 rounded-xl border border-border-subtle bg-obsidian overflow-hidden shadow-inner-bezel',
        className
      )}
    >
      {/* Top telemetry HUD and mode buttons */}
      <div className="absolute top-2 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-volt animate-ping" />
          <span className="font-mono text-[10px] font-bold tracking-widest text-neutral-300 uppercase">
            Live 60FPS Visualizer // {mode.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          <Button
            size="xs"
            variant={mode === 'oscilloscope' ? 'volt' : 'hardware'}
            onClick={() => setMode('oscilloscope')}
            className="h-6 px-2 text-[10px]"
            title="Oscilloscope Waveform"
          >
            <Activity className="w-3 h-3 mr-1" /> Wave
          </Button>
          <Button
            size="xs"
            variant={mode === 'polar' ? 'cyan' : 'hardware'}
            onClick={() => setMode('polar')}
            className="h-6 px-2 text-[10px]"
            title="Polar Radar View"
          >
            <Radio className="w-3 h-3 mr-1" /> Polar
          </Button>
          <Button
            size="xs"
            variant={mode === 'spectrum' ? 'orange' : 'hardware'}
            onClick={() => setMode('spectrum')}
            className="h-6 px-2 text-[10px]"
            title="FFT Spectrum Bars"
          >
            <BarChart3 className="w-3 h-3 mr-1" /> FFT
          </Button>
        </div>
      </div>

      {/* Main Canvas Waveform */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
      />

      {/* Beat Trigger Shockwave Overlay */}
      <GeometricShockwave
        triggerSignal={triggerSignal}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
};
