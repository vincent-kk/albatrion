/**
 * Settle within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function settle(context, root) {
  const sid = ++context.SID;
  if (context.SWITCHES.EXPERIMENT) context.beginExperiment(root);
  context.counters.settles++;
  context.lastSettle.rounds = 0;
  context.lastSettle.sweeps = 0;
  context.lastSettle.budgetExceeded = false;
  context.lastSettle.hostExceeded = false;
  context.lastSettle.maxSweepsOnOneHost = 0;
  context.lastSettle.injected = [];
  context.lastSettle.refreshed = [];
  const suppress = root.loadSuppressed === true;
  root.fillSeen.clear();
  root.fillValues.clear();
  root.cleared.clear();
  root.ruleWinners.clear();
  root.exitedNodes.clear();
  root.consumedEdges = new Map();
  const transitionCap = context.countTransitionBudget(root);
  let transitionRounds = 0;
  const base = context.snapshot(root);
  const sweeps0 = context.counters.sweeps;
  const finalShape = context.SWITCHES.FINAL_SHAPE;
  context.lastSettle.retracted = [];
  let exceeded = false;
  context.inSettle = true;
  try {
    for (;;) {
      context.lastSettle.rounds++;
      context.counters.rounds++;
      root.computedHosts.length = 0;
      if (root.schemaMode) {
        context.updateControls(root);
      }
      context.compute(root, sid);
      context.updateEffectiveSpecs(root, sid);
      const atCap = context.lastSettle.rounds >= context.SWITCHES.ROUND_CAP;
      let wrote;
      wrote = context.reconcileDerive(root, sid, atCap);
      if (wrote === false) {
        const atTransitionCap = transitionRounds >= transitionCap;
        wrote = context.reconcileInterpretation(root, atCap || atTransitionCap);
        if (!wrote) wrote = context.reconcileTransition(root, sid, atCap || atTransitionCap, suppress);
        if (wrote && atTransitionCap) { exceeded = true; break; }
        if (wrote) transitionRounds++;
      }
      for (let i = 0; i < root.replacedHosts.length; i++) root.replacedHosts[i].replaced = false;
      root.replacedHosts.length = 0;
      if (atCap) {
        exceeded = wrote;
        break;
      }
      if (wrote === false) break;
    }
    context.lastSettle.budgetCommit = exceeded ? finalShape && context.SWITCHES.COMMIT_ON_BUDGET === 'base' ? 'base' : 'lastRound' : '';
    if (context.lastSettle.budgetCommit === 'base') {
      context.restore(base);
      root.autoLog.clear();
      root.computedHosts.length = 0;
      if (root.schemaMode) {
        context.updateControls(root);
        context.markAllFresh(root);
      }
      context.compute(root, sid);
      context.updateEffectiveSpecs(root, sid);
    }
    context.lastSettle.autoAtCommit = finalShape ? context.autoEntries(root) : [];
  } finally {
    context.inSettle = false;
    if (context.SWITCHES.AUTO_SCOPE === 'settle') root.autoLog.clear();
  }
  context.lastSettle.sweeps = context.counters.sweeps - sweeps0;
  context.lastSettle.budgetExceeded = exceeded || context.lastSettle.hostExceeded;
  context.lastSettle.transitionRounds = transitionRounds;
  root.diagnostics = { status: context.lastSettle.budgetExceeded ? 'degraded' : 'stable', cause: context.lastSettle.budgetExceeded ? 'budget' : null };
  context.lastSettle.budgetWhich = exceeded ? 'rounds' : context.lastSettle.hostExceeded ? 'host' : '';
  context.lastSettle.birthsAtCommit = [];
  if (!context.lastSettle.budgetExceeded) context.visitNodes(root, node => {
    const born = !context.wasInShape(node) && context.existsInShape(node);
    if (born) context.lastSettle.birthsAtCommit.push(context.pathOf(node));
  });
  const out = [];
  const signalOnly = [];
  context.commit(root, sid, out, signalOnly);
  context.visitNodes(root, node => {
    node.shapePresent = context.existsInShape(node);
  });
  if (context.SWITCHES.AUTO_SCOPE === 'settle') context.clearLoaded(root);
  const rs = root.settle;
  const status = context.lastSettle.budgetExceeded ? 'budget-exceeded' : rs.status;
  if (rs.status !== status) {
    rs.status = status;
    if (out.length === 0 || out[0].node !== root) out.unshift({
      node: root,
      payload: context.payloadOf(root, root.local, root.emit)
    });else out[0].payload.settle = {
      ...rs
    };
  }
  rs.rounds = context.lastSettle.rounds;
  root.commitNumber++;
  root.entrySettles++;
  for (let i = 0; i < signalOnly.length; i++) out.push(signalOnly[i]);
  root.loadSuppressed = false;
  context.dispatch(root, out);
  if (root.options.dev && context.lastSettle.budgetExceeded) {
    throw new Error(`budget exceeded: rounds=${context.lastSettle.rounds} hostExceeded=${context.lastSettle.hostExceeded}`);
  }
}
