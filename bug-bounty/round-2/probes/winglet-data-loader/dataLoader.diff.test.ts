import RefDataLoader from 'dataloader';
import { describe, expect, it } from 'vitest';

import { DataLoader } from '../../index';

// Seeded differential test against the reference `dataloader` package.
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

const flush = async () => {
  for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0));
};

type Op =
  | { t: 'load'; k: string }
  | { t: 'loadMany'; ks: string[] }
  | { t: 'clear'; k: string }
  | { t: 'clearAll' }
  | { t: 'prime'; k: string; err: boolean }
  | { t: 'tick' };

const KEYS = ['a', 'b', 'c', 'd', 'e1', 'e2'];

const genOps = (r: () => number, n: number): Op[] => {
  const ops: Op[] = [];
  const pick = () => KEYS[Math.floor(r() * KEYS.length)];
  for (let i = 0; i < n; i++) {
    const x = r();
    if (x < 0.4) ops.push({ t: 'load', k: pick() });
    else if (x < 0.5)
      ops.push({ t: 'loadMany', ks: [pick(), pick(), pick()] });
    else if (x < 0.6) ops.push({ t: 'clear', k: pick() });
    else if (x < 0.63) ops.push({ t: 'clearAll' });
    else if (x < 0.73) ops.push({ t: 'prime', k: pick(), err: r() < 0.3 });
    else ops.push({ t: 'tick' });
  }
  ops.push({ t: 'tick' });
  return ops;
};

const run = async (
  make: (fn: (keys: readonly string[]) => Promise<any[]>) => any,
  ops: Op[],
  failCalls: Set<number>,
) => {
  const calls: string[][] = [];
  const outcomes: string[] = [];
  const fetchCount: Record<string, number> = {};
  const loader = make(async (keys) => {
    const callNo = calls.length;
    calls.push([...keys]);
    await new Promise((r) => setTimeout(r, 0));
    if (failCalls.has(callNo)) throw new Error(`batch-fail-${callNo}`);
    return keys.map((k) => {
      fetchCount[k] = (fetchCount[k] || 0) + 1;
      if (k.startsWith('e')) return new Error(`err-${k}`);
      return `v-${k}-${fetchCount[k]}`;
    });
  });
  const pending: Promise<void>[] = [];
  const record = (i: number, p: Promise<any>) =>
    pending.push(
      p.then(
        (v) => {
          outcomes[i] = `ok:${JSON.stringify(
            Array.isArray(v)
              ? v.map((x) => (x instanceof Error ? `E:${x.message}` : x))
              : v,
          )}`;
        },
        (e) => {
          outcomes[i] = `err:${e?.message}`;
        },
      ),
    );
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op.t === 'load') record(i, loader.load(op.k));
    else if (op.t === 'loadMany')
      record(
        i,
        Promise.all(op.ks.map((k) => loader.load(k).catch((e: any) => e))),
      );
    else if (op.t === 'clear') loader.clear(op.k);
    else if (op.t === 'clearAll') loader.clearAll();
    else if (op.t === 'prime')
      loader.prime(op.k, op.err ? new Error(`primed-${op.k}`) : `p-${op.k}`);
    else await flush();
  }
  await Promise.all(pending);
  return { calls, outcomes };
};

const configs: Array<{ name: string; ours: any; ref: any }> = [
  { name: 'default', ours: {}, ref: {} },
  { name: 'nocache', ours: { cache: false }, ref: { cache: false } },
  { name: 'max2', ours: { maxBatchSize: 2 }, ref: { maxBatchSize: 2 } },
  {
    name: 'customMap',
    ours: { cache: new Map() },
    ref: { cacheMap: new Map() },
  },
  {
    name: 'keyFn',
    ours: { cacheKeyFn: (k: string) => `K${k[0]}` },
    ref: { cacheKeyFn: (k: string) => `K${k[0]}` },
  },
];

describe('r2-periphery: data-loader differential vs reference dataloader', () => {
  for (const cfg of configs)
    it(`random op sequences agree (${cfg.name})`, async () => {
      const mismatches: string[] = [];
      for (let seed = 1; seed <= 150 && mismatches.length < 1; seed++) {
        const r = rng(seed * 7919);
        const ops = genOps(r, 25);
        const failCalls = new Set<number>();
        for (let i = 0; i < 12; i++) if (r() < 0.15) failCalls.add(i);
        const freshOpts = (o: any) => ({
          ...o,
          ...(o.cache instanceof Map ? { cache: new Map() } : {}),
          ...(o.cacheMap instanceof Map ? { cacheMap: new Map() } : {}),
        });
        const a = await run(
          (fn) => new DataLoader(fn as any, freshOpts(cfg.ours)),
          ops,
          failCalls,
        );
        const b = await run(
          (fn) => {
            const ref = new (RefDataLoader as any)(fn, freshOpts(cfg.ref));
            const prime = ref.prime.bind(ref);
            // v1.4 leaves primed Errors unhandled; pre-handle them.
            ref.prime = (k: any, v: any) => {
              if (!(v instanceof Error)) return prime(k, v);
              const pr = Promise.reject(v);
              pr.catch(() => {});
              return prime(k, pr);
            };
            return ref;
          },
          ops,
          failCalls,
        );
        const sa = JSON.stringify(a);
        const sb = JSON.stringify(b);
        if (sa !== sb)
          mismatches.push(
            `seed ${seed}\nops ${JSON.stringify(ops)}\nfail ${[...failCalls]}\nours ${sa}\nref  ${sb}`,
          );
      }
      expect(mismatches).toEqual([]);
    }, 120000);
});
