/**
 * Resolve an authored expression path against its current data host.
 * @param hostPath - Absolute JSON Pointer host of the bound gate
 * @param dependency - Relative, absolute, root, or context token
 * @returns Absolute pointer, or `@` for the host's extras context
 */
export const resolveDependencyPath = (
  hostPath: string,
  dependency: string,
): string => {
  if (dependency === '@') return '@';
  if (dependency === '#' || dependency === '/') return '';
  if (dependency.startsWith('#/')) return dependency.slice(1);
  if (dependency.startsWith('/')) return dependency;
  const parts = hostPath.split('/').filter(Boolean);
  let remaining = dependency;
  while (remaining.startsWith('../')) {
    parts.pop();
    remaining = remaining.slice(3);
  }
  if (remaining.startsWith('./')) remaining = remaining.slice(2);
  if (remaining) parts.push(...remaining.split('/'));
  return parts.length ? `/${parts.join('/')}` : '';
};
