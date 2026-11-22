import { createHash } from 'node:crypto';
import { readFile, readdir, realpath } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

/** Resolves and verifies a package's public Node ESM distribution entry. */
export async function resolveArm(
  root: string,
  packagePath: string,
  packageName: string,
  entry: string,
) {
  const tree = await realpath(root);
  const directory = await realpath(join(tree, packagePath));
  const contains = (parent: string, child: string) => {
    const path = relative(parent, child);
    return (
      path !== '..' && !path.startsWith(`..${sep}`) && !path.startsWith(sep)
    );
  };
  if (!contains(tree, directory)) throw new Error('Package is outside arm');
  const manifest = JSON.parse(
    await readFile(join(directory, 'package.json'), 'utf8'),
  );
  if (manifest.name !== packageName) throw new Error('Package name mismatch');
  const dist = await realpath(join(directory, 'dist'));
  if (!contains(directory, dist)) throw new Error('Dist is outside package');
  const select = (value: unknown): string => {
    if (typeof value === 'string' && value.startsWith('./')) return value;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const conditions = value as Record<string, unknown>;
      for (const key of ['node', 'import', 'default']) {
        if (key in conditions) return select(conditions[key]);
      }
    }
    throw new Error('No public ESM export');
  };
  const path = await realpath(
    resolve(directory, select(manifest.exports?.[entry])),
  );
  if (!contains(dist, path)) throw new Error('Entry is outside dist');
  if (manifest.publishConfig?.exports !== undefined) {
    const published = await realpath(
      resolve(directory, select(manifest.publishConfig.exports[entry])),
    );
    if (published !== path) throw new Error('Published entry differs');
  }
  const hash = createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
  const distHasher = createHash('sha256');
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const item of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(directory, item.name);
      if (item.isDirectory()) await visit(file);
      else if (item.isFile())
        distHasher.update(relative(dist, file)).update(await readFile(file));
    }
  };
  await visit(dist);
  const lockHash = createHash('sha256')
    .update(await readFile(join(root, 'yarn.lock')))
    .digest('hex');
  return {
    path,
    packageName,
    version: manifest.version as string,
    hash,
    distHash: distHasher.digest('hex'),
    lockHash,
  };
}
