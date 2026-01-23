import type { Dictionary, Fn, Nullish } from '@aileron/declare';

/**
 * Handler function type for the `injectTo` schema property.
 *
 * The `injectTo` feature enables cross-node value propagation, allowing a node's value
 * to automatically update other nodes in the form tree when it changes.
 *
 * @template Value - The type of the current node's value
 * @template RootValue - The type of the root form value
 * @template Context - The type of the context object (shared form-wide data)
 *
 * @param value - The current value of this node
 * @param rootValue - The complete value of the root form node
 * @param context - The context object containing form-wide shared data
 *
 * @returns An {@link InjectOperation} specifying which nodes to update and with what values,
 *          or `null`/`undefined` to skip injection
 *
 * @example
 * ```typescript
 * // Object syntax: keys are JSON Pointers, values are the data to inject
 * const handler: InjectToHandler<string> = (value) => ({
 *   '/user/fullName': value.toUpperCase(),
 *   '/metadata/lastModified': new Date().toISOString(),
 * });
 *
 * // Array syntax: each entry is [path, value] tuple
 * const handler: InjectToHandler<number> = (value, rootValue) => [
 *   ['/calculations/doubled', value * 2],
 *   ['/calculations/total', rootValue.baseAmount + value],
 * ];
 *
 * // Conditional injection
 * const handler: InjectToHandler<string> = (value) => {
 *   if (!value) return null; // Skip injection
 *   return { '/derived/processed': processValue(value) };
 * };
 * ```
 *
 * @remarks
 * - Paths can be absolute (`/foo/bar`) or relative (`../sibling`, `./child`)
 * - Circular injection is automatically prevented via injectedPaths tracking
 * - Errors during injection are wrapped in JsonSchemaError with 'INJECT_TO' code
 *
 * @see {@link InjectOperation} for the return value format
 */
export type InjectToHandler<
  Value = any,
  RootValue = any,
  Context extends Dictionary = Dictionary,
> = Fn<
  [value: Value, rootValue: RootValue, context: Context],
  InjectOperation | Nullish
>;

/**
 * Specifies the target nodes and values for an injection operation.
 *
 * Can be expressed in two formats:
 * 1. **Object format**: `{ [path: string]: any }` - keys are JSON Pointer paths
 * 2. **Array format**: `Array<[path: string, value: any]>` - array of path-value tuples
 *
 * @example
 * ```typescript
 * // Object format
 * const operation: InjectOperation = {
 *   '/user/name': 'John',
 *   '/user/age': 30,
 * };
 *
 * // Array format (useful when order matters or for dynamic paths)
 * const operation: InjectOperation = [
 *   ['/user/name', 'John'],
 *   ['/user/age', 30],
 * ];
 * ```
 *
 * @remarks
 * - Paths follow JSON Pointer specification (RFC 6901)
 * - Relative paths are resolved from the source node's position
 * - Non-existent target paths are silently ignored
 */
type InjectOperation =
  | { [path: string]: any }
  | Array<[path: string, value: any]>;
