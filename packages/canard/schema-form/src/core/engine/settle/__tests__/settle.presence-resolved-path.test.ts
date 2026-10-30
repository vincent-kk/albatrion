import { afterEach, describe, expect, it, vi } from 'vitest';

import * as pointer from '@/schema-form/helpers/jsonPointer';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-presence-resolved-path
describe('resolved presence path reuse', () => {
  it('does not decode and append a path already computed by the caller', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        field: { type: 'string', controls: { active: '../flag' } },
      },
    });
    const index = getDependencyIndex(blueprint),
      settlement = {};
    index.affectedByPresence('', 'flag', undefined, settlement, root.runtime);
    const decode = vi.spyOn(pointer, 'parsePointerSegment');
    const append = vi.spyOn(pointer, 'appendSegment');
    const result = index.affectedByPresence(
      '',
      'flag',
      undefined,
      settlement,
      root.runtime,
      'flag',
      '/flag',
    );
    const counts = [decode.mock.calls.length, append.mock.calls.length];
    vi.restoreAllMocks();
    expect([...result.owners]).toEqual(['/field']);
    expect(counts).toEqual([0, 0]);
  });

  it.each(['*', 'a/b', '~name', 'constructor'])(
    'preserves the literal name %s',
    (name) => {
      const { root, blueprint } = createTestTree({
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          field: { type: 'string', controls: { active: '../flag' } },
        },
      });
      const index = getDependencyIndex(blueprint);
      const encoded = pointer.formatSegment(name),
        path = pointer.appendSegment('', name);
      const expected = index.affectedByPresence(
        '',
        encoded,
        undefined,
        {},
        root.runtime,
      );
      const actual = index.affectedByPresence(
        '',
        encoded,
        undefined,
        {},
        root.runtime,
        name,
        path,
      );
      for (const key of [
        'owners',
        'stateOnly',
        'outerTemplates',
        'directTemplates',
      ] as const)
        expect([...actual[key]]).toEqual([...expected[key]]);
    },
  );
});
