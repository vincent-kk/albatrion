export {
  convertJSONPathToPointer,
  /** @deprecated Use `convertJSONPathToPointer`. Removed in 0.16.0. */
  convertJsonPathToPointer,
  getJSONPath,
  JSONPath,
} from './JSONPath';
export {
  type AddPatch,
  applyPatch,
  type ApplyPatchOptions,
  compare,
  type CompareOptions,
  compilePointer,
  convertJSONPointerToPath,
  /** @deprecated Use `convertJSONPointerToPath`. Removed in 0.16.0. */
  convertJsonPointerToPath,
  type CopyPatch,
  difference,
  escapePath,
  escapeSegment,
  getValue,
  JSONPointer,
  mergePatch,
  type MovePatch,
  Operation,
  type Patch,
  type RemovePatch,
  type ReplacePatch,
  setValue,
  type TestPatch,
  unescapePath,
  unescapeSegment,
} from './JSONPointer';
