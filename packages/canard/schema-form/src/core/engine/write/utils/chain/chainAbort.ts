import type { FieldNodeRuntime } from '../../../record';

/** Only collector and reporter ownership participate in failure unwinding. */
type AbortRuntime = Pick<
  FieldNodeRuntime<unknown>,
  'chainErrors' | 'enclosingChain' | 'errorReporter'
>;

/** An interrupted chain suppresses reporters until its outermost cleanup finishes. */
type ChainAbort = {
  error: unknown;
  reporters: Map<AbortRuntime, NonNullable<AbortRuntime['errorReporter']>>;
};

/** Abort state follows collectors shared by nested calls and adopted owners. */
const abortedCollectors = new WeakMap<readonly unknown[], ChainAbort>();

/** Read an abort without retaining a completed chain outside its collector lifetime. */
export const readChainAbort = (errors: readonly unknown[] | undefined) =>
  errors === undefined ? undefined : abortedCollectors.get(errors);

/** Mark this collector and its enclosures; the first collaborator failure wins. */
export const abortFieldNodeChain = (
  runtime: AbortRuntime,
  error: unknown,
  errors = runtime.chainErrors,
): ChainAbort => {
  let failure = readChainAbort(errors);
  for (let outer = runtime.enclosingChain; outer; outer = outer.outer)
    failure ??= readChainAbort(outer.errors);
  failure ??= { error, reporters: new Map() };
  if (errors) abortedCollectors.set(errors, failure);
  for (let outer = runtime.enclosingChain; outer; outer = outer.outer)
    abortedCollectors.set(outer.errors, failure);
  if (runtime.errorReporter) {
    failure.reporters.set(runtime, runtime.errorReporter);
    runtime.errorReporter = undefined;
  }
  return failure;
};

/** Restore a suppressed reporter after cleanup, preserving an explicit replacement. */
export const restoreChainReporters = (failure: ChainAbort): void => {
  for (const [runtime, reporter] of failure.reporters)
    runtime.errorReporter ??= reporter;
  failure.reporters.clear();
};
