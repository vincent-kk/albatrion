# 06 React와 공개 표면

이 문서는 원장의 REACT·SURFACE 영역을 읽는 표면이다. 정본은 `ledger/`이며, 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다.

## 소유자 통과

| 절 | 상태 | 날짜 |
| --- | --- | --- |
| 1.1 핵심 엔진과 렌더 계층의 경계 | 대기 | — |
| 1.2 구독과 마운트 정착 | 대기 | — |
| 1.3 입력 쓰기와 유효 스키마 | 대기 | — |
| 1.4 입력 구성 요소의 값 계약 | 대기 | — |
| 1.5 입력별 초기화와 수명 | 대기 | — |
| 1.6 늦은 쓰기와 재생성 | 대기 | — |
| 1.7 잔여 키 오류 표시 | 대기 | — |
| 1.8 입력 종류 판정과 union 기본 입력 | 대기 | — |
| 1.9 React 지원과 플러그인 호환성 | 대기 | — |
| 2.1 공개 이름의 원칙 | 대기 | — |
| 2.2 공개 표면의 자리 | 대기 | — |
| 2.3 공개 쓰기와 분기 명령 | 대기 | — |
| 2.4 값 읽기와 핸들 | 대기 | — |
| 2.5 노드의 공개 멤버와 신원 | 대기 | — |
| 2.6 값 형식 불일치의 공개 이름 | 대기 | — |
| 2.7 이벤트와 기존 공개 계약 | 대기 | — |

## 1. React 바인딩

### 1.1 핵심 엔진과 렌더 계층의 경계

앞의 것은 렌더 계층의 판정 함수로 옮기고(NODE-028), 뒤의 import 분리는 닫혔다: core는 `app/plugin`을 가져오지 않고 검증기는 바인딩 계층이 골라 트리 생성 인자로 넘긴다(REACT-002, NODE-028, CONTROLS-075). 의존 역전으로 끊고 `record/`가 `SchemaNodeRuntime` 칸의 형을 최소 인터페이스로 선언한다(REACT-002, NODE-045).

선언 사이 규칙은 SCHEMA-039이다(REACT-003, SCHEMA-039). 판정 함수는 렌더 계층(React 바인딩)이 병합의 원자 판정 함수(React 요소와 ref 모양, SCHEMA-039)와 함께 청사진에 인자로 넘기며, core만 쓰는 호스트에는 이 암묵 규칙도 원자도 없다(REACT-003, SCHEMA-039).
React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다(REACT-003).
원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(원리 P5(core는 렌더러를 모른다), GOAL-031)(REACT-003, GOAL-031).
렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자다(REACT-003).

루트는 마운트 때 받은 두 판정 함수를 들고, reset 호출 안의 재생성(WRITE-046)은 같은 함수들로 청사진을 다시 돈다(마운트와 reset이 같은 형상, 목표 G4(하나의 개념에는 하나의 장치), GOAL-006)(REACT-004, WRITE-046, GOAL-006).
reset 호출 안에서 동기로 만들고(트리 생성은 core의 연산이다, 추가 목표 C3(프레임워크 독립적인 core), GOAL-016)(REACT-004, GOAL-016).
React 연결은 외부 저장소(`useSyncExternalStore`)로 알려 막는 차선으로 곧바로 커밋한다(`startTransition` 안에서도 옛 화면이 입력을 받는 틈을 두지 않는다)(REACT-004).

### 1.2 구독과 마운트 정착

오늘의 훅(`useSchemaNodeTracker`의 `useSyncExternalStore` + revision, `useSchemaNodeSubscribe`의 구독 뒤 따라잡기)은 새 통지 모델에 그대로 맞는다(REACT-006).
`useSyncExternalStore` 스냅숏으로 쓰는 현재 방식(`hooks/useSchemaNodeTracker.ts:36-49`)은 유지한다(REACT-006).

**마운트 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤로 미룬다.**(REACT-007)
트리는 렌더 중 `useMemo`에서 만들어지고 로드 정착이 그 안에서 동기로 돈다(REACT-007).
구독자가 없으니 통지는 무해하다(REACT-007).
`onChange`·`onDiagnosticsChange`는 준비 전의 호출을 버린다(마운트 뒤의 `diagnostics`는 핸들로 읽는다)(REACT-007).

StrictMode의 이중 호출은 가드 캐시가 작성 루트 객체를 키로 하므로 컴파일을 두 번 하지 않는다(REACT-008).

문서화할 것 둘: 모든 통지가 동기이므로 렌더 중 사용자 코드의 쓰기는 React의 "렌더 중 갱신" 경고를 받는다(REACT-013). `startTransition` 안의 쓰기는 동기 차선으로 강등된다(REACT-013).
호출자가 렌더 중에 연 사슬(core가 감지하지 않는 사용자 코드의 쓰기, P5)은 호출자의 오용이므로 그 안의 전달 시점은 보증하지 않는다(REACT-013).

### 1.3 입력 쓰기와 유효 스키마

**입력 계약.**(REACT-005)
입력 컴포넌트의 `onChange(undefined)`는 그 키를 없음으로 만든다(REACT-005).
【추론】 입력 구성 요소는 옵션 없이 `onChange(undefined)`를 부른다(REACT-005, WRITE-091).
【추론】 이는 입력 쓰기이므로(WRITE-091) 채움 없이 값을 뺀다(REACT-005, WRITE-091).
【추론】 소유자 C-11(REACT-005)을 지킨다(REACT-005).

