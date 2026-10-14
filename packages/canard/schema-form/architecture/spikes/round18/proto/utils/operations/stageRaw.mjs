/**
 * Stage raw within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function stageRaw(context, node, value) {
  if (node.spec && !context.reinterpreting) {
    node.root.entryWrites.set(node, value);
    value = interpret(value, node.spec);
  }
  node.pendingRaw = value;
  node.hasPending = true;
  context.touch(node);
}
import { interpret } from '../interpret/interpret.mjs';
