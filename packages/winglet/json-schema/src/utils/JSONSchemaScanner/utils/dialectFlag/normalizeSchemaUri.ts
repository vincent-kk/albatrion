/**
 * Reduce a `$schema` URI to the spelling dialect tables are keyed by.
 * @param uri Declared `$schema` value.
 * @returns The URI with an `https:` scheme read as `http:` and a trailing empty fragment removed.
 */
export function normalizeSchemaUri(uri: string): string {
  return uri.replace(/^https:/, 'http:').replace(/#$/, '');
}
