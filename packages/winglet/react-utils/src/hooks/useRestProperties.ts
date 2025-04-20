import { useMemo, useRef } from 'react';

import type { Dictionary } from '@aileron/declare';

export const useRestProperties = <T extends Dictionary>(props: T): T => {
  const propsRef = useRef<T>(props);
  const keysRef = useRef<string[]>(props ? Object.keys(props) : []);
  return useMemo(() => {
    // If props is not changed, return the same props
    // Or, if props is nullish, skip the rest of the logic
    if (!props || props === propsRef.current) return props;

    // If props's keys are not same as the previous props's keys, set the props and keys
    const currentKeys = Object.keys(props);
    if (currentKeys.length !== keysRef.current.length) {
      propsRef.current = props;
      keysRef.current = currentKeys;
      return props;
    }

    // If props's keys are same as the previous props's keys, return the previous props
    // If this case is true, previous props is empty object also.
    if (!currentKeys.length) return propsRef.current;

    // If props's values are not same as the previous props's values, set the props and keys
    for (let i = 0; i < currentKeys.length; i++) {
      const key = currentKeys[i];
      if (props[key] !== propsRef.current[key]) {
        propsRef.current = props;
        keysRef.current = currentKeys;
        return props;
      }
    }
    // If props's values are same as the previous props's values, return the previous props
    return propsRef.current;
  }, [props]);
};
