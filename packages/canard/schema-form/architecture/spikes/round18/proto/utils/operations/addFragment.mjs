/**
 * Add fragment within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} host host input accepted by the regression model.
 * @param {*} f f input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function addFragment(context, host, f) {
  const idx = host.fragments.length;
  host.fragments.push(f);
  const n = idx + 1;
  const on = new Uint8Array(n);
  on.set(host.fragOn);
  host.fragOn = on;
  host.nextFragOn = new Uint8Array(n);
  host.entryFragOn = new Uint8Array(n);
  host.entryFragEntry = -1;
  for (const name of f.declares) {
    const child = host.index.get(name);
    if (child === undefined) throw new Error(`fragment declares unknown child ${name}`);
    if (child.unconditional) {
      child.declaredBy ??= [];
      child.declaredBy.push(idx);
      continue;
    }
    if (child.conditional === false) {
      child.conditional = true;
      child.active = false;
      child.actNext = false;
      child.declaredBy = [];
      host.conditionalKids.push(child);
    }
    child.declaredBy.push(idx);
  }
}
