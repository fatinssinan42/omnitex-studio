import React from 'react';
import katex from 'katex';
import { BibEntry, DocumentBlock } from '../types/document';

interface MathDisplayProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathDisplayProps> = ({
  latex,
  displayMode = true,
  className = '',
}) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(latex || '\\square', {
        displayMode,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<span class="text-red-600 font-mono text-xs">${latex}</span>`;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface RichAcademicTextProps {
  text: string;
  bibliography: BibEntry[];
  blocks: DocumentBlock[];
  onClickCitation?: (citeKey: string) => void;
  onClickReference?: (label: string) => void;
}

/**
 * Renders prose containing inline $math$, **bold**, *italic*, __underline__, `code`,
 * \cite{key}, and \autoref{label} / \ref{label} as live interactive academic typography.
 */
export const RichAcademicText: React.FC<RichAcademicTextProps> = ({
  text,
  bibliography,
  blocks,
  onClickCitation,
  onClickReference,
}) => {
  if (!text) return null;

  // Tokenize inline math $...$, citations \cite{...}, cross-refs \autoref{...} / \ref{...}
  const tokenPattern =
    /(\$[^$]+\$|\\cite\{[^}]+\}|\\(?:auto)?ref\{[^}]+\}|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|`[^`]+`)/g;

  const parts = text.split(tokenPattern);

  // Build label lookup map for human-friendly cross-reference numbers
  const resolveRefLabel = (label: string): string => {
    let secCount = 0;
    let eqCount = 0;
    let tblCount = 0;
    let figCount = 0;
    let thmCount = 0;
    let algCount = 0;

    for (const b of blocks) {
      if (b.type === 'section' && b.level === 1 && b.numbered) secCount++;
      if (b.type === 'equation' && b.numbered) eqCount++;
      if (b.type === 'table') tblCount++;
      if (b.type === 'figure' || b.type === 'diagram') figCount++;
      if (b.type === 'callout' && b.numbered) thmCount++;
      if (b.type === 'algorithm') algCount++;

      if ('label' in b && b.label === label) {
        if (b.type === 'section') return `Section ${secCount || 1}`;
        if (b.type === 'equation') return `Eq. (${eqCount || 1})`;
        if (b.type === 'table') return `Table ${tblCount || 1}`;
        if (b.type === 'figure' || b.type === 'diagram') return `Figure ${figCount || 1}`;
        if (b.type === 'callout') return `Theorem ${thmCount || 1}`;
        if (b.type === 'algorithm') return `Algorithm ${algCount || 1}`;
      }
    }
    return label;
  };

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;

        // Inline math $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          return (
            <MathRenderer
              key={idx}
              latex={part.slice(1, -1)}
              displayMode={false}
              className="mx-0.5 inline-block align-baseline"
            />
          );
        }

        // Citation \cite{k1, k2}
        if (part.startsWith('\\cite{') && part.endsWith('}')) {
          const keys = part
            .slice(6, -1)
            .split(',')
            .map((k) => k.trim());
          const labels = keys.map((key) => {
            const bibIndex = bibliography.findIndex((b) => b.id === key);
            if (bibIndex !== -1) {
              const entry = bibliography[bibIndex];
              const surname = entry.author.split(',')[0]?.split(' ')[0] || key;
              return `${surname}, ${entry.year} [${bibIndex + 1}]`;
            }
            return key;
          });
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClickCitation?.(keys[0]);
              }}
              title={`Citation: ${keys.join(', ')} (Click to inspect in Bibliography)`}
              className="btn-press mx-0.5 inline-flex items-center gap-1 rounded bg-blue-50/90 px-1.5 py-0.2 text-[0.88em] font-medium text-blue-800 ring-1 ring-blue-600/20 hover:bg-blue-100/90 tabular-nums"
            >
              <span>[{labels.join('; ')}]</span>
            </button>
          );
        }

        // Cross-reference \autoref{...} or \ref{...}
        if ((part.startsWith('\\autoref{') || part.startsWith('\\ref{')) && part.endsWith('}')) {
          const label = part.replace(/^\\(?:auto)?ref\{/, '').slice(0, -1);
          const friendly = resolveRefLabel(label);
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClickReference?.(label);
              }}
              title={`Cross-reference to ${label}`}
              className="btn-press mx-0.5 inline-flex items-center rounded bg-emerald-50/90 px-1.5 py-0.2 text-[0.88em] font-medium text-emerald-800 ring-1 ring-emerald-600/20 hover:bg-emerald-100/90 tabular-nums"
            >
              {friendly}
            </button>
          );
        }

        // Bold **...**
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={idx} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // Italic *...*
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <em key={idx} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }

        // Underline __...__
        if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
          return (
            <span key={idx} className="underline decoration-1 underline-offset-2">
              {part.slice(2, -2)}
            </span>
          );
        }

        // Inline code `...`
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={idx}
              className="rounded bg-stone-200/70 px-1 py-0.5 font-mono text-[0.86em] text-stone-800 break-all"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
};
