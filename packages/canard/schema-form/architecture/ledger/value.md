# 단일 원장 — 상태와 값의 소유

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 영역은 노드가 드는 칸, 상태와 계산 결과와 작업의 기록의 구분, 값의 소유, 형상에 있음과 없음, 값 읽기를 다룬다. 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) `adr/0006-single-value-ownership.md`(5차 본문, 일부 수락)가 이 영역의 정본이다. (3) `03-mental-model.md` §2(원장)는 `08-design-a-to-z.md` §4와 다르면 원장이 이긴다(08이 스스로 그렇게 적는다). (4) 뒤 라운드가 앞 라운드를 이긴다. `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고, 뒤 문서가 바꿨으면 "대체됨"으로 남는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| VALUE-001 | 별도의 데이터 모델을 두지 않는다 — 노드 트리가 곧 상태 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-002 | 노드가 드는 칸과 그 종류 — 상태는 raw와 extras 둘뿐 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3, 상태가 둘뿐인 것은 그 귀결 `adr/0006-single-value-ownership.md:3`), 원리(`03-mental-model.md:55-72` §2, 칸 목록 `adr/0006-single-value-ownership.md:3`) |
| VALUE-003 | diagnostics 칸 — 작업의 기록, 다음 로드까지 지속, 루트에서 관측 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| VALUE-004 | 저장되는 값은 자식 노드가 없는 노드에만 있다 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-005 | 노출 표면은 전략과 무관하게 같다 — 경로 조회도 같다 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-006 | 노드는 형상에 있거나 없다 — 형상에 없는 노드의 원본과 나감 | 현행 | 원리(`03-mental-model.md:72` P4), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2, 보충의 하위 트리 문장), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) |
| VALUE-007 | 노드가 생긴다는 것 — 채움은 이 사건에만 | 현행 | 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 원리(`03-mental-model.md:90` 로드는 새 수명) |
| VALUE-008 | 형상에서 빠지는 것은 쓰기가 아니다 — null을 포함한 전체 교체는 V에 없는 원본을 지운다 | 현행 | 소유자 답(`reviews/round-9-spec.md:22` 축4), 원리(`03-mental-model.md:92` P4) |
| VALUE-009 | 불변식은 emit에만 있다 | 현행 | 원리(`adr/0006-single-value-ownership.md:3` emit 불변식은 원리에서 도출, `03-mental-model.md:16` P4) |
| VALUE-010 | extras의 방출 순서는 받은 순서다 | 현행 | 편집자 결정(8라운드 D-32, `06-conclusions.md:201-207`), 편집자 결정(9라운드 그대로, `07-conclusions.md:99`) |
| VALUE-011 | 값 읽기는 셋이다 — value, outputValue, getInactiveValues | 분할됨(→ VALUE-027, VALUE-028) | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`) |
| VALUE-012 | emit의 참조 규칙 | 현행 | 편집자 결정(4차 본문, 3·4·5라운드 반영 F9, `adr/0006-single-value-ownership.md:10`) |
| VALUE-013 | 읽기는 계산하지 않는다 — 메모는 커밋 단계에서만 | 현행 | 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문, 3·4·5라운드 반영, `adr/0006-single-value-ownership.md:10`) |
| VALUE-014 | 읽기가 쓰기보다 잦은 구조에서의 비용 표 | 현행 | 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문 E13, `adr/0006-single-value-ownership.md:10`, 역색인 행) |
| VALUE-015 | null 계약 D-1 — setValue(null)은 키가 없는 전체 교체 | 현행 | 원리(`reviews/round-5-derivations.md:40` D-1) |
| VALUE-016 | 결과 — 레벨마다의 사본과 잠금이 필요 없어진다 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-017 | 형상에 없는 노드의 원본은 설계상 잠복이다 | 현행 | 원리(`03-mental-model.md:59` P1·P4) |
| VALUE-018 | 잠복 원본의 실제 파기 시점이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:112`) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`) |
| VALUE-019 | 배열 아이템의 생김과 채움이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:109`) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`) |
| VALUE-020 | Q2 — null 계약의 장치를 새 구조에서 표현하는 방법이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:112`) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`) |
| VALUE-021 | "값이 바뀌었다"는 값 비교다 — 에지의 값 동등 판정이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:107`) | 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`) |
| VALUE-022 | 상호작용 상태 dirty·touched는 현행 유지 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:109` C6) |
| VALUE-023 | 버린 대안 — 루트의 JSON 값 트리, 셀 테이블, 노드별 사본 동기화 | 현행(부정 결정) | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가), 편집자 결정(1차안 대체, 적대적 검토 R12, `adr/0006-single-value-ownership.md:12`) |
| VALUE-024 | 대체됨: node.value는 원본, normalizedValue는 방출 값이라는 구분의 유지 | 대체됨(→ VALUE-027) | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:166`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8; VALUE-027의 이름으로 대체) |
| VALUE-025 | 결과 — 기본 정책에서 원본은 남고, 나감 정책이 참이면 다시 켜질 때 채움을 받는다 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| VALUE-026 | 대체됨: 상태 칸은 raw·selection·extras 셋이라는 06 용어표의 정의 | 대체됨(→ VALUE-002) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:29`) |
| VALUE-027 | 값 읽기는 셋이다 — value, outputValue, getInactiveValues의 이름 | 현행 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8) |
| VALUE-028 | 구조 공유는 `emit` 사이에서만 말한다 | 현행 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`) |
| VALUE-029 | 잠복 원본 열거 — 루트 노드의 함수, 노드마다 getter `inactiveValues` | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:22` 12-8 셋째) |

## 항목

### VALUE-001 별도의 데이터 모델을 두지 않는다 — 노드 트리가 곧 상태
- 결정:
  > **1. 별도의 데이터 모델을 두지 않는다. 노드 트리가 곧 상태다.**
- 보충:
  > 소유자: "중앙에 값을 두는 걸 허용. 단, 데이터모델을 따로 두는 건 안 돼. react 파이버처럼 node가 동작하도록 했으면 해. 최적화와 라이프사이클 관점에서의 단일화는 동의해." (`adr/0006-single-value-ownership.md:16`)
  > 소유자(1라운드): "**데이터 모델을 따로 두지 않는다** — 노드가 React Fiber처럼 동작한다. 최적화와 라이프사이클의 단일화에는 동의." (`reviews/round-1.md:176`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:25`(정본), `adr/0006-single-value-ownership.md:3,12,16`, `02-target-overview.md:142`, `03-mental-model.md:70`, `reviews/round-1.md:176`
