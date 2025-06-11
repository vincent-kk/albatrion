import { clone } from '@winglet/common-utils/object';
import { JSONPointer, setValue } from '@winglet/json';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  type JsonScannerOptionsAsync,
  OperationPhase,
  type SchemaEntry,
  type SchemaVisitor,
} from '../type';
import { getStackEntriesForNode } from '../utils/getStackEntriesForNode';
import { isDefinitionSchema } from '../utils/isDefinitionSchema';

interface JsonSchemaScannerProps<ContextType> {
  visitor?: SchemaVisitor<ContextType>;
  options?: JsonScannerOptionsAsync<ContextType>;
}

/**
 * @class JsonSchemaScannerAsync
 * @template ContextType - Context type that can be used in visitors and options.
 *
 * A utility class that asynchronously traverses JSON schemas using depth-first search (DFS),
 * applies the Visitor pattern, and asynchronously resolves $ref references.
 * Uses stack-based circular reference detection logic to prevent infinite loops.
 */
export class JsonSchemaScannerAsync<ContextType = void> {
  /** Visitor object: contains callback functions to be executed when entering/exiting schema nodes. */
  readonly #visitor: SchemaVisitor<ContextType>;
  /** Scan options: includes maximum traversal depth, filtering functions, reference resolution functions, etc. */
  readonly #options: JsonScannerOptionsAsync<ContextType>;
  /** Original JSON schema passed to the `scan` method. */
  #originalSchema: UnknownSchema | undefined;
  /** Final schema with references resolved. Computed on first call to `getValue`. */
  #processedSchema: UnknownSchema | undefined;
  /** Array of references resolved during `#run` execution but not yet applied to the final schema ([path, resolved schema]). */
  #pendingResolves: Array<[path: string, schema: UnknownSchema]> | undefined;

  /**
   * Creates a JsonSchemaScannerAsync instance.
   * @param {JsonSchemaScannerProps<ContextType>} [props] - Scanner configuration (visitor, options).
   */
  constructor(props?: JsonSchemaScannerProps<ContextType>) {
    this.#visitor = props?.visitor || {};
    this.#options = props?.options || {};
  }

  /**
   * Asynchronously scans the given JSON schema and updates internal state.
   * Executes visitor hooks and collects resolved reference information to store in `#pendingResolvedRefs`.
   *
   * @param {UnknownSchema} schema - The JSON schema object to scan.
   * @returns {Promise<this>} The current JsonSchemaScannerAsync instance (allows method chaining).
   */
  public async scan(this: this, schema: UnknownSchema): Promise<this> {
    this.#originalSchema = schema;
    this.#processedSchema = undefined; // Reset previous results when starting new scan
    this.#pendingResolves = undefined;
    await this.#run(this.#originalSchema);
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
  public getValue(this: this): UnknownSchema | undefined {
    if (!this.#originalSchema) return undefined;
    if (this.#processedSchema) return this.#processedSchema;
    if (!this.#pendingResolves || this.#pendingResolves.length === 0) {
      this.#processedSchema = this.#originalSchema;
      return this.#processedSchema;
    }

    this.#processedSchema = clone(this.#originalSchema);
    for (const [path, resolvedSchema] of this.#pendingResolves) {
      this.#processedSchema = setValue(
        this.#processedSchema,
        path,
        resolvedSchema,
      );
    }

    // Clear pending map after application (memory release)
    this.#pendingResolves = undefined;
    return this.#processedSchema;
  }

  /**
   * Internal logic that asynchronously traverses the schema using depth-first search (DFS) and resolves references.
   * Uses a state machine (OperationPhase) to manage the processing stages of each node.
   *
   * @param {UnknownSchema} schema - The schema node to start traversal from.
   * @private
   */
  async #run(this: this, schema: UnknownSchema): Promise<void> {
    const stack: SchemaEntry[] = [
      {
        schema,
        path: JSONPointer.Fragment,
        dataPath: JSONPointer.Fragment,
        depth: 0,
      },
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
            !(await this.#options.filter(entry, this.#options.context))
          ) {
            stack.pop();
            entryPhase.delete(entry);
            break;
          }

          if (this.#visitor.enter)
            await this.#visitor.enter(entry, this.#options.context);
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
                ? await this.#options.resolveReference(
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
          if (this.#visitor.exit)
            await this.#visitor.exit(entry, this.#options.context);

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
