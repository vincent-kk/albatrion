import type { RootLoad, RootLoadStore } from '../type';

/**
 * Record and deliver a root aggregate, suppressing repeated empty reports.
 * @param load - Committed load whose current aggregate is reported
 * @param store - Provider-owned record that survives replacement loads
 * @returns Nothing; records the aggregate before invoking the consumer callback
 */
export const reportRootLoadValidation = (
  load: RootLoad,
  store: RootLoadStore,
): void => {
  const onValidate = load.props.onValidate;
  if (!load.root || !onValidate) return;
  const errors = load.root.globalErrors;
  if (!errors.length && store.lastReportedErrors?.length === 0) return;
  store.lastReportedErrors = errors;
  onValidate(errors);
};
