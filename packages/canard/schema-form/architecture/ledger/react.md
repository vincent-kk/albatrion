# 단일 원장 — React 바인딩

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 이 영역의 정본은 `08-design-a-to-z.md` §12(렌더 계층 문단)와 `09-landing-and-test-strategy.md` §2.3(React 바인딩 계약 다섯)이다. 같은 규칙을 채택된 ADR이 적었으면 그 ADR의 영역 항목이 정본이다. 바운더리와 `onError`의 전달은 ADR 0014(ERROR), 통지·배치·명령 어휘·Refresh는 ADR 0007·0008(EVENT·SETTLE·WRITE), 터미널 전략과 동작 행은 ADR 0011·09 §3(NODE)이 정본이므로 이 원장은 그 문장들을 항목으로 두지 않고 분류에서 그 번호를 가리킨다. 18라운드 소유자 답 S1 셋째(`reviews/round-18-owner-answers.md:9`)가 정한 틀린 형의 표현의 위임은 이 영역의 정본으로 그 파일을 인용하고, 입력 구성 요소의 계약의 구체 값은 18라운드 편집자 결정(`reviews/round-18-closing.md` 18C-40 (2), REACT-027)이 정했다. Hint·입력 props의 `type`·`schemaType`과 시험 객체는 18라운드 소유자 답(`reviews/round-18-owner-answers.md:36`, REACT-032)이, 기본 union 입력과 시험 객체의 모르는 키는 18라운드 편집자 결정(`reviews/round-18-closing.md` 18C-92, REACT-033)이 정했다. 정합 상태(경고등)의 정본은 WRITE-054다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드로 바뀐 규칙(옛 문장을 원문 그대로 남긴다)이다. 한 줄을 여러 항목으로 나눈 경우 출처는 `path:line#n`(그 줄의 n번째 문장) 또는 `path:line#a-b`(그 줄의 a번째부터 b번째 문장)로 적는다. 09 §2.6의 다섯째(입력의 초기화)·여섯째(늦은 쓰기의 차단)·열하나째(더 강한 연산)는 바인딩 계층의 일이라 이 원장이 든다(REACT-019–REACT-025).

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| REACT-001 | core는 React를 모른다 — 스키마의 컴포넌트 자리는 core에서 불투명한 값 | 중복(→ GOAL-016) | 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:106` C3 채택) |
| REACT-002 | core의 React 런타임 의존 둘을 떼는 길 — 터미널 추론은 렌더 계층의 판정 함수로, `app/plugin` import 분리는 PR-4 전 설계 항목 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1; 판정을 렌더 계층으로), 편집자 결정(17라운드 게이트 B의 사실 정정, `01-current-structure.md:85`) |
| REACT-003 | 렌더 계층이 터미널 판정 함수와 병합의 원자 판정 함수를 청사진에 넘긴다 — core만 쓰는 호스트에는 없다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`) |
| REACT-004 | 루트는 마운트 때 받은 두 판정 함수를 들고 reset의 재생성도 같은 함수로 청사진을 돈다 | 현행 | 원리(`06-conclusions.md:100` G4를 좁힘, GOAL-008), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71`), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:399`) |
| REACT-005 | 입력 계약 — 입력 컴포넌트의 `onChange(undefined)`는 그 키를 없음으로 만든다 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:15` C-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17) |
| REACT-006 | 오늘의 훅(`useSchemaNodeTracker`·`useSchemaNodeSubscribe`)은 새 통지 모델에 그대로 맞는다 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:46`) |
| REACT-007 | 바인딩 계약 첫째 — 마운트 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤로 | 현행 | 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함), 17라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:48`) |
| REACT-008 | StrictMode의 이중 호출은 가드를 두 번 컴파일하지 않는다(가드 캐시는 VALIDATE-018) | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:48`), 17라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:48`) |
| REACT-009 | 바인딩 계약 둘째 — "사용자 입력에서 왔다"는 표식은 렌더 계층이 내부 통로로 넘긴다 | 현행 | 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함) |
| REACT-010 | 입력 출처 표식은 `handleChange`의 진입 전체에 붙고 재생성 reset 뒤의 늦은 입력 쓰기를 가른다 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71`) |
| REACT-011 | 바인딩 계약 셋째 — `handleChange`는 `batch` 하나로 묶은 진입 하나 | 현행 | 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함) |
| REACT-012 | 바인딩 계약 다섯째 — 유효 스키마를 따라간다(통지 표면은 EVENT-064) | 현행 | 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함) |
| REACT-013 | 문서화할 것 둘 — 렌더 중 쓰기의 React 경고, `startTransition` 안 쓰기의 동기 차선 강등 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:54`) |
| REACT-014 | 틀린 형의 표현은 입력 구성 요소(`FormTypeInput`) 구현에 위임된다 — 계약의 구체 값은 REACT-027 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째) |
| REACT-015 | 정합 상태(경고등) — error와 별개로 현재 값의 건전성을 판단하는 상태(값 규칙은 WRITE-054, 이름·모양은 SURFACE-052) | 중복(→ WRITE-054) | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째) |
| REACT-016 | 대체됨: 16라운드 바인딩 계약의 첫 명세 — 마운트 동안 `onError`도 억제, ErrorBoundary에 다시 던지기 판정 인자 | 대체됨(→ REACT-007, REACT-009, REACT-011, REACT-012, ERROR-088, ERROR-115) | 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함) |
| REACT-017 | React 18을 계속 지원한다 — PR-7에 React 18 실행 시험 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:11` 확인 5), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-85) |
| REACT-018 | 입력 구성 요소의 계약의 구체 값 — 치다 만 글자, 빈 칸과 비우기의 값, 기본 수·불리언 입력 고침(S1 후속 세부 (2)) | 대체됨(→ REACT-027) | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40) |
| REACT-019 | 입력의 초기화 — core는 로드된 노드 모두에 Refresh를 내고 바인딩 계층이 입력마다 가른다(자식 프록시를 마운트한 컨테이너는 다시 마운트하지 않음, 명령 표는 EVENT-039) | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| REACT-020 | 제안의 '`options.terminal: true`로 두라'는 안내는 없앤다 | 현행(부정 결정) | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| REACT-021 | 남는 것 — 자식을 그리면서 값에서 온 내부 상태를 따로 드는 컨테이너 입력은 그 상태가 남는다(구독, `remount`·`<Form key>`로 문서화) | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| REACT-022 | 입력 판정(자식 프록시의 마운트 여부)의 구현 확인 — PR-7에서 구현할 수 없으면 소유자에게 올린다 | 대체됨(→ REACT-028) | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:111`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-62) |
| REACT-023 | 다시 마운트된 입력은 포커스를 잃는다 — 복원하지 않고 문서화 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| REACT-024 | 늦은 쓰기의 차단 — 노드의 Refresh 번호로 대체된 입력의 늦은 `onChange`·`onFileAttach`를 버리고, 상호작용 초기화 번호로 미룬 `touched`를 버린다 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| REACT-025 | 더 강한 연산은 새 이름 없이 둘 — `<Form key>`의 전체 재생성과 노드 명령 `remount`(핸들 표면은 EVENT-063), 문서는 reset을 값 초기화의 기본으로 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| REACT-026 | 잔여 키의 표시 규칙과 기본 문구, `formatError`의 `false schema` 번역, 잔여 키 UI의 기본 제공 — 렌더 계층의 일 | 현행 | 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:34`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-77) |
| REACT-027 | 입력 구성 요소의 계약 — 초안은 입력이 들고, 빈 칸·비우기의 값, 무효 표시, 기본 수 입력과 체크박스, PR-7 브라우저 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| REACT-028 | 자식 프록시의 마운트 여부로 입력을 판정한다 — 게이트 PR-7(reset 시험, StrictMode, 가상화) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-62) |
| REACT-029 | 바인딩은 조합 중에 입력의 DOM `value`를 프로그램으로 쓰지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-63) |
| REACT-030 | 저장소의 플러그인 입력은 동기 `UpdateValue`나 Promise 배열 API에 기대지 않는다 — T-1·T-7이 깨지 않음, 사용자 구현 입력은 확인 범위 밖, 배열 연산의 Promise 없음은 이주 안내에 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-75) |
| REACT-031 | 잔여 키 오류의 표시 — 전용 UI 없이 호스트의 오류 렌더러에, `not.required`를 자식으로 옮기지 않음, 기본 문구는 오늘의 `formatError`, `false schema` 번역은 작성자 몫 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-77) |
| REACT-032 | Hint와 입력 props의 `type`·`schemaType`·`nullable` — `type`은 `node.type`, `schemaType`은 `node.schemaType`, 같은 이름은 같은 값, 시험 객체의 키 일곱과 형, union은 `{type:'union'}`이나 함수 시험, 플러그인 시험의 고침 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:36` union O6), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| REACT-033 | 입력 바인딩 — 기본 union 입력(`{type:'union'}` 감싸개, 유효 목록 기준의 초안·표시·비우기), 시험 객체의 모르는 키는 대조에서 빼고 (가칭) `FORM_TYPE_TEST_INVALID`, 우선순위 그대로, 플러그인 계약 문구, PR-7 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |

## 항목

### REACT-001 core는 React를 모른다 — 스키마의 컴포넌트 자리는 core에서 불투명한 값

- 결정:
  > **core는 React를 모른다**(C3, 목표).
  > 스키마의 컴포넌트 자리는 core에서 불투명한 값이다.
- 보충:
  > "core는 React를 모른다(런타임도 타입도)." (`reviews/round-2.md:114`)
  > 소유자: "react 메인으로 쓰다 보니 react 관련 타입이 많이 붙었는데, 걷어낼 수 있으면 좋겠다." (`00-goals.md:106`)
- 상태: 중복(→ GOAL-016)
- 출처: `08-design-a-to-z.md:398#1-2`(정본), `00-goals.md:106`, `00-goals.md:113`, `02-target-overview.md:179`, `reviews/round-2.md:114`
- 닫은 사람: 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:106` C3 채택)
- 라운드: 2
- 까닭: `00-goals.md:106`

### REACT-002 core의 React 런타임 의존 둘을 떼는 길 — 터미널 추론은 렌더 계층의 판정 함수로, `app/plugin` import 분리는 PR-4 전 설계 항목

- 결정:
  > 앞의 것은 렌더 계층의 판정 함수로 옮기고(아래 터미널 전략), 뒤의 import 분리는 PR-4 전 설계 항목이다(§15, 17라운드 게이트 B의 사실 정정).
- 보충:
  > "의존 역전(`record/`가 칸 타입을 인터페이스로 선언)으로 끊을지, 검증기 칸의 타입을 오늘 `app/plugin`에서 떼는 import 분리와 함께 정할지" (`reviews/round-18-agenda.md:75`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:398#4`(정본), `01-current-structure.md:85`, `adr/0011-branch-node-composition.md:59`, `reviews/round-18-agenda.md:75`, `reviews/round-18-agenda.md:108`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1; 판정을 렌더 계층으로), 편집자 결정(17라운드 게이트 B의 사실 정정, `01-current-structure.md:85`)
