# 07 전환 — 실행 계획

Planning method: 저장소 지침 — `PLAN.md` §2(한 PR의 순서)와 `plan/prompts.md`의 단계 실행 절차, 소유자의 07 착수 승인(2026-10-02). 단위마다 채우는 단계·명령·기대 결과는 seiri `write-plan`의 불변식에서 가져온다. 구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-switch/gates.md`, 진행과 어긋남은 [log.md](log.md)에 적는다.

정본의 순서: 원장 `ledger/<area>.md`(`상태: 현행` 항목의 결정·보충·충돌 줄) > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 이 계획. 이 계획이 원장과 다르게 읽히면 원장대로 간다. 최초 기준선(원문 경로와 해시)은 `log.md` §1에 있다. 원장 관리 세션 `노르덴컨트롤`이 착수 확인과 물음 Q1–Q10에 답했고 68라운드(68C-01–10, `reviews/round-68-closing.md`)로 적었다. 물음 Q11–Q15는 69라운드(69C-01–05, `reviews/round-69-closing.md`)가 권장안대로 닫았다. `nodeFromJSONSchema`의 새 서명(ADR D3)은 공개 겉면 변경이라 70라운드 물음으로 보내 SURFACE 보충으로 적는다.

경로 약어: `PKG` = `packages/canard/schema-form`, `CORE` = `PKG/src/core`, `ARCH` = `PKG/architecture`, `SCN` = `packages/aileron/schema-form-scenarios`, `BF` = `packages/aileron/benchmark-form`, `RU` = `packages/winglet/react-utils`, `V7` = `ARCH/verification/07-switch`. 단계 번호와 원장 PR 번호의 대응은 07 = PR-7이다(LANDING-204).

## 1. 목표와 완료 기준

목표: `<Form>`을 새 엔진 위에 다시 세운다. (1) core가 바인딩에 내줄 통로를 채운다(마운트·폼 reset·인계·입력 출처 쓰기·입력 마침·옛 트리 폐기·상호작용 초기화 번호, 런타임 병합의 원자 판정). (2) `core/index.ts`·`src/index.ts`·`nodeFromJSONSchema`를 새 엔진으로 돌리고, React 바인딩(`providers`·`components`·`hooks`·`types`·`formTypeDefinitions`·`app/plugin`)을 새 값 채널과 동기 통지에 잇는다. (3) Form 속성·바인딩 계약 다섯·바운더리와 `onError`의 렌더 계층·`reset`의 로드 전환·제출 거부를 들인다. (4) 렌더 시험을 처분표대로 살리거나 새로 쓰고, 부류별 e2e 실행기·시나리오 스토리·React 18 실행·브라우저 게이트를 세운다. (5) 이주 점검표로 오늘과 새 동작을 대조한다. (6) UI 플러그인 넷의 이름 이주와 빌드 초록, 옛 판 대 새 판 벤치와 번들 크기 보고.

| 완료 기준(`request.md`) | 단위 | 관찰할 증거 |
| --- | --- | --- |
| `nodeFromJSONSchema`·바인딩·Form 속성·바인딩 계약 다섯 | U4, U5, U6, U7 | 통로 시험(G9), 진입점 전환 검사(G12), 바인딩 계약 시험 태그(G14), Form 표면 형 시험(G15) |
| 입력 계약·기본 union 입력·`finishInput`·`reset` 로드 전환 | U4, U6, U7 | §5의 태그 시험(G14·G16), 이주 점검표의 union 행(G20) |
| `onError` 렌더 계층과 `@winglet/react-utils` changeset | U3, U6 | RU 시험과 changeset 파일(G6·G7), 바운더리 시험(G14) |
| 이주 점검 표와 대조 시험, 브라우저·React 18 게이트 | U10, U11 | 점검표 검사(G20·G21), react18 프로젝트(G22), storybook 브라우저(G23) |
| 진입점 전환, 레거시 import 0, 옛 스토리 정리, 벤치 비교 보고 | U5, U8, U9, U13 | G12·G13, 처분표(G17), 스토리 글롭(G19), 벤치 보고(G26) |
| `verification.md`의 게이트 전부 통과 | U14 | 최종 게이트(G28–G33) |

비목표(원장 ID와 함께):

- UI 플러그인 넷의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목, 수 입력의 빈 칸 `undefined` 같은 동작 변경(LANDING-206, 68C-07). 07은 이름 이주 셋과 빌드를 초록으로 만드는 최소 고침만 한다.
- `src/__legacy__/`와 옛 스토리의 삭제(LANDING-205, 09). 07은 글롭에서 빼고 새 코드의 레거시 import를 0으로 만든다.
- README·docs 재작성, 이주 안내(09, LANDING-068). `package.json`의 판 올림(68C-06).
- 성능 최적화(전용 작업, 30라운드 소유자 답). 느린 행은 TEST-027 절차로 기록하고 원장 관리자를 거쳐 소유자 수용을 받는다. P-24는 07의 시나리오가 그 비용을 재지 않으면 남긴다(49C-01, 63C-02).
- 원장·`reviews/`·`HANDOFF.md`·`PLAN.md` §5의 수정(원장 관리자의 몫).

## 2. 해석과 자율 결정

### 2.1 해석 표

| # | 물음 | 채택한 해석 | 근거 | 상태 |
| --- | --- | --- | --- | --- |
| I1 | 진행 순서 | 원장은 PR-7의 내부 순서를 정하지 않았다. 바깥 동작을 바꾸지 않는 준비(U1–U4)를 먼저 초록으로 끝내고, 렌더 계층을 제자리에서 바꾸는 전환 묶음(U5–U8)은 한 덩어리로 둔다. 묶음 안의 중간 커밋은 `render` 프로젝트가 붉을 수 있고, 묶음 끝(U8 완료)에서 `tsc`·lint·unit·render가 모두 초록이어야 한다. 원장 관리자의 권장 순서 (1)–(6)과 내용은 같고 (1)–(3)을 한 묶음으로 합친 점만 다르다 | LANDING-067·072, 원장 관리자 착수 답 4, ADR D1 | 자율 결정 |
| I2 | 바인딩 전용 통로 | core가 마운트·폼 reset·인계·입력 출처 쓰기·입력 마침을 공개 `SchemaNode` 형을 받는 함수로 만들고 `SchemaNode/index.ts`가 이름으로 내보낸다. `core/index.ts`가 이름으로 다시 내보내고(와일드카드 없음) `src/index.ts`는 내보내지 않는다. 통로의 몸은 `dispatch/`의 진입 함수, 겉은 `SchemaNode/index.ts`의 이름 있는 내보내기. 함수마다 문서 주석에 "바인딩 전용, `src/index.ts`가 내보내지 않음", `SchemaNode/DETAIL.md`에 통로 목록 | REACT-009·010 보충, `request.md:37`, `design/02-node-and-value.md:98,106,108`, 69C-01 | 닫힘 |
| I3 | 입력 출처 표식 | 공개 `SetValueOption` 네 비트는 그대로 두고, 입력 출처 쓰기 함수가 사슬 진입에 출처를 싣는다. `UpdateValue`의 `options.source`가 `'input'`이 되고, 정착의 Refresh 대상에서 쓴 입력 자신을 빼는 판정과 늦은 쓰기 차단이 이 출처를 읽는다. 표식은 `handleChange` 진입 전체(값 쓰기·외부 오류 지움·dirty를 `batch` 하나로)에 붙는다 | REACT-009·010, EVENT-071, WRITE-083, 69C-01 | 닫힘 |
| I4 | 옛 트리 폐기와 번호 | 재생성 reset은 새 루트를 인계받은 뒤 옛 트리에 폐기 표시를 하고 리스너를 떼며, 통지 없이 Refresh 번호와 상호작용 초기화 번호를 올린다. 폐기된 노드에 온 표식 없는 쓰기는 `DISPOSED_NODE_WRITE`로 던진다. 상호작용 초기화 번호는 레코드 칸과 읽기 하나(`revision`의 비트가 아닌 바인딩 전용 읽기)로 둔다. 조건: 폐기는 참조를 끊지 않음(WRITE-086), 옛 노드 읽기는 마지막 커밋, 검증기 등록 참조 수는 이펙트 정리에서 내림, 번호 올리기는 통지 없이 동기, 표식 있는 늦은 쓰기는 조용히 버리고 표식 없는 쓰기만 던짐. 차등 시험으로 03–06 시나리오 불변. 앞 단계의 결함이 아니라 PR-7의 일 | WRITE-046·086, REACT-024, LANDING-095, 69C-02 | 닫힘 |
| I5 | reset의 외부 오류 | 외부 오류를 비우는 일은 core의 폼 reset 진입이 한다. `errors` 속성 재적용은 바인딩이 같은 진입 안(돌아오기 전, 재생성이면 새 트리)에서 경로 키로 한다. 인계도 옛 노드 객체 키가 아니라 경로 키로 넘긴다. PR-7의 일이며 코드와 원장의 어긋남(M6)으로 적는다 | WRITE-045, 69C-03 | 닫힘 |
| I6 | 런타임 병합의 원자 판정 | 청사진 결과가 작성 때 받은 `isAtomic`·`isTerminal`의 identity를 들고, 실행 중 병합 셋(`selectNodeSchema`·`selectChildren`·`primeHost`)이 그것을 넘긴다(캐시 키가 판정 identity를 포함하는 오늘 규칙 그대로). 03·04 결함의 고침으로 별도 커밋. 게이트로 켜진 선언이 React 요소·ref 모양을 `options`·`presentation`에 싣는 시험과, core만 쓰는 호스트의 동작 불변을 같은 시험으로 | REACT-003·004, 49C-01, 69C-04 | 닫힘 |
| I7 | 마운트 검증 요청 | 마운트 진입에 "검증 요청을 미룸" 선택을 둔다. 바인딩 전용 마운트 함수가 켜고 준비 이펙트에서 요청한다(로드 뒤 `OnChange` 비트면 한 번). 선택을 켜지 않은 호출은 동작 불변(LANDING-041의 core 호스트 모양) | LANDING-041·067, 69C-05 | 닫힘 |
| I8 | `nodeFromJSONSchema` | core만 쓰는 호스트의 진입이다. 새 서명은 ADR D3. `<Form>`의 트리 생성도 같은 함수를 지나 두 경로가 같은 계약을 갖는다 | VALIDATE-010, CONTROLS-075, LANDING-067 | 자율 결정(원장 미정) |
| I9 | 같은 스키마 판정 | 렌더 계층 `helpers/`의 비교 함수(키 순서까지 깊은 같음, JSON 밖 값은 참조 같음). `@winglet`의 `equals`는 키 순서를 보지 않으므로 쓰지 않는다 | WRITE-043 | 자율 결정 |
| I10 | 마운트 중 통지 | 렌더 중 `useMemo`에서 트리를 만들고 마운트한다. 시드에 버퍼형 보고기를 넣어 마운트 정착의 기록을 모으고, 준비 이펙트가 비워 `onError`로 보낸다. `onChange`·`onDiagnosticsChange`는 준비 깃발 전에는 버린다. StrictMode의 버려진 렌더 기록은 커밋된 로드 객체에 붙지 않으므로 가지 않는다 | REACT-007, ERROR-026, LANDING-075 첫째·넷째 | 닫힘 |
| I11 | `validatorFactory` | Form 속성의 공개 형은 `{ compile, compileGuard }` 객체다(필수 `compileGuard`). 고르는 순서 Form 속성 > `FormProvider` > 플러그인, 고른 검증기의 참조가 바뀌면 재생성. 공개 `ValidateFunction`·`ValidatorFactory`의 옛 모양은 지우고 이주 행에 적는다 | 32C-01, VALIDATE-044, ERROR-032 보충(35C-07) | 닫힘 |
| I12 | `JSONSchemaError` | 공개 index에서 옛 이름을 지운다. `useChildNodeErrors`의 반환형이 `ValidationIssue`가 되므로(LANDING-170) 별칭을 남길 소비자가 없다. 이주 점검표에 행으로 적는다 | 34C-02·50C-01, LANDING-170 | 자율 결정(되돌릴 수 있음) |
| I13 | `FormHandle` | 18 멤버. `focus`·`select`의 경로가 선택이 되고 `refresh`·`remount`가 더해진다. 경로가 없으면 루트, 있으면 그 노드를 찾아 `request(kind)`, 없으면 무동작. 공개 `publish` 없음 | EVENT-063·073, SURFACE-059 보충, 68C-03 | 닫힘 |
| I14 | 바운더리 선택 인자 | 68C-08대로: `ErrorBoundary`의 `onError?` 속성(공개), 감싸개 둘의 셋째 인자 `useReporter?`(기본 훅은 항상 `undefined`). 루트는 속성, 필드는 셋째 인자. `info`는 `componentStack`만 | ERROR-117, 68C-08 | 닫힘 |
| I15 | 처분표와 이주 점검표 | 처분표는 전환 직전 커밋의 렌더 시험을 파일·건수로 세어 `V7/render-disposition.md`에 둔다. 17파일은 "표면만 고친다" 가운데 조합과 옛 키가 없는 파일. 이주 점검표는 현행 이주 행 전부를 기계로 뽑아 `V7/migration-check.md`에 (가)(나)(다)와 "현행 아님"으로 처분한다. 두 표가 게이트다 | 68C-01·02 | 닫힘 |
| I16 | 스파이크 | 사례 단위 (가) 옮김 / (나) 옮기지 않음 표를 `log.md`에 둔다. EVENT-070의 이펙트 되먹임 사례는 `spikes/events/`에 더해 React 18·19에서 돌린다. 실패하면 원장 관리자를 거쳐 소유자에게 올린다 | 68C-09, EVENT-070 | 닫힘 |
| I17 | React 18 | `react18`·`react-dom18` 별칭 개발 의존, `render` 복제 프로젝트 `react18`에서 `resolve.alias`. 포함 글롭은 같고 제외는 이름과 까닭을 적은 파일만. EVENT-070·StrictMode·서버(`renderToString`) 사례도 두 판에서. 지속 통합에 둘 다 | 68C-10 | 닫힘 |
| I18 | 벤치 기준선 | BF에 `@canard/schema-form_0.16.0` 별칭을 더해 같은 실행에서 견준다. `fixtures/equivalent/` 쌍의 `[data-path]` 집합 일치 시험이 벤치보다 먼저. 패키지 벤치의 옛 기준선은 전환 직전 커밋에서 `bench:baseline`. 일곱 대응물 가운데 없는 것을 채우고 `performance-benchmarks.yml`을 새 기준선으로 | 68C-04, TEST-026·027 | 닫힘 |
| I19 | changeset | `.changeset/` 아래 RU의 `minor` changeset 하나, 판은 올리지 않음 | 68C-06, TEST-055 | 닫힘 |
| I20 | P-25 | 07의 렌더 시나리오나 watch·derived 시험이 유령 배달(내용이 같은데 `UpdateValue`·watch)을 재현하면 `updateOutput.ts`·`computeNode.ts`의 되살림 비교 기준을 직전 커밋으로 고치고 별도 커밋·차등 시험으로 적는다. 결과는 `verification/performance-issues.md`의 그 행에 07이 적는다 | 49C-01·63C-02, 65C-04·67C-01, SETTLE-043 | 닫힘 |
| I21 | 옛 스토리 | 지우지 않는다. 글롭에서 빼고 새 엔진 시나리오 스토리(`stories/scenarios/`)와 소수의 사용법 스토리(`stories/usage/`)를 세운다. 옛 스토리 정리표를 `V7/story-disposition.md`에 | TEST-025, LANDING-205, 원장 관리자 착수 답 3 | 닫힘 |
| I22 | 경계 린트 | core 경계 린트(`app/plugin` 가져오기 금지)를 `src/core/**` 전체로 넓히고, 레거시 가져오기 금지를 `src/**`(레거시 자신과 레거시를 시험하는 파일 제외)로 넓힌다 | CONTROLS-075, LANDING-159 규칙 1, LANDING-205 | 자율 결정 |

### 2.2 원장·계획서·코드 어긋남(U0에서 `log.md` §4로 옮김)

| ID | 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| M1 | `request.md:26` | "렌더 시나리오 438건" | 68C-01: 계획서 시점의 수, 정본 목록 없음 | 오늘 셈(`src/__tests__` 47파일 444건, `src` 53파일 521건)으로 처분표 |
| M2 | `request.md:27`, LANDING-206 | "이주 표의 행 LANDING-181–186" | 68C-02: 현행 이주 행 전부 | I15 |
| M3 | `request.md:41`, LANDING-159 규칙 4 | 레거시 통째 삭제 | LANDING-205(충돌 줄로 이김) | 보존, import 0 |
| M4 | `request.md:24` | "changeset(`minor`)" 대 루트 `CLAUDE.md` | 68C-06 | changeset 파일, 판 올림 없음 |
| M5 | `CORE/SchemaNode/DETAIL.md:11` | `schemaNodeFactory` 서명에 `validator` 빠짐 | — | U2에서 문서를 고침 |
| M6 | core 폼 reset | 외부 오류를 비우지 않고 인계가 옛 노드 키 맵을 넘김 | WRITE-045, 69C-03 | I5, PR-7의 일 |
| M7 | core 런타임 병합 | `isAtomic` 미전달(`{ mode: 'runtime' }`만 넘김) | REACT-003, 69C-04 | I6, 03·04 결함 |
| M8 | `dispatchMount` | 바인딩이 검증 요청을 미룰 길이 없음(사슬 끝 요청은 core 호스트 모양이라 결함 아님) | LANDING-041·067, 69C-05 | I7 |
| M9 | `ledger/test.md:421`의 "447건", TEST-025의 "33,533줄" | 오늘 셈 444건·33,545줄 | 68C-01 | 처분표에 센 기준과 함께 |

### 2.3 원장 질의와 답

| 질의 | 답 | 반영 |
| --- | --- | --- |
| 착수 1–6 | 07 선출 확인, 미결 소유자 결정 없음, 계획서 뒤의 현행 결정(26C-02, 28C-07, 32C-01, 34C-02·50C-01, 35C-04·12, 27라운드 소유자 답), P-24·P-25 규칙, D-1의 적용, 레거시·플러그인 경계, 권장 순서, 문서 소유 경계 | 비목표, I1, I11–I13, I20 |
| Q1–Q10 | 68C-01–10 | I14–I19, I21, M1–M4 |
| Q11–Q15 | 69C-01–05(권장안대로, 조건 더함) | I2–I7, M6–M8 |
| Q16(보낼 것) | `nodeFromJSONSchema` 새 서명(ADR D3)을 SURFACE 보충으로 | I8 |

## 3. 구조

### 3.1 새 자리와 바뀌는 자리

새 fractal은 없다. 렌더 계층은 기존 자리에서 바뀐다(LANDING-087 "새 fractal: 기존 자리").

- `CORE/SchemaNode/utils/binding/`(새 organ): 바인딩 전용 함수 다섯(마운트, 폼 reset, 인계, 입력 출처 쓰기, 입력 마침)의 얇은 감싸개. 공개 `SchemaNode`를 런타임 레코드로 좁혀 `dispatch` 진입을 부른다. 이름은 U2에서 `SchemaNode/DETAIL.md`와 함께 정한다(가칭 `mountSchemaNode`·`resetSchemaNodeForm`·`adoptSchemaNodeTree`·`writeSchemaNodeInput`·`finishSchemaNodeInput`).
- `CORE/dispatch/utils/entry/`: 입력 출처 쓰기와 입력 마침의 진입, 마운트의 검증 미룸 선택. `CORE/settle/utils/`: 폐기(`dispose/`), 런타임 병합의 원자 판정. `CORE/record/`: 폐기 표시·상호작용 초기화 번호 칸, `isAtomic` 런타임 칸.
- `CORE/nodeFromJSONSchema.ts`: 새 엔진 위에 다시 짓는다(ADR D3). `CORE/index.ts`: `SchemaNode/`·`validation/` 진입점의 이름을 다시 내보낸다. `CORE/types/node.ts`·`constructor.ts`는 지우고 `event.ts`·`state.ts`·`value.ts`는 남긴다(LANDING-087).
- `PKG/src/helpers/schemaIdentity/`(새 organ, 가칭): 같은 스키마 판정(I9).
- `PKG/src/providers/RootNodeContext/`: 트리 생성·마운트·버퍼형 보고기·준비 이펙트·검증 수명·`context`·`errors`·reset 재생성. `PKG/src/components/Form/`: 속성·핸들·제출 거부·루트 바운더리. `components/SchemaNode/*`: 프록시·입력·지연 자리. `hooks/`: `useChildNodeErrors` 재구현. `types/`: `JSONSchema<…, Presentation>`, `FormTypeInputProps`·Hint·`FormTypeTestObject`, `FormTypeGroupRenderer` 개명. `formTypeDefinitions/`: 기본 union 입력(열한째), 수 입력·체크박스 계약.
- `PKG/src/__tests__/e2e/<부류>.test.tsx`(새, 파일당 15건 이하), `PKG/stories/scenarios/`·`stories/usage/`(새).
- `RU/src/hoc/withErrorBoundary/`·`components/ErrorBoundary.tsx`: 선택 인자(I14).

### 3.2 의존 방향

core는 `app/plugin`·렌더 계층·React를 가져오지 않는다(CONTROLS-075, GOAL-031). 렌더 계층은 `@/schema-form/core` 진입점만 지나고, 바인딩 전용 함수도 그 진입점의 이름으로 가져온다. 새 코드에서 `__legacy__`로 가는 import는 0(린트 + 검색). `CORE/__tests__/dependencyDirection.test.ts`에 `SchemaNode/utils/binding`을 더한다.

### 3.3 바뀌는 계약 문서(코드보다 먼저, U2)

| 문서 | 바뀌는 것 |
| --- | --- |
| `CORE/INTENT.md`·`DETAIL.md` | 제목 "레거시 노드 엔진 경계" → 새 엔진의 공개 경계, 진입점이 내보내는 이름, `nodeFromJSONSchema`의 새 계약, `types/`의 남는 셋. `INTENT.md`의 공개 경계 문장은 U5의 수출 전환 커밋과 같은 커밋(`request.md` 절차) |
| `CORE/SchemaNode/DETAIL.md` | 바인딩 전용 함수 표, `schemaNodeFactory` 서명(M5), 공개 형 수출 |
| `CORE/dispatch/DETAIL.md`·`settle/DETAIL.md`·`record/DETAIL.md` | 입력 출처·입력 마침 진입, 마운트 검증 미룸, 폐기, 상호작용 초기화 번호, 폼 reset의 외부 오류 지움, 런타임 원자 판정 |
| `PKG/src/DETAIL.md`·`INTENT.md` | "07 단계까지 레거시가 `<Form>`을 섬김" 문장을 현행 계약으로 |
| `providers/DETAIL.md`, `app/DETAIL.md`, `components/*/INTENT.md`(DETAIL이 있는 곳은 DETAIL), `formTypeDefinitions/DETAIL.md`, `errors/DETAIL.md` | 바인딩 계약 다섯, 버퍼형 보고기와 준비 이펙트, reset 로드 전환, 바운더리, 제출 거부, 입력 판정, 기본 union 입력 |
| `RU/src/hoc/withErrorBoundary/DETAIL.md`(와 `ErrorBoundary`의 문서) | 선택 인자 둘(ERROR-117·119, 68C-08) — RU 코드보다 먼저 |

## 4. 작업 단위

| 역할 | 담당 |
| --- | --- |
| 설계·조율·커밋·로그 | 이 세션 |
| 구현(단위마다 한 세션) | codex(cennad 경유). 멈추면 Claude `worker`(sonnet·medium)로 대체하고 로그에 적음 |
| 계획 리뷰·원장 대조·PR 뒤 약식 리뷰 | antigravity(cennad 경유). 멈추면 Claude `verifier`(opus·xhigh)로 대체하고 게이트마다 어느 엔진인지 `V7/` 보고서에 적음 |
| 실패 원인 | Claude `debugger`(opus·high) |
| 최종 게이트 판정 | 새 컨텍스트의 Claude `verifier`(opus·xhigh) |

U0–U4는 바깥 동작을 바꾸지 않으며 각자 초록으로 끝난다. U3·U4는 U2 뒤 병렬로 갈 수 있다. U5–U8은 전환 묶음이다(I1). U9–U13은 U8 뒤에 간다. U10과 U11은 U9가 만드는 e2e·시나리오 스토리·EVENT-070 사례에 기대므로 U9 뒤에 가고, U12·U13은 U8 뒤 독립으로 병렬이다. 파일마다 작성자는 하나다.

### U0 착수 — 이 계획, ADR, 게이트 원장, 기록

- 이 계획·`execution-adr.md`·`log.md`·`.seiri/tasks/schema-form-switch/gates.md`를 쓰고 `PLAN.md` §3의 07 행을 `진행`으로 고친다(같은 브랜치의 첫 커밋, `PLAN.md` §2 3).
- 계획 리뷰(antigravity, `seiri:review-plan`)를 받아 `cleared`까지 고친다(G1). 판정은 §9.
- 완료: G1·G2.

### U1 전환 직전 기준선

전환 묶음이 바꾸기 전의 사실을 남긴다. 코드 동작은 바꾸지 않는다.

- 패키지 벤치의 옛 기준선: `yarn workspace @canard/schema-form bench:baseline`(단독 호출)을 전환 직전 커밋에서 돌려 결과를 `V7/bench-legacy-baseline.json`으로 복사한다(68C-04).
- 처분표 초안: 전환 직전 커밋의 렌더 시험(`src/**/*.test.tsx`와 DOM을 쓰는 `.test.ts`, `__legacy__` 제외)을 파일·건수로 세어 `V7/render-disposition.md`를 만든다. 열: 파일, 건수, 처분(그대로 산다·버리고 새로 쓴다·표면만 고친다), 까닭, TEST-005 17파일 여부(조합·옛 키 유무), 새 자리(e2e 파일 또는 같은 파일). 센 명령과 커밋 해시를 머리에 적는다(68C-01).
- 이주 점검표 초안: `### LANDING-nnn 이주` 머리를 기계로 뽑는 스크립트(`V7/tools/extract-migration-rows.mjs`)로 행 목록과 상태를 만들고 `V7/migration-check.md`의 열(행, 상태, 오늘 동작, 새 동작, 처분 (가)/(나)/(다)/현행 아님, 시험 이름)을 비운 채 둔다(68C-02).
- 스파이크 사례표 초안: 스파이크 시험 넷을 사례 단위로 나눠 `log.md` §5에 (가)/(나) 열을 비운 채 둔다(68C-09).
- 옛 스토리 정리표 초안: `stories/*.stories.tsx` 49파일과 줄 수를 `V7/story-disposition.md`에(TEST-025, M9).
- BF: `@canard/schema-form_0.16.0` 별칭을 더하고(`yarn.lock` 변경), `fixtures/equivalent/<이름>.ts`에 옛 문법 쌍을 둔다. 새 문법 쪽과 `[data-path]` 일치 시험은 U13.
- 완료: G3·G4·G5.

