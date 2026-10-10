# G27 1단계 검증 보고서 — schema-form-switch(07 전환)

- 검증 엔진과 노력: Claude Opus (general-purpose subagent)
- 검증 대상: 워크트리 `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`의 커밋된 상태, HEAD `9a3a3b099`(바로 앞 코드 커밋 `e805074de`)
- 검증 일시: 2026-10-10
- 범위: 1단계는 core 엔진(`packages/canard/schema-form/src/core/**`), 게이트 원장, 실행 계획, 최초 기준선입니다. React 구성 요소 계층(`src/components`, `src/helpers`, `src/providers`, `src/formTypeDefinitions`)은 2단계에서 다시 봅니다.
- 방법: `git archive HEAD`로 깨끗한 트리를 스크래치(`g27/tree/`)에 풀어 읽었습니다. 시험·빌드·설치·git 쓰기는 하지 않았습니다. 정적 검사 스크립트 넷(이주 행 추출 `--check`와 `--check-complete`, 원장 인용 검사, 레거시 격리 검사)만 스크래치 트리에서 실행했습니다. seiri 런타임 단계 호출은 하지 않았습니다. 하위 에이전트 훅이 "현재 단계 안에서만 일한다"고 지시했고, `gates status` 도구는 메인 체크아웃 경로를 읽어 잘못된 값을 보인다고 `log.md` §0이 기록하고 있으므로 워크트리의 원장 파일을 직접 읽었습니다.

## 판정

**1단계 판정은 FAIL입니다.** 차단 지적이 세 건 있습니다. 하나는 저장소 규칙(형 단언 금지)의 위반이고, 하나는 완료로 표시된 게이트의 증거가 HEAD를 덮지 못하는 원장 문제이며, 하나는 core 계약 문서와 주석이 커밋된 코드와 어긋나는 문제입니다. 세 건 모두 고치는 범위가 작고, core의 동작 계약 자체(바인딩 통로, 진입점, `nodeFromJSONSchema` 서명, 레거시 격리, 의존 방향)는 계획과 일치합니다.

## 차단 지적

### B1. 승인 기록 없는 형 단언이 core에 새로 들어왔습니다

- 규칙: 작업 공간 `CLAUDE.md`의 Type Safety 절은 "Fix type errors at declaration sites, not call sites"와 "Never use `as never`, `as any`, or similar type casts to suppress errors without explicit user approval"을 요구합니다. 같은 규칙을 18라운드 닫기(`reviews/round-18-closing.md:981,1015`)가 인용했고, 05단계 G51 검증은 형 단언 한 건을 차단 지적(F5)으로 다루었습니다(`plan/05-dispatch-and-validation/log.md:65`).
- 근거: `origin/1.0.0-beta`의 core 비시험 파일과 HEAD의 core 비시험 파일에서 단언 줄을 모아 비교하면, 이 브랜치가 새로 넣은 단언이 17건입니다.
  - `src/core/nodeFromJSONSchema.ts:34` — `props as Parameters<typeof buildSchemaNodeTree<Schema>>[0]`(공개 core 호스트 진입, 커밋 `1def2cc4f`). 공개 서명의 `isTerminal?: (schema: JSONSchema) => …`와 `BlueprintOptions['isTerminal']`의 `(schema: BlueprintSchema) => …`가 맞지 않는 것을 호출 자리에서 덮고 있으며, 바로 위 32행의 주석이 그 사정을 설명합니다.
  - `src/core/blueprint/utils/effectiveSchema/utils/` 아래 `applyConstraintKeywords.ts`(`as object` 셋), `applySchemaContribution.ts`(`as object` 둘), `finalizeEffectiveSchema.ts`(`as object` 하나), `mergeSchemaContributions/utils/mergeSingleStaticContribution.ts`(`as object`, `as Record<string, unknown>`), `mergeHintGroup.ts`(`as Record<string, unknown>` 셋), `mergeHintGroup/utils/freezeCreatedHintObjects.ts`(둘), `applySchemaContribution/utils/applyControlHints.ts`(둘). 대표 도입 커밋은 `a958b37cb`입니다.
  - `src/core/blueprint/utils/analyze/populateNodeChildren.ts`(`child as SchemaInput['schema']`, 커밋 `fb99a2d09`), `populateNodeChildren/utils/appendChildEntries.ts:24`, `compileBlueprintExpressions/utils/registerBlueprintDependency.ts:33`(`path as string` 둘).
  - 시험 파일 `src/core/__tests__/schema-merge.mount.test.ts:59,60,70,71`에 `as never` 네 건이 있습니다(커밋 `0fdb6660b`, 브랜치에서만 있음).
