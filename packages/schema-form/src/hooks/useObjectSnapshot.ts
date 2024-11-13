import { useMemo, useRef } from 'react';

import jsonPatch from 'fast-json-patch';

export function useObjectSnapshot<T extends object>(object: T): T {
  const snapshot = useRef<T>(object);
  snapshot.current = useMemo(() => {
    if (jsonPatch.compare(snapshot.current, object).length > 0) {
      return object;
    }
    return snapshot.current;
  }, Object.values(object));
  return snapshot.current;
}
