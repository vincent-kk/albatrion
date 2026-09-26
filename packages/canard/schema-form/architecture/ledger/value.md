# 단일 원장 — 상태와 값의 소유

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 영역은 노드가 드는 칸, 상태와 계산 결과와 작업의 기록의 구분, 값의 소유, 형상에 있음과 없음, 값 읽기를 다룬다. 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) `adr/0006-single-value-ownership.md`(5차 본문, 일부 수락)가 이 영역의 정본이다. (3) `03-mental-model.md` §2(원장)는 `08-design-a-to-z.md` §4와 다르면 원장이 이긴다(08이 스스로 그렇게 적는다). (4) 뒤 라운드가 앞 라운드를 이긴다. `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고, 뒤 문서가 바꿨으면 "대체됨"으로 남는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| VALUE-001 | 별도의 데이터 모델을 두지 않는다 — 노드 트리가 곧 상태 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-002 | 노드가 드는 칸과 그 종류 — 상태는 raw와 extras 둘뿐 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3, 상태가 둘뿐인 것은 그 귀결 `adr/0006-single-value-ownership.md:3`), 원리(`03-mental-model.md:55-72` §2, 칸 목록 `adr/0006-single-value-ownership.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40·18C-59) |
| VALUE-003 | diagnostics 칸 — 작업의 기록, 다음 로드까지 지속, 루트에서 관측 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) |
| VALUE-004 | 저장되는 값은 자식 노드가 없는 노드에만 있다 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-005 | 노출 표면은 전략과 무관하게 같다 — 경로 조회도 같다 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-006 | 노드는 형상에 있거나 없다 — 형상에 없는 노드의 원본과 나감 | 현행 | 원리(`03-mental-model.md:72` P4), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2, 보충의 하위 트리 문장), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) |
| VALUE-007 | 노드가 생긴다는 것 — 채움은 이 사건에만 | 분할됨(→ VALUE-035, WRITE-090) | 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 원리(`03-mental-model.md:90` 로드는 새 수명), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| VALUE-008 | 형상에서 빠지는 것은 쓰기가 아니다 — null을 포함한 전체 교체는 V에 없는 원본을 지운다 | 현행 | 소유자 답(`reviews/round-9-spec.md:22` 축4), 원리(`03-mental-model.md:92` P4) |
| VALUE-009 | 불변식은 emit에만 있다 | 현행 | 원리(`adr/0006-single-value-ownership.md:3` emit 불변식은 원리에서 도출, `03-mental-model.md:16` P4) |
| VALUE-010 | extras의 방출 순서는 받은 순서다 | 현행 | 편집자 결정(8라운드 D-32, `06-conclusions.md:201-207`), 편집자 결정(9라운드 그대로, `07-conclusions.md:99`) |
| VALUE-011 | 값 읽기는 셋이다 — value, outputValue, getInactiveValues | 분할됨(→ VALUE-027, VALUE-028) | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`) |
| VALUE-012 | emit의 참조 규칙 | 현행 | 편집자 결정(4차 본문, 3·4·5라운드 반영 F9, `adr/0006-single-value-ownership.md:10`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| VALUE-013 | 읽기는 계산하지 않는다 — 메모는 커밋 단계에서만 | 현행 | 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문, 3·4·5라운드 반영, `adr/0006-single-value-ownership.md:10`) |
| VALUE-014 | 읽기가 쓰기보다 잦은 구조에서의 비용 표 | 현행 | 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문 E13, `adr/0006-single-value-ownership.md:10`, 역색인 행) |
| VALUE-015 | null 계약 D-1 — setValue(null)은 키가 없는 전체 교체 | 분할됨(→ VALUE-036, WRITE-090) | 원리(`reviews/round-5-derivations.md:40` D-1), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| VALUE-016 | 결과 — 레벨마다의 사본과 잠금이 필요 없어진다 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-017 | 형상에 없는 노드의 원본은 설계상 잠복이다 | 현행 | 원리(`03-mental-model.md:59` P1·P4) |
| VALUE-018 | 잠복 원본의 실제 파기 시점이 18라운드 안건으로 이관됨 | 대체됨(→ VALUE-031) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64) |
| VALUE-019 | 배열 아이템의 생김과 채움이 18라운드 안건으로 이관됨 | 대체됨(→ NODE-051, NODE-052, FRAGMENT-051) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| VALUE-020 | Q2 — null 계약의 장치를 새 구조에서 표현하는 방법이 18라운드 안건으로 이관됨 | 대체됨(→ VALUE-032) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65) |
| VALUE-021 | "값이 바뀌었다"는 값 비교다 — 에지의 값 동등 판정이 18라운드 안건으로 이관됨 | 현행 | 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| VALUE-022 | 상호작용 상태 dirty·touched는 현행 유지 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:109` C6) |
| VALUE-023 | 버린 대안 — 루트의 JSON 값 트리, 셀 테이블, 노드별 사본 동기화 | 현행(부정 결정) | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가), 편집자 결정(1차안 대체, 적대적 검토 R12, `adr/0006-single-value-ownership.md:12`) |
| VALUE-024 | 대체됨: node.value는 원본, normalizedValue는 방출 값이라는 구분의 유지 | 대체됨(→ VALUE-027) | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:166`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8; VALUE-027의 이름으로 대체) |
| VALUE-025 | 결과 — 기본 정책에서 원본은 남고, 나감 정책이 참이면 다시 켜질 때 채움을 받는다 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| VALUE-026 | 대체됨: 상태 칸은 raw·selection·extras 셋이라는 06 용어표의 정의 | 대체됨(→ VALUE-002) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:29`) |
| VALUE-027 | 값 읽기는 셋이다 — value, outputValue, getInactiveValues의 이름 | 현행 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8) |
| VALUE-028 | 구조 공유는 `emit` 사이에서만 말한다 | 현행 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`) |
| VALUE-029 | 잠복 원본 열거 — 루트 노드의 함수, 노드마다 getter `inactiveValues` | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:22` 12-8 셋째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81; 반환 모양) |
| VALUE-030 | 정합 상태(경고등)는 계산 칸 — 켜지는 값, 쓰기마다 `interpret`가 정함, 루트의 경로 집합과 `valueTypeMismatches`(가칭) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| VALUE-031 | 잠복 원본의 수명(지워지는 길 둘, 제출 후 파기 없음), 로드 왕복의 차이 다섯, 비활성 경로에 닿는 쓰기 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96) |
| VALUE-032 | null 계약은 쓰기 종류로 표현한다 — `injectTo`는 언제나 자동 쓰기라 null 조상을 객체로 만들지 않음, 소유자 통보 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) |
| VALUE-033 | nullable이 아닌 노드의 `null`은 바꾸지 않고 방출 — 경고등·경고, 검증기가 있으면 형 에러로 제출 막힘, 해법은 스키마에 nullable, 이주 항목과 PR-8 문서에 적음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40) |
| VALUE-034 | 빈 호스트와 루트의 방출 — 빈 `local`은 `{}`·`[]`, `omitEmpty`는 빈 `local`을 방출하지 않음, 루트는 루트 종류의 빈 그릇, 배열 아이템의 빈자리는 `{}`·`[]`·`null` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-88) |
| VALUE-035 | 노드가 생긴다는 것 — 채움은 이 사건에만, 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않음, `controls.visible` 전환은 생성이 아님 | 현행 | 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 원리(`03-mental-model.md:90` 로드는 새 수명) |
| VALUE-036 | null 계약 D-1 — setValue(null)은 키가 없는 전체 교체, 셋째 칸도 특수 장치도 없음, 비객체 호스트의 자식은 존재하고 렌더됨 | 현행 | 원리(`reviews/round-5-derivations.md:40` D-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) |
| VALUE-037 | `union`의 경고등과 방출·채움 — `valueTypeMismatch`는 원본과 현재 spec의 함수, 켜질 때마다 한 번과 다시 보내는 때, (가칭) `UpdateJsonSchema` 배달, `VALUE_TYPE_MISMATCH` 기록의 칸, 방출은 원본 참조, 통째 값의 JSON 부정합 경고 (가칭) `NON_JSON_WHOLE_VALUE`, 채움은 원본이 `undefined`일 때만 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |

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
  > 편집자 결정(18C-40): "【추론】 (1) 경고등은 VALUE-002의 분류로 '계산' 칸이다." (`reviews/round-18-closing.md:1084`)
  > 편집자 결정(18C-59): "【추론】 배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다." (`reviews/round-18-closing.md:1668`)
  > 편집자 결정(18C-59): "【추론】 자리 순서로 들고, 선언된 아이템 뒤에 방출한다(VALUE-002 보충)." (`reviews/round-18-closing.md:1669`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:27-42`(정본), `adr/0006-single-value-ownership.md:3,9`, `02-target-overview.md:142-148`, `03-mental-model.md:57-70`, `08-design-a-to-z.md:151-166`, `reviews/round-18-closing.md:1084,1668-1669`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3, 상태가 둘뿐인 것은 그 귀결 `adr/0006-single-value-ownership.md:3`), 원리(`03-mental-model.md:55-72` §2, 칸 목록 `adr/0006-single-value-ownership.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40·18C-59)
