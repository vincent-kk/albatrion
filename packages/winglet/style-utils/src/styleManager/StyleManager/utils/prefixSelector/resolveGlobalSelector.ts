import { isGlobalSelector } from '../isGlobalSelector';

/** ASCII-insensitive pseudo names with only trailing whitespace or comments. */
const GLOBAL_SELECTOR = /^:(?:root|host)(?:\s|\/\*[\s\S]*?\*\/)*$/i;

/** Leading comments do not supply a selector list member. */
const LEADING_COMMENTS = /^(?:\s*\/\*[\s\S]*?\*\/)*\s*/;

/**
 * Resolves a possible global pseudo token after the ordinary-selector fast path.
 * @param selector - Trimmed selector whose prefix can form root/host, or a leading comment
 * @param prefix - Scope class and trailing space for a non-global selector
 * @returns The original selector for one global pseudo token, otherwise the scoped selector
 */
export const resolveGlobalSelector = (
  selector: string,
  prefix: string,
): string => {
  const meaningful =
    selector.charCodeAt(0) === 47
      ? selector.replace(LEADING_COMMENTS, '')
      : selector;
  return !meaningful ||
    GLOBAL_SELECTOR.test(meaningful) ||
    ((meaningful.includes('\\') || meaningful.startsWith(':/*')) &&
      isGlobalSelector(meaningful))
    ? selector
    : prefix + selector;
};
