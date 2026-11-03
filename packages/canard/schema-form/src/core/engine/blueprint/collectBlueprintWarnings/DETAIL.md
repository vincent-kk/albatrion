# collectBlueprintWarnings contract

## Requirements

- B12 같은 작성 층에서 정의한 `inactiveValue`와 literal true `unsetOnInactive`는 `InactiveValueWithUnsetOnInactive`로 경고합니다. fields와 조각을 포함하고 위치별 중복을 억제하며 소비자가 없으면 검사하지 않습니다.

- 진단 위치는 jsonPointer의 appendSegment로 조립해 예약 이름과 구분자를 가진 속성도 다시 탐색할 수 있게 한다.

관심 있는 진단 소비자에게 청사진의 인라인 종단 예약 키 경고를 수집해 전달한다.

## API Contracts

- 유효한 판별 키가 있는 선언마다 `controls/discriminator` 위치에서 `DiscriminatorIgnoredForForm`(`SCHEMA_FORM_WARNING.DISCRIMINATOR_IGNORED_FOR_FORM`)을 수집한다. 알려진 비객체 호스트는 `reason: 'host'`(C3), 객체 선언에 oneOf·anyOf 배열이 없으면 `reason: 'union'`(C2)이며 details는 `{ propertyName, reason }`다. 동일 선언에서는 하나만 보고한다.
- `DiscriminatorBranchUnreachable`은 호스트 태그 형 밖의 태그(C10, `reason: 'kind'`) 또는 const·enum 공집합(C11, `reason: 'empty'`)을 분기의 schemaPath에서 보고한다. details는 `{ propertyName, reason }`만 담고 값 목록은 담지 않는다. 빈 태그로 자식이 생성되지 않아도 비터미널 객체의 C11 경고는 수집한다. 터미널 객체는 이 경고를 보고하지 않는다. 호스트 태그 enum 밖의 값을 새로 검출하지 않는다.

- 터미널 하위의 예약 키 경고는 터미널 노드의 schemaPath마다 기록 하나에 keys와 paths를 모은다. 같은 코드와 schemaPath의 중복은 억제하며, 인라인 하위만 조사하고 참조 대상은 따라가지 않는다(BLUEPRINT-044).

## Acceptance Criteria

### blueprint-warnings — 늦은 수집과 터미널 하위 경고

- 진단 소비자가 없으면 경고를 검사하지 않고, 캐시된 루트에 소비자가 나중에 붙으면 루트마다 한 번 수집한다.
- 터미널 하위의 예약 키 경고는 터미널 schemaPath마다 기록 하나에 keys와 paths를 모으고, 인라인 하위만 조사하며 참조 대상은 따라가지 않는다(BLUEPRINT-044).
- 부모 blueprint의 `blueprint.diagnostics.test.ts`가 `blueprint()`로 이 절을 검증한다(늦은 수집, 터미널 인라인 그룹, union 호스트 사례).

## Last Updated

2026-11-03
