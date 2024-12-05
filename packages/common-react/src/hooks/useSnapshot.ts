import { useMemo, useRef } from 'react';

import { generateHash, stringifyObject } from '@lumy-pack/common';

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
  const snapshotHash = useRef(
    generateHash(stringifyObject(object, omit as string[])),
  );
  const hash = useMemo(
    () => generateHash(stringifyObject(object, omit as string[])),
    [object, omit],
  );
  if (snapshotHash.current !== hash) {
    snapshotRef.current = object;
    snapshotHash.current = hash;
  }
  return snapshotRef;
};
