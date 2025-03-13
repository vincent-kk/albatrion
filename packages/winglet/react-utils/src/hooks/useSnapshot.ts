import { useMemo, useRef } from 'react';

import { generateHash, serializeObject } from '@winglet/common-utils';

import { isInvalidValue } from '../utils/filter/isInvalidValue';

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
export const useSnapshotReference = <T extends object>(
  object: T,
  omit?: Array<keyof T>,
) => {
  const snapshotRef = useRef(object);
  const snapshotHash = useRef(getSnapshotHash(object, omit));
  const hash = useMemo(() => getSnapshotHash(object, omit), [object, omit]);
  if (hash && snapshotHash.current !== hash) {
    snapshotRef.current = object;
    snapshotHash.current = hash;
  }
  return snapshotRef;
};

const getSnapshotHash = <T extends object>(
  object: T,
  omit?: Array<keyof T>,
): number | null => {
  if (isInvalidValue(object)) return null;
  return generateHash(serializeObject(object, omit as string[]));
};
