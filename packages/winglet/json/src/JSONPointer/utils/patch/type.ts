export const Operation = {
  ADD: 'add',
  REPLACE: 'replace',
  REMOVE: 'remove',
  MOVE: 'move',
  COPY: 'copy',
  TEST: 'test',
} as const;

export type Operation = (typeof Operation)[keyof typeof Operation];

interface BasePatch {
  op: Operation;
  path: string;
}

export interface TestPatch<Value> extends BasePatch {
  op: typeof Operation.TEST;
  value: Value;
}

export interface AddPatch<Value> extends BasePatch {
  op: typeof Operation.ADD;
  value: Value;
}

export interface ReplacePatch<Value> extends BasePatch {
  op: typeof Operation.REPLACE;
  value: Value;
}

export interface RemovePatch extends BasePatch {
  op: typeof Operation.REMOVE;
}

export interface CopyPatch extends BasePatch {
  op: typeof Operation.COPY;
  from: string;
}

export interface MovePatch extends BasePatch {
  op: typeof Operation.MOVE;
  from: string;
}

export type Patch =
  | TestPatch<any>
  | AddPatch<any>
  | ReplacePatch<any>
  | RemovePatch
  | MovePatch
  | CopyPatch;

export type CompareOptions = {
  strict?: boolean;
  immutable?: boolean;
};

export type ApplyPatchOptions = {
  strict?: boolean;
  immutable?: boolean;
  protectPrototype?: boolean;
};
