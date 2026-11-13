import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { buildKeywordMap } from '../../vocabulary/buildKeywordMap';
import type { JSONScannerOptions, SchemaVisitor } from '../type';
import { ScanEngine } from '../utils/engine/ScanEngine';
import type { ScanConfig } from '../utils/engine/type';
import { ScanOutput } from '../utils/output/ScanOutput';
import {
  DEFAULT_KEYWORDS,
  DEFAULT_KEYWORD_MAP,
} from '../utils/vocabulary/defaultKeywords';

interface JSONSchemaScannerProps<Schema extends UnknownSchema, ContextType> {
  visitor?: SchemaVisitor<Schema, ContextType>;
  options?: JSONScannerOptions<Schema, ContextType>;
}

/**
 * Traverse union-vocabulary schema positions with isolated reference expansion and lazy output.
 * Callbacks receive read-only schema views; mutate returns the replacement value.
 * A configured provider owns lexical contexts and canonical target identities.
 *
 * @example
 * ```typescript
 * const resolver = createReferenceResolver(schema);
 * const scanner = new JSONSchemaScanner({
 *   options: { resolveReference: resolver },
 *   visitor: { exit: entry => console.log(entry.path, entry.references) },
 * });
 * const output = scanner.scan(schema).getValue();
 * ```
 *
 * @remarks
 * Sync callbacks run directly; the asynchronous driver awaits thenable results.
 * Inert positions remain observable but produce no output operations.
 * Reference templates are prepared independently of public depth and filtering.
 * Canonical cycles remain as references; finite budgets bound fresh-identity expansion.
 */
export class JSONSchemaScanner<
  Schema extends UnknownSchema = UnknownSchema,
  ContextType = void,
> {
  /** Visitor object: contains callback functions to be executed when entering/exiting schema nodes. */
  private readonly __visitor__: SchemaVisitor<Schema, ContextType>;
  /** Scan options: includes maximum traversal depth, filtering functions, reference resolution functions, etc. */
  private readonly __options__: JSONScannerOptions<Schema, ContextType>;
  /** Shared operation ledger, lifecycle guard and lazy output cache. */
  private readonly __output__ = new ScanOutput();

  /**
   * Creates a JSONSchemaScanner instance.
   * @param {JSONSchemaScannerProps<ContextType>} [props] - Scanner configuration (visitor, options).
   */
  constructor(props?: JSONSchemaScannerProps<Schema, ContextType>) {
    this.__visitor__ = props?.visitor || {};
    this.__options__ = props?.options || {};
  }

  /**
   * Scans the given JSON schema and updates internal state.
   * Executes visitor hooks and collects resolved reference information in the shared output ledger.
   *
   * @param {Schema} schema - The JSON schema object to scan.
   * @returns {this} The current JSONSchemaScanner instance (allows method chaining).
   */
  public scan(this: this, schema: Schema | boolean): this {
    this.__output__.begin(schema);
    try {
      this.__run__(schema);
      this.__output__.finish();
    } catch (error) {
      this.__output__.reset();
      throw error;
    }
    return this;
  }

  /**
   * Returns the final schema with scanning and reference resolution completed.
   *
   * On first call: Applies recorded output operations without writing to caller-owned values
   * and caches the result independently of its truthiness.
   * From second call onwards: Returns the cached final schema.
   *
   * @template OutputSchema - The expected output schema type. Defaults to the class-level Schema type.
   *   Use this to narrow or widen the return type when the processed schema structure differs from input.
   * @returns The processed final schema typed as `OutputSchema`.
   *   Returns `undefined` if called before scanning.
   *   Returns the original schema if no output operation was recorded.
   *   Otherwise returns copied output; opted-out, unchanged resolver targets retain their aliases.
   *
   * @example
   * ```typescript
   * // Default: returns same type as input schema
   * const result = scanner.scan(mySchema).getValue();
   *
   * // Explicit type narrowing for processed schema
   * const result = scanner.scan(mySchema).getValue<ResolvedSchema>();
   * ```
   */
  public getValue<
    OutputSchema extends UnknownSchema | boolean = Schema | boolean,
  >(this: this): OutputSchema | undefined {
    return this.__output__.getValue() as OutputSchema | undefined;
  }

  /**
   * Run the shared direct-call machine with this driver's waiting policy.
   * @param schema Root schema to traverse; callback errors propagate to scan's state reset.
   * @returns Nothing once traversal completes synchronously.
   */
  private __run__(this: this, schema: Schema | boolean): void {
    const options = this.__options__;
    const visitor = this.__visitor__;
    const context = options.context;
    const config: ScanConfig<Schema, ContextType> = {
      context,
      maxDepth: options.maxDepth,
      defaultDialect: options.defaultDialect,
      keywordMap:
        options.keywords !== undefined ||
        options.additionalKeywords !== undefined
          ? buildKeywordMap(
              (options.keywords ?? DEFAULT_KEYWORDS).concat(
                options.additionalKeywords ?? [],
              ),
            )
          : DEFAULT_KEYWORD_MAP,
      operations: this.__output__.operations,
      filter: options.filter,
      mutate: options.mutate,
      enter: visitor.enter,
      exit: visitor.exit,
      resolveReference: options.resolveReference,
      unresolvedReference: options.unresolvedReference,
      limits: options.limits,
    };

    new ScanEngine(schema, config, false).run();
  }
}
