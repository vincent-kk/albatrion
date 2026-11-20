import { observeIdentity } from './observeIdentity';
import { readApplicationEntry } from './readApplicationEntry';
import { readKeyword } from './readKeyword';
import type { PrivateCompiler } from './types';

/**
 * Compare only configured options and resources actually used by this private environment.
 * @param compiler - Environment whose imported entries and configured definitions are compared with the application.
 * @returns Whether every observed option, entry, keyword and format still matches.
 */
export const isPrivateCompilerCurrent = (
  compiler: PrivateCompiler,
): boolean => {
  if (compiler.retired) return false;
  const { source, identities } = compiler;
  const keys = Object.keys(source._opts);
  if (keys.length !== compiler.optionCount || !compiler.optionKeys)
    return false;
  for (let index = 0; index < keys.length; index++)
    if (keys[index] !== compiler.optionKeys[index]) return false;
  for (const [key, value] of compiler.options)
    if (
      !Object.is(
        observeIdentity(identities, Reflect.get(source._opts, key)),
        value,
      )
    )
      return false;
  for (const [key, previous] of compiler.entries) {
    const current = readApplicationEntry(source, key);
    if (
      observeIdentity(identities, current.schema) !== previous.schema ||
      observeIdentity(identities, current.ref) !== previous.ref
    )
      return false;
  }
  const macro = compiler.macroProfile;
  if (macro) {
    const rules = Object.keys(source.RULES.keywords);
    const formats = Object.keys(source._formats);
    if (
      rules.length !== macro.rules.length ||
      formats.length !== macro.formats.length ||
      rules.some((name, index) => name !== macro.rules[index]) ||
      formats.some((name, index) => name !== macro.formats[index])
    )
      return false;
  }
  for (const [name, value] of compiler.rules)
    if (observeIdentity(identities, readKeyword(source, name)) !== value)
      return false;
  for (const [name, value] of compiler.formats)
    if (observeIdentity(identities, source._formats[name]) !== value)
      return false;
  return true;
};
