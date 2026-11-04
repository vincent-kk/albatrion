# 정돈-3 브리프 — 구조 이동: fractal 승격, derive 자리, 뿌리 구현 organ 이동, Form 위계, 벤치 안으로, filid 면제 제거 (fixy08 → codex) — 정돈-2 병합 뒤 착수

> 2026-10-14, 원장 관리자. 근거: `fca-import-model.md`(B1·B4·B5·B7), `lineage-audit.md` §4, `request.md` §2 F3·F7(뒤집힘), 결정 D3(providers organ은 `components/`·`hooks/` 둘)·D2·D8, 298라운드(무정지 진행, 판단은 대기열). 217C-01 방식. 동작 불변, 공개 이름 집합 동일.

## 1. 자리

- 워크트리 `{scratch}/stage-tidy-3`, 브랜치 `feat/schema-form-tidy-3`, base `1.0.0-beta`(정돈-2 병합 뒤). 이동이 많으므로 **단계마다 커밋 하나**(문서 → 이동 → import 고침 → 검증)로 쪼개고, 각 커밋이 typecheck를 통과하게 한다. 이동은 `git mv`로 이력을 잇는다.
- codex는 `.claude/`·settings·`architecture/`를 건드리지 않는다. `.filid/config.json`의 수정(§2.6)은 codex가 아니라 fixy08이 직접 한다(설정 파일).

## 2. 할 일 (문서가 코드보다 먼저)

### 2.1 fractal 승격 둘 — `src/hooks`, `src/types`

