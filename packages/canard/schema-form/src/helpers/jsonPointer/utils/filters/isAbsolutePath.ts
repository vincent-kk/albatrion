export const isAbsolutePath = (path: string): boolean =>
  path[0] === '/' || (path[0] === '#' && path[1] === '/');
