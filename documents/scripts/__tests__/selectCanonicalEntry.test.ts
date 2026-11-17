import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type EntryCandidate, selectCanonicalEntry } from '../lib/selectCanonicalEntry';

const candidate = (entryKey: string, entryDir: string, hops: number, exportsOrder: number): EntryCandidate => ({
  entryKey,
  entryDir,
  hops,
  exportsOrder,
});

describe('selectCanonicalEntry', () => {
  it('prefers the entry with the fewest hops over a deeper ancestor', () => {
    const broad = candidate('./pointer', '/pkg/dist/JSONPointer', 1, 0);
    const deep = candidate('./pointer-manipulator', '/pkg/dist/JSONPointer/utils/manipulator', 2, 1);
    assert.equal(
      selectCanonicalEntry([deep, broad], '/pkg/dist/JSONPointer/utils/manipulator/getValue/getValue.d.ts'),
      broad,
    );
  });

  it('prefers the deepest ancestor directory when hops tie', () => {
    const broad = candidate('./pointer', '/pkg/dist/JSONPointer', 2, 0);
    const deep = candidate('./pointer-manipulator', '/pkg/dist/JSONPointer/utils/manipulator', 2, 1);
    assert.equal(
      selectCanonicalEntry([broad, deep], '/pkg/dist/JSONPointer/utils/manipulator/getValue/getValue.d.ts'),
      deep,
    );
  });

  it('falls back to the exports order when hops and ancestry tie', () => {
    const first = candidate('./a', '/pkg/dist/a', 1, 3);
    const second = candidate('./b', '/pkg/dist/b', 1, 5);
    assert.equal(selectCanonicalEntry([second, first], '/pkg/dist/shared/x.d.ts'), first);
  });

  it('does not treat a directory that only shares a string prefix as an ancestor', () => {
    const prefixOnly = candidate('./pointer-patch', '/pkg/dist/JSONPointer/utils/patch', 2, 2);
    const ancestor = candidate('./pointer', '/pkg/dist/JSONPointer', 2, 3);
    assert.equal(
      selectCanonicalEntry([prefixOnly, ancestor], '/pkg/dist/JSONPointer/utils/patchModel/x.d.ts'),
      ancestor,
    );
  });

  it('throws when no entry exports the declaration', () => {
    assert.throws(() => selectCanonicalEntry([], '/pkg/dist/x.d.ts'), /no entry exports/);
  });
});
