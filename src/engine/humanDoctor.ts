import { DoctorDiagnostic, DocumentBlock, DocumentConfig } from '../types/document';

/**
 * Finds unescaped LaTeX special characters (%, &, #) outside inline math $...$ or commands.
 */
function findUnescapedSpecials(text: string): string[] {
  const withoutMath = text.replace(/\$[^$]*\$/g, '');
  const found: string[] = [];
  if (/(?<!\\)%/.test(withoutMath)) found.push('%');
  if (/(?<!\\)&/.test(withoutMath)) found.push('&');
  if (/(?<!\\)#(?!ref\{)/.test(withoutMath)) found.push('#');
  return found;
}

function escapeSpecialsInText(text: string): string {
  const segments = text.split(/(\$[^$]*\$)/g);
  return segments
    .map((seg) => {
      if (seg.startsWith('$') && seg.endsWith('$')) return seg;
      return seg
        .replace(/(?<!\\)%/g, '\\%')
        .replace(/(?<!\\)&/g, '\\&')
        .replace(/(?<!\\)#(?!ref\{)/g, '\\#');
    })
    .join('');
}

/**
 * Runs the "Human Error Translator & Auto-Doctor" over the document, returning plain-English
 * diagnostics with 1-click automated fixes.
 */
export function runHumanDoctor(
  _config: DocumentConfig,
  blocks: DocumentBlock[]
): DoctorDiagnostic[] {
  const diagnostics: DoctorDiagnostic[] = [];

  blocks.forEach((block, index) => {
    const blockNum = index + 1;

    // 1. Check unescaped %, &, # in paragraphs and abstracts
    if (block.type === 'paragraph' || block.type === 'abstract') {
      const specials = findUnescapedSpecials(block.content);
      if (specials.length > 0) {
        diagnostics.push({
          id: `diag-special-${block.id}`,
          severity: 'error',
          blockId: block.id,
          title: `Unescaped special character (${specials.join(', ')}) in Block #${blockNum}`,
          plainEnglishExplanation:
            specials.includes('%')
              ? `You wrote a "%" symbol in plain text. In LaTeX, "%" comments out the rest of your line so it disappears from the PDF!`
              : `You used "${specials.join(', ')}" in plain text. LaTeX reserves "&" for table columns and "#" for macro arguments.`,
          technicalDetail: `LaTeX Error: Misplaced alignment tab character & / accidental comment %`,
          fixLabel: `Auto-escape to \\${specials[0]}`,
          fixActionType: 'escape_special_chars',
        });
      }

      // Check unbalanced inline $ math delimiters
      const dollarCount = (block.content.match(/(?<!\\)\$/g) || []).length;
      if (dollarCount % 2 !== 0) {
        diagnostics.push({
          id: `diag-math-delim-${block.id}`,
          severity: 'error',
          blockId: block.id,
          title: `Unclosed inline math "$" in Block #${blockNum}`,
          plainEnglishExplanation:
            'You opened an inline math formula with "$" but forgot the closing "$". This causes the infamous "Missing $ inserted" error.',
          technicalDetail: '! Missing $ inserted. <inserted text> $',
          fixLabel: 'Close missing "$" delimiter',
          fixActionType: 'balance_math_delimiters',
        });
      }
    }

    // 2. Check wide tables without autoFitWidth
    if (block.type === 'table') {
      if (block.headers.length >= 5 && !block.autoFitWidth) {
        diagnostics.push({
          id: `diag-wide-table-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          title: `Wide table (${block.headers.length} columns) may overflow page margins`,
          plainEnglishExplanation:
            'In LaTeX, tables do not automatically wrap or shrink to fit the page width, causing "Overfull \\hbox" margin overflow.',
          technicalDetail: 'Overfull \\hbox (42.1pt too wide) in alignment at lines ...',
          fixLabel: 'Enable Auto-Fit to Page Width (adjustbox)',
          fixActionType: 'autofit_table',
        });
      }
      if (!block.caption.trim()) {
        diagnostics.push({
          id: `diag-table-cap-${block.id}`,
          severity: 'info',
          blockId: block.id,
          title: `Table #${blockNum} is missing a caption`,
          plainEnglishExplanation:
            'Academic journals require every table to have a descriptive caption above the grid.',
          technicalDetail: 'Missing \\caption{} inside table environment',
          fixLabel: 'Add default academic caption',
          fixActionType: 'add_missing_caption',
        });
      }
    }

    // 3. Check figures without exact placement or missing label
    if (block.type === 'figure') {
      if (block.placement === 'htbp') {
        diagnostics.push({
          id: `diag-fig-float-${block.id}`,
          severity: 'info',
          blockId: block.id,
          title: `Figure "${block.caption || blockNum}" might float to another page`,
          plainEnglishExplanation:
            'By default, LaTeX floats images away from where you placed them. Pinning with [H] locks the image in its exact spot like Microsoft Word.',
          technicalDetail: 'Float specifier [htbp] allows deferred page placement',
          fixLabel: 'Pin Figure Exactly Here [H]',
          fixActionType: 'pin_float_here',
        });
      }
      if (!block.label.trim()) {
        diagnostics.push({
          id: `diag-fig-label-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          title: `Figure #${blockNum} has no cross-reference label`,
          plainEnglishExplanation:
            'Without a label (like fig:architecture), you cannot link to this figure as "Figure 1" in your text.',
          technicalDetail: 'Missing \\label{fig:...} after \\caption',
          fixLabel: 'Generate label automatically',
          fixActionType: 'add_missing_label',
        });
      }
    }
  });

  return diagnostics;
}

/**
 * Applies a 1-click automated fix for any DoctorDiagnostic.
 */
export function applyDoctorFixToBlocks(
  diagnostic: DoctorDiagnostic,
  blocks: DocumentBlock[]
): DocumentBlock[] {
  return blocks.map((block) => {
    if (block.id !== diagnostic.blockId) return block;

    switch (diagnostic.fixActionType) {
      case 'escape_special_chars':
        if (block.type === 'paragraph' || block.type === 'abstract') {
          return { ...block, content: escapeSpecialsInText(block.content) };
        }
        return block;

      case 'balance_math_delimiters':
        if (block.type === 'paragraph' || block.type === 'abstract') {
          return { ...block, content: `${block.content}$` };
        }
        return block;

      case 'autofit_table':
        if (block.type === 'table') {
          return { ...block, autoFitWidth: true };
        }
        return block;

      case 'add_missing_caption':
        if (block.type === 'table') {
          return { ...block, caption: 'Summary of experimental comparison results.' };
        }
        return block;

      case 'pin_float_here':
        if (block.type === 'figure') {
          return { ...block, placement: 'H' };
        }
        return block;

      case 'add_missing_label':
        if (block.type === 'figure') {
          return { ...block, label: `fig:item_${block.id.slice(-4)}` };
        }
        return block;

      default:
        return block;
    }
  });
}
