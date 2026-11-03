# IR-10 — object value copy and guard-only compile 결과

설계는 [IR-10 절](../../plan/input-responsiveness/design.md#ir-10--object-value-copy-and-guard-only-compile-2026-11-04), 소유자 원문은 `request.md`의 IR-10 절(quote 76–82)입니다. 기준은 단계 브랜치 `a41d6ab36`입니다.

## 커밋

| 순서 | 커밋 | 내용 |
| --- | --- | --- |
| 1 | `b2df2b9a1` | 문서: design.md IR-10 절, request.md quote 76–82, 원장 보충 6곳, ADR 0001·0004·design/05 보충, 엔진 DETAIL 두 곳, 플러그인 README·CLAUDE.md |
| 2 | `24a58bf52` | 시험: T1–T3·T6–T9(세 플러그인 `guard-meta-schema.test.ts`), T4, C2 계수, T5(`release.test.ts`, ajv7·ajv6 수집 도우미) |
| 3 | `e800f1174`, `066de5ea7`, `4c4cacae3` | 시험판 커밋 `3833280c8`, `f666d837f`, `13a31635d`의 cherry-pick(메시지에서 시험판 문구만 뺌) |
| 4 | `936d8795d` | 엔진: `copyObjectValue`를 `behaviors/objectBehavior/branch/utils/`로 옮김(C1) |
| 5 | `f573f236a` | 플러그인: C3a·C4·C5(검증용 등록 지연과 원자적 되돌리기, ajv7·ajv6 `createGuardCompiler(instance, …)`) |
| 6 | `4f175b7b7` | 시험: ajv7·ajv6의 선택 항목 `bind`를 `bind?.`로 호출(타입 오류 수정, assertion 무변경) |
| 7 | `399fc7935` | 시험: `create-validator.test.tsx` 재작성(T5 확장, 조정자 결정) |

## 빨간 실행

제품 코드가 기준 그대로인 테스트 커밋 상태에서 새 시험 파일을 실행했습니다. 아래 수는 실패한 assertion 수이며, 시험의 assertion은 모두 이름표를 단 `expect.soft`라 한 시험 안에서 빨강과 보호가 따로 드러납니다. 계획이 빨강이라고 적은 assertion은 모두 실패했고 보호라고 적은 assertion은 모두 통과했습니다.

| 시험 | ajv8 | ajv7 | ajv6 | 보호(세 판 통과) |
| --- | --- | --- | --- | --- |
| T1 | 27(방언마다 9: 세 변형 × 가드 컴파일·일치·불일치) | 9 | 9 | 세 변형의 `compile` throw |
| T2 | 6 | 6 | 6 | 없음 |
| T3 | 3(자족 가드 뒤 누적 등록: `$id` 없음 1, 루트 `$id` 뒤 3; `$id` 루트 `compile`의 등록 0) | 3 | 3 | `$id` 없는 루트의 `compile` 등록 0, `$ref` 가드 등록 1과 그 인스턴스 |
| T6 | 1(직접 가드 뒤 등록 1) | 1 | 1 | 루트 위치 가드 뒤 1·1, 가드용 인스턴스 생성 1회, 직접 술어 판정, release |
| T7 | 3 | 3 | 3 | `compile` throw |
| T8 | 4(재컴파일이 중복 등록 오류, release 뒤 같은 `$id` 컴파일·거부·수용) | 4 | 0 | 첫 `compile` 메타 위반, B의 `getSchema`·`$ref` 컴파일; ajv6은 전부 보호 |
| T9 | 1(별칭 값 덮어씀) | 1 | 해당 없음 | (가) 소비자 같은 `$id` 보존, (다) 메타 스키마 순서와 형제 생성 |

- T4(`copyObjectValue.test.ts`)는 모듈이 없어 파일 단위로 실패했습니다(새 기호의 부재). C2 뒤 `settle.sibling-preparation.test.ts`는 기준 코드에서도 녹색입니다.
- T5: ajv8 `release.test.ts`의 가드만 컴파일한 뒤 release 사례가 빨강(바인딩 인스턴스에 플러그인 키 `removeSchema`), 재작성한 compile 뒤 release 사례는 녹색입니다. ajv7·ajv6에 더한 가드만 release 사례는 빨강, 새 호출 형태로 고친 `guard-root-lifetime` 수집 시험 4건은 빨강(기준의 `createGuardCompiler` 서명)입니다.
- T7의 판정값은 세 판 모두 `{ kind: 'ab' }` 참, `{ kind: 'a' }` 거짓입니다(`minLength: 1.5`를 생성된 코드가 그대로 비교).
- 시험 파일 sha256(`shasum -a 256`):

| 파일 | 빨간 실행(`24a58bf52`) | 최종 |
| --- | --- | --- |
| ajv8 `src/validator/__tests__/guard-meta-schema.test.ts` | `afd2e029d4e1e88a2c98b61648445ee2170cd2a2da5d661107a128bc1e211fbf` | 같음 |
| ajv7 `src/validator/__tests__/guard-meta-schema.test.ts` | `0b7b3fba1c000deef7fcbe1f78a9158a1589d2c22352f9415c974ed4926011d4` | `392355198a3554fd61975cdd9dead9263358ea9d84962e123c6625ed814729d6` |
| ajv6 `src/validator/__tests__/guard-meta-schema.test.ts` | `32d5232e7a3d49bdd8d96955429f9ec1daf6b4b4172ee96e9d4906261108794f` | `4aab6ddeecb7d1c455bd364d84958399bc52e5a713147a9b98e0d8347d2dbb9c` |
| schema-form `…/branch/utils/__tests__/copyObjectValue.test.ts` | `c04534f53810c1cf162a591cd1c59c07d53712119e3cb5f8ebf3a43ba1e3bde1` | 같음 |

ajv7·ajv6의 최종 해시 차이는 `bind(`를 `bind?.(`로 바꾼 것뿐입니다(`4f175b7b7`).

## 녹색 실행과 관문

| 관문 | 결과 | 증거 |
| --- | --- | --- |
| G1 | met | `COPY_TESTS_OK` |
| G2 | met | `COPY_PLACEMENT_OK` |
| G3 | met | `AJV8_GUARD_META_OK` |
| G4 | met | `AJV7_GUARD_META_OK` |
| G5 | met | `AJV6_GUARD_META_OK` |
| G6 | met | `NO_EAGER_GUARD_ROOT` |
| G16 | met | `NO_EAGER_VALIDATION_ROOT` |
| G7 | met | `SURFACE_AND_PATHS_OK` |
| G8 | met | `RECORDS_OK` |
| G9 | met | `TYPECHECK_ALL_OK` |
| G10 | met | `LINT_ALL_OK` |
| G11 | met | `UNIT_RENDER_OK`(시험 파일 844 통과·1 skip, 시험 5,349 통과·8 skip) |
| G12 | met | `PLUGIN_SUITES_OK`(ajv8 353, ajv7 146, ajv6 141 통과; create-validator 재작성 뒤, 메시지 정리 전 실행. 메시지 정리는 tree 동일, 메시지만 변경) |
| G13 | met | 네 패키지 `yarn --cwd … build` 성공. schema-form 마지막 줄 `✓ agents-hashes.json written: 14 file(s)`, ajv8 `Fixed 24 imports in 18 .d.ts files.`, ajv7 `Fixed 12 imports in 8 .d.ts files.`, ajv6 `Fixed 13 imports in 8 .d.ts files.` |
| G14·G15 | 조정자 | — |

## 브라우저 측정(F9, 계획에서 옮김)

- 실행 41650676406(시험판 2 = `13a31635d` 대 단계 브랜치): type-flat-500 1.342 → 1.245 ms(−7.2%), mount-if-flat-500-none 158.45 → 141.35 ms(−17.1 ms), 나머지 일곱 사례는 유의한 회귀로 기록되지 않음.
- 실행 41651117812(시험판 2 대 0.16.1): type-flat-500 1.488 대 1.165 ms(+27.7%; 단계 브랜치의 최종 실행 41605464351은 +31.8%), mount-if-flat-500-none 187.2 대 157.25 ms(+19.0%; 단계 +26.2%), first-key-flat-500-validate 182.1 대 134.8 ms(+35.1%; 단계 +36.8%), mount-if-flat-500-validate 비율 0.98(단계 1.00), mount-flat-500-none 0.878(단계 0.877).
- 시험판 1의 "느려짐" 한 건은 재측정 41654678521에서 −2.1 ms로 오차였습니다.
- 최종 브랜치 CI 실행: 조정자가 채웁니다.

## 계획과 다르게 한 것

- T5 확장(조정자 결정): `create-validator.test.tsx` 1건(ajv8은 방언 3건) — 전체 compile 선행으로 재작성. 가드만 컴파일해도 바인딩 인스턴스에 루트가 등록된다는 전제였으며, 시험 이름과 나머지 assertion은 그대로입니다. 같은 전제로 실패한 다른 기존 시험은 없습니다.
- T1의 `compile` throw는 오류 문구 없이 throw만 확인합니다. 기준 코드의 ajv8 루트 `$id` 변형은 앞선 가드 실패가 남긴 `refs` 때문에 메타 위반이 아니라 중복 등록 오류로 throw하므로, 계획 문구("throw한다")대로 throw 여부만 봅니다. 메타 위반 문구는 T7·T8이 확인합니다.
- 시험 구성: 파일당 사례 수를 줄이려고 각 시험(T1은 방언마다)을 `it` 하나로 두고 assertion마다 이름표를 단 `expect.soft`를 썼습니다. ajv8에서 T1만 세 방언을 돌고 나머지는 기본 방언입니다. ajv6에는 `refs`가 공개되지 않아 T9 (나)가 없습니다.
- ajv7·ajv6의 등록 레코드에는 `validationRefs`를 두지 않았습니다. 두 판의 해제는 그 목록을 쓰지 않습니다.
- ajv6 `utils/ajvInternalRegistry.d.ts`에 `_refs`를 선언하고 `_schemas`를 쓰기 가능하게 했습니다(제자리 복원을 캐스트 없이 하기 위해).
- ajv7·ajv6 `release.test.ts`는 기존 사례를 그대로 두고 가드만 release 사례를 더했습니다. 계획 T5가 적은 `guard-root-lifetime.test.ts` 자체는 바뀐 호출이 없어 수집 도우미만 고쳤습니다.
- 문서: ajv6 플러그인에는 `CLAUDE.md`가 없어 만들지 않았습니다. 한글 README에는 `configure` 절이 없어 메타 스키마 문장을 `compileGuard` 항목에 더했습니다. 소유자 원문 번호는 단계 전체 번호(마지막 75)에 이어 76–82로 매겼습니다.
- Amendment 4(키 순서까지 되돌리는 제자리 복원, T9 세 부분, D의 `$id` 분리)는 수정 전의 구현·시험 커밋에 이미 들어 있어 별도 수정 커밋이 없습니다.
- cherry-pick한 세 커밋의 메시지에서 시험판 문구 "Measurement prototype, not for merge."를 조정자 지시로 지웠습니다(`git filter-branch --msg-filter`). 아홉 커밋의 tree와 나머지 메시지는 그대로이고, 그 뒤 일곱 커밋의 해시가 바뀌었습니다(위 표는 바뀐 뒤의 해시).

## 작업 공간 경위

결과 기록을 쓰기 전에 원래 작업 공간 worktree가 이 작업 밖에서 제거되었습니다. 그것을 모른 채 실행한 결과 커밋 하나가 본체 checkout의 단계 브랜치에 들어갔고, 푸시 전에 `git reset --soft`로 되돌려 단계 브랜치는 `a41d6ab36` 그대로입니다. IR-10 브랜치는 영향을 받지 않았습니다. 조정자가 같은 브랜치로 새 worktree를 만들었고, 메시지 정리·이 기록·G7·G8은 새 worktree에서 실행했습니다. G1–G6, G9–G11, G13, G16과 G12는 제거 전 worktree에서 같은 tree로 실행한 결과입니다.
