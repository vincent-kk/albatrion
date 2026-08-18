# json contract

## Requirements

- 기본 진입점은 JSONPointer의 전체 공개 표면(상수·이스케이프·값 조작·패치 연산)과 JSONPath의 전체 공개 표면(상수·경로 변환 유틸)을 이름 변경이나 래핑 없이 그대로 재수출한다.
- 예약 멤버(`__proto__`,`constructor`,`prototype`) own 데이터 취급 계약은 JSONPointer가 소유하며, 이 진입점은 그 계약을 그대로 통과시킬 뿐 별도로 구현하지 않는다.
- JSONPointer와 JSONPath는 서로를 import하지 않는 독립 형제 fractal이다.

## API Contracts

- 이 fractal의 진입점이 재수출하는 각 심볼의 동작 계약은 그 심볼을 소유한 하위 fractal의 DETAIL.md(JSONPointer 또는 JSONPath)가 정의한다 — 이 문서는 재수출 관계만 정의하고 개별 심볼의 동작을 다시 규정하지 않는다.

## Acceptance Criteria

### re-export-completeness — 하위 fractal 표면 재수출 완결성

- JSONPointer 진입점과 JSONPath 진입점이 이름으로 내보내는 모든 심볼은 이 fractal의 진입점에서 동일한 이름의 재수출 구문으로만 연결된다 — index.ts 전체가 export 구문으로만 구성되어 있고 추가 변환·래핑 로직이 없다.
- 재수출에 새 코드 경로가 없으므로 각 심볼의 동작은 소유 fractal(JSONPointer 또는 JSONPath)의 테스트 스위트가 이미 검증한 것과 동일하다.

## Last Updated

2026-08-18 — 최초 계약 작성
