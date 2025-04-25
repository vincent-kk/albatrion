import type { Dictionary } from '@aileron/declare';

import { unescape } from './unescape';

export const getValue = <Input extends Dictionary>(
  input: Input,
  segments: string[],
): unknown => {
  const length = segments.length;
  if (length === 0) return input;

  let current: any = input;
  for (let index = 0; index < length; ) {
    current = current[unescape(segments[index++])];
    if (index === length) break;
    if (typeof current !== 'object' || current === null) return undefined;
  }
  return current;
};
