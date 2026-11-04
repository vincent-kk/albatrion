# Validator Parity Scenarios contract

## Requirements

이 부류는 폼이 검증기 플러그인에 거는 기대를 세 플러그인이 공유하는 시나리오로 적는다(IR-11 PR-D, R6·R6′, C15·C15′). 소유자 원문은 "최소한 우리 form에서 동일한 기대를 충족했으면"이다. 시나리오 데이터는 schema-form 형, AJV, 테스트 러너를 가져오지 않으며, 실행과 단언은 각 플러그인의 `src/__tests__/parity.*.test.ts`가 맡는다.

## API Contracts

`index.ts`는 세 시나리오 묶음, 행 목록 대조 함수 `indexDeclaredRows`, 소비자가 쓰는 형을 이름으로 내보낸다. 패키지 `exports`의 `"./validator"`가 이 파일을 가리킨다.

세 플러그인이 공유하는 행 도우미는 이 부류의 `utils/`에 둔다. `indexDeclaredRows`는 시험 파일이 리터럴로 적은 행 목록을 카탈로그를 펼친 결과와 대조하고 시나리오를 `id`로 찾는 표를 돌려주며, 다르면 일반 `Error`를 던진다. 도우미는 테스트 러너, AJV, 엔진을 가져오지 않는다. 사본 만들기, 검증 결과 읽기, 수명 단계 실행은 각 플러그인의 AJV 인스턴스 형과 플러그인 형에 묶이므로 플러그인마다 둔다.

- 가드 시나리오 `{ kind: 'guard', schema, pointer, hostValue, expected, failure? }`는 `compileGuard(schema, pointer)(hostValue)`의 판정이다. `expected`는 불리언, 컴파일 거부를 뜻하는 `'rejects'`, 또는 관찰 사례의 `null`이다. `'rejects'`이면 `failure`가 필수이며, `compileGuard` 오류 메시지에 대소문자를 무시하고 맞춰 볼 정규식 원문이다.
- 전체 검증 시나리오(`wholeValidationScenarios`) `{ kind: 'validation', schema, value, expected: { valid, dataPaths } }`는 `compile(schema)(value)`의 적합 여부와 오류 `dataPath`의 정렬된 고유 집합이다.
- 수명 시나리오 `{ kind: 'lifetime', steps }`의 단계 어휘는 닫혀 있다: `compileGuardBeforeCompile`, `releaseTwice`, `twoRootsSameId`, `recompileSameCopyAfterRegistrationFailure`, `keepConsumerSchemaAfterSameIdFailure`, `keepConsumerMetaSchemaAfterSameIdFailure`.
- 모든 시나리오는 `id`, `source`, `drafts`(`'07' | '2019' | '2020'`), `bundle`, `applies`를 가진다. `applies`는 진입점(`'default' | '2019' | '2020'`; ajv7의 `2019`는 Ajv2019 바인딩), 검사 프로필(`'default'`는 진입점의 기본 인스턴스, `'custom'`은 첫 사용 전에 한 번 bind한 소비자 인스턴스), `directGuardCompile`(`true | false | 'both'`), 필요 기능(`'allowUnionTypes'`, ajv8만 선언)을 적는다. 플러그인은 진입점이 목록에 있고 그 방언이 `drafts`에 있으며 기능을 모두 가진 경우에만 시나리오를 돌린다.

적합성 기대값은 플러그인과 인스턴스를 공유하지 않는 별도 AJV 전체 검증의 `if` 판정(`then`·`else` 표지 관측)과 같다.

엔진 쪽 동작인 비객체 호스트의 `{}` 평가(SETTLE-021)는 플러그인 계약이 아니므로 이 목록에 없다. 이미 등록된 루트에 대한 `bind` 뒤 재바인딩(D1)도 적합성 보장이 아니며, 지원 계약은 "첫 사용 전에 한 번 bind"이다.

## Acceptance Criteria

### validator-scenario-data — 순수 공유 기술

- 시나리오 모듈은 자체 형만 가져오고 schema-form, AJV, 테스트 러너를 가져오지 않는다.
- 각 시나리오의 `id`는 목록 안에서 유일하고, 플러그인 시험의 행 제목과 관찰 표의 열쇠로 쓰인다.

### validator-scenario-bundles — 적합성과 관찰의 분리

- 적합성 사례는 문서화된 지원 범위 안에서만 기대값을 둔다: VALIDATE-047 사례 (i)–(iii), 결함 A의 T1·T2, 계획 T8 (가)·T8 (나)의 2020 `$id` 없는 조상 앵커·T9, IR-10 T1·T2·T7·T8·T9 (가)·(다), 자족 가드, `$ref` 가드, 중첩 `$id`, `$schema`를 선언한 루트, 비동기 조건의 컴파일 거부, 같은 `$id` 두 루트의 격리, release 멱등, 기본 프로필의 형식 검사 끔, ajv8의 `allowUnionTypes`.
- 불리언 기대값은 지원 조건 안에서만 AJV 전체 검증의 판정과 같다. 플러그인이 컴파일 단계에서 반드시 거부하는 형태는 지원 조건 밖이라도 적합성 사례이며 `expected: 'rejects'`를 둔다: L8′ 사슬 밖 `$id` 래퍼, 계획 T8 (나)의 자원 루트가 아닌 `$recursiveAnchor`(L12), 사슬과 참조의 조상이 이름을 선언하지 않는 VALIDATE-047 사례 (iv)의 ajv7 모양이다. L8′ 래퍼는 2020-12 변형도 둔다. 이들은 해당 동적 어휘가 있는 진입점에만 적용하고, 소비자는 `compileGuard` 호출만 감싸 거부를 단언하며 돌려받은 가드를 부르지 않는다.
- 관찰 사례는 기대값이 없다: VALIDATE-047 사례 (iv)의 ajv8 모양과 L16(2019-09에서 `if` 밖의 자원 루트가 아닌 `$recursiveAnchor: true`와 `if` 안 조상 선언이 함께 있는 경우)이다. L16 사례는 원본 시험이 없어 ajv8 README의 L16 설명으로 만든 스키마다.

### validator-scenario-size — 파일 상한

- 각 플러그인의 parity 시험 파일은 관찰 행을 포함해 펼친 행(시나리오 × 진입점 × 프로필 × 경로)이 32건 이하이다. 가드 묶음은 draft-07 진입점 파일과 동적 어휘 진입점 파일로 나뉜다.

## Last Updated

2026-11-04
