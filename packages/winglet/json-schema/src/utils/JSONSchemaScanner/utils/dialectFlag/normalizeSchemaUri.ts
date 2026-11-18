/**
 * Reduce a `$schema` URI to the spelling dialect tables are keyed by.
 * @param uri Declared `$schema` value; path, query and user information remain case-sensitive.
 * @returns A case-normalized scheme and host, with HTTPS read as HTTP and an empty fragment removed.
 */
export function normalizeSchemaUri(uri: string): string {
  return uri
    .replace(
      /^([a-z][a-z\d+.-]*:)(?:\/\/([^/?#]*))?/i,
      (_match, scheme: string, authority: string | undefined) => {
        const normalized = scheme.toLowerCase().replace(/^https:$/, 'http:');
        if (authority === undefined) return normalized;
        const host = authority.lastIndexOf('@') + 1;
        return (
          normalized +
          '//' +
          authority.slice(0, host) +
          authority.slice(host).toLowerCase()
        );
      },
    )
    .replace(/#$/, '');
}
