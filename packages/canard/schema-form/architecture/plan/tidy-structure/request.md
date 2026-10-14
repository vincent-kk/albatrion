# 정돈 — 최소 export 계약과 fractal 뿌리의 첫인상 (수정 계획, 소유자 검토용)

> 2026-10-14, 원장 관리자. 287·288라운드 소유자 지시(`../../reviews/round-287-owner-answers.md`, `../../reviews/round-288-owner-answers.md`)로 연다. 이 문서는 "어떻게 고칠 생각인지"를 보이는 계획이며, 소유자가 검토해 진행을 허가하기 전에는 코드를 바꾸지 않는다. 전수 검사 원자료는 `/tmp/claude-501/s2/fractal-audit.md`(fractal 53개, 1.0.0-beta 48b1a59fb 기준)이고, 검사 스크립트는 `/tmp/claude-501/s2/audit.cjs`다.

## 0. 원칙 — 소유자의 말을 그대로 둔 것

1. **index.ts는 계약의 기록이다.** 기능 집단이 어떤 인터페이스를 계약했는지의 기록이면서, 내부의 보조 함수와 하위 fractal 트리가 복잡도를 폭발시키지 않게 하는 엄중한 계약이다(287라운드).
2. **뿌리는 첫인상이다.** fractal 디렉터리를 열었을 때 먼저 보이는 `index.ts`와 뿌리의 평평한 파일들이 그 fractal의 1차 이미지를 결정하며, 독자는 그때 가장 집중한다. 뿌리에 보이는데 외부에서 쓰이지 않는 파일은 기능 고장에 준한다(287라운드).
3. **소비자의 정의.** 이 계획에서 "소비자"는 fractal 밖의 제품 코드(다른 fractal, 다른 패키지)다. 시험·벤치·스토리는 소비자가 아니다. 시험은 검증 대상 fractal 안에 살며 내부 파일을 직접 가져온다.

## 1. 발견 — 무엇이 어긋났고, 누가 틀렸는가

소유자 지시(288라운드)대로 항목마다 "구현이 규칙을 안 지킨 것"인지 "규칙(또는 도구)이 잘못된 것"인지를 가른다. 판정 근거는 저장소의 `.claude/rules/filid_fractal-boundaries.md`·`seiri_public-contract.md`·`seiri_reuse-first.md` 원문과, filid 도구를 지금 상태에 직접 돌린 결과다.

