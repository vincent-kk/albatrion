# 68라운드 닫기 — 07 전환 착수의 원장 물음 열: 처분표와 이주 점검표는 오늘의 파일로 07이 새로 만들고 그 표가 게이트다, 명령 메서드는 30라운드가 이겼다, 벤치 기준선은 마지막 배포 판과 전환 직전 커밋, 07이 손대는 경로는 원장 행이 이름 댄 곳, changeset은 원장대로 더하고 판은 올리지 않는다, 플러그인은 빌드 초록까지만, 바운더리 선택 인자의 모양 확정, 스파이크와 React 18 시험의 방법

2026-10-02. 07 작업자(전환, 가지 `feat/schema-form-switch`, `1.0.0-beta` `78534356c`에서 착수)가 실행 계획을 쓰기 전에 물음 열 건(Q1–Q10)을 권장 해석과 함께 보냈다. 모두 현행 항목에서 유도되거나 원장이 PR-7의 선택으로 미뤄 둔 것(ERROR-117)이라 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다.

### 68C-01 렌더 시나리오 "438건"은 계획서 시점의 수이고 정본 목록은 없다 — 07은 오늘의 파일과 건수로 처분표를 새로 만들어 `verification/07-switch/`에 두고, TEST-005의 17파일은 그 기준("조합과 옛 키가 없는")으로 07이 골라 처분표에 적으며, 처분표가 09 §4.3 처분의 게이트다

- 닫는 항목: TEST-005(보충), LANDING-067(보충)
- 결정:
  - 【추론】 "렌더 시나리오 438건"(LANDING-067, 08 §18의 PR-7 행)과 "447건이 통과하므로"(TEST-023, 09 §5.1)는 설계 시점에 `src/__tests__`를 센 수이고, 원장 어디에도 파일 이름 목록이나 17파일의 이름 목록은 없다(TEST-005의 원문은 기준만 적었고, 설계서 07의 네 부류 표는 대표 이름 여섯뿐이다). 그러므로 수는 구속이 아니고 처분이 구속이다: 07은 전환 직전 커밋의 `src/__tests__`(그리고 `src` 전체의 렌더 시험)를 파일·건수로 세어 처분표를 `verification/07-switch/`에 새로 만들고, 파일마다 09 §4.3의 세 처분(그대로 산다·버리고 새로 쓴다·표면만 고친다) 가운데 하나와 그 까닭을 적으며, "표면만 고친다"에서 조합(`oneOf`·`anyOf`·`if`·`allOf`의 옛 자동 감지)과 옛 키(`presentation.*`로 옮긴 것, `group`, `JSONSchemaError` 등 이주 표가 바꾼 이름)가 없는 파일이 TEST-005의 17파일이다. 수가 17과 다르게 나오면 처분표에 센 기준과 함께 적고 TEST-005를 고치지 않는다(옛 글은 자라기만 한다; 17은 소유자가 받아들인 예외의 범위를 적은 수이지 파일 수의 약속이 아니다). 438·447과 오늘 수의 차이는 `plan/07-switch/log.md`에 한 줄로 남긴다. 이 처분표가 PR-7의 렌더 시나리오 게이트이고, 전환 뒤 `render` 프로젝트의 초록은 처분표의 "산다"·"표면만 고친다" 파일 전부가 돈다는 뜻이다.
- 근거: TEST-005 "조합과 옛 키가 없는 17파일은 기대값을 이름만 바꿔 e2e의 추가 단언으로 살린다(16라운드 답 7, 09 §4.3)"; LANDING-067의 PR-7 행 "렌더 시나리오 438건의 처분(09 §4.3. 17파일은 단언을 이름만 바꿔 살린다, 16라운드 답 7)"; TEST-023 "447건이 통과하므로 e2e 층의 뼈대로 쓴다"(`ledger/test.md:421`); 설계서 `design/07-landing-and-tests.md:693-703`(네 부류 표, 대표 이름만); 07의 셈(오늘 `src/__tests__` 47파일 444건, `src` 전체 53파일 521건).

