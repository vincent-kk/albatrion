# 04 파생 + 상태 키·제어 — 검증 구성요건

## 검증 원칙

03의 정착 시험은 이 PR 뒤에도 초록이어야 한다. 새 시험은 파생·상태 키의 자기 기제만 본다(TEST-069). `<Form>`에 닿지 않으므로 옛 시험 전체가 회귀 신호다.

## 시험 구성

| 프로젝트 | 무엇을 더하는가 |
| --- | --- |
| `unit` | 같은 대상 규칙·에지 소비·억제 비트·결합 표·나감 정책 단위 시험 |
| 코어 시나리오 시험 | `src/core/__tests__/scenarios/<부류>.spec.ts`(TEST-023; 데이터 모듈은 시나리오 패키지에): 파생·`injectTo`·`unsetValue`·상태 키·`controls.children`·나감 상황(02 §9 목록의 해당 부분) |
| `render` | 옛 렌더 시험 그대로 |

## 게이트 — 이 PR이 단독으로 통과해야 하는 것

### 파생
- 같은 대상 규칙(종류 순위·문서 순서·층·전순서·정착 단위)마다 한 상황, 에지 소비(거짓→참·참→거짓·형상 재진입)마다 한 상황, `DisableAutomaticWrites`가 그 호출의 자동 쓰기를 모두 끄는 상황(WRITE-078), `setValue(getValue())`는 에지가 없어 발화하지 않고 로드는 발화함(SETTLE-048·046).
- 벤치 회귀(TEST-071, 18C-50): 객체 원천 `injectTo` 1만 원소에서 한 원소 쓰기의 비교 비용이 값 크기와 무관, 통째 교체는 선형.
- 파생 라운드 예산 초과와 그 `degraded`, `DisableAutomaticWrites`의 파생·`injectTo` 억제(TEST-069 (다), TEST-016 보충).
- 프로토타입 회귀(TEST-069 (라)): `selfcheck-v5`의 f와 c 가운데 주입 단언, `r8-port`의 `derived`·`injectTo` 행, `r7-port`의 에지 발화 파생·`injectTo`, `edge-cases`의 `clearValue`·`injectTo`·단계 순서·파생 예산, v7의 같은 순위 동점·정착 단위 순위·나감 에지.

### 상태 키·제어
- 상태 키 시나리오(TEST-019): 결합 표(OR/AND)의 모든 칸, 표준 `readOnly`와 `controls.readOnly`의 합, `controls.children` 항목의 대상별 식(기준점이 호스트, 항목마다 한 번 평가되어 모든 대상에 같은 값)과 값 키의 층(조각의 `controls` < `children` 항목 < 노드 자신)(CONTROLS-073 (6)–(7)).
- 나감 정책: 네 층마다 한 상황과 같은 층의 유지 우선(WRITE-031), `children` 항목 층·조각 `controls` 층에서 하위 트리·잠복 자손으로 내려가는 정책(WRITE-033·034, TEST-019 보충), 직전 커밋의 값으로 판정(WRITE-038), `controls.visible` 보존(WRITE-039).
- 프로토타입 회귀: `edge-cases`의 잠금 결합, v7 나감 에지의 조각 `controls` 층 사례(TEST-069 (라)).
- 03의 정착 시험이 그대로 초록.

## 합격 판정과 실패 처리

- 게이트 전부 통과 + 옛 시험 초록 + 패키지 검사(`yarn workspace @canard/schema-form lint`·`test`와 타입 검사; 루트의 `lint`·`typecheck`·`test` 스크립트는 릴리스 전환 PR이 만들고 그 뒤에는 저장소 전체로) + filid 스캔 순환 0.
- 같은 대상 규칙의 순위가 원장과 어긋나면 SETTLE 영역의 항목을 다시 읽고 코드를 맞춘다.

## 리뷰 체크리스트 (PR 본문에 옮긴다)

- [ ] `settle/derive/` INTENT·DETAIL이 코드보다 먼저
- [ ] 규칙마다 상황 하나(목록 첨부)
- [ ] 벤치 회귀 행 결과
- [ ] 03 정착 시험 초록
- [ ] 레거시 이동 목록
- [ ] seiri 게이트·filid 스캔 결과 첨부

## 원장이 PR-3·PR-6에 배정한 게이트 (기계 추출; 원문은 `ledger/`와 `reviews/round-18-closing.md`)

게이트를 제목에 든 항목:

- 없음

18라운드 닫기 블록의 게이트 줄:

- 18C-50 에지의 값 동등 판정과 `controls.derived` 의존 집합
  - PR: PR-3 벤치(회귀 항목).