| 번호 | 발견 | 규모 | 규칙이 말하는 것 | 판정 |
| --- | --- | --- | --- | --- |
| F1 | 시험이 자기 fractal의 index를 경유해 내부를 가져온다 | 275파일 | filid §3 "한 fractal 안에서는 내부 파일을 직접 가져오고 자기 진입점을 경유하지 않는다". 그러나 §5는 "검증 파일은 소유자 안에서 이 규칙의 판정을 받지 않는다"고 해서 구현자가 시험은 무엇이든 된다고 읽었다 | 구현 위반 + 규칙 문장의 모호함(§5가 §3을 덮는 것처럼 읽힘) |
| F2 | index가 밖에서 안 쓰이는 이름을 내보낸다 | fractal 12개, 이름 104개 | seiri public-contract §1 "소비자 있는 것만 export". "소비자"에 시험이 드는지 규칙이 말하지 않아 시험을 소비자로 셌다 | 규칙 결함(소비자의 정의 없음) + 그 결과의 구현 위반 |
| F3 | 뿌리에 구현 파일이 여럿 평평하게 놓였다 | `fieldInputs` 11, providers 아홉(각 3, `FormErrorContext` 10), `errors` 5, `helpers/error/formatErrorMessage` 31 | filid §4 "뿌리는 문서·진입점·동명 구현 하나만". 규칙은 분명하고 **도구도 검사한다**(내장 규칙 `zero-peer-file`). 그런데 저장소 `.filid/config.json`이 이 규칙을 `**/canard/schema-form/**` 전체에 면제해 두어(커밋 8306c70ca, 2026-05-29 "scope structure rules to schema-form conventions") `validate`가 발견 0으로 통과했다. 면제를 지운 임시 워크트리에서 다시 돌리면 `fieldInputs`의 뿌리 파일 11개가 모두 잡힌다(2026-10-14 재실행, 발견 11) | 구현 위반 + **설정 위반**(우리가 규칙을 꺼 두었음). 도구 몫은 "면제된 규칙이 건너뜀 표시 없이 통과로 보인다"는 점뿐 — fairy08이 찾아 원장 관리자가 재현으로 확인(정정 기록 §7) |
| F4 | 뿌리 파일이 외부에서 안 쓰인다(시험만 쓰거나 아무도 안 씀) | 16파일(`formatErrorMessage` 16) + 실질상 `surface/nodeFromJSONSchema.ts`. (`types/rolled` 둘은 오판이었다 — 루트 `src/index.ts:84`의 `export type * from './types/rolled'`로 공개 이름이며 플러그인 넷이 쓴다; 정정 기록 §7) | seiri reuse-first §3 "이미 있던 죽은 코드는 두고 언급만 한다". 규칙이 방치를 허용했다. 옛 엔진이 쓰던 포맷터가 새 엔진에서 안 쓰이게 됐는데 07이 "기존 코드"로 보고 남겼다 | **규칙 결함**(죽은 코드 허용이 뿌리 원칙과 충돌) |
| F5 | "뿌리의 첫인상" 전제 자체가 어느 규칙에도 없다 | — | filid·seiri 모두 뿌리를 독자의 첫 화면으로 보는 문장이 없다 | **규칙 공백**(filid 이슈의 본문) |
| F6 | 형제 fractal의 내부를 시험이 직접 읽는다 | 4건 22파일(settle·core 시험→`surface/FieldNode` 13, validation 시험→write의 fixture 8, write 시험→settle 내부 1, Field 시험→`RootNodeContext` 내부 1) | filid §5 "다른 fractal의 내부에 닿는 검증 파일은 면제가 아니라 잘못 놓인 것" | 구현 위반 |
| F7 | 벤치 면제 선언 넷이 DETAIL에 있다 | `core`·`surface`·`settle` DETAIL | 276라운드 소유자 답으로 허용. 그러나 `.filid/config.json`이 `bench`·`benchmarks`·`__benchmarks__`·`stories`를 통째로 무시하므로 filid는 벤치를 보지도 않는다 | 선언은 규칙대로이나 도구가 검사하지 않는 선언(F3과 같은 부류) |
| F8 | `nodeFromJSONSchema`가 SPECIFICATION에 공개 API처럼 적혀 있으나 패키지 `exports`는 `"."` 하나라 외부에서 닿을 수 없다 | 문서 2곳(en·ko) | 문서와 계약의 불일치 | 구현(문서) 위반 — 공개할지 지울지는 소유자 결정 |

판정의 요지(2026-10-14 정정 뒤): **규칙 결함 셋(F2 소비자 정의, F4 죽은 코드 허용, F5 뿌리 전제)이 있고, 그 틈으로 구현 위반(F1·F3·F6)이 들어왔다. F3의 "도구 결함"은 틀린 판정이었다 — 도구는 검사하는데 우리 설정이 꺼 두었다(설정 위반).** filid 이슈는 F2·F5와 도구 표시 문제(면제가 통과로 보임, F3·F7)를 담는다(§5). 규칙이 분명한 F3·F6은 구현 쪽 책임이며, 07 리뷰(원장 관리자·verifier)도 잡지 못했고, 원장 관리자의 첫 판정도 설정을 보지 않고 도구를 탓했다.

## 2. 고치는 법 — 항목별

