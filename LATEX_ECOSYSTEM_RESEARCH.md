# Comprehensive Open-Source LaTeX Ecosystem Research & Product Blueprint

This document catalogs the open-source LaTeX ecosystem across **full editors**, **visual/WYSIWYG bridges**, **user-made companion tools**, **embeddable building blocks (WASM compilers, visual math inputs, parsers)**, and **product ideas** for building a next-generation LaTeX platform that anyone—even a Microsoft Word user who has never written a single `\begin{...}` tag—can effortlessly use.

---

## Part 1: Open-Source LaTeX Editors (All Categories)

### 1. Cloud & Collaborative Web Editors (Overleaf Class)
| Tool | License | Architecture / Stack | What Makes It Special |
| :--- | :--- | :--- | :--- |
| **Overleaf Community Edition** (`overleaf/overleaf`) | AGPLv3 | Node.js, MongoDB, Redis, Docker, TeX Live | The industry standard web-based collaborative LaTeX editor. Includes real-time sync, rich-text/visual mode toggle, PDF preview with SyncTeX. |
| **Aldine** (`Aldine`) | AGPLv3 | Containerized Web Stack | Modern self-hosted Overleaf alternative with visual editor mode, review/commenting, Zotero integration, AI error fixing, and Git/GitHub/GitLab/Gitea sync. |
| **TeXlyre** (`TeXlyre/texlyre`) | Open Source | Web + Desktop, BusyTeX (WASM), Yjs (P2P sync), MathLive | **Local-first collaborative editor** for LaTeX & Typst. Compiles right in the browser via WebAssembly (no heavy server needed) and integrates visual math editing. |
| **TexLite** | Open Source | Node.js + SQLite | Lightweight self-hosted collaborative LaTeX editor that avoids Overleaf's heavy Docker/microservice footprint. |
| **Coko Kotahi / Wax** | Open Source | ProseMirror, Node.js | Academic publishing workflow and web-based structured Word-like editor built for scholarly publishing. |

### 2. Visual, WYSIWYG & "Word-Like" Hybrid LaTeX Editors
These editors specifically try to hide or soften raw LaTeX code for visual thinkers:

| Tool | License | Paradigm | Key Strengths & Limitations |
| :--- | :--- | :--- | :--- |
| **LyX** (`lyx.org`) | GPLv2+ | **WYSIWYM** (What You See Is What You Mean) | The classic visual frontend for LaTeX. Users write in a Word-like interface with dropdowns for sections, environments, and visual equations; exports/compiles to real LaTeX. *Limitation: Dated Qt UI; uses its own `.lyx` intermediate format.* |
| **GNU TeXmacs / Mogan STEM** (`mogan-app`) | GPLv3 | **True WYSIWYG** Structured Typesetting | You type directly onto the typeset page (not code). Mogan STEM is a modernized Qt6 fork with blazing-fast visual math input and magic keybindings (e.g., typing `->` turns into $\rightarrow$). |
| **Texpile** (`texpile/texpile`) | AGPLv3 | **Dual Visual + Source Editor** | Modern offline/collaborative editor for `.tex`, `.typ`, and `.md`. Features inline visual editing, cell-merging tables, Knuth-Plass line breaking, and encrypted P2P collaboration. |
| **Modern LaTeX Editor** (`InMDev/Modern-LaTeX-Editor`) | Open Source | **Browser Hybrid (Rich-Text + Code)** | Syncs a Notion/Google Docs-style rich-text canvas with raw LaTeX code blocks, ribbon toolbar, and live KaTeX math rendering. |
| **WaldTeX** (`StructuredLabs/waldtex`) | Open Source | **"Obsidian meets Overleaf"** | Local-first scientific IDE where you write in clean Markdown/Quarto (`.md`/`.qmd`) with live visual preview and compile to publication-ready LaTeX PDFs under the hood. |
| **Emquad** (`TamerAbdelmigid/Emquad`) | Open Source | **Word-Like Page + Source** | Offline desktop alternative to Overleaf allowing direct page editing or source editing with a bundled compiler. |
| **Quarto Visual Editor** (`quarto-dev/quarto-cli`) | MIT / GPL | **ProseMirror WYSIWYG for Academic Docs** | Built into RStudio & VS Code; provides a full Word/Notion-like visual editor (slash commands `/`, visual citations `@`, visual tables & math) that compiles to LaTeX PDF via Pandoc. |

