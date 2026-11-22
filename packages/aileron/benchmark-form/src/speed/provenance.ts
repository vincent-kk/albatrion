import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Records resolved files and package identities, including duplicate versions. */
export function provenance(urls: string[], root: string) {
  const tree = realpathSync(root);
  const packages = new Map<
    string,
    { name: string; version: string; path: string }
  >();
  const leaks: string[] = [];
  const runtimePaths: Record<string, Set<string>> = {
    react: new Set(),
    'react-dom': new Set(),
  };
  for (const url of urls) {
    const file = fileURLToPath(url);
    if (!existsSync(file)) continue;
    const path = realpathSync(file);
    let directory = dirname(path);
    while (
      !existsSync(join(directory, 'package.json')) &&
      dirname(directory) !== directory
    )
      directory = dirname(directory);
    if (!existsSync(join(directory, 'package.json'))) continue;
    const manifest = JSON.parse(
      readFileSync(join(directory, 'package.json'), 'utf8'),
    ) as { name?: string; version?: string };
    if (!manifest.name || !manifest.version) continue;
    const item = {
      name: manifest.name,
      version: manifest.version,
      path: realpathSync(directory),
    };
    packages.set(JSON.stringify(item), item);
    if (
      /^@(canard|winglet|lerx|slats)\//.test(item.name) ||
      item.name === 'react' ||
      item.name === 'react-dom'
    ) {
      const inside = relative(tree, path);
      if (inside === '..' || inside.startsWith(`..${sep}`)) leaks.push(path);
    }
    runtimePaths[item.name]?.add(item.path);
  }
  for (const [name, paths] of Object.entries(runtimePaths))
    if (paths.size > 1)
      leaks.push(`Multiple ${name} paths: ${[...paths].join(', ')}`);
  return {
    urls,
    packages: [...packages.values()].sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b)),
    ),
    leaks,
  };
}
