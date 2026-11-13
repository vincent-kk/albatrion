import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { Dialect, KeywordDescriptor } from '../../JSONSchemaScanner/type';

/** Supported JSON schema values in documents and registered resources. */
export type SchemaValue = UnknownSchema | boolean;
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
/** One document retains source pointers even when embedded resources change bases. */
export interface DocumentRecord {
  /** Stable retrieval address, possibly empty for an anonymous root. */
  uri: string;
  /** Original source locations indexed by document pointer. */
  paths: Map<string, Location>;
}
/** URI resource boundary; anchors belong to the whole resource. */
export interface Resource {
  /** Absolute document identifier, or empty for the anonymous root. */
  uri: string;
  /** Source document supplying this resource. */
  document: DocumentRecord;
  /** Resource-root path inside that document. */
  path: string;
  /** Original resource-root schema. */
  schema: SchemaValue;
  /** Effective dialect at the resource root. */
  dialect: Dialect;
  /** Named static and dynamic anchors with source locations. */
  anchors: Map<string, { location: Location; dynamic: boolean }>;
  /** Any dynamic anchor or recursive anchor makes removal of this resource unsafe. */
  dynamic: boolean;
}
/** Lexical protocol context; unchanged descendants share the same object. */
export interface ResolverContext {
  /** Nearest recognized resource boundary. */
  resource: Resource;
}
/** Canonical identity is a resource-relative pointer, independent of anchor aliases. */
export interface Location {
  /** Original schema at the pointer. */
  schema: SchemaValue;
  /** Original document pointer. */
  path: string;
  /** Effective resource context, already entered once. */
  context: ResolverContext;
  /** Original index status; unindexed pointer targets are also unrecognised positions. */
  inert: boolean;
  /** Canonical location used by cycle detection, computed only when targeted; empty until then. */
  uri: string;
}
