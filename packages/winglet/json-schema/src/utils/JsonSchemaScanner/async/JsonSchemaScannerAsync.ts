import { clone } from '@winglet/common-utils/object';
import { JSONPointer, setValue } from '@winglet/json/pointer';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  type JsonScannerOptionsAsync,
  OperationPhase,
  type SchemaEntry,
  type SchemaVisitor,
} from '../type';
import { getStackEntriesForNode } from '../utils/getStackEntriesForNode';
import { isDefinitionSchema } from '../utils/isDefinitionSchema';

interface JsonSchemaScannerProps<Schema extends UnknownSchema, ContextType> {
  visitor?: SchemaVisitor<Schema, ContextType>;
  options?: JsonScannerOptionsAsync<Schema, ContextType>;
}

/**
 * An advanced asynchronous JSON Schema traversal engine with comprehensive
 * async support for remote reference resolution and async visitor operations.
 *
 * Extends the synchronous JsonSchemaScanner with full async/await support,
 * enabling complex scenarios like fetching remote schemas, async validation,
 * database lookups during traversal, and async schema transformations.
 * Maintains all the power of the sync version while supporting async workflows.
 *
 * @template ContextType - Custom context type passed to visitors and processors
 *
 * @example
 * Async schema traversal with remote reference resolution:
 * ```typescript
 * import { JsonSchemaScannerAsync } from '@winglet/json-schema';
 *
 * const schemaWithRemoteRefs = {
 *   type: 'object',
 *   properties: {
 *     user: { $ref: 'https://api.example.com/schemas/user.json' },
 *     profile: { $ref: 'https://api.example.com/schemas/profile.json' }
 *   }
 * };
 *
 * const asyncScanner = new JsonSchemaScannerAsync({
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
 * const validationScanner = new JsonSchemaScannerAsync<ValidationContext>({
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
 * const serviceResolver = new JsonSchemaScannerAsync({
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
 * const batchingScanner = new JsonSchemaScannerAsync({
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
export class JsonSchemaScannerAsync<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Visitor object: contains callback functions to be executed when entering/exiting schema nodes. */
  readonly #visitor: SchemaVisitor<Schema, ContextType>;
  /** Scan options: includes maximum traversal depth, filtering functions, reference resolution functions, etc. */
  readonly #options: JsonScannerOptionsAsync<Schema, ContextType>;
  /** Original JSON schema passed to the `scan` method. */
  #originalSchema: UnknownSchema | undefined;
  /** Final schema with references resolved. Computed on first call to `getValue`. */
  #processedSchema: UnknownSchema | undefined;
  /** Array of references resolved during `#run` execution but not yet applied to the final schema ([path, resolved schema]). */
  #pendingResolves: Array<[path: string, schema: UnknownSchema]> = [];

  /**
   * Creates a JsonSchemaScannerAsync instance.
   * @param {JsonSchemaScannerProps<Schema, ContextType>} [props] - Scanner configuration (visitor, options).
   */
  constructor(props?: JsonSchemaScannerProps<Schema, ContextType>) {
    this.#visitor = props?.visitor || {};
    this.#options = props?.options || {};
  }

  /**
   * Asynchronously scans the given JSON schema and updates internal state.
   * Executes visitor hooks and collects resolved reference information to store in `#pendingResolvedRefs`.
   *
   * @param {Schema} schema - The JSON schema object to scan.
   * @returns {Promise<this>} The current JsonSchemaScannerAsync instance (allows method chaining).
   */
  public async scan(this: this, schema: Schema): Promise<this> {
    this.#originalSchema = schema;
    this.#processedSchema = undefined; // Reset previous results when starting new scan
    this.#pendingResolves = [];
    await this.#run(this.#originalSchema as Schema);
    return this;
  }

  /**
   * Returns the final schema with scanning and reference resolution completed.
   *
   * On first call: Applies references stored in `#pendingResolvedRefs` to a deep copy of the original schema
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
    if (!this.#originalSchema) return undefined;
    if (this.#processedSchema) return this.#processedSchema as OutputSchema;
    const pendingResolves = this.#pendingResolves;
    const pendingResolvesLength = pendingResolves.length;
    if (pendingResolvesLength === 0) {
      this.#processedSchema = this.#originalSchema;
      return this.#processedSchema as OutputSchema;
    }
    let processedSchema = clone(this.#originalSchema);
    for (let i = 0; i < pendingResolvesLength; i++) {
      const [path, resolvedSchema] = pendingResolves[i];
      processedSchema = setValue(processedSchema, path, resolvedSchema);
    }
    this.#pendingResolves = [];
    this.#processedSchema = processedSchema;
    return processedSchema as OutputSchema;
  }

  /**
   * Internal logic that asynchronously traverses the schema using depth-first search (DFS) and resolves references.
   * Uses a state machine (OperationPhase) to manage the processing stages of each node.
   *
   * @param {Schema} schema - The schema node to start traversal from.
   * @private
   */
  async #run(this: this, schema: Schema): Promise<void> {
    type Entry = SchemaEntry<Schema>;
    const stack: Entry[] = [
      {
        schema,
        path: JSONPointer.Fragment,
        dataPath: JSONPointer.Root,
        depth: 0,
      },
    ];
    const entryPhase = new Map<Entry, OperationPhase>();
    const visitedReference = new Set<string>();
    const pendingResolves = this.#pendingResolves;

    const context = this.#options.context;
    const maxDepth = this.#options.maxDepth;
    const filter = this.#options.filter;
    const mutate = this.#options.mutate;
    const resolveReference = this.#options.resolveReference;
    const enter = this.#visitor.enter;
    const exit = this.#visitor.exit;

    while (stack.length > 0) {
      const entry = stack[stack.length - 1];
      const currentPhase = entryPhase.get(entry) ?? OperationPhase.Enter;

      switch (currentPhase) {
        case OperationPhase.Enter: {
          if (filter && !(await filter(entry, context))) {
            stack.pop();
            entryPhase.delete(entry);
            break;
          }

          const mutatedSchema = mutate?.(entry, context);
          if (mutatedSchema) {
            entry.schema = mutatedSchema;
            pendingResolves.push([entry.path, mutatedSchema]);
          }

          await enter?.(entry, context);
          entryPhase.set(entry, OperationPhase.Reference);
          break;
        }

        case OperationPhase.Reference: {
          if (typeof entry.schema.$ref === 'string') {
            const referencePath = entry.schema.$ref;

            if (visitedReference.has(referencePath)) {
              entry.hasReference = true;
              entryPhase.set(entry, OperationPhase.Exit);
              break;
            }

            const resolvedReference =
              resolveReference && !isDefinitionSchema(entry.path)
                ? await resolveReference(referencePath, entry, context)
                : undefined;

            if (resolvedReference) {
              pendingResolves.push([entry.path, resolvedReference]);

              entry.schema = resolvedReference;
              entry.referencePath = referencePath;
              entry.referenceResolved = true;

              visitedReference.add(referencePath);
              entryPhase.set(entry, OperationPhase.ChildEntries);
            } else {
              entry.hasReference = true;
              entryPhase.set(entry, OperationPhase.Exit);
            }
            break;
          }

          entryPhase.set(entry, OperationPhase.ChildEntries);
          break;
        }

        case OperationPhase.ChildEntries: {
          if (maxDepth !== undefined && entry.depth + 1 > maxDepth) {
            entryPhase.set(entry, OperationPhase.Exit);
            break;
          }

          const childEntries = getStackEntriesForNode(entry);
          entryPhase.set(entry, OperationPhase.Exit);
          if (childEntries.length > 0) {
            for (let i = childEntries.length - 1; i >= 0; i--) {
              const child = childEntries[i];
              stack.push(child);
            }
          }
          break;
        }

        case OperationPhase.Exit: {
          await exit?.(entry, context);
          if (
            entry.referenceResolved &&
            entry.referencePath &&
            visitedReference.has(entry.referencePath)
          )
            visitedReference.delete(entry.referencePath);
          stack.pop();
          entryPhase.delete(entry);
          break;
        }

        default: {
          stack.pop();
          entryPhase.delete(entry);
          break;
        }
      }
    }
  }
}
