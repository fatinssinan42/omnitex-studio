import React, { useState } from 'react';
import {
  Heading1,
  Type,
  Sigma,
  Table,
  Image,
  GitBranch,
  Sparkles,
  Terminal,
  Code,
  List,
  FileText,
  SeparatorHorizontal,
  Plus,
  Layers,
  ListTree,
  Search,
  BookMarked,
  GripVertical,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../store/useDocumentStore';
import { BlockType } from '../types/document';
import { formatCount } from '../utils/formatters';

interface LeftPaletteAndOutlineProps {
  width: number;
}

export const LeftPaletteAndOutline: React.FC<LeftPaletteAndOutlineProps> = ({
  width,
}) => {
  const {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    openStudioModal,
  } = useDocumentStore();

  const [tab, setTab] = useState<'blocks' | 'outline'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');

  const studioShowcaseCards = [
    {
      id: 'math' as const,
      title: 'Math & Matrix Studio',
      subtitle: 'Visual symbols, matrices & draw pad',
      icon: Sigma,
      badge: 'WYSIWYG',
    },
    {
      id: 'table' as const,
      title: 'Excel Table Studio',
      subtitle: 'Paste spreadsheets & booktabs',
      icon: Table,
      badge: 'CSV / Excel',
    },
    {
      id: 'diagram' as const,
      title: 'Canva TikZ & Plotter',
      subtitle: 'Drag nodes & plot f(x) curves',
      icon: GitBranch,
      badge: 'PGF / TikZ',
    },
    {
      id: 'citation' as const,
      title: 'Smart @Cite Finder',
      subtitle: 'Search Crossref by DOI or Title',
      icon: BookMarked,
      badge: 'Live API',
    },
  ];

  const blockCards: {
    type: BlockType;
    label: string;
    latexHint: string;
    category: 'Structure' | 'Visual & Data' | 'Academic';
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      type: 'section',
      label: 'Section Heading',
      latexHint: '\\section{}',
      category: 'Structure',
      icon: Heading1,
    },
    {
      type: 'paragraph',
      label: 'Rich Paragraph',
      latexHint: 'Prose + $math$',
      category: 'Structure',
      icon: Type,
    },
    {
      type: 'abstract',
      label: 'Abstract Card',
      latexHint: '\\begin{abstract}',
      category: 'Structure',
      icon: FileText,
    },
    {
      type: 'list',
      label: 'Bullet / Number List',
      latexHint: 'itemize / enum',
      category: 'Structure',
      icon: List,
    },
    {
      type: 'equation',
      label: 'Display Equation',
      latexHint: '\\begin{equation}',
      category: 'Visual & Data',
      icon: Sigma,
    },
    {
      type: 'table',
      label: 'Academic Table',
      latexHint: 'booktabs grid',
      category: 'Visual & Data',
      icon: Table,
    },
    {
      type: 'figure',
      label: 'Figure / Subfigures',
      latexHint: 'Pin [H] + 2×2',
      category: 'Visual & Data',
      icon: Image,
    },
    {
      type: 'diagram',
      label: 'TikZ / PGFPlot',
      latexHint: 'tikzpicture',
      category: 'Visual & Data',
      icon: GitBranch,
    },
    {
      type: 'callout',
      label: 'Theorem / Callout',
      latexHint: 'amsthm / box',
      category: 'Academic',
      icon: Sparkles,
    },
    {
      type: 'algorithm',
      label: 'Pseudocode Block',
      latexHint: 'algorithm2e',
      category: 'Academic',
      icon: Terminal,
    },
    {
      type: 'code',
      label: 'Code Listing',
      latexHint: 'lstlisting',
      category: 'Academic',
      icon: Code,
    },
    {
      type: 'pagebreak',
      label: 'Page Break',
      latexHint: '\\newpage',
      category: 'Structure',
      icon: SeparatorHorizontal,
    },
  ];

  const filteredBlocks = blockCards.filter(
    (b) =>
      b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.latexHint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute section numbers for outline tree
  let s1 = 0;
  let s2 = 0;
  let eqIdx = 0;
  let tblIdx = 0;
  let figIdx = 0;

  return (
    <aside
      style={{ width: `${width}px` }}
      className="no-print flex flex-shrink-0 flex-col border-r border-stone-200/80 bg-[#F9F8F6] select-none"
    >
      {/* Segmented Switcher */}
      <div className="border-b border-stone-200/80 p-2.5">
        <div className="grid grid-cols-2 rounded-xl bg-stone-200/75 p-1">
          <button
            type="button"
            onClick={() => setTab('blocks')}
            className={`btn-press flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium ${
              tab === 'blocks'
                ? 'bg-white text-stone-950 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Component Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('outline')}
            className={`btn-press flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium tabular-nums ${
              tab === 'outline'
                ? 'bg-white text-stone-950 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListTree className="h-3.5 w-3.5" />
            <span>Outline ({blocks.length})</span>
          </button>
        </div>
      </div>

      {tab === 'blocks' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Filter Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter blocks or LaTeX tags..."
              className="w-full rounded-xl border border-stone-200/90 bg-white py-2 pr-3 pl-8 text-xs text-stone-800 placeholder:text-stone-400 shadow-2xs focus:border-stone-400 focus:outline-none"
            />
          </div>

          {/* Interactive Power Studios Bento Section */}
          {!searchQuery && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Visual Power Studios
                </span>
                <span className="text-[10px] font-medium text-stone-400">
                  Zero Code
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {studioShowcaseCards.map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => openStudioModal(st.id, null)}
                      className="studio-card studio-card-interactive btn-press group flex items-center justify-between p-3 text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs group-hover:scale-105 transition-transform">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-semibold text-stone-900">
                              {st.title}
                            </span>
                            <span className="rounded-md bg-stone-100 px-1.5 py-0.2 text-[9px] font-semibold text-stone-600">
                              {st.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-stone-500">
                            {st.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-stone-300 group-hover:text-stone-900 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drag-and-Drop Block Bento Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Drag or Click to Insert
              </span>
              <span className="text-[10px] text-stone-400">
                12 Block Types
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {filteredBlocks.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'application/omnitex-block-type',
                        item.type
                      );
                    }}
                    onClick={() => {
                      addBlock(item.type);
                      toast.success(`Inserted ${item.label}`);
                    }}
                    className="studio-card studio-card-interactive btn-press group flex cursor-grab active:cursor-grabbing flex-col justify-between p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <GripVertical className="h-3.5 w-3.5 text-stone-300 group-hover:text-stone-500" />
                    </div>
                    <div className="mt-2.5">
                      <div className="truncate text-xs font-semibold text-stone-900">
                        {item.label}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] text-stone-400">
                        {item.latexHint}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Document Structure ({formatCount(blocks.length, 'block')})
            </span>
            <button
              type="button"
              onClick={() => addBlock('section')}
              className="btn-press flex items-center gap-1 rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-semibold text-white"
            >
              <Plus className="h-2.5 w-2.5" />
              Section
            </button>
          </div>

          <div className="space-y-1">
            {blocks.map((block) => {
              const isSelected = block.id === selectedBlockId;

              let badge = block.type.slice(0, 3).toUpperCase();
              if (block.type === 'section') {
                if (block.level === 1) {
                  s1++;
                  s2 = 0;
                  badge = `§${s1}`;
                } else if (block.level === 2) {
                  s2++;
                  badge = `§${s1}.${s2}`;
                } else {
                  badge = '§';
                }
              } else if (block.type === 'equation') {
                eqIdx++;
                badge = `Eq ${eqIdx}`;
              } else if (block.type === 'table') {
                tblIdx++;
                badge = `Tbl ${tblIdx}`;
              } else if (block.type === 'figure' || block.type === 'diagram') {
                figIdx++;
                badge = `Fig ${figIdx}`;
              }

              const title =
                block.type === 'section'
                  ? block.title
                  : block.type === 'abstract'
                    ? 'Abstract & Keywords'
                    : block.type === 'table'
                      ? block.caption || block.label
                      : block.type === 'figure' || block.type === 'diagram'
                        ? block.caption || block.label
                        : block.type === 'equation'
                          ? block.latex
                          : block.type === 'callout'
                            ? `${block.boxType}: ${block.title}`
                            : block.type === 'algorithm'
                              ? block.title
                              : block.type === 'paragraph'
                                ? block.content
                                : block.type;

              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => {
                    setSelectedBlockId(block.id);
                    document
                      .getElementById(`canvas-block-${block.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`btn-press flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                    block.type === 'section' && block.level === 2
                      ? 'pl-5'
                      : block.type !== 'section'
                        ? 'pl-4'
                        : ''
                  } ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white/80 text-stone-700 hover:bg-white ring-1 ring-stone-200/60'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : block.type === 'section'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {badge}
                  </span>
                  <span
                    className={`truncate ${
                      block.type === 'section' ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    {title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
