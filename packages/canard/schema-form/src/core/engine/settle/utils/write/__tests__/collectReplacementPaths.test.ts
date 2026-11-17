import { describe, expect, it } from 'vitest';

import { FieldNodeWriteKind } from '../../../../types/value';
import { collectReplacementPaths } from '../collectReplacementPaths';

describe('collectReplacementPaths (191C-01)', () => {
  it('returns each caller path and expands a shallow Merge into child paths', () => {
    expect(
      collectReplacementPaths([
        { path: '/note', source: FieldNodeWriteKind.CallerReplace },
        {
          path: '',
          source: FieldNodeWriteKind.CallerPartial,
          keys: ['a', 'b'],
        },
        { path: '/obj', source: FieldNodeWriteKind.CallerPartial, keys: ['x'] },
      ]),
    ).toEqual(['/note', '/a', '/b', '/obj/x']);
  });

  it('escapes received keys as pointer segments', () => {
    expect(
      collectReplacementPaths([
        {
          path: '',
          source: FieldNodeWriteKind.CallerPartial,
          keys: ['a/b', 'c~d'],
        },
      ]),
    ).toEqual(['/a~1b', '/c~0d']);
  });

  it('skips automatic origins and keeps order and repeats of the rest', () => {
    expect(
      collectReplacementPaths([
        { path: '/value', source: FieldNodeWriteKind.Automatic },
        { path: '/k', source: FieldNodeWriteKind.CallerReplace },
        { path: '/k', source: FieldNodeWriteKind.CallerReplace },
      ]),
    ).toEqual(['/k', '/k']);
  });

  it('returns an empty list for an empty input', () => {
    expect(collectReplacementPaths([])).toEqual([]);
  });
});
