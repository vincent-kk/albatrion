import { JSONPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JsonScannerOptions, SchemaEntry, SchemaVisitor } from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { handleReferenceNodeSync } from './utils/handleReferenceNodeSync';

interface JsonSchemaScannerProps<ContextType> {
  visitor?: SchemaVisitor<ContextType>;
  options?: JsonScannerOptions<ContextType>;
}

export class JsonSchemaScanner<ContextType = void> {
  readonly #visitor: SchemaVisitor<ContextType>;
  readonly #options: JsonScannerOptions<ContextType>;
  #value: UnknownSchema | undefined;

  constructor(props?: JsonSchemaScannerProps<ContextType>) {
    this.#visitor = props?.visitor || {};
    this.#options = props?.options || {};
  }

  public scan(this: this, schema: UnknownSchema): this {
    this.#value = undefined;
    this.#run(schema);
    return this;
  }

  public getValue(this: this): UnknownSchema | undefined {
    return this.#value;
  }

  #run(this: this, schema: UnknownSchema): void {
    const visitedRefs = new Set<string>();
    const stack: SchemaEntry[] = [{ schema, path: JSONPointer.Root, depth: 0 }];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const entry = stack[stack.length - 1];
      if (!visited.has(entry.path)) {
        if (entry.resolvedReference) {
          this.#visitor.enter?.(entry, this.#options.context);
          this.#visitor.exit?.(entry, this.#options.context);
          stack.pop();
          continue;
        }
        if (
          (this.#options.maxDepth !== undefined &&
            entry.depth > this.#options.maxDepth) ||
          (this.#options.filter !== undefined &&
            !this.#options.filter(entry, this.#options.context))
        ) {
          stack.pop();
          continue;
        }
        this.#visitor.enter?.(entry, this.#options.context);
        visited.add(entry.path);
        if (typeof entry.schema.$ref === 'string')
          handleReferenceNodeSync(
            entry,
            stack,
            visitedRefs,
            this.#visitor,
            this.#options,
          );

        const entries = getStackEntriesForNode(entry);
        if (entries.length > 0) {
          for (let i = entries.length - 1; i >= 0; i--) stack.push(entries[i]);
          continue;
        }
      }
      this.#visitor.exit?.(entry, this.#options.context);
      if (entry.path === JSONPointer.Root) this.#value = entry.schema;
      stack.pop();
    }
  }
}
