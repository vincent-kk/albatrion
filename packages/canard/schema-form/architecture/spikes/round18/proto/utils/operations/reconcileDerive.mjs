/**
 * Apply ledger precedence, or the explicitly enabled historical policy experiment.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {object} root Tree owning the settle's write candidates and winners.
 * @param {number} sid Calculation identifier for staged emissions.
 * @param {boolean} dryRun Detect writes without applying them to the raw tree.
 * @returns {boolean} Whether a winning candidate changes a raw value.
 */
export function reconcileDerive(context, root, sid, dryRun) {
  return context.SWITCHES.EXPERIMENT
    ? context.experimentDerive(root, sid, dryRun)
    : context.reconcileRankedWrites(root, sid, dryRun);
}
