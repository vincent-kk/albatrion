import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createTestTree } from './fixtures/createTestTree';

describe('settle descendant rebirth regression', () => {
  it('WRITE-029 rebirth of exited descendants starts derived from no previous value', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        present: { type: 'boolean' },
        source: { type: 'string' },
        group: {
          type: 'object',
          controls: { active: '../present' },
          properties: {
            target: { type: 'string', controls: { derived: '#/source' } },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { present: true, source: 'A', group: { target: 'manual' } },
      WriteOption.Overwrite,
    );
    expect(root.structure?.group?.structure?.target?.raw).toBe('A');

    writeFieldNode(
      root.structure!.present,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.group).toBeUndefined();
    expect(
      [...(root.runtime.committedRuleValues?.keys() ?? [])].some((key) =>
        key.startsWith('["/group/target",'),
      ),
    ).toBe(false);

    writeFieldNode(
      root.structure!.present,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.runtime.settlementTrace?.rounds.flat()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'derived',
          sourcePath: '/group/target',
          targetPath: '/group/target',
          result: 'applied',
        }),
      ]),
    );
  });

  it('WRITE-029 resetInteraction on a reborn descendant starts with no baseline', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        present: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../present' },
          properties: {
            target: { type: 'string', controls: { resetInteraction: 'true' } },
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { present: true, group: { target: 'A' } },
      WriteOption.Overwrite,
    );
    expect(
      [...(root.runtime.committedRuleValues?.keys() ?? [])].some((key) =>
        key.startsWith('["/group/target",'),
      ),
    ).toBe(true);

    writeFieldNode(
      root.structure!.present,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(
      [...(root.runtime.committedRuleValues?.keys() ?? [])].some((key) =>
        key.startsWith('["/group/target",'),
      ),
    ).toBe(false);

    writeFieldNode(
      root.structure!.present,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.runtime.settlementTrace?.rounds.flat()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'resetInteraction',
          sourcePath: '/group/target',
          targetPath: '/group/target',
          result: 'applied',
        }),
      ]),
    );
  });
});
