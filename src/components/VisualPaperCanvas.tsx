import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  SlidersHorizontal,
  Plus,
  UserPlus,
  X,
  Heading1,
  Type,
  Sigma,
  Table,
  Image,
  GitBranch,
  Sparkles,
  BookMarked,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../store/useDocumentStore';
import { BlockType, DocumentBlock } from '../types/document';
import { MathRenderer, RichAcademicText } from './MathRenderer';
import { DiagramRenderer } from './DiagramRenderer';
import { getSafeInitials } from '../utils/formatters';

interface SortableBlockItemProps {
  block: DocumentBlock;
  index: number;
  isSelected: boolean;
  sectionNumberLabel: string;
  equationNumber: number;
  tableNumber: number;
  figureNumber: number;
  theoremNumber: number;
  algorithmNumber: number;
}

const SortableBlockCard: React.FC<SortableBlockItemProps> = ({
  block,
  index,
  isSelected,
  sectionNumberLabel,
  equationNumber,
  tableNumber,
  figureNumber,
  theoremNumber,
  algorithmNumber,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const {
    blocks,
    bibliography,
    setSelectedBlockId,
    setRightInspectorTab,
    setRightPanelOpen,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    nudgeBlock,
    addBlock,
    openStudioModal,
  } = useDocumentStore();

  const [editingInline, setEditingInline] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 30 : 1,
  };

  const isWideSpan =
    (block.type === 'table' && block.spanColumns) ||
    (block.type === 'figure' && block.placement === 'star') ||
    block.type === 'abstract';

  return (
    <div
      id={`canvas-block-${block.id}`}
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedBlockId(block.id);
      }}
      className={`group relative rounded-xl transition-colors ${
        isWideSpan ? 'col-span-full' : ''
      } ${
        isSelected
          ? 'ring-2 ring-stone-900/85 bg-stone-900/[0.018]'
          : 'hover:ring-1 hover:ring-stone-300/90'
      }`}
    >
      {/* Floating Word/Notion Block Action Bar */}
      <div
        className={`no-print absolute -top-3.5 right-2.5 z-20 flex items-center gap-0.5 rounded-lg border border-stone-200/90 bg-white px-1.5 py-0.5 shadow-sm transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800"
          title="Drag to reorder block"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <span className="px-1 font-mono text-[10px] font-semibold uppercase text-stone-500">
          {block.type}
        </span>

        {(block.type === 'equation' ||
          block.type === 'table' ||
          block.type === 'diagram') && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openStudioModal(
                block.type === 'equation'
                  ? 'math'
                  : block.type === 'table'
                    ? 'table'
                    : 'diagram',
                block.id
              );
            }}
            className="btn-press flex items-center gap-1 rounded-md bg-stone-900 px-2 py-0.5 font-sans text-[10px] font-semibold text-white hover:bg-stone-800"
          >
            <SlidersHorizontal className="h-2.5 w-2.5" />
            Studio
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBlockId(block.id);
            setRightInspectorTab('inspector');
            setRightPanelOpen(true);
          }}
          className="btn-press rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          title="Inspect Block Properties"
        >
          <SlidersHorizontal className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nudgeBlock(block.id, 'up');
          }}
          disabled={index === 0}
          className="btn-press rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
          title="Move Up"
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nudgeBlock(block.id, 'down');
          }}
          disabled={index === blocks.length - 1}
          className="btn-press rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
          title="Move Down"
        >
          <ArrowDown className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            duplicateBlock(block.id);
            toast.success('Duplicated block');
          }}
          className="btn-press rounded p-1 text-stone-500 hover:bg-stone-100"
          title="Duplicate Block"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteBlock(block.id);
            toast.success('Removed block');
          }}
          className="btn-press rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600"
          title="Delete Block"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Pure Typeset Block Renderers (Zero Cluttered Form Inputs on Paper) */}
      <div className="px-2.5 py-2">
        {/* 1. ABSTRACT BLOCK */}
        {block.type === 'abstract' && (
          <div className="mx-auto max-w-[92%] rounded border-y border-stone-200/90 py-3 px-4">
            <div className="mb-1.5 text-center text-xs font-bold uppercase tracking-wider text-stone-900">
              Abstract
            </div>
            {isSelected && editingInline ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={block.content}
                  onChange={(e) =>
                    updateBlock(block.id, { content: e.target.value })
                  }
                  onBlur={() => setEditingInline(false)}
                  autoFocus
                  className="w-full rounded-lg border border-stone-400 bg-white p-2.5 font-sans text-xs leading-relaxed text-stone-900 focus:outline-none"
                />
              </div>
            ) : (
              <div
                onClick={() => setEditingInline(true)}
                className="cursor-text text-justify text-[0.92em] leading-relaxed"
              >
                <RichAcademicText
                  text={block.content}
                  bibliography={bibliography}
                  blocks={blocks}
                  onClickCitation={() => openStudioModal('citation')}
                />
                {block.keywords.length > 0 && (
                  <div className="mt-2 text-[0.9em]">
                    <strong className="italic">Keywords—</strong>
                    {block.keywords.join(', ')}.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. SECTION HEADING BLOCK */}
        {block.type === 'section' && (
          <div className="pt-2 pb-0.5">
            <div className="flex items-baseline gap-2">
              {block.numbered && (
                <span className="font-bold text-stone-900 tabular-nums">
                  {sectionNumberLabel}
                </span>
              )}
              <input
                type="text"
                value={block.title}
                onChange={(e) =>
                  updateBlock(block.id, { title: e.target.value })
                }
                className={`w-full bg-transparent font-bold text-stone-900 focus:bg-stone-100/70 focus:outline-none rounded px-1 ${
                  block.level === 1
                    ? 'text-lg heading-tight'
                    : block.level === 2
                      ? 'text-base'
                      : 'text-sm italic'
                }`}
              />
            </div>
          </div>
        )}

        {/* 3. RICH TEXT PARAGRAPH BLOCK */}
        {block.type === 'paragraph' && (
          <div>
            {isSelected && editingInline ? (
              <textarea
                rows={Math.max(3, Math.ceil(block.content.length / 85))}
                value={block.content}
                onChange={(e) => {
                  const val = e.target.value;
                  updateBlock(block.id, { content: val });
                  if (val.endsWith('/')) {
                    setSlashMenuOpen(true);
                  } else {
                    setSlashMenuOpen(false);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setEditingInline(false), 180);
                }}
                autoFocus
                className="w-full rounded-lg border border-stone-400 bg-white p-2.5 font-sans text-xs leading-relaxed text-stone-900 shadow-xs focus:outline-none"
                placeholder="Type naturally. Use **bold**, *italic*, $math$, \cite{key}, or type '/' for commands..."
              />
            ) : (
              <p
                onClick={() => setEditingInline(true)}
                className={`cursor-text leading-relaxed overflow-wrap-anywhere ${
                  block.align === 'center'
                    ? 'text-center'
                    : block.align === 'right'
                      ? 'text-right'
                      : 'text-justify'
                }`}
              >
                <RichAcademicText
                  text={block.content}
                  bibliography={bibliography}
                  blocks={blocks}
                  onClickCitation={() => openStudioModal('citation')}
                  onClickReference={(lbl) => {
                    const target = blocks.find(
                      (b) => 'label' in b && b.label === lbl
                    );
                    if (target) {
                      setSelectedBlockId(target.id);
                      document
                        .getElementById(`canvas-block-${target.id}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                />
              </p>
            )}
          </div>
        )}

        {/* 4. EQUATION BLOCK */}
        {block.type === 'equation' && (
          <div
            onDoubleClick={() => openStudioModal('math', block.id)}
            title="Double-click to open Visual Math Studio"
            className="my-1.5 flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-stone-100/50"
          >
            <div className="flex-1 overflow-x-auto text-center py-1">
              <MathRenderer latex={block.latex} displayMode={true} />
            </div>
            {block.numbered && (
              <span className="flex-shrink-0 font-serif text-sm text-stone-700 tabular-nums">
                ({equationNumber})
              </span>
            )}
          </div>
        )}

        {/* 5. EXCEL-STYLE TABLE BLOCK */}
        {block.type === 'table' && (
          <div
            onDoubleClick={() => openStudioModal('table', block.id)}
            title="Double-click to edit in Excel Table Studio"
            className="my-2.5 cursor-pointer space-y-2"
          >
            {block.caption && (
              <div className="text-center text-[0.9em] text-stone-800">
                <strong className="font-bold tabular-nums">
                  Table {tableNumber}:
                </strong>{' '}
                <RichAcademicText
                  text={block.caption}
                  bibliography={bibliography}
                  blocks={blocks}
                />
              </div>
            )}

            <div className="overflow-x-auto">
              <table
                className={`mx-auto border-collapse text-[0.88em] ${
                  block.autoFitWidth ? 'w-full' : 'w-auto min-w-[70%]'
                } ${
                  block.theme === 'booktabs' || block.theme === 'striped'
                    ? 'border-t-2 border-b-2 border-stone-900'
                    : block.theme === 'grid'
                      ? 'border border-stone-800'
                      : ''
                }`}
              >
                <thead>
                  <tr
                    className={
                      block.theme === 'booktabs' || block.theme === 'striped'
                        ? 'border-b border-stone-800'
                        : block.theme === 'grid'
                          ? 'border-b border-stone-800 bg-stone-100/60'
                          : 'border-b border-stone-300'
                    }
                  >
                    {block.headers.map((hdr, cIdx) => {
                      const align = block.alignments[cIdx] ?? 'c';
                      return (
                        <th
                          key={cIdx}
                          className={`px-3 py-1.5 font-bold text-stone-900 ${
                            block.theme === 'grid' ? 'border border-stone-700' : ''
                          } ${
                            align === 'l'
                              ? 'text-left'
                              : align === 'r'
                                ? 'text-right'
                                : 'text-center'
                          }`}
                        >
                          <RichAcademicText
                            text={hdr}
                            bibliography={bibliography}
                            blocks={blocks}
                          />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        block.theme === 'striped' && rIdx % 2 === 1
                          ? 'bg-stone-100/80'
                          : ''
                      }
                    >
                      {block.headers.map((_, cIdx) => {
                        const align = block.alignments[cIdx] ?? 'c';
                        return (
                          <td
                            key={cIdx}
                            className={`px-3 py-1 tabular-nums ${
                              block.theme === 'grid' ? 'border border-stone-700' : ''
                            } ${
                              align === 'l'
                                ? 'text-left'
                                : align === 'r'
                                  ? 'text-right'
                                  : 'text-center'
                            }`}
                          >
                            <RichAcademicText
                              text={row[cIdx] ?? ''}
                              bibliography={bibliography}
                              blocks={blocks}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. FIGURE & SUBFIGURE GRID BLOCK */}
        {block.type === 'figure' && (
          <div className="my-2.5 space-y-2 text-center">
            {block.layout !== 'single' && block.subfigures ? (
              <div
                className={`grid gap-3 ${
                  block.layout === 'grid-3' ? 'grid-cols-3' : 'grid-cols-2'
                }`}
              >
                {block.subfigures.map((sub, sIdx) => (
                  <div key={sub.id} className="space-y-1">
                    <img
                      src={sub.url}
                      alt={sub.caption}
                      className="mx-auto h-36 w-full rounded object-cover border border-stone-200"
                    />
                    <div className="text-[0.82em] text-stone-700">
                      <strong>({String.fromCharCode(97 + sIdx)})</strong>{' '}
                      {sub.caption}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="mx-auto"
                style={{ width: `${block.widthPercent}%` }}
              >
                <img
                  src={block.url}
                  alt={block.alt}
                  className={`mx-auto max-h-64 w-full rounded object-cover ${
                    block.bordered ? 'border-2 border-stone-800 p-1' : ''
                  }`}
                />
              </div>
            )}

            <div className="text-[0.9em] text-stone-800">
              <strong className="font-bold tabular-nums">
                Figure {figureNumber}:
              </strong>{' '}
              <RichAcademicText
                text={block.caption}
                bibliography={bibliography}
                blocks={blocks}
              />
            </div>
          </div>
        )}

        {/* 7. TIKZ / PGFPLOTS DIAGRAM BLOCK */}
        {block.type === 'diagram' && (
          <div
            onDoubleClick={() => openStudioModal('diagram', block.id)}
            title="Double-click to open Canva TikZ & Plot Studio"
            className="my-2.5 cursor-pointer space-y-2"
          >
            <DiagramRenderer block={block} />
            <div className="text-center text-[0.9em] text-stone-800">
              <strong className="font-bold tabular-nums">
                Figure {figureNumber}:
              </strong>{' '}
              <RichAcademicText
                text={block.caption}
                bibliography={bibliography}
                blocks={blocks}
              />
            </div>
          </div>
        )}

        {/* 8. CALLOUT / THEOREM / PROOF BLOCK */}
        {block.type === 'callout' && (
          <div
            className="my-2 rounded-r-md border-l-4 bg-stone-50/90 p-3.5 shadow-2xs"
            style={{ borderLeftColor: block.accentColor || '#1a56db' }}
          >
            <div className="font-bold text-stone-900">
              <span className="capitalize">{block.boxType}</span>
              {block.numbered ? ` ${theoremNumber}` : ''}
              {block.title ? ` (${block.title}).` : '.'}
            </div>
            {isSelected && editingInline ? (
              <textarea
                rows={3}
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
                onBlur={() => setEditingInline(false)}
                autoFocus
                className="mt-1.5 w-full rounded border border-stone-400 bg-white p-2 font-sans text-xs"
              />
            ) : (
              <div
                onClick={() => setEditingInline(true)}
                className={`mt-1 cursor-text leading-relaxed ${
                  ['theorem', 'lemma', 'proposition'].includes(block.boxType)
                    ? 'italic'
                    : ''
                }`}
              >
                <RichAcademicText
                  text={block.content}
                  bibliography={bibliography}
                  blocks={blocks}
                />
                {block.boxType === 'proof' && (
                  <span className="float-right font-serif">◻</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 9. ALGORITHM PSEUDOCODE BLOCK */}
        {block.type === 'algorithm' && (
          <div className="my-2.5 rounded border-y-2 border-stone-900 bg-white p-3 text-[0.9em]">
            <div className="border-b border-stone-300 pb-1.5 font-bold text-stone-900 tabular-nums">
              Algorithm {algorithmNumber}: {block.title}
            </div>
            <div className="mt-2 space-y-1 text-[0.92em]">
              <div>
                <strong>Input:</strong>{' '}
                <RichAcademicText
                  text={block.inputs}
                  bibliography={bibliography}
                  blocks={blocks}
                />
              </div>
              <div>
                <strong>Output:</strong>{' '}
                <RichAcademicText
                  text={block.outputs}
                  bibliography={bibliography}
                  blocks={blocks}
                />
              </div>
              <div className="mt-1.5 border-t border-stone-200 pt-1.5 space-y-1 font-mono text-[0.9em]">
                {block.steps.map((step, sIdx) => (
                  <div
                    key={step.id}
                    className="flex items-baseline gap-2"
                    style={{ paddingLeft: `${step.indent * 18}px` }}
                  >
                    <span className="w-4 text-[10px] text-stone-400 tabular-nums">
                      {sIdx + 1}:
                    </span>
                    <span className="font-serif">
                      {step.type === 'for' && <strong>for </strong>}
                      {step.type === 'if' && <strong>if </strong>}
                      {step.type === 'while' && <strong>while </strong>}
                      {step.type === 'return' && <strong>return </strong>}
                      <RichAcademicText
                        text={step.text}
                        bibliography={bibliography}
                        blocks={blocks}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 10. CODE LISTING BLOCK */}
        {block.type === 'code' && (
          <div className="my-2.5 overflow-hidden rounded-lg border border-stone-300 bg-[#181816] text-stone-100 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-stone-700 bg-stone-900 px-3 py-1.5 text-[11px] text-stone-400">
              <span>
                Listing ({block.language}): {block.caption}
              </span>
            </div>
            <textarea
              rows={Math.max(3, block.code.split('\n').length)}
              value={block.code}
              onChange={(e) => updateBlock(block.id, { code: e.target.value })}
              className="w-full bg-transparent p-3 font-mono text-[11.5px] leading-relaxed text-stone-100 focus:outline-none"
            />
          </div>
        )}

        {/* 11. LIST BLOCK */}
        {block.type === 'list' && (
          <div className="my-1.5 pl-5">
            {block.ordered ? (
              <ol className="list-decimal space-y-1">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx} className="leading-relaxed">
                    <RichAcademicText
                      text={item}
                      bibliography={bibliography}
                      blocks={blocks}
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc space-y-1">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx} className="leading-relaxed">
                    <RichAcademicText
                      text={item}
                      bibliography={bibliography}
                      blocks={blocks}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 12. PAGE BREAK BLOCK */}
        {block.type === 'pagebreak' && (
          <div className="my-4 flex items-center gap-3 text-stone-400">
            <div className="h-px flex-1 border-t border-dashed border-stone-300" />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              \newpage (Page Break)
            </span>
            <div className="h-px flex-1 border-t border-dashed border-stone-300" />
          </div>
        )}

        {/* 13. RAW LATEX ESCAPE HATCH BLOCK */}
        {block.type === 'raw_latex' && (
          <div className="my-2 rounded border border-stone-300 bg-stone-50 p-2.5 font-mono text-xs">
            <div className="mb-1 text-[10px] font-semibold uppercase text-stone-500">
              {block.description || 'Custom Raw LaTeX Block'}
            </div>
            <textarea
              rows={3}
              value={block.latex}
              onChange={(e) => updateBlock(block.id, { latex: e.target.value })}
              className="w-full bg-white p-2 font-mono text-xs text-stone-800 rounded border border-stone-200"
            />
          </div>
        )}
      </div>

      {/* Notion-Style Between-Block "+" Insertion Trigger */}
      <div className="no-print relative flex h-3 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSlashMenuOpen((v) => !v);
          }}
          className="btn-press flex items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-0.5 font-sans text-[10px] font-medium text-stone-600 shadow-2xs hover:border-stone-900 hover:text-stone-900"
        >
          <Plus className="h-2.5 w-2.5" />
          Insert Block
        </button>

        {slashMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="popover-surface absolute top-5 z-40 flex flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl font-sans"
          >
            {[
              { type: 'section' as BlockType, label: 'Section', icon: Heading1 },
              { type: 'paragraph' as BlockType, label: 'Paragraph', icon: Type },
              { type: 'equation' as BlockType, label: 'Equation', icon: Sigma },
              { type: 'table' as BlockType, label: 'Table', icon: Table },
              { type: 'figure' as BlockType, label: 'Figure', icon: Image },
              { type: 'diagram' as BlockType, label: 'TikZ', icon: GitBranch },
              { type: 'callout' as BlockType, label: 'Theorem', icon: Sparkles },
            ].map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.type}
                  type="button"
                  onClick={() => {
                    addBlock(it.type, block.id);
                    setSlashMenuOpen(false);
                  }}
                  className="btn-press flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  <Icon className="h-3 w-3 text-stone-800" />
                  {it.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const VisualPaperCanvas: React.FC = () => {
  const {
    config,
    updateConfig,
    blocks,
    bibliography,
    selectedBlockId,
    setSelectedBlockId,
    reorderBlocks,
    addBlock,
    openStudioModal,
    zoomPercent,
    setZoomPercent,
  } = useDocumentStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBlocks(String(active.id), String(over.id));
    }
  };

  const handleDropFromPalette = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData(
      'application/omnitex-block-type'
    ) as BlockType;
    if (blockType) {
      addBlock(blockType);
      toast.success(`Dropped ${blockType} block onto page`);
    }
  };

  // Precompute automatic academic numbering across all blocks
  let h1 = 0;
  let h2 = 0;
  let h3 = 0;
  let eqCount = 0;
  let tblCount = 0;
  let figCount = 0;
  let thmCount = 0;
  let algCount = 0;

  const numberedMeta = blocks.map((b) => {
    let secLabel = '';
    if (b.type === 'section' && b.numbered) {
      if (b.level === 1) {
        h1++;
        h2 = 0;
        h3 = 0;
        secLabel = `${h1}`;
      } else if (b.level === 2) {
        h2++;
        h3 = 0;
        secLabel = `${h1}.${h2}`;
      } else {
        h3++;
        secLabel = `${h1}.${h2}.${h3}`;
      }
    }
    if (b.type === 'equation' && b.numbered) eqCount++;
    if (b.type === 'table') tblCount++;
    if (b.type === 'figure' || b.type === 'diagram') figCount++;
    if (b.type === 'callout' && b.numbered) thmCount++;
    if (b.type === 'algorithm') algCount++;

    return {
      sectionNumberLabel: secLabel,
      equationNumber: eqCount,
      tableNumber: tblCount,
      figureNumber: figCount,
      theoremNumber: thmCount,
      algorithmNumber: algCount,
    };
  });

  const fontClass =
    config.fontFamily === 'helvetica' ? 'tex-paper-sans' : 'tex-paper';

  const baseFontSizePx =
    config.fontSize === '10pt' ? 14.5 : config.fontSize === '11pt' ? 15.5 : 16.5;

  const paddingPx = Math.round(config.marginInch * 56);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropFromPalette}
      onClick={() => setSelectedBlockId(null)}
      className="relative flex-1 overflow-y-auto px-4 pt-3 pb-16 sm:px-8"
    >
      {/* Floating Contextual Action Island (Framer / Figma / Craft Style) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="no-print sticky top-2 z-20 mx-auto mb-5 flex w-fit max-w-full flex-wrap items-center gap-1 rounded-2xl px-2.5 py-1.5 floating-island"
      >
        <button
          type="button"
          onClick={() => addBlock('section')}
          className="btn-press flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
          title="Add Section Heading"
        >
          <Heading1 className="h-3.5 w-3.5 text-stone-600" />
          <span>Section</span>
        </button>

        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="btn-press flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
          title="Add Paragraph"
        >
          <Type className="h-3.5 w-3.5 text-stone-600" />
          <span>Paragraph</span>
        </button>

        <div className="h-4 w-px bg-stone-200 mx-0.5" />

        <button
          type="button"
          onClick={() => openStudioModal('math', null)}
          className="btn-press flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
        >
          <Sigma className="h-3.5 w-3.5" />
          <span>Math Studio</span>
        </button>

        <button
          type="button"
          onClick={() => openStudioModal('table', null)}
          className="btn-press flex items-center gap-1.5 rounded-xl bg-stone-100 px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-200/80"
        >
          <Table className="h-3.5 w-3.5 text-stone-700" />
          <span>Table Studio</span>
        </button>

        <button
          type="button"
          onClick={() => openStudioModal('diagram', null)}
          className="btn-press flex items-center gap-1.5 rounded-xl bg-stone-100 px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-200/80"
        >
          <GitBranch className="h-3.5 w-3.5 text-stone-700" />
          <span>TikZ Studio</span>
        </button>

        <button
          type="button"
          onClick={() => addBlock('figure')}
          className="btn-press flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
        >
          <Image className="h-3.5 w-3.5 text-stone-600" />
          <span className="hidden md:inline">Figure</span>
        </button>

        <button
          type="button"
          onClick={() => openStudioModal('citation')}
          className="btn-press flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
        >
          <BookMarked className="h-3.5 w-3.5 text-stone-600" />
          <span>@Cite</span>
        </button>

        <div className="h-4 w-px bg-stone-200 mx-0.5 hidden sm:block" />

        {/* Tactile Zoom Pill */}
        <div className="hidden sm:flex items-center gap-0.5 text-xs text-stone-600 tabular-nums">
          <button
            type="button"
            onClick={() => setZoomPercent(zoomPercent - 10)}
            className="btn-press rounded-lg p-1 hover:bg-stone-100"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomPercent(100)}
            className="rounded px-1.5 py-0.5 font-mono text-[11px] font-medium hover:bg-stone-100"
            title="Reset Zoom to 100%"
          >
            {zoomPercent}%
          </button>
          <button
            type="button"
            onClick={() => setZoomPercent(zoomPercent + 10)}
            className="btn-press rounded-lg p-1 hover:bg-stone-100"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Realistic Paginated Paper Sheet */}
      <div
        className={`print-sheet paper-elevation mx-auto rounded-[4px] bg-white transition-transform origin-top ${fontClass}`}
        style={{
          maxWidth: config.paperSize === 'a4paper' ? '830px' : '850px',
          minHeight: '1080px',
          padding: `${paddingPx}px`,
          fontSize: `${baseFontSizePx}px`,
          lineHeight: config.lineSpacing * 1.45,
          transform: `scale(${zoomPercent / 100})`,
        }}
      >
        {/* Running Page Header (fancyhdr preview) */}
        {config.headerFooter.enabled && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openStudioModal('header_footer');
            }}
            title="Click to customize page headers & footers"
            className={`mb-6 flex cursor-pointer items-center justify-between pb-2 text-[0.76em] text-stone-500 hover:text-stone-900 ${
              config.headerFooter.showHeaderRule ? 'border-b border-stone-300' : ''
            }`}
          >
            <span className="truncate max-w-[32%]">
              {config.headerFooter.leftHeader.replace('\\thechapter', '1')}
            </span>
            <span className="truncate max-w-[32%] text-center">
              {config.headerFooter.centerHeader}
            </span>
            <span className="truncate max-w-[32%] text-right">
              {config.headerFooter.rightHeader.replace('\\thepage', '1')}
            </span>
          </div>
        )}

        {/* Document Title & Authors Block (\maketitle) */}
        {config.showTitleBlock && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-7 text-center space-y-3"
          >
            <textarea
              rows={Math.max(1, Math.ceil(config.title.length / 55))}
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              className="w-full resize-none bg-transparent text-center text-2xl font-bold text-stone-950 heading-display focus:bg-stone-50 focus:ring-1 focus:ring-stone-400 focus:outline-none rounded px-2"
            />

            {/* Authors Grid */}
            <div className="flex flex-wrap items-start justify-center gap-6 pt-1">
              {config.authors.map((author, aIdx) => (
                <div
                  key={author.id}
                  className="group/auth relative flex flex-col items-center max-w-xs min-w-0 px-2"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="no-print flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-stone-200 font-sans text-[10px] font-bold text-stone-700">
                      {getSafeInitials(author.name)}
                    </span>
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => {
                        const next = [...config.authors];
                        next[aIdx] = { ...author, name: e.target.value };
                        updateConfig({ authors: next });
                      }}
                      className="bg-transparent text-center text-sm font-semibold text-stone-900 focus:bg-stone-100 focus:outline-none rounded px-1"
                    />
                    {config.authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateConfig({
                            authors: config.authors.filter((_, i) => i !== aIdx),
                          })
                        }
                        className="no-print opacity-0 group-hover/auth:opacity-100 text-stone-400 hover:text-red-600"
                        title="Remove author"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={author.affiliation}
                    onChange={(e) => {
                      const next = [...config.authors];
                      next[aIdx] = { ...author, affiliation: e.target.value };
                      updateConfig({ authors: next });
                    }}
                    className="w-full bg-transparent text-center text-xs italic text-stone-600 focus:bg-stone-100 focus:outline-none rounded px-1"
                  />
                  <input
                    type="text"
                    value={author.email}
                    onChange={(e) => {
                      const next = [...config.authors];
                      next[aIdx] = { ...author, email: e.target.value };
                      updateConfig({ authors: next });
                    }}
                    className="w-full bg-transparent text-center font-mono text-[11px] text-stone-500 overflow-wrap-anywhere focus:bg-stone-100 focus:outline-none rounded px-1"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  updateConfig({
                    authors: [
                      ...config.authors,
                      {
                        id: `auth-${Date.now()}`,
                        name: 'Co-Author Name',
                        affiliation: 'University Department',
                        email: 'coauthor@university.edu',
                      },
                    ],
                  })
                }
                className="no-print btn-press self-center rounded-full border border-dashed border-stone-300 px-2.5 py-1 font-sans text-[11px] text-stone-500 hover:border-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                + Co-Author
              </button>
            </div>

            <div className="text-xs text-stone-500">{config.date}</div>
          </div>
        )}

        {/* Automatic Table of Contents (\tableofcontents) */}
        {config.showTableOfContents && (
          <div className="mb-6 rounded border border-stone-200 bg-stone-50/50 p-4">
            <div className="mb-2 text-sm font-bold text-stone-900">Contents</div>
            <div className="space-y-1 text-xs">
              {blocks.map((b, idx) => {
                if (b.type !== 'section') return null;
                const num = numberedMeta[idx].sectionNumberLabel;
                return (
                  <div
                    key={b.id}
                    className={`flex items-baseline justify-between ${
                      b.level === 2
                        ? 'pl-4'
                        : b.level === 3
                          ? 'pl-8'
                          : 'font-semibold'
                    }`}
                  >
                    <span>
                      {num && <span className="mr-2 tabular-nums">{num}</span>}
                      {b.title}
                    </span>
                    <span className="mx-2 flex-1 border-b border-dotted border-stone-300" />
                    <span className="tabular-nums">1</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sortable Document Blocks Canvas */}
        {blocks.length === 0 ? (
          <div className="my-16 rounded-2xl border border-dashed border-stone-300 bg-stone-50/40 p-12 text-center font-sans space-y-3">
            <div className="text-sm font-semibold text-stone-900">
              Start Composing Your Manuscript
            </div>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Use the floating toolbar above or drag any component card from the left dock onto the page.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => addBlock('section')}
                className="btn-press rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white"
              >
                + Section Heading
              </button>
              <button
                type="button"
                onClick={() => addBlock('paragraph')}
                className="btn-press rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800"
              >
                + Rich Paragraph
              </button>
              <button
                type="button"
                onClick={() => openStudioModal('math', null)}
                className="btn-press rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800"
              >
                + Visual Equation
              </button>
              <button
                type="button"
                onClick={() => openStudioModal('table', null)}
                className="btn-press rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800"
              >
                + Spreadsheet Table
              </button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className={
                  config.columns === 2
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 items-start'
                    : 'space-y-2'
                }
              >
                {blocks.map((block, index) => (
                  <SortableBlockCard
                    key={block.id}
                    block={block}
                    index={index}
                    isSelected={block.id === selectedBlockId}
                    {...numberedMeta[index]}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Formatted References / Bibliography Section */}
        {bibliography.length > 0 && (
          <div className="mt-8 border-t border-stone-200 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">References</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openStudioModal('citation');
                }}
                className="no-print btn-press flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-1 font-sans text-[11px] font-medium text-stone-700 hover:bg-stone-200"
              >
                <BookMarked className="h-3 w-3" />
                Manage Citations ({bibliography.length})
              </button>
            </div>
            <ol className="space-y-1.5 text-[0.86em] text-stone-800">
              {bibliography.map((entry, idx) => (
                <li key={entry.id} className="flex gap-2 leading-snug">
                  <span className="flex-shrink-0 font-mono text-stone-500 tabular-nums">
                    [{idx + 1}]
                  </span>
                  <div className="min-w-0 flex-1 overflow-wrap-anywhere">
                    <span>{entry.author}, </span>
                    <span className="font-semibold">“{entry.title},” </span>
                    <em>{entry.journalOrVenue}</em>
                    {entry.volume ? `, vol. ${entry.volume}` : ''}
                    {entry.pages ? `, pp. ${entry.pages}` : ''}, {entry.year}.
                    {entry.doi && (
                      <span className="ml-1 font-mono text-[0.9em] text-blue-700">
                        doi:{entry.doi}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Running Page Footer (fancyhdr preview) */}
        {config.headerFooter.enabled && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              openStudioModal('header_footer');
            }}
            className={`mt-10 flex cursor-pointer items-center justify-between pt-2 text-[0.76em] text-stone-500 ${
              config.headerFooter.showFooterRule ? 'border-t border-stone-300' : ''
            }`}
          >
            <span>{config.headerFooter.leftFooter}</span>
            <span>
              {config.headerFooter.centerFooter.replace('\\thepage', '1')}
            </span>
            <span>
              {config.headerFooter.rightFooter.replace('\\thepage', '1')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
