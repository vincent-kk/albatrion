export { escapePointer } from './escape/escapePointer';
export { unescapePointer } from './escape/unescapePointer';
export { getValueByPointer } from './manipulator/getValueByPointer';
export { setValueByPointer } from './manipulator/setValueByPointer';

export { applyPatch, type ApplyPatchOptions } from './patch/applyPatch';
export { compare, type CompareOptions } from './patch/compare';
export { difference } from './patch/difference';
export { mergePatch } from './patch/mergePatch';

export type {
  Patch,
  TestPatch,
  AddPatch,
  ReplacePatch,
  RemovePatch,
  CopyPatch,
  MovePatch,
} from './patch/type';
