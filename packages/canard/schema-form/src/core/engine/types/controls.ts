import type { Dictionary } from '@aileron/declare';

/**
 * Arguments the derive round passes to an authored `injectTo` handler (getInjectToContext).
 * @typeParam Schema - Schema type of the host that authored the handler
 */
export type InjectToContext<Schema> = {
  /** Data path of the source node. */
  dataPath: string;
  /** Authored schema location of the source declaration. */
  schemaPath: string;
  /** Effective schema of the source node. */
  jsonSchema: Schema;
  /** Emitted value of the parent, or null at the root. */
  parentValue: unknown;
  /** Effective schema of the parent, or null at the root. */
  parentJSONSchema: Schema | null;
  /** Emitted value of the root in this round. */
  rootValue: unknown;
  /** Effective schema of the root. */
  rootJSONSchema: Schema;
  /** Form-level context object, or an empty object. */
  context: Dictionary;
};

/** Control keys of a `controls.fields` entry and of a fragment (allOf, then, else, oneOf or anyOf branch). */
export type ChildSchemaControls = {
  /** Existence gate: a boolean or an expression; an inactive node leaves the shape and the output (default: true). */
  active?: boolean | string;
  /** Visibility: a boolean or an expression; a hidden node keeps writing its value (default: true). */
  visible?: boolean | string;
  /** Read-only lock: a boolean or an expression, combined across declarations by OR (default: false). */
  readOnly?: boolean | string;
  /** Disabled lock: a boolean or an expression, combined across declarations by OR (default: false). */
  disabled?: boolean | string;
  /** Value filled when the node appears without one; precedes the standard `default`. */
  default?: unknown;
  /** Expression whose result overwrites the node's value when a dependency changes; `undefined` writes nothing. */
  derived?: string;
  /** Clears the node's value when the boolean or expression turns from false to true. */
  unsetValue?: boolean | string;
  /** Resets `dirty` and `touched` when the boolean or expression turns from false to true. */
  resetInteraction?: boolean | string;
  /** Exit policy: clears the value when the node leaves the shape; a boolean or an expression (default: keep). */
  unsetOnInactive?: boolean | string;
};

/**
 * Controls of a node schema: the child keys plus declarations and cross-node injection.
 * @typeParam Schema - Schema type that `injectTo` receives in its context
 */
export type SchemaControls<Schema> = ChildSchemaControls & {
  /** Controls addressed by name to direct child fields, one hop only. */
  fields?: readonly {
    /** Names of the direct children this entry addresses. */
    targets: readonly string[];
    /** Controls applied to every target. */
    controls?: ChildSchemaControls;
  }[];
  /**
   * Writes other nodes from this node's emitted value when that value changes.
   * Method syntax keeps the parameters bivariant, so a handler typed for a narrower value or schema still fits.
   * @param value - Emitted value of the source node
   * @param context - Paths, schemas and values of the source, its parent and the root
   * @returns A path-to-value map or entry list to write, or nothing
   */
  injectTo?(value: unknown, context: InjectToContext<Schema>): unknown;
  /** Property name whose `const` or `enum` tags select the oneOf or anyOf branch. */
  discriminator?: string;
  /** Dependency paths whose values reach the input as `watchValues`, in order. */
  watch?: readonly string[];
};
