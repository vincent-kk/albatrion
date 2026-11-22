/**
 * Complete a configured protocol while preserving an explicit delimiter.
 * @param protocol - Bare scheme name or scheme with a colon or colon-slash-slash.
 * @returns A selectable URI prefix with the caller's spelling unchanged.
 */
export const formatProtocol = (protocol: string): string => {
  if (!protocol || /:(?:\/\/)?$/.test(protocol)) return protocol;
  return protocol + (/^(http|https|ftp)$/i.test(protocol) ? '://' : ':');
};
