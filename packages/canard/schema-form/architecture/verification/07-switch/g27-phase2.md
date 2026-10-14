# G27 2단계 검증 보고서 — schema-form-switch(07 전환)

- 검증 엔진과 노력: codex, high
- 검증 대상: 워크트리 `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`의 HEAD `6040aa3d9d0c02eae4b679ed9d6ba93bd593ca52`입니다. 검증 시작 시 작업 트리는 깨끗했습니다.
- 검증 일시: 2026-10-11, Asia/Seoul입니다.
- 범위: 1단계 B1·B2·B3의 수정 확인, `origin/1.0.0-beta...HEAD`의 비core 소스 차분, 특히 `daca1d14a`의 F-B·F-C·F-F와 관련 시험·문서, 최초 기준선·원장·실행 계획·최종 게이트의 일치 여부입니다. `components`·`helpers`·`providers`·`formTypeDefinitions` 외에 `hooks`·`types`·`app/plugin`·공개 진입점도 대조했습니다. 이동된 레거시 소스는 양방향 격리 검사로 확인했습니다.
- 방법: `g27-phase1.md`와 `g27-fixes.md`를 먼저 읽고 실행 계획과 게이트 원장을 읽었습니다. 비교 ref는 로컬 `origin/1.0.0-beta` `3d151091a790358f91b0feb788e87a067e4a0f2c`이며, merge-base는 `69290372ceb7367e079f6c3349d02067297541a3`입니다. 네트워크 조회·설치·yarn·git 쓰기를 하지 않았습니다. 제품 소스·커밋된 시험·계획·원장을 수정하지 않았으며 저장소 쓰기는 이 보고서뿐입니다. `git archive` 복사본, 추가 검증 탐침, 비교용 설정과 실행 산출물은 지정된 `scratchpad/g27p2/` 아래에 두었습니다. `seiri:verify`를 독립 검증으로 적용했으며 런타임 단계·게이트 기록 호출은 하지 않았습니다.
- 검증 환경: 오프라인 실행기의 Node는 `v24.20.0`, npm은 `12.0.2`, Vitest는 `3.2.6`, TypeScript는 `5.9.2`입니다. 이전 성능 측정의 Node `v26.11.1` 환경을 재현한 검증은 아닙니다. 아래의 전후 동작 시험은 같은 환경에서 실행했습니다.

## 판정

**2단계 판정은 FAIL입니다. 차단 지적은 5건이고 비차단 지적은 2건입니다.** 1단계 B1은 부분 수정되었지만 승인이 없는 단언이 남았으며, B2의 최종 근거 갱신도 끝나지 않았습니다. B3의 core 문서·주석 수정은 확인했습니다. 새로 확인한 차단 사항은 F-F의 로드별 경고 누락, 렌더 계약 문서의 불일치, 새 로드 상태 필드의 문서 주석 누락입니다.

G26의 `수용 대기`와 G33의 PR 대기는 이 판정의 실패 사유에 포함하지 않았습니다. G26은 138C-01과 이번 검증 지시에 따라 의도적으로 열려 있습니다. G23도 소유자 실행이 남은 열린 게이트로 기록했습니다.

## 차단 지적

### B1. 미승인 형 단언이 남았으며 렌더 계층에도 새 `as never`가 있습니다

