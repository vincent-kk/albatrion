import { selectCanonicalEntry } from '../selectCanonicalEntry';
import type { ExportRef, IndexedEntry } from './types';

/** The canonical entry among the sub-paths that export a declaration, or the root when none does. */
export function selectEntry(refs: ExportRef[], entries: IndexedEntry[], declarationFile: string): IndexedEntry {
  const hopsByEntry = new Map<IndexedEntry, number>();
  for (const { entry, item } of refs) {
    if (entry.entryKey !== '.') hopsByEntry.set(entry, Math.min(hopsByEntry.get(entry) ?? Infinity, item.hops));
  }
  if (hopsByEntry.size === 0) return entries[entries.length - 1];
  const exporting = [...hopsByEntry];
  const candidates = exporting.map(([entry, hops]) => ({ entryKey: entry.entryKey, entryDir: entry.entryDir, hops, exportsOrder: entry.exportsOrder }));
  return exporting[candidates.indexOf(selectCanonicalEntry(candidates, declarationFile))][0];
}
