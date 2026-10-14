import type { FormProps } from '../../../../src';

/**
 * Build a validatorFactory whose validator rejects every value at /name with one keyword.
 * @param keyword - Keyword reported for /name.
 * @returns The factory with a guard that accepts every value.
 */
export const createKeywordFactory = (keyword: string): NonNullable<FormProps['validatorFactory']> => ({
  compile: () => () => [{ dataPath: '/name', keyword, message: `${keyword} rejects every value` }],
  compileGuard: () => () => true,
});
