import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JSONScannerOptionsAsync, SchemaVisitor } from '../type';
import { ScanEngine } from '../utils/engine/ScanEngine';
import type { ScanConfig } from '../utils/engine/type';
import {
  DEFAULT_KEYWORDS,
  DEFAULT_KEYWORD_MAP,
  buildKeywordMap,
} from '../utils/keywordDescriptors';
import { ScanOutput } from '../utils/output/ScanOutput';

interface JSONSchemaScannerProps<Schema extends UnknownSchema, ContextType> {
  visitor?: SchemaVisitor<Schema, ContextType>;
  options?: JSONScannerOptionsAsync<Schema, ContextType>;
}

/**
 * An advanced asynchronous JSON Schema traversal engine with comprehensive
 * async support for remote reference resolution and async visitor operations.
 *
 * Extends the synchronous JSONSchemaScanner with full async/await support,
 * enabling complex scenarios like fetching remote schemas, async validation,
 * database lookups during traversal, and async schema transformations.
 * Maintains all the power of the sync version while supporting async workflows.
 *
 * @template ContextType - Custom context type passed to visitors and processors
 *
 * @example
 * Async schema traversal with remote reference resolution:
 * ```typescript
 * import { JSONSchemaScannerAsync } from '@winglet/json-schema';
 *
 * const schemaWithRemoteRefs = {
 *   type: 'object',
 *   properties: {
 *     user: { $ref: 'https://api.example.com/schemas/user.json' },
 *     profile: { $ref: 'https://api.example.com/schemas/profile.json' }
 *   }
 * };
 *
 * const asyncScanner = new JSONSchemaScannerAsync({
 *   visitor: {
 *     enter: async (entry) => {
 *       console.log(`Processing: ${entry.path}`);
 *       // Async operations like logging to database
 *       await logToDatabase('schema_traversal', entry.path);
 *     },
 *     exit: async (entry) => {
 *       if (entry.referenceResolved) {
 *         await logToDatabase('reference_resolved', entry.referencePath!);
 *       }
 *     }
 *   },
 *   options: {
 *     resolveReference: async (refPath) => {
 *       // Fetch remote schemas
 *       const response = await fetch(refPath);
 *       return await response.json();
 *     },
 *     maxDepth: 5
 *   }
 * });
 *
 * const resolvedSchema = await asyncScanner.scan(schemaWithRemoteRefs).then(scanner =>
 *   scanner.getValue()
 * );
 * ```
 *
 * @example
 * Async schema validation with database lookups:
 * ```typescript
 * import { isStringSchema, isObjectSchema } from '@winglet/json-schema/filter';
 *
 * interface ValidationContext {
 *   validatedPaths: string[];
 *   errors: string[];
 * }
 *
 * const validationScanner = new JSONSchemaScannerAsync<ValidationContext>({
 *   options: {
 *     context: { validatedPaths: [], errors: [] },
 *     filter: async (entry, context) => {
 *       // Async filtering based on database rules
 *       const shouldProcess = await checkProcessingRules(entry.path);
 *       return shouldProcess;
 *     },
 *     mutate: async (entry, context) => {
 *       // Async mutation with external API calls
 *       // Use isStringSchema() to handle both { type: 'string' } and { type: ['string', 'null'] }
 *       if (isStringSchema(entry.schema) && entry.schema.format === 'email') {
 *         const domainValidation = await validateEmailDomain(entry.schema.pattern);
 *         if (!domainValidation.valid) {
 *           context.errors.push(`Invalid email pattern at ${entry.path}`);
 *         }
 *         return {
 *           ...entry.schema,
 *           description: `Validated email field: ${domainValidation.message}`
 *         };
 *       }
 *     }
 *   },
 *   visitor: {
 *     enter: async (entry, context) => {
 *       context.validatedPaths.push(entry.path);
 *
 *       // Async validation against external service
 *       // Use isObjectSchema() to handle both { type: 'object' } and { type: ['object', 'null'] }
 *       if (isObjectSchema(entry.schema)) {
 *         const validationResult = await validateSchemaStructure(entry.schema);
 *         if (!validationResult.valid) {
 *           context.errors.push(`Schema structure invalid at ${entry.path}`);
 *         }
 *       }
 *     }
 *   }
 * });
 *
 * await validationScanner.scan(complexSchema);
 * const context = validationScanner.options.context;
 * console.log(`Validated ${context.validatedPaths.length} paths with ${context.errors.length} errors`);
 * ```
 *
 * @example
 * Distributed schema composition with async references:
 * ```typescript
 * const distributedSchema = {
 *   type: 'object',
 *   properties: {
 *     userService: { $ref: 'service://user-service/schema' },
 *     orderService: { $ref: 'service://order-service/schema' },
 *     paymentService: { $ref: 'service://payment-service/schema' }
 *   }
 * };
 *
 * const serviceResolver = new JSONSchemaScannerAsync({
 *   options: {
 *     resolveReference: async (serviceRef) => {
 *       const [, , serviceName] = serviceRef.split('/');
 *
 *       // Async service discovery and schema fetching
 *       const serviceEndpoint = await discoverService(serviceName);
 *       const schemaResponse = await fetch(`${serviceEndpoint}/api/schema`);
 *       const schema = await schemaResponse.json();
 *
 *       // Cache for performance
 *       await cacheSchema(serviceRef, schema);
 *
 *       return schema;
 *     },
 *     context: { resolvedServices: new Set<string>() }
 *   },
 *   visitor: {
 *     enter: async (entry, context) => {
 *       if (entry.referenceResolved && entry.referencePath?.startsWith('service://')) {
 *         context.resolvedServices.add(entry.referencePath);
 *         await notifyServiceUsage(entry.referencePath);
 *       }
 *     }
 *   }
 * });
 *
 * const composedSchema = await serviceResolver.scan(distributedSchema)
 *   .then(scanner => scanner.getValue());
 * ```
 *
 * @example
 * Progressive schema loading with batched async operations:
 * ```typescript
 * const batchingScanner = new JSONSchemaScannerAsync({
 *   options: {
 *     resolveReference: async (refPath, context) => {
 *       // Batch reference resolution for performance
 *       if (!context.pendingRefs) context.pendingRefs = [];
 *       context.pendingRefs.push(refPath);
 *
 *       if (context.pendingRefs.length >= 10) {
 *         const resolvedBatch = await resolveBatchedReferences(context.pendingRefs);
 *         context.pendingRefs = [];
 *         return resolvedBatch[refPath];
 *       }
 *
 *       // Handle single reference
 *       return await resolveSingleReference(refPath);
 *     }
 *   },
 *   visitor: {
 *     exit: async (entry, context) => {
 *       // Flush remaining batched operations at the end
 *       if (entry.depth === 0 && context.pendingRefs?.length > 0) {
 *         await resolveBatchedReferences(context.pendingRefs);
 *         context.pendingRefs = [];
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @remarks
 * **Async Capabilities:**
 * - **Async Reference Resolution**: Fetch schemas from remote sources
 * - **Async Visitors**: Perform async operations during traversal
 * - **Async Filtering**: Dynamic filtering based on async conditions
 * - **Async Mutation**: Transform schemas using async data sources
 *
 * **Use Cases:**
 * - **Remote Schema Composition**: Combine schemas from multiple services
 * - **Dynamic Schema Validation**: Validate against external rules
 * - **Schema Analytics**: Collect metrics with async logging
 * - **Progressive Loading**: Load schema parts on demand
 * - **Database Integration**: Enrich schemas with database data
 *
 * **Performance Notes:**
 * - Maintains non-blocking traversal with proper async/await handling
 * - Supports batched operations for efficiency
 * - Provides same caching benefits as sync version
 * - Handles concurrent async operations safely
 *
 * This async scanner is essential for modern microservice architectures,
 * distributed schema systems, and complex validation workflows.
 */
