import { create } from 'zustand';
import {
  BibEntry,
  BlockType,
  DoctorDiagnostic,
  DocumentBlock,
  DocumentConfig,
  DocumentTemplateId,
  RibbonTab,
  WorkspaceMode,
} from '../types/document';
import {
  DOCUMENT_TEMPLATES,
  WORST_CASE_STRESS_PRESET,
} from '../engine/templates';
import { applyDoctorFixToBlocks } from '../engine/humanDoctor';
import { parseLatexSourceToDocument } from '../engine/latexParser';

export type ActiveStudioModal =
  | 'none'
  | 'math'
  | 'table'
  | 'diagram'
  | 'citation'
  | 'templates'
  | 'import'
  | 'header_footer';

export type DatasetMode = 'demo' | 'worst_case' | 'empty';
export type RightInspectorTab = 'inspector' | 'document' | 'latex' | 'doctor';

interface HistorySnapshot {
  config: DocumentConfig;
  blocks: DocumentBlock[];
  bibliography: BibEntry[];
}

interface DocumentStoreState {
  mode: WorkspaceMode;
  activeRibbonTab: RibbonTab;
  config: DocumentConfig;
  blocks: DocumentBlock[];
  bibliography: BibEntry[];
  selectedBlockId: string | null;
  activeModal: ActiveStudioModal;
  editingBlockId: string | null;
  commandPaletteOpen: boolean;
  datasetMode: DatasetMode;
  zoomPercent: number;

  // Adjustable workspace layout state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  rightInspectorTab: RightInspectorTab;

  history: HistorySnapshot[];
  future: HistorySnapshot[];

  setMode: (mode: WorkspaceMode) => void;
  setActiveRibbonTab: (tab: RibbonTab) => void;
  setSelectedBlockId: (id: string | null) => void;
  openStudioModal: (modal: ActiveStudioModal, blockId?: string | null) => void;
  closeStudioModal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setZoomPercent: (zoom: number) => void;
  setDatasetMode: (mode: DatasetMode) => void;

  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setRightInspectorTab: (tab: RightInspectorTab) => void;

