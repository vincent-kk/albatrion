import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../../../loadFieldNodeAtMount';
import { getGateSelectionTable } from '../../compute/childSelection/getGateSelectionTable';
import { getDependencyIndex } from '../getDependencyIndex';

/** Three payload owners per branch, matching the registration attribution fixture. */
const tree = () => createTestTree({
  type: 'object',
  properties: { kind: { type: 'string', default: 'k0' } },
  oneOf: Array.from({ length: 80 }, (_, index) => ({
    controls: { active: `./kind === 'k${index}'` },
    properties: {
      [`p${index}a`]: { type: 'string' },
      [`p${index}b`]: { type: 'number' },
      [`p${index}c`]: { type: 'boolean' },
    },
  })),
});

describe('dependency registration table injection', () => {
  it('leaves a non-injected index on the original affected path', () => {
    const { blueprint } = tree();
    expect(getDependencyIndex(blueprint).hasSplitOwners).toBe(false);
  });

  it('visits 4 owners instead of 241 while preserving the full affected query', () => {
    const { root, blueprint } = tree();
    loadFieldNodeAtMount(root, { kind: 'k0' }, WriteOption.Overwrite);
    const index = getDependencyIndex(blueprint, new Map([
      [blueprint.root, getGateSelectionTable(blueprint.root, blueprint)!],
    ]));
    const before = index.affected('/kind', root);
    const registered: string[] = [];
    index.affectedForRegistration('/kind', root, {
      owner: (path) => registered.push(path),
      hit: () => [],
    });
    expect(before).toHaveLength(241);
    expect(registered).toEqual(['', '/p0a', '/p0b', '/p0c']);
    expect(index.affected('/kind', root)).toEqual(before);
  });

  it('never splits an owner with a non-table state-key contribution', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: { kind: { type: 'string', default: 'a' } },
      oneOf: [
        { controls: { active: "./kind === 'a'" }, properties: {
          a: { type: 'string', controls: { visible: "../kind === 'a'" } },
        } },
        { controls: { active: "./kind === 'b'" }, properties: { b: { type: 'string' } } },
      ],
    });
    loadFieldNodeAtMount(root, { kind: 'a' }, WriteOption.Overwrite);
    const index = getDependencyIndex(blueprint, new Map([
      [blueprint.root, getGateSelectionTable(blueprint.root, blueprint)!],
    ]));
    expect(index.splitOwners.has('/a')).toBe(false);
    expect(index.splitOwners.has('/b')).toBe(true);
  });
});
