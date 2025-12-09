import { clone } from '@winglet/common-utils/object';
import { JSONPointer, setValue } from '@winglet/json/pointer';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  type JsonScannerOptions,
  OperationPhase,
  type SchemaEntry,
  type SchemaVisitor,
} from '../type';
import { getStackEntriesForNode } from '../utils/getStackEntriesForNode';
import { isDefinitionSchema } from '../utils/isDefinitionSchema';

interface JsonSchemaScannerProps<ContextType> {
  visitor?: SchemaVisitor<ContextType>;
  options?: JsonScannerOptions<ContextType>;
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
 * // Automatically resolve all internal references
 * const fullyResolvedSchema = JsonSchemaScanner.resolveReference(schemaWithInternalRefs);
 * ```
 *
 * @remarks
 * **Processing Phases:**
 * 1. **Enter**: Initial node processing, filtering, and mutation
 * 2. **Reference**: $ref resolution and circular reference detection
 * 3. **ChildEntries**: Depth checking and child node discovery
 * 4. **Exit**: Final processing and cleanup
 *
 * **Key Features:**
 * - **Circular Reference Detection**: Prevents infinite loops when schemas reference each other
 * - **Lazy Reference Resolution**: References are resolved only when encountered
 * - **Schema Mutation**: Transform schemas during traversal
 * - **Filtering**: Skip unwanted schema nodes
 * - **Depth Limiting**: Control traversal depth for performance
 * - **Result Caching**: Processed schemas are cached for efficiency
 *
 * **Performance Considerations:**
 * - Uses stack-based traversal (not recursion) to handle deep schemas
 * - Implements copy-on-write for mutations to minimize memory usage
 * - Caches resolved references to avoid redundant processing
 *
 * This scanner is ideal for complex schema analysis, transformation,
 * documentation generation, form building, and validation preprocessing.
 */
export class JsonSchemaScanner<ContextType = void> {
  /** Visitor object: contains callback functions to be executed when entering/exiting schema nodes. */
  readonly #visitor: SchemaVisitor<ContextType>;
  /** Scan options: includes maximum traversal depth, filtering functions, reference resolution functions, etc. */
  readonly #options: JsonScannerOptions<ContextType>;
  /** Original JSON schema passed to the `scan` method. */
  #originalSchema: UnknownSchema | undefined;
  /** Final schema with references resolved. Computed on first call to `getValue`. */
  #processedSchema: UnknownSchema | undefined;
  /** Array of references resolved during `#run` execution but not yet applied to the final schema ([path, resolved schema]). */
  #pendingResolves: Array<[path: string, schema: UnknownSchema]> = [];

  /**
   * Creates a JsonSchemaScanner instance.
   * @param {JsonSchemaScannerProps<ContextType>} [props] - Scanner configuration (visitor, options).
   */
  constructor(props?: JsonSchemaScannerProps<ContextType>) {
    this.#visitor = props?.visitor || {};
    this.#options = props?.options || {};
  }

  /**
   * Scans the given JSON schema and updates internal state.
   * Executes visitor hooks and collects resolved reference information to store in `#pendingResolvedRefs`.
   *
   * @param {UnknownSchema} schema - The JSON schema object to scan.
   * @returns {this} The current JsonSchemaScanner instance (allows method chaining).
   */
  public scan(this: this, schema: UnknownSchema): this {
    this.#originalSchema = schema;
    this.#processedSchema = undefined;
    this.#pendingResolves = [];
    this.#run(this.#originalSchema);
    return this;
  }

  /**
   * Returns the final schema with scanning and reference resolution completed.
   *
   * On first call: Applies references stored in `#pendingResolvedRefs` to a deep copy of the original schema
   * to create the final schema and cache it.
   * From second call onwards: Returns the cached final schema.
   *
   * @returns {UnknownSchema | undefined} The processed final schema. Returns undefined if called before scanning.
   * Returns a deep copy of the original schema if references are not resolved.
   */
  public getValue<Schema extends UnknownSchema>(
    this: this,
  ): Schema | undefined {
    if (!this.#originalSchema) return undefined;
    if (this.#processedSchema) return this.#processedSchema as Schema;
    const pendingResolves = this.#pendingResolves;
    const pendingResolvesLength = pendingResolves.length;
    if (pendingResolvesLength === 0) {
      this.#processedSchema = this.#originalSchema;
      return this.#processedSchema as Schema;
    }
    let processedSchema = clone(this.#originalSchema);
    for (let i = 0; i < pendingResolvesLength; i++) {
      const [path, resolvedSchema] = pendingResolves[i];
      processedSchema = setValue(processedSchema, path, resolvedSchema);
    }
    this.#pendingResolves = [];
    this.#processedSchema = processedSchema;
    return processedSchema as Schema;
  }

  /**
   * Internal logic that traverses the schema using depth-first search (DFS) and resolves references.
   * Uses a state machine (OperationPhase) to manage the processing stages of each node.
   *
   * @param {UnknownSchema} schema - The schema node to start traversal from.
   * @private
   */
  #run(this: this, schema: UnknownSchema): void {
    const stack: SchemaEntry[] = [
      {
        schema,
        path: JSONPointer.Fragment,
        dataPath: JSONPointer.Root,
        depth: 0,
      },
    ];
    const entryPhase = new Map<SchemaEntry, OperationPhase>();
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
          if (filter && !filter(entry, context)) {
            stack.pop();
            entryPhase.delete(entry);
            break;
          }

          const mutatedSchema = mutate?.(entry, context);
          if (mutatedSchema) {
            entry.schema = mutatedSchema;
            pendingResolves.push([entry.path, mutatedSchema]);
          }

          enter?.(entry, context);
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
                ? resolveReference(referencePath, entry, context)
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
          exit?.(entry, context);
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