- 왜 린트가 잡지 못했는가: `eslint.config.js:40-56`의 `consistent-type-assertions: never` 규칙은 `record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`만 덮고 `src/core/blueprint/**`와 core 뿌리 파일(`nodeFromJSONSchema.ts`)과 시험을 덮지 않습니다.
- 승인 여부: 계획, 실행 기록, 편집자 결정(`origin/1.0.0-beta`의 `reviews/`)에서 이 단언들에 대한 소유자 승인을 찾지 못했습니다.
- 고침 명세:
  1. `nodeFromJSONSchema.ts`: 단언을 지우고 선언 자리에서 형을 맞춥니다. ADR D3가 공개 서명을 고정했으므로 `blueprint/type.ts:230`의 `isTerminal` 매개변수 형을 공개 `JSONSchema`(또는 객체·배열 선언 형)로 받도록 바꾸거나, `buildSchemaNodeTree`의 `BuildSchemaNodeTreeProps`를 `nodeFromJSONSchema`의 props 형에서 파생시켜 두 형이 같은 선언을 쓰게 합니다.
  2. `OwnedSchemaValues.add(x as object)`: `unknown`을 받아 `typeof value === 'object' && value !== null`일 때만 넣는 이름 있는 함수 하나로 바꾸어 단언을 없앱니다.
  3. `as Record<string, unknown>`: 힌트·제어 칸의 형을 선언 자리에서 `Readonly<Record<string, unknown>>`로 밝히거나 좁히는 가드를 둡니다.
  4. 시험의 `as never`: 잘못된 값을 넣는 사례는 넓은 스키마 형으로 노드를 만들어 `setValue`가 `unknown`을 받게 하거나, 소유자 승인을 받습니다.
  5. 같은 일이 다시 생기지 않게 `eslint.config.js`의 단언 금지 범위에 `src/core/blueprint/**/*.ts`와 `src/core/nodeFromJSONSchema.ts`를 더합니다(기존 38건이 있으면 그 처리는 소유자 질의 목록 `reviews/owner-queue-07.md`로 보냅니다).
  6. 고치지 않고 남길 단언이 있으면 132라운드 소유자 답의 방식대로 `reviews/owner-queue-07.md`에 올려 PR 시점에 한 번에 승인을 받습니다.

### B2. 원장의 게이트 표시가 HEAD 상태와 맞지 않습니다

- G31(filid 스캔)과 G32(원장 대 구현 대조)는 `[x]`이지만 두 증거는 모두 `f9ae05d5e`(2026-10-07) 기준입니다(`.seiri/tasks/schema-form-switch/gates.md:192,195`). 그 뒤 `src`를 바꾼 커밋이 일곱 개 있고, core에서는 `831805d27`·`4e8490a72`·`1a0176da3`가 새 파일(`settle/utils/compute/selectChildren/utils/getDirectChildSelectionPlan.ts`, `settle/utils/derivation/deriveShadowEvaluation.ts`, 시험 도우미)과 새 가져오기를 더했습니다. `git diff --stat f9ae05d5e HEAD -- packages/canard/schema-form/src`는 44파일 1,466줄 추가입니다. 따라서 두 증거는 HEAD의 organ 외부 소비·순환·원장 대조를 보증하지 못합니다.
- G13b, G17b, G19b는 아직 `[ ]`이고 증거가 `pending`입니다(`gates.md:78-81,103-111`). 그런데 `log.md` §2의 2026-10-03 행(51·52행)은 세 게이트가 충족되었다고 적고 있고, 이번에 HEAD 트리에서 다시 돌린 정적 부분도 모두 통과했습니다(레거시 격리 스크립트 `LEGACY_ISOLATED: 1681 files checked`, G17b의 빈 칸·`TBD` 0과 49파일, G19b의 평면 스토리 0과 `77C-01` 제외 0). 원장이 열린 게이트를 실제보다 많이 보입니다.
- 고침 명세: G13b·G17b·G19b는 원장의 CHECK를 그대로 돌려(G13b는 레거시 lint 포함) 표시합니다. G31·G32는 2단계 React 변경이 커밋된 뒤의 최종 HEAD에서 다시 판정합니다. G31은 `fractal_inspect validate`를 다시 돌리고, G32는 최소한 `f9ae05d5e..HEAD`의 소스 커밋에 대한 차분 대조를 하여 증거에 기준 해시를 적습니다.

