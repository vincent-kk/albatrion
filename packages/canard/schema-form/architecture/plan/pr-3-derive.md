# 우산 순서 5 — 파생 (원장 PR-3)

> 원장 정본: LANDING-063(정의), LANDING-083(정착 지도), TEST-071(벤치 회귀). 규칙은 CONTROLS·SETTLE·WRITE 영역. 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

정착 루프의 파생 단계 `settle/derive/`를 채운다: `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 같은 대상 규칙, 에지 소비.

## 우산 안의 자리

- 의존: PR-2. PR-4·PR-5와 병렬.
- 합침 P3을 채택하면 PR-6과 한 PR(둘 다 `settle/`의 계산 단계, LANDING-083·086).

## 범위 — 원장이 정한 내용

- `controls.derived`(원본을 쓴다, WRITE-011)·`controls.injectTo`(작성자가 선언한 전체 교체, 런타임은 에지, 로드에서 발화, WRITE-012)·`controls.unsetValue`(WRITE-028), 같은 대상 규칙(종류 순위, 문서 순서, 층, 전순서, 정착 단위), 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록(LANDING-063).
- 에지의 값 동등 판정과 `controls.derived` 의존 집합(18C-50), 조각 `controls` 식의 나감 발화, 에지와 생김의 기준(로드는 비우고 로드가 아닌 쓰기는 직전 커밋, 18C-102).
- 식 실행은 청사진이 컴파일한 함수를 `createDynamicFunction`의 의존 주입 형태로 부른다(LANDING-083).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-083)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| 의존 경로의 이벤트 구독, `InjectionGuardManager`, `getDerivedValueFactory` | `createDynamicFunction`의 의존 주입 형태 | `src/core/settle/derive/` |

## 레거시 이동 (LANDING-159)

`InjectionGuardManager`·`getDerivedValueFactory`와 그 시험을 `src/__legacy__/`로. 옛 엔진의 소비자는 별칭 접두만 바꾼다.

## 착수 전 닫을 것

LANDING-063의 셋(에지의 값 동등 판정, `controls.derived` 의존 집합, 조각 `controls` 식의 나감 발화)은 18C-50과 18C-102가 닫았다.

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- 파생 규칙의 시나리오: 같은 대상 규칙(종류 순위·문서 순서·층·전순서·정착 단위)마다 한 상황, 에지 소비(거짓→참·참→거짓·형상 재진입)마다 한 상황, `DisableAutomaticWrites`가 그 호출의 자동 쓰기를 모두 끄는 상황(WRITE-078).
- 벤치 회귀(TEST-071, 18C-50): 객체 원천 `injectTo` 1만 원소에서 한 원소 쓰기의 비교 비용이 값 크기와 무관하고, 통째 교체는 선형이다.
- PR-2의 정착 시험이 그대로 초록(게이트 대역은 여전히 스텁).

## 완료 기준

- [ ] `src/core/settle/derive/`와 문서
- [ ] 같은 대상 규칙·에지 소비·억제 비트 시험
- [ ] 벤치 회귀 행 통과(또는 소유자 수용)
- [ ] 레거시 이동

## 원장 항목 색인 (결정·보충에 PR-3를 든 현행 항목, 기계 추출)

- LANDING-063 PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비
- LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로
- LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity
- LANDING-066 PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책
- LANDING-083 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/`
- TEST-016 새로 있어야 하는 시험 PR-3 — 같은 대상 규칙, 에지 소비, DisableAutomaticWrites, 개발 모드 정착 기록
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- TEST-071 PR-3 벤치 회귀 — 객체 원천 `injectTo` 1만 원소에서 한 원소 쓰기의 비교 비용이 값 크기와 무관, 통째 교체는 선형

## 원장이 PR-3에 배정한 게이트 (기계 추출; 원문은 `ledger/`와 `reviews/round-18-closing.md`)

게이트를 제목에 든 항목:

- 없음

18라운드 닫기 블록의 게이트 줄:

- 18C-50 에지의 값 동등 판정과 `controls.derived` 의존 집합
  - PR: PR-3 벤치(회귀 항목).
