import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('derive rule locality', () => {
  it('SETTLE-017 leaf commit parses no unrelated derived baselines', () => {
    const parseCount = (size: number): number => {
      const properties: Record<string, BlueprintSchema> = {
        changed: { type: 'string' }, source: { type: 'string' },
      };
      for (let index = 0; index < size; index++)
        properties[`target${index}`] = { type: 'string', controls: {
          derived: '../source',
        } };
      const { root } = createTestTree({ type: 'object', properties });
      loadSchemaNodeAtMount(root, { source: 'A', changed: 'A' },
        SetValueOption.Overwrite);
      const baselines = root.runtime.committedRuleValues;
      const parse = vi.spyOn(JSON, 'parse');
      try {
        writeSchemaNode(root.structure!.changed, 'B', 'input',
          SetValueOption.Overwrite);
        expect(root.runtime.committedRuleValues).toBe(baselines);
        return parse.mock.calls.length;
      } finally {
        parse.mockRestore();
      }
    };
    const small = parseCount(64);
    const large = parseCount(640);
    expect(small).toBe(0);
    expect(large).toBe(small);
  });

  it('SETTLE-047 leaves an unrelated branch unread on a leaf input', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'object', properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      } },
      right: { type: 'object', properties: {
        value: { type: 'string' },
      } },
    } });
    loadSchemaNodeAtMount(root, { left: { source: 'A' }, right: { value: 'R' } },
      SetValueOption.Overwrite);
    const right = root.structure!.right;
    Object.defineProperty(right, 'children', {
      configurable: true,
      get: () => { throw new Error('unrelated branch traversed'); },
    });
    writeSchemaNode(root.structure!.left.structure!.source, 'B',
      'input', SetValueOption.Overwrite);
    expect(root.structure?.left?.structure?.target?.raw).toBe('B');
  });
});