**입력 출처 표식.**(REACT-009)
공개 `SetValueOption`은 비트 넷뿐이라 Refresh 판정에 필요한 "사용자 입력에서 왔다"는 표식은 렌더 계층이 내부 통로로 넘긴다(REACT-009).
내부 통로(입력 마침 신호 `finishInput`, 입력 출처 표식이 붙은 쓰기)는 클래스 멤버가 아니며 `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보낸다(REACT-009).

같은 표식은 `handleChange`의 진입 전체에 붙고, 재생성 reset으로 폐기된 노드가 늦은 입력 쓰기를 호출자 오류와 가르는 데에도 쓴다(WRITE-046, REACT-010).
REACT-024의 검사를 받지 않는 컨테이너 입력의 늦은 `onChange`는 `handleChange`의 진입 하나(REACT-011)로 오고 그 진입 전체(값 쓰기, 외부 오류 지움, `dirty` 표시)가 입력 출처 표식(REACT-009)을 달고 오므로, 폐기된 노드는 셋을 모두 조용히 버린다(REACT-010, REACT-011, REACT-009, REACT-024).

**`handleChange`는 진입 하나.**(REACT-011) 오늘은 값 쓰기·외부 오류 지움·dirty 표시가 진입 셋이라 사슬 끝 throw에서 dirty가 빠진다(REACT-011). `batch` 하나로 묶는다(REACT-011).

**유효 스키마를 따라간다.**(REACT-012) `useFormTypeInput`의 메모 의존에 노드의 유효 스키마 참조를 더하고, `SchemaNodeProxy`는 유효 스키마 변경 비트를 구독한다(LANDING-038, REACT-012).
활성 조각 집합마다 메모해 같은 집합이면 같은 참조를 돌려주고, 재계산 목록에 든 노드만 다시 셈하며, 바뀌면 통지의 배달 집합에 든다(REACT-012).

### 1.4 입력 구성 요소의 값 계약

참고로 plugin 은 그냥 샘플이고, 보통 용법은 사용자가 formTypeInput 을 구현해서 붙이는거긴 해(REACT-014). 만들기도 적용하기도 비교적 쉬우니까(REACT-014). 그럼 결국 올바르지 않은 타입의 표현은 FormTypeInput 구현에 위임되는거구나(REACT-014).
나 로 확정합니다(REACT-014).
변환하지 못한 값은 받은 그대로 들고, 틀린 형의 표현은 `FormTypeInput` 구현에 위임된다(REACT-014, WRITE-054).

입력 구성 요소의 계약은 `FormTypeInputProps` 문서 주석과 입력 작성 문서에 적는다(REACT-027).
초안(치다 만 글자, 입력기 조합 중인 글자)은 입력이 스스로 든다(REACT-027).
노드에는 자기 형의 값이나 없음만 보낸다(REACT-027).
빈 칸이면 `undefined`를 보낸다(REACT-027).
비우기 조작은 nullable이면 `null`, 아니면 `undefined`를 보낸다(REACT-027).
해석할 수 없는 초안이 남은 채 포커스를 잃으면 표시를 노드 값으로 되돌린다(REACT-027).
경고등이 켜진 값은 유효한 상태(빈 칸, 켜짐, 체크)처럼 그리지 않는다(REACT-027).
받은 값이나 무효 표지를 보이고, 한 번의 조작으로 비울 수 있게 한다(REACT-027).
기본 수 입력은 빈 칸이면 `undefined`를 보낸다(`valueAsNumber`의 `NaN`을 보내지 않음)(REACT-027).
기본 수 입력은 `validity.badInput`이면 쓰지 않고, 흐려지면 되돌린다(REACT-027).
기본 불리언 체크박스는 불리언이 아닌 값이면 미정 상태로 그린다(REACT-027).
PR: PR-7(브라우저 시험, storybook 프로젝트) — 브라우저 사실 둘(REACT-027).
무엇: 실제 브라우저의 `badInput`과 antd `InputNumber`의 흐린 뒤 표시를 잰다(REACT-027).
통과: 규칙대로 동작한다 — 치다 만 글자가 노드에 가지 않고, 흐리면 노드 값이 보인다(REACT-027).
실패: 기본 수 입력을 `type="text"`와 `inputMode="decimal"`, 자체 초안 해석으로 바꾼다(REACT-027).
실패: 계약 문장은 그대로 둔다(REACT-027).

【추론】 바인딩은 조합 중에 입력의 DOM `value`를 프로그램으로 쓰지 않는다(REACT-029).
【추론】 이 규칙은 조합 중에 Refresh가 오는 경우와 맞물린다(REACT-029).
【추론】 REACT-019는 그때 입력을 다시 마운트한다(REACT-029).
【추론】 REACT-024는 대체된 입력이 조합 끝에 낸 늦은 `onChange`를 버린다(REACT-029).

### 1.5 입력별 초기화와 수명

**입력의 초기화.**(REACT-019)
core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다)(REACT-019).
core는 React를 모른다(추가 목표 C3(프레임워크 독립적인 core), GOAL-016)(REACT-019, GOAL-016).
바인딩 계층이 입력마다 가른다(REACT-019).
자식 노드 프록시(래퍼가 만든 `ChildNodeComponents`로 그린 `SchemaNodeProxy`, 가상화의 `DeferrableNodeProxy` 자리 포함)를 하나라도 마운트한 입력은 컨테이너로 보아 다시 마운트하지 않는다(그 자식들이 저마다 Refresh를 받는다)(REACT-019).
자식 프록시를 마운트하지 않은 입력(리프, 터미널, `presentation.FormTypeInput`을 가진 가상 노드, 그리고 `formTypeInputMap`·정의 목록으로 준 브랜치 입력 가운데 값 전체를 스스로 그리는 것, 예: 객체용 비제어 JSON 편집기)은 입력 컴포넌트만 다시 마운트한다(REACT-019).
그래서 비제어 DOM과 사용자 `FormTypeInput`의 내부 상태가 입력 단위로 초기화되고, 자식을 그리고 있는 기본 객체·배열 입력과 렌더러·`children`·`<form>`은 다시 마운트되지 않는다(오늘은 provider 아래 전부)(REACT-019).
Refresh의 범위는 EVENT-039의 '그 노드의 입력 하나'와 같다(컨테이너를 다시 마운트하면 서브트리 리마운트, 곧 Remount가 된다)(REACT-019, EVENT-039).
컨테이너 하나에 명시로 보낸 `refresh`는 아무것도 다시 마운트하지 않는다(EVENT-039, REACT-019).
값이 바뀌었거나 손댄 입력으로 좁히지 않는 것은 안정성 때문이다(디바운스, 값 없이 바뀐 내부 상태, 흐림 뒤 한 프레임 안의 reset)(REACT-019).
로드(마운트·`FormHandle.reset()`·`resetSubtree()`, WRITE-090)가 낸 Refresh는 core가 로드된 노드 모두에 내므로 그 자식들이 저마다 받는다(REACT-019, WRITE-090).
로드는 값이 같아도 원본을 새로 쓰므로 EVENT-042의 '그 밖의 쓰기가 원본을 바꾸면 낸다'에 든다(REACT-019, EVENT-042).

규칙은 REACT-019 그대로다(REACT-028).
PR-7이 바인딩 계층에서 입력마다 자식 프록시의 마운트 여부를 알고, Refresh를 가를 때 읽는다(REACT-028).
자식 프록시는 `SchemaNodeProxy`와 가상화의 `DeferrableNodeProxy` 자리다(REACT-028).
후보 구현은 프록시의 마운트·언마운트 효과가 노드별 수를 올리고 내리는 것이며, 방법은 PR-7이 고른다(REACT-028).
PR: PR-7(REACT-028).
통과: TEST-020 보충의 reset 시험이 초록이다(REACT-028, TEST-020).
그 시험에서 다시 마운트되는 것: 터미널 입력, 값 전체를 그리는 브랜치 입력, 빈 배열·접힌 펼침 입력(REACT-028).
그 시험에서 다시 마운트되지 않는 것: 자식을 그리는 기본 객체·배열 입력(REACT-028).
여기에 StrictMode 이중 마운트와 가상화의 지연 자리 사례를 더한다(REACT-028).
실패(판정을 믿을 수 있게 얻지 못해 위 시험이 설 수 없음): 원문대로 '값 표시 불일치 대 다시 마운트 비용'의 맞바꿈을 소유자에게 올린다(REACT-028).

제안의 '`options.terminal: true`로 두라'는 안내는 없앤다(구조 선언으로 UI 수명을 푸는 두 번째 장치다, G4)(REACT-020).

남는 것: 자식을 그리면서 값에서 온 내부 상태를 따로 드는 컨테이너 입력은 그 상태가 남는다(지금 자식을 그리지 않는 입력, 곧 접힌 펼침 영역과 빈 배열은 다시 마운트된다)(REACT-021).
그런 컨테이너 입력은 노드 값을 구독해 맞추거나 `remount`·`<Form key>`를 쓴다고 문서화한다(REACT-021).

포커스: 다시 마운트된 입력은 포커스를 잃고 모바일 가상 키보드가 닫힌다(오늘도 같다)(REACT-023).
복원하지 않고 문서화한다(REACT-023).

### 1.6 늦은 쓰기와 재생성

**늦은 쓰기의 차단.**(REACT-024)
다시 마운트로 대체된 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(디바운스 타이머, 언마운트 때의 flush, IME 조합 끝)는 버린다(REACT-024).
Refresh 번호는 래퍼의 React 상태(오늘의 `useFormTypeInputControl`의 `useVersion`)가 아니라 노드가 들고, 그 Refresh를 낸 커밋에서 `revision`과 함께 동기로 오른다(EVENT-007, REACT-024).
배달보다 앞서므로 리스너 안의 로드처럼 다음 파동에 배달되는 Refresh도 배달 전에 번호가 올라 있다(REACT-024).
래퍼는 `SchemaNodeProxy`가 Remount에 쓰는 것처럼 `useSchemaNodeTracker`로 이 번호를 읽어 `FormTypeInput`의 `key`와 `defaultValue` 메모 의존으로 쓰고, 인스턴스가 마운트될 때의 번호를 `onChange`·`onFileAttach`에 묶어 쓰기 시점의 노드 번호와 다르면 버린다(REACT-024).
진입은 동기라 그 사이에 타이머가 끼어들 수 없고, 구독 전에 배달을 놓친 입력도 구독 뒤 따라잡으며, `startTransition` 안의 reset도 막는 차선으로 다시 그린다(REACT-024).
컨테이너 입력(REACT-019)은 다시 마운트하지 않으므로 이 검사를 받지 않는다(받으면 그 입력의 쓰기가 영구히 버려진다)(REACT-024, REACT-019).
이 규칙은 reset이 아닌 Refresh(호출자의 전체 교체)에도 똑같이 걸린다(REACT-024).
흐림 뒤 한 프레임 미룬 `touched` 설정은 노드의 상호작용 초기화 번호(상태 칸 쓰기로 `dirty`·`touched`를 비울 때 오르는 노드 필드. reset, `clearState`, `controls.resetInteraction`이 올린다)를 흐릴 때 붙잡아 두고, 미룬 콜백에서 그 번호가 바뀌었으면 쓰지 않는다(REACT-024).
그래서 오늘의 `clearState` 경합도 닫히고, 비움이 아닌 Refresh(외부 `setValue`) 뒤의 흐림 `touched`는 그대로 남는다(제안의 'reset이 낸 Refresh에만 딸린다'를 넓혔다, G4)(REACT-024).
이것이 없으면 옛 값이 살아 있는 노드에 쓰인다(오늘의 reset과 `key`는 옛 트리를 버려 이 문제가 없다)(REACT-024).
옛 트리를 폐기할 때 그 노드들의 Refresh 번호와 상호작용 초기화 번호를 통지 없이 함께 올려, 폐기된 트리의 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(언마운트 때의 flush 포함)와 흐림 뒤 미룬 `touched`가 REACT-024의 검사에서 core에 닿기 전에 버려지게 한다(REACT-024).
늦은 `onFileAttach`는 노드 쓰기가 아니라 reset을 넘어 남는 Form 층 첨부 파일 맵의 쓰기이므로(오늘의 `SchemaNodeInput.tsx:61-67`), 래퍼가 맵에 쓰기 전에 노드의 폐기 표시를 읽어 폐기된 노드면 버린다(컨테이너 입력 포함)(REACT-024).

**더 강한 연산은 새 이름 없이 둘이다.**(REACT-025)
`<Form key>`는 전체 재생성(스키마 교체, 에러 바운더리 복구, 가상화 재생)으로 문서화하고, 그것이 버리는 것(핸들 인스턴스, 외부 구독, 노드 참조, `showError` 등 Form 층 상태, 첨부 파일 맵, 가상화 기록, 에러 바운더리의 fallback 상태)을 함께 적는다(REACT-025).
루트 바운더리가 fallback을 그리는 동안은 `ref`가 `null`이라 reset을 부를 수 없으므로 복구는 `key`뿐이다(TEST-020의 H5, 실행 확인 전)(REACT-025, TEST-020).
노드 명령 `remount`는 트리를 둔 채 그 노드의 UI만 다시 마운트한다(REACT-025).
`FormHandle`에 더하는 명령 겉면은 모양이 무엇이든 PR-7이며, 그 모양(`focus(path)`·`select(path)`를 남길지 같은 모양 하나로 합칠지)은 PR-4 착수 전에 소유자가 정한다(REACT-025, EVENT-063, EVENT-073).
문서는 reset을 값 초기화의 기본으로, `key`를 그보다 강한 연산으로 소개한다(REACT-025).

### 1.7 잔여 키 오류 표시

잔여 키의 표시 규칙과 기본 문구, `formatError`의 `false schema` 번역, 잔여 키 UI를 기본 렌더러가 제공하는지 — 모두 렌더 계층의 일이다(REACT-026).

【추론】 기본 렌더러는 잔여 키 전용 UI를 두지 않는다(REACT-026, REACT-031).
【추론】 잔여 키 오류(`rejectedKey`가 있는 오류)는 `dataPath`가 가리키는 호스트의 오류로 오늘처럼 호스트의 오류 렌더러에 그려진다(REACT-026, REACT-031).
【추론】 `not.required` 오류를 호스트에서 자식으로 옮기지 않는다(REACT-026, REACT-031).
【추론】 기본 문구는 오늘의 기본 `formatError`를 그대로 따른다(REACT-026, REACT-031).
【추론】 `presentation.errorMessages[keyword]`가 있으면 그것을, 없으면 검증기의 `message`를 쓴다(`src/helpers/error/formatValidationError/formatValidationError.ts`)(REACT-026, REACT-031).
【추론】 `false schema` 번역은 따로 두지 않는다(REACT-026, REACT-031).
【추론】 작성자가 `errorMessages`의 `'false schema'` 키나 자기 `formatError`로 번역한다(REACT-026, REACT-031).
【추론】 `rejectedKey`는 사용자 정의 렌더러와 `formatError`가 읽을 수 있는 칸으로 남는다(REACT-026, REACT-031).

### 1.8 입력 종류 판정과 union 기본 입력

Hint는 `{ type: node.type, schemaType: node.schemaType, nullable: node.nullable, path, required, jsonSchema, format, formType }`이다(REACT-032).
`FormTypeInputProps`의 `type`·`schemaType`·`nullable`은 Hint와 같은 값이고, 여기에 `typeMismatch`가 더해진다(REACT-032, SURFACE-061).
입력은 종류뿐 아니라 스키마 자신의 형도 알 수 있다(REACT-032).
`props.schemaType`은 `'integer'`를 보존한 계산된 허용 형이고, union이면 목록이다(REACT-032).
`props.jsonSchema`는 저자의 선언을 담은 유효 스키마이며, `jsonSchema.type`은 켜진 선언의 교집합이다(REACT-032).
노드, Hint, 입력 props에서 같은 이름은 같은 값이며, 오늘의 이름 함정(`hint.type`이 `node.schemaType`인 것)은 이것으로 사라진다(REACT-032).
시험 객체의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`formType`의 일곱이고, 대조 규칙은 오늘과 같다(시험 값이 스칼라면 `===`, 배열이면 "그중 하나")(REACT-032).
`FormTypeTestObject.type`은 `SchemaNodeType`이나 그 배열이며, `'union'`은 들고 `'integer'`는 없다(REACT-032).
`FormTypeTestObject.schemaType`은 `JSONSchemaType`이나 그 배열이며, `'null'`이 들고 배열은 "이 스칼라들 가운데 하나"라는 뜻이다(REACT-032).
union 노드의 배열 `schemaType`은 어떤 객체 시험과도 맞지 않으므로, union은 `{type:'union'}`이나 함수 시험으로 잡는다(REACT-032).
플러그인의 `{type:['number','integer']}` 시험은 `{type:'number'}`로 바꾸고, 정수만이면 `{schemaType:'integer'}`로 바꾼다(REACT-032).
함수 시험의 `type === 'integer'` 절은 죽은 조건이므로 지운다(TS2367로 드러남)(REACT-032).
mui 수 입력의 정수 판정은 `schemaType === 'integer'`로 바꾼다(REACT-032).

【추론】 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다(REACT-033).
【추론】 그래서 `['number','string']`에서 보내는 값은 늘 문자열이고(`"42"`는 이미 멤버), 게이트가 목록을 `['number']`로 좁힌 동안에는 `42`다(REACT-033).
【추론】 규칙 A를 미리 보는 공개 함수는 지금 내보내지 않으며, 입력은 `typeMismatch`로 결과를 보고, 함수를 나중에 더하는 것은 추가 변화다(REACT-033, SURFACE-061).
【추론】 시험 객체를 정규화할 때 일곱 키 밖의 키는 대조에서 빼고, 정의마다 한 번 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID`를 낸다(REACT-033).
【추론】 `type`에 적힌 `'integer'`도 어떤 노드와도 맞지 않으므로 같은 경고를 낸다(REACT-033).
【추론】 시험 대조의 예는 N1 = `['string','number']`, N2 = `['string','number','null']`, N3 = `['object','string']`, N4 = `['string','null']`, N5 = `['integer','null']`로 아래와 같다(REACT-033).
【추론】 `{type:'string'}`은 N4만 맞는다(종류가 string인 노드)(REACT-033).
【추론】 `{type:['string','number']}`는 N4·N5가 맞는다(string 종류 또는 number 종류이며 union이 아님)(REACT-033).
【추론】 `{type:'union'}`은 N1·N2·N3이 맞는다(모든 union)(REACT-033).
【추론】 `{type:'number'}`는 N5가 맞는다(정수 포함 모든 수 노드)(REACT-033).
【추론】 `{schemaType:'integer'}`는 N5가 맞는다(nullable 포함 정수 노드)(REACT-033).
【추론】 `{schemaType:['string','number']}`는 N4가 맞는다(`schemaType`이 `'string'`이나 `'number'`인 스칼라 노드)(REACT-033).
【추론】 `{type:'object'}`는 아무것도 맞지 않는다(N3은 object 노드가 아님)(REACT-033).
【추론】 `({type, schemaType}) => type === 'union' && schemaType.includes('object')`는 N3이 맞으며, 목록으로 가르는 union은 함수 시험으로 잡는다(REACT-033).
【추론】 입력을 고르는 순서는 그대로이고 union 전용 층은 두지 않는다: 인라인 `FormTypeInput` → `formTypeInputMap` → Form의 정의 → Provider의 정의 → `PluginManager` 목록(플러그인 정의가 앞, 코어 기본 정의가 뒤)이다(REACT-033).
【추론】 인라인이 `null`이면 입력을 그리지 않는다(REACT-033).
【추론】 union 항목이 없는 플러그인에서는 union이 코어 기본 정의로 떨어진다(REACT-033).
【추론】 경로 키가 union 칸 아래를 가리키는 `formTypeInputMap` 항목은 노드가 없으므로 맞지 않는다(NODE-020, REACT-033).
【추론】 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 된다(BLUEPRINT-042의 "새 입력을 두지 않으며"에 대한 보충)(REACT-033).
【추론】 그 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며 새 구성 요소가 아니고, 자리는 `FormTypeInputStringDefinition` 바로 앞이다(REACT-033).
【추론】 기본 입력은 유효 목록을 `props.schemaType`과 `props.jsonSchema.type`의 교집합으로 구하며, core와 같은 내부 함수를 쓰고 `jsonSchema` 참조로 메모한다(REACT-033).
【추론】 값이 `undefined`·`null`·문자열·수·불리언이고 유효 목록에 원시 형이 하나라도 있으면 글 상자를 보이며, 표시는 `String(value)`이고 `undefined`와 nullable 노드의 `null`은 빈 칸이다(REACT-033).
【추론】 빈 칸은 `undefined`를 보낸다(REACT-033).
【추론】 키 입력마다, 그리고 흐려질 때 그 순간의 유효 목록으로 `interpret`하고, 목록의 한 형이 되면 그 결과를 보낸다(REACT-033, REACT-027).
【추론】 목록의 한 형이 되지 않으면 보내지 않고 초안으로 들며, 흐려지면 표시를 노드 값으로 되돌린다(REACT-033, REACT-027).
【추론】 유효 목록이 바뀌면 지금 초안으로 판정을 다시 돌리고, 이제 목록의 한 형이 될 때만 보낸다(REACT-033, REACT-027).
【추론】 입력기 조합 중에는 보내지 않는다(REACT-033).
【추론】 객체·배열 값의 읽기 전용 표시(BLUEPRINT-036)에서 문자열화 결과는 값 참조로 메모하고, 문자열화가 던지면 무효 표지만 보인다(REACT-033, BLUEPRINT-036).
【추론】 유효 목록에 원시 형이 없는 union(`['object','array']`, 또는 교집합이 `{null}`인 빈 목록)에 값이 없으면 빈 읽기 전용 상자를 보인다(REACT-033).
【추론】 기본 입력으로는 그 값을 만들 수 없으며, 이는 문서에 적는 한계이고 편집기는 UI 플러그인이 맡는다(REACT-033).
【추론】 `typeMismatch`가 참이면 `aria-invalid`와 무효 표지를 붙이고, 경고등이 켜진 값을 빈 칸처럼 그리지 않는다(SURFACE-052, REACT-033, REACT-027, SURFACE-061).
【추론】 union 칸에 `enum`·`const`가 있어도 기본 입력은 문자열 입력이며, 기본 enum·radio 정의를 union에 열지 않는다(BLUEPRINT-042)(REACT-033).
【추론】 그래서 `['number','string']` + `enum:[1,'a']`에서 기본 입력으로 친 `"1"`은 문자열로 남고 검증기가 기각하며, 이 사용성 빈틈은 UI 플러그인이 메운다(REACT-033).
【추론】 `format`은 문자열 입력이 이미 하는 만큼(`password`·`email`)만 쓰며, 날짜 정의는 union에 걸리지 않는다(REACT-033).
【추론】 기본 입력이 약속하지 않는 것은 여섯이다: `string`이 유효 목록에 있을 때 다른 원시 형을 만드는 것, 객체·배열을 만들거나 편집하는 것, 편집 모드에서 `null`을 만드는 것, 문자열 표기가 겹치는 enum 리터럴을 가르는 것, `const`·`format`·`enum`의 의미, 모양과 접근성(REACT-033).
【추론】 `FormTypeInputProps` 주석과 플러그인 문서에 다음 계약 문구를 싣는다(REACT-033).
union 입력은 `type === 'union'`일 때 다음을 읽는다(REACT-033). `schemaType`: 목록이며, 순서에 core의 뜻은 없다(REACT-033). `nullable`, `value`, `typeMismatch`, `required`(REACT-033, SURFACE-061). `jsonSchema`: `jsonSchema.type`은 켜진 선언의 교집합이며, 형 없는 칸에서는 없을 수 있다(REACT-033). 게이트가 좁힌 목록은 `schemaType`과 `jsonSchema.type`의 교집합이다(REACT-033).
보내는 값은 JSON 형이 목록에 있는 값이나 `undefined`다(REACT-033). `null`은 nullable일 때 비우기 조작으로만 보내고, 빈 칸은 `undefined`로 보낸다(REACT-033). `value`는 어긋난 값일 수 있으므로 `onChange`보다 넓은 형이다(REACT-033).
치다 만 글과 입력기 조합 중인 글은 입력이 초안으로 들고, 흐려지면 노드 값으로 되돌린다(REACT-033).
목록 밖의 값을 보내도 오류가 아니고 버려지지도 않는다(REACT-033). core의 규칙 A가 받아서, 받아 줄 형이 정확히 하나면 그 형으로 바꾸고, 아니면 그대로 두고 경고등을 켠다(REACT-033). 게이트가 목록을 좁힌 동안에는 좁혀진 목록으로 해석한다(REACT-033). 입력은 이 결과를 다음 렌더의 `typeMismatch`로 안다(REACT-033, SURFACE-061). `typeMismatch === false`는 검증 통과가 아니다(REACT-033, SURFACE-061).
객체·배열 값은 불변으로 다룬다(REACT-033). 바꿀 때는 새 참조를 보내고, 받은 값을 제자리에서 바꾸지 마라(REACT-033). 값 안에 JSON이 아닌 것(`undefined`인 키, `Date` 등)을 넣지 마라(REACT-033).
목록의 순서에 기대지 마라(REACT-033). core가 사용자가 뜻한 형을 골라 준다고 가정하지 마라(REACT-033).
PR: PR-7(렌더 계층과 바인딩)(REACT-033).
무엇: `src/__tests__/scenarios/union.input-binding.render.test.tsx`(시험 대조의 모든 칸, 인라인 우선, `FORM_TYPE_TEST_INVALID` 1회, `{typo: undefined}`의 대조, 정수 노드 props의 `type === 'number'`와 `schemaType === 'integer'`), `union.default-input-draft.render.test.tsx`, `union.object-array.render.test.tsx`의 기본 입력 부분을 돌린다(REACT-033).
통과: 초안·표시·비우기·무효 표시와 시험 대조가 위대로다(REACT-033).
실패: 기본 입력이 목록 밖 값을 보내거나 초안을 쓰면 감싸개를 고치고, 규칙이 입력 사례를 하나로 정하지 못하면 이 블록을 고친다(REACT-033).

