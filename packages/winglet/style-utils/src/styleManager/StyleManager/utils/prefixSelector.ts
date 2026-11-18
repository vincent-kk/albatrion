import { isGlobalSelector } from './isGlobalSelector';

/** ASCII-insensitive pseudo names with only trailing whitespace or comments. */
const GLOBAL_SELECTOR = /^:(?:root|host)(?:\s|\/\*[\s\S]*?\*\/)*$/i;

/** Leading comments do not supply a selector list member. */
const LEADING_COMMENTS = /^(?:\s*\/\*[\s\S]*?\*\/)*\s*/;

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
  const meaningful =
    first === 47 ? selector.replace(LEADING_COMMENTS, '') : selector;
  if (!meaningful) return selector;
  const initial = meaningful.charCodeAt(1);
  if (initial !== 92 && initial !== 47) {
    const lower = initial | 32;
    if (lower !== 104 && lower !== 114) return prefix + selector;
    const second = meaningful.charCodeAt(2);
    if (second !== 92) {
      if ((second | 32) !== 111) return prefix + selector;
      const third = meaningful.charCodeAt(3);
      if (third !== 92 && (third | 32) !== (lower === 104 ? 115 : 111))
        return prefix + selector;
    }
  }
  return GLOBAL_SELECTOR.test(meaningful) ||
    ((meaningful.includes('\\') || meaningful.startsWith(':/*')) &&
      isGlobalSelector(meaningful))
    ? selector
    : prefix + selector;
};