### U2 문서 선행

- §3.3의 문서를 고친다. 코드는 넣지 않는다. 한 커밋(`docs(schema-form): ...`)으로 코드보다 먼저 들어간다. `CORE/INTENT.md`의 공개 경계 문장만 U5의 수출 전환 커밋에 둔다. RU의 문서도 이 커밋 또는 U3 코드보다 앞선 별개 커밋으로(ERROR-119).
- 완료: 문서 선행은 코드가 들어온 뒤에야 판정할 수 있으므로, RU 쪽은 U3 끝에 G6, 렌더 계층 쪽은 U6 끝에 G8로 판정한다(둘 다 "문서 커밋이 그 코드의 첫 커밋보다 앞섬").

### U3 `@winglet/react-utils` 선택 인자

- 원장: ERROR-117·119, TEST-055, 68C-08, ERROR-110–116.
- 붉은 시험 먼저(`RU/src/hoc/withErrorBoundary/__tests__/`, `components/__tests__/`): 속성 `onError`가 렌더 오류에서 `(error, { componentStack })`로 한 번 불림, 없을 때 오늘과 같은 fallback, `useReporter`가 렌더 때 문맥을 읽어 그 보고기를 부름, 인자가 없을 때 훅 호출 수가 같음(기본 훅), forwardRef 판도 같음.
- `ErrorBoundary`에 `onError?`(`componentDidCatch`에서 부름), `withErrorBoundary`·`withErrorBoundaryForwardRef`에 셋째 인자 `useReporter?`. `.changeset/<이름>.md`에 `'@winglet/react-utils': minor`와 사유.
- 완료: RU 문서 선행(G6), RU 시험·형 초록과 changeset 파일(G7).

