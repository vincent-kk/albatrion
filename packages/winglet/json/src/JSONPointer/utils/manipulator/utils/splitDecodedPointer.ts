/**
 * Split a freshly decoded pointer at every `/`, giving the tokens `String#split('/')` gives.
 *
 * A string built at run time misses the engine's split cache, so the native split costs
 * more than this scan for the short pointers a fragment decodes to.
 * @param pointer A pointer string produced by decoding a URI fragment.
 * @returns Every substring between separators, empty ones included.
 */
export const splitDecodedPointer = (pointer: string): string[] => {
  const tokens: string[] = [];
  let start = 0;
  let separator = pointer.indexOf('/');
  while (separator !== -1) {
    tokens.push(pointer.slice(start, separator));
    start = separator + 1;
    separator = pointer.indexOf('/', start);
  }
  tokens.push(pointer.slice(start));
  return tokens;
};
