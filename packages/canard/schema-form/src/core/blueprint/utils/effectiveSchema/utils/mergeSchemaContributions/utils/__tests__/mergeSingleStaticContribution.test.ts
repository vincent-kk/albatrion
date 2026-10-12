import { afterEach, expect, it, vi } from 'vitest';

import { blueprint } from '../../../../../../blueprint';
import * as guards from '../../../../../types/isObjectRecord';
import { OwnedSchemaValues } from '../../../OwnedSchemaValues';
import * as hints from '../../../applySchemaContribution/utils/applyControlHints';
import { mergeSingleStaticContribution } from '../mergeSingleStaticContribution';

afterEach(() => vi.restoreAllMocks());

it('uses the guarded controls producer once in the sole static contribution path', () => {
  const root = blueprint({ type: 'string' }).root;
  const produce = vi.spyOn(hints, 'applyControlHints');
  const guard = vi.spyOn(guards, 'isObjectRecord');
  const reads: string[] = [];
  const controls = {
    get watch() {
      reads.push('watch');
      return 'a';
    },
    get default() {
      reads.push('default');
      return 'value';
    },
  };
  for (const source of [
    controls,
    null,
    0,
    'text',
    Object.assign([], { watch: 'a' }),
  ]) {
    produce.mockClear();
    guard.mockClear();
    reads.length = 0;
    const schema = {
      title: 'first',
      controls: source,
      description: 'last',
      type: 'string',
    };
    const declaration = { ...root.declarations[0], schema };
    const node = { ...root, declarations: [declaration] };
    const result = mergeSingleStaticContribution(node, node.declarations, {
      mode: 'static',
    });
    const observedReads = [...reads];
    if (!result || typeof result.schema === 'boolean')
      throw new Error(
        'The sole static contribution must produce an object schema.',
      );
    expect(produce).toHaveBeenCalledTimes(1);
    expect(produce.mock.calls[0][1]).toBe(source);
    expect(guard).toHaveBeenCalledExactlyOnceWith(source);
    if (source === controls) {
      expect(observedReads).toEqual(['watch', 'watch', 'default', 'default']);
      expect(result?.schema.controls).toEqual({ watch: 'a', default: 'value' });
      expect(Object.keys(result?.schema ?? {})).toEqual([
        'title',
        'controls',
        'description',
        'type',
      ]);
      expect(Object.isFrozen(result?.schema.controls)).toBe(true);
      const envelope = produce.mock.calls[0][0].controls;
      expect(envelope).toBe(result?.schema.controls);
      expect(OwnedSchemaValues.has(envelope!)).toBe(false);
    } else if (source === null || typeof source !== 'object') {
      expect(result?.schema.controls).toBeUndefined();
      expect(Object.keys(result?.schema ?? {})).toEqual([
        'title',
        'description',
        'type',
      ]);
    } else expect(result?.schema.controls).toEqual({ watch: 'a' });
  }
});
