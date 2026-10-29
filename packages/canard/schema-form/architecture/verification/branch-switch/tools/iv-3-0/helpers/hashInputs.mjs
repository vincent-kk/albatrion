import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Hash canonical inputs without sampling product execution.
 * @param {string} repoDir Absolute repository root containing built workspace dependencies.
 * @returns SHA-256 digests keyed by repository-relative source, tool and runtime paths.
 * @throws For unreadable inputs or missing designated build outputs.
 */
export function hashInputs(repoDir) {
  const packagePath = 'packages/canard/schema-form/';
  const pending = [
    packagePath + 'src',
    packagePath + 'architecture/verification/branch-switch/tools',
    packagePath + 'architecture/verification/design-optimization/tools',
    packagePath + 'dist/index.node.mjs',
    packagePath + 'package.json',
    packagePath + 'rolldown.config.mjs',
    'yarn.lock',
  ];
  for (const name of ['common-utils', 'json', 'json-schema', 'react-utils'])
    for (const input of ['src', 'dist', 'package.json'])
      pending.push('packages/winglet/' + name + '/' + input);
  pending.push('node_modules/react', 'node_modules/react-dom');
  const hashes = {};
  while (pending.length) {
    const relative = pending.pop();
    const absolute = path.join(repoDir, relative);
    if (fs.statSync(absolute).isDirectory()) {
      pending.push(
        ...fs.readdirSync(absolute).map((name) => relative + '/' + name),
      );
      continue;
    }
    hashes[relative] = createHash('sha256')
      .update(fs.readFileSync(absolute))
      .digest('hex');
  }
  return Object.fromEntries(
    Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)),
  );
}