- 라운드: 17
- 까닭: `01-current-structure.md:85`

### REACT-003 렌더 계층이 터미널 판정 함수와 병합의 원자 판정 함수를 청사진에 넘긴다 — core만 쓰는 호스트에는 없다

- 결정:
  > 선언 사이 규칙은 §9. 판정 함수는 렌더 계층(React 바인딩)이 병합의 원자 판정 함수(React 요소와 ref 모양, §9)와 함께 청사진에 인자로 넘기며, core만 쓰는 호스트에는 이 암묵 규칙도 원자도 없다.
- 보충:
  > "React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다." (`08-design-a-to-z.md:327`)
  > "원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(P5)." (`08-design-a-to-z.md:327`)
  > "렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자" (`08-design-a-to-z.md:571`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:399#4`(정본), `08-design-a-to-z.md:327`, `08-design-a-to-z.md:571`, `adr/0011-branch-node-composition.md:59`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:327`)
- 라운드: 17
- 까닭: `adr/0011-branch-node-composition.md:59`

### REACT-004 루트는 마운트 때 받은 두 판정 함수를 들고 reset의 재생성도 같은 함수로 청사진을 돈다

- 결정:
  > 루트는 마운트 때 받은 두 판정 함수를 들고, reset 호출 안의 재생성(09 §2.6의 일곱째)은 같은 함수들로 청사진을 다시 돈다(마운트와 reset이 같은 형상, G4).
- 보충:
  > "reset 호출 안에서 동기로 만들고(트리 생성은 core의 연산이다, C3)" (`09-landing-and-test-strategy.md:87`)
  > "React 연결은 외부 저장소(`useSyncExternalStore`)로 알려 막는 차선으로 곧바로 커밋한다(`startTransition` 안에서도 옛 화면이 입력을 받는 틈을 두지 않는다)." (`09-landing-and-test-strategy.md:87`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:399#8`(정본), `09-landing-and-test-strategy.md:87`
- 닫은 사람: 원리(`06-conclusions.md:100` G4를 좁힘, GOAL-008), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71`), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:399`)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:87`

### REACT-005 입력 계약 — 입력 컴포넌트의 `onChange(undefined)`는 그 키를 없음으로 만든다

- 결정:
  > **입력 계약.**
  > 입력 컴포넌트의 `onChange(undefined)`는 그 키를 없음으로 만든다.
- 보충:
  > 편집자 결정(18C-17): "【추론】 셋째, 입력 구성 요소는 옵션 없이 `onChange(undefined)`를 부른다." (`reviews/round-18-closing.md:530`)
  > 편집자 결정(18C-17): "【추론】 이는 입력 쓰기이므로(18C-16 (다)) 채움 없이 값을 뺀다." (`reviews/round-18-closing.md:531`)
  > 편집자 결정(18C-17): "【추론】 소유자 C-11(REACT-005)을 지킨다." (`reviews/round-18-closing.md:532`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:401#1-2`(정본), `02-target-overview.md:179`, `reviews/round-10-owner-answers.md:15`, `reviews/round-18-closing.md:530-532`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:15` C-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17)
- 라운드: 18
- 까닭: `reviews/round-10-owner-answers.md:15`, `reviews/round-18-closing.md:542-548`

### REACT-006 오늘의 훅(`useSchemaNodeTracker`·`useSchemaNodeSubscribe`)은 새 통지 모델에 그대로 맞는다

- 결정:
  > 오늘의 훅(`useSchemaNodeTracker`의 `useSyncExternalStore` + revision, `useSchemaNodeSubscribe`의 구독 뒤 따라잡기)은 새 통지 모델에 그대로 맞는다.
- 보충:
  > "`useSyncExternalStore` 스냅숏으로 쓰는 현재 방식(`hooks/useSchemaNodeTracker.ts:36-49`)은 유지한다." (`adr/0008-event-system.md:31`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:46#1`(정본), `adr/0008-event-system.md:31`, `01-current-structure.md:88`, `02-target-overview.md:179`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:46`)
- 라운드: 16
- 까닭: `reviews/raw-round16-landing-review.md:21`

### REACT-007 바인딩 계약 첫째 — 마운트 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤로

- 결정:
  > **마운트 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤로 미룬다.**
  > 트리는 렌더 중 `useMemo`에서 만들어지고 로드 정착이 그 안에서 동기로 돈다.
  > 구독자가 없으니 통지는 무해하다.
- 보충:
  > "`onChange`·`onDiagnosticsChange`는 준비 전의 호출을 버린다(마운트 뒤의 `diagnostics`는 핸들로 읽는다)." (`09-landing-and-test-strategy.md:48`)
  > "`onChange`·`onDiagnosticsChange`는 마운트 동안의 호출을 오늘처럼 버린다." (`08-design-a-to-z.md:367`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:48#1-3`(정본), `08-design-a-to-z.md:367`, `adr/0014-error-policy.md:122-132`, `reviews/round-16-owner-review.md:33`
- 닫은 사람: 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함), 17라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:48`)
- 라운드: 17
- 까닭: `reviews/raw-round16-landing-review.md:49`

### REACT-008 StrictMode의 이중 호출은 가드를 두 번 컴파일하지 않는다(가드 캐시는 VALIDATE-018)

- 결정:
  > StrictMode의 이중 호출은 가드 캐시가 작성 루트 객체를 키로 하므로 컴파일을 두 번 하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:48#18`(정본), `reviews/raw-round16-landing-review.md:22`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:48`), 17라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:48`)
