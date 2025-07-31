import { JSONPointer } from '@/json/JSONPointer/enum';

import { escapeSegment } from './escapeSegment';

/**
 * Escapes a complete JSON Pointer path by escaping each segment individually.
 *
 * This function takes a full JSON Pointer path and ensures that all segments
 * within the path are properly escaped according to RFC 6901 specifications.
 * It splits the path by the separator character (`/`), escapes each segment
 * using the `escapeSegment` function, and then rejoins them to form a valid
 * escaped JSON Pointer.
 *
 * **Important**: Only special characters **within segments** are escaped.
 * The path separator (`/`) characters are preserved as-is since they define
 * the path structure.
 *
 * **Key Features:**
 * - **Path-level escaping**: Handles complete JSON Pointer paths with multiple segments
 * - **Segment isolation**: Each path segment is escaped independently
 * - **RFC 6901 compliance**: Follows official JSON Pointer specification
 * - **Performance optimized**: Leverages efficient segment-level escaping
 * - **Structure preservation**: Path separators remain unchanged
 *
 * **Use Cases:**
 * - Converting user-provided paths to safe JSON Pointer expressions
 * - Preparing dynamic paths for JSON Pointer operations
 * - Sanitizing paths that may contain special characters in segment names
 * - Building JSON Pointers programmatically from potentially unsafe input
 *
 * @param path - The JSON Pointer path to escape. Should be a valid path structure
 *               with segments separated by `/` characters. Can start with or without
 *               a leading `/`. Empty segments and segments with special characters
 *               are handled correctly.
 *
 * @returns The fully escaped JSON Pointer path where all segments have been
 *          individually escaped. The path structure (separator characters) is
 *          preserved while segment content is made safe for JSON Pointer usage.
 *
 * @see {@link escapeSegment} for individual segment escaping logic
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6901} RFC 6901 - JSON Pointer specification
 *
 * @example
 * ```typescript
 * // Basic segment escaping (only tildes in segments are escaped)
 * escapePath('/users/john~doe/settings');
 * // Returns: "/users/john~0doe/settings"
 *
 * escapePath('/config/app~name/value');
 * // Returns: "/config/app~0name/value"
 * ```
 *
 * @example
 * ```typescript
 * // Path separators are NOT escaped (they define structure)
 * escapePath('/files/config/database');
 * // Returns: "/files/config/database" (unchanged - no special chars in segments)
 *
 * escapePath('/docs/api/endpoints');
 * // Returns: "/docs/api/endpoints" (unchanged - no special chars in segments)
 * ```
 *
 * @example
 * ```typescript
 * // Multiple segments with special characters
 * escapePath('/app~config/database~host/connection');
 * // Returns: "/app~0config/database~0host/connection"
 *
 * escapePath('/users/~/profile/~/settings');
 * // Returns: "/users/~0/profile/~0/settings"
 * ```
 *
 * @example
 * ```typescript
 * // Edge cases and various path formats
 * escapePath('');
 * // Returns: "" (empty path)
 *
 * escapePath('/');
 * // Returns: "/" (root with empty segment)
 *
 * escapePath('segment~name');
 * // Returns: "segment~0name" (single segment, no leading slash)
 *
 * escapePath('/multiple~tildes~~~in~segment/normal');
 * // Returns: "/multiple~0tildes~0~0~0in~0segment/normal"
 * ```
 *
 * @example
 * ```typescript
 * // Real-world usage scenarios
 * const userPath = '/users/jane.doe@company.com/preferences';
 * const escapedUserPath = escapePath(userPath);
 * // Result: "/users/jane.doe@company.com/preferences" (no escaping needed)
 *
 * const configPath = '/env/production/database~config/host';
 * const escapedConfigPath = escapePath(configPath);
 * // Result: "/env/production/database~0config/host"
 *
 * const backupPath = '/uploads/backup~2023/archive';
 * const escapedBackupPath = escapePath(backupPath);
 * // Result: "/uploads/backup~02023/archive"
 * ```
 *
 * @example
 * ```typescript
 * // Dynamic path building with user input
 * const buildUserSettingPath = (userId: string, setting: string) => {
 *   const rawPath = `/users/${userId}/settings/${setting}`;
 *   return escapePath(rawPath);
 * };
 *
 * buildUserSettingPath('user~123', 'theme~dark');
 * // Returns: "/users/user~0123/settings/theme~0dark"
 *
 * buildUserSettingPath('normaluser', 'normalsetting');
 * // Returns: "/users/normaluser/settings/normalsetting"
 * ```
 *
 * @example
 * ```typescript
 * // RFC 6901 compliance examples
 * escapePath('/foo/bar');
 * // Returns: "/foo/bar" (no special characters in segments)
 *
 * escapePath('/a~b');
 * // Returns: "/a~0b" (tilde in segment content)
 *
 * escapePath('/special!@#$%^&*()/chars');
 * // Returns: "/special!@#$%^&*()/chars" (only tildes need escaping)
 * ```
 */
export const escapePath = (path: string): string => {
  const segments = path.split(JSONPointer.Separator);
  const length = segments.length;
  if (length === 0) return '';
  if (length === 1) return escapeSegment(segments[0]);
  let result = escapeSegment(segments[0]);
  for (let i = 1; i < length; i++)
    result += JSONPointer.Separator + escapeSegment(segments[i]);
  return result;
};