- 규칙은 명시적인 사용자 승인 없이 `as never`·`as any` 또는 같은 방식으로 형 오류를 숨기지 않도록 요구합니다. 이번 검증 요청도 이 조건을 명시합니다.
- 1단계 수정은 실제로 들어왔습니다. `fe7ece01e`는 누적 스키마 필드를 선언 자리에서 정비했고, `eslint.config.js:59–68`은 blueprint와 `nodeFromJSONSchema`의 비시험 단언 금지 범위를 추가했습니다. `src/core/__tests__/schema-merge.mount.test.ts`의 `as never` 네 개는 모두 없어졌습니다. 해당 시험의 재실행도 통과했습니다.
- 그러나 확장된 core 범위의 비시험 단언은 AST로 다시 세어도 14개입니다. 1단계가 지적한 브랜치 추가 표현 가운데 `src/core/nodeFromJSONSchema.ts:34`, `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts:18`, `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts:50`, `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:74`의 네 표현이 남아 있습니다. 앞 세 파일에는 국소 ESLint 예외도 있습니다. lint의 통과가 이 단언에 대한 승인을 뜻하지는 않습니다.
- `g27-fixes.md:7,39–58`은 이 목록이 승인 기록이 아니며 소유자 판단이 열려 있다고 명시합니다. 비교 ref의 `reviews/owner-queue-07.md:10`도 같은 14개를 승인 질의 4항으로 둡니다. 132라운드의 마지막 일괄 질의 방침은 질의를 미루는 근거이며, 특정 단언을 승인한 답은 아닙니다. 1단계 고침 명세 중 질의 목록에 올리는 절차는 이행되었지만 승인 조건은 아직 충족되지 않았습니다.
- 렌더 차분에는 `src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:55`의 `'integer' as never`와 `:84`의 `subject as never`도 있습니다. `git diff origin/1.0.0-beta...HEAD -- <파일>`에서 첫 표현은 새로 추가되었고, 둘째 표현은 기존 `as any`를 `as never`로 바꾼 것입니다. 이 두 표현은 core의 14개 승인 대기 목록에 포함되지 않습니다. 또한 `src/components/SchemaNode/SchemaNodeInput/hooks/useTerminalChildren.ts:9`는 동결된 읽기 전용 배열을 `as unknown as ChildNodeComponent[]`로 mutable 계약에 맞춥니다.
- 근거 명령은 비core 차분과 TypeScript AST의 `AsExpression`·`TypeAssertionExpression` 대조이며, 비교 시 `as const`는 오류 은폐 단언과 구분했습니다. 일반적인 React 제네릭 보존 단언이나 이름 변경으로 텍스트가 달라진 표현까지 모두 결함으로 세지는 않았습니다.
- 고침 명세: 남은 core 단언은 1단계 명세대로 선언 정비·실제 좁히기 또는 해당 표현을 특정한 소유자 승인으로 해결해야 합니다. 렌더의 두 `as never`는 선언 자리에서 매칭 값의 공통 계약을 정비하고 `integer` 검사는 넓은 입력을 실제로 검사하도록 고쳐야 합니다. 동결 빈 목록은 읽기 전용 소비 계약으로 표현하거나 그 형 차이를 특정한 승인을 받아야 합니다. 질의 목록과 ESLint 예외만으로 B1을 닫지 않아야 합니다.

### B2. G31·G32의 닫힌 근거가 현재 HEAD를 덮지 않으며 원장 표시의 정비도 남았습니다

- `.seiri/tasks/schema-form-switch/gates.md:191–195`의 G31·G32는 `[x]`이지만 두 EVIDENCE는 여전히 `f9ae05d5e`입니다. `g32-recheck.md:3,16,48`도 같은 커밋의 범위와 당시 G31 결과를 설명합니다.
- `git log --oneline f9ae05d5e..HEAD -- packages/canard/schema-form/src`에는 9개 커밋이 있습니다. 문서만 바꾼 두 커밋을 제외해도 그림자 평가 분리, 경로·자식 선택 최적화, 렌더러 경계와 배열 버튼 변경, B1 형 정비, F-B·F-C·F-F를 포함한 7개 소스 변경 커밋이 남습니다. 1단계 이후에도 `fe7ece01e`와 `daca1d14a`가 들어왔습니다. 기존 근거의 범위를 그대로 재사용할 수 없습니다.
- 읽기 전용 `fractal_inspect validate`를 패키지 경로에 `scopes: ["boundaries", "dag"]`로 다시 호출했습니다. snapshot은 `d692791e4d64c14b29de9ac59f1ebee168649102f2eca5771118b7b64bbe1d7e`이고 결과는 **indeterminate**입니다. `external-import-boundary`와 `circular-dependency` 각각에 미확정 경고가 있으며, 진입점의 `needs-resolution`과 verification facts 부재가 진단에 나타납니다. 이것을 실제 경계 위반이나 실제 순환의 발견으로 해석하지 않았으며, 반대로 두 축이 0이라고 통과 처리하지도 않았습니다. 저장소 facts를 쓰는 bootstrap은 이번 읽기 전용 범위에서 수행하지 않았습니다.
- G13b·G17b·G19b는 `gates.md:78–81,103–111`에서 여전히 `[ ]`와 `pending`입니다. 세 CHECK를 그대로 재실행하되 npx에는 설치 방지 옵션을 넣었으며, 각각 `LEGACY_BOTH_WAYS_ZERO`·`STORY_DISPOSITION_COMPLETE`·`OLD_STORIES_GONE`을 확인했습니다. 따라서 1단계 B2의 원장 표시 수정도 아직 이행되지 않았습니다.
- G29의 예전 묶음 근거도 범위를 구분해야 합니다. `log.md:472–481`의 플러그인 빌드는 `d04dbbdc3` 기준이며, 그 뒤 패키지 src와 시험이 바뀌었습니다. 최신 `daca1d14a`의 커밋 기록과 비교 ref의 `round-136-closing.md:18`에는 패키지 unit 2,414건·render 511건·react18 511건의 통과가 있습니다. `git diff daca1d14a HEAD -- packages/canard/schema-form/src`가 비어 있으므로 이 최신 패키지 시험 기록은 현재 코드에 대한 기록으로 재사용할 수 있습니다. SCN은 `d04dbbdc3..HEAD`에서 변경되지 않았습니다. 다만 이를 HEAD의 플러그인 빌드까지 재확인한 `ALL_TESTS_GREEN` 묶음으로 확대하지 않았습니다.
- 고침 명세: 최신 소스 기준으로 facts를 해결한 G31 검사와 G32의 차분 대조를 수행하고 기준 해시·범위·결과를 원장 근거에 적어야 합니다. G32는 최소한 `f9ae05d5e..HEAD`의 소스 변경과 아래 B4를 포함해야 합니다. 통과한 G13b·G17b·G19b는 실제 CHECK 결과에 맞게 기록해야 합니다. G29에는 재사용한 패키지·SCN 증거의 기준과 현 공개 타입에 대한 플러그인 빌드 근거를 구분하여 적어야 합니다. 이 보고서는 그 기록을 대신 쓰지 않습니다.

