/**
 * Array within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} name name input accepted by the regression model.
 * @param {*} itemFactory itemFactory input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function array(context, name, itemFactory) {
  const n = context.makeNode('array', name);
  n.children = [];
  n.dirtyKids = [];
  n.itemFactory = itemFactory ?? null;
  n.settle = {
    status: 'stable',
    sweeps: 0
  };
  n.nextSettle = {
    status: 'stable',
    sweeps: 0
  };
  return n;
}
