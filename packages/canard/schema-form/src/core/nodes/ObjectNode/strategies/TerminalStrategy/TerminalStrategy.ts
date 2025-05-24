import { equals, getObjectKeys, sortObjectKeys } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import {
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseObject } from '@/schema-form/core/parsers';
import { getObjectDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { ObjectValue } from '@/schema-form/types';

import type { ObjectNodeStrategy } from '../type';

/**
 * ObjectNode의 값을 시터미널로 관리하는 전략 클래스.
 * 단순한 객체 타입을 처리하기 위한 구현입니다.
 */
export class TerminalStrategy implements ObjectNodeStrategy {
  private __host__: ObjectNode;
  private __handleChange__: Fn<[ObjectValue | undefined]>;
  private __handleRefresh__: Fn<[ObjectValue | undefined]>;

  private readonly __propertyKeys__: string[];

  private __value__: ObjectValue | undefined = {};
  /**
   * 객체의 현재 값을 가져옵니다.
   * @returns 객체 노드의 현재 값 또는 undefined
   */
  public get value() {
    return this.__value__;
  }

  /**
   * 입력값을 객체 노드에 적용합니다.
   * @param input - 설정할 객체 값
   * @param option - 설정 옵션
   */
  public applyValue(
    input: ObjectValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  /**
   * 자식 노드 목록을 가져옵니다.
   * @returns 빈 배열 (Terminal 전략은 자식 노드를 관리하지 않음)
   */
  public get children() {
    return null;
  }

  /**
   * TerminalStrategy 객체를 초기화합니다.
   * @param host - 호스트 ObjectNode 객체
   * @param handleChange - 값 변경 핸들러
   * @param handleRefresh - 새로고침 핸들러
   * @param handleSetDefaultValue - 기본값 설정 핸들러
   */
  constructor(
    host: ObjectNode,
    handleChange: Fn<[ObjectValue | undefined]>,
    handleRefresh: Fn<[ObjectValue | undefined]>,
    handleSetDefaultValue: Fn<[ObjectValue | undefined]>,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;

    this.__propertyKeys__ = getObjectKeys(host.jsonSchema.properties);

    const defaultValue = this.__parseValue__(
      getObjectDefaultValue(host.jsonSchema, host.defaultValue),
    );

    handleSetDefaultValue(defaultValue);
    this.__emitChange__(defaultValue);
  }

  /**
   * 값 변경 이벤트를 발생시킵니다.
   * @param input - 새로운 객체 값
   * @param option - 옵션 설정 (기본값: SetValueOption.Default)
   * @private
   */
  private __emitChange__(
    input: ObjectValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.__value__;
    const current = this.__parseValue__(input);

    if (equals(previous, current)) return;

    this.__value__ = current;
    if (option & SetValueOption.EmitChange) this.__handleChange__(current);
    if (option & SetValueOption.Refresh) this.__handleRefresh__(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
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

  /**
   * 입력 값을 적절한 객체 형식으로 파싱합니다.
   * @param input - 파싱할 값
   * @returns 파싱된 객체 값 또는 undefined
   * @private
   */
  private __parseValue__(input: ObjectValue | undefined) {
    if (input === undefined) return undefined;
    return sortObjectKeys(parseObject(input), this.__propertyKeys__, true);
  }
}
