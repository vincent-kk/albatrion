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
    const group = root.__childrenByName__!.group;
    const value = group.__childrenByName__!.value;
    const watcher = root.__childrenByName__!.watcher;
    const committedValue = group.__value__;
    const committedEmit = group.__outputValue__;
    const groupRevision =
      group.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0;
    const watchRevision =
      watcher.__revisionLedger__[
        FieldNodeEventType.UpdateControlledProperties
      ] ?? 0;

    writeFieldNode(
      value,
      1,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(group.__value__).toEqual({ value: 0 });
    expect(group.__value__).toBe(committedValue);
    expect(group.__outputValue__).toBe(committedEmit);
    expect(group.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0).toBe(
      groupRevision,
    );
    expect(
      watcher.__revisionLedger__[
        FieldNodeEventType.UpdateControlledProperties
      ] ?? 0,
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
    const group = root.__childrenByName__!.group;
    const other = root.__childrenByName__!.other;
    const watcher = root.__childrenByName__!.watcher;
    const committedValue = group.__value__;
    const committedEmit = group.__outputValue__;
    const rootLocal = root.__value__;
    const otherLocal = other.__value__;
    const groupRevision =
      group.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0;
    const rootRevision =
      root.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0;
    const watchRevision =
      watcher.__revisionLedger__[
        FieldNodeEventType.UpdateControlledProperties
      ] ?? 0;

    writeFieldNode(
      group.__childrenByName__!.value,
      1,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(other.__value__).not.toBe(otherLocal);
    expect(root.__value__).not.toBe(rootLocal);
    expect(root.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0).toBe(
      rootRevision + 1,
    );
    expect(group.__value__).toBe(committedValue);
    expect(group.__outputValue__).toBe(committedEmit);
    expect(Reflect.get(Object(root.__value__), 'group')).toBe(
      group.__outputValue__,
    );
    expect(Reflect.get(Object(root.__outputValue__), 'group')).toBe(
      group.__outputValue__,
    );
    expect(Reflect.get(Object(root.__value__), 'other')).toBe(
      other.__outputValue__,
    );
    expect(group.__revisionLedger__[FieldNodeEventType.UpdateValue] ?? 0).toBe(
      groupRevision,
    );
    expect(
      watcher.__revisionLedger__[
        FieldNodeEventType.UpdateControlledProperties
      ] ?? 0,
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
    const outer = root.__childrenByName__!.outer;
    const group = outer.__childrenByName__!.group;
    const other = root.__childrenByName__!.other;
    const outerLocal = outer.__value__;
    const groupLocal = group.__value__;
    const otherLocal = other.__value__;

    writeFieldNode(
      group.__childrenByName__!.value,
      1,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );

    expect(other.__value__).not.toBe(otherLocal);
    expect(group.__value__).toBe(groupLocal);
    expect(outer.__value__).toBe(outerLocal);
    expect(Reflect.get(Object(outer.__value__), 'group')).toBe(
      group.__outputValue__,
    );
    expect(Reflect.get(Object(root.__value__), 'outer')).toBe(
      outer.__outputValue__,
    );
    expect(Reflect.get(Object(root.__outputValue__), 'outer')).toBe(
      outer.__outputValue__,
    );
  });
});
