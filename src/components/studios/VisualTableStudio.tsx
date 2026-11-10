import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ClipboardPaste,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../../store/useDocumentStore';
import { TableBlock } from '../../types/document';
import { serializeTableBlock } from '../../engine/latexSerializer';

export const VisualTableStudio: React.FC = () => {
  const {
    activeModal,
    editingBlockId,
    blocks,
    updateBlock,
    addBlock,
    closeStudioModal,
  } = useDocumentStore();

  const existingTable = blocks.find(
    (b) => b.id === editingBlockId && b.type === 'table'
  ) as TableBlock | undefined;

  const [caption, setCaption] = useState(
    existingTable?.caption ?? 'Empirical comparison across benchmark configurations.'
  );
  const [label, setLabel] = useState(existingTable?.label ?? 'tab:comparison');
  const [headers, setHeaders] = useState<string[]>(
    existingTable?.headers ?? ['Method', 'Dataset A', 'Dataset B', 'Runtime (ms)']
  );
  const [rows, setRows] = useState<string[][]>(
    existingTable?.rows ?? [
      ['Standard Baseline', '81.4', '79.2', '42.0'],
      ['OmniTeX Optimized', '**94.6**', '**92.8**', '**11.4**'],
    ]
  );
  const [alignments, setAlignments] = useState<('l' | 'c' | 'r')[]>(
    existingTable?.alignments ?? ['l', 'c', 'c', 'r']
  );
  const [theme, setTheme] = useState<TableBlock['theme']>(
    existingTable?.theme ?? 'booktabs'
  );
  const [autoFitWidth, setAutoFitWidth] = useState<boolean>(
    existingTable?.autoFitWidth ?? true
  );
  const [spanColumns, setSpanColumns] = useState<boolean>(
    existingTable?.spanColumns ?? false
  );
  const [pasteBoxOpen, setPasteBoxOpen] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');

  if (activeModal !== 'table') return null;

  const addColumn = () => {
    setHeaders((prev) => [...prev, `Column ${prev.length + 1}`]);
    setAlignments((prev) => [...prev, 'c']);
    setRows((prev) => prev.map((r) => [...r, '—']));
  };

  const removeColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    setHeaders((prev) => prev.filter((_, i) => i !== colIdx));
    setAlignments((prev) => prev.filter((_, i) => i !== colIdx));
    setRows((prev) => prev.map((r) => r.filter((_, i) => i !== colIdx)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, headers.map(() => '')]);
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== rowIdx));
  };

  const handleImportSpreadsheetText = () => {
    const lines = rawPasteText
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const grid = lines.map((line) =>
      line.split(delimiter).map((cell) => cell.trim())
    );
    const maxCols = Math.max(...grid.map((r) => r.length));
    const normalized = grid.map((r) =>
      Array.from({ length: maxCols }, (_, i) => r[i] ?? '')
    );

    setHeaders(normalized[0]);
    setRows(normalized.slice(1).length > 0 ? normalized.slice(1) : [normalized[0].map(() => '')]);
    setAlignments(normalized[0].map((_, i) => (i === 0 ? 'l' : 'c')));
    setPasteBoxOpen(false);
    setRawPasteText('');
    toast.success(`Imported ${normalized.length}×${maxCols} spreadsheet grid!`);
  };

  const previewLatex = serializeTableBlock({
    id: existingTable?.id ?? 'tbl-preview',
    type: 'table',
    caption,
    label,
    headers,
    rows,
    alignments,
    theme,
    autoFitWidth,
    spanColumns,
  });

  const handleSave = () => {
    const payload = {
      caption,
      label,
      headers,
      rows,
      alignments,
      theme,
      autoFitWidth,
      spanColumns,
    };
    if (existingTable) {
      updateBlock(existingTable.id, payload);
      toast.success('Updated table block');
    } else {
      addBlock('table', null, payload);
      toast.success('Inserted new table block');
    }
    closeStudioModal();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="modal-surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#FAF9F6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <TableIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 heading-tight">
                Excel-Style Visual Table Studio
              </h2>
              <p className="text-xs text-stone-500">
                Edit cells like a spreadsheet, paste from Excel/CSV, and export publication-grade booktabs LaTeX
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

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-stone-100/70 px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={addRow}
              className="btn-press flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              Add Row
            </button>
            <button
              type="button"
              onClick={addColumn}
              className="btn-press flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              Add Column
            </button>
            <button
              type="button"
              onClick={() => setPasteBoxOpen((v) => !v)}
              className="btn-press flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/20 hover:bg-emerald-100"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste from Excel / CSV
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as TableBlock['theme'])}
              className="rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800"
            >
              <option value="booktabs">Booktabs (Academic Journal Standard)</option>
              <option value="striped">Zebra Striped Rows (xcolor)</option>
              <option value="grid">Full Grid Borders (\hline)</option>
              <option value="minimal">Borderless Minimal</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={autoFitWidth}
                onChange={(e) => setAutoFitWidth(e.target.checked)}
                className="rounded accent-emerald-600"
              />
              Auto-Fit Page Width
            </label>

            <label className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={spanColumns}
                onChange={(e) => setSpanColumns(e.target.checked)}
                className="rounded accent-emerald-600"
              />
              Span 2 Columns (table*)
            </label>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {pasteBoxOpen && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50/50 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-emerald-950">
                Paste cells copied from Microsoft Excel, Google Sheets (Tab-separated), or CSV:
              </div>
              <textarea
                rows={4}
                value={rawPasteText}
                onChange={(e) => setRawPasteText(e.target.value)}
                placeholder={'Model\tAccuracy\tF1\nResNet-50\t91.2%\t0.90\nViT-Large\t95.4%\t0.95'}
                className="w-full rounded border border-emerald-300 bg-white p-2 font-mono text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasteBoxOpen(false)}
                  className="btn-press rounded px-2.5 py-1 text-xs text-stone-600"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleImportSpreadsheetText}
                  className="btn-press rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Build Table from Paste
                </button>
              </div>
            </div>
          )}

          {/* Caption & Label */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label className="block text-[11px] font-medium text-stone-500">
                Table Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-stone-500">
                Cross-Ref Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Interactive Spreadsheet Grid */}
          <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-xs">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="w-10 px-2 py-2 text-center text-[10px] font-mono text-stone-400">
                    #
                  </th>
                  {headers.map((_, colIdx) => (
                    <th key={colIdx} className="border-l border-stone-200 px-2 py-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-0.5">
                          {(
                            [
                              { a: 'l', icon: AlignLeft },
                              { a: 'c', icon: AlignCenter },
                              { a: 'r', icon: AlignRight },
                            ] as const
                          ).map(({ a, icon: Icon }) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => {
                                const next = [...alignments];
                                next[colIdx] = a;
                                setAlignments(next);
                              }}
                              className={`rounded p-1 ${
                                alignments[colIdx] === a
                                  ? 'bg-stone-800 text-white'
                                  : 'text-stone-400 hover:bg-stone-200'
                              }`}
                              title={`Align column ${a === 'l' ? 'left' : a === 'c' ? 'center' : 'right'}`}
                            >
                              <Icon className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColumn(colIdx)}
                          className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete column"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>

                {/* Header Row Inputs */}
                <tr className="border-b-2 border-stone-800 bg-stone-100/70">
                  <td className="px-2 py-2 text-center font-mono text-[10px] font-semibold text-stone-500">
                    HDR
                  </td>
                  {headers.map((h, colIdx) => (
                    <td key={colIdx} className="border-l border-stone-200 p-1">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const next = [...headers];
                          next[colIdx] = e.target.value;
                          setHeaders(next);
                        }}
                        className="w-full rounded px-2 py-1 font-semibold text-stone-900 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`border-b border-stone-200 ${
                      theme === 'striped' && rIdx % 2 === 1 ? 'bg-stone-50/80' : 'bg-white'
                    }`}
                  >
                    <td className="px-2 py-1 text-center font-mono text-[10px] text-stone-400 tabular-nums">
                      <div className="flex items-center justify-center gap-1">
                        <span>{rIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeRow(rIdx)}
                          className="text-stone-300 hover:text-red-600"
                          title="Delete row"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    {headers.map((_, cIdx) => (
                      <td key={cIdx} className="border-l border-stone-200 p-1">
                        <input
                          type="text"
                          value={row[cIdx] ?? ''}
                          onChange={(e) => {
                            const next = rows.map((r) => [...r]);
                            next[rIdx][cIdx] = e.target.value;
                            setRows(next);
                          }}
                          placeholder="Cell value or $math$"
                          className="w-full rounded px-2 py-1 text-stone-800 tabular-nums focus:bg-blue-50/30 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live Generated LaTeX Code Preview */}
          <div className="rounded-lg border border-stone-200 bg-stone-900 p-3.5 text-stone-100">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-stone-400">
              <span>Live Generated booktabs / tabular LaTeX Code</span>
              <span className="font-mono text-emerald-400">100% Overleaf Compatible</span>
            </div>
            <pre className="max-h-36 overflow-auto font-mono text-[11px] leading-relaxed text-stone-200">
              {previewLatex}
            </pre>
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
            {existingTable ? 'Update Table Block' : 'Insert Table Block'}
          </button>
        </div>
      </div>
    </div>
  );
};
