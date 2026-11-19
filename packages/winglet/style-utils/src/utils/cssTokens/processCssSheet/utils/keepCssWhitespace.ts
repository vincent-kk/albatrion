import { CssContext } from '../../CssContext';
import { hasCssCdcBoundary } from '../../hasCssCdcBoundary';

/**
 * Keep only whitespace whose grammar or token boundary still needs it.
 * @param css Original stylesheet text
 * @param context Current grammar position
 * @param components Number of open value/prelude components
 * @param valueEmpty Whether a declaration has no significant value token
 * @param custom Whether the declaration name is a custom property
 * @param previous Previous emitted punctuation or zero for a name/opaque token
 * @param next First code unit after whitespace
 * @param previousEnd Original end of the previous emitted token
 * @returns Whether one whitespace code unit remains
 */
export const keepCssWhitespace = (css: string, context: CssContext, components: number, valueEmpty: boolean, custom: boolean, previous: number, next: number, previousEnd: number): boolean => {
    if (hasCssCdcBoundary(css, previousEnd, next)) return true;
    if (context === CssContext.RuleList) return false;
    if (context === CssContext.DeclarationList) return next === 47 && previous !== 123 && previous !== 125 && previous !== 59;
    if (context === CssContext.DeclarationName) return next !== 58;
    if (context === CssContext.Selector) {
      if (previous === 44 || next === 44 || previous === 62 || next === 62 || previous === 126 || next === 126) return false;
      if (components === 0 && (previous === 43 || next === 43 || next === 123)) return false;
      if (components > 0 && (previous === 40 || next === 41)) return false;
      return true;
    }
    if (context === CssContext.OpaquePrelude) return true;
    if (context === CssContext.AtPrelude) {
      if (previous === 58 && next === 41) return true;
      if (previous === 44 || next === 44) return false;
      if (components === 0 && (next === 123 || next === 59)) return false;
      if (components > 0 && (previous === 40 || next === 41 || previous === 58 || next === 58)) return false;
      return true;
    }
    if (valueEmpty) return next === 59 || next === 125;
    if (previous === 59 || next === 59) return false;
    if (components === 0 && (next === 59 || next === 125)) return false;
    if (!custom && (previous === 44 || next === 44 || previous === 40 || next === 41)) return false;
    return true;
};
