import { useMemo, useRef } from 'react';

import { equals, isObject } from '@winglet/common-utils';

/**
 * @description 객체의 스냅샷을 반환합니다.
 * @param object - 객체
 * @returns 객체 스냅샷의 값
 */
export const useSnapshot = <Input extends object>(
  input: Input,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useSnapshotReference(input, omit);
  return snapshotRef.current;
};

/**
 * @description 객체의 스냅샷의 참조를 반환합니다.
 * @param object - 객체
 * @returns 객체 스냅샷의 참조
 */
export const useSnapshotReference = <Input extends object>(
  input: Input,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useRef(input);
  const omitRef = useRef(omit && (omit instanceof Set ? omit : new Set(omit)));
  return useMemo(() => {
    if (
      isEmptyObject(input) ||
      equals(snapshotRef.current, input, omitRef.current)
    )
      return snapshotRef;
    snapshotRef.current = input;
    return snapshotRef;
  }, [input]);
};

const isEmptyObject = (value: unknown): boolean => {
  if (!value) return true;
  else if (isObject(value)) {
    for (const _ in value) return false;
    return true;
  } else return false;
};