- 닫은 사람: 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가)
- 라운드: 1
- 까닭: `adr/0006-single-value-ownership.md:12`, `adr/0006-single-value-ownership.md:21`

### VALUE-002 노드가 드는 칸과 그 종류 — 상태는 raw와 extras 둘뿐
- 결정:
  > **2. 노드가 드는 칸은 열이고, 그 가운데 상태는 둘뿐이다.**
  > | 칸 | 종류 | 내용 |
  > | -- | ---- | ---- |
  > | `raw` | 상태 | 원본. 리프와 터미널 노드가 값을 든다. 자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다 |
  > | `extras` | 상태 | 호스트가 받은, 어떤 조각에도 선언되지 않은 키와 값, 그리고 그 순서(E16). 순서는 받은 순서이며 ECMAScript own-key 순서를 따른다 |
  > | `active` | 계산 | 이번 커밋의 활성 조각·노드 집합 |
  > | `local` | 계산 | 활성 자식 `emit`의 합성 — 투영 전 |
  > | `emit` | 계산 | `local`의 투영 |
  > | `schema` | 계산(메모) | 노드의 유효 스키마 — 켜진 조각을 병합한 것 |
  > | 재계산 목록 | 작업 | 이번 정착에서 다시 계산할 자식의 목록. 상호작용 상태 `dirty`와 다른 것이다 |
  > | `revision` | 원장 | 통지 원장. 커밋 때 일괄 갱신한다(F16) |
  > | 커밋 번호 | 원장 | 검증 결과의 스탬프. 오래된 결과를 버린다(F28) |
  > **상태는 `raw`와 `extras` 둘뿐이다**(P3). 나머지는 상태에서 계산되거나 작업의 기록이다. "노드 트리가 곧 상태"는 이 둘을 노드가 소유한다는 뜻이다. 폼은 `oneOf`·`anyOf`로 분기를 고르지 않으므로(P1′) 수동 분기 선택을 담을 칸이 없다.
