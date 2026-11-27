import { useCommitEffect } from './useCommitEffect';

/**
 * Publishes a value into a stable instance reference only after its render commits.
 * @param reference - Stable storage owned by the caller; React refs and owned control state are supported
 * @param value - Value from the current render attempt
 * @returns The same reference after registering commit-phase publication
 */
export const useCommittedReference = <
  Value,
  Reference extends { current: Value },
>(
  reference: Reference,
  value: Value,
): Reference => {
  useCommitEffect(() => {
    reference.current = value;
  }, [reference, value]);
  return reference;
};