| 번호 | 조치 | 동작 변화 | 비고 |
| --- | --- | --- | --- |
| F4 | `helpers/error/formatErrorMessage`의 포맷터 31개 중 제품이 쓰는 넷(`formatRegisterPluginError`, `formatFieldInputMapError`, `formatCreateDynamicFunctionError`, `formatVirtualizationDisabledWarning`)과 `formatValidationError`만 남기고 27개 이름(파일 15개, 고아 utils 9개)과 그 시험(`formatErrorMessage.test.ts`의 해당 it)을 지운다. 남는 넷은 각자의 유일한 소비자 fractal의 `utils/`로 옮기고(소비자 하나면 organ, filid code-placement §1), 넷이 공유하는 `createDivider`·`getErrorMessage`는 소비자 넷의 최소 공통 fractal이 `src`이므로 `helpers/error`에 남겨 index가 `formatValidationError`와 함께 셋을 내보낸다(정돈-1 편집자 결정, fixy08 선택지 1). `types/rolled` 둘은 지우지 않는다(공개 이름, §7) | 없음 | 지우는 포맷터가 레거시 엔진의 것임은 `src/__legacy__/helpers/error/formatErrorMessage/`가 보인다 |
| F1 | 시험 275파일의 자기 index import를 내부 파일 직접 import로 바꾼다(기계적, codemod) | 없음 | 가장 큰 diff. 리뷰는 "시험 수 동일·전부 초록"으로 기계적으로 한다 |
| F2 | F1 뒤 남는 잉여 이름을 index에서 지운다: `core` 6, `engine` 3, `blueprint` 12, `errors` 38(오류 코드 상수 — 문서가 문자열로 적고 제품은 상수를 안 씀; 소유자 결정 D4), `helpers/error` 27(F4로 소멸), `helpers/warning` 8, `components/Form` 5(`FormRender`·`FormField`·`FormLabel`·`FormInput`·`FormError`는 `Form.tsx`만 씀), 그 외 `navigation` 1·`record` 1·`derive` 2·`validation` 1·`write` 1·`jsonPointer` 3·`virtualization` 1·`Field` 1·`DeferredFieldProxy` 1 | 없음(공개 `index.d.ts` 동일) | 루트 `src/index.ts` 92개는 전부 외부 소비자가 있어 손대지 않는다 |
| F6 | `createDispatchTree` fixture를 validation·write의 최소 공통 fractal `engine`의 `__tests__/fixtures/`로 올린다. `surface/FieldNode`를 직접 읽는 settle·core 시험 13개는 무엇이 필요한지 보고 (가) `core` index의 공개 이름으로 바꿀 수 있으면 바꾸고 (나) 노드 내부가 정말 필요하면 그 시험을 `surface/__tests__`로 옮긴다. write→settle 1건, Field→RootNodeContext 1건은 공개 이름으로 바꾼다 | 없음 | 결과로 `surface` DETAIL의 시험 면제 선언은 지운다 |
| F3 | 뿌리 구현을 organ 아래로 내린다. `fieldInputs`: 11개를 `fieldInputs/components/`로, index는 `fieldInputDefinitions` 하나 그대로. providers 아홉: `XxxContext.ts`·`XxxContextProvider.tsx`·`useXxxContext.ts`를 각 fractal의 `components/`·`hooks/`(또는 하나의 organ)로. `errors`: 클래스 넷과 `formErrorCode.ts`를 `errors/classes/`·`errors/codes/`로. `components/Form`: `FormContents`→`FormRoot`로 이름을 바꾸고 `FormRootProxy`·`FormChildrenRenderer`와 함께 `Form/root/`로, `Form/components/`에는 공개 조각 다섯만 | 없음 | 이동 전에 각 DETAIL을 먼저 고친다(filid code-placement §5). organ 이름은 결정 D3 |
| F7 | 벤치 면제 선언 넷은 그대로 둔다(filid가 벤치를 무시하므로 옮겨도 검사되지 않고, 276라운드 답이 허용) | 없음 | 벤치를 `__benchmarks__`로 옮기는 안은 접는다 |
| F8 | 결정 D2에 따라 (가) 루트 `src/index.ts`에 `nodeFromJSONSchema`를 올리고 INTENT에 공개 의도를 적거나 (나) SPECIFICATION의 "Node Initialization" 예를 `Form`·`RootNodeContext` 기준으로 바꾸고 `nodeFromJSONSchema.ts`를 `surface/utils/`로 내려 벤치 전용으로 둔다. 권고는 (나) | (가)면 공개 표면 추가 | aileron 벤치마크의 import 경로 하나를 같이 고친다 |

## 3. PR 나누기와 순서

모두 `1.0.0-beta` base, squash 병합, 동작 불변. 구현은 217C-01대로 codex(fixy07 브리프), 검증은 Claude 쪽(전체 시험·typecheck·lint·verifier), 문서 대조는 fairy07.

| PR | 내용 | 게이트 |
| --- | --- | --- |
| 정돈-1 | F4 죽은 포맷터 삭제, F8 문서, `types/rolled` 둘 삭제 | 전체 시험 초록(시험 수는 삭제한 11개만큼 줆), 공개 `index.d.ts` 동일(F8이 (나)일 때) |
| 정돈-2 | F1 시험 import 재작성 + F6 fixture 이동·시험 이동 + F2 잉여 export 삭제 + DETAIL 면제 선언 정리 | 시험 수 동일, 전체 초록, `index.d.ts` 동일, filid validate(boundaries) 통과 |
| 정돈-3 | F3 뿌리 구현 organ 이동, `Form` 위계 | 전체 초록, `index.d.ts` 동일, 스토리북 251, filid validate(nodes) 통과 |
| 정돈-4 | 가이드 반영(§4), filid 이슈 등록(§5) | 원장 검사 전부 0 |

