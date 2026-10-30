# @canard/schema-form 재설계 아키텍처 기록

`@canard/schema-form` 전면 재설계(파괴적 변경, 장기 과제)의 설계 기록이다. 발단은 이슈 [#342](https://github.com/vincent-kk/albatrion/issues/342)이며, 이 디렉터리는 npm 배포물에 포함되지 않는다(`package.json`의 `files`는 `dist`, `docs`, `README.md`).

다른 세션이 이 대화 없이 이어받을 수 있도록 쓴다. 구현 작업 분해나 코드 수정 지시는 여기에 두지 않는다.

## 지금 상태

8단계(검토와 성능)가 끝났고 최종 PR #445(8단계 가지에서 1.0.0-beta 로)는 Vincent의 버전 번호 결정과 병합을 기다린다. 446라운드(2026-10-26)에 Vincent가 8단계 뒤 코어 설계 수정을 명시적으로 허용해 **설계 최적화** 단계([plan/design-optimization](./plan/design-optimization/request.md), LANDING-211)를 열었다: 정착 계산 단계의 호스트별 계획과 2단계 정착, 캐시 계층(`src/app/cache`)과 폼 핸들 `rebuild`, 조건부로 슬롯 테이블과 수명별 핸들이며, 가지 `feat/schema-form-design-optimization`은 8단계 가지 위에 쌓는다. 설계 최적화 단계는 452라운드(2026-10-27)에 D1~D4를 마치고 루트 PR #472(초안)로 닫혔다: 일괄 입력은 단계 시작 판의 0.45~0.56배(0.16.1의 1.13~1.23배), React 배열 갱신 0.11~0.57배, 분기 전환은 0.16.1의 6.87배를 대규모 개편 없는 상한으로 기록했고(`verification/design-optimization/d4-results.md`), 다음 단계는 분기 전환에만 집중한다. 453라운드(2026-10-27)에 Vincent가 **분기 전환** 단계([plan/branch-switch](./plan/branch-switch/request.md), LANDING-212)를 열고 설계안을 허가했다: 게이트 전환 한 번의 비용을 O(G) 작은 상수항 + O(Δ) + 작은 바닥으로 만들며(SETTLE-053), 검증기 `if`·`active`·`discriminator` 세 게이트 종류의 판정을 하나로 통일하는 것이 최우선이고(BLUEPRINT-055), 단계는 B0 측정 장부 → B1 게이트 통일 → B2 준비물과 Δ 적용 → B3 관문 재측정 → (조건부) B4 설계 Ⅱ → B5 마감이다(TEST-092). 458라운드(2026-10-28)까지 B1(게이트 통일, #476)·B2-P2(호스트 수명 준비물, #478)·B4-1(설계 Ⅱ 슬롯 보유와 복제 재진입, #480)·B4-2(잠복 경로 제거, 슬롯 단일 모델, #481)를 편집자 결정으로 채택했고(재검증) B2-P1·P1b·P3는 미채택이며, 459라운드의 B3 관문 재측정(#482)은 oneOf-80 쓰기당 0.16.1 36.7 / 단계 시작 245.5 / 단계 끝 152.0 µs(−38 %, 4.14배)로 관문 여섯 가운데 둘만 통과해 계획서대로 단계를 멈췄다(TEST-098, NODE-065, PROCESS-077). 460라운드(2026-10-28)에 Vincent가 458C-05의 기존 결함 후보 둘을 결함으로 정해 고쳤다: B6(#483, 경로 문법의 단일 해석기 `helpers/jsonPointer`, 예약 토큰 `*`·`..`·`.`·`@`의 리터럴은 RFC 6901 §6 퍼센트 표기, 별표 호환 장치 제거, 슬래시 하나는 "구분자 + 빈 이름")과 B7(#484, 지움 배열의 kept 아이템 압축 복원과 쓰기 주소 규칙)을 독립 검토(claude 검증 에이전트 아홉 번)와 최종 머리의 전체 관문 뒤 병합했고, B5 이정표 측정(#485)은 oneOf-80 쓰기당 0.16.1 39.30 / 단계 시작 249.57 / 단계 끝 171.94 µs(4.37배)로 B3와 같은 그림이라 설계 Ⅱ를 이정표로 찍었으며 설계 Ⅲ(선택·계산 self와 형제 선형항)의 착수는 Vincent가 정한다(VALUE-040, TEST-099, PROCESS-078). 461라운드(2026-10-28)에 Vincent가 보강 PR(B8 #486: 전용 오류 코드 `ReservedPropertyName`, 생존 0개 지움 배열의 폐기 통일, B6 P3 넷, 배달 장면, mount-oneOf-80의 단계별 사유)을 먼저 병합하게 했고, 설계 Ⅲ([plan/branch-switch/design-iii.md](./plan/branch-switch/design-iii.md): 형제 선형항의 근원은 직접 계획에 막힌 정적 준비물이며 1.5배 관문은 이 설계의 범위 밖)의 착수를 정했으며(B9-0 측정 → B9-1~3 → B10 이정표 → 설계 Ⅳ 검토), 창 중단 넷 뒤 창 스케줄 규칙 다섯을 두었다(VALUE-041, TEST-100, PROCESS-079). 462라운드(2026-10-29)에 Vincent가 떼어진 참조의 비대칭을 두고 설계 논의 끝에 단일 규칙 B11(#487: 떼어진 쓰기는 무동작과 개발 경고, 비활성 값은 경로 JSON 쓰기뿐, `find`는 그대로, 쓰기 주소 장치 제거)을 병합하게 했고, 그 대체로 `controls.inactiveValue`와 `node.onInactive`가 한 인터페이스 `(value, context) => unknown`을 쓰는 B12 계약([plan/branch-switch/exit-value.md](./plan/branch-switch/exit-value.md))을 채택했으며, 워커 깨우기와 창 재개 규칙을 두었다(NODE-066, VALUE-042, PROCESS-080). 463라운드(2026-10-29)에 B9-0 측정(#488)·B12(#489)·B9-1(#490: 형제 1,000 전환 2,013 → 316 µs)을 병합했고, Vincent가 설계 Ⅲ을 B9-1에서 마감하고 설계 Ⅳ([plan/branch-switch/design-iv.md](./plan/branch-switch/design-iv.md): 국소 정착으로 oneOf 전환의 바닥을 깎음)를 제안서의 이론상 바닥을 목표로 채택했다(TEST-101, VALUE-043, SETTLE-054, PROCESS-081). 가지 `feat/schema-form-branch-switch`는 설계 최적화 가지 위에 쌓는다. 그 뒤가 9단계(정리와 릴리스, [plan/09-release-and-cleanup](./plan/09-release-and-cleanup/request.md))다. 단계별 경과와 마감 상태는 [reviews/README.md](./reviews/README.md)에 있다.

## 읽는 순서

1. [`ledger/`](./ledger/README.md) — 원장. 결정의 정본이다(영역 열일곱, 항목마다 결정과 상태, 있을 때 보충과 충돌). 검사 명령과 라운드 기록 절차는 [ledger/checks/README.md](./ledger/checks/README.md)에 있다
2. [`design/`](./design/) — 원장을 읽는 표면인 설계문서 여덟. 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다
   - [`00-goals-and-values.md`](./design/00-goals-and-values.md) 목표와 가치 · [`01-schema-to-blueprint.md`](./design/01-schema-to-blueprint.md) 스키마에서 청사진까지 · [`02-node-and-value.md`](./design/02-node-and-value.md) 노드와 값 · [`03-settle-and-events.md`](./design/03-settle-and-events.md) 정착과 통지
   - [`04-controls.md`](./design/04-controls.md) 제어 · [`05-validation-and-errors.md`](./design/05-validation-and-errors.md) 검증과 오류 · [`06-react-and-surface.md`](./design/06-react-and-surface.md) React와 공개 표면 · [`07-landing-and-tests.md`](./design/07-landing-and-tests.md) 이주·착수와 시험
3. [`adr/`](./adr/) — 주제별 결정 기록 17편(0001–0017, 0001–0014는 옛 번호의 주제를 잇는다). 본문은 설계문서의 같은 절을 글자 그대로 모은 것이다
4. [`plan/`](./plan/README.md) — 개발계획: 단계 디렉토리마다 개발요청서, 검증 구성요건, ADR과 핵심 축. 원장이 경로나 줄 번호로 인용하는 단계 기록(03·04·05·07 의 log.md)은 증거라서 남겼다
5. reviews/ — 기록. 라운드마다의 편집자 결정 정본(round-N-closing.md)과 소유자 답 원문(round-N-owner-answers.md), 소유자 결정 대기열, 단계별 경과([reviews/README.md](./reviews/README.md))
6. verification/ — 단계별 측정·검증 결과 문서. 원자료(스크립트·패치·로그·JSON)는 445라운드 정리에서 지웠고 되살리는 법은 reviews/README.md 의 정리 기록에 있다
7. [`_archive/2026-09-29/`](./_archive/2026-09-29/README.md) — 원장 이전의 설계 문서(00–09, `open-questions.md`, 옛 ADR 0001–0014). 동결됐다. 새 설계문서·ADR이 드는 옛 문서 경로는 기준 커밋 `ba398c330`의 것이며 지금은 `_archive/2026-09-29/` 아래에 있다(25C-10).

에이전트의 역할, 장기 작업과 워커의 구분, 사용량 정책은 [AGENT-POLICY.md](./AGENT-POLICY.md)가 든다(작업이 끝날 때까지 둔다).

그 밖에 research/(선행 사례 조사)와 spikes/(원장이 인용하거나 시험이 쓰는 프로토타입 파일만 남았다)가 있다.

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

## 464라운드 마감 보충(2026-10-30)

위의 463라운드 당시 상태 뒤, 분기 전환 단계는 제품 `2eaa0e1f8`에서 마감했습니다. Ⅳ-0의 전제 정정, 국소 바퀴·scratch 두 안의 미채택, 미시 위생, 함수 프로파일과 작은 절감 다섯의 예외 채택을 거쳤습니다. 최종 E/L은 oneOf-80 3.335·siblings-0 3.614·payload-12 1.644·nested-oneOf-20 7.374배이며 Node 힙은 통과, Bun은 단계 시작보다 +1.4%입니다. Vincent는 "그래 이게 현재로선 상한 같네. 1로 가자. 마감 진행"이라고 결정했습니다. [마감 결과](verification/branch-switch/closing-results.md)와 [464라운드 닫기](reviews/round-464-closing.md)를 현재 결론으로 읽습니다. 최신 병합 지시는 코디네이터가 #472와 분기 전환 루트 PR을 `feat/schema-form-08-review-and-perf`에 각각 한 커밋으로 스쿼시 병합하는 것이며, #445(08→1.0.0-beta)·우산 초안 #344와 버전 결정은 Vincent의 몫입니다. 필요한 후보·커밋 자료는 [본선 보존물](_archive/branches/README.md)로 옮기고 가지 삭제는 코디네이터가 병합 뒤 수행합니다. 9단계는 새 지시 뒤 시작합니다.
