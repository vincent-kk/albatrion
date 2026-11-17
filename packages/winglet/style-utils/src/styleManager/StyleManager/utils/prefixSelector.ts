/**
 * Prefixes one selector with the scope.
 *
 * @param selector - Trimmed single selector, such as `.btn:hover`
 * @param prefix - Scope selector followed by one space, such as `'.my-widget '`;
 * built once per stylesheet so each selector costs a single concatenation
 * @returns `prefix + selector`, or the selector unchanged when it is exactly `:root` or `:host`.
 */
export const prefixSelector = (selector: string, prefix: string): string =>
  selector === ':root' || selector === ':host' ? selector : prefix + selector;