### 1.9 React 지원과 플러그인 호환성

**React 18 — 확정(답 5).**(REACT-017) PR-7에 React 18 실행 시험을 둔다(REACT-017).

- PR: PR-7(React 18 실행 시험을 두는 PR)(REACT-017).
- 무엇: 이벤트 스파이크(`spikes/events/`)에 이펙트 되먹임 사례를 더한다(REACT-017).
- 무엇: `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드를 만들고, React 18과 19에서 각각 실행한다(REACT-017).

【추론】 기대는 것이 없다(REACT-030).
UI 플러그인 넷(antd5·antd6·antd-mobile·mui)과 패키지의 기본 정의(`src/formTypeDefinitions`)를 읽었다(REACT-030).
배열 입력은 모두 `node.push()`·`node.remove(index)`를 반환값을 버린 채 부른다(REACT-030).
`await`·`.then`은 한 곳도 없다(예: `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputArray.tsx:29-34`, `src/formTypeDefinitions/FormTypeInputArray.tsx:18,22`)(REACT-030).
`UpdateValue` 구독, `NodeEventType`, `useSchemaNodeSubscribe`·`useSchemaNodeTracker`를 쓰는 플러그인 입력도 없다(REACT-030).
입력은 `value`/`onChange`로 제어하거나 `defaultValue`로 비제어한다(REACT-030).
이펙트는 Uri 입력의 프로토콜 초기화 하나뿐이며 통지 시점에 기대지 않는다(`FormTypeInputUri.tsx:132`)(REACT-030).
【추론】 그러므로 T-7(배열 연산의 동기화, 파괴적 변경)과 T-1(통지는 늘 동기)은 저장소의 플러그인을 깨지 않는다(REACT-030).
【추론】 사용자가 직접 구현한 FormTypeInput은 이 확인 범위 밖이다(REACT-030).
【추론】 배열 연산이 Promise를 돌려주지 않는다는 점은 이주 안내에 남긴다(T-7의 파괴적 변경 행과 같다)(REACT-030).

## 2. 공개 표면

### 2.1 공개 이름의 원칙

소유자 규칙 "전체 일관성이 유지된다면 가독성 높고 명료한, 줄임말이 아닌 풀 네임"과 저장소의 기존 관례(속성 `showError`와 열거형 `ShowError`의 짝, 칸 `state`·이벤트 `UpdateState`·콜백 `onStateChange`의 삼중 짝, 쓸 수 있는 칸 `x`에는 `setX`)로 만든 제안이다(소유자 답(`reviews/round-7-convergence.md:144`), 편집자 결정(8라운드 이름 짓기, `06-conclusions.md:324`; 저장소 관례의 짝))(SURFACE-023). 소유자(7라운드): "이름은 기존 프로젝트의 네이밍 규칙에 맞게 정해도 된다 — 전체 일관성만 유지된다면 가독성 높고 명료한, 줄임말이 아닌 풀 네임."(SURFACE-023).

`FormType…`은 노드 단위 조각과 그것을 그리는 것이고 플러그인이 등록하며 Form 속성이 덮고 스키마 `presentation`이 노드별로 고르거나 props를 준다(SURFACE-016). `…Renderer` 접미는 그리는 것이다(SURFACE-017). `Form.X`는 `path`를 받는 합성 API이고 props는 `FormXProps`다(SURFACE-018). 구성 요소를 담는 키는 파스칼(React의 구성 요소 값 관례)이고 props 객체 키는 그 props 타입의 이름을 그대로 쓴다(키와 타입의 1:1 연결)(SURFACE-019).

이 패키지에서 `controls`는 규칙이지 입력 위젯이 아니고, `Group`은 한 필드 단위(라벨·입력란·오류)이지 여러 컨트롤의 묶음이 아니다(SURFACE-020). **기록만.**(SURFACE-020) 소유자가 고른 이름이고 규칙 위반이 아니다(SURFACE-020).

【추론】 이름의 맨앞에 홀로 선 `Node`만 바꾼다(SURFACE-056). 【추론】 개명은 둘이다: `NodeState` → `SchemaNodeState`, `NodeEventType`(공개 별칭, 오늘 `src/index.ts:44`의 `PublicNodeEventType as NodeEventType`) → `SchemaNodeEventType`(SURFACE-056). 【추론】 종류나 역할의 낱말이 이름공간을 좁히는 이름은 그대로 둔다: 종류 형 일곱(`ArrayNode`·`BooleanNode`·`NullNode`·`NumberNode`·`ObjectNode`·`StringNode`·`VirtualNode`), 가드(`isArrayNode` 등과 `isBranchNode`·`isTerminalNode`), `FormTypeInputPropsWithNode`, `ChildNodeComponentProps`, 훅 `useChildNodeComponentMap`·`useChildNodeErrors`(`src/index.ts:60,64,82-83`)(SURFACE-056). 【추론】 범위 문장은 "`Node`를 이름의 맨앞에 홀로 쓰지 않는다."이다(SURFACE-056). 【추론】 종류·역할 낱말이 앞에 붙은 `…Node`는 NODE-011의 "아주 좁은 이름공간"으로 본다(SURFACE-056, NODE-011). 【추론】 NODE-041의 새 가드 `isUnionNode`도 이 규칙으로 짓는다(SURFACE-056, NODE-041, BLUEPRINT-035). 【추론】 `NodeStateFlags`는 `src/index.ts`가 이름으로 내보내지 않고 `components/Form/type.ts:58,118-119`의 형으로만 닿으므로 개명 목록에 들지 않는다(SURFACE-056). 【추론】 `NodeStateFlags`에는 새 코드가 NODE-011을 적용한다(SURFACE-056, NODE-011). 【추론】 새 이름의 공개 형은 PR-2의 `SchemaNode/type.ts`가 처음부터 쓰고, 소비자 이주는 PR-7이다(SURFACE-056).

안쪽 코드도 공개 형과 같은 이름을 쓴다(SURFACE-060). SURFACE-056의 두 개명(`SchemaNodeState`, `SchemaNodeEventType`)은 공개 표면과 안쪽 코드에 함께 적용되며, 한 형에 한 이름이고 별칭을 두지 않는다(SURFACE-056, SURFACE-060, NODE-011). 소유자(18C 검토 3번): "3번, 내부에서도 통일"(SURFACE-060).

### 2.2 공개 표면의 자리

(SURFACE-001, SURFACE-002, SURFACE-003, SURFACE-004, SURFACE-005, SURFACE-006, SURFACE-007, SURFACE-008, SURFACE-009, SURFACE-010, SURFACE-011, SURFACE-012, SURFACE-013, SURFACE-014, VALUE-029, NODE-041, BLUEPRINT-035, SURFACE-058, SURFACE-053, EVENT-063, WRITE-085, SURFACE-055, NODE-043, SURFACE-054, EVENT-073)

| 자리 | 이름 | 뜻 |
| --- | --- | --- |
| 스키마 그룹 | `controls`, `options`, `presentation` | CONTROLS-001. 맨 키는 JSON Schema의 것 |
| 렌더 계층(노드 단위) | `FormTypeInput`과 정의 목록 `formTypeInputDefinitions`. 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`(넷 모두 플러그인 키이자 같은 이름의 Form 속성. 오늘의 `FormGroup`·`FormLabel`·`FormInput`·`FormError`와 `CustomFormTypeRenderer`). 공통 props `FormTypeRendererProps`, 문맥 `FormTypeRendererContext` | 15라운드 |
| 합성 API | `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`·`Form.Render`와 props `FormGroupProps`·`FormLabelProps`·`FormInputProps`·`FormErrorProps`·`FormRenderProps`. `path`를 받아 그 노드의 일부를 그리며 `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`는 같은 이름의 `FormTypeXRenderer`를 부르고 `Form.Render`는 소비자가 직접 그린다 | 그대로 |
| 쓰기 옵션 | `SetValueOption.Overwrite`(기본), `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites` | WRITE-015 |
| 쓰기 | `setValue(value 또는 updater, option?)`, `FormHandle.reset(option?)`(억제 비트 둘만, WRITE-015), 배열 `push`·`pop`·`update`·`remove`·`clear` | `setSelectedBranch`는 없다 |
| 값 읽기 | `value`(합성 값), `outputValue`(방출 값, 옛 `normalizedValue`), 노드마다 getter `inactiveValues` | `FormHandle.getValue()`는 루트의 `outputValue` |
| 진단 | `diagnostics`, 이벤트 `UpdateDiagnostics`, Form 속성 `onDiagnosticsChange` | EVENT-043 |
| 배치 | `batch(fn)` | EVENT-013 |
| 경로 조회 | `find(path)`, `findNodes(path)` | 터미널 아래 경로는 노드 없음. 노드 메서드 `findAll`은 `findNodes`로 바뀐다(LANDING-049) |
| 노드 | 상속 없는 단일 클래스 `SchemaNode`. 식별 게터 `type`과 `strategy`(`'branch'` 또는 `'terminal'`, 옛 `group`). 가드 열(`isBranchNode`·`isTerminalNode`는 `strategy`를 보며 이름을 유지한다. `isUnionNode`가 더해져 가드는 열이다) | NODE-002. 필드 `behavior`·`runtime`은 공개 형에 싣지 않는다. 멤버 목록은 공개 겉면의 `DETAIL.md`와 멤버 목록 시험이 정하며, 루트 전용 넷·명령(종류를 매개변수로 받는 메서드 하나)·`defaultValue`·`resetSubtree`·`context`는 남고 `subnodes`·`schemaPath`·`key`와 임의 사건을 내는 공개 `publish`는 빠지되, 그 메서드의 이름 후보에 명령 사건에 한정한 `publish` 부활이 들며 이름은 PR-4 착수 전에 소유자가 정한다 |
| 명령 | `focus`, `select`, `refresh`, `remount` | 원본을 쓰지 않는다 |
| Form 속성(렌더 계층) | `readOnly`, `disabled`(전체 잠금, 참일 때만), `unsetOnInactive`(나감 정책의 포괄 층), `disableAutomaticWrites`(억제 기본값), `onError`(검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자, ERROR-094. 검증 결과는 `onValidate`. 가칭 `onListenerError`를 흡수한다. `throwOnBudgetExceeded`는 없다, 17라운드 소유자 답 R17-1 나), `onDiagnosticsChange`, `validatorFactory`(그 폼만의 검증기 인스턴스, `compile` + `compileGuard`) | CONTROLS-045, WRITE-031, WRITE-015, VALIDATE-040 |
| 검증기 플러그인 계약 | `compile`, `compileGuard`, `rejectedKey` | VALIDATE-015, FRAGMENT-020 |
| 오류 클래스 | `JSONSchemaError`(throw), `SchemaFormError`, `ValidationError`, `UnhandledError`, 인터페이스 `ValidationIssue`, 기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭. 코드 목록은 공개 계약, ERROR-164) | ERROR-065 |

