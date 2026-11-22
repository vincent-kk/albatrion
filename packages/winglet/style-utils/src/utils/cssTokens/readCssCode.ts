/** Text and UTF-8 scanners share ASCII token boundaries without converting their input. */
export type CssSource = string | Uint8Array;

/** Read an ASCII code from either scanner representation; an absent code is not CSS syntax. */
export const readCssCode = (source: CssSource, index: number): number =>
  typeof source === 'string' ? source.charCodeAt(index) : source[index];
