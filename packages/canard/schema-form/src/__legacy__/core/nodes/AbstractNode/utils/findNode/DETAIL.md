# findNode

## Requirements

경로 기반 단일 탐색과 다중 탐색의 variant 선택 의미를 구분합니다.

## API Contracts

- findNode는 같은 이름의 후보 중 variant가 없거나 부모의 현재 oneOfIndex와 일치하는 후보를 우선합니다. source와 같은 부모·variant인 후보도 선택하며, 해당 조건을 만족하는 후보가 없으면 첫 이름 일치 후보로 폴백합니다.
- findNodes는 variant 필터 없이 매칭 노드를 중복 제거해 반환하며 wildcard를 지원합니다. null 경로는 source 자체를 가리킵니다.

## Acceptance Criteria

### find-node-contract — 관찰 가능한 동작

- source가 없으면 단일 탐색은 null, 다중 탐색은 빈 배열입니다.
- 부모·현재·루트 세그먼트와 이스케이프된 이름은 공통 경로 파싱 규칙을 따릅니다.

## Last Updated

2026-09-16 — 단일 탐색의 실제 variant 후보 판정 순서를 명시.
