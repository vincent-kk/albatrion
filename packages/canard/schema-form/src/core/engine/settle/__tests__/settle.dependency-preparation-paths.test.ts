import { describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import type { BlueprintSchema } from '../../blueprint';
import { getGateSelectionTable } from '../utils/compute/childSelection/getGateSelectionTable';
import { prepareGateSelection } from '../utils/compute/childSelection/prepareGateSelection';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';
import { captureDependencyPreparation } from './fixtures/gate-table/captureDependencyPreparation';
import { createLoadUnionSchema } from './fixtures/gate-table/createLoadUnionSchema';

// filid:contract settle-dependency-preparation-paths
describe('dependency preparation path and lifetime boundaries', () => {
  it('preserves empty segments, escaped names, derive targets and wildcard folding', async () => {
    const schema: BlueprintSchema = {
      type: 'object',
      controls: {
        fields: [{ targets: ['derived'], controls: { derived: './source' } }],
      },
      properties: {
        source: { type: 'string', default: 'S' },
        derived: { type: 'string' },
        'a/b': { type: 'string', controls: { visible: '../source' } },
        '': {
          type: 'object',
          properties: {
            value: { type: 'string', controls: { visible: '../../source' } },
          },
        },
        items: {
          type: 'array',
          default: [{ value: 'A' }, { value: 'B' }],
          items: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                controls: { visible: '/items/0/value' },
              },
            },
          },
        },
      },
    };
    await expect(captureDependencyPreparation(schema)).toMatchFileSnapshot(
      './fixtures/gate-table/preparation/paths.json',
    );
  });

  it('preserves two tables, shared gate steps and non-root run anchor strings', async () => {
    await expect(
      captureDependencyPreparation({
        type: 'object',
        properties: {
          first: createLoadUnionSchema(),
          second: createLoadUnionSchema(),
        },
      }),
    ).toMatchFileSnapshot('./fixtures/gate-table/preparation/two-tables.json');
  });

  it('leaves generic load unprepared until an explicitly allowed preparation', () => {
    const { blueprint } = createTestTree(createLoadUnionSchema());
    expect(prepareGateSelection(blueprint, false)).toBe(false);
    expect(getDependencyIndex(blueprint).hasSplitOwners).toBe(false);
    expect(prepareGateSelection(blueprint)).toBe(true);
    expect(prepareGateSelection(blueprint, false)).toBe(true);
  });

  it('keeps table gates identical to blueprint declarations and reuses one bucket', () => {
    const { blueprint } = createTestTree(createLoadUnionSchema());
    prepareGateSelection(blueprint);
    const table = getGateSelectionTable(blueprint.root, blueprint)!;
    const index = getDependencyIndex(blueprint);
    for (const group of table.groups)
      for (const gate of group.literalsByGate.keys())
        expect(table.plan.steps.some((step) => step.gate === gate)).toBe(true);
    const owners = [...index.splitOwners.values()];
    expect(owners.length).toBeGreaterThan(1);
    expect(owners[0].bucket).toBe(owners[1].bucket);
  });

  it('builds declaration lookup without flatMap intermediate arrays', () => {
    const { blueprint } = createTestTree(createLoadUnionSchema());
    const flatMap = vi.spyOn(Array.prototype, 'flatMap');
    try {
      getDependencyIndex(blueprint);
      expect(flatMap).not.toHaveBeenCalled();
    } finally {
      flatMap.mockRestore();
    }
  });

  it('preserves watched paths when owner prefixes differ before a wildcard', () => {
    const { blueprint } = createTestTree({
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: { flag: { type: 'string' } },
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: {
                type: 'string',
                controls: { visible: '/meta/flag' },
              },
            },
          },
        },
      },
    });
    const index = getDependencyIndex(blueprint);
    const root = Reflect.get(index, 'root');
    expect(root.children.get('meta').children.get('flag').owners).toEqual([
      { path: '/items/*/value', bindable: false },
    ]);
    expect(root.children.get('items')?.owners ?? []).toEqual([]);
  });
});
