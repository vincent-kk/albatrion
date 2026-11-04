import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-reference-revival
describe('settlement reference revival against the previous commit', () => {
  it('P-25 keeps the committed object reference when one settlement passes through an intermediate value', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: {
            value: { type: 'number', controls: { derived: '../value * 0' } },
          },
        },
        watcher: { type: 'string', controls: { watch: ['../group'] } },
      },
    });
    writeFieldNode(
      root,
      { group: { value: 0 }, watcher: 'fixed' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const group = root.structure!.group;
    const value = group.structure!.value;
    const watcher = root.structure!.watcher;
    const committedLocal = group.local;
    const committedEmit = group.emit;
    const groupRevision =
      group.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    const watchRevision =
      watcher.revisionLedger[FieldNodeEventType.UpdateControlledProperties] ??
      0;

    writeFieldNode(value, 1, 'callerReplace', WriteOption.Overwrite);

    expect(group.local).toEqual({ value: 0 });
    expect(group.local).toBe(committedLocal);
    expect(group.emit).toBe(committedEmit);
    expect(group.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0).toBe(
      groupRevision,
    );
    expect(
      watcher.revisionLedger[FieldNodeEventType.UpdateControlledProperties] ??
        0,
    ).toBe(watchRevision);
  });

  it('P-25 revives at assembly so the parent holds the revived child reference while a sibling changes through injectTo', () => {
    let tick = 10;
    const { root } = createTestTree({
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: {
            value: {
              type: 'number',
              controls: {
                derived: '../value * 0',
                injectTo: () => ({ '/other': ++tick }),
              },
            },
          },
        },
        other: { type: 'number' },
        watcher: { type: 'string', controls: { watch: ['../group'] } },
      },
    });
    writeFieldNode(
      root,
      { group: { value: 0 }, other: 1, watcher: 'fixed' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const group = root.structure!.group;
    const other = root.structure!.other;
    const watcher = root.structure!.watcher;
    const committedLocal = group.local;
    const committedEmit = group.emit;
    const rootLocal = root.local;
    const otherLocal = other.local;
    const groupRevision =
      group.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    const rootRevision =
      root.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    const watchRevision =
      watcher.revisionLedger[FieldNodeEventType.UpdateControlledProperties] ??
      0;

    writeFieldNode(
      group.structure!.value,
      1,
      'callerReplace',
      WriteOption.Overwrite,
    );

    expect(other.local).not.toBe(otherLocal);
    expect(root.local).not.toBe(rootLocal);
    expect(root.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0).toBe(
      rootRevision + 1,
    );
    expect(group.local).toBe(committedLocal);
    expect(group.emit).toBe(committedEmit);
    expect(Reflect.get(Object(root.local), 'group')).toBe(group.emit);
    expect(Reflect.get(Object(root.emit), 'group')).toBe(group.emit);
    expect(Reflect.get(Object(root.local), 'other')).toBe(other.emit);
    expect(group.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0).toBe(
      groupRevision,
    );
    expect(
      watcher.revisionLedger[FieldNodeEventType.UpdateControlledProperties] ??
        0,
    ).toBe(watchRevision);
  });

  it('P-25 revives at assembly so every ancestor holds the revived chain while an uncle changes through injectTo', () => {
    let tick = 10;
    const { root } = createTestTree({
      type: 'object',
      properties: {
        outer: {
          type: 'object',
          properties: {
            group: {
              type: 'object',
              properties: {
                value: {
                  type: 'number',
                  controls: {
                    derived: '../value * 0',
                    injectTo: () => ({ '/other': ++tick }),
                  },
                },
              },
            },
          },
        },
        other: { type: 'number' },
      },
    });
    writeFieldNode(
      root,
      { outer: { group: { value: 0 } }, other: 1 },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const outer = root.structure!.outer;
    const group = outer.structure!.group;
    const other = root.structure!.other;
    const outerLocal = outer.local;
    const groupLocal = group.local;
    const otherLocal = other.local;

    writeFieldNode(
      group.structure!.value,
      1,
      'callerReplace',
      WriteOption.Overwrite,
    );

    expect(other.local).not.toBe(otherLocal);
    expect(group.local).toBe(groupLocal);
    expect(outer.local).toBe(outerLocal);
    expect(Reflect.get(Object(outer.local), 'group')).toBe(group.emit);
    expect(Reflect.get(Object(root.local), 'outer')).toBe(outer.emit);
    expect(Reflect.get(Object(root.emit), 'outer')).toBe(outer.emit);
  });
});
