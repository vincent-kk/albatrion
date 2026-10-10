# 단일 원장 — 상태와 값의 소유

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 영역은 노드가 드는 칸, 상태와 계산 결과와 작업의 기록의 구분, 값의 소유, 형상에 있음과 없음, 값 읽기를 다룬다. 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) `adr/0006-single-value-ownership.md`(5차 본문, 일부 수락)가 이 영역의 정본이다. (3) `03-mental-model.md` §2(원장)는 `08-design-a-to-z.md` §4와 다르면 원장이 이긴다(08이 스스로 그렇게 적는다). (4) 뒤 라운드가 앞 라운드를 이긴다. `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고, 뒤 문서가 바꿨으면 "대체됨"으로 남는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| VALUE-001 | 별도의 데이터 모델을 두지 않는다 — 노드 트리가 곧 상태 | 현행 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) |
| VALUE-002 | 노드가 드는 칸과 그 종류 — 상태는 raw와 extras 둘뿐 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3, 상태가 둘뿐인 것은 그 귀결 `adr/0006-single-value-ownership.md:3`), 원리(`03-mental-model.md:55-72` §2, 칸 목록 `adr/0006-single-value-ownership.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40·18C-59), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40; 경고등은 계산 칸) |
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
  > 편집자 결정(65C-03): "【추론】 장부를 노드 키 `Map`(`deliverySnapshots`·`deliveries`·`queuedEvents`)에서 레코드 필드(기준값, 대기 마스크, 비트별 `revision` 칸, payload 칸)로 옮기는 것은 NODE-004 "노드 인스턴스가 곧 레코드"와 맞고, VALUE-002 "상태는 `raw`와 `extras` 둘뿐이다(P3). 나머지는 상태에서 계산되거나 작업의 기록이다"의 "작업의 기록"에 든다 — 장부는 형상·값·방출에 들지 않고 읽기 API에 노출되지 않으며 커밋이 비운다. 그러므로 P3를 어기지 않는다. 조건은 넷이다: (1) 레코드 필드는 `record/type.ts`에 선언하고 NODE-004를 따르는 `record`의 DETAIL을 먼저 고친다; (2) 차등 시험은 개정 대장(비트별 `revision`), payload(`previous`·`current`), 배달 순서, `UpdateGlobalState` 횟수의 불변을 S1·S2 전후로 확인한다(06의 54만 단계 차등과 같은 모양); (3) S1과 S2는 별도 커밋이되 한 설계이므로 같은 PR 안에서 잇고, S3 뒤에 한다; (4) 05가 정한 이름(`revisionLedger`, `UpdateGlobalState`, 사건 종류)은 바뀌지 않는다." (`reviews/round-65-closing.md:26`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:27-42`(정본), `adr/0006-single-value-ownership.md:3,9`, `02-target-overview.md:142-148`, `03-mental-model.md:57-70`, `08-design-a-to-z.md:151-166`, `reviews/round-18-closing.md:1084,1668-1669`, `reviews/round-18-closing.md:1084`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3, 상태가 둘뿐인 것은 그 귀결 `adr/0006-single-value-ownership.md:3`), 원리(`03-mental-model.md:55-72` §2, 칸 목록 `adr/0006-single-value-ownership.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40·18C-59), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40; 경고등은 계산 칸)
