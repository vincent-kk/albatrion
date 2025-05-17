import { equals } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import {
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseObject } from '@/schema-form/core/parsers';
import type { ObjectValue } from '@/schema-form/types';

import type { ObjectNodeStrategy } from '../type';

export class TerminalStrategy implements ObjectNodeStrategy {
  #host: ObjectNode;
  #handleChange: Fn<[ObjectValue | undefined]>;
  #handleRefresh: Fn<[ObjectValue | undefined]>;

  #value: ObjectValue | undefined = {};
  get value() {
    return this.#value;
  }

  applyValue(input: ObjectValue | undefined, option: UnionSetValueOption) {
    this.#emitChange(input, option);
  }

  get children() {
    return [];
  }

  constructor(
    host: ObjectNode,
    handleChange: Fn<[ObjectValue | undefined]>,
    handleRefresh: Fn<[ObjectValue | undefined]>,
  ) {
    this.#host = host;
    this.#handleChange = handleChange;
    this.#handleRefresh = handleRefresh;
    if (host.defaultValue !== undefined) this.#emitChange(host.defaultValue);
  }

  #emitChange(
    input: ObjectValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);

    if (equals(previous, current)) return;

    this.#value = current;
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

  #parseValue(input: ObjectValue | undefined) {
    return input !== undefined ? parseObject(input) : undefined;
  }
}
