import { useMemo, useRef } from 'react';

import { equals, getTypeTag, isObject } from '@winglet/common-utils';

/**
 * Returns a snapshot of the object that only updates when the object actually changes.
 * Uses deep equality comparison to determine if the object has changed.
 * @param input - The object to create a snapshot of
 * @param omit - Properties to omit from the comparison
 * @returns The current snapshot value of the object
 */
export const useSnapshot = <Input extends object>(
  input: Input | undefined,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useSnapshotReference(input, omit);
  return snapshotRef.current;
};

/**
 * Returns a ref containing a snapshot of the object that only updates when the object actually changes.
 * Uses deep equality comparison to determine if the object has changed.
 * @param input - The object to create a snapshot of
 * @param omit - Properties to omit from the comparison
 * @returns A ref containing the current snapshot of the object
 */
export const useSnapshotReference = <Input extends object>(
  input: Input | undefined,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useRef(input);
  const typeRef = useRef(getTypeTag(input));
  const omitRef = useRef(omit && (omit instanceof Set ? omit : new Set(omit)));
  return useMemo(() => {
    if (
      (typeRef.current === getTypeTag(input) && isEmpty(input)) ||
      equals(snapshotRef.current, input, omitRef.current)
    )
      return snapshotRef;
    snapshotRef.current = input;
    return snapshotRef;
  }, [input]);
};

const isEmpty = (value: unknown): boolean => {
  if (!value) return true;
  else if (isObject(value)) {
    for (const _ in value) return false;
    return true;
  } else return false;
};
