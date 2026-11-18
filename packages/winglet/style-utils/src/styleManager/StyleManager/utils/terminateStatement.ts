import { skipOpaqueToken } from './skipOpaqueToken';

/**
 * Separates a trailing statement at-rule from a subsequently injected stylesheet.
 * @param css - One complete stylesheet fragment
 * @returns The original fragment, with a semicolon when its final top-level at-rule lacks one
 */
export const terminateStatement = (css: string): string => {
  const last = css.charCodeAt(css.length - 1);
  if (last === 125 || last === 59) return css;
  let depth = 0;
  let statement = -1;
  for (let index = 0; index < css.length; index++) {
    const code = css.charCodeAt(index);
    const next = skipOpaqueToken(css, index);
    if (next > index) { index = next - 1; continue; }
    if (depth === 0 && statement === -1 && code > 32) statement = index;
    if (code === 123) depth++;
    else if (code === 125) { depth--; if (depth === 0) statement = -1; }
    else if (code === 59 && depth === 0) statement = -1;
  }
  return depth === 0 && statement !== -1 && css.charCodeAt(statement) === 64 ? css + ';' : css;
};
