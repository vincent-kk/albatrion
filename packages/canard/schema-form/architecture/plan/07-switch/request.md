# 07 전환 — 개발요청서 (원샷)

> 원장 정본: LANDING-067(정의)·087(정착 지도)·095(보정), LANDING-071·072(위험과 쪼갤 수 없는 이유), LANDING-159(레거시 규칙)·205(보존)·206(UI 플러그인은 08), LANDING-198(이주 점검). 규칙은 REACT·SURFACE·LANDING(이주 표) 영역. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산 순서 07. base `1.0.0-beta`, 브랜치 제안 `feat/schema-form-switch`. 의존 02–06 전부. 어느 것과도 합치지 않는다.
- 원샷이다: 옛 엔진과 새 엔진은 값의 소유·통지·분기가 달라 `<Form>`이 둘을 동시에 섬길 수 없다(LANDING-072). 사용자 관점의 동작이 처음 검증되는 곳이며 위험이 여기 모인다(LANDING-071).
- UI 플러그인 넷의 이주는 08이 한다. 이 PR은 **기본 입력으로 검증**한다(LANDING-206).
- `src/__legacy__/`는 지우지 않는다. 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검한다(LANDING-205).

## 목적

`<Form>`을 새 엔진 위에 다시 세운다.

## 범위 — 원장이 정한 내용

- **엔진 전환**: `nodeFromJSONSchema`를 새 엔진 위에 다시 짓고, React 바인딩(`providers`·`hooks`·`components`)을 새 값 채널(`value`·`outputValue`)과 통지에 연결, `core/index.ts`의 수출을 `src/core/SchemaNode/` 진입점으로(LANDING-067·087). `core/types`의 event·state·value는 남고 node·constructor는 지운다.
- **Form 속성**: `readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`, 렌더러 넷(LANDING-067). 원장이 바꾸지 않은 공개 표면은 그대로(SURFACE-059).
- **바인딩 계약 다섯**(LANDING-095): 마운트 로드 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤 한 번, 마운트 로드의 검증 요청은 준비 시점에, 루트·필드 바운더리의 가두고 보고하기, `degraded` 동안의 제출 거부(네이티브 submit은 `onError`와 싱크로), 청사진 오류의 대체 화면.
- **입력**: `SchemaNodeInput`의 `Blurred` → `finishInput`(`options.trim`은 문자열 행의 `finishInput` 칸), 세 진입을 `batch` 하나로, 입력 출처 표식, 자식 프록시의 마운트 여부로 입력 판정(REACT-028), 입력 구성 요소의 계약(REACT-027), 기본 union 입력(`{type:'union'}` 감싸개, 유효 목록 기준의 초안·표시·비우기, 시험 객체의 모르는 키, REACT-033), Hint·props의 `type`·`schemaType`·`nullable`·`typeMismatch`(REACT-032, SURFACE-061), `UnionNode`의 공개 수출(NODE-058).
- **`reset`의 로드 전환**: 같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, Refresh 번호와 상호작용 초기화 번호, 로드의 검증 규칙(마운트 포함); 로드가 아닌 쓰기는 원본이 실제로 바뀐 노드에만 Refresh(LANDING-067·095의 충돌 줄, EVENT-071). `Form`의 스키마 `clone` 제거.
- **`onError`의 렌더 계층**: 바깥 감싸개와 인스턴스 보고기 문맥, 준비 이펙트·대체 화면 이펙트 전달, 바운더리의 `componentStack`, `@winglet/react-utils` ErrorBoundary의 선택 인자와 changeset(`minor`)(LANDING-067·095).
- **명령의 렌더 계층**: 명령 메서드 하나(05)의 실행은 렌더 계층(EVENT-063·073). `useChildNodeErrors`는 새 통지로 다시 구현하고 `JSONSchemaError` → `ValidationIssue`(LANDING-170).
- **시험·스토리**: 렌더 시나리오 438건의 처분(17파일은 단언을 이름만 바꿔 살림, TEST-005), `renderForm` 다섯, 부류별 e2e 실행기, React 18 실행 시험(REACT-017), 시나리오 스토리와 `playScenario`, 옛 스토리 49파일 정리, 스파이크 가운데 제품 동작에 남는 상황의 e2e 이식(LANDING-095), 배달 경로의 렌더 계층 구독.
- **이주 점검**(LANDING-198·170, 18C-87): 이주 표의 행마다 오늘 동작과 새 동작을 시험으로 대조, union 이주 행 LANDING-181–186, 채움 시점 이주 행 셋(18C-99), 명령·훅의 거취, 공개 표면 잔여의 거취. 자사 플러그인의 수정 목록·union 항목은 08.
- `src/types/formTypeInput.ts:60-65`의 문서 주석(LANDING-150).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-087)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `RootNodeContextProvider`, `Form`, `SchemaNodeProxy`, `SchemaNodeInput`, `useFormTypeInput`, `PluginManager`의 렌더 키트, `types/jsonSchema`의 맨 키 | 가상화(WeakSet identity), `renderForm`, `providers` 대부분, `useSchemaNodeTracker`·`useSchemaNodeSubscribe` | 기존 자리. `core/index.ts`는 `SchemaNode/` 진입점을 가리키고 바인딩 전용 내부 통로를 이름으로 다시 내보낸다 |