### 3. Traditional Desktop LaTeX IDEs
| Tool | Platform | Key Features |
| :--- | :--- | :--- |
| **TeXstudio** (`texstudio-org/texstudio`) | Cross-platform (Qt) | Feature-packed IDE: 1000+ math symbol buttons, wizards for tables/letters/articles, inline math preview on hover, integrated PDF viewer with SyncTeX, structure tree. |
| **Texmaker** | Cross-platform (Qt) | Clean, classic side-by-side code and PDF editor with symbol palettes and one-click build wizards. |
| **Kile** (KDE) | Linux / Windows | Project-oriented LaTeX IDE with deep symbol lookup, citation completion, and wizard dialogs. |
| **TeXworks** | Cross-platform | Minimalist editor bundled with TeX Live/MiKTeX; popularized SyncTeX (Ctrl+Click between code and PDF). |
| **TeXShop** | macOS | Classic macOS native open-source LaTeX editor and previewer. |

### 4. Developer-Grade Extensions & Language Servers
* **VS Code + LaTeX Workshop** (`James-Yu/LaTeX-Workshop`): Adds snippet palettes, math/image hover previews, SyncTeX PDF viewer, build recipes, and project outline.
* **TexLab** (`latex-lsp/texlab`): Rust-based Language Server Protocol (LSP) implementation for LaTeX providing intelligent autocomplete, forward/inverse search, and diagnostics across any editor.
* **VimTeX** (`lervag/vimtex`) & **AUCTeX** (Emacs): Power-user keyboard-driven LaTeX suites with instant math conceal and motion mappings.

---

## Part 2: User-Made Open-Source Tools That Make LaTeX Easy & Useful

The biggest secret of the LaTeX community is that **nobody likes writing complex tables, TikZ graphics, or long matrices by hand**—so users built specialized open-source visual generators for every painful part of LaTeX.

### A. Visual Math, Equation & Handwriting Tools (No Code Required)
1. **MathLive** (`arnog/mathlive` - MIT):
   * **What it is:** The gold-standard open-source web component (`<math-field>`) for visual WYSIWYG math editing.
   * **Why it's huge:** Works just like Microsoft Word's Equation Editor (or better), comes with a built-in virtual math keyboard, handles 800+ LaTeX commands, and outputs clean LaTeX, MathML, or AsciiMath.
2. **MathQuill** (`mathquill/mathquill` - MPL-2.0):
   * **What it is:** The visual math input library used by Desmos. Lets users type natural math visually without seeing raw backslashes.
3. **Detexify** (`kirel/detexify` - MIT):
   * **What it is:** Draw any weird math symbol with your mouse or finger on a canvas, and it tells you the exact LaTeX command and package needed (`\mathbb{R}`, `\propto`, `\lesssim`).
4. **LaTeX-OCR / pix2tex** (`lukas-blecher/LaTeX-OCR` - MIT):
   * **What it is:** Open-source alternative to Mathpix! Take a screenshot or photo of any printed or handwritten equation from a textbook/paper and get the exact LaTeX code.
5. **TexTeller** (`OleehyO/TexTeller` - Apache 2.0) & **MixTeX** (`RQLuo/MixTeX`):
   * **What they are:** High-accuracy open-source Vision-Transformer models that convert images of complex multi-line equations, matrices, and even **entire tables + mixed text** into LaTeX offline.

### B. Visual Table Generators & Spreadsheet Converters
LaTeX tables (`\begin{tabular}{...} & & \\ \hline`) are notoriously painful for beginners.
1. **LaTeX-Tables** (`JDMCreator/LaTeX-Tables` - GPLv3):
   * Open-source web app (powers `latex-tables.com`). Gives an Excel-like grid where you type, merge cells, color rows, pick `booktabs` style, or import CSV/Excel, and it generates clean LaTeX code in real time.
2. **Excel2LaTeX** (`ivanhjc/Excel2LaTeX` / CTAN `excel2latex` - GPL):
   * Converts Excel spreadsheets (including cell borders, bold/italic formatting, merged cells, and colors) directly into LaTeX `tabular` code.
3. **Pandoc Table & CSV2LaTeX** (`pandoc`, `csv2latex`, `tabulate`):
   * Converts Markdown tables, CSVs, HTML tables, or Word tables into `booktabs`, `longtable`, or `tabularray` (the modern LaTeX3 table package).
4. **LaTeXTableCreator**:
   * Desktop GUI utility for visually drafting and exporting publication-quality `booktabs` tables.

