/**
 * Experiment trace within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function experimentTrace(context, root) {
  const state = root.experiment;
  const value = v => v === undefined ? {
    missing: true
  } : {
    value: v
  };
  return {
    offers: state.offers.map(item => ({
      id: item.id,
      kind: item.kind,
      target: context.pathOf(item.to),
      source: item.kind === 'clearValue' ? null : context.pathOf(item.rule.from),
      order: item.order,
      value: value(item.value),
      sourceValue: value(item.sourceValue),
      bornRound: item.bornRound,
      appliedRound: item.appliedRound ?? null,
      dropped: item.dropped ?? false,
      superseded: item.superseded ?? false
    })),
    attempts: state.attempts
  };
}
