import type { ImportPath } from '../types';
import { compareText } from './compareText';
import type { ExportRef, IndexedEntry } from './types';

/** Import paths with the canonical entry first, then `exports` order with the root last; within an entry, the page name first. */
export function orderImportPaths(refs: ExportRef[], canonical: IndexedEntry, pageName: string, packageName: string): ImportPath[] {
  const entryRank = (ref: ExportRef): number => (ref.entry === canonical ? -1 : ref.entry.exportsOrder);
  const nameRank = (ref: ExportRef): string => (ref.item.exportedName === pageName ? '' : ref.item.exportedName);
  return [...refs]
    .sort((a, b) => entryRank(a) - entryRank(b) || compareText(nameRank(a), nameRank(b)))
    .map(({ entry, item }) => ({
      entryKey: entry.entryKey,
      moduleSpecifier: entry.category ? `${packageName}/${entry.category}` : packageName,
      exportedName: item.exportedName,
      isTypeOnly: item.isTypeOnly,
    }));
}
