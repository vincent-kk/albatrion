import { getCssUrlEndAtOpen } from '../../cssTokens/getCssUrlEndAtOpen';

/**
 * Delegate URL boundaries to the shared lexical position model.
 * @param source Stylesheet representation.
 * @param open Candidate URL opening parenthesis.
 * @returns End of an unquoted URL, or the original position for another function.
 */
export const findUnquotedUrlEnd = (source: Uint8Array, open: number): number => getCssUrlEndAtOpen(source, open);
