import React, { useMemo, useRef } from 'react';
import { Toaster } from 'sonner';
import {
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useDocumentStore, DatasetMode } from './store/useDocumentStore';
import { runHumanDoctor } from './engine/humanDoctor';
import { WordRibbonToolbar } from './components/WordRibbonToolbar';
import { LeftPaletteAndOutline } from './components/LeftPaletteAndOutline';
import { VisualPaperCanvas } from './components/VisualPaperCanvas';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { CodeAndInspectorPanel } from './components/CodeAndInspectorPanel';
import { VisualMathStudio } from './components/studios/VisualMathStudio';
import { VisualTableStudio } from './components/studios/VisualTableStudio';
import { VisualDiagramStudio } from './components/studios/VisualDiagramStudio';
import { SmartCitationStudio } from './components/studios/SmartCitationStudio';
import { ImportAndTemplateModals } from './components/studios/ImportAndTemplateModals';
import { CommandPalette } from './components/CommandPalette';
import { formatCount } from './utils/formatters';

export const App: React.FC = () => {
  const {
    mode,
    config,
    blocks,
    bibliography,
    datasetMode,
    setDatasetMode,
    leftPanelOpen,
    rightPanelOpen,
    leftPanelWidth,
    rightPanelWidth,
    setLeftPanelWidth,
    setRightPanelWidth,
  } = useDocumentStore();

  const diagnostics = useMemo(
    () => runHumanDoctor(config, blocks),
    [config, blocks]
  );

  const wordCount = useMemo(() => {
    const raw = blocks
      .map((b) => {
        if ('content' in b) return b.content;
        if ('title' in b) return b.title;
        if ('caption' in b) return b.caption || '';
        return '';
      })
      .join(' ');
    const words = raw.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [blocks]);

  // 1:1 Direct Manipulation Resizable Splitters with Pointer Capture (apple-design §2)
  const leftDragStart = useRef<{ x: number; w: number } | null>(null);
  const rightDragStart = useRef<{ x: number; w: number } | null>(null);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#F3F2EE] text-[#111110]">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
          },
        }}
      />

      {/* Unified Architectural Top Header & Guided 4-Step Flow Switcher */}
      <WordRibbonToolbar diagnostics={diagnostics} />

      {/* Adjustable 3-Pane Workspace with 1:1 Pointer-Captured Splitters */}
      <main className="relative flex flex-1 overflow-hidden">
        {mode === 'code' ? (
          <>
            <CodeAndInspectorPanel fullWidth={true} />
            <VisualPaperCanvas />
          </>
        ) : (
          <>
            {/* Resizable Left Component & Outline Dock */}
            {leftPanelOpen && (
              <>
                <LeftPaletteAndOutline width={leftPanelWidth} />
                <div
                  onDoubleClick={() => setLeftPanelWidth(300)}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    leftDragStart.current = {
                      x: e.clientX,
                      w: leftPanelWidth,
                    };
                  }}
                  onPointerMove={(e) => {
                    if (!leftDragStart.current) return;
                    const delta = e.clientX - leftDragStart.current.x;
                    setLeftPanelWidth(leftDragStart.current.w + delta);
                  }}
                  onPointerUp={() => {
                    leftDragStart.current = null;
                  }}
                  title="Drag to resize Left Dock (Double-click to reset)"
                  className="no-print group relative z-20 flex w-1.5 cursor-col-resize items-center justify-center bg-transparent hover:bg-stone-900/10 active:bg-stone-900/20 transition-colors"
                >
                  <div className="h-8 w-0.5 rounded-full bg-stone-300 group-hover:bg-stone-600" />
                </div>
              </>
            )}

            {/* Center Typeset Paper Stage + Floating Action Island */}
            <VisualPaperCanvas />

            {/* Resizable Right Contextual Property Inspector / Live .tex Dock */}
            {rightPanelOpen && (
              <>
                <div
                  onDoubleClick={() => setRightPanelWidth(360)}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    rightDragStart.current = {
                      x: e.clientX,
                      w: rightPanelWidth,
                    };
                  }}
                  onPointerMove={(e) => {
                    if (!rightDragStart.current) return;
                    const delta = rightDragStart.current.x - e.clientX;
                    setRightPanelWidth(rightDragStart.current.w + delta);
                  }}
                  onPointerUp={() => {
                    rightDragStart.current = null;
                  }}
                  title="Drag to resize Right Inspector (Double-click to reset)"
                  className="no-print group relative z-20 flex w-1.5 cursor-col-resize items-center justify-center bg-transparent hover:bg-stone-900/10 active:bg-stone-900/20 transition-colors"
                >
                  <div className="h-8 w-0.5 rounded-full bg-stone-300 group-hover:bg-stone-600" />
                </div>
                <RightInspectorPanel
                  width={rightPanelWidth}
                  diagnostics={diagnostics}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Minimal Status Footer & Dataset Stress-Test Switcher */}
      <footer className="no-print flex h-8 flex-shrink-0 items-center justify-between gap-2 border-t border-stone-200/80 bg-white/90 px-4 text-[11px] text-stone-500">
        <div className="flex items-center gap-3 tabular-nums">
          <span className="font-medium text-stone-700">
            {formatCount(blocks.length, 'block')}
          </span>
          <span className="text-stone-300">•</span>
          <span>{formatCount(wordCount, 'word')}</span>
          <span className="text-stone-300">•</span>
          <span>{formatCount(bibliography.length, 'reference')}</span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Auto-Preamble Active
          </span>
        </div>

        {/* Segmented Fixture Toggle (Demo / Worst Case / Empty) per break-ui SKILL.md */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-lg bg-stone-200/75 p-0.5 text-[10.5px]">
            {(
              [
                { id: 'demo', label: 'Demo Manuscript' },
                { id: 'worst_case', label: 'Stress-Test Data' },
                { id: 'empty', label: 'Blank Canvas' },
              ] as { id: DatasetMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDatasetMode(opt.id)}
                className={`rounded-md px-2 py-0.5 font-medium ${
                  datasetMode === opt.id
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="hidden lg:inline-flex items-center gap-1 text-stone-400">
            <Sparkles className="h-3 w-3 text-stone-700" />
            Drag splitters to resize panels • Press{' '}
            <kbd className="rounded bg-stone-100 px-1 font-mono text-stone-600">
              ⌘K
            </kbd>
          </span>
        </div>
      </footer>

      {/* All Integrated Visual Power Studios & Modals */}
      <VisualMathStudio />
      <VisualTableStudio />
      <VisualDiagramStudio />
      <SmartCitationStudio />
      <ImportAndTemplateModals />
      <CommandPalette />
    </div>
  );
};
