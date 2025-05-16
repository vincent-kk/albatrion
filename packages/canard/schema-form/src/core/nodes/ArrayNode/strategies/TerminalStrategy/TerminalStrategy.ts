import { equals } from '@winglet/common-utils';

import {
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseArray } from '@/schema-form/core/parsers';
import type { ArrayValue } from '@/schema-form/types';

import type { ArrayNode } from '../../ArrayNode';
import type { ArrayNodeStrategy, IndexId } from '../type';

export class TerminalStrategy implements ArrayNodeStrategy {
  #host: ArrayNode;

  #seq: number = 0;
  #ids: IndexId[] = [];

  #value: ArrayValue | undefined = [];

  get value() {
    return this.#value;
  }
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param input - 설정할 배열 값
   * @param option - 설정 옵션
   */
  applyValue(input: ArrayValue, option: UnionSetValueOption) {
    this.#emitChange(input, option);
  }

  get children() {
    return [];
  }

  get length() {
    return this.#value?.length ?? 0;
  }

  constructor(host: ArrayNode) {
    this.#host = host;
    if (host.defaultValue !== undefined) this.#emitChange(host.defaultValue);
  }

  push(input?: ArrayValue[number]) {
    if (
      this.#host.jsonSchema.maxItems &&
      this.#host.jsonSchema.maxItems <= this.length
    )
      return;
    const id = `[${this.#seq++}]` satisfies IndexId;
    this.#ids.push(id);
    const data = input ?? this.#host.jsonSchema.items.default ?? undefined;
    const value = this.#value === undefined ? [data] : [...this.#value, data];
    this.#emitChange(value);
  }

  update(id: IndexId | number, data: ArrayValue[number]) {
    if (this.#value === undefined) return;
    const index = typeof id === 'number' ? id : this.#ids.indexOf(id);
    if (index === -1 || index >= this.#value.length) return;
    const value = [...this.#value];
    value[index] = data;
    this.#emitChange(value);
  }

  remove(id: IndexId | number) {
    if (this.#value === undefined) return;
    const index = typeof id === 'number' ? id : this.#ids.indexOf(id);
    if (index === -1 || index >= this.#value.length) return;
    const value = this.#value.filter((_, i) => i !== index);
    this.#emitChange(value);
  }

  clear() {
    this.#ids = [];
    this.#emitChange(undefined);
  }

  #parseValue(input: ArrayValue | undefined) {
    return parseArray(input);
  }

  #emitChange(
    input: ArrayValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = input !== undefined ? this.#parseValue(input) : undefined;

    if (equals(previous, current)) return;

    this.#value = current;
    if (option & SetValueOption.EmitChange) this.#host.onChange(current);
    if (option & SetValueOption.Refresh) this.#host.refresh(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.#host.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: current },
        options: {
          [NodeEventType.UpdateValue]: {
            previous,
            current,
          },
        },
      });
  }
}
