import { scheduleMicrotask } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/app/constants/bitmask';

import type { NodeEvent, NodeEventType } from '../../../type';

/**
 * 이벤트 배치 데이터 구조
 * @template Value - 배치에 저장되는 값의 타입
 */
type Batch<Value> = {
  resolved?: boolean;
  events: Array<Value>;
};

/**
 * 비동기적으로 발생하는 이벤트를 모아서 일괄 처리하는 클래스입니다.
 */
export class EventCascade {
  private __currentBatch__: Batch<NodeEvent> | null = null;
  /**
   * 현재 이벤트 배치를 가져옵니다. 없을 경우 새로 생성합니다.
   * @returns 현재 이벤트 배치
   */
  private get __batch__(): Batch<NodeEvent> {
    const batch = this.__currentBatch__;
    if (batch && !batch.resolved) return batch;
    const nextBatch: Batch<NodeEvent> = { events: [] };
    this.__currentBatch__ = nextBatch;
    scheduleMicrotask(() => {
      nextBatch.resolved = true;
      this.__batchHandler__(mergeEvents(nextBatch.events));
    });
    return nextBatch;
  }
  private __batchHandler__: Fn<[event: NodeEvent]>;
  /**
   * EventCascade 인스턴스를 생성합니다.
   * @param batchHandler - 모아진 이벤트를 처리할 함수
   */
  constructor(batchHandler: Fn<[event: NodeEvent]>) {
    this.__batchHandler__ = batchHandler;
  }
  /**
   * 이벤트를 배치에 추가합니다.
   * @param event - 추가할 이벤트
   */
  public push(event: NodeEvent): void {
    const batch = this.__batch__;
    batch.events.push(event);
  }
}

/**
 * 이벤트 배열을 합체해 하나의 이벤트로 병합합니다.
 * @param events - 병합할 이벤트 배열
 * @returns 병합된 이벤트
 */
const mergeEvents = (events: ReadonlyArray<NodeEvent>) => {
  const merged: Required<NodeEvent> = {
    type: BIT_MASK_NONE as NodeEventType,
    payload: {},
    options: {},
  };
  for (const { type, payload, options } of events) {
    merged.type |= type;
    if (payload?.[type] !== undefined)
      (merged.payload[type] as (typeof payload)[typeof type]) = payload[type];
    if (options?.[type] !== undefined)
      (merged.options[type] as (typeof options)[typeof type]) = options[type];
  }
  return merged;
};
