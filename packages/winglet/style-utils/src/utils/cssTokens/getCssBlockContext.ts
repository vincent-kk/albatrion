import { CssContext } from './CssContext';
import { getCssEscapeCode } from './getCssEscapeCode';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/** At-rules whose block grammar is known to contain rules. */
const GROUPING = /^(?:-[a-z]+-)?(?:media|supports|container|layer|scope|document|starting-style|keyframes)$/i;
/** At-rules whose block grammar is known to contain declarations. */
const DECLARATIONS = /^(?:font-face|page|counter-style|property|font-palette-values|position-try|view-transition|color-profile)$/i;

/**
 * Select a known at-rule block grammar; unknown bodies remain opaque.
 * @param source CSS text or bytes
 * @param start The at-sign beginning its prelude
 * @param parent Surrounding rule or declaration list
 * @returns The block's whitespace grammar without interpreting unknown extensions
 */
export const getCssBlockContext = (source: CssSource, start: number, parent: CssContext): CssContext => {
  let name = '', index = start + 1;
  while (index < source.length) {
    const raw = readCssCode(source, index), code = raw === 92 ? getCssEscapeCode(source, index) : raw;
    if (!((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 45)) break;
    name += String.fromCharCode(code); index = raw === 92 ? getCssEscapeEnd(source, index) : index + 1;
  }
  if (GROUPING.test(name)) return parent === CssContext.DeclarationList ? parent : CssContext.RuleList;
  return DECLARATIONS.test(name) ? CssContext.DeclarationList : CssContext.OpaquePrelude;
};
