import { buildGateHost } from './buildGateHost';
import { createRandom } from './createRandom';
import { generateOracleSteps } from './generateOracleSteps';
import { PARENT_READ, placeGateHost } from './placeGateHost';
import type {
  GateDeclaration,
  GateKind,
  GatePosition,
  GateRead,
  OracleCase,
} from './types';

/** Every gate kind, in draw order. */
export const GATE_KINDS: readonly GateKind[] = [
  'if-required',
  'if-const',
  'one-of-active',
  'discriminator',
  'field-active',
];

/** Every gate position, in draw order. */
export const GATE_POSITIONS: readonly GatePosition[] = [
  'root',
  'nested',
  'items',
  'prefix-items',
  'prefix-then-items',
  'shared-ref',
  'recursive',
  'virtual',
  'inactive-at-start',
];

/** Every declaration of the selected branch, in draw order. */
const DECLARATIONS: readonly GateDeclaration[] = [
  'min-length',
  'omit-empty',
  'omit-trailing-empty',
  'nullable',
  'extra-property',
  'own-gate',
];

/** Reads an expression gate draws from; `if-required` reads presence, `if-const` and `discriminator` a sibling. */
const EXPRESSION_READS: readonly GateRead[] = [
  'sibling',
  'parent',
  'presence',
  'computed',
];

/**
 * Generate the form and steps of one seed. The gate and the position are the first two draws, so
 * the stratification class is known before the rest. A form is cyclic when its condition reads the
 * presence of the field its branch changes in a way presence can see: `omitEmpty: false` keeps an
 * empty value in the output, `nullable` admits a `null` the base type refuses. Every other form
 * reads only fields its branch leaves alone and is one-direction.
 * @param seed - Any positive integer
 * @returns The generated case
 */
export const generateOracleCase = (seed: number): OracleCase => {
  const random = createRandom(seed);
  const gate = random.pick(GATE_KINDS);
  const position = random.pick(GATE_POSITIONS);
  const declaration = random.pick(DECLARATIONS);
  const read: GateRead =
    gate === 'if-required'
      ? 'presence'
      : gate === 'if-const' || gate === 'discriminator'
        ? 'sibling'
        : random.pick(EXPRESSION_READS);
  const host = buildGateHost(gate, declaration, read, PARENT_READ[position]);
  const placed = placeGateHost(position, host, random);
  const steps = generateOracleSteps(
    random,
    placed,
    () => placeGateHost(position, host, random).load,
  );
  return {
    seed,
    sampleClass: `${gate}/${position}`,
    gate,
    position,
    declaration,
    read,
    isCyclic:
      read === 'presence' &&
      (gate === 'if-required' || gate === 'one-of-active') &&
      (declaration === 'omit-empty' || declaration === 'nullable'),
    schema: placed.schema,
    load: placed.load,
    steps,
  };
};
