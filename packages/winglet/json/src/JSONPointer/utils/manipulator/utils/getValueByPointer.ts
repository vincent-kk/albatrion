import type { Dictionary } from '@aileron/declare';

export const getValueByPointer = <Input extends Dictionary | Array<any>>(
  input: Input,
  segments: string[],
): unknown => {
  const length = segments.length;
  const hasRootPrefix = segments[0] === '' || segments[0] === '#';
  if (length === 0 || (length === 1 && hasRootPrefix)) return input;
  let cursor: any = input;
  for (let index = hasRootPrefix ? 1 : 0; index < length; ) {
    cursor = cursor[segments[index++]];
    if (index === length) break;
    if (typeof cursor !== 'object' || cursor === null) return undefined;
  }
  return cursor;
};
