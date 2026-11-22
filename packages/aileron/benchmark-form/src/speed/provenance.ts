import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type Edge = { specifier: string; parent?: string; url: string };

/** Collects package identities reached from an instrumented entry replay. */
export function provenance(
  stderr: string,
  entry: string,
  root: string,
  commonjs: string[],
) {
  const edges: Edge[] = stderr
    .split('\n')
    .filter((line) => line.startsWith('SPEED_RESOLVE '))
    .map((line) => JSON.parse(line.slice(14)) as Edge);
  const reachable = new Set([pathToFileURL(entry).href]);
  let size = 0;
  while (size !== reachable.size) {
    size = reachable.size;
    for (const edge of edges)
      if (edge.parent && reachable.has(edge.parent)) reachable.add(edge.url);
  }
  const packages: Record<string, { version: string; path: string }> = {};
  const leaks: string[] = [];
  for (const url of [
    ...reachable,
    ...commonjs.map((path) => pathToFileURL(path).href),
  ]) {
    if (!url.startsWith('file:')) continue;
    const path = realpathSync(fileURLToPath(url));
    let directory = dirname(path);
    while (
      !existsSync(join(directory, 'package.json')) &&
      dirname(directory) !== directory
    )
      directory = dirname(directory);
    const manifestPath = join(directory, 'package.json');
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      name?: string;
      version?: string;
    };
    if (!manifest.name || !manifest.version) continue;
    packages[manifest.name] = { version: manifest.version, path: directory };
    if (
      directory.includes(`${sep}packages${sep}`) &&
      relative(root, directory).startsWith('..')
    )
      leaks.push(directory);
  }
  return {
    edges: edges.filter((edge) => !!edge.parent && reachable.has(edge.parent)),
    packages,
    leaks,
    complete: edges.some((edge) => edge.parent && reachable.has(edge.parent)),
  };
}
