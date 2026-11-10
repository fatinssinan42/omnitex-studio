import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import {
  Heading1,
  Type,
  Sigma,
  Table,
  Image,
  GitBranch,
  BookMarked,
  Code,
  Terminal,
  List,
  Download,
  Upload,
  LayoutTemplate,
  Sparkles,
  FileCode,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '../store/useDocumentStore';
import { exportOverleafZipBundle } from '../utils/formatters';

/**
 * Command Palette (⌘K / Ctrl+K) built with `cmdk` (Emil Kowalski's pick-ui-library).
 * Per `emil-design-eng` & `animate`: 100+/day keyboard-initiated actions have ZERO open/close animation
 * so they feel instantaneous like Raycast.
 */
export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    addBlock,
    openStudioModal,
    setMode,
    config,
    blocks,
    bibliography,
  } = useDocumentStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const run = (fn: () => void) => {
    fn();
    setCommandPaletteOpen(false);
  };

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 pt-[13vh]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl"
      >
        <Command className="w-full" label="OmniTeX Command Menu">
          <div className="border-b border-stone-200 px-3.5 py-2.5">
            <Command.Input
              autoFocus
              placeholder="Type a command or block to insert (e.g. 'Equation', 'Excel Table', 'TikZ', 'IEEE')..."
              className="w-full bg-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs">
            <Command.Empty className="py-6 text-center text-xs text-stone-400">
              No matching commands found.
            </Command.Empty>

            <Command.Group
              heading="Insert Visual Blocks"
              className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400"
            >
              {[
                {
                  label: 'Insert Section Heading (\\section)',
                  icon: Heading1,
                  action: () => addBlock('section'),
                },
                {
                  label: 'Insert Rich Text Paragraph',
                  icon: Type,
                  action: () => addBlock('paragraph'),
                },
                {
                  label: 'Open Visual Equation & Matrix Studio',
                  icon: Sigma,
                  action: () => openStudioModal('math', null),
                },
                {
                  label: 'Open Excel-Style Table Studio (booktabs)',
                  icon: Table,
                  action: () => openStudioModal('table', null),
                },
                {
                  label: 'Open Canva-Style TikZ Diagram & Plot Studio',
                  icon: GitBranch,
                  action: () => openStudioModal('diagram', null),
                },
                {
                  label: 'Insert Figure / Subfigure Grid',
                  icon: Image,
                  action: () => addBlock('figure'),
                },
                {
                  label: 'Insert Theorem / Proof / Callout Box',
                  icon: Sparkles,
                  action: () => addBlock('callout'),
                },
                {
                  label: 'Insert Pseudocode Algorithm Block (algorithm2e)',
                  icon: Terminal,
                  action: () => addBlock('algorithm'),
                },
                {
                  label: 'Insert Syntax-Highlighted Code Listing',
                  icon: Code,
                  action: () => addBlock('code'),
                },
                {
                  label: 'Insert Bulleted / Numbered List',
                  icon: List,
                  action: () => addBlock('list'),
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={i}
                    onSelect={() => run(item.action)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 aria-selected:bg-stone-900 aria-selected:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group
              heading="Citations, Templates & Export"
              className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400"
            >
              <Command.Item
                onSelect={() => run(() => openStudioModal('citation'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 aria-selected:bg-stone-900 aria-selected:text-white"
              >
                <BookMarked className="h-3.5 w-3.5" />
                <span>Search Papers by Title / DOI (Crossref Live Citation)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => run(() => openStudioModal('templates'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 aria-selected:bg-stone-900 aria-selected:text-white"
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                <span>Switch Journal Template (IEEE, ACM, Thesis, CV)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => run(() => openStudioModal('import'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 aria-selected:bg-stone-900 aria-selected:text-white"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import Microsoft Word (.docx) / LaTeX (.tex)</span>
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  run(() => {
                    exportOverleafZipBundle(config, blocks, bibliography);
                    toast.success('Downloaded Overleaf-ready .zip bundle!');
                  })
                }
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 aria-selected:bg-stone-900 aria-selected:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Overleaf / arXiv Project (.zip)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => run(() => setMode('visual'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 aria-selected:bg-stone-900 aria-selected:text-white"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Switch to Visual Word Mode</span>
              </Command.Item>
              <Command.Item
                onSelect={() => run(() => setMode('code'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 aria-selected:bg-stone-900 aria-selected:text-white"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>Switch to Pro Overleaf (.tex) Code Mode</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
