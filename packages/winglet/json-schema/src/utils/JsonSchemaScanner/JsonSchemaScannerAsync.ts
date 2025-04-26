import { JSONPointer } from '@winglet/common-utils';

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
  readonly #options: JsonScannerOptionsAsync<ContextType>;
  #value: UnknownSchema | undefined;

  constructor(
    visitor: SchemaVisitor<ContextType> = {},
    options: JsonScannerOptionsAsync<ContextType> = {},
  ) {
    this.#visitor = visitor;
    this.#options = options;
  }

  public async scan(this: this, schema: UnknownSchema): Promise<this> {
    await this.#run(schema);
    return this;
  }

  public getValue(this: this): UnknownSchema | undefined {
    return this.#value;
  }

  async #run(this: this, schema: UnknownSchema): Promise<void> {
    const visitedRefs = new Set<string>();
    const stack: StackEntry[] = [{ schema, path: JSONPointer.Root, depth: 0 }];

    let entry: StackEntry | undefined;
    while ((entry = stack.pop()) !== undefined) {
      if (entry.resolvedRef) {
        if (this.#visitor.exit)
          await this.#visitor.exit(entry, this.#options.context);
        continue;
      }

      if (
        (this.#options.maxDepth !== undefined &&
          entry.depth > this.#options.maxDepth) ||
        (this.#options.filter !== undefined &&
          !(await this.#options.filter(entry, this.#options.context)))
      )
        continue;

      if (this.#visitor.enter)
        await this.#visitor.enter(entry, this.#options.context);

      if (typeof entry.schema.$ref === 'string')
        await handleRefNodeAsync(
          entry,
          stack,
          visitedRefs,
          this.#visitor,
          this.#options,
        );

      const entries = getStackEntriesForNode(entry);
      for (let i = 0; i < entries.length; i++) stack.push(entries[i]);

      if (this.#visitor.exit)
        await this.#visitor.exit(entry, this.#options.context);

      if (entry.path === JSONPointer.Root) this.#value = entry.schema;
    }
  }
}