- 라운드: 18
- 까닭: `adr/0006-single-value-ownership.md:42`, `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:1686-1690`
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
  > 편집자 결정(18C-98): "【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다." (`reviews/round-18-closing.md:2797`)
  > 편집자 결정(18C-98): "【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다." (`reviews/round-18-closing.md:2798`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:37`(정본), `02-target-overview.md:148`, `03-mental-model.md:67`, `08-design-a-to-z.md:163`, `07-conclusions.md:348`(모양과 제출 거부의 정본은 `adr/0014-error-policy.md` §5), `reviews/round-18-closing.md:2797-2798`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98)
- 라운드: 18
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
- 상태: 분할됨(→ VALUE-035, WRITE-090)
- 출처: `adr/0006-single-value-ownership.md:52`(정본), `07-conclusions.md:67`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 원리(`03-mental-model.md:90` 로드는 새 수명), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
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
- 보충:
  > 편집자 결정(18C-50): "【추론】 (나) 커밋 단계에서, 이번 정착에 쓰인 잎의 `raw`·`extras`가 직전 커밋의 것과 (가)로 같으면 직전 참조를 둔다." (`reviews/round-18-closing.md:1383`)
  > 편집자 결정(18C-50): "【추론】 쓰기 경계에서 지금 값과 같으면 쓰지 않는 것은 오늘과 같다." (`reviews/round-18-closing.md:1384`)
  > 편집자 결정(18C-50): "【추론】 호스트의 `emit`은 VALUE-012대로 만든다." (`reviews/round-18-closing.md:1385`)
  > 편집자 결정(18C-50): "【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만)." (`reviews/round-18-closing.md:1386`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:68`(정본), `reviews/round-18-closing.md:1383-1386`
- 닫은 사람: 편집자 결정(4차 본문, 3·4·5라운드 반영 F9, `adr/0006-single-value-ownership.md:10`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `adr/0006-single-value-ownership.md:68`, `reviews/round-18-closing.md:1405-1411`

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
- 상태: 분할됨(→ VALUE-036, WRITE-090)
- 출처: `adr/0006-single-value-ownership.md:76`(정본), `adr/0006-single-value-ownership.md:74`, `reviews/round-5-derivations.md:40`, `adr/0007-settle-cycle.md:115`, `adr/0013-core-does-not-rewrite-values.md:53`(WRITE-014의 정본), `03-mental-model.md:90`
- 닫은 사람: 원리(`reviews/round-5-derivations.md:40` D-1), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
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
- 상태: 대체됨(→ VALUE-031)
- 출처: `adr/0006-single-value-ownership.md:98#4`(정본), `open-questions.md:11`(FRAGMENT-043의 정본, Q1 전체), `reviews/round-18-agenda.md:112`, `reviews/round-18-closing.md:1793-1820`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:112`, `reviews/round-18-closing.md:1822-1826`
- 충돌:
  > `adr/0006-single-value-ownership.md:98`의 "core는 읽기 전용 `getInactiveValues(path)`로 열거만 하고(F26)"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### VALUE-019 배열 아이템의 생김과 채움이 18라운드 안건으로 이관됨
- 결정:
  > 그 밖의 배열 아이템의 생김과 채움(`contains`·`prefixItems`, identity)은 `03-mental-model.md` §6의 설계 항목이다.
- 보충: 없음
- 상태: 대체됨(→ NODE-051, NODE-052, FRAGMENT-051)
- 출처: `adr/0006-single-value-ownership.md:97#5`(정본), `03-mental-model.md:206`, `08-design-a-to-z.md:495`, `reviews/round-18-agenda.md:109`, `reviews/round-18-closing.md:1638-1684,1692-1698`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:109`, `reviews/round-18-closing.md:1686-1690`

### VALUE-020 Q2 — null 계약의 장치를 새 구조에서 표현하는 방법이 18라운드 안건으로 이관됨
- 결정:
  > "자동 쓰기는 null 조상을 객체로 만들지 않는다"는 요구는 남는다. 출처 비트(`Automatic`)를 쓰기마다 실어 나르는 대신 작업 루프의 단계로 구분할 수 있는가 — 표시는 의도된 쓰기, begin의 기본값 주입과 complete의 `&derived`는 자동 쓰기. **검토 결과 이 가설은 자동 쓰기에 대해서만 성립한다**(`reviews/round-1.md` R12): 같은 값을 다시 쓰는 의도된 쓰기(S6)는 값만 봐서는 드러나지 않으므로 쓰기 의도를 따로 기록해야 한다. `injectTo`는 원인이 된 쓰기의 출처를 물려받아야 한다는 S2 규칙(`core/nodes/ObjectNode/DETAIL.md`)이 이 구분으로 표현되는지 확인이 필요하다.
- 보충: 없음
- 상태: 대체됨(→ VALUE-032)
- 출처: `open-questions.md:19`(정본), `reviews/round-18-agenda.md:112`, `reviews/round-18-closing.md:1832-1848`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:112`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:112`, `reviews/round-18-closing.md:1850-1855`

### VALUE-021 "값이 바뀌었다"는 값 비교다 — 에지의 값 동등 판정이 18라운드 안건으로 이관됨
- 결정:
  > `injectTo`의 에지와 `onChange`의 "같은 값이면 통지 없음"은 한 장치이고(G4), 참조 비교가 아니라 값 비교다.
- 보충:
  > 편집자 결정(18C-50): "【추론】 (가) "값이 바뀌었다"는 하나의 판정(가칭 `sameValue`, 내부)으로 본다." (`reviews/round-18-closing.md:1376`)
- 상태: 현행
- 출처: `06-conclusions.md:253#1`(정본), `07-conclusions.md:100,396`, `reviews/round-18-agenda.md:107`, `03-mental-model.md:211`(SETTLE-039의 정본), `08-design-a-to-z.md:492`, `reviews/round-18-closing.md:1376-1403,1413-1415`
- 닫은 사람: 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `06-conclusions.md:253`, `reviews/round-18-closing.md:1405-1411`

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
  > 편집자 결정(18C-81): "【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다." (`reviews/round-18-closing.md:2171`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:22`(정본, 12-8 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다), `06-conclusions.md:388`, `02-target-overview.md:309`, `adr/0006-single-value-ownership.md:64`, `adr/0013-core-does-not-rewrite-values.md:108` (이름의 관례: SURFACE-050; 반환 모양은 열림 WRITE-020), `reviews/round-18-closing.md:2171`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:22` 12-8 셋째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81; 반환 모양)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:22`
- 충돌:
  > `06-conclusions.md:388`의 "`getInactiveValues(path)`가 꺼진 조각의 원본을 열거한다."는 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
  > `02-target-overview.md:309`의 "| | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 읽기 전용으로 열거한다 | ADR 0006 |"는 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
  > `adr/0006-single-value-ownership.md:64`의 "| 형상에 없는 노드의 `raw` | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 열거한다 |"는 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
  > `adr/0013-core-does-not-rewrite-values.md:108`의 "잠복 값 열거 API `getInactiveValues(path)`(F26, ADR 0006)의 반환 모양."은 잠복 원본 열거를 `getInactiveValues(path)`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`).
  > `reviews/round-18-owner-answers.md:22`의 "반환 모양(WRITE-020, 안건 11-14)은 그대로 열림이다."는 18라운드 결정과 다르다: 반환 모양은 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`이다(WRITE-087). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2171`).