- `src/hooks`: INTENT·DETAIL을 쓰고 index는 이미 있다. 루트 index가 재수출하는 훅만 index에 남기고, 훅들은 형제(core·providers·components/*)를 **각 fractal의 index로** 가져온다(옆으로 닫힘). 훅의 시험은 `hooks/__tests__`에 그대로.
- `src/types`: `types/rolled`가 이미 fractal이므로 `types` 자체를 fractal로 올리고(INTENT·DETAIL), core·components/Field에 기대는 형은 그 fractal의 index로 가져온다. 루트 `src/index.ts`의 `types` 재수출은 이름 목록(정돈-2에서 바꿈) 그대로.
- 승격 뒤 lineage 검사에서 두 디렉터리의 O 변이 0이 되어야 한다.

### 2.2 `settle/derive` → `engine/derive`

- derive를 `core/engine/derive`로 올려 settle의 형제로 만든다. settle의 organ(`utils/derivation`·`commit`·`context`·`write`)은 `engine/derive/index.ts`로 가져온다(옆으로 닫힘).
- derive가 쓰던 settle organ 넷(`utils/compute/sameValue`, `utils/paths/resolveDependencyPath`, `utils/controls/getCommittedDeclarationKey`, `utils/controls/getControlExpression`)은 settle도 쓰므로 최소 공통 fractal engine의 organ으로 올린다: `core/engine/utils/<topic>/`(topic은 지금 이름 그대로 `compute`·`paths`·`controls`). settle과 derive 둘 다 위로 열림으로 직접 가져온다. 옮긴 보조의 시험이 있으면 함께 옮긴다.
- derive index는 settle이 쓰는 이름만 남긴다(정돈-2의 재검사 기준). settle·derive·engine의 INTENT·DETAIL을 먼저 고친다. `LAYER_RANK`·`KIND_RANK` 같은 상수 중복은 정돈-E E5가 다루므로 여기서는 옮기기만 한다.

### 2.3 뿌리 구현을 organ 아래로 (filid §4, `zero-peer-file`)

| fractal | 지금 뿌리 | 이동 |
| --- | --- | --- |
| `src/fieldInputs` | 구현 11개 | `fieldInputs/components/FieldInput*.tsx`; index는 `fieldInputDefinitions` 하나 그대로 |
| providers 아홉(`ExternalFormContext` 등) | `XxxContext.ts`·`XxxContextProvider.tsx`·`useXxxContext.ts`(+ `FormErrorContext`의 `FormErrorPathContext.ts`·`reportErrorToHost.ts`·`useBoundaryReporter.ts`·`usePlaceholderBoundaryReporter.ts`, `RootNodeContext`의 `RootBindingContext.ts`·`useLiveNode.ts`) | 컨텍스트 객체·Provider 컴포넌트는 `components/`, 훅은 `hooks/`, 그 밖의 보조(`reportErrorToHost`)는 `utils/`(D3). index는 지금 이름 그대로 |
| `src/errors` | 클래스 넷·`formErrorCode.ts` | `errors/classes/`, `errors/codes/formErrorCode.ts`(정돈-E가 이 파일을 object enum으로 바꾸므로 자리만 잡아 둔다) |
| `src/core/surface` | `FieldNode.ts` | surface의 동명 구현이 아니므로 `surface/components/FieldNode.ts`가 아니라 `surface/node/FieldNode.ts`? — **아니다. 뿌리의 "동명 구현 하나" 허용을 쓴다**: `FieldNode.ts`는 surface fractal의 핵심 구현이므로 뿌리에 남기되, 그 밖의 뿌리 구현이 없는지 확인한다 |
| `src/components/Form` | `Form.tsx`·`util.ts` | `Form.tsx`는 동명 구현으로 뿌리에 남김. `util.ts`는 `utils/`로 |
| `src/components/Field/FieldInputSlot` 등 | `FieldInputSlot.tsx`·`FieldInputSlotWrapper.tsx` | 동명 구현 하나만 뿌리에, 나머지는 `components/`로 |
| `src/app/plugin` | `PluginManager.ts`·`registerPlugin.ts` | 동명 구현이 없으므로 둘 다 `plugin/utils/`(또는 `plugin/manager/`)로; index는 그대로 |
| `src/helpers/*` 작은 fractal들(`schemaIdentity`·`jsonPointer`·`warning`·`fieldInputDefinition`) | 뿌리 구현 2–4개 | 같은 규칙: 동명 하나만 뿌리, 나머지는 `utils/`·`constants/` |

각 fractal의 DETAIL을 먼저 고치고, 뿌리 `type.ts`는 filid 허용 범주(형 전용 동반 파일)인지 `zero-peer-file`의 허용 목록(`.filid/config.json` 또는 filid 기본)에서 확인해 본문에 적는다. 허용 범주 밖이면 `types/`로 내린다.

### 2.4 Form 위계

- `components/Form/components/`에는 공개 조각 다섯(`FormRender`·`FormField`·`FormLabel`·`FormInput`·`FormError`)만 남긴다. `FormContents.tsx`는 `FormRoot.tsx`로 이름을 바꾸고 `FormRootProxy.tsx`·`FormChildrenRenderer.tsx`와 함께 `components/Form/root/`로 옮긴다. `Form.tsx`는 `./root/FormRoot`를 가져온다. Form의 DETAIL에 위계(공개 조각 / 뿌리 조립)를 적는다.

### 2.5 벤치를 안으로 (B5)

- `bench/*.bench.ts`를 검사 대상과 가장 가까운 fractal의 `__benchmarks__/`로 옮긴다(예: `nodeFromJSONSchema.bench.ts`·`find-node.bench.ts` → `src/core/__benchmarks__/`, 배열·정착·검증 비교 벤치는 각 engine 자식). 레거시 비교 벤치 셋(`array`·`dispatch-and-validation`·`node-and-settle`, `__legacy__`를 가져옴)은 레거시와 함께 09에서 지울 것이므로 `bench/legacy-compare/`로 모아 두고 옮기지 않는다(ESLint의 레거시 금지 규칙은 `bench/`에 적용되지 않음을 확인).
- `vitest.bench.config.ts`의 include를 `src/**/__benchmarks__/**/*.bench.ts`와 `bench/legacy-compare/**`로 바꾼다. `.mjs` 측정 스크립트 둘(`branchless-phase-diagnosis`·`round-87-measure`)은 벤치가 아니라 진단 스크립트이므로 `bench/scripts/`로.
- 옮긴 벤치는 위로 열림으로 내부를 직접 가져오고, `core`·`surface`·`settle` DETAIL의 벤치 면제 선언 넷을 지운다. `.filid/config.json`의 ignore에 `__benchmarks__`가 이미 있으므로 filid는 벤치를 시험처럼 보지 않는다(그대로).

### 2.6 filid 면제 제거 (fixy08 직접)

- `.filid/config.json`의 `rules.zero-peer-file.exempt`에서 `**/canard/schema-form/**` 한 줄을 지운다. 그 뒤 `fractal_inspect validate`(scopes nodes·documents·entry-points)를 `packages/canard/schema-form/src`에 돌려 발견 0을 게이트로 한다. boundaries는 facts 부트스트랩이 필요하면 `facts status`가 시키는 추출을 한 번 돌리고 그 결과(발견 수와 indeterminate 사유)를 본문에 적는다. 다른 패키지의 면제는 건드리지 않는다.

## 3. failing-first 신호

- 정돈-2의 모델 검사 시험에 "B1: organ 파일은 직계 자식 fractal의 index·내부를 가져오지 않는다(검증 organ과 organ 안 중첩 fractal 제외)" 단언을 더해 먼저 빨갛게(hooks·types·settle utils 넷) 만든 뒤 초록으로.
- `zero-peer-file` 발견 수를 세는 시험은 filid 도구가 필요해 시험으로 두지 않고 게이트(§4)로만 둔다.

## 4. 게이트

정돈-2와 같다(typecheck·lint·build·test:production·unit·render·react18 전부 초록, 시험 수 동일, storybook 251, 플러그인 일곱, 공개 이름 열거 동일, 옛 이름 0, documents 빌드, 모델 검사 시험 초록). 추가: filid validate(nodes·documents·entry-points) 발견 0, vitest bench가 옮긴 벤치를 찾아 실행됨(각 1회 import 성공), G16 소비자 번들 크기(prod 289,358 B·dev 292,655 B에서 ±1 % 안; 이동만이므로 같아야 함).

## 5. 범위 밖·금지

- 오류 코드 object enum, 리터럴 상수화, 중복 합집합(E1–E5)은 정돈-E. 문서 사이트·CLAUDE.md는 정돈-4.
- `git stash` 금지, 세션 ID·co-author·소유자 법적 이름 금지. 루트 `src/index.ts`는 이름 목록 재배열 외 변경 없음.

## 6. 끝

PR 제목 `refactor(schema-form): tidy-3 — promote hooks·types, lift derive beside settle, move root implementations into organs, benches inside fractals, filid root rule re-enabled`. 본문에 §2 항목별 이동 표(전 → 후), 게이트 수치, 변용과 그 모델 조항. 원장 관리자에게 PR 번호·끝 커밋 보고.