그룹 이름은 명사이고 수는 뜻을 따른다(SURFACE-001). 셀 수 있는 항목의 지도는 복수(`controls`, `options`), 하나의 면은 단수(`presentation`)다(SURFACE-001).

한 단위(라벨+입력란+오류)를 그리는 것은 오늘 플러그인 `FormGroup`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer`, 대체 구현 `FormGroupRenderer`이고, 새 이름은 `FormTypeGroupRenderer`(플러그인 키·Form 속성·타입이 같은 이름), 대체 구현 `FallbackFormTypeGroupRenderer`다(SURFACE-002). 라벨을 그리는 것은 오늘 플러그인 `FormLabel`, 대체 구현 `FormLabelRenderer`이고, 새 이름은 `FormTypeLabelRenderer`, `FallbackFormTypeLabelRenderer`다(SURFACE-002). 입력란 자리를 그리는 것(`FormTypeInput`을 앉힌다)은 오늘 플러그인 `FormInput`, 대체 구현 `FormInputRenderer`이고, 새 이름은 `FormTypeInputRenderer`, `FallbackFormTypeInputRenderer`다(SURFACE-002). 오류를 그리는 것은 오늘 플러그인 `FormError`, 대체 구현 `FormErrorRenderer`이고, 새 이름은 `FormTypeErrorRenderer`, `FallbackFormTypeErrorRenderer`다(SURFACE-002).

이름 없는 형 `FormGroup`·`FormLabel`·`FormInput`·`FormError`·`FormRender`는 합성 구성 요소만 가리키게 된다(플러그인 키가 옮겨 가므로 충돌이 사라진다)(SURFACE-003).

쓰기의 종류는 호출자가 선언하고 core는 추론하지 않는다(도출 D-4)(SURFACE-004, WRITE-006). `setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(SURFACE-004, WRITE-090). `Merge`는 준 키만 쓰는 부분 쓰기이며 준 배열은 통째 교체다(SURFACE-004). 억제 비트는 그 호출이 일으킨 자동 쓰기에 적용되므로 `Merge`에 주면 통째 교체된 배열 아이템의 채움도 막는다(SURFACE-004). 억제 비트가 둘인 이유는 상속, 끄기, 켜기의 세 상태 때문이다(SURFACE-004, WRITE-015). 호출에 둘 다 없으면 Form 속성 `disableAutomaticWrites`를 따르고, 둘 다 주면 억제가 이긴다(SURFACE-004). 공개 열거형 `SetValueOption`(내부 이름 `PublicSetValueOption`, 오늘과 같음)에 멤버는 넷이다(SURFACE-004). 공개 합성 멤버(`Reset`, `StableReset` 등)는 두지 않는다(SURFACE-004).