### VALUE-030 정합 상태(경고등)는 계산 칸 — 켜지는 값, 쓰기마다 `interpret`가 정함, 루트의 경로 집합과 `valueTypeMismatches`(가칭)

- 결정:
  > 【추론】 (1) 경고등은 VALUE-002의 분류로 '계산' 칸이다.
  > 【추론】 원본과 노드의 형(`type`, nullable)만의 함수이므로 '상태는 `raw`와 `extras` 둘뿐'(P3)을 지킨다.
  > 【추론】 소유자가 말한 '상태'는 사용자에게 보이는 뜻이다.
  > 【추론】 쓰기마다 `interpret`가 한 번 정한다.
  > 【추론】 켜지는 값은 자기 형이 아니고, 없음도 아니고, nullable 노드의 `null`도 아닌 값이다.
  > 【추론】 수 노드의 `NaN`·`±Infinity`, 정수 노드의 정수 아닌 수, 잘못된 종류를 든 가지 노드도 켜진다.
  > 【추론】 가상 노드는 켜지지 않는다(18C-21에서 거부한다).
  > 【추론】 루트 노드가 켜진 노드의 경로 집합을 든다.
  > 【추론】 쓰기 때 더하고 빼며, 로드마다 다시 만든다.
  > 【추론】 모든 노드는 getter `valueTypeMismatches: readonly string[]`로 자기 경로 아래의 켜진 경로를 돌려준다.
  > 【추론】 루트에서 읽으면 트리 전체다.
  > 【추론】 커밋 번호로 메모해 같은 커밋에서는 같은 참조를 돌려준다.
  > 【추론】 형상에 없는 노드는 넣지 않는다.
  > 【추론】 새 이벤트는 없다(바뀌면 `UpdateValue`가 알린다).
  > 【추론】 `FormHandle`에는 더하지 않는다.
