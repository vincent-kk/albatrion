import { JSONPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JsonScannerOptions, SchemaVisitor, StackEntry } from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { handleRefNodeSync } from './utils/handleRefNodeSync';

export class JsonSchemaScanner<ContextType = void> {
  readonly #visitor: SchemaVisitor<ContextType>;
  readonly #options: JsonScannerOptions<ContextType>;

  constructor(
    visitor: SchemaVisitor<ContextType>,
    options: JsonScannerOptions<ContextType> = {},
  ) {
    this.#visitor = visitor;
    this.#options = options;
  }

  public scan(schema: UnknownSchema): void {
    this.#run(schema);
  }

  #run(schema: UnknownSchema): void {
    const visitedRefs = new Set<string>();
    const stack: StackEntry[] = [
      { node: schema, path: JSONPointer.Root, depth: 0 },
    ];

    let entry: StackEntry | undefined;
    while ((entry = stack.pop()) !== undefined) {
      const { node, path, depth, parentIsRef } = entry;

      if (parentIsRef) {
        this.#visitor.exit?.(node, path, depth, this.#options.context);
        continue;
      }

      if (
        (this.#options.maxDepth !== undefined &&
          depth > this.#options.maxDepth) ||
        (this.#options.filter !== undefined &&
          !this.#options.filter(node, path, depth, this.#options.context))
      )
        continue;

      this.#visitor.enter?.(node, path, depth, this.#options.context);
      if (typeof node.$ref === 'string')
        handleRefNodeSync(
          node,
          path,
          depth,
          stack,
          visitedRefs,
          this.#visitor,
          this.#options,
        );

      const entries = getStackEntriesForNode(node, path, depth);
      for (let i = 0; i < entries.length; i++) stack.push(entries[i]);

      this.#visitor.exit?.(node, path, depth, this.#options.context);
    }
  }
}