같은 비트가 `reset`과 마운트(`defaultValue`)에도 든다(SURFACE-005, WRITE-015). 배열은 `push(value?)`(`unlimited` 인자는 뺀다 — 코어가 `maxItems` 초과를 막지 않으므로 무시할 제약이 없다), `pop()`, `update(index, value)`, `remove(index)`, `clear()`다(SURFACE-005). 【추론】 `node.resetSubtree()`는 진입 하나에서 `clearSubtreeState()`를 한 뒤 `node.defaultValue`를 그 하위 트리에 로드한다(SURFACE-005).

`value`는 합성 값(`local`)이고, `outputValue`는 방출 값(`emit`), 옛 `normalizedValue`다(SURFACE-006). 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(SURFACE-006, VALUE-029). `inactiveValues`는 형상에 없는 노드의 원본을 읽기 전용으로 열거한다(SURFACE-006, VALUE-029). 이름은 표대로 확정한다(소유자 답 12-8)(SURFACE-006). 【추론】 `node.defaultValue`는 `getIn(snapshot, node.path)`다(SURFACE-006).

노드 칸 `diagnostics`는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화하므로 마지막 폼 수준 로드 이후의 기록이며, `resetSubtree()`와 `setValue(V)`는 초기화하지 않는다(SURFACE-007, ERROR-204). `status`는 `'stable'` 또는 `'degraded'`이고, `cause`(예산·식·대상·공유 충돌), `exceededBudget`(정착의 세 예산), `iterations`, `commit`을 든다(SURFACE-007). 루트에서 관측한다(SURFACE-007). `degraded`는 다음 로드(폼 수준 로드인 마운트·`FormHandle.reset()`)까지 남고(지속은 14라운드 답 O-2 가) 그 동안 폼의 제출 경로가 `SchemaFormError`로 거부한다(`getValue()`는 막지 않는다, 17라운드 소유자 답 R17-1 나)(SURFACE-007, ERROR-204). 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고(WRITE-090), `setValue(V)`와 `resetSubtree()`는 `degraded`를 비우지 않으며, `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다(SURFACE-007, WRITE-090, ERROR-204). 되먹임·중첩 초과는 사슬 끝에서 던지되 `diagnostics`에 남기지 않고 제출을 막지 않는다(O-2는 정착 예산에 대한 답이다)(SURFACE-007). 모양은 ERROR-130·ERROR-131이다(SURFACE-007, ERROR-130, ERROR-131). 이벤트 `UpdateDiagnostics`는 `diagnostics`가 바뀐 커밋에만 낸다(SURFACE-007, EVENT-043). Form 속성 `onDiagnosticsChange`는 호스트가 진단 상태를 관측하는 자리다(SURFACE-007, EVENT-044). 제출이 막힐 때 호스트는 이것과 제출 거부의 `SchemaFormError`로 폼 수준 표시를 그린다(17라운드 소유자 답 R17-1 나)(SURFACE-007). 끄는 스위치(`throwOnBudgetExceeded`)는 없다(SURFACE-007).

`batch(fn)`은 fn 안의 쓰기를 표시만 하고 끝에서 정착 한 번, 통지 한 번을 낸다(SURFACE-008, EVENT-013). 중첩은 가장 바깥이 이긴다(SURFACE-008). 정착 횟수가 바뀌므로 채움과 `controls.injectTo`의 결과가 순차 호출과 다를 수 있다(SURFACE-008). `batch(callback)`은 루트와 `FormHandle`에 있다(SURFACE-008).

터미널 노드 아래의 경로는 `find(path)`와 `findNodes(path)` 둘 다 노드 없음으로 답한다(SURFACE-009, NODE-020). 공개 API가 객체를 조용히 파괴하면 안 되기 때문이다(SURFACE-009, NODE-020). 노드 메서드 `findAll`은 `findNodes`이고, `FormHandle`은 이미 `findNodes`다(SURFACE-009, LANDING-049).

`type`과 `strategy`는 노드가 든 동작 행에서 읽는 게터다(SURFACE-010, NODE-002). `strategy`는 `'branch'` 또는 `'terminal'`이며 옛 `node.group`의 새 이름이다(값은 그대로, 17라운드 소유자 답)(SURFACE-010, NODE-003).

`focus`, `select`(텍스트 선택), `refresh`, `remount`는 렌더러와 무관한 표현 계층의 어휘이며 원본을 쓰지 않는다(4라운드 소유자 답 D-9)(SURFACE-011). `refresh`가 비용을 숨긴다는 지적이 있으나 오늘의 공개 이벤트 이름과 함께 바꿔야 하므로 유지가 1순위다(SURFACE-011). 소유자(설계서 메모 3): "이 4개 기능을 4개로 분할해서 두지 말고 하나의 메소드에 여러 행위 타입을 파라미터로 받아서 행동하게 해줘."(SURFACE-011). 반영 칸: 노드 겉면에 명령 메서드 넷을 따로 두지 않고, 명령 종류를 매개변수로 받는 메서드 하나로 합친다(SURFACE-011, EVENT-073). 명령 넷은 따로 둔 메서드 넷이 아니라 명령 종류를 매개변수로 받는 노드 메서드 하나다(SURFACE-011, EVENT-073). 이름 후보는 `action`·`interaction`·`request`, 또는 명령 사건에 한정한 `publish` 부활이며, 메서드 이름은 PR-4 착수 전에 소유자가 정한다(SURFACE-011, EVENT-073).

`onError`는 흐름을 바꾸지 못하며(던질 것은 던지고 기본 출력도 그대로), 핸들러가 없으면 비용이 없다(17라운드 스웜 수렴(편집자 결정), 17라운드 4번 수렴의 안 B)(SURFACE-012, ERROR-096, ERROR-098). 받는 것·받지 않는 것·기록 모양은 ERROR-014·ERROR-100·ERROR-101·ERROR-017이다(SURFACE-012, ERROR-014, ERROR-100, ERROR-101, ERROR-017).

### 2.3 공개 쓰기와 분기 명령

설계 4차 본문은 옵션 객체 `{ mode?: 'Overwrite' | 'Merge'; disableDefaultInjection?: boolean }`를 적었으나, 소유자가 비트마스크를 택했다(SURFACE-024). 소유자(7라운드): "쓰기 옵션은 옵션 객체가 아니라 비트마스크로 `|`로 묶어 쓴다."(SURFACE-024).

**`write`.**(SURFACE-034) 공개 API로 필요 없다(SURFACE-034). 입력의 `onChange`가 부르는 `setValue`에 내부 출처 비트로 흡수된다(SURFACE-034).

(SURFACE-039, WRITE-015, WRITE-078, WRITE-090, WRITE-097, WRITE-100)

| 대상 | 이름 | 비고 |
| --- | --- | --- |
| 로드 시 예약 층의 자동 쓰기 억제 | `SetValueOption.DisableAutomaticWrites` / `SetValueOption.EnableAutomaticWrites`, Form 속성 `disableAutomaticWrites` | 06의 `DisableSchemaDefaults`를 대체. 오늘 내부 플래그 `Automatic`("폼이 스스로 쓴 값")의 어휘. 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부(채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움)이고 로드 값 자체는 막지 않는다. 포커스 아웃 `trim`이 자른 값의 쓰기는 Form 속성으로 억제되는 자동 쓰기다. `controls.active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 둘 다 없으면 Form 속성을 따르고 둘 다 주면 억제가 이긴다 |

