import {
  BibEntry,
  DocumentBlock,
  DocumentConfig,
  DocumentTemplateId,
} from '../types/document';

export interface TemplatePreset {
  id: DocumentTemplateId;
  name: string;
  badge: string;
  description: string;
  config: DocumentConfig;
  blocks: DocumentBlock[];
  bibliography: BibEntry[];
}

export const DEFAULT_BIBLIOGRAPHY: BibEntry[] = [
  {
    id: 'vaswani2017attention',
    type: 'inproceedings',
    title: 'Attention Is All You Need',
    author: 'Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob',
    year: '2017',
    journalOrVenue: 'Advances in Neural Information Processing Systems (NeurIPS)',
    volume: '30',
    pages: '5998--6008',
    doi: '10.48550/arXiv.1706.03762',
  },
  {
    id: 'knuth1984texbook',
    type: 'book',
    title: 'The TeXbook',
    author: 'Knuth, Donald E.',
    year: '1984',
    journalOrVenue: 'Addison-Wesley Professional',
    pages: '1--483',
  },
  {
    id: 'lamport1994latex',
    type: 'book',
    title: 'LaTeX: A Document Preparation System',
    author: 'Lamport, Leslie',
    year: '1994',
    journalOrVenue: 'Addison-Wesley',
  },
];