### C. Visual Diagram, Plot & TikZ Generators
TikZ produces stunning vector graphics, but coding coordinates by hand is brutal.
1. **TikZ Editor** (`tikz.dev/editor` - MIT) & **TikZEdt** (`tikzedt/tikzedt` - GPL):
   * Hybrid WYSIWYG + code editors for TikZ where you can drag nodes, resize shapes, and see the TikZ code update automatically.
2. **Quiver** (`varkor/quiver` - MIT):
   * A gorgeous, intuitive web app for drawing commutative diagrams and arrows by clicking and dragging, exporting clean `tikz-cd` LaTeX code.
3. **TikZiT** (`tikzit/tikzit` - GPL):
   * GUI graph and diagram editor that reads and writes native PGF/TikZ files.
4. **Ipe Extensible Drawing Editor** (`otfried/ipe` - GPL):
   * A full Adobe Illustrator / Inkscape-style vector drawing program designed specifically for LaTeX—all text and labels inside your drawing are rendered by LaTeX!
5. **svg2tikz** (`xyz2tex/svg2tikz`) & **Inkscape LaTeX Export**:
   * Draw anything visually in Inkscape, Figma, or Excalidraw (exported to SVG) and convert it into native TikZ paths and LaTeX text nodes.
6. **matplot2tikz / tikzplotlib** (`nschloe/tikzplotlib` - MIT):
   * Converts Python `matplotlib` charts directly into native LaTeX `pgfplots` code so fonts match the document 100%.
7. **Circuitikz GUI** (`Circuitikz-GUI`):
   * Drag-and-drop electrical circuit builder that exports `circuitikz` LaTeX code.

### D. Bibliography, Citation & Reference Tools
1. **JabRef** (`JabRef/jabref` - MIT):
   * Open-source cross-platform `.bib` manager. Paste a DOI, ISBN, or ArXiv ID, and it fetches the complete BibTeX entry automatically.
2. **Zotero + Better BibTeX** (`retorquere/zotero-better-bibtex`):
   * Keeps a live-updated `.bib` file synced with your PDF library and generates clean citation keys (`\cite{smith2024}`).
3. **doi2bib** (`bibcure/doi2bib` & web equivalents):
   * One-click converter: paste any paper URL, DOI, or ArXiv link $\rightarrow$ get clean BibTeX.
4. **bibtex-tidy** (`FlamingTempura/bibtex-tidy` - MIT):
   * JavaScript library/CLI that cleans, deduplicates, formats, and validates messy `.bib` files.

### E. Document Conversion & Extraction Tools (Word $\leftrightarrow$ LaTeX $\leftrightarrow$ PDF)
1. **Pandoc** (`jgm/pandoc` - GPL):
   * The universal document Swiss Army Knife. Converts `.docx` (Microsoft Word) $\leftrightarrow$ `.tex` (LaTeX) $\leftrightarrow$ `.md` (Markdown) $\leftrightarrow$ `.html`.
2. **Writer2LaTeX** (`writer2latex`):
   * Specialized LibreOffice/Word `.docx`/`.odt` to LaTeX converter that preserves styles, footnotes, tables, and equations.
