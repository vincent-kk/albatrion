/**
 * Percent-encode what the URL parser deletes or rewrites: C0 controls, space and backslash.
 * @param reference Written value.
 * @returns The value with each such character as an uppercase `%XX` escape.
 */
export function encodeUnsafe(reference: string): string {
  let written = '';
  for (const character of reference)
    written +=
      character > ' ' && character !== '\\'
        ? character
        : '%' +
          character.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
  return written;
}
