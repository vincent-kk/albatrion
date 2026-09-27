/**
 * Declare fragments within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} host host input accepted by the regression model.
 * @param {*} fragments fragments input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function declareFragments(context, host, fragments) {
  const flat = [];
  const walk = (list, parentIdx) => {
    const ordered = list.map((f, i) => ({
      f,
      i
    })).sort((a, b) => (a.f.rank ?? 0) - (b.f.rank ?? 0) || a.i - b.i).map(x => x.f);
    for (const f of ordered) {
      const idx = flat.length;
      flat.push({
        id: f.id ?? `f${idx}`,
        guard: f.guard ?? null,
        controls: f.controls ?? null,
        declares: f.declares ?? [],
        defaults: f.defaults ?? null,
        expressionDefaults: f.expressionDefaults ?? null,
        parentIdx,
        inherited: false,
        owner: null,
        ownerIdx: -1,
        overlays: f.overlays ?? []
      });
      if (f.children) walk(f.children, idx);
    }
  };
  walk(fragments, -1);
  for (const f of flat) context.addFragment(host, f);
  for (let i = 0; i < flat.length; i++) {
    const f = flat[i];
    for (const o of f.overlays) {
      const child = host.index.get(o.host);
      if (child === undefined || child.kind !== 'object') throw new Error(`overlay host ${o.host} is not an object child`);
      context.addFragment(child, {
        id: o.id ?? `${f.id}@${o.host}`,
        guard: null,
        controls: o.controls ?? null,
        declares: o.declares ?? [],
        defaults: o.defaults ?? null,
        parentIdx: -1,
        inherited: true,
        owner: host,
        ownerIdx: i,
        overlays: []
      });
    }
  }
}
