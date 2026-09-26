# 우산 순서 1 — 설계 PR (`refactor/schema-form-internal-architecture`)

> 원장 정본: LANDING-060(PR-0 문서 부분). 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

설계의 정본(원장)과 그 위에서 만든 읽기 문서·개발계획을 `1.0.0-beta`에 먼저 넣어, 뒤의 모든 개발 PR이 원장 ID로 범위와 게이트를 말할 수 있게 한다.

## 우산 안의 자리

- 의존: 없음. 기반 PR(우산 순서 2)과 병렬이다.
- 이 브랜치가 그 PR이다. 코드는 건드리지 않는다(`packages/canard/schema-form/architecture/` 아래만).

## 범위 — 원장이 정한 내용

- 설계 문서·기록·HANDOFF(LANDING-060의 "이 문서, 14라운드 기록, ADR 최종 상태, HANDOFF"). 오늘은 그 정본이 단일 원장 `ledger/`(17영역, 1,332항목)이고, 14–18라운드 기록은 `reviews/`에 있다.
- 남은 문서 작업(HANDOFF §2의 3·4): 원장에서 설계문서 8편(`design/`)과 ADR을 다시 쓰고 문장마다 원장 ID를 달며, 원장 ↔ 문서 역검사(`doc-coverage`)를 두고, 옛 문서 10편·`adr/`·`open-questions.md`를 `_archive/<날짜>/`로 옮긴다(원장의 `path:line` 인용은 커밋 `ba398c330` 기준이므로 검사 스크립트의 원천 루트에 백업 경로를 더한다). 소유자의 절 단위 통과는 새 설계문서에서만 한다.
- 이 개발계획(`plan/`)과 검사 `ledger/checks/plan-links.mjs`.

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

없음(문서 전용).

## 레거시 이동

없음.

## 착수 전 닫을 것

LANDING-060의 조건 셋(소유자 O-1–O-11 답, 절 단위 통과, 18라운드 정련)은 절 단위 통과만 남았고, 그것은 이 PR의 `design/` 8편에서 한다.

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- 원장 검사 전부 0: `expand-split-pointers`·`verbatim`·`sup`·`ref`·`owner-cited`·`bundle`+`sentence`(17영역)·`tokens`(잔여는 `ledger/checks/token-review.md`에서 판정됨)·`plan-links`(HANDOFF §4).
- `design/`을 만든 뒤: `doc-coverage`(현행 항목마다 인용하는 문서가 있고, 문서의 ID가 모두 현행이며, 결정문의 수·코드·이름 토큰이 문서에 그대로 있음)와 codex·antigravity의 "원장 대 문서" 해상도 대조 1회.
- 소유자의 절 단위 통과.

## 완료 기준

- [x] 원장 봉인(18라운드, 커밋 `9f6d21306`·`75b277a56`), 소유자 메모 38–41행 반영(`d2ed8976a`)
- [x] 개발계획 `plan/` 12편과 `plan-links.mjs`
- [ ] `design/` 8편 + ADR 재작성 + `doc-coverage.mjs`
- [ ] 옛 문서 `_archive/`로 이동, 검사 원천 루트 갱신
- [ ] 소유자 절 단위 통과 → `1.0.0-beta`로 병합

## 원장 항목 색인 (PR-0 문서 부분)

- LANDING-060 PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대
- PROCESS-050, PROCESS-061, PROCESS-062 — 문서 생성 절차와 세 겹 검사(원문 보존·기계 검사·해상도 대조)
