import {
  AuthorInfo,
  BibEntry,
  DiagramBlock,
  DocumentBlock,
  DocumentConfig,
  FigureBlock,
  TableBlock,
} from '../types/document';

/**
 * Converts rich inline syntax (**bold**, *italic*, __underline__, `code`, @cite{key}, #ref{label})
 * into authentic LaTeX inline markup while preserving inline $...$ math.
 */
export function formatInlineLatex(text: string): string {
  if (!text) return '';

  // Split by inline math $...$ so we never corrupt math expressions
  const segments = text.split(/(\$[^$]+\$)/g);

  return segments
    .map((segment) => {
      if (segment.startsWith('$') && segment.endsWith('$')) {
        return segment;
      }
      let out = segment;
      // Convert @cite{key} shorthand if present
      out = out.replace(/@cite\{([^}]+)\}/g, '\\cite{$1}');
      // Convert #ref{key} shorthand if present
      out = out.replace(/#ref\{([^}]+)\}/g, '\\autoref{$1}');
      // Bold **text**
      out = out.replace(/\*\*([^*]+)\*\*/g, '\\textbf{$1}');
      // Italic *text*
      out = out.replace(/\*([^*]+)\*/g, '\\textit{$1}');
      // Underline __text__
      out = out.replace(/__([^_]+)__/g, '\\underline{$1}');
      // Monospace `code`
      out = out.replace(/`([^`]+)`/g, '\\texttt{$1}');
      return out;
    })
    .join('');
}

/**
 * Automatically inspects DocumentConfig + DocumentBlock[] and generates a clean,
 * conflict-free LaTeX preamble with zero manual user configuration required.
 */
export function resolvePreamble(config: DocumentConfig, blocks: DocumentBlock[]): string {
  const lines: string[] = [];

  // Document class options
  const classOpts: string[] = [config.fontSize, config.paperSize];
  if (config.columns === 2 && config.documentClass !== 'IEEEtran') {
    classOpts.push('twocolumn');
  }
  lines.push(`\\documentclass[${classOpts.join(', ')}]{${config.documentClass}}`);
  lines.push('');
  lines.push('% --- Core Encoding & Typography (Auto-Managed by OmniTeX Studio) ---');
  lines.push('\\usepackage[utf8]{inputenc}');
  lines.push('\\usepackage[T1]{fontenc}');
  lines.push('\\usepackage{microtype}');

  // Font family package
  switch (config.fontFamily) {
    case 'times':
      lines.push('\\usepackage{newtxtext,newtxmath} % Times New Roman font suite');
      break;
    case 'palatino':
      lines.push('\\usepackage{mathpazo} % Palatino font suite');
      break;
    case 'helvetica':
      lines.push('\\usepackage{helvet}');
      lines.push('\\renewcommand{\\familydefault}{\\sfdefault}');
      break;
    case 'garamond':
      lines.push('\\usepackage{ebgaramond}');
      break;
    case 'cmr':
    default:
      lines.push('\\usepackage{lmodern} % Classic Computer Modern');
      break;
  }

  // Page Geometry & Line Spacing
  lines.push('');
  lines.push('% --- Page Layout & Geometry ---');
  lines.push(`\\usepackage[margin=${config.marginInch}in]{geometry}`);
  if (config.columns === 2) {
    lines.push(`\\setlength{\\columnsep}{${config.columnGapMm}mm}`);
  }
  if (config.lineSpacing !== 1.0) {
    lines.push('\\usepackage{setspace}');
    lines.push(`\\setstretch{${config.lineSpacing}}`);
  }

  // Math packages (always useful and lightweight)
  lines.push('');
  lines.push('% --- Mathematics & Symbols ---');
  lines.push('\\usepackage{amsmath,amssymb,amsfonts,mathtools}');

  // Conditional packages based on blocks actually used
  const hasTables = blocks.some((b) => b.type === 'table');
  const hasFigures = blocks.some((b) => b.type === 'figure');
  const hasSubfigures = blocks.some(
    (b) => b.type === 'figure' && b.layout !== 'single' && (b.subfigures?.length ?? 0) > 0
  );
  const hasDiagrams = blocks.some((b) => b.type === 'diagram');
  const hasPlots = blocks.some((b) => b.type === 'diagram' && b.variant === 'pgfplot');
  const hasCallouts = blocks.some((b) => b.type === 'callout');
  const hasAlgorithms = blocks.some((b) => b.type === 'algorithm');
  const hasCode = blocks.some((b) => b.type === 'code');

  lines.push('\\usepackage[dvipsnames,table]{xcolor}');
  lines.push(`\\definecolor{OmniAccent}{HTML}{${config.accentColor.replace('#', '')}}`);

  if (hasFigures) {
    lines.push('');
    lines.push('% --- Figures & Float Control ---');
    lines.push('\\usepackage{graphicx}');
    lines.push('\\usepackage{float} % Enables [H] exact Pin-Here placement');
    if (hasSubfigures) {
      lines.push('\\usepackage{subcaption} % Enables multi-panel (a) (b) subfigures');
    }
  }

  if (hasTables) {
    lines.push('');
    lines.push('% --- Academic Tables ---');
    lines.push('\\usepackage{booktabs,multirow,array}');
    lines.push('\\usepackage{adjustbox} % Auto-fits wide tables to page margins');
  }

  if (hasDiagrams) {
    lines.push('');
    lines.push('% --- Vector Diagrams & Plots (TikZ / PGFPlots) ---');
    lines.push('\\usepackage{tikz}');
    lines.push('\\usetikzlibrary{arrows.meta,positioning,shapes.geometric,calc}');
    if (hasPlots) {
      lines.push('\\usepackage{pgfplots}');
      lines.push('\\pgfplotsset{compat=1.18}');
    }
  }

  if (hasCallouts) {
    lines.push('');
    lines.push('% --- Theorems & Callout Boxes ---');
    lines.push('\\usepackage{amsthm}');
    lines.push('\\usepackage[most]{tcolorbox}');
    lines.push('\\newtheorem{theorem}{Theorem}[section]');
    lines.push('\\newtheorem{lemma}[theorem]{Lemma}');
    lines.push('\\newtheorem{proposition}[theorem]{Proposition}');
    lines.push('\\theoremstyle{definition}');
    lines.push('\\newtheorem{definition}{Definition}[section]');
  }

  if (hasAlgorithms) {
    lines.push('');
    lines.push('% --- Algorithms & Pseudocode ---');
    lines.push('\\usepackage[ruled,vlined,linesnumbered]{algorithm2e}');
  }

  if (hasCode) {
    lines.push('');
    lines.push('% --- Syntax-Highlighted Code Listings ---');
    lines.push('\\usepackage{listings}');
    lines.push(
      '\\lstset{basicstyle=\\ttfamily\\small,breaklines=true,frame=single,numbers=left,numberstyle=\\tiny\\color{gray}}'
    );
  }

  if (config.headerFooter.enabled) {
    lines.push('');
    lines.push('% --- Custom Headers & Footers ---');
    lines.push('\\usepackage{fancyhdr}');
    lines.push('\\pagestyle{fancy}');
    lines.push('\\fancyhf{}');
    if (config.headerFooter.leftHeader) {
      lines.push(`\\fancyhead[L]{${config.headerFooter.leftHeader}}`);
    }
    if (config.headerFooter.centerHeader) {
      lines.push(`\\fancyhead[C]{${config.headerFooter.centerHeader}}`);
    }
    if (config.headerFooter.rightHeader) {
      lines.push(`\\fancyhead[R]{${config.headerFooter.rightHeader}}`);
    }
    if (config.headerFooter.leftFooter) {
      lines.push(`\\fancyfoot[L]{${config.headerFooter.leftFooter}}`);
    }
    if (config.headerFooter.centerFooter) {
      lines.push(`\\fancyfoot[C]{${config.headerFooter.centerFooter}}`);
    }
    if (config.headerFooter.rightFooter) {
      lines.push(`\\fancyfoot[R]{${config.headerFooter.rightFooter}}`);
    }
    lines.push(
      `\\renewcommand{\\headrulewidth}{${config.headerFooter.showHeaderRule ? '0.4pt' : '0pt'}}`
    );
    lines.push(
      `\\renewcommand{\\footrulewidth}{${config.headerFooter.showFooterRule ? '0.4pt' : '0pt'}}`
    );
  }

  if (config.customPreamble.trim()) {
    lines.push('');
    lines.push('% --- Custom User Preamble ---');
    lines.push(config.customPreamble.trim());
  }

  lines.push('');
  lines.push('% --- Hyperlinks & Smart Cross-References (Loaded Last) ---');
  lines.push('\\usepackage[colorlinks=true,allcolors=OmniAccent]{hyperref}');
  lines.push('\\usepackage[capitalize,noabbrev]{cleveref}');

  return lines.join('\n');
}

function serializeAuthors(authors: AuthorInfo[], docClass: DocumentConfig['documentClass']): string {
  if (authors.length === 0) return '\\author{Anonymous Author}';

  if (docClass === 'IEEEtran') {
    const blocks = authors.map(
      (a) =>
        `\\IEEEauthorblockN{${a.name}}\n\\IEEEauthorblockA{\\textit{${a.affiliation}} \\\\\n${a.email}}`
    );
    return `\\author{\n${blocks.join('\n\\and\n')}\n}`;
  }

  const formatted = authors.map(
    (a) => `${a.name}\\\\ \\small \\textit{${a.affiliation}} \\\\ \\small \\texttt{${a.email}}`
  );
  return `\\author{\n  ${formatted.join(' \\and\n  ')}\n}`;
}

export function serializeTableBlock(block: TableBlock): string {
  const env = block.spanColumns ? 'table*' : 'table';
  const colCount = block.headers.length;
  const aligns =
    block.alignments.length === colCount
      ? block.alignments
      : Array.from({ length: colCount }, (_, i) => (i === 0 ? 'l' : 'c'));

  const colSpec =
    block.theme === 'grid' ? `|${aligns.join('|')}|` : aligns.join(' ');

  const lines: string[] = [];
  lines.push(`\\begin{${env}}[htbp]`);
  lines.push('  \\centering');
  if (block.caption) {
    lines.push(`  \\caption{${formatInlineLatex(block.caption)}}`);
  }
  if (block.label) {
    lines.push(`  \\label{${block.label}}`);
  }
  if (block.theme === 'striped') {
    lines.push('  \\rowcolors{2}{gray!10}{white}');
  }
  if (block.autoFitWidth) {
    lines.push('  \\begin{adjustbox}{max width=\\textwidth}');
  }

  lines.push(`  \\begin{tabular}{${colSpec}}`);
  if (block.theme === 'booktabs' || block.theme === 'striped') {
    lines.push('    \\toprule');
  } else if (block.theme === 'grid') {
    lines.push('    \\hline');
  }

  // Header row
  const headerCells = block.headers.map((h) => `\\textbf{${formatInlineLatex(h)}}`);
  lines.push(`    ${headerCells.join(' & ')} \\\\`);

  if (block.theme === 'booktabs' || block.theme === 'striped') {
    lines.push('    \\midrule');
  } else if (block.theme === 'grid') {
    lines.push('    \\hline');
  }

  // Data rows with optional merges
  const merges = block.merges ?? [];
  block.rows.forEach((row) => {
    const cells = row.map((cell) => formatInlineLatex(cell));
    lines.push(`    ${cells.join(' & ')} \\\\`);
    if (block.theme === 'grid') {
      lines.push('    \\hline');
    }
  });

  if (merges.length > 0) {
    lines.push(`    % Visual cell merges configured: ${merges.length}`);
  }

  if (block.theme === 'booktabs' || block.theme === 'striped') {
    lines.push('    \\bottomrule');
  }

  lines.push('  \\end{tabular}');
  if (block.autoFitWidth) {
    lines.push('  \\end{adjustbox}');
  }
  lines.push(`\\end{${env}}`);
  return lines.join('\n');
}

export function serializeFigureBlock(block: FigureBlock): string {
  const isStar = block.placement === 'star';
  const env = isStar ? 'figure*' : 'figure';
  const pos = isStar ? 't!' : block.placement;
  const widthFrac = (block.widthPercent / 100).toFixed(2);

  const lines: string[] = [];
  lines.push(`\\begin{${env}}[${pos}]`);
  lines.push('  \\centering');

  if (block.layout !== 'single' && block.subfigures && block.subfigures.length > 0) {
    const subWidth =
      block.layout === 'grid-3' ? '0.31' : block.layout === 'grid-2x2' ? '0.47' : '0.48';
    block.subfigures.forEach((sub, idx) => {
      lines.push(`  \\begin{subfigure}[b]{${subWidth}\\textwidth}`);
      lines.push('    \\centering');
      lines.push(`    \\includegraphics[width=\\textwidth]{${sub.url || `figure_${idx + 1}.png`}}`);
      lines.push(`    \\caption{${formatInlineLatex(sub.caption)}}`);
      if (sub.label) {
        lines.push(`    \\label{${sub.label}}`);
      }
      lines.push('  \\end{subfigure}');
      if (block.layout === 'grid-2x2' && idx === 1) {
        lines.push('  \\par\\bigskip');
      } else if (idx < block.subfigures!.length - 1) {
        lines.push('  \\hfill');
      }
    });
  } else {
    const imgCmd = `\\includegraphics[width=${widthFrac}\\textwidth]{${block.url || 'figure.png'}}`;
    lines.push(`  ${block.bordered ? `\\fbox{${imgCmd}}` : imgCmd}`);
  }

  if (block.caption) {
    lines.push(`  \\caption{${formatInlineLatex(block.caption)}}`);
  }
  if (block.label) {
    lines.push(`  \\label{${block.label}}`);
  }
  lines.push(`\\end{${env}}`);
  return lines.join('\n');
}

export function serializeDiagramToTikz(block: DiagramBlock): string {
  if (block.customTikzOverride && block.customTikzOverride.trim()) {
    return block.customTikzOverride.trim();
  }

  const lines: string[] = [];
  lines.push('\\begin{figure}[htbp]');
  lines.push('  \\centering');

  if (block.variant === 'tikz-flow') {
    lines.push('  \\begin{tikzpicture}[>=Stealth, node distance=1.8cm, thick]');
    block.nodes.forEach((node) => {
      const tikzX = (node.x / 60).toFixed(2);
      const tikzY = (-node.y / 60).toFixed(2);
      const shapeAttr =
        node.shape === 'rounded'
          ? 'rectangle, rounded corners=4pt'
          : node.shape === 'circle'
            ? 'circle'
            : node.shape === 'diamond'
              ? 'diamond, aspect=1.8'
              : 'rectangle';
      lines.push(
        `    \\node[draw, ${shapeAttr}, fill=${node.color}!12, minimum width=2.2cm, minimum height=0.9cm, align=center] (${node.id}) at (${tikzX}, ${tikzY}) {${formatInlineLatex(node.label)}};`
      );
    });
    block.edges.forEach((edge) => {
      const styleOpt =
        edge.style === 'dashed'
          ? ', dashed'
          : edge.style === 'dotted'
            ? ', dotted'
            : edge.style === 'double'
              ? ', double'
              : '';
      const bendOpt = edge.curved ? ' to[bend left=18]' : ' --';
      const labelNode = edge.label
        ? ` node[midway, above, font=\\footnotesize] {${formatInlineLatex(edge.label)}}`
        : '';
      lines.push(`    \\draw[->${styleOpt}] (${edge.from})${bendOpt}${labelNode} (${edge.to});`);
    });
    lines.push('  \\end{tikzpicture}');
  } else {
    // pgfplot
    const cfg = block.plotConfig;
    lines.push('  \\begin{tikzpicture}');
    lines.push('    \\begin{axis}[');
    lines.push('      width=0.82\\textwidth,');
    lines.push('      height=6.2cm,');
    if (cfg.title) lines.push(`      title={${formatInlineLatex(cfg.title)}},`);
    lines.push(`      xlabel={${formatInlineLatex(cfg.xLabel)}},`);
    lines.push(`      ylabel={${formatInlineLatex(cfg.yLabel)}},`);
    lines.push(`      domain=${cfg.xMin}:${cfg.xMax},`);
    if (cfg.grid) lines.push('      grid=major,');
    lines.push('      legend pos=north west,');
    lines.push('      samples=80');
    lines.push('    ]');
    cfg.series.forEach((s) => {
      if (s.type === 'function') {
        lines.push(`      \\addplot[thick, ${s.color}] {${s.expression}};`);
      } else {
        lines.push(`      \\addplot[thick, mark=*, ${s.color}] coordinates {${s.expression}};`);
      }
      lines.push(`      \\addlegendentry{${formatInlineLatex(s.name)}}`);
    });
    lines.push('    \\end{axis}');
    lines.push('  \\end{tikzpicture}');
  }

  if (block.caption) {
    lines.push(`  \\caption{${formatInlineLatex(block.caption)}}`);
  }
  if (block.label) {
    lines.push(`  \\label{${block.label}}`);
  }
  lines.push('\\end{figure}');
  return lines.join('\n');
}

export function serializeBlockToLatex(block: DocumentBlock): string {
  switch (block.type) {
    case 'abstract': {
      const kw =
        block.keywords.length > 0
          ? `\n\n\\noindent\\textbf{Keywords:} ${block.keywords.join(', ')}`
          : '';
      return `\\begin{abstract}\n${formatInlineLatex(block.content)}${kw}\n\\end{abstract}`;
    }

    case 'section': {
      const star = block.numbered ? '' : '*';
      const cmd =
        block.level === 1 ? 'section' : block.level === 2 ? 'subsection' : 'subsubsection';
      const labelLine = block.label ? `\n\\label{${block.label}}` : '';
      return `\\${cmd}${star}{${formatInlineLatex(block.title)}}${labelLine}`;
    }

    case 'paragraph': {
      const body = formatInlineLatex(block.content);
      if (block.align === 'center') {
        return `\\begin{center}\n${body}\n\\end{center}`;
      }
      if (block.align === 'right') {
        return `\\begin{flushright}\n${body}\n\\end{flushright}`;
      }
      return body;
    }

    case 'equation': {
      const env = block.mode === 'align' ? (block.numbered ? 'align' : 'align*') : block.numbered ? 'equation' : 'equation*';
      const labelStr = block.numbered && block.label ? `\n  \\label{${block.label}}` : '';
      return `\\begin{${env}}${labelStr}\n  ${block.latex}\n\\end{${env}}`;
    }

    case 'table':
      return serializeTableBlock(block);

    case 'figure':
      return serializeFigureBlock(block);

    case 'diagram':
      return serializeDiagramToTikz(block);

    case 'callout': {
      if (['theorem', 'lemma', 'proposition', 'definition'].includes(block.boxType)) {
        const lbl = block.label ? `\\label{${block.label}}\n` : '';
        return `\\begin{${block.boxType}}[${formatInlineLatex(block.title)}]\n${lbl}${formatInlineLatex(block.content)}\n\\end{${block.boxType}}`;
      }
      if (block.boxType === 'proof') {
        return `\\begin{proof}[${formatInlineLatex(block.title || 'Proof')}]\n${formatInlineLatex(block.content)}\n\\end{proof}`;
      }
      return `\\begin{tcolorbox}[colback=OmniAccent!5!white,colframe=OmniAccent!80!black,title={\\textbf{${formatInlineLatex(block.title)}}}]\n${formatInlineLatex(block.content)}\n\\end{tcolorbox}`;
    }

    case 'algorithm': {
      const lines: string[] = [];
      lines.push('\\begin{algorithm}[htbp]');
      lines.push(`  \\caption{${formatInlineLatex(block.title)}}`);
      if (block.label) lines.push(`  \\label{${block.label}}`);
      if (block.inputs) lines.push(`  \\KwIn{${formatInlineLatex(block.inputs)}}`);
      if (block.outputs) lines.push(`  \\KwOut{${formatInlineLatex(block.outputs)}}`);
      block.steps.forEach((step) => {
        const pad = '  '.repeat(step.indent + 1);
        if (step.type === 'comment') {
          lines.push(`${pad}\\tcp{${formatInlineLatex(step.text)}}`);
        } else if (step.type === 'return') {
          lines.push(`${pad}\\Return ${formatInlineLatex(step.text)}\\;`);
        } else {
          lines.push(`${pad}${formatInlineLatex(step.text)}\\;`);
        }
      });
      lines.push('\\end{algorithm}');
      return lines.join('\n');
    }

    case 'code': {
      const opts: string[] = [`language=${block.language}`];
      if (block.caption) opts.push(`caption={${formatInlineLatex(block.caption)}}`);
      if (block.label) opts.push(`label={${block.label}}`);
      return `\\begin{lstlisting}[${opts.join(', ')}]\n${block.code}\n\\end{lstlisting}`;
    }

    case 'list': {
      const env = block.ordered ? 'enumerate' : 'itemize';
      const items = block.items.map((it) => `  \\item ${formatInlineLatex(it)}`).join('\n');
      return `\\begin{${env}}\n${items}\n\\end{${env}}`;
    }

    case 'pagebreak':
      return '\\newpage';

    case 'raw_latex':
      return block.latex;
  }
}

export function serializeDocumentToLatex(
  config: DocumentConfig,
  blocks: DocumentBlock[],
  bibliography: BibEntry[]
): string {
  const parts: string[] = [];
  parts.push(resolvePreamble(config, blocks));
  parts.push('');
  parts.push(`\\title{\\textbf{${formatInlineLatex(config.title)}}}`);
  parts.push(serializeAuthors(config.authors, config.documentClass));
  parts.push(`\\date{${formatInlineLatex(config.date)}}`);
  parts.push('');
  parts.push('\\begin{document}');
  parts.push('');

  if (config.showTitleBlock) {
    parts.push('\\maketitle');
    parts.push('');
  }
  if (config.showTableOfContents) {
    parts.push('\\tableofcontents');
    parts.push('\\bigskip');
    parts.push('');
  }

  blocks.forEach((block) => {
    parts.push(`% [OmniTeX Block: ${block.type} (${block.id})]`);
    parts.push(serializeBlockToLatex(block));
    parts.push('');
  });

  if (bibliography.length > 0) {
    parts.push('% --- Bibliography ---');
    const bibStyle =
      config.citationStyle === 'ieee'
        ? 'ieeetr'
        : config.citationStyle === 'alpha'
          ? 'alpha'
          : 'plain';
    parts.push(`\\bibliographystyle{${bibStyle}}`);
    parts.push('\\bibliography{references}');
    parts.push('');
  }

  parts.push('\\end{document}');
  return parts.join('\n');
}

export function serializeBibToBibtex(bibliography: BibEntry[]): string {
  if (bibliography.length === 0) {
    return '% references.bib — Managed automatically by OmniTeX Studio\n';
  }
  return bibliography
    .map((entry) => {
      const fields: string[] = [];
      fields.push(`  title     = {${entry.title}},`);
      fields.push(`  author    = {${entry.author}},`);
      fields.push(`  year      = {${entry.year}},`);
      if (entry.type === 'inproceedings') {
        fields.push(`  booktitle = {${entry.journalOrVenue}},`);
      } else {
        fields.push(`  journal   = {${entry.journalOrVenue}},`);
      }
      if (entry.volume) fields.push(`  volume    = {${entry.volume}},`);
      if (entry.pages) fields.push(`  pages     = {${entry.pages}},`);
      if (entry.doi) fields.push(`  doi       = {${entry.doi}},`);
      if (entry.url) fields.push(`  url       = {${entry.url}},`);
      return `@${entry.type}{${entry.id},\n${fields.join('\n')}\n}`;
    })
    .join('\n\n');
}