### B4. F-F가 같은 루트를 유지하는 reset 이후의 첫 자식 읽기 경고를 누락합니다

- 계약은 비교 ref의 `ledger/error.md:3074–3084`, 특히 ERROR-202의 `:3082`입니다. 터미널 입력의 빈 `ChildNodeComponents` 첫 읽기를 필드 커밋 뒤에 전달하며, 중복 억제 단위는 **로드마다 `(code, path)` 한 번**입니다. 현재 `src/components/SchemaNode/SchemaNodeInput/DETAIL.md:20`도 같은 계약을 적습니다.
- `src/providers/RootNodeContext/utils/resetRootLoad.ts:32`는 reset마다 `beginLoad()`를 호출하며, `src/providers/FormErrorContext/utils/createFormErrorService.ts:15`는 경고 집합을 비웁니다. 작성 스키마가 같으면 `resetRootLoad.ts:35–49`는 기존 root를 유지합니다.
- F-F의 `useTerminalChildren.ts:25,38–42,47–57`은 접근 상태를 node 또는 reporter가 바뀔 때만 초기화하고, 두 참조와 children이 같으면 layout effect도 재실행하지 않습니다. 첫 로드에서 ACCESSED가 이미 켜졌다면 동일 root의 다음 로드에서 원본 입력이 다시 마운트되어 빈 목록을 읽어도 getter가 다시 보고를 예약하지 않습니다. 보고기의 로드별 경고 집합만 비워지고 읽기 탐침은 이전 로드의 상태를 유지합니다.
- 스크래치 탐침 `S/tree/packages/canard/schema-form/src/__tests__/g27p2.read-after-reset.probe.test.tsx:11–25`는 첫 경고 1건을 확인하고, 공개 `FormHandle.reset()` 뒤 root identity가 같은지 확인한 다음 누적 경고 2건을 요구합니다. **HEAD에서는 React 19와 18 모두 `expected 1 to be 2`로 실패했습니다.**
- 같은 탐침을 제품 소스 수정 없이 `git archive daca1d14a^`의 소스에 연결했습니다. 이전 커밋은 `9080cbdcf2dd0b4892e8fc685edbef27c65b7883`입니다. `g27p2.before.config.ts`는 제품 alias만 이전 소스 트리로 돌립니다. **두 React 판 모두 동일 탐침이 통과했습니다.** 전후 비교는 같은 설치된 의존성·시험·실행 옵션을 사용했습니다. 이전 소스 트리의 tsconfig를 빠뜨려 발생했던 첫 설정 오류는 증거에서 제외하고, 설정을 포함해 다시 실행한 `S/before-results.json`의 결과만 사용했습니다.
- 기존 새 시험 `terminalChildren.test.tsx`는 늦은 이벤트·layout·렌더 읽기를 다루지만 같은 root에서 새 로드가 시작되는 경우는 다루지 않습니다. 늦은 이벤트·렌더 읽기 시험은 변경 전 두 React 판에서 실패하고 HEAD에서 통과했으므로 그 개선 자체는 확인했습니다. 추가된 reset 탐침은 이 개선과 별개의 회귀를 잡습니다.
- 고침 명세: 로드 세대가 바뀌면 첫 읽기 보고를 다시 허용하도록 탐침의 상태를 로드 수명과 연결해야 합니다. 같은 의존성의 일반 쓰기에서 layout effect를 재실행하지 않는 F-F 조건은 유지해야 합니다. 같은 root의 reset 뒤 렌더·이벤트에서 첫 읽기를 다시 1회 전달하고, 같은 로드 안의 반복 읽기는 중복 전달하지 않는 시험을 소유 모듈의 시험 디렉터리에 추가해야 합니다. 현재 재현에서 실패하고 고침 뒤 통과하는 것을 두 React 판에서 확인해야 합니다.

