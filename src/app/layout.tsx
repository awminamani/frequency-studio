import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FREQUENCY STUDIO // Hardware Synth & Generative Sequencer',
  description:
    'Tactile 16/32 step generative sequencer, TB-303 acid bass, polyphonic synth, Bjorklund Euclidean rhythms, and 60FPS oscilloscope visualizer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian min-h-screen antialiased selection:bg-accent-volt selection:text-obsidian">
        {children}
      </body>
    </html>
  );
}