- 보충:
  > 편집자 결정(18C-91): "【추론】 `valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다." (`reviews/round-18-closing.md:2520`)
  > 편집자 결정(18C-91): "【추론】 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다." (`reviews/round-18-closing.md:2521`)
  > 편집자 결정(18C-101): "【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다." (`reviews/round-18-closing.md:2851`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1084-1090,1096-1103`(정본), `reviews/round-18-closing.md:2520-2521,2526`, `reviews/round-18-closing.md:2851`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2556-2564`, `reviews/round-18-closing.md:2853-2855`
- 충돌:
  > `reviews/round-18-closing.md:1102`의 "바뀌면 `UpdateValue`가 알린다"는 18C-91의 결정과 다르다: 값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다(VALUE-037). 18C-91의 결정이 이긴다(`reviews/round-18-closing.md:2526`).
  > `reviews/round-18-closing.md:1085`의 "원본과 노드의 형(`type`, nullable)만의 함수"는 18C-91의 결정과 다르다: 경고등은 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수다(VALUE-037). 18C-91의 결정이 이긴다(`reviews/round-18-closing.md:2520`).
  > `reviews/round-18-closing.md:1087`의 "쓰기마다 `interpret`가 한 번 정한다"는 18C-91의 결정과 다르다: 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-037). 18C-91의 결정이 이긴다(`reviews/round-18-closing.md:2521`).
  > `reviews/round-18-closing.md:1098`의 "【추론】 모든 노드는 getter `valueTypeMismatches: readonly string[]`로 자기 경로 아래의 켜진 경로를 돌려준다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).