- 라운드: 17
- 까닭: `reviews/raw-round16-landing-review.md:22`

### REACT-009 바인딩 계약 둘째 — "사용자 입력에서 왔다"는 표식은 렌더 계층이 내부 통로로 넘긴다

- 결정:
  > **입력 출처 표식.**
  > 공개 `SetValueOption`은 비트 넷뿐이라 Refresh 판정에 필요한 "사용자 입력에서 왔다"는 표식은 렌더 계층이 내부 통로로 넘긴다.
- 보충:
  > "내부 통로(입력 마침 신호 `finishInput`, 입력 출처 표식이 붙은 쓰기)는 클래스 멤버가 아니며 `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보낸다." (`09-landing-and-test-strategy.md:109`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:49#1-2`(정본), `09-landing-and-test-strategy.md:109`, `reviews/round-16-owner-review.md:33`
- 닫은 사람: 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함)
- 라운드: 16
- 까닭: `reviews/raw-round16-landing-review.md:21`

### REACT-010 입력 출처 표식은 `handleChange`의 진입 전체에 붙고 재생성 reset 뒤의 늦은 입력 쓰기를 가른다

- 결정:
  > 같은 표식은 `handleChange`의 진입 전체에 붙고, 재생성 reset으로 폐기된 노드가 늦은 입력 쓰기를 호출자 오류와 가르는 데에도 쓴다(§2.6의 일곱째).
- 보충:
  > "여섯째의 검사를 받지 않는 컨테이너 입력의 늦은 `onChange`는 `handleChange`의 진입 하나(§2.3의 셋째)로 오고 그 진입 전체(값 쓰기, 외부 오류 지움, `dirty` 표시)가 입력 출처 표식(§2.3의 둘째)을 달고 오므로, 폐기된 노드는 셋을 모두 조용히 버린다." (`09-landing-and-test-strategy.md:87`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:49#3`(정본), `09-landing-and-test-strategy.md:87`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:87`

### REACT-011 바인딩 계약 셋째 — `handleChange`는 `batch` 하나로 묶은 진입 하나

- 결정:
  > **`handleChange`는 진입 하나.** 오늘은 값 쓰기·외부 오류 지움·dirty 표시가 진입 셋이라 사슬 끝 throw에서 dirty가 빠진다. `batch` 하나로 묶는다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:50`(정본), `reviews/round-16-owner-review.md:33`
- 닫은 사람: 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함)
- 라운드: 16
- 까닭: `reviews/raw-round16-landing-review.md:21`

### REACT-012 바인딩 계약 다섯째 — 유효 스키마를 따라간다(통지 표면은 EVENT-064)

- 결정:
  > **유효 스키마를 따라간다.** `useFormTypeInput`의 메모 의존에 노드의 유효 스키마 참조를 더하고, `SchemaNodeProxy`는 유효 스키마 변경 비트를 구독한다(08 §14의 35행).
- 보충:
  > "활성 조각 집합마다 메모해 같은 집합이면 같은 참조를 돌려주고, 재계산 목록에 든 노드만 다시 셈하며, 바뀌면 통지의 배달 집합에 든다." (`reviews/round-16-owner-review.md:31`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:52`(정본), `reviews/round-16-owner-review.md:31,33`
- 닫은 사람: 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함)
- 라운드: 16
- 까닭: `reviews/round-16-owner-review.md:31`

### REACT-013 문서화할 것 둘 — 렌더 중 쓰기의 React 경고, `startTransition` 안 쓰기의 동기 차선 강등

- 결정:
  > 문서화할 것 둘: 모든 통지가 동기이므로 렌더 중 사용자 코드의 쓰기는 React의 "렌더 중 갱신" 경고를 받는다. `startTransition` 안의 쓰기는 동기 차선으로 강등된다.
- 보충:
  > "호출자가 렌더 중에 연 사슬(core가 감지하지 않는 사용자 코드의 쓰기, P5)은 호출자의 오용이므로 그 안의 전달 시점은 보증하지 않는다" (`adr/0014-error-policy.md:133`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:54`(정본), `adr/0014-error-policy.md:133`, `reviews/raw-round16-landing-review.md:22`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:54`)
- 라운드: 16
- 까닭: `reviews/raw-round16-landing-review.md:22`

### REACT-014 틀린 형의 표현은 입력 구성 요소(`FormTypeInput`) 구현에 위임된다 — 계약의 구체 값은 REACT-027

- 결정:
  > 참고로 plugin 은 그냥 샘플이고, 보통 용법은 사용자가 formTypeInput 을 구현해서 붙이는거긴 해. 만들기도 적용하기도 비교적 쉬우니까. 그럼 결국 올바르지 않은 타입의 표현은 FormTypeInput 구현에 위임되는거구나.
  > 나 로 확정합니다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### REACT-015 정합 상태(경고등) — error와 별개로 현재 값의 건전성을 판단하는 상태(값 규칙은 WRITE-054, 이름·모양은 SURFACE-052)

- 결정:
  > 그럼 이건 어때? Node 가 자신 타입에 맞는 값을 제공한다는걸 보장하진 못하지만, 현재 Node 의 값이 "정합한지" 여부는 상태로 둘 수 있을거같아. error 와 별개로, 이 상태를 보고 현재 값의 건전성을 판단하도록 하는건 어떤가?
  > 나 로 확정합니다. 경고등 추가도 승인합니다.
- 보충:
  > "노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7)." (`reviews/round-18-owner-answers.md:9`)
  > "(1) 정합 상태(경고등)의 이름과 공개 형 판별자의 모양, 루트에서 트리 전체의 불일치를 한 번에 읽는 자리(§7과 함께)." (`reviews/round-18-agenda.md:80`)
- 상태: 중복(→ WRITE-054)
- 출처: `reviews/round-18-owner-answers.md:9`(정본), `reviews/round-18-agenda.md:80`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### REACT-016 대체됨: 16라운드 바인딩 계약의 첫 명세 — 마운트 동안 `onError`도 억제, ErrorBoundary에 다시 던지기 판정 인자

