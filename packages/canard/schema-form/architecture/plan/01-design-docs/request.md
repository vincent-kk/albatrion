# 01 설계문서 PR — 개발요청서

> 원장 정본: LANDING-060(PR-0 문서 부분)과 그 보충(설계문서 PR 분리, `reviews/round-18-owner-answers.md:45`), PROCESS-050·061·062(문서 생성 절차와 세 겹 검사). 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산 순서 01. 설계 PR #345(원장·기록·개발계획)는 `1.0.0-beta`에 머지됐다. 남은 문서 일을 이 PR이 든다.
- base `1.0.0-beta`, 브랜치 제안 `docs/schema-form-design-docs`. 의존 없음. 02 기반+청사진과 병렬이며 코드 PR을 막지 않는다.
- 코드는 건드리지 않는다(`packages/canard/schema-form/architecture/` 아래만).

## 목적

원장(정본)에서 읽기 표면인 설계문서 8편과 ADR을 만들고, 옛 문서를 백업으로 옮기고, 소유자의 절 단위 통과를 받는다. 이후 개발 PR은 원장 ID로 말하고, 사람은 설계문서로 읽는다.

## 범위 — 원장이 정한 내용

- **설계문서 8편** `architecture/design/`: 원장 17영역을 묶는다. `00-goals-and-values`(GOAL·PROCESS의 방법), `01-schema-to-blueprint`(SCHEMA·BLUEPRINT·FRAGMENT), `02-node-and-value`(NODE·VALUE·WRITE), `03-settle-and-events`(SETTLE·EVENT), `04-controls`(CONTROLS), `05-validation-and-errors`(VALIDATE·ERROR), `06-react-and-surface`(REACT·SURFACE), `07-landing-and-tests`(LANDING·TEST). 결정문은 원장의 결정 칸을 산문으로 잇되 요약하지 않고, 표는 표로 두며, 문장마다 원장 ID를 단다(PROCESS-061·062의 세 겹 검사 (가)). union의 설계문서는 `reviews/raw-round18-union-swarm/merged-v3.md`를 원장 번호로 바꿔 쓴다(HANDOFF §2).
- **ADR 재작성**: 채택된 옛 ADR 0001…0014는 백업으로 가고, 새 ADR은 옛 주제 단위를 유지하되 본문을 원장의 현행 결정으로 바꾼다. 18라운드의 큰 결정은 새 번호(0015 union 잎, 0016 채움 시점과 전체 교체 쓰기, 0017 좁힘의 교집합 원리). ADR도 문장마다 원장 ID.
- **역검사** `ledger/checks/doc-coverage.mjs`: (ㄱ) 현행 항목마다 인용하는 문서가 있는가(인용 0은 누락), (ㄴ) 문서의 ID가 모두 현행인가, (ㄷ) 결정문의 수·코드·이름 토큰이 문서에 그대로 있는가(`tokens.mjs`를 원장→문서 방향으로).
- **백업**: 옛 설계문서 10편(`00-*.md`…`09-*.md`), `adr/`, `open-questions.md`를 `architecture/_archive/<날짜>/`로 옮긴다. `reviews/`는 그대로 둔다. 원장의 `path:line` 인용은 커밋 `ba398c330` 기준이므로 검사 스크립트(`lib.mjs`의 `docReader`)의 원천 루트에 백업 경로를 더한다. 백업 README에 "동결됐다. 정본은 `ledger/`, 읽는 표면은 `design/`, 인용은 커밋 `ba398c330`의 줄 번호"를 적는다.
- **절 단위 통과**: 소유자의 통과는 새 설계문서에서만 한다(12-6, LANDING-060). 문서 하나가 끝날 때마다 검사 → 통과. 순서는 02 → 01 → 03 → 05 → 04 → 06 → 07 → 00(의존이 큰 것부터).
- HANDOFF §5 파일 지도 갱신.

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

없음(문서 전용).

## 레거시 이동

없음.

## 착수 전 확인

- 원장 검사 전부 0(HANDOFF §4). 지금 그렇다.
- 설계문서의 절 구성에 소유자 이견이 없는지 첫 문서(02) 초안으로 확인한다.

## 산출물과 완료 기준

- [ ] `design/00`–`07` 8편, 문장마다 원장 ID
- [ ] `adr/0001`–`0017` 재작성(옛 것은 `_archive/`)
- [ ] `ledger/checks/doc-coverage.mjs`와 HANDOFF §4의 검사 줄
- [ ] `_archive/<날짜>/` 이동과 README, `lib.mjs` 원천 루트 갱신, 기존 검사 전부 여전히 0
- [ ] codex·antigravity "원장 대 문서" 해상도 대조 1회(세 겹 검사 (다)), 결과는 `reviews/raw-design-docs-check.md`
- [ ] 소유자 절 단위 통과 8편 → `1.0.0-beta`로 병합

## 절차 (seiri·filid)

문서 전용이라 filid 스캔 대상이 아니다. seiri의 `agent-legible`(모든 문서는 원장 ID로 검색 가능)과 `code-comments` §1의 정신(문서는 현재 명세만, 이력은 `reviews/`)을 지킨다.

## 원장 항목 색인

- LANDING-060 PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대
- PROCESS-050, PROCESS-061, PROCESS-062 — 문서 생성 절차와 세 겹 검사
- LANDING-204 — 우산 구조(설계문서 PR은 자식 PR의 하나)
