import { describe, expect, it } from 'vitest';

import type { BlueprintNodeKind } from '../../../../blueprint';
import { getCommittedDeclarationKey } from '../getCommittedDeclarationKey';

describe('getCommittedDeclarationKey identity', () => {
  it('matches JSON pair semantics for escaped paths, root and every kind', () => {
    const kinds: BlueprintNodeKind[] = ['string', 'number', 'boolean', 'object', 'array', 'virtual', 'null', 'union'];
    for (const path of ['', '/a~1b/~0', '/"quoted"/\n', '/한글/0'])
      for (const kind of kinds) {
        const node = { path, blueprintNode: { kind } };
        expect(getCommittedDeclarationKey(node)).toBe(JSON.stringify([path, kind]));
        expect(getCommittedDeclarationKey(node)).toBe(getCommittedDeclarationKey(node));
        expect(getCommittedDeclarationKey({ path, blueprintNode: { kind } }))
          .toBe(getCommittedDeclarationKey(node));
      }
  });

  it('invalidates the cached pair on rekey and kind changes without collisions', () => {
    const node = { path: '/list/1', blueprintNode: { kind: 'string' as BlueprintNodeKind } };
    const previous = getCommittedDeclarationKey(node);
    node.path = '/list/0';
    expect(getCommittedDeclarationKey(node)).toBe(JSON.stringify(['/list/0', 'string']));
    expect(getCommittedDeclarationKey(node)).not.toBe(previous);
    node.blueprintNode.kind = 'number';
    expect(getCommittedDeclarationKey(node)).toBe(JSON.stringify(['/list/0', 'number']));
    node.path = '/list/1';
    node.blueprintNode.kind = 'string';
    expect(getCommittedDeclarationKey(node)).toBe(previous);
  });
});
