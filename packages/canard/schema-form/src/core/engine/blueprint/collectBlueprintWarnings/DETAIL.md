# collectBlueprintWarnings contract

## Requirements

경고는 지원 한계나 작성 실수를 알리는 진단이며 판정·형상·정적 오류를 바꾸지 않습니다. 소비자가 없으면 조사하지 않아 사용하지 않는 진단의 순회 비용을 만들지 않습니다.

## API Contracts

한 수집 안에서 code·schemaPath·details.keyword로 중복을 억제합니다. 캐시된 청사진의 늦은 수집과 수집기별 재생은 부모가 소유하며, 이 모듈의 내부 중복 집합을 폼 전체 경고 수명으로 확대하지 않습니다. 경고 위치는 이름을 보존하는 JSON Pointer 조립을 사용합니다.

## Acceptance Criteria

### FRAGMENT-024 — 내용 해석 없이 작성 관행을 알립니다

oneOf·anyOf 분기에 if가 있고 else가 정확히 false가 아니면 IF_WITHOUT_ELSE_FALSE를 수집합니다. if.required나 조건 프로퍼티의 적절성은 검사하지 않습니다. [부모의 FRAGMENT-022](../DETAIL.md)에 있는 공허한 참의 위험은 알리되 검증 의미를 재구현하지 않기 위해서입니다.

### FRAGMENT-033 — 입력이 없는 객체 잠금을 알립니다

branch object에 표준 readOnly 또는 controls.readOnly·disabled가 작성되면 LOCK_ON_NON_TERMINAL_OBJECT를 수집합니다. 해당 노드의 잠금이 자손에게 상속된다고 오해하지 않게 하기 위한 진단이며 배열과 terminal의 잠금 집행은 렌더 소유자의 책임입니다.

### BLUEPRINT-044 — 터미널 하위 예약 키의 제한

그릴 자식이 없는 terminal 아래 인라인 예약 그룹은 터미널 작성 위치마다 한 기록에 keys·paths를 모읍니다. $ref를 따라 경고 범위를 넓히지 않습니다. 참조 대상의 재사용 위치까지 조사하면 실제로 분석하지 않는 하위 정의의 비용과 중복 진단이 생기기 때문입니다.

### discriminator-warnings — 판별 경고와 오류의 구분

판별자 무시·도달 불가능 태그의 조건과 details는 [buildNodes의 BLUEPRINT-017·FRAGMENT-048](../buildNodes/DETAIL.md)을 따릅니다. 터미널 객체의 판별 불일치 오류는 남지만 도달 불가능 경고는 수집하지 않습니다. 경고를 태그 값 검증이나 호스트 enum 검사로 확대하지 않습니다.

### inactive-value-warning — 같은 층의 상충 선언

inactiveValue가 작성되고 같은 controls 층의 unsetOnInactive가 리터럴 true이면 INACTIVE_VALUE_WITH_UNSET_ON_INACTIVE를 알립니다. fields·조각도 조사하지만 resolver나 식을 실행하여 충돌을 추정하지 않습니다. 사용되지 않을 대체값을 알리기 위한 진단입니다.

### if-host-warning — 불투명 if의 한계

object를 허용하지 않는 정적 호스트의 if는 IF_ON_NON_OBJECT_HOST로 알리고 if의 내용은 읽지 않습니다. nullable만으로 객체 호스트가 되는 것은 아닙니다. 검증기가 내는 공허한 참을 폼의 별도 판정으로 바꾸지 않습니다.

### blueprint-warnings — 수집 비용과 관측 범위

수집기 없는 분석은 경고를 순회하지 않고, 늦은 수집도 같은 코드·작성 위치·순서의 진단을 제공합니다. dependentSchemas·dependencies와 allOf의 미지원 키는 형상으로 번역하지 않고 경고하며, 인라인 terminal 조사는 참조를 따라가지 않습니다.

## Last Updated

경고 범위·중복 기준·진단 형태·수집 비용 경계가 바뀔 때 갱신합니다.