### VALUE-031 잠복 원본의 수명(지워지는 길 둘, 제출 후 파기 없음), 로드 왕복의 차이 다섯, 비활성 경로에 닿는 쓰기

- 결정:
  > 【추론】 ㄱ core가 스스로 잠복 원본을 파기하는 시점은 더하지 않는다.
  > 【추론】 잠복 원본이 지워지는 길은 둘이다: 나감 정책 `unsetOnInactive`(작성자나 호출자가 켬), 그리고 모든 로드(`reset`, `setValue(V)`, 마운트).
  > 【추론】 로드에서는 V에 없는 원본이 없음이 되므로, 잠복 원본도 V의 값으로 바뀌거나 지워진다.
  > 【추론】 이 밖에는 ㅁ의 쓰기가 그 경로에 없음을 쓸 때뿐이다.
  > 【추론】 형상에 없는 노드의 규칙은 평가하지 않으므로 `controls.unsetValue`는 잠복 원본을 지우지 못한다.
  > 【추론】 제출 후 파기는 두지 않는다.
  > 【추론】 core는 제출을 모르고, 파기는 폼이 스스로 값을 지우는 일이 되기 때문이다.
  > 【추론】 민감한 값을 남기지 않는 기본 권고는 나감 정책 `unsetOnInactive`를 켜는 것이다.
  > 【추론】 호출자가 한 번에 비우려면 `setValue(form.getValue(), SetValueOption.DisableAutomaticWrites)`를 쓴다.
  > 【추론】 이때 투영으로 빠진 값도 없음이 된다.
  > 【추론】 열거는 루트 노드의 함수와 getter `node.inactiveValues`다(VALUE-029).
  > ㄹ 손대지 않고 저장한 방출 값은 로드 값과 다를 수 있다.
  > 그 차이는 다섯으로 닫힌다: (a) 형상에 없는 노드의 값(잠복으로 남고 `inactiveValues`로 열거된다), (b) 작성자가 켠 투영(`omitEmpty`·`omitTrailing`), (c) S1의 형 정규화, (d) 로드의 자동 쓰기(없음인 키의 채움, 로드 때 발화하는 `injectTo`·`derived`, 로드된 값으로 평가한 `unsetValue`), (e) 키 순서(미선언 키는 `extras`로 보존되지만 선언 키 뒤에 온다, Q14).
  > 따로 알리는 경고는 두지 않는다.
  > 【추론】 ㅁ 비활성 경로에 닿는 쓰기는 거부도 오류도 아니다.
  > 【추론】 그 쓰기는 루트가 드는 그 경로의 잠복 원본에 반영된다.
  > 【추론】 노드는 만들지 않고, 규칙도 평가하지 않으며, 방출되지 않는다.
  > 【추론】 이런 쓰기가 닿는 길은 넷이다: 조상의 `Merge`나 로드가 그 경로를 담을 때(WRITE-018의 분배), 형상에 없는 대상을 가리킨 `controls.injectTo`(18C-14), `batch`에서 표시할 때는 형상에 있었으나 정착 뒤 떠난 노드에 표시된 쓰기, 형상을 떠나기 전에 얻은 노드 참조로 한 쓰기.
  > 【추론】 형상을 떠난 노드와 그 옛 참조의 읽기·쓰기·재진입은 18C-34가 정하며, 그래서 순차 쓰기와 배치 쓰기가 같은 원본에 닿는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1793-1803,1813-1820`(정본), `reviews/round-18-closing.md:2761-2762`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-64), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1822-1826`, `reviews/round-18-closing.md:2766-2768`
