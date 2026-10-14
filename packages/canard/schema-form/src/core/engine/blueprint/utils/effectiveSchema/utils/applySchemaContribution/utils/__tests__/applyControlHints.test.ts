import { afterEach, expect, it, vi } from 'vitest';

import * as guards from '../../../../../types/isObjectRecord';
import { OwnedSchemaValues } from '../../../OwnedSchemaValues';
import type { EffectiveSchemaFields } from '../../../type';
import { applyControlHints } from '../applyControlHints';

afterEach(() => vi.restoreAllMocks());

it('guards controls once and preserves inherited getter reads, order and ownership', () => {
  const calls = vi.spyOn(guards, 'isObjectRecord');
  const reads: string[] = [];
  const watch = ['a'];
  const payload = { value: 'default' };
  const source: object = Object.create({
    get watch() {
      reads.push('watch');
      return watch;
    },
    get default() {
      reads.push('default');
      return payload;
    },
  });
  const previous = { retained: true };
  const target: EffectiveSchemaFields = { controls: previous };
  applyControlHints(target, source);
  expect(calls).toHaveBeenCalledExactlyOnceWith(source);
  expect(reads).toEqual(['watch', 'watch', 'default', 'default']);
  expect(target.controls).toEqual({ retained: true, watch, default: payload });
  expect(Object.keys(target.controls ?? {})).toEqual([
    'retained',
    'watch',
    'default',
  ]);
  expect(target.controls).not.toBe(previous);
  expect(target.controls?.watch).toBe(watch);
  expect(target.controls?.default).toBe(payload);
  expect(OwnedSchemaValues.has(target.controls!)).toBe(true);
  expect(OwnedSchemaValues.has(source)).toBe(false);
  expect(previous).toEqual({ retained: true });
});

it('rejects non-objects before target reads and retains array controls', () => {
  const calls = vi.spyOn(guards, 'isObjectRecord');
  const read = vi.fn(() => undefined);
  const target: EffectiveSchemaFields = {
    get controls() {
      return read();
    },
  };
  for (const source of [undefined, null, false, 0, '', () => {}]) {
    calls.mockClear();
    applyControlHints(target, source);
    expect(calls).toHaveBeenCalledExactlyOnceWith(source);
  }
  expect(read).not.toHaveBeenCalled();
  const array = Object.assign([], { watch: 'a', default: null });
  const result: EffectiveSchemaFields = {};
  applyControlHints(result, array);
  expect(result.controls).toEqual({ watch: 'a', default: null });
});
