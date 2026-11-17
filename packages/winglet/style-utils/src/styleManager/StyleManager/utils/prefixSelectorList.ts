/**
 * Prefixes every selector of a selector list with the scope class.
 *
 * @param selectorList - Trimmed selector list of one style rule, such as `.a, .b:is(.c, .d)`
 * @param scope - Scope selector to prefix, such as `.my-widget`
 * @returns The list joined by `,`, each selector written as `${scope} ${selector}`.
 * The list splits only at top-level commas: commas inside parentheses, quoted
 * strings or after a backslash belong to one selector. A selector that is
 * exactly `:root` or `:host` stays unprefixed.
 */
export const prefixSelectorList = (
  selectorList: string,
  scope: string,
): string => {
  if (selectorList.indexOf(',') === -1)
    return prefixSelector(selectorList, scope);
  let result = '';
  let partStart = 0;
  let depth = 0;
  let quote = '';
  for (let index = 0, length = selectorList.length; index < length; index++) {
    const char = selectorList[index];
    if (char === '\\') index++;
    else if (quote) quote = char === quote ? '' : quote;
    else if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      result +=
        prefixSelector(selectorList.slice(partStart, index).trim(), scope) +
        ',';
      partStart = index + 1;
    }
  }
  return result + prefixSelector(selectorList.slice(partStart).trim(), scope);
};

const prefixSelector = (selector: string, scope: string): string =>
  selector === ':root' || selector === ':host'
    ? selector
    : scope + ' ' + selector;
