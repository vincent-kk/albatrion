# 옛 설계 문서 (2026-09-29 동결)

이 디렉토리의 문서는 동결됐다. 고치지 않는다.

- 정본은 [`../../ledger/`](../../ledger/README.md)다. 결정은 원장 항목에서 읽는다.
- 읽는 표면은 [`../../design/`](../../design/)의 설계문서 여덟과 [`../../adr/`](../../adr/)의 ADR 0001–0017이다.
- 원장이 이 문서들을 인용한 줄 번호는 커밋 `ba398c330`의 것이다. 원장의 인용은 옛 루트 경로(`08-design-a-to-z.md:12`, `adr/0014-error-policy.md:40`)로 적혀 있고, 검사 도구는 `ledger/checks/lib.mjs`의 `ARCHIVE_ROOT`로 이 디렉토리의 사본을 읽는다.
- 옮긴 단계와 까닭은 [`../../plan/01-design-docs/log.md`](../../plan/01-design-docs/log.md)(U8)에 있다.

## 담긴 파일

- `00-goals.md` — 목표
- `01-current-structure.md` — 현재 구조 (관찰)
- `02-target-overview.md` — 목표 구조 개관
- `03-mental-model.md` — 전체 구조의 멘탈 모델 — 질서와 원리 (원리 원장)
- `04-inherited-constraints.md` — 계승할 제약 — 현재 코드의 트러블슈팅 기록
- `05-before-after.md` — 현재 구현과 새 설계의 대조 — 문법·인터페이스·기능
- `06-conclusions.md` — 최종 결론 — 소유자 검토용
- `07-conclusions.md` — 최종 결론 2판 — 소유자 검토용 (9라운드, 소유자의 축 열 항목 반영)
- `08-design-a-to-z.md` — 설계서 A부터 Z까지 — 소유자 최종 검토용
- `09-landing-and-test-strategy.md` — 09 — 정착 검토와 테스트 전략 (16라운드, 최종 검증 단계)
- `open-questions.md` — 미결 질문

`adr/`

- `adr/0001-validator-input-invariant.md` — ADR 0001 — 검증기 입력 불변
- `adr/0002-guard-fragment-model.md` — ADR 0002 — 조건부 장치를 "가드 → 조각" 단일 모델로 통합
- `adr/0003-group-namespace.md` — ADR 0003 — 예약 층: 그룹 객체 셋 `controls`·`options`·`presentation`으로 값과 UI를 제어한다
- `adr/0004-validator-plugin-compile-guard.md` — ADR 0004 — 검증기는 플러그인 유지, 동기 `compileGuard` 추가
- `adr/0005-blueprint-analysis-and-node-sharing.md` — ADR 0005 — 스키마 → 청사진 분석 단계와 노드 공유 규칙
- `adr/0006-single-value-ownership.md` — ADR 0006 — 값의 소유: 노드 트리가 곧 상태다
- `adr/0007-settle-cycle.md` — ADR 0007 — 작업 루프: 표시 → 계산 → 파생 → 전이 → 커밋, 그 뒤에 통지와 검증
- `adr/0008-event-system.md` — ADR 0008 — 이벤트 시스템 개편: 통지 전용 척추
- `adr/0009-performance-budget-and-benchmarks.md` — ADR 0009 — 성능 예산과 벤치마크 계획
- `adr/0010-branch-conventions.md` — ADR 0010 — 작성자의 약속: 분기 관행과 폼이 검사하지 않는 것
- `adr/0011-branch-node-composition.md` — ADR 0011 — branch 노드(object·array)의 구성 전략
- `adr/0012-fe-overlay.md` — ADR 0012 — FE 오버레이를 위한 별도의 입구를 두지 않는다
- `adr/0013-core-does-not-rewrite-values.md` — ADR 0013 — core는 값을 고치지 않는다
- `adr/0014-error-policy.md` — ADR 0014 — 오류는 삼키지 않는다: 오류·경고·검증 결과의 세 층
