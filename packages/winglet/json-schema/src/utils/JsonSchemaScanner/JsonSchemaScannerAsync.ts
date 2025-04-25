import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  COMPOSITION_KEYWORDS,
  CONDITIONAL_KEYWORDS,
  type JsonScannerOptionsAsync,
  type SchemaVisitor,
} from './type';

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
      filter: options.filter ?? (() => true),
      resolveReference: options.resolveReference ?? (() => undefined),
      context: options.context as ContextType,
    };
  }

  public async scan(schema: UnknownSchema): Promise<void> {
    await this.walk(schema, '#', 0);
  }

  private async walk(
    node: UnknownSchema,
    path: string,
    depth: number,
  ): Promise<void> {
    if (depth > this.#options.maxDepth) return;
    if (!this.#options.filter(node, path, depth, this.#options.context)) return;

    await this.#visitor.enter?.(node, path, depth, this.#options.context);

    if (typeof (node as any).$ref === 'string') {
      const resolved = await this.#options.resolveReference(
        (node as any).$ref,
        this.#options.context,
      );
      if (resolved)
        await this.walk(
          resolved,
          `${path} -> (${(node as any).$ref})`,
          depth + 1,
        );
      await this.#visitor.exit?.(node, path, depth, this.#options.context);
      return;
    }

    if ((node as any).properties)
      for (const k in (node as any).properties)
        await this.recurseAsync(
          (node as any).properties[k],
          `${path}/properties/${k}`,
          depth,
        );

    if ((node as any).items) {
      const items = (node as any).items;
      if (Array.isArray(items))
        for (let i = 0; i < items.length; i++)
          await this.recurseAsync(items[i], `${path}/items/${i}`, depth);
      else await this.recurseAsync(items, `${path}/items`, depth);
    }

    if (
      (node as any).additionalProperties &&
      typeof (node as any).additionalProperties === 'object'
    )
      await this.recurseAsync(
        (node as any).additionalProperties,
        `${path}/additionalProperties`,
        depth,
      );

    for (const keyword of COMPOSITION_KEYWORDS) {
      const chunk = (node as any)[keyword];
      if (Array.isArray(chunk))
        for (let i = 0; i < chunk.length; i++)
          await this.recurseAsync(chunk[i], `${path}/${keyword}/${i}`, depth);
    }

    for (const keyword of CONDITIONAL_KEYWORDS) {
      const chunk = (node as any)[keyword];
      if (chunk && typeof chunk === 'object')
        await this.recurseAsync(chunk, `${path}/${keyword}`, depth);
    }

    if ((node as any).definitions)
      for (const k in (node as any).definitions)
        await this.recurseAsync(
          (node as any).definitions[k],
          `${path}/definitions/${k}`,
          depth,
        );

    if ((node as any).$defs)
      for (const k in (node as any).$defs)
        await this.recurseAsync(
          (node as any).$defs[k],
          `${path}/$defs/${k}`,
          depth,
        );

    await this.#visitor.exit?.(node, path, depth, this.#options.context);
  }

  /* ── 공통 재귀 헬퍼 ── */
  private async recurseAsync(
    child: UnknownSchema,
    subPath: string,
    parentDepth: number,
  ): Promise<void> {
    if (child && typeof child === 'object')
      await this.walk(child, subPath, parentDepth + 1);
  }
}