### B5. 일부 렌더 계약 문서가 현재 경계 호출 방식과 공개 값 이름을 설명하지 않습니다

- `src/components/Form/DETAIL.md:31`은 필드 경계가 셋째 인자 `useReporter`로 보고기를 읽는다고 적습니다. 현재 렌더러 경계는 `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:44,90`에서 `useBoundaryReporter`와 직접 `ErrorBoundary`를 사용합니다. 입력도 `src/helpers/formTypeInputDefinition/utils/withFormTypeInputErrorBoundary.tsx:23–25`에서 직접 보고기를 읽고 직접 `ErrorBoundary`를 렌더합니다. 셋째 인자를 사용하는 경로는 `VirtualizationManager.ts:212–215`의 Placeholder입니다. 문서가 이 세 소유 지점을 구분하지 않습니다.
- `src/components/SchemaNode/SchemaNodeInput/DETAIL.md:10`도 실제 사설 어댑터 대신 `withErrorBoundary`의 인스턴스라고 적습니다. 바로 다음 계약은 올바른 사설 어댑터와 적용 세대를 설명하므로 같은 문서 안에서도 명칭이 맞지 않습니다.
- `src/INTENT.md:11`은 폼 밖의 값을 `normalizedValue`, 편집 중 값을 raw `value`라고 적습니다. 현재 `src/DETAIL.md:49–52`와 `src/core/DETAIL.md:12–13`은 `outputValue`와 편집 중 계산 `value`를 구분합니다. `src/core/SchemaNode/SchemaNode.ts:168`의 공개 getter도 `outputValue`이며 `normalizedValue`가 없습니다. `git diff origin/1.0.0-beta...HEAD -- src/INTENT.md`가 비어 있으므로 새 공개 경계의 문서 정비에서 이 문서가 빠졌습니다.
- 규칙은 `filid_module-documents.md:13,29`의 현재 경계·현재 계약 유지입니다. 이 문제는 동작 회귀를 주장하는 것이 아니라 현재 계약 문서가 코드와 다른 문제입니다. 1단계 B3의 core 문서 수정은 별도로 해결되었으며 이 지적은 렌더 및 상위 경계 문서에 대한 것입니다.
- 고침 명세: Form과 입력 DETAIL은 렌더러·입력·Placeholder 각각의 실제 해석 지점과 보고기 전달 방식을 설명해야 합니다. `src/INTENT.md`의 값 이름과 채널을 현재 공개 `outputValue`·계산 `value`·내부 raw 계약에 맞춰야 합니다. 입력 경계 1회·Refresh 동안 경계 유지·원본 입력만 세대 key로 교체하는 동작은 유지해야 합니다.

### B6. 새 로드 상태 필드에 선언 문서 주석이 없습니다

- `.claude/rules/seiri_code-comments.md:13–19`는 함수의 인자·결과·목적과 문서 형식이 적용되는 타입·필드·멤버의 사용 계약을 문서 주석으로 밝히도록 요구합니다. 함수 본문의 지역 변수와 다른 기준입니다.
- 새 파일 `src/providers/RootNodeContext/type.ts:24–34`에서 `RootLoad`의 `root`·`props`·`records`·`error`·`ready`·`prepared`·`reporter` 필드는 문서 주석이 없으며, `reported`에만 있습니다. `RootBinding`의 `root`·`reset`도 `:39–40`에서 필드 주석이 없습니다. 특히 `ready`와 `prepared`는 서로 다른 커밋·첫 준비 수명을 나타내므로 인터페이스 머리의 한 문장으로 사용 조건이 설명되지 않습니다. 해당 파일은 브랜치에서 새로 추가되었습니다.
- 새 함수 `createRootLoad.ts:11–16`의 한 문장도 `mount = false`의 유효한 사용 조건, reporter와 버퍼 전달의 관계, 반환 load에 오류가 보관되는 조건을 설명하지 않습니다. 현재의 인자·반환·실패 계약을 적어야 한다는 같은 규칙에 해당합니다.
- 고침 명세: 각 새 상태 필드와 RootBinding 멤버에 현재 수명·사용 계약의 JSDoc을 추가해야 합니다. `createRootLoad`에는 인자·반환·버퍼링·실패 보관 조건을 설명하는 문서 주석을 추가해야 합니다. 일정·이전 구현·수정 이력은 코드 주석에 쓰지 않아야 합니다. 이 문서 주석 정비에는 동작 변경이 필요하지 않습니다.