3. **LaTeXML** (`brucemiller/LaTeXML` - Public Domain):
   * Developed by NIST; converts full LaTeX documents (including custom macros and packages, used by ArXiv's HTML5 papers!) into clean HTML5 + MathML.
4. **Nougat** (`facebookresearch/nougat`), **Marker** (`VikParuchuri/marker`), & **MinerU** (`opendatalab/MinerU`):
   * Open-source AI tools that take a compiled academic PDF and reverse-engineer it back into clean Markdown + LaTeX equations and tables!

### F. Browser-Based / Zero-Install Compilers & Linters
1. **BusyTeX** (`busytex/busytex` & `TeXlyre/texlyre-busytex`):
   * Compiles full TeX Live (pdfLaTeX, XeLaTeX, LuaLaTeX, BibTeX/Biber) to WebAssembly (WASM) so users can compile PDFs in the browser **with zero server or 5GB installation**.
2. **SwiftLaTeX** (`SwiftLaTeX/SwiftLaTeX`):
   * WASM LaTeX engine featuring character-level PDF-to-source mapping (enabling true WYSIWYG cursor clicking directly inside the compiled PDF).
3. **Tectonic** (`tectonic-typesetting/tectonic` - MIT):
   * Modernized single-binary Rust TeX engine that automatically downloads only the CTAN packages a document actually uses on the fly.
4. **ChkTeX**, **latexindent**, **tex-fmt** (`WGUNDERWOOD/tex-fmt`), & **LTeX** (LanguageTool grammar checker that ignores LaTeX commands while checking your English prose).

---

## Part 3: Why Normal People Struggle with LaTeX (The "Microsoft Word" Gap)

Someone coming from Microsoft Word, Google Docs, or Notion hits **7 walls** within their first 10 minutes of using traditional LaTeX:
1. **The "Preamble Terror":** Opening a template and seeing 80 lines of `\usepackage[utf8]{inputenc}`, `\makeatletter`, and cryptic macros before the first word of the document.
2. **Cryptic Compiler Errors:** Missing a single `}` or `_` produces `Missing $ inserted` or `Undefined control sequence l.412`—which scares non-programmers away.
3. **Table & Image Hell:** In Word, you drag an image in, resize its corner, or click "Insert 4x3 Table". In LaTeX, images float away to the next page (`[htbp!]`) and tables require `&` and `\multicolumn`.
4. **Font, Margin & Page Setup Mystery:** Changing margins in Word is a visual ruler slider; in LaTeX you have to know `\usepackage[margin=1in]{geometry}`.
5. **Equation Syntax Memorization:** Nobody new knows `\frac{a}{b}`, `\sum_{i=1}^n`, or `\int_0^\infty`.
6. **Journal Template Pain:** Converting a Word document or plain draft into an IEEE, ACM, Springer, APA, or University Thesis LaTeX template takes hours of copy-pasting and fixing broken packages.
7. **Installation / Slow Compile Loop:** Waiting 5–10 seconds for a PDF recompile just to see if a word is bold.

---

## Part 4: Ideas for What WE Can Build!

We can combine the best open-source building blocks above into an **all-in-one, super-approachable LaTeX application** (or modular suite) that makes LaTeX feel like **Microsoft Word + Notion + Canva**, while producing **100% authentic, publication-grade `.tex` and `.pdf` files**.

Here are **6 high-impact directions** we can build (or combine into one flagship app):

### Idea 1: "WordTeX Studio" — The Word-Like Visual LaTeX Editor (Zero-Code Needed, 100% Real `.tex` Under the Hood)
Build a modern web/desktop editor where a Microsoft Word user feels immediately at home, with **3 seamless modes**:
* **Mode 1: Visual "Word / Notion" Canvas (Default for Beginners)**
  * **Familiar Ribbon Toolbar:** Font family picker, Margin sliders, Line spacing dropdown, Page size (A4/Letter), 1-Column vs 2-Column toggle—all automatically generating clean `\usepackage{geometry}`, `\usepackage{setspace}`, etc. behind the scenes!
  * **Slash `/` Command Menu (like Notion):** Type `/table` $\rightarrow$ pops up an interactive Excel-like grid; type `/math` $\rightarrow$ opens a visual **MathLive** equation box with a clickable symbol keypad; type `/figure` $\rightarrow$ drag-and-drop an image with a visual width slider (`50%`, `80%`, `100%`) and a toggle for *"Keep image exactly here (`[H]`)"* vs *"Let LaTeX float it"*.
  * **Smart Citation Pill (`@`):** Paste any **DOI, ArXiv link, or paper title** $\rightarrow$ auto-fetches the BibTeX via Crossref/OpenAlex APIs, adds it to `references.bib`, and inserts a clickable `[Smith et al., 2025]` pill!
* **Mode 2: Split "Visual Block + Live LaTeX Inspector"**
  * Clicking any visual table, equation, or figure lets you see (and optionally tweak) its exact LaTeX snippet, teaching users LaTeX organically without overwhelming them.
* **Mode 3: Full Pro `.tex` Code + Side-by-Side PDF Preview (Overleaf Style)**
  * One-click toggle to raw `.tex` source editor (Monaco/CodeMirror) + compiled PDF preview so advanced co-authors can edit the exact same project in pure LaTeX!

### Idea 2: The "Everything-to-LaTeX" Visual Power Toolkit (All Helper Tools in One Place)
Instead of forcing users to visit 10 different websites (`tablesgenerator.com`, `detexify`, `mathpix`, `doi2bib`, `tikz.dev`), build a unified **LaTeX Super-Companion** (or embed it inside Idea 1 as a studio sidebar):
1. **Visual Spreadsheet-to-LaTeX Table Builder:** Paste directly from Excel/Google Sheets, merge cells visually, toggle `booktabs` / striped rows / auto-resize to page width (`\resizebox`), and copy or insert `.tex`.
2. **Draw-to-Symbol & Draw-to-Equation Canvas:** Draw a symbol or equation with your mouse/stylus (or paste a screenshot) $\rightarrow$ instant LaTeX code + live MathLive visual editor.
3. **Visual Diagram / Flowchart-to-TikZ Studio:** Drag-and-drop boxes, arrows, neural net layers, or plots on a canvas (like Excalidraw/Canva) $\rightarrow$ exports crisp native TikZ code.
4. **One-Click DOI / URL / PDF Citation Grabber:** Paste a list of DOIs, ArXiv URLs, or drop a PDF $\rightarrow$ generates a clean, formatted, deduplicated `.bib` file.
5. **Word (`.docx`) / Markdown $\rightarrow$ Journal LaTeX Converter:** Drop a Microsoft Word `.docx` file, pick a target template (IEEE Two-Column, ACM, Springer LNCS, Elsevier, Resume/CV, Thesis), and automatically convert text, headings, equations, images, and tables into a ready-to-compile LaTeX project zip!

### Idea 3: Plain-English "Human Error Translator" & Package Doctor
* Traditional LaTeX gives terrifying log files (`! LaTeX Error: File 'multirow.sty' not found` or `Misplaced alignment tab character &`).
* We can build a **Human Error Translator & Auto-Fixer** that parses TeX logs and explains errors in plain English with a **"Fix It For Me" button**:
  * *"You used an `&` symbol on line 42 (`R&D department`). In LaTeX, `&` is reserved for table columns. Click here to change it to `\&`."*
  * *"Your table is wider than the page by 34pt. Click here to wrap it in `\adjustbox{max width=\textwidth}`."*
  * *"You used `\includegraphics` without loading the `graphicx` package. Click here to auto-add `\usepackage{graphicx}` to your preamble."*

### Idea 4: Visual "Template & Preamble Customizer" (No More Preamble Coding)
* A visual **"Document Styler" GUI** where users customize their LaTeX document's look with live preview cards:
  * **Document Type:** Research Paper (IEEE / Nature / ArXiv style), University Thesis, Book, Homework Assignment, Presentation Slides (Beamer), or Resume/CV.
  * **Visual Controls:** Header/Footer builder (drag "Page X of Y", "Author Name", "Chapter Title" into left/center/right slots $\rightarrow$ generates `fancyhdr`), Heading Style picker (`titlesec`), Color Theme picker (`xcolor`), Callout/Theorem Box designer (`tcolorbox`), and Font Pairings.

### Idea 5: Visual Beamer & Academic Poster Maker (PowerPoint/Canva for LaTeX)
* Making slides in LaTeX (`beamer`) or conference posters (`tikzposter`/`beamerposter`) produces the cleanest math slides in the world, but positioning images and columns in code is tedious.
* Build a **PowerPoint-like slide/poster editor** where each slide is edited visually (drag-and-drop 2-column layouts, bullet animations, theorem boxes, equations, code blocks) and exports 100% standard LaTeX Beamer `.tex` code.

### Idea 6: Recommended Tech Stack We Can Use Right Now
If we build a web/desktop app in this workspace, we can assemble these proven open-source libraries:
* **Frontend:** React / Next.js or Vite + TypeScript + Tailwind CSS
* **Visual Word-Like Editor Engine:** **TipTap (ProseMirror)** or **Lexical** with custom bidirectional LaTeX AST serializer/parser
* **Visual Equation Editor:** **MathLive** (`<math-field>`) + **KaTeX** for instant math rendering
* **Pro Code Editor Mode:** **Monaco Editor** (VS Code's editor) with custom LaTeX syntax, autocomplete, and linter diagnostics
* **Visual Table Grid:** Interactive spreadsheet grid component with CSV/Excel paste and `booktabs` generator
* **Visual Diagram Builder:** **Excalidraw** or **React Flow** canvas with a custom **SVG/Graph $\rightarrow$ TikZ compiler**
* **Citation Engine:** **Citation.js** + Crossref / OpenAlex REST APIs (instant DOI/Title $\rightarrow$ BibTeX)
* **Word `.docx` Importer:** **Mammoth.js** / Pandoc AST bridge to convert `.docx` files directly into structured LaTeX
* **PDF Compilation:** Dual support for **In-Browser WASM Compilation** (SwiftLaTeX / BusyTeX) + optional **Local TeX Live / Tectonic** backend!
