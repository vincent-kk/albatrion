# getScopedSegment

## Requirements

노드의 schemaPath가 검증기 경로와 대응하도록 scope와 variant를 세그먼트로 표현합니다.

## API Contracts

- scope가 없으면 name을 그대로 반환하고, variant가 undefined이면 인덱스를 생략합니다.
- 조합 scope는 부모 타입에 맞는 자식 키워드를 붙이며, properties와 items는 각각 이름과 전달된 인덱스를 반영합니다.

## Acceptance Criteria

### get-scoped-segment-contract — 관찰 가능한 동작

- 같은 scope 정보는 생성과 경로 갱신에서 같은 세그먼트를 만듭니다.
- variant 0을 누락으로 취급하지 않으며 구분자 없이 세그먼트를 이어 붙이지 않습니다.

## Last Updated

2026-09-16
