/**
 * Read a canonical path/kind pair without a general-purpose JSON parse.
 * @param key - Valid compact JSON pair emitted by node-key encoding
 * @returns Its decoded occurrence path, or undefined when no first string exists
 */
export const readNodeKeyPath = (key: string): string | undefined => {
  if (key[0] !== '[' || key[1] !== '"') return undefined;
  let end = 2;
  let escaped = false;
  for (; end < key.length; end++) {
    if (key[end] === '\\') {
      escaped = true;
      end++;
    } else if (key[end] === '"') break;
  }
  const path = key.slice(2, end);
  if (!escaped) return path;
  return path.replace(/\\(?:["\\/bfnrt]|u[\da-fA-F]{4})/g, (part) => {
    switch (part[1]) {
      case 'b':
        return '\b';
      case 'f':
        return '\f';
      case 'n':
        return '\n';
      case 'r':
        return '\r';
      case 't':
        return '\t';
      case 'u':
        return String.fromCharCode(parseInt(part.slice(2), 16));
      default:
        return part[1];
    }
  });
};
