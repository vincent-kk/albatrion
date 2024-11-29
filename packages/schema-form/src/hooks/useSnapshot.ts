import { useMemo, useRef } from 'react';

import { isEqual } from 'es-toolkit';

/**
 * @description 객체의 스냅샷을 반환합니다.
 * @param object - 객체
 * @returns 객체 스냅샷의 값
 */
export function useSnapshot<T extends object>(object: T): T {
  const snapshotRef = useSnapshotReference(object);
  return snapshotRef.current;
}

/**
 * @description 객체의 스냅샷의 참조를 반환합니다.
 * @param object - 객체
 * @returns 객체 스냅샷의 Reference
 */
export function useSnapshotReference<T>(object: T) {
  const snapshotRef = useRef<T>(object);
  snapshotRef.current = useMemo(() => {
    if (snapshotRef.current === object) {
      return snapshotRef.current;
    }
    if (!isEqual(snapshotRef.current, object)) {
      return object;
    }
    return snapshotRef.current;
  }, [object]);
  return snapshotRef;
}