- 충돌:
  > `reviews/round-18-closing.md:1794`의 "그리고 모든 로드(`reset`, `setValue(V)`, 마운트)"는 18라운드 결정과 다르다: `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만들고, 잠복 원본이 지워지는 길은 나감 정책, 로드(마운트·`FormHandle.reset()`·`resetSubtree()`), V가 그 경로를 담지 않은 전체 교체 쓰기다(WRITE-090, WRITE-094). 18라운드 결정이 이긴다(`reviews/round-18-owner-answers.md:26`, `reviews/round-18-closing.md:2761-2762`).
  > `reviews/round-18-closing.md:1819`의 "조상의 `Merge`나 로드가 그 경로를 담을 때"는 18C-96의 결정과 다르다: `setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, V가 그 경로를 담으면 이 쓰기도 WRITE-018의 분배로 그 경로의 잠복 원본에 닿는다(WRITE-090, WRITE-094). 18C-96의 결정이 이긴다(`reviews/round-18-owner-answers.md:26`, `reviews/round-18-closing.md:2761`).

### VALUE-032 null 계약은 쓰기 종류로 표현한다 — `injectTo`는 언제나 자동 쓰기라 null 조상을 객체로 만들지 않음, 소유자 통보

- 결정:
  > 【추론】 null 계약은 작업 루프의 단계가 아니라 쓰기 종류로 표현한다.
  > 【추론】 쓰기 종류는 쓰기마다 진입에서 정해진다.
  > 【추론】 종류는 입력, 호출자(부분 쓰기·배열 연산), 로드, 자동 쓰기다.
  > 【추론】 표시 단계가 재계산 목록과 함께 그 종류를 기록한다.
  > 【추론】 같은 기록이 두 곳에 쓰인다: WRITE-013의 판정과 `UpdateValue`의 출처 칸(EVENT-060).
  > 【추론】 비객체 호스트의 원본을 비우는 것은 입력·호출자의 부분 쓰기뿐이고, 그 자식의 투영된 방출이 생길 때만 비운다.
  > 【추론】 판정이 값의 변화가 아니라 종류를 보므로, 같은 값을 다시 쓴 의도된 쓰기(S6)도 객체를 만든다.
  > 【추론】 단계만으로는 모자라다.
  > 【추론】 자동 쓰기인 `trim`은 정착 단계가 아니라 입력 마침 신호로 들어오기 때문이다(WRITE-078).
  > 【추론】 `controls.injectTo`는 원인과 무관하게 언제나 자동 쓰기이며 조상의 원본을 바꾸지 않는다.
  > 【추론】 오늘의 S2 규칙은 옮기지 않는다.
  > 【추론】 그 규칙은 `injectTo`가 원인 쓰기의 출처를 물려받게 해서, 사용자가 일으킨 `injectTo`면 null 조상을 객체로 만든다.
  > 【추론】 사용자에게 보이는 변화: 사용자가 일으킨 `injectTo`의 값이 null 조상 아래에 그려지지만 방출되지 않는다.
  > 【추론】 소유자가 뒤집기를 원하면, 12-5의 출처 칸 덕분에 원인의 출처를 물려주는 구현 비용은 작다.
  > 【추론】 이 동작 변화는 소유자 통보 목록에 올린다.
