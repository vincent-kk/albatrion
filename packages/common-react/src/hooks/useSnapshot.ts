import { useMemo, useRef } from 'react';

import { generateHash, stringifyObject } from '@lumy-pack/common';

/**
 * @description 객체의 스냅샷을 반환합니다.
 * @param object - 객체
 * @returns 객체 스냅샷의 값
 */
export const useSnapshot = <T extends object>(object: T) => {
  const snapshotRef = useRef(object);
  const snapshotHash = useRef(generateHash(stringifyObject(object)));
  const hash = useMemo(() => generateHash(stringifyObject(object)), [object]);
  if (snapshotHash.current !== hash) {
    snapshotRef.current = object;
    snapshotHash.current = hash;
  }
  return snapshotRef.current;
};
