# OmniTeX Studio (v2.0)

**Word-Simple Authoring. Pure LaTeX Power.**

**OmniTeX Studio** is a modern, bidirectional visual and code-based LaTeX authoring environment designed so anyone familiar with Microsoft Word, Notion, or Google Docs can compose publication-ready academic papers, IEEE two-column manuscripts, theses, and technical reports without memorizing raw LaTeX syntax—while giving experienced LaTeX authors 100% lossless `.tex` and `.bib` control.

Created and maintained by **Fatin S Sinan** ([@fatinssinan42](https://github.com/fatinssinan42)).

---

## Key Features

### 1. Guided 4-Step Authoring Flow
Switch seamlessly between four progressive workspaces from the top bar:
1. **Focus Canvas (`Step 1`):** Distraction-free WYSIWYG writing directly on a typeset paper sheet with a floating glassmorphic Quick-Insert & Zoom island.
2. **Studio Builder (`Step 2`):** Full 3-pane visual architecture featuring the **Left Block & Studio Library**, **Center Typeset Paper Canvas**, and **Right Contextual Property Inspector**.
3. **Split `.tex` Sync (`Step 3`):** Side-by-side visual paper authoring paired with real-time bidirectional `.tex` source editing and an automatic `\usepackage{...}` preamble resolver.
4. **Pro Overleaf IDE (`Step 4`):** Full-screen `.tex` and `.bib` code IDE alongside a live typeset paper preview.

### 2. Four Integrated Visual Power Studios
No more jumping between 5 external helper websites:
- **Visual Table Studio:** Excel-like interactive spreadsheet grid with CSV/TSV clipboard paste, per-column alignment (`l`/`c`/`r`), `booktabs` (`\toprule`, `\midrule`, `\bottomrule`) or full-grid borders, and instant `\begin{table}` generation.
- **Visual Math Studio:** Categorized symbol palettes (Operators, Greek, Calculus, Matrices, Arrows), 1-click famous equation presets, and a freehand **Draw-to-LaTeX Sketchpad** alongside live KaTeX preview.
- **Visual TikZ Diagram Studio:** Drag-and-drop node and directed-edge canvas, plus 1-click flowchart, neural network, and state-machine templates that compile directly into clean `\begin{tikzpicture}` code.
- **One-Click Citation Studio:** Search live academic literature via the **Crossref REST API**, resolve **DOIs** or **arXiv IDs** in one click, paste raw `.bib` entries, and insert `\cite{key}` pills directly into your document.

### 3. Bidirectional AST Engine & Auto-Preamble Resolver
- **Zero "Missing Package" Errors:** The built-in Auto-Preamble Resolver inspects your document blocks and automatically injects required packages (`amsmath`, `booktabs`, `graphicx`, `tikz`, `tcolorbox`, `listings`, `algorithm2e`, `hyperref`, etc.).
- **Plain-English LaTeX Doctor:** Automatically detects unescaped `%`, `&`, `_`, unmatched math delimiters, or missing labels/captions, explains them in plain English, and fixes them with a single click.
- **Universal Import & Export:** Import `.docx` Word files (via `mammoth`), Markdown, or existing `.tex` manuscripts. Export clean `.tex`, `.bib`, self-contained Overleaf `.zip` bundles, or print-ready PDFs.

---

## Getting Started

### Prerequisites
- **Node.js** `>= 18.x`
- **npm** `>= 9.x`

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/fatinssinan42/omnitex-studio.git
cd omnitex-studio

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Project Architecture

```text
omnitex-studio/
├── src/
│   ├── components/
│   │   ├── WordRibbonToolbar.tsx       # 56px Architectural Top Bar & 4-Step Flow Switcher
│   │   ├── LeftPaletteAndOutline.tsx   # Resizable Left Bento Block Library & Document Outline
│   │   ├── VisualPaperCanvas.tsx       # Drag-and-drop WYSIWYG Paper Sheet & Floating Island
│   │   ├── RightInspectorPanel.tsx     # Contextual Block Inspector, Page Setup, .tex & Doctor
│   │   ├── CodeAndInspectorPanel.tsx   # Full-screen Pro Overleaf IDE & Split .tex Engine
│   │   ├── CommandPalette.tsx          # Ctrl+K / Cmd+K Slash & Command Palette
│   │   ├── MathRenderer.tsx            # Instant KaTeX Equation & Display Renderer
│   │   ├── DiagramRenderer.tsx         # Visual TikZ Node/Edge SVG Canvas Renderer
│   │   └── studios/
│   │       ├── VisualTableStudio.tsx        # Interactive Spreadsheet -> LaTeX Booktabs Studio
│   │       ├── VisualMathStudio.tsx         # Symbol Palette, Presets & Draw-to-LaTeX Math Studio
│   │       ├── VisualDiagramStudio.tsx      # Interactive Node/Edge Canvas -> TikZ Generator
│   │       ├── SmartCitationStudio.tsx      # Live Crossref / DOI / arXiv BibTeX Manager
│   │       └── ImportAndTemplateModals.tsx  # Journal Templates, .docx / Markdown / .tex Importer
│   ├── engine/
│   │   ├── latexSerializer.ts          # AST -> .tex / .bib Serializer & Auto-Preamble Resolver
│   │   ├── latexParser.ts              # Bidirectional .tex / .docx / Markdown -> AST Parser
│   │   ├── humanDoctor.ts              # Plain-English LaTeX Diagnostics & 1-Click Auto-Fixer
│   │   └── templates.ts                # Academic Presets (IEEE, Article, Thesis, Lab, CV)
│   ├── store/
│   │   └── useDocumentStore.ts         # Zustand Store with Undo/Redo & Resizable Panel State
│   └── types/
│       └── document.ts                 # Core AST Block & Document Configuration Schema
├── LATEX_ECOSYSTEM_RESEARCH.md         # Deep-dive research on the open-source LaTeX ecosystem
└── PRODUCT_PLAN_AND_ARCHITECTURE.md    # Full system architecture & product blueprint
```

---

## Author & License

**Author:** Fatin S Sinan ([@fatinssinan42](https://github.com/fatinssinan42))  
**License:** Licensed under the [MIT License](./LICENSE). Copyright © 2026 Fatin S Sinan.
