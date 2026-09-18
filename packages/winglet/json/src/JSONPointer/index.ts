export { JSONPointer } from './enum';

export {
  convertJSONPointerToPath,
  /** @deprecated Use `convertJSONPointerToPath`. Removed in 0.16.0. */
  convertJsonPointerToPath,
} from './utils/convertJSONPointerToPath';
export {
  escapePath,
  escapeSegment,
  unescapePath,
  unescapeSegment,
} from './utils/escape';
export { compilePointer, getValue, setValue } from './utils/manipulator';
export {
  type AddPatch,
  applyPatch,
  type ApplyPatchOptions,
  compare,
  type CompareOptions,
  type CopyPatch,
  difference,
  mergePatch,
  type MovePatch,
  Operation,
  type Patch,
  type RemovePatch,
  type ReplacePatch,
  type TestPatch,
} from './utils/patch';
