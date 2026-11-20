import { observeIdentity } from './observeIdentity';
import { readKeyword } from './readKeyword';
import type { PrivateCompiler } from './types';

/**
 * Observe the extension namespace that native macro expansions can use.
 * @param compiler - Private environment compiling an opaque macro expansion.
 * @returns No value; remembers names and opaque identities, including shape changes.
 */
export const recordMacroProfile = (compiler: PrivateCompiler): void => {
  const { source, identities } = compiler;
  const rules = Object.keys(source.RULES.keywords);
  const formats = Object.keys(source._formats);
  compiler.macroProfile = { rules, formats };
  for (const name of rules)
    compiler.rules.set(
      name,
      observeIdentity(identities, readKeyword(source, name)),
    );
  for (const name of formats)
    compiler.formats.set(
      name,
      observeIdentity(identities, source._formats[name]),
    );
};
