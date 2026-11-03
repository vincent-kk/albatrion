/**
 * Matches a repository-relative directory against a Yarn workspace glob.
 * @param {string} directory POSIX directory without a trailing slash.
 * @param {string} pattern Root workspace glob using *, **, and ?.
 * @returns {boolean} Whether the whole directory matches; unsupported syntax throws.
 */
export function matchWorkspacePattern(directory, pattern) {
  if (/[!{}[\]]/.test(pattern)) throw new Error(`Unsupported workspace pattern: ${pattern}`);
  const expression = pattern.split('/').map((part) => {
    if (part === '**') return '(?:[^/]+/)*';
    return part.replace(/[.+^$()|\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]') + '/';
  }).join('');
  return new RegExp(`^${expression}$`).test(`${directory}/`);
}
