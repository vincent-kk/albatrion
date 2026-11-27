import { expect, it } from 'vitest';

import { resolvePointer } from '../utils/resolvePointer';

it.each(['/g/../top', '#/g/../top', '/./top', '#/./top', '/g/x/../../top'])(
  'absolute %s resolves like its relative spelling',
  (pointer) => {
    expect(resolvePointer('/host', pointer)).toBe(
      resolvePointer('/host', '../top'),
    );
  },
);

it.each(['/a~1b', '/a~0b', '/a:b', '/a/', '/'])(
  'normalizing an already canonical %s preserves its names',
  (pointer) => {
    expect(resolvePointer('/host', pointer)).toBe(pointer);
  },
);
