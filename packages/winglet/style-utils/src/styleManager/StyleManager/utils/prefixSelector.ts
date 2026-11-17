/**
 * Prefixes one selector with the scope class.
 *
 * @param selector - Trimmed single selector, such as `.btn:hover`
 * @param scope - Scope selector to prefix, such as `.my-widget`
 * @returns `${scope} ${selector}`, or the selector unchanged when it is exactly `:root` or `:host`.
 */
export const prefixSelector = (selector: string, scope: string): string =>
  selector === ':root' || selector === ':host'
    ? selector
    : scope + ' ' + selector;
