import { hasOwnProperty } from '@winglet/common-utils/lib';

/** Apply own-key changes without replacing an object when its values are unchanged. */
export const shallowPatch = <State extends object>(
  previous: State,
  patch: Partial<State>,
): State => {
  let result = previous;
  for (const key of Object.keys(patch)) {
    const value = Reflect.get(patch, key);
    const present = hasOwnProperty(previous, key);
    if (value === undefined ? !present : present && Object.is(Reflect.get(previous, key), value))
      continue;
    if (result === previous) result = { ...previous };
    if (value === undefined) Reflect.deleteProperty(result, key);
    else Reflect.set(result, key, value);
  }
  return result;
};