- 결정:
  > 첫째 마운트 정착 동안 `onChange`·`onDiagnosticsChange`·`onError` 억제, 둘째 입력 출처 표식은 내부 통로로, 셋째 `handleChange`는 `batch` 하나, 넷째 ErrorBoundary에 다시 던지기 판정 인자, 다섯째 유효 스키마를 따라간다(`useFormTypeInput`의 메모 의존, `SchemaNodeProxy`의 변경 비트).
- 보충:
  > "첫째와 넷째는 ADR 0014 미결의 확정에 기댄다." (`reviews/round-16-owner-review.md:33`)
- 상태: 대체됨(→ REACT-007, REACT-009, REACT-011, REACT-012, ERROR-088, ERROR-115)
- 출처: `reviews/round-16-owner-review.md:33#2`(정본), `reviews/raw-round16-landing-review.md:49`
- 닫은 사람: 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함)
- 라운드: 16
- 까닭: `reviews/round-17-owner-answers.md:15`, `09-landing-and-test-strategy.md:48`

### REACT-017 React 18을 계속 지원한다 — PR-7에 React 18 실행 시험

- 결정:
  > **React 18 — 확정(답 5).** PR-7에 React 18 실행 시험을 둔다.
- 보충:
  > "**React 18을 계속 지원한다.** 예라면 PR-7에 React 18 실행 시험을 둔다(동료 의존은 `>=18 <20`인데 오늘 설치는 19뿐)." (`reviews/round-16-owner-review.md:56`)
  > 편집자 결정(18C-85): "PR: PR-7(React 18 실행 시험을 두는 PR, REACT-017)." (`reviews/round-18-closing.md:2244`)
  > 편집자 결정(18C-85): "무엇: 이벤트 스파이크(`spikes/events/`)에 이펙트 되먹임 사례를 더한다." (`reviews/round-18-closing.md:2245`)
  > 편집자 결정(18C-85): "무엇: `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드를 만들고, React 18과 19에서 각각 실행한다." (`reviews/round-18-closing.md:2246`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:273`(정본), `09-landing-and-test-strategy.md:26`, `reviews/round-16-owner-review.md:56`, `reviews/round-16-owner-answers.md:11`, `reviews/round-18-closing.md:2244-2246`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:11` 확인 5), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-85)
- 라운드: 18
- 까닭: `reviews/round-16-owner-review.md:56`, `reviews/round-18-closing.md:2241-2242`

### REACT-018 입력 구성 요소의 계약의 구체 값 — 치다 만 글자, 빈 칸과 비우기의 값, 기본 수·불리언 입력 고침(S1 후속 세부 (2))

- 결정:
  > (2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다.
  > 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다.
- 보충:
  > "입력 구성 요소는 치다 만 글자를 스스로 들고 있어야 하며, 형이 아닌 값을 유효한 상태처럼 그리지 않습니다." (`reviews/raw-round18-s1-unconvertible-review.md:48`)
  > "초안은 입력이 들어야 합니다. 이 계약은 선택이 아니라 필수입니다." (`reviews/raw-round18-s1-unconvertible-review.md:171`)
- 상태: 대체됨(→ REACT-027)
- 출처: `reviews/round-18-agenda.md:80`(정본), `reviews/raw-round18-s1-unconvertible-review.md:48,117-119,130,171`, `reviews/round-18-closing.md:1084-1132,1143-1147`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40)
- 라운드: 18
- 까닭: `reviews/raw-round18-s1-unconvertible-review.md:171`, `reviews/round-18-closing.md:1134-1141`

### REACT-019 입력의 초기화 — core는 로드된 노드 모두에 Refresh를 내고 바인딩 계층이 입력마다 가른다(자식 프록시를 마운트한 컨테이너는 다시 마운트하지 않음, 명령 표는 EVENT-039)

- 결정:
  > **입력의 초기화.**
  > core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다.
  > core는 React를 모른다, C3).
  > 바인딩 계층이 입력마다 가른다.
  > 자식 노드 프록시(래퍼가 만든 `ChildNodeComponents`로 그린 `SchemaNodeProxy`, 가상화의 `DeferrableNodeProxy` 자리 포함)를 하나라도 마운트한 입력은 컨테이너로 보아 다시 마운트하지 않는다(그 자식들이 저마다 Refresh를 받는다).
  > 자식 프록시를 마운트하지 않은 입력(리프, 터미널, `presentation.FormTypeInput`을 가진 가상 노드, 그리고 `formTypeInputMap`·정의 목록으로 준 브랜치 입력 가운데 값 전체를 스스로 그리는 것, 예: 객체용 비제어 JSON 편집기)은 입력 컴포넌트만 다시 마운트한다.
  > 그래서 비제어 DOM과 사용자 `FormTypeInput`의 내부 상태가 입력 단위로 초기화되고, 자식을 그리고 있는 기본 객체·배열 입력과 렌더러·`children`·`<form>`은 다시 마운트되지 않는다(오늘은 provider 아래 전부).
  > Refresh의 범위는 ADR 0008 §7의 '그 노드의 입력 하나'와 같다(컨테이너를 다시 마운트하면 서브트리 리마운트, 곧 Remount가 된다).
  > 컨테이너 하나에 명시로 보낸 `refresh`는 아무것도 다시 마운트하지 않는다(ADR 0008 §7).
  > 값이 바뀌었거나 손댄 입력으로 좁히지 않는 것은 안정성 때문이다(디바운스, 값 없이 바뀐 내부 상태, 흐림 뒤 한 프레임 안의 reset).