### 68C-02 이주 점검의 대상은 현행 "이주" 행 전부다 — LANDING-206의 "이주 표의 행(LANDING-181–186)"은 08로 가지 않고 PR-7에 남는 union 행을 든 것이지 범위의 전부가 아니며, 07은 행마다 (가) 시험으로 대조, (나) 앞 단계의 코어 시험이 이미 덮음(시험 이름 인용), (다) 08·09의 몫 가운데 하나로 처분한 점검표를 만들고 그 표가 게이트다

- 닫는 항목: LANDING-206(보충), LANDING-198(보충)
- 결정:
  - 【추론】 이주 표는 LANDING-004–050("이주 1"–"이주 47")과 그 뒤 "이주(05)"·"이주(S1)"·"이주(18라운드)"·"이주(19라운드)" 머리를 단 행(LANDING-115–208 사이)으로 흩어져 있고, 18C-87이 정한 이주 점검은 "이주 표의 행마다 오늘 동작과 새 동작을 시험으로 대조"이므로 대상은 현행 상태의 이주 행 전부다. LANDING-206이 "이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다"고 적은 것은 같은 답에서 08로 옮긴 셋(`presentation.*` 이주·자사 플러그인 수정 목록·플러그인마다의 union 항목)과 헷갈릴 수 있는 union 이주 행이 PR-7에 남음을 밝힌 것이지 점검 범위를 여섯 행으로 줄인 것이 아니다. 07은 `### LANDING-nnn 이주` 머리를 기계로 뽑아 행마다 (가) 렌더 또는 e2e 시험으로 오늘과 새 동작을 대조(시험 이름), (나) 렌더와 무관해 02–06의 코어 시험이 이미 덮음(그 시험 이름 인용; 인용 없는 (나)는 받지 않는다), (다) 08(플러그인)·09(정리·릴리스)의 몫 가운데 하나를 적은 점검표를 `verification/07-switch/`에 두고, 그 표가 PR-7의 이주 점검 게이트다. 상태가 "폐기"·"분할됨"·"대체됨"인 이주 행은 표에 넣되 처분은 "현행 아님"으로 적는다.
- 근거: LANDING-206 "이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다", "UI 플러그인 넷의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR이 한다"; LANDING-198(이주 점검, 18C-87); `plan/07-switch/request.md:27`("이주 표의 행마다 오늘 동작과 새 동작을 시험으로 대조"); 소유자 답 `reviews/round-18-owner-answers.md:42`(개발계획 P1).

### 68C-03 LANDING-170 보충의 설계서 메모 3("publish를 부활시키던가")은 30라운드 소유자 답에 졌다 — 노드의 명령은 `request(kind)` 하나이고 공개 `publish`는 없다

- 닫는 항목: LANDING-170(보충), EVENT-063(보충)
- 결정:
  - 【추론】 설계서 메모 3은 방향("넷을 따로 두지 말고 종류를 매개변수로 받는 메서드 하나로")과 이름 후보(`action`·`interaction`·`request`, 또는 명령에 한정한 `publish` 부활)를 함께 적은 것이고, 30라운드에서 소유자가 이름을 `request`로 확정하며 "공개 `publish`는 두지 않는다"(EVENT-063 보충)로 닫혔다. LANDING-170의 "`RequestEmitChange`·`RequestInjection`은 새 설계에 없다"와 "소비자가 publish할 수 없다"는 그대로이고, 메모 3의 `publish` 부활 후보는 택하지 않은 안으로 읽는다. 07의 `FormHandle`과 렌더 계층은 노드의 `request(kind)`만 부른다.
- 근거: EVENT-063 보충 "소유자(30라운드, 명령 메서드 이름): "네" — 노드의 명령 메서드 하나의 이름은 `request`다(EVENT-073)"; `reviews/round-30-owner-answers.md:9` "확정. 노드의 공개 명령 메서드는 `request(kind)` 하나다. 공개 `publish`는 두지 않는다(EVENT-063)"; LANDING-170 보충(설계서 메모 3, `reviews/round-18-owner-answers.md:40`).

### 68C-04 옛 판 대 새 판의 벤치 기준선은 마지막으로 배포된 판을 npm 별칭으로 더해 같은 실행에서 견주는 것이고, 패키지 벤치의 옛 기준선은 전환 직전 커밋의 `bench:baseline`이다 — 패키지 벤치 일곱의 대응물 완성과 `performance-benchmarks.yml`의 새 기준선은 TEST-026대로 PR-7의 몫

