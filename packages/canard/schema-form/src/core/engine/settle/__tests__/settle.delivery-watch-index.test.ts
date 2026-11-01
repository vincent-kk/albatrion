import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { changeFieldNodeContext } from '../utils/context/changeFieldNodeContext';
import { resetFieldNodeSubtree } from '../utils/reset/resetFieldNodeSubtree';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-delivery-watch-index
describe('44C-01 EVENT-064 watch delivery candidates', () => {
  it('skips all 1,000 unrelated watch reads, then delivers every anchor watcher', () => {
    const properties: Record<string, BlueprintSchema> = {
      x: { type: 'number' },
      anchor: { type: 'number' },
    };
    const values: Record<string, number> = { x: 0, anchor: 0 };
    for (let index = 0; index < 1_000; index++) {
      properties[`watcher${index}`] = {
        type: 'number',
        controls: {
          watch: ['../anchor'],
        },
      };
      values[`watcher${index}`] = 0;
    }
    const { root } = createTestTree({ type: 'object', properties });
    writeFieldNode(root, values, 'callerReplace', WriteOption.Overwrite);
    const watchers = Object.values(root.structure!).filter((node) =>
      node.name.startsWith('watcher'),
    );
    const before = root.runtime.commitNumber;
    expect(watchers).toHaveLength(1_000);
    expect(
      watchers.every(
        (node) => root.runtime.watchValuesMemo?.get(node)?.commit === before,
      ),
    ).toBe(true);

    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(root.structure!.x, 1, 'input', WriteOption.Overwrite);
    expect(
      watchers.every(
        (node) => root.runtime.watchValuesMemo?.get(node)?.commit === before,
      ),
    ).toBe(true);
    expect(
      watchers.every(
        (node) =>
          ((node.pendingDelivery?.type ?? 0) &
            FieldNodeEventType.UpdateControlledProperties) ===
          0,
      ),
    ).toBe(true);

    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(root.structure!.anchor, 1, 'input', WriteOption.Overwrite);
    expect(
      watchers.every(
        (node) =>
          ((node.pendingDelivery?.type ?? 0) &
            FieldNodeEventType.UpdateControlledProperties) ===
          FieldNodeEventType.UpdateControlledProperties,
      ),
    ).toBe(true);
    expect(
      watchers.every(
        (node) =>
          root.runtime.watchValuesMemo?.get(node)?.commit ===
          root.runtime.commitNumber,
      ),
    ).toBe(true);
  });

  it('refreshes a watcher when a conditional dependency enters the shape', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        watcher: { type: 'string', controls: { watch: ['../conditional'] } },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: { conditional: { type: 'string', default: 'arrived' } },
      },
    });
    writeFieldNode(
      root,
      { enabled: false, watcher: 'fixed' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.watcher;
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual([
      undefined,
    ]);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();

    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.conditional).toBeDefined();
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual([
      'arrived',
    ]);
    expect(
      (watcher.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(FieldNodeEventType.UpdateControlledProperties);
  });

  it('refreshes context watchers when the context changes', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        x: { type: 'number' },
        watcher: { type: 'string', controls: { watch: ['@'] } },
      },
    });
    root.runtime.context = { version: 1 };
    writeFieldNode(
      root,
      { x: 0, watcher: 'fixed' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.watcher;
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();

    writeFieldNode(root.structure!.x, 1, 'input', WriteOption.Overwrite);
    expect(root.runtime.watchValuesMemo?.get(watcher)?.commit).not.toBe(
      root.runtime.commitNumber,
    );
    expect(
      (watcher.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(0);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();

    changeFieldNodeContext(root, { version: 2 });
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual([
      { version: 2 },
    ]);
    expect(
      (watcher.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(FieldNodeEventType.UpdateControlledProperties);
  });

  it("does not deliver a watcher when only its dependency's interaction state changes", () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        watcher: { type: 'string', controls: { watch: ['../source'] } },
      },
    });
    writeFieldNode(
      root,
      { source: 'same', watcher: 'fixed' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const source = root.structure!.source;
    const watcher = root.structure!.watcher;
    source.interactionState = { [FieldNodeState.Touched]: true };
    const before = root.runtime.commitNumber;

    writeFieldNode(source, 'same', 'input', WriteOption.Overwrite);
    expect(root.runtime.commitNumber).toBe((before ?? 0) + 1);
    expect(
      (watcher.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(0);
  });

  it('44C-01 refreshes a watcher when its conditional dependency exits', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        watcher: { type: 'string', controls: { watch: ['../conditional'] } },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: { conditional: { type: 'string', default: 'arrived' } },
      },
    });
    writeFieldNode(
      root,
      { enabled: true, watcher: 'fixed' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.watcher;
    expect(watcher.deliveryWatchValues).toEqual(['arrived']);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();

    writeFieldNode(
      root.structure!.enabled,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure!.conditional).toBeUndefined();
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual([
      undefined,
    ]);
    expect(
      (watcher.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(FieldNodeEventType.UpdateControlledProperties);
  });

  it('44C-01 removes descendant watchers after 50 gated group exits', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        source: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: {
          group: {
            type: 'object',
            properties: {
              watcher: { type: 'string', controls: { watch: ['/source'] } },
            },
          },
        },
      },
    });
    writeFieldNode(
      root,
      { enabled: true, source: 'first', group: { watcher: 'fixed' } },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.group.structure!.watcher;
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(true);

    for (let index = 0; index < 50; index++) {
      writeFieldNode(
        root.structure!.enabled,
        false,
        'input',
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root.structure!.enabled,
        true,
        'input',
        WriteOption.Overwrite,
      );
    }
    writeFieldNode(
      root.structure!.enabled,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(watcher.detached).toBe(true);
    expect(root.runtime.deliveryWatchIndex?.allNodes.size).toBe(0);
  });

  it('44C-01 skips 1,000 unrelated watchers when resetting one leaf', () => {
    const properties: Record<string, BlueprintSchema> = {
      x: { type: 'number' },
      anchor: { type: 'number' },
    };
    for (let index = 0; index < 1_000; index++)
      properties[`watcher${index}`] = {
        type: 'number',
        controls: {
          watch: ['../anchor'],
        },
      };
    const { root } = createTestTree({ type: 'object', properties });
    writeFieldNode(
      root,
      { x: 0, anchor: 0 },
      'callerReplace',
      WriteOption.Overwrite,
    );
    writeFieldNode(root.structure!.x, 5, 'input', WriteOption.Overwrite);
    const watchers = Object.values(root.structure!).filter((node) =>
      node.name.startsWith('watcher'),
    );

    resetFieldNodeSubtree(root.structure!.x, WriteOption.Overwrite);
    expect(watchers).toHaveLength(1_000);
    expect(
      watchers.filter(
        (node) =>
          root.runtime.watchValuesMemo?.get(node)?.commit ===
          root.runtime.commitNumber,
      ),
    ).toHaveLength(0);
  });

  it('removes a watcher that leaves the conditional shape', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        source: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: {
        properties: {
          watcher: {
            type: 'string',
            controls: {
              watch: ['../source'],
            },
          },
        },
      },
    });
    writeFieldNode(
      root,
      { enabled: true, source: 'first' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.watcher;
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(true);

    writeFieldNode(
      root.structure!.enabled,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(watcher.detached).toBe(true);
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(false);
  });
});
