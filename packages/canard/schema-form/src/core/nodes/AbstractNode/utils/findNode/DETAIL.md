# findNode

## Requirements

경로 기반 단일 탐색과 다중 탐색의 variant 선택 의미를 구분합니다.

## API Contracts

- findNode는 같은 이름의 후보 중 source에 맞는 variant를 우선하고, 없으면 첫 후보로 폴백합니다.
- findNodes는 variant 필터 없이 매칭 노드를 중복 제거해 반환하며 wildcard를 지원합니다. null 경로는 source 자체를 가리킵니다.

## Acceptance Criteria

### find-node-contract — 관찰 가능한 동작

- source가 없으면 단일 탐색은 null, 다중 탐색은 빈 배열입니다.
- 부모·현재·루트 세그먼트와 이스케이프된 이름은 공통 경로 파싱 규칙을 따릅니다.

## Last Updated

2026-09-16
