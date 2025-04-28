const TILDE = '~';
const CHILD = '/';

export const escapePointer = (path: string): string => {
  if (path.indexOf(CHILD) === -1 && path.indexOf(TILDE) === -1) return path;
  const length = path.length;
  const result: string[] = new Array(length);
  for (let index = 0; index < length; index++) {
    const char = path[index];
    if (char === TILDE) result[index] = '~0';
    else if (char === CHILD) result[index] = '~1';
    else result[index] = char;
  }
  return result.join('');
};
