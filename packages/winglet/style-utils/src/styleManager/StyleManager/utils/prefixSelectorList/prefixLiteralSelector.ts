import { prefixSelector } from '../prefixSelector';

/**
 * Prefixes a selector known to contain neither escapes nor comments.
 * @param selector - Trimmed literal selector; empty list members remain empty
 * @param prefix - Scope class and a trailing space
 * @returns The scoped selector, preserving the five-character root/host exceptions
 */
export const prefixLiteralSelector = (
  selector: string,
  prefix: string,
): string =>
  !selector || selector.length === 5
    ? prefixSelector(selector, prefix)
    : prefix + selector;
