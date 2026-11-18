import { stripFragment } from '@/schema-form/helpers/jsonPointer';

/**
 * Convert canonical form schema addresses to the validator's RFC 6901 contract.
 * @param schemaPath - Authored schema address whose reserved names use form escapes.
 * @returns A fragment-free pointer preserving ordinary percent names and ~ escapes.
 */
export const toStandardSchemaPointer = (schemaPath: string): string =>
  stripFragment(schemaPath).replace(
    /\/(%2A|%2E%2E|%2E|%40)(?=\/|$)/g,
    (_, token: string) =>
      '/' + (token === '%2A' ? '*' : token === '%40' ? '@' : token === '%2E' ? '.' : '..'),
  );
