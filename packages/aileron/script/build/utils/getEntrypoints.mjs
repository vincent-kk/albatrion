/**
 * package.json의 exports에서 entrypoints를 추출합니다.
 * @type {(packageJson: { exports?: Record<string, {source?: string}> }) => string[]}
 */
export const getEntrypoints = (packageJson) => {
  if (!packageJson) {
    throw new Error('package.json is required');
  }

  if (!packageJson.exports) {
    throw new Error('package.json must have exports field');
  }

  if (typeof packageJson.exports !== 'object') {
    throw new Error('package.json exports must be an object');
  }

  const entrypoints = Object.values(packageJson.exports)
    .map(({ source }) => source)
    .filter(
      (source) =>
        source && /^(\.\/)?src\//.test(source) && source.endsWith('.ts'),
    );

  if (entrypoints.length === 0) {
    throw new Error(
      'No valid TypeScript entrypoints found in package.json exports',
    );
  }

  return entrypoints;
};

/**
 * entrypoints의 유효성을 검증합니다.
 * @type {(entrypoints: string[]) => void}
 */
export const validateEntrypoints = (entrypoints) => {
  if (!Array.isArray(entrypoints)) {
    throw new Error('Entrypoints must be an array');
  }

  if (entrypoints.length === 0) {
    throw new Error('At least one entrypoint is required');
  }

  const invalidEntrypoints = entrypoints.filter(
    (entry) => !entry || typeof entry !== 'string' || !entry.endsWith('.ts'),
  );

  if (invalidEntrypoints.length > 0) {
    throw new Error(
      `Invalid entrypoints found: ${invalidEntrypoints.join(', ')}`,
    );
  }
};
