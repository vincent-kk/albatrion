import { getObjectKeys } from '@winglet/common-utils/object';

/** Renderer-neutral reserved vocabulary; all runtime key enumerations derive from this table. */
export const RESERVED_SCHEMA_KEYS = {
  controls: {
    active: { shallow: 'boolean | string', child: true, expression: 0 },
    visible: {
      shallow: 'boolean | string',
      child: true,
      expression: 1,
      state: 0,
      stateInitial: true,
    },
    readOnly: {
      shallow: 'boolean | string',
      child: true,
      expression: 2,
      state: 1,
      stateInitial: false,
    },
    disabled: {
      shallow: 'boolean | string',
      child: true,
      expression: 3,
      state: 2,
      stateInitial: false,
    },
    default: { shallow: 'unknown', child: true, hint: 1 },
    derived: {
      shallow: 'string',
      child: true,
      expression: 5,
      derive: 0,
      writeRank: 3,
    },
    unsetValue: {
      shallow: 'boolean | string',
      child: true,
      expression: 6,
      derive: 1,
      writeRank: 4,
    },
    resetInteraction: {
      shallow: 'boolean | string',
      child: true,
      expression: 7,
      derive: 2,
    },
    unsetOnInactive: {
      shallow: 'boolean | string',
      child: true,
      expression: 4,
    },
    inactiveValue: { shallow: 'unknown', child: true },
    fields: { shallow: 'array', child: false },
    injectTo: { shallow: 'function', child: false, derive: 3, writeRank: 2 },
    discriminator: { shallow: 'string', child: false },
    watch: { shallow: 'string | string[]', child: false, hint: 0 },
  },
  options: {
    terminal: { shallow: 'boolean' },
    virtual: { shallow: 'object', omitFromEffective: true },
    propertyOrder: { shallow: 'string[]' },
    omitEmpty: { shallow: 'boolean' },
    omitTrailing: { shallow: 'boolean' },
    trim: { shallow: 'boolean' },
  },
  presentation: {
    inputType: { shallow: 'string', inputHint: true },
    FieldInput: { shallow: 'function | object | null' },
    FieldInputProps: { shallow: 'object' },
    FieldRendererProps: { shallow: 'object' },
    errorMessages: { shallow: 'object' },
  },
} as const;

/** Rules belonging to the closed controls group. */
type ControlRules = typeof RESERVED_SCHEMA_KEYS.controls;
/** Names selected by a rule's semantic role, without repeating a key union. */
type RoleKeys<Rules, Role extends PropertyKey> = {
  [Key in keyof Rules]: Rules[Key] extends Record<Role, number | true>
    ? Key
    : never;
}[keyof Rules];
/** Accepted shallow contracts, derived from the declaration instead of a second list. */
export type ReservedShallowType = {
  [Group in keyof typeof RESERVED_SCHEMA_KEYS]: (typeof RESERVED_SCHEMA_KEYS)[Group][keyof (typeof RESERVED_SCHEMA_KEYS)[Group]] extends {
    shallow: infer Shape;
  }
    ? Shape
    : never;
}[keyof typeof RESERVED_SCHEMA_KEYS];

/** Fixed node-control traversal order, allocated once at module initialization. */
export const RESERVED_CONTROL_KEYS = getObjectKeys(
  RESERVED_SCHEMA_KEYS.controls,
);
/** Child/fragment controls share one scope flag in the canonical declaration. */
export const CHILD_CONTROL_KEYS = RESERVED_CONTROL_KEYS.filter(
  (key): key is RoleKeys<ControlRules, 'child'> =>
    RESERVED_SCHEMA_KEYS.controls[key].child,
);
/** Preserve authored expression compilation order independently of object property order. */
export const EXPRESSION_CONTROL_KEYS = RESERVED_CONTROL_KEYS.filter(
  (key): key is RoleKeys<ControlRules, 'expression'> =>
    'expression' in RESERVED_SCHEMA_KEYS.controls[key],
).sort(
  (left, right) =>
    RESERVED_SCHEMA_KEYS.controls[left].expression -
    RESERVED_SCHEMA_KEYS.controls[right].expression,
);
/** Derive rule order is stable across key-table refactors. */
export const DERIVE_CONTROL_KEYS = RESERVED_CONTROL_KEYS.filter(
  (key): key is RoleKeys<ControlRules, 'derive'> =>
    'derive' in RESERVED_SCHEMA_KEYS.controls[key],
).sort(
  (left, right) =>
    RESERVED_SCHEMA_KEYS.controls[left].derive -
    RESERVED_SCHEMA_KEYS.controls[right].derive,
);
/** Rules that produce value writes, separate from interaction-only rules. */
export const WRITE_CONTROL_KEYS = DERIVE_CONTROL_KEYS.filter(
  (key): key is RoleKeys<ControlRules, 'writeRank'> =>
    'writeRank' in RESERVED_SCHEMA_KEYS.controls[key],
);
/** State combination keys selected by their role. */
export const STATE_CONTROL_KEYS = RESERVED_CONTROL_KEYS.filter(
  (key): key is RoleKeys<ControlRules, 'state'> =>
    'state' in RESERVED_SCHEMA_KEYS.controls[key],
).sort(
  (left, right) =>
    RESERVED_SCHEMA_KEYS.controls[left].state -
    RESERVED_SCHEMA_KEYS.controls[right].state,
);
/** Only single-value control hints participate in effective-schema merging. */
export const HINT_CONTROL_KEYS = RESERVED_CONTROL_KEYS.filter(
  (key): key is RoleKeys<ControlRules, 'hint'> =>
    'hint' in RESERVED_SCHEMA_KEYS.controls[key],
).sort(
  (left, right) =>
    RESERVED_SCHEMA_KEYS.controls[left].hint -
    RESERVED_SCHEMA_KEYS.controls[right].hint,
);
/** Reserved option names used by shallow validation and terminal warnings. */
export const RESERVED_OPTION_KEYS = getObjectKeys(RESERVED_SCHEMA_KEYS.options);
/** Declaration-only options are excluded from effective-schema hints. */
export const DECLARATION_OPTION_KEYS = RESERVED_OPTION_KEYS.filter(
  (key) => 'omitFromEffective' in RESERVED_SCHEMA_KEYS.options[key],
);
/** Reserved presentation envelopes, without binding dependencies. */
export const RESERVED_PRESENTATION_KEYS = getObjectKeys(
  RESERVED_SCHEMA_KEYS.presentation,
);
/** Presentation values that participate in input-definition hint matching. */
export const PRESENTATION_HINT_KEYS = RESERVED_PRESENTATION_KEYS.filter(
  (
    key,
  ): key is RoleKeys<typeof RESERVED_SCHEMA_KEYS.presentation, 'inputHint'> =>
    'inputHint' in RESERVED_SCHEMA_KEYS.presentation[key],
);
/** Self-valued control names retain property completion without another key declaration. */
export const CONTROL_KEY = createKeyMirror(RESERVED_CONTROL_KEYS);
/** Form-only group names derive from the same vocabulary. */
export const SCHEMA_GROUP = createKeyMirror(
  getObjectKeys(RESERVED_SCHEMA_KEYS),
);

/**
 * Preserve key/value identity while constructing module-level vocabulary views.
 * @param keys - Complete canonical key list, with no independently authored names.
 * @returns Each supplied key mapped to itself.
 */
function createKeyMirror<Key extends string>(keys: readonly Key[]) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- fromEntries erases key/value identity; every canonical key is emitted exactly once as both name and value.
  return Object.fromEntries(keys.map((key) => [key, key])) as {
    readonly [Name in Key]: Name;
  };
}
