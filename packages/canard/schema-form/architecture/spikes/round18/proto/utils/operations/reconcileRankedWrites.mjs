import { compareCandidates } from './compareCandidates.mjs';

/**
 * Consume edge candidates once and retain precedence across the entire settle.
 * @param {object} context Runtime value, shape, and mutation operations.
 * @param {object} root Tree owning consumed edges and the winning write per target.
 * @param {number} sid Calculation identifier used to read staged emissions.
 * @param {boolean} dryRun Whether writes are only detected for the budget decision.
 * @returns {boolean} Whether a winning candidate changes a raw value.
 */
export function reconcileRankedWrites(context, root, sid, dryRun) {
  if (root.loadSuppressed) return false;
  const candidates = [];
  for (const rule of root.injections) {
    if (!context.existsInShape(rule.from) || rule.when && !rule.when(context.expressionView(root))) continue;
    const emitted = context.emitOf(rule.from, sid);
    const consumed = root.consumedEdges.has(rule);
    if (consumed ? context.sameValue(root.consumedEdges.get(rule), emitted) : context.edgeGated(rule) && !context.fires(rule, emitted)) continue;
    if (!dryRun) root.consumedEdges.set(rule, emitted);
    const value = rule.map(context.valueOrUndefined(emitted));
    if (value === undefined) continue;
    candidates.push({ rule, to: rule.to, value, kind: rule.derived ? 'derived' : 'injectTo', priority: rule.derived ? 2 : 1,
      source: rule.derived ? rule.to : rule.from, layer: rule.layer, order: rule.order });
  }
  for (const node of root.clearNodes ?? []) {
    if (!context.existsInShape(node)) continue;
    const condition = !!context.evalExpression(node.clearExpression, context.expressionView(root));
    const previous = root.consumedEdges.has(node) ? root.consumedEdges.get(node) : node.clearWas;
    if (!dryRun) root.consumedEdges.set(node, condition);
    if (condition && (!previous || !context.wasInShape(node))) candidates.push({ rule: node, source: node, to: node, value: undefined, kind: 'clearValue', priority: 3, order: node.clearOrder });
  }
  const winners = new Map();
  for (const candidate of candidates) {
    const previous = winners.get(candidate.to) ?? root.ruleWinners.get(candidate.to);
    if (!previous || compareCandidates(candidate, previous) >= 0) winners.set(candidate.to, candidate);
  }
  context.lastSettle.conflicts = candidates.length - winners.size;
  let wrote = false;
  for (const item of winners.values()) {
    if (!dryRun) root.ruleWinners.set(item.to, item);
    if (item.kind === 'clearValue' && !dryRun) { root.cleared.add(item.to); root.fillValues.delete(item.to); }
    const current = item.to.kind === 'leaf' ? context.rawOf(item.to) : context.stagedTree(item.to);
    if (context.sameValue(item.value, current)) continue;
    wrote = true;
    if (dryRun) continue;
    context.autoWrite(root, item.to, item.value, item.rule, null);
    if (item.kind === 'clearValue') context.erase(item.to);
    root.autoLog.get(item.to).kind = item.kind;
  }
  return wrote;
}
