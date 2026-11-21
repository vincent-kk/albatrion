/** Openings that may conceal otherwise structural punctuation. */
const OPAQUE_OPENING = /["'\\([]|\/(?=\*)/;

/**
 * Prepare a native search for structural punctuation and opaque openings.
 * @param punctuation Unescaped brace, comma or semicolon characters to find.
 * @returns The cursor probe used by the token position reader.
 */
export function createCssPunctuationProbe(punctuation: string): RegExp {
  return new RegExp(`[${punctuation}]|${OPAQUE_OPENING.source}`, 'g');
}
