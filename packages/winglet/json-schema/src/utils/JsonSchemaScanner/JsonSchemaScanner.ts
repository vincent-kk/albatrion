import { JSONPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JsonScannerOptions, SchemaVisitor, StackEntry } from './type';
import { getStackEntriesForNode } from './utils/getStackEntriesForNode';

/**
 * StackEntry: stack 기반 순회에서 사용하는 엔트리 타입
 */

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
    this.#visit(schema, JSONPointer.Root);
  }

  #visit(
    rootNode: UnknownSchema,
    rootPath: string,
    rootDepth: number = 0,
  ): void {
    const stack: StackEntry[] = [
      { node: rootNode, path: rootPath, depth: rootDepth },
    ];

    while (stack.length > 0) {
      const entry = stack.pop()!;
      const { node, path, depth, parentIsRef } = entry;

      if (parentIsRef) {
        this.#visitor.exit?.(node, path, depth, this.#options.context);
        continue;
      }

      if (depth > this.#options.maxDepth) continue;
      if (!this.#options.filter(node, path, depth, this.#options.context))
        continue;

      this.#visitor.enter?.(node, path, depth, this.#options.context);

      if (typeof (node as any).$ref === 'string') {
        const resolved = this.#options.resolveReference(
          (node as any).$ref,
          this.#options.context,
        );
        if (resolved) {
          stack.push({ node, path, depth, parentIsRef: true });
          stack.push({
            node: resolved,
            path: `${path} -> (${(node as any).$ref})`,
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
