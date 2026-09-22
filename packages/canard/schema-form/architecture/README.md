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

이어받는 세션은 [`HANDOFF.md`](./HANDOFF.md)부터 읽는다 — 현재 상태, 소유자 결정 대기 목록, 다음 라운드의 의제.

1. [`00-goals.md`](./00-goals.md) — 목표 G1–G8, 채택 여부를 정해야 할 목표 후보 C1–C8, 비목표
2. [`01-current-structure.md`](./01-current-structure.md) — 지금 구조와 그 구조가 #342를 낳은 경로 (관찰)
3. [`02-target-overview.md`](./02-target-overview.md) — 목표 구조의 전체 그림
4. [`03-mental-model.md`](./03-mental-model.md) — 결정을 낳는 다섯 원리, 상태·쓰기·계산의 질서, 원리 → 결정 도출표. 소유자와 이해를 맞추는 문서
5. [`04-inherited-constraints.md`](./04-inherited-constraints.md) — 현재 코드의 트러블슈팅 기록 가운데 새 설계가 지켜야 할 제약 T-1–T-23(캐럿 보존, 리마운트 금지, 가상화 명령, 순환 상한, 두 단계 하네스 …). 4라운드 수용 기준
6. [`05-before-after.md`](./05-before-after.md) — 현재 구현과 새 설계의 대조: 표준 조건부 문법, `&` 문법의 운명, 공개 인터페이스, 기능의 증감, 이주 시 만나는 것, `then`/`else`의 한계
7. `adr/` — 결정 하나에 기록 하나
8. [`open-questions.md`](./open-questions.md) — 아직 정하지 않은 것
9. `reviews/` — 적대적 검토. [`round-1.md`](./reviews/round-1.md)(측정·판정·기록별 영향), [`round-2.md`](./reviews/round-2.md)(고쳐 쓴 ADR에 대한 재공격, 확인된 결함 S1–S15, 소유자 결정, 작업 루프 프로토타입 측정), [`round-3-spec.md`](./reviews/round-3-spec.md)(3라운드의 공격 대상 — 작업 루프 3차안·판별식 식별·책임 경계), [`round-3.md`](./reviews/round-3.md)(3라운드 판정 T1–T14·B1–B6·C1–C4, 소유자 결정 D-1–D-6, 살아남은 개정 E1–E19), [`round-4-spec.md`](./reviews/round-4-spec.md)(4라운드의 공격 대상 — 작업 루프 3.1판 전체 재서술, 이벤트 시스템 확정판, 계승 제약을 수용 기준으로), [`round-4.md`](./reviews/round-4.md)(4라운드 판정 U1–U19·V1–V12, 캐럿·통지 측정, 소유자 결정 D-7–D-10, 개정 F1–F32), [`round-5-decisions.md`](./reviews/round-5-decisions.md)(5라운드 — 결정 D-1–D-10의 다중 시선 검토: 이해·배경·장단점·제안·반론·결정 간 모순 C-1–C-11. 결정하지 않음), [`round-5-derivations.md`](./reviews/round-5-derivations.md)(후속 — 소유자의 원칙 P1′과 모순 11건의 원리에서의 도출·프로토타입 확인), [`round-6-coherence.md`](./reviews/round-6-coherence.md)(6라운드 — 4차 본문 전체 조망: 리뷰어 다섯·대조 검증 62묶음, 자동 쓰기의 결정성이 핵심 발견, 원리 제안 P6–P9, 소유자 결정 D-11–D-23, 단조 수정 27건). ADR 본문은 4차(2026-09-23)이며 라운드의 결과를 흡수했다. `raw-*.md`는 리뷰어 원문이다
10. `research/` — 선행 사례 조사

## ADR 목록