- 닫는 항목: TEST-026(보충)
- 결정:
  - 【추론】 TEST-026은 하니스를 `@aileron/benchmark-form`으로, 비교 대상을 "npm 별칭의 옛 판과 워크스페이스 판"으로 정했다. 전환 뒤 워크스페이스 판은 새 엔진이므로 옛 판 자리는 마지막으로 배포된 판(오늘 `0.16.0`; 별칭 `@canard/schema-form_0.16.0`)이 맡는다 — 전환 직전 커밋의 워크스페이스 판을 따로 기준으로 삼지 않는다. 그 까닭은 1.0.0-beta의 공개 진입점이 PR-7까지 옛 엔진을 가리키고(LANDING-159 규칙 3) 02–06이 공개 동작을 바꾸지 않았으므로(32C-01) 배포 판과 전환 직전의 옛 엔진이 같은 동작이기 때문이며, 둘이 다르다는 증거가 나오면 그때 전환 직전 커밋을 별칭으로 더한다. 07은 `fixtures/equivalent/<이름>.ts`에 옛 문법과 새 문법 쌍과 상호작용 열을 두고, 두 판이 같은 `[data-path]` 집합을 그리는지 시험이 단언한 뒤에 잰다. 패키지 벤치(`bench/*.bench.ts`)는 02–06이 새 fractal 이름으로 일부 다시 썼으므로 07은 TEST-026의 일곱 대응물 가운데 아직 없는 것(렌더 지연 등)을 채우고, 옛 엔진의 마지막 기준선은 전환 직전 커밋에서 `bench:baseline`으로 남긴다. `.github/workflows/performance-benchmarks.yml`의 과다 렌더 단언과 회귀 검사를 새 기준선으로 갱신하는 것도 TEST-026이 PR-7에 둔 일이다. 느린 행은 TEST-027 절차다.
- 근거: TEST-026 "이미 npm alias로 옛 판 다섯(`@canard/schema-form_0.9.0` … `_0.12.5`)과 워크스페이스 판을 나란히 설치해 비교하고 있고", "패키지 벤치 일곱은 새 엔진의 대응물로 다시 쓴다. … 옛 엔진에서 마지막 기준선을 `bench:baseline`으로 남긴다", "`.github/workflows/performance-benchmarks.yml`의 과다 렌더 단언과 회귀 검사는 PR-7에서 새 기준선으로 갱신한다"; LANDING-159 규칙 3; 32C-01(`reviews/round-32-closing.md:10`); LANDING-067 보충(27라운드 소유자 답, jsdom·`benchmark-form` 게이트); `packages/canard/schema-form/package.json:3`(`0.16.0`).

### 68C-05 07이 손대는 코드 경로는 PR-7의 원장 행(LANDING-067·095, TEST-026, REACT-017, TEST-055)이 이름 댄 곳 전부다 — 패키지 안의 `stories/`·`.storybook/`·설정 파일·`bench/`, UI 플러그인 넷의 이름 이주, `@winglet/react-utils`, `@aileron/schema-form-scenarios`·`benchmark-form`, 작업 흐름 파일, React 18 개발 의존의 `yarn.lock`; 앞선 답의 네 경로는 `architecture/` 문서의 소유 구분이었다

- 닫는 항목: LANDING-067(보충), LANDING-095(보충)
- 결정:
  - 【추론】 앞선 답(07 착수 전 물음 1)의 "`src/**`, `verification/**`, `plan/07-switch/**`, PLAN §3·§4의 07 행"은 `architecture/` 안에서 원장 관리자와 단계 작업자가 나눠 갖는 문서의 경계였고, 코드의 범위는 PR-7의 원장 행이 정한다. LANDING-067·095가 이름 댄 것(옛 스토리 49파일 정리와 시나리오 스토리·`playScenario`, `renderForm` 다섯과 부류별 e2e 실행기, `node.group`·`FormTypeRenderer`의 플러그인 쪽 소비자 이주, `@winglet/react-utils`의 바운더리 선택 인자), TEST-026이 이름 댄 것(`@aileron/benchmark-form`의 새 항목과 `fixtures/equivalent`, `bench/`, `.github/workflows/performance-benchmarks.yml`), REACT-017이 요구하는 React 18 실행 시험의 개발 의존(그에 따른 `yarn.lock`), 그리고 그것들이 돌게 하는 설정(`.storybook/`, `vite.config.ts`, `eslint.config.js`, `package.json`)은 모두 07의 경로다. `@aileron/schema-form-scenarios`는 시나리오 스토리와 e2e 실행기가 읽는 데이터 모듈이라 LANDING-087의 "그대로 쓰는 것"에 들고, 07은 전환이 요구하는 추가만 한다. 이 밖의 경로(다른 패키지, 저장소 설정)에 손대야 하면 쓰기 전에 물음으로 보낸다. 플러그인 패키지의 `src`는 68C-07의 범위 안에서만 고친다.
