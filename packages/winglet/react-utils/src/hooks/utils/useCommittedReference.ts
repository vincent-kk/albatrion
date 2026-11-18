import { useRef } from 'react';

import { useCommitEffect } from './useCommitEffect';

/**
 * Publishes a value only after its render commits.
 * @param value - Value from the current render attempt
 * @returns A stable reference containing the last committed value
 */
export const useCommittedReference = <T>(value: T) => {
  const reference = useRef(value);
  useCommitEffect(() => {
    reference.current = value;
  });
  return reference;
};
