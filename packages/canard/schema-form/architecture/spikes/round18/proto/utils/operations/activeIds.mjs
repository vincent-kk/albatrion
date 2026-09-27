/**
 * Active ids within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} host host input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function activeIds(context, host) {
  const out = [];
  for (let i = 0; i < host.fragments.length; i++) if (host.fragOn[i] === 1) out.push(host.fragments[i].id);
  return out;
}
