/**
 * 빌드 옵션의 유효성을 검증합니다.
 * @type {(options: {
 *   entrypoints?: string[];
 *   format?: string;
 *   extension?: string;
 *   outDir?: string;
 * }) => void}
 */
export const validateBuildOptions = (options) => {
  const errors = [];

  // entrypoints 검증
  if (!options.entrypoints || !Array.isArray(options.entrypoints)) {
    errors.push('entrypoints must be an array');
  } else if (options.entrypoints.length === 0) {
    errors.push('At least one entrypoint is required');
  } else {
    const invalidEntrypoints = options.entrypoints.filter(
      (entry) => typeof entry !== 'string' || !entry.trim(),
    );
    if (invalidEntrypoints.length > 0) {
      errors.push('All entrypoints must be non-empty strings');
    }
  }

  // format 검증
  if (
    options.format &&
    !['esm', 'cjs', 'umd', 'iife'].includes(options.format)
  ) {
    errors.push(
      `Invalid format: ${options.format}. Must be one of: esm, cjs, umd, iife`,
    );
  }

  // extension 검증
  if (options.extension && !['js', 'cjs', 'mjs'].includes(options.extension)) {
    errors.push(
      `Invalid extension: ${options.extension}. Must be one of: js, cjs, mjs`,
    );
  }

  // outDir 검증
  if (
    options.outDir &&
    (typeof options.outDir !== 'string' || !options.outDir.trim())
  ) {
    errors.push('outDir must be a non-empty string');
  }

  if (errors.length > 0) {
    throw new Error(
      `Build options validation failed:\n${errors.map((err) => `  - ${err}`).join('\n')}`,
    );
  }
};

/**
 * 번들 빌드 옵션의 유효성을 검증합니다.
 * @type {(options: {
 *   entry?: string;
 *   entrypoints?: string[];
 *   format?: string;
 *   outFile?: string;
 *   outDir?: string;
 *   name?: string;
 * }) => void}
 */
export const validateBundleOptions = (options) => {
  const errors = [];

  // entry vs entrypoints 검증
  if (!options.entry && !options.entrypoints) {
    errors.push('Either entry or entrypoints must be provided');
  }
  if (options.entry && options.entrypoints) {
    errors.push('Cannot provide both entry and entrypoints');
  }

  // format 검증
  if (!options.format) {
    errors.push('format is required');
  } else if (!['esm', 'cjs', 'umd', 'iife'].includes(options.format)) {
    errors.push(
      `Invalid format: ${options.format}. Must be one of: esm, cjs, umd, iife`,
    );
  }

  // 출력 설정 검증
  const isSingleBundle = !!options.entry;
  if (isSingleBundle && !options.outFile) {
    errors.push('outFile is required when using single entry');
  }
  if (!isSingleBundle && !options.outDir) {
    errors.push('outDir is required when using multiple entrypoints');
  }

  // UMD/IIFE 형식에서 name 필수
  if (
    (options.format === 'umd' || options.format === 'iife') &&
    !options.name
  ) {
    errors.push(`name is required for ${options.format} format`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Bundle options validation failed:\n${errors.map((err) => `  - ${err}`).join('\n')}`,
    );
  }
};
