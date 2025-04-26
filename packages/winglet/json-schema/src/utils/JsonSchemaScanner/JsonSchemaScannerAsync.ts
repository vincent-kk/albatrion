import { JSONPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type {
  JsonScannerOptionsAsync,
  SchemaEntry,
  SchemaVisitor,
} from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';
import { handleReferenceNodeAsync } from './utils/handleReferenceNodeAsync';

interface JsonSchemaScannerProps<ContextType> {
  visitor?: SchemaVisitor<ContextType>;
  options?: JsonScannerOptionsAsync<ContextType>;
}

export class JsonSchemaScannerAsync<ContextType = void> {
  readonly #visitor: SchemaVisitor<ContextType>;
  readonly #options: JsonScannerOptionsAsync<ContextType>;
  #value: UnknownSchema | undefined;

  constructor(props?: JsonSchemaScannerProps<ContextType>) {
    this.#visitor = props?.visitor || {};
    this.#options = props?.options || {};
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
    const stack: SchemaEntry[] = [{ schema, path: JSONPointer.Root, depth: 0 }];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const entry = stack[stack.length - 1];
      if (!visited.has(entry.path)) {
        if (entry.resolvedReference) {
          if (this.#visitor.enter)
            await this.#visitor.enter(entry, this.#options.context);
          if (this.#visitor.exit)
            await this.#visitor.exit(entry, this.#options.context);
          stack.pop();
          continue;
        }

        if (
          (this.#options.maxDepth !== undefined &&
            entry.depth > this.#options.maxDepth) ||
          (this.#options.filter !== undefined &&
            !(await this.#options.filter(entry, this.#options.context)))
        ) {
          stack.pop();
          continue;
        }

        if (this.#visitor.enter)
          await this.#visitor.enter(entry, this.#options.context);

        visited.add(entry.path);

        if (typeof entry.schema.$ref === 'string')
          await handleReferenceNodeAsync(
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
      if (this.#visitor.exit)
        await this.#visitor.exit(entry, this.#options.context);
      if (entry.path === JSONPointer.Root) this.#value = entry.schema;
      stack.pop();
    }
  }
}
