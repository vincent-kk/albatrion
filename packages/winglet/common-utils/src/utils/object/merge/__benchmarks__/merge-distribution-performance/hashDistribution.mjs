import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Hash an isolated package manifest and every built artifact without following links.
 * @param root - Immutable artifact package root containing package.json and dist.
 * @returns Relative artifact paths mapped to SHA-256 digests.
 */
export const hashDistribution = (root) => {
  const paths = ['package.json'];
  const pending = ['dist'];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of readdirSync(join(root, directory), {
      withFileTypes: true,
    })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink())
        throw new Error(`Artifact symlink rejected: ${path}`);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile()) paths.push(path);
    }
  }
  return Object.fromEntries(
    paths.sort().map((path) => [
      path,
      createHash('sha256')
        .update(readFileSync(join(root, path)))
        .digest('hex'),
    ]),
  );
};