`setValue(V)`는 로드가 아니라 전체 교체 쓰기이며, 억제 비트의 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부다(SURFACE-039, WRITE-090, WRITE-097). 포커스 아웃 `trim`이 자른 값의 쓰기도 자동 쓰기이고 억제 비트의 대상이다(SURFACE-039, WRITE-078). 다만 이 셀의 목록은 그 호출이 일으킨 쓰기이고, 뒤이은 포커스 아웃의 `trim`은 그 호출이 일으킨 것이 아니어서 호출 수준 비트에는 들지 않으며 Form 속성 `disableAutomaticWrites`에만 든다(SURFACE-039, WRITE-100). 이 범위는 문서 주석에 적는다(SURFACE-039).

(SURFACE-045)

| 06 | 판정 | 내용 |
| --- | --- | --- |
| N2 분기 선택 명령 | 지워짐 | `setSelectedBranch`, `selectedBranch`, `activeBranch` 모두 사라진다. 오늘의 `oneOfIndex`·`anyOfIndices`도 대체물 없이 사라진다(분기의 필드는 노드이고 활성 여부는 노드의 `active`로 읽는다) |

`scope`, `variant`, `oneOfIndex`, `anyOfIndices`, `initialized`는 공개 겉면에서 빠진다(SURFACE-045). 오늘 탐색이 `variant`에 기대는 점은 NODE-043이다(SURFACE-045, NODE-043).

