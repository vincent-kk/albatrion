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