### U4 core 통로

- 원장: REACT-003·004·007·009·010·024, WRITE-043·045·046·086, EVENT-071, LANDING-041·067·095, VALIDATE-010·044, 69C-01–05.
- 문서 먼저: 이 단위가 고치는 core fractal(`SchemaNode`·`dispatch`·`settle`·`record`·`blueprint`)의 DETAIL은 U2의 문서 커밋에 든다(69C-02 "DETAIL 먼저").
- 붉은 시험 먼저(`CORE/dispatch/__tests__/`, `settle/__tests__/`, `SchemaNode/__tests__/`, 시험 이름에 ID 태그):
  - 입력 출처 쓰기: `UpdateValue`의 `options.source`가 `'input'`, 쓴 노드 자신은 Refresh 대상이 아님, 원본이 실제로 바뀐 다른 노드만 Refresh(EVENT-071, 18C-94).
  - 입력 마침: 문자열 행 `options.trim`에서 잘린 값만 자동 쓰기로 씀, 바깥 오류·dirty 그대로, 그 노드의 입력이 Refresh(WRITE-083, TEST-020 충돌 줄 1), 억제 폼에서는 자르지 않음.
  - 마운트 검증 미룸: 미룸 선택이면 사슬 끝에서 검증을 요청하지 않음, 기본은 오늘대로.
  - 폼 reset: 외부 오류를 비움(WRITE-045). 인계가 외부 오류를 경로 키로 넘김(69C-03).
  - 재생성 인계와 폐기: 인계 뒤 옛 트리의 리스너가 불리지 않음, 옛 노드의 Refresh 번호·상호작용 초기화 번호가 통지 없이 동기로 오름, 옛 노드 읽기는 마지막 커밋이고 참조는 끊기지 않음, 표식 있는 늦은 쓰기는 조용히 버려지고 표식 없는 쓰기만 `DISPOSED_NODE_WRITE`(WRITE-046·086, 69C-02). 03–06 시나리오가 폐기 도입 전후로 같은 결과(차등 시험).
  - 런타임 원자 판정: 게이트로 켜진 선언이 React 요소(`$$typeof` 표식 객체)·ref 모양(`{ current }`)을 `options`·`presentation`에 실어도 실행 중 병합이 원자로 다뤄 나중 것이 이김, 판정을 주지 않은 core 호스트는 동작 불변(REACT-003, M7, 69C-04).
  - 상호작용 초기화 번호 읽기: 폼 reset·재생성마다 오르고 다른 쓰기에서는 오르지 않음(REACT-024).
