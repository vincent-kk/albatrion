import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const schema = {
  $defs: {
    n: {
      type: 'object',
      properties: {
        v: { type: 'string' },
        kids: { type: 'array', items: { $ref: '#/$defs/n' } },
      },
    },
  },
  $ref: '#/$defs/n',
};

const nested = (depth: number) => {
  let value: any = { v: 'leaf' };
  for (let i = 0; i < depth; i++) value = { v: String(i), kids: [value] };
  return value;
};

describe('depth', () => {
  for (const depth of [100, 300, 1000])
    it(`D1 recursive array tree loads depth ${depth}`, () => {
      let error: unknown;
      let ok = false;
      try {
        const root: any = nodeFromJSONSchema({ jsonSchema: schema as any, defaultValue: nested(depth) });
        ok = root.value.v === String(depth - 1);
      } catch (e) {
        error = String(e).slice(0, 200);
      }
      expect({ ok, error }).toEqual({ ok: true, error: undefined });
    });
});

describe('depth threshold', () => {
  it('D2 find threshold and frames', () => {
    Error.stackTraceLimit = 300;
    let lo = 100;
    let hi = 300;
    let stack = '';
    while (hi - lo > 5) {
      const mid = (lo + hi) >> 1;
      try {
        nodeFromJSONSchema({ jsonSchema: schema as any, defaultValue: nested(mid) });
        lo = mid;
      } catch (e: any) {
        hi = mid;
        stack = String(e.stack);
      }
    }
    const frames = stack.split('\n').slice(1, 400).map((l) => l.trim().replace(/\(.*src\//, '(').replace(/:\d+\)$/, ')'));
    const counts: Record<string, number> = {};
    for (const f of frames) counts[f] = (counts[f] ?? 0) + 1;
    console.log('THRESHOLD', lo, hi);
    console.log(JSON.stringify(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15), null, 1));
    expect(lo).toBeGreaterThan(1000);
  });
});

describe('calibration', () => {
  it('D3 trivial recursion depth in this runner', () => {
    let n = 0;
    const f = (): number => (n++, f());
    try {
      f();
    } catch {
      /* overflow */
    }
    console.log('TRIVIAL_DEPTH', n);
    expect(n).toBeGreaterThan(1e9);
  });
  it('D4 setValue of a deep value after a shallow mount', () => {
    const root: any = nodeFromJSONSchema({ jsonSchema: schema as any, defaultValue: { v: 'r' } });
    let error: unknown;
    try {
      root.setValue(nested(250));
    } catch (e) {
      error = String(e).slice(0, 120);
    }
    expect(error).toBeUndefined();
  });
});
