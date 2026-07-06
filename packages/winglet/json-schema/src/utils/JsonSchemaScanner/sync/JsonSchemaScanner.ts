import { clone } from '@winglet/common-utils/object';
import { setValue } from '@winglet/json/pointer';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JsonScannerOptions, SchemaVisitor } from '../type';
import { DEFAULT_KEYWORDS } from '../utils/keywordDescriptors';
import { Effect, type ScanConfig, scanCore } from '../utils/scanCore';

interface JsonSchemaScannerProps<Schema extends UnknownSchema, ContextType> {
  visitor?: SchemaVisitor<Schema, ContextType>;
  options?: JsonScannerOptions<Schema, ContextType>;
}

/**
 * A powerful JSON Schema traversal engine that implements depth-first search (DFS)
 * with the Visitor pattern for comprehensive schema analysis and transformation.
 *
 * Provides sophisticated features including $ref reference resolution, circular
 * reference detection, schema mutation, filtering, and depth-limited traversal.
 * The scanner processes schemas in phases (Enter → Reference → ChildEntries → Exit)
 * and maintains internal state for efficient processing and result caching.
 *
 * @template ContextType - Custom context type passed to visitors and processors
 *
 * @example
 * Basic schema traversal with visitor pattern:
 * ```typescript
 * import { JsonSchemaScanner } from '@winglet/json-schema';
 *
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', minLength: 1 },
 *     age: { type: 'number', minimum: 0 },
 *     address: {
 *       $ref: '#/definitions/Address'
 *     }
 *   },
 *   definitions: {
 *     Address: {
 *       type: 'object',
 *       properties: {
 *         street: { type: 'string' },
 *         city: { type: 'string' }
 *       }
 *     }
 *   }
 * };
 *
 * const scanner = new JsonSchemaScanner({
 *   visitor: {
 *     enter: (entry) => {
 *       console.log(`Entering: ${entry.path} (${entry.schema.type})`);
 *     },
 *     exit: (entry) => {
 *       console.log(`Exiting: ${entry.path}`);
 *     }
 *   },
 *   options: {
 *     maxDepth: 10
 *   }
 * });
 *
 * const processedSchema = scanner.scan(schema).getValue();
 * ```
 *
 * @example
 * Schema transformation with mutation:
 * ```typescript
 * import { isStringSchema } from '@winglet/json-schema/filter';
 *
 * const transformScanner = new JsonSchemaScanner({
 *   options: {
 *     mutate: (entry) => {
 *       // Add default titles to string fields (handles both nullable and non-nullable)
 *       if (isStringSchema(entry.schema) && !entry.schema.title) {
 *         return {
 *           ...entry.schema,
 *           title: `Field at ${entry.dataPath}`
 *         };
 *       }
 *     }
 *   }
 * });
 *
 * const enhancedSchema = transformScanner.scan(originalSchema).getValue();
 * ```
 *
 * @example
 * Reference resolution with custom resolver:
 * ```typescript
 * const definitions = {
 *   '/schemas/user.json': { type: 'object', properties: { id: { type: 'string' } } },
 *   '/schemas/address.json': { type: 'object', properties: { city: { type: 'string' } } }
 * };
 *
 * const resolverScanner = new JsonSchemaScanner({
 *   options: {
 *     resolveReference: (refPath) => {
 *       return definitions[refPath];
 *     },
 *     context: { resolveCount: 0 }
 *   },
 *   visitor: {
 *     enter: (entry, context) => {
 *       if (entry.referenceResolved) {
 *         context.resolveCount++;
 *       }
 *     }
 *   }
 * });
 *
 * const resolvedSchema = resolverScanner.scan(schemaWithRefs).getValue();
 * ```
 *
 * @example
 * Conditional processing with filtering:
 * ```typescript
 * import { isStringSchema, isObjectSchema } from '@winglet/json-schema/filter';
 *
 * interface AnalysisContext {
 *   stringFieldCount: number;
 *   objectFieldCount: number;
 * }
 *
 * const analysisScanner = new JsonSchemaScanner<AnalysisContext>({
 *   options: {
 *     filter: (entry) => {
 *       // Only process non-definition schemas
 *       return !entry.path.includes('/definitions/');
 *     },
 *     context: { stringFieldCount: 0, objectFieldCount: 0 }
 *   },
 *   visitor: {
 *     enter: (entry, context) => {
 *       // Use filter functions to handle both nullable and non-nullable types
 *       if (isStringSchema(entry.schema)) context.stringFieldCount++;
 *       if (isObjectSchema(entry.schema)) context.objectFieldCount++;
 *     }
 *   }
 * });
 *
 * analysisScanner.scan(complexSchema);
 * const stats = analysisScanner.options.context;
 * console.log(`Found ${stats.stringFieldCount} string fields, ${stats.objectFieldCount} objects`);
 * ```
 *
 * @example
 * Built-in reference resolution utility:
 * ```typescript
 * import { resolveReference } from '@winglet/json-schema';
 *
 * const schemaWithInternalRefs = {
 *   type: 'object',
 *   properties: {
 *     user: { $ref: '#/definitions/User' },
 *     admin: { $ref: '#/definitions/User' }
 *   },
 *   definitions: {
 *     User: { type: 'object', properties: { name: { type: 'string' } } }
 *   }
 * };
 *
 * // Inline all internal $ref references in one call
 * const fullyResolvedSchema = resolveReference(schemaWithInternalRefs);
 * ```
 *
 * @remarks
 * **Traversal:** A single stack-based (non-recursive) depth-first pass driven by
 * a shared generator core. Each node is visited once — filtering, mutation,
 * `enter`, `$ref` resolution and child discovery are fused — and revisited once
 * on exit only if it has children. The sync scanner runs the core to completion
 * synchronously; the async scanner awaits callbacks that return thenables.
 *
 * **Key Features:**
 * - **Circular Reference Detection**: Prevents infinite loops when schemas reference each other
 * - **Lazy Reference Resolution**: References are resolved only when encountered
 * - **Reference Isolation**: resolved subtrees are cloned at inline time
 *   (`cloneResolvedSchema`, default `true`) so the original schema is never
 *   mutated and repeated `$ref`s are never aliased in the output
 * - **Schema Mutation**: Transform schemas during traversal
 * - **Filtering**: Skip unwanted schema nodes
 * - **Depth Limiting**: Control traversal depth for performance
 *
 * **Performance Considerations:**
 * - Stack-based traversal (not recursion) handles arbitrarily deep schemas
 * - The processed schema is built once, on first `getValue`, and cached
 * - Optional resolver memoization (`cacheResolvedReference`, default `false`)
 *   avoids redundant resolver calls when the same reference appears repeatedly
 *
 * This scanner is ideal for complex schema analysis, transformation,
 * documentation generation, form building, and validation preprocessing.
 */
