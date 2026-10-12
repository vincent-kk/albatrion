# 스토리 재구성 검토안 (184라운드, 원장 관리자, 2026-10-13)

183라운드 소유자 답에 따른 검토안이다. 소유자 요구: 옛 스키마를 그대로 쓰지 않고, 우리가 만든 기능별로 스토리 그룹을 만들며, 그룹마다 기능 스토리 테스트를 두고, 기능을 복합해 쓰는 스토리 테스트를 구성한다. 이 문서는 (1) 현황, (2) 기능 그룹과 그룹별 스토리 테스트 목록, (3) 복합 스토리 테스트 목록, (4) 구조·데이터·검증 방식, (5) 병렬 가능 여부와 담당, (6) 소유자가 정할 것을 담는다. 구현은 소유자 검토 뒤 시작한다.

## 1. 현황

- 시나리오 데이터: `packages/aileron/schema-form-scenarios/src`에 10개 가족(array 16파일, controls 5, derive 4, exit 3, fill 3, notify 3, settle 3, union 11, validation 3, value 7), 이름 붙은 시나리오 약 100건. 거의 모두 play 단계(steps)를 가진다. 가족은 엔진 설계 영역(원장 AREA)을 따르며 소비자가 보는 "기능" 단위가 아니다.
- 스토리북: `stories/scenarios/` 11파일 43 export(시나리오 하나당 스토리 하나, `playScenario`로 단언), `stories/usage/` 4파일 7 export(Composition, ControlsAndPresentation, Handle, CustomInput, PathMapping, Provider, Plugin), 브라우저 게이트 4 export. 글롭은 `../stories/scenarios/**`, `../stories/usage/**` 둘.
- e2e: `src/__tests__/e2e/` 27파일 약 190건이 같은 시나리오 데이터를 jsdom에서 돌린다.
- 플러그인 패키지(ajv6·7·8, antd5·antd6·antd-mobile, mui): stories 디렉토리에 3~5파일씩 있으나 코어 시나리오를 `composeStories`로 가져오는 곳은 0이다(TEST-025의 "플러그인은 코어 시나리오를 자기 렌더러로 그린다"가 아직 구현되지 않음).
- 옛 스토리 49파일(33,545줄)은 07에서 삭제됐고 play 단언이 없는 눈 확인용 카탈로그였다(`verification/07-switch/story-disposition.md`). 옛 사례는 아래 2절의 "옛 사례 후보" 열에 그룹별 후보로만 쓴다.

## 2. 기능 그룹과 그룹별 스토리 테스트

그룹은 소비자 문서(`docs/agents/skills/schema-form-skill/knowledge/*.md`)의 기능 경계를 따른다. 각 행은 스토리 하나(= 시나리오 데이터 하나 + play 단언)다. "기존"은 지금 시나리오 데이터에 같은 기능의 사례가 있어 재사용 가능한 것, "신규"는 데이터부터 새로 쓰는 것이다.

### G1 값과 기본 입력 (value)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| 기본 형 다섯(string·number·boolean·null·integer) 입력과 값 | 입력 → 노드 값 → 출력 값 | 신규 | 01, FormTypeInput.Default |
| enum·const·format(date 등) | 선택지 제한과 형식 유지 | 신규 | 01 |
| 빈 칸과 비우기(undefined, nullable이면 null) | REACT-027 계약 | 기존 value/empty-draft | 22, 09 |
| 스키마 기본값·외부 defaultValue·부모 기본값 | 마운트 채움과 reset | 기존 fill/mount-default, nested-screen | 10 |
| omitEmpty 출력 생략 | 출력 값에서 빈 값 제거 | 기존 value/omit-empty, union/omit-empty | 18 |
| $ref·$defs 참조와 재귀 스키마 | 참조 해석, 재귀 깊이, 경로 이스케이프 | 기존 value/reference-schema + 신규(재귀 트리) | 16 |
| 루트 출력과 enhanced 없는 값 계약 | getValue·submit·onChange가 같은 값 | 기존 value/root-output | 07 |

