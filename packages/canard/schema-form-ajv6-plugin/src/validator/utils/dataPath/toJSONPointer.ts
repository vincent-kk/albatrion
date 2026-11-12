/** AJV6 escapes these characters when quoting a bracket property name. */
const ESCAPES: Record<string, string> = { n: '\n', r: '\r', t: '\t', f: '\f' };

/**
 * Convert AJV6's generated property syntax to an RFC 6901 path.
 * @param path - AJV6 dataPath in dotted/bracket syntax or its jsonPointers output
 * @returns The root empty string or an escaped pointer preserving empty names
 */
export const toJSONPointer = (path: string): string => {
  if (!path || path.startsWith('/')) return path;
  if (!path.startsWith('.') && !path.startsWith('[')) path = '.' + path;
  let pointer = '';
  for (const match of path.matchAll(/\.([^.[\]]+)|\[(?:([0-9]+)|'((?:\\.|[^'\\])*)')\]/g)) {
    const name = match[1] ?? match[2] ?? match[3].replace(/\\([\\'nrtf])/g,
      (_, character: string) => ESCAPES[character] ?? character);
    pointer += '/' + name.replace(/~/g, '~0').replace(/\//g, '~1');
  }
  return pointer;
};
