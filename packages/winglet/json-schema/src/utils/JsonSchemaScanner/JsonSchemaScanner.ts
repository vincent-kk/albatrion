import { JSONPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JsonScannerOptions, SchemaVisitor, StackEntry } from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { handleRefNodeSync } from './utils/handleRefNodeSync';

export class JsonSchemaScanner<ContextType = void> {
  readonly #visitor: SchemaVisitor<ContextType>;
  readonly #options: JsonScannerOptions<ContextType>;
  #value: UnknownSchema | undefined;

  constructor(
    visitor: SchemaVisitor<ContextType>,
    options: JsonScannerOptions<ContextType> = {},
  ) {
    this.#visitor = visitor;
    this.#options = options;
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
    const stack: StackEntry[] = [{ schema, path: JSONPointer.Root, depth: 0 }];

    let entry: StackEntry | undefined;
    while ((entry = stack.pop()) !== undefined) {
      if (entry.resolvedRef) {
        this.#visitor.exit?.(entry, this.#options.context);
        continue;
      }

      if (
        (this.#options.maxDepth !== undefined &&
          entry.depth > this.#options.maxDepth) ||
        (this.#options.filter !== undefined &&
          !this.#options.filter(entry, this.#options.context))
      )
        continue;

      this.#visitor.enter?.(entry, this.#options.context);
      if (typeof entry.schema.$ref === 'string')
        handleRefNodeSync(
          entry,
          stack,
          visitedRefs,
          this.#visitor,
          this.#options,
        );

      const entries = getStackEntriesForNode(entry);
      for (let i = 0; i < entries.length; i++) stack.push(entries[i]);

      this.#visitor.exit?.(entry, this.#options.context);

      if (entry.path === JSONPointer.Root) this.#value = entry.schema;
    }
  }
}