### B3. core 계약 문서와 주석이 커밋된 코드와 어긋납니다

- `src/core/DETAIL.md:16`은 "바인딩 전용 함수와 `Validator`·`ValidateFunction`은 패키지 공개 `src/index.ts`가 내보내지 않습니다"라고 적습니다. 그러나 `src/index.ts:79-80`은 `ValidatorFactory`와 `ValidateFunction`을 내보내고, 그 둘은 `src/types/error.ts:24-27`에서 core의 `Validator`와 `ValidateFunction`을 그대로 다시 내보낸 것입니다. 원장(35C-07, `ledger/error.md:692`)은 PR-7 전환에서 `ValidateFunction`의 문서 주석을 공개 선언으로 옮긴다고 정했으므로, 공개 수출은 원장대로이고 DETAIL 문장이 틀렸습니다.
- `src/core/validation/type.ts:30`의 "the public `ValidateFunction` in `src/types/error.ts` keeps its legacy shape until PR-7"은 이 PR이 공개 형을 core 형의 재수출로 바꾸었으므로 이제 거짓입니다. 같은 이름의 두 형을 가르는 이름 함정 줄(35C-07)도 두 형이 하나가 되었으므로 필요 없어졌습니다.
- `src/types/error.ts:33-37`은 `JSONSchemaError`를 "Legacy"로 부르고 "until the PR-7 public engine switch"라는 시한을 적습니다. 이 PR이 그 전환이므로 주석이 현재 사양이 아니라 일정을 말하고 있습니다(`seiri_code-comments` §1). 또 `log.md` §7의 표는 이 형을 레거시로 "옮김"이라고 적지만, 인터페이스는 `src/types/error.ts:35`에 남아 있고 `src/types/formTypeRenderer.ts:7,47`과 `src/core/types/event.ts:22`가 씁니다.
- 고침 명세: core `DETAIL.md:16`을 "바인딩 전용 함수는 내보내지 않고, `Validator`는 `ValidatorFactory`라는 공개 이름으로, `ValidateFunction`은 같은 이름으로 `src/types`를 거쳐 공개된다(35C-07)"는 현재 계약으로 고칩니다(문서가 코드보다 먼저라는 규칙에 따라 같은 커밋 또는 앞선 커밋). `validation/type.ts:30`의 시한 문장을 지우고 35C-07의 문서 주석 문장만 남깁니다. `src/types/error.ts:33,37`의 "Legacy"와 시한 문장을 현재 계약으로 바꾸고, `log.md` §7의 해당 행을 실제 처분(공개 index에서만 빠지고 렌더 형에 남음)으로 고칩니다. 이 고침은 `src/types`를 건드리므로 2단계 검증 범위와 겹칩니다.

## 비차단 지적

### N1. 실행 기록이 낡았습니다

- `log.md` §0 "재개 지점"(12행)은 2026-10-03 세션 종료 상태(33 가운데 24 충족, G22·G29·G31·G32 열림, 88라운드 작업)를 그대로 들고 있습니다. 현재 원장과 다르고, 135라운드까지의 진행이 반영되지 않았습니다.
- `plan/07-switch/gates-snapshot.md`는 마지막 갱신이 `b31125119`(2026-10-03)이며 G31·G32를 `pending`으로 들고 있습니다. 원장이 72시간 유휴 삭제로 사라지면 이 사본이 정본이 되므로 맞춰 두어야 합니다.
- `log.md` §8의 두 행(106·107행)은 수정 커밋 칸에 "미커밋"이라고 적었지만, 두 수정은 각각 `302f2f8fb`(판별 게이트의 엄격 비교)와 `fba01cbea`(배열 기본값 아이템 자손 채움)로 커밋되어 있습니다.
- 고침 명세: §0을 현재 상태(열린 게이트와 남은 일)로 다시 쓰고, `gates-snapshot.md`를 원장에서 다시 옮기고, §8 두 행에 커밋 해시를 적습니다.

