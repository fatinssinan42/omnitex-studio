import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  FileCode2,
  Stethoscope,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  BookMarked,
  Link2,
  Pin,
  Columns2,
  Sparkles,
  Wrench,
  CheckCircle2,
  RefreshCw,
  Download,
  LayoutTemplate,
  PanelTop,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDocumentStore,
  RightInspectorTab,
} from '../store/useDocumentStore';
import {
  CitationStyleId,
  DoctorDiagnostic,
  DocumentConfig,
  FontFamilyId,
  PaperSize,
} from '../types/document';
import {
  serializeBibToBibtex,
  serializeBlockToLatex,
  serializeDocumentToLatex,
} from '../engine/latexSerializer';
import { downloadTextFile, formatCount } from '../utils/formatters';
import { MathRenderer } from './MathRenderer';

interface RightInspectorPanelProps {
  width: number;
  diagnostics: DoctorDiagnostic[];
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  width,
  diagnostics,
}) => {
  const {
    config,
    updateConfig,
    blocks,
    bibliography,
    selectedBlockId,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    nudgeBlock,
    openStudioModal,
    rightInspectorTab,
    setRightInspectorTab,
    applyDoctorFix,
    fixAllDoctorIssues,
    syncFromRawLatex,
  } = useDocumentStore();

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedIdx = blocks.findIndex((b) => b.id === selectedBlockId);

  const generatedMainTex = React.useMemo(
    () => serializeDocumentToLatex(config, blocks, bibliography),
    [config, blocks, bibliography]
  );

  const [editableTex, setEditableTex] = useState(generatedMainTex);
  const [isTexDirty, setIsTexDirty] = useState(false);
  const [codeSubTab, setCodeSubTab] = useState<'main.tex' | 'block.tex' | 'bib'>(
    'main.tex'
  );

  useEffect(() => {
    setEditableTex(generatedMainTex);
    setIsTexDirty(false);
  }, [generatedMainTex]);

  const blockLatexSnippet = selectedBlock
    ? serializeBlockToLatex(selectedBlock)
    : '% Select any block on the canvas to inspect its exact LaTeX snippet.';

  const tabs: {
    id: RightInspectorTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'inspector', label: 'Block', icon: SlidersHorizontal },
    { id: 'document', label: 'Page', icon: LayoutTemplate },
    { id: 'latex', label: '.tex', icon: FileCode2 },
    {
      id: 'doctor',
      label: 'Doctor',
      icon: Stethoscope,
      badge: diagnostics.length,
    },
  ];

  const appendMarkupToSelected = (snippet: string) => {
    if (
      !selectedBlock ||
      !('content' in selectedBlock)
    ) {
      return;
    }
    updateBlock(selectedBlock.id, {
      content: `${selectedBlock.content}${snippet}`,
    });
  };

  return (
    <aside
      style={{ width: `${width}px` }}
      className="no-print flex flex-shrink-0 flex-col border-l border-stone-200/80 bg-[#F9F8F6] select-none"
    >
      {/* Top Segmented Inspector Navigation */}
      <div className="border-b border-stone-200/80 p-2.5">
        <div className="grid grid-cols-4 rounded-xl bg-stone-200/75 p-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = rightInspectorTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setRightInspectorTab(t.id)}
                className={`btn-press flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium tabular-nums ${
                  active
                    ? 'bg-white text-stone-950 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span>{t.label}</span>
                {typeof t.badge === 'number' && t.badge > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[9px] font-bold text-white">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspector Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* =================================================================
            TAB 1: CONTEXTUAL BLOCK INSPECTOR (Figma / Framer Style Cards)
            ================================================================= */}
        {rightInspectorTab === 'inspector' && (
          <>
            {!selectedBlock ? (
              <div className="studio-card p-5 text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900">
                    No Block Selected
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                    Click any heading, paragraph, equation, table, figure, or TikZ diagram on the paper canvas to customize its visual properties and inspect its LaTeX code.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRightInspectorTab('document')}
                  className="btn-press w-full rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white"
                >
                  Configure Page Setup & Fonts →
                </button>
              </div>
            ) : (
              <>
                {/* Selected Block Header & Quick Actions Card */}
                <div className="studio-card p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded-md bg-stone-900 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-white">
                        {selectedBlock.type}
                      </span>
                      <span className="truncate font-mono text-[11px] text-stone-400 tabular-nums">
                        Block #{selectedIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => nudgeBlock(selectedBlock.id, 'up')}
                        disabled={selectedIdx <= 0}
                        className="btn-press rounded-md border border-stone-200 p-1 text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                        title="Move Block Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeBlock(selectedBlock.id, 'down')}
                        disabled={selectedIdx >= blocks.length - 1}
                        className="btn-press rounded-md border border-stone-200 p-1 text-stone-600 hover:bg-stone-50 disabled:opacity-30"
                        title="Move Block Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          duplicateBlock(selectedBlock.id);
                          toast.success('Duplicated block');
                        }}
                        className="btn-press rounded-md border border-stone-200 p-1 text-stone-600 hover:bg-stone-50"
                        title="Duplicate Block"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteBlock(selectedBlock.id);
                          toast.success('Deleted block');
                        }}
                        className="btn-press rounded-md border border-stone-200 p-1 text-stone-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Delete Block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION HEADING PROPERTIES */}
                {selectedBlock.type === 'section' && (
                  <div className="studio-card p-3.5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Section Hierarchy & Numbering
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { lvl: 1, label: 'H1 Section', tag: '\\section' },
                          { lvl: 2, label: 'H2 Sub', tag: '\\subsection' },
                          { lvl: 3, label: 'H3 Subsub', tag: '\\subsubsection' },
                        ] as const
                      ).map((it) => (
                        <button
                          key={it.lvl}
                          type="button"
                          onClick={() =>
                            updateBlock(selectedBlock.id, { level: it.lvl })
                          }
                          className={`btn-press flex flex-col items-start rounded-lg border p-2 text-left ${
                            selectedBlock.level === it.lvl
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-white'
                          }`}
                        >
                          <span className="text-xs font-semibold">{it.label}</span>
                          <span className="font-mono text-[9px] opacity-70">
                            {it.tag}
                          </span>
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center justify-between rounded-lg border border-stone-200/80 bg-stone-50/60 px-3 py-2 text-xs font-medium text-stone-800">
                      <span>Automatic Section Numbering</span>
                      <input
                        type="checkbox"
                        checked={selectedBlock.numbered}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            numbered: e.target.checked,
                          })
                        }
                        className="rounded accent-stone-900"
                      />
                    </label>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Cross-Reference Label (`\label&#123;...&#125;`)
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.label}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { label: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono text-xs text-stone-800"
                      />
                    </div>
                  </div>
                )}

                {/* PARAGRAPH / ABSTRACT PROPERTIES */}
                {(selectedBlock.type === 'paragraph' ||
                  selectedBlock.type === 'abstract') && (
                  <div className="studio-card p-3.5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Rich Typography & Inline Insertions
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => appendMarkupToSelected(' **bold**')}
                        className="btn-press flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/70 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-white"
                      >
                        <Bold className="h-3.5 w-3.5" />
                        Bold (`\textbf`)
                      </button>
                      <button
                        type="button"
                        onClick={() => appendMarkupToSelected(' *italic*')}
                        className="btn-press flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/70 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-white"
                      >
                        <Italic className="h-3.5 w-3.5" />
                        Italic (`\textit`)
                      </button>
                      <button
                        type="button"
                        onClick={() => appendMarkupToSelected(' __underline__')}
                        className="btn-press flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/70 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-white"
                      >
                        <Underline className="h-3.5 w-3.5" />
                        Underline
                      </button>
                      <button
                        type="button"
                        onClick={() => appendMarkupToSelected(' $\\alpha + \\beta$')}
                        className="btn-press flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/60 px-2.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100/70"
                      >
                        <span className="font-serif">$x^2$</span>
                        Inline Math
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => openStudioModal('citation')}
                        className="btn-press flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <BookMarked className="h-3.5 w-3.5" />
                        + @Cite Paper
                      </button>
                      <button
                        type="button"
                        onClick={() => openStudioModal('citation')}
                        className="btn-press flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        + #Cross-Ref
                      </button>
                    </div>

                    {selectedBlock.type === 'paragraph' && (
                      <div>
                        <label className="block text-[11px] font-medium text-stone-500 mb-1">
                          Paragraph Alignment
                        </label>
                        <div className="grid grid-cols-4 rounded-lg bg-stone-100 p-0.5 text-xs">
                          {(['justify', 'left', 'center', 'right'] as const).map(
                            (al) => (
                              <button
                                key={al}
                                type="button"
                                onClick={() =>
                                  updateBlock(selectedBlock.id, { align: al })
                                }
                                className={`btn-press rounded-md py-1 capitalize text-[11px] font-medium ${
                                  (selectedBlock.align ?? 'justify') === al
                                    ? 'bg-white text-stone-900 shadow-2xs'
                                    : 'text-stone-500'
                                }`}
                              >
                                {al}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EQUATION BLOCK PROPERTIES */}
                {selectedBlock.type === 'equation' && (
                  <div className="studio-card p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Equation & Matrix Controls
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openStudioModal('math', selectedBlock.id)}
                      className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
                    >
                      <Sparkles className="h-4 w-4" />
                      Open Full Visual Math & Matrix Studio
                    </button>

                    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-[#FCFBF9] p-3 text-center">
                      <MathRenderer
                        latex={selectedBlock.latex}
                        displayMode={true}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        LaTeX Math Expression
                      </label>
                      <textarea
                        rows={3}
                        value={selectedBlock.latex}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { latex: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 p-2 font-mono text-xs text-stone-900 focus:bg-white focus:border-stone-400 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center justify-between rounded-lg border border-stone-200/80 bg-stone-50/60 px-3 py-2 text-xs font-medium text-stone-800">
                      <span>Numbered Equation `(1)`</span>
                      <input
                        type="checkbox"
                        checked={selectedBlock.numbered}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            numbered: e.target.checked,
                          })
                        }
                        className="rounded accent-stone-900"
                      />
                    </label>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Reference Label
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.label}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { label: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* TABLE BLOCK PROPERTIES */}
                {selectedBlock.type === 'table' && (
                  <div className="studio-card p-3.5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Spreadsheet Table Settings
                    </div>

                    <button
                      type="button"
                      onClick={() => openStudioModal('table', selectedBlock.id)}
                      className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
                    >
                      <Sparkles className="h-4 w-4" />
                      Open Excel Spreadsheet Studio
                    </button>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-1.5">
                        Academic Table Style
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            { id: 'booktabs', label: 'Booktabs Journal' },
                            { id: 'striped', label: 'Zebra Striped' },
                            { id: 'grid', label: 'Full Grid Lines' },
                            { id: 'minimal', label: 'Minimal Clean' },
                          ] as const
                        ).map((th) => (
                          <button
                            key={th.id}
                            type="button"
                            onClick={() =>
                              updateBlock(selectedBlock.id, { theme: th.id })
                            }
                            className={`btn-press rounded-lg border px-2.5 py-2 text-left text-xs font-medium ${
                              selectedBlock.theme === th.id
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-white'
                            }`}
                          >
                            {th.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            rows: [
                              ...selectedBlock.rows,
                              selectedBlock.headers.map(() => '—'),
                            ],
                          })
                        }
                        className="btn-press flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Row
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            headers: [
                              ...selectedBlock.headers,
                              `Col ${selectedBlock.headers.length + 1}`,
                            ],
                            alignments: [...selectedBlock.alignments, 'c'],
                            rows: selectedBlock.rows.map((r) => [...r, '—']),
                          })
                        }
                        className="btn-press flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Column
                      </button>
                    </div>

                    <label className="flex items-center justify-between rounded-lg border border-stone-200/80 bg-stone-50/60 px-3 py-2 text-xs font-medium text-stone-800">
                      <span>Auto-Fit to Page Margin (`adjustbox`)</span>
                      <input
                        type="checkbox"
                        checked={selectedBlock.autoFitWidth}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            autoFitWidth: e.target.checked,
                          })
                        }
                        className="rounded accent-stone-900"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-lg border border-stone-200/80 bg-stone-50/60 px-3 py-2 text-xs font-medium text-stone-800">
                      <span>Span Across Both Columns (`table*`)</span>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedBlock.spanColumns)}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            spanColumns: e.target.checked,
                          })
                        }
                        className="rounded accent-stone-900"
                      />
                    </label>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Table Caption
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.caption}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { caption: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* FIGURE & SUBFIGURE BLOCK PROPERTIES */}
                {selectedBlock.type === 'figure' && (
                  <div className="studio-card p-3.5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Figure & Subfigure Layout
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'single', label: 'Single Image' },
                          { id: 'grid-2', label: '(a) (b) Side-by-Side' },
                          { id: 'grid-3', label: '(a) (b) (c) Row' },
                          { id: 'grid-2x2', label: '2×2 Subfigure Grid' },
                        ] as const
                      ).map((ly) => (
                        <button
                          key={ly.id}
                          type="button"
                          onClick={() =>
                            updateBlock(selectedBlock.id, { layout: ly.id })
                          }
                          className={`btn-press rounded-lg border px-2.5 py-2 text-left text-xs font-medium ${
                            selectedBlock.layout === ly.id
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-white'
                          }`}
                        >
                          {ly.label}
                        </button>
                      ))}
                    </div>

                    {/* Width Slider */}
                    <div className="rounded-lg border border-stone-200/80 bg-stone-50/60 p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-stone-800 tabular-nums">
                        <span>Figure Width (`\textwidth`)</span>
                        <span className="font-mono font-semibold">
                          {selectedBlock.widthPercent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={25}
                        max={100}
                        step={5}
                        value={selectedBlock.widthPercent}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            widthPercent: Number(e.target.value),
                          })
                        }
                        className="w-full accent-stone-900"
                      />
                    </div>

                    {/* Float Placement Cards */}
                    <div>
                      <label className="block text-[11px] font-medium text-stone-500 mb-1.5">
                        LaTeX Float Placement Behavior
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            {
                              pos: 'H',
                              title: 'Pin Exact Spot [H]',
                              sub: 'Stays right here like Word',
                            },
                            {
                              pos: 't',
                              title: 'Top of Page [t]',
                              sub: 'Academic journal standard',
                            },
                            {
                              pos: 'htbp',
                              title: 'Auto Float [htbp]',
                              sub: 'TeX chooses optimal page',
                            },
                            {
                              pos: 'star',
                              title: 'Span 2 Columns',
                              sub: '\\begin{figure*}',
                            },
                          ] as const
                        ).map((pl) => (
                          <button
                            key={pl.pos}
                            type="button"
                            onClick={() =>
                              updateBlock(selectedBlock.id, { placement: pl.pos })
                            }
                            className={`btn-press flex flex-col items-start rounded-lg border p-2 text-left ${
                              selectedBlock.placement === pl.pos
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-1 text-xs font-semibold">
                              <Pin className="h-3 w-3" />
                              {pl.title}
                            </div>
                            <span className="text-[10px] opacity-75">
                              {pl.sub}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Figure Caption
                      </label>
                      <textarea
                        rows={2}
                        value={selectedBlock.caption}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { caption: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Image Source URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.url}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { url: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* TIKZ / PGFPLOTS DIAGRAM BLOCK PROPERTIES */}
                {selectedBlock.type === 'diagram' && (
                  <div className="studio-card p-3.5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      PGF / TikZ Vector Studio
                    </div>
                    <button
                      type="button"
                      onClick={() => openStudioModal('diagram', selectedBlock.id)}
                      className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
                    >
                      <Sparkles className="h-4 w-4" />
                      Open Interactive TikZ & Plot Canvas
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(selectedBlock.id, { variant: 'tikz-flow' })
                        }
                        className={`btn-press rounded-lg border p-2 text-xs font-medium ${
                          selectedBlock.variant === 'tikz-flow'
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        TikZ Flowchart
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(selectedBlock.id, { variant: 'pgfplot' })
                        }
                        className={`btn-press rounded-lg border p-2 text-xs font-medium ${
                          selectedBlock.variant === 'pgfplot'
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        PGFPlots Curve
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Figure Caption
                      </label>
                      <textarea
                        rows={2}
                        value={selectedBlock.caption}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { caption: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white p-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* CALLOUT / THEOREM BLOCK PROPERTIES */}
                {selectedBlock.type === 'callout' && (
                  <div className="studio-card p-3.5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Theorem & Callout Environment
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          'theorem',
                          'lemma',
                          'proposition',
                          'definition',
                          'proof',
                          'note',
                        ] as const
                      ).map((bt) => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() =>
                            updateBlock(selectedBlock.id, { boxType: bt })
                          }
                          className={`btn-press rounded-lg border px-2.5 py-1.5 capitalize text-xs font-medium ${
                            selectedBlock.boxType === bt
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-stone-50 text-stone-700'
                          }`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Theorem / Box Title
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.title}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, { title: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* LIVE GENERATED LATEX FOR THIS BLOCK CARD */}
                <div className="studio-card overflow-hidden bg-[#141413] text-stone-100">
                  <div className="flex items-center justify-between border-b border-stone-800 px-3 py-2 text-[11px] text-stone-400">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                      Live Block LaTeX Output
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(blockLatexSnippet);
                        toast.success('Copied block LaTeX code');
                      }}
                      className="btn-press flex items-center gap-1 rounded bg-stone-800 px-2 py-0.5 text-[10px] text-stone-200 hover:bg-stone-700"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="max-h-48 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-stone-200">
                    {blockLatexSnippet}
                  </pre>
                </div>
              </>
            )}
          </>
        )}

        {/* =================================================================
            TAB 2: DOCUMENT & PAGE SETUP CARDS (Zero Preamble Coding)
            ================================================================= */}
        {rightInspectorTab === 'document' && (
          <>
            {/* Template Switcher Card */}
            <div className="studio-card p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Journal / Document Template
                </span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                  \{config.documentClass}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openStudioModal('templates')}
                className="btn-press flex w-full items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-left hover:bg-white"
              >
                <div>
                  <div className="text-xs font-semibold text-stone-900">
                    Switch Template Preset
                  </div>
                  <div className="text-[11px] text-stone-500">
                    IEEE, ACM, Thesis, Lab Report, Academic CV
                  </div>
                </div>
                <LayoutTemplate className="h-4 w-4 text-stone-700" />
              </button>
            </div>

            {/* Columns & Paper Layout Card */}
            <div className="studio-card p-3.5 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Columns & Page Geometry
              </div>

              <div className="grid grid-cols-2 gap-2">
                {([1, 2] as const).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => updateConfig({ columns: col })}
                    className={`btn-press flex flex-col items-center justify-center rounded-xl border p-3 ${
                      config.columns === col
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-white'
                    }`}
                  >
                    <Columns2 className="h-4 w-4 mb-1" />
                    <span className="text-xs font-semibold">
                      {col === 1 ? 'Single Column' : 'Two Columns'}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {col === 1 ? 'Thesis / Article' : 'IEEE / ACM Style'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500">
                    Paper Size
                  </label>
                  <select
                    value={config.paperSize}
                    onChange={(e) =>
                      updateConfig({ paperSize: e.target.value as PaperSize })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option value="letterpaper">US Letter</option>
                    <option value="a4paper">A4 Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-500">
                    Page Margins
                  </label>
                  <select
                    value={config.marginInch}
                    onChange={(e) =>
                      updateConfig({ marginInch: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs tabular-nums"
                  >
                    <option value={0.5}>0.5 in (Narrow)</option>
                    <option value={0.75}>0.75 in (IEEE)</option>
                    <option value={1.0}>1.0 in (Standard)</option>
                    <option value={1.25}>1.25 in (Thesis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  Line Spacing (`setspace`)
                </label>
                <div className="grid grid-cols-4 rounded-lg bg-stone-100 p-0.5">
                  {([1.0, 1.15, 1.5, 2.0] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() =>
                        updateConfig({
                          lineSpacing: sp as DocumentConfig['lineSpacing'],
                        })
                      }
                      className={`btn-press rounded-md py-1 text-xs font-medium tabular-nums ${
                        config.lineSpacing === sp
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600'
                      }`}
                    >
                      {sp}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Typography & Font Suite Card */}
            <div className="studio-card p-3.5 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Typography & LaTeX Font Suite
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500">
                  Font Package
                </label>
                <select
                  value={config.fontFamily}
                  onChange={(e) =>
                    updateConfig({ fontFamily: e.target.value as FontFamilyId })
                  }
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs font-medium"
                >
                  <option value="times">Times New Roman (newtxtext + newtxmath)</option>
                  <option value="cmr">Computer Modern (Classic Knuth lmodern)</option>
                  <option value="palatino">Palatino Linotype (mathpazo)</option>
                  <option value="garamond">EB Garamond Serif (ebgaramond)</option>
                  <option value="helvetica">Helvetica Sans-Serif (helvet)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500">
                    Base Size
                  </label>
                  <div className="mt-1 grid grid-cols-3 rounded-lg bg-stone-100 p-0.5">
                    {(['10pt', '11pt', '12pt'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateConfig({ fontSize: sz })}
                        className={`btn-press rounded-md py-1 font-mono text-[11px] ${
                          config.fontSize === sz
                            ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                            : 'text-stone-600'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-500">
                    Citation Style
                  </label>
                  <select
                    value={config.citationStyle}
                    onChange={(e) =>
                      updateConfig({
                        citationStyle: e.target.value as CitationStyleId,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs"
                  >
                    <option value="ieee">IEEE [1]</option>
                    <option value="apa">APA (Author, Yr)</option>
                    <option value="alpha">Alpha [Vas17]</option>
                    <option value="nature">Nature</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center justify-between rounded-lg border border-stone-200/80 bg-stone-50/60 px-3 py-2 text-xs font-medium text-stone-800">
                <span>Include Table of Contents (`\tableofcontents`)</span>
                <input
                  type="checkbox"
                  checked={config.showTableOfContents}
                  onChange={(e) =>
                    updateConfig({ showTableOfContents: e.target.checked })
                  }
                  className="rounded accent-stone-900"
                />
              </label>

              <button
                type="button"
                onClick={() => openStudioModal('header_footer')}
                className="btn-press flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <PanelTop className="h-3.5 w-3.5" />
                Customize Page Headers & Footers (`fancyhdr`)
              </button>
            </div>
          </>
        )}

        {/* =================================================================
            TAB 3: LIVE BIDIRECTIONAL .TEX & .BIB CODE INSPECTOR
            ================================================================= */}
        {rightInspectorTab === 'latex' && (
          <div className="flex h-full flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex rounded-lg bg-stone-200/80 p-0.5 text-[11px]">
                {(
                  [
                    { id: 'main.tex', label: 'main.tex' },
                    { id: 'block.tex', label: 'Selected Block' },
                    { id: 'bib', label: 'references.bib' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCodeSubTab(f.id)}
                    className={`btn-press rounded-md px-2.5 py-1 font-mono ${
                      codeSubTab === f.id
                        ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                        : 'text-stone-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                {codeSubTab === 'main.tex' && isTexDirty && (
                  <button
                    type="button"
                    onClick={() => {
                      syncFromRawLatex(editableTex);
                      setIsTexDirty(false);
                      toast.success('Synced .tex changes to visual blocks!');
                    }}
                    className="btn-press flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Sync to Visual
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const content =
                      codeSubTab === 'main.tex'
                        ? editableTex
                        : codeSubTab === 'block.tex'
                          ? blockLatexSnippet
                          : serializeBibToBibtex(bibliography);
                    navigator.clipboard.writeText(content);
                    toast.success('Copied LaTeX source to clipboard');
                  }}
                  className="btn-press rounded-md border border-stone-200 bg-white p-1.5 text-stone-700 hover:bg-stone-50"
                  title="Copy Source"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadTextFile(
                      codeSubTab === 'bib' ? 'references.bib' : 'main.tex',
                      codeSubTab === 'bib'
                        ? serializeBibToBibtex(bibliography)
                        : editableTex
                    );
                  }}
                  className="btn-press rounded-md border border-stone-200 bg-white p-1.5 text-stone-700 hover:bg-stone-50"
                  title="Download File"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="studio-card flex-1 overflow-hidden bg-[#141413] p-0">
              <textarea
                rows={26}
                value={
                  codeSubTab === 'main.tex'
                    ? editableTex
                    : codeSubTab === 'block.tex'
                      ? blockLatexSnippet
                      : serializeBibToBibtex(bibliography)
                }
                readOnly={codeSubTab !== 'main.tex'}
                onChange={(e) => {
                  if (codeSubTab === 'main.tex') {
                    setEditableTex(e.target.value);
                    setIsTexDirty(true);
                  }
                }}
                spellCheck={false}
                className="h-full w-full resize-none bg-[#141413] p-3.5 font-mono text-[11.5px] leading-relaxed text-stone-100 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 4: HUMAN ERROR TRANSLATOR & AUTO-DOCTOR CARDS
            ================================================================= */}
        {rightInspectorTab === 'doctor' && (
          <div className="space-y-3">
            {diagnostics.length === 0 ? (
              <div className="studio-card p-5 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" />
                <div className="text-xs font-semibold text-stone-900">
                  100% Clean & Ready to Compile
                </div>
                <p className="text-[11px] leading-relaxed text-stone-500">
                  No unescaped `%`, `&`, or `#` symbols, no unclosed `$` math delimiters, and all tables fit within your page margins.
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    fixAllDoctorIssues(diagnostics);
                    toast.success('Fixed all LaTeX issues automatically!');
                  }}
                  className="btn-press flex w-full items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-xs"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Auto-Fix All {formatCount(diagnostics.length, 'Issue')}
                </button>

                {diagnostics.map((diag) => (
                  <div key={diag.id} className="studio-card p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-stone-900">
                        {diag.title}
                      </span>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900">
                        {diag.severity}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-600">
                      {diag.plainEnglishExplanation}
                    </p>
                    <div className="rounded-lg bg-stone-100 px-2.5 py-1.5 font-mono text-[10px] text-stone-500">
                      {diag.technicalDetail}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        applyDoctorFix(diag);
                        toast.success(`Fixed: ${diag.title}`);
                      }}
                      className="btn-press flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      <Wrench className="h-3 w-3" />
                      {diag.fixLabel}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
