import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import { getCommittedDeclarationKey } from '../../utils/controls/getCommittedDeclarationKey';
import { dispatchMount, dispatchWriteInput } from '../../write';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { commitExitPolicyValues } from '../utils/commit/commitExitPolicyValues';
import * as layers from '../utils/controls/getControlLayers';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';

afterEach(() => vi.restoreAllMocks());

describe('direct exit-policy child ownership', () => {
  it('bounds F=64 C=16 control collections while retaining the exit range', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        h: {
          type: 'object',
          properties: { probe: { type: 'number' } },
          allOf: Array.from({ length: 64 }, (_, index) => ({
            controls: {
              active: '../flag',
              unsetOnInactive: './probe' + (index % 2 ? ' < 0' : ' >= 0'),
            },
            properties: Object.fromEntries(
              Array.from({ length: 15 }, (_, child) => child)
                .filter((child) => child % 64 === index % 15)
                .map((child) => ['k' + child, { type: 'number' }]),
            ),
          })),
        },
      },
    });
    dispatchMount(root, {
      flag: true,
      h: Object.fromEntries([
        ['probe', 0],
        ...Array.from({ length: 15 }, (_, index) => ['k' + index, index]),
      ]),
    });
    const collect = vi.spyOn(layers, 'getControlLayers');
    dispatchWriteInput(root.structure!.h.structure!.probe, -1);
    const controlCalls = collect.mock.calls.length;
    collect.mockClear();
    dispatchWriteInput(root.structure!.flag, false);
    const exitCalls = collect.mock.calls.length;
    expect(controlCalls).toBeLessThanOrEqual(24);
    expect(exitCalls).toBeGreaterThan(64);
    expect(exitCalls).toBeLessThanOrEqual(84);
    expect(root.emit).toEqual({ flag: false, h: { probe: -1 } });
  });

  it.each(['current', 'committed', 'authored', 'unselected'] as const)(
    'uses %s child selections without admitting an unrelated child',
    (selection) => {
      const { root } = createTestTree({
        type: 'object',
        properties: { unrelated: { type: 'string' } },
        allOf: [
          {
            controls: { unsetOnInactive: '@.policy()' },
            properties: { secret: { type: 'string' } },
          },
        ],
      });
      const policy = vi.fn(() => true);
      root.runtime.context = { policy };
      loadFieldNodeAtMount(
        root,
        { unrelated: 'U', secret: 'S' },
        WriteOption.Overwrite,
      );
      policy.mockClear();
      const child = root.structure!.secret;
      const scratch = getSettlementScratch(root.runtime);
      try {
        const context = createSettlementContext(
          root,
          'input',
          WriteOption.Overwrite,
          scratch,
        );
        context.stateDirtyNodes.add(root);
        context.dependencyOwnerPaths.add(root.path);
        if (selection === 'current') {
          context.selectedDeclarationIds.set(
            child,
            child.blueprintNode.declarations.map(({ id }) => id),
          );
          root.runtime.committedDeclarationIds?.set(
            getCommittedDeclarationKey(child),
            [],
          );
        } else if (selection === 'authored')
          root.runtime.committedDeclarationIds?.delete(
            getCommittedDeclarationKey(child),
          );
        else if (selection === 'unselected')
          context.selectedDeclarationIds.set(child, []);
        const collect = vi.spyOn(layers, 'getControlLayers');
        commitExitPolicyValues(context);
        expect(collect.mock.calls.map(([node]) => node.path)).toEqual(
          selection === 'unselected' ? [''] : ['', '/secret'],
        );
        expect(policy.mock.calls.length).toBe(selection === 'unselected' ? 0 : 1);
      } finally {
        releaseSettlementScratch(scratch);
      }
    },
  );

  it.each([
    { label: 'same-layer keep', fields: undefined, node: undefined, keep: true },
    { label: 'fields clear', fields: true, node: undefined, keep: false },
    { label: 'node keep', fields: true, node: false, keep: true },
    { label: 'node clear', fields: false, node: true, keep: false },
  ])('preserves $label and delivery through exit and reentry', (scene) => {
    const schema: BlueprintSchema = {
      type: 'object',
      properties: { flag: { type: 'boolean' }, probe: { type: 'number' } },
      controls: {
        fields:
          scene.fields === undefined
            ? []
            : [{ targets: ['secret'], controls: { unsetOnInactive: scene.fields } }],
      },
      allOf: [true, false].map((clear) => ({
        controls: {
          active: './flag',
          unsetOnInactive: clear ? './probe >= 0' : './probe < 0',
        },
        properties: {
          secret: {
            type: 'string',
            ...(scene.node === undefined
              ? {}
              : { controls: { unsetOnInactive: scene.node } }),
          },
        },
      })),
    };
    const { root } = createDispatchTree(schema);
    root.runtime.unsetOnInactive = true;
    const changed = vi.fn();
    root.runtime.onChange = changed;
    dispatchMount(root, { flag: true, probe: 0, secret: 'S' });
    changed.mockClear();
    dispatchWriteInput(root.structure!.probe, -1);
    expect(root.emit).toEqual({ flag: true, probe: -1, secret: 'S' });
    expect(changed.mock.calls.map(([value]) => value)).toEqual([
      { flag: true, probe: -1, secret: 'S' },
    ]);
    changed.mockClear();
    const old = root.structure!.secret;
    dispatchWriteInput(root.structure!.flag, false);
    expect(old.detached).toBe(true);
    expect(old.raw).toBe('S');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string']))).toBe(
      scene.keep,
    );
    expect(changed.mock.calls.map(([value]) => value)).toEqual([
      { flag: false, probe: -1 },
    ]);
    dispatchWriteInput(root.structure!.flag, true);
    expect(root.structure!.secret.raw).toBe(scene.keep ? 'S' : undefined);
  });
});
