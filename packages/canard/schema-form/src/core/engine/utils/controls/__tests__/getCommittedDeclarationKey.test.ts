import { describe, expect, it } from 'vitest';

import type { BlueprintNodeKind } from '@/schema-form/core/engine/blueprint';

import { getCommittedDeclarationKey } from '../getCommittedDeclarationKey';

describe('getCommittedDeclarationKey identity', () => {
  const runtime = {};
  it('matches JSON pair semantics for escaped paths, root and every kind', () => {
    const kinds: BlueprintNodeKind[] = [
      'string',
      'number',
      'boolean',
      'object',
      'array',
      'virtual',
      'null',
      'union',
    ];
    for (const path of ['', '/a~1b/~0', '/"quoted"/\n', '/한글/0'])
      for (const kind of kinds) {
        const blueprintNode =
          kind === 'union'
            ? { kind, schemaType: ['number', 'string'] as const }
            : { kind };
        const node = { path, blueprintNode };
        if (kind === 'union')
          expect(getCommittedDeclarationKey(node, runtime)).toBe(
            JSON.stringify([path, 'union:3']),
          );
        else
          expect(getCommittedDeclarationKey(node, runtime)).toBe(
            JSON.stringify([path, kind]),
          );
        expect(getCommittedDeclarationKey(node, runtime)).toBe(
          getCommittedDeclarationKey(node, runtime),
        );
        expect(
          getCommittedDeclarationKey(
            {
              path,
              blueprintNode: { ...blueprintNode },
            },
            runtime,
          ),
        ).toBe(getCommittedDeclarationKey(node, runtime));
      }
  });

  it('invalidates the cached pair on rekey and kind changes without collisions', () => {
    const node = {
      path: '/list/1',
      blueprintNode: { kind: 'string' as BlueprintNodeKind },
    };
    const previous = getCommittedDeclarationKey(node, runtime);
    node.path = '/list/0';
    expect(getCommittedDeclarationKey(node, runtime)).toBe(
      JSON.stringify(['/list/0', 'string']),
    );
    expect(getCommittedDeclarationKey(node, runtime)).not.toBe(previous);
    node.blueprintNode.kind = 'number';
    expect(getCommittedDeclarationKey(node, runtime)).toBe(
      JSON.stringify(['/list/0', 'number']),
    );
    node.path = '/list/1';
    node.blueprintNode.kind = 'string';
    expect(getCommittedDeclarationKey(node, runtime)).toBe(previous);
  });
});
