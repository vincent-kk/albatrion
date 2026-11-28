import type { Random } from './createRandom';
import { generateHostValue } from './generateHostValue';
import type { PlacedForm } from './placeGateHost';
import type { OracleOperation, OracleStep } from './types';

/** Values a field write draws from. */
const WRITE_VALUES: readonly unknown[] = [
  '1',
  '0',
  '',
  undefined,
  { a: '1' },
  ['1', ''],
];

/** Host fields a step writes, relative to the host. */
const HOST_FIELDS = ['/s', '/t', '/key', '/sub/q', '/map/a'];

/**
 * Generate 4 to 8 steps: writes, array operations, swaps by two writes, batches of two or three
 * operations, and whole-value replacements at the root.
 * @param random - The seed's random source
 * @param placed - The placed form whose addresses the steps write
 * @param generateLoad - Generates a new whole value for a root replacement
 * @returns The steps, in order
 */
export const generateOracleSteps = (
  random: Random,
  placed: PlacedForm,
  generateLoad: () => unknown,
): OracleStep[] => {
  const arrays = [
    ...placed.hostArrays,
    ...placed.hostPaths.map((path) => `${path}/arr`),
  ];
  const operation = (): OracleOperation => {
    const host = random.pick(placed.hostPaths);
    const array = random.pick(arrays);
    const draw = random.int(10);
    if (draw < 4)
      return {
        kind: 'set',
        path: host + random.pick(HOST_FIELDS),
        value: random.pick(WRITE_VALUES),
      };
    if (draw === 4 && host !== '')
      return { kind: 'set', path: host, value: generateHostValue(random) };
    if (draw === 5)
      return {
        kind: 'push',
        path: array,
        value: placed.hostArrays.includes(array)
          ? generateHostValue(random)
          : random.pick(['1', '']),
      };
    if (draw === 6)
      return { kind: 'remove', path: array, index: random.int(2) };
    if (draw === 7) return { kind: 'clear', path: array };
    if (draw === 8 || placed.extraWrites.length === 0)
      return { kind: 'swap', path: array };
    const extra = random.pick(placed.extraWrites);
    return { kind: 'set', path: extra.path, value: random.pick(extra.values) };
  };
  return Array.from({ length: 4 + random.int(5) }, (): OracleStep => {
    const draw = random.int(10);
    if (draw < 2)
      return {
        kind: 'batch',
        operations: Array.from({ length: 2 + random.int(2) }, operation),
      };
    if (draw === 2) return { kind: 'set', path: '', value: generateLoad() };
    return operation();
  });
};
