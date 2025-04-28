import { useMemo, useRef } from 'react';

import { equals, isObject } from '@winglet/common-utils';

/**
 * @description 객체의 스냅샷을 반환합니다.
 * @param object - 객체
 * @returns 객체 스냅샷의 값
 */
export const useSnapshot = <T extends object>(
  object: T,
  omit?: Array<keyof T>,
) => {
  const snapshotRef = useSnapshotReference(object, omit);
  return snapshotRef.current;
};

/**
 * @description 객체의 스냅샷의 참조를 반환합니다.
 * @param object - 객체
 * @returns 객체 스냅샷의 참조
 */
export const useSnapshotReference = <Input extends object>(
  input: Input,
  omit?: Array<keyof Input>,
) => {
  const snapshotRef = useRef(input);
  return useMemo(() => {
    if (isEmptyObject(input) || equals(snapshotRef.current, input, omit))
      return snapshotRef;
    snapshotRef.current = input;
    return snapshotRef;
  }, [input, omit]);
};

const isEmptyObject = (value: unknown): boolean => {
  if (!value) return true;
  else if (isObject(value)) {
    for (const _ in value) return false;
    return true;
  } else return false;
};
