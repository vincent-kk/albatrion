/**
 * Message gate used before classifying a compile failure as a duplicate schema id.
 * Matches messages that contain either of the two substrings AJV uses for duplicate ids, so meta-schema errors such as `must NOT have duplicate items` stay unclassified:
 * - AJV 6: `schema with key or id "…" already exists`, `id "…" resolves to more than one schema`
 * - AJV 7 and 8: `schema with key or id "…" already exists`, `reference "…" resolves to more than one schema`
 */
export const DUPLICATE_SCHEMA_ID_MESSAGE =
  /already exists|resolves to more than one schema/i;