| 번호 | 결정 | 상태 |
| ---- | ---- | ---- |
| [0001](./adr/0001-validator-input-invariant.md) | 검증기 입력 불변 — 폼 판정 = `validator(작성된 스키마, 방출 값)`, 같은 설정의 검증기에 대하여 | 제안 (방향은 소유자 발의, 검증기 설정 부분은 수락). 1라운드 반영 |
| [0002](./adr/0002-guard-fragment-model.md) | 조건부 장치를 "가드 → 조각" 단일 모델로 통합. 조각 트리, 금지 조각 없음(P1′), 잔여 키 계약 | 제안 (4차 본문). D-8 수락, D-2·D-3은 원리에서 도출·확정 대기 |
| [0003](./adr/0003-ampersand-namespace.md) | FE 전용 키워드를 `&` 네임스페이스로 통일. FE 키는 키워드 위치에서만 제거한다(컴파일 보호) | 제안 (방향은 소유자 발의). 1라운드 반영 |
| [0004](./adr/0004-validator-plugin-compile-guard.md) | 검증기는 플러그인 유지, 동기 `compileGuard` 추가. 설정은 소비자의 책임 | 수락. 1라운드 반영 |
| [0005](./adr/0005-blueprint-analysis-and-node-sharing.md) | 스키마 → 청사진 순수 분석 단계, 같은 이름 필드의 노드 공유 규칙, 판별식 식별(E14) | 일부 수락 (4차 본문). 정적 throw 폐지·판별식 식별은 소유자 확인 대기 |
| [0006](./adr/0006-single-value-ownership.md) | 값의 소유 — 노드 트리가 곧 상태다. 칸 아홉, null 계약 D-1 | 일부 수락 (4차 본문). 칸 목록·D-1은 원리에서 도출·확정 대기 |
| [0007](./adr/0007-settle-cycle.md) | 작업 루프 3.1판: 표시 → 계산 → 파생 → 전이 → 커밋 → 통지 → 검증. 쓰기 옵션 객체 | 일부 수락 (4차 본문). D-7–D-10 수락, 단계 구성과 D-1–D-6 도출분은 확정 대기 |
| [0008](./adr/0008-event-system.md) | 이벤트 시스템 — 동기 통지, 루트 단일 디스패처, `batch(fn)`, 진입당 `onChange` 1회 | 일부 수락 (4차 본문). D-9·D-10 수락, 동기·배치·상한은 실행 통과한 제안 |
| [0009](./adr/0009-performance-budget-and-benchmarks.md) | 성능 예산과 벤치마크 계획 | 제안 (수치 예산은 미결) |
| 0010 | `oneOf`/`anyOf`의 폼 UX | 작성 대기 (외부 사례 조사 후) |
| [0011](./adr/0011-branch-node-composition.md) | 노드의 종류 여섯과 branch 구성 전략, 참조 그룹 노드(D-6) | 제안 (4차 재작성). D-6은 원리에서 도출·확정 대기 |
| [0012](./adr/0012-fe-overlay.md) | FE 오버레이를 위한 별도의 입구를 두지 않는다 — Form은 단일 스키마를 받는다 | 수락 (`overlay` prop 제안은 철회) |
| [0013](./adr/0013-core-does-not-rewrite-values.md) | core는 값을 고치지 않는다 — 전체 교체·부분 쓰기·로드 계약, 쓰기 옵션 객체 | 제안 (4차 본문). 원칙은 소유자가 2026-09-23 재확인, D-7 수락, D-1·D-4·D-5 도출·확정 대기 |

## 기록을 고칠 때

- 결정이 바뀌면 해당 ADR의 본문을 현재 결정으로 고쳐 쓰고, 바뀐 이유를 그 ADR의 "변경 이력"에 남긴다. 새 ADR로 대체할 때는 옛 ADR의 상태를 "대체됨 → 00NN"으로 바꾼다.
- 미결 질문이 해소되면 `open-questions.md`에서 지우고 해당 ADR로 옮긴다.
- 관찰 기록(`01-current-structure.md`)은 재설계 시작 시점(`master` `660dde66f`)의 스냅숏이다. 이후 코드 변화를 따라가며 갱신하지 않는다.
