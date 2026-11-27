import type { Redirect } from '../types';
import { readIfExists } from './readIfExists';
import type { SyncPlan } from './types';

/**
 * The redirect list file write, or null when it is already current. Entries
 * whose `from` starts with none of `replacedPrefixes` are kept; a null
 * `replacedPrefixes` replaces the whole list.
 */
export function planRedirects(
  filePath: string,
  redirects: Redirect[],
  replacedPrefixes: string[] | null,
): SyncPlan['writes'][number] | null {
  const current = readIfExists(filePath);
  const previous: Redirect[] = current === null ? [] : JSON.parse(current);
  const kept = replacedPrefixes === null ? [] : previous.filter(item => !replacedPrefixes.some(prefix => item.from.startsWith(prefix)));
  const list = [...kept, ...redirects].sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  const content = JSON.stringify(list, null, 2) + '\n';
  return content === current ? null : { path: filePath, content };
}