- 근거: LANDING-067의 PR-7 행; LANDING-095의 PR-7 행("옛 스토리 49파일 전체 정리", "`renderForm` 다섯", "React 18 실행", "`@winglet/react-utils`의 changeset"); TEST-026(`benchmark-form`, `bench/`, 작업 흐름); REACT-017; TEST-055; LANDING-087(부딪히는 코드·그대로 쓰는 것); `plan/07-switch/request.md:29`.

### 68C-06 `@winglet/react-utils`의 판 변경은 원장대로 changeset 파일(`minor`)로 적는다 — 루트 `CLAUDE.md`의 "changesets를 쓰지 않는다"에는 01 재정렬에서 이미 원장이 이겼고 02가 같은 모양(`.changeset/common-utils-merge-policies.md`)으로 했다; `package.json`의 판은 07이 올리지 않고 릴리스(PR-8·릴리스 전환)가 올린다

- 닫는 항목: TEST-055(보충), LANDING-095(보충)
- 결정:
  - 【추론】 TEST-055는 PR-7이 `@winglet/react-utils`의 자기 changeset(`minor`)을 더한다고 정했고, 루트 `CLAUDE.md`의 "changesets를 쓰지 않고 릴리스 때 판을 올린다"와의 충돌은 01 재정렬 기록(`plan/01-design-docs/realign.md:29,167`)이 "TEST-054·055, LANDING-097: 원장이 이긴다"로 닫았으며, 02(PR-1)는 그대로 `.changeset/common-utils-merge-policies.md`를 더했다. 07은 같은 모양으로 `.changeset/` 아래 `@winglet/react-utils`의 `minor` changeset 파일 하나를 더하고 변경 사유를 그 파일과 커밋 메시지에 적는다. `package.json`의 `version`은 올리지 않는다 — 판 올림은 changesets 가동(LANDING-097, 릴리스 전환 PR)과 PR-8(LANDING-096)의 몫이고, 07이 올리면 프리릴리스 무리의 판 계산과 두 번 셈한다. 루트 `CLAUDE.md`의 문장은 릴리스 전환 PR이 고친다(LANDING-097 "판 올림 스크립트 정리와 루트 `CLAUDE.md`").
- 근거: TEST-055 "PR-7이 바꾸는 `@winglet/react-utils`(…)는 PR-7에서 자기 changeset(`minor`)을 더한다"; LANDING-095의 PR-7 행 "`@winglet/react-utils`의 changeset(`minor`, §6.2의 열한째)"; LANDING-097 "changesets 가동, … 판 올림 스크립트 정리와 루트 `CLAUDE.md`"; LANDING-096(PR-8의 changeset과 판 번호); `plan/01-design-docs/realign.md:29,167`; 저장소의 `.changeset/` 디렉토리와 02의 changeset 파일.

### 68C-07 UI 플러그인 넷에서 07이 하는 것은 이름 이주 셋과 `build`(타입 검사 포함)를 초록으로 만드는 최소 고침까지다 — 그 줄을 `log.md`와 PR 본문에 목록으로 적고, 동작이 바뀌는 고침(LANDING-182–184의 수 입력·빈 칸 등)은 08의 "자사 플러그인 수정 목록"에 둔다

