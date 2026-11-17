import type { Dialect, KeywordDescriptor } from '../../../../keyword';
import type { SchemaValue } from './SchemaValue';

/** Construction options never cause implicit filesystem or network access. */
export interface ReferenceResolverOptions {
  /** Retrieval base for an otherwise anonymous root. */
  baseURI?: string;
  /** Root fallback dialect. */
  defaultDialect?: Dialect;
  /** Explicit custom metaschema aliases to supported dialects. */
  dialects?: Readonly<Record<string, Dialect>>;
  /** Lazily indexed documents keyed by absolute retrieval URI. */
  resources?: Readonly<Record<string, SchemaValue>>;
  /** Complete replacement vocabulary shared with indexing and template inspection. */
  keywords?: readonly KeywordDescriptor[];
  /** Additional schema-position descriptors. */
  additionalKeywords?: readonly KeywordDescriptor[];
}
/** Async construction changes only the explicit document source. */
export interface ReferenceResolverAsyncOptions
  extends ReferenceResolverOptions {
  /** Load an absolute document URI; undefined is a cached missing document. */
  load?: (uri: string) => PromiseLike<SchemaValue | undefined>;
}
