import { describe, expect, it } from 'vitest';

import { formatSegment } from '../../helpers/jsonPointer';
import { resolveFieldIdentifiers } from '../../helpers/fieldId/resolveFieldIdentifiers';

// Probe for r5-ids: IN3 and RG3, seeded search for two distinct (scope, path, key) inputs
// that produce one identifier. Verification level: internal fixture (the one resolver).

/** Mulberry32: small deterministic generator. */
const random = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const ALPHABET = [
  'a', 'b', '0', '1', '-', '.', ':', '~', '/', ' ', '\t', '\n', 'u', 'i',
  'n', 'p', 't', 'l', 'e', '%', '\u0000', '\u007f', ' ', '\ud800',
  '\udc00', '😀', '~0', '~1', '~u0020', '~input', '~label',
];

const word = (next: () => number, max: number) => {
  let result = '';
  const length = Math.floor(next() * max);
  for (let index = 0; index < length; index++)
    result += ALPHABET[Math.floor(next() * ALPHABET.length)];
  return result;
};

describe('resolver injectivity over generated scopes, paths and keys', () => {
  it('no two distinct addresses share an identifier', () => {
    const next = random(20261120);
    const seen = new Map<string, string>();
    const collisions: string[] = [];
    const scopes = ['_r_1_', ':r1:', '_r_1_:', formatSegment('app~2:r1'), formatSegment('a/b')];
    for (let round = 0; round < 4000; round++) {
      const scope = scopes[Math.floor(next() * scopes.length)];
      const depth = 1 + Math.floor(next() * 3);
      let path = '';
      for (let level = 0; level < depth; level++)
        path += '/' + formatSegment(word(next, 4));
      const ids = resolveFieldIdentifiers(scope, path);
      const keyText = word(next, 4);
      const numeric = Math.floor(next() * 4) - 1;
      const entries: [string, string][] = [
        [ids.inputId, `${scope}|${path}|input`],
        [ids.labelId, `${scope}|${path}|label`],
        [ids.getInputId(keyText), `${scope}|${path}|key:${keyText}`],
        [ids.getInputId(numeric), `${scope}|${path}|key:${String(numeric)}`],
      ];
      for (const [id, address] of entries) {
        const previous = seen.get(id);
        if (previous !== undefined && previous !== address)
          collisions.push(`${JSON.stringify(id)} <- ${JSON.stringify(previous)} and ${JSON.stringify(address)}`);
        seen.set(id, address);
      }
    }
    expect(collisions.slice(0, 5)).toEqual([]);
  });
});
