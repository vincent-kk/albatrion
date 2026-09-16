# DeferrableNodeProxy

## Requirements

가상화 대상은 최초 노출 전까지만 마운트를 지연하며, 노출 이후에는 다시 placeholder로 되돌리지 않습니다.

## API Contracts

- placeholder는 공간을 예약하는 관찰 대상이며 data-path, data-deferred와 aria-hidden을 유지합니다.
- 교차·idle backfill 또는 focus/select 명령으로 노출합니다. 커밋 후 노출 기록을 남기고 보류한 명령을 즉시 재발행합니다.

## Acceptance Criteria

### deferrable-node-proxy-contract — 관찰 가능한 동작

- 비활성 노드는 placeholder도 렌더하지 않고, placeholder 제거 시 관찰 등록을 해제합니다.
- 이미 노출된 노드가 다시 연결되어도 노출 기록을 보존하며, refresh 명령만으로 미노출 노드를 모두 마운트하지 않습니다.

## Last Updated

2026-09-16