export const DOCUMENT_TEMPLATES: TemplatePreset[] = [
  {
    id: 'ieee',
    name: 'IEEE Conference Paper',
    badge: '2-Column Standard',
    description:
      'Double-column IEEEtran layout with structured abstract, theorem boxes, booktabs tables, and vector TikZ architecture diagram.',
    config: {
      templateId: 'ieee',
      documentClass: 'IEEEtran',
      title: 'OmniTeX: Bridging Visual Direct Manipulation and Deterministic TeX Typesetting',
      subtitle: 'IEEE Transactions & Conference Format',
      date: 'November 2026',
      authors: [
        {
          id: 'auth-1',
          name: 'Elena Rostova',
          affiliation: 'Systems & Design Lab, ETH Zürich',
          email: 'erostova@ethz.ch',
        },
        {
          id: 'auth-2',
          name: 'Marcus Vance',
          affiliation: 'Human-Computer Interaction Group, MIT',
          email: 'mvance@mit.edu',
        },
      ],
      paperSize: 'letterpaper',
      fontSize: '10pt',
      columns: 2,
      columnGapMm: 6,
      marginInch: 0.75,
      lineSpacing: 1.0,
      fontFamily: 'times',
      citationStyle: 'ieee',
      accentColor: '#1a56db',
      showTableOfContents: false,
      showTitleBlock: true,
      headerFooter: {
        enabled: true,
        leftHeader: 'IEEE PREPRINT MANUSCRIPT',
        centerHeader: '',
        rightHeader: 'ROSTOVA & VANCE',
        leftFooter: '',
        centerFooter: '\\thepage',
        rightFooter: '',
        showHeaderRule: true,
        showFooterRule: false,
      },
      customPreamble: '',
    },
    blocks: [
      {
        id: 'blk-abs-1',
        type: 'abstract',
        content:
          'While Donald Knuth’s TeX engine \\cite{knuth1984texbook} remains the gold standard for scientific typography, new authors face a steep syntactic barrier when constructing multi-column layouts, complex matrices, and PGF/TikZ figures. We present **OmniTeX Studio**, a bidirectional AST authoring environment that unifies **Microsoft Word-style direct manipulation** with **lossless LaTeX code generation** \\cite{lamport1994latex}. Across user studies ($N = 148$), visual block authoring reduced table and equation construction time by $68.4\\%$ with zero compilation errors.',
        keywords: [
          'Visual Typesetting',
          'LaTeX AST',
          'Human-Centered Computing',
          'Scientific Publishing',
        ],
      },
      {
        id: 'blk-sec-1',
        type: 'section',
        level: 1,
        title: 'Introduction & Motivation',
        numbered: true,
        label: 'sec:intro',
      },
      {
        id: 'blk-para-1',
        type: 'paragraph',
        content:
          'Modern scientific communication relies heavily on structured typesetting \\cite{knuth1984texbook, lamport1994latex}. However, non-programmers migrating from word processors routinely struggle with preamble conflicts, float placement specifiers (`[htbp!]`), and tabular alignment tokens. As shown in \\autoref{fig:pipeline} and quantified in \\autoref{tab:benchmarks}, decoupling **visual intent** from **syntactic serialization** eliminates syntax errors while preserving full compatibility with Overleaf and arXiv.',
        align: 'justify',
      },
      {
        id: 'blk-eq-1',
        type: 'equation',
        latex:
          '\\mathcal{L}_{\\text{Attention}}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right)V + \\lambda \\sum_{i=1}^{N} \\|\\nabla_{\\theta} \\Phi(x_i)\\|_2^2',
        mode: 'single',
        numbered: true,
        label: 'eq:attention',
        caption: 'Regularized scaled dot-product objective.',
      },
      {
        id: 'blk-callout-1',
        type: 'callout',
        boxType: 'theorem',
        title: 'Bidirectional AST Isomorphism',
        content:
          'Let $\\mathcal{D}$ be a strongly-typed document block tree and $\\mathcal{S}(\\mathcal{D})$ be its deterministic LaTeX serialization. For every valid structural edit $T: \\mathcal{D} \\to \\mathcal{D}^{\\prime}$, the generated preamble $\\mathcal{P}(\\mathcal{D}^{\\prime})$ satisfies package dependency closure without manual intervention.',
        label: 'thm:isomorphism',
        numbered: true,
        accentColor: '#1a56db',
      },
      {
        id: 'blk-sec-2',
        type: 'section',
        level: 1,
        title: 'System Architecture & Visual Pipeline',
        numbered: true,
        label: 'sec:architecture',
      },
      {
        id: 'blk-diag-1',
        type: 'diagram',
        variant: 'tikz-flow',
        caption:
          'Bidirectional OmniTeX architecture linking the Visual Word Canvas, AST Engine, and deterministic LaTeX serializer.',
        label: 'fig:pipeline',
        nodes: [
          {
            id: 'n1',
            label: 'Visual Canvas',
            shape: 'rounded',
            x: 60,
            y: 70,
            color: 'blue',
          },
          {
            id: 'n2',
            label: 'Document AST',
            shape: 'rect',
            x: 230,
            y: 70,
            color: 'emerald',
          },
          {
            id: 'n3',
            label: 'Auto-Preamble',
            shape: 'diamond',
            x: 400,
            y: 35,
            color: 'amber',
          },
          {
            id: 'n4',
            label: 'Clean .tex / PDF',
            shape: 'rounded',
            x: 560,
            y: 70,
            color: 'violet',
          },
        ],
        edges: [
          { id: 'e1', from: 'n1', to: 'n2', label: '1:1 Sync', style: 'solid' },
          { id: 'e2', from: 'n2', to: 'n3', label: 'Inspect', style: 'solid' },
          { id: 'e3', from: 'n3', to: 'n4', label: 'Compile', style: 'solid' },
          { id: 'e4', from: 'n2', to: 'n4', label: 'SyncTeX', style: 'dashed', curved: true },
        ],
        plotConfig: {
          title: 'Authoring Velocity Comparison',
          xLabel: 'Document Complexity (Sections)',
          yLabel: 'Completion Time (min)',
          xMin: 1,
          xMax: 10,
          grid: true,
          series: [
            {
              id: 's1',
              name: 'Raw LaTeX',
              type: 'function',
              expression: '1.8*x^1.4 + 4',
              color: 'red',
            },
            {
              id: 's2',
              name: 'OmniTeX Visual',
              type: 'function',
              expression: '0.65*x + 2.5',
              color: 'blue',
            },
          ],
        },
      },
      {
        id: 'blk-sec-3',
        type: 'section',
        level: 1,
        title: 'Empirical Evaluation',
        numbered: true,
        label: 'sec:eval',
      },
      {
        id: 'blk-tbl-1',
        type: 'table',
        caption:
          'Empirical comparison of authoring workflows across 148 participants (mean $\\pm$ SD).',
        label: 'tab:benchmarks',
        headers: ['Workflow Paradigm', 'Table Task (s)', 'Math Task (s)', 'Syntax Errors', 'SUS Score'],
        rows: [
          ['Raw TeX IDE', '248.4 ± 41.2', '164.0 ± 29.5', '4.82', '61.4'],
          ['Word + Manual Conversion', '192.1 ± 35.8', '118.5 ± 22.1', '2.40', '68.9'],
          ['OmniTeX Studio (Ours)', '**64.2 ± 11.4**', '**49.8 ± 8.7**', '**0.00**', '**94.2**'],
        ],
        alignments: ['l', 'c', 'c', 'c', 'r'],
        theme: 'booktabs',
        autoFitWidth: true,
      },
      {
        id: 'blk-alg-1',
        type: 'algorithm',
        title: 'Deterministic Preamble Dependency Resolution',
        label: 'alg:preamble',
        inputs: 'Document config $C$, Block sequence $B = [b_1, \\dots, b_n]$',
        outputs: 'Ordered package set $\\mathcal{P}$ with conflict-free options',
        steps: [
          {
            id: 'st-1',
            indent: 0,
            type: 'statement',
            text: 'Initialize $\\mathcal{P} \\leftarrow \\{\\texttt{inputenc}, \\texttt{fontenc}, \\texttt{microtype}\\}$',
          },
          {
            id: 'st-2',
            indent: 0,
            type: 'for',
            text: 'each block $b_i \\in B$ do',
          },
          {
            id: 'st-3',
            indent: 1,
            type: 'statement',
            text: 'Resolve required environments $\\text{Req}(b_i)$ and merge into $\\mathcal{P}$',
          },
          {
            id: 'st-4',
            indent: 0,
            type: 'comment',
            text: 'Ensure hyperref and cleveref are always injected last',
          },
          {
            id: 'st-5',
            indent: 0,
            type: 'return',
            text: 'Topologically sorted preamble $\\mathcal{P}$',
          },
        ],
      },
    ],
    bibliography: DEFAULT_BIBLIOGRAPHY,
  },
  {
    id: 'article',
    name: 'Clean Academic Article',
    badge: 'Single Column',
    description:
      'Spacious single-column layout ideal for preprints, humanities, working papers, and arXiv submissions.',
    config: {
      templateId: 'article',
      documentClass: 'article',
      title: 'A Unified Theory of Direct-Manipulation Scientific Documents',
      date: 'November 2026',
      authors: [
        {
          id: 'auth-a1',
          name: 'Dr. Julian Mercer',
          affiliation: 'Oxford Internet Institute',
          email: 'j.mercer@ox.ac.uk',
        },
      ],
      paperSize: 'a4paper',
      fontSize: '11pt',
      columns: 1,
      columnGapMm: 8,
      marginInch: 1.0,
      lineSpacing: 1.15,
      fontFamily: 'cmr',
      citationStyle: 'apa',
      accentColor: '#0f766e',
      showTableOfContents: false,
      showTitleBlock: true,
      headerFooter: {
        enabled: true,
        leftHeader: 'Mercer (2026)',
        centerHeader: '',
        rightHeader: 'Working Paper',
        leftFooter: '',
        centerFooter: '\\thepage',
        rightFooter: '',
        showHeaderRule: true,
        showFooterRule: false,
      },
      customPreamble: '',
    },
    blocks: [
      {
        id: 'art-abs',
        type: 'abstract',
        content:
          'This article explores how structured visual blocks can represent complex mathematical and bibliographic manuscripts without exposing raw markup to the author.',
        keywords: ['Academic Writing', 'Typography', 'LaTeX'],
      },
      {
        id: 'art-sec-1',
        type: 'section',
        level: 1,
        title: 'Foundations of Visual Typesetting',
        numbered: true,
        label: 'sec:foundations',
      },
      {
        id: 'art-para-1',
        type: 'paragraph',
        content:
          'When authors write in Microsoft Word, they benefit from immediate visual feedback. When they compile in LaTeX \\cite{lamport1994latex}, they gain optimal paragraph breaking and mathematical clarity. Combining both yields an ergonomic writing experience.',
        align: 'justify',
      },
      {
        id: 'art-eq-1',
        type: 'equation',
        latex: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}',
        mode: 'single',
        numbered: true,
        label: 'eq:gaussian',
      },
    ],
    bibliography: DEFAULT_BIBLIOGRAPHY,
  },
  {
    id: 'thesis',
    name: 'University Thesis / Dissertation',
    badge: 'Book / Report Class',
    description:
      'Full thesis layout with Table of Contents, spacious 1.5x line spacing, Palatino typography, and chapter structure.',
    config: {
      templateId: 'thesis',
      documentClass: 'report',
      title: 'Scalable Neural Representations for Symbolic Mathematics',
      subtitle: 'Submitted in partial fulfillment of the requirements for the degree of Doctor of Philosophy',
      date: '2026',
      authors: [
        {
          id: 'th-1',
          name: 'Clara Lindqvist',
          affiliation: 'Department of Computer Science, KTH Royal Institute of Technology',
          email: 'claral@kth.se',
        },
      ],
      paperSize: 'a4paper',
      fontSize: '12pt',
      columns: 1,
      columnGapMm: 8,
      marginInch: 1.25,
      lineSpacing: 1.5,
      fontFamily: 'palatino',
      citationStyle: 'alpha',
      accentColor: '#7c2d12',
      showTableOfContents: true,
      showTitleBlock: true,
      headerFooter: {
        enabled: true,
        leftHeader: 'Chapter \\thechapter',
        centerHeader: '',
        rightHeader: 'Ph.D. Dissertation',
        leftFooter: 'KTH Stockholm',
        centerFooter: '',
        rightFooter: 'Page \\thepage',
        showHeaderRule: true,
        showFooterRule: true,
      },
      customPreamble: '',
    },
    blocks: [
      {
        id: 'th-abs',
        type: 'abstract',
        content:
          'This dissertation investigates neuro-symbolic methods for parsing, verifying, and typesetting mathematical derivations at scale.',
        keywords: ['Neuro-Symbolic AI', 'Formal Verification', 'Dissertation'],
      },
      {
        id: 'th-sec-1',
        type: 'section',
        level: 1,
        title: 'Chapter 1: Background and Literature Review',
        numbered: true,
        label: 'sec:ch1',
      },
      {
        id: 'th-para-1',
        type: 'paragraph',
        content:
          'Since the introduction of TeX by Knuth \\cite{knuth1984texbook} and the transformer architecture by Vaswani et al. \\cite{vaswani2017attention}, machine-assisted mathematical reasoning has grown rapidly.',
        align: 'justify',
      },
    ],
    bibliography: DEFAULT_BIBLIOGRAPHY,
  },
  {
    id: 'lab_report',
    name: 'STEM Homework & Lab Report',
    badge: 'Student Favorite',
    description:
      'Ready-to-use problem set and lab report with theorem/solution callouts, function plot, and data table.',
    config: {
      templateId: 'lab_report',
      documentClass: 'article',
      title: 'Physics 302: Quantum Harmonic Oscillator & Wavepacket Dispersion',
      date: 'November 10, 2026',
      authors: [
        {
          id: 'lab-1',
          name: 'Alex Rivera (ID: 904218)',
          affiliation: 'Department of Physics',
          email: 'arivera@university.edu',
        },
      ],
      paperSize: 'letterpaper',
      fontSize: '11pt',
      columns: 1,
      columnGapMm: 8,
      marginInch: 1.0,
      lineSpacing: 1.15,
      fontFamily: 'cmr',
      citationStyle: 'ieee',
      accentColor: '#2563eb',
      showTableOfContents: false,
      showTitleBlock: true,
      headerFooter: {
        enabled: true,
        leftHeader: 'PHYS 302 — Lab Report #4',
        centerHeader: '',
        rightHeader: 'A. Rivera',
        leftFooter: '',
        centerFooter: '\\thepage',
        rightFooter: '',
        showHeaderRule: true,
        showFooterRule: false,
      },
      customPreamble: '',
    },
    blocks: [
      {
        id: 'lab-sec-1',
        type: 'section',
        level: 1,
        title: 'Problem 1: Eigenstates of the 1D Harmonic Oscillator',
        numbered: true,
        label: 'sec:prob1',
      },
      {
        id: 'lab-call-1',
        type: 'callout',
        boxType: 'definition',
        title: 'Time-Independent Schrödinger Equation',
        content:
          'For a particle of mass $m$ in a quadratic potential $V(x) = \\frac{1}{2}m\\omega^2 x^2$, the Hamiltonian operator is given by:',
        label: 'def:tise',
        numbered: true,
        accentColor: '#2563eb',
      },
      {
        id: 'lab-eq-1',
        type: 'equation',
        latex:
          '\\hat{H}\\psi_n(x) = \\left(-\\frac{\\hbar^2}{2m}\\frac{d^2}{dx^2} + \\frac{1}{2}m\\omega^2 x^2\\right)\\psi_n(x) = \\hbar\\omega\\!\\left(n + \\frac{1}{2}\\right)\\psi_n(x)',
        mode: 'single',
        numbered: true,
        label: 'eq:schrodinger',
      },
    ],
    bibliography: [],
  },
  {
    id: 'cv',
    name: 'Academic CV & Research Resume',
    badge: 'Career & Grants',
    description:
      'Clean, high-density academic curriculum vitae with publications, education, and research appointments.',
    config: {
      templateId: 'cv',
      documentClass: 'article',
      title: 'Curriculum Vitae — Dr.Elena Rostova',
      date: 'Updated November 2026',
      authors: [
        {
          id: 'cv-1',
          name: 'Elena Rostova, Ph.D.',
          affiliation: 'ETH Zürich • Department of Computer Science •CAB G 61.2',
          email: 'erostova@ethz.ch',
        },
      ],
      paperSize: 'a4paper',
      fontSize: '10pt',
      columns: 1,
      columnGapMm: 8,
      marginInch: 0.75,
      lineSpacing: 1.0,
      fontFamily: 'garamond',
      citationStyle: 'ieee',
      accentColor: '#141413',
      showTableOfContents: false,
      showTitleBlock: true,
      headerFooter: {
        enabled: true,
        leftHeader: 'Elena Rostova — Curriculum Vitae',
        centerHeader: '',
        rightHeader: '\\thepage',
        leftFooter: '',
        centerFooter: '',
        rightFooter: '',
        showHeaderRule: true,
        showFooterRule: false,
      },
      customPreamble: '',
    },
    blocks: [
      {
        id: 'cv-sec-1',
        type: 'section',
        level: 1,
        title: 'Education & Academic Appointments',
        numbered: false,
        label: 'sec:edu',
      },
      {
        id: 'cv-tbl-1',
        type: 'table',
        caption: '',
        label: 'tab:cv_edu',
        headers: ['Years', 'Degree / Role', 'Institution', 'Focus / Thesis'],
        rows: [
          ['2023–Present', 'Assistant Professor', 'ETH Zürich', 'Human-Centered Programming Systems'],
          ['2018–2023', 'Ph.D. in Computer Science', 'MIT CSAIL', 'Bidirectional Document Compilers'],
          ['2014–2018', 'B.Sc. in Mathematics (Summa Cum Laude)', 'University of Cambridge', 'Algebraic Topology'],
        ],
        alignments: ['l', 'l', 'l', 'l'],
        theme: 'booktabs',
        autoFitWidth: true,
      },
    ],
    bibliography: DEFAULT_BIBLIOGRAPHY,
  },
];

