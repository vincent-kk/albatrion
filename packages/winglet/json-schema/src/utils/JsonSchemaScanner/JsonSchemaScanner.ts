import { clone } from '@winglet/common-utils';
import {
  JSONPointer,
  getValueByPointer,
  setValueByPointer,
} from '@winglet/json';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  type JsonScannerOptions,
  OperationPhase,
  type SchemaEntry,
  type SchemaVisitor,
} from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { isDefinitionSchema } from './utils/isDefinitionSchema';

interface JsonSchemaScannerProps<ContextType> {
  visitor?: SchemaVisitor<ContextType>;
  options?: JsonScannerOptions<ContextType>;
}

/**
 * @class JsonSchemaScanner
 * @template ContextType - Context type that can be used in visitors and options.
 *
 * A utility class that traverses JSON schemas using depth-first search (DFS),
 * applies the Visitor pattern, and resolves $ref references.
 * Uses stack-based circular reference detection logic to prevent infinite loops.
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
  #pendingResolves: Array<[path: string, schema: UnknownSchema]> | undefined;

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
    this.#pendingResolves = undefined;
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
    if (!this.#pendingResolves || this.#pendingResolves.length === 0) {
      this.#processedSchema = this.#originalSchema;
      return this.#processedSchema as Schema;
    }

    this.#processedSchema = clone(this.#originalSchema);
    for (const [path, resolvedSchema] of this.#pendingResolves) {
      this.#processedSchema = setValueByPointer(
        this.#processedSchema,
        path,
        resolvedSchema,
      );
    }
    this.#pendingResolves = undefined;
    return this.#processedSchema as Schema;
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
      { schema, path: JSONPointer.Root, dataPath: JSONPointer.Root, depth: 0 },
    ];
    const entryPhase = new Map<SchemaEntry, OperationPhase>();
    const visitedReference = new Set<string>();

    while (stack.length > 0) {
      const entry = stack[stack.length - 1];
      const currentPhase = entryPhase.get(entry) ?? OperationPhase.Enter;

      switch (currentPhase) {
        case OperationPhase.Enter: {
          if (
            this.#options.filter &&
            !this.#options.filter(entry, this.#options.context)
          ) {
            stack.pop();
            entryPhase.delete(entry);
            break;
          }

          this.#visitor.enter?.(entry, this.#options.context);
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
              this.#options.resolveReference && !isDefinitionSchema(entry.path)
                ? this.#options.resolveReference(
                    referencePath,
                    this.#options.context,
                  )
                : undefined;

            if (resolvedReference) {
              if (!this.#pendingResolves) this.#pendingResolves = new Array();
              this.#pendingResolves.push([entry.path, resolvedReference]);

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
          if (
            this.#options.maxDepth !== undefined &&
            entry.depth + 1 > this.#options.maxDepth
          ) {
            entryPhase.set(entry, OperationPhase.Exit);
            break;
          }

          const childEntries = getStackEntriesForNode(entry);
          entryPhase.set(entry, OperationPhase.Exit);
          if (childEntries.length > 0) {
            for (let i = childEntries.length - 1; i >= 0; i--) {
              const child = childEntries[i];
              entryPhase.set(child, OperationPhase.Enter);
              stack.push(child);
            }
          }
          break;
        }

        case OperationPhase.Exit: {
          this.#visitor.exit?.(entry, this.#options.context);
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

  static resolveReference(
    jsonSchema: UnknownSchema,
  ): UnknownSchema | undefined {
    const definitionMap = new Map<string, UnknownSchema>();
    new JsonSchemaScanner({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            definitionMap.set(
              schema.$ref,
              getValueByPointer(jsonSchema, schema.$ref),
            );
        },
      },
    }).scan(jsonSchema);
    return new JsonSchemaScanner({
      options: {
        resolveReference: (path) => definitionMap.get(path),
      },
    })
      .scan(jsonSchema)
      .getValue();
  }
}
