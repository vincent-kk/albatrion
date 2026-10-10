# Blueprint implementation evidence

- 기준: rebase 완료 HEAD `9b7613eb8`, base `85fa44d49`; 개발 PR은 원장·단계 계획서를 수정하지 않았습니다.
- API: `blueprint`, `mergeEffectiveSchema`, `stripSchema`; 기존 공개 Form은 기존 노드 엔진을 사용합니다.
- 구현: 타입 집합 S0–S6, 조각 전순서·선언/연언·scope, 게이트 기술, 명시 판별자, 가상 필드, 유한 참조 그래프, 호출자 캐시와 늦은 경고 수집, 식 컴파일과 상대 의존 메타데이터.
- 자식의 canonical 연결은 `childEntries`이며 이름·hostPath·해당 호스트의 선언을 보존합니다. 순수 참조는 템플릿을 공유하고 서로 다른 sibling overlay는 분리합니다.
- `appliesWhen`은 children 규칙의 소유자 게이트가 꺼졌을 때 그 규칙을 적용하지 않는다는 기술입니다. 단순 AND로 바꾸지 않습니다. BLUEPRINT-030에 따라 정적 형상 검사에서는 children gate를 절단으로 인정하며 실제 무한 확장은 후속 정착 검사 대상입니다.
- 게이트 일관성 검사는 게이트 접두 트리의 요약으로 선언 수 × 게이트 깊이 범위를 유지합니다. 작성 식을 실행하지 않습니다.

## Verification

| 명령/범위 | 결과 |
| --- | --- |
| `yarn workspace @canard/schema-form test run src/core/blueprint/__tests__ src/types/__tests__/formTypeInput.union.test.ts` | 13파일 129건 통과, exit 0; `/tmp/blueprint-path-reference-final-test.log` |
| 수정한 파일 `yarn workspace @canard/schema-form exec eslint <paths>` | 후속 교정 포함 exit 0; root cwd 직접 eslint는 패키지 alias를 못 찾아 제외 |
| 수정한 파일 `yarn prettier --write <paths>` | 후속 교정 포함 exit 0 |
| 전체 패키지 strict 최종 게이트 | 루트 오케스트레이터가 병합된 변경으로 수행 |
| 전체 옛 시험·벤치·filid·seiri·교차 리뷰 | 루트 오케스트레이터의 PR 경계 증거에 합류 |

### 실패 확인과 교정

- 최초 새 청사진 API 부재로 기존 E군의 import 수집 실패를 확인했습니다. 진입점 연결 직후 정상 판정 30건은 통과하고 오류 6건은 기존 `JSONSchemaError.code`가 `GROUP.SPECIFIC`임을 드러냈습니다. 기대를 실제 기존 계약의 `.specific`와 canonical 코드 값으로 맞췄습니다.
- 가상 노드 3사례는 구현 전 노드 없음·오류 미발생으로 실패한 뒤 구현 후 통과했습니다.
- 실제 공개 `InferValueType` → `FormTypeInputProps.onChange` 시험은 readonly tuple이 any로 넓어져 TS2344와 잘못된 값의 `@ts-expect-error` 미사용으로 실패했습니다. tuple 리터럴·프로퍼티 modifier 보존 후 해당 오류가 없어졌습니다. 런타임 전환 없이 기존 nullable defaultValue와 구체 leaf 생성자/factory 형 인자를 정합화했습니다.
- E41은 수정 전 `'integer'`가 나와 `['integer']` 기대와 불일치했습니다. BLUEPRINT-045·WRITE-099에 따라 좁혀진 비어 있지 않은 집합은 frozen 배열, 그대로인 집합은 원래 `schemaType` 값을 유지하도록 수정했습니다. E25는 `['number']`, E26은 scalar `'number'`입니다.
- escaped discriminator 키를 가진 공유 참조 회귀는 수정 전 경고 0건, 기대 1건으로 실패했습니다. 절대 path 검색을 host `childEntries` 조회로 교정한 뒤 통과했습니다.
- 후속 원장 대조에서 terminal 경고가 하위 그룹마다 3건으로 분리되는 실패를 확인했습니다. BLUEPRINT-044대로 terminal 노드의 schemaPath에 keys·paths를 모은 1건으로 고쳤습니다.
- FRAGMENT-048의 정적 태그 탐색이 nested oneOf를 형 추론하여 UNKNOWN_JSON_SCHEMA로 거절하던 회귀를 확인했습니다. 분기 null 판정도 정적 연언의 명시 type만 읽도록 교정했습니다.
- 선언 문맥 overlay가 terminal 전략에 영향을 주는 회귀 2건은 각각 잘못된 terminal과 TERMINAL_STRATEGY_MISMATCH로 실패했습니다. SCHEMA-044대로 effective schema와 같은 기여 선언만 선택한 뒤 통과했습니다.
- TEST-014의 무게이트 나중 승, sole gated declaration의 terminal 허용, static explicit 우선, 뒤의 undefined 판정이 앞을 지우지 않는 4사례도 통과했습니다.
- CONTROLS-080의 독립 `*` 조각만 거부하고 watch 문자열 문법은 좁히지 않습니다. 프로토타입 이름 watch의 TypeError와 이름 내부 별표의 잘못된 거부를 수정 전 확인한 뒤, null-prototype 의존 사전과 조각 검사로 교정했습니다(`/tmp/blueprint-path-reference-red.log`).
- 참조 URI 디코딩·JSON Pointer 해석의 원래 예외 누수를 각각 재현한 뒤 작성 schemaPath·reference·cause를 보존한 UNKNOWN_JSON_SCHEMA로 감쌌습니다(`/tmp/blueprint-reference-red-corrected.log`). 최초 getter fixture는 참조 전 스키마 분석에서 실패하여 제외하고 실제 잘못된 pointer로 원인을 검증했습니다. 수정 후 4사례를 포함한 전체 소유 범위가 통과했고 수정5파일 lint·format은 exit 0입니다(`/tmp/blueprint-path-reference-lint.log`, `/tmp/blueprint-path-reference-format.log`).