export class JsonSchemaScanner<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Visitor object: contains callback functions to be executed when entering/exiting schema nodes. */
  private readonly __visitor__: SchemaVisitor<Schema, ContextType>;
  /** Scan options: includes maximum traversal depth, filtering functions, reference resolution functions, etc. */
  private readonly __options__: JsonScannerOptions<Schema, ContextType>;
  /** Original JSON schema passed to the `scan` method. */
  private __originalSchema__: UnknownSchema | undefined;
  /** Final schema with references resolved. Computed on first call to `getValue`. */
  private __processedSchema__: UnknownSchema | undefined;
  /** Array of references resolved during `__run__` execution but not yet applied to the final schema ([path, resolved schema]). */
  private __resolves__: Array<[path: string, schema: UnknownSchema]> = [];

  /**
   * Creates a JsonSchemaScanner instance.
   * @param {JsonSchemaScannerProps<ContextType>} [props] - Scanner configuration (visitor, options).
   */
  constructor(props?: JsonSchemaScannerProps<Schema, ContextType>) {
    this.__visitor__ = props?.visitor || {};
    this.__options__ = props?.options || {};
  }

  /**
   * Scans the given JSON schema and updates internal state.
   * Executes visitor hooks and collects resolved reference information to store in `__resolves__`.
   *
   * @param {Schema} schema - The JSON schema object to scan.
   * @returns {this} The current JsonSchemaScanner instance (allows method chaining).
   */
  public scan(this: this, schema: Schema): this {
    this.__originalSchema__ = schema;
    this.__processedSchema__ = undefined;
    this.__resolves__ = [];
    try {
      this.__run__(this.__originalSchema__ as Schema);
    } catch (error) {
      // Reset state so a failed scan cannot report partial results.
      // The exception itself still propagates to the caller (current behavior).
      this.__originalSchema__ = undefined;
      this.__processedSchema__ = undefined;
      this.__resolves__ = [];
      throw error;
    }
    return this;
  }

  /**
   * Returns the final schema with scanning and reference resolution completed.
   *
   * On first call: Applies references stored in `__resolves__` to a deep copy of the original schema
   * to create the final schema and cache it.
   * From second call onwards: Returns the cached final schema.
   *
   * @template OutputSchema - The expected output schema type. Defaults to the class-level Schema type.
   *   Use this to narrow or widen the return type when the processed schema structure differs from input.
   * @returns The processed final schema typed as `OutputSchema`.
   *   Returns `undefined` if called before scanning.
   *   Returns a reference to the original schema if no references were resolved,
   *   otherwise returns a deep copy with all `$ref` references inlined.
   *
   * @example
   * ```typescript
   * // Default: returns same type as input schema
   * const result = scanner.scan(mySchema).getValue();
   *
   * // Explicit type narrowing for processed schema
   * const result = scanner.scan(mySchema).getValue<ResolvedSchema>();
   * ```
   */
  public getValue<OutputSchema extends UnknownSchema = Schema>(
    this: this,
  ): OutputSchema | undefined {
    if (!this.__originalSchema__) return undefined;
    if (this.__processedSchema__)
      return this.__processedSchema__ as OutputSchema;
    const resolves = this.__resolves__;
    const resolvesLength = resolves.length;
    if (resolvesLength === 0) {
      this.__processedSchema__ = this.__originalSchema__;
      return this.__processedSchema__ as OutputSchema;
    }
    let processedSchema = clone(this.__originalSchema__);
    for (let i = 0; i < resolvesLength; i++) {
      const [path, resolvedSchema] = resolves[i];
      processedSchema = setValue(processedSchema, path, resolvedSchema);
    }
    this.__resolves__ = [];
    this.__processedSchema__ = processedSchema;
    return processedSchema as OutputSchema;
  }

  /**
   * Internal logic that traverses the schema using depth-first search (DFS) and resolves references.
   *
   * Drives the shared {@link scanCore} generator synchronously: every time the
   * core needs a user callback it yields a request, which this driver executes
   * immediately (no awaiting) and feeds the result back into the generator.
   *
   * @param {Schema} schema - The schema node to start traversal from.
   * @private
   */
  private __run__(this: this, schema: Schema): void {
    const options = this.__options__;
    const visitor = this.__visitor__;
    const context = options.context;
    const config: ScanConfig<Schema, ContextType> = {
      context,
      maxDepth: options.maxDepth,
      cloneResolvedSchema: options.cloneResolvedSchema !== false,
      cacheResolvedReference: options.cacheResolvedReference === true,
      keywords: options.additionalKeywords
        ? DEFAULT_KEYWORDS.concat(options.additionalKeywords)
        : DEFAULT_KEYWORDS,
      resolves: this.__resolves__,
      filter: options.filter,
      mutate: options.mutate,
      enter: visitor.enter,
      exit: visitor.exit,
      resolveReference: options.resolveReference,
    };

    const generator = scanCore<Schema, ContextType>(schema, config);
    let step = generator.next();
    while (!step.done) {
      const request = step.value;
      let result: unknown;
      switch (request.type) {
        case Effect.Filter:
          result = config.filter!(request.entry, context);
          break;
        case Effect.Mutate:
          result = config.mutate!(request.entry, context);
          break;
        case Effect.Enter:
          config.enter!(request.entry, context);
          result = undefined;
          break;
        case Effect.Resolve:
          result = config.resolveReference!(
            request.reference,
            request.entry,
            context,
          );
          break;
        case Effect.Exit:
          config.exit!(request.entry, context);
          result = undefined;
          break;
      }
      step = generator.next(result);
    }
  }
}
