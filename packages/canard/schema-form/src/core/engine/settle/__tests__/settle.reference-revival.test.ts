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
});
