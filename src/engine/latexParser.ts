import { DocumentBlock, DocumentConfig } from '../types/document';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Converts LaTeX inline commands (\textbf{}, \textit{}, \underline{}, \texttt{})
 * into our clean visual inline syntax (**bold**, *italic*, __underline__, `code`)
 * while keeping $...$, \cite{}, and \autoref{}/\ref{} intact.
 */
function normalizeInlineFromLatex(tex: string): string {
  return tex
    .replace(/\\textbf\{([^{}]+)\}/g, '**$1**')
    .replace(/\\textit\{([^{}]+)\}/g, '*$1*')
    .replace(/\\emph\{([^{}]+)\}/g, '*$1*')
    .replace(/\\underline\{([^{}]+)\}/g, '__$1__')
    .replace(/\\texttt\{([^{}]+)\}/g, '`$1`')
    .trim();
}

/**
 * Parses a full or partial LaTeX (.tex) document into structured visual DocumentBlocks
 * and updates DocumentConfig metadata (title, date, columns, etc.) if present.
 */
export function parseLatexSourceToDocument(
  texSource: string,
  baseConfig: DocumentConfig
): { config: DocumentConfig; blocks: DocumentBlock[] } {
  const updatedConfig: DocumentConfig = { ...baseConfig };

  // Extract \title{...}
  const titleMatch = texSource.match(/\\title\{(?:\\textbf\{)?([^}\n]+)\}?\}/);
  if (titleMatch?.[1]) {
    updatedConfig.title = titleMatch[1].trim();
  }

  // Extract \date{...}
  const dateMatch = texSource.match(/\\date\{([^}\n]+)\}/);
  if (dateMatch?.[1]) {
    updatedConfig.date = dateMatch[1].trim();
  }

  // Extract body between \begin{document} and \end{document} if present
  const bodyMatch = texSource.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  const body = bodyMatch ? bodyMatch[1] : texSource;

  // Strip \maketitle, \tableofcontents, bibliography commands, and OmniTeX block comments
  const cleaned = body
    .replace(/%\s*\[OmniTeX Block:[^\n]*\n?/g, '')
    .replace(/\\maketitle/g, '')
    .replace(/\\tableofcontents/g, '')
    .replace(/\\bigskip/g, '')
    .replace(/\\bibliographystyle\{[^}]*\}/g, '')
    .replace(/\\bibliography\{[^}]*\}/g, '')
    .trim();

  const blocks: DocumentBlock[] = [];

  // Tokenize major environments and section headers
  const tokenRegex =
    /(\\begin\{(?:abstract|equation\*?|align\*?|table\*?|figure\*?|theorem|lemma|proposition|definition|proof|tcolorbox|algorithm|lstlisting|itemize|enumerate)\}[\s\S]*?\\end\{(?:abstract|equation\*?|align\*?|table\*?|figure\*?|theorem|lemma|proposition|definition|proof|tcolorbox|algorithm|lstlisting|itemize|enumerate)\}|\\(?:sub)*section\*?\{[^}]+\}(?:\s*\\label\{[^}]+\})?|\\newpage)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushParagraphChunk = (rawChunk: string) => {
    const paragraphs = rawChunk
      .split(/\n\s*\n/)
      .map((p) => p.replace(/^%.*$/gm, '').trim())
      .filter(Boolean);

    for (const para of paragraphs) {
      blocks.push({
        id: uid('para'),
        type: 'paragraph',
        content: normalizeInlineFromLatex(para),
        align: 'justify',
      });
    }
  };

  while ((match = tokenRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      pushParagraphChunk(cleaned.slice(lastIndex, match.index));
    }

    const token = match[0].trim();
    lastIndex = tokenRegex.lastIndex;

    if (token === '\\newpage') {
      blocks.push({ id: uid('pagebreak'), type: 'pagebreak' });
      continue;
    }

    // Section / Subsection / Subsubsection
    const secMatch = token.match(
      /^\\(sub)?(sub)?section(\*)?\{([^}]+)\}(?:\s*\\label\{([^}]+)\})?/
    );
    if (secMatch) {
      const level = secMatch[1] && secMatch[2] ? 3 : secMatch[1] ? 2 : 1;
      const numbered = !secMatch[3];
      const title = normalizeInlineFromLatex(secMatch[4]);
      const label =
        secMatch[5] ||
        `sec:${title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '')}`;
      blocks.push({
        id: uid('sec'),
        type: 'section',
        level,
        title,
        numbered,
        label,
      });
      continue;
    }

    // Abstract
    if (token.startsWith('\\begin{abstract}')) {
      const inner = token
        .replace(/^\\begin\{abstract\}/, '')
        .replace(/\\end\{abstract\}$/, '')
        .trim();
      const kwMatch = inner.match(/\\noindent\\textbf\{Keywords:\}\s*(.+)$/);
      const contentOnly = kwMatch ? inner.slice(0, kwMatch.index).trim() : inner;
      const keywords = kwMatch
        ? kwMatch[1]
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : ['LaTeX', 'Visual Authoring'];
      blocks.push({
        id: uid('abs'),
        type: 'abstract',
        content: normalizeInlineFromLatex(contentOnly),
        keywords,
      });
      continue;
    }

    // Equations
    if (token.startsWith('\\begin{equation') || token.startsWith('\\begin{align')) {
      const isAlign = token.startsWith('\\begin{align');
      const numbered = !token.startsWith('\\begin{equation*') && !token.startsWith('\\begin{align*');
      const lblMatch = token.match(/\\label\{([^}]+)\}/);
      const inner = token
        .replace(/^\\begin\{(?:equation|align)\*?\}/, '')
        .replace(/\\end\{(?:equation|align)\*?\}$/, '')
        .replace(/\\label\{[^}]+\}/, '')
        .trim();
      blocks.push({
        id: uid('eq'),
        type: 'equation',
        latex: inner,
        mode: isAlign ? 'align' : inner.includes('matrix}') ? 'matrix' : inner.includes('cases}') ? 'cases' : 'single',
        numbered,
        label: lblMatch?.[1] || `eq:${uid('f').slice(-4)}`,
      });
      continue;
    }

    // Lists
    if (token.startsWith('\\begin{itemize}') || token.startsWith('\\begin{enumerate}')) {
      const ordered = token.startsWith('\\begin{enumerate}');
      const inner = token
        .replace(/^\\begin\{(?:itemize|enumerate)\}/, '')
        .replace(/\\end\{(?:itemize|enumerate)\}$/, '')
        .trim();
      const items = inner
        .split(/\\item\s+/)
        .map((s) => normalizeInlineFromLatex(s.trim()))
        .filter(Boolean);
      blocks.push({
        id: uid('list'),
        type: 'list',
        ordered,
        items: items.length > 0 ? items : ['List item'],
      });
      continue;
    }

    // Tables
    if (token.startsWith('\\begin{table')) {
      const capMatch = token.match(/\\caption\{([^}]+)\}/);
      const lblMatch = token.match(/\\label\{([^}]+)\}/);
      const tabMatch = token.match(/\\begin\{tabular\}\{[^}]+\}([\s\S]*?)\\end\{tabular\}/);
      if (tabMatch) {
        const rawRows = tabMatch[1]
          .replace(/\\toprule|\\midrule|\\bottomrule|\\hline|\\rowcolors\{[^}]*\}\{[^}]*\}\{[^}]*\}/g, '')
          .split('\\\\')
          .map((r) => r.replace(/%.*$/gm, '').trim())
          .filter(Boolean);

        const parsedGrid = rawRows.map((r) =>
          r.split('&').map((c) => normalizeInlineFromLatex(c.trim()))
        );
        const headers = parsedGrid[0] || ['Column 1', 'Column 2'];
        const rows = parsedGrid.slice(1);
        blocks.push({
          id: uid('tbl'),
          type: 'table',
          caption: capMatch ? normalizeInlineFromLatex(capMatch[1]) : 'Imported Table',
          label: lblMatch?.[1] || 'tab:imported',
          headers,
          rows: rows.length > 0 ? rows : [headers.map(() => '—')],
          alignments: headers.map((_, idx) => (idx === 0 ? 'l' : 'c')),
          theme: token.includes('\\rowcolors')
            ? 'striped'
            : token.includes('\\hline')
              ? 'grid'
              : 'booktabs',
          autoFitWidth: token.includes('adjustbox'),
          spanColumns: token.startsWith('\\begin{table*}'),
        });
        continue;
      }
    }

    // Code listings
    if (token.startsWith('\\begin{lstlisting}')) {
      const capMatch = token.match(/caption=\{([^}]+)\}/);
      const langMatch = token.match(/language=([a-zA-Z]+)/);
      const inner = token
        .replace(/^\\begin\{lstlisting\}(?:\[[^\]]*\])?/, '')
        .replace(/\\end\{lstlisting\}$/, '')
        .trim();
      blocks.push({
        id: uid('code'),
        type: 'code',
        language: (langMatch?.[1]?.toLowerCase() as 'python') || 'python',
        caption: capMatch?.[1] || 'Algorithm implementation',
        label: 'lst:code',
        code: inner,
        lineNumbers: true,
      });
      continue;
    }

    // Fallback: preserve any complex figure/tikz/custom environment lossless as RawLatexBlock
    blocks.push({
      id: uid('raw'),
      type: 'raw_latex',
      description: 'Custom LaTeX Environment Block',
      latex: token,
    });
  }

  if (lastIndex < cleaned.length) {
    pushParagraphChunk(cleaned.slice(lastIndex));
  }

  return { config: updatedConfig, blocks };
}