정돈-1과 정돈-2는 순서가 있고(삭제가 먼저여야 재작성 대상이 줄어듦), 정돈-3은 정돈-2 뒤다(옮긴 뒤 시험 경로가 또 바뀌지 않도록).

## 4. 가이드를 어디에 쓰는가 — 검토 결과

- FCA(INTENT.md)를 채택한 패키지는 열 개다(`schema-form` 53, `common-utils` 25, `schema-form-scenarios` 21, `promise-modal` 17, `json` 15, `agents-assets-sync` 13, `react-utils` 8, `json-schema` 5, `style-utils` 5, `data-loader` 1). 원칙은 패키지 하나의 것이 아니다.
- 저장소 `.claude/rules/filid_*`·`seiri_*`는 플러그인이 배포하는 문서라 여기서 고치지 않는다(고치면 다음 동기화에 사라진다). 루트 `CLAUDE.md`는 "repository instructions > conventions > rules"의 최상위라 원칙을 여기에 두면 모든 패키지에서 규칙 문서보다 앞선다.
- **권고:** 원칙 넷(§0의 1·2·3과 "안 쓰이는 뿌리 파일·export는 결함")은 루트 `CLAUDE.md`에 한 절로 쓴다. 패키지 `CLAUDE.md`에는 이 패키지에서의 적용만 쓴다: 시험은 `__tests__/`에서 내부 파일을 직접 가져옴, `bench/`와 `stories/`는 `src` 밖이라 진입점이 없고, 벤치가 쓰는 이름 때문에 index를 넓히지 않는다 — 벤치는 공개 이름을 쓰거나, 내부가 필요하면 파일 경로로 직접 읽되 그 소유 fractal의 DETAIL에 벤치 면제로 적는다(276라운드 답, 정돈-1 브리프 2.2와 같음), `src/__legacy__`는 09에서 지움. 문안은 소유자 승인 뒤 반영한다(원장 규칙).

## 5. filid 이슈 초안 (등록은 소유자 허가 뒤; 288라운드 "바로 등록하지 말 것")

제목(안): `filid: a fractal root's first image — root files and index exports need an outside consumer; tests are not consumers; config exemptions pass silently`. 등록 직전 초안은 fairy08 scratchpad `tidy-docs/03-filid-issue.md`(모델 표, 언어 중립 규칙 문장 다섯과 충돌 하나, B8 질문, 어댑터·설정 층 셋, 측정치; 정돈-2 병합 뒤 시험 위반 326과 export 53 수치를 갱신해 등록).

본문에 담을 것(영문으로 쓸 예정):

1. 규칙 공백 F5 — 뿌리(`index.ts`와 평평한 파일)가 독자의 1차 이미지라는 전제와, 그래서 뿌리 파일·index 이름은 fractal 밖 제품 소비자가 있어야 한다는 규칙.
2. 규칙 결함 F2 — "소비자"의 정의에 시험·벤치·스토리를 뺄 것. 지금은 §5의 검증 파일 예외가 §3의 "자기 진입점 경유 금지"를 덮는 것처럼 읽혀 시험이 index를 경유하고 index가 시험용 이름을 내보내게 된다(F1).
3. 도구 표시 F3(정정됨) — §4는 내장 규칙 `zero-peer-file`이 검사한다. 문제는 설정으로 면제된 규칙이 `validate` 결과에서 "건너뜀" 표시 없이 통과(passed)로 집계되어, 규칙이 꺼져 있다는 사실이 보이지 않는 것이다. 재현: `.filid/config.json`의 `zero-peer-file.exempt`에 `**/canard/schema-form/**`가 있는 상태에서 `src/fieldInputs`(뿌리 구현 11개) 발견 0·passed 29; 면제를 지우면 발견 11. 제안: 면제된 규칙은 `skipped`로 세고 발견 목록에 "exempted by config" 한 줄을 남길 것.
4. 도구 범위 F7 — `.filid/config.json`의 ignore가 `bench`·`stories`를 통째로 빼므로 DETAIL의 벤치 면제 선언은 검사되지 않는 선언이 된다. 선언을 검사할지, 벤치를 소비자 셈에서 아예 빼는 것을 규칙으로 적을지.
5. 이 저장소에서 측정한 수치(fractal 53, 자기 index 경유 시험 275파일, 잉여 export 104개, 뿌리 다중 구현 fractal 13개)와 재현 스크립트 설명.

## 6. 소유자 결정 (D)

