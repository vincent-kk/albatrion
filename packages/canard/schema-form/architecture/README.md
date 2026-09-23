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
7. [`06-conclusions.md`](./06-conclusions.md) — 8라운드까지의 최종 결론. `07-conclusions.md`가 대체했으며, 그대로인 항목의 전문이 여기 남아 있다
8. [`07-conclusions.md`](./07-conclusions.md) — **최종 결론 2판, 소유자 검토용.** 소유자가 더한 축 열 항목과 답 셋 위에서 9라운드가 다시 도출한 결과. 06의 항목별 그대로/바뀜/지워짐, 새 도출(채움은 노드 생성 사건, 예약 층의 단계와 같은 대상 규칙, 분기를 고르지 않음, 결합 규칙, 병합표, 값 조작 표), 소유자가 답할 문장 스물두 개(10라운드 추정 뒤 소유자만 셋·확인만 다섯·권고 있는 것 열넷으로 재배치), 확정 이름(`control`, `&unsetValue`, `DisableAutomaticWrites`, `&active` 통합, `&default`, `&children`), ajv 실측과 프로토타입 `loop-v5`. 소유자가 절 단위로 통과 또는 반려한다. 그다음 `reviews/round-13-owner-answers.md`(마지막 소유자 결정)와 `reviews/round-11-readiness.md`(착수 전 평가)
9. `adr/` — 결정 하나에 기록 하나
10. [`open-questions.md`](./open-questions.md) — 아직 정하지 않은 것
11. `reviews/` — 적대적 검토. [`round-1.md`](./reviews/round-1.md)(측정·판정·기록별 영향), [`round-2.md`](./reviews/round-2.md)(고쳐 쓴 ADR에 대한 재공격, 확인된 결함 S1–S15, 소유자 결정, 작업 루프 프로토타입 측정), [`round-3-spec.md`](./reviews/round-3-spec.md)(3라운드의 공격 대상 — 작업 루프 3차안·판별식 식별·책임 경계), [`round-3.md`](./reviews/round-3.md)(3라운드 판정 T1–T14·B1–B6·C1–C4, 소유자 결정 D-1–D-6, 살아남은 개정 E1–E19), [`round-4-spec.md`](./reviews/round-4-spec.md)(4라운드의 공격 대상 — 작업 루프 3.1판 전체 재서술, 이벤트 시스템 확정판, 계승 제약을 수용 기준으로), [`round-4.md`](./reviews/round-4.md)(4라운드 판정 U1–U19·V1–V12, 캐럿·통지 측정, 소유자 결정 D-7–D-10, 개정 F1–F32), [`round-5-decisions.md`](./reviews/round-5-decisions.md)(5라운드 — 결정 D-1–D-10의 다중 시선 검토: 이해·배경·장단점·제안·반론·결정 간 모순 C-1–C-11. 결정하지 않음), [`round-5-derivations.md`](./reviews/round-5-derivations.md)(후속 — 소유자의 원칙 P1′과 모순 11건의 원리에서의 도출·프로토타입 확인), [`round-6-coherence.md`](./reviews/round-6-coherence.md)(6라운드 — 4차 본문 전체 조망: 리뷰어 다섯·대조 검증 62묶음, 자동 쓰기의 결정성이 핵심 발견, 원리 제안 P6–P9, 소유자 결정 D-11–D-23, 단조 수정 27건), [`round-7-convergence.md`](./reviews/round-7-convergence.md)(7라운드 — D-11–D-23·P6–P9·단조 수정을 축에서 수렴: 소스 여섯과 대조 검증, 수렴된 것·정책으로 남는 것·읽기 확인·6라운드 정정·새 결정 후보 D-24–D-36·실험 명세·§10 정책의 재분류). 8라운드는 별도 종합 문서 없이 `06-conclusions.md`에 직접 들어갔다 — 원문은 `raw-round8-derivation-{local,antigravity,claude}.md`, `raw-round8-naming.md`, `raw-round8-verification.md`, `../spikes/round8/`. [`round-9-spec.md`](./reviews/round-9-spec.md)(9라운드 명세 — 소유자의 축 열 항목·읽기 셋의 답·이미 정해진 것·도출 과제 Q1–Q8·검증 뒤 정정 §7), [`round-9-derivation.md`](./reviews/round-9-derivation.md)(9라운드 종합 — 단계와 같은 대상 규칙, 값 조작 표, 결합 규칙, 병합표, 분기·조각 재서술, 06 영향 목록, 갈림 판정, 남는 정책 스물세 개). 원문은 `raw-round9-axis-mapping.md`, `raw-round9-code-facts.md`, `raw-round9-naming-{antigravity,codex,local}.md`, `raw-round9-derivation-{local,claude,antigravity}.md`, `raw-round9-verification.md`, `raw-round9-readiness-{antigravity,local}.md`(개발 진입 평가), `../spikes/round9/`. [`round-10-spec.md`](./reviews/round-10-spec.md)(10라운드 명세 — 남은 정책 스물셋의 분류: 소유자만 정할 것·확인만·추정 대상, 채택 규칙), [`round-10-derivation.md`](./reviews/round-10-derivation.md)(10라운드 종합 — 항목별 판정, 실험이 말한 것, 정착 안 에지 소비의 발견). 원문은 `raw-round10-derivation-{local,claude,antigravity}.md`, `raw-round10-verification.md`, `../spikes/round10/`. ADR 0002·0003·0005·0006·0007·0008·0013은 5차 본문(2026-09-23)이며 7–10라운드와 소유자의 답 스물셋을 흡수했다. 원리 원장 `03-mental-model.md`도 5차다. `raw-*.md`는 리뷰어 원문이다. 11라운드: [`round-11-owner-answers-check.md`](./reviews/round-11-owner-answers-check.md)(소유자 답 26개의 정합성 검증 판정과 소유자가 정할 목록 열 개, §4), [`raw-round11-owner-answers-claude.md`](./reviews/raw-round11-owner-answers-claude.md)·[`raw-round11-owner-answers-antigravity.md`](./reviews/raw-round11-owner-answers-antigravity.md)(검증 원문), 실측 `../spikes/round11-corpus/REPORT.txt`(생성기 스키마 14종을 v5 프로토타입에 통과). 12·13라운드: [`round-12-owner-review.md`](./reviews/round-12-owner-review.md)·[`round-12-owner-answers.md`](./reviews/round-12-owner-answers.md)·[`round-12-derivation.md`](./reviews/round-12-derivation.md)(판단 여덟과 답, 레드팀 판정), `raw-round12-*.md`(레드팀·오류 분류 원문), [`round-13-owner-review.md`](./reviews/round-13-owner-review.md)·[`round-13-owner-answers.md`](./reviews/round-13-owner-answers.md)(레드팀 뒤 판단 넷과 답), [`round-11-readiness.md`](./reviews/round-11-readiness.md)(착수 전 평가).
12. `research/` — 선행 사례 조사

