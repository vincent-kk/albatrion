# @canard/schema-form 재설계 아키텍처 기록

`@canard/schema-form` 전면 재설계(파괴적 변경, 장기 과제)의 설계 기록이다. 발단은 이슈 [#342](https://github.com/vincent-kk/albatrion/issues/342)이며, 이 디렉터리는 npm 배포물에 포함되지 않는다(`package.json`의 `files`는 `dist`, `docs`, `README.md`).

다른 세션이 이 대화 없이 이어받을 수 있도록 쓴다. 구현 작업 분해나 코드 수정 지시는 여기에 두지 않는다.

## 읽는 순서

이어받는 세션은 [`HANDOFF.md`](./HANDOFF.md)부터 읽는다 — 현재 상태, 다음 할 일, 검사 명령.

1. [`PLAN.md`](./PLAN.md) — 개발의 단일 진입점: 계획 링크, 수행 방법, 단계별 진행 상황, 다음 할 일
2. [`ledger/`](./ledger/README.md) — 원장. 결정의 정본이다(영역 열일곱, 항목마다 결정과 상태, 있을 때 보충과 충돌)
3. [`design/`](./design/) — 원장을 읽는 표면인 설계문서 여덟. 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다
   - [`00-goals-and-values.md`](./design/00-goals-and-values.md) 목표와 가치 · [`01-schema-to-blueprint.md`](./design/01-schema-to-blueprint.md) 스키마에서 청사진까지 · [`02-node-and-value.md`](./design/02-node-and-value.md) 노드와 값 · [`03-settle-and-events.md`](./design/03-settle-and-events.md) 정착과 통지
   - [`04-controls.md`](./design/04-controls.md) 제어 · [`05-validation-and-errors.md`](./design/05-validation-and-errors.md) 검증과 오류 · [`06-react-and-surface.md`](./design/06-react-and-surface.md) React와 공개 표면 · [`07-landing-and-tests.md`](./design/07-landing-and-tests.md) 이주·착수와 시험
4. [`adr/`](./adr/) — 주제별 결정 기록 17편(0001–0017, 0001–0014는 옛 번호의 주제를 잇는다). 본문은 설계문서의 같은 절을 글자 그대로 모은 것이다
5. [`plan/`](./plan/README.md) — 개발계획: PR 디렉토리마다 개발요청서, 검증 구성요건, ADR과 핵심 축
6. `reviews/` — 라운드마다의 적대적 검토, 편집자 결정의 정본(`round-N-closing.md`), 소유자 답 원문
7. [`_archive/2026-09-29/`](./_archive/2026-09-29/README.md) — 원장 이전의 설계 문서(00–09, `open-questions.md`, 옛 ADR 0001–0014). 동결됐다. 새 설계문서·ADR이 드는 옛 문서 경로는 기준 커밋 `ba398c330`의 것이며 지금은 `_archive/2026-09-29/` 아래에 있다(25C-10).

그 밖에 `research/`(선행 사례 조사), `spikes/`(프로토타입과 실측)가 있다.

## ADR 목록

| 번호 | 결정 |
| ---- | ---- |
| [0001](./adr/0001-validator-input-invariant.md) | 검증기 입력 불변 |
| [0002](./adr/0002-guard-fragment-model.md) | 조건부 장치를 "가드 → 조각" 단일 모델로 통합 |
| [0003](./adr/0003-group-namespace.md) | 예약 층: 그룹 객체 셋 `controls`·`options`·`presentation`으로 값과 UI를 제어한다 |
| [0004](./adr/0004-validator-plugin-compile-guard.md) | 검증기는 플러그인 유지, 동기 `compileGuard` 추가 |
| [0005](./adr/0005-blueprint-analysis-and-node-sharing.md) | 스키마 → 청사진 분석 단계와 노드 공유 규칙 |
| [0006](./adr/0006-single-value-ownership.md) | 값의 소유: 노드 트리가 곧 상태다 |
| [0007](./adr/0007-settle-cycle.md) | 작업 루프: 표시 → 계산 → 파생 → 전이 → 커밋, 그 뒤에 통지와 검증 |
| [0008](./adr/0008-event-system.md) | 이벤트 시스템 개편: 통지 전용 척추 |
| [0009](./adr/0009-performance-budget-and-benchmarks.md) | 성능 예산과 벤치마크 계획 |
| [0010](./adr/0010-branch-conventions.md) | 작성자의 약속: 분기 관행과 폼이 검사하지 않는 것 |
| [0011](./adr/0011-branch-node-composition.md) | branch 노드(object·array)의 구성 전략 |
| [0012](./adr/0012-fe-overlay.md) | FE 오버레이를 위한 별도의 입구를 두지 않는다 |
| [0013](./adr/0013-core-does-not-rewrite-values.md) | core는 값을 고치지 않는다 |
| [0014](./adr/0014-error-policy.md) | 오류는 삼키지 않는다: 오류·경고·검증 결과의 세 층 |
| [0015](./adr/0015-union-leaf.md) | union 잎 |
| [0016](./adr/0016-fill-timing-and-full-replace-write.md) | 채움 시점과 전체 교체 쓰기 |
| [0017](./adr/0017-narrowing-intersection.md) | 좁힘의 교차 |

## 상태 표기

새 설계문서와 ADR은 원장 항목의 상태(`현행`, `현행(부정 결정)`, `현행(기록)`)를 따른다([`ledger/README.md`](./ledger/README.md)). 아래 표기는 `_archive/`의 옛 문서가 쓰던 것이다.

| 상태 | 의미 |
| ---- | ---- |
| 관찰 | 현재 코드에서 추적·실측한 사실. `file:line` 근거를 단다 |
| 제안 | 논의에서 나온 설계안. 아직 확정이 아니다 |
| 수락 | 소유자가 명시적으로 동의한 결정. 동의한 발언의 요지를 "합의 근거"에 적는다 |
| 미결 | 소유자의 결정이 필요한 질문 |

## 기록을 고칠 때

- 결정은 원장에서 바뀐다. 새 결정은 원장에 새 라운드 항목으로 먼저 들어가고 설계문서와 ADR이 따라간다(문서가 원장을 앞서지 않는다).
- 설계문서의 절을 고치면 그 절을 모은 ADR의 같은 블록도 같은 글로 고친다.
- `_archive/`의 문서는 고치지 않는다. 원장이 인용한 옛 문서의 줄 번호는 커밋 `ba398c330` 기준이다.
