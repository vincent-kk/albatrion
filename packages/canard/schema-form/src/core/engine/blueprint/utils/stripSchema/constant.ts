import {
  EXTENDED_KEYWORDS,
  type KeywordDescriptor,
} from '@winglet/json-schema/scanner';

/** Draft-07 dependencies may hold schemas or string arrays; mutation skips arrays. */
export const STRIP_SCHEMA_KEYWORDS: readonly KeywordDescriptor[] = [
  ...EXTENDED_KEYWORDS,
  { keyword: 'dependencies', kind: 'schemaMap' },
];