## ADR 목록

| 번호 | 결정 | 상태 |
| ---- | ---- | ---- |
| [0001](./adr/0001-validator-input-invariant.md) | 검증기 입력 불변 — 폼 판정 = `validator(작성된 스키마, 방출 값)`, 같은 설정의 검증기에 대하여 | 4차(5차 주 있음) |
| [0002](./adr/0002-guard-fragment-model.md) | 조건부 장치를 "게이트 → 조각" 단일 모델로 통합. `if` 게이트와 `&active` 게이트, 폼은 분기를 고르지 않음, `&discriminator` 예외, 분기 컨벤션(`else: false` + `required`) | 일부 수락 (5차 본문). 소유자 답 A-2·A-3·22·23 반영 |
| [0003](./adr/0003-ampersand-namespace.md) | 예약 층: `&` 키와 `control` 컨테이너로 값과 UI를 제어한다. 키 목록·단계·품사, 두 철자, 글로벌 > 로컬, `&if`는 `&active`로 흡수 | 일부 수락 (5차 본문). 이름은 소유자 동의 |
| [0004](./adr/0004-validator-plugin-compile-guard.md) | 검증기는 플러그인 유지, 동기 `compileGuard` 추가. 설정은 소비자의 책임 | 4차(5차 주 있음) |
| [0005](./adr/0005-blueprint-analysis-and-node-sharing.md) | 스키마 → 청사진 순수 분석 단계, 같은 이름 필드의 노드 공유 규칙, 명시 판별 `&discriminator`, 유효 스키마 병합표 | 일부 수락 (5차 본문). E14 판별식 식별은 삭제 |
| [0006](./adr/0006-single-value-ownership.md) | 값의 소유 — 노드 트리가 곧 상태다. 칸 열, 상태 둘(`raw`·`extras`), null 계약 D-1, `find`·`findNodes`는 터미널 아래 노드 없음 | 일부 수락 (5차 본문) |
| [0007](./adr/0007-settle-cycle.md) | 작업 루프 5차: 표시 → 계산 → 파생(같은 대상 규칙, 에지 소비) → 전이(노드 생성 채움) → 커밋 → 통지 → 검증. 쓰기 옵션 비트마스크 | 일부 수락 (5차 본문). 순위·채움·비수렴은 소유자 답 |
| [0008](./adr/0008-event-system.md) | 이벤트 시스템 — 동기 통지, 루트 단일 디스패처, `batch(fn)`, 진입당 `onChange` 1회, 진단 표면 `diagnostics`, 유효 스키마 변경 배달 | 일부 수락 (5차 본문) |
| [0009](./adr/0009-performance-budget-and-benchmarks.md) | 성능 예산과 벤치마크 계획 | 4차(5차 주 있음) |
| [0010](./adr/0010-branch-conventions.md) | 분기 관행: `else: false`, `if`의 `required`, `&active` 분기의 `const`+`required`, `&discriminator` 명시. 폼은 검사하지 않는다 | 초안(11라운드) |
| [0011](./adr/0011-branch-node-composition.md) | 노드의 종류 여섯과 branch 구성 전략, 참조 그룹 노드(D-6) | 4차(5차 주 있음. 노드 종류는 원장 §2, D-6은 하지 않음) |
| [0012](./adr/0012-fe-overlay.md) | FE 오버레이를 위한 별도의 입구를 두지 않는다 — Form은 단일 스키마를 받는다 | 4차(5차 주 있음) |
| [0013](./adr/0013-core-does-not-rewrite-values.md) | core는 값을 고치지 않는다 — 전체 교체·부분 쓰기·로드는 새 수명, 자동 쓰기 넷과 `DisableAutomaticWrites` | 일부 수락 (5차 본문). 억제 범위는 소유자 답 |

## 기록을 고칠 때

- 결정이 바뀌면 해당 ADR의 본문을 현재 결정으로 고쳐 쓰고, 바뀐 이유를 그 ADR의 "변경 이력"에 남긴다. 새 ADR로 대체할 때는 옛 ADR의 상태를 "대체됨 → 00NN"으로 바꾼다.
- 미결 질문이 해소되면 `open-questions.md`에서 지우고 해당 ADR로 옮긴다.
- 관찰 기록(`01-current-structure.md`)은 재설계 시작 시점(`master` `660dde66f`)의 스냅숏이다. 이후 코드 변화를 따라가며 갱신하지 않는다.
