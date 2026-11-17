import type { PackageEntry, Redirect } from '../types';
import { compareText } from './compareText';
import { pagePath } from './pagePath';
import type { DeclarationPage, ExportRef, IndexedEntry } from './types';

/** Redirects from every non-canonical address of each page, sorted by `from`. */
export function listRedirects(pkg: PackageEntry, kept: Array<{ page: DeclarationPage; refs: ExportRef[] }>, entries: IndexedEntry[]): Redirect[] {
  const base = `/docs/${pkg.namespace}/${pkg.shortName}`;
  const address = (category: string, name: string): string => `${base}/${pagePath(category, name)}`;
  const reserved = new Set(
    [
      ...kept.map(({ page }) => address(page.category, page.pageName)),
      ...entries.filter(entry => entry.category).map(entry => `${base}/${entry.category}`),
    ].map(item => item.toLowerCase()),
  );
  const hasSubPaths = entries.length > 1;
  const redirects: Redirect[] = [];
  for (const { page, refs } of kept) {
    const to = address(page.category, page.pageName);
    for (const { entry, item } of refs) {
      if (hasSubPaths && entry.entryKey === '.') continue;
      const from = address(entry.category, item.exportedName);
      if (!reserved.has(from.toLowerCase())) redirects.push({ from, to });
    }
  }
  return redirects.sort((a, b) => compareText(a.from, b.from));
}