## 비차단 지적

### N1. 실행 기록과 게이트 사본이 여전히 이전 진행 상태를 안내합니다

- `log.md:12–18`의 재개 지점은 2026-10-03의 24/33 충족 상태와 이전 성능 구현 절차를 안내합니다. 현재 원장과 138C-01의 G26 열린 채 PR 진행 결정을 반영하지 않습니다.
- `gates-snapshot.md:193–198`은 G31·G32를 열림과 pending으로 두지만 실제 원장은 닫힘으로 둡니다. `log.md:106–107`의 수정 커밋 칸도 여전히 미커밋이라고 적습니다. 이는 1단계 N1에서 이미 지적한 사항입니다.
- 고침 명세: 재개 안내는 현재 소스 HEAD, 실제 열린 게이트와 다음 행동을 안내하도록 갱신해야 합니다. 게이트 사본은 B2 정비 뒤 원장과 맞춰야 합니다. 이미 커밋한 고침에는 실제 커밋을 적어야 합니다. 기록을 고쳐서 과거의 붉은 시험이나 승인 대기를 지우지는 않아야 합니다.

### N2. 새 계수 시험의 실행 산출물 위치가 특정 세션의 공용 경로에 고정되어 있습니다

- `Form.renderCounts.test.ts:7–9`, `layoutCounts.test.ts:7–9`, `renderCounts.test.ts:18–20`은 같은 `runtimeCounts.mjs`를 별도 Node 프로세스로 실행합니다. 이 helper는 `:8–24`에서 진단 실행기를 읽어 런타임 계수 항목을 추가합니다.
- 이어지는 `architecture/verification/07-switch/tools/measure-react-render-counts.mjs:14,21–23`은 특정 세션의 `scratchpad/bundles`에 고정된 `fa-change.cjs`를 만들고 읽습니다. 새 시험 여러 개가 기본 파일 병렬 실행에서 같은 산출물 이름을 사용하게 됩니다. 이번 지정 스크래치 `g27p2/` 밖으로도 쓰므로 이 계수 시험 셋을 그대로 실행하지 않았습니다. 경합으로 실제 실패한 증거는 확보하지 않았으므로 동작 결함으로 분류하지 않았습니다.
- 제품 소스의 문자열을 읽어 기대 표현을 단언하는 새 시험은 찾지 못했습니다. 이 helper가 읽는 문자열은 진단 스크립트이며, 단언은 React 런타임 계수입니다. 제품의 TypeScript 소스를 번들러가 읽는 정상적인 컴파일 과정과 소스 텍스트를 계약으로 단언하는 시험을 구분했습니다.
- 고침 명세: 진단 실행기는 출력 디렉터리를 인자로 받아 시험별 임시 경로를 사용해야 합니다. 공용 파일을 덮어쓰지 않고 스크래치 위치를 호출자가 지정할 수 있게 해야 합니다. 계수 단언은 제품 소스 문자열 대신 실제 실행 결과를 계속 사용해야 합니다.

## 1단계 B1·B2·B3의 재확인

| 항목 | HEAD의 확인 결과 | 근거와 남은 일 |
| --- | --- | --- |
| B1 | 부분 수정되었으며 차단 상태가 남았습니다. | core 단언 범위 확대와 시험의 네 `as never` 제거는 확인했습니다. core 14개 승인 대기와 렌더의 미승인 표현은 위 B1에서 다룹니다. |
| B2 | 해결되지 않았습니다. | G13b·G17b·G19b CHECK는 재통과했지만 원장 표시가 그대로입니다. G31·G32는 이전 해시의 닫힌 근거를 유지하고 있습니다. |
| B3 | 명세대로 해결되었습니다. | `src/core/DETAIL.md:16`은 ValidatorFactory·ValidateFunction 공개 경로를 적습니다. `src/core/validation/type.ts:29–35`의 시한 문장이 없어졌고 `src/types/error.ts:32–37`은 현재 렌더 오류 계약을 설명합니다. `log.md:96`도 공개 index에서 빠지고 렌더 형에 남는 실제 처분을 적습니다. 이 변경은 `fe7ece01e`에서 문서와 코드에 함께 들어왔습니다. 소비자가 없는 `src/core/types/event.ts` 삭제도 확인했습니다. |