- 보충:
  > "로드(`reset`, `setValue(V)`)가 낸 Refresh는 core가 로드된 노드 모두에 내므로 그 자식들이 저마다 받고(로드는 값이 같아도 원본을 새로 쓰므로 ADR 0007 §3의 '그 밖의 쓰기가 원본을 바꾸면 낸다'에 든다)" (`adr/0008-event-system.md:150`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:85#1-10`(정본), `adr/0008-event-system.md:150`, `09-landing-and-test-strategy.md:94`, `09-landing-and-test-strategy.md:271`, `08-design-a-to-z.md:468,471`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:85`
- 충돌:
  > `adr/0008-event-system.md:150`의 "로드(`reset`, `setValue(V)`)"는 소유자 답과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### REACT-020 제안의 '`options.terminal: true`로 두라'는 안내는 없앤다

- 결정:
  > 제안의 '`options.terminal: true`로 두라'는 안내는 없앤다(구조 선언으로 UI 수명을 푸는 두 번째 장치다, G4).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `09-landing-and-test-strategy.md:85#11`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:85`

### REACT-021 남는 것 — 자식을 그리면서 값에서 온 내부 상태를 따로 드는 컨테이너 입력은 그 상태가 남는다(구독, `remount`·`<Form key>`로 문서화)

- 결정:
  > 남는 것: 자식을 그리면서 값에서 온 내부 상태를 따로 드는 컨테이너 입력은 그 상태가 남는다(지금 자식을 그리지 않는 입력, 곧 접힌 펼침 영역과 빈 배열은 다시 마운트된다).
  > 그런 컨테이너 입력은 노드 값을 구독해 맞추거나 `remount`·`<Form key>`를 쓴다고 문서화한다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:85#12-13`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:85`

### REACT-022 입력 판정(자식 프록시의 마운트 여부)의 구현 확인 — PR-7에서 구현할 수 없으면 소유자에게 올린다

- 결정:
  > 이 판정(자식 프록시의 마운트 여부)을 PR-7에서 구현할 수 없다고 확인되면 '값 표시 불일치 대 다시 마운트 비용'의 맞바꿈이 남으므로 그때 소유자에게 올린다(08 §15).
- 보충:
  > "입력 판정(자식 프록시의 마운트 여부)의 구현 확인(안 되면 소유자에게 올린다)(09 §2.6) | 7 전" (`08-design-a-to-z.md:497`)
  > "입력 판정(자식 프록시의 마운트 여부)을 PR-7에서 구현할 수 없다고 확인되면 그때 소유자에게 올린다." (`09-landing-and-test-strategy.md:271`)
- 상태: 대체됨(→ REACT-028)
- 출처: `09-landing-and-test-strategy.md:85#14`(정본), `08-design-a-to-z.md:497`, `09-landing-and-test-strategy.md:271`, `reviews/round-18-agenda.md:111`, `reviews/round-18-closing.md:1750-1753,1757-1762`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:111`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-62)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:85`, `reviews/round-18-closing.md:1755-1755`

### REACT-023 다시 마운트된 입력은 포커스를 잃는다 — 복원하지 않고 문서화

- 결정:
  > 포커스: 다시 마운트된 입력은 포커스를 잃고 모바일 가상 키보드가 닫힌다(오늘도 같다).
  > 복원하지 않고 문서화한다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:85#15-16`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:85`

### REACT-024 늦은 쓰기의 차단 — 노드의 Refresh 번호로 대체된 입력의 늦은 `onChange`·`onFileAttach`를 버리고, 상호작용 초기화 번호로 미룬 `touched`를 버린다

- 결정:
  > **늦은 쓰기의 차단.**
  > 다시 마운트로 대체된 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(디바운스 타이머, 언마운트 때의 flush, IME 조합 끝)는 버린다.
  > Refresh 번호는 래퍼의 React 상태(오늘의 `useFormTypeInputControl`의 `useVersion`)가 아니라 노드가 들고, 그 Refresh를 낸 커밋에서 `revision`과 함께 동기로 오른다(ADR 0008 §2의 규칙 3. 배달보다 앞서므로 리스너 안의 로드처럼 다음 파동에 배달되는 Refresh도 배달 전에 번호가 올라 있다).
  > 래퍼는 `SchemaNodeProxy`가 Remount에 쓰는 것처럼 `useSchemaNodeTracker`로 이 번호를 읽어 `FormTypeInput`의 `key`와 `defaultValue` 메모 의존으로 쓰고, 인스턴스가 마운트될 때의 번호를 `onChange`·`onFileAttach`에 묶어 쓰기 시점의 노드 번호와 다르면 버린다.
  > 진입은 동기라 그 사이에 타이머가 끼어들 수 없고, 구독 전에 배달을 놓친 입력도 구독 뒤 따라잡으며, `startTransition` 안의 reset도 막는 차선으로 다시 그린다.
  > 컨테이너 입력(다섯째)은 다시 마운트하지 않으므로 이 검사를 받지 않는다(받으면 그 입력의 쓰기가 영구히 버려진다).
  > 이 규칙은 reset이 아닌 Refresh(호출자의 전체 교체)에도 똑같이 걸린다.
  > 흐림 뒤 한 프레임 미룬 `touched` 설정은 노드의 상호작용 초기화 번호(상태 칸 쓰기로 `dirty`·`touched`를 비울 때 오르는 노드 필드. reset, `clearState`, `controls.resetInteraction`이 올린다)를 흐릴 때 붙잡아 두고, 미룬 콜백에서 그 번호가 바뀌었으면 쓰지 않는다.
  > 그래서 오늘의 `clearState` 경합도 닫히고, 비움이 아닌 Refresh(외부 `setValue`) 뒤의 흐림 `touched`는 그대로 남는다(제안의 'reset이 낸 Refresh에만 딸린다'를 넓혔다, G4).
  > 이것이 없으면 옛 값이 살아 있는 노드에 쓰인다(오늘의 reset과 `key`는 옛 트리를 버려 이 문제가 없다).
- 보충:
  > "옛 트리를 폐기할 때 그 노드들의 Refresh 번호와 상호작용 초기화 번호를 통지 없이 함께 올려, 폐기된 트리의 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(언마운트 때의 flush 포함)와 흐림 뒤 미룬 `touched`가 여섯째의 검사에서 core에 닿기 전에 버려지게 한다." (`09-landing-and-test-strategy.md:87`)
  > "늦은 `onFileAttach`는 노드 쓰기가 아니라 reset을 넘어 남는 Form 층 첨부 파일 맵의 쓰기이므로(오늘의 `SchemaNodeInput.tsx:61-67`), 래퍼가 맵에 쓰기 전에 노드의 폐기 표시를 읽어 폐기된 노드면 버린다(컨테이너 입력 포함)." (`09-landing-and-test-strategy.md:87`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:86`(정본), `09-landing-and-test-strategy.md:87,94,271`, `08-design-a-to-z.md:468,471`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:86`

### REACT-025 더 강한 연산은 새 이름 없이 둘 — `<Form key>`의 전체 재생성과 노드 명령 `remount`(핸들 표면은 EVENT-063), 문서는 reset을 값 초기화의 기본으로

- 결정:
  > **더 강한 연산은 새 이름 없이 둘이다.**
  > `<Form key>`는 전체 재생성(스키마 교체, 에러 바운더리 복구, 가상화 재생)으로 문서화하고, 그것이 버리는 것(핸들 인스턴스, 외부 구독, 노드 참조, `showError` 등 Form 층 상태, 첨부 파일 맵, 가상화 기록, 에러 바운더리의 fallback 상태)을 함께 적는다.
  > 루트 바운더리가 fallback을 그리는 동안은 `ref`가 `null`이라 reset을 부를 수 없으므로 복구는 `key`뿐이다(`reviews/raw-round16-reset.md` §4의 H5, 실행 확인 전).
  > 노드 명령 `remount`는 트리를 둔 채 그 노드의 UI만 다시 마운트한다.
  > 그 핸들 표면(`FormHandle.remount(path)`)은 ADR 0008의 C-11(소유자 확정 대기)에 딸린다(§8의 셋째).
  > 문서는 reset을 값 초기화의 기본으로, `key`를 그보다 강한 연산으로 소개한다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:91`(정본), `09-landing-and-test-strategy.md:271`, `adr/0008-event-system.md:151`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:91`
- 충돌:
  > `09-landing-and-test-strategy.md:91`의 "그 핸들 표면(`FormHandle.remount(path)`)은 ADR 0008의 C-11(소유자 확정 대기)에 딸린다(§8의 셋째)."는 18라운드 결정과 다르다: `FormHandle`에 `refresh(path)`·`remount(path)`를 대칭으로 더하고 PR-7에서 넣는다(EVENT-063). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1185`).

### REACT-026 잔여 키의 표시 규칙과 기본 문구, `formatError`의 `false schema` 번역, 잔여 키 UI의 기본 제공 — 렌더 계층의 일

- 결정:
  > 잔여 키의 표시 규칙과 기본 문구, `formatError`의 `false schema` 번역, 잔여 키 UI를 기본 렌더러가 제공하는지 — 모두 렌더 계층의 일이다(derivations §2).
- 보충:
  > "남는 정책 판단은 없다. 남는 것은 세부다: `not.required` 에러를 호스트에서 자식으로 옮기는 표시 규칙과 기본 문구, `formatError`의 `false schema` 번역, 잔여 키 UI를 기본 렌더러가 제공하는지 — 모두 렌더 계층의 일이다." (`reviews/round-5-derivations.md:34`)
  > 편집자 결정(18C-77): "【추론】 기본 렌더러는 잔여 키 전용 UI를 두지 않는다." (`reviews/round-18-closing.md:2108`)
  > 편집자 결정(18C-77): "【추론】 잔여 키 오류(`rejectedKey`가 있는 오류)는 `dataPath`가 가리키는 호스트의 오류로 오늘처럼 호스트의 오류 렌더러에 그려진다." (`reviews/round-18-closing.md:2109`)
  > 편집자 결정(18C-77): "【추론】 `not.required` 오류를 호스트에서 자식으로 옮기지 않는다." (`reviews/round-18-closing.md:2110`)
  > 편집자 결정(18C-77): "【추론】 기본 문구는 오늘의 기본 `formatError`를 그대로 따른다." (`reviews/round-18-closing.md:2111`)
  > 편집자 결정(18C-77): "【추론】 `presentation.errorMessages[keyword]`가 있으면 그것을, 없으면 검증기의 `message`를 쓴다(`src/helpers/error/formatValidationError/formatValidationError.ts`)." (`reviews/round-18-closing.md:2112`)
  > 편집자 결정(18C-77): "【추론】 `false schema` 번역은 따로 두지 않는다." (`reviews/round-18-closing.md:2113`)
  > 편집자 결정(18C-77): "【추론】 작성자가 `errorMessages`의 `'false schema'` 키나 자기 `formatError`로 번역한다." (`reviews/round-18-closing.md:2114`)
  > 편집자 결정(18C-77): "【추론】 `rejectedKey`는 사용자 정의 렌더러와 `formatError`가 읽을 수 있는 칸으로 남는다." (`reviews/round-18-closing.md:2115`)
- 상태: 현행
- 출처: `adr/0002-guard-fragment-model.md:199`(정본), `reviews/round-5-derivations.md:34`, `reviews/round-18-closing.md:2108-2115`
- 닫은 사람: 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:34`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-77)
- 라운드: 18
- 까닭: `reviews/round-5-derivations.md:34`, `reviews/round-18-closing.md:2117-2118`

### REACT-027 입력 구성 요소의 계약 — 초안은 입력이 들고, 빈 칸·비우기의 값, 무효 표시, 기본 수 입력과 체크박스, PR-7 브라우저 게이트

- 결정:
  > (2) 입력 구성 요소의 계약은 `FormTypeInputProps` 문서 주석과 입력 작성 문서에 적는다.
  > 초안(치다 만 글자, 입력기 조합 중인 글자)은 입력이 스스로 든다.
  > 노드에는 자기 형의 값이나 없음만 보낸다.
  > 빈 칸이면 `undefined`를 보낸다.
  > 비우기 조작은 nullable이면 `null`, 아니면 `undefined`를 보낸다.
  > 해석할 수 없는 초안이 남은 채 포커스를 잃으면 표시를 노드 값으로 되돌린다.
  > 경고등이 켜진 값은 유효한 상태(빈 칸, 켜짐, 체크)처럼 그리지 않는다.
  > 받은 값이나 무효 표지를 보이고, 한 번의 조작으로 비울 수 있게 한다.
  > 기본 수 입력은 빈 칸이면 `undefined`를 보낸다(`valueAsNumber`의 `NaN`을 보내지 않음).
  > 기본 수 입력은 `validity.badInput`이면 쓰지 않고, 흐려지면 되돌린다.
  > 기본 불리언 체크박스는 불리언이 아닌 값이면 미정 상태로 그린다.
  > PR: PR-7(브라우저 시험, storybook 프로젝트) — (2)의 브라우저 사실 둘.
  > 무엇: 실제 브라우저의 `badInput`과 antd `InputNumber`의 흐린 뒤 표시를 잰다.
  > 통과: 규칙대로 동작한다 — 치다 만 글자가 노드에 가지 않고, 흐리면 노드 값이 보인다.
  > 실패: 기본 수 입력을 `type="text"`와 `inputMode="decimal"`, 자체 초안 해석으로 바꾼다.
  > 실패: 계약 문장은 그대로 둔다.
- 보충:
  > 편집자 결정(18C-92): "【추론】 키 입력마다, 그리고 흐려질 때 그 순간의 유효 목록으로 `interpret`하고, 목록의 한 형이 되면 그 결과를 보낸다." (`reviews/round-18-closing.md:2600`)
  > 편집자 결정(18C-92): "【추론】 목록의 한 형이 되지 않으면 보내지 않고 초안으로 들며, 흐려지면 표시를 노드 값으로 되돌린다." (`reviews/round-18-closing.md:2601`)
  > 편집자 결정(18C-92): "【추론】 유효 목록이 바뀌면 지금 초안으로 판정을 다시 돌리고, 이제 목록의 한 형이 될 때만 보낸다." (`reviews/round-18-closing.md:2602`)
  > 편집자 결정(18C-92): "【추론】 `valueTypeMismatch`가 참이면 `aria-invalid`와 무효 표지를 붙이고, 경고등이 켜진 값을 빈 칸처럼 그리지 않는다(SURFACE-052)." (`reviews/round-18-closing.md:2607`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1104-1114,1143-1147`(정본), `reviews/round-18-closing.md:2600-2602,2607`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2620-2625`

### REACT-028 자식 프록시의 마운트 여부로 입력을 판정한다 — 게이트 PR-7(reset 시험, StrictMode, 가상화)

- 결정:
  > 규칙은 REACT-019 그대로다.
  > PR-7이 바인딩 계층에서 입력마다 자식 프록시의 마운트 여부를 알고, Refresh를 가를 때 읽는다.
  > 자식 프록시는 `SchemaNodeProxy`와 가상화의 `DeferrableNodeProxy` 자리다.
  > 후보 구현은 프록시의 마운트·언마운트 효과가 노드별 수를 올리고 내리는 것이며, 방법은 PR-7이 고른다.
  > PR: PR-7.
  > 통과: TEST-020 보충(`09-landing-and-test-strategy.md:96`)의 reset 시험이 초록이다.
  > 그 시험에서 다시 마운트되는 것: 터미널 입력, 값 전체를 그리는 브랜치 입력, 빈 배열·접힌 펼침 입력.
  > 그 시험에서 다시 마운트되지 않는 것: 자식을 그리는 기본 객체·배열 입력.
  > 여기에 StrictMode 이중 마운트와 가상화의 지연 자리 사례를 더한다.
  > 실패(판정을 믿을 수 있게 얻지 못해 위 시험이 설 수 없음): 원문대로 '값 표시 불일치 대 다시 마운트 비용'의 맞바꿈을 소유자에게 올린다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1750-1753,1757-1762`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-62)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1755-1755`

### REACT-029 바인딩은 조합 중에 입력의 DOM `value`를 프로그램으로 쓰지 않는다

- 결정:
  > 【추론】 바인딩은 조합 중에 입력의 DOM `value`를 프로그램으로 쓰지 않는다.
  > 【추론】 이 규칙은 조합 중에 Refresh가 오는 경우와 맞물린다.
  > 【추론】 REACT-019는 그때 입력을 다시 마운트한다.
  > 【추론】 REACT-024는 대체된 입력이 조합 끝에 낸 늦은 `onChange`를 버린다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1769-1772`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-63)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1774-1776`

### REACT-030 저장소의 플러그인 입력은 동기 `UpdateValue`나 Promise 배열 API에 기대지 않는다 — T-1·T-7이 깨지 않음, 사용자 구현 입력은 확인 범위 밖, 배열 연산의 Promise 없음은 이주 안내에

- 결정:
  > 【추론】 기대는 것이 없다.
  > UI 플러그인 넷(antd5·antd6·antd-mobile·mui)과 패키지의 기본 정의(`src/formTypeDefinitions`)를 읽었다.
  > 배열 입력은 모두 `node.push()`·`node.remove(index)`를 반환값을 버린 채 부른다.
  > `await`·`.then`은 한 곳도 없다(예: `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputArray.tsx:29-34`, `src/formTypeDefinitions/FormTypeInputArray.tsx:18,22`).
  > `UpdateValue` 구독, `NodeEventType`, `useSchemaNodeSubscribe`·`useSchemaNodeTracker`를 쓰는 플러그인 입력도 없다.
  > 입력은 `value`/`onChange`로 제어하거나 `defaultValue`로 비제어한다.
  > 이펙트는 Uri 입력의 프로토콜 초기화 하나뿐이며 통지 시점에 기대지 않는다(`FormTypeInputUri.tsx:132`).
  > 【추론】 그러므로 T-7(배열 연산의 동기화, 파괴적 변경)과 T-1(통지는 늘 동기)은 저장소의 플러그인을 깨지 않는다.
  > 【추론】 사용자가 직접 구현한 FormTypeInput은 이 확인 범위 밖이다.
  > 【추론】 배열 연산이 Promise를 돌려주지 않는다는 점은 이주 안내에 남긴다(T-7의 파괴적 변경 행과 같다).
  > 【추론】 안건 11-8의 "T-23" 표기는 T-1·T-7로 읽는다(T-23은 분기 복원).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2068-2078`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-75)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2080-2082`

### REACT-031 잔여 키 오류의 표시 — 전용 UI 없이 호스트의 오류 렌더러에, `not.required`를 자식으로 옮기지 않음, 기본 문구는 오늘의 `formatError`, `false schema` 번역은 작성자 몫

- 결정:
  > 【추론】 기본 렌더러는 잔여 키 전용 UI를 두지 않는다.
  > 【추론】 잔여 키 오류(`rejectedKey`가 있는 오류)는 `dataPath`가 가리키는 호스트의 오류로 오늘처럼 호스트의 오류 렌더러에 그려진다.
  > 【추론】 `not.required` 오류를 호스트에서 자식으로 옮기지 않는다.
  > 【추론】 기본 문구는 오늘의 기본 `formatError`를 그대로 따른다.
  > 【추론】 `presentation.errorMessages[keyword]`가 있으면 그것을, 없으면 검증기의 `message`를 쓴다(`src/helpers/error/formatValidationError/formatValidationError.ts`).
  > 【추론】 `false schema` 번역은 따로 두지 않는다.
  > 【추론】 작성자가 `errorMessages`의 `'false schema'` 키나 자기 `formatError`로 번역한다.
  > 【추론】 `rejectedKey`는 사용자 정의 렌더러와 `formatError`가 읽을 수 있는 칸으로 남는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2108-2115`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-77)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2117-2118`

### REACT-032 Hint와 입력 props의 `type`·`schemaType`·`nullable` — `type`은 `node.type`, `schemaType`은 `node.schemaType`, 같은 이름은 같은 값, 시험 객체의 키 일곱과 형, union은 `{type:'union'}`이나 함수 시험, 플러그인 시험의 고침

- 결정:
  > 가. Hint는 `{ type: node.type, schemaType: node.schemaType, nullable: node.nullable, path, required, jsonSchema, format, formType }`이다.
  > `FormTypeInputProps`의 `type`·`schemaType`·`nullable`은 Hint와 같은 값이고, 여기에 `valueTypeMismatch`가 더해진다.
  > 입력은 종류뿐 아니라 스키마 자신의 형도 알 수 있다.
  > `props.schemaType`은 `'integer'`를 보존한 계산된 허용 형이고, union이면 목록이다.
  > `props.jsonSchema`는 저자의 선언을 담은 유효 스키마이며, `jsonSchema.type`은 켜진 선언의 교집합이다.
  > 노드, Hint, 입력 props에서 같은 이름은 같은 값이며, 오늘의 이름 함정(`hint.type`이 `node.schemaType`인 것)은 이것으로 사라진다.
  > 시험 객체의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`formType`의 일곱이고, 대조 규칙은 오늘과 같다(시험 값이 스칼라면 `===`, 배열이면 "그중 하나").
  > `FormTypeTestObject.type`은 `SchemaNodeType`이나 그 배열이며, `'union'`은 들고 `'integer'`는 없다.
  > `FormTypeTestObject.schemaType`은 `JSONSchemaType`이나 그 배열이며, `'null'`이 들고 배열은 "이 스칼라들 가운데 하나"라는 뜻이다.
  > union 노드의 배열 `schemaType`은 어떤 객체 시험과도 맞지 않으므로, union은 `{type:'union'}`이나 함수 시험으로 잡는다.
  > 플러그인의 `{type:['number','integer']}` 시험은 `{type:'number'}`로 바꾸고, 정수만이면 `{schemaType:'integer'}`로 바꾼다.
  > 함수 시험의 `type === 'integer'` 절은 죽은 조건이므로 지운다(TS2367로 드러남).
  > mui 수 입력의 정수 판정은 `schemaType === 'integer'`로 바꾼다.
- 보충:
  > 소유자(union O6): "네 동의합니다. 하지만, 반드시 jsonSchema 원래 type 도 전달했으면 좋겠습니다. number -> integer 이걸 둘다 알아야 처리 가능한게 있어서요" (`reviews/round-18-owner-answers.md:36`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:36`(정본, 반영 칸), `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:36` union O6), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:36`
- 충돌:
  > `reviews/round-18-owner-answers.md:36`의 "`FormTypeInputProps`의 `type`·`schemaType`·`nullable`은 Hint와 같은 값이고, 여기에 `valueTypeMismatch`가 더해진다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).

### REACT-033 입력 바인딩 — 기본 union 입력(`{type:'union'}` 감싸개, 유효 목록 기준의 초안·표시·비우기), 시험 객체의 모르는 키는 대조에서 빼고 (가칭) `FORM_TYPE_TEST_INVALID`, 우선순위 그대로, 플러그인 계약 문구, PR-7 게이트

- 결정:
  > 【추론】 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다.
  > 【추론】 그래서 `['number','string']`에서 보내는 값은 늘 문자열이고(`"42"`는 이미 멤버), 게이트가 목록을 `['number']`로 좁힌 동안에는 `42`다.
  > 【추론】 NODE-056의 parse를 부르는 쪽에 기본 union 입력(쓰지 않는 호출)을 더하고, "`type`에 적힌 순서로 부른다"는 문장을 지운다(규칙 A는 순서와 무관).
  > 【추론】 규칙 A를 미리 보는 공개 함수는 지금 내보내지 않으며, 입력은 `valueTypeMismatch`로 결과를 보고, 함수를 나중에 더하는 것은 추가 변화다.
  > 【추론】 시험 객체를 정규화할 때 일곱 키 밖의 키는 대조에서 빼고, 정의마다 한 번 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID`를 낸다.
  > 【추론】 `type`에 적힌 `'integer'`도 어떤 노드와도 맞지 않으므로 같은 경고를 낸다.
  > 【추론】 시험 대조의 예는 N1 = `['string','number']`, N2 = `['string','number','null']`, N3 = `['object','string']`, N4 = `['string','null']`, N5 = `['integer','null']`로 아래와 같다.
  > 【추론】 `{type:'string'}`은 N4만 맞는다(종류가 string인 노드).
  > 【추론】 `{type:['string','number']}`는 N4·N5가 맞는다(string 종류 또는 number 종류이며 union이 아님).
  > 【추론】 `{type:'union'}`은 N1·N2·N3이 맞는다(모든 union).
  > 【추론】 `{type:'number'}`는 N5가 맞는다(정수 포함 모든 수 노드).
  > 【추론】 `{schemaType:'integer'}`는 N5가 맞는다(nullable 포함 정수 노드).
  > 【추론】 `{schemaType:['string','number']}`는 N4가 맞는다(`schemaType`이 `'string'`이나 `'number'`인 스칼라 노드).
  > 【추론】 `{type:'object'}`는 아무것도 맞지 않는다(N3은 object 노드가 아님).
  > 【추론】 `({type, schemaType}) => type === 'union' && schemaType.includes('object')`는 N3이 맞으며, 목록으로 가르는 union은 함수 시험으로 잡는다.
  > 【추론】 입력을 고르는 순서는 그대로이고 union 전용 층은 두지 않는다: 인라인 `FormTypeInput` → `formTypeInputMap` → Form의 정의 → Provider의 정의 → `PluginManager` 목록(플러그인 정의가 앞, 코어 기본 정의가 뒤)이다.
  > 【추론】 인라인이 `null`이면 입력을 그리지 않는다.
  > 【추론】 union 항목이 없는 플러그인에서는 union이 코어 기본 정의로 떨어진다.
  > 【추론】 경로 키가 union 칸 아래를 가리키는 `formTypeInputMap` 항목은 노드가 없으므로 맞지 않는다(NODE-020).
  > 【추론】 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 된다(BLUEPRINT-033의 "새 입력을 두지 않으며"에 대한 보충).
  > 【추론】 그 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며 새 구성 요소가 아니고, 자리는 `FormTypeInputStringDefinition` 바로 앞이다.
  > 【추론】 기본 입력은 유효 목록을 `props.schemaType`과 `props.jsonSchema.type`의 교집합으로 구하며, core와 같은 내부 함수를 쓰고 `jsonSchema` 참조로 메모한다.
  > 【추론】 값이 `undefined`·`null`·문자열·수·불리언이고 유효 목록에 원시 형이 하나라도 있으면 글 상자를 보이며, 표시는 `String(value)`이고 `undefined`와 nullable 노드의 `null`은 빈 칸이다.
  > 【추론】 빈 칸은 `undefined`를 보낸다.
  > 【추론】 키 입력마다, 그리고 흐려질 때 그 순간의 유효 목록으로 `interpret`하고, 목록의 한 형이 되면 그 결과를 보낸다.
  > 【추론】 목록의 한 형이 되지 않으면 보내지 않고 초안으로 들며, 흐려지면 표시를 노드 값으로 되돌린다.
  > 【추론】 유효 목록이 바뀌면 지금 초안으로 판정을 다시 돌리고, 이제 목록의 한 형이 될 때만 보낸다.
  > 【추론】 입력기 조합 중에는 보내지 않는다.
  > 【추론】 객체·배열 값의 읽기 전용 표시(`reviews/round-18-owner-answers.md:29`)에서 문자열화 결과는 값 참조로 메모하고, 문자열화가 던지면 무효 표지만 보인다.
  > 【추론】 유효 목록에 원시 형이 없는 union(`['object','array']`, 또는 교집합이 `{null}`인 빈 목록)에 값이 없으면 빈 읽기 전용 상자를 보인다.
  > 【추론】 기본 입력으로는 그 값을 만들 수 없으며, 이는 문서에 적는 한계이고 편집기는 UI 플러그인이 맡는다.
  > 【추론】 `valueTypeMismatch`가 참이면 `aria-invalid`와 무효 표지를 붙이고, 경고등이 켜진 값을 빈 칸처럼 그리지 않는다(SURFACE-052).
  > 【추론】 union 칸에 `enum`·`const`가 있어도 기본 입력은 문자열 입력이며, 기본 enum·radio 정의를 union에 열지 않는다(BLUEPRINT-034 (4)).
  > 【추론】 그래서 `['number','string']` + `enum:[1,'a']`에서 기본 입력으로 친 `"1"`은 문자열로 남고 검증기가 기각하며, 이 사용성 빈틈은 UI 플러그인이 메운다.
  > 【추론】 `format`은 문자열 입력이 이미 하는 만큼(`password`·`email`)만 쓰며, 날짜 정의는 union에 걸리지 않는다.
  > 【추론】 기본 입력이 약속하지 않는 것은 여섯이다: `string`이 유효 목록에 있을 때 다른 원시 형을 만드는 것, 객체·배열을 만들거나 편집하는 것, 편집 모드에서 `null`을 만드는 것, 문자열 표기가 겹치는 enum 리터럴을 가르는 것, `const`·`format`·`enum`의 의미, 모양과 접근성.
  > 【추론】 `FormTypeInputProps` 주석과 플러그인 문서에 다음 계약 문구를 싣는다.
  >     > union 입력은 `type === 'union'`일 때 다음을 읽는다. `schemaType`: 목록이며, 순서에 core의 뜻은 없다. `nullable`, `value`, `valueTypeMismatch`, `required`. `jsonSchema`: `jsonSchema.type`은 켜진 선언의 교집합이며, 형 없는 칸에서는 없을 수 있다. 게이트가 좁힌 목록은 `schemaType`과 `jsonSchema.type`의 교집합이다.
  >     > 보내는 값은 JSON 형이 목록에 있는 값이나 `undefined`다. `null`은 nullable일 때 비우기 조작으로만 보내고, 빈 칸은 `undefined`로 보낸다. `value`는 어긋난 값일 수 있으므로 `onChange`보다 넓은 형이다.
  >     > 치다 만 글과 입력기 조합 중인 글은 입력이 초안으로 들고, 흐려지면 노드 값으로 되돌린다.
  >     > 목록 밖의 값을 보내도 오류가 아니고 버려지지도 않는다. core의 규칙 A가 받아서, 받아 줄 형이 정확히 하나면 그 형으로 바꾸고, 아니면 그대로 두고 경고등을 켠다. 게이트가 목록을 좁힌 동안에는 좁혀진 목록으로 해석한다. 입력은 이 결과를 다음 렌더의 `valueTypeMismatch`로 안다. `valueTypeMismatch === false`는 검증 통과가 아니다.
  >     > 객체·배열 값은 불변으로 다룬다. 바꿀 때는 새 참조를 보내고, 받은 값을 제자리에서 바꾸지 마라. 값 안에 JSON이 아닌 것(`undefined`인 키, `Date` 등)을 넣지 마라.
  >     > 목록의 순서에 기대지 마라. core가 사용자가 뜻한 형을 골라 준다고 가정하지 마라.
  > PR: PR-7(렌더 계층과 바인딩)
  > 무엇: `src/__tests__/scenarios/union.input-binding.render.test.tsx`(시험 대조의 모든 칸, 인라인 우선, `FORM_TYPE_TEST_INVALID` 1회, `{typo: undefined}`의 대조, 정수 노드 props의 `type === 'number'`와 `schemaType === 'integer'`), `union.default-input-draft.render.test.tsx`, `union.object-array.render.test.tsx`의 기본 입력 부분을 돌린다.
  > 통과: 초안·표시·비우기·무효 표시와 시험 대조가 위대로다.
  > 실패: 기본 입력이 목록 밖 값을 보내거나 초안을 쓰면 감싸개를 고치고, 규칙이 입력 사례를 하나로 정하지 못하면 이 블록을 고친다.
- 보충:
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2575-2580,2582-2618,2627-2630`(정본), `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2620-2625`
- 충돌:
  > `reviews/round-18-closing.md:2578`의 "【추론】 규칙 A를 미리 보는 공개 함수는 지금 내보내지 않으며, 입력은 `valueTypeMismatch`로 결과를 보고, 함수를 나중에 더하는 것은 추가 변화다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).