【추론】 `Overwrite`와 `Merge`는 서로 겹치지 않는 비트다(SURFACE-051). 【추론】 둘을 함께 주면 `INVALID_WRITE_OPTION`이다(SURFACE-051). `Overwrite`가 전체 교체이자 기본값이고 `Merge`가 부분 쓰기인 것은 오늘과 같다(SURFACE-051).

### 2.4 값 읽기와 핸들

`FormHandle.getValue()`는 유지하며 루트의 `outputValue`와 같다(SURFACE-031). 노드에 `getValue()` 메서드는 따로 두지 않는다(`node.value`와 뜻이 다르면 이름만 보고 속는다)(SURFACE-031). `enhancedValue`는 사라진다(오늘도 내부 이름이다)(SURFACE-031). `setValue(updater)`는 유지하고 `prev`는 `value`다(SURFACE-031). 다만 `batch(fn)` 안에서 `prev`는 직전 커밋에 앞선 표시를 얹은 값이고, `batch` 밖에서는 그대로 맞는다(SURFACE-031, EVENT-061).

노드의 공개 이름은 `value`(합성 값)와 `outputValue`(방출 값)로 확정한다(SURFACE-050). `FormHandle.getValue()`는 이름 그대로 두고 루트의 `outputValue`를 돌려준다(폼 밖에서는 둘을 구분할 필요가 없다)(SURFACE-050). `submit`은 폼 제출 제어에 쓰는 낱말이라 값 이름에 쓰지 않는다(SURFACE-050). 노드 인터페이스의 관례는 getter이고 `get~()` 함수는 두지 않는다(SURFACE-050).