export class JSONSchemaScannerAsync<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Visitor object: contains callback functions to be executed when entering/exiting schema nodes. */
  private readonly __visitor__: SchemaVisitor<Schema, ContextType>;
  /** Scan options: includes maximum traversal depth, filtering functions, reference resolution functions, etc. */
  private readonly __options__: JSONScannerOptionsAsync<Schema, ContextType>;
  /** Shared operation ledger, lifecycle guard and lazy output cache. */
  private readonly __output__ = new ScanOutput();

  /**
   * Creates a JSONSchemaScannerAsync instance.
   * @param {JSONSchemaScannerProps<Schema, ContextType>} [props] - Scanner configuration (visitor, options).
   */
  constructor(props?: JSONSchemaScannerProps<Schema, ContextType>) {
    this.__visitor__ = props?.visitor || {};
    this.__options__ = props?.options || {};
  }

  /**
   * Asynchronously scans the given JSON schema and updates internal state.
   * Executes visitor hooks and collects resolved reference information in the shared output ledger.
   *
   * @param {Schema} schema - The JSON schema object to scan.
   * @returns {Promise<this>} The current JSONSchemaScannerAsync instance (allows method chaining).
   */
  public async scan(this: this, schema: Schema): Promise<this> {
    this.__output__.begin(schema);
    try {
      await this.__run__(schema);
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
   * const result = await scanner.scan(mySchema);
   * const schema = result.getValue();
   *
   * // Explicit type narrowing for processed schema
   * const schema = result.getValue<ResolvedSchema>();
   * ```
   */
  public getValue<OutputSchema extends UnknownSchema = Schema>(
    this: this,
  ): OutputSchema | undefined {
    return this.__output__.getValue() as OutputSchema | undefined;
  }

  /**
   * Run the shared direct-call machine with this driver's waiting policy.
   * @param schema Root schema to traverse; callback errors propagate to scan's state reset.
   * @returns Nothing once traversal completes asynchronously.
   */
  private async __run__(this: this, schema: Schema): Promise<void> {
    const options = this.__options__;
    const visitor = this.__visitor__;
    const context = options.context;
    const config: ScanConfig<Schema, ContextType> = {
      context,
      maxDepth: options.maxDepth,
      cloneResolvedSchema: options.cloneResolvedSchema !== false,
      cacheResolvedReference: options.cacheResolvedReference === true,
      keywordMap: options.additionalKeywords
        ? buildKeywordMap(DEFAULT_KEYWORDS.concat(options.additionalKeywords))
        : DEFAULT_KEYWORD_MAP,
      operations: this.__output__.operations,
      filter: options.filter,
      mutate: options.mutate,
      enter: visitor.enter,
      exit: visitor.exit,
      resolveReference: options.resolveReference,
    };

    const engine = new ScanEngine(schema, config, true);
    let pending = engine.run();
    while (pending !== undefined) pending = engine.run(await pending);
  }
}
