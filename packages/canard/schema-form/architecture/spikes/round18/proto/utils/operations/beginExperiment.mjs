/**
 * Begin experiment within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function beginExperiment(context, root) {
  root.experiment = {
    seen: new Map(),
    clearSeen: new Map(),
    pending: new Map(),
    offers: [],
    attempts: [],
    sequence: 0,
    ruleIds: new Map()
  };
  root.injections.forEach((rule, index) => root.experiment.ruleIds.set(rule, index));
}