### N2. 바인딩 통로 수가 계획 문장과 다릅니다

- 실행 계획 I2와 §3.1은 바인딩 전용 함수 다섯을 적고, `log.md` §3은 일곱 이름을 적습니다. HEAD에는 `observeSchemaNodeReports`와 `interpretSchemaNodeDraft`를 더한 아홉이 있습니다(커밋 `03f6238ba`, 문서 선행 `de544bdb6`가 1초 앞섬). `SchemaNode/DETAIL.md:85-95`의 표와 각 파일의 "Binding-only; not exported from src/index.ts" 문서 주석은 아홉 모두와 일치합니다.
- core `INTENT.md`는 "Adding public node members or binding-only operations"를 "Ask first"로 둡니다. 두 통로를 더한 일에 대한 원장 관리자나 소유자의 확인 기록을 이름으로 찾지 못했습니다.
- 고침 명세: `log.md` §3에 두 통로의 추가와 근거(ERROR-113, REACT-033, 69C-01)를 날짜와 함께 적고, 확인 기록이 없으면 원장 관리자에게 확인을 받아 그 라운드를 인용합니다.

### N3. 채택된 성능 변경의 판정 기록은 있으나, 측정한 코드와 커밋된 코드의 동일성은 저장소에서 다시 이끌어 낼 수 없습니다

- 변경 2(`4e8490a72`)의 판정은 `verification/07-switch/profile-126b-session.md`(첫 줄에 "2의 최종 판정은 ADOPT")에, 변경 1c(`1a0176da3`)의 판정은 `profile-129c-session.md`(판정 ADOPT, 회귀 0, 유의한 이득 34행)에 있습니다. 두 커밋 메시지가 각 세션 번호와 기울기를 인용하고, `settle/DETAIL.md`에 비용 문장과 수용 조건(`settle-gate-path-resolution`, `settle-child-selection-lookup`)이 함께 들어 있습니다. 판정 기록이 있다는 요구는 충족합니다.
- 다만 측정 번들은 스크래치의 `S/branch2.patch`·`S/branch1c.patch`로 만든 것이고(`branch1c-F3.md:11-12`), 이 패치들은 커밋되지 않았습니다. 판정 기록은 패치의 SHA-256을 들고 있지만 커밋 diff와 대조한 기록은 없습니다.
- `git diff 1a0176da3 HEAD -- packages/canard/schema-form/src/core`가 비어 있음을 확인했습니다. 135라운드의 "코어는 1c 이후 바뀌지 않았다"는 전제는 맞습니다.
- 고침 명세: 판정 기록 끝에 "커밋 `<해시>`의 소스로 다시 만든 번들의 SHA-256이 측정 번들과 같다" 또는 "패치와 `git diff <부모> <커밋>`의 소스 부분이 같다"는 한 줄을 적습니다. `performance.md`를 다시 쓸 때 채택 변경 목록(변경 2, 1c, 그 뒤 화면 고침)과 각 판정 기록 링크를 한 표로 둡니다.

### N4. core/types/event.ts가 새 코드에서 소비자가 없습니다

- `src/core/types/event.ts`를 가져오는 비레거시 파일이 없습니다. 레거시는 자기 사본 `src/__legacy__/core/types/event.ts`를 씁니다. 이 파일의 유일한 소비자였던 `core/types/node.ts`를 이 PR이 지웠으므로(`1def2cc4f`), 이 PR이 고아로 만든 파일입니다. 또 이 파일은 `@/schema-form/types`(렌더 계층 형 배럴)의 레거시 모양 `JSONSchemaError`를 가져와 core에서 렌더 계층 쪽으로 가는 형 간선을 만듭니다.
- 한편 실행 계획 U5와 core `DETAIL.md:15`는 LANDING-087에 따라 event·state·value를 남긴다고 적었으므로, 지우는 일은 원장 판단이 필요합니다.
- 고침 명세: 원장 관리자에게 "소비자가 없는 `core/types/event.ts`를 지우거나 레거시로 옮겨도 되는가"를 묻고, 남기면 core `DETAIL.md`에 남기는 까닭을 적고 DETAIL 15행의 "구체 파일로 소비" 문장을 실제(state·value·jsonSchema만 소비)에 맞춥니다.

