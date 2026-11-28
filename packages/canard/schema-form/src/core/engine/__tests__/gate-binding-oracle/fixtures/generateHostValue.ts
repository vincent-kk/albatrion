import type { Random } from './createRandom';

/**
 * Generate one host value; each field except `map` and `key`, which a computed read indexes, is present three times in four, and no schema holds a default.
 * @param random - The seed's random source
 * @returns A fresh host value
 */
export const generateHostValue = (random: Random): Record<string, unknown> => {
  const fields: Record<string, unknown> = {
    s: random.pick(['1', '0', '']),
    t: random.pick(['x', '', 'abc']),
    arr: random.pick([['a', ''], ['a'], []]),
    sub: random.pick([{ q: '1', r: 'ab' }, { r: 'ab' }, {}]),
    map: { a: random.pick(['1', '0']), b: random.pick(['1', '0']) },
    key: random.pick(['a', 'b']),
  };
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([name]) => name === 'map' || name === 'key' || random.next() < 0.75,
    ),
  );
};
