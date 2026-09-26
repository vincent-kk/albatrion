/**
 * M5 — picking the active `oneOf` branch: calling the validator on each whole
 * branch until one passes (the approach RJSF used before its discriminator
 * optimization), versus reading a `const` discriminator directly.
 *
 * Measured at the matching index 0 / middle / last, because the scan approach
 * is linear in that index and the direct read is not.
 */
import { ajvGuard, cfGuard, environment, measure, pool, writeResult } from './lib.mjs';

const BRANCH_COUNTS = [5, 20, 50];

/** One `oneOf` branch: a discriminator plus a handful of ordinary fields. */
const branchSchema = (i) => ({
  type: 'object',
  properties: {
    kind: { const: `b${i}` },
    f1: { type: 'string' },
    f2: { type: 'number' },
    f3: { type: 'boolean' },
    f4: { type: 'string', minLength: 1 },
  },
  required: ['kind', 'f1', 'f2'],
});

/** A value belonging to branch `m`. */
const makeValue = (m) => ({ kind: `b${m}`, f1: 'text', f2: 42, f3: true, f4: 'x' });

const rows = [];

for (const k of BRANCH_COUNTS) {
  const schemas = Array.from({ length: k }, (_, i) => branchSchema(i));
  const index = new Map(schemas.map((_, i) => [`b${i}`, i]));
  const consts = schemas.map((_, i) => `b${i}`);

  for (const matchAt of [0, k >> 1, k - 1]) {
    const values = pool(() => makeValue(matchAt));
    const mask = values.length - 1;

    const mechanisms = {};
    for (const [validator, compile] of [['ajv', ajvGuard], ['cfworker', cfGuard]]) {
      const fns = schemas.map(compile);
      mechanisms[`scan branches (${validator})`] = (n) => {
        let checksum = 0;
        for (let w = 0; w < n; w++) {
          const value = values[w & mask];
          for (let b = 0; b < fns.length; b++) {
            if (fns[b](value)) {
              checksum += b;
              break;
            }
          }
        }
        return checksum;
      };
    }

    mechanisms['discriminator Map.get'] = (n) => {
      let checksum = 0;
      for (let w = 0; w < n; w++) checksum += index.get(values[w & mask].kind);
      return checksum;
    };

    mechanisms['discriminator linear ==='] = (n) => {
      let checksum = 0;
      for (let w = 0; w < n; w++) {
        const kind = values[w & mask].kind;
        for (let b = 0; b < consts.length; b++) {
          if (consts[b] === kind) {
            checksum += b;
            break;
          }
        }
      }
      return checksum;
    };

    for (const [mechanism, loop] of Object.entries(mechanisms)) {
      const stats = measure(loop);
      rows.push({
        k,
        matchAt,
        position: matchAt === 0 ? 'first' : matchAt === k - 1 ? 'last' : 'middle',
        mechanism,
        usPerWrite: stats.medianNs / 1000,
        ...stats,
      });
      process.stderr.write(
        `K=${k} match@${matchAt} ${mechanism}: ${(stats.medianNs / 1000).toFixed(3)}us\n`,
      );
    }
  }
}

console.log(writeResult('m5', { environment: environment(), rows }));
