export { JSONPointer } from './enum';

export { escapePointer } from './utils/escape/escapePointer';
export { unescapePointer } from './utils/escape/unescapePointer';
export { getValueByPointer } from './utils/manipulator/getValueByPointer';
export { setValueByPointer } from './utils/manipulator/setValueByPointer';

export { applyPatch, type ApplyPatchOptions } from './utils/patch/applyPatch';
export { compare, type CompareOptions } from './utils/patch/compare';
export { difference } from './utils/patch/difference';
export { mergePatch } from './utils/patch/mergePatch';

export type {
  Patch,
  TestPatch,
  AddPatch,
  ReplacePatch,
  RemovePatch,
  CopyPatch,
  MovePatch,
} from './utils/patch/type';
