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
  const { source } = compiler;
  if (Object.keys(source.opts).length !== compiler.optionCount) return false;
  for (const [key, value] of compiler.options)
    if (!Object.is(Reflect.get(source.opts, key), value)) return false;
  for (const [key, previous] of compiler.entries) {
    const current = readApplicationEntry(source, key);
    if (current.schema !== previous.schema || current.ref !== previous.ref)
      return false;
  }
  for (const [name, value] of compiler.rules)
    if (readKeyword(source, name) !== value) return false;
  for (const [name, value] of compiler.formats)
    if (source.formats[name] !== value) return false;
  return true;
};