  updateConfig: (patch: Partial<DocumentConfig>) => void;
  addBlock: (
    type: BlockType,
    afterBlockId?: string | null,
    customPatch?: Partial<DocumentBlock>
  ) => string;
  updateBlock: (id: string, patch: Partial<DocumentBlock>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  nudgeBlock: (id: string, direction: 'up' | 'down') => void;
  setBlocks: (blocks: DocumentBlock[]) => void;

  addBibEntry: (entry: BibEntry) => void;
  removeBibEntry: (id: string) => void;
  insertCitationIntoSelectedBlock: (citeKey: string) => void;
  insertCrossRefIntoSelectedBlock: (label: string) => void;

  applyTemplate: (templateId: DocumentTemplateId) => void;
  applyDoctorFix: (diagnostic: DoctorDiagnostic) => void;
  fixAllDoctorIssues: (diagnostics: DoctorDiagnostic[]) => void;
  syncFromRawLatex: (texSource: string) => void;

  undo: () => void;
  redo: () => void;
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultBlock(type: BlockType): DocumentBlock {
  const id = makeId(type);
  switch (type) {
    case 'abstract':
      return {
        id,
        type: 'abstract',
        content:
          'Summarize your research question, methodology, principal findings, and broader implications here.',
        keywords: ['Keyword One', 'Keyword Two', 'LaTeX'],
      };
    case 'section':
      return {
        id,
        type: 'section',
        level: 1,
        title: 'New Section Heading',
        numbered: true,
        label: `sec:heading_${id.slice(-4)}`,
      };
    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        content:
          'Write naturally here just like Microsoft Word. Use **bold**, *italics*, inline math like $E = mc^2$, or type `/` for quick blocks.',
        align: 'justify',
      };
    case 'equation':
      return {
        id,
        type: 'equation',
        latex:
          'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\!\\left( -\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^{\\!2} \\right)',
        mode: 'single',
        numbered: true,
        label: `eq:formula_${id.slice(-4)}`,
        caption: '',
      };
    case 'table':
      return {
        id,
        type: 'table',
        caption: 'Summary of Experimental Evaluation Metrics',
        label: `tab:metrics_${id.slice(-4)}`,
        headers: ['Model / Method', 'Precision (%)', 'Recall (%)', 'F1-Score'],
        rows: [
          ['Baseline Approach', '84.2', '81.9', '83.0'],
          ['Proposed Architecture', '**93.8**', '**92.4**', '**93.1**'],
        ],
        alignments: ['l', 'c', 'c', 'c'],
        theme: 'booktabs',
        autoFitWidth: true,
      };
    case 'figure':
      return {
        id,
        type: 'figure',
        layout: 'single',
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80',
        alt: 'Scientific visualization diagram',
        caption:
          'Phase-space trajectory and convergence profile across synthetic evaluation benchmarks.',
        label: `fig:plot_${id.slice(-4)}`,
        widthPercent: 80,
        placement: 'H',
        bordered: false,
        subfigures: [
          {
            id: makeId('sub'),
            url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
            caption: 'Baseline manifold projection',
            label: `fig:sub_a_${id.slice(-3)}`,
          },
          {
            id: makeId('sub'),
            url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
            caption: 'Regularized latent space',
            label: `fig:sub_b_${id.slice(-3)}`,
          },
        ],
      };
    case 'diagram':
      return {
        id,
        type: 'diagram',
        variant: 'tikz-flow',
        caption: 'System processing pipeline rendered natively via PGF/TikZ.',
        label: `fig:tikz_${id.slice(-4)}`,
        nodes: [
          { id: 'n1', label: 'Raw Input $X$', shape: 'rounded', x: 70, y: 70, color: 'blue' },
          { id: 'n2', label: 'Encoder $\\Phi_\\theta$', shape: 'rect', x: 250, y: 70, color: 'emerald' },
          { id: 'n3', label: 'Prediction $\\hat{Y}$', shape: 'rounded', x: 430, y: 70, color: 'violet' },
        ],
        edges: [
          { id: 'e1', from: 'n1', to: 'n2', label: 'Embed', style: 'solid' },
          { id: 'e2', from: 'n2', to: 'n3', label: 'Decode', style: 'solid' },
        ],
        plotConfig: {
          title: 'Convergence Trajectory',
          xLabel: 'Iteration $t$',
          yLabel: 'Loss $\\mathcal{L}(t)$',
          xMin: 0,
          xMax: 10,
          grid: true,
          series: [
            {
              id: 's1',
              name: 'SGD Baseline',
              type: 'function',
              expression: '4*exp(-0.3*x) + 0.5',
              color: 'red',
            },
            {
              id: 's2',
              name: 'AdamW Cosine',
              type: 'function',
              expression: '4*exp(-0.65*x) + 0.15',
              color: 'blue',
            },
          ],
        },
      };
    case 'callout':
      return {
        id,
        type: 'callout',
        boxType: 'theorem',
        title: 'Convergence Guarantee',
        content:
          'Under $L$-smoothness and $\\mu$-strong convexity of the objective $f$, gradient descent with step size $\\eta = 1/L$ converges at a linear rate $\\mathcal{O}((1 - \\mu/L)^k)$.',
        label: `thm:conv_${id.slice(-4)}`,
        numbered: true,
        accentColor: '#1a56db',
      };
    case 'algorithm':
      return {
        id,
        type: 'algorithm',
        title: 'Iterative Optimization Procedure',
        label: `alg:opt_${id.slice(-4)}`,
        inputs: 'Initial parameters $\\theta_0$, learning rate $\\eta > 0$',
        outputs: 'Converged parameters $\\theta^*$',
        steps: [
          { id: makeId('st'), indent: 0, type: 'for', text: '$t = 1, 2, \\dots, T$ do' },
          {
            id: makeId('st'),
            indent: 1,
            type: 'statement',
            text: 'Compute gradient $g_t \\leftarrow \\nabla_\\theta \\mathcal{L}(\\theta_{t-1})$',
          },
          {
            id: makeId('st'),
            indent: 1,
            type: 'statement',
            text: 'Update $\\theta_t \\leftarrow \\theta_{t-1} - \\eta g_t$',
          },
          { id: makeId('st'), indent: 0, type: 'return', text: '$\\theta_T$' },
        ],
      };
    case 'code':
      return {
        id,
        type: 'code',
        language: 'python',
        caption: 'Reference PyTorch implementation of scaled attention.',
        label: `lst:code_${id.slice(-4)}`,
        code: `import torch\nimport torch.nn.functional as F\n\ndef scaled_dot_product_attention(q, k, v):\n    d_k = q.size(-1)\n    scores = torch.matmul(q, k.transpose(-2, -1)) / (d_k ** 0.5)\n    attn = F.softmax(scores, dim=-1)\n    return torch.matmul(attn, v)`,
        lineNumbers: true,
      };
    case 'list':
      return {
        id,
        type: 'list',
        ordered: false,
        items: [
          'First key contribution with inline math $\\alpha + \\beta = \\gamma$.',
          'Second methodological insight verified across benchmark datasets.',
          'Open-source reproducible artifact and Overleaf-ready `.tex` bundle.',
        ],
      };
    case 'pagebreak':
      return { id, type: 'pagebreak' };
    case 'raw_latex':
      return {
        id,
        type: 'raw_latex',
        description: 'Custom LaTeX Snippet',
        latex:
          '% Write any custom LaTeX macro or environment here\n\\noindent\\rule{\\textwidth}{0.4pt}',
      };
  }
}

const initialTemplate = DOCUMENT_TEMPLATES[0];

export const useDocumentStore = create<DocumentStoreState>((set, get) => {
  const pushHistory = () => {
    const { config, blocks, bibliography, history } = get();
    return {
      history: [
        ...history.slice(-24),
        {
          config: structuredClone(config),
          blocks: structuredClone(blocks),
          bibliography: structuredClone(bibliography),
        },
      ],
      future: [],
    };
  };

  return {
    mode: 'visual',
    activeRibbonTab: 'home',
    config: structuredClone(initialTemplate.config),
    blocks: structuredClone(initialTemplate.blocks),
    bibliography: structuredClone(initialTemplate.bibliography),
    selectedBlockId: initialTemplate.blocks[0]?.id ?? null,
    activeModal: 'none',
    editingBlockId: null,
    commandPaletteOpen: false,
    datasetMode: 'demo',
    zoomPercent: 100,

    leftPanelOpen: true,
    rightPanelOpen: true,
    leftPanelWidth: 300,
    rightPanelWidth: 360,
    rightInspectorTab: 'inspector',

    history: [],
    future: [],

    setMode: (mode) => {
      if (mode === 'visual') {
        set({ mode, leftPanelOpen: false, rightPanelOpen: true, rightInspectorTab: 'inspector' });
      } else if (mode === 'builder') {
        set({ mode, leftPanelOpen: true, rightPanelOpen: true, rightInspectorTab: 'inspector' });
      } else if (mode === 'split') {
        set({ mode, leftPanelOpen: true, rightPanelOpen: true, rightInspectorTab: 'latex', rightPanelWidth: 440 });
      } else {
        set({ mode });
      }
    },
    setActiveRibbonTab: (activeRibbonTab) => set({ activeRibbonTab }),
    setSelectedBlockId: (selectedBlockId) =>
      set((state) => ({
        selectedBlockId,
        rightInspectorTab:
          selectedBlockId && state.rightInspectorTab === 'document'
            ? 'inspector'
            : state.rightInspectorTab,
      })),

    openStudioModal: (activeModal, blockId = null) =>
      set({
        activeModal,
        editingBlockId: blockId ?? get().selectedBlockId,
      }),

    closeStudioModal: () => set({ activeModal: 'none', editingBlockId: null }),

    setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    setZoomPercent: (zoomPercent) =>
      set({ zoomPercent: Math.max(60, Math.min(150, zoomPercent)) }),

    setLeftPanelOpen: (leftPanelOpen) => set({ leftPanelOpen }),
    setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
    setLeftPanelWidth: (w) =>
      set({ leftPanelWidth: Math.max(240, Math.min(440, w)) }),
    setRightPanelWidth: (w) =>
      set({ rightPanelWidth: Math.max(300, Math.min(660, w)) }),
    setRightInspectorTab: (rightInspectorTab) =>
      set({ rightInspectorTab, rightPanelOpen: true }),

    setDatasetMode: (datasetMode) => {
      if (datasetMode === 'worst_case') {
        set({
          ...pushHistory(),
          datasetMode,
          config: structuredClone(WORST_CASE_STRESS_PRESET.config),
          blocks: structuredClone(WORST_CASE_STRESS_PRESET.blocks),
          bibliography: structuredClone(WORST_CASE_STRESS_PRESET.bibliography),
          selectedBlockId: WORST_CASE_STRESS_PRESET.blocks[0]?.id ?? null,
        });
      } else if (datasetMode === 'empty') {
        set({
          ...pushHistory(),
          datasetMode,
          blocks: [],
          bibliography: [],
          selectedBlockId: null,
        });
      } else {
        set({
          ...pushHistory(),
          datasetMode: 'demo',
          config: structuredClone(initialTemplate.config),
          blocks: structuredClone(initialTemplate.blocks),
          bibliography: structuredClone(initialTemplate.bibliography),
          selectedBlockId: initialTemplate.blocks[0]?.id ?? null,
        });
      }
    },

    updateConfig: (patch) =>
      set((state) => ({
        ...pushHistory(),
        config: { ...state.config, ...patch },
      })),

    addBlock: (type, afterBlockId = null, customPatch = {}) => {
      const newBlock = {
        ...createDefaultBlock(type),
        ...customPatch,
      } as DocumentBlock;

      set((state) => {
        const hist = pushHistory();
        const targetId = afterBlockId ?? state.selectedBlockId;
        if (!targetId) {
          return {
            ...hist,
            blocks: [...state.blocks, newBlock],
            selectedBlockId: newBlock.id,
          };
        }
        const idx = state.blocks.findIndex((b) => b.id === targetId);
        if (idx === -1) {
          return {
            ...hist,
            blocks: [...state.blocks, newBlock],
            selectedBlockId: newBlock.id,
          };
        }
        const next = [...state.blocks];
        next.splice(idx + 1, 0, newBlock);
        return {
          ...hist,
          blocks: next,
          selectedBlockId: newBlock.id,
        };
      });

      return newBlock.id;
    },

    updateBlock: (id, patch) =>
      set((state) => ({
        ...pushHistory(),
        blocks: state.blocks.map((b) =>
          b.id === id ? ({ ...b, ...patch } as DocumentBlock) : b
        ),
      })),

    deleteBlock: (id) =>
      set((state) => {
        const hist = pushHistory();
        const idx = state.blocks.findIndex((b) => b.id === id);
        const next = state.blocks.filter((b) => b.id !== id);
        const nextSelected =
          state.selectedBlockId === id
            ? (next[Math.max(0, idx - 1)]?.id ?? next[0]?.id ?? null)
            : state.selectedBlockId;
        return {
          ...hist,
          blocks: next,
          selectedBlockId: nextSelected,
        };
      }),

    duplicateBlock: (id) =>
      set((state) => {
        const idx = state.blocks.findIndex((b) => b.id === id);
        if (idx === -1) return state;
        const hist = pushHistory();
        const original = state.blocks[idx];
        const copy = {
          ...structuredClone(original),
          id: makeId(original.type),
        } as DocumentBlock;
        const next = [...state.blocks];
        next.splice(idx + 1, 0, copy);
        return {
          ...hist,
          blocks: next,
          selectedBlockId: copy.id,
        };
      }),

    reorderBlocks: (activeId, overId) =>
      set((state) => {
        if (activeId === overId) return state;
        const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
        const newIndex = state.blocks.findIndex((b) => b.id === overId);
        if (oldIndex === -1 || newIndex === -1) return state;
        const hist = pushHistory();
        const next = [...state.blocks];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        return {
          ...hist,
          blocks: next,
        };
      }),

    nudgeBlock: (id, direction) =>
      set((state) => {
        const idx = state.blocks.findIndex((b) => b.id === id);
        if (idx === -1) return state;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= state.blocks.length) return state;
        const hist = pushHistory();
        const next = [...state.blocks];
        const [moved] = next.splice(idx, 1);
        next.splice(targetIdx, 0, moved);
        return {
          ...hist,
          blocks: next,
        };
      }),

    setBlocks: (blocks) =>
      set({
        ...pushHistory(),
        blocks,
        selectedBlockId: blocks[0]?.id ?? null,
      }),

    addBibEntry: (entry) =>
      set((state) => {
        const exists = state.bibliography.some((b) => b.id === entry.id);
        const updatedBib = exists
          ? state.bibliography.map((b) => (b.id === entry.id ? entry : b))
          : [...state.bibliography, entry];
        return {
          ...pushHistory(),
          bibliography: updatedBib,
        };
      }),

    removeBibEntry: (id) =>
      set((state) => ({
        ...pushHistory(),
        bibliography: state.bibliography.filter((b) => b.id !== id),
      })),

    insertCitationIntoSelectedBlock: (citeKey) =>
      set((state) => {
        const targetId = state.selectedBlockId;
        const citeToken = ` \\cite{${citeKey}}`;
        if (targetId) {
          const target = state.blocks.find((b) => b.id === targetId);
          if (
            target &&
            (target.type === 'paragraph' ||
              target.type === 'abstract' ||
              target.type === 'callout')
          ) {
            return {
              ...pushHistory(),
              blocks: state.blocks.map((b) =>
                b.id === targetId
                  ? ({
                      ...b,
                      content: `${(b as { content: string }).content}${citeToken}`,
                    } as DocumentBlock)
                  : b
              ),
            };
          }
        }
        const newPara = createDefaultBlock('paragraph') as DocumentBlock & {
          content: string;
        };
        newPara.content = `See related work in${citeToken}.`;
        return {
          ...pushHistory(),
          blocks: [...state.blocks, newPara],
          selectedBlockId: newPara.id,
        };
      }),

    insertCrossRefIntoSelectedBlock: (label) =>
      set((state) => {
        const targetId = state.selectedBlockId;
        const refToken = ` \\autoref{${label}}`;
        if (targetId) {
          const target = state.blocks.find((b) => b.id === targetId);
          if (
            target &&
            (target.type === 'paragraph' ||
              target.type === 'abstract' ||
              target.type === 'callout')
          ) {
            return {
              ...pushHistory(),
              blocks: state.blocks.map((b) =>
                b.id === targetId
                  ? ({
                      ...b,
                      content: `${(b as { content: string }).content}${refToken}`,
                    } as DocumentBlock)
                  : b
              ),
            };
          }
        }
        return state;
      }),

    applyTemplate: (templateId) => {
      const preset = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);
      if (!preset) return;
      set({
        ...pushHistory(),
        datasetMode: 'demo',
        config: structuredClone(preset.config),
        blocks: structuredClone(preset.blocks),
        bibliography: structuredClone(preset.bibliography),
        selectedBlockId: preset.blocks[0]?.id ?? null,
      });
    },

    applyDoctorFix: (diagnostic) =>
      set((state) => ({
        ...pushHistory(),
        blocks: applyDoctorFixToBlocks(diagnostic, state.blocks),
      })),

    fixAllDoctorIssues: (diagnostics) =>
      set((state) => {
        let current = state.blocks;
        for (const diag of diagnostics) {
          current = applyDoctorFixToBlocks(diag, current);
        }
        return {
          ...pushHistory(),
          blocks: current,
        };
      }),

    syncFromRawLatex: (texSource) =>
      set((state) => {
        const parsed = parseLatexSourceToDocument(texSource, state.config);
        return {
          ...pushHistory(),
          config: parsed.config,
          blocks: parsed.blocks,
          selectedBlockId: parsed.blocks[0]?.id ?? null,
        };
      }),

    undo: () =>
      set((state) => {
        if (state.history.length === 0) return state;
        const previous = state.history[state.history.length - 1];
        const remaining = state.history.slice(0, -1);
        return {
          config: previous.config,
          blocks: previous.blocks,
          bibliography: previous.bibliography,
          history: remaining,
          future: [
            {
              config: state.config,
              blocks: state.blocks,
              bibliography: state.bibliography,
            },
            ...state.future.slice(0, 24),
          ],
        };
      }),

    redo: () =>
      set((state) => {
        if (state.future.length === 0) return state;
        const [next, ...restFuture] = state.future;
        return {
          config: next.config,
          blocks: next.blocks,
          bibliography: next.bibliography,
          history: [
            ...state.history,
            {
              config: state.config,
              blocks: state.blocks,
              bibliography: state.bibliography,
            },
          ],
          future: restFuture,
        };
      }),
  };
});
