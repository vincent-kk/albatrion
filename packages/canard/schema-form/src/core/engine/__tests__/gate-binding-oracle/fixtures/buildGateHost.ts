import type {
  GateDeclaration,
  GateHostSchema,
  GateKind,
  GateRead,
} from './types';

/** What the selected branch declares, as a `properties` fragment of the host; every fragment states its type, which a gate under an active host needs. */
const DECLARED: Record<GateDeclaration, Record<string, unknown>> = {
  'min-length': { t: { type: 'string', minLength: 3 } },
  'omit-empty': { t: { type: 'string', options: { omitEmpty: false } } },
  'omit-trailing-empty': {
    arr: { type: 'array', options: { omitTrailingEmpty: true } },
  },
  nullable: { t: { type: 'string', nullable: true } },
  'extra-property': { e: { type: 'string' } },
  'own-gate': {
    sub: {
      type: 'object',
      if: { required: ['q'] },
      then: { properties: { r: { type: 'string', minLength: 3 } } },
    },
  },
};

/** The field a `field-active` gate turns on for each declaration. */
const ACTIVE_TARGET: Record<GateDeclaration, string> = {
  'min-length': 't',
  'omit-empty': 't',
  'omit-trailing-empty': 'arr',
  nullable: 't',
  'extra-property': 'e',
  'own-gate': 'sub',
};

/**
 * Build the gate host: an object with the fields every condition and declaration reads, and the gate.
 * @param gate - The gate kind
 * @param declaration - What the selected branch declares, or the field a `field-active` gate turns on
 * @param read - What the condition reads (`if-required` reads presence of `t`, `if-const` and `discriminator` read `s`)
 * @param parentRead - The pointer, relative to the host, that a `parent` read names (`./x` for a host without a parent)
 * @returns The host schema
 */
export const buildGateHost = (
  gate: GateKind,
  declaration: GateDeclaration,
  read: GateRead,
  parentRead: string,
): GateHostSchema => {
  const properties: Record<string, Record<string, unknown>> = {
    s: { type: 'string' },
    t: { type: 'string' },
    arr: { type: 'array', items: { type: 'string' } },
    sub: {
      type: 'object',
      properties: { q: { type: 'string' }, r: { type: 'string' } },
    },
    map: {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    },
    key: { type: 'string' },
  };
  const declared = { properties: DECLARED[declaration] };
  if (gate === 'if-required')
    return {
      type: 'object',
      properties,
      if: { required: ['t'] },
      then: declared,
    };
  if (gate === 'if-const')
    return {
      type: 'object',
      properties,
      if: { properties: { s: { const: '1' } }, required: ['s'] },
      then: declared,
    };
  if (gate === 'discriminator')
    return {
      type: 'object',
      properties,
      controls: { discriminator: 's' },
      oneOf: [
        { properties: { s: { const: '1' }, ...DECLARED[declaration] } },
        { properties: { s: { const: '0' } } },
      ],
    };
  if (gate === 'one-of-active') {
    const condition = readCondition(
      read,
      (name) => `./${name}`,
      parentRead,
      't',
    );
    return {
      type: 'object',
      properties,
      oneOf: [
        { controls: { active: condition }, ...declared },
        { controls: { active: `!(${condition})` }, properties: {} },
      ],
    };
  }
  const target = ACTIVE_TARGET[declaration];
  const fieldParent = parentRead.startsWith('./')
    ? `../${parentRead.slice(2)}`
    : `../${parentRead}`;
  properties[target] = {
    ...(properties[target] ?? { type: 'string' }),
    controls: {
      active: readCondition(read, (name) => `../${name}`, fieldParent, 's'),
    },
  };
  return { type: 'object', properties };
};

/** The expression of an expression gate; `presenceOf` names the field a presence read checks. */
const readCondition = (
  read: GateRead,
  own: (name: string) => string,
  parentRead: string,
  presenceOf: string,
): string => {
  if (read === 'parent') return `${parentRead} === '1'`;
  if (read === 'presence') return `${own(presenceOf)} !== undefined`;
  if (read === 'computed') return `(${own('map')})[(${own('key')})] === '1'`;
  return `${own('s')} === '1'`;
};
