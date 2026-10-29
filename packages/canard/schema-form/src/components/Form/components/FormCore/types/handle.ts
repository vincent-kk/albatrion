import type { TrackableHandlerFunction } from '@winglet/common-utils/function';

import type { Fn, Nullable } from '@aileron/declare';

import type {
  FieldNode,
  InferFieldNode,
  SetValueOption,
} from '@/schema-form/core';
import type {
  AllowedValue,
  AttachedFilesMap,
  InferValueType,
  JSONSchema,
  SetStateFnWithOptions,
} from '@/schema-form/types';

/** Imperative operations always addressing the current root. */
export interface FormHandle<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferFieldNode<Schema>;
  focus: Fn<[path?: FieldNode['path']]>;
  select: Fn<[path?: FieldNode['path']]>;
  refresh: Fn<[path?: FieldNode['path']]>;
  remount: Fn<[path?: FieldNode['path']]>;
  /** Load committed defaults; only automatic-write flags override the Form default. */
  reset: Fn<
    [
      option?:
        | typeof SetValueOption.DisableAutomaticWrites
        | typeof SetValueOption.EnableAutomaticWrites,
    ]
  >;
  /** Invalidate this schema's cached analysis and rebuild with reset's load options. */
  rebuild: FormHandle<Schema, Value>['reset'];
  findNode: Fn<[path: FieldNode['path']], Nullable<FieldNode>>;
  findNodes: Fn<[path: FieldNode['path']], readonly FieldNode[]>;
  getState: Fn<[], FieldNode['globalState']>;
  setState: Fn<[state: FieldNode['state']]>;
  clearState: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  getErrors: Fn<[], FieldNode['globalErrors']>;
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  validate: Fn<[], Promise<FieldNode['globalErrors']>>;
  showError: Fn<[visible?: boolean]>;
  submit: TrackableHandlerFunction;
}