/**
 * Worst-case realistic stress dataset (from Emil Kowalski's `break-ui` skill & CATALOG.md)
 * used to verify that long compound names, unbreakable emails, long DOIs, wide tables,
 * and diacritics never break the layout.
 */
export const WORST_CASE_STRESS_PRESET: TemplatePreset = {
  id: 'acm',
  name: 'Stress-Test Fixture (Worst-Case Data)',
  badge: 'Edge-Case Audit',
  description:
    'Realistic worst-case names, unbreakable emails, long German/Vietnamese titles, and 7-column tables.',
  config: {
    templateId: 'acm',
    documentClass: 'acmart',
    title:
      'Hochgeschwindigkeitsdokumentenkompilierung: A Multi-Institutional Longitudinal Study on Đặng Thị Ngọc Hân & Wiśniewska-Kowalczyk Formalisms',
    date: '2026-12-31',
    authors: [
      {
        id: 'wc-1',
        name: 'Aleksandra Wiśniewska-Kowalczyk',
        affiliation:
          'Senior Principal Research Scientist, Northwind-Industries-Holdings & International Institute for Advanced Epigraphic Computing',
        email: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com',
      },
      {
        id: 'wc-2',
        name: 'Jo',
        affiliation: 'Lab',
        email: 'a@b.co',
      },
      {
        id: 'wc-3',
        name: 'Đặng Thị Ngọc Hân',
        affiliation: 'Vietnam National University, Ho Chi Minh City',
        email: 'ops@sub.department.region.example.co.uk',
      },
    ],
    paperSize: 'a4paper',
    fontSize: '10pt',
    columns: 2,
    columnGapMm: 6,
    marginInch: 0.75,
    lineSpacing: 1.0,
    fontFamily: 'times',
    citationStyle: 'ieee',
    accentColor: '#1a56db',
    showTableOfContents: true,
    showTitleBlock: true,
    headerFooter: {
      enabled: true,
      leftHeader: 'Wiśniewska-Kowalczyk, Jo, & Đặng (2026)',
      centerHeader: '',
      rightHeader: 'Benachrichtigungseinstellungen',
      leftFooter: '',
      centerFooter: '\\thepage',
      rightFooter: '',
      showHeaderRule: true,
      showFooterRule: false,
    },
    customPreamble: '',
  },
  blocks: [
    {
      id: 'wc-sec-1',
      type: 'section',
      level: 1,
      title:
        'Unbreakable Strings, Diacritics (Ólafur Darri Ólafsson) & Unescaped R&D 99.4% Benchmarks',
      numbered: true,
      label: 'sec:worst_case_heading_with_very_long_identifier_9f8e7d6c_5b4a',
    },
    {
      id: 'wc-para-1',
      type: 'paragraph',
      content:
        'This paragraph deliberately includes realistic worst-case strings such as `https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved` and an unescaped 42.5% yield in the R&D division so you can test the Human Error Doctor and text wrapping simultaneously.',
      align: 'justify',
    },
    {
      id: 'wc-tbl-1',
      type: 'table',
      caption:
        'Seven-column cross-regional benchmark with extreme numerical precision and long identifiers.',
      label: 'tab:wc_7col',
      headers: [
        'Cohort Identifier',
        'Samples (N)',
        'Latency (ms)',
        'Throughput (req/s)',
        'Memory (MB)',
        'Delta (%)',
        'Verification Hash',
      ],
      rows: [
        [
          'Northwind-Enterprise-Cluster-EU-Central-1',
          '1,284,000',
          '12.04',
          '98,420.5',
          '4,096.0',
          '+142.8\\%',
          '`9f8e7d6c-5b4a`',
        ],
        ['Jo', '1', '0.09', '1.0', '12.4', '-3.2\\%', '`a0b9c8d7`'],
      ],
      alignments: ['l', 'r', 'r', 'r', 'r', 'r', 'c'],
      theme: 'striped',
      autoFitWidth: false, // Intentionally false so Doctor flags wide table!
    },
  ],
  bibliography: DEFAULT_BIBLIOGRAPHY,
};

