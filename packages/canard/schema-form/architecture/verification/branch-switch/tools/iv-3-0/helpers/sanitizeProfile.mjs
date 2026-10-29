import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Preserve call-frame identity while replacing absolute file URLs with portable input addresses. */
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
