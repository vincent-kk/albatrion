# 05 통지와 검증 — 개발요청서

> 원장 정본: LANDING-064(정의)·084(정착 지도)·093(보정), LANDING-206(ajv 셋은 여기, UI 플러그인은 08), TEST-017·076. 규칙은 EVENT·VALIDATE·ERROR 영역. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산 순서 05. base `1.0.0-beta`, 브랜치 제안 `feat/schema-form-dispatch-and-validation`. 의존 03. 04·06과 병렬.
- 이 PR 뒤부터 독립 검증기와의 차등 테스트가 돈다(LANDING-071).

## 목적

루트 디스패처와 진입 사슬, `batch`, 명령 메서드 하나, `onError`의 core 쪽, 검증기 계약(`compileGuard`·`rejectedKey`·`bind` 거부)과 ajv6·7·8 플러그인의 구현, 배달 경로를 세운다.

## 범위 — 원장이 정한 내용

- **디스패치**: 루트 디스패처, `batch`, 진입당 `onChange` 1회, 진입 사슬과 사슬 끝의 throw, 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수), 겉면의 쓰기 위임을 `dispatch` 진입으로(LANDING-064·084). 상태·오류·명령 사건과 검증 결과의 배달 경로(LANDING-064).
- **명령**: 명령 종류를 매개변수로 받는 노드 메서드 하나(EVENT-073). 메서드 이름·명령 종류 값의 형·`FormHandle` 대칭 모양은 **이 PR 착수 전에** 편집자가 권장안을 올리고 소유자가 정한다(EVENT-073). 명령의 뜻은 EVENT-063 그대로(요청 사건만 냄, 원본을 쓰지 않음, 실행은 렌더 계층).
- **`onError`의 core 쪽**: 기록 형 `FormErrorRecord`와 코드 형, 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외의 묶음 규칙, 전달 중 쓰기 거부, 경고의 구조 키 중복 억제와 폼 수준 로드에서만의 초기화(ERROR-204), 정착 경고 판정의 소비자 조건(LANDING-064·093). 코드 표는 ERROR-164; 경고 코드 `TYPE_MISMATCH`(SURFACE-061).
- **검증기 계약**: `compileGuard(root, pointer)`(동기), 사본·가드 캐시, 가드의 늦은 컴파일(프로덕션)과 개발 모드 일괄 컴파일, `rejectedKey`, `validatorFactory` 통일, 같은 `$id` 루트의 중복 등록·참조 세기·최근 해제 목록, 재생성 reset의 같은 `$id`(LANDING-064·093, VALIDATE-045·046·047). **`bind` 거부**: 값을 바꾸는 검증기 옵션(`coerceTypes`·`useDefaults`·`removeAdditional`)이 켜져 있으면 `UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`(가칭)를 즉시 던지고 인스턴스를 붙이지 않으며, 스키마는 컴파일 때 깊은 복사한다(VALIDATE-050·051). `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록(WRITE-099).
- **ajv6·ajv7·ajv8 플러그인**: 동기 `compileGuard`, `rejectedKey`, 같은 `$id` 처리를 셋 다 이 PR에서 구현한다(LANDING-206, LANDING-093). ajv6은 가드 게이트의 (i)만(18C-58). `bind` 거부 규칙을 플러그인 문서에 적는다.
- 검증 실행 실패와 검증 불가의 드러남, `UpdateDiagnostics`, 커밋 번호 스탬프 검증, 에러 라우팅(union 호스트 수준 에러와 잔여 키, 18C-53), 오류 클래스 `ValidationIssue`, `SchemaFormError`의 집계 오류(LANDING-064).
- 훅 수준의 React 바인딩 시험(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출, 구독 뒤 따라잡기)(LANDING-064·093).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-084)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `EventCascadeManager`(노드별 마이크로태스크, 100회 throw), `ValidationManager`(실패 삼킴), `compile` 하나뿐인 계약 | 비트별 배달 원장 개념, 세대 번호, `transformErrors` | `src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정; 플러그인 패키지 ajv6·7·8의 `compileGuard` |

## 레거시 이동 (LANDING-159·205)

`EventCascadeManager`·`ValidationManager`와 시험을 `src/__legacy__/`로. core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import를 분리한다(검증기 주입 경로, LANDING-064). 보존은 09까지.

## 착수 전 확인

- LANDING-064의 넷(`compileGuard` 계약 세부, 에러 라우팅, 유효 스키마 변경 이벤트, import 분리)은 18C-53·56·57·58과 EVENT-064·VALIDATE-045–047이 닫았다.
- **소유자 결정 필요**: 명령 메서드의 이름(`action`·`interaction`·`request` 또는 명령 한정 `publish`), 명령 종류 값의 형(공개 열거 또는 문자열 리터럴), `FormHandle` 대칭 모양(EVENT-073). 착수 전에 권장안을 올린다.

## 산출물과 완료 기준

