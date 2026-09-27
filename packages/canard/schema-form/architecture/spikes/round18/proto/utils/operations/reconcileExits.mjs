/**
 * Apply each requested inactive-exit clearing once, using the committed policy.
 * @param {object} context Shape, policy, and mutation operations for this execution.
 * @param {object} root Tree retaining nodes already cleared in this settle.
 * @param {boolean} dryRun Whether only pending work is observed.
 * @returns {boolean} Whether an exit requires clearing a nonempty raw value.
 */
export function reconcileExits(context, root, dryRun) {
  let wrote = false;
  for (const node of root.policyNodes ?? []) {
    if (root.exitedNodes.has(node) || !context.wasInShape(node) || context.existsInShape(node) || !node.committedUnsetOnInactive) continue;
    if (context.isAbsent(node)) continue;
    wrote = true;
    if (dryRun) continue;
    root.exitedNodes.add(node);
    context.autoWrite(root, node, undefined, node, null);
    context.erase(node);
    root.autoLog.get(node).kind = 'unsetOnInactive';
  }
  return wrote;
}
