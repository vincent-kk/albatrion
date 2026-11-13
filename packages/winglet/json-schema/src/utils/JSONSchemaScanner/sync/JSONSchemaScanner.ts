import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JSONScannerOptions, SchemaVisitor } from '../type';
import { ScanEngine } from '../utils/engine/ScanEngine';
import type { ScanConfig } from '../utils/engine/type';
import { ScanOutput } from '../utils/output/ScanOutput';
import { buildKeywordMap } from '../utils/vocabulary/buildKeywordMap';
import {
  DEFAULT_KEYWORDS,
  DEFAULT_KEYWORD_MAP,
} from '../utils/vocabulary/defaultKeywords';

interface JSONSchemaScannerProps<Schema extends UnknownSchema, ContextType> {
  visitor?: SchemaVisitor<Schema, ContextType>;
  options?: JSONScannerOptions<Schema, ContextType>;
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
 * import { JSONSchemaScanner } from '@winglet/json-schema';
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
 * const scanner = new JSONSchemaScanner({
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
 * const transformScanner = new JSONSchemaScanner({
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
 * const resolverScanner = new JSONSchemaScanner({
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
 * const analysisScanner = new JSONSchemaScanner<AnalysisContext>({
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
 * a shared resumable direct-call core. Each node is visited once — filtering, mutation,
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
export class JSONSchemaScanner<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Visitor object: contains callback functions to be executed when entering/exiting schema nodes. */
  private readonly __visitor__: SchemaVisitor<Schema, ContextType>;
  /** Scan options: includes maximum traversal depth, filtering functions, reference resolution functions, etc. */
  private readonly __options__: JSONScannerOptions<Schema, ContextType>;
  /** Shared operation ledger, lifecycle guard and lazy output cache. */
  private readonly __output__ = new ScanOutput();

  /**
   * Creates a JSONSchemaScanner instance.
   * @param {JSONSchemaScannerProps<ContextType>} [props] - Scanner configuration (visitor, options).
   */
  constructor(props?: JSONSchemaScannerProps<Schema, ContextType>) {
    this.__visitor__ = props?.visitor || {};
    this.__options__ = props?.options || {};
  }

  /**
   * Scans the given JSON schema and updates internal state.
   * Executes visitor hooks and collects resolved reference information in the shared output ledger.
   *
   * @param {Schema} schema - The JSON schema object to scan.
   * @returns {this} The current JSONSchemaScanner instance (allows method chaining).
   */
  public scan(this: this, schema: Schema | boolean): this {
    this.__output__.begin(schema);
    try {
      this.__run__(schema);
      this.__output__.finish();
    } catch (error) {
      this.__output__.reset();
      throw error;
    }
    return this;
  }

  /**
   * Returns the final schema with scanning and reference resolution completed.
   *
   * On first call: Applies recorded output operations without writing to caller-owned values
   * and caches the result independently of its truthiness.
   * From second call onwards: Returns the cached final schema.
   *
   * @template OutputSchema - The expected output schema type. Defaults to the class-level Schema type.
   *   Use this to narrow or widen the return type when the processed schema structure differs from input.
   * @returns The processed final schema typed as `OutputSchema`.
   *   Returns `undefined` if called before scanning.
   *   Returns the original schema if no output operation was recorded.
   *   Otherwise returns copied output; opted-out, unchanged resolver targets retain their aliases.
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
  public getValue<
    OutputSchema extends UnknownSchema | boolean = Schema | boolean,
  >(this: this): OutputSchema | undefined {
    return this.__output__.getValue() as OutputSchema | undefined;
  }

  /**
   * Run the shared direct-call machine with this driver's waiting policy.
   * @param schema Root schema to traverse; callback errors propagate to scan's state reset.
   * @returns Nothing once traversal completes synchronously.
   */
  private __run__(this: this, schema: Schema | boolean): void {
    const options = this.__options__;
    const visitor = this.__visitor__;
    const context = options.context;
    const config: ScanConfig<Schema, ContextType> = {
      context,
      maxDepth: options.maxDepth,
      cloneResolvedSchema: options.cloneResolvedSchema !== false,
      cacheResolvedReference: options.cacheResolvedReference === true,
      defaultDialect: options.defaultDialect,
      keywordMap:
        options.keywords !== undefined ||
        options.additionalKeywords !== undefined
          ? buildKeywordMap(
              (options.keywords ?? DEFAULT_KEYWORDS).concat(
                options.additionalKeywords ?? [],
              ),
            )
          : DEFAULT_KEYWORD_MAP,
      operations: this.__output__.operations,
      filter: options.filter,
      mutate: options.mutate,
      enter: visitor.enter,
      exit: visitor.exit,
      resolveReference: options.resolveReference,
    };

    new ScanEngine(schema, config, false).run();
  }
}
