/**
 * Split a stored URI without normalizing either displayed part.
 * @param uri - Stored text, including an empty or scheme-less value.
 * @returns The exact scheme and delimiter prefix, and the remaining path.
 */
export const parseUri = (uri: string) => {
  const match = uri.match(/^([a-z][a-z0-9+.-]*:(?:\/\/)?)([\s\S]*)$/i);
  return match ? { protocol: match[1], path: match[2] } : { protocol: '', path: uri };
};
