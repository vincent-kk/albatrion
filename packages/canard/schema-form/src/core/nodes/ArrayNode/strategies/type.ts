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
  activateLink(): boolean;
  push(data?: ArrayValue[number]): this;
  update(id: IndexId | number, data: ArrayValue[number]): this;
  remove(id: IndexId | number): this;
  clear(): this;
}

export type IndexId = `[${number}]`;
