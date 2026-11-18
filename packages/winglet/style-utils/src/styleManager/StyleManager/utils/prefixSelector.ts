import { resolveGlobalSelector } from './prefixSelector/resolveGlobalSelector';

/** Prefixes that can begin root/host tokens, including escaped name characters. */
const GLOBAL_CANDIDATE = /^:(?:\\|\/|r(?:\\|o(?:o|\\))|h(?:\\|o(?:s|\\)))/i;

/**
 * Prefixes one selector with the scope.
 *
 * @param selector - Trimmed single selector, such as `.btn:hover`
 * @param prefix - Scope selector followed by one space, such as `'.my-widget '`;
 * built once per stylesheet so each selector costs a single concatenation
 * @returns `prefix + selector`, or the selector unchanged when it is a single `:root` or `:host` pseudo token.
 */
export const prefixSelector = (selector: string, prefix: string): string => {
  if (!selector) return selector;
  const first = selector.charCodeAt(0);
  if (first !== 58 && first !== 47) return prefix + selector;
  return first === 47 || GLOBAL_CANDIDATE.test(selector)
    ? resolveGlobalSelector(selector, prefix)
    : prefix + selector;
};
