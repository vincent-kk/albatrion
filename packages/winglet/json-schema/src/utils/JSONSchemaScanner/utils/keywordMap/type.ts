import type { KeywordDescriptor } from '../../../../keyword';

/** Descriptor compiled once for own-key discovery and allocation-free ordering. */
export interface OrderedKeywordDescriptor extends KeywordDescriptor {
  /** Original descriptor position; a later duplicate owns the keyword's ordering. */
  order: number;
  /** Escaped keyword token reused when constructing every child path. */
  path: string;
  /** Supported dialect bits, with omitted dialects accepting every dialect. */
  mask: number;
}

/** Own keyword lookup consumed by the shared traversal engine. */
export type KeywordMap = Map<string, OrderedKeywordDescriptor>;
