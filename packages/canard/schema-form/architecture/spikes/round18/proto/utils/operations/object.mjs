/**
 * Object within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} name name input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function object(context, name) {
  const n = context.makeNode('object', name);
  n.children = [];
  n.index = new Map();
  n.dirtyKids = [];
  n.fragments = [];
  n.conditionalKids = [];
  n.fragOn = new Uint8Array(0);
  n.nextFragOn = new Uint8Array(0);
  n.extras = null;
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
