import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  Check,
  LayoutTemplate,
  PanelTop,
} from 'lucide-react';
import * as mammoth from 'mammoth';
import { toast } from 'sonner';
import { useDocumentStore } from '../../store/useDocumentStore';
import { DOCUMENT_TEMPLATES } from '../../engine/templates';
import {
  parseHtmlOrMarkdownToBlocks,
  parseLatexSourceToDocument,
} from '../../engine/latexParser';

export const ImportAndTemplateModals: React.FC = () => {
  const {
    activeModal,
    config,
    updateConfig,
    setBlocks,
    applyTemplate,
    syncFromRawLatex,
    closeStudioModal,
  } = useDocumentStore();

  const [importTab, setImportTab] = useState<'docx' | 'latex' | 'markdown'>('docx');
  const [pasteContent, setPasteContent] = useState('');

  if (
    activeModal !== 'import' &&
    activeModal !== 'templates' &&
    activeModal !== 'header_footer'
  ) {
    return null;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    try {
      if (name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const blocks = parseHtmlOrMarkdownToBlocks(result.value, true);
        if (blocks.length > 0) {
          setBlocks(blocks);
          updateConfig({ title: file.name.replace(/\.docx$/i, '') });
          toast.success(`Imported ${blocks.length} visual blocks from ${file.name}`);
          closeStudioModal();
        } else {
          toast.error('No structured content found in .docx file');
        }
      } else if (name.endsWith('.tex')) {
        const text = await file.text();
        syncFromRawLatex(text);
        toast.success(`Parsed ${file.name} into visual blocks!`);
        closeStudioModal();
      } else {
        const text = await file.text();
        const blocks = parseHtmlOrMarkdownToBlocks(text, false);
        if (blocks.length > 0) {
          setBlocks(blocks);
          toast.success(`Imported ${blocks.length} blocks from ${file.name}`);
          closeStudioModal();
        }
      }
    } catch {
      toast.error(`Failed to parse ${file.name}`);
    }
  };

  const handlePasteConvert = () => {
    if (!pasteContent.trim()) return;
    if (importTab === 'latex') {
      syncFromRawLatex(pasteContent);
      toast.success('Converted LaTeX source into visual blocks!');
      closeStudioModal();
    } else {
      const blocks = parseHtmlOrMarkdownToBlocks(pasteContent, false);
      if (blocks.length > 0) {
        setBlocks(blocks);
        toast.success(`Converted Markdown into ${blocks.length} visual blocks!`);
        closeStudioModal();
      }
    }
  };

  if (activeModal === 'templates') {
    return (
      <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
        <div className="modal-surface flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#FAF9F6] shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
                <LayoutTemplate className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900 heading-tight">
                  Academic & Professional Template Gallery
                </h2>
                <p className="text-xs text-stone-500">
                  Switch journal layouts in one click — preamble and typography configure automatically
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeStudioModal}
              className="btn-press rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 overflow-y-auto p-5 sm:grid-cols-2">
            {DOCUMENT_TEMPLATES.map((tpl) => {
              const isCurrent = config.templateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600/30'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-stone-900">
                        {tpl.name}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold text-stone-700">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                      {tpl.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-stone-500">
                      <span className="rounded bg-stone-100 px-1.5 py-0.5">
                        \{tpl.config.documentClass}
                      </span>
                      <span className="rounded bg-stone-100 px-1.5 py-0.5">
                        {tpl.config.columns === 2 ? '2-Column' : '1-Column'}
                      </span>
                      <span className="rounded bg-stone-100 px-1.5 py-0.5">
                        {tpl.config.fontSize}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      applyTemplate(tpl.id);
                      toast.success(`Loaded "${tpl.name}" template`);
                      closeStudioModal();
                    }}
                    className={`btn-press mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {isCurrent ? 'Reload Template Defaults' : 'Use This Template'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (activeModal === 'header_footer') {
    const hf = config.headerFooter;
    const updateHf = (patch: Partial<typeof hf>) =>
      updateConfig({ headerFooter: { ...hf, ...patch } });

    return (
      <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
        <div className="modal-surface flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#FAF9F6] shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
                <PanelTop className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900 heading-tight">
                  Visual Page Header & Footer Designer (fancyhdr)
                </h2>
                <p className="text-xs text-stone-500">
                  Configure Left, Center, and Right slots without writing \fancyhead macros
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeStudioModal}
              className="btn-press rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={hf.enabled}
                  onChange={(e) => updateHf({ enabled: e.target.checked })}
                  className="rounded accent-stone-900"
                />
                Enable Running Headers & Footers (`\usepackage&#123;fancyhdr&#125;`)
              </label>

              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                <span>Quick Tokens:</span>
                {[
                  { label: 'Page #', token: '\\thepage' },
                  { label: 'Section Name', token: '\\leftmark' },
                  { label: 'Today Date', token: '\\today' },
                ].map((tk) => (
                  <button
                    key={tk.token}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(tk.token);
                      toast.success(`Copied ${tk.token}`);
                    }}
                    className="btn-press rounded bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-700 hover:bg-stone-200"
                  >
                    {tk.label} ({tk.token})
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800">
                  Top Page Header Slots
                </span>
                <label className="flex items-center gap-1.5 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={hf.showHeaderRule}
                    onChange={(e) => updateHf({ showHeaderRule: e.target.checked })}
                  />
                  Show Horizontal Rule Line (`0.4pt`)
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] text-stone-400">Left Header</label>
                  <input
                    type="text"
                    value={hf.leftHeader}
                    onChange={(e) => updateHf({ leftHeader: e.target.value })}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400">Center Header</label>
                  <input
                    type="text"
                    value={hf.centerHeader}
                    onChange={(e) => updateHf({ centerHeader: e.target.value })}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-center text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400">Right Header</label>
                  <input
                    type="text"
                    value={hf.rightHeader}
                    onChange={(e) => updateHf({ rightHeader: e.target.value })}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-right text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800">
                  Bottom Page Footer Slots
                </span>
                <label className="flex items-center gap-1.5 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={hf.showFooterRule}
                    onChange={(e) => updateHf({ showFooterRule: e.target.checked })}
                  />
                  Show Footer Rule Line
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] text-stone-400">Left Footer</label>
                  <input
                    type="text"
                    value={hf.leftFooter}
                    onChange={(e) => updateHf({ leftFooter: e.target.value })}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400">Center Footer</label>
                  <input
                    type="text"
                    value={hf.centerFooter}
                    onChange={(e) => updateHf({ centerFooter: e.target.value })}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-center text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400">Right Footer</label>
                  <input
                    type="text"
                    value={hf.rightFooter}
                    onChange={(e) => updateHf({ rightFooter: e.target.value })}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-right text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-stone-200/80 bg-white px-5 py-3">
            <button
              type="button"
              onClick={closeStudioModal}
              className="btn-press rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Import Modal (.docx / .tex / .md)
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="modal-surface flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#FAF9F6] shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 heading-tight">
                Import Microsoft Word (.docx), LaTeX (.tex), or Markdown (.md)
              </h2>
              <p className="text-xs text-stone-500">
                Automatically converts headings, paragraphs, tables, and equations into visual OmniTeX blocks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeStudioModal}
            className="btn-press rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white p-6 text-center hover:border-blue-500 hover:bg-blue-50/20">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="mt-2 text-xs font-semibold text-stone-900">
              Click to Upload a `.docx` (Microsoft Word), `.tex` (LaTeX), or `.md` File
            </span>
            <span className="mt-1 text-[11px] text-stone-500">
              Parsed 100% locally in your browser via Mammoth & OmniTeX AST Parser
            </span>
            <input
              type="file"
              accept=".docx,.tex,.md,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800">
                Or Paste Raw Source Directly
              </span>
              <div className="flex gap-1">
                {(['latex', 'markdown'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setImportTab(m)}
                    className={`btn-press rounded px-2.5 py-1 text-xs font-medium ${
                      importTab === m
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {m === 'latex' ? 'Paste .tex Code' : 'Paste Markdown'}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder={
                importTab === 'latex'
                  ? '\\section{Introduction}\nWrite or paste any LaTeX document here...'
                  : '# Introduction\nWrite or paste Markdown with $$E = mc^2$$ here...'
              }
              className="w-full rounded border border-stone-300 bg-stone-50 p-2.5 font-mono text-xs"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePasteConvert}
                className="btn-press flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Convert to Visual Blocks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