### 2.5 노드의 공개 멤버와 신원

【추론】 `globalState`·`globalErrors`(게터)와 `setSubtreeState(state)`·`clearSubtreeState()`는 모든 노드의 멤버로 남긴다(SURFACE-053). 【추론】 두 게터는 트리 전체의 값을 든 런타임을 읽는 문장 하나다(SURFACE-053). 【추론】 어느 노드에서 읽어도 같다(오늘과 같음)(SURFACE-053). 【추론】 두 메서드는 그 노드의 하위 트리에 거는 `dispatch` 진입이다(SURFACE-053). 【추론】 `FormHandle`의 `getState`·`setState`·`clearState`·`getErrors`는 오늘처럼 루트에 위임한다(SURFACE-053).

【추론】 노드의 공개 `schemaPath`·`key`는 두지 않는다(SURFACE-054). 【추론】 공유 노드는 선언이 여럿이라 스키마 위치 하나로 정의되지 않는다(SURFACE-054). 【추론】 에러 라우팅의 키는 청사진 항목의 `id`(작성된 스키마 위치)이고 `validation` 안에서만 쓴다(SURFACE-054). 【추론】 React key와 구성 요소 캐시의 키는 바인딩이 노드 인스턴스의 신원으로 짓는다(예: 노드를 키로 한 `WeakMap`의 일련번호)(SURFACE-054). 【추론】 같은 이름·다른 종류로 바뀌면 인스턴스가 달라 다시 마운트된다(SURFACE-054). 【추론】 오늘 `schemaPath`를 넣은 key와 같은 효과다(SURFACE-054). 【추론】 공유 노드와 배열 아이템(계승 제약 T-22(배열 아이템의 React key는 생성 순서의 nonce))은 인스턴스가 이어지는 동안 다시 마운트되지 않는다(SURFACE-054, GOAL-073). 【추론】 통째 쓰기에서 아이템 인스턴스가 이어지는지는 NODE-051이 정한다(SURFACE-054, NODE-051).

【추론】 `node.context`는 루트의 맥락 객체(같은 참조)를 돌려주는 getter로 남긴다(SURFACE-055). 【추론】 맥락의 갱신은 `finishInput`처럼 바인딩 전용 내부 통로(NODE-010)이며, 가칭 `setContext`다(SURFACE-055, NODE-010). 【추론】 `FormTypeInputProps.context`도 오늘처럼 남기며, 루트의 맥락 객체(`node.context`와 같은 참조)를 준다(SURFACE-055).

【추론】 이 결정들을 적용하면 겉면 멤버는 확정분 약 44개(`reviews/raw-round17-node-structure.md:136`, `getInactiveValues`는 VALUE-029의 게터 `inactiveValues`로 셈)에 명령 넷을 합친 메서드 하나(EVENT-073), 루트 전용 넷, `defaultValue`·`resetSubtree`, `context`, 게터 `typeMismatch`·`typeMismatches`(SURFACE-061)를 더한 약 54개다(SURFACE-058, SURFACE-010, EVENT-073, SURFACE-061). 【추론】 `subnodes`·`schemaPath`·`key`와 임의 사건을 내는 공개 `publish`는 빠지되, 명령 종류를 매개변수로 받는 메서드 하나의 이름 후보에 명령 사건에 한정한 `publish` 부활이 들고 이름은 PR-4 착수 전에 소유자가 정한다(SURFACE-058, SURFACE-010, EVENT-073).

### 2.6 값 형식 불일치의 공개 이름

【추론】 공개 이름은 노드 getter `typeMismatch: boolean`이다(SURFACE-052, SURFACE-061). 【추론】 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`와 짝을 이뤄 검색된다(SURFACE-052, SURFACE-061). 【추론】 공개 노드 형은 이 칸을 판별자로 한 합집합이다(SURFACE-052). 【추론】 `false`이면 `value`가 그 형의 값·`undefined`·(nullable이면) `null`이고, `true`이면 `unknown`이다(SURFACE-052). 【추론】 입력 구성 요소는 `FormTypeInputProps`의 같은 이름 칸으로 받는다(SURFACE-052).

【추론】 `typeMismatch`가 `false`인 멤버의 `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙는다(SURFACE-052, SURFACE-061). 【추론】 노드 형에는 제네릭을 두지 않으며, 목록 형으로 좁히는 것은 `FormTypeInputProps`가 맡는다(SURFACE-052). 【추론】 props의 `onChange`는 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받는다(SURFACE-052).

게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(SURFACE-061, REACT-027, REACT-032, REACT-033, SURFACE-010, SURFACE-052, SURFACE-058). `mismatch`만은 검증기의 다른 불일치와 구별되지 않아 버리고, `value` 접두는 노드 게터·props에서 군더더기라 뺐다(SURFACE-061). 뜻은 그대로다: `schemaType`(게이트가 켜진 동안은 유효 목록)과 `nullable` 기준의 값 형 불일치이며 `false`는 검증 통과가 아니다(SURFACE-061, VALUE-037). 문서 주석에 "`node.type`이 아니라 `schemaType`·유효 목록 기준"을 한 줄 적는다(SURFACE-061). 시험 파일 이름 `union.mismatch-light.test.ts`는 그대로이고, 시험이 부르는 게터·코드 이름은 확정 이름이다(SURFACE-061).

### 2.7 이벤트와 기존 공개 계약

【추론】 공개 이벤트 타입(오늘 `PublicNodeEventType`의 자리, 공개 이름 `SchemaNodeEventType`, SURFACE-056)에 넣어 `node.subscribe`로 받는다(SURFACE-057, SURFACE-056). 넣는 것은 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭)다(SURFACE-057, EVENT-064). 【추론】 공개 소비자는 `node.subscribe`·`useSchemaNodeSubscribe`(`src/index.ts:80`)로 `node.jsonSchema`를 읽는 입력 작성자다(SURFACE-057). 【추론】 더하는 것이므로 minor다(SURFACE-057).

【추론】 원장의 결정이나 이주 행이 바꾸거나 없앤다고 적지 않은 오늘의 공개 표면은 이름·시그니처·뜻을 그대로 둔다(SURFACE-059). 【추론】 `Form` props(`src/components/Form/type.ts`의 `FormProps` 열아홉 칸)와 `FormHandle`의 열여섯 멤버가 모두 이 규칙을 따르며, 바뀌는 칸과 멤버는 원장의 결정이 정하고 LANDING의 이주 행이 적는다(SURFACE-059). 【추론】 `ValidationMode`(`OnChange`·`OnRequest`·`None`)는 그대로다(SURFACE-059). 【추론】 오늘의 공개 이벤트 형 여섯(`UpdateValue`·`UpdateState`·`UpdateError`·`RequestFocus`·`RequestSelect`·`RequestRemount`)은 모두 남는다(SURFACE-059). 【추론】 `UpdateError`는 검증 결과가 자기 파동으로 배달하는 오류 갱신(EVENT-046)의 비트다(SURFACE-059, EVENT-046). 【추론】 새 공개 이벤트 형과 `UpdateValue`의 출처 칸(EVENT-060)은 더하는 변화이므로 이주 행이 아니라 새 기능 안내에 적는다(SURFACE-059, EVENT-060). 【추론】 공개 여섯 밖의 오늘 이벤트 종류는 공개 표면이 아니므로 새 설계가 이주 행 없이 바꾼다(SURFACE-059).

- PR: PR-7(이주 점검)(SURFACE-059).
- 무엇: `FormProps` 열아홉 칸, `FormHandle` 열여섯 멤버, 공개 이벤트 형 여섯을 하나씩 원장의 결정·이주 행과 대조한다(SURFACE-059).
- 통과: 바뀌는 것마다 이주 행이 있다(SURFACE-059).
- 실패: 빠진 이주 행을 더한다(SURFACE-059).
