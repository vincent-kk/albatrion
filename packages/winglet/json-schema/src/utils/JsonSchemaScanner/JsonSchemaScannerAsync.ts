import {
  JSONPointer,
  trueFunction,
  undefinedFunction,
} from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type {
  JsonScannerOptionsAsync,
  SchemaVisitor,
  StackEntry,
} from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { handleRefNodeAsync } from './utils/handleRefNodeAsync';

export class JsonSchemaScannerAsync<ContextType = void> {
  readonly #visitor: SchemaVisitor<ContextType>;
  readonly #options: Required<JsonScannerOptionsAsync<ContextType>>;

  constructor(
    visitor: SchemaVisitor<ContextType>,
    options: JsonScannerOptionsAsync<ContextType> = {},
  ) {
    this.#visitor = visitor;
    this.#options = {
      maxDepth: options.maxDepth ?? Infinity,
      filter: options.filter ?? trueFunction,
      resolveReference: options.resolveReference ?? undefinedFunction,
      context: options.context as ContextType,
    };
  }

  public async scan(schema: UnknownSchema): Promise<void> {
    await this.#run(schema);
  }

  async #run(schema: UnknownSchema): Promise<void> {
    const visitedRefs = new Set<string>();
    const stack: StackEntry[] = [
      { node: schema, path: JSONPointer.Root, depth: 0 },
    ];

    let entry: StackEntry | undefined;
    while ((entry = stack.pop()) !== undefined) {
      const { node, path, depth, parentIsRef } = entry;

      if (parentIsRef) {
        if (this.#visitor.exit)
          await this.#visitor.exit(node, path, depth, this.#options.context);
        continue;
      }

      if (
        depth > this.#options.maxDepth ||
        !(await this.#options.filter(node, path, depth, this.#options.context))
      )
        continue;

      if (this.#visitor.enter)
        await this.#visitor.enter(node, path, depth, this.#options.context);

      if (typeof node.$ref === 'string')
        await handleRefNodeAsync(
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

      if (this.#visitor.exit)
        await this.#visitor.exit(node, path, depth, this.#options.context);
    }
  }
}
