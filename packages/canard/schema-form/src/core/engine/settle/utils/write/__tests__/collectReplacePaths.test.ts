import { describe, expect, it } from 'vitest';

import { collectReplacePaths } from '../collectReplacePaths';

describe('collectReplacePaths (191C-01)', () => {
  it('returns each caller path and expands a shallow Merge into child paths', () => {
    expect(
      collectReplacePaths([
        { path: '/note', source: 'callerReplace' },
        { path: '', source: 'callerPartial', keys: ['a', 'b'] },
        { path: '/obj', source: 'callerPartial', keys: ['x'] },
      ]),
    ).toEqual(['/note', '/a', '/b', '/obj/x']);
  });

  it('escapes received keys as pointer segments', () => {
    expect(
      collectReplacePaths([
        { path: '', source: 'callerPartial', keys: ['a/b', 'c~d'] },
      ]),
    ).toEqual(['/a~1b', '/c~0d']);
  });

  it('skips automatic origins and keeps order and repeats of the rest', () => {
    expect(
      collectReplacePaths([
        { path: '/value', source: 'automatic' },
        { path: '/k', source: 'callerReplace' },
        { path: '/k', source: 'callerReplace' },
      ]),
    ).toEqual(['/k', '/k']);
  });

  it('returns an empty list for an empty input', () => {
    expect(collectReplacePaths([])).toEqual([]);
  });
});
