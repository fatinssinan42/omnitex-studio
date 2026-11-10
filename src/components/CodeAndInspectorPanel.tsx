import React, { useState, useEffect } from 'react';
import {
  Copy,
  Download,
  RefreshCw,
  FileCode2,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../store/useDocumentStore';
import {
  serializeBibToBibtex,
  serializeBlockToLatex,
  serializeDocumentToLatex,
} from '../engine/latexSerializer';
import { downloadTextFile } from '../utils/formatters';

interface CodeAndInspectorPanelProps {
  fullWidth?: boolean;
}

export const CodeAndInspectorPanel: React.FC<CodeAndInspectorPanelProps> = ({
  fullWidth = false,
}) => {
  const {
    config,
    blocks,
    bibliography,
    selectedBlockId,
    syncFromRawLatex,
  } = useDocumentStore();

  const [activeFile, setActiveFile] = useState<'main.tex' | 'block.tex' | 'references.bib'>(
    'main.tex'
  );

  const generatedMainTex = React.useMemo(
    () => serializeDocumentToLatex(config, blocks, bibliography),
    [config, blocks, bibliography]
  );

  const [editableTex, setEditableTex] = useState(generatedMainTex);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setEditableTex(generatedMainTex);
    setIsDirty(false);
  }, [generatedMainTex]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedBlockTex = selectedBlock
    ? serializeBlockToLatex(selectedBlock)
    : '% Click any visual block on the left canvas to inspect its exact LaTeX code here.';

  const generatedBibTex = React.useMemo(
    () => serializeBibToBibtex(bibliography),
    [bibliography]
  );

  const displayedCode =
    activeFile === 'main.tex'
      ? editableTex
      : activeFile === 'block.tex'
        ? selectedBlockTex
        : generatedBibTex;

  return (
    <div
      className={`no-print flex flex-col border-l border-stone-800 bg-[#141413] text-stone-100 ${
        fullWidth ? 'w-1/2 flex-shrink-0' : 'w-[440px] xl:w-[500px] flex-shrink-0'
      }`}
    >
      {/* Code Panel Header */}
      <div className="flex items-center justify-between border-b border-stone-800 bg-[#1C1C1A] px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveFile('main.tex')}
            className={`btn-press flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs ${
              activeFile === 'main.tex'
                ? 'bg-stone-800 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
            main.tex
          </button>
          <button
            type="button"
            onClick={() => setActiveFile('block.tex')}
            className={`btn-press flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs ${
              activeFile === 'block.tex'
                ? 'bg-stone-800 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Block Inspector
          </button>
          <button
            type="button"
            onClick={() => setActiveFile('references.bib')}
            className={`btn-press flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs ${
              activeFile === 'references.bib'
                ? 'bg-stone-800 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookMarked className="h-3.5 w-3.5 text-amber-400" />
            references.bib
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {activeFile === 'main.tex' && isDirty && (
            <button
              type="button"
              onClick={() => {
                syncFromRawLatex(editableTex);
                setIsDirty(false);
                toast.success('Synced raw .tex edits to Visual Canvas!');
              }}
              className="btn-press flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500"
            >
              <RefreshCw className="h-3 w-3" />
              Sync to Visual
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(displayedCode);
              toast.success(`Copied ${activeFile} to clipboard`);
            }}
            className="btn-press rounded bg-stone-800 p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white"
            title="Copy Code"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              downloadTextFile(
                activeFile === 'references.bib' ? 'references.bib' : 'main.tex',
                displayedCode
              );
              toast.success(`Downloaded ${activeFile}`);
            }}
            className="btn-press rounded bg-stone-800 p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white"
            title="Download File"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-banner */}
      <div className="flex items-center justify-between border-b border-stone-800/80 bg-[#181816] px-3.5 py-1.5 text-[11px] text-stone-400">
        {activeFile === 'main.tex' ? (
          <span>
            Live Bidirectional `.tex` Source — Edit directly and click{' '}
            <strong className="text-stone-200">Sync to Visual</strong>
          </span>
        ) : activeFile === 'block.tex' ? (
          <span>
            Focused LaTeX snippet for selected block:{' '}
            <strong className="font-mono text-emerald-400">
              {selectedBlock ? `${selectedBlock.type} (${selectedBlock.id})` : 'None'}
            </strong>
          </span>
        ) : (
          <span>Auto-managed BibTeX database (`references.bib`)</span>
        )}
        <span className="font-mono text-[10px] text-stone-500 tabular-nums">
          {displayedCode.split('\n').length} lines
        </span>
      </div>

      {/* Code Editor Textarea with Line Numbers */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="select-none border-r border-stone-800/80 bg-[#141413] py-3 px-2.5 text-right font-mono text-[11px] leading-[1.6] text-stone-600 tabular-nums overflow-hidden">
          {displayedCode.split('\n').map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>
        <textarea
          value={displayedCode}
          readOnly={activeFile !== 'main.tex'}
          onChange={(e) => {
            if (activeFile === 'main.tex') {
              setEditableTex(e.target.value);
              setIsDirty(true);
            }
          }}
          spellCheck={false}
          className="flex-1 resize-none bg-[#141413] p-3 font-mono text-[12px] leading-[1.6] text-stone-100 focus:outline-none overflow-y-auto"
        />
      </div>
    </div>
  );
};
