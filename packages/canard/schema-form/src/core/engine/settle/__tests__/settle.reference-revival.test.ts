import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const group = root.childrenByName!.group;
    const value = group.childrenByName!.value;
    const watcher = root.childrenByName!.watcher;
    const committedStoredValue = group.storedValue;
    const committedEmit = group.storedOutputValue;
    const groupRevision =
      group.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    const watchRevision =
      watcher.revisionLedger[FieldNodeEventType.UpdateControlledProperties] ??
      0;

    writeFieldNode(
      value,
      1,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(group.storedValue).toEqual({ value: 0 });
    expect(group.storedValue).toBe(committedStoredValue);
    expect(group.storedOutputValue).toBe(committedEmit);
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const group = root.childrenByName!.group;
    const other = root.childrenByName!.other;
    const watcher = root.childrenByName!.watcher;
    const committedStoredValue = group.storedValue;
    const committedEmit = group.storedOutputValue;
    const rootLocal = root.storedValue;
    const otherLocal = other.storedValue;
    const groupRevision =
      group.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    const rootRevision =
      root.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    const watchRevision =
      watcher.revisionLedger[FieldNodeEventType.UpdateControlledProperties] ??
      0;

    writeFieldNode(
      group.childrenByName!.value,
      1,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(other.storedValue).not.toBe(otherLocal);
    expect(root.storedValue).not.toBe(rootLocal);
    expect(root.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0).toBe(
      rootRevision + 1,
    );
    expect(group.storedValue).toBe(committedStoredValue);
    expect(group.storedOutputValue).toBe(committedEmit);
    expect(Reflect.get(Object(root.storedValue), 'group')).toBe(
      group.storedOutputValue,
    );
    expect(Reflect.get(Object(root.storedOutputValue), 'group')).toBe(
      group.storedOutputValue,
    );
    expect(Reflect.get(Object(root.storedValue), 'other')).toBe(
      other.storedOutputValue,
    );
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    const outer = root.childrenByName!.outer;
    const group = outer.childrenByName!.group;
    const other = root.childrenByName!.other;
    const outerLocal = outer.storedValue;
    const groupLocal = group.storedValue;
    const otherLocal = other.storedValue;

    writeFieldNode(
      group.childrenByName!.value,
      1,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(other.storedValue).not.toBe(otherLocal);
    expect(group.storedValue).toBe(groupLocal);
    expect(outer.storedValue).toBe(outerLocal);
    expect(Reflect.get(Object(outer.storedValue), 'group')).toBe(
      group.storedOutputValue,
    );
    expect(Reflect.get(Object(root.storedValue), 'outer')).toBe(
      outer.storedOutputValue,
    );
    expect(Reflect.get(Object(root.storedOutputValue), 'outer')).toBe(
      outer.storedOutputValue,
    );
  });
});
