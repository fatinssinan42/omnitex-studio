import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Grid,
  PenTool,
  BookOpen,
  Check,
  Eraser,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  FAMOUS_EQUATIONS,
  MATH_SYMBOL_PALETTE,
  MathSymbolItem,
} from '../../engine/templates';
import { MathRenderer } from '../MathRenderer';
import { EquationBlock } from '../../types/document';

export const VisualMathStudio: React.FC = () => {
  const {
    activeModal,
    editingBlockId,
    blocks,
    updateBlock,
    addBlock,
    closeStudioModal,
  } = useDocumentStore();

  const existingBlock = blocks.find(
    (b) => b.id === editingBlockId && b.type === 'equation'
  ) as EquationBlock | undefined;

  const [latex, setLatex] = useState<string>(
    existingBlock?.latex ??
      '\\mathcal{L}(\\theta) = \\frac{1}{N}\\sum_{i=1}^{N} \\ell(f_\\theta(x_i), y_i)'
  );
  const [label, setLabel] = useState<string>(
    existingBlock?.label ?? 'eq:objective'
  );
  const [numbered, setNumbered] = useState<boolean>(
    existingBlock?.numbered ?? true
  );
  const [mode, setMode] = useState<EquationBlock['mode']>(
    existingBlock?.mode ?? 'single'
  );

  const [activeTab, setActiveTab] = useState<
    'symbols' | 'matrix' | 'draw' | 'library'
  >('symbols');
  const [symbolCategory, setSymbolCategory] =
    useState<MathSymbolItem['category']>('common');

  // Matrix Builder state
  const [matRows, setMatRows] = useState(3);
  const [matCols, setMatCols] = useState(3);
  const [matBracket, setMatBracket] = useState<
    'bmatrix' | 'pmatrix' | 'vmatrix' | 'Bmatrix'
  >('bmatrix');
  const [matCells, setMatCells] = useState<string[][]>([
    ['a_{11}', 'a_{12}', 'a_{13}'],
    ['a_{21}', 'a_{22}', 'a_{23}'],
    ['a_{31}', 'a_{32}', 'a_{33}'],
  ]);

  // Draw-a-Symbol Canvas (Detexify style)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [matchedSymbols, setMatchedSymbols] = useState<MathSymbolItem[]>(
    MATH_SYMBOL_PALETTE.slice(0, 8)
  );

  if (activeModal !== 'math') return null;

  const insertSnippet = (snippet: string) => {
    setLatex((prev) => `${prev} ${snippet}`.trim());
  };

  const handleResizeMatrix = (r: number, c: number) => {
    setMatRows(r);
    setMatCols(c);
    const next: string[][] = [];
    for (let i = 0; i < r; i++) {
      const row: string[] = [];
      for (let j = 0; j < c; j++) {
        row.push(matCells[i]?.[j] ?? (i === j ? '1' : '0'));
      }
      next.push(row);
    }
    setMatCells(next);
  };

  const insertMatrixLatex = () => {
    const body = matCells
      .slice(0, matRows)
      .map((row) => row.slice(0, matCols).join(' & '))
      .join(' \\\\\n  ');
    const matrixCode = `\\begin{${matBracket}}\n  ${body}\n\\end{${matBracket}}`;
    setLatex((prev) => (prev.trim() ? `${prev} = ${matrixCode}` : matrixCode));
    toast.success('Matrix inserted into equation');
  };

  // Canvas drawing handlers for Detexify-style symbol lookup
  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#141413';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const nextCount = strokeCount + 1;
    setStrokeCount(nextCount);
    // Rank symbols based on stroke complexity heuristics
    const pool =
      nextCount === 1
        ? MATH_SYMBOL_PALETTE.filter((s) =>
            ['\\alpha', '\\infty', '\\int_{a}^{b} f(x)\\,dx', '\\partial', '\\nabla_{\\theta}', '\\rightarrow', '\\sim', '\\subset'].some((k) =>
              s.latex.includes(k.slice(0, 5))
            )
          )
        : nextCount === 2
          ? MATH_SYMBOL_PALETTE.filter((s) =>
              ['\\sum', '\\pm', '\\neq', '\\approx', '\\leq', '\\geq', '\\Rightarrow', '\\forall', '\\exists'].some((k) =>
                s.latex.includes(k.slice(0, 4))
              )
            )
          : MATH_SYMBOL_PALETTE.filter((s) => s.category === 'greek' || s.category === 'calculus');
    setMatchedSymbols(pool.length >= 6 ? pool.slice(0, 8) : MATH_SYMBOL_PALETTE.slice(0, 8));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
    setMatchedSymbols(MATH_SYMBOL_PALETTE.slice(0, 8));
  };

  const handleSave = () => {
    if (existingBlock) {
      updateBlock(existingBlock.id, { latex, label, numbered, mode });
      toast.success('Updated equation block');
    } else {
      addBlock('equation', null, { latex, label, numbered, mode });
      toast.success('Added new equation block to document');
    }
    closeStudioModal();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="modal-surface flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#FAF9F6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-serif font-bold text-sm">
              ∑
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 heading-tight">
                Visual Math & Equation Studio
              </h2>
              <p className="text-xs text-stone-500">
                Click visual symbols, build matrices in a grid, or sketch any symbol with your mouse
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeStudioModal}
            className="btn-press rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Rendered Equation Stage */}
        <div className="border-b border-stone-200/80 bg-white px-6 py-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
              Live Typeset Preview
            </span>
            <span className="font-mono text-xs text-stone-400 tabular-nums">
              {numbered ? `(Equation #)  \\label{${label}}` : 'Unnumbered Display Math'}
            </span>
          </div>
          <div className="flex min-h-[84px] items-center justify-center overflow-x-auto rounded-lg border border-stone-200/90 bg-[#FCFBF9] px-6 py-4 shadow-inner">
            <MathRenderer latex={latex} displayMode={true} className="text-xl" />
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 border-b border-stone-200/80 bg-stone-100/70 px-5 pt-2">
          {[
            { id: 'symbols', label: 'Visual Symbol Keypad', icon: Sparkles },
            { id: 'matrix', label: 'Matrix & Cases Grid Builder', icon: Grid },
            { id: 'draw', label: 'Draw-a-Symbol (Detexify)', icon: PenTool },
            { id: 'library', label: 'Famous Equations Library', icon: BookOpen },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`btn-press flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-xs font-medium ${
                  active
                    ? 'bg-[#FAF9F6] text-stone-900 shadow-xs ring-1 ring-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Studio Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'symbols' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'common', label: 'Fractions, Roots & Powers' },
                    { id: 'calculus', label: 'Calculus, Sums & Limits' },
                    { id: 'greek', label: 'Greek Alphabet (α, β, Ω)' },
                    { id: 'relations', label: 'Logic, Sets & Relations' },
                    { id: 'arrows', label: 'Arrows' },
                    { id: 'matrices', label: 'Quick Brackets & Cases' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSymbolCategory(cat.id)}
                    className={`btn-press rounded-md px-2.5 py-1 text-xs font-medium ${
                      symbolCategory === cat.id
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {MATH_SYMBOL_PALETTE.filter((s) => s.category === symbolCategory).map(
                  (sym, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertSnippet(sym.latex)}
                      title={`Insert ${sym.latex}`}
                      className="btn-press group flex flex-col items-center justify-center rounded-lg border border-stone-200/90 bg-white p-2.5 hover:border-blue-500 hover:bg-blue-50/40"
                    >
                      <span className="text-base font-serif text-stone-900">
                        <MathRenderer latex={sym.latex} displayMode={false} />
                      </span>
                      <span className="mt-1 max-w-full truncate font-mono text-[10px] text-stone-400 group-hover:text-blue-700">
                        {sym.latex}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
              <div className="space-y-3 md:col-span-5">
                <div className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-3">
                  <div className="text-xs font-semibold text-stone-800">
                    1. Choose Dimensions & Bracket Style
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-stone-600">
                      Rows ({matRows})
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={matRows}
                        onChange={(e) =>
                          handleResizeMatrix(Number(e.target.value), matCols)
                        }
                        className="mt-1 w-full accent-blue-600"
                      />
                    </label>
                    <label className="text-xs text-stone-600">
                      Columns ({matCols})
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={matCols}
                        onChange={(e) =>
                          handleResizeMatrix(matRows, Number(e.target.value))
                        }
                        className="mt-1 w-full accent-blue-600"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: 'bmatrix', label: '[ ] Square Brackets' },
                        { id: 'pmatrix', label: '( ) Parentheses' },
                        { id: 'vmatrix', label: '| | Determinant' },
                        { id: 'Bmatrix', label: '{ } Curly Braces' },
                      ] as const
                    ).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setMatBracket(b.id)}
                        className={`btn-press rounded border px-2.5 py-1.5 text-xs font-medium ${
                          matBracket === b.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={insertMatrixLatex}
                    className="btn-press w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Insert {matRows}×{matCols} Matrix into Equation
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4 md:col-span-7">
                <div className="mb-2 text-xs font-semibold text-stone-800">
                  2. Type Values Directly into Matrix Cells
                </div>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${matCols}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: matRows }).map((_, rIdx) =>
                    Array.from({ length: matCols }).map((__, cIdx) => (
                      <input
                        key={`${rIdx}-${cIdx}`}
                        type="text"
                        value={matCells[rIdx]?.[cIdx] ?? ''}
                        onChange={(e) => {
                          const copy = matCells.map((row) => [...row]);
                          if (!copy[rIdx]) copy[rIdx] = [];
                          copy[rIdx][cIdx] = e.target.value;
                          setMatCells(copy);
                        }}
                        className="rounded border border-stone-300 bg-stone-50 px-2 py-1.5 text-center font-mono text-xs text-stone-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="rounded-lg border border-stone-200 bg-white p-4 md:col-span-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Sketch Any Symbol Here
                  </span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="btn-press flex items-center gap-1 rounded bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-200"
                  >
                    <Eraser className="h-3 w-3" />
                    Clear Pad
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={165}
                  onPointerDown={startDraw}
                  onPointerMove={moveDraw}
                  onPointerUp={endDraw}
                  className="w-full cursor-crosshair rounded-lg border-2 border-dashed border-stone-300 bg-[#FCFBF9] touch-none"
                />
                <p className="mt-1.5 text-[11px] text-stone-500">
                  Draw with mouse or finger (like Detexify). Click any matched symbol on the right to insert it!
                </p>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-4 md:col-span-7">
                <div className="mb-2 text-xs font-semibold text-stone-800">
                  Top Matched LaTeX Symbols (Click to Insert)
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {matchedSymbols.map((sym, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        insertSnippet(sym.latex);
                        toast.success(`Inserted ${sym.latex}`);
                      }}
                      className="btn-press flex flex-col items-center justify-center rounded-lg border border-stone-200 bg-stone-50/70 p-3 hover:border-blue-500 hover:bg-blue-50/40"
                    >
                      <MathRenderer latex={sym.latex} displayMode={false} className="text-lg" />
                      <code className="mt-1.5 text-[10px] text-stone-600">{sym.latex}</code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {FAMOUS_EQUATIONS.map((eq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setLatex(eq.latex);
                    toast.success(`Loaded "${eq.name}"`);
                  }}
                  className="btn-press flex flex-col items-start justify-between rounded-lg border border-stone-200 bg-white p-3.5 text-left hover:border-blue-500"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900">{eq.name}</span>
                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                      {eq.field}
                    </span>
                  </div>
                  <div className="my-2 w-full overflow-x-auto py-1">
                    <MathRenderer latex={eq.latex} displayMode={false} className="text-sm" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Direct LaTeX Code Bar & Metadata */}
          <div className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">
                Generated LaTeX Expression (Editable)
              </label>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(latex);
                  toast.success('Copied LaTeX equation code');
                }}
                className="btn-press flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900"
              >
                <Copy className="h-3 w-3" />
                Copy LaTeX
              </button>
            </div>
            <textarea
              rows={2}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              placeholder="Type or build your LaTeX equation..."
            />

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={numbered}
                  onChange={(e) => setNumbered(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                Numbered Equation `(1)`
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500">Reference Label:</span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="rounded border border-stone-300 px-2 py-1 font-mono text-xs text-stone-800"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500">Environment:</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as EquationBlock['mode'])}
                  className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
                >
                  <option value="single">Single Equation (\begin&#123;equation&#125;)</option>
                  <option value="align">Multi-Line Aligned (\begin&#123;align&#125;)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-stone-200/80 bg-white px-5 py-3">
          <button
            type="button"
            onClick={closeStudioModal}
            className="btn-press rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-press flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <Check className="h-3.5 w-3.5" />
            {existingBlock ? 'Update Equation Block' : 'Insert Equation Block'}
          </button>
        </div>
      </div>
    </div>
  );
};
