import { JSONPointer } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  COMPOSITION_KEYWORDS,
  CONDITIONAL_KEYWORDS,
  type JsonScannerOptions,
  type SchemaVisitor,
} from './type';

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

  /* ── public ── */
  public scan(schema: UnknownSchema): void {
    this.walk(schema, JSONPointer.Root);
  }

  /* ── 내부 순회 (stack 기반) ── */
  private walk(
    rootNode: UnknownSchema,
    rootPath: string,
    rootDepth: number = 0,
  ): void {
    /**
     * Stack entry 타입 정의
     */
    interface StackEntry {
      node: UnknownSchema;
      path: string;
      depth: number;
      parentIsRef?: boolean; // $ref 처리 후 exit 호출 여부 구분용
    }

    const stack: StackEntry[] = [
      { node: rootNode, path: rootPath, depth: rootDepth },
    ];

    while (stack.length > 0) {
      const entry = stack.pop()!;
      const { node, path, depth, parentIsRef } = entry;

      // $ref 처리 후 exit만 호출하는 경우
      if (parentIsRef) {
        this.#visitor.exit?.(node, path, depth, this.#options.context);
        continue;
      }

      // maxDepth, filter 체크
      if (depth > this.#options.maxDepth) continue;
      if (!this.#options.filter(node, path, depth, this.#options.context))
        continue;

      this.#visitor.enter?.(node, path, depth, this.#options.context);

      // $ref 처리
      if (typeof (node as any).$ref === 'string') {
        const resolved = this.#options.resolveReference(
          (node as any).$ref,
          this.#options.context,
        );
        if (resolved) {
          // $ref로 이동한 노드의 exit 후, 원래 노드의 exit도 호출해야 하므로 stack에 두 번 push
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

      // 하위 노드 push (역순 push로 순회 순서 보장)
      // $defs
      if ((node as any).$defs) {
        const $defs = (node as any).$defs;
        for (const k of Object.keys($defs).reverse()) {
          stack.push({
            node: $defs[k],
            path: `${path}/$defs/${k}`,
            depth: depth + 1,
          });
        }
      }
      // definitions
      if ((node as any).definitions) {
        const definitions = (node as any).definitions;
        for (const k of Object.keys(definitions).reverse()) {
          stack.push({
            node: definitions[k],
            path: `${path}/definitions/${k}`,
            depth: depth + 1,
          });
        }
      }
      // CONDITIONAL_KEYWORDS
      for (let i = CONDITIONAL_KEYWORDS.length - 1; i >= 0; i--) {
        const keyword = CONDITIONAL_KEYWORDS[i];
        const chunk = (node as any)[keyword];
        if (chunk && typeof chunk === 'object') {
          stack.push({
            node: chunk,
            path: `${path}/${keyword}`,
            depth: depth + 1,
          });
        }
      }
      // COMPOSITION_KEYWORDS
      for (let i = COMPOSITION_KEYWORDS.length - 1; i >= 0; i--) {
        const keyword = COMPOSITION_KEYWORDS[i];
        const chunk = (node as any)[keyword];
        if (Array.isArray(chunk)) {
          for (let j = chunk.length - 1; j >= 0; j--) {
            stack.push({
              node: chunk[j],
              path: `${path}/${keyword}/${j}`,
              depth: depth + 1,
            });
          }
        }
      }
      // additionalProperties
      if (
        (node as any).additionalProperties &&
        typeof (node as any).additionalProperties === 'object'
      ) {
        stack.push({
          node: (node as any).additionalProperties,
          path: `${path}/additionalProperties`,
          depth: depth + 1,
        });
      }
      // items
      if ((node as any).items) {
        const items = (node as any).items;
        if (Array.isArray(items)) {
          for (let i = items.length - 1; i >= 0; i--) {
            stack.push({
              node: items[i],
              path: `${path}/items/${i}`,
              depth: depth + 1,
            });
          }
        } else {
          stack.push({
            node: items,
            path: `${path}/items`,
            depth: depth + 1,
          });
        }
      }
      // properties
      if ((node as any).properties) {
        const properties = (node as any).properties;
        for (const k of Object.keys(properties).reverse()) {
          stack.push({
            node: properties[k],
            path: `${path}/properties/${k}`,
            depth: depth + 1,
          });
        }
      }

      this.#visitor.exit?.(node, path, depth, this.#options.context);
    }
  }
}