- 보충:
  > "extras     호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서. `if` 안에만 적힌 키는 선언이 아니므로 `extras`다." (`03-mental-model.md:59`)
  > "조각이 선언한 키는 그 조각이 모두 꺼지면 잠복 원본이며 게이트도 검증기도 보지 않는다(P1·P4, 14라운드)" (`03-mental-model.md:59`)
  > "extras       호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서(정적. if 안에만 적힌 키도 여기)" (`08-design-a-to-z.md:153`)
  > "같은 조각 집합이면 같은 참조" (`08-design-a-to-z.md:158`)
  > "active     이번 커밋의 활성 조각·노드 집합 — 계산 결과, 상태가 아니다 (P3)" (`03-mental-model.md:60`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:27-42`(정본), `adr/0006-single-value-ownership.md:3,9`, `02-target-overview.md:142-148`, `03-mental-model.md:57-70`, `08-design-a-to-z.md:151-166`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3, 상태가 둘뿐인 것은 그 귀결 `adr/0006-single-value-ownership.md:3`), 원리(`03-mental-model.md:55-72` §2, 칸 목록 `adr/0006-single-value-ownership.md:3`)
- 라운드: 10
- 까닭: `adr/0006-single-value-ownership.md:42`
- 충돌:
  > `reviews/round-18-owner-answers.md:9`의 "노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7)."는 이 표에 없는 칸을 더한다. 18라운드 소유자 답이 뒤이므로 "칸은 열"의 수는 낡았다. 경고등이 상태인지 계산인지는 아직 적히지 않았다(→ WRITE-054).

### VALUE-003 diagnostics 칸 — 작업의 기록, 다음 로드까지 지속, 루트에서 관측
- 결정:
  > | 칸 | 종류 | 내용 |
  > | -- | ---- | ---- |
  > | `diagnostics` | 작업 | 마지막 로드 이후의 작업 기록(ADR 0014 4판 §5. 지속은 14라운드 답 O-2 가). `status`는 `'stable'` 또는 `'degraded'`이고 `cause`를 든다. `degraded` 동안 폼의 제출 경로가 거부한다(17라운드 소유자 답 R17-1 나). 루트에서 관측한다 |
- 보충:
  > "diagnostics 마지막 로드 이후의 기록('stable' 또는 'degraded', cause(예산·식·대상·공유 충돌), exceededBudget, iterations, commit. 다음 로드까지 남고 그 동안 제출 경로가 거부한다. ADR 0014 4판 §5) — 작업의 기록, 루트에서 관측" (`03-mental-model.md:67`)
  > "diagnostics  마지막 로드 이후의 기록 { status: 'stable' | 'degraded', cause?, exceededBudget?, iterations?, commit? } (모양은 ADR 0014 §5. 다음 로드까지 남고(14라운드 답 O-2) 그 동안 폼의 제출 경로가 거부한다(17라운드 소유자 답 R17-1 나))" (`08-design-a-to-z.md:163`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:37`(정본), `02-target-overview.md:148`, `03-mental-model.md:67`, `08-design-a-to-z.md:163`, `07-conclusions.md:348`(모양과 제출 거부의 정본은 `adr/0014-error-policy.md` §5)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `adr/0006-single-value-ownership.md:37`

### VALUE-004 저장되는 값은 자식 노드가 없는 노드에만 있다
- 결정:
  > **3. 저장되는 값은 자식 노드가 없는 노드에만 있다** — 터미널 타입(string·number·boolean·null)과 터미널 전략의 object·array. 자식 노드가 있는 노드의 값은 자식들로부터 계산되어 **그 노드에 메모된다.**
- 보충:
  > 소유자(1라운드): "자식을 가진 노드도 터미널 전략이면 값을 직접 쓴다." (`reviews/round-1.md:176`)
  > "자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다" (`adr/0006-single-value-ownership.md:31`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:44`(정본), `adr/0006-single-value-ownership.md:31`, `03-mental-model.md:58`, `08-design-a-to-z.md:152`, `reviews/round-1.md:176`
- 닫은 사람: 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가)
- 라운드: 1
- 까닭: `adr/0006-single-value-ownership.md:21`

### VALUE-005 노출 표면은 전략과 무관하게 같다 — 경로 조회도 같다
- 결정:
  > **4. 노출 표면은 전략과 무관하게 같다.** `value`, `setValue`, 구독, 이벤트는 자식 노드의 유무에 따라 달라지지 않는다. 경로 조회도 같다.
- 보충:
  > 소유자: "브랜치 노드에서 브랜치 전략이냐 터미널 전략이냐는 내부 동작은 다르지만 노출 표면(사용자 입장)은 같아야 해. 브랜치 노드가 항상 복사값만을 가지는 건 아니야. 경우에 따라서는 브랜치 노드인 객체나 배열이 터미널처럼 직접 값을 쓰기도 하니까." (`adr/0006-single-value-ownership.md:17`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:46#1-3`(정본), `adr/0006-single-value-ownership.md:17`, `reviews/round-1.md:176`
- 닫은 사람: 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가)
- 라운드: 1
- 까닭: `adr/0006-single-value-ownership.md:17`

### VALUE-006 노드는 형상에 있거나 없다 — 형상에 없는 노드의 원본과 나감
- 결정:
  > **5. 노드는 형상에 있거나 없다.**
  > - 노드가 **형상에 있다**는 것은 그 노드를 선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아니라는 뜻이다. 노드 게이트와 조각 게이트는 한 장치의 두 범위다(ADR 0003).
  > - 형상에 없는 노드의 원본은 기본으로 남는다. 방출에서 빠지고, `getInactiveValues(path)`로 읽는다. 작성자나 호출자(Form 속성)가 나감 정책이 참으로 정해진 노드는 나갈 때 한 번 비운다. 나감은 직전 커밋의 형상에 있었고 이번 최종 형상에 없는 것이며, 하위 트리를 포함하고 공유 노드는 제외한다. 로드에는 나감이 없다(원장 §3, 13라운드 답 2).
- 보충:
  > "작성자나 호출자(Form 속성)가 나감 정책(`unsetOnInactive`, 소유자 13라운드 확정)이 참으로 정해진 노드가 나갈 때 한 번 원본을 비운다." (`02-target-overview.md:150`)
  > "형상에 없는 노드의 규칙(`controls.derived` 등)은 평가하지 않는다." (`08-design-a-to-z.md:167`)
  > "나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, 원장 §3)." (`02-target-overview.md:150`)
  > 소유자(13라운드 답 2): "onChange 로 넘어가는 값(방출 표현값)에서 지워지는게 기본값이면 된다." (`reviews/round-13-owner-answers.md:8`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:48-51`(정본), `02-target-overview.md:150`, `03-mental-model.md:72`, `08-design-a-to-z.md:167`, `adr/0002-guard-fragment-model.md:68`, `adr/0003-group-namespace.md:82`
- 닫은 사람: 원리(`03-mental-model.md:72` P4), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2, 보충의 하위 트리 문장), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리)
- 라운드: 17
- 까닭: `adr/0006-single-value-ownership.md:54`
- 충돌:
  > `adr/0006-single-value-ownership.md:51`의 "방출에서 빠지고, `getInactiveValues(path)`로 읽는다."는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### VALUE-007 노드가 생긴다는 것 — 채움은 이 사건에만
- 결정:
  > - 노드가 **생긴다**는 것은 그 노드가 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있다는 뜻이다. 채움(`controls.default` > `default`)은 이 사건에만 일어난다(ADR 0007, ADR 0013). 전체 교체(로드)는 트리를 새로 만든 것으로 보아 형상에 있는 모든 노드를 생긴 노드로 친다(원장 §3의 "로드는 새 수명"). 본체나 다른 켜진 조각이 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않는다. `controls.visible`의 전환은 생성이 아니다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:52`(정본), `07-conclusions.md:67`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 원리(`03-mental-model.md:90` 로드는 새 수명)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:56`

### VALUE-008 형상에서 빠지는 것은 쓰기가 아니다 — null을 포함한 전체 교체는 V에 없는 원본을 지운다
- 결정:
  > **6. 형상에서 빠지는 것은 쓰기가 아니다. `null`을 포함한 전체 교체는 V에 없는 원본을 지운다.** 조각이 꺼지거나 노드 게이트가 거짓이 되는 것은 **쓰기가 아니라 방출에서의 제외**이며(P4. 나감의 비움은 형상 변화가 아니라 작성자가 켠 정책의 자동 쓰기다), `omitEmpty`·`omitTrailing`도 원본을 건드리지 않는 투영 규칙이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:54`(정본), `02-target-overview.md:150`, `03-mental-model.md:92`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:22` 축4), 원리(`03-mental-model.md:92` P4)
- 라운드: 9
- 까닭: `03-mental-model.md:92`

### VALUE-009 불변식은 emit에만 있다
- 결정:
  > **7. 불변식은 `emit`에만 있다**(E9): 부모의 `emit` = 활성 자식 `emit`의 투영. `raw`에는 그런 불변식이 없다 — 형상에 없는 노드와 비객체 호스트 아래 자식의 원본은 부모의 `emit`에 나타나지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:56#1`(정본)
- 닫은 사람: 원리(`adr/0006-single-value-ownership.md:3` emit 불변식은 원리에서 도출, `03-mental-model.md:16` P4)
- 라운드: 5
- 까닭: `adr/0006-single-value-ownership.md:3`

### VALUE-010 extras의 방출 순서는 받은 순서다
- 결정:
  > `extras`는 받은 순서대로 방출된다(P4, G8).
- 보충:
  > "순서는 받은 순서이며 ECMAScript own-key 순서를 따른다" (`adr/0006-single-value-ownership.md:32`)
  > "받은 순서. 전체 교체는 V의 키 순서를 따르고, `Merge`는 있는 키를 제자리에 두고 새 키를 뒤에 붙인다." (`06-conclusions.md:204`)
  > "정수 모양 키(`"2"`, `"10"`)는 ECMAScript가 어떤 순서 규칙에서든 앞에 오름차순으로 놓는다." (`06-conclusions.md:206`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:56#2`(정본), `adr/0006-single-value-ownership.md:32`, `06-conclusions.md:201-207`, `07-conclusions.md:99`, `03-mental-model.md:167`, `02-target-overview.md:142`
- 닫은 사람: 편집자 결정(8라운드 D-32, `06-conclusions.md:201-207`), 편집자 결정(9라운드 그대로, `07-conclusions.md:99`)
- 라운드: 9
- 까닭: `06-conclusions.md:205`

### VALUE-011 값 읽기는 셋이다 — value, outputValue, getInactiveValues
- 결정:
  > **8. 값 읽기는 셋이다**(S9, `07-conclusions.md` §6.2 N3).
  > | 칸 | 공개 이름 | 뜻 |
  > | -- | --------- | -- |
  > | `local` | `node.value` | 합성 값. 투영 전 |
  > | `emit` | `node.outputValue` | 방출 값. 오늘의 `normalizedValue`의 이름 변경. `FormHandle.getValue()`는 루트의 `outputValue`와 같다 |
  > | 형상에 없는 노드의 `raw` | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 열거한다 |
  > 원본 칸 `raw`에는 공개 이름이 없다. `enhancedValue`는 새 모델에 자리가 없어 사라진다. 노드에 `getValue()` 메서드는 따로 두지 않는다(`node.value`와 뜻이 다르면 이름만 보고 속는다). "노드의 메모는 루트 스냅숏의 해당 부분과 같은 참조"는 `omitEmpty`·`omitTrailing`이 투영을 바꾸는 노드에서 거짓이므로, 구조 공유는 `emit` 사이에서만 말한다.
- 보충: 없음
- 상태: 분할됨(→ VALUE-027, VALUE-028)
- 출처: `adr/0006-single-value-ownership.md:58-66`(정본), `adr/0006-single-value-ownership.md:3,9`, `06-conclusions.md:186-190`, `07-conclusions.md:97,347`, `08-design-a-to-z.md:412`
- 닫은 사람: 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`)
- 라운드: 9
- 까닭: `06-conclusions.md:189`
- 충돌:
  > `adr/0006-single-value-ownership.md:64`의 "| 형상에 없는 노드의 `raw` | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 열거한다 |"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### VALUE-012 emit의 참조 규칙
- 결정:
  > **9. `emit`의 참조**는 (자식 `emit` 참조 ∪ `extras` ∪ 호스트 `raw` ∪ 활성 키 집합) 가운데 하나라도 바뀌면 새로 만들고, 아니면 이전 참조를 그대로 둔다(F9). "같은 값을 두 번 읽으면 같은 참조"가 이것으로 성립한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:68`(정본)
- 닫은 사람: 편집자 결정(4차 본문, 3·4·5라운드 반영 F9, `adr/0006-single-value-ownership.md:10`)
- 라운드: 5
- 까닭: `adr/0006-single-value-ownership.md:68`

### VALUE-013 읽기는 계산하지 않는다 — 메모는 커밋 단계에서만
- 결정:
  > **10. 읽기는 계산하지 않는다.** 메모를 쓰는 곳은 작업 루프의 커밋 단계뿐이고(ADR 0007), 무효화 수단은 조상 방향의 재계산 목록 등록 하나다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:70`(정본), `open-questions.md:23`, `reviews/round-1.md:176`
- 닫은 사람: 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문, 3·4·5라운드 반영, `adr/0006-single-value-ownership.md:10`)
- 라운드: 5
- 까닭: `reviews/round-1.md:176`
- 충돌:
  > `open-questions.md:23`의 "편집 중 상태는 노드의 원본에 있고, 방출 값은 작업 루프의 complete 단계에서 메모된다."은 방출 값의 메모 자리를 작업 루프의 complete 단계로 적는다. 정본과 다르다. 정본이 이긴다(`adr/0006-single-value-ownership.md:70`, "메모를 쓰는 곳은 작업 루프의 커밋 단계뿐").

### VALUE-014 읽기가 쓰기보다 잦은 구조에서의 비용 표
- 결정:
  > | 동작 | 비용 |
  > | ---- | ---- |
  > | `node.value` 등 모든 읽기 | 필드 접근. 계산 없음 |
  > | 쓰기 1회 | 경로의 각 레벨에서 얕은 복사 한 번. 실측: 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs (`reviews/round-1.md` §2). 형제 서브트리는 참조를 재사용한다 |
  > | 재계산 목록에 없는 서브트리 | 통째로 건너뛴다 |
  > | 쓰기 N회의 배치 | 표시 N번, 작업 루프 1번 |
  > | 가드와 `controls`의 식 | **변경 키 역색인은 쓰지 않는다**(E13) — 출발점 고정에서 무효다. 유효한 최적화는 (a) 무조건 루트 키만 읽는 가드의 건너뛰기, (b) 조각 끄기의 키 제거를 `delete` 없이 하는 것, (c) 조각이 선언한 키만 패치하는 합성(F13) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:80-86`(정본), `reviews/round-1.md:176`
- 닫은 사람: 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문 E13, `adr/0006-single-value-ownership.md:10`, 역색인 행)
- 라운드: 5
- 까닭: `adr/0006-single-value-ownership.md:83`

### VALUE-015 null 계약 D-1 — setValue(null)은 키가 없는 전체 교체
- 결정:
  > `setValue(null)`은 키가 없는 전체 교체이므로 자식 원본이 없음이 된다. 원본 칸 하나로 족하며 셋째 칸도 특수 장치도 없다 — 2라운드 S7(#338 S4와 "null 아래도 원본 유지"의 충돌)은 이렇게 닫힌다. 3라운드 E9의 "비객체 V는 자식 raw를 건드리지 않는다"와 E18("비객체 호스트의 자식은 비활성")은 **삭제**한다: 비객체 호스트의 자식은 **존재하고 렌더되며** 빈 상태를 보인다. 로드는 새 수명이므로 그 자식들은 생긴 노드로서 채움을 받고, `setValue(null)` 뒤 다시 객체가 로드되어도 채움을 받는다(원장 §3). 실수로 누른 null의 되돌리기는 입력 컴포넌트의 몫이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:76`(정본), `adr/0006-single-value-ownership.md:74`, `reviews/round-5-derivations.md:40`, `adr/0007-settle-cycle.md:115`, `adr/0013-core-does-not-rewrite-values.md:53`(WRITE-014의 정본), `03-mental-model.md:90`
- 닫은 사람: 원리(`reviews/round-5-derivations.md:40` D-1)
- 라운드: 5
- 까닭: `reviews/round-5-derivations.md:40`

### VALUE-016 결과 — 레벨마다의 사본과 잠금이 필요 없어진다
- 결정:
  > - 레벨마다의 사본, `__draft__`/`__composed__`의 지연 합성, 상향 콜백 그래프, 역류 방지 잠금이 필요 없어진다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:90`(정본)
- 닫은 사람: 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가)
- 라운드: 1
- 까닭: `adr/0006-single-value-ownership.md:21`

### VALUE-017 형상에 없는 노드의 원본은 설계상 잠복이다
- 결정:
  > 방출되지 않으므로 검증기가 기각하지 않고 잔여 목록에도 없다 — 설계상 잠복이다(P4).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:98#2`(정본), `03-mental-model.md:59`
- 닫은 사람: 원리(`03-mental-model.md:59` P1·P4)
- 라운드: 14
- 까닭: `03-mental-model.md:59`

### VALUE-018 잠복 원본의 실제 파기 시점이 18라운드 안건으로 이관됨
- 결정:
  > core는 읽기 전용 `getInactiveValues(path)`로 열거만 하고(F26), 실제 파기 시점(reset·제출 후)은 `open-questions.md` Q1.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:112`)
- 출처: `adr/0006-single-value-ownership.md:98#4`(정본), `open-questions.md:11`(FRAGMENT-043의 정본, Q1 전체), `reviews/round-18-agenda.md:112`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:112`
- 충돌:
  > `adr/0006-single-value-ownership.md:98`의 "core는 읽기 전용 `getInactiveValues(path)`로 열거만 하고(F26)"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### VALUE-019 배열 아이템의 생김과 채움이 18라운드 안건으로 이관됨
- 결정:
  > 그 밖의 배열 아이템의 생김과 채움(`contains`·`prefixItems`, identity)은 `03-mental-model.md` §6의 설계 항목이다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:109`)
- 출처: `adr/0006-single-value-ownership.md:97#5`(정본), `03-mental-model.md:206`, `08-design-a-to-z.md:495`, `reviews/round-18-agenda.md:109`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:109`

### VALUE-020 Q2 — null 계약의 장치를 새 구조에서 표현하는 방법이 18라운드 안건으로 이관됨
- 결정:
  > "자동 쓰기는 null 조상을 객체로 만들지 않는다"는 요구는 남는다. 출처 비트(`Automatic`)를 쓰기마다 실어 나르는 대신 작업 루프의 단계로 구분할 수 있는가 — 표시는 의도된 쓰기, begin의 기본값 주입과 complete의 `&derived`는 자동 쓰기. **검토 결과 이 가설은 자동 쓰기에 대해서만 성립한다**(`reviews/round-1.md` R12): 같은 값을 다시 쓰는 의도된 쓰기(S6)는 값만 봐서는 드러나지 않으므로 쓰기 의도를 따로 기록해야 한다. `injectTo`는 원인이 된 쓰기의 출처를 물려받아야 한다는 S2 규칙(`core/nodes/ObjectNode/DETAIL.md`)이 이 구분으로 표현되는지 확인이 필요하다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:112`)
- 출처: `open-questions.md:19`(정본), `reviews/round-18-agenda.md:112`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:112`

### VALUE-021 "값이 바뀌었다"는 값 비교다 — 에지의 값 동등 판정이 18라운드 안건으로 이관됨
- 결정:
  > `injectTo`의 에지와 `onChange`의 "같은 값이면 통지 없음"은 한 장치이고(G4), 참조 비교가 아니라 값 비교다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:107`)
- 출처: `06-conclusions.md:253#1`(정본), `07-conclusions.md:100,396`, `reviews/round-18-agenda.md:107`, `03-mental-model.md:211`(SETTLE-039의 정본), `08-design-a-to-z.md:492`
- 닫은 사람: 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`)
- 라운드: 17
- 까닭: `06-conclusions.md:253`

### VALUE-022 상호작용 상태 dirty·touched는 현행 유지
- 결정:
  > - **상호작용 상태** `dirty`·`touched`는 현행 유지다(C6).
- 보충:
  > 소유자(C6): "input을 건드렸을 때(touched), 값이 바뀌었을 때(dirty)를 기준으로 조합 조건을 갖고 있고 지금 구현도 그렇다. 이건 바뀌지 않길 바란다." (`00-goals.md:109`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:168`(정본), `00-goals.md:109`
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:109` C6)
- 라운드: 2
- 까닭: `00-goals.md:109`

### VALUE-023 버린 대안 — 루트의 JSON 값 트리, 셀 테이블, 노드별 사본 동기화
- 결정:
  > - **1차안 — 루트가 소유하는 JSON 값 트리, 노드는 뷰.** R12로 기각.
  > - **루트가 소유하는 셀 테이블 + 필요할 때 만드는 손잡이 노드.** 소유자가 별도의 데이터 모델을 거부했다. 큰 배열에서 노드 생성을 늦추는 최적화는 이 결정 안에서도 가능하다 — 자식 노드가 실체화되기 전까지 array 노드가 터미널처럼 값을 직접 든다. 필요 여부는 벤치마크로 정한다(ADR 0009, 0011).
  > - **노드별 소유를 유지하고 사본 동기화를 고친다.** 복잡함의 원인이 남는다.
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0006-single-value-ownership.md:103-105`(정본), `adr/0006-single-value-ownership.md:12`, `reviews/round-1.md:176,181`
- 닫은 사람: 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가), 편집자 결정(1차안 대체, 적대적 검토 R12, `adr/0006-single-value-ownership.md:12`)
- 라운드: 1
- 까닭: `adr/0006-single-value-ownership.md:12`

### VALUE-024 대체됨: node.value는 원본, normalizedValue는 방출 값이라는 구분의 유지
- 결정:
  > 남은 세부: `node.value`가 돌려주는 것이 원본인지 방출 값인지. 현재는 `value`(원본)와 `normalizedValue`(방출)로 나뉘어 있고 그 구분을 유지하는 것이 자연스럽다.
- 보충:
  > 열린 부분(결정 전부 — 원본과 방출 값의 이름 구분): "값 읽기 이름(`value`는 원본, 방출 값의 이름 등, 07 §6.2 N3)에 소유자 동의 원문이 없다." (`reviews/round-18-agenda.md:166`)
  > 소유자(12-8 답): "이대로 가도 되는데요, value 랑 outputValue 가 다르면, 투영할때만 바뀌는 경우(빠지는 값?)은 어떤게 있죠?" (`reviews/round-18-owner-answers.md:18`)
- 상태: 대체됨(→ VALUE-027)
- 출처: `open-questions.md:25`(정본), `adr/0006-single-value-ownership.md:58-66`, `reviews/round-18-owner-answers.md:18`
- 닫은 사람: 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:166`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8; VALUE-027의 이름으로 대체)
- 라운드: 18
- 까닭: `adr/0006-single-value-ownership.md:62-63`

### VALUE-025 결과 — 기본 정책에서 원본은 남고, 나감 정책이 참이면 다시 켜질 때 채움을 받는다
- 결정:
  > - 기본 정책에서 분기 필드의 복원, `controls.active` 재활성화, null 계약이 "원본은 남고 방출에서만 빠진다" 하나로 설명된다. 나가는 노드를 reset하고 들어오는 노드에 값을 복원하며 타입 호환을 검사하는 절차가 없어진다(R8, T-23).
  > - 기본 정책에서는 입력 도중 조각이나 노드 게이트가 잠깐 꺼져도 데이터가 지워지지 않고, 다시 켜지면 마지막 입력이 돌아온다(그 노드에 `controls.derived`·`controls.unsetValue`가 없을 때. 있으면 재탄생 에지로 발화한다). 나감 정책이 참으로 정해진 노드는 나갈 때 비워지므로, 다시 켜지면 생긴 노드로서 채움(`controls.default` > `default`)을 받는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:91-92`(정본)
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:8`

### VALUE-026 대체됨: 상태 칸은 raw·selection·extras 셋이라는 06 용어표의 정의
- 결정:
  > | 용어 | 뜻 |
  > | ---- | -- |
  > | `selection` | 판별식이 없는 union 호스트에서 사용자가 수동으로 고른 분기. 상태 칸의 하나다 |
  > | 상태 칸 | 노드가 실제로 소유하는 상태. 원본(`raw`), `selection`, `extras` 셋뿐이다. 나머지는 계산 결과다 |
- 보충: 없음
- 상태: 대체됨(→ VALUE-002)
- 출처: `06-conclusions.md:51-52`(정본), `06-conclusions.md:19-20`, `07-conclusions.md:29,37`, `adr/0002-guard-fragment-model.md:53`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:29`)
- 라운드: 10
- 까닭: `07-conclusions.md:29`

### VALUE-027 값 읽기는 셋이다 — value, outputValue, getInactiveValues의 이름

- 결정:
  > **8. 값 읽기는 셋이다**(S9, `07-conclusions.md` §6.2 N3).
  > | 칸 | 공개 이름 | 뜻 |
  > | -- | --------- | -- |
  > | `local` | `node.value` | 합성 값. 투영 전 |
  > | `emit` | `node.outputValue` | 방출 값. 오늘의 `normalizedValue`의 이름 변경. `FormHandle.getValue()`는 루트의 `outputValue`와 같다 |
  > | 형상에 없는 노드의 `raw` | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 열거한다 |
  > 원본 칸 `raw`에는 공개 이름이 없다. `enhancedValue`는 새 모델에 자리가 없어 사라진다. 노드에 `getValue()` 메서드는 따로 두지 않는다(`node.value`와 뜻이 다르면 이름만 보고 속는다).
- 보충:
  > 열린 부분(값 읽기의 공개 이름과 이름 표면. 표는 행을 나누지 않고 함께 연다): "값 읽기 이름(`value`는 원본, 방출 값의 이름 등, 07 §6.2 N3)에 소유자 동의 원문이 없다." (`reviews/round-18-agenda.md:166`)
  > 소유자(12-8 답): "이대로 가도 되는데요, value 랑 outputValue 가 다르면, 투영할때만 바뀌는 경우(빠지는 값?)은 어떤게 있죠? 이거 물어보는 이유가, 어떤 object node 에 조건부 브랜치가 있을때, 이게 브랜치가 하나 꺼진 경우, 그 값은 제거되기로 했잖아요? 근데 node 본인은 꺼진 브랜치의 값을 볼 수 있는건가요? 아니, value 로 전달되는거면 FormTypeInput 에서는 value가 활성브랜치 여부와 무관하게 보이는건가?" (`reviews/round-18-owner-answers.md:18`)
  > 반영 칸(12-8, 물음의 답): "`value`(local)는 **활성** 자식의 방출 값만 합성한 것이라 꺼진 분기의 값은 `value`에도 없다. 꺼진 분기의 노드는 형상에 없어 그 입력 구성 요소는 그려지지 않으며, 그 원본은 잠복 원본으로만 남아 `getInactiveValues(path)`로 열거한다. `value`와 `outputValue`의 차이는 투영뿐이다. 투영은 `omitEmpty`·`omitTrailing`처럼 원본을 건드리지 않고 방출에서 빈 값·꼬리 값을 빼는 규칙이다(ADR 0006 §6·§7). 꺼진 분기와 게이트가 거짓인 노드는 투영이 아니라 형상에서 빠지는 것이라 `value`에도 없다. 그래서 입력 구성 요소가 받는 `value`는 활성 분기와 무관하게 보이지 않는다." (`reviews/round-18-owner-answers.md:18`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:58-66`(정본, 58–65행과 66행 #1–3. VALUE-011에서 분할), `adr/0006-single-value-ownership.md:66#1-3`, `adr/0006-single-value-ownership.md:3,9`, `06-conclusions.md:186-190`, `07-conclusions.md:97,347`, `08-design-a-to-z.md:412`, `reviews/round-18-owner-answers.md:18`
- 닫은 사람: 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:18`, `06-conclusions.md:189`
- 충돌:
  > `adr/0006-single-value-ownership.md:64`의 "| 형상에 없는 노드의 `raw` | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 열거한다 |"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`). 이 항목의 나머지 행(`value`·`outputValue`·`FormHandle.getValue()`)은 현행이다(SURFACE-050).

### VALUE-028 구조 공유는 `emit` 사이에서만 말한다

- 결정:
  > "노드의 메모는 루트 스냅숏의 해당 부분과 같은 참조"는 `omitEmpty`·`omitTrailing`이 투영을 바꾸는 노드에서 거짓이므로, 구조 공유는 `emit` 사이에서만 말한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:66#4`(정본. VALUE-011에서 분할)
- 닫은 사람: 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`)
- 라운드: 9
- 까닭: `06-conclusions.md:189`

### VALUE-029 잠복 원본 열거 — 루트 노드의 함수, 노드마다 getter `inactiveValues`

- 결정:
  > 잠복 원본 열거는 **루트 노드의 함수**다(루트가 형상에 없는 노드의 원본을 들고 있으므로 저장 자리와 같다). 모든 노드는 getter `node.inactiveValues`를 두고, 자기 경로로 루트의 함수를 불러 그 아래의 잠복 원본을 돌려준다. `FormHandle`에는 더하지 않는다.
- 보충:
  > 소유자(12-8 셋째 답): "폼 핸들이 오히려 쓸대가 없을거같은데. root node 에 핸들로 추가하고, 개별 노드는 rootNode 의 기능을 경유해서 node.inactiveValues 를 구현하면 어떨까 싶다." (`reviews/round-18-owner-answers.md:22`)
  > 반영 칸(12-8 셋째, 반환 모양): "반환 모양(WRITE-020, 안건 11-14)은 그대로 열림이다." (`reviews/round-18-owner-answers.md:22`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:22`(정본, 12-8 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다), `06-conclusions.md:388`, `02-target-overview.md:309`, `adr/0006-single-value-ownership.md:64`, `adr/0013-core-does-not-rewrite-values.md:108` (이름의 관례: SURFACE-050; 반환 모양은 열림 WRITE-020)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:22` 12-8 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:22`
- 충돌:
  > `06-conclusions.md:388`의 "`getInactiveValues(path)`가 꺼진 조각의 원본을 열거한다."는 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
  > `02-target-overview.md:309`의 "| | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 읽기 전용으로 열거한다 | ADR 0006 |"는 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
  > `adr/0006-single-value-ownership.md:64`의 "| 형상에 없는 노드의 `raw` | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 열거한다 |"는 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
  > `adr/0013-core-does-not-rewrite-values.md:108`의 "잠복 값 열거 API `getInactiveValues(path)`(F26, ADR 0006)의 반환 모양."은 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
