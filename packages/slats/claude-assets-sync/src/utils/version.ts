/**
 * Version comparison utilities
 *
 * These functions provide exact string-based version comparison
 * for semantic versioning with pre-release and build metadata support.
 */

/**
 * Compare two semantic versions for exact equality
 *
 * Performs case-sensitive exact string comparison of version strings.
 * Supports semver format including pre-release and build metadata:
 * - Major.Minor.Patch (e.g., "1.2.3")
 * - Pre-release (e.g., "1.0.0-alpha", "1.0.0-rc.1")
 * - Build metadata (e.g., "1.0.0+build.123")
 * - Combined (e.g., "1.0.0-rc.1+build.456")
 *
 * @param v1 - First version string
 * @param v2 - Second version string
 * @returns true if versions are exactly equal (case-sensitive)
 *
 * @example
 * compareVersions('1.0.0', '1.0.0') // true
 * compareVersions('1.0.0', '1.0.1') // false
 * compareVersions('1.0.0-alpha', '1.0.0-Alpha') // false (case-sensitive)
 * compareVersions('1.0.0+build.1', '1.0.0+build.1') // true
 */
export function compareVersions(v1: string, v2: string): boolean {
  // Exact string comparison (case-sensitive)
  return v1 === v2;
}

/**
 * Check if version synchronization is needed
 *
 * Determines whether assets need to be re-synced based on version comparison.
 * Sync is needed in the following cases:
 * - First sync (syncedVersion is undefined)
 * - Empty version strings (currentVersion or syncedVersion is empty)
 * - Version mismatch (versions are not exactly equal)
 *
 * @param currentVersion - Current package version from package.json
 * @param syncedVersion - Previously synced version from .sync-meta.json (undefined if never synced)
 * @returns true if sync is needed, false if versions match
 *
 * @example
 * // First sync
 * needsVersionSync('1.0.0', undefined) // true
 *
 * // Version mismatch
 * needsVersionSync('1.0.1', '1.0.0') // true
 *
 * // Versions match
 * needsVersionSync('1.0.0', '1.0.0') // false
 *
 * // Empty strings
 * needsVersionSync('', '1.0.0') // true
 * needsVersionSync('1.0.0', '') // true
 */
export function needsVersionSync(
  currentVersion: string,
  syncedVersion?: string,
): boolean {
  // First sync (no previous version recorded)
  if (syncedVersion === undefined) {
    return true;
  }

  // Empty version strings need sync
  if (currentVersion === '' || syncedVersion === '') {
    return true;
  }

  // Version mismatch needs sync
  return !compareVersions(currentVersion, syncedVersion);
}
