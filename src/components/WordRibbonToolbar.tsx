import React from 'react';
import {
  Undo2,
  Redo2,
  Search,
  Download,
  Upload,
  Printer,
  LayoutTemplate,
  CheckCircle2,
  AlertTriangle,
  PanelLeft,
  PanelRight,
  Sparkles,
  Layers,
  Columns2,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../store/useDocumentStore';
import {
  DoctorDiagnostic,
  WorkspaceMode,
} from '../types/document';
import {
  exportOverleafZipBundle,
  formatCount,
} from '../utils/formatters';

interface WordRibbonToolbarProps {
  diagnostics: DoctorDiagnostic[];
}

export const WordRibbonToolbar: React.FC<WordRibbonToolbarProps> = ({
  diagnostics,
}) => {
  const {
    mode,
    setMode,
    config,
    blocks,
    bibliography,
    openStudioModal,
    setCommandPaletteOpen,
    leftPanelOpen,
    setLeftPanelOpen,
    rightPanelOpen,
    setRightPanelOpen,
    setRightInspectorTab,
    undo,
    redo,
    history,
    future,
  } = useDocumentStore();

  const workflowModes: {
    id: WorkspaceMode;
    step: string;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'visual', step: '1', label: 'Focus Canvas', icon: Sparkles },
    { id: 'builder', step: '2', label: 'Studio Builder', icon: Layers },
    { id: 'split', step: '3', label: 'Split .tex Sync', icon: Columns2 },
    { id: 'code', step: '4', label: 'Pro Overleaf IDE', icon: Code2 },
  ];

  return (
    <header className="no-print chrome-glass sticky top-0 z-30 flex h-14 flex-shrink-0 items-center justify-between gap-3 border-b border-stone-200/80 px-3.5">
      {/* Left: Sidebar Toggle, Brand Identity, Active Template Pill, Undo/Redo */}
      <div className="flex items-center gap-2 min-w-0">
        {mode !== 'code' && (
          <button
            type="button"
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className={`btn-press flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              leftPanelOpen
                ? 'border-stone-300 bg-stone-900 text-white'
                : 'border-stone-200/90 bg-white text-stone-600 hover:text-stone-900'
            }`}
            title={leftPanelOpen ? 'Hide Left Block Dock' : 'Show Left Block Dock'}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2 pr-1">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-stone-900 font-serif text-sm font-bold text-white shadow-xs">
            Ω
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-xs font-bold tracking-tight text-stone-900">
              OmniTeX
            </div>
            <div className="text-[10px] font-medium text-stone-400">
              Visual LaTeX Studio
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-stone-200 hidden sm:block" />

        {/* Template & Layout Trigger Pill */}
        <button
          type="button"
          onClick={() => openStudioModal('templates')}
          className="btn-press flex items-center gap-1.5 rounded-lg border border-stone-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:border-stone-300"
          title="Switch Journal or Thesis Template"
        >
          <LayoutTemplate className="h-3.5 w-3.5 text-stone-500 flex-shrink-0" />
          <span className="truncate max-w-[120px] font-mono text-[11px] font-semibold text-stone-800">
            \{config.documentClass}
          </span>
          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 tabular-nums">
            {config.columns === 2 ? '2-Col' : '1-Col'}
          </span>
        </button>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center gap-0.5 rounded-lg border border-stone-200/80 bg-white p-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            className="btn-press rounded-md p-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="btn-press rounded-md p-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Guided 4-Step Workflow Switcher */}
      <div className="flex items-center rounded-xl bg-stone-200/75 p-1 ring-1 ring-stone-900/5">
        {workflowModes.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`btn-press flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium ${
                active
                  ? 'bg-white text-stone-950 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-mono tabular-nums ${
                  active
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-300/70 text-stone-600'
                }`}
              >
                {m.step}
              </span>
              <Icon className="h-3.5 w-3.5 hidden lg:inline" />
              <span className="whitespace-nowrap">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Command Palette, Doctor Status, Import, Export & Right Inspector Toggle */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="btn-press hidden xl:flex items-center gap-2 rounded-lg border border-stone-200/90 bg-white px-2.5 py-1.5 text-xs text-stone-500 shadow-2xs hover:border-stone-300 hover:text-stone-800"
          title="Open Command Menu (⌘K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Commands</span>
          <kbd className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
            ⌘K
          </kbd>
        </button>

        {/* Doctor Health Badge */}
        <button
          type="button"
          onClick={() => {
            setRightInspectorTab('doctor');
            setRightPanelOpen(true);
          }}
          className={`btn-press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium tabular-nums ${
            diagnostics.length === 0
              ? 'bg-emerald-50/90 text-emerald-800 ring-1 ring-emerald-600/20'
              : 'bg-amber-50 text-amber-900 ring-1 ring-amber-600/30'
          }`}
          title="Open Human LaTeX Error Translator & Package Doctor"
        >
          {diagnostics.length === 0 ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden md:inline">TeX Ready</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>{formatCount(diagnostics.length, 'Fix', 'Fixes')}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => openStudioModal('import')}
          className="btn-press hidden sm:flex items-center gap-1.5 rounded-lg border border-stone-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50"
          title="Import Microsoft Word (.docx), LaTeX (.tex), or Markdown (.md)"
        >
          <Upload className="h-3.5 w-3.5 text-stone-500" />
          <span className="hidden lg:inline">Import</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="btn-press hidden md:flex items-center gap-1.5 rounded-lg border border-stone-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50"
          title="Print or Save Typeset PDF"
        >
          <Printer className="h-3.5 w-3.5 text-stone-500" />
          <span className="hidden lg:inline">PDF</span>
        </button>

        <button
          type="button"
          onClick={() => {
            exportOverleafZipBundle(config, blocks, bibliography);
            toast.success('Exported Overleaf & arXiv ready .zip project!');
          }}
          className="btn-press flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export .zip</span>
        </button>

        {mode !== 'code' && (
          <button
            type="button"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`btn-press flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              rightPanelOpen
                ? 'border-stone-300 bg-stone-900 text-white'
                : 'border-stone-200/90 bg-white text-stone-600 hover:text-stone-900'
            }`}
            title={rightPanelOpen ? 'Hide Right Inspector Dock' : 'Show Right Inspector Dock'}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
