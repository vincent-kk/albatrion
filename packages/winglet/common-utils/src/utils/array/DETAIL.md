# array contract

## Requirements

- 모든 함수는 인자로 받은 배열(source/target/array 등)을 제자리에서 변형하지 않는다 — 값을 만드는 함수는 새 배열·스칼라·불리언·객체를 반환하고, 순회 전용 함수(forEach 계열)는 반환값 없이 콜백만 호출한다.
- 비교·중복 제거·정렬 계열은 source(또는 target) 배열에 나타난 원소의 상대 순서를 결과에서 그대로 보존한다.
- `forEach`/`forEachDual`/`forEachReverse`는 콜백이 정확히 `false`를 반환할 때만 순회를 중단하고, 그 외 반환값(`undefined` 포함)은 계속 진행한다.
- `chunk`/`at` 등 인덱스·크기를 다루는 함수는 잘못된 입력에도 예외를 던지지 않고 정의된 대체 동작으로 응답한다.

## API Contracts

- `at(array, indexes)`: 단일 인덱스는 스칼라, 배열 인덱스는 배열을 반환한다. 음수 인덱스는 배열 길이를 더해 정규화하고, 정수가 아닌 인덱스는 `Math.trunc`로 절삭한다(스칼라·배열 입력 모두 동일 규칙). 범위를 벗어나면 `undefined`.
- `chunk(array, size)`: `size`가 filter의 정수 판별 기준으로 유효한 양의 정수가 아니면 원본 전체를 담은 청크 하나를 반환한다.
- `difference`/`intersection`: Set 기반 비교. `*By`는 매퍼 결과를 Set에 담아 비교하고, `*With`는 커스텀 비교자로 중첩 순회하며, `*Lite`는 `indexOf` 기반 강한 동등(`===`)을 쓰는 소배열 특화판이다 — 동등성 의미론이 비-`Lite`와 다르다.
- `groupBy(array, getKey)`: 결과 객체는 프로토타입이 없는 상태로 생성되고, 각 그룹은 원본 순서를 보존한 배열이다.
- `orderedMerge(preferred, source)`: `preferred` 우선순위를 지키며 중복을 제거한다. 두 배열의 길이 합이 20 미만이면 선형 탐색, 20 이상이면 Set 기반 경로를 쓰지만 출력은 두 경로에서 동일하다.
- `sortWithReference(source, reference?)`: `reference` 순서대로 정렬하고, `reference`에 없는 항목은 원래 상대 순서를 유지한 채 끝에 배치한다. 항상 새 배열을 반환하며 `source`/`reference` 어느 쪽도 변형하지 않는다.
- `primitiveArrayEqual(base, target)`: 길이와 각 인덱스를 `!==`로 비교하는 얕은 비교이며, 객체는 참조로만 같음을 판단한다.
- `unique`/`uniqueBy`/`uniqueWith`: 각각 Set·Map·중첩 비교로 첫 등장을 유지하며 중복을 제거한다.

## Acceptance Criteria

### lite-strict-equality — Lite 계열의 강한 동등성 계약

- `differenceLite`는 `indexOf` 기반 비교를 쓰므로 제외 대상에 `NaN`이 있어도 소스의 `NaN`을 걸러내지 못하고 그대로 남긴다.
- `intersectionLite`는 반대로 소스와 대상 양쪽에 `NaN`이 있어도 서로 일치시키지 못해 결과에서 제외한다.
- 두 함수 모두 객체는 내용이 아니라 참조 동일성으로만 비교하며, 50/25 크기 배열에서도 정상 동작한다.

### chunk-size-guard — chunk 크기 가드

- `size`가 소수(2.5)·음수(-1)·0이면 모두 원본 배열 전체를 담은 단일 청크 `[array]`를 반환하고 예외를 던지지 않는다.
- 유효한 `size`에서는 마지막 청크가 나머지 원소만 담아도 청크 개수·내용이 정확하다.

### groupby-prototype-safe-keys — groupBy의 상속 이름 키 안전성

- `constructor`/`toString`처럼 `Object.prototype`에서 상속되는 이름을 키로 사용해도 일반 own 엔트리로 정상 그룹화된다.
- 빈 배열을 그룹화하면 빈 객체를 반환한다.

### sortwithreference-immutability — sortWithReference 불변성과 정렬 규칙

- `source`와 `reference` 어느 쪽도 원본이 변형되지 않으며, `reference`를 생략해도 항상 새 배열(원본과 다른 참조, 같은 내용)을 반환한다.
- `reference`에 없는 항목은 원래 상대 순서를 유지한 채 정렬된 항목 뒤에 배치된다.
- `reference`에 같은 값이 여러 번 나오면 마지막 등장 인덱스가 정렬 위치를 결정한다.

### orderedmerge-threshold — orderedMerge 알고리즘 선택 임계값

- `preferred`와 `source`의 길이 합이 19(선형 탐색 경로)와 20(Set 경로) 경계에서 동일한 순서·내용의 결과를 낸다.
- `preferred`에 있는 키는 `source`에도 나타나더라도 `preferred` 쪽 순서가 우선하며 중복은 제거된다.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 함수당 한 파일의 flat 컬렉션이 이 fractal의 정본 형태다 — 22개 구현 파일이 각각 독립적인 tree-shaking 단위로 남아야 하고, organ 재배치는 배럴 깊이만 늘릴 뿐 번들 결과를 바꾸지 못한다. schema-form 계열을 포함한 외부 소비자는 현재 진입점을 경유하지만, 배럴 경유 시 재수출 그래프 전체가 번들에 딸려올 수 있으므로 개별 파일이 필요한 소비자의 직접 import도 같은 이유로 허용한다. zero-peer 승인은 `.filid` 설정의 scoped exempt(common-utils 전체)와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
