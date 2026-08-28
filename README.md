# Frequency Studio 🎛️⚡

**Tactile Generative Step Sequencer & Hardware Synthesizer Studio**

An advanced, anti-generic web audio workstation built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Tone.js**, and **Zustand**. Engineered with strict hardware-inspired skeuomorphic tactility, mathematical polyrhythms, and 60FPS high-DPI canvas visualization.

---

## 🚀 Key Features

### 1. 🎹 Multi-Voice Synthesizer & Audio Engine
- **Cyber PolySynth**: Rich polyphonic lead and chord synthesizer with warm envelope and harmonics.
- **TB-303 Acid Bass**: Resonant mono-synth with sub-oscillator and snappy envelope filter.
- **Drum Synthesis & Sampler Engine**: Membrane kick, snappy noise snare, closed/open hi-hat sizzle, and metallic percussions with automatic procedural fallbacks.
- **Tone.Transport Orchestration**: Deterministic 1/16th note scheduling with zero timing drift, dynamic BPM ramping, and swing modulation.

### 2. 🎛️ Master Signal Processing Rack
- **2D Kaoss XY Pad**: Interactive dual-axis filter controller for Cutoff (100 Hz - 18,000 Hz) and Resonance (Q: 0.1 - 15) with spring/latch physics.
- **Master Effects Chain**:
  - 24dB/oct resonant filter
  - Analog tape saturation / clipping distortion
  - Stereo ping-pong feedback delay
  - Lush algorithmic space reverb
  - Master safety limiter (-0.5 dB)
- **Stereo VU Meter**: Accurate multi-segment peak and RMS level monitoring.

### 3. 🧬 Generative Intelligence & Algorithms
- **Euclidean Rhythms (Björklund Algorithm)**: Mathematically distributed polyrhythms with pulse count and rotation shift controls.
- **Markovian Mutation Engine**: Stochastic pitch walks, dynamic velocity humanization, probability gates, and rhythmic syncopation.
- **Harmonic Scale Quantization**: Automatic pitch quantization supporting **Minor Pentatonic**, **Dorian**, **Phrygian**, **Hirajoshi**, **Lydian**, **Natural Minor**, and **Major Pentatonic**.

### 4. 📊 60FPS High-DPI Visualizer Suite
- **Oscilloscope Waveform**: Glowing `#D4FF00` neon line with smoothed quadratic Bézier curves and ghost persistence trails.
- **Polar Radar Scope**: Sci-fi circular audio-reactive radar sweep.
- **Multi-Band FFT Spectrum**: 48-band frequency bar analyzer with real-time peak hold.
- **Geometric Shockwaves**: Beat-triggered polygonal expansion rings radiating on Kick, Snare, and Percussive transients.

### 5. 💾 Presets & Pattern Portability
- **Factory Presets**:
  - *Neon Dystopia* (128 BPM Synthwave)
  - *Deep Rain* (84 BPM Lo-Fi Ambient)
  - *Berlin Basement* (134 BPM Minimal Acid)
  - *Solar Winds* (100 BPM Space Electronica)
- **JSON Export / Import**: Instant preset serialization to share or archive patterns.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| **Space** | Toggle Transport Play / Stop |
| **R** | Trigger Generative Mutation |
| **C** | Clear all active step gates |
| **1 - 6** | Toggle Mute for Track 1 through 6 |
| **Shift + 1 - 6** | Toggle Solo for Track 1 through 6 |
| **↑ / ↓** | Adjust BPM (+/- 1) |
| **Shift + ↑ / ↓** | Adjust BPM in increments of 5 |

---

## 📦 Getting Started

### Installation
```bash
npm install
# or
pnpm install / yarn / bun install
```

### Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Click **"Start Audio Engine"** or hit **Space** to unlock Web Audio playback!

### Production Build
```bash
npm run build
npm run start
```
