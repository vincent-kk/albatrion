import { JSONPointer } from '@/json-schema/enum';
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

  /* ── 내부 순회 ── */
  private walk(node: UnknownSchema, path: string, depth: number = 0): void {
    if (depth > this.#options.maxDepth) return;
    if (!this.#options.filter(node, path, depth, this.#options.context)) return;

    this.#visitor.enter?.(node, path, depth, this.#options.context);

    if (typeof (node as any).$ref === 'string') {
      const resolved = this.#options.resolveReference(
        (node as any).$ref,
        this.#options.context,
      );
      if (resolved)
        this.walk(resolved, `${path} -> (${(node as any).$ref})`, depth + 1);
      this.#visitor.exit?.(node, path, depth, this.#options.context);
      return;
    }

    /* ↓↓↓ ‘내부 함수’ 대신 private 메서드 호출 ↓↓↓ */
    if ((node as any).properties)
      for (const k in (node as any).properties)
        this.recurse(
          (node as any).properties[k],
          `${path}/properties/${k}`,
          depth,
        );

    if ((node as any).items) {
      const items = (node as any).items;
      if (Array.isArray(items))
        items.forEach((it, i) => this.recurse(it, `${path}/items/${i}`, depth));
      else this.recurse(items, `${path}/items`, depth);
    }

    if (
      (node as any).additionalProperties &&
      typeof (node as any).additionalProperties === 'object'
    )
      this.recurse(
        (node as any).additionalProperties,
        `${path}/additionalProperties`,
        depth,
      );

    for (const keyword of COMPOSITION_KEYWORDS) {
      const chunk = (node as any)[keyword];
      if (Array.isArray(chunk))
        chunk.forEach((it: UnknownSchema, i: number) =>
          this.recurse(it, `${path}/${keyword}/${i}`, depth),
        );
    }

    for (const keyword of CONDITIONAL_KEYWORDS) {
      const chunk = (node as any)[keyword];
      if (chunk && typeof chunk === 'object')
        this.recurse(chunk, `${path}/${keyword}`, depth);
    }

    if ((node as any).definitions)
      for (const k in (node as any).definitions)
        this.recurse(
          (node as any).definitions[k],
          `${path}/definitions/${k}`,
          depth,
        );

    if ((node as any).$defs)
      for (const k in (node as any).$defs)
        this.recurse((node as any).$defs[k], `${path}/$defs/${k}`, depth);

    this.#visitor.exit?.(node, path, depth, this.#options.context);
  }

  /* ── 공통 재귀 헬퍼 ── */
  private recurse(
    child: UnknownSchema,
    subPath: string,
    parentDepth: number,
  ): void {
    if (child && typeof child === 'object')
      this.walk(child, subPath, parentDepth + 1);
  }
}
