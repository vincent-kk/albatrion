import { resolveGlobalSelector } from './prefixSelector/resolveGlobalSelector';

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
  if (first === 47) return resolveGlobalSelector(selector, prefix);
  const initial = selector.charCodeAt(1);
  if (initial !== 92 && initial !== 47) {
    const lower = initial | 32;
    if (lower !== 104 && lower !== 114) return prefix + selector;
    const second = selector.charCodeAt(2);
    if (second !== 92) {
      if ((second | 32) !== 111) return prefix + selector;
      const third = selector.charCodeAt(3);
      if (third !== 92 && (third | 32) !== (lower === 104 ? 115 : 111))
        return prefix + selector;
    }
  }
  return resolveGlobalSelector(selector, prefix);
};