### N5. 작은 규칙 이탈

- `settle/utils/gates/getGateRegistry.ts`에 새로 더한 메서드 `resolveRead`와 `pathSegments`의 문서 주석은 한 줄이고 매개변수와 결과를 적지 않습니다(`seiri_code-comments` §3). `settle/utils/derivation/runDeriveRounds.ts`의 문서 주석은 설명 두 줄을 `@returns` 뒤에 두어 결과 설명에 섞입니다.
- `settle/utils/compute/selectChildren/utils/getDirectChildSelectionPlan.ts`는 함수와 WeakMap 두 심볼을 내보냅니다(`seiri_function-boundaries` §3). 호출 자리에서 맵을 먼저 읽어 함수 호출을 줄이려는 성능 까닭이 문서 주석에 있으므로 받아들일 수 있으나, 같은 절의 "둘이 떼어 읽을 수 없을 때만"이라는 조건을 DETAIL에도 한 줄 적어 두기를 권합니다. 같은 변경의 `selectChildren.ts`에는 `entries!` 비null 단언이 두 번 있습니다(B1과 같은 규칙의 경계 사례).

### N6. 참고 사항(이 브랜치가 만든 것이 아님)

- `src/core/behaviors/utils/parse/__tests__/interpret.properties.test.ts:99-114`는 제품 소스 `interpret.ts`를 읽어 파싱해 할당 노드 수를 셉니다. 검증 기록들이 밝힌 "제품 시험은 제품 소스 텍스트를 읽지 않는다"는 관례와 어긋나지만 03단계(`0705217d5`)부터 있었고 이 브랜치는 건드리지 않았습니다. `src/core/__tests__/dependencyDirection.test.ts`도 소스의 import를 읽는 구조 시험이지만 계획이 G11로 요구한 것입니다.
- `src/index.ts:78`의 `export type * from './types/rolled'`와 `src/types/index.ts`의 와일드카드 재수출은 `9ad2528ec`부터 있던 것입니다(`seiri_public-contract` §2에 어긋나지만 이 브랜치의 변경이 아닙니다).
- 커밋된 검증 기록 453파일이 세션 UUID가 든 스크래치 경로를 적고 있습니다. 커밋 메시지가 아니므로 "커밋 메시지에 세션 ID를 넣지 않는다"는 규칙의 위반은 아니지만, 133라운드의 base 정리 때 함께 다룰지 판단하기를 권합니다.

## 통과한 확인

- 커밋 위생: `93ff8d7bc..HEAD`의 195커밋(병합 셋 포함)의 작성자와 커미터가 모두 `Vincent Kelvin`(GitHub noreply 주소)입니다. `Co-authored-by`, `Claude-Session`, `claude.ai/code`, `session_` 줄은 0건이고, 브랜치 diff의 추가 줄에도 이름이나 세션 줄이 없습니다. 메시지에 나오는 이름은 "Approved by Vincent" 한 번뿐입니다.
- 최초 기준선: `log.md` §1의 네 원문(`request.md`·`adr-and-axes.md`·`verification.md`·`round-68-closing.md`)의 SHA-256 앞 12자가 기록과 같고, HEAD와 `origin/1.0.0-beta`에서도 바이트가 같습니다. 기준선을 구현에 맞춰 다시 쓰지 않았습니다.
- 완료 게이트의 정적 부분 재도출(HEAD 트리): G2, G3, G4(130행), G5(49파일과 별칭), G6(`RU_DOCS_FIRST`), G7의 changeset, G8(`9bf211ff1`이 첫 렌더 코드 커밋보다 앞섬), G9·G14·G15·G16·G21·G22의 태그 존재, G11, G12, G13, G16의 문서 주석, G17, G18(e2e 27파일 모두 15건 이하, 스파이크 사례표 빈 칸 0), G19, G20(130행 완료, 인용 시험 실재), G24, G25(픽스처 6파일), G30(`problems 0`)이 모두 통과했습니다. 시험 실행 부분은 다시 돌리지 않았습니다. core 소스가 `1a0176da3` 이후 바뀌지 않았고, 그 뒤의 전체 실행 기록(`fd-prime-implementation.md:74`: unit·render·react18 466파일 3,425건 통과·실패 0, 코드는 `e805074de`와 같음; `branch1c-F3.md:107`)이 있으므로 core 쪽 시험 증거는 유효하다고 봅니다.
- core 계약: `core/index.ts`가 와일드카드 없이 이름으로만 내보내고 `src/index.ts`는 바인딩 통로를 내보내지 않습니다. 바인딩 organ `SchemaNode/utils/binding/`의 아홉 함수가 모두 "Binding-only; not exported from src/index.ts" 문서 주석을 들고 `dispatch` 진입에 위임합니다. `nodeFromJSONSchema`의 서명이 ADR D3·core `DETAIL.md:41-57`과 같습니다. `core/types/node.ts`·`constructor.ts`가 없습니다. core 비시험 코드에 React·`app/plugin`·`__legacy__` 가져오기가 없습니다. 입력 출처 표식(`dispatchSetValue`의 `'input'`), 폐기(`settle/utils/dispose/`, `DISPOSED_NODE_WRITE`), 마운트 검증 미룸(`deferValidation`), 런타임 원자 판정(`isAtomic`), 상호작용 초기화 번호 읽기가 계획 I3–I7대로 있습니다. 의존 방향 시험이 binding organ을 단언합니다.
- 레거시 격리: `check-legacy-isolation.mjs`가 HEAD 트리에서 `LEGACY_ISOLATED: 1681 files checked`를 냈고, 새 코드에서 `__legacy__`로 가는 import는 0입니다. ESLint 설정은 양방향 금지 블록을 들고 있습니다.
- G26 정적 CHECK: 커밋된 `performance.md`에 네 열쇠말이 모두 있고 `수용 대기`가 0이라 정적 CHECK는 통과할 것이지만, 보고서가 다시 쓰이는 중이므로 지시대로 미결로 판단합니다.