## 확인한 계약과 증거

- 최초 기준선 네 파일을 `log.md:23–28`의 원래 커밋과 바이트 단위로 대조했습니다. `request.md`의 SHA-256 앞 12자는 `2d18c8e8f6ec`, `adr-and-axes.md`는 `3a0de74015f6`, `verification.md`는 `03921fe0fb80`, `round-68-closing.md`는 `eb4076c56b01`이며 모두 원래 바이트와 같습니다. 기준선을 구현에 맞춰 바꾼 흔적은 없습니다.
- F-C는 기존 네이티브 submit의 `preventDefault`·`handleSubmit(true)`·오류 싱크 경로를 그대로 두고 `useCallback`으로 옮겼습니다(`FormContents.tsx:45–60,130`). Form의 최신 submit 콜백은 기존 `useHandle` 경로를 사용합니다.
- F-B는 해석 지점의 사설 어댑터 안에 ErrorBoundary 하나를 두며, 적용 세대는 원본 입력 key에만 전달하고 사용자 props에서는 제거합니다(`withFormTypeInputErrorBoundary.tsx:23–25`). 인라인·정의·맵·preferred 입력의 공급 경로도 이 어댑터를 사용합니다. 렌더러는 `SchemaNodeProxy.tsx:90`의 직접 경계, Placeholder는 `VirtualizationManager.ts:212–215`의 생성자 래핑으로 소유 지점을 유지합니다. 패키지 CLAUDE.md의 Error Isolation 절과 이 구조는 일치합니다.
- 입력·렌더러 경계의 기존 `refreshBoundary.test.tsx`·`refreshGeneration.test.tsx`·`rendererBoundary.test.tsx`를 render와 react18에서 재실행하여 **110건 통과, 실패 0건**을 확인했습니다. 새로운 `terminalChildren.test.tsx`·`inputBoundaryLayer.test.tsx`와 B1 관련 `schema-merge.mount.test.ts`의 실행은 **10건 통과**했습니다.
- 새 입력 경계 시험은 이전 코드에서 각 React 판이 `expected 'Input' to be 'ErrorBoundary'`로 실패하며 현재 코드에서는 통과합니다. 늦은 이벤트·렌더 읽기 두 시험도 이전 코드에서 실제 경고 부재로 실패하며 현재 코드에서는 통과합니다. 초기 child layout 읽기 시험은 전후 모두 통과하므로 변경을 증명하는 시험 대신 기존 동작의 확인으로 해석했습니다.
- `daca1d14a`에는 Form·SchemaNodeInput·formTypeInputDefinition의 DETAIL 및 필요한 INTENT 변경과 구현이 함께 있습니다. 요청하신 “코드와 함께 또는 그 전에”라는 이력 조건은 충족합니다. G6·G8의 초기 문서 선행 CHECK도 다시 통과했습니다. 다만 함께 바꾼 문서의 다른 현재 계약 문장이 맞는지는 별개이며 B5에서 다룹니다.
- 비core 신규 함수 파일의 exported 함수 수를 AST로 확인했으며 두 번째 함수를 새로 export한 파일은 찾지 못했습니다. 기존 barrel의 명명된 재수출과 타입·정의 객체는 함수 구현 파일의 함수 수와 구분했습니다. 추가 제품 주석에서 이전 구현의 이력이나 PR 이후 일정 문장을 새로 넣은 사례는 찾지 못했습니다. 새 필드 선언 주석의 누락은 B6에서 별도로 기록했습니다.
- render·react18 전체의 추가 독립 실행은 60초 실행기 제한으로 끝나지 않았고 JSON 결과도 생성되지 않았습니다. 이 시도를 제품 실패나 전체 통과 증거로 쓰지 않았습니다. 전체 unit·render·react18 통과 수는 위에서 범위를 확인한 `daca1d14a`의 기록을 인용한 것이며, 이번 직접 재실행의 총합이 아닙니다. SCN 전체·플러그인 빌드·브라우저·성능 측정은 이번에 재실행하지 않았습니다.

## 게이트 재실행 결과

