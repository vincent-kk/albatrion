# RootNodeContext

## Requirements

루트 트리를 생성하고 검증·상태·변경 콜백과 외부 오류를 연결합니다.

## API Contracts

- 스키마와 기본값 의존성에 맞춰 루트 생성 결과를 재사용하거나 재생성합니다.
- 구독 설정 후 onReady를 호출하고, 외부 오류는 전체 목록을 루트에 적용한 뒤 경로별 비루트 노드에도 전달합니다. 같은 스키마와 재생성 reset은 현재 트리에 두 적용을 동기로 다시 수행하므로 `getErrors()`는 루트 외부 오류 + 검증 목록을 읽습니다(WRITE-045, SURFACE-053, VALIDATE-043, 69C-03, 79C-01).

## Acceptance Criteria

### root-node-context-contract — 관찰 가능한 동작

- Provider 정리 시 등록한 이벤트 구독을 해제합니다.
- 검증과 상태 이벤트는 대응 콜백으로 전달되며 변환하지 않은 외부 오류를 바로 주입하지 않습니다.

## Last Updated

2026-10-03