## Diagnostic coverage

| 코드 | 증거 |
| --- | --- |
| UNKNOWN_JSON_SCHEMA, ALL_OF_TYPE_REDEFINITION, TERMINAL_OPTION_UNSUPPORTED | type-syntax/inference/static-intersection + fragment 시험 |
| SHARED_NODE_KIND_CONFLICT, TERMINAL_STRATEGY_MISMATCH | gated-declarations + fragments |
| RECURSIVE_SHAPE_UNBOUNDED | recursion: 객체 순환·nullable 순환 오류, 배열·게이트·터미널 절단 |
| DISCRIMINATOR_MISMATCH, EMPTY_ENUM_INTERSECTION | discriminator의 종류/중복/누락/정적 교차 및 effective-schema |
| CONFLICTING_CONST_VALUES, INVALID_RANGE | effective-schema 정적 교차 오류 시험 |
| VIRTUAL_FIELDS_NOT_VALID, VIRTUAL_FIELDS_NOT_IN_PROPERTIES, VIRTUAL_FIELDS_MISMATCH | diagnostics + fragments |
| UNKNOWN_GROUP_KEY, CHILDREN_TARGET_NOT_FOUND, UNEXPECTED_ARRAY_SCHEMA | diagnostics |
| CREATE_DYNAMIC_FUNCTION, OBSERVED_VALUES | expressions의 잘못된 작성 식·watch 및 wildcard 경로 |
| CONDITION_INDEX, CONDITION_INDICES | ERROR-164가 가리키는 기존 getConditionIndexFactory/getConditionIndicesFactory의 식 생성 오류입니다. 현재 02는 compiler만 이동하고 if는 기술을 보존하므로 새 analyzer 직접 도달 오류로 꾸미지 않습니다. 기존 factory 시험을 유지하며 이후 factory 전환용 canonical 코드 상수는 보존합니다. |
| ALL_OF_KEYWORD_IGNORED_FOR_FORM | 실제 무시하는 validator-only `not`의 코드·위치와 중첩 oneOf 자식 생성을 함께 검증 |
| NULL_BRANCH_IGNORED_FOR_FORM, IF_WITHOUT_ELSE_FALSE, LOCK_ON_NON_TERMINAL_OBJECT | diagnostics 각 코드 단언 |
| DEPENDENT_SCHEMAS_IGNORED_FOR_FORM | dependencies/dependentSchemas 코드·keyword 검증, dependentRequired 제외 |
| TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM | terminal schemaPath별 keys·paths 1건, 인라인 스키마 위치만, 참조 target·literal default 데이터 제외 |
| DISCRIMINATOR_BRANCH_UNREACHABLE | 일반 키 및 escaped 키/shared reference 경고 |

- ERROR-164의 옛 allOf 무시 목록을 복사하지 않았습니다. 처리하는 allOf/oneOf/anyOf/if/then/else는 경고하지 않으며 실제 무시한 validator-only 키만 기록합니다. 같은 ERROR-164가 중첩 합성 경고를 폐기하고 재귀 처리한다고 명시합니다.
- 기존 CONDITION_INDEX/INDICES factory와 시험은 legacy 이주 worker 증거와 함께 확인합니다. 새 analyzer 발생 경로가 없음을 숨기지 않습니다.
- TEST-067 원본 14종과 BLUEPRINT-039 수용 조건 충돌은 별도 scanner/corpus 증거와 소유자 질의에 남아 있습니다. 이 보고서는 그 게이트를 통과했다고 주장하지 않습니다.
