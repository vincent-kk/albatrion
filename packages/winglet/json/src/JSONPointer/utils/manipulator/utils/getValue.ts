import type { Dictionary } from '@aileron/declare';

import { unescapePointer } from '@/json/JSONPointer/utils/escape/unescapePointer';

export const getValue = <Input extends Dictionary | Array<any>>(
  input: Input,
  segments: string[],
): unknown => {
  const length = segments.length;
  if (length === 0) return input;

  let cursor: any = input;
  for (let index = 0; index < length; ) {
    cursor = cursor[unescapePointer(segments[index++])];
    if (index === length) break;
    if (typeof cursor !== 'object' || cursor === null) return undefined;
  }
  return cursor;
};
