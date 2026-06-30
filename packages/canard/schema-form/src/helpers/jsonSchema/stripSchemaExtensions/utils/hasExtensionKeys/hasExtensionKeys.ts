import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Returns `true` when a schema declares at least one defined schema-form
 * extension key — the keys `stripSchemaExtensions` removes so a plain JSON
 * Schema validator never sees them. Shared by the strip `mutate` (per-node) and
 * `hasSchemaExtension` (tree-wide) so the key list lives in exactly one place.
 */
export const hasExtensionKeys = (
  schema: Partial<JsonSchemaWithVirtual>,
): boolean =>
  schema.FormTypeInput !== undefined ||
  schema.FormTypeInputProps !== undefined ||
  schema.FormTypeRendererProps !== undefined ||
  schema.errorMessages !== undefined ||
  schema.options !== undefined ||
  schema.injectTo !== undefined;
