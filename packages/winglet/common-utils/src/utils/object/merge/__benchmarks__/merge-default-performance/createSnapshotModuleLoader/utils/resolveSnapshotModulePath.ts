import { posix } from 'node:path';

/**
 * Resolve only local source and the package's own source alias.
 * @param name - Required module specifier emitted by TypeScript.
 * @param importer - Importing source path relative to this package.
 * @param paths - Allowed TypeScript/JavaScript files in this exact snapshot.
 * @returns A canonical allowed source path; throws for external or escaped imports.
 */
export const resolveSnapshotModulePath = (
  name: string,
  importer: string,
  paths: ReadonlySet<string>,
): string => {
  const base =
    name === '@/common-utils'
      ? 'src'
      : name.startsWith('@/common-utils/')
        ? `src/${name.slice('@/common-utils/'.length)}`
        : name.startsWith('.')
          ? posix.join(posix.dirname(importer), name)
          : undefined;
  if (base === undefined)
    throw new Error(`External benchmark import rejected: ${name}`);
  const normalized = posix.normalize(base);
  if (normalized !== 'src' && !normalized.startsWith('src/'))
    throw new Error(`Source boundary escape rejected: ${name}`);
  for (const path of [
    normalized,
    `${normalized}.ts`,
    `${normalized}.tsx`,
    `${normalized}.js`,
    `${normalized}/index.ts`,
    `${normalized}/index.tsx`,
    `${normalized}/index.js`,
  ])
    if (paths.has(path)) return path;
  throw new Error(`Missing snapshot source: ${importer} -> ${name}`);
};
