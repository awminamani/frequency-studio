'use client';

import React, { useState } from 'react';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { FACTORY_PRESETS } from '@/lib/constants/presets';
import { PatternPreset } from '@/types/sequencer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  FolderOpen,
  Download,
  Upload,
  Check,
  Copy,
  Disc,
  Flame,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PresetBar: React.FC = () => {
  const store = useSequencerStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const json = store.exportPatternJSON();
    setJsonText(json);
    setIsExportOpen(true);
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownloadFile = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frequency-pattern-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    const success = store.importPatternJSON(jsonText);
    if (success) {
      setIsImportOpen(false);
      setJsonText('');
    } else {
      setImportError('Invalid pattern JSON structure. Please check the format.');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border-subtle bg-surface-panel shadow-2xl">
      {/* Factory Presets buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-card border border-border-subtle mr-1">
          <FolderOpen className="w-3.5 h-3.5 text-accent-volt" />
          <span className="font-mono text-[11px] font-bold text-neutral-300 uppercase">
            Factory Presets:
          </span>
        </div>

        {FACTORY_PRESETS.map((preset) => {
          const isActive = store.activePresetId === preset.id;
          return (
            <Button
              key={preset.id}
              size="sm"
              variant={isActive ? 'volt' : 'hardware'}
              onClick={() => store.loadPreset(preset)}
              className={cn(
                'font-mono text-xs transition-all',
                isActive && 'shadow-glow-volt font-bold'
              )}
            >
              {preset.name}
              <span className="ml-1.5 opacity-60 text-[9px]">({preset.bpm} BPM)</span>
            </Button>
          );
        })}
      </div>

      {/* JSON Export / Import */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="hardware" onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-1 text-accent-cyan" /> Export JSON
        </Button>
        <Button
          size="sm"
          variant="hardware"
          onClick={() => {
            setJsonText('');
            setImportError(null);
            setIsImportOpen(true);
          }}
        >
          <Upload className="w-3.5 h-3.5 mr-1 text-accent-orange" /> Import JSON
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-accent-volt flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Pattern Preset JSON
            </DialogTitle>
            <DialogDescription>
              Copy the JSON string or download the file to share your patch and sequence.
            </DialogDescription>
          </DialogHeader>

          <textarea
            readOnly
            value={jsonText}
            rows={12}
            className="w-full bg-[#08090a] border border-neutral-800 rounded-md p-3 font-mono text-[11px] text-neutral-200 focus:outline-none"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyClipboard}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button variant="volt" size="sm" onClick={handleDownloadFile}>
              <Download className="w-3.5 h-3.5 mr-1" /> Download JSON File
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-accent-orange flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import Pattern Preset JSON
            </DialogTitle>
            <DialogDescription>
              Paste a previously exported pattern JSON payload to load it into the studio.
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste pattern JSON here..."
            rows={12}
            className="w-full bg-[#08090a] border border-neutral-800 rounded-md p-3 font-mono text-[11px] text-neutral-200 focus:outline-none focus:border-accent-orange"
          />

          {importError && (
            <p className="text-red-400 font-mono text-xs">{importError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" size="sm" onClick={handleImportSubmit}>
              <Upload className="w-3.5 h-3.5 mr-1" /> Load Preset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
