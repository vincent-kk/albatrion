/**
 * Write an equivalent URI relative to the host when that spelling is shorter.
 * @param target Normalized absolute URI or anonymous fragment.
 * @param host Host resource's absolute document URI.
 * @returns A same-document fragment, shortest relative path candidate, or the absolute URI.
 */
export function shortestReference(target: string, host: string): string {
  const hash = target.indexOf('#'),
    document = hash < 0 ? target : target.slice(0, hash),
    fragment = hash < 0 ? '' : target.slice(hash);
  if (document === host) return fragment || '#';
  if (!host || !document) return target;
  try {
    const to = new URL(target),
      from = new URL(host);
    if (
      to.origin !== from.origin ||
      to.protocol !== from.protocol ||
      to.origin === 'null'
    )
      return target;
    const parent = from.pathname.split('/');
    parent.pop();
    const parts = to.pathname.split('/');
    while (parent.length && parts.length && parent[0] === parts[0]) {
      parent.shift();
      parts.shift();
    }
    let path = '../'.repeat(parent.length) + parts.join('/');
    if (!path || path.startsWith('/') || path.split('/')[0].includes(':'))
      path = './' + path;
    const candidates = [
      target,
      path + to.search + to.hash,
      to.pathname + to.search + to.hash,
    ];
    if (to.pathname === from.pathname && to.search)
      candidates.push(to.search + to.hash);
    return candidates.reduce((best, value) =>
      value.length < best.length && new URL(value, host).href === to.href
        ? value
        : best,
    );
  } catch {
    return target;
  }
}