- 바인딩 전용 함수 다섯과 `SchemaNode/index.ts`의 이름 수출. `core/index.ts`는 아직 레거시를 가리킨다(전환은 U5).
- 완료: 통로 시험 초록(G9), 02–06의 core 시험 전체 초록(G10), 의존 방향 시험에 `binding` organ(G11).

### U5 전환 ① — 진입점과 형

전환 묶음의 시작. 이 커밋부터 U8 완료까지 `render` 프로젝트가 붉을 수 있다(I1).

- 원장: LANDING-067·087·159·205, GOAL-088, NODE-015·058, SURFACE-056·059·061, REACT-032, LANDING-181·185, 32C-01, 34C-02·50C-01.
- `CORE/nodeFromJSONSchema.ts`를 ADR D3대로 다시 짓는다. `CORE/index.ts`가 `SchemaNode/`·`validation/` 진입점과 바인딩 전용 함수를 이름으로 내보낸다. `CORE/types/node.ts`·`constructor.ts`를 지운다. `CORE/INTENT.md`의 공개 경계 문장을 같은 커밋에서 고친다.
- `src/index.ts`: 새 노드 형·가드(`isUnionNode` 포함)·`UnionNode`·`InferSchemaNode`·`SchemaNodeEventType`·`SchemaNodeRequestType`·`SetValueOption`·`ValidationIssue`, `JSONSchemaError` 제거(I12). 공개 이벤트 형 여섯과 `ValidationMode`는 SURFACE-059대로.
- `types/jsonSchema.ts`: `JSONSchema<Options, Presentation>`의 바인딩 판을 같은 이름으로(GOAL-088, 전역 모듈 확장 없음). `types/formTypeInput.ts`: Hint·`FormTypeInputProps`의 `type`·`schemaType`·`nullable`·`typeMismatch`, `FormTypeTestObject.type`·`schemaType`(REACT-032, LANDING-181·185). `types/formTypeRenderer.ts`·`Form/components/FormGroup.tsx`: `FormTypeRenderer` 칸 → `FormTypeGroupRenderer`(LANDING-067). `types/error.ts`: `ValidatorFactory`·`ValidateFunction`의 옛 모양 제거, Form 속성 검증기 형(I11).
- 경계 린트 넓힘(I22).
- 완료: 이 단위만으로는 게이트를 두지 않는다(묶음 끝 G12–G16).