| 번호 | 물음 | 권고 |
| --- | --- | --- |
| D1 | 이 계획대로 정돈-1부터 시작해도 되는가 | 시작 |
| D2 | `nodeFromJSONSchema`: 루트 공개(가) / 문서에서 지우고 벤치 전용(나) | (나) |
| D3 | providers의 organ 이름: `components/`+`hooks/` 둘로 가르기 / 하나의 organ | 둘로 가르기(filid 기본 organ 이름이고 역할이 다름) |
| D4 | `errors`의 오류 코드 상수 38개: index에서 지우고 문서의 문자열만 둠 / 루트에서 공개 | 지움(제품도 플러그인도 상수를 쓰지 않음) |
| D5 | 가이드 자리: 루트 `CLAUDE.md`에 원칙, 패키지 `CLAUDE.md`에 적용(§4) | 그대로 |
| D6 | filid 이슈 등록 시점: 정돈-2가 끝나 F1·F2·F3의 "구현 대 규칙" 판정이 코드로 확인된 뒤 | 정돈-2 뒤 |

## 7. 정정 기록 (원장 관리자의 오판과 바로잡은 사람)

| 날짜 | 무엇이 틀렸나 | 누가 찾았나 | 확인 | 영향 |
| --- | --- | --- | --- | --- |
| 2026-10-14 | F3 "도구 결함(validate가 §4를 검사하지 않음)" — 실제로는 내장 규칙 `zero-peer-file`이 검사하며, 저장소 `.filid/config.json`이 `**/canard/schema-form/**`를 면제(커밋 8306c70ca)해 둔 것 | fairy08 | 원장 관리자가 면제를 지운 임시 워크트리에서 `validate`(nodes)를 돌려 `fieldInputs` 발견 11 확인 | filid 이슈의 도구 항목은 "면제가 통과로 보임"으로 좁힘(§5). 정돈-3 게이트 "validate(nodes) 통과"는 면제를 지운 뒤에만 뜻이 있다 — 정돈-3에서 `.filid/config.json`의 schema-form 면제를 지운다 |
| 2026-10-14 | F4 "`types/rolled/fieldRenderer.ts`·`form.ts` 미사용" — 루트 `src/index.ts:84`의 `export type * from './types/rolled'`로 공개 이름이며 플러그인 넷과 aileron benchmark-form이 쓴다. 전수 검사 스크립트가 루트의 와일드카드 재수출을 따라가지 않았다 | fixy08 | 원장 관리자가 `src/index.ts:84`와 antd5 플러그인 import를 확인 | 정돈-1 범위 2.3 제외. rolled의 와일드카드는 정돈-2에서 이름 목록으로(public-contract §2). 표면 게이트를 "index.d.ts 텍스트 diff"에서 "컴파일러로 열거한 공개 이름·형 문자열 목록 비교"로 강화(정돈 PR 전부) |
| 2026-10-14 | 정돈-1 브리프 누락 — `packages/aileron/benchmark-form/src/utils/loadCoreBenchmark.ts`가 `src/core/index.ts`를 esbuild로 묶어 `nodeFromJSONSchema`를 꺼내므로 export 삭제 뒤 런타임에 깨지며 typecheck가 잡지 못함; documents 사이트 `index.mdx`(en 40·171행, ko 39·135행)의 언급 | fairy08·fixy08 | — | 정돈-1 범위에 추가(번들 진입점을 파일 경로로, mdx 수정, documents 빌드 게이트) |

전수 검사 스크립트(`/tmp/claude-501/s2/audit.cjs`)의 실제 결함(fairy08 재검사, 2026-10-14): 와일드카드 펼치기는 맞았고, 틀린 곳은 뿌리 파일 판정이다 — `import { X as BaseX }` 뒤 같은 이름 `X`를 로컬에서 새로 정의해 `export type { X }`로 내보내는 파일(`types/rolled/fieldRenderer.ts`·`form.ts`, `helpers/virtualization/type.ts`)을 import의 원래 이름으로 돌려 "export 없음"으로 보았다. index 이름 판정(19곳 144개)은 오판 0이었다. 재검사(와일드카드 끝까지 펼침, 부모가 재수출만 하는 이름은 자식에서도 삭제 대상, 소비자는 서브트리 밖 제품 코드)의 결과는 fairy08 scratchpad `export-recensus.md`이며 정돈-1 병합 커밋 ae502f7bd 기준으로 다시 돌린 목록이 정돈-2 §3.5의 기준이다: 지울 index 이름 109개(루트·오류 코드 제외), 오류 코드 상수 61개 중 밖의 제품 소비자 없음 37·engine이 씀 24(정돈-E), 밖의 소비자 없는 뿌리 파일 17개(nodeFromJSONSchema와 포맷터 16).
