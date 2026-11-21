import { useMemo, useRef, type RefObject } from 'react';
import { equals } from '@winglet/common-utils/object';
import { SnapshotCommit } from './useSnapshotValue/utils/SnapshotCommit';
import { useCommittedReference } from './useCommittedReference';

/**
 * Compare a render candidate with the committed snapshot and publish it at commit.
 * @param reference Stable public snapshot storage.
 * @param input Current render's candidate.
 * @param omit Keys captured when the first comparison commits.
 * @returns The snapshot for this render, including an uncommitted changed candidate.
 */
export function useSnapshotValue<Input extends object | undefined>(reference: RefObject<Input>, input: Input, omit?: Set<keyof Input> | Array<keyof Input>): Input {
  const holder = useRef<SnapshotCommit<Input> | null>(null);
  if (holder.current === null) holder.current = new SnapshotCommit(reference, input);
  const comparison = holder.current;
  const next = useMemo(() => {
    const previous = comparison.current;
    const current = reference.current;
    if (input === current) return previous;
    const keys = previous.omit === null ? (omit === undefined || omit instanceof Set ? omit : new Set(omit)) : previous.omit;
    const value = equals(current, input, keys) ? current : input;
    return value === previous.value && keys === previous.omit ? previous : { value, omit: keys };
    // Omitted keys are captured by the first committed comparison.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, reference, comparison]);
  useCommittedReference(comparison, next);
  return next.value;
}
