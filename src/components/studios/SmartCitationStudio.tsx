import React, { useState } from 'react';
import {
  X,
  Search,
  BookMarked,
  Plus,
  Trash2,
  Link2,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../../store/useDocumentStore';
import { BibEntry } from '../../types/document';
import { serializeBibToBibtex } from '../../engine/latexSerializer';

interface CrossrefWorkItem {
  DOI?: string;
  title?: string[];
  author?: { given?: string; family?: string }[];
  published?: { 'date-parts'?: number[][] };
  'container-title'?: string[];
  volume?: string;
  page?: string;
  type?: string;
}

export const SmartCitationStudio: React.FC = () => {
  const {
    activeModal,
    bibliography,
    blocks,
    addBibEntry,
    removeBibEntry,
    insertCitationIntoSelectedBlock,
    insertCrossRefIntoSelectedBlock,
    closeStudioModal,
  } = useDocumentStore();

  const [tab, setTab] = useState<'search' | 'library' | 'crossref' | 'manual'>('search');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<BibEntry[]>([]);

  // Manual entry form
  const [mId, setMId] = useState('smith2026neural');
  const [mTitle, setMTitle] = useState('');
  const [mAuthor, setMAuthor] = useState('');
  const [mYear, setMYear] = useState('2026');
  const [mVenue, setMVenue] = useState('');
  const [mDoi, setMDoi] = useState('');

  if (activeModal !== 'citation') return null;

  const handleLiveCrossrefSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(
        query.trim()
      )}&rows=6`;
      const res = await fetch(url);
      const data = await res.json();
      const items: CrossrefWorkItem[] = data?.message?.items ?? [];

      const parsed: BibEntry[] = items.map((item, idx) => {
        const title = item.title?.[0] ?? 'Untitled Scholarly Publication';
        const firstFamily =
          item.author?.[0]?.family?.toLowerCase().replace(/[^a-z0-9]/g, '') ||
          `author${idx + 1}`;
        const year = String(
          item.published?.['date-parts']?.[0]?.[0] ?? new Date().getFullYear()
        );
        const firstWord =
          title
            .split(/\s+/)[0]
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, '') || 'paper';
        const citeKey = `${firstFamily}${year}${firstWord}`;

        const authors =
          item.author
            ?.map((a) => `${a.family ?? ''}${a.given ? `, ${a.given}` : ''}`.trim())
            .filter(Boolean)
            .join(' and ') || 'Unknown Author';

        return {
          id: citeKey,
          type: item.type?.includes('proceedings') ? 'inproceedings' : 'article',
          title,
          author: authors,
          year,
          journalOrVenue: item['container-title']?.[0] ?? 'Academic Journal / ArXiv',
          volume: item.volume,
          pages: item.page,
          doi: item.DOI,
        };
      });
      setResults(parsed);
    } catch {
      toast.error('Could not reach Crossref API — try the Manual or Library tab.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !mId.trim()) return;
    addBibEntry({
      id: mId.trim(),
      type: 'article',
      title: mTitle.trim(),
      author: mAuthor.trim() || 'Anonymous Author',
      year: mYear.trim() || '2026',
      journalOrVenue: mVenue.trim() || 'Preprint',
      doi: mDoi.trim() || undefined,
    });
    toast.success(`Added @${mId.trim()} to references.bib`);
    setMTitle('');
    setTab('library');
  };

  // Collect all labeled blocks for 1-click Cross-Referencing (\autoref{...})
  const labeledBlocks = blocks.filter(
    (b): b is typeof b & { label: string } => 'label' in b && Boolean(b.label)
  );

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="modal-surface flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#FAF9F6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
              <BookMarked className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 heading-tight">
                Smart @Citation & #Cross-Reference Studio
              </h2>
              <p className="text-xs text-stone-500">
                Search millions of papers live by Title or DOI (via Crossref), manage references.bib, or link figures/tables
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeStudioModal}
            className="btn-press rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-stone-200/80 bg-stone-100/70 px-5 pt-2">
          {[
            { id: 'search', label: 'Live DOI / Title Search (Crossref)' },
            { id: 'library', label: `Project Bibliography (${bibliography.length})` },
            { id: 'crossref', label: `Cross-Reference Linker (${labeledBlocks.length})` },
            { id: 'manual', label: '+ Add Custom BibTeX Entry' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              className={`btn-press rounded-t-lg px-3.5 py-2 text-xs font-medium ${
                tab === t.id
                  ? 'bg-[#FAF9F6] text-stone-900 shadow-xs ring-1 ring-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleLiveCrossrefSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type any paper title, author, or DOI (e.g. 'Deep Residual Learning' or '10.1038/nature14539')..."
                    className="w-full rounded-lg border border-stone-300 bg-white py-2 pr-3 pl-9 text-xs text-stone-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="btn-press flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  Search Crossref
                </button>
              </form>

              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((item) => {
                    const alreadyAdded = bibliography.some((b) => b.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 rounded-lg border border-stone-200 bg-white p-3.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-800 ring-1 ring-amber-600/20">
                              {item.id}
                            </span>
                            <span className="text-xs font-semibold text-stone-900">
                              {item.title}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-stone-600">
                            {item.author} ({item.year}) — <em>{item.journalOrVenue}</em>
                          </p>
                          {item.doi && (
                            <p className="mt-0.5 font-mono text-[10px] text-stone-400 overflow-wrap-anywhere">
                              DOI: {item.doi}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addBibEntry(item);
                            insertCitationIntoSelectedBlock(item.id);
                            toast.success(`Cited \\cite{${item.id}} and added to references.bib`);
                            closeStudioModal();
                          }}
                          className="btn-press flex-shrink-0 flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          {alreadyAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          Cite in Text
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 p-8 text-center">
                  <p className="text-xs text-stone-500">
                    Search above to fetch real BibTeX citations via Crossref, or switch to the{' '}
                    <button
                      type="button"
                      onClick={() => setTab('library')}
                      className="font-semibold text-blue-600 underline"
                    >
                      Project Bibliography ({bibliography.length})
                    </button>{' '}
                    tab to cite existing references.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'library' && (
            <div className="space-y-3">
              {bibliography.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white p-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-400 tabular-nums">
                        [{idx + 1}]
                      </span>
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-blue-800">
                        \cite&#123;{entry.id}&#125;
                      </span>
                      <span className="text-xs font-semibold text-stone-900">
                        {entry.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-600">
                      {entry.author} ({entry.year}) • <em>{entry.journalOrVenue}</em>
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        insertCitationIntoSelectedBlock(entry.id);
                        toast.success(`Inserted \\cite{${entry.id}} into active paragraph`);
                        closeStudioModal();
                      }}
                      className="btn-press rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
                    >
                      Insert Citation Pill
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBibEntry(entry.id)}
                      className="btn-press rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-stone-200 bg-stone-900 p-3.5 text-stone-100">
                <div className="mb-1 text-[11px] text-stone-400">
                  Live Generated references.bib File
                </div>
                <pre className="max-h-36 overflow-auto font-mono text-[11px] text-stone-200">
                  {serializeBibToBibtex(bibliography)}
                </pre>
              </div>
            </div>
          )}

          {tab === 'crossref' && (
            <div className="space-y-2">
              <p className="text-xs text-stone-600">
                Click any numbered item in your document to insert an automatic{' '}
                <code className="rounded bg-stone-200 px-1 font-mono">\autoref&#123;...&#125;</code> pill (so you never have to renumber figures or tables by hand):
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {labeledBlocks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      insertCrossRefIntoSelectedBlock(b.label);
                      toast.success(`Inserted cross-reference \\autoref{${b.label}}`);
                      closeStudioModal();
                    }}
                    className="btn-press flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3 text-left hover:border-emerald-500"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800">
                          {b.label}
                        </span>
                        <span className="text-[11px] uppercase text-stone-400">
                          {b.type}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-xs font-medium text-stone-800">
                        {'title' in b
                          ? b.title
                          : 'caption' in b && b.caption
                            ? b.caption
                            : 'latex' in b
                              ? b.latex
                              : b.label}
                      </div>
                    </div>
                    <Link2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'manual' && (
            <form onSubmit={handleAddManual} className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600">
                    Citation Key
                  </label>
                  <input
                    type="text"
                    value={mId}
                    onChange={(e) => setMId(e.target.value)}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-600">
                    Paper / Book Title
                  </label>
                  <input
                    type="text"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="e.g. Deep Residual Learning for Image Recognition"
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600">
                    Authors
                  </label>
                  <input
                    type="text"
                    value={mAuthor}
                    onChange={(e) => setMAuthor(e.target.value)}
                    placeholder="He, Kaiming and Zhang, Xiangyu"
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600">
                    Year
                  </label>
                  <input
                    type="text"
                    value={mYear}
                    onChange={(e) => setMYear(e.target.value)}
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600">
                    Journal / Conference
                  </label>
                  <input
                    type="text"
                    value={mVenue}
                    onChange={(e) => setMVenue(e.target.value)}
                    placeholder="CVPR"
                    className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600">
                  DOI (Optional)
                </label>
                <input
                  type="text"
                  value={mDoi}
                  onChange={(e) => setMDoi(e.target.value)}
                  placeholder="10.1109/CVPR.2016.90"
                  className="mt-1 w-full rounded border border-stone-300 px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-press rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Save to references.bib
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
