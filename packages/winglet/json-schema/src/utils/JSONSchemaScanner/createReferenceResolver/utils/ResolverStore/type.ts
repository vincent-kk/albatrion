import type { Dialect } from '../../../../../keyword';
import type { SchemaValue } from '../../types/SchemaValue';

/** One document retains source pointers even when embedded resources change bases. */
export interface DocumentRecord {
  /** Stable retrieval address; empty for an anonymous root and relative for a relative baseURI. */
  uri: string;
  /** Original source locations indexed by document pointer. */
  paths: Map<string, Location>;
}
/** A named fragment and the original occurrence it names. */
export interface Anchor {
  /** Original schema occurrence that the name identifies. */
  location: Location;
  /** Whether a dynamic reference may rebind the name in its dynamic scope. */
  dynamic: boolean;
}
/** URI base boundary: a declared resource, or a base change that declares none. */
export interface Resource {
  /**
   * Document address that references inside resolve against; empty for the anonymous root and
   * relative when the default base is unknown.
   */
  uri: string;
  /** Source document supplying this resource. */
  document: DocumentRecord;
  /** Resource-root path inside that document; empty for a base change, which is never registered. */
  path: string;
  /** Original resource-root schema. */
  schema: SchemaValue;
  /** Effective dialect at the resource root. */
  dialect: Dialect;
  /** Any dynamic anchor or recursive anchor makes removal of this resource unsafe. */
  dynamic: boolean;
  /**
   * Nearest declared resource when this context only changes the base. A legacy identifier
   * with a non-empty fragment names a location in another document without declaring that
   * document, so canonical locations below it stay addressed through this resource.
   */
  owner?: Resource;
}
/** Lexical protocol context; unchanged descendants share the same object. */
export interface ResolverContext {
  /** Nearest recognized identifier boundary: a declared resource or a base change. */
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
