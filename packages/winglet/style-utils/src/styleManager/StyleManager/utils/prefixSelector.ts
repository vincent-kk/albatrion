/**
 * Prefixes one selector with the scope.
 *
 * @param selector - Trimmed single selector, such as `.btn:hover`
 * @param prefix - Scope selector followed by one space, such as `'.my-widget '`;
 * built once per stylesheet so each selector costs a single concatenation
 * @returns `prefix + selector`, or the selector unchanged when it is exactly `:root` or `:host`.
 */
/** ASCII-insensitive pseudo names with only trailing whitespace or comments. */
const GLOBAL_SELECTOR = /^:(?:root|host)(?:\s|\/\*[\s\S]*?\*\/)*$/i;

/** Leading comments do not supply a selector list member. */
const LEADING_COMMENTS = /^(?:\s*\/\*[\s\S]*?\*\/)*\s*/;

export const prefixSelector = (selector: string, prefix: string): string => {
  if (!selector) return selector;
  const first = selector.charCodeAt(0);
  if (first !== 58 && first !== 47) return prefix + selector;
  const meaningful =
    first === 47 ? selector.replace(LEADING_COMMENTS, '') : selector;
  return !meaningful || GLOBAL_SELECTOR.test(meaningful)
    ? selector
    : prefix + selector;
};
