import { createHash } from 'node:crypto';
import { readFile, readdir, realpath } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Resolves and verifies a package's public Node ESM distribution entry. */
export async function resolveArm(
  root: string,
  packagePath: string,
  packageName: string,
  entry: string,
) {
  const directory = await realpath(join(root, packagePath));
  const manifest = JSON.parse(
    await readFile(join(directory, 'package.json'), 'utf8'),
  );
  if (manifest.name !== packageName) throw new Error('Package name mismatch');
  const specifier =
    entry === '.' ? packageName : `${packageName}/${entry.slice(2)}`;
  const resolver = import.meta.resolve as (
    specifier: string,
    parent?: string,
  ) => string;
  const url = resolver(
    specifier,
    pathToFileURL(join(directory, 'package.json')).href,
  );
  const path = await realpath(fileURLToPath(url));
  const dist = await realpath(join(directory, 'dist'));
  const inside = relative(dist, path);
  if (
    inside.startsWith(`..${sep}`) ||
    inside === '..' ||
    resolve(dist, inside) !== path
  )
    throw new Error('Entry is outside dist');
  const published = manifest.publishConfig?.exports?.[entry];
  if (published) {
    const select = (value: any): string | undefined =>
      typeof value === 'string'
        ? value
        : value &&
          (select(value.node) ?? select(value.import) ?? select(value.default));
    const target = select(published);
    if (
      !target ||
      (await realpath(
        resolve(dirname(join(directory, 'package.json')), target),
      )) !== path
    )
      throw new Error('Published entry differs');
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
