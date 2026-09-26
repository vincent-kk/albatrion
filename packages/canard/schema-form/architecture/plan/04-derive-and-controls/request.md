# 04 파생 + 상태 키·제어 — 개발요청서

> 원장 정본: 파생은 LANDING-063(정의)·083(정착 지도)·TEST-071; 상태 키·제어는 LANDING-066(정의)·086(정착 지도)·TEST-019. 규칙은 CONTROLS·SETTLE·WRITE(나감) 영역. 합침은 LANDING-204. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산 순서 04. base `1.0.0-beta`, 브랜치 제안 `feat/schema-form-derive-and-controls`. 의존 03. 05·06과 병렬.
- 둘 다 `settle/`의 계산 단계이고 상태 키·제어는 파생만 의존하므로 한 PR이다(LANDING-083·086·204).

## 목적

정착 루프의 계산 단계를 완결한다. (1) **파생** `settle/derive/`: `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 같은 대상 규칙, 에지 소비. (2) **상태 키·제어**: 상태 키의 결합, `controls.children`, 조각 `controls`, `unsetOnInactive`의 정책, 겉면의 계산 게터. 이 PR이 끝나면 03의 게이트 스텁이 실제 술어로 바뀔 준비가 된다.

## 범위 A — 파생 (원장이 정한 내용)

- `controls.derived`(원본을 쓴다, WRITE-011)·`controls.injectTo`(작성자가 선언한 전체 교체, 런타임은 에지, 로드에서 발화, WRITE-012)·`controls.unsetValue`(WRITE-028), 같은 대상 규칙(종류 순위, 문서 순서, 층, 전순서, 정착 단위), 에지 소비, `DisableAutomaticWrites`(WRITE-078), `controls.resetInteraction`, 개발 모드 정착 기록(LANDING-063).
- 에지의 값 동등 판정과 `controls.derived` 의존 집합(18C-50), 조각 `controls` 식의 나감 발화, 에지와 생김의 기준(로드는 비우고 로드가 아닌 쓰기는 직전 커밋, 18C-102).
- 식 실행은 청사진이 컴파일한 함수를 `createDynamicFunction`의 의존 주입 형태로 부른다(LANDING-083).

## 범위 B — 상태 키·제어 (원장이 정한 내용)

- `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`의 결합(OR/AND), `controls.children`(CONTROLS-073), 조각 `controls`, `unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ), 겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`)(LANDING-066).
- 나감 정책 키의 네 층과 같은 층의 유지 우선(WRITE-031), 나감의 시점은 직전 커밋의 값(WRITE-038), 노드 게이트 `controls.active: false`도 같은 장치이고 `controls.visible`은 언제나 보존(WRITE-039), 하위 트리·잠복 자손으로 내려가는 정책(WRITE-033·034).
- 조각에 따라 터미널 전략이 바뀌는 경로는 없다(선언 사이 정적, LANDING-066).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-083·086)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| 의존 경로의 이벤트 구독, `InjectionGuardManager`, `getDerivedValueFactory`, 루트 스키마 전역 상속, `checkComputedOptionFactory`, `mergeShowConditions` | `createDynamicFunction`의 의존 주입 형태 | `src/core/settle/derive/`, `settle/`의 계산 끝 |

## 레거시 이동 (LANDING-159·205)

`InjectionGuardManager`·`getDerivedValueFactory`·`checkComputedOptionFactory`·`mergeShowConditions`와 시험을 `src/__legacy__/`로. 보존은 09까지.

## 착수 전 확인

- LANDING-063의 셋은 18C-50·102가 닫았다. `controls.children` 세부는 CONTROLS-073.
- 03의 게이트 스텁 인터페이스를 그대로 쓰고, 이 PR에서 실제 술어로 바꾸는 것은 상태 키 부분까지다. `if` 게이트의 가드 컴파일은 05.

## 산출물과 완료 기준

- [ ] `src/core/settle/derive/`와 문서, 계산 단계 완결
- [ ] 같은 대상 규칙·에지 소비·억제 비트·결합 표·`controls.children`·나감 정책 시험
- [ ] 겉면 계산 게터 넷
- [ ] 벤치 회귀 행(TEST-071) 통과(또는 소유자 수용)
- [ ] 레거시 이동, `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- filid: `settle/derive/`는 `settle/`의 자식 fractal(INTENT·DETAIL 먼저). 식 컴파일러(청사진 진입점)와의 의존 방향을 `DETAIL.md`에 적는다.
- seiri: 규칙마다 함수 하나, 순위·층 표는 코드의 조건 사다리 대신 표·디스패치로(structure §3).

## 원장 항목 색인 (결정·보충에 PR-3·PR-6를 든 현행 항목, 기계 추출)

- CONTROLS-073 `controls.children` 항목 — 대상 해석, 청사진 오류, 형상 밖 대상, 항목 게이트 자리, 대상별 식, 값 키의 층, 상태 키는 로컬 결합
- LANDING-063 PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비
- LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로
- LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity
- LANDING-066 PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책
- LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주
- LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트
- LANDING-083 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/`
- LANDING-086 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝
- TEST-016 새로 있어야 하는 시험 PR-3 — 같은 대상 규칙, 에지 소비, DisableAutomaticWrites, 개발 모드 정착 기록
- TEST-019 새로 있어야 하는 시험 PR-6 — 잠금 OR·표시 AND, controls.children, 조각 controls, unsetOnInactive 층
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- TEST-071 PR-3 벤치 회귀 — 객체 원천 `injectTo` 1만 원소에서 한 원소 쓰기의 비교 비용이 값 크기와 무관, 통째 교체는 선형
