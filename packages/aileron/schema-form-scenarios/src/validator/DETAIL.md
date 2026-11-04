# Validator Parity Scenarios contract

## Requirements

이 부류는 폼이 검증기 플러그인에 거는 기대를 세 플러그인이 공유하는 시나리오로 적는다(IR-11 PR-D, R6·R6′, C15·C15′). 소유자 원문은 "최소한 우리 form에서 동일한 기대를 충족했으면"이다. 시나리오 데이터는 schema-form 형, AJV, 테스트 러너를 가져오지 않으며, 실행과 단언은 각 플러그인의 `src/__tests__/parity.*.test.ts`가 맡는다.

## API Contracts

`index.ts`는 `guardScenarios`, `validationScenarios`, `lifetimeScenarios`와 소비자가 쓰는 형을 이름으로 내보낸다. 패키지 `exports`의 `"./validator"`가 이 파일을 가리킨다.

- 가드 시나리오 `{ kind: 'guard', schema, pointer, hostValue, expected }`는 `compileGuard(schema, pointer)(hostValue)`의 판정이다. `expected`는 불리언, 컴파일 거부를 뜻하는 `'rejects'`, 또는 관찰 사례의 `null`이다.
- 검증 시나리오 `{ kind: 'validation', schema, value, expected: { valid, dataPaths } }`는 `compile(schema)(value)`의 적합 여부와 오류 `dataPath`의 정렬된 고유 집합이다.
- 수명 시나리오 `{ kind: 'lifetime', steps }`의 단계 어휘는 닫혀 있다: `compileGuardBeforeCompile`, `releaseTwice`, `twoRootsSameId`, `recompileSameCopyAfterRegistrationFailure`, `keepConsumerSchemaAfterSameIdFailure`, `keepConsumerMetaSchemaAfterSameIdFailure`.
- 모든 시나리오는 `id`, `source`, `drafts`(`'07' | '2019' | '2020'`), `bundle`, `applies`를 가진다. `applies`는 진입점(`'default' | '2019' | '2020'`; ajv7의 `2019`는 Ajv2019 바인딩), 검사 프로필(`'default'`는 진입점의 기본 인스턴스, `'custom'`은 첫 사용 전에 한 번 bind한 소비자 인스턴스), `directGuardCompile`(`true | false | 'both'`), 필요 기능(`'allowUnionTypes'`, ajv8만 선언)을 적는다. 플러그인은 진입점이 목록에 있고 그 방언이 `drafts`에 있으며 기능을 모두 가진 경우에만 시나리오를 돌린다.

적합성 기대값은 원본 시험이 쓰는 방식, 곧 플러그인과 인스턴스를 공유하지 않는 별도 AJV 전체 검증의 `if` 판정(`then`·`else` 표지 관측)에서 옮겼다. 가드 기대값은 작업 기록의 오라클 스크립트로 다시 확인했다.

엔진 쪽 동작인 비객체 호스트의 `{}` 평가(SETTLE-021)는 플러그인 계약이 아니므로 이 목록에 없다. 이미 등록된 루트에 대한 `bind` 뒤 재바인딩(D1)도 적합성 보장이 아니며, 지원 계약은 "첫 사용 전에 한 번 bind"이다.

## Acceptance Criteria

### validator-scenario-data — 순수 공유 기술

- 시나리오 모듈은 자체 형만 가져오고 schema-form, AJV, 테스트 러너를 가져오지 않는다.
- 각 시나리오의 `id`는 목록 안에서 유일하고, 플러그인 시험의 행 제목과 관찰 표의 열쇠로 쓰인다.

### validator-scenario-bundles — 적합성과 관찰의 분리

- 적합성 사례는 문서화된 지원 범위 안에서만 기대값을 둔다: VALIDATE-047 사례 (i)–(iii), 결함 A의 T1·T2, 계획 T8 (가)·T9, IR-10 T1·T2·T7·T8·T9 (가)·(다), 자족 가드, `$ref` 가드, 중첩 `$id`, `$schema`를 선언한 루트, 비동기 조건의 컴파일 거부, 같은 `$id` 두 루트의 격리, release 멱등, 기본 프로필의 형식 검사 끔, ajv8의 `allowUnionTypes`.
- 플러그인이 컴파일 단계에서 반드시 거부하는 형태는 지원 밖이라도 적합성 사례이며 `expected: 'rejects'`를 둔다: L8′ 사슬 밖 `$id` 래퍼와 계획 T8 (나)의 자원 루트가 아닌 `$recursiveAnchor`(L12)이다. 둘은 2019-09 동적 어휘가 있는 진입점에만 적용한다.
- 관찰 사례는 기대값이 없다: VALIDATE-047 사례 (iv)의 ajv8·ajv7 모양과 L16(2019-09에서 `if` 밖의 자원 루트가 아닌 `$recursiveAnchor: true`와 `if` 안 조상 선언이 함께 있는 경우)이다. L16 사례는 원본 시험이 없어 ajv8 README의 L16 설명으로 만든 스키마다.

### validator-scenario-size — 파일 상한

- 각 플러그인의 parity 시험 파일은 펼친 행(시나리오 × 진입점 × 프로필 × 경로)이 32건 이하이다. 진입점이 셋인 ajv8의 가드 파일이 상한에 가장 가깝다.

## Last Updated

2026-11-04
