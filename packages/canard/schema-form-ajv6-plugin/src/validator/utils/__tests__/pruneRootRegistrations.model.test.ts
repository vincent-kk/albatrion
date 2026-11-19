import AjvConstructor from 'ajv';
import type { Ajv } from 'ajv';
import { expect, it } from 'vitest';

import { pruneRootRegistrations } from '../pruneRootRegistrations';
import type { SchemaRootRegistration } from '../registerSchemaRoot';

type WeakSlot = Pick<WeakRef<SchemaRootRegistration>, 'deref'>;

/** Build detached test registrations; liveness belongs to the independent model set. */
const registration = (source: Ajv, key: string): SchemaRootRegistration => ({
  baseAjv: source,
  key,
  copy: { type: 'string' },
  serialized: '{"type":"string"}',
  ids: [],
  hasDynamicKeywords: false,
  guardChecks: new WeakMap(),
  guards: new Map(),
  guardSchemas: [],
  released: false,
});

it('seeded pruning preserves the independent live set with bounded work and bounded slot backlog', () => {
  const source = new AjvConstructor({
    meta: false,
    validateSchema: false,
    logger: false,
  });
  for (let seed = 0; seed < 2048; seed++) {
    let state = seed + 1;
    const next = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0);
    const ledger: { active: WeakSlot[]; cursor?: number } = { active: [] };
    const live = new Map<string, SchemaRootRegistration>();
    const weakAlive = new Set<string>();
    let reads = 0,
      peak = 0;
    for (let step = 0; step < 64; step++) {
      const drop = next() % 4;
      const entries = [...live.values()];
      const target = entries[next() % entries.length];
      if (target && (drop < 2 || live.size >= 32)) {
        live.delete(target.key);
        if (drop % 2) target.released = true;
        else weakAlive.delete(target.key);
      }
      const context = `seed=${seed} step=${step}`;
      reads = 0;
      pruneRootRegistrations(ledger);
      expect(reads, context).toBeLessThanOrEqual(4);
      const retained = ledger.active.flatMap((reference) => {
        const entry = reference.deref();
        return entry && !entry.released ? [entry.key] : [];
      });
      expect(new Set(retained), context).toEqual(new Set(live.keys()));
      expect(ledger.cursor, context).toBeGreaterThanOrEqual(0);
      expect(ledger.cursor, context).toBeLessThan(
        Math.max(1, ledger.active.length),
      );
      const key = `${seed}:${step}`;
      const entry = registration(source, key);
      weakAlive.add(key);
      live.set(key, entry);
      ledger.active.push({
        deref: () => {
          reads++;
          return weakAlive.has(key) ? entry : undefined;
        },
      });
      peak = Math.max(peak, live.size);
      expect(ledger.active.length, context).toBeLessThanOrEqual(4 * peak + 8);
    }
    for (const entry of live.values()) entry.released = true;
    weakAlive.clear();
    const drainBound = ledger.active.length + 1;
    for (let count = 0; count < drainBound; count++)
      pruneRootRegistrations(ledger);
    expect(ledger.active, `seed=${seed} drained`).toHaveLength(0);
    expect(ledger.cursor, `seed=${seed} empty cursor`).toBe(0);
  }
}, 120000);
