import { equals } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import {
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseArray } from '@/schema-form/core/parsers';
import type { ArrayValue } from '@/schema-form/types';

import type { ArrayNode } from '../../ArrayNode';
import type { ArrayNodeStrategy, IndexId } from '../type';

const FIRST_EMIT_CHANGE_OPTION =
  SetValueOption.Replace | SetValueOption.Default;
export class TerminalStrategy implements ArrayNodeStrategy {
  #host: ArrayNode;
  #handleChange: Fn<[ArrayValue | undefined]>;
  #handleRefresh: Fn<[ArrayValue | undefined]>;

  #locked: boolean = true;
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

  constructor(
    host: ArrayNode,
    handleChange: Fn<[ArrayValue | undefined]>,
    handleRefresh: Fn<[ArrayValue | undefined]>,
    handleSetDefaultValue: Fn<[ArrayValue | undefined]>,
  ) {
    this.#host = host;
    this.#handleChange = handleChange;
    this.#handleRefresh = handleRefresh;

    if (host.defaultValue?.length)
      for (const value of host.defaultValue) this.push(value);
    while (this.length < (host.jsonSchema.minItems || 0)) this.push();

    this.#locked = false;

    this.#emitChange(this.#value, FIRST_EMIT_CHANGE_OPTION);
    handleSetDefaultValue(this.#value);
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
    this.#emitChange([]);
  }

  #emitChange(
    input: ArrayValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    const replace = option & SetValueOption.Replace;

    if (!replace && equals(previous, current)) return;

    this.#value = current;

    if (this.#locked) return;
    if (option & SetValueOption.EmitChange) this.#handleChange(current);
    if (option & SetValueOption.Refresh) this.#handleRefresh(current);
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

  #parseValue(input: ArrayValue | undefined) {
    return input !== undefined ? parseArray(input) : undefined;
  }
}
