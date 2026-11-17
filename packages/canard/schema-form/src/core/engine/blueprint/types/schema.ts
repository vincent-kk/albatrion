import type { Dictionary } from '@aileron/declare';

import type { SchemaTypeName } from '../../types/schemaType';

export type { SchemaTypeName } from '../../types/schemaType';
/** Authored schema data; extension values remain opaque until their owner reads them. */
export type BlueprintSchema = Readonly<Dictionary<unknown>> | boolean;

/** Stable runtime kind selected by analysis, including virtual and union nodes. */
export type BlueprintNodeKind =
  | Exclude<SchemaTypeName, 'integer'>
  | 'union'
  | 'virtual';

/** Scalar for ordinary nodes; a shared frozen non-null list for union nodes. */
export type BlueprintSchemaType = SchemaTypeName | readonly SchemaTypeName[];