### U6 전환 ② — 루트, Form 속성, 핸들, reset, 바운더리, 제출

- 원장: LANDING-067·075·095, REACT-004·007·025, ERROR-026·032·110–117·202, EVENT-063·073, VALIDATE-044, WRITE-042·043·045·046, SURFACE-059, GOAL-044, 26C-02, 28C-07, 18C-25.
- `RootNodeContextProvider`: 렌더 중 `useMemo`에서 `nodeFromJSONSchema`(판정 함수 둘, 버퍼형 보고기, 검증 미룸, `validationMode`, `context`, `unsetOnInactive`, `disableAutomaticWrites`, 고른 검증기). 준비 이펙트(`useLayoutEffect`)에서 준비 깃발, 버퍼 비움 → `onError`(커밋 뒤 한 번, ERROR-026), 마운트 검증 요청, `retainValidationRoot`(정리에서 `release`). `errors` 속성의 적용과 재적용. `onStateChange`는 `root.globalState`, `onValidate`는 루트 `UpdateGlobalError`, `onDiagnosticsChange`는 루트 `UpdateDiagnostics`.
- `Form` 속성: `readOnly`·`disabled` 전체 잠금(렌더 계층 결합, core 쓰기를 막지 않음), `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory` 객체 형, 렌더러 넷. 스키마 `clone` 제거(작성 루트 객체가 가드 캐시 키), `defaultValue`의 `clone`은 유지(T-19). `watchValues` prop 전달(28C-07).
- `FormHandle` 18(I13). `getValue`·`submit`은 `outputValue`. `reset`: 같은 스키마면 폼 reset 진입(호출 안 동기 로드, 커밋 재대조), 다르면 호출 안에서 재생성·인계·폐기·새 루트 로드, Refresh 번호와 상호작용 초기화 번호(WRITE-042–046).
- 제출: `degraded` 동안의 거부(`SUBMIT_WHILE_DEGRADED`, 네이티브 submit은 `onError`와 싱크로), 검증 불가의 거부(R17-1 나). "드러남과 제출 거부는 모든 환경에서 같다"(LANDING-095).
- 바운더리: 루트(`withErrorBoundaryForwardRef` + 속성 `onError`)와 필드(소유 지점 1회 감쌈 + `useReporter`), 가두고 보고하기·다시 던지지 않기, `componentStack`. 청사진 오류의 생성 자리 포착과 대체 화면, 마운트 정착 오류의 원인별 처리(§11.3).
- 붉은 시험 먼저(`src/components/Form/__tests__/`, `providers/RootNodeContext/__tests__/`, e2e 자리는 U9): 마운트 중 `onChange` 없음, `onError` 커밋 뒤 한 번(StrictMode 포함), 준비 시점 검증, `degraded` 제출 거부, reset 두 경로, 핸들 18 멤버, 바운더리 보고.
- 완료: 렌더 계층 문서 선행(G8, 이 단위의 첫 렌더 코드 커밋 뒤 판정), 묶음 끝 게이트(G14·G15).

