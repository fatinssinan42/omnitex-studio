import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  GitBranch,
  LineChart,
  Check,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  DiagramBlock,
  PlotSeries,
  TikzEdge,
  TikzNode,
} from '../../types/document';
import { DiagramRenderer } from '../DiagramRenderer';
import { serializeDiagramToTikz } from '../../engine/latexSerializer';

export const VisualDiagramStudio: React.FC = () => {
  const {
    activeModal,
    editingBlockId,
    blocks,
    updateBlock,
    addBlock,
    closeStudioModal,
  } = useDocumentStore();

  const existingDiag = blocks.find(
    (b) => b.id === editingBlockId && b.type === 'diagram'
  ) as DiagramBlock | undefined;

  const [variant, setVariant] = useState<'tikz-flow' | 'pgfplot'>(
    existingDiag?.variant ?? 'tikz-flow'
  );
  const [caption, setCaption] = useState(
    existingDiag?.caption ?? 'System architecture and information flow diagram.'
  );
  const [label, setLabel] = useState(existingDiag?.label ?? 'fig:architecture');

  const [nodes, setNodes] = useState<TikzNode[]>(
    existingDiag?.nodes ?? [
      { id: 'n1', label: 'Input $x_t$', shape: 'rounded', x: 50, y: 70, color: 'blue' },
      { id: 'n2', label: 'Attention $\\Phi$', shape: 'rect', x: 240, y: 70, color: 'emerald' },
      { id: 'n3', label: 'Gate $\\sigma$', shape: 'diamond', x: 420, y: 70, color: 'amber' },
      { id: 'n4', label: 'Output $\\hat{y}_t$', shape: 'rounded', x: 555, y: 70, color: 'violet' },
    ]
  );

  const [edges, setEdges] = useState<TikzEdge[]>(
    existingDiag?.edges ?? [
      { id: 'e1', from: 'n1', to: 'n2', label: 'Embed', style: 'solid' },
      { id: 'e2', from: 'n2', to: 'n3', label: 'Context', style: 'solid' },
      { id: 'e3', from: 'n3', to: 'n4', label: 'Decode', style: 'solid' },
      { id: 'e4', from: 'n1', to: 'n4', label: 'Residual', style: 'dashed', curved: true },
    ]
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    nodes[0]?.id ?? null
  );

  const [plotConfig, setPlotConfig] = useState<DiagramBlock['plotConfig']>(
    existingDiag?.plotConfig ?? {
      title: 'Training & Validation Loss Curve',
      xLabel: 'Epoch $t$',
      yLabel: 'Loss $\\mathcal{L}(t)$',
      xMin: 0,
      xMax: 10,
      grid: true,
      series: [
        {
          id: 's1',
          name: 'Baseline SGD',
          type: 'function',
          expression: '3.5*exp(-0.28*x) + 0.45',
          color: 'red',
        },
        {
          id: 's2',
          name: 'OmniTeX Optimizer',
          type: 'function',
          expression: '3.5*exp(-0.62*x) + 0.12',
          color: 'blue',
        },
      ],
    }
  );

  if (activeModal !== 'diagram') return null;

  const previewBlock: DiagramBlock = {
    id: existingDiag?.id ?? 'diag-preview',
    type: 'diagram',
    variant,
    caption,
    label,
    nodes,
    edges,
    plotConfig,
  };

  const generatedTikz = serializeDiagramToTikz(previewBlock);

  const handleMoveNode = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const handleAddNode = () => {
    const nextIdx = nodes.length + 1;
    const newId = `n${Date.now().toString().slice(-3)}`;
    const newNode: TikzNode = {
      id: newId,
      label: `Stage ${nextIdx}`,
      shape: 'rounded',
      x: Math.min(540, 60 + ((nextIdx - 1) * 130) % 480),
      y: nextIdx % 2 === 0 ? 30 : 110,
      color: 'blue',
    };
    setNodes((prev) => [...prev, newNode]);
    if (nodes.length > 0) {
      const last = nodes[nodes.length - 1];
      setEdges((prev) => [
        ...prev,
        {
          id: `e${Date.now().toString().slice(-3)}`,
          from: last.id,
          to: newId,
          label: '',
          style: 'solid',
        },
      ]);
    }
    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 1) return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelectedNodeId(nodes.find((n) => n.id !== id)?.id ?? null);
  };

  const handleAddEdge = () => {
    if (nodes.length < 2) return;
    setEdges((prev) => [
      ...prev,
      {
        id: `e${Date.now().toString().slice(-4)}`,
        from: nodes[0].id,
        to: nodes[nodes.length - 1].id,
        label: 'Flow',
        style: 'solid',
        curved: false,
      },
    ]);
  };

  const handleAddSeries = () => {
    const newS: PlotSeries = {
      id: `s${Date.now().toString().slice(-3)}`,
      name: `Series ${plotConfig.series.length + 1}`,
      type: 'function',
      expression: 'sin(x) + 1.5',
      color: 'emerald',
    };
    setPlotConfig((prev) => ({ ...prev, series: [...prev.series, newS] }));
  };

  const handleSave = () => {
    const payload = { variant, caption, label, nodes, edges, plotConfig };
    if (existingDiag) {
      updateBlock(existingDiag.id, payload);
      toast.success('Updated TikZ / PGFPlots diagram block');
    } else {
      addBlock('diagram', null, payload);
      toast.success('Inserted new TikZ / PGFPlots diagram block');
    }
    closeStudioModal();
  };

  const activeNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="modal-surface flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#FAF9F6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <GitBranch className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 heading-tight">
                Canva-Style Visual TikZ & PGFPlots Studio
              </h2>
              <p className="text-xs text-stone-500">
                Drag nodes directly on the canvas or plot mathematical functions — compiles to 100% native PGF/TikZ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-stone-100 p-0.5 ring-1 ring-stone-200">
              <button
                type="button"
                onClick={() => setVariant('tikz-flow')}
                className={`btn-press flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium ${
                  variant === 'tikz-flow'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600'
                }`}
              >
                <GitBranch className="h-3.5 w-3.5" />
                TikZ Flowchart Canvas
              </button>
              <button
                type="button"
                onClick={() => setVariant('pgfplot')}
                className={`btn-press flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium ${
                  variant === 'pgfplot'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600'
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                PGFPlots Function Chart
              </button>
            </div>
            <button
              type="button"
              onClick={closeStudioModal}
              className="btn-press rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Interactive Canvas Stage */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">
                {variant === 'tikz-flow'
                  ? 'Interactive Canvas — Click & Drag Any Node to Reposition (1:1 Pointer Tracking)'
                  : 'Live PGFPlots Scientific Vector Preview'}
              </span>
              {variant === 'tikz-flow' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddNode}
                    className="btn-press flex items-center gap-1 rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Node
                  </button>
                  <button
                    type="button"
                    onClick={handleAddEdge}
                    className="btn-press flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Arrow Connection
                  </button>
                </div>
              )}
            </div>

            <DiagramRenderer
              block={previewBlock}
              interactive={variant === 'tikz-flow'}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onMoveNode={handleMoveNode}
            />
          </div>

          {variant === 'tikz-flow' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {/* Selected Node Inspector */}
              <div className="rounded-lg border border-stone-200 bg-white p-4 md:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Selected Node Properties
                  </span>
                  {activeNode && nodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNode(activeNode.id)}
                      className="btn-press flex items-center gap-1 rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete Node
                    </button>
                  )}
                </div>

                {activeNode ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-500">
                        Node Label (Supports $math$)
                      </label>
                      <input
                        type="text"
                        value={activeNode.label}
                        onChange={(e) =>
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === activeNode.id ? { ...n, label: e.target.value } : n
                            )
                          )
                        }
                        className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-500">
                          Shape
                        </label>
                        <select
                          value={activeNode.shape}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === activeNode.id
                                  ? { ...n, shape: e.target.value as TikzNode['shape'] }
                                  : n
                              )
                            )
                          }
                          className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs"
                        >
                          <option value="rounded">Rounded Box</option>
                          <option value="rect">Sharp Rectangle</option>
                          <option value="diamond">Decision Diamond</option>
                          <option value="circle">Circle / State</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-500">
                          Color Accent
                        </label>
                        <select
                          value={activeNode.color}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === activeNode.id ? { ...n, color: e.target.value } : n
                              )
                            )
                          }
                          className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs"
                        >
                          <option value="blue">Blue</option>
                          <option value="emerald">Emerald</option>
                          <option value="amber">Amber</option>
                          <option value="violet">Violet</option>
                          <option value="red">Crimson</option>
                          <option value="stone">Neutral Graphite</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">Click any node above to customize it.</p>
                )}
              </div>

              {/* Edges List */}
              <div className="rounded-lg border border-stone-200 bg-white p-4 md:col-span-7 space-y-2.5">
                <div className="text-xs font-semibold text-stone-800">
                  Directed Connections (Arrows)
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                  {edges.map((edge, idx) => (
                    <div
                      key={edge.id}
                      className="flex flex-wrap items-center gap-1.5 rounded border border-stone-200 bg-stone-50/70 p-2 text-xs"
                    >
                      <select
                        value={edge.from}
                        onChange={(e) => {
                          const next = [...edges];
                          next[idx] = { ...edge, from: e.target.value };
                          setEdges(next);
                        }}
                        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                      >
                        {nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-stone-400">→</span>
                      <select
                        value={edge.to}
                        onChange={(e) => {
                          const next = [...edges];
                          next[idx] = { ...edge, to: e.target.value };
                          setEdges(next);
                        }}
                        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                      >
                        {nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Arrow label"
                        value={edge.label ?? ''}
                        onChange={(e) => {
                          const next = [...edges];
                          next[idx] = { ...edge, label: e.target.value };
                          setEdges(next);
                        }}
                        className="w-24 flex-1 rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                      />
                      <select
                        value={edge.style}
                        onChange={(e) => {
                          const next = [...edges];
                          next[idx] = {
                            ...edge,
                            style: e.target.value as TikzEdge['style'],
                          };
                          setEdges(next);
                        }}
                        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                      <label className="flex items-center gap-1 text-[11px] text-stone-600">
                        <input
                          type="checkbox"
                          checked={Boolean(edge.curved)}
                          onChange={(e) => {
                            const next = [...edges];
                            next[idx] = { ...edge, curved: e.target.checked };
                            setEdges(next);
                          }}
                        />
                        Arc
                      </label>
                      <button
                        type="button"
                        onClick={() => setEdges((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500">
                    Plot Title
                  </label>
                  <input
                    type="text"
                    value={plotConfig.title}
                    onChange={(e) =>
                      setPlotConfig({ ...plotConfig, title: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-500">
                    X-Axis Label
                  </label>
                  <input
                    type="text"
                    value={plotConfig.xLabel}
                    onChange={(e) =>
                      setPlotConfig({ ...plotConfig, xLabel: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-500">
                    Y-Axis Label
                  </label>
                  <input
                    type="text"
                    value={plotConfig.yLabel}
                    onChange={(e) =>
                      setPlotConfig({ ...plotConfig, yLabel: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500">
                      xMin
                    </label>
                    <input
                      type="number"
                      value={plotConfig.xMin}
                      onChange={(e) =>
                        setPlotConfig({ ...plotConfig, xMin: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-xs tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500">
                      xMax
                    </label>
                    <input
                      type="number"
                      value={plotConfig.xMax}
                      onChange={(e) =>
                        setPlotConfig({ ...plotConfig, xMax: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-xs tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Plotted Functions $f(x)$
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSeries}
                    className="btn-press flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    <Plus className="h-3 w-3" />
                    Add Curve
                  </button>
                </div>
                {plotConfig.series.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => {
                        const next = [...plotConfig.series];
                        next[idx] = { ...s, name: e.target.value };
                        setPlotConfig({ ...plotConfig, series: next });
                      }}
                      className="w-40 rounded border border-stone-300 px-2.5 py-1 text-xs"
                      placeholder="Legend Name"
                    />
                    <input
                      type="text"
                      value={s.expression}
                      onChange={(e) => {
                        const next = [...plotConfig.series];
                        next[idx] = { ...s, expression: e.target.value };
                        setPlotConfig({ ...plotConfig, series: next });
                      }}
                      className="flex-1 rounded border border-stone-300 px-2.5 py-1 font-mono text-xs"
                      placeholder="e.g. 4*exp(-0.5*x) or sin(x)"
                    />
                    <select
                      value={s.color}
                      onChange={(e) => {
                        const next = [...plotConfig.series];
                        next[idx] = { ...s, color: e.target.value };
                        setPlotConfig({ ...plotConfig, series: next });
                      }}
                      className="rounded border border-stone-300 bg-white px-2 py-1 text-xs"
                    >
                      <option value="blue">Blue</option>
                      <option value="red">Red</option>
                      <option value="emerald">Emerald</option>
                      <option value="violet">Violet</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption, Label & Generated TikZ Preview */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label className="block text-[11px] font-medium text-stone-500">
                Figure Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-1 w-full rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-stone-500">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 w-full rounded border border-stone-300 bg-white px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-900 p-3.5 text-stone-100">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-stone-400">
              <span>Auto-Generated Native TikZ / PGFPlots Code</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedTikz);
                  toast.success('Copied TikZ code to clipboard');
                }}
                className="btn-press flex items-center gap-1 text-stone-300 hover:text-white"
              >
                <Copy className="h-3 w-3" />
                Copy TikZ
              </button>
            </div>
            <pre className="max-h-32 overflow-auto font-mono text-[11px] leading-relaxed text-stone-200">
              {generatedTikz}
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
            {existingDiag ? 'Update TikZ Figure' : 'Insert TikZ Figure'}
          </button>
        </div>
      </div>
    </div>
  );
};