/**
 * Converts HTML (produced by Mammoth.js from a .docx Microsoft Word file) or Markdown
 * into structured OmniTeX visual blocks!
 */
export function parseHtmlOrMarkdownToBlocks(input: string, isHtml: boolean): DocumentBlock[] {
  const blocks: DocumentBlock[] = [];

  if (isHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    const elements = Array.from(doc.body.children);

    elements.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = (el.textContent || '').trim();
      if (!text && tag !== 'table' && tag !== 'img') return;

      if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
        const level = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3;
        blocks.push({
          id: uid('sec'),
          type: 'section',
          level,
          title: text,
          numbered: true,
          label: `sec:${text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)}`,
        });
      } else if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(el.querySelectorAll('li'))
          .map((li) => (li.textContent || '').trim())
          .filter(Boolean);
        if (items.length > 0) {
          blocks.push({
            id: uid('list'),
            type: 'list',
            ordered: tag === 'ol',
            items,
          });
        }
      } else if (tag === 'table') {
        const trs = Array.from(el.querySelectorAll('tr'));
        const grid = trs.map((tr) =>
          Array.from(tr.querySelectorAll('th, td')).map((cell) => (cell.textContent || '').trim())
        );
        if (grid.length > 0) {
          const headers = grid[0];
          const rows = grid.slice(1);
          blocks.push({
            id: uid('tbl'),
            type: 'table',
            caption: 'Table imported from Microsoft Word (.docx)',
            label: `tab:docx_${uid('t').slice(-4)}`,
            headers,
            rows: rows.length > 0 ? rows : [headers.map(() => '')],
            alignments: headers.map((_, i) => (i === 0 ? 'l' : 'c')),
            theme: 'booktabs',
            autoFitWidth: headers.length >= 5,
          });
        }
      } else {
        // Convert inline <strong> / <em> inside paragraph
        let rich = el.innerHTML
          .replace(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
          .replace(/<(?:em|i)>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
          .replace(/<u>([\s\S]*?)<\/u>/gi, '__$1__')
          .replace(/<[^>]+>/g, '')
          .trim();
        if (rich) {
          blocks.push({
            id: uid('para'),
            type: 'paragraph',
            content: rich,
            align: 'justify',
          });
        }
      }
    });

    return blocks;
  }

  // Markdown parser
  const lines = input.split(/\r?\n/);
  let paraBuffer: string[] = [];

  const flushPara = () => {
    if (paraBuffer.length > 0) {
      blocks.push({
        id: uid('para'),
        type: 'paragraph',
        content: paraBuffer.join(' ').trim(),
        align: 'justify',
      });
      paraBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushPara();
      continue;
    }

    if (line.startsWith('#')) {
      flushPara();
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = Math.min(3, match[1].length) as 1 | 2 | 3;
        const title = match[2].trim();
        blocks.push({
          id: uid('sec'),
          type: 'section',
          level,
          title,
          numbered: true,
          label: `sec:${title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)}`,
        });
        continue;
      }
    }

    if (line.startsWith('$$')) {
      flushPara();
      const eqLines: string[] = [];
      if (line.endsWith('$$') && line.length > 4) {
        eqLines.push(line.slice(2, -2).trim());
      } else {
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('$$')) {
          eqLines.push(lines[i]);
          i++;
        }
      }
      blocks.push({
        id: uid('eq'),
        type: 'equation',
        latex: eqLines.join('\n').trim() || 'E = mc^2',
        mode: 'single',
        numbered: true,
        label: `eq:${uid('e').slice(-4)}`,
      });
      continue;
    }

    paraBuffer.push(line);
  }
  flushPara();

  return blocks;
}
