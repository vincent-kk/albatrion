import { getCssOpaqueEnd } from '../../../utils/cssTokens/getCssOpaqueEnd';

/**
 * Read the common lexical/component boundary used by compression and the scoper.
 * @param css Stylesheet text.
 * @param index Candidate opaque token or component start.
 * @returns Its first following position, or index for ordinary text.
 */
export const skipOpaqueToken = (css: string, index: number): number => getCssOpaqueEnd(css, index);