- [ ] `src/core/dispatch/`·`src/core/validation/`과 문서, `app/plugin/type.ts` 개정
- [ ] 명령 메서드 하나(소유자가 정한 이름·형), `FormHandle` 대칭
- [ ] `onError` core 쪽과 코드 표 상수(ERROR-164), `TYPE_MISMATCH`
- [ ] 검증기 계약과 ajv6·7·8 구현, `bind` 거부
- [ ] 차등 테스트와 훅 수준 바인딩 시험 초록, `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- filid: `dispatch/`·`validation/`의 INTENT·DETAIL 먼저. 검증기 주입 경로의 import 분리는 `core/INTENT.md`의 경계 문장으로 적는다. 플러그인 패키지는 자기 `CLAUDE.md`·INTENT를 따른다.
- seiri: 진입 함수는 쓰기 동사마다 한 파일, 오류 코드 상수는 코드 표(ERROR-164)의 순서를 따르며 문서 주석에 level·부류·언제.

## 원장 항목 색인 (결정·보충에 PR-4를 든 현행 항목, 기계 추출)

- BLUEPRINT-044 청사진 판정 절차 — 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고 (가칭) `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, PR-1·PR-4 게이트
- CONTROLS-075 core는 `app/plugin`을 가져오지 않는다 — 검증기는 바인딩이 골라 인자로, PR-4 경계 린트는 새 fractal, PR-7에 `src/core/**` 전체
- CONTROLS-079 `controls.injectTo`는 함수 `(value, ctx)` 하나 — 청사진이 정적으로 아는 대상 없음, `ctx` 여덟 칸, 반환 키는 원천 기준 경로, 항목은 전체 교체, `undefined` 항목과 `null`·`undefined` 반환은 쓰지 않음, 비활성 대상은 잠복 원본, 함수 안의 쓰기는 되먹임
- ERROR-013 onError 이름과 자리 계약
- ERROR-032 착수 조건과 PR 배치
- ERROR-164 §7.2 코드 목록 — 머리 문단과 정해진 행
- ERROR-198 §7.2의 (미정) 행을 닫는 규칙 — 넷의 처분, 18라운드가 더하는 행, `if` 공허한 참 경고 없음, `INJECT_TARGET_NOT_FOUND` 빠짐
- EVENT-063 명령 넷은 공개 노드 메서드 — `FormHandle`은 넷 모두 대칭, 공개 `publish` 없음
- EVENT-072 `resetSubtree()`에 걸린 로드 규칙(로드 뒤 검증, `batch` 안의 즉시 정착, 한 로드에 한 번, 로드마다 다시 만듦)은 그 하위 트리에만
- EVENT-073 명령은 노드 메서드 하나 — 명령 종류를 매개변수로 받음, 뜻은 EVENT-063 그대로, 이름·값의 형·`FormHandle` 대칭 모양은 PR-4 착수 전에 소유자가 정함, 겉면 수 약 57 → 약 54
- FRAGMENT-053 루트의 정규 `dataPath`는 `''` — core가 `'/'`를 별칭으로 받아 정규화, 잔여 목록은 정규화된 값에 이음, 플러그인 셋과 폴백 검증기는 PR-4에서 `''`
- LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로
- LANDING-070 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자
- LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트
- LANDING-080 정착 조건 8 — 훅·바인딩 시험과 React 18 실행
- LANDING-084 정착 지도 PR-4 — `EventCascadeManager`·`ValidationManager` 교체, `dispatch/`·`validation/`, 진입 사슬의 소유
- LANDING-093 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽
- LANDING-198 union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조
- REACT-002 core의 React 런타임 의존 둘을 떼는 길 — 터미널 추론은 렌더 계층의 판정 함수로, `app/plugin` import 분리는 PR-4 전 설계 항목
- TEST-017 새로 있어야 하는 시험 PR-4 — 디스패처, 사슬 끝 throw와 onError 계약의 core 쪽, 검증기 없음·컴파일 실패, degraded, 가드, 차등 시험, 훅 수준 바인딩 시험
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- TEST-072 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다 — 선은 기존 `guard:check`, 절대 수치와 배율 상한은 두지 않음, 선을 넘으면 이유를 적고 Vincent가 받아들여야 병합
- TEST-076 컴파일 예산 — 따로 수치를 두지 않고 마운트 벤치에서 폼 몫과 검증기 몫으로 나눠 보고, TEST-072의 선으로 판정, 가드 200개 조건부 폼 생성은 PR-4의 수용 필요 항목
- VALIDATE-043 검증 에러 라우팅 — 판정 불변, 폼 수준 목록, `dataPath` 배정, 잔여 키는 호스트, 터미널 아래는 터미널, 꺼진 union 분기만 표시에서 거름, union 호스트 에러는 호스트
- VALIDATE-045 최근 해제 목록 크기 8(검증기 인스턴스마다, 내부) — 밀려날 때와 같은 `$id` 재등록 직전에만 `release(root)`, 상한 '살아 있는 루트 + 8'
- VALIDATE-046 같은 `$id`의 두 살아 있는 루트는 저마다 판정 — 떼어 두기는 플러그인 계약, PR-4 게이트 넷(오류·경고 아님은 ERROR-201)
- VALIDATE-047 따로 컴파일한 가드는 전체 검증의 `if`와 같은 boolean — `$id`·동적 범위 포함, 플러그인 계약, PR-4 게이트 넷
- WRITE-093 `union` 행의 해석 — 기본 spec과 유효 목록, `isMember`·`convert`·`interpret`(규칙 A: 순서 무관·멱등·무할당), 노드에 드는 모든 쓰기의 경계와 한 진입의 두 번 해석, `Merge`는 통째, `trim`은 `finishInput`, PR-2·PR-4 게이트
- WRITE-099 U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트