- 보충:
  > 편집자 결정(18C-100): "【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다." (`reviews/round-18-closing.md:2834`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1832-1846`(정본), `reviews/round-18-closing.md:2834`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1850-1855`, `reviews/round-18-closing.md:2836-2837`

### VALUE-033 nullable이 아닌 노드의 `null`은 바꾸지 않고 방출 — 경고등·경고, 검증기가 있으면 형 에러로 제출 막힘, 해법은 스키마에 nullable, 이주 항목과 PR-8 문서에 적음

- 결정:
  > 【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다.
  > 【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다.
  > 【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다.
  > 【추론】 해법은 스키마에 nullable을 적는 것이다.
  > 【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1123-1127`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`

### VALUE-034 빈 호스트와 루트의 방출 — 빈 `local`은 `{}`·`[]`, `omitEmpty`는 빈 `local`을 방출하지 않음, 루트는 루트 종류의 빈 그릇, 배열 아이템의 빈자리는 `{}`·`[]`·`null`

- 결정:
  > 【추론】 객체 호스트의 `local`은 늘 객체다: 방출이 있는 활성 자식의 합성이고, 그런 자식이 없으면 `{}`다(FRAGMENT-016의 "자기 `{}`"와 같다).
  > 【추론】 배열 호스트의 `local`은 아이템 방출의 배열이고, 아이템이 없으면 `[]`다.
  > 【추론】 `omitEmpty`(기본 켜짐)의 투영은 빈 `local` — `''`, 키가 없는 `{}`, 아이템이 없는 `[]` — 을 방출하지 않으며, 부모의 합성은 방출이 없는 자식의 키를 두지 않는다.
  > 【추론】 `omitEmpty`를 끈 호스트는 `{}`·`[]`를 방출한다.
  > 【추론】 루트는 방출이 없을 때 루트 종류의 빈 그릇을 `outputValue`로 준다: 객체 루트는 `{}`, 배열 루트는 `[]`, 그 밖의 루트는 `undefined`다.
  > 【추론】 그래서 빈 폼의 `FormHandle.getValue()`와 마지막 칸을 비운 뒤 루트 `onChange`가 받는 값은 오늘처럼 `{}`다.
  > 【추론】 배열 아이템은 자리가 색인이므로 빠지지 않는다: 방출이 없는 객체 아이템은 `{}`, 배열 아이템은 `[]`, 잎 아이템은 `null`로 그 자리를 채운다(VALIDATE-007: 방출은 JSON 왕복과 같고 배열 중간의 `undefined`는 없다).
  > 【추론】 `omitTrailing`은 배열 꼬리에서 이렇게 채운 자리를 자른다.
  > 【추론】 이 투영은 원본과 상태를 바꾸지 않는다(P3, P4).
  > PR: PR-2(객체 호스트)·PR-5(배열)
  > 무엇: 위 오늘 스위트의 단언과 `items.default` 없는 `push()`를 새 구현으로 돌린다.
  > 통과: 이 블록의 규칙대로 나오고, 오늘과 다른 곳은 LANDING-171과 이주 행이 모두 적고 있다.
  > 실패: 오늘과 다른데 이주 행이 없으면 행을 더하고, 규칙의 결함이면 이 블록을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2307-2315,2324-2327`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-88)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2317-2322`

### VALUE-035 노드가 생긴다는 것 — 채움은 이 사건에만, 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않음, `controls.visible` 전환은 생성이 아님

- 결정:
  > 노드가 **생긴다**는 것은 그 노드가 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있다는 뜻이다. 채움(`controls.default` > `default`)은 이 사건에만 일어난다(ADR 0007, ADR 0013).
  > 본체나 다른 켜진 조각이 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않는다. `controls.visible`의 전환은 생성이 아니다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:52`(정본, #1–#2·#4–#5. VALUE-007에서 분할), `adr/0006-single-value-ownership.md:52#1-2`, `adr/0006-single-value-ownership.md:52#4-5`, `07-conclusions.md:67`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 원리(`03-mental-model.md:90` 로드는 새 수명)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:56`

### VALUE-036 null 계약 D-1 — setValue(null)은 키가 없는 전체 교체, 셋째 칸도 특수 장치도 없음, 비객체 호스트의 자식은 존재하고 렌더됨

- 결정:
  > `setValue(null)`은 키가 없는 전체 교체이므로 자식 원본이 없음이 된다. 원본 칸 하나로 족하며 셋째 칸도 특수 장치도 없다 — 2라운드 S7(#338 S4와 "null 아래도 원본 유지"의 충돌)은 이렇게 닫힌다. 3라운드 E9의 "비객체 V는 자식 raw를 건드리지 않는다"와 E18("비객체 호스트의 자식은 비활성")은 **삭제**한다: 비객체 호스트의 자식은 **존재하고 렌더되며** 빈 상태를 보인다.
  > 실수로 누른 null의 되돌리기는 입력 컴포넌트의 몫이다.
- 보충:
  > 편집자 결정(18C-100): "【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092)." (`reviews/round-18-closing.md:2831`)
  > 편집자 결정(18C-100): "【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다." (`reviews/round-18-closing.md:2832`)
  > 편집자 결정(18C-100): "【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다." (`reviews/round-18-closing.md:2833`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:76`(정본, #1–#3·#5. VALUE-015에서 분할), `adr/0006-single-value-ownership.md:76#1-3`, `adr/0006-single-value-ownership.md:76#5`, `adr/0006-single-value-ownership.md:74`, `reviews/round-5-derivations.md:40`, `adr/0007-settle-cycle.md:115`, `adr/0013-core-does-not-rewrite-values.md:53`(WRITE-092의 정본), `reviews/round-18-closing.md:2831-2833`
- 닫은 사람: 원리(`reviews/round-5-derivations.md:40` D-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100)
- 라운드: 18
- 까닭: `reviews/round-5-derivations.md:40`, `reviews/round-18-closing.md:2836-2837`

### VALUE-037 `union`의 경고등과 방출·채움 — `valueTypeMismatch`는 원본과 현재 spec의 함수, 켜질 때마다 한 번과 다시 보내는 때, (가칭) `UpdateJsonSchema` 배달, `VALUE_TYPE_MISMATCH` 기록의 칸, 방출은 원본 참조, 통째 값의 JSON 부정합 경고 (가칭) `NON_JSON_WHOLE_VALUE`, 채움은 원본이 `undefined`일 때만

- 결정:
  > 【추론】 `valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다.
  > 【추론】 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다.
  > 【추론】 경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜진다(ERROR-186).
  > 【추론】 `VALUE_TYPE_MISMATCH`는 경고등이 켜질 때마다 한 번 보내고, 켜진 채 다른 어긋난 값이 와도 다시 보내지 않는다.
  > 【추론】 경고등이 꺼졌다 켜지거나, 노드가 형상을 나갔다 들어오거나, 로드로 경로 집합을 다시 만들거나, 게이트가 좁혀 켜지면 다시 보낸다.
  > 【추론】 쓰기 없이 경고등만 바뀐 노드를 배달하는 통지는 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)다(SETTLE-007, EVENT-045).
  > 【추론】 VALUE-030의 "바뀌면 `UpdateValue`가 알린다"는 "값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다"로 고친다.
  > 【추론】 `VALUE_TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060).
  > 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다.
  > 【추론】 `received`는 `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'` 가운데 하나다.
  > 【추론】 `reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`이고, `candidates`는 `'ambiguous'`일 때만 `['string','boolean']`으로 싣는다.
  > 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다.
  > 【추론】 `valueTypeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열이며, 커밋 번호로 메모하고 객체·배열 값의 안쪽 경로는 넣지 않는다.
  > 【추론】 `valueTypeMismatch === false`는 값이 이 노드 유효 목록의 형이거나, 없거나, 노드가 nullable일 때 `null`이라는 뜻일 뿐 검증 통과를 뜻하지 않으며, 이 문구를 `FormTypeInputProps`와 게터의 주석에 같이 적는다(SURFACE-052).
  > 【추론】 게이트가 `null`을 빼는 것은 검증 전용이다.
  > 【추론】 union은 잎이므로 방출이 없을 때의 자리는 VALUE-034 그대로이며, 루트는 `undefined`이고 배열 아이템 자리는 `null`이다.
  > 【추론】 그래서 `omitEmpty`가 켜진 union 아이템이 `{}`를 들면 `null`이 방출되고, `{}`를 남기려면 작성자가 `omitEmpty: false`를 적는다.
  > 【추론】 방출은 원본을 참조 그대로 내며, 객체·배열을 복사하지 않는다(VALUE-012, WRITE-013).
  > 【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다.
  > 【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다).
  > 【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 `(code, path)`로 로드마다 한 번 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다.
  > 【추론】 프로덕션에서는 그 점검을 하지 않으며, 이 한계를 문서에 적는다.
  > 【추론】 채움 값(`reviews/round-18-owner-answers.md:29`)은 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어가며, `interpret`(두 번 해석 포함)를 지난다.
  > 【추론】 그래서 로드된 `{}`는 이미 있는 값이며 `default`로 덮이지 않고, 이는 객체 호스트가 `{}`도 채움을 받는 것(WRITE-082)과 다르다.
  > 【추론】 목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)는 마운트 때 경고등을 켜고, `source: 'fill'`, `reason: 'ambiguous'`로 경고를 한 번 보낸다.
  > 【추론】 `default`의 객체·배열은 복사하지 않고 불변으로 다룬다(WRITE-071).
- 보충:
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2520-2545`(정본), `reviews/round-18-closing.md:2797-2798`, `reviews/round-18-closing.md:2953`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2556-2564`
- 충돌:
  > `reviews/round-18-closing.md:2540`의 "`(code, path)`로 로드마다 한 번 내며"는 18C-98의 결정과 다르다: 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(ERROR-204). 18C-98의 결정이 이긴다(`reviews/round-18-closing.md:2797-2798`).
  > `reviews/round-18-closing.md:2544`의 "목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)는 마운트 때 경고등을 켜고"는 18C-105의 결정과 다르다: 목록 밖 `default`의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(WRITE-099). 18C-105의 결정이 이긴다(`reviews/round-18-closing.md:2953`).
  > `reviews/round-18-closing.md:2520`의 "【추론】 `valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).
