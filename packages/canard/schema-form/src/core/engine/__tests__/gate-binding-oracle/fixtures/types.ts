/** The gate a generated form declares on its host object. */
export type GateKind =
  | 'if-required'
  | 'if-const'
  | 'one-of-active'
  | 'discriminator'
  | 'field-active';

/** Where the gate host sits in the generated form. */
export type GatePosition =
  | 'root'
  | 'nested'
  | 'items'
  | 'prefix-items'
  | 'prefix-then-items'
  | 'shared-ref'
  | 'recursive'
  | 'virtual'
  | 'inactive-at-start';

/** What the selected branch declares for its target (for `field-active`, the field the gate turns on). */
export type GateDeclaration =
  | 'min-length'
  | 'omit-empty'
  | 'omit-trailing-empty'
  | 'nullable'
  | 'extra-property'
  | 'own-gate'
  /** A keyword on the host itself (`required: ['s']`), beside `properties`. */
  | 'host-keyword';

/** What the gate condition reads; a sibling read of an item host reads the item's own field. */
export type GateRead = 'sibling' | 'parent' | 'presence' | 'computed';

/** One public operation of a generated run, applied to the node at a JSON Pointer of the root. */
export type OracleOperation =
  | { kind: 'set'; path: string; value: unknown }
  | { kind: 'push'; path: string; value: unknown }
  | { kind: 'remove'; path: string; index: number }
  | { kind: 'clear'; path: string }
  /** Two writes that exchange the values of positions 0 and 1 of the array at `path`. */
  | { kind: 'swap'; path: string };

/** One step of a generated run: an operation, or two or three operations inside one `root.batch`. */
export type OracleStep =
  | OracleOperation
  | { kind: 'batch'; operations: readonly OracleOperation[] };

/** A generated form and its steps. */
export interface OracleCase {
  /** The seed that generated the case. */
  seed: number;
  /** The stratification class of the pr profile: `<gate>/<position>`. */
  sampleClass: string;
  gate: GateKind;
  position: GatePosition;
  declaration: GateDeclaration;
  read: GateRead;
  /** Whether the condition reads something its own branch changes (see `generateOracleCase`). */
  isCyclic: boolean;
  schema: Record<string, unknown>;
  load: unknown;
  steps: readonly OracleStep[];
}

/** A gate host schema: an object schema whose `properties` the placement extends. */
export type GateHostSchema = Record<string, unknown> & {
  properties: Record<string, unknown>;
};