아래 CHECK는 원장의 식을 유지하고 npx에만 `--offline --no-install`을 더했습니다. git 이력 CHECK와 다른 패키지를 읽는 정적 CHECK는 원래 워크트리에서 실행했고, lint·typecheck는 깨끗한 HEAD 스크래치에서 실행했습니다. G20의 스크래치 첫 실행은 복사하지 않은 AJV 플러그인 시험 경로 때문에 실패했으므로 폐기하고, 완전한 원래 워크트리의 읽기 전용 CHECK를 다시 실행해 통과를 확인했습니다. 모든 통과 행은 종료 0과 EXPECT 표지를 함께 확인했습니다.

| 게이트 | 원장 상태 | 이번 확인 결과와 EXPECT |
| --- | --- | --- |
| G2 | 닫혀 있습니다. | `BOARD_IN_PROGRESS`를 확인했습니다. |
| G3 | 닫혀 있습니다. | `BASELINE_CAPTURED`를 확인했습니다. |
| G4 | 닫혀 있습니다. | 이주 130행과 `MIGRATION_ROWS_MATCH`를 확인했습니다. |
| G5 | 닫혀 있습니다. | `STORIES_AND_ALIAS_OK`를 확인했습니다. |
| G6 | 닫혀 있습니다. | `RU_DOCS_FIRST`를 확인했습니다. |
| G8 | 닫혀 있습니다. | `RENDER_DOCS_FIRST`를 확인했습니다. |
| G12 | 닫혀 있습니다. | `ENTRY_SWITCHED`를 확인했습니다. |
| G13 | 닫혀 있습니다. | 전체 src lint를 포함하여 `LEGACY_IMPORTS_ZERO`를 확인했습니다. |
| G13b | 열려 있습니다. | 격리 스크립트는 `LEGACY_ISOLATED: 1685 files checked`를 냈습니다. 레거시 lint와 `LEGACY_BOTH_WAYS_ZERO`도 확인했습니다. 원장 반영은 B2에 남습니다. |
| G17 | 닫혀 있습니다. | `DISPOSITION_COMPLETE`를 확인했습니다. |
| G17b | 열려 있습니다. | `STORY_DISPOSITION_COMPLETE`를 확인했습니다. 원장 반영은 B2에 남습니다. |
| G19 | 닫혀 있습니다. | `STORIES_SWITCHED`를 확인했습니다. |
| G19b | 열려 있습니다. | `OLD_STORIES_GONE`을 확인했습니다. 원장 반영은 B2에 남습니다. |
| G20 | 닫혀 있습니다. | 완전한 워크트리에서 이주 130행 완료와 `MIGRATION_CHECK_COMPLETE`를 확인했습니다. |
| G24 | 닫혀 있습니다. | 플러그인 이름의 정적 검사에서 `PLUGIN_NAMES_MIGRATED`를 확인했습니다. |
| G28 | 닫혀 있습니다. | ESLint·tsc 각각 종료 0이며 `LINT_TYPECHECK_OK`를 확인했습니다. |
| G29 | 닫혀 있습니다. | 최신 패키지 시험 기록은 최종 src와 같으며 재사용 범위를 확인했습니다. 예전 묶음 이후 src·tests 변화와 플러그인 빌드 기준의 한계는 B2에 적었습니다. 이번 실행으로 `ALL_TESTS_GREEN` 전체를 새로 확인하지 않았습니다. |
| G30 | 닫혀 있습니다. | `plan docs 56, cited ids 596, PR-defining LANDING items 36, problems 0`과 `LEDGER_LINKS_OK`를 확인했습니다. |
| G31 | 닫혀 있으나 현 근거가 불충분합니다. | 최신 경계·DAG 재검사는 indeterminate입니다. 0건 통과로 기록할 수 없습니다. |
| G32 | 닫혀 있으나 현 근거가 불충분합니다. | 기록은 `f9ae05d5e`까지만 덮습니다. 새 차단 B4도 있으므로 현 구현의 차단 0건을 주장할 수 없습니다. |

`seiri gates status`는 지정한 워크트리에서 29/33을 반환했지만, 직접 읽은 원장은 36행 중 29행이 `[x]`입니다. 상태 도구가 접미사 `b`인 세 게이트를 집계하지 않으므로 이 보고서는 원장 파일의 개별 행을 기준으로 삼았습니다.

## 열린 게이트와 남은 일

