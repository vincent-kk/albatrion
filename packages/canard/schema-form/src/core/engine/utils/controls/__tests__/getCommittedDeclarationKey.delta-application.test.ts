import { afterEach, describe, expect, it, vi } from 'vitest';

import * as identities from '../../nodeIdentity/getBlueprintNodeIdentity';
import { getCommittedDeclarationKey } from '../getCommittedDeclarationKey';

afterEach(() => vi.restoreAllMocks());

describe('B2-P3 occurrence identity reuse', () => {
  it('folds immutable union types once and invalidates when the type list changes', () => {
    const types: ('number' | 'string' | 'boolean')[] = ['number', 'string'];
    const blueprintNode = { kind: 'union', schemaType: types };
    const node = { path: '/a', blueprintNode };
    const runtime = {};
    const identity = vi.spyOn(identities, 'getBlueprintNodeIdentity');
    expect(getCommittedDeclarationKey(node, runtime)).toBe('["/a","union:3"]');
    expect(getCommittedDeclarationKey(node, runtime)).toBe('["/a","union:3"]');
    node.path = '/b';
    expect(getCommittedDeclarationKey(node, runtime)).toBe('["/b","union:3"]');
    expect(identity).toHaveBeenCalledTimes(1);
    blueprintNode.schemaType = ['boolean'];
    expect(getCommittedDeclarationKey(node, runtime)).toBe('["/b","union:4"]');
    expect(identity).toHaveBeenCalledTimes(2);
  });
});
