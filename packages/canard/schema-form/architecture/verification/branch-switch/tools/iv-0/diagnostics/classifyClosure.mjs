/**
 * Classify a proposed host scope without counting ancestor output propagation as work.
 * @param {{target:string, hosts:string[], edges:{source:string,target:string,kind:string}[],owners?:string[]}} input - Observed hosts, conservative edges and registered dependency owners
 * @returns Structural closure, useful non-root closure and explicit refusal reasons
 */
export function classifyClosure({ target, hosts, edges, owners = [] }) {
  const paths = [...hosts, target.slice(0, target.lastIndexOf('/'))];
  let scope = paths[0] ?? '';
  while (
    scope &&
    paths.some((path) => path !== scope && !path.startsWith(scope + '/'))
  )
    scope = scope.slice(0, scope.lastIndexOf('/'));
  const inside = (path) =>
    !scope || path === scope || path.startsWith(scope + '/');
  const ancestor = (path) =>
    !!scope && path !== scope && (path === '' || scope.startsWith(path + '/'));
  const crossing = edges.filter((edge) =>
    edge.kind === 'required' || edge.kind === 'unknown'
      ? inside(edge.source) !== inside(edge.target)
      : ancestor(edge.source) || (inside(edge.source) && !inside(edge.target)),
  );
  const reasons = crossing.map((edge) => 'crossing-' + edge.kind);
  for (const owner of owners) if (!inside(owner)) reasons.push('owner-outside');
  if (edges.some((edge) => edge.kind === 'unknown'))
    reasons.push('unknown-dependency');
  return {
    scope,
    qualifies: reasons.length === 0,
    useful: !!scope && reasons.length === 0,
    reasons,
    crossing,
  };
}
