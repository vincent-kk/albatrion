import { expect, it } from 'vitest';

import { resolvePointer } from '../resolvePointer';

it.each([
  ['./a/', '/host/a/'],
  ['a/', '/host/a/'],
  ['../a/', '/a/'],
  ['./', '/host'],
  ['../', ''],
  ['./a/./', '/host/a'],
])(
  'keeps an empty last name only after a name, resolving %s against /host',
  (pointer, expected) => {
    expect(resolvePointer('/host', pointer)).toBe(expected);
  },
);
