# @canard/schema-form 재설계 아키텍처 기록

`@canard/schema-form` 전면 재설계(파괴적 변경, 장기 과제)의 설계 기록이다. 발단은 이슈 [#342](https://github.com/vincent-kk/albatrion/issues/342)이며, 이 디렉터리는 npm 배포물에 포함되지 않는다(`package.json`의 `files`는 `dist`, `docs`, `README.md`).

다른 세션이 이 대화 없이 이어받을 수 있도록 쓴다. 구현 작업 분해나 코드 수정 지시는 여기에 두지 않는다.

## 상태 표기

| 상태 | 의미 |
| ---- | ---- |
| 관찰 | 현재 코드에서 추적·실측한 사실. `file:line` 근거를 단다 |
| 제안 | 논의에서 나온 설계안. 아직 확정이 아니다 |
| 수락 | 소유자가 명시적으로 동의한 결정. 동의한 발언의 요지를 "합의 근거"에 적는다 |
| 미결 | 소유자의 결정이 필요한 질문 |

## 읽는 순서

1. [`00-goals.md`](./00-goals.md) — 목표 G1–G8, 채택 여부를 정해야 할 목표 후보 C1–C8, 비목표
2. [`01-current-structure.md`](./01-current-structure.md) — 지금 구조와 그 구조가 #342를 낳은 경로 (관찰)
3. [`02-target-overview.md`](./02-target-overview.md) — 목표 구조의 전체 그림
4. `adr/` — 결정 하나에 기록 하나
5. [`open-questions.md`](./open-questions.md) — 아직 정하지 않은 것
6. [`reviews/round-1.md`](./reviews/round-1.md) — 적대적 검토 1라운드: 측정, 판정, 기록별 영향. ADR 0001·0003·0004·0006·0007·0008은 이 검토와 그 뒤의 소유자 결정을 반영해 고쳐 썼다. ADR 0002·0005·0009도 이어서 고쳐 썼다. **ADR 0011(R13·R14·R16)은 `open-questions.md` Q5가 정해진 뒤에 고쳐 쓴다.** 읽을 때 이 문서의 §8·§9를 함께 본다
7. `research/` — 선행 사례 조사

## ADR 목록

| 번호 | 결정 | 상태 |
| ---- | ---- | ---- |
| [0001](./adr/0001-validator-input-invariant.md) | 검증기 입력 불변 — 폼 판정 = `validator(작성된 스키마, 방출 값)`, 같은 설정의 검증기에 대하여 | 제안 (방향은 소유자 발의, 검증기 설정 부분은 수락). 1라운드 반영 |
| [0002](./adr/0002-guard-fragment-model.md) | 조건부 장치를 "가드 → 조각" 단일 모델로 통합. 합성 문맥을 보존한다 | 제안. 1라운드 반영 — 개정분은 소유자 확인 대기 |
| [0003](./adr/0003-ampersand-namespace.md) | FE 전용 키워드를 `&` 네임스페이스로 통일. 기본은 제거하지 않는다 | 제안 (방향은 소유자 발의). 1라운드 반영 |
| [0004](./adr/0004-validator-plugin-compile-guard.md) | 검증기는 플러그인 유지, 동기 `compileGuard` 추가. 설정은 소비자의 책임 | 수락. 1라운드 반영 |
| [0005](./adr/0005-blueprint-analysis-and-node-sharing.md) | 스키마 → 청사진 순수 분석 단계, 같은 이름 필드의 노드 공유 규칙, 판별식 식별 | 일부 수락. 1라운드 반영 — 개정분(정적 throw 폐지, 판별식 식별)은 **소유자 확인 대기** |
| [0006](./adr/0006-single-value-ownership.md) | 값의 소유 — 노드 트리가 곧 상태다 (Fiber 방식) | 수락 (2차안) |
| [0007](./adr/0007-settle-cycle.md) | 작업 루프: 표시 → 계산 → 커밋, 그 뒤에 통지와 검증 | 일부 수락 (가드가 보는 값, 순환의 처리) |
| [0008](./adr/0008-event-system.md) | 이벤트 시스템 개편 — 통지 전용 척추, 루트 단일 디스패처 | 제안 (루트 디스패처는 소유자 발의, 검토에서 조건부 통과) |
| [0009](./adr/0009-performance-budget-and-benchmarks.md) | 성능 예산과 벤치마크 계획 | 제안 (수치 예산은 미결) |
| 0010 | `oneOf`/`anyOf`의 폼 UX | 작성 대기 (외부 사례 조사 후) |
| [0011](./adr/0011-branch-node-composition.md) | branch 노드(object·array)의 구성 전략 | 제안 초안 — 논의의 출발점 |
| [0012](./adr/0012-fe-overlay.md) | FE 오버레이를 위한 별도의 입구를 두지 않는다 — Form은 단일 스키마를 받는다 | 수락 (`overlay` prop 제안은 철회) |

## 기록을 고칠 때

- 결정이 바뀌면 해당 ADR의 본문을 현재 결정으로 고쳐 쓰고, 바뀐 이유를 그 ADR의 "변경 이력"에 남긴다. 새 ADR로 대체할 때는 옛 ADR의 상태를 "대체됨 → 00NN"으로 바꾼다.
- 미결 질문이 해소되면 `open-questions.md`에서 지우고 해당 ADR로 옮긴다.
- 관찰 기록(`01-current-structure.md`)은 재설계 시작 시점(`master` `660dde66f`)의 스냅숏이다. 이후 코드 변화를 따라가며 갱신하지 않는다.
