import { prefixSelector } from './prefixSelector';
import { skipOpaqueToken } from './skipOpaqueToken';

/** Characters that may hide a comma from the list structure. */
const NESTING_CHARACTER = /[("'\\/]/;

/**
 * Prefixes every selector of a selector list with the scope class.
 *
 * @param selectorList - Trimmed selector list of one style rule, such as `.a, .b:is(.c, .d)`
 * @param scope - Scope selector to prefix, such as `.my-widget`
 * @returns The list joined by `,`, each selector passed through `prefixSelector`.
 * The list splits only at top-level commas: commas inside parentheses, strings,
 * comments or after a backslash belong to one selector.
 */
export const prefixSelectorList = (
  selectorList: string,
  scope: string,
): string => {
  if (!NESTING_CHARACTER.test(selectorList)) {
    const selectors = selectorList.split(',');
    let result = prefixSelector(selectors[0].trim(), scope);
    for (let index = 1; index < selectors.length; index++)
      result += ',' + prefixSelector(selectors[index].trim(), scope);
    return result;
  }
  let result = '';
  let partStart = 0;
  let depth = 0;
  for (let index = 0, length = selectorList.length; index < length; index++) {
    const next = skipOpaqueToken(selectorList, index);
    if (next !== index) index = next - 1;
    else if (selectorList[index] === '(') depth++;
    else if (selectorList[index] === ')') depth--;
    else if (selectorList[index] === ',' && depth === 0) {
      result +=
        prefixSelector(selectorList.slice(partStart, index).trim(), scope) +
        ',';
      partStart = index + 1;
    }
  }
  return result + prefixSelector(selectorList.slice(partStart).trim(), scope);
};
