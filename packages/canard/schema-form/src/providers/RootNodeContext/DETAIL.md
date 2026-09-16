# RootNodeContext

## Requirements

루트 트리를 생성하고 검증·상태·변경 콜백과 외부 오류를 연결합니다.

## API Contracts

- 스키마와 기본값 의존성에 맞춰 루트 생성 결과를 재사용하거나 재생성합니다.
- 구독 설정 후 onReady를 호출하고, 외부 오류는 변환 후 경로별로 전달합니다.

## Acceptance Criteria

### root-node-context-contract — 관찰 가능한 동작

- Provider 정리 시 등록한 이벤트 구독을 해제합니다.
- 검증과 상태 이벤트는 대응 콜백으로 전달되며 변환하지 않은 외부 오류를 바로 주입하지 않습니다.

## Last Updated

2026-09-16
