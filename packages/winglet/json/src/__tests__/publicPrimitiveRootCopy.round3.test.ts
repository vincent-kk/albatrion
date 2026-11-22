import { expect, it } from 'vitest';

import { applyPatch } from '../index';

it('round-3 json 1 sibling: copy of a primitive replacement root agrees with moving that root', () => {
  for (const immutable of [true, false])
    for (const value of [null, true, false, 0, 1, '', 'value'])
      for (const from of ['', '#']) {
        const copied = () =>
          applyPatch(
            {},
            [
              { op: 'replace', path: '', value },
              { op: 'copy', from, path: '' },
            ],
            { immutable },
          );
        const moved = applyPatch(
          {},
          [
            { op: 'replace', path: '', value },
            { op: 'move', from, path: '' },
          ],
          { immutable },
        );
        expect(copied()).toEqual(moved);
      }
});