export interface MathSymbolItem {
  label: string;
  latex: string;
  category: 'common' | 'greek' | 'calculus' | 'relations' | 'arrows' | 'matrices';
  keywords: string[];
}

export const MATH_SYMBOL_PALETTE: MathSymbolItem[] = [
  // Common
  { label: 'a/b', latex: '\\frac{a}{b}', category: 'common', keywords: ['fraction', 'divide'] },
  { label: '√x', latex: '\\sqrt{x}', category: 'common', keywords: ['sqrt', 'root'] },
  { label: 'ⁿ√x', latex: '\\sqrt[n]{x}', category: 'common', keywords: ['nth root'] },
  { label: 'x²', latex: 'x^{2}', category: 'common', keywords: ['power', 'superscript', 'square'] },
  { label: 'xᵢ', latex: 'x_{i}', category: 'common', keywords: ['subscript', 'index'] },
  { label: 'x̂', latex: '\\hat{x}', category: 'common', keywords: ['hat', 'estimator'] },
  { label: 'x̄', latex: '\\bar{x}', category: 'common', keywords: ['bar', 'mean', 'average'] },
  { label: 'x⃗', latex: '\\vec{x}', category: 'common', keywords: ['vector', 'arrow'] },
  { label: '‖x‖', latex: '\\|x\\|_2', category: 'common', keywords: ['norm', 'magnitude'] },
  { label: 'ℝ', latex: '\\mathbb{R}', category: 'common', keywords: ['real numbers', 'blackboard'] },
  { label: '𝔼[X]', latex: '\\mathbb{E}\\left[X\\right]', category: 'common', keywords: ['expectation'] },
  { label: '𝒪(n)', latex: '\\mathcal{O}(n \\log n)', category: 'common', keywords: ['big o', 'complexity'] },

  // Calculus & Sums
  { label: '∑', latex: '\\sum_{i=1}^{n}', category: 'calculus', keywords: ['sum', 'sigma'] },
  { label: '∏', latex: '\\prod_{i=1}^{n}', category: 'calculus', keywords: ['product', 'pi'] },
  { label: '∫', latex: '\\int_{a}^{b} f(x)\\,dx', category: 'calculus', keywords: ['integral'] },
  { label: '∬', latex: '\\iint_{\\Omega} f(x,y)\\,dA', category: 'calculus', keywords: ['double integral'] },
  { label: '∮', latex: '\\oint_{C} \\mathbf{F}\\cdot d\\mathbf{r}', category: 'calculus', keywords: ['contour integral'] },
  { label: '∂/∂x', latex: '\\frac{\\partial f}{\\partial x}', category: 'calculus', keywords: ['partial derivative'] },
  { label: '∇', latex: '\\nabla_{\\theta}', category: 'calculus', keywords: ['nabla', 'gradient'] },
  { label: 'lim', latex: '\\lim_{x \\to \\infty}', category: 'calculus', keywords: ['limit', 'infinity'] },
  { label: '∞', latex: '\\infty', category: 'calculus', keywords: ['infinity'] },

  // Greek
  { label: 'α', latex: '\\alpha', category: 'greek', keywords: ['alpha'] },
  { label: 'β', latex: '\\beta', category: 'greek', keywords: ['beta'] },
  { label: 'γ', latex: '\\gamma', category: 'greek', keywords: ['gamma'] },
  { label: 'Γ', latex: '\\Gamma', category: 'greek', keywords: ['capital gamma'] },
  { label: 'δ', latex: '\\delta', category: 'greek', keywords: ['delta'] },
  { label: 'Δ', latex: '\\Delta', category: 'greek', keywords: ['capital delta', 'change'] },
  { label: 'ε', latex: '\\varepsilon', category: 'greek', keywords: ['epsilon'] },
  { label: 'θ', latex: '\\theta', category: 'greek', keywords: ['theta'] },
  { label: 'Θ', latex: '\\Theta', category: 'greek', keywords: ['capital theta'] },
  { label: 'λ', latex: '\\lambda', category: 'greek', keywords: ['lambda', 'eigenvalue'] },
  { label: 'μ', latex: '\\mu', category: 'greek', keywords: ['mu', 'mean'] },
  { label: 'π', latex: '\\pi', category: 'greek', keywords: ['pi'] },
  { label: 'ρ', latex: '\\rho', category: 'greek', keywords: ['rho', 'density'] },
  { label: 'σ', latex: '\\sigma', category: 'greek', keywords: ['sigma', 'variance'] },
  { label: 'Σ', latex: '\\Sigma', category: 'greek', keywords: ['capital sigma', 'covariance'] },
  { label: 'τ', latex: '\\tau', category: 'greek', keywords: ['tau'] },
  { label: 'φ', latex: '\\varphi', category: 'greek', keywords: ['phi'] },
  { label: 'Φ', latex: '\\Phi', category: 'greek', keywords: ['capital phi'] },
  { label: 'ψ', latex: '\\psi', category: 'greek', keywords: ['psi', 'wavefunction'] },
  { label: 'Ψ', latex: '\\Psi', category: 'greek', keywords: ['capital psi'] },
  { label: 'ω', latex: '\\omega', category: 'greek', keywords: ['omega', 'frequency'] },
  { label: 'Ω', latex: '\\Omega', category: 'greek', keywords: ['capital omega', 'ohm'] },

  // Relations & Logic
  { label: '≤', latex: '\\leq', category: 'relations', keywords: ['less equal'] },
  { label: '≥', latex: '\\geq', category: 'relations', keywords: ['greater equal'] },
  { label: '≠', latex: '\\neq', category: 'relations', keywords: ['not equal'] },
  { label: '≈', latex: '\\approx', category: 'relations', keywords: ['approximately'] },
  { label: '≡', latex: '\\equiv', category: 'relations', keywords: ['equivalent', 'congruent'] },
  { label: '∝', latex: '\\propto', category: 'relations', keywords: ['proportional'] },
  { label: '∈', latex: '\\in', category: 'relations', keywords: ['in', 'element of'] },
  { label: '∉', latex: '\\notin', category: 'relations', keywords: ['not in'] },
  { label: '⊂', latex: '\\subset', category: 'relations', keywords: ['subset'] },
  { label: '⊆', latex: '\\subseteq', category: 'relations', keywords: ['subset equal'] },
  { label: '∪', latex: '\\cup', category: 'relations', keywords: ['union'] },
  { label: '∩', latex: '\\cap', category: 'relations', keywords: ['intersection'] },
  { label: '∀', latex: '\\forall', category: 'relations', keywords: ['for all'] },
  { label: '∃', latex: '\\exists', category: 'relations', keywords: ['exists'] },
  { label: '±', latex: '\\pm', category: 'relations', keywords: ['plus minus'] },
  { label: '⊗', latex: '\\otimes', category: 'relations', keywords: ['tensor product'] },

  // Arrows
  { label: '→', latex: '\\rightarrow', category: 'arrows', keywords: ['right arrow', 'to'] },
  { label: '⇒', latex: '\\Rightarrow', category: 'arrows', keywords: ['implies'] },
  { label: '⇔', latex: '\\iff', category: 'arrows', keywords: ['if and only if', 'iff'] },
  { label: '↦', latex: '\\mapsto', category: 'arrows', keywords: ['maps to'] },
  { label: '↑', latex: '\\uparrow', category: 'arrows', keywords: ['up arrow'] },
  { label: '↓', latex: '\\downarrow', category: 'arrows', keywords: ['down arrow'] },

  // Matrices & Structures
  {
    label: '[2×2]',
    latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
    category: 'matrices',
    keywords: ['bmatrix', 'bracket matrix'],
  },
  {
    label: '(2×2)',
    latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
    category: 'matrices',
    keywords: ['pmatrix', 'paren matrix'],
  },
  {
    label: '|A|',
    latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
    category: 'matrices',
    keywords: ['determinant', 'vmatrix'],
  },
  {
    label: '{cases',
    latex: 'f(x) = \\begin{cases} x^2 & \\text{if } x \\geq 0 \\\\ -x & \\text{otherwise} \\end{cases}',
    category: 'matrices',
    keywords: ['piecewise', 'cases'],
  },
];

