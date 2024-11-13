import { useMemo, useRef } from 'react';

import { isEqual } from 'es-toolkit';

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
