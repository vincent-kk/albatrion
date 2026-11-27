import {
  RESERVED_SCHEMA_KEYS,
  WRITE_CONTROL_KEYS,
} from '@/schema-form/constants/reservedSchemaKeys';

/** Kind precedence spans phases; authored rules derive their ranks from the reserved vocabulary. */
export const KIND_RANK = {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Enumeration preserves exactly the canonical write keys.
  ...(Object.fromEntries(
    WRITE_CONTROL_KEYS.map((key) => [
      key,
      RESERVED_SCHEMA_KEYS.controls[key].writeRank,
    ]),
  ) as Record<(typeof WRITE_CONTROL_KEYS)[number], number>),
  fill: 1,
} as const;
