import { JSONPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JsonScannerOptions, SchemaVisitor, StackEntry } from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';

export class JsonSchemaScanner<ContextType = void> {
  readonly #visitor: SchemaVisitor<ContextType>;
  readonly #options: Required<JsonScannerOptions<ContextType>>;

  constructor(
    visitor: SchemaVisitor<ContextType>,
    options: JsonScannerOptions<ContextType> = {},
  ) {
    this.#visitor = visitor;
    this.#options = {
      maxDepth: options.maxDepth ?? Infinity,
      filter: options.filter ?? (() => true),
      resolveReference: options.resolveReference ?? (() => undefined),
      context: options.context as ContextType,
    };
  }

  public scan(schema: UnknownSchema): void {
    this.#run(schema, JSONPointer.Root);
  }

  #run(rootNode: UnknownSchema, rootPath: string, rootDepth: number = 0): void {
    const stack: StackEntry[] = [
      { node: rootNode, path: rootPath, depth: rootDepth },
    ];

    let entry: StackEntry | undefined;
    while ((entry = stack.pop()) !== undefined) {
      const { node, path, depth, parentIsRef } = entry;

      if (parentIsRef) {
        this.#visitor.exit?.(node, path, depth, this.#options.context);
        continue;
      }

      if (
        depth > this.#options.maxDepth ||
        !this.#options.filter(node, path, depth, this.#options.context)
      )
        continue;

      this.#visitor.enter?.(node, path, depth, this.#options.context);
      if (typeof node.$ref === 'string') {
        const resolved = this.#options.resolveReference(
          node.$ref,
          this.#options.context,
        );
        if (resolved) {
          stack.push({ node, path, depth, parentIsRef: true });
          stack.push({
            node: resolved,
            path: `${path} -> (${node.$ref})`,
            depth: depth + 1,
          });
          continue;
        }
        this.#visitor.exit?.(node, path, depth, this.#options.context);
        continue;
      }

      const entries = getStackEntriesForNode(node, path, depth);
      for (let i = 0; i < entries.length; i++) stack.push(entries[i]);

      this.#visitor.exit?.(node, path, depth, this.#options.context);
    }
  }
}
