import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

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
    writeFieldNode(
      root,
      values,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const watchers = Object.values(root.__childrenByName__!).filter((node) =>
      node.name.startsWith('watcher'),
    );
    const before = root.runtime.commitNumber;
    expect(watchers).toHaveLength(1_000);
    expect(
      watchers.every((node) => node.__watchValues__?.commit === before),
    ).toBe(true);

    for (const node of root.runtime.deliveries ?? [])
      node.__pendingDelivery__ = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(
      root.__childrenByName__!.x,
      1,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(
      watchers.every((node) => node.__watchValues__?.commit === before),
    ).toBe(true);
    expect(
      watchers.every(
        (node) =>
          ((node.__pendingDelivery__?.type ?? 0) &
            FieldNodeEventType.UpdateControlledProperties) ===
          0,
      ),
    ).toBe(true);

    for (const node of root.runtime.deliveries ?? [])
      node.__pendingDelivery__ = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(
      root.__childrenByName__!.anchor,
      1,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(
      watchers.every(
        (node) =>
          ((node.__pendingDelivery__?.type ?? 0) &
            FieldNodeEventType.UpdateControlledProperties) ===
          FieldNodeEventType.UpdateControlledProperties,
      ),
    ).toBe(true);
    expect(
      watchers.every(
        (node) => node.__watchValues__?.commit === root.runtime.commitNumber,
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const watcher = root.__childrenByName__!.watcher;
    expect(watcher.__watchValues__?.values).toEqual([undefined]);
    for (const node of root.runtime.deliveries ?? [])
      node.__pendingDelivery__ = undefined;
    root.runtime.deliveries?.clear();

    writeFieldNode(
      root.__childrenByName__!.enabled,
      true,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__?.conditional).toBeDefined();
    expect(watcher.__watchValues__?.values).toEqual(['arrived']);
    expect(
      (watcher.__pendingDelivery__?.type ?? 0) &
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const watcher = root.__childrenByName__!.watcher;
    for (const node of root.runtime.deliveries ?? [])
      node.__pendingDelivery__ = undefined;
    root.runtime.deliveries?.clear();

    writeFieldNode(
      root.__childrenByName__!.x,
      1,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(watcher.__watchValues__?.commit).not.toBe(root.runtime.commitNumber);
    expect(
      (watcher.__pendingDelivery__?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(0);
    for (const node of root.runtime.deliveries ?? [])
      node.__pendingDelivery__ = undefined;
    root.runtime.deliveries?.clear();

    changeFieldNodeContext(root, { version: 2 });
    expect(watcher.__watchValues__?.values).toEqual([{ version: 2 }]);
    expect(
      (watcher.__pendingDelivery__?.type ?? 0) &
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const instance = root.__childrenByName__!['source'];
    const watcher = root.__childrenByName__!.watcher;
    instance.__state__ = { [FieldNodeState.Touched]: true };
    const before = root.runtime.commitNumber;

    writeFieldNode(
      instance,
      'same',
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.runtime.commitNumber).toBe((before ?? 0) + 1);
    expect(
      (watcher.__pendingDelivery__?.type ?? 0) &
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const watcher = root.__childrenByName__!.watcher;
    expect(watcher.__deliveryWatchValues__).toEqual(['arrived']);
    for (const node of root.runtime.deliveries ?? [])
      node.__pendingDelivery__ = undefined;
    root.runtime.deliveries?.clear();

    writeFieldNode(
      root.__childrenByName__!.enabled,
      false,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__!.conditional).toBeUndefined();
    expect(watcher.__watchValues__?.values).toEqual([undefined]);
    expect(
      (watcher.__pendingDelivery__?.type ?? 0) &
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const watcher = root.__childrenByName__!.group.__childrenByName__!.watcher;
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(true);

    for (let index = 0; index < 50; index++) {
      writeFieldNode(
        root.__childrenByName__!.enabled,
        false,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root.__childrenByName__!.enabled,
        true,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
    }
    writeFieldNode(
      root.__childrenByName__!.enabled,
      false,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(watcher.isDetached).toBe(true);
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.__childrenByName__!.x,
      5,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    const watchers = Object.values(root.__childrenByName__!).filter((node) =>
      node.name.startsWith('watcher'),
    );

    resetFieldNodeSubtree(root.__childrenByName__!.x, WriteOption.Overwrite);
    expect(watchers).toHaveLength(1_000);
    expect(
      watchers.filter(
        (node) => node.__watchValues__?.commit === root.runtime.commitNumber,
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const watcher = root.__childrenByName__!.watcher;
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(true);

    writeFieldNode(
      root.__childrenByName__!.enabled,
      false,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(watcher.isDetached).toBe(true);
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(false);
  });
});
