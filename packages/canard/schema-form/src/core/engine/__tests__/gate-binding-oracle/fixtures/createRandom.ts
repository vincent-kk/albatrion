/**
 * A deterministic random source (mulberry32), so a seed names one generated case on every machine.
 * @param seed - Any integer
 * @returns `next` in [0, 1), `int(n)` in [0, n) and `pick` of one element of a non-empty list
 */
export const createRandom = (seed: number) => {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
  const int = (bound: number): number => Math.floor(next() * bound);
  return {
    next,
    int,
    pick: <Item>(items: readonly Item[]): Item => items[int(items.length)],
  };
};

/** The random source a generator draws from. */
export type Random = ReturnType<typeof createRandom>;
