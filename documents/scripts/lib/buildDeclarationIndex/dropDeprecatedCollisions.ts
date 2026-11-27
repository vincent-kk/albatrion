import { pagePath } from './pagePath';
import type { DeclarationPage } from './types';

/**
 * Keeps one page per page path compared ignoring case: a lone page, or the
 * one current page among deprecated ones.
 */
export function dropDeprecatedCollisions<T extends { page: DeclarationPage; isDeprecated: boolean }>(packageName: string, candidates: T[]): T[] {
  const byPath = new Map<string, T[]>();
  for (const candidate of candidates) {
    const key = pagePath(candidate.page.category, candidate.page.pageName).toLowerCase();
    byPath.set(key, [...(byPath.get(key) ?? []), candidate]);
  }
  return [...byPath.values()].map(same => {
    if (same.length === 1) return same[0];
    const current = same.filter(candidate => !candidate.isDeprecated);
    if (current.length === 1) return current[0];
    const described = same.map(({ page }) => `${pagePath(page.category, page.pageName)} (${page.parsed.sourceFile})`).sort();
    throw new Error(`page path collision: ${packageName} ${described.join(', ')}`);
  });
}
