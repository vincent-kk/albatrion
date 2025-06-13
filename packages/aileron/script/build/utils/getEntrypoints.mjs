/** @type {(packageJson: { exports: Record<string, {source: string}> }) => string[]} */
export const getEntrypoints = (packageJson) =>
  Object.values(packageJson.exports)
    .map(({ source }) => source)
    .filter((source) => /^(\.\/)?src\//.test(source) && source.endsWith('.ts'));
