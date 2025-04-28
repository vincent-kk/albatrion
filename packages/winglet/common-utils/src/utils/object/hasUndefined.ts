import { getKeys } from '@/common-utils/libs';

export const hasUndefined = (value: any): boolean => {
  if (value === undefined) return true;

  const stack: any[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined) return true;

    if (current === null || typeof current !== 'object') continue;

    if (Array.isArray(current)) {
      for (let i = 0, len = current.length; i < len; i++)
        stack.push(current[i]);
    } else {
      const keys = getKeys(current);
      for (let i = 0, len = keys.length; i < len; i++)
        stack.push(current[keys[i]]);
    }
  }

  return false;
};
