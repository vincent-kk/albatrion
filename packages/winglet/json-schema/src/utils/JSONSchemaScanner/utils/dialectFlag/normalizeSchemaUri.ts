/**
 * Reduce a `$schema` URI to the spelling dialect tables are keyed by.
 * @param uri Declared `$schema` value; path, query and user information remain case-sensitive.
 * @returns A case-normalized scheme and host, with default ports removed before HTTPS is read as HTTP, and an empty fragment removed.
 */
export function normalizeSchemaUri(uri: string): string {
  return uri
    .replace(
      /^([a-z][a-z\d+.-]*:)(?:\/\/([^/?#]*))?/i,
      (_match, scheme: string, authority: string | undefined) => {
        const protocol = scheme.toLowerCase();
        const normalized = protocol === 'https:' ? 'http:' : protocol;
        if (authority === undefined) return normalized;
        const host = authority.lastIndexOf('@') + 1;
        const colon = authority.lastIndexOf(':');
        if (colon >= host) {
          const port = authority.slice(colon + 1);
          if (/^\d*$/.test(port) && (port === '' ||
            (protocol === 'http:' && Number(port) === 80) ||
            (protocol === 'https:' && Number(port) === 443))) authority = authority.slice(0, colon);
        }
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
