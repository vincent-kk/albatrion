export const stripFragment = (path: string): string =>
  path[0] === '#' ? (path[1] ? path.slice(1) : '/') : path;