## 레거시 (LANDING-159·205)

- 옮기지도 지우지도 않는다. `src/core/index.ts`·`src/index.ts`가 새 엔진을 가리키고, 새 코드에서 `__legacy__`를 가리키는 import가 0이다(린트 규칙 1 + 검색). 옛 시험 가운데 `<Form>`을 시험하던 것은 처분표대로 이름을 바꿔 살리거나 시나리오로 옮기고, 레거시 안의 옛 단위 시험은 시험 글롭에서 빼 둔다(09가 디렉토리와 함께 지운다).
- 옛 스토리는 여기서 정리한다(16라운드 답 4).

## 착수 전 확인

- LANDING-067의 여섯 가운데 성능 예산 수치·IME·`resetSubtree` 존치·`trim` 부수 효과·선택 인자 모양은 닫혔다(18C-40·62·63·72·85, TEST-072·074). 네이티브 submit 경로의 `ValidationError` 처리는 ERROR 영역의 현행 항목이 든다.
- 02–06 전부 `1.0.0-beta`에 들어와 있다.

## 산출물과 완료 기준

- [ ] `nodeFromJSONSchema`·바인딩·Form 속성·바인딩 계약 다섯
- [ ] 입력 계약·기본 union 입력·`finishInput`·`reset` 로드 전환
- [ ] `onError` 렌더 계층과 `@winglet/react-utils` changeset
- [ ] 이주 점검 표와 대조 시험, 브라우저·React 18 게이트
- [ ] 진입점 전환, 레거시 import 0, 옛 스토리 정리, 벤치 비교 보고
- [ ] `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- filid: 렌더 계층은 기존 자리이므로 각 fractal의 `DETAIL.md`를 먼저 고친다(문서가 코드보다 먼저). `core/index.ts`의 수출 전환은 `core/INTENT.md`의 공개 경계 문장 갱신과 같은 커밋. 레거시 organ은 외부 소비 0이어야 하며 스캔의 organ-access 발견이 0.
- seiri: 사용자 주입 구성 요소는 `withErrorBoundary`로 소유 지점에서 1회만 감싼다(패키지 `CLAUDE.md`). 처분한 렌더 시나리오는 파일마다 처분 사유를 커밋 메시지에.

## 원장 항목 색인 (결정·보충에 PR-7를 든 현행 항목, 기계 추출)

- CONTROLS-075 core는 `app/plugin`을 가져오지 않는다 — 검증기는 바인딩이 골라 인자로, PR-4 경계 린트는 새 fractal, PR-7에 `src/core/**` 전체
- ERROR-026 StrictMode에서의 onError 동작
- ERROR-032 착수 조건과 PR 배치
- ERROR-117 선택 인자의 모양은 PR-7에서 고른다
- ERROR-119 PR-7에서 그 모듈의 `DETAIL.md`를 먼저 갱신한 뒤 코드를 고친다
- ERROR-164 §7.2 코드 목록 — 머리 문단과 정해진 행
- ERROR-202 (가칭) `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL` — 터미널 노드 입력이 빈 `ChildNodeComponents`를 읽을 때의 렌더 계층 경고
- EVENT-063 명령 넷은 공개 노드 메서드 — `FormHandle`은 넷 모두 대칭, 공개 `publish` 없음
- EVENT-065 IME 조합의 동기 통지 확인 — 게이트 PR-7(스토리북 브라우저, 사람 확인 목록)
- EVENT-070 React 이펙트를 거친 진입 간 순환은 core 예산에 넣지 않는다 — 예방은 C-10 문서, 게이트 PR-7(React 18·19 실행)
- EVENT-071 로드가 아닌 쓰기(`setValue(V)` 포함)의 Refresh는 원본이 실제로 바뀐 노드에만(쓴 입력 제외) — "값이 같아도 낸다"는 로드의 새 수명만
- GOAL-088 C3 남은 세부의 답 — core 스키마 타입은 `presentation`을 형 매개변수로만, 바인딩이 모양을 정의해 같은 이름 `JSONSchema`로 내보냄, 전역 모듈 확장 없음, 적용과 타입 검사 비용 확인은 PR-7
- LANDING-058 원샷이어야 하는 것은 전환 PR(PR-7)과 `master` 병합 둘뿐
- LANDING-061 PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화
- LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주
- LANDING-068 PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트
- LANDING-070 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자
- LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트
- LANDING-072 PR-7을 더 쪼갤 수 없는 이유
- LANDING-074 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동
- LANDING-075 정착 조건 3 — 바인딩 계약 넷(다섯째는 편집자가 더함)
- LANDING-078 정착 조건 6 — UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로
- LANDING-080 정착 조건 8 — 훅·바인딩 시험과 React 18 실행
- LANDING-087 정착 지도 PR-7 — 렌더 계층 교체, 그대로 쓰는 것, `core/index.ts` 수출의 전환
- LANDING-091 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset
- LANDING-095 보정 PR-7 — 바인딩 계약 다섯, `onError` 렌더 계층, `finishInput`, e2e·스토리·스파이크 이식, `reset`의 로드 전환
- LANDING-150 착수 항목(18라운드) — parse 문서는 새 자리의 문서로 PR-2, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7
- LANDING-151 착수 항목(18라운드) — 자사 플러그인 수정 목록은 PR-7 이주 항목
- LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치
- LANDING-170 명령 `RequestEmitChange`·`RequestInjection`은 새 설계에 없음(이주 행 없음), 공개 훅 셋 `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름·시그니처 유지, `useChildNodeErrors`는 PR-7에 새 통지로 다시 구현
- LANDING-198 union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조
- LANDING-203 채움 시점 이주 행 셋(LANDING-200–LANDING-202)의 점검 — 세 장면을 오늘 코드와 새 구현에서 돌린다
- NODE-015 공개 타입과 가드 아홉은 유지 — 판별 합집합, `isSchemaNode`, `isTerminalNode` 바로잡기, `group` 소비자 이주
- NODE-058 `union` 노드의 공개 형 — `UnionMemberType`·`UnionSchemaType`, `UnionNode`와 판별 `value`, props의 `value`·`onChange`, 종류별 `schemaType` 좁힘, 가드 `isUnionNode`, `InferSchemaNode`·`InferValueType`·`InferJSONSchema`의 사상, 참조 안정성, PR-2·PR-7 게이트
- REACT-017 React 18을 계속 지원한다 — PR-7에 React 18 실행 시험
- REACT-027 입력 구성 요소의 계약 — 초안은 입력이 들고, 빈 칸·비우기의 값, 무효 표시, 기본 수 입력과 체크박스, PR-7 브라우저 게이트
- REACT-028 자식 프록시의 마운트 여부로 입력을 판정한다 — 게이트 PR-7(reset 시험, StrictMode, 가상화)
- REACT-033 입력 바인딩 — 기본 union 입력(`{type:'union'}` 감싸개, 유효 목록 기준의 초안·표시·비우기), 시험 객체의 모르는 키는 대조에서 빼고 (가칭) `FORM_TYPE_TEST_INVALID`, 우선순위 그대로, 플러그인 계약 문구, PR-7 게이트
- SCHEMA-043 잎 교차 함수의 뜻 — `const`는 깊은 비교, `pattern`은 첫 패턴 + `allOf` 목록, `intersectPattern`은 옮기지 않음, 레거시의 `const`도 깊은 비교
- SURFACE-056 맨앞의 `Node`만 개명 — `NodeState`→`SchemaNodeState`, `NodeEventType`→`SchemaNodeEventType`, 종류·역할 낱말이 앞에 붙은 이름은 그대로
- SURFACE-059 원장이 바꾸지 않은 오늘의 공개 표면은 그대로 — `FormProps` 열아홉 칸·`FormHandle` 열여섯 멤버·`ValidationMode`·공개 이벤트 형 여섯, PR-7 이주 점검 게이트
- TEST-020 새로 있어야 하는 시험 PR-7 — e2e: 렌더 중 onChange 없음, 마운트 정착 오류, 바운더리와 싱크, onError e2e, finishInput·trim, strategy, reset, React 18
- TEST-024 도구와 설정 — vitest 프로젝트 셋, 의존, portable stories, play 안의 expect
- TEST-025 옛 스토리 49파일 33,533줄의 처분 — 데이터 모듈로 옮기고, 사용법은 소수만, 인라인 스키마 스토리는 남기지 않음
- TEST-026 옛 판과 새 판의 속도 비교 — 하니스 benchmark-form, 같은 폼의 기준점, 코어와 렌더, 측정 조건, 패키지 벤치 일곱
- TEST-027 벤치 게이트 — 옛 판보다 느린 항목은 이유를 적고 Vincent가 받아들여야 병합, 통제 가능하고 일정 수준 안
- TEST-055 릴리스 11 — 무리 밖 패키지 — @winglet/common-utils·@winglet/react-utils의 자기 changeset
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- TEST-074 안전 임계를 목표 배율로 올려 적지 않는다 — 문서는 잰 사실만, PR-7 뒤 같은 모바일 조건으로 다시 재어 적음, 병합 게이트 아님
