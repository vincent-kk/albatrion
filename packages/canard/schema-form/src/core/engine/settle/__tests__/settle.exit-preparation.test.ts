import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PlainNode } from '../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import type { BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import { getCommittedDeclarationKey } from '../../utils/controls/getCommittedDeclarationKey';
import { emptyReadonlyMap } from '../../utils/emptyReadonlyMap';
import { PathKeyedMap } from '../../utils/pathIndex/PathKeyedMap';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { getControlLayers } from '../utils/controls/getControlLayers';
import { getLatentOrder } from '../utils/latentStore/getLatentOrder';
import { readUnsetPolicy } from '../utils/transition/readUnsetPolicy';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-b2-p2-exit-preparation
describe('exit preparation preserves committed policies and document order', () => {
  it('does not rescan root control declarations for repeated sparse exits', () => {
    const fragments: BlueprintSchema[] = Array.from({ length: 24 }, (_, i) => ({
      controls: { disabled: false },
      properties: { ['other' + i]: { type: 'string' } },
    }));
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['secret'], controls: { unsetOnInactive: true } }],
      },
      properties: { secret: { type: 'string' }, plain: { type: 'string' } },
      allOf: fragments,
    });
    loadFieldNodeAtMount(
      root,
      { secret: 'S', plain: 'P' },
      WriteOption.Overwrite,
    );
    const secret = root.structure!.secret;
    const plain = root.structure!.plain;
    getControlLayers(secret, emptyReadonlyMap);
    getControlLayers(plain, emptyReadonlyMap);
    readUnsetPolicy(secret, false);
    readUnsetPolicy(plain, false);
    const schemas = root.blueprintNode.declarations.map(
      (entry) => entry.schema,
    );
    const reads = vi.spyOn(Reflect, 'get');
    for (let i = 0; i < 4; i++) {
      expect(readUnsetPolicy(secret, false)).toBe(true);
      expect(readUnsetPolicy(plain, false)).toBe(false);
    }
    expect(
      reads.mock.calls.filter(
        ([target, key]) =>
          key === 'controls' && schemas.includes(target as BlueprintSchema),
      ),
    ).toHaveLength(0);
  });

  it('reuses child positions and preserves the first duplicate edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: { z: { type: 'string' }, a: { type: 'string' } },
    });
    const entries = root.blueprintNode.childEntries;
    const repeated: PlainNode = {
      ...root,
      blueprintNode: {
        ...root.blueprintNode,
        childEntries: [...entries, entries[0]],
      },
    };
    expect(getLatentOrder(repeated, 'z', entries[0].node)).toEqual([0]);
    const searches = vi.spyOn(Array.prototype, 'findIndex');
    for (let i = 0; i < 4; i++) {
      expect(getLatentOrder(repeated, 'a', entries[1].node)).toEqual([1]);
      expect(getLatentOrder(repeated, 'z', entries[0].node)).toEqual([0]);
    }
    expect(
      searches.mock.contexts.filter(
        (value) => value === repeated.blueprintNode.childEntries,
      ),
    ).toHaveLength(0);
    expect(getLatentOrder(repeated, '7', entries[0].node)).toEqual([7]);
  });

  it('filters exit-only groups and reads the latest committed selection and value', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        clear: { type: 'boolean' },
        secret: { type: 'string', controls: { disabled: true } },
      },
      allOf: [
        {
          controls: { unsetOnInactive: './clear' },
          properties: { secret: { type: 'string' } },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { clear: true, secret: 'S' },
      WriteOption.Overwrite,
    );
    const secret = root.structure!.secret;
    expect(
      getControlLayers(secret, emptyReadonlyMap, true).map(
        (group) => group.layer,
      ),
    ).toEqual(['fragment']);
    expect(readUnsetPolicy(secret, false)).toBe(true);
    writeFieldNode(
      root.structure!.clear,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(readUnsetPolicy(secret, true)).toBe(false);
    const key = getCommittedDeclarationKey(root, root.runtime);
    const committed = (root.runtime.committedDeclarationIds ??=
      new PathKeyedMap<readonly number[]>('pair'));
    const selected = committed.get(key);
    committed.set(key, []);
    expect(readUnsetPolicy(secret, true)).toBe(true);
    if (selected) committed.set(key, selected);
    else committed.delete(key);
    expect(readUnsetPolicy(secret, true)).toBe(false);
  });

  it('captures exiting descendants in document order without child-edge rescans', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        branch: {
          type: 'object',
          controls: { active: '../flag' },
          properties: { z: { type: 'string' }, a: { type: 'string' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, branch: { z: 'Z', a: 'A' } },
      WriteOption.Overwrite,
    );
    const branch = root.structure!.branch;
    const position = getLatentOrder(root, branch.name, branch.blueprintNode);
    const searches = vi.spyOn(Array.prototype, 'findIndex');
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    expect(
      searches.mock.contexts.filter(
        (value) => value === branch.blueprintNode.childEntries,
      ),
    ).toHaveLength(0);
    expect(
      root.runtime.latentRawMetadata?.get('["/branch/z","string"]')?.order,
    ).toEqual([...position, 0]);
    expect(
      root.runtime.latentRawMetadata?.get('["/branch/a","string"]')?.order,
    ).toEqual([...position, 1]);
  });

  it.each(['node', 'fields', 'fragment', 'inherited', 'expression', 'keep'])(
    'retains %s policy precedence across exit and reentry',
    (kind) => {
      const { root } = createTestTree({
        type: 'object',
        controls:
          kind === 'fields' || kind === 'keep'
            ? {
                fields: [
                  { targets: ['branch'], controls: { unsetOnInactive: true } },
                  ...(kind === 'keep'
                    ? [
                        {
                          targets: ['branch'],
                          controls: { unsetOnInactive: false },
                        },
                      ]
                    : []),
                ],
              }
            : undefined,
        properties: { flag: { type: 'boolean' }, clear: { type: 'boolean' } },
        allOf: [
          {
            controls: {
              active: './flag',
              unsetOnInactive: kind === 'fragment',
            },
            properties: {
              branch: {
                type: 'object',
                controls:
                  kind === 'node'
                    ? { unsetOnInactive: false }
                    : kind === 'inherited'
                      ? { unsetOnInactive: true }
                      : kind === 'expression'
                        ? { unsetOnInactive: '../clear' }
                        : undefined,
                properties: { value: { type: 'string' } },
              },
            },
          },
        ],
      });
      root.runtime.unsetOnInactive = true;
      loadFieldNodeAtMount(
        root,
        { flag: true, clear: true, branch: { value: 'V' } },
        WriteOption.Overwrite,
      );
      const old = root.structure!.branch;
      const clear = kind !== 'node' && kind !== 'keep';
      expect(readUnsetPolicy(old, true)).toBe(clear);
      writeFieldNode(
        root.structure!.flag,
        false,
        'input',
        WriteOption.Overwrite,
      );
      expect(root.runtime.latentRaw.has('["/branch/value","string"]')).toBe(
        !clear,
      );
      if (!clear)
        expect(root.runtime.latentRaw.get('["/branch/value","string"]')).toBe(
          'V',
        );
      writeFieldNode(
        root.structure!.flag,
        true,
        'input',
        WriteOption.Overwrite,
      );
      if (!clear) expect(root.structure!.branch.structure!.value.raw).toBe('V');
      expect(root.structure!.branch).not.toBe(old);
    },
  );
});
