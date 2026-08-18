# JSONPath contract

## Requirements

- Goessner JSONPath 표기의 특수 문자 상수 4종(`Root`,`Current`,`Child`,`Filter`)을 값 그대로 제공한다.
- `getJSONPath`는 루트 객체에서 대상 값까지의 참조 경로를 탐색해 JSONPath 문자열 또는 미발견 시 null을 반환한다.
- `convertJsonPathToPointer`는 AJV dataPath 형식 문자열을 RFC 6901 포인터 문자열로 변환하고, 이미 포인터 형식인 입력은 그대로 반환한다.

## API Contracts

- `JSONPath` 상수 객체는 `Root`(`$`), `Current`(`@`), `Child`(`.`), `Filter`(`#`) 네 값을 제공하며 하위 호환 대상이다.
- `getJSONPath`의 반환 형식과 `convertJsonPathToPointer`의 입력 형식 세부 계약은 두 유틸 자신의 DETAIL.md가 정의한다 — 이 문서는 상수 값과 진입점 재수출 관계만 정의한다.

## Acceptance Criteria

### entry-surface — 진입점 재수출 완결성

- 이 fractal의 진입점(index.ts)은 export 구문으로만 구성되며 상수와 두 하위 유틸(`getJSONPath`, `convertJsonPathToPointer`)을 이름 그대로 재수출한다 — 추가 로직이 없다.
- 재수출에 새 코드 경로가 없으므로 각 유틸의 동작은 하위 fractal 자신의 테스트 스위트가 검증한 것과 동일하다.

## Boundary Exemptions

### `enum.ts` — JSONPath 상수 root peer 유지

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: enum.ts는 entry point가 이름으로 재수출하는 이 fractal의 유일한 구현 파일이다. 두 하위 유틸(`getJSONPath`, `convertJsonPathToPointer`)은 각자 지역 상수를 쓰고 이 파일을 참조하지 않아 실제 소비자는 entry-point 하나뿐이다 — organ 이동은 배럴 깊이만 늘리고 얻는 것이 없다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍으로 관리한다.

## Last Updated

2026-08-18 — 최초 계약 작성
