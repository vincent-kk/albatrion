import type { Dictionary, Fn, Nullish } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from './jsonSchema';

/**
 * Handler function type for the `injectTo` schema property.
 *
 * The `injectTo` feature enables cross-node value propagation, allowing a node's value
 * to automatically update other nodes in the form tree when it changes.
 *
 * @template Value - The type of the current node's value
 * @template ParentValue - The type of the parent node's value
 * @template RootValue - The type of the root form value
 * @template Context - The type of the context object (shared form-wide data)
 *
 * @param value - The current value of this node
 * @param context - The {@link InjectHandlerContext} containing node info, parent info,
 *                  root form value, and shared context data
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
 * const handler: InjectToHandler<number> = (value, ctx) => [
 *   ['/calculations/doubled', value * 2],
 *   ['/calculations/total', ctx.rootValue.baseAmount + value],
 * ];
 *
 * // Access parent and root values
 * const handler: InjectToHandler<string> = (value, ctx) => {
 *   // ctx.parentValue is null if this is the root node
 *   if (ctx.parentValue?.locked) return null;
 *   return { '/derived/processed': processValue(value) };
 * };
 *
 * // Using context for conditional injection
 * const handler: InjectToHandler<string> = (value, ctx) => {
 *   if (ctx.context.permissions?.includes('admin')) {
 *     return { '/admin/field': value };
 *   }
 *   return null;
 * };
 * ```
 *
 * @remarks
 * - Paths can be absolute (`/foo/bar`) or relative (`../sibling`, `./child`)
 * - Circular injection is automatically prevented via injectedPaths tracking
 * - Errors during injection are wrapped in JsonSchemaError with 'INJECT_TO' code
 * - When the current node is the root, `ctx.parentValue` and `ctx.parentJsonSchema` are `null`
 *
 * @see {@link InjectHandlerContext} for the context parameter details
 * @see {@link InjectOperation} for the return value format
 */
export type InjectToHandler<
  Value = any,
  ParentValue = any,
  RootValue = any,
  Context extends Dictionary = Dictionary,
> = Fn<
  [
    value: Value,
    context: InjectHandlerContext<ParentValue, RootValue, Context>,
  ],
  InjectOperation | Nullish
>;

/**
 * Context object passed to the `injectTo` handler function.
 *
 * This context provides comprehensive information about the current node,
 * its parent, the root form, and shared form-wide context data.
 *
 * @template ParentValue - The type of the parent node's value
 * @template RootValue - The type of the root form value
 * @template Context - The type of the shared context object
 *
 * @example
 * ```typescript
 * const handler: InjectToHandler<string> = (value, ctx) => {
 *   // Access current node info
 *   console.log(ctx.dataPath);    // '/user/name'
 *   console.log(ctx.schemaPath);  // '/properties/user/properties/name'
 *
 *   // Access parent info (null if this is root node)
 *   if (ctx.parentValue !== null) {
 *     console.log(ctx.parentValue); // { name: 'John', age: 30 }
 *   }
 *
 *   // Access root form value
 *   console.log(ctx.rootValue);   // { user: { name: 'John', age: 30 } }
 *
 *   return { '/derived/fullName': value.toUpperCase() };
 * };
 * ```
 */
export type InjectHandlerContext<
  ParentValue = any,
  RootValue = any,
  Context extends Dictionary = Dictionary,
> = {
  /**
   * The data path of the current node in JSON Pointer format (RFC 6901).
   * Represents the location of this node's value within the form data structure.
   * @example '/user/name', '/items/0/value', '/settings/theme'
   */
  dataPath: string;

  /**
   * The schema path of the current node.
   * Represents the location of this node's schema definition within the JSON Schema.
   * @example '/properties/user/properties/name', '/items/properties/value'
   */
  schemaPath: string;

  /**
   * The JSON Schema definition for the current node.
   * Contains type information, validation rules, and custom extensions.
   */
  jsonSchema: JsonSchemaWithVirtual;

  /**
   * The current value of the parent node.
   *
   * @note This is `null` when the current node is the root node,
   *       since the root node has no parent.
   *
   * @example
   * ```typescript
   * // For a node at '/user/name' with parent at '/user'
   * ctx.parentValue // { name: 'John', age: 30 }
   *
   * // For a root node
   * ctx.parentValue // null
   * ```
   */
  parentValue: ParentValue | null;

  /**
   * The JSON Schema definition of the parent node.
   *
   * @note This is `null` when the current node is the root node,
   *       since the root node has no parent.
   *
   * @example
   * ```typescript
   * // For a node at '/user/name' with parent at '/user'
   * ctx.parentJsonSchema // { type: 'object', properties: { name: {...}, age: {...} } }
   *
   * // For a root node
   * ctx.parentJsonSchema // null
   * ```
   */
  parentJsonSchema: JsonSchemaWithVirtual | null;

  /**
   * The complete value of the root form node.
   * Represents the entire form data structure.
   */
  rootValue: RootValue;

  /**
   * The JSON Schema definition of the root form node.
   * The top-level schema that defines the entire form structure.
   */
  rootJsonSchema: JsonSchemaWithVirtual;

  /**
   * The shared context object containing form-wide data.
   * This is the context value provided to the Form or FormProvider component.
   *
   * @note If no context is provided, this defaults to an empty object `{}`.
   *
   * @example
   * ```typescript
   * // Context set via Form component
   * <Form context={{ userId: '123', permissions: ['read', 'write'] }} ... />
   *
   * // Access in injectTo handler
   * const handler: InjectToHandler = (value, ctx) => {
   *   if (ctx.context.permissions.includes('admin')) {
   *     return { '/admin/field': value };
   *   }
   *   return null;
   * };
   * ```
   */
  context: Context;
};

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
