import type { FieldNodeRuntime } from '../../../record';

/** Only collector and reporter ownership participate in failure unwinding. */
type AbortRuntime = Pick<
  FieldNodeRuntime<unknown>,
  'chainErrors' | 'enclosingChain' | 'errorReporter' | 'adoptedRoot'
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

/**
 * Narrow an adoption link before following its reporter owner during abort cleanup.
 * @param value - Replacement link installed by chain adoption
 * @returns Whether the link exposes the next root runtime
 */
const isAdoptedReporterOwner = (
  value: unknown,
): value is { runtime: AbortRuntime } =>
  value !== null &&
  typeof value === 'object' &&
  'runtime' in value &&
  'rootNode' in value;

/** Restore reporters on their current owners after cleanup, preserving explicit replacements. */
export const restoreChainReporters = (failure: ChainAbort): void => {
  for (const [runtime, reporter] of failure.reporters) {
    let owner = runtime;
    let inherited = reporter;
    while (isAdoptedReporterOwner(owner.adoptedRoot)) {
      owner = owner.adoptedRoot.runtime;
      inherited = failure.reporters.get(owner) ?? inherited;
    }
    owner.errorReporter ??= inherited;
  }
  failure.reporters.clear();
};
