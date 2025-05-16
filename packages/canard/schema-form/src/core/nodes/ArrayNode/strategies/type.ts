import type { ArrayValue } from '@/schema-form/types';

import type { SchemaNode, UnionSetValueOption } from '../../type';

export interface ArrayNodeStrategy {
  get value(): ArrayValue | undefined;
  get length(): number;
  get children(): { id: string; node: SchemaNode }[];
  applyValue(
    this: this,
    value: ArrayValue | undefined,
    option: UnionSetValueOption,
  ): void;
  activateLink?(): void;
  push(data?: ArrayValue[number]): void;
  update(id: IndexId | number, data: ArrayValue[number]): void;
  remove(id: IndexId | number): void;
  clear(): void;
}

export type IndexId = `[${number}]`;
