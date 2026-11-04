# IR-11 — guard fidelity 결과

설계는 [IR-11 절](../../plan/input-responsiveness/design.md#ir-11--guard-fidelity-2026-11-04), 소유자 원문은 `request.md`의 IR-11 절(quote 87–88)입니다. 기준은 단계 브랜치 `a1ef988b0`입니다. 각 PR이 자기 절을 더합니다.

## PR-B — duplicate-id message classification

### 커밋

| 순서 | 커밋 | 내용 |
| --- | --- | --- |
| 1 | `ae59fc875` | 시험: T3 두 건(`validation.same-id.test.ts`), T10 네 건(`validation.guard-recovery.test.ts`) |
| 2 | `24e99c0b5` | 엔진: `DUPLICATE_SCHEMA_ID_MESSAGE`를 `/already exists\|resolves to more than one schema/i`로 좁힘(C5), `validation.plugin-retry.test.ts`의 시험 문구를 AJV 문구로 바꿈(C6) |
| 3 | 이 파일을 담은 커밋 | 문서: `Validator.compile` 문서 주석, `src/app/cache/DETAIL.md` 사용처, validation `DETAIL.md`, 원장 ERROR-201·VALIDATE-046 보충, 본체 README en·ko, design.md IR-11 절, request.md quote 87–88, 이 파일 |

### 빨간 실행

제품 코드가 기준 그대로인 테스트 커밋 상태에서 두 시험 파일을 실행했습니다. 15건 중 5건이 실패했고, 계획이 빨강이라고 적은 사례는 모두 실패했으며 보호라고 적은 사례는 모두 통과했습니다.

| 사례 | 예상 | 관측 |
| --- | --- | --- |
| T3 `required: ['a','a']`, 같은 `$id`의 유효한 루트 retain | 빨강 | 실패: `entry.duplicate`가 `true`(`expected true not to be true`) |
| T3 `enum: [1,1]`, 같은 `$id`의 유효한 루트 retain | 빨강 | 실패: `entry.duplicate`가 `true` |
| T10 `schema with key or id "…" already exists` 가드 실패 삭제 | 보호 | 통과 |
| T10 `reference "…" resolves to more than one schema` 가드 실패 삭제 | 빨강 | 실패: 가드 실패가 남음(`expected true to be false`) |
| T10 메타 `must NOT have duplicate items` 가드 실패 보존 | 빨강 | 실패: 가드 실패가 지워짐(`expected undefined to be { failure }`) |
| T10 `duplicate keyword declaration` 가드 실패 보존 | 빨강 | 실패: 가드 실패가 지워짐 |
| same-id 기존 7건, guard-recovery 기존 2건 | 보호 | 통과 |

T3의 메타 문구는 ajv8 기본 검증기가 실제로 낸 `schema is invalid: data/required must NOT have duplicate items (items ## 1 and 0 are identical)`와 `data/enum` 같은 문구입니다. T10의 AJV 충돌 사례는 시험 이름, 포인터, `$id` 어디에도 `duplicate`라는 단어를 넣지 않았습니다.

### 관문

| 관문 | 결과 |
| --- | --- |
| G-B2 정규식 | `constants.ts`의 `DUPLICATE_SCHEMA_ID_MESSAGE`가 `/already exists\|resolves to more than one schema/i`(Prettier가 선언과 값을 두 줄로 나눔) |
| G-B3 unit·render | exit 0, 시험 파일 844 통과·1 건너뜀, 시험 5,355 통과·8 건너뜀 |
| G-B4 typecheck·lint·build | 세 명령 모두 exit 0 |
| G-B5 기록 | `Validator.compile` 문서 주석, `src/app/cache/DETAIL.md`, validation `DETAIL.md`, ERROR-201·VALIDATE-046 보충, README en·ko, 이 절에 R2가 적혀 있고 기계 고유 경로가 없음 |
| G-B6 가드 실패 정리 | T10 네 건 통과(두 AJV 충돌 문구는 지워지고, 메타·키워드 `duplicate` 실패는 보존) |
| G-X3 저장소 점검 계획 | exit 0, 23단계 모두 통과(아래) |

G-X3: `selectAffectedWorkspaces.mjs --tier pr --base a1ef988b0 --head HEAD`는 바뀐 작업 공간으로 schema-form 하나, 의존 작업 공간 열한 개를 골랐습니다. `runCheckPlan.mjs`로 실행한 결과 빌드·lint·typecheck·시험 23단계가 모두 통과했습니다.

| 작업 공간 | 시험 파일 | 시험 |
| --- | --- | --- |
| `@canard/schema-form` unit | 656 | 4,290 |
| `@canard/schema-form-ajv8-plugin` | 23 | 354 |
| `@canard/schema-form-ajv7-plugin` | 18 | 146 |
| `@canard/schema-form-ajv6-plugin` | 18 | 141 |
| UI 플러그인 넷(antd-mobile, antd5, antd6, mui) | 10, 18, 18, 10 | 43, 90, 87, 68 |
| `@aileron/benchmark`, `@aileron/benchmark-form` | 2, 9 | 11, 73 |

### 보존한 계약

- VALIDATE-046: 같은 `$id`의 두 살아 있는 루트는 저마다 판정하고, 실제 등록 충돌은 `reason: 'duplicateSchemaId'`로 드러납니다. same-id 기존 7건이 그대로 통과합니다.
- ERROR-201: 원장이 이름 붙이지 않은 원인에는 `reason`을 싣지 않습니다. 메타 위반은 이제 이 규칙대로 `reason` 없이 `VALIDATOR_COMPILE_FAILED`가 됩니다.
- DR-3: 실제 충돌은 경쟁 루트 해제 뒤 같은 사본으로 한 번 재시도합니다. `validation.plugin-retry.test.ts`의 세 플러그인 사례가 AJV 문구로 바꾼 뒤에도 통과합니다.

## PR-A — guard dynamic scope from the chain resources

설계는 [IR-11 절의 PR-A 하위 절](../../plan/input-responsiveness/design.md#pr-a--guard-dynamic-scope-from-the-chain-resources)입니다. 기준은 단계 브랜치 `40bb80e9a`입니다.

### 커밋

| 순서 | 커밋 | 내용 |
| --- | --- | --- |
| 1 | `a5694f56e` | 시험: 두 플러그인의 `guard-scope.dynamic-root`·`guard-scope.lexical-ancestors`·`guard-scope.chain-resources`·`guard-scope.reference-forms`·`guard-root-lifetime.anchored` 시험과 시험 도우미, 기존 `guard-scope.test.ts` 사례 (iv) 변경 |
| 2 | `8d6bbb8b7` | 수정: 두 플러그인의 `utils/dynamicScope/`, `createGuardCompiler.ts`, 등록 기록의 `hasDynamicKeywords`, 동적 어휘가 없는 인스턴스의 건너뛰기, ajv8의 프로브와 `probes` 삭제 |
| 3 | 이 기록을 담은 문서 커밋 | README en·ko, `CLAUDE.md`, VALIDATE-047 보충, design.md PR-A 하위 절, 이 절 |

### 빨간 실행

시험 커밋의 시험을 제품 코드가 기준 그대로인 상태에서 실행했습니다. 기대값은 플러그인과 인스턴스를 공유하지 않는 별도 AJV 컴파일의 관측값이며, 경로 밖 선언자 두 사례만 그 선언자(`$defs.tree`, `$defs.outer`)로 검증한 값입니다. 계획이 빨강이라고 적은 칸은 모두 실패했고, 보호 칸은 기준에서 실행된 입력에서 모두 통과했습니다. 각 사례는 입력 목록을 차례로 돌다가 첫 실패에서 멈추므로, 빨강 칸에서 기준이 실제로 판정한 입력은 표의 '실패 값'까지입니다. 예를 들어 ajv8의 T1은 첫 입력 `{}`에서 실패했으므로, `{ flag: true }`, `{ x: 1 }`, `{ x: 1, flag: true }` 세 입력은 기준에서 판정되지 않았습니다.

| 사례 | ajv8 (2020·2019) | ajv7 (2019 바인딩) | 실패 값 |
| --- | --- | --- | --- |
| T1 루트 단언 독립성 | 빨강 8 | 보호 4 | `{}`에서 가드 true, 전체 검증 false |
| T2 중첩 `if`의 루트 범위 | 빨강 8 | 보호 4 | `{ next: { kind: 'yes' } }`에서 가드 false, 전체 true |
| T8 (가) 중첩 자원 사슬 | 빨강 8 | 빨강 4 | `{ ok, next: { ok, rejected } }`에서 가드 false, 전체 true |
| T8 (나) `$id` 없는 조상 | 2020 빨강 4, 2019 거부 기대 빨강 4 | 거부 기대 빨강 4 | 2020은 같은 값에서 가드 false·전체 true, 2019는 예외 없음 |
| T9 비동기 루트 앵커, 루트 `/if` | 보호 8 | 빨강 4 | ajv7은 예외 없음 |
| T9 비동기 루트 앵커, 중첩 포인터 | 빨강 8 | 빨강 4 | 예외 없음 |
| 루트 자원의 경로 밖 `$defs` 선언자 | 빨강 4 | 빨강 2 | `{ next: { ok: true } }`에서 가드 false, 선언자 true |
| `$id` 없는 래퍼 | 빨강 4 | 빨강 2 | `{ ok, next: { ok, rejected } }`에서 가드 false, 전체 true |
| 어디에도 없는 이름(L12 포함) | 빨강 4 | 빨강 2 | 예외 없음 |
| 가장 바깥 사슬 자원 우선 | 빨강 4 | 빨강 2 | `{ next: { outerOnly: true } }`에서 가드 false, `outer` 선언자 true |
| `if` 안 조상 선언(자체 바인딩) | 보호 4 | 보호 2 | — |
| 형제 속성 선언(F29) | 빨강 4 | 빨강 2 | 예외 없음 |
| `if` 안 `$defs`에만 있는 선언(F28) | 빨강 4 | 빨강 2 | 예외 없음 |
| `const` 안의 `$dynamicRef` | 보호 4 | 보호 2 | — |
| `default` 안의 `$dynamicAnchor` | 빨강 4 | 빨강 2 | 예외 없음 |
| 앵커 루트의 수거·release·재컴파일(T2b′) | 보호 6 | 보호 3 | — |
| 기존 사례 (iv) | 관찰 4(통과, 값은 아래) | 빨강 2(예외 없음) | — |
| 합계 | 112건 중 68 실패 | 57건 중 32 실패 | — |

사례 (iv)의 뒤집힘(F25)을 확인했습니다. ajv8에서 같은 값 `{ stringKey, numberKey, next: { stringKey } }`의 가드는 기준에서 false(숫자 범위의 답)였고 수정 뒤 true(문자열 범위의 답, 어휘적 진입)입니다. 네 행(`directGuardCompile` 둘 × default·bind) 모두 같습니다.

병합 검토에서 추가한 사례는 이전 수정 코드에 대해 빨강을 확인했습니다. 루트가 `$dynamicAnchor: 'node'`만 선언하고 `/properties/host/if`가 `{ $dynamicRef: '#node', $recursiveRef: '#' }`인 경우, 이름 `''`가 묶이지 않으므로 거부되어야 합니다. 이전 코드는 한 객체에서 `$dynamicRef`를 읽은 뒤 `$recursiveRef`를 보지 않아 예외가 나지 않았고, ajv8 4건과 ajv7 2건이 모두 실패했습니다. 두 키워드를 따로 읽도록 고친 뒤 모두 통과합니다.

독립 검증에서 추가한 `guard-scope.reference-forms` 시험도 이전 수정 코드에 대해 빨강을 확인했습니다. draft-07 진입점에서 `if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] }`인 가드는 ajv8 2건과 ajv7 2건이 모두 묶이지 않은 참조로 잘못 거부되어 실패했습니다. 같은 사례는 기준 `40bb80e9a`의 제품 코드에서 네 건 모두 전체 검증과 같은 판정으로 통과하므로 회귀였습니다. 조각이 JSON Pointer인 `$dynamicRef: '#/$defs/target'`의 거부 사례는 ajv8 4건과 ajv7 2건이 예외 없이 실패했습니다. 마지막으로 추가한 `$recursiveRef: '#/$defs/target'`의 거부 사례도 이전 수정 코드에서 ajv8 2건과 ajv7 2건이 예외 없이 실패했습니다. 동적 어휘가 있는 인스턴스에서만 수집하도록 하고 `#/…` 참조를 묶이지 않은 이름으로 읽도록 고친 뒤 모두 통과합니다.

### 관찰 사례 (단언 없음)

| 사례 | 판·방언 | 호스트 값 | 전체 검증 accepted/rejected | 가드(기준) | 가드(수정 뒤) |
| --- | --- | --- | --- | --- | --- |
| L8′ 사슬 밖 `$id` 래퍼 | ajv8 2020·2019, ajv7 2019 | `{ ok, next: { ok, rejected } }` | true/false | false | 컴파일 거부 |
| L8′ 사슬 밖 `$id` 래퍼 | ajv8 2020·2019, ajv7 2019 | `{ ok, next: { rejected } }` | false/true | false | 컴파일 거부 |
| L9 기준 URI | ajv8 2020 | `{ innerOnly, next: { innerOnly, rejected } }` | false/true | false | true |
| L9 기준 URI | ajv8 2020 | `{ innerOnly, next: { innerOnly, rootOnly, rejected } }` | true/false | false | true |
| L9 기준 URI | ajv8 2019, ajv7 2019 | 같은 두 값 | false/true, true/false | false | 컴파일 거부(L12) |
| (iv) | ajv8 2020 | `{ stringKey, numberKey, next: { stringKey } }` | 문자열 범위 true, 숫자 범위 false | false | true |

L8′ 사례는 수정 뒤 결과가 결정적이므로, 이제 시험이 관찰 출력 대신 컴파일 거부를 단언합니다. L9의 2020 변형에서 수정 뒤 가드는 명세대로 자원 기준 URI로 풀어 참이고, 전체 검증은 루트 기준 URI로 풀어 첫 값에서 거짓입니다. 2019 변형은 `$recursiveAnchor: true`가 자원 루트가 아닌 `host`에 있어 L12로 거부됩니다.

### 계획 이탈

- 사슬 자원 탐색은 가드 자신의 서브트리를 제외합니다. `if` 안의 선언은 B2‴의 '참조의 조상' 규칙으로만 묶이고, 사슬 자원의 다른 곳에 있는 경로 밖 선언은 그대로 먼저 채웁니다. 팀 리드가 이 해석을 확인했습니다.
- T8′(나)의 2019 변형은 통과 사례에서 L12 거부 사례로 바뀌었습니다. 2019-09는 `$recursiveAnchor`의 동작을 자원 루트에서만 정의하므로, 자원 루트가 아닌 곳의 `$recursiveAnchor: true`는 인정하지 않습니다.
- L9 관찰의 2019 변형도 같은 이유로 L12 거부가 되었고, L9 관찰은 2020에서만 판정을 기록합니다.

### 관문

| 관문 | 결과 |
| --- | --- |
| G-A1′ 빨간 실행 | 위 표와 같습니다. |
| G-A2 프로브 삭제 | `probes` 참조가 없고, `createSchemaRootRegistry`의 소비자는 세 진입점, `createInstanceValidator.ts`, `createValidatorFactory.ts`로 남습니다. |
| G-A3 플러그인 전체 시험 | ajv8 28파일 460건, ajv7 23파일 201건 통과(guard-root-lifetime 포함). |
| G-A4 typecheck·lint·build | 두 플러그인의 여섯 호출이 모두 종료 코드 0입니다. |
| G-A5 엔진 validation 단위 시험 | ajv8 dist를 다시 빌드한 뒤 25파일 105건 통과. |
| G-A7′ 가드 비용 | 아래 세 표. |
| G-A8 비동기 루트 `/if` 거부 유지 | ajv8 8건이 기준과 수정 뒤 모두 통과, ajv7 4건은 수정 뒤 통과. |
| G-X3 저장소 검사 계획 | 병합 검토와 독립 검증 반영 뒤 기준 `40bb80e9a`부터 문서 커밋까지의 범위에서 24단계가 모두 통과했고 종료 코드는 0입니다(schema-form 단위 4284건, ajv8 458건, ajv7 199건, ajv6 141건). |
| B3 순서 | 가드를 먼저 컴파일하도록 바꾸면 경로 밖 선언자 사례 4건이 실패하므로, 선언 함수를 먼저 얻는 순서가 필요합니다. |

두 표 모두 기준과 PR-A의 빌드된 dist를 번갈아 세 번 실행한 범위입니다. 병합 검토와 독립 검증의 지적을 반영한 최종 코드로 다시 쟀습니다.

첫 표는 앵커가 있는 2020 루트의 첫 `/if` 가드를 300개 루트에서 잰 평균입니다. API 호출 수는 AJV 핵심 클래스의 `compile`과 `getSchema` 호출 수이고, 고유 함수 수는 그 호출이 돌려준 함수의 고유 identity 수입니다. 실제 함수 생성 횟수는 재지 않았습니다.

| 상태 | `compile` | `getSchema` | 고유 함수 | 첫 가드 평균 |
| --- | --- | --- | --- | --- |
| 기준 `40bb80e9a` | 1 | 0 | 1 | 0.637–0.646 ms |
| PR-A | 1 | 1 | 2 | 0.665–0.693 ms |

앵커 루트의 첫 가드는 PR-A에서 약 4–8% 느립니다. 선언 함수를 얻는 `getSchema` 한 번이 늘어난 비용입니다.

둘째 표는 동적 키워드가 없는 루트에서 중첩된 `if` 가드 10개를 루트 위치로 컴파일한 비용입니다(`directGuardCompile: false`, ajv8은 2020 진입점, ajv7은 2019 바인딩). 300개 루트의 루트당 평균입니다. 이런 루트는 등록할 때 동적 키워드 키가 없다고 한 번 판정되어, PR-A에서도 앵커 수집과 묶이지 않은 참조 검사를 건너뜁니다. 두 판 모두 기준보다 잡음 범위를 넘어 느려지지 않았습니다.

| 상태 | ajv8 가드 10개 | ajv7 가드 10개 |
| --- | --- | --- |
| 기준 `40bb80e9a` | 3.267–3.274 ms | 3.025–3.037 ms |
| PR-A | 3.252–3.310 ms | 3.004–3.071 ms |

셋째 표는 `$dynamicAnchor`를 선언한 2020 루트에서 중첩된 `if` 가드 400개를 루트 위치로 컴파일한 비용입니다(ajv8, `directGuardCompile: false`). 값은 루트 다섯 개의 루트당 평균입니다. PR-A는 가드마다 사슬 자원을 한 번 훑으므로 거의 두 배가 걸립니다. 이 비용은 받아들인 것입니다. 훑는 범위는 사슬 자원의 크기로 제한되고, 인스턴스가 `$dynamicRef`를 지원하며 루트에 동적 키워드가 있을 때만 냅니다.

| 상태 | 가드 400개 |
| --- | --- |
| 기준 `40bb80e9a` | 428.0–442.6 ms |
| PR-A | 793.0–802.5 ms |

### 보존한 계약

| 계약 | 상태 |
| --- | --- |
| VALIDATE-047 | 사례 (i)–(iii)과 수명·직접 컴파일·메타 스키마·release 시험이 변경 없이 통과합니다. 사례 (iv)는 F25대로 ajv8은 관찰, ajv7은 컴파일 거부로 바뀌었고 지원 밖이라는 성격은 같습니다. |
| 55C-02 | 위치당 가드 하나는 그대로입니다. "첫 번째로 컴파일된 범위의 답"이라는 문구는 IR-11 PR-A 보충의 "어휘적 사슬로 계산한 판정"으로 대체되었고, 원래 인용문은 원장에 그대로 둡니다. |
| DR-3 | 엔진 코드는 바뀌지 않았고 엔진 validation 단위 시험이 그대로 통과합니다. |

## PR-D — shared validator parity scenarios

설계는 [IR-11 절의 PR-D 하위 절](../../plan/input-responsiveness/design.md#pr-d--shared-validator-parity-scenarios)입니다. 기준은 단계 브랜치 `a4aa6da57`(PR-A·PR-B 병합 뒤)입니다.

### 커밋

| 순서 | 커밋 | 내용 |
| --- | --- | --- |
| 1 | `9b2d510af` | 시나리오 패키지의 `src/validator/` 경계(형, 가드·검증·수명 시나리오, `index.ts`, INTENT·DETAIL)와 `"./validator"` 하위 경로 |
| 2 | `b42c5ee18` | 세 플러그인의 parity 시험 세 파일(행을 리터럴로 적고 수집 단계에서 카탈로그와 대조)과 시험 도우미, `@aileron/schema-form-scenarios` 개발 의존, `yarn.lock`의 작업 공간 연결 세 줄, ajv7·ajv8 `CLAUDE.md` |
| 3 | 이 기록을 담은 문서 커밋 | 시나리오 패키지 루트 INTENT·DETAIL의 범위 문장, design.md PR-D 하위 절, 이 절 |

### 시나리오 수

선언한 시나리오는 가드 31건(적합성 28, 관찰 3), 검증 5건, 수명 7건입니다. 플러그인은 자기 진입점·방언·기능에 맞는 시나리오만 펼칩니다.

| 파일 | ajv8 | ajv7 | ajv6 |
| --- | --- | --- | --- |
| `parity.guard.test.ts` | 32(적합성 29, 관찰 3) | 23(적합성 21, 관찰 2) | 11(적합성 11) |
| `parity.validation.test.ts` | 15 | 8 | 4 |
| `parity.lifetime.test.ts` | 22 | 15 | 8 |
| 합계 | 69 | 46 | 23 |

모든 파일이 관찰 행을 포함해 펼친 행 32건 이하입니다. 각 파일은 행을 시나리오 `id`·진입점·프로필·`directGuardCompile`의 리터럴 목록으로 적어 실행하지 않고도 셀 수 있고, 스키마와 기대값은 실행할 때 카탈로그에서 `id`로 찾습니다. 목록이 카탈로그를 펼친 결과와 다르면 수집 단계에서 실패합니다(한 행을 지워 실패를 확인한 뒤 되돌렸습니다). ajv6에는 관찰 행이 없습니다. 관찰 사례는 모두 2019 또는 2020 방언이기 때문입니다.

### 빨간 실행

현재 단계 코드에서 세 플러그인의 parity 시험은 모두 통과했습니다(ajv8 69, ajv7 46, ajv6 23). 적합성 사례 가운데 빨간 것은 없으므로 결함 발견은 없습니다.

PR-A 전 ajv8 제품 코드(`40bb80e9a`의 `src`를 작업 기록의 스크래치 사본으로 풀고, 이 PR의 가드 시험과 도우미를 얹어 실행)에서는 가드 시험 32건 중 10건이 실패했습니다. 계획의 T7′ 표가 빨강이라고 적은 여덟 칸과, PR-A의 빨간 실행이 이미 빨강으로 기록한 두 거부 사례입니다. 보호 칸은 모두 통과했습니다.

| 시나리오 | 2020 | 2019 | 실패 값 |
| --- | --- | --- | --- |
| 결함 A T1, 호스트 `{}` | 빨강 | 빨강 | 가드 true, 기대 false |
| 결함 A T1, 호스트 `{ flag: true }` | 보호 | 보호 | — |
| 결함 A T2, `next.kind === 'yes'` | 빨강 | 빨강 | 가드 false, 기대 true |
| 결함 A T2, `next.kind === 'no'` | 보호 | 보호 | — |
| 계획 T8 (가) 중첩 자원 사슬 | 빨강 | 빨강 | 가드 false, 기대 true |
| 계획 T9 비동기 루트 앵커, 중첩 포인터 | 빨강 | 빨강 | 예외 없이 false |
| 계획 T9 비동기 루트 앵커, 루트 `/if` | 보호 | 보호 | — |
| L8′ 사슬 밖 `$id` 래퍼의 거부 | — | 빨강 | 예외 없이 false |
| 계획 T8 (나) 자원 루트가 아닌 `$recursiveAnchor`의 거부(L12) | — | 빨강 | 예외 없이 false |
| 그 밖의 적합성 17건과 관찰 3건 | 통과 | 통과 | — |

### 관찰 사례 (단언 없음)

관찰 행은 `process.env.PARITY_OBSERVE`가 있을 때만 `console.info`로 표 한 줄을 냅니다. 아래는 그 변수를 켜고 node로 세 플러그인의 parity 시험을 한 번 실행한 현재 단계 코드의 관측값이며, 모든 행은 기본 프로필과 `directGuardCompile: true`입니다.

| 시나리오 | 진입점 | ajv8 | ajv7 | ajv6 | AJV 전체 검증 |
| --- | --- | --- | --- | --- | --- |
| VALIDATE-047 (iv), ajv8 모양 | 2020 | true(어휘적 진입, 문자열 범위의 답) | 해당 없음 | 해당 없음 | 문자열 범위 true, 숫자 범위 false(PR-A 기록) |
| VALIDATE-047 (iv), ajv7 모양 | 2019 | 컴파일 거부(`#node`가 묶이지 않음) | 컴파일 거부(같은 메시지) | 해당 없음 | 범위마다 다름(원본 시험) |
| L16 `if` 밖 비루트 `$recursiveAnchor`와 `if` 안 조상 선언 | 2019 | false | false | 해당 없음 | true |

(iv) ajv7 모양의 거부 메시지는 "Guard dynamic reference #node is not bound: move the anchor to an ancestor of the reference (for example the root of the allOf element that contains it) or to a chain resource"입니다. L16 사례에서는 README가 적은 대로 가드와 전체 검증이 다릅니다. L16 사례는 원본 시험이 없어 ajv8 README의 L16 설명으로 만든 스키마입니다.

### CI 선택

`selectAffectedWorkspaces.mjs --tier pr --base a4aa6da57 --head 9b2d510af`는 시나리오 패키지만 바뀐 범위에서 바뀐 작업 공간으로 `@aileron/schema-form-scenarios` 하나, 의존 작업 공간 열두 개를 골랐고 그 안에 세 AJV 플러그인이 있습니다. 대체 사유는 없습니다. 이 범위에서는 플러그인이 아직 시나리오 패키지에 의존하지 않으므로, 플러그인은 `@canard/schema-form`을 거쳐 선택되었습니다. 둘째 커밋 뒤에는 `scripts/ci/helpers/workspaces/readWorkspaces.mjs:33`이 개발 의존을 그래프에 넣고 `scripts/ci/helpers/selection/scanImportDependencies.mjs:15`가 그 목록에서 간선을 만들므로 직접 간선도 생깁니다.

### 계획 이탈

- codex 설계 검토(gates.md G-X2의 PR-D 행)와 조정자 결정을 브리프보다 앞세워 반영했습니다. L8′ 사슬 밖 래퍼와 계획 T8 (나)의 2019 비루트 앵커는 관찰이 아니라 `expected: 'rejects'` 적합성 사례이고, 2019-09 동적 어휘가 있는 진입점에만 적용합니다. 관찰 묶음은 사례 (iv)와 L16만 남겼고, 브리프가 적은 북엔딩(L13) 관찰은 원본 시험이 없어 빼었습니다. 관찰은 파일에 쓰지 않고 `PARITY_OBSERVE`가 있을 때만 `console.info`로 냅니다.
- 가드 시나리오의 기대값 형에 관찰 사례용 `null`을 더했습니다. 브리프의 형은 `boolean | 'rejects'`였습니다.
- 수명 단계 어휘에 IR-10 T9 (가)·(다)를 위한 `keepConsumerSchemaAfterSameIdFailure`와 `keepConsumerMetaSchemaAfterSameIdFailure`를 더했습니다. T9 (다)의 원본 단언(AJV 내부 `schemas` 순서와 `makeSibling` 직접 호출)은 공개 API로 옮길 수 없어, 같은 `$id`의 두 번째 살아 있는 루트가 소비자 등록을 복사한 형제 인스턴스에서 컴파일되는지로 바꿨습니다.
- ajv8 가드 파일을 32건에 맞추려고, 여러 값을 도는 원본 사례는 판정을 가르는 값만 옮겼습니다(예: T1은 `{}`와 `{ flag: true }`, T8 (가)는 첫 값). IR-10 사례는 draft-07 진입점에만, L8′ 래퍼는 2019에만 적용합니다. 원본 시험은 그대로 남아 있으므로 지운 검증은 없습니다.
- 계획의 T7′대로 T8 (가)와 T9를 결함 A 사례(T1·T2)와 함께 넣었습니다.
- `yarn install`은 저장소 설정 `enableImmutableInstalls: true` 때문에 처음 호출이 잠금 파일을 바꾸지 못하고 끝났고, `--no-immutable`로 한 번 더 호출했습니다. 첫 호출이 보여 준 변경과 최종 `yarn.lock` 변경은 같은 작업 공간 연결 세 줄입니다.
- 지정된 의존 폐쇄 빌드는 schema-form의 typecheck에서 멈췄습니다. 그 시험이 세 플러그인의 dist 형을 읽는데 플러그인 빌드가 그 뒤에 오기 때문입니다. 세 플러그인을 따로 빌드한 뒤 schema-form typecheck는 종료 코드 0입니다.
- ajv6에는 `CLAUDE.md`가 없어 parity 문장을 ajv7·ajv8에만 더했습니다.

### 관문

| 관문 | 결과 |
| --- | --- |
| G-D1 공유 | `index.ts`가 이름으로 내보내고, 세 플러그인의 `package.json` 개발 의존에 `@aileron/schema-form-scenarios`가 있으며, 세 플러그인의 parity 시험이 `@aileron/schema-form-scenarios/validator`를 가져옵니다. |
| G-D2 세 시험 | parity 파일: ajv8 3파일 69건, ajv7 3파일 46건, ajv6 3파일 23건 통과. 플러그인 전체: ajv8 31파일 529건, ajv7 26파일 247건, ajv6 21파일 164건 통과. 세 플러그인과 시나리오 패키지의 typecheck·lint, schema-form typecheck의 종료 코드 0. |
| G-D2′ 묶음 분리 | 적합성 행은 단언하고 관찰 행은 기록만 합니다. 관찰 표는 위에 있습니다. |
| G-D3 CI 선택 | 위 CI 선택 절과 같습니다. |
| G-X3 저장소 점검 계획 | 아래에 적습니다. |
