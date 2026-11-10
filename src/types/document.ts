export type WorkspaceMode = 'visual' | 'builder' | 'split' | 'code';

export type RibbonTab = 'home' | 'insert' | 'layout' | 'references' | 'design' | 'doctor';

export type DocumentTemplateId =
  | 'ieee'
  | 'acm'
  | 'thesis'
  | 'article'
  | 'lab_report'
  | 'cv'
  | 'beamer';

export type PaperSize = 'a4paper' | 'letterpaper';
export type FontFamilyId = 'times' | 'cmr' | 'palatino' | 'helvetica' | 'garamond';
export type CitationStyleId = 'ieee' | 'apa' | 'nature' | 'alpha';

export interface AuthorInfo {
  id: string;
  name: string;
  affiliation: string;
  email: string;
  orcid?: string;
}

export interface HeaderFooterConfig {
  enabled: boolean;
  leftHeader: string;
  centerHeader: string;
  rightHeader: string;
  leftFooter: string;
  centerFooter: string;
  rightFooter: string;
  showHeaderRule: boolean;
  showFooterRule: boolean;
}

export interface DocumentConfig {
  templateId: DocumentTemplateId;
  documentClass: 'article' | 'IEEEtran' | 'acmart' | 'report' | 'beamer';
  title: string;
  subtitle?: string;
  date: string;
  authors: AuthorInfo[];
  paperSize: PaperSize;
  fontSize: '10pt' | '11pt' | '12pt';
  columns: 1 | 2;
  columnGapMm: number;
  marginInch: number;
  lineSpacing: 1.0 | 1.15 | 1.5 | 2.0;
  fontFamily: FontFamilyId;
  citationStyle: CitationStyleId;
  accentColor: string;
  showTableOfContents: boolean;
  showTitleBlock: boolean;
  headerFooter: HeaderFooterConfig;
  customPreamble: string;
}

export type BlockType =
  | 'abstract'
  | 'section'
  | 'paragraph'
  | 'equation'
  | 'table'
  | 'figure'
  | 'diagram'
  | 'callout'
  | 'algorithm'
  | 'code'
  | 'list'
  | 'pagebreak'
  | 'raw_latex';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface AbstractBlock extends BaseBlock {
  type: 'abstract';
  content: string;
  keywords: string[];
}

export interface SectionBlock extends BaseBlock {
  type: 'section';
  level: 1 | 2 | 3;
  title: string;
  numbered: boolean;
  label: string;
  collapsed?: boolean;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: string; // Supports inline markdown/LaTeX like **bold**, *italic*, $math$, \cite{key}, \ref{label}
  align?: 'left' | 'justify' | 'center' | 'right';
  dropCap?: boolean;
}

export interface EquationBlock extends BaseBlock {
  type: 'equation';
  latex: string;
  mode: 'single' | 'align' | 'matrix' | 'cases';
  numbered: boolean;
  label: string;
  caption?: string;
}

export interface TableCellMerge {
  row: number;
  col: number;
  colSpan: number;
  rowSpan: number;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  caption: string;
  label: string;
  headers: string[];
  rows: string[][];
  alignments: ('l' | 'c' | 'r')[];
  theme: 'booktabs' | 'grid' | 'striped' | 'minimal';
  autoFitWidth: boolean;
  spanColumns?: boolean;
  merges?: TableCellMerge[];
}

export interface SubFigureItem {
  id: string;
  url: string;
  caption: string;
  label: string;
}

export interface FigureBlock extends BaseBlock {
  type: 'figure';
  layout: 'single' | 'grid-2' | 'grid-3' | 'grid-2x2';
  url: string;
  alt: string;
  caption: string;
  label: string;
  widthPercent: number;
  placement: 'H' | 't' | 'b' | 'htbp' | 'star';
  bordered: boolean;
  subfigures?: SubFigureItem[];
}

export interface TikzNode {
  id: string;
  label: string;
  shape: 'rect' | 'rounded' | 'circle' | 'diamond' | 'cylinder';
  x: number;
  y: number;
  color: string;
}

export interface TikzEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  curved?: boolean;
}

export interface PlotSeries {
  id: string;
  name: string;
  type: 'function' | 'coordinates';
  expression: string; // e.g., "sin(deg(x))" or "(0,1) (1,2.4) (2,3.9)"
  color: string;
}

export interface DiagramBlock extends BaseBlock {
  type: 'diagram';
  variant: 'tikz-flow' | 'pgfplot';
  caption: string;
  label: string;
  nodes: TikzNode[];
  edges: TikzEdge[];
  plotConfig: {
    title: string;
    xLabel: string;
    yLabel: string;
    xMin: number;
    xMax: number;
    grid: boolean;
    series: PlotSeries[];
  };
  customTikzOverride?: string;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  boxType: 'theorem' | 'lemma' | 'proposition' | 'definition' | 'proof' | 'note' | 'warning';
  title: string;
  content: string;
  label: string;
  numbered: boolean;
  accentColor: string;
}

export interface AlgorithmStep {
  id: string;
  indent: number;
  type: 'statement' | 'if' | 'else' | 'endif' | 'for' | 'endfor' | 'while' | 'endwhile' | 'return' | 'comment';
  text: string;
}

export interface AlgorithmBlock extends BaseBlock {
  type: 'algorithm';
  title: string;
  label: string;
  inputs: string;
  outputs: string;
  steps: AlgorithmStep[];
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language: 'python' | 'cpp' | 'typescript' | 'rust' | 'sql' | 'matlab' | 'bash';
  caption: string;
  label: string;
  code: string;
  lineNumbers: boolean;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  ordered: boolean;
  items: string[];
}

export interface PageBreakBlock extends BaseBlock {
  type: 'pagebreak';
}

export interface RawLatexBlock extends BaseBlock {
  type: 'raw_latex';
  description: string;
  latex: string;
}

export type DocumentBlock =
  | AbstractBlock
  | SectionBlock
  | ParagraphBlock
  | EquationBlock
  | TableBlock
  | FigureBlock
  | DiagramBlock
  | CalloutBlock
  | AlgorithmBlock
  | CodeBlock
  | ListBlock
  | PageBreakBlock
  | RawLatexBlock;

export interface BibEntry {
  id: string; // cite key e.g. "vaswani2017attention"
  type: 'article' | 'inproceedings' | 'book' | 'misc' | 'phdthesis';
  title: string;
  author: string;
  year: string;
  journalOrVenue: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
}

export interface DoctorDiagnostic {
  id: string;
  severity: 'error' | 'warning' | 'info';
  blockId?: string;
  title: string;
  plainEnglishExplanation: string;
  technicalDetail: string;
  fixLabel: string;
  fixActionType:
    | 'escape_special_chars'
    | 'autofit_table'
    | 'add_missing_label'
    | 'add_missing_caption'
    | 'balance_math_delimiters'
    | 'pin_float_here';
}
