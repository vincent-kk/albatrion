# ValidationManager

## Requirements

루트 검증 결과를 현재 노드의 data path와 variant에 맞춰 배분합니다.

## API Contracts

- 스키마 확장 필드를 제거한 뒤 생성 시 검증기를 준비하고, 컴파일 성공 시에만 검증을 활성화합니다.
- 컴파일 오류는 JSONSchemaError로 기록하고 fallback 검증기를 보관하지만, manager는 비활성 상태를 유지하므로 이후 validate 호출은 검증을 실행하지 않습니다.
- 검증 매니저는 스키마·루트 여부·노드 검색·오류 반영을 제공하는 구조적 호스트 계약만 소비하며 AbstractNode 구현을 import하지 않습니다.
- 비루트나 비활성 검증은 수행하지 않으며, 이전 실행의 뒤늦은 결과는 세대 확인으로 무시합니다.

## Acceptance Criteria

### validation-manager-contract — 관찰 가능한 동작

- 다음 검증에서 사라진 오류의 이전 경로를 정리합니다.
- 같은 data path의 variant라도 schemaPath가 맞지 않는 오류는 그 노드에 적용하지 않습니다.
- 컴파일이 실패한 manager는 fallback 오류를 노드에 배분하지 않고 비활성 검증으로 남습니다.

## Last Updated

2026-09-16 — 컴파일 실패 후 비활성 상태와 fallback 검증기의 실제 도달 가능성, 구조적 호스트 의존 경계를 명시.
