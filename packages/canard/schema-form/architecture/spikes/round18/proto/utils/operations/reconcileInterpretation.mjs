import { interpret } from '../interpret/interpret.mjs';

/**
 * Apply U7 once per written node in this transition round using the original input.
 * @param {object} context Runtime; reinterpreting prevents replacing the saved caller input.
 * @param {object} root Tree whose entryWrites retains the latest input of each written node.
 * @param {boolean} dryRun Whether only the need for another transition is observed.
 * @returns {boolean} Whether a narrowed node needs a different raw value.
 */
export function reconcileInterpretation(context, root, dryRun) {
  let wrote = false;
  for (const [node, original] of root.entryWrites) {
    if (node.effectiveSpec === node.spec) continue;
    const value = interpret(original, node.effectiveSpec);
    if (Object.is(value, context.rawOf(node))) continue;
    wrote = true;
    if (dryRun) continue;
    context.reinterpreting = true;
    try { context.stageRaw(node, value); }
    finally { context.reinterpreting = false; }
  }
  return wrote;
}
