import { useSnapshotReference } from './useSnapshotReference';

/**
 * Returns a snapshot of the object that only updates when the object actually changes.
 * Uses deep equality comparison to determine if the object has changed.
 * @param input - The object to create a snapshot of
 * @param omit - Properties to omit from the comparison
 * @returns The current snapshot value of the object
 */
export const useSnapshot = <Input extends object | undefined>(
  input: Input,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useSnapshotReference(input, omit);
  return snapshotRef.current;
};
