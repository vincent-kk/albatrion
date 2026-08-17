# jsonSchema Helpers — DETAIL

## Requirements

- 외부 소비자는 `index.ts`가 이름으로 재수출한 심볼만 사용한다 — 서브디렉토리 내부 파일 직접 import 금지.
- 모든 헬퍼는 순수 함수를 유지한다: 결과는 입력만으로 결정되고 전역 상태를 읽거나 쓰지 않는다.
- allOf 병합 실패는 `JsonSchemaError`로 표면화한다 — 일반 `Error`로 흡수하지 않는다 (`processAllOfSchema` 소유).
- 타입별 병합·전처리 세부 규칙은 각 자식 fractal의 문서가 소유한다 — 이 문서는 가족 수준 계약만 기록한다.

## API Contracts

타입 분류 가드 — 노드 트리 구성이 terminal/branch를 가르는 기준:

| 가드             | true인 타입                                          |
| ---------------- | ---------------------------------------------------- |
| `isTerminalType` | `boolean` · `number` · `integer` · `string` · `null` |
| `isBranchType`   | `array` · `object` · **`virtual`**                   |

표의 요점은 `virtual`이다 — JSON Schema 표준 타입이 아니지만 branch로 분류되어 자식 노드를 가질 수 있다. 두 가드는 상호 배타적이다.

`getResolveSchema`는 스키마를 받아 `$ref` 해석 함수(`ResolveSchema`)를 반환한다 — 해석 자체가 아니라 해석기를 만든다.

## Acceptance Criteria

### type-classification — 분류 가드는 상호 배타적이고 virtual은 branch다

- 어떤 `JsonSchemaType`도 `isTerminalType`과 `isBranchType`을 동시에 만족하지 않는다.
- `isBranchType('virtual')`이 `true`다.

### barrel-surface — 공개 표면은 barrel 재수출로 한정된다

- `src/helpers/jsonSchema` 외부의 소비자 import 경로에 서브디렉토리 내부 파일이 나타나지 않는다.

## Last Updated

2026-08-18 — 문서 신설. 가족 수준 계약(순수성·barrel 표면·실패 모드)과 타입 분류 가드의 `virtual` 분기를 명문화 (issue #331, FIX-049).