### U7 전환 ③ — 프록시, 입력, 훅, 가상화, 기본 입력

- 원장: REACT-009–012·019·021·023·024·027–033, EVENT-063·065·071, ERROR-202, LANDING-170·181–186, NODE-058, 18C-73.
- `SchemaNodeInput`: `handleChange`의 진입 셋(값 쓰기·외부 오류 지움·dirty)을 `batch` 하나로(REACT-011), 입력 출처 쓰기(I3), `Blurred` → 입력 마침(`options.trim`), 흐림 뒤 미룬 `touched`와 상호작용 초기화 번호, Refresh 번호로 대체된 입력의 늦은 `onChange`·`onFileAttach` 버림(REACT-024), 자식 프록시의 마운트 여부로 Refresh 판정(REACT-028, 구현은 바인딩이 프록시 마운트를 세는 방식으로 고른다).
- `useFormTypeInput`: 메모 의존에 유효 스키마 참조(REACT-012), Hint(REACT-032), 선택 순서 그대로, 시험 객체의 모르는 키와 `'integer'`에 `FORM_TYPE_TEST_INVALID` 정의마다 한 번(REACT-033).
- `SchemaNodeProxy`: `UpdateJsonSchema` 비트 구독(REACT-012), 명령 실행(포커스·선택·refresh·remount, EVENT-063). `DeferrableNodeProxy`: 명령으로 즉시 드러남(T-3), `publish` 재발행을 `request`로.
- 터미널 입력의 빈 `ChildNodeComponents`: 개발 모드와 핸들러가 있는 프로덕션에서 읽기 감지 얼린 빈 배열, 첫 읽기에 `CHILD_NODE_COMPONENTS_ON_TERMINAL`(ERROR-202). 감지 비용은 U11에서 잰다.
- `useChildNodeErrors`: 새 통지(`UpdateChildren`·`UpdateState`·`UpdatePath`)로 재구현, 반환 `ValidationIssue`, 이름·시그니처 유지(LANDING-170).
- 기본 입력: union 정의(열한째, `FormTypeInputString` 감쌈, 유효 목록으로 `interpret`, 조합 중 보내지 않음, REACT-033), 수 입력(빈 칸 `undefined`, `badInput`이면 쓰지 않고 흐리면 되돌림), 체크박스(불리언 아닌 값은 미정), 초안은 입력이 듦(REACT-027). `src/types/formTypeInput.ts:60-65`의 문서 주석(LANDING-150).
- 터미널·원자 판정 함수: 렌더 계층이 청사진에 넘김(REACT-002·003, LANDING-067 터미널 판정).
- 붉은 시험 먼저(`components/SchemaNode/**/__tests__/`, `formTypeDefinitions/__tests__/`, `hooks/__tests__/`): 위 단언마다 ID 태그.
- 완료: 묶음 끝 게이트(G14·G16).

### U8 전환 ④ — 렌더 시험 처분과 하니스

- 원장: TEST-005·020·021·023·024, LANDING-095·159, 18C-49, 68C-01.
- 처분표(U1)대로 렌더 시험을 처리한다: "그대로 산다"는 그대로 돌고, "표면만 고친다"는 이름만 바꿔(17파일은 e2e의 추가 단언으로) 살리며, "버리고 새로 쓴다"는 U9의 e2e로 대체하고 처분표에 새 자리를 적는다. 처분은 파일마다 커밋 메시지에 사유를 적는다(`request.md` 절차).
- `renderForm` 다섯(TEST-021): 동기 `compileGuard`와 루트 등록, 주인 없는 오류 싱크와 `onError` 관찰 도우미, `reset`의 뜻, `flushOnMount: false`의 처분, 핸들의 `container` 등록(TEST-011).
- 레거시 단위 시험과 레거시 렌더 시험을 시험 글롭에서 뺀다(LANDING-159 보충, 18C-49). 레거시를 시험하던 렌더 파일(`SchemaNodePropsFlow.test.tsx`, `components/__tests__/SchemaNodeProxy.refresh.test.tsx`)은 처분표대로.
- 묶음 끝: `tsc`·lint·unit·render 초록, 레거시 import 0.
- 완료: G12·G13·G17.

### U9 e2e, 시나리오 스토리, 스파이크 이식

- 원장: TEST-011·020·023·024·025, LANDING-095, 26C-02, 68C-09.
- `src/__tests__/e2e/<부류>.test.tsx`: SCN 부류마다 실행기 하나, 파일당 15건 이하, `playScenario(scenario, element)`. 처분표의 "새로 쓴다" 대체와 TEST-020의 e2e(렌더 중 `onChange` 없음, 마운트 정착 오류, 바운더리와 싱크, `onError`, `finishInput`·`trim`, strategy, reset, 대체된 입력의 늦은 쓰기, 흐림 뒤 `touched`). 06이 넘긴 가상화 기록이 위치를 따름(06 §6.2).
- SCN: 전환이 요구하는 추가만(화면 단계 어휘, 필요한 부류 장면).
- `stories/scenarios/`: SCN 데이터 모듈의 다섯 줄 스토리, `play`에서 `playScenario`. `stories/usage/`: 소수의 사용법. 옛 스토리 49파일은 글롭에서 뺀다(I21).
- 스파이크 사례표를 채우고 (가)를 옮긴다. EVENT-070 사례를 `spikes/events/`에 더한다(실행은 U11).
- P-25: 위 시험이 재현하면 I20대로 고친다.
- 완료: G18·G19.

### U10 이주 점검

