export function escapePathComponent(path: string): string {
  if (path.indexOf('/') === -1 && path.indexOf('~') === -1) return path;
  return path.replace(/~/g, '~0').replace(/\//g, '~1');
}
