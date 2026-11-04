# collectBlueprintWarnings contract

## Requirements

- B12 같은 작성 층에서 정의한 `inactiveValue`와 literal true `unsetOnInactive`는 `InactiveValueWithUnsetOnInactive`로 경고합니다. fields와 조각을 포함하고 위치별 중복을 억제하며 소비자가 없으면 검사하지 않습니다.

- 진단 위치는 jsonPointer의 appendSegment로 조립해 예약 이름과 구분자를 가진 속성도 다시 탐색할 수 있게 한다.

관심 있는 진단 소비자에게 청사진의 인라인 종단 예약 키 경고를 수집해 전달한다.

## API Contracts

- 유효한 판별 키가 있는 선언마다 `controls/discriminator` 위치에서 `DiscriminatorIgnoredForForm`(`SCHEMA_FORM_WARNING.DISCRIMINATOR_IGNORED_FOR_FORM`)을 수집한다. 알려진 비객체 호스트는 `reason: 'host'`(C3), 객체 선언에 oneOf·anyOf 배열이 없으면 `reason: 'union'`(C2)이며 details는 `{ propertyName, reason }`다. 동일 선언에서는 하나만 보고한다.
- 허용 형에 `object`가 없는 호스트 선언에 `if`가 있으면 `#/…/if` 위치에서 `IfOnNonObjectHost`(`SCHEMA_FORM_WARNING.IF_ON_NON_OBJECT_HOST`)를 수집한다. 조건은 `node.kind`가 `object`·`virtual`이 아니고, `node.schemaType`이 배열(union)이면 `object`를 포함하지 않는 것이다. `node.nullable`은 조건에 들지 않는다. details는 `{ kind: node.kind }`이며 `if`의 내용은 읽지 않는다. 새 상태는 더하지 않으며, 중복은 `collect` 호출 한 번 안에서 (code, schemaPath, details.keyword) 키로 억제된다. 이 경고의 details에는 keyword가 없으므로 같은 `#/…/if` 위치의 경고는 `collect` 호출마다 하나이고, 다른 수집기에는 캐시된 진단 재생으로 다시 전달된다. 판정은 바뀌지 않으며 가드는 SETTLE-021대로 `{}`를 받는다(ERROR-164 IR-11 PR-C 보충).
- `DiscriminatorBranchUnreachable`은 호스트 태그 형 밖의 태그(C10, `reason: 'kind'`) 또는 const·enum 공집합(C11, `reason: 'empty'`)을 분기의 schemaPath에서 보고한다. details는 `{ propertyName, reason }`만 담고 값 목록은 담지 않는다. 빈 태그로 자식이 생성되지 않아도 비터미널 객체의 C11 경고는 수집한다. 터미널 객체는 이 경고를 보고하지 않는다. 호스트 태그 enum 밖의 값을 새로 검출하지 않는다.

- 터미널 하위의 예약 키 경고는 터미널 노드의 schemaPath마다 기록 하나에 keys와 paths를 모은다. 같은 코드와 schemaPath의 중복은 억제하며, 인라인 하위만 조사하고 참조 대상은 따라가지 않는다(BLUEPRINT-044).

## Acceptance Criteria

### blueprint-warnings — 늦은 수집과 터미널 하위 경고

- 진단 소비자가 없으면 경고를 검사하지 않고, 캐시된 루트에 소비자가 나중에 붙으면 루트마다 한 번 수집한다.
- 터미널 하위의 예약 키 경고는 터미널 schemaPath마다 기록 하나에 keys와 paths를 모으고, 인라인 하위만 조사하며 참조 대상은 따라가지 않는다(BLUEPRINT-044).
- 부모 blueprint의 `blueprint.diagnostics.test.ts`가 `blueprint()`로 이 절을 검증한다(늦은 수집, 터미널 인라인 그룹, union 호스트 사례).
- 부모 blueprint의 `blueprint.if-host-warning.test.ts`가 문자열·배열·null 전용 호스트의 경고와, object를 허용하는 union·nullable object·배열 `items` 안의 객체 조건·객체 호스트·가상 호스트의 무경고를 검증한다.

## Last Updated

2026-11-04