- 원장: LANDING-004–050과 그 뒤 이주 행, LANDING-181–186·198·200–203, SURFACE-059, 18C-87·89–93·99, 68C-02.
- `V7/migration-check.md`의 행마다 처분을 채운다. (가)는 `src/__tests__/migration/<행>.test.tsx`(가칭) 또는 e2e의 시험 이름으로 오늘 동작(0.16.0 별칭 또는 레거시)과 새 동작을 대조한다. (나)는 02–06의 시험 이름을 인용한다. (다)는 08·09. 폐기·분할·대체 행은 "현행 아님".
- 채움 시점 이주 행 셋(LANDING-200–202): 세 장면을 오늘 코드와 새 구현에서 돌린다. 오늘 결과는 T1-B 탐침(`reviews/raw-round18-tests/t1b-fill-consistency.md`)과 같고 새 결과는 이주 행대로(LANDING-203).
- 공개 표면 잔여의 거취(SURFACE-059, 18C-87): `FormProps` 열아홉 칸과 새 셋, `FormHandle` 18, `ValidationMode`, 공개 이벤트 형 여섯, 명령·훅의 거취를 형 시험과 표로 대조.
- 빠진 이주 행이 나오면 원장 관리자에게 물음으로 보내고(원장 LANDING 영역에 먼저 더함), 시험은 그 뒤에 더한다(`verification.md` 실패 처리).
- 완료: G20·G21.

### U11 React 18, 브라우저 게이트

- 원장: REACT-017·027·028, EVENT-065·070, ERROR-115·116, TEST-024, 18C-40·62·63·73·85, 68C-10.
- `react18`·`react-dom18` 별칭 개발 의존, `vite.config.ts`의 `react18` 프로젝트, 지속 통합 작업 흐름에 두 프로젝트. EVENT-070 사례(실패하면 원장 관리자에게), StrictMode·`renderToString` 사례.
- storybook 브라우저(Chromium): IME 조합(CDP `Input.imeSetComposition`·`insertText`, ㄱ→가→각, 평범한 입력·캐럿 포매터·조합 중 Refresh), 수 입력 `badInput`과 흐림 뒤 표시, 입력 판정(reset 시험·StrictMode·가상화), 빈 `ChildNodeComponents` 감지 비용. `V7/browser-gates.md`는 이 네 게이트(EVENT-065, REACT-027, REACT-028, 18C-73)마다 행 하나에 시험 이름·실행 환경·결과를 적고, 그 아래 사람이 확인하는 목록(macOS Safari·Chrome 한국어 IME)과 소유자 확인 칸을 둔다.
- 실행 환경: storybook 프로젝트는 Playwright Chromium 바이너리가 있어야 돈다(`npx playwright install chromium`, 이미 설치되었는지 먼저 확인). react18 프로젝트는 `resolve.alias`와 함께 `resolve.dedupe`로 `react`·`react-dom`을 한 벌로 묶어 `@testing-library/react`가 같은 판을 읽게 한다.
- 완료: G22·G23.

### U12 UI 플러그인 넷

- 원장: LANDING-067·206, 68C-07.
- antd5·antd6·antd-mobile·mui의 `src`에서 `node.group` → `node.strategy`, `FormTypeRenderer` 칸 → `FormTypeGroupRenderer`, 타입과 등록 키 대응, 컴파일 오류를 없애는 최소 고침. 고친 줄 목록과 "같은 입력에서 렌더 결과·방출 값이 같은가" 판정을 `log.md`에. 바뀌는 줄은 08 목록으로.
- 완료: 넷의 `build` 초록, `node.group`·`FormTypeRenderer` 칸 0(G24).

### U13 벤치와 번들 크기

- 원장: TEST-026·027·074·075, 27라운드 소유자 답, 68C-04.
- BF: `fixtures/equivalent/` 새 문법 쪽과 `[data-path]` 일치 시험, 그 뒤 0.16.0 대 워크스페이스 판의 코어·렌더(React 19, Profiler) 측정(워밍업 10, 표본 100 이상, 중앙값·p99). jsdom `render` 프로젝트 측정.
- 패키지 벤치 일곱의 대응물 완성, U1의 옛 기준선과 비교. `.github/workflows/performance-benchmarks.yml`을 새 기준선으로.
- 번들 크기: `dist/index.mjs`를 esbuild minify + gzip -9(의존성 외부), 기준 37,023 B, minify 없는 gzip도(51,632 B 기준).
- 기록: `V7/performance.md`(환경·명령·행마다 수치·판정), 느린 행과 번들 증가는 `verification/performance-issues.md`에 더하고 원장 관리자를 거쳐 소유자 수용을 요청. 모바일은 잰 사실만(TEST-074). 타입 검사 비용(GOAL-088)도 `yarn workspace @canard/schema-form typecheck` 시간으로 적는다.
- 완료: G25·G26.

### U14 최종 검증과 PR

- §8 명령 전부, `seiri:verify`(새 컨텍스트 verifier에 최초 기준선·원장·계획·diff·근거), filid 스캔(organ 외부 소비 0, 순환 0), antigravity의 원장 대 구현 대조, PR 본문(완료 기준·리뷰 체크리스트·원장 어긋남·처분표·이주 점검표·플러그인 고친 줄·벤치 수용 기록), `PLAN.md` §3 07 → 리뷰. PR 뒤 `filid:enrich-docs`·약식 리뷰·수정·재검증(`plan/prompts.md` §8).
- 완료: G27–G33.

## 5. 게이트 추적표 — 원장이 PR-7에 배정한 단언

시험 이름에 원장 ID를 태그로 싣는다.