| 게이트 | 상태 | 남은 일 |
| --- | --- | --- |
| G13b·G17b·G19b | CHECK가 통과하지만 원장은 열려 있습니다. | 이번 표지와 기준 HEAD를 원장에 기록해야 합니다. |
| G23 | 열려 있습니다. | 소유자 브라우저 실행과 미확인 사람 확인 항목이 남아 있습니다. 이번 오프라인 검증 범위에서는 실행하지 않았습니다. |
| G26 | 의도적으로 열려 있습니다. | CHECK는 종료 1이고 `PERFORMANCE_REPORTED` 표지가 없습니다. `performance.md`의 수용 대기와 138C-01에 맞는 상태이며 G27 실패 사유가 아닙니다. |
| G27 | 열려 있으며 이번 판정은 FAIL입니다. | B1·B2·B4·B5·B6를 해결한 뒤 독립 재검증이 필요합니다. |
| G31·G32 | 닫힘 표시를 신뢰할 수 없습니다. | B2에 따라 최신 소스의 근거를 확보해야 합니다. |
| G33 | PR 대기로 열려 있습니다. | CHECK는 종료 1이고 `BOARD_IN_REVIEW` 표지가 없습니다. 이번 검증에서는 실패 사유가 아닙니다. |

## 재현에 쓴 명령과 산출물

`S`는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g27p2`이고, `P`는 `S/tree/packages/canard/schema-form`입니다. 스크래치 의존성은 이미 설치된 워크트리의 의존성을 참조했으며 Vite 임시 산출물과 npm cache는 스크래치에 두었습니다. 설치는 하지 않았습니다.

- 차분은 `git diff origin/1.0.0-beta...HEAD -- packages/canard/schema-form/src ':!packages/canard/schema-form/src/core'`, 단계 간 차분은 `git diff 9a3a3b099 HEAD -- packages/canard/schema-form/src`, 최종 소스 동일성 확인은 `git diff daca1d14a HEAD -- packages/canard/schema-form/src`로 수행했습니다.
- `P`에서 `npx --offline --no-install eslint 'src/**/*.{ts,tsx}'`와 `npx --offline --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json`을 실행했습니다. 원장 G28 CHECK의 끝 표지도 별도 재실행에서 확인했습니다.
- 격리는 `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs`와 `npx --offline --no-install eslint 'src/__legacy__/**/*.{ts,tsx}'`로 확인했습니다.
- 이주는 architecture에서 `node verification/07-switch/tools/extract-migration-rows.mjs --check verification/07-switch/migration-check.md`와 `--check-complete`로, 링크는 `node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md`로 확인했습니다.
- 새 시험은 `P`에서 `npx --offline --no-install vitest run --project unit --project render --project react18 --cache=false --reporter=dot src/components/SchemaNode/SchemaNodeInput/__tests__/terminalChildren.test.tsx src/helpers/formTypeInputDefinition/__tests__/inputBoundaryLayer.test.tsx src/core/__tests__/schema-merge.mount.test.ts`로 실행했습니다. 결과는 5파일·10건 통과입니다.
- 경계 회귀는 `npx --offline --no-install vitest run --project render --project react18 --cache=false --reporter=json --outputFile=S/boundary-results.json src/components/SchemaNode/SchemaNodeInput/__tests__/refreshBoundary.test.tsx src/components/SchemaNode/SchemaNodeInput/__tests__/refreshGeneration.test.tsx src/components/SchemaNode/SchemaNodeProxy/__tests__/rendererBoundary.test.tsx`로 확인했습니다. 실제 명령의 출력 경로는 위 S의 절대 경로였으며 결과는 110건 통과입니다.
- B4의 HEAD 재현은 `npx --offline --no-install vitest run --project render --project react18 --cache=false --reporter=verbose src/__tests__/g27p2.read-after-reset.probe.test.tsx`로 실행했습니다. 두 실패 모두 설정 오류가 아니라 경고 누적 수 1 대 기대 2입니다.
- 변경 전 비교는 `git archive daca1d14a^ packages/canard/schema-form/src`에 해당 버전의 패키지 tsconfig·package.json·루트 tsconfig를 함께 추출한 뒤, 같은 시험에 `--config g27p2.before.config.ts --reporter=json --outputFile=S/before-results.json`을 사용했습니다. 결과의 reset 탐침 두 건은 통과했고 F-B·늦은 읽기의 변경 증명 시험 여섯 건은 실제 동작 차이로 실패했습니다. 초기 layout 읽기 두 건은 통과했습니다.
- facts 미확정 상태와 G31 결과는 읽기 전용 `fractal_inspect validate`의 snapshot·진단을 대조했습니다. 미확정 결과를 통과로 바꾸지 않았습니다.

보고서 작성 직전 `git status --short`는 비어 있었습니다. 작성 뒤의 상태 확인에는 지정한 `g27-phase2.md` 한 파일만 나타났으며, 다른 저장소 변경은 없었습니다.
