import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Replace absolute frame URLs in place with portable addresses while retaining function/line identity.
 * @param {any} profile Parsed CpuProfile whose nodes and callFrame URLs will be mutated.
 * @param {string} repoDir Canonical absolute repository root.
 * @param {string} root Canonical absolute prepared root, resolved through filesystem aliases.
 * @returns The same profile object with repository/prepared/external portable URLs.
 * @throws If a malformed file URL cannot be decoded.
 */
export function sanitizeProfile(profile, repoDir, root) {
  for (const node of profile.nodes) {
    const url = node.callFrame.url;
    if (!url || url.startsWith('node:')) continue;
    const file = url.startsWith('file://') ? fileURLToPath(url) : url;
    node.callFrame.url = file.startsWith(repoDir + '/')
      ? path.relative(repoDir, file)
      : file.startsWith(root + '/')
        ? 'prepared/' + path.relative(root, file)
        : path.isAbsolute(file)
          ? 'external/' + path.basename(file)
          : file;
  }
  return profile;
}