## 열린 게이트와 남은 일

| 게이트 | 원장 상태 | 남은 일 |
| --- | --- | --- |
| G13b, G17b, G19b | 열림(실제로는 충족) | CHECK를 다시 돌려 표시합니다(B2). |
| G23 브라우저 게이트 | 열림 | 소유자가 `packages/canard/schema-form`에서 `yarn vitest run --project storybook`을 실행합니다. `browser-gates.md`의 REACT-027·REACT-028·18C-73 행은 "소유자 실행 대기"이고, macOS Safari·Chrome 한국어 IME 사람 확인 세 줄은 "미확인"입니다. |
| G26 성능 보고 | 열림 | F-B 판정, F-C·F-F·F-E 묶음 판정, 최종 A/A, 최종 표와 분기 축 재측정(134C-01·135C-01)을 끝내고 느린 행과 번들 크기 증가(패키지 `CLAUDE.md`의 minify gzip 80,390 B 대 기준 37,023 B)의 소유자 수용을 받습니다. |
| G27 최종 검증 | 열림 | 이 1단계의 B1–B3을 고친 뒤 다시 확인하고, React 변경이 커밋된 뒤 2단계(렌더 계층 차분)를 합니다. |
| G31, G32 | 닫힘으로 표시(증거 낡음) | 최종 HEAD에서 다시 판정합니다(B2). |
| G33 PR | 열림 | 133라운드의 base 정리(보관 태그, 원장 문서 커밋 합치기, 리베이스, 검사), PR 생성, `PLAN.md` §3의 07 행을 `리뷰`와 PR 링크로 바꾸기, `gh pr view` 단독 호출로 base를 `log.md`에 적기가 남았습니다. 지금 07 행은 `진행`이라 CHECK가 실패합니다. |

## 재현에 쓴 명령(읽기 전용)

- 깨끗한 트리: `git archive HEAD packages CLAUDE.md .claude/rules .changeset .github | tar -x -C g27/tree`, 비교용 `git archive origin/1.0.0-beta packages/canard/schema-form/src/core | tar -x -C g27/beta`
- 정적 검사: `node verification/07-switch/tools/extract-migration-rows.mjs --check|--check-complete verification/07-switch/migration-check.md`, `node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md`, `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs`(모두 스크래치 트리에서)
- 이력: `git log --format='%an|%cn' 93ff8d7bc..HEAD`, `git diff 1a0176da3 HEAD -- packages/canard/schema-form/src/core`, `git diff --stat f9ae05d5e HEAD -- packages/canard/schema-form/src`
