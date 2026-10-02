import { describe, expect, it, vi } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';

describe('49C-01 SETTLE-017 latent occurrence scaling', () => {
  it('bounds key encoding when an absent-slot array exits as its sibling enters', () => {
    const count = 1000;
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      b: { type: 'array', controls: { active: '#/flag === false' },
        items: { type: 'object', properties: { x: { type: 'string' } } } },
      a: { type: 'array', controls: { active: '#/flag' },
        items: { type: 'object', controls: { active: './on === true' },
          properties: { on: { type: 'boolean' }, v: { type: 'string' } } } },
    } });
    const b = Array.from({ length: count }, (_, index) => ({ x: String(index) }));
    const a = Array.from({ length: count }, (_, index) =>
      ({ on: false, v: String(index) }));
    root.setValue({ flag: true, b, a });
    const stringify = JSON.stringify;
    let encodings = 0;
    const spy = vi.spyOn(JSON, 'stringify').mockImplementation((...args) => {
      encodings++;
      return Reflect.apply(stringify, JSON, args);
    });
    try {
      root.find('/flag')!.setValue(false);
      if (process.env.SETTLE_SCALING_PROBE)
        console.info(`B1 stringify: ${encodings}`);
      expect(encodings).toBeLessThan(count * 60);
    } finally {
      spy.mockRestore();
    }
    expect(root.value).toEqual({ flag: false, b });
    expect(root.inactiveValues).toEqual([{ path: '/a', value: a }]);
  });
});
