/**
 * Experiment derive within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @param {*} dryRun dryRun input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function experimentDerive(context, root, sid, dryRun) {
  if (root.loadSuppressed) return false;
  const state = root.experiment;
  const candidates = new Map(state.pending);
  const offer = (rule, to, kind, value, sourceValue, order) => {
    const previous = candidates.get(rule);
    if (previous) previous.superseded = true;
    const item = {
      id: ++state.sequence,
      rule,
      to,
      kind,
      value,
      sourceValue,
      order,
      bornRound: context.lastSettle.rounds
    };
    state.offers.push(item);
    candidates.set(rule, item);
  };
  for (const rule of root.injections) {
    const e = context.emitOf(rule.from, sid);
    const changed = state.seen.has(rule) ? !context.sameValue(e, state.seen.get(rule)) : !context.edgeGated(rule) || context.fires(rule, e);
    state.seen.set(rule, e);
    if (changed) offer(rule, rule.to, rule.derived ? 'derived' : 'injectTo', rule.map(context.valueOrUndefined(e)), context.valueOrUndefined(e), rule.order ?? state.ruleIds.get(rule));
  }
  context.visitNodes(root, node => {
    if (node.clearExpression === undefined) return;
    const condition = !!context.evalExpression(node.clearExpression, context.expressionView(root));
    let loaded = false;
    for (let n = node; n; n = n.parent) loaded ||= context.isLoaded(n);
    const previous = state.clearSeen.has(node) ? state.clearSeen.get(node) : context.SWITCHES.LOAD_EDGE_CLEAR === 'rising' && loaded ? false : node.clearWas;
    state.clearSeen.set(node, condition);
    if (condition && !previous) offer(node, node, 'clearValue', undefined, condition, node.clearOrder ?? -1);
  });
  const winners = new Map();
  for (const item of candidates.values()) {
    const previous = winners.get(item.to);
    if (!previous || context.experimentPriority(item) > context.experimentPriority(previous) || context.experimentPriority(item) === context.experimentPriority(previous) && item.order > previous.order) winners.set(item.to, item);
  }
  const next = new Map();
  let wrote = false;
  for (const item of candidates.values()) {
    const winner = winners.get(item.to);
    const won = winner === item;
    const consumed = won || item.kind !== 'injectTo' || context.SWITCHES.EDGE_CONSUMED_ON_LOSS;
    const retry = !won && (context.SWITCHES.LOSER_FATE === 'requeued' || !consumed);
    state.attempts.push({
      round: context.lastSettle.rounds,
      offer: item.id,
      winner: winner.id,
      won,
      consumed,
      retry,
      dryRun
    });
    if (!won) {
      if (retry) next.set(item.rule, item);else if (!dryRun) item.dropped = true;
      continue;
    }
    const current = item.kind === 'clearValue' && context.isAbsent(item.to) ? undefined : item.to.kind === 'leaf' ? context.rawOf(item.to) : context.stagedTree(item.to);
    const changed = !context.sameValue(item.value, current);
    wrote ||= changed;
    if (dryRun) continue;
    item.appliedRound = context.lastSettle.rounds;
    if (item.kind === 'clearValue') {
      root.cleared.add(item.to);
      root.fillValues.delete(item.to);
    }
    if (changed) {
      context.autoWrite(root, item.to, item.value, item.rule, null);
      if (item.kind === 'clearValue') context.erase(item.to);
      root.autoLog.get(item.to).kind = item.kind;
    }
  }
  if (!dryRun) state.pending = next;
  context.lastSettle.conflicts = candidates.size - winners.size;
  return wrote || next.size > 0;
}
