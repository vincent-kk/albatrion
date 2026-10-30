/**
 * Read the production reverse index and supplement required and dynamic-injection bounds.
 * @param {any} root - Live root carrying the canonical blueprint
 * @param {any} engine - Scratch-only exports of existing dependency helpers
 * @returns {{source:string,target:string,kind:string}[]} Conservative edges; unknowns remain explicit
 */
export function collectDependencyEdges(root, engine) {
  const blueprint = root.runtime.blueprint;
  const index = engine.getDependencyIndex(blueprint);
  const edges = [];
  const pending = index.root ? [{ node: index.root, segments: [] }] : [];
  while (pending.length) {
    const { node, segments } = pending.pop();
    const source = engine.joinPointer(segments);
    for (const owner of node.owners)
      edges.push({
        source,
        target: owner.path,
        kind:
          source.includes('*') || owner.path.includes('*')
            ? 'unknown'
            : 'index',
      });
    for (const [segment, child] of node.children)
      pending.push({ node: child, segments: [...segments, segment] });
  }
  for (const expression of blueprint.expressions) {
    const declaration = blueprint.nodes
      .flatMap((node) => node.declarations)
      .find((declaration) => declaration.id === expression.declarationId);
    for (const dependency of expression.dependencies)
      edges.push({
        source: engine.resolveDependencyPath(expression.hostPath, dependency),
        target: declaration?.path ?? expression.hostPath,
        kind: expression.key,
      });
  }
  for (const node of blueprint.nodes)
    for (const declaration of node.declarations) {
      const schema = declaration.schema;
      const watch =
        schema && typeof schema === 'object'
          ? schema.controls?.watch
          : undefined;
      if (Array.isArray(watch))
        for (const dependency of watch)
          edges.push({
            source: engine.resolveDependencyPath(declaration.path, dependency),
            target: declaration.path,
            kind: 'watch',
          });
      if (
        schema &&
        typeof schema === 'object' &&
        Array.isArray(schema.required)
      )
        for (const name of schema.required)
          edges.push({
            source: declaration.path,
            target: engine.appendSegment(declaration.path, name),
            kind: 'required',
          });
      for (const gate of declaration.gates) {
        if (gate.kind === 'if')
          edges.push({
            source: gate.hostPath,
            target: declaration.path,
            kind: 'gate-if-host',
          });
        if (gate.kind === 'discriminator')
          edges.push({
            source: engine.appendSegment(
              gate.hostPath,
              gate.condition.propertyName,
            ),
            target: declaration.path,
            kind: 'gate-discriminator',
          });
        for (const read of gate.evaluationReads) {
          if (typeof read !== 'string') continue;
          edges.push({
            source: read,
            target: declaration.path,
            kind: 'gate-' + gate.kind,
          });
        }
      }
    }
  for (const rule of engine.getDeriveRuleTable(blueprint).rules)
    if (rule.kind === 'injectTo')
      edges.push({ source: '', target: '', kind: 'unknown' });
  return edges;
}