- 라운드: 18
- 까닭: `adr/0006-single-value-ownership.md:42`, `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:1686-1690`
- 충돌:
  > `reviews/round-18-owner-answers.md:9`의 "노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7)."는 이 표에 없는 칸을 더한다. 18라운드 소유자 답이 뒤이므로 "칸은 열"의 수는 낡았다. 경고등이 상태인지 계산인지는 아직 적히지 않았다(→ WRITE-054). 경고등이 상태인지 계산인지는 18C-40이 '계산' 칸으로 닫았다(VALUE-030, `reviews/round-18-closing.md:1084`). 칸을 더한 것은 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:9`); 그 칸의 분류는 18C-40의 결정이 이긴다(`reviews/round-18-closing.md:1084`).

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
  > 편집자 결정(26C-08): "【추론】 `active` 게터는 그 노드가 형상에 있는가(선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아님, VALUE-006)를 읽는 멤버이므로, 살아 있는(형상 안) 노드에서는 늘 참이다." (`reviews/round-26-closing.md:87`)
  > 편집자 결정(26C-08): "【추론】 떼어진 노드의 `active`는 거짓이다: 떼어짐은 형상을 떠난 것이고, 이 멤버는 `rootNode`·`globalState`·`globalErrors`처럼 살아 있는 트리의 사실을 읽는 NODE-044 고정 규칙의 예외다." (`reviews/round-26-closing.md:88`)
  > 편집자 결정(26C-13): "【추론】 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)는 V의 값을 경로마다 원본으로 싣고, 형상에 없는 경로의 값은 그 자리에서 잠복 원본이 된다(로드 왕복): 같은 경로가 어느 종류로든 형상에 있으면 그 값은 살아 있는 노드의 원본이라 잠복 원본이 생기지 않고, 어느 종류도 형상에 없으면 그 경로의 선언 가운데 청사진 전순서에서 앞선 종류의 (경로, 종류) 잠복 원본이 된다. 이미 있던 잠복 원본은 V의 값으로 바뀌거나 지워진다." (`reviews/round-26-closing.md:138`)
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
  > 편집자 결정(67C-01): "【추론】 재현의 `/rows`가 내용은 같은데 새 참조로 지어진 것은 SETTLE-043 (나)의 되살림 구멍이지 배달의 문제가 아니다: 되살림이 맞게 되면 `/rows`의 참조가 유지되어 `UpdateValue`도 감시 에지도 나지 않아 둘이 맞는다. 06은 원인을 귀속한다 — 배열 호스트의 `assemble`·커밋 되살림(06의 `arrayBehavior`, 44C-01 (나)의 "바뀐 것이 없으면 같은 참조")이면 배열 시나리오가 닿으므로 #353에서 고치고 재현을 시험으로 남기며, 원인이 03의 잎·객체 되살림(`resetSubtree`의 로드가 같은 원본에 새 참조를 두는 것)이면 49C-01대로 대장 "열림"에 "같은 참조 규칙 위반, 수용 대상 아님 — 07 전환 또는 전용 성능 작업"으로 행을 더하고 고치지 않는다. 어느 쪽이든 S1 전의 동작(참조가 바뀌어 `/z`가 256을 받음)은 참조 비교로서 일관되었고 65C-03의 불변 기준으로 맞다." (`reviews/round-67-closing.md:10`)
  > 편집자 결정(107C-01): "【추론】 (a) 104라운드 수용의 원인은 "작은 폼에서 쓰기 하나의 고정비가 옛 판의 크기 비례 비용을 넘지 못함"이고 flat-100은 BF 갱신 1.07배로 그 자리를 이미 지났다. 첫 갱신만 1.796배인 것은 다른 원인 — 첫 갱신에만 드는 비용(조립의 첫 회, 진단·메모, 지연된 초기화)이고 07의 상한 표(O1·C1·F1)가 그 자리를 가리킨다. 그러므로 수용이 아니라 손질의 대상이며, 손질 뒤에도 1.5배를 넘으면 그때 코어 마운트 미달 다섯과 함께 소유자에게 올린다. array-100의 두 행은 보정 원인을 고친 뒤 다시 재되 이미 수용 행이다. 보정 검증 (가)의 비가산 합성은 측정 쪽 결함이므로 07이 보정 끝점의 꼬리 처리를 고쳐(중앙값의 합이 아니라 표본별 차의 중앙값으로) 95C-01의 방법 안에서 적고, 공식 표의 다른 행에 영향이 있는지 함께 밝힌다. (b) EVENT-007은 "커밋 때 배달 집합 전체를 한 번에 올림"과 리스너 호출 전의 revision 증가 순서를 정했지 그 집합을 어떤 자료 구조로 만드는지를 정하지 않았다. D1이 global-state 후보 다음 추가 후보의 순서로 각 노드를 정확히 한 번 방문하고 모든 revision 증가가 끝난 뒤 배달한다면, E1이 runtime 집합과 pendingRevision 비트를 그대로 둔 채 표시 경로의 객체 모양만 고정한다면 둘 다 EVENT-007 안이다. 조건: 차등이 (i) 배달 대상 집합과 방문 순서, (ii) 모든 리스너 호출이 모든 revision 증가 뒤임, (iii) changedNodes와 payload를 HEAD와 비교해 단언하고, 이력 열넷의 차등 폼에 구독자가 많은 폼(노드마다 리스너)을 더한다. (c) VALUE-012는 호스트 emit의 구성(구조 공유, 같은 값이면 이전 참조)을 정했다. O1의 힌트 객체는 조립의 입력이지 결과가 아니므로 정착 한 호출 안에서 재사용해도 되나, 조립마다 incremental 하나가 아니라 모든 칸을 초기화하고(남은 칸이 다음 조립에 새는 것이 유일한 위험) 힌트가 방출 값이나 payload로 참조로 나가지 않음을 단언한다. A1은 STABLE_SHAPES가 증명한 같은 children·schema·extras·키 집합에서만 쓰고 메타데이터가 맞지 않으면 기존 경로로 가므로 결과가 같다 — 차등은 키 순서, writeObjectKey의 특수 키, 자식 emit 참조 동일성, 같은 값의 이전 참조 복원을 단언한다. 모두 변경 하나에 105C-01 판정 하나이고, 계약에 닿지 않는 C1·F1·S1·R1·Q1을 먼저 가는 순서는 그대로다. P1·W1은 떼어 내기에서 회귀 행이 셋이라 뒤로 미룬 것이 맞다." (`reviews/round-107-closing.md:9`)
- 상태: 현행
- 출처: `adr/0006-single-value-ownership.md:68`(정본), `reviews/round-18-closing.md:1383-1386`
- 닫은 사람: 편집자 결정(4차 본문, 3·4·5라운드 반영 F9, `adr/0006-single-value-ownership.md:10`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `adr/0006-single-value-ownership.md:68`, `reviews/round-18-closing.md:1405-1411`

### VALUE-013 읽기는 계산하지 않는다 — 메모는 커밋 단계에서만
- 결정:
  > **10. 읽기는 계산하지 않는다.** 메모를 쓰는 곳은 작업 루프의 커밋 단계뿐이고(ADR 0007), 무효화 수단은 조상 방향의 재계산 목록 등록 하나다.
- 보충:
  > 편집자 결정(57C-01): "【추론】 VALUE-013은 "읽기는 계산하지 않는다. 메모를 쓰는 곳은 작업 루프의 커밋 단계뿐"이라고 적었고 EVENT-061은 진입 안의 "평범한 읽기는 직전 커밋을 돌려준다"고 적었으므로, 정착 바퀴 도중에 살아 있는 노드 객체를 읽는 어떤 길(사용자 콜백, 노드 객체에 닿는 `@` 문맥 함수나 식)도 직전 커밋의 `value`·`children`·`emit`을 본다; 들어온 자식이나 미뤄진 호스트의 새 합성은 커밋 뒤에야 관측된다. 옛 코드가 바퀴 도중에 `children`과 출력을 다시 지어 살아 있는 읽기에 노출한 것은 커밋 단계 밖에서 메모를 쓴 것이라 VALUE-013에 어긋났고, 51C-01의 미루기가 그 어긋남을 줄였다. 게이트와 식이 읽는 입력은 정착이 자기 경로(게이트 입력, 재계산 목록)로 그때까지 들어온 자식을 반영해 주며(51C-01의 조건, verifier가 확인), 그것은 노드 객체의 살아 있는 읽기와 다른 길이다. 그러므로 코드 변경은 없고, 06은 `settle`의 DETAIL에 "정착 도중 노드 객체의 읽기는 직전 커밋을 돌려주고, 바퀴 중간 상태는 관측 계약이 아니다"라는 문장 하나를 더한다." (`reviews/round-57-closing.md:9`)
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
  > `reviews/round-18-owner-answers.md:18`의 "그 원본은 잠복 원본으로만 남아 `getInactiveValues(path)`로 열거한다"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

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
  > 편집자 결정(26C-13): "【추론】 잠복 원본이 생기는 길은 둘뿐이다: 노드가 형상을 떠날 때 그 노드의 원본(NODE-044), 그리고 비활성 경로 쓰기(18C-64, 옛 참조 쓰기 포함). 형상에 든 적 없는 다른 종류의 선언은 노드가 아니므로 부모 원본의 키 값에서 잠복 원본을 만들지 않으며, 그 값은 살아 있는 노드의 원본 하나다." (`reviews/round-26-closing.md:137`)
  > 편집자 결정(26C-13): "【추론】 `inactiveValues`의 열거는 경로 단위다: 반환 `{ path, value }`에는 종류가 없으므로, 같은 경로가 어느 종류로든 형상에 있는 동안 그 경로의 잠복 원본은 열거에 나오지 않고, 경로가 형상을 떠나면 나온다." (`reviews/round-26-closing.md:140`)
  > 편집자 결정(35C-10): "【추론】 26C-13·26C-14(SETTLE-029, VALUE-002)가 형상 밖 객체 값만 선언의 전순서로 노드별 잠복 원본에 분배하고 호스트의 잠복 원본은 자신의 비객체 `raw`와 선언 밖 `extras`만 보관하므로, 배열은 평범한 객체가 아니라 게이트로 꺼진 배열 호스트의 잠복 원본은 배열 전체를 호스트 자신의 얼린 `raw`로 들고 아이템별로 나누지 않으며, `inactiveValues`에는 호스트 경로의 `{ path, value }` 항목 하나다." (`reviews/round-35-closing.md:82`)
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
  > 편집자 결정(26C-06): "【추론】 원장이 "루트가 든다"고 적은 트리 전체 자료(로드 스냅숏, 잠복 원본, 경고등 경로 집합, 잠복 원본 열거의 메모)의 저장 자리는 트리마다 하나인 `SchemaNodeRuntime`의 칸이며, 루트는 자기 `runtime` 필드를 통해 그것을 든다." (`reviews/round-26-closing.md:66`)
  > 편집자 결정(61C-01): "【추론】 삭제·대체는 열이다: `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` 삭제(`injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`, CONTROLS-079); `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` 삭제 → `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(쓰기 오류로 부류 이동, ERROR-195); `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 삭제 → `SCHEMA_FORM_WARNING.TYPE_MISMATCH`(소유자 확정, SURFACE-061); `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 삭제(소유자 판정으로 코드 행 제거); `NodeState` → `SchemaNodeState`, `NodeEventType` → `SchemaNodeEventType`(SURFACE-056, 옛 소비자 이주는 07); `valueTypeMismatch`·`valueTypeMismatches` → `typeMismatch`·`typeMismatches`(SURFACE-061); `latent` → `getInactiveValues(path)`(SURFACE-006); 옛 Form 속성 `onListenerError`와 `throwOnBudgetExceeded` 삭제(기록은 `onError`가 받고, 모든 환경에서 사슬 끝에 던진다). 원장에서 이 옛 이름을 가진 문장은 옛 글로 남고 이 보충이 이긴다." (`reviews/round-61-closing.md:10`)
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
- 보충:
  > 편집자 결정(39C-01): "【추론】 원장은 잘못된 종류의 값을 보존하고 방출하라고 적었다: VALUE-033 "(4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다", 쓰기 정책 표의 "nullable이 아닌 객체의 `null`을 `{}`로 바꾸기(S7), 비객체 값 버리기 | **폐기.** 보존·방출하고 type 에러를 낸다", WRITE-013의 예(`setValue({ user: null })` 뒤 `user`는 입력이 올 때까지 `null`인 채 방출된다); PR-2로 넘어온 프로토타입도 같다(`spikes/round9/regress/selfcheck-v5.mjs:485` "A3-3/A3-4-host: null and 17 hosts emit their raw, no branch on (G={}), children exist", `:569` "after setValue({target:null}) emit {target:null}"). 그래서 38C-01이 서고, 가지 호스트(객체·배열)는 잘못된 종류의 `raw`를 자기 방출로 내며 자식 방출만 투영에서 빠진다(VALUE-002 "비객체 호스트 아래 자식의 원본은 부모의 `emit`에 나타나지 않는다"); 게이트 입력이 `G = {}`인 것(SETTLE 영역)은 게이트가 보는 값의 규칙이지 방출의 규칙이 아니다." (`reviews/round-39-closing.md:9`)
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
- 보충:
  > 편집자 결정(35C-08): "【추론】 아이템 선언의 노드 게이트와 아이템 스키마의 게이트 조각은 허용된다(BLUEPRINT-030은 게이트를 형상 확장의 경계로 센다); 게이트로 형상을 떠난 아이템은 WRITE-036의 소멸 목록(`remove`·짧아진 통째 쓰기·로드)에 없으므로 나감이며 나감 정책·비움·잠복 포착이 런타임 경로를 키로 적용되고, 자리는 색인이라 남아 VALUE-034대로 방출 없는 자리로 채운다(객체 `{}`, 배열 `[]`, 잎 `null`; `omitTrailing`은 그런 꼬리를 자른다)." (`reviews/round-35-closing.md:67`)
  > 편집자 결정(37C-01): "【추론】 `omitTrailing`은 가지 배열의 방출 배열 꼬리에서 빈 자리의 최대 연속 구간을 자르는 투영이며, 빈 자리는 셋이다: (1) 방출이 없는 아이템의 자리를 VALUE-034대로 채운 값(객체 `{}`, 배열 `[]`, 잎 `null`), (2) 잎 아이템이 실제로 `null`을 방출한 자리(방출 배열에서 (1)의 잎과 구별되지 않고, PR-5로 넘어온 프로토타입 기대 `['a', null, null]` → `['a']`가 이것을 자른다), (3) 청사진이 없는 자리(`extras`)의 값이 `undefined` 또는 `null`인 자리." (`reviews/round-37-closing.md:9`)
  > 편집자 결정(37C-01): "【추론】 `omitEmpty`를 끈 객체·배열 아이템이 실제로 방출한 `{}`·`[]`는 빈 자리가 아니라 자르지 않으며(VALUE-034 "`omitEmpty`를 끈 호스트는 `{}`·`[]`를 방출한다"; 프로토타입 `[{}, { a: 1 }, {}]`가 그대로 남는다), 앞과 가운데의 빈 자리는 색인을 지키기 위해 남긴다(레거시 `omitTrailingArray`의 주석과 같은 까닭, `[undefined, 'x', undefined]` → `[null, 'x']`); 원본 `raw`·상태·스냅숏은 바뀌지 않는다(GOAL P4, VALUE-034 "이 투영은 원본과 상태를 바꾸지 않는다")." (`reviews/round-37-closing.md:10`)
  > 편집자 결정(38C-02): "【추론】 잠복 원본이 생기는 길은 "노드가 형상을 떠날 때 그 노드의 원본"(26C-13, NODE-044)이고 형상은 상태(`raw`·`extras`)의 순수 함수(P3)이므로, 35C-10의 "배열 전체를 호스트 자신의 얼린 `raw`로"는 아이템의 방출이나 `local`이 아니라 원본 트리를 뜻한다: 자리마다 아이템 잎·터미널의 `raw`, 가지 아이템은 그 자식들의 원본 트리와 `extras`를 재귀로 모은 객체(배열 아이템이면 배열), 원본이 하나도 없는 자리는 `undefined`, 청사진 없는 자리는 `extras`의 값이다; VALUE-034의 방출용 채움(`{}`·`[]`·`null`)은 데이터가 아니라 얼리지 않는다." (`reviews/round-38-closing.md:18`)
  > 편집자 결정(38C-02): "【추론】 재진입은 그 원본 트리를 생김의 입력으로 삼아 새 키의 아이템을 만들고, 원본이 `undefined`인 자리와 자손에만 채움이 간다(35C-10, WRITE-007); 방출의 구멍은 그때 VALUE-034로 다시 채워진다." (`reviews/round-38-closing.md:20`)
  > 편집자 결정(47C-01): "【추론】 객체 호스트(아이템 포함)는 자식의 원본 트리 가운데 `undefined`가 아닌 것이 하나라도 있으면 그 키들만 모은 객체이고 하나도 없으면 `undefined`다 — 객체 아이템의 존재는 배열 자리가 보장하므로 `{}`로 얼릴 필요가 없고, `{}`는 VALUE-034의 방출용 채움이라 데이터가 아니다(38C-02); 잎은 `raw`가 있으면 그 값, 없으면 `undefined`다. `[undefined, undefined]`를 받은 배열 자리에 객체 아이템 청사진이 있으면 아이템은 `raw` 없이 생기고 자식 잎에 원본이 없어 WRITE-090의 채움은 그 생긴 노드에만 간다." (`reviews/round-47-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2307-2315,2324-2327`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-88)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2317-2322`

### VALUE-035 노드가 생긴다는 것 — 채움은 이 사건에만, 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않음, `controls.visible` 전환은 생성이 아님

- 결정:
  > 노드가 **생긴다**는 것은 그 노드가 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있다는 뜻이다. 채움(`controls.default` > `default`)은 이 사건에만 일어난다(ADR 0007, ADR 0013).
  > 본체나 다른 켜진 조각이 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않는다. `controls.visible`의 전환은 생성이 아니다.
- 보충:
  > 편집자 결정(89C-02): "【추론】 자격 밖 입력이 노드 변경 전에 범용 경로로 가는 한 두 경로의 관측은 같아야 하므로 적용 범위를 좁히는 것은 계약이 아니라 구현 선택이고 편집자가 승인한다. 범위를 그렇게 가르는 까닭은 SETTLE-046·VALUE-035다 — 로드에서는 최종 형상의 노드가 모두 "생긴 노드"로서 채움을 받고(`controls.default` > `default`), `injectTo`는 발화하며 `controls.unsetValue`는 로드된 값으로 평가한다 — 그 가운데 literal `default`의 채움만이 다른 노드를 보지 않는 독립 계산이고, 발화·평가·동적 `controls.default`는 전이 라운드와 식 평가가 필요하므로 범용 경로의 몫이다. `DisableAutomaticWrites`는 "채움을 쓰지 않는다"는 플래그라 첫 범위에 들어도 된다. 확대 순서는 뜻이 적은 쪽부터다: (1) literal `default`(첫 구현), (2) 명시 `null`·`undefined` 입력(nullable 판정 BLUEPRINT-044와 없음의 뜻), (3) wrong-kind 입력(mismatch 목록과 LANDING-126의 `VALUE_TYPE_MISMATCH` 경고 기록 — 그 기록도 89C-01대로 모아 두었다가 사슬 끝에서 간다), (4) literal `controls.default`(SETTLE-005의 순위 `controls.default` > `default`를 literal끼리만). 각 확대는 설계안의 차등 행렬에서 그 부류의 사례가 범용 경로에서 먼저 초록이고 정적 경로에서 같은 단언을 통과한 뒤에만 한다. 재귀 배열(BLUEPRINT-030의 잘린 되풀이)·virtual·whole-value 전략은 자격 판정이 복잡해 첫 로드 절감 대비 위험이 크므로 PR-7에서는 범용 경로로 남기고, 그 폼들의 첫 로드가 목표(85C-01)에 못 미치면 그 행은 정돈·성능 최적화 단계의 열린 행으로 적는다 — 측정된 행(flat·nested·array·derived·oneOf·if-then)에는 그 셋이 없다." (`reviews/round-89-closing.md:16`)
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
  > 편집자 결정(38C-01): "【추론】 NODE-021·VALUE-002대로 가지 배열의 자식 집합은 값에서 오고(아이템 수 × 아이템 청사진) 자식이 있는 노드는 잘못된 종류의 값이 왔을 때만 `raw`를 드므로, 배열 호스트에 `null`·수·평범한 객체 같은 배열 아닌 값을 통째로 쓰면 호스트가 그 값을 `raw`로 들고 길이가 없으니 아이템은 0개다; 있던 아이템은 WRITE-036의 "통째 교체로 짧아진 배열"처럼 소멸이지 나감이 아니다. 객체 호스트의 자식이 스키마에서 와 비객체 `raw` 아래에도 존재한다는 VALUE-036의 문장은 자식이 값에서 오는 배열에는 옮겨 적용할 것이 없고, 아이템을 잘못된 종류의 `raw` 아래 남기라는 원장 문장은 없다." (`reviews/round-38-closing.md:9`)
  > 편집자 결정(38C-01): "【추론】 호스트의 방출은 억제되지 않고 그 잘못된 종류의 `raw`를 자기 값으로 방출한다(WRITE-013의 예 "`setValue({ user: null })` 뒤 … 사용자가 `name`에 입력하면 `user`가 객체가 되어 방출된다"는 그 전까지 `user`가 `null`을 방출함을 전제한다; VALUE-002 "비객체 호스트 아래 자식의 원본은 부모의 `emit`에 나타나지 않는다"는 자식 쪽 문장이다), 정합 경고등은 "잘못된 종류를 든 가지 노드도 켜진다"대로 켜진다. 로드로 온 비배열 값도 같되 채울 아이템이 없다." (`reviews/round-38-closing.md:10`)
  > 편집자 결정(39C-01): "【추론】 원장은 잘못된 종류의 값을 보존하고 방출하라고 적었다: VALUE-033 "(4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다", 쓰기 정책 표의 "nullable이 아닌 객체의 `null`을 `{}`로 바꾸기(S7), 비객체 값 버리기 | **폐기.** 보존·방출하고 type 에러를 낸다", WRITE-013의 예(`setValue({ user: null })` 뒤 `user`는 입력이 올 때까지 `null`인 채 방출된다); PR-2로 넘어온 프로토타입도 같다(`spikes/round9/regress/selfcheck-v5.mjs:485` "A3-3/A3-4-host: null and 17 hosts emit their raw, no branch on (G={}), children exist", `:569` "after setValue({target:null}) emit {target:null}"). 그래서 38C-01이 서고, 가지 호스트(객체·배열)는 잘못된 종류의 `raw`를 자기 방출로 내며 자식 방출만 투영에서 빠진다(VALUE-002 "비객체 호스트 아래 자식의 원본은 부모의 `emit`에 나타나지 않는다"); 게이트 입력이 `G = {}`인 것(SETTLE 영역)은 게이트가 보는 값의 규칙이지 방출의 규칙이 아니다." (`reviews/round-39-closing.md:9`)
  > 편집자 결정(39C-01): "【추론】 머지된 객체 행의 `projectObject`가 비객체 `raw`에 `undefined`를 돌려주는 것과 `objectBehavior/DETAIL.md`의 "그 호스트의 방출은 하지 않습니다"는 03의 기록에 결정으로 남아 있지 않은 근사이며 결함이다(29C-02·29C-03의 선례와 같다); nullable 객체(`type: ['object','null']`)의 `null`이 방출에서 사라져 `{ user: null }`이 `{}`가 되는 것은 동작 결함이고, 배열 아이템인 객체 호스트의 `null`이 VALUE-034의 구멍 채움 `{}`로 바뀌어 보이는 것도 같은 결함이다." (`reviews/round-39-closing.md:10`)
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
  > 편집자 결정(31C-02): "【추론】 ERROR-021이 "예외는 하나다"라고 적은 가드 컴파일 실패의 시점 차이에, 18라운드 뒤 블록 WRITE-099가 둘째 예외를 더했다: `NON_JSON_WHOLE_VALUE`의 깊이 점검은 핸들러가 있어도 프로덕션에서는 돌지 않는다. 뒤 결정이 이기므로 운영 모드에서 핸들러가 받지 못하는 경고는 이 코드 하나다." (`reviews/round-31-closing.md:20`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2520-2545`(정본), `reviews/round-18-closing.md:2797-2798`, `reviews/round-18-closing.md:2953`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2556-2564`
- 충돌:
  > `reviews/round-18-closing.md:2540`의 "`(code, path)`로 로드마다 한 번 내며"는 18C-98의 결정과 다르다: 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(ERROR-204). 18C-98의 결정이 이긴다(`reviews/round-18-closing.md:2797-2798`).
  > `reviews/round-18-closing.md:2544`의 "목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)는 마운트 때 경고등을 켜고"는 18C-105의 결정과 다르다: 목록 밖 `default`의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(WRITE-099). 18C-105의 결정이 이긴다(`reviews/round-18-closing.md:2953`).
  > `reviews/round-18-closing.md:2520`의 "【추론】 `valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).