| 원장 | 단언 | 시험 자리 | 단위 |
| --- | --- | --- | --- |
| REACT-007, ERROR-026, LANDING-075 첫째·넷째 | 마운트 정착 동안 `onChange`·`onDiagnosticsChange` 없음, `onError` 커밋 뒤 한 번(StrictMode에서도) | `providers/RootNodeContext/__tests__/`, e2e | U6, U9 |
| REACT-009·010, EVENT-071, 18C-94 | 입력 출처 쓰기의 Refresh 범위, 쓴 입력 제외, 캐럿 유지 | `CORE/dispatch/__tests__/`, `components/SchemaNode/**/__tests__/` | U4, U7 |
| REACT-011 | `handleChange` 셋이 `batch` 하나, 사슬 끝 throw에서도 dirty | `components/SchemaNode/**/__tests__/` | U7 |
| REACT-012 | 유효 스키마가 바뀌면 입력 메모가 새로 고르고 프록시가 다시 그림 | 같음 | U7 |
| LANDING-075 넷째, ERROR-110–117 | 바운더리는 가두고 보고, 다시 던지지 않음, `componentStack` | `components/Form/__tests__/`, e2e | U6 |
| WRITE-083, TEST-020 충돌 줄 1 | `trim` 마침은 자동 쓰기, 바깥 오류·dirty 그대로, 입력 Refresh | `CORE/dispatch/__tests__/`, e2e | U4, U9 |
| WRITE-042–046, REACT-024 | reset 두 경로, Refresh 번호·상호작용 초기화 번호, 대체된 입력의 늦은 쓰기 버림 | `CORE/settle/__tests__/`, e2e | U4, U6, U9 |
| REACT-028, 18C-62 | 입력 판정: 터미널·값 전체 브랜치·빈 배열 입력은 다시 마운트, 자식을 그리는 기본 객체·배열은 아님, StrictMode·가상화 | e2e, storybook | U7, U11 |
| REACT-027, 18C-40 | 초안·빈 칸·비우기·수 입력·체크박스, 브라우저 `badInput` | `formTypeDefinitions/__tests__/`, storybook | U7, U11 |
| REACT-033, LANDING-186 | 기본 union 입력, 모르는 키 `FORM_TYPE_TEST_INVALID` 1회, 정수 노드 props | `union.input-binding.render.test.tsx`, `union.default-input-draft.render.test.tsx` | U7 |
| NODE-058, GOAL-088 | 공개 형 수출과 `tsc --strict`, 타입 검사 비용 | `src/types/__tests__/` | U5, U13 |
| EVENT-063·073, SURFACE-059 | `FormHandle` 18, 경로 선택, 노드 없으면 무동작, `publish` 없음 | `components/Form/__tests__/`, 형 시험 | U6 |
| ERROR-202, 18C-73 | 빈 `ChildNodeComponents` 첫 읽기 경고와 비용 | `components/SchemaNode/**/__tests__/`, storybook | U7, U11 |
| EVENT-065, 18C-63 | IME 조합의 동기 통지 | storybook | U11 |
| EVENT-070, REACT-017, 18C-85 | 이펙트 되먹임이 React 18·19에서 끊김 | `spikes/events/`, `react18`·`render` | U9, U11 |
| LANDING-198·200–203, 18C-87·99 | 이주 점검표의 모든 행 | `V7/migration-check.md`의 시험 이름 | U10 |
| TEST-026·027·075, 27라운드 소유자 답 | 벤치 표·번들 크기와 수용 기록 | `V7/performance.md` | U13 |

## 6. 넘어온 사례

| 원천 | 사례 | 단위 |
| --- | --- | --- |
| 06 §6.2 | 위치 재조정에서 가상화 기록이 위치를 따름 | U9 |
| 06 §6.2, LANDING-203 | 채움 시점 이주 행의 나머지 두 장면(LANDING-200·201), 렌더 key | U10 |
| 05 log "06에 넘길 목록" 중 렌더 몫, 26C-02 | 렌더 실행기와 제출 거부 | U6, U9 |
| `verification/performance-issues.md` P-24·P-25 | I20, 비목표 | U9, U13 |

## 7. 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 전환 묶음이 길어 붉은 기간이 김 | U4에서 core 통로를 먼저 초록으로 끝내고, U5–U7은 붉은 시험 먼저 쓴 새 바인딩 시험을 단위마다 초록으로 만든다. 묶음 중간 커밋의 붉은 render는 `log.md`에 적는다 |
| 처분표의 "새로 쓴다"가 빠뜨린 동작 | 처분표에 새 자리 열을 두고 G17이 빈 칸 0을 확인. 이주 점검표와 교차 |
| React 18에서 19 전용 API를 쓰는 시험 | 제외 목록에 이름과 까닭(68C-10) |
| 플러그인 최소 고침이 동작을 바꿈 | 68C-07의 판정 기준, 바뀌는 줄은 08로 |
| 벤치가 느림 | TEST-027 절차, 최적화는 비목표 |
| Playwright Chromium이 없어 storybook 게이트가 환경 때문에 실패 | U11에서 설치 여부를 먼저 확인하고 설치 명령을 `V7/browser-gates.md`에 적음 |
| react18 프로젝트에서 React가 두 벌 실려 "Invalid hook call" | `resolve.dedupe`와 별칭을 함께, 첫 실행에서 `React.version`을 단언하는 시험 하나 |
| 시험 이름 필터가 0건과 맞아 게이트가 비어서 통과 | 게이트마다 태그가 시험 파일에 실제로 있는지 먼저 grep으로 단언(05의 G11·G14·G16 모양) |

## 8. 검증 명령(저장소 루트)

- 단위 범위: `(cd packages/canard/schema-form && npx vitest run --project unit <경로>)`
- 패키지 unit·render: `(cd packages/canard/schema-form && npx vitest run --project unit --project render)`
- react18: `(cd packages/canard/schema-form && npx vitest run --project react18)`
- storybook 브라우저: `(cd packages/canard/schema-form && npx vitest run --project storybook)`
- lint·typecheck: `(cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json)`
- RU: `(cd packages/winglet/react-utils && npx vitest run && npx tsc --noEmit -p tsconfig.json)`
- SCN: `(cd packages/aileron/schema-form-scenarios && npx vitest run --config vite.config.ts && npx tsc --noEmit --strict --composite false -p tsconfig.json)`
- 플러그인 빌드: `yarn workspace @canard/schema-form-antd5-plugin build` 등 넷(단독 호출)
- 원장 인용: `(cd packages/canard/schema-form/architecture && node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md | tail -1)`
- 벤치: `yarn workspace @canard/schema-form bench:baseline`·`bench:compare`, `yarn workspace @aileron/benchmark-form bench`·`guard:check`(단독 호출)
- 빌드·번들: `yarn workspace @canard/schema-form build`(단독 호출) 뒤 `npx esbuild packages/canard/schema-form/dist/index.mjs --bundle=false --minify | gzip -9 | wc -c`

## 9. 리뷰 기록

| 차례 | 리뷰어 | 판정 | 반영 |
| --- | --- | --- | --- |
| 1 | antigravity(세션 `a934a8d0`, `a44003ddd` 기준, 두 차례 응답) | `rework-required`: F1(차단) `vitest -t` 필터가 0건과 맞으면 종료 코드 0이라 G9·G14·G15·G16·G21·G22가 비어서 통과; F2(차단) G6·G8은 코드가 들어오기 전인 U2 끝에 판정 불가; F3(차단) G24가 플러그인만 보고 본체 `ChildNodeComponentProps`·`FormGroupProps`의 `FormTypeRenderer` 칸을 보지 않음; F4 G19가 넓은 옛 글롭의 제거를 보지 않음; F5 `browser-gates.md`의 네 행이 본문에 없음, `TBD`만으로는 빈 칸을 못 잡음; F6 U10·U11이 U9에 기댐; F7 LANDING-150 검사 없음; F8 G26에 CHECK 없음; F9 경계 린트 넓힘의 검사 없음; F10 Playwright 바이너리와 React 두 벌 위험. 원장·68C와의 충돌 없음, 범위 누락·초과 없음, 현행 주장 표본 12건 확인 | F1 태그 존재를 grep으로 먼저 단언(05 모양); F2 G6은 U3 끝, G8은 U6 끝에 판정; F3 G12가 본체 소스의 칸 선언 0을 단언; F4 G19에 넓은 글롭 부재; F5 U11 본문과 G17·G18의 빈 표 칸 단언; F6 §4 의존 문장; F7 G16에 문서 주석 단언; F8 G26 CHECK; F9 G13에 `src/core/**` 단언; F10 U11 실행 환경과 §7 위험 두 줄. 함께 69라운드(69C-01–05)를 I2–I7·M6–M8·U4·ADR D2·D5에 반영 |
