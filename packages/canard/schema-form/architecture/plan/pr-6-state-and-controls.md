# 우산 순서 8 — 상태 키와 제어 (원장 PR-6)

> 원장 정본: LANDING-066(정의), LANDING-086(정착 지도), TEST-019. 규칙은 CONTROLS·WRITE(나감) 영역. 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

정착 루프의 계산 단계를 마무리한다: 상태 키의 결합, `controls.children`, 조각 `controls`, `unsetOnInactive`의 정책, 겉면의 계산 게터. 이 PR이 끝나면 PR-2의 게이트 스텁이 실제 술어로 바뀔 준비가 된다.

## 우산 안의 자리

- 의존: PR-3. 합침 P3을 채택하면 PR-3과 한 PR.
- 다음: PR-7.

## 범위 — 원장이 정한 내용

- `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`의 결합(OR/AND), `controls.children`, 조각 `controls`, `unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ), 겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`)(LANDING-066).
- 나감 정책 키의 네 층과 같은 층의 유지 우선(WRITE-031), 나감의 시점은 직전 커밋의 값(WRITE-038), 노드 게이트 `controls.active: false`도 같은 장치이고 `controls.visible`은 언제나 보존(WRITE-039).
- 조각에 따라 터미널 전략이 바뀌는 경로는 없다(선언 사이 정적, LANDING-066).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-086)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| 루트 스키마 전역 상속, `checkComputedOptionFactory`, `mergeShowConditions` | 없음 | `settle/`의 계산 끝 |

## 레거시 이동 (LANDING-159)

`checkComputedOptionFactory`·`mergeShowConditions`와 시험을 `src/__legacy__/`로.

## 착수 전 닫을 것

LANDING-066의 `controls.children` 세부는 CONTROLS 영역의 현행 항목이 든다(18라운드 열림 0).

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- 상태 키 시나리오(TEST-019): 결합 표(OR/AND)의 모든 칸, 표준 `readOnly`와 `controls.readOnly`의 합, `controls.children` 항목의 게이트와 값 키.
- 나감 정책: 네 층마다 한 상황과 같은 층의 유지 우선, 하위 트리·잠복 자손으로 내려가는 정책(WRITE-033·034), 직전 커밋의 값으로 판정(WRITE-038).
- PR-2·PR-3의 정착 시험이 실제 술어로 바꾼 뒤에도 초록.

## 완료 기준

- [ ] `settle/`의 계산 단계 완결과 문서
- [ ] 결합 표·`controls.children`·나감 정책 시험
- [ ] 겉면 계산 게터 넷
- [ ] 레거시 이동

## 원장 항목 색인 (결정·보충에 PR-6를 든 현행 항목, 기계 추출)

- CONTROLS-073 `controls.children` 항목 — 대상 해석, 청사진 오류, 형상 밖 대상, 항목 게이트 자리, 대상별 식, 값 키의 층, 상태 키는 로컬 결합
- LANDING-066 PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책
- LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주
- LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트
- LANDING-086 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝
- TEST-019 새로 있어야 하는 시험 PR-6 — 잠금 OR·표시 AND, controls.children, 조각 controls, unsetOnInactive 층
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분

## 원장이 PR-6에 배정한 게이트 (기계 추출; 원문은 `ledger/`와 `reviews/round-18-closing.md`)

게이트를 제목에 든 항목:

- 없음

18라운드 닫기 블록의 게이트 줄:

- 없음
