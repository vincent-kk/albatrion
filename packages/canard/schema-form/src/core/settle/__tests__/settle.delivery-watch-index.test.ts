import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SchemaNodeEventType } from '../../record';
import { NodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { changeSchemaNodeContext, resetSchemaNodeSubtree, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-delivery
describe('44C-01 EVENT-064 watch delivery candidates', () => {
  it('skips all 1,000 unrelated watch reads, then delivers every anchor watcher', () => {
    const properties: Record<string, BlueprintSchema> = {
      x: { type: 'number' }, anchor: { type: 'number' },
    };
    const values: Record<string, number> = { x: 0, anchor: 0 };
    for (let index = 0; index < 1_000; index++) {
      properties[`watcher${index}`] = { type: 'number', controls: {
        watch: ['../anchor'],
      } };
      values[`watcher${index}`] = 0;
    }
    const { root } = createTestTree({ type: 'object', properties });
    writeSchemaNode(root, values, 'callerReplace', SetValueOption.Overwrite);
    const watchers = Object.values(root.structure!).filter((node) =>
      node.name.startsWith('watcher'));
    const before = root.runtime.commitNumber;
    expect(watchers).toHaveLength(1_000);
    expect(watchers.every((node) =>
      root.runtime.watchValuesMemo?.get(node)?.commit === before)).toBe(true);

    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.x, 1, 'input', SetValueOption.Overwrite);
    expect(watchers.every((node) =>
      root.runtime.watchValuesMemo?.get(node)?.commit === before)).toBe(true);
    expect(watchers.every((node) =>
      ((root.runtime.deliveries?.get(node)?.type ?? 0) &
        SchemaNodeEventType.UpdateComputedProperties) === 0)).toBe(true);

    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.anchor, 1, 'input', SetValueOption.Overwrite);
    expect(watchers.every((node) =>
      ((root.runtime.deliveries?.get(node)?.type ?? 0) &
        SchemaNodeEventType.UpdateComputedProperties) ===
        SchemaNodeEventType.UpdateComputedProperties)).toBe(true);
    expect(watchers.every((node) =>
      root.runtime.watchValuesMemo?.get(node)?.commit === root.runtime.commitNumber))
      .toBe(true);
  });

  it('refreshes a watcher when a conditional dependency enters the shape', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' },
      watcher: { type: 'string', controls: { watch: ['../conditional'] } },
    }, if: { properties: { enabled: { const: true } }, required: ['enabled'] },
    then: { properties: { conditional: { type: 'string', default: 'arrived' } } } });
    writeSchemaNode(root, { enabled: false, watcher: 'fixed' },
      'callerReplace', SetValueOption.Overwrite);
    const watcher = root.structure!.watcher;
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual([undefined]);
    root.runtime.deliveries?.clear();

    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.conditional).toBeDefined();
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual(['arrived']);
    expect((root.runtime.deliveries?.get(watcher)?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties)
      .toBe(SchemaNodeEventType.UpdateComputedProperties);
  });

  it('refreshes context watchers when the context changes', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      x: { type: 'number' },
      watcher: { type: 'string', controls: { watch: ['@'] } },
    } });
    root.runtime.context = { version: 1 };
    writeSchemaNode(root, { x: 0, watcher: 'fixed' },
      'callerReplace', SetValueOption.Overwrite);
    const watcher = root.structure!.watcher;
    root.runtime.deliveries?.clear();

    writeSchemaNode(root.structure!.x, 1, 'input', SetValueOption.Overwrite);
    expect(root.runtime.watchValuesMemo?.get(watcher)?.commit)
      .not.toBe(root.runtime.commitNumber);
    expect((root.runtime.deliveries?.get(watcher)?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties).toBe(0);
    root.runtime.deliveries?.clear();

    changeSchemaNodeContext(root, { version: 2 });
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual([{ version: 2 }]);
    expect((root.runtime.deliveries?.get(watcher)?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties)
      .toBe(SchemaNodeEventType.UpdateComputedProperties);
  });

  it('does not deliver a watcher when only its dependency\'s interaction state changes', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
      watcher: { type: 'string', controls: { watch: ['../source'] } },
    } });
    writeSchemaNode(root, { source: 'same', watcher: 'fixed' },
      'callerReplace', SetValueOption.Overwrite);
    const source = root.structure!.source;
    const watcher = root.structure!.watcher;
    source.interactionState = { [NodeState.Touched]: true };
    const before = root.runtime.commitNumber;

    writeSchemaNode(source, 'same', 'input', SetValueOption.Overwrite);
    expect(root.runtime.commitNumber).toBe((before ?? 0) + 1);
    expect((root.runtime.deliveries?.get(watcher)?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties).toBe(0);
  });

  it('44C-01 refreshes a watcher when its conditional dependency exits', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' },
      watcher: { type: 'string', controls: { watch: ['../conditional'] } },
    }, if: { properties: { enabled: { const: true } }, required: ['enabled'] },
    then: { properties: { conditional: { type: 'string', default: 'arrived' } } } });
    writeSchemaNode(root, { enabled: true, watcher: 'fixed' },
      'callerReplace', SetValueOption.Overwrite);
    const watcher = root.structure!.watcher;
    expect(root.runtime.deliverySnapshots?.get(watcher)?.watchValues)
      .toEqual(['arrived']);
    root.runtime.deliveries?.clear();

    writeSchemaNode(root.structure!.enabled, false, 'input', SetValueOption.Overwrite);
    expect(root.structure!.conditional).toBeUndefined();
    expect(root.runtime.watchValuesMemo?.get(watcher)?.values).toEqual([undefined]);
    expect((root.runtime.deliveries?.get(watcher)?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties)
      .toBe(SchemaNodeEventType.UpdateComputedProperties);
  });

  it('44C-01 removes descendant watchers after 50 gated group exits', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, source: { type: 'string' },
    }, if: { properties: { enabled: { const: true } }, required: ['enabled'] },
    then: { properties: { group: { type: 'object', properties: {
      watcher: { type: 'string', controls: { watch: ['/source'] } },
    } } } } });
    writeSchemaNode(root, { enabled: true, source: 'first',
      group: { watcher: 'fixed' } }, 'callerReplace', SetValueOption.Overwrite);
    const watcher = root.structure!.group.structure!.watcher;
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(true);

    for (let index = 0; index < 50; index++) {
      writeSchemaNode(root.structure!.enabled, false, 'input', SetValueOption.Overwrite);
      writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    }
    writeSchemaNode(root.structure!.enabled, false, 'input', SetValueOption.Overwrite);
    expect(watcher.detached).toBe(true);
    expect(root.runtime.deliveryWatchIndex?.allNodes.size).toBe(0);
  });

  it('44C-01 skips 1,000 unrelated watchers when resetting one leaf', () => {
    const properties: Record<string, BlueprintSchema> = {
      x: { type: 'number' }, anchor: { type: 'number' },
    };
    for (let index = 0; index < 1_000; index++)
      properties[`watcher${index}`] = { type: 'number', controls: {
        watch: ['../anchor'],
      } };
    const { root } = createTestTree({ type: 'object', properties });
    writeSchemaNode(root, { x: 0, anchor: 0 },
      'callerReplace', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.x, 5, 'input', SetValueOption.Overwrite);
    const watchers = Object.values(root.structure!).filter((node) =>
      node.name.startsWith('watcher'));

    resetSchemaNodeSubtree(root.structure!.x, SetValueOption.Overwrite);
    expect(watchers).toHaveLength(1_000);
    expect(watchers.filter((node) =>
      root.runtime.watchValuesMemo?.get(node)?.commit === root.runtime.commitNumber))
      .toHaveLength(0);
  });

  it('removes a watcher that leaves the conditional shape', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, source: { type: 'string' },
    }, if: { properties: { enabled: { const: true } }, required: ['enabled'] },
    then: { properties: { watcher: { type: 'string', controls: {
      watch: ['../source'],
    } } } } });
    writeSchemaNode(root, { enabled: true, source: 'first' },
      'callerReplace', SetValueOption.Overwrite);
    const watcher = root.structure!.watcher;
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(true);

    writeSchemaNode(root.structure!.enabled, false, 'input', SetValueOption.Overwrite);
    expect(watcher.detached).toBe(true);
    expect(root.runtime.deliveryWatchIndex?.allNodes.has(watcher)).toBe(false);
  });
});