- 닫는 항목: LANDING-206(보충)
- 결정:
  - 【추론】 `verification.md`의 게이트 "UI 플러그인 넷의 `build`(타입 검사 포함)가 초록"과 LANDING-206의 "자사 플러그인 수정 목록은 플러그인 PR이 한다"는 이렇게 맞물린다: 공개 형의 변경(`type`에서 `'integer'`가 빠짐, `FormTypeTestObject.type`의 형, `FormTypeRenderer` → `FormTypeGroupRenderer`, `node.group` → `node.strategy`)으로 플러그인 소스가 컴파일되지 않는 줄은 07이 고치되, 컴파일 오류를 없애는 데 필요한 최소(이름 바꿈, 비교식의 형 맞춤, 빠진 타입 가져오기)만 하고 그 줄의 목록을 `plan/07-switch/log.md`와 PR 본문에 적는다. 그 밖의 플러그인 동작 변경(수 입력의 빈 칸 `undefined`, `presentation.*` 이주, union 항목)은 08의 목록에 넘기고 07은 기본 입력으로 검증한다. 07이 고친 줄이 동작을 바꾸는지 가를 때는 "같은 입력에서 플러그인의 렌더 결과와 방출 값이 같은가"를 기준으로 하며, 바뀌면 그 줄은 08로 넘기고 07은 컴파일만 통과하도록 가장 좁게 고친다.
- 근거: LANDING-206 "UI 플러그인 넷의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR이 한다", "PR-7은 기본 입력으로 검증한다"; LANDING-067의 PR-7 행 "UI 플러그인 넷의 타입과 등록 키 대응"; LANDING-181–184(union·수 입력 이주 행); `plan/07-switch/verification.md`(플러그인 빌드 게이트); `plan/07-switch/request.md:29`.

### 68C-08 ERROR-117의 선택 인자 모양을 정한다 — 클래스 `ErrorBoundary`에 선택 속성 `onError?: (error: unknown, info: { componentStack?: string }) => void`를 더해 공개하고, `withErrorBoundary`·`withErrorBoundaryForwardRef`에 셋째 선택 인자 `useReporter?: () => ((error, info) => void) | undefined`를 더하며, 감싸개는 렌더 때 그 훅으로 보고기를 읽어 속성으로 넘긴다; 둘 다 주지 않으면 오늘 동작, 판은 `minor`

- 닫는 항목: ERROR-117(보충), TEST-055(보충)
- 결정:
  - 【추론】 ERROR-117은 "인자의 모양(ErrorBoundary 보고 콜백 속성과 그 공개, 또는 감싸개의 보고기 읽기 인자)은 PR-7에서 고른다"고 두 후보를 함께 적었고, 07은 둘을 겹쳐 골랐다: 루트 바운더리는 (가) 속성을 직접 쓰고, 감싸는 자리가 모듈 수준·`FormProvider`·폼마다로 갈리는 필드 바운더리는 감싸기를 그대로 두고 (나) 셋째 인자로 "문맥에서 보고기를 읽는 훅"을 넘겨 렌더 때 읽는다. 이것은 17라운드 스웜 수렴의 요구(감싸기 자리를 옮기지 않고 렌더 때 문맥에서 보고기를 읽음, R17G-9)와 소유자 허용의 범위(더하기만 하는 변경, 주지 않으면 오늘 동작, `minor`)를 모두 지키므로 그대로 확정한다. 조건 셋: `@winglet/react-utils`의 그 모듈 `DETAIL.md`를 코드보다 먼저 갱신한다(ERROR-117의 출처 행), 보고기는 전달 중 표지·`WeakSet`·경고 집합을 드는 인스턴스 보고기이고 바운더리는 그것을 부르기만 한다(ERROR-110–116의 역할 분담 그대로), `info`는 React가 주는 `componentStack`만 노출하고 다른 필드는 더하지 않는다. 훅 인자의 이름 `useReporter`는 React 훅 규칙(렌더 때 조건 없이 호출)을 따라야 하므로 감싸개는 인자가 없을 때도 호출 수를 바꾸지 않도록 기본 훅(항상 `undefined`를 돌려줌)을 쓴다.
- 근거: ERROR-117 "인자의 모양(ErrorBoundary 보고 콜백 속성과 그 공개, 또는 감싸개의 보고기 읽기 인자)은 PR-7에서 고른다"; `reviews/raw-round17-onerror.md:56`(바운더리 경로, R17G-9); 소유자 답 `reviews/round-17-owner-answers.md:34` (나)(확장 허용); TEST-055 "ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자, 더하기만 하는 변경"; ERROR-110–116(루트·필드 바운더리와 인스턴스 보고기).

