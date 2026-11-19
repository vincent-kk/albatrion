import type { PrivateCompiler } from './types';

/**
 * Point new compilations at live registry containers without touching existing generated functions.
 * @param compiler - Private compiler whose new compilations use the application extension containers.
 * @returns No value; synchronizes only the private environment.
 */
export const syncNativeProfile = (compiler: PrivateCompiler): void => {
  if (compiler.instance.RULES !== compiler.source.RULES)
    Object.defineProperty(compiler.instance, 'RULES', {
      value: compiler.source.RULES,
      configurable: true,
    });
  if (compiler.instance.formats !== compiler.source.formats)
    Object.defineProperty(compiler.instance, 'formats', {
      value: compiler.source.formats,
      configurable: true,
    });
};
