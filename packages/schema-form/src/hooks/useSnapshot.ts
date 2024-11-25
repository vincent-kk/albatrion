import { useMemo, useRef } from 'react';

import { isEqual } from 'es-toolkit';

/**
 * @description 객체의 스냅샷을 반환합니다.
 * @param object - 객체
 * @returns 객체의 스냅샷
 */
export function useSnapshot<T extends object>(object: T): T {
  const snapshot = useRef<T>(object);

  snapshot.current = useMemo(() => {
    if (snapshot.current === object) {
      return snapshot.current;
    }
    if (!isEqual(snapshot.current, object)) {
      return object;
    }
    return snapshot.current;
  }, [object]);

  return snapshot.current;
}