### 68C-09 스파이크 이식의 대상 목록은 없다 — 07이 `architecture/spikes/**`의 사례마다 "제품 동작에 남는가"를 판정한 표를 `log.md`에 적고 남는 것만 e2e로 옮기며, EVENT-070이 요구한 이펙트 되먹임 사례는 목록과 무관하게 반드시 더하고 React 18·19에서 돌린다

- 닫는 항목: LANDING-095(보충), EVENT-070(보충)
- 결정:
  - 【추론】 LANDING-095의 "`architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(§5.3)"은 기준만 적었고 목록은 없다. 07은 스파이크의 시험 파일(오늘 `spikes/events/caret`·`entry`, `spikes/work-loop/redteam4-events/current`·`react`)을 사례 단위로 나눠 사례마다 (가) 제품 동작으로 남아 e2e 또는 렌더 시험으로 옮김(새 시험 이름), (나) 설계 탐색이라 옮기지 않음(까닭)을 적은 표를 `plan/07-switch/log.md`에 두고, 옮긴 시험은 새 자리에서 돌며 스파이크 파일은 지우지 않는다(스파이크는 설계 기록이다). 여기에 더해 EVENT-070·REACT-017(18C-85)이 PR-7에 둔 사례 — `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드 — 는 `spikes/events/`에 더하고 React 18과 19에서 각각 실행하며, 통과(두 이펙트 모두에서 React가 순환을 끊음)이면 규칙을 그대로 두고 실패하면 EVENT-070대로 소유자에게 올린다(편집자가 정하지 않는다).
- 근거: LANDING-095의 PR-7 행 "`architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(§5.3)"; EVENT-070 "PR: PR-7(React 18 실행 시험을 두는 PR, REACT-017)", "무엇: 이벤트 스파이크(`spikes/events/`)에 이펙트 되먹임 사례를 더한다", "실패: 이것은 core 예산의 단위를 바꾸는 일이라 편집자가 정하지 않는다"; REACT-017 보충(18C-85).

### 68C-10 React 18 실행 시험의 방법은 원장이 정하지 않았으므로 07의 안을 받는다 — `react@18`·`react-dom@18`을 npm 별칭 개발 의존으로 더하고, `render` 프로젝트를 복제한 `react18` 프로젝트에서 `resolve.alias`로 바꿔 끼워 같은 렌더 시험과 EVENT-070 사례를 돌린다; 두 판에서 같은 시험 집합이 도는 것이 조건이다

- 닫는 항목: REACT-017(보충), EVENT-070(보충)
- 결정:
  - 【추론】 REACT-017은 "PR-7에 React 18 실행 시험을 둔다"만 정했고 방법은 열어 두었다. 07의 안(별칭 개발 의존 `react18`·`react-dom18`, vitest `render` 프로젝트의 복제본에서 `resolve.alias`로 React 18을 끼움)은 같은 시험 파일을 두 판에서 돌리므로 "React 18을 계속 지원한다"의 증거로 충분하고, 동료 의존 `>=18 <20`의 두 끝을 모두 실행하는 셈이다. 조건: `react18` 프로젝트는 `render` 프로젝트와 같은 포함 글롭을 쓰고(React 19 전용 API를 쓰는 시험이 있으면 그 파일만 제외 목록에 이름을 적고 까닭을 단다), EVENT-070의 이펙트 되먹임 사례와 StrictMode·서버(`renderToString`) 사례(ERROR-115·116의 실행 확인)도 두 판에서 돈다. 지속 통합에 두 프로젝트를 모두 넣는다. 별칭 의존이 `yarn.lock`을 바꾸는 것은 68C-05의 범위다.
- 근거: REACT-017 "PR-7에 React 18 실행 시험을 둔다", 보충 "동료 의존은 `>=18 <20`인데 오늘 설치는 19뿐"; EVENT-070(React 18·19 실행); `reviews/raw-round17-onerror.md:55`(StrictMode의 실행 확인은 PR-7의 React 18 시험); 저장소의 npm 별칭 관례(TEST-026의 `@canard/schema-form_0.9.0` 등).
