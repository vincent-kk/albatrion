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
| VALUE-038 | 비활성 값 메모의 유지 방식(455라운드) — 공개 `inactiveValues`가 동결 배열이고 루트 목록이 잠복 전체를 품으므로 쓰기에서 즉시 유지하는 증분 설계(B2-P1, 두 후보)는 O(L)을 피하지 못해 미채택·되돌림(계약 시험 다섯과 기록만 #475), 다음 가설 B2-P1b는 쓰기에서 Δ가 닿은 호스트의 dirty 표식과 journal만 두고 첫 읽기 때 materialize, 나가는 참조의 직전 커밋 캡처도 세대 토큰으로 지연(NODE-044 유지, 같은 세대 배열은 참조 재사용), 첫 읽기 O(K log K)+미소비 Δ, 읽지 않은 journal이 max(2·L, 512)를 넘으면 커밋 때 압축(쓰기당 상각 O(1)), 영속 색인·HAMT는 범위 밖 | 현행 | 편집자 결정(455라운드, `reviews/round-455-closing.md` 455C-04·05) |

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
  > 편집자 결정(400C-01): "【추론】 터미널 모드(options.terminal)는 느리지 않다: 객체 1000키 마운트 Node −90%·Bun −64%, 배열 8천 마운트 거의 0으로 0.16.1보다 빠르다. 느린 것은 표시 없이 하위 선언이 없는 호스트(자식 0개 브랜치)이며 원인은 모든 키가 선언 밖 값이 되어 키마다 복사(계측 비율 37%)와 재조립(47%)되는 것이다. 0.16.1은 items 없는 배열 스키마를 거부하므로 그 모양의 옛 판 수치는 없다. 결함 수정 셋(F2·F3·394C-02)은 배열 동사 비용을 바꾸지 않았다(수정 전 대비 모든 행 −7%~+6%). 다음 구현 묶음 L3의 수용 가설은 다섯이고 각각 지우는 비효율 하나를 이름 지었다(370라운드): (a) 선언 밖 키마다 defineProperty를 일반 대입으로(writeObjectKey, __proto__ 보호는 코드에만 있으므로 그 불변을 시험으로 고정하고 원장 보충으로 적음); (b) items 없는 배열의 push·insert(N) 지름길 — 선언 밖 값뿐인 배열의 덧붙임이 모든 칸을 걷는 O(N) 접두 증명·재사용 검사를 없앰(자격 배제 목록 그대로, prefixItems 튜플 뒤 꼬리 제외, 새 빈 children 참조·UpdateChildren·revision 유지, 전체 배달 비교); (c) nextExtras 끝의 sameValue가 markWrite의 비교와 중복인 두 번 비교 제거(Merge 길 동일성 확인이 선행 조건); (d) 이미 해석된 자식에 staticSpec을 다시 조회하지 않고 넘김(all-keys 격차의 2.75%); (e) 게이트 조각이 있는 폼의 평상시 쓰기가 나감 정책 의존 판정마다 조각별 전체 통제 층을 만든 뒤 소유 하나를 찾는 것을 직접 소유 판정으로(조각 수에 초선형, F=64에서 Node 3.38→1.05 ms·Bun 16.6→1.36 ms, 72장면·323단계 차등 0, 정책 평가·층 순서 불변, 캐시 없음; 결정 58의 입구 수치 3.38 ms 중 2.34 ms). 가설마다 커밋 하나, PR 하나(대기열 56), 검증은 agy high(397라운드). 증명 먼저 후보(비효율로 이름 짓기 전 증명 필요, 지금 쪼개지 않음): all-keys 격차 중 DETAIL 설계 기록만 근거인 알고리즘 몫(커밋 후보 루프, 커밋마다 RevisionLedger 생성, dirty 색인 반복), (c) 다섯(없는 misfit 경로 삭제, 빈 commitGlobalState 방문, hasDistributedChildInput 재검사, effectiveType 재검사, keepsHostKeys 훑기), 빈 상호작용 상태 공유(노드당 56 B, 정체성 비교·제자리 변경 부재 증명 선행). 수용 후보(M3 때 현재 수치로 소유자 수용 목록): all-keys 격차 중 원장 계약 몫(SETTLE-001·002·003, 노드별 revision·EVENT 배달), 선언 밖 값의 불변 사본·순서 보관이 요구하는 키 수 비례 복사·재조립(VALUE-002, SETTLE-042·043), 터미널 객체 한 키 변경의 첫 다른 키 위치 비례 비교(두 판 같은 방향), 노드 레코드 376 B(NODE-018 추정 210~260 B 초과, NODE-055 판정은 하지 않음), 청사진 스키마 노드당 약 1,820~1,830 B와 폼 하나 기준 트리+청사진 메모리 0.16.1 대비 약 5분의 1 증가(398라운드 소유자 판단으로 청사진 공유는 지금 하지 않음). 폐기: 선언 밖 값 입력 재사용(Merge에서 이전 값 상실, 호출자 객체 변조가 폼 값에 전파, 396라운드 예측 가능성 원칙 위반). 기록만: items 없는 배열 remove(0)의 extras 인식 splice(범위 밖), 빈 배열→빈 배열의 새 children 참조와 UpdateChildren(원장 요구인지 부산물인지 미확인, 지름길은 보존), 빈 구조 그릇 정리(지울 것 없음, L3-3 닫음)." (`reviews/round-400-closing.md:8`)
  > 편집자 결정(400C-03): "【추론】 비용 분해에서 "계약상 필요"는 원장 항목(SETTLE·EVENT·VALUE 등)이 그 결과를 요구하는 경우에만 쓰고, DETAIL의 알고리즘 기술만 근거인 반복은 "현재 알고리즘"으로 따로 센다(fairy08 b2 대조). 그래야 "계약상 필수"로 읽혀 개선 여지가 가려지지 않는다. __proto__ 보호(writeObjectKey)는 원장에 근거가 없는 코드만의 불변이므로 L3-(a) 때 시험으로 고정하고 VALUE-002 보충으로 적는다." (`reviews/round-400-closing.md:12`)
  > 편집자 결정(404C-01): "【추론】 PR #417을 8e35b01fc로 squash 병합했다(커밋 a8a71b65f DETAIL 셋, 67964cc21 코드·시험). 비효율 하나: items 템플릿이 없는 배열은 값이 모두 선언 밖 값이라 끝 덧붙임 한 번마다 정적 꼬리 자격(admitsStaticArrayTail)이 extras 존재·템플릿 없음·children 길이 불일치로 거절되어 일반 길로 갔고, 일반 길과 출력 합성이 모든 칸을 걸어 접두를 다시 증명했다(getItemEntries 8천에서 24,003회 ≈ 3N). 바뀐 자격 한 문장: items와 prefixItems가 모두 없고 children이 비어 있으며 선언 밖 값의 길이가 아이템 수와 같은 정적 branch 배열의 단독 push 또는 insert(N) 한 번은 지름길 자격을 얻어 덧붙인 칸 하나만 다루고, 출력 합성은 이전 배열에 값 하나를 이은 새 배열을 만든다; 템플릿이 있는 배열의 기존 경로, prefixItems 튜플 꼬리, 게이트·통째 raw·배치·로드·자동 쓰기, 가운데 insert·remove·pop의 배제는 그대로다. 유지한 관측(측정 문서 A3 절 목록 전부): 호스트·루트 값의 새 참조와 local 얕은 사본, 새 로드 스냅숏 배열·끝 값·defaultValue, 선언 밖 값의 새 배열과 이전 배열 불변(VALUE-002), 빈→빈 children의 새 배열 참조와 UpdateChildren·revision 증가(400C-01의 미결 기록 범위 유지), 호스트·조상 UpdateValue 차례·비트·payload와 루트 onChange 한 번·검증 요청 한 번, itemCount·길이 상태·omitTrailing 제외, 호출자 입력 불변(WRITE-013). compareArrayAppend 픽스처가 지름길 트리와 일반 길을 강제한 트리의 전체 배달 기록을 대조해 차이 0이다. 효과(Node v26.12.0·Bun 1.4.3, 두 바퀴 중앙값): 8천 push Node 0.653→0.063 ms(−90.4%)·Bun 1.816→0.080 ms(−95.6%), insert(N) Node 0.663→0.072 ms(−89.2%)·Bun 1.774→0.081 ms(−95.5%); getItemEntries는 1천 3,003→2회, 8천 24,003→2회로 수용 사본을 제외한 작업이 상수다(시험은 상한 4회로 단언). 남은 시간(8천 기준 Node 약 0.06~0.07 ms, 1천의 약 2~3배)은 SETTLE-042·VALUE-002·WRITE-085가 요구하는 세 배열(local, 로드 스냅숏, 선언 밖 값)의 O(N) 얕은 사본이며 수용 후보 목록에 둔다. 캐시·전역 상태는 없고 ArrayAppendProof 형의 선택 속성 추가는 공개 표면으로 재수출되지 않는다. 기존 시험 기대값 변경 0건. 388라운드 허용 범위의 실험이며 소유자가 되돌릴 수 있다. remove(0)의 extras 인식 splice는 여전히 범위 밖이다." (`reviews/round-404-closing.md:8`)
  > 편집자 결정(405C-01): "【추론】 PR #418을 89ea2c98b로 squash 병합했다(커밋 a4375e180 DETAIL 셋, cad821b8d 코드·시험). 비효율 하나: nextExtras의 두 복사 루프가 선언 밖 값의 키마다 Object.defineProperty로 썼다. 바뀐 규칙 한 문장: 선언 밖 값은 새 사본에 복사하되 `__proto__`만 own property로 정의하고 나머지 키는 일반 대입하며, 선언 키 거름·Merge의 기존 키 보존과 새 키 순서·호출자 입력 불변·빈 값 처리·같은 값의 기존 참조 되살림은 그대로다(VALUE-002, WRITE-013, SETTLE-042, SETTLE-043). 안전한 키 쓰기 writeObjectKey는 객체 합성과 정착이 함께 쓰므로 두 소비자의 최저 공통 fractal인 engine의 utils 구획에 두고 자식 fractal의 형을 가져오거나 공개 진입점에 수출하지 않는다. `__proto__` 보호는 원장 항목이 요구한 적 없는 코드만의 불변이므로 이 결정이 VALUE-002의 보충이 되고, 시험 packages/canard/schema-form/src/core/engine/settle/utils/input/__tests__/nextExtras.plain-assignment.test.ts의 "keeps __proto__ as an own data property without changing prototypes (merge=%s)", "copies a previous __proto__ key during Merge", "filters a declared input key"가 prototype 오염 없음과 own property 유지를 고정한다. 효과(Node v26.12.0·Bun 1.4.3, 두 바퀴 중앙값): Node B0 마운트 1.412→0.966 ms(−31.6%), 한 키 −11.8%, 모든 키 −18.2%; Node B1 마운트 1.809→1.004 ms(−44.5%), 한 키 −8.8%, 모든 키 −14.8%; Bun B0 마운트 −18.6%, 모든 키 −2.2~−8.9%, 한 키 ±1% 안; Bun B1 마운트는 첫 창 +31.7%였으나 재측정 두 바퀴 범위가 0을 걸쳐 차이 없음으로 읽는다(400C-02). 캐시·전역 상태는 없고 공개 API는 불변이며 기존 시험 기대값 변경은 0건이다. 388라운드 허용 범위의 실험이며 소유자가 되돌릴 수 있다. v1 입력 참조 재사용은 396·400라운드대로 폐기 상태다." (`reviews/round-405-closing.md:8`)
  > 편집자 결정(406C-01): "【추론】 PR #419를 bb4ff19d9로 squash 병합했다(커밋 3ee575f03 DETAIL, d382874e8 코드·시험). 비효율 하나: Overwrite 쓰기마다 nextExtras가 선언 밖 값 전체를 구조 비교해 같은 값이면 이전 참조를 돌려준 뒤, markWrite가 같은 두 값을 다시 구조 비교했다(Node B0 한 키에서 nextExtras 포괄 시간의 31.2%가 이 비교). nextExtras의 되살림은 잠복 Merge가 참조로 변경 여부를 판단하는 데 의존하므로 유지하고, 대신 배열 꼬리를 만드는 arrayExtras도 이전 꼬리와 같은 값이면 이전 참조를 되살리게 하여 markWrite의 extras 변경 판정을 참조 동일성으로 바꿨다. 규칙 한 문장: 선언 밖 값의 구조 비교는 쓰기 한 번에 한 번이며, 그 비교는 사본을 만드는 자리(객체 nextExtras, 배열 arrayExtras)가 맡고 markWrite에 extras를 넘기는 모든 호출자는 같은 값이면 이전 참조를 넘긴다(SETTLE-043의 같은 값 규칙과 커밋·emit 참조 되살림은 그대로; VALUE-002의 키 순서와 WRITE-013의 호출자 입력 불변 유지). 효과(Node v26.12.0·Bun 1.4.3, 두 바퀴 중앙값, N=1000): B0 한 키 Node 0.987→0.924 ms(−6.2% [−3.4~−9.1]), Bun 0.476→0.411 ms(−13.7%); Bun B1 한 키 −4.4%, 모든 키 −6.0%; Node 모든 키와 Node B1 한 키(+5.5% [−19.0~+8.0])는 바퀴 범위가 0을 걸쳐 차이 없음(400C-02). 계측: 객체 쓰기의 선언 밖 값 구조 비교 2회→1회(시험은 1회 이하 상한). 캐시·전역 상태 없음, 공개 API 불변, 기존 시험 기대값 변경 0건. 370라운드 원칙의 적용 기준을 기록한다: "추가 코드가 제거 비효율보다 크다"는 줄 수가 아니라 비례로 읽으며, 반복 비용 O(키 수)를 없애는 순증 몇 줄은 허용하고 분기 없는 모양을 우선한다. 388라운드 허용 범위의 실험이며 소유자가 되돌릴 수 있다." (`reviews/round-406-closing.md:8`)
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
- 보충:
  > 편집자 결정(417C-02): "【추론】 호출뒤외부중첩변경과초기loadSnapshot의caller배열공유는 engine API의caller불변과다른축이다. 대기열59에깊은격리·초기snapshot의새보장·동작변경·그수용만보류하고 이번가설은실제별칭과58장면의전후동치만검증한다. nextExtras의재열거를무조건wrote플래그로대체하는안은 frozen own-data입력의대입을상속setter가흡수하면 현재undefined가빈객체로바뀌는 실제격리반례때문에기각하며 pristine입력계약을추가하지않는다. 첫객체합성의중복names·seen구성제거는 previous가없고childValues와선행names가모두비었을때의국소조건부계획일뿐이며13격리전사동치·N회중복작업제거를제품실행·시간절감·독립승인으로바꾸지않는다. 새기준·실제소비·전체관측·원표본·독립검토·별도실행승인이필요하며 itemless채택·결정54/58·M3·옛판직접root비동기시간을임의로닫지않는다." (`reviews/round-417-closing.md:10`)
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
  > 편집자 결정(395C-01): "【추론】 R1(a·b·c): 구조 이동이나 보존하는 호스트 이탈이 남기는 모든 자리는 파괴적 주소·저장 변경 전에 모든 깊이의 살아 있는·이미 잠복인 후보 원천을 포착하고, 같은 정착의 이후 모든 단계에서 (경로, 토큰) 정체와 메타데이터를 보존하며, 합성 입력보다 정확한 원천을 먼저 재생한다(NODE-051, 41C-01). 보호 여부는 직계 후보 수가 아니라 후보를 포함한 하위 트리로 정하고, 템플릿 없는 도착 예외는 후보가 있는 이동의 원본 포착에만 적용해 후보 없는·단일 종류 자리는 base의 조기 종료와 목적지 등록을 그대로 둔다. R2(d): 후보 이탈은 자동 쓰기 억제와 무관하게 상속 소유 범위 안의 공유되지 않은 도달 불가 낡은 열쇠를 지우되 억제된 정책 쓰기는 켜지 않는다(WRITE-015·034). 이 정리는 후보 소유 범위 안의 이탈에만 하고 같은 포착이 돌려준 소유 판정을 같은 이탈 결정 안에서 인자로만 넘겨 재사용한다 — 모듈·런타임·노드 어디에도 저장하지 않으므로 370라운드의 캐시 금지에 해당하지 않는다. 자연 경로는 찾지 못해 합성 재현이다. R3(e): 종류가 둘 이상인 배열 경로의 형상 밖 쓰기는 쓰는 순간 선언된 원천을 재귀적으로 청사진 전순서의 첫 종류에 묶고 그 주소의 다른 종류 원천을 지우며 길이와 미선언 꼬리는 보존하고 재진입 때 주인을 다시 바꾸지 않는다 — 객체의 형상 밖 쓰기 규칙(26C-13·14, WRITE-087)과 같아진다. 35C-10("비활성 배열 호스트의 잠복 원본은 배열 전체를 호스트 자신의 얼린 raw 하나로 보관")은 뒤집지 않고 좁힌다: 후보가 있는 배열 경로의 새 형상 밖 쓰기만 제외하고, 이탈 포착과 후보 없는·단일 종류 배열은 그대로다. 결정 62는 이 수정으로 (가) "현행 규칙 유지, 배열을 객체와 같게"로 잠정 닫으며 소유자 확정을 기다린다." (`reviews/round-395-closing.md:8`)
  > 편집자 결정(395C-03): "【추론】 같은 배열 호스트의 inactiveValues 호스트 항목이 들어온 길(이탈 포착, 꺼진 쓰기, 로드)마다 다른 모양인 겹침은 base부터 있던 것으로 이 PR의 규칙과 무관하다(fairy08 P3-2). 394C-02의 수용 잔여(둘러싼 후보 자리가 깊이마다 겹치는 재귀 장면의 이탈 비용)는 이 PR에서 바꾸지 않았고, 읽기 조사 결과("한 이탈 판정 안에서 같은 도달 질문을 한 번만 푼다", 제품 100~160줄)는 작은 PR의 기준을 넘어 측정 묶음 후보로 둔다." (`reviews/round-395-closing.md:12`)
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
  > 편집자 결정(61C-01): "【추론】 삭제·대체는 열이다: `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` 삭제(`injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`, CONTROLS-079); `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` 삭제 → `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(쓰기 오류로 부류 이동, ERROR-195); `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 삭제 → `SCHEMA_FORM_WARNING.MISFIT`(소유자 확정, SURFACE-061); `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 삭제(소유자 판정으로 코드 행 제거); `NodeState` → `SchemaNodeState`, `NodeEventType` → `SchemaNodeEventType`(SURFACE-056, 옛 소비자 이주는 07); `valueTypeMismatch`·`valueTypeMismatches` → `misfit`·`misfits`(SURFACE-061); `latent` → `getInactiveValues(path)`(SURFACE-006); 옛 Form 속성 `onListenerError`와 `throwOnBudgetExceeded` 삭제(기록은 `onError`가 받고, 모든 환경에서 사슬 끝에 던진다). 원장에서 이 옛 이름을 가진 문장은 옛 글로 남고 이 보충이 이긴다." (`reviews/round-61-closing.md:10`)
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
- 보충:
  > 편집자 결정(444C-03): "【추론】 VALUE-034 의 배열 빈자리 채움(객체 `{}`·배열 `[]`·잎 `null`)도 ㄹ 의 닫힌 차이에 든다. 채운 `null` 은 데이터가 아니지만(38C-02) 저장·로드 왕복 뒤에는 VALIDATE-007 대로 실제 `null` 이 되어 nullable 아닌 잎에서 VALUE-033 대로 보존되고 misfit 경고가 켜진다. 이는 결함이 아니며 작성자 해법은 nullable 이거나 꼬리 빈자리면 `omitTrailing` 이다(소유자 위임 2026-10-23 ‘원장과 설계원칙에 비추어 닫을 수 있는 항목은 닫아라’, 독립 검증 CONFIRM)." (`reviews/round-444-closing.md:13`)
  > 편집자 결정(455C-04): "【추론】 B2-P1(가지 `perf/schema-form-b2-p1-inactive-memo`)의 후보 1(fa02e48cf, 창 10:34 UTC)은 공개 `setValue`의 no-op prune이 매 쓰기마다 전체 후퇴 표식을 세워 증분 경로가 한 번도 실행되지 않은 결함이 있었고(메모 단계 A 19.583→B 19.333 µs, oneOf-80 A 358.0/B 514.9/A′ 475.4 µs·폭 209.4, payload-12 A 898.9/B 778.0/A′ 955.2·폭 180.9, TEST-073 형제 100 −15.71 %), 호출 상한 시험이 다른 경로로 써져 이를 잡지 못했다. 가설의 측정이 아니라 후보의 결함이므로 "개선 없음"으로 폐기하지 않고 결함을 고친 후보 2(2501849c8, 창 11:24 UTC)를 새 창에서 쟀다(D3b-2와 같은 처리, 재측정 아님). 후보 2는 증분 경로가 쓰기당 1회 실행됐는데도 메모 단계가 17.750→24.042 µs로 늘었고(영향 호스트 목록 갱신 10.353 µs, 할당 22,695→24,691 B), oneOf-80 A 469.2/B 507.1/A′ 324.7·폭 233.7, payload-12 A 940.6/B 832.5/A′ 869.5·폭 274.1로 폭 밖 개선 없음, TEST-073 실패, 힙 Node 통과·Bun 2226.4 대 A 최대 2224.8이다. 결론: 공개 `inactiveValues`가 동결 배열이고 루트 목록이 잠복 전체 L개를 품으므로 "쓰기에서 즉시 유지"는 항목 하나가 바뀌어도 O(L) 복사를 피할 수 없다. 영향 호스트의 배열 복사를 정착당 한 번으로 허용한 편집자 결정(워커 물음에 대한 답)은 이 결론 안에서 옳았으나 가설을 살리지 못했다. 규칙대로 제품 코드와 DETAIL을 기준판으로 되돌리고 공개 계약 시험 다섯과 결과 문서(`verification/branch-switch/b2-p1-results.md`)만 남긴 PR #475를 독립 검토(1부·2부 PASS) 뒤 스쿼시 병합했다(4f2001dcd). 다음 가설은 B2-P1b다(455C-05)." (`reviews/round-455-closing.md:14`)
  > 편집자 결정(455C-05): "【추론】 B2-P1b(같은 워커, 가지 `perf/schema-form-b2-p1b-lazy-inactive`)는 쓰기에서 Δ가 닿은 호스트에 dirty 표식만 두고(O(|Δ|)), 첫 읽기 때 그 호스트의 동결 배열을 만들어 다음 변경까지 같은 참조를 돌려주며, 건드리지 않은 호스트는 identity를 유지한다. 워커가 둘을 올렸다. 첫째, `captureDetachedFieldNodeReads`가 구독자 유무와 무관하게 나가는 참조의 직전 커밋 `inactiveValues`를 정착 중 캡처하므로(finalizeExits·배열 재배치), 쓰기에서 배열을 만들지 않으려면 그 캡처도 지연이어야 한다 — 나가는 참조는 세대 토큰(호스트·메모 세대·journal 커서)을 들고 떼어진 참조의 첫 읽기 때 그 세대의 배열을 만들며, 이미 만들어진 세대 배열은 같은 참조를 재사용한다(NODE-044의 "옛 참조의 읽기는 마지막 커밋으로 고정" 유지). 읽기 비용은 호스트 범위 후보 K개의 정렬 O(K log K) + 미소비 Δ 적용으로 허용한다. 둘째, 읽지 않은 journal이 쓰기 수 N에 비례해 자라는 것은 누수이므로, 읽지 않은 journal의 크기가 상한(max(2·L, 512) 항목, 상수로 둠)을 넘으면 커밋 때 현재 세대를 압축한다(O(L)이지만 L번 이상의 쓰기마다 한 번이라 쓰기당 상각 O(1)); 외부가 든 떼어진 토큰은 자기 세대 사슬만 붙잡고 압축이 옛 토큰의 결과를 바꾸지 않아야 하며(시험), 영속 색인·HAMT 같은 추가 구조는 범위 밖이다. 비용 모델(쓰기 O(|Δ|)+상각 압축, 첫 읽기 O(K log K)+미소비 Δ, 토큰의 보유 상한)을 DETAIL에 적고, 측정 행에서 압축 횟수를 계수로 적어 3 µs 선 판정이 압축 포함 평균임을 밝힌다. 공개 겉면·기대값·배달 비교가 하나라도 바뀌면 멈추고 올린다." (`reviews/round-455-closing.md:16`)
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
  > 소유자(266라운드, 41 결정·스토리 요구): "2번에, 첫번째가 맞는거 같다. 일관된 규칙이 중요하고, 사용자는 form 만 보고 값을 믿어야 하니까 이렇게 표시와 실제가 다른건 매우 잘못된 것으로 보인다. \n\n나머지는 스토리를 어떻게 봐야하는지, 어떻게 테스트해야하는지 잘 모르겠어서 테스트를 충분히 못하겠다.\n그리고 ref 핸들을 통한 테스트도 아예 없어보이는군. \n\n스토리들에 적절한 구조화 데코레이터를 통해서 가독성과 사용성을 좀 올려달라. 사람도 보고 알 수 있어야지.\n그리고 ref 핸들러를 통한 스토리도 좀 추가해달라." (`reviews/round-266-owner-answers.md:13`)
  > 편집자 결정(272C-01): "【추론】 게이트는 원장 관리자가 직접 돌렸다: unit·render·react18 3950 통과, storybook 241, typecheck 0, lint 0, build·test:production 20, json-schema 392, 플러그인 일곱(130/135/334/2/15/15/5), documents build, G16 CONSUMER_BUNDLE_OK(prod 289,111 B, dev 292,408 B). verifier(opus): 2b132db02의 런타임 변경은 세 파일뿐(transitionSettlement.ts:90-92의 `context.kind !== 'load'` 제거, loadStaticFirstTree.ts의 동등 처리, hasWrongKindBranchAncestor.ts JSDoc), derive·injectTo 경로(가드 호출처 한 곳)·reset 셋('load' 종류) 확인, 공개 export 변화 0, 금지 경로 0 → pass with conditions(조건은 시험 실행이었고 충족). agy(session 9fb65fe5): 명세 en·ko 문단·예시, 시나리오 둘(VALUE-036 loaded null leaves children unfilled until input promotion; union.null-ancestor-input-promotion 로드 직후 kind undefined·승격 뒤 name만 default), nullable-branch-nodes.md가 결정과 일치, 옛 서술 잔존 0 → 차단 사유 없음. 대기열 45의 넓은 해석은 소유자가 좁히지 않아 그대로 병합했으며, 좁히는 답이 오면 후속 PR로 처리한다. 07c 브리프: 계획 1~8절 + 9절(verifier 대조) + 9.6절(helpers·components는 compartment), 이동 뒤 깨질 시험 둘(buildChildSelectionRuntime 경로 매퍼, dependencyDirection 재작성)과 해석기 사후 조건 포함." (`reviews/round-272-closing.md:9`)
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

### VALUE-038 비활성 값 메모의 유지 방식(455라운드) — 공개 `inactiveValues`가 동결 배열이고 루트 목록이 잠복 전체를 품으므로 쓰기에서 즉시 유지하는 증분 설계(B2-P1, 두 후보)는 O(L)을 피하지 못해 미채택·되돌림(계약 시험 다섯과 기록만 #475), 다음 가설 B2-P1b는 쓰기에서 Δ가 닿은 호스트의 dirty 표식과 journal만 두고 첫 읽기 때 materialize, 나가는 참조의 직전 커밋 캡처도 세대 토큰으로 지연(NODE-044 유지, 같은 세대 배열은 참조 재사용), 첫 읽기 O(K log K)+미소비 Δ, 읽지 않은 journal이 max(2·L, 512)를 넘으면 커밋 때 압축(쓰기당 상각 O(1)), 영속 색인·HAMT는 범위 밖

- 결정:
  > 【추론】 B2-P1b(같은 워커, 가지 `perf/schema-form-b2-p1b-lazy-inactive`)는 쓰기에서 Δ가 닿은 호스트에 dirty 표식만 두고(O(|Δ|)), 첫 읽기 때 그 호스트의 동결 배열을 만들어 다음 변경까지 같은 참조를 돌려주며, 건드리지 않은 호스트는 identity를 유지한다. 워커가 둘을 올렸다. 첫째, `captureDetachedFieldNodeReads`가 구독자 유무와 무관하게 나가는 참조의 직전 커밋 `inactiveValues`를 정착 중 캡처하므로(finalizeExits·배열 재배치), 쓰기에서 배열을 만들지 않으려면 그 캡처도 지연이어야 한다 — 나가는 참조는 세대 토큰(호스트·메모 세대·journal 커서)을 들고 떼어진 참조의 첫 읽기 때 그 세대의 배열을 만들며, 이미 만들어진 세대 배열은 같은 참조를 재사용한다(NODE-044의 "옛 참조의 읽기는 마지막 커밋으로 고정" 유지). 읽기 비용은 호스트 범위 후보 K개의 정렬 O(K log K) + 미소비 Δ 적용으로 허용한다. 둘째, 읽지 않은 journal이 쓰기 수 N에 비례해 자라는 것은 누수이므로, 읽지 않은 journal의 크기가 상한(max(2·L, 512) 항목, 상수로 둠)을 넘으면 커밋 때 현재 세대를 압축한다(O(L)이지만 L번 이상의 쓰기마다 한 번이라 쓰기당 상각 O(1)); 외부가 든 떼어진 토큰은 자기 세대 사슬만 붙잡고 압축이 옛 토큰의 결과를 바꾸지 않아야 하며(시험), 영속 색인·HAMT 같은 추가 구조는 범위 밖이다. 비용 모델(쓰기 O(|Δ|)+상각 압축, 첫 읽기 O(K log K)+미소비 Δ, 토큰의 보유 상한)을 DETAIL에 적고, 측정 행에서 압축 횟수를 계수로 적어 3 µs 선 판정이 압축 포함 평균임을 밝힌다. 공개 겉면·기대값·배달 비교가 하나라도 바뀌면 멈추고 올린다.
- 보충:
  > 편집자 결정(455C-04): "【추론】 B2-P1(가지 `perf/schema-form-b2-p1-inactive-memo`)의 후보 1(fa02e48cf, 창 10:34 UTC)은 공개 `setValue`의 no-op prune이 매 쓰기마다 전체 후퇴 표식을 세워 증분 경로가 한 번도 실행되지 않은 결함이 있었고(메모 단계 A 19.583→B 19.333 µs, oneOf-80 A 358.0/B 514.9/A′ 475.4 µs·폭 209.4, payload-12 A 898.9/B 778.0/A′ 955.2·폭 180.9, TEST-073 형제 100 −15.71 %), 호출 상한 시험이 다른 경로로 써져 이를 잡지 못했다. 가설의 측정이 아니라 후보의 결함이므로 "개선 없음"으로 폐기하지 않고 결함을 고친 후보 2(2501849c8, 창 11:24 UTC)를 새 창에서 쟀다(D3b-2와 같은 처리, 재측정 아님). 후보 2는 증분 경로가 쓰기당 1회 실행됐는데도 메모 단계가 17.750→24.042 µs로 늘었고(영향 호스트 목록 갱신 10.353 µs, 할당 22,695→24,691 B), oneOf-80 A 469.2/B 507.1/A′ 324.7·폭 233.7, payload-12 A 940.6/B 832.5/A′ 869.5·폭 274.1로 폭 밖 개선 없음, TEST-073 실패, 힙 Node 통과·Bun 2226.4 대 A 최대 2224.8이다. 결론: 공개 `inactiveValues`가 동결 배열이고 루트 목록이 잠복 전체 L개를 품으므로 "쓰기에서 즉시 유지"는 항목 하나가 바뀌어도 O(L) 복사를 피할 수 없다. 영향 호스트의 배열 복사를 정착당 한 번으로 허용한 편집자 결정(워커 물음에 대한 답)은 이 결론 안에서 옳았으나 가설을 살리지 못했다. 규칙대로 제품 코드와 DETAIL을 기준판으로 되돌리고 공개 계약 시험 다섯과 결과 문서(`verification/branch-switch/b2-p1-results.md`)만 남긴 PR #475를 독립 검토(1부·2부 PASS) 뒤 스쿼시 병합했다(4f2001dcd). 다음 가설은 B2-P1b다(455C-05)." (`reviews/round-455-closing.md:14`)
  > 편집자 결정(456C-03): "【추론】 B2-P1b(a04a40588, 가지 `perf/schema-form-b2-p1b-lazy-inactive`)는 build·unit 3,644·render/react18 760·production·verify 4,448·Storybook 251사례를 통과했고 그림자(commit 17,860회·읽기 327,929회) 위반 0, 배달 비교 차이 0, d.ts 동일이다. 독립 검토 1부는 범위·동치(라이브·무관 호스트·떼어진 참조 토큰·fallback·내부 소비처 전수)·journal 상한 max(2·L, 512)와 상각 압축·독립 오라클 그림자·red/green 모두 PASS다(`pr-b2-p1b-part1-antigravity.md`). 정식 측정은 #476의 교대 도구와 456C-01의 품질 기준으로 하며, 규칙은 브리프 그대로(메모 단계 ≤ 3 µs 압축 포함 평균, oneOf-80·payload-12 폭 밖 개선, TEST-073, 힙)." (`reviews/round-456-closing.md:12`)
  > 편집자 결정(457C-02): "【추론】 B2-P1b(1ff87c4b3, 창 14:15 UTC, 0.16.1 레인 품질 1.0007 유효)는 증분 경로가 실행됐는데도 메모 단계가 oneOf-80에서 22.83→26.14 µs(압축 6/300), payload-12에서 44.16→64.48 µs(27/300)로 늘었고 총합 두 행 모두 폭 밖 개선이 없었다(oneOf A 0.503/B 0.467/A′ 0.423 ms·폭 0.190, payload A 0.811/B 0.884/A′ 0.878·폭 0.331). TEST-073 주판정 회귀 0, Node 힙 통과(B 중앙 1443.22 ≤ A 최대 1890.78), Bun 2234.26→2232.35. 즉시 유지(B2-P1)도 지연(B2-P1b)도 전체 재구성(약 19~23 µs)보다 비쌌으므로, 비활성 값 메모는 "나간 노드의 상태를 노드 밖으로 옮긴다"는 지금 구조에서는 더 손대지 않고 설계 Ⅱ(슬롯에서 읽음)의 몫으로 넘긴다. 제품 코드와 DETAIL은 되돌리고 공개 계약 시험 둘(읽기·수명)과 결과 문서, 교대 장치의 `--only` payload-12 확장만 #477로 남겨 짧은 검토 PASS 뒤 병합했다(8d9d885bf)." (`reviews/round-457-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-455-closing.md:16`(정본), `reviews/round-455-closing.md:14`, `verification/branch-switch/b2-p1-results.md`
- 닫은 사람: 편집자 결정(455라운드, `reviews/round-455-closing.md` 455C-04·05)
- 라운드: 455
- 까닭: `reviews/round-455-closing.md:14`
