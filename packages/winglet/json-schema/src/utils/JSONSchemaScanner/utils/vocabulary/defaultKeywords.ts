import type { Dialect, KeywordDescriptor } from '../../type';
import { buildKeywordMap } from './buildKeywordMap';

/** Object schema locations accepted throughout all supported dialects. */
const all: readonly Dialect[] = [
  'draft-04',
  'draft-06',
  'draft-07',
  '2019-09',
  '2020-12',
];
/** Locations introduced with boolean schemas and draft-06 applicators. */
const since06: readonly Dialect[] = [
  'draft-06',
  'draft-07',
  '2019-09',
  '2020-12',
];
/** Conditional applicators introduced in draft-07. */
const since07: readonly Dialect[] = ['draft-07', '2019-09', '2020-12'];
/** Modern schema locations, including legacy locations retained by modern metaschemas. */
const modern: readonly Dialect[] = ['2019-09', '2020-12'];
/** Tuple-tail schema position retained through 2019-09. */
const tuple: readonly Dialect[] = [
  'draft-04',
  'draft-06',
  'draft-07',
  '2019-09',
];

/** Union vocabulary in observable visit order; dialect membership changes inertness, never discovery. */
export const DEFAULT_KEYWORDS: readonly KeywordDescriptor[] = [
  { keyword: '$defs', kind: 'schemaMap', dialects: modern },
  { keyword: 'definitions', kind: 'schemaMap', dialects: all },
  { keyword: 'additionalProperties', kind: 'schema', dialects: all },
  { keyword: 'not', kind: 'schema', dialects: all },
  { keyword: 'if', kind: 'schema', dialects: since07 },
  { keyword: 'then', kind: 'schema', dialects: since07 },
  { keyword: 'else', kind: 'schema', dialects: since07 },
  { keyword: 'allOf', kind: 'schemaList', dialects: all },
  { keyword: 'anyOf', kind: 'schemaList', dialects: all },
  { keyword: 'oneOf', kind: 'schemaList', dialects: all },
  { keyword: 'prefixItems', kind: 'items', dialects: ['2020-12'] },
  { keyword: 'items', kind: 'items', dialects: all },
  { keyword: 'properties', kind: 'objectMap', dialects: all },
  { keyword: 'patternProperties', kind: 'schemaMap', dialects: all },
  { keyword: 'dependentSchemas', kind: 'schemaMap', dialects: modern },
  { keyword: 'propertyNames', kind: 'schema', dialects: since06 },
  { keyword: 'contains', kind: 'schema', dialects: since06 },
  { keyword: 'additionalItems', kind: 'schema', dialects: tuple },
  { keyword: 'unevaluatedProperties', kind: 'schema', dialects: modern },
  { keyword: 'unevaluatedItems', kind: 'schema', dialects: modern },
  { keyword: 'contentSchema', kind: 'schema', dialects: modern },
  { keyword: 'dependencies', kind: 'schemaMap', dialects: all },
];

/** Shared compiled default path, independent of later mutations to the public descriptor list. */
export const DEFAULT_KEYWORD_MAP = buildKeywordMap(DEFAULT_KEYWORDS);