export const FAMOUS_EQUATIONS: { name: string; field: string; latex: string }[] = [
  {
    name: 'Scaled Dot-Product Attention',
    field: 'Deep Learning',
    latex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
  },
  {
    name: 'Gaussian Normal Distribution',
    field: 'Statistics',
    latex: 'f(x \\mid \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\!\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right)',
  },
  {
    name: 'Bayes’ Theorem',
    field: 'Probability',
    latex: 'P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{\\sum_{i} P(B \\mid A_i)\\,P(A_i)}',
  },
  {
    name: 'Navier–Stokes Momentum Equation',
    field: 'Fluid Mechanics',
    latex: '\\rho \\left(\\frac{\\partial \\mathbf{u}}{\\partial t} + \\mathbf{u} \\cdot \\nabla \\mathbf{u}\\right) = -\\nabla p + \\mu \\nabla^2 \\mathbf{u} + \\mathbf{f}',
  },
  {
    name: 'Fourier Transform',
    field: 'Signal Processing',
    latex: '\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x)\\, e^{-2\\pi i x \\xi}\\,dx',
  },
  {
    name: 'Cross-Entropy Loss (KL Divergence)',
    field: 'Machine Learning',
    latex: '\\mathcal{L}_{\\text{CE}}(\\theta) = -\\frac{1}{N}\\sum_{i=1}^{N} \\sum_{c=1}^{C} y_{i,c} \\log \\hat{p}_{\\theta}(y_{i,c} \\mid x_i)',
  },
  {
    name: 'Black–Scholes PDE',
    field: 'Quantitative Finance',
    latex: '\\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} + rS\\frac{\\partial V}{\\partial S} - rV = 0',
  },
];
