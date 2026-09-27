# 06 배열 — 개발요청서

> 원장 정본: LANDING-065(정의)·085(정착 지도)·094(보정), NODE-053, TEST-018. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산 순서 06. base `1.0.0-beta`, 브랜치 제안 `feat/schema-form-array`. 의존 03. 04·05와 병렬.

## 목적

배열·터미널 배열의 동작 행 `arrayBehavior/`와 아이템 호스트, 구조 연산(`push`·`remove`·`update`), 통째 교체의 identity, 아이템 채움을 세운다.

## 범위 — 원장이 정한 내용

- 배열·터미널 배열 행(`behaviors/arrayBehavior/`의 `branch/`·`terminal/`), 겉면 배열 멤버, 배열 노드와 아이템 호스트, `items`·`prefixItems`, `push`·`remove`·`update`, 통째 교체의 identity, 아이템 채움(LANDING-065·094). 아이템 노드는 모두 실체화한다(NODE-053).
- 배열 아이템의 생김과 채움(18C-59), 스냅숏 자리 맞춤(WRITE-095): 구조 연산 `push(v)`는 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣는다(WRITE-099). 빈 배열 호스트의 방출과 아이템 자리(VALUE-034).
- `reset`이 로드하는 배열의 아이템 identity에 `reset`만의 예외를 두지 않는다(WRITE-048).
- `resolveArrayLimits`는 청사진으로, `omitTrailingArray`·`omitEmptyArray`는 `arrayBehavior/utils/`로, `resolveArrayValueFilter`는 투영 칸의 비트 분기로 다시 쓴다(LANDING-085).
- union 아이템의 `omitEmpty`: `{}`를 든 union 아이템은 `null`이 방출되고 남기려면 `omitEmpty: false`(VALUE-037).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-085)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `ArrayNode` 전략 둘, 비동기 `push` | `resolveArrayLimits`(→ `blueprint/`), `omitTrailingArray`·`omitEmptyArray`(→ `arrayBehavior/utils/`) | `src/core/behaviors/arrayBehavior/`(`branch/`·`terminal/`·`utils/`) |

## 레거시 이동 (LANDING-159·205)

`ArrayNode`와 전략·시험은 03이 `core/nodes`를 통째로 옮겼으므로 이미 `src/__legacy__/`에 있다. 보존은 09까지.

## 착수 전 확인

- LANDING-065의 둘(배열 아이템의 생김과 채움, `contains`)은 18C-59·97이 닫았다.

## 산출물과 완료 기준

- [ ] `arrayBehavior/` 세 조직과 문서
- [ ] 구조 연산·identity·스냅숏 자리 시험
- [ ] `resolveArrayLimits` 이동, 필터의 비트 분기
- [ ] 벤치 행(지연 실체화 판정 포함), `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- filid: `arrayBehavior/`는 `behaviors/`의 자식(INTENT·DETAIL 먼저). `resolveArrayLimits`의 청사진 이동은 청사진 `DETAIL.md`도 함께 갱신.
- seiri: 구조 연산마다 함수 하나, 스냅숏 자리 맞춤은 한 곳(effects at the edge).

## 원장 항목 색인 (결정·보충에 PR-5를 든 현행 항목, 기계 추출)

- LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`
- LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity
- LANDING-082 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯
- LANDING-085 정착 지도 PR-5 — `ArrayNode` 전략·비동기 `push` 교체, `arrayBehavior/`
- LANDING-092 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙
- LANDING-094 보정 PR-5 — 배열·터미널 배열 행, `resolveArrayLimits`의 청사진 이동
- LANDING-203 채움 시점 이주 행 셋(LANDING-200–LANDING-202)의 점검 — 세 장면을 오늘 코드와 새 구현에서 돌린다
- NODE-053 아이템 노드는 모두 실체화한다 — 지연 실체화는 PR-5 벤치 게이트
- TEST-018 새로 있어야 하는 시험 PR-5 — 배열 아이템의 생김과 채움, identity, omitTrailing, 터미널 배열 행의 구조 연산
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- VALUE-034 빈 호스트와 루트의 방출 — 빈 `local`은 `{}`·`[]`, `omitEmpty`는 빈 `local`을 방출하지 않음, 루트는 루트 종류의 빈 그릇, 배열 아이템의 빈자리는 `{}`·`[]`·`null`
- WRITE-048 `reset`이 로드하는 배열의 아이템 identity — `reset`만의 예외를 두지 않는다
- WRITE-095 아이템을 만들거나 없애는 모든 쓰기는 스냅숏 배열의 자리를 맞춘다 — 새 자리는 `undefined`, 값은 싣지 않음, O(배열 길이)