### G2 객체와 배열 구조 (structure)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| 객체 properties·required·additionalProperties | 자식 생성과 출력 | 신규 | 01, 06 |
| 배열 push·remove·update·clear·pop | 슬롯 동일성과 값 | 기존 array/* 6건 | 27 |
| 터미널 배열·객체 입력 대 브랜치 | 통째 쓰기와 자식 그리기 | 기존 array/terminal-verbs, union/object-array | 02 |
| prefixItems 튜플과 열린 items | 자리별 스키마, 여분 항목 | 기존 array/items-prefix, extras-tail | 35 |
| minItems 채움과 nullable 슬롯 | 채움·reset 상호작용 | 기존 array/render(min-items, nullable-slots) | 10, 28 |
| omitTrailing 끝 생략 | 출력에서 끝 빈 항목 제거 | 기존 array/omit-trailing | 41 |
| 대량 변경(batch)과 통째 쓰기 | 한 번의 통지 | 기존 array/whole-write, notify/batch | 38 |

### G3 조건과 합성 (composition)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| oneOf 분기 전환과 값 보존 | 분기 왕복 때 공유 값 유지 | 기존 union/render(branch-round-trip) | 17 |
| anyOf 활성 분기와 공유 필드 | 여러 분기 동시 활성 | 기존 union/render(active-anyof) | 31 |
| 중첩 oneOf(분기 안의 분기) | 안쪽 분기 전환이 바깥에 미치는 영향 | 기존 union/render(nested-branch) + 신규(3단 중첩) | 17 |
| oneOf와 anyOf 결합 | 두 합성의 교차 | 신규 | 17, 31 |
| allOf 합성·required·충돌 | 병합 결과와 검증 | 기존 settle/conditional-screen 일부 + 신규 | 30 |
| if/then/else와 const 조건 | 조건 전환과 빠른 토글 | 기존 settle/conditional-screen | 06 |
| nullable 분기의 세 상태(null·빈·값) | 승격과 되돌림 | 기존 union/render(null-ancestor), value/null-promotion | 28, 42, 43 |
| typeless 분기와 리터럴 속성 | type 없는 분기 판정 | 기존 union/render(typeless-*) | 43 |
| 분기 기본값과 첫 화면 | 활성 분기의 기본값만 채움 | 기존 union/default-fill, first-screen | 17 |

### G4 파생·주입·감시 (derive)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| computed visible·readOnly·disabled·active | 표현식 결과가 제어에 반영 | 기존 controls/states | 11, 29.Visible |
| visible 대 active(값 보존 대 제거) | 숨김은 값 유지, 비활성은 제거 | 기존 controls/exit-layers, exit/* | 29.Visible |
| watch와 derived 값 사슬 | 수동 편집 뒤 파생 재계산 | 기존 derive/render(derived-chain) | 05, 36 |
| injectTo 형제·부모·배열·다중 대상 | 주입 범위와 순환 차단 | 기존 derive/render(sibling, parent-array), derive/injection | 39 |
| 순환 참조와 피드백 예산 | 수렴·비수렴 종료 | 기존 derive/budget, union/feedback-* | 36 |
| pristine 조건 | 상태 초기화와 파생 결합 | 신규 | 37 |
| context(@) 참조 | 외부 context로 모드·권한 제어 | 신규 | 34 |

### G5 검증·상태·오류 (validation-state)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| 검증 모드 셋(OnChange·OnRequest·None) | 언제 오류가 생기는가 | 신규 | 13, 21 |
| 외부 errors prop과 setExternalErrors | 외부 오류 표시·제거(178C-01 가드 포함) | 신규 | 13 |
| 오류 표시 정책(showError·showErrors) | 조건부 표시 | 신규 | 21.Extended |
| 오류 포맷·번역(formatError) | 메시지 변환 | 신규 | 21 |
| dirty·touched·pristine과 global state | 상태 전이와 onStateChange | 기존 controls/scope 일부 + 신규 | 15, 38 |
| submit·Enter 제출과 제출 검증 | VALIDATION_ERROR와 성공 경로 | 기존 validation/submit | 19 |
| 하위 오류와 union 형 오류 | 노드별 오류 귀속 | 기존 validation/union-type, if-only | 21 |

### G6 입력 컴포넌트 (formtype-input)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| FormTypeInput 정의 매칭(test)과 우선순위 다섯 | 어느 정의가 이기는가 | 신규 | 03, 25 |
| formTypeInputMap 경로·정규식·와일드카드 | 경로 매핑 | 신규(usage PathMapping 보강) | 03 |
| 제어·비제어 입력과 blur trim | 입력 계약 | 기존 e2e controls-input + 데이터화 | 22, 24 |
| 숫자 badInput·포매터 캐럿·IME | 브라우저 사실(G23 스토리 재사용) | 기존 browser-gates | 24 |
| 파일 업로드(단일·다중·언마운트 정리) | 파일 값의 수명 | 기존 e2e upload-file + 데이터화 | 26 |
| 스키마에서 renderer·input props 전달 | props 흐름 | 기존 e2e schema-node-props-flow + 데이터화 | 23, 33 |
| ChildNodeComponents로 자식 그리기와 동적 객체 | 자식 합성 | 기존 value/package-entry-render 일부 + 신규 | 32 |

### G7 핸들·레이아웃·합성 API (imperative-layout)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| FormHandle: getValue·setValue·reset·validate | 값·오류 왕복 | 기존 settle/form-reset + 신규 | 07, 20 |
| FormHandle: focus·select·refresh | 명령 전달 | 기존 e2e controls-focus, proxy-refresh + 데이터화 | 07 |
| Form.Render·Form.Input·Label·Error 합성 | 경로별 레이아웃 | 기존 usage Composition 보강 | 04, 12 |
| children 함수와 반복 children | 렌더 합성 | 기존 usage Composition | 04 |
| 외부 Provider·설정·사용자 context | Provider 계층 | 기존 usage Provider | 14 |
| 스키마·defaultValue 교체와 reset 로드 | 재로드 계약 | 기존 settle/form-reset, fill/nested-screen | 20 |

### G8 플러그인과 격리 (plugin)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| registerPlugin과 검증기 플러그인(ajv) | 검증 결과 흐름 | 기존 usage Plugin | 14 |
| UI 플러그인 렌더러 교체(FormGroup·Label·Input·Error) | 렌더러 자리 | 기존 usage ControlsAndPresentation | 25 |
| 오류 경계 격리(입력 하나가 throw) | 서브트리만 fallback | 신규 | 13 |
| 플러그인 패키지가 코어 시나리오를 자기 렌더러로 | composeStories 재사용 | 신규(08 몫) | — |

### G9 이벤트와 통지 (notify)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| 배치와 setValue 동기성 | 통지 횟수와 순서 | 기존 notify/batch, order | 38 |
| 구독(subscribe)과 이벤트 종류 | 이벤트 수신 | 신규 | 15 |
| 경고 기록(onError)과 렌더 재실행 관찰 | 경고 1회, 재렌더 수 | 기존 notify/warning, e2e renderer-regression | BugReport.01 |

### G10 규모와 가상화 (scale)

| 스토리 테스트 | 단언의 핵심 | 데이터 | 옛 사례 후보 |
| --- | --- | --- | --- |
| 가상화 지연 마운트(IO·idle·focus 노출) | placeholder → 마운트 | 기존 controls/virtualization, e2e deferred-mount | 40 |
| 1,000개 배열 폼의 동작(수치 없음) | 스크롤·편집이 됨 | 신규 | — |
| 표현식 비용 데모 | 큰 폼에서 computed 다수 | 신규 | 36 |

그룹 10개, 스토리 테스트 약 62건(기존 데이터 재사용 약 35건, 신규 데이터 약 27건).

## 3. 복합 스토리 테스트 (composite)

기능을 두 개 이상 묶어 실제 폼처럼 쓰는 스토리다. 각각 시나리오 데이터 하나와 play 단언을 가진다.

| 번호 | 복합 사례 | 묶는 그룹 |
| --- | --- | --- |
| C1 | 주문서: oneOf 결제 분기 안의 배열 항목 + 파생 합계 + 제출 검증 | G3·G2·G4·G5 |
| C2 | 조직도: $ref 재귀 트리 + 가상화 + 노드 상태(dirty) | G1·G10·G5 |
| C3 | 프로필: nullable 주소 객체 + if/then/else + 외부 오류 + 오류 표시 정책 | G3·G5 |
| C4 | 금액 입력: 커스텀 포매터 입력 + 숫자 badInput + Enter 제출 | G6·G5 |
| C5 | 권한 폼: context(@) 모드 + computed readOnly·visible + injectTo | G4·G7 |
| C6 | 플러그인 폼: antd 렌더러 + 파일 업로드 + 오류 경계 격리 | G8·G6 |
| C7 | 설정 마법사: anyOf 다중 선택 + prefixItems 튜플 + reset 로드 | G3·G2·G7 |

## 4. 구조·데이터·검증 방식

- 디렉토리: `stories/features/<group>/<feature>.stories.tsx`(title `Features/<Group>/<Feature>`), `stories/composite/<case>.stories.tsx`(title `Composite/<Case>`). 기존 `stories/scenarios/`(엔진 시나리오)와 `stories/usage/`, 브라우저 게이트는 그대로 두고, 재구성이 끝나면 `scenarios/`의 43건은 features로 흡수하거나 지운다(소유자 결정 6-3).
- 데이터: 모든 스토리는 `@aileron/schema-form-scenarios`의 순수 데이터를 쓴다(TEST-025 원칙 유지, 인라인 스키마 금지). 신규 데이터는 기능 가족으로 두되 기존 10가족과 섞이지 않게 `features/<group>/` 하위 가족으로 추가하고, 복합은 `composite/`. 기존 가족의 시나리오를 재사용할 때는 복사하지 않고 import한다.
- 단언: 스토리마다 play가 `playScenario`로 돌며 DOM(data-path, 입력 값)과 노드 값을 함께 본다. 같은 데이터가 e2e(jsdom)에서도 돌도록 `src/__tests__/e2e/features-<group>.test.tsx`를 함께 둔다(파일당 15건 이하 규칙).
- 눈 확인 가치: 카탈로그 역할을 위해 Storybook docs 탭에 스키마와 설명을 자동으로 보여 주는 공용 컴포넌트(ScenarioStory 확장) 하나를 둔다.
- 검증 게이트: `yarn vitest run --project storybook`(헤드리스 Chromium)과 e2e 전체 통과, 브라우저 세션(fairy07)의 눈 확인 표(그룹마다 한 줄).

## 5. 병렬 가능 여부와 담당

- 병렬은 가능하다. 조건: (가) 새 디렉토리(`stories/features`, `stories/composite`, 시나리오 패키지의 새 가족, 새 e2e 파일)만 만들고 `src/`는 건드리지 않는다, (나) reviewer가 손대는 기존 스토리 파일(`stories/scenarios/browser-gates.stories.tsx`, `stories/components/gates/*`)은 건드리지 않는다, (다) `.storybook/main.ts` 글롭 추가와 시나리오 패키지 `index.ts` export 추가만 공유 파일 변경이며 충돌은 한 줄 수준이다.
- 브랜치: 07b-1(현재 c293819a8) 위에 쌓은 `feat/schema-form-07c-stories`, PR은 #355 뒤에 머지. reviewer의 커밋이 #354에 쌓이면 #355와 함께 rebase한다.
- 담당 제안: 브라우저 세션 fairy07이 구현(스토리는 눈 확인과 play 단언이 함께 가는 작업이라 브라우저 에이전트가 맞다), 그룹 하나를 끝낼 때마다 Claude verifier 독립 리뷰, 원장 관리자가 그룹 단위로 라운드에 적는다. reviewer에게는 얹지 않는다(소유자 지시: 지금 작업을 마친 뒤). 측정과는 무관하므로 fixy07의 판정 세션과 겹쳐도 된다 — 다만 판정 세션이 도는 동안은 `yarn vitest run --project storybook` 같은 무거운 실행을 피한다.
- 순서: G3(합성) → G2(구조) → G1(값) → G5(검증) → G4(파생) → G6(입력) → G7(핸들) → G9(통지) → G8(플러그인) → G10(규모) → 복합 C1~C7. 소유자가 걱정한 중첩 oneOf·oneOf+anyOf·$ref 트리가 앞쪽에 온다.
- 크기: 스토리 약 69건, 신규 데이터 약 34건. 그룹당 반나절에서 하루, 전체 1~2주의 세션 작업으로 본다.

## 6. 소유자가 정할 것

1. 그룹 10개의 경계와 이름(2절)을 받아들일지, 합치거나 나눌 그룹이 있는지.
2. 복합 사례 C1~C7(3절)이 실제 쓰임과 맞는지, 바꾸거나 더할 사례.
3. 재구성이 끝난 뒤 기존 `stories/scenarios/` 43건을 features로 흡수할지 그대로 둘지.
4. 담당: fairy07 구현 + verifier 리뷰(5절 제안)로 갈지.
5. 병렬 시작 시점: 지금(새 브랜치, 새 디렉토리만) 또는 reviewer 작업이 끝난 뒤.
6. 플러그인 패키지의 composeStories 재사용(G8 넷째 줄)을 이번 범위에 넣을지 08단계로 둘지.
