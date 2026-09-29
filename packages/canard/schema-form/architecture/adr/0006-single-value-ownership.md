# ADR 0006 — 값의 소유: 노드 트리가 곧 상태다

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| NODE-020 | 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`) | 10 |
| VALUE-001 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) | 1 |
| VALUE-002 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3, 상태가 둘뿐인 것은 그 귀결 `adr/0006-single-value-ownership.md:3`), 원리(`03-mental-model.md:55-72` §2, 칸 목록 `adr/0006-single-value-ownership.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40·18C-59), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40; 경고등은 계산 칸) | 18 |
| VALUE-003 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| VALUE-004 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) | 1 |
| VALUE-005 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) | 1 |
| VALUE-006 | 원리(`03-mental-model.md:72` P4), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2, 보충의 하위 트리 문장), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) | 17 |
| VALUE-008 | 소유자 답(`reviews/round-9-spec.md:22` 축4), 원리(`03-mental-model.md:92` P4) | 9 |
| VALUE-009 | 원리(`adr/0006-single-value-ownership.md:3` emit 불변식은 원리에서 도출, `03-mental-model.md:16` P4) | 5 |
| VALUE-010 | 편집자 결정(8라운드 D-32, `06-conclusions.md:201-207`), 편집자 결정(9라운드 그대로, `07-conclusions.md:99`) | 9 |
| VALUE-012 | 편집자 결정(4차 본문, 3·4·5라운드 반영 F9, `adr/0006-single-value-ownership.md:10`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) | 18 |
| VALUE-013 | 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문, 3·4·5라운드 반영, `adr/0006-single-value-ownership.md:10`) | 5 |
| VALUE-014 | 편집자 결정(1라운드 반영, `reviews/round-1.md:176` 반영 칸), 편집자 결정(4차 본문 E13, `adr/0006-single-value-ownership.md:10`, 역색인 행) | 5 |
| VALUE-016 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가) | 1 |
| VALUE-017 | 원리(`03-mental-model.md:59` P1·P4) | 14 |
| VALUE-023 | 소유자 답(`reviews/round-1.md:176` §5의 전환을 받는가), 편집자 결정(1차안 대체, 적대적 검토 R12, `adr/0006-single-value-ownership.md:12`) | 1 |
| VALUE-025 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) | 13 |
| VALUE-027 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8) | 18 |
| VALUE-028 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`) | 9 |
| VALUE-029 | 소유자 답(`reviews/round-18-owner-answers.md:22` 12-8 셋째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81; 반환 모양) | 18 |
| VALUE-035 | 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 원리(`03-mental-model.md:90` 로드는 새 수명) | 9 |
| VALUE-036 | 원리(`reviews/round-5-derivations.md:40` D-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) | 18 |
| WRITE-092 | 원리(D-1 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) | 18 |

## 결정

### 02-node-and-value.md §1.8 탐색과 형상을 떠난 노드

【추론】 형상에 없는 노드는 트리에 인스턴스가 없다(NODE-043). 【추론】 그 원본은 루트가 잠복 원본으로 (절대 경로, 종류)를 키로 든다(NODE-043). 【추론】 형상을 떠난 노드의 옛 참조는 NODE-044가 정한다(NODE-043). 【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다(NODE-043). 【추론】 자식 선언의 신원 (이름, 종류)은 청사진이 선언을 무리 지을 때와 `settle`이 어느 종류의 노드를 살릴지 정할 때 쓴다(NODE-043). 【추론】 한 커밋에서 한 이름에 형상에 있는 노드는 많아야 하나이므로(같은 이름·다른 종류가 동시에 켜지면 충돌이고, 전순서에서 앞선 종류만 산다) 맵의 키는 이름으로 충분하다(NODE-043).

【추론】 `find`·`findNodes`·트리 걷기는 형상에 있는 노드만 돌려준다(NODE-043). 【추론】 형상에 없는 노드를 지나는 경로는 `find`가 `null`, `findNodes`는 항목 없음이다(NODE-043). 【추론】 터미널 아래 경로와 같은 규칙이다(NODE-043). 【추론】 비활성 자식까지 담는 `subnodes`는 레코드에도 공개 겉면에도 두지 않는다(NODE-043). 【추론】 `detectsCandidate`와 그 시험, 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 모두 폐기한다(NODE-043).

【추론】 `find`는 경로의 마디마다 현재 노드의 자식 집합을 이름으로 따라간다(NODE-054). 【추론】 노드 종류마다 특수 경로를 두지 않는다(NODE-054). 【추론】 참조 그룹(가상 노드)의 자식 집합은 참조된 형제 노드다(NODE-054). 【추론】 그래서 `find('/period/startDate')`는 `/startDate` 노드 그 자체를 돌려준다(NODE-054). 【추론】 돌려준 노드의 `path`는 `/startDate`다(NODE-054). 【추론】 그 노드에 한 쓰기는 가상 노드가 나눠 쓰는 것과 같은 곳에 닿는다(NODE-054). 【추론】 한 노드에 두 경로로 닿는 것은 참조 그룹을 거칠 때뿐이다(NODE-054). 【추론】 정본 경로는 `node.path`다(문서화)(NODE-054).

【추론】 터미널 노드는 자식 집합이 없으므로, 같은 규칙으로 노드 없음이다(NODE-020과 일치)(NODE-054). 【추론】 가상 노드는 늘 `branch`이므로(NODE-047) 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로도 참조된 노드를 돌려준다(NODE-054). 【추론】 `options.terminal: true`를 둔 가상 노드는 청사진 오류이므로(NODE-047) 터미널 가상 노드는 없다(NODE-054). 【추론】 인라인 입력 없는 가상 노드 아래의 `find`는 오늘과 같아 이주 행이 없다(NODE-054).

터미널 노드 아래의 경로는 `find`와 `findNodes` 모두 노드 없음으로 답한다(NODE-020). 노드가 없으므로 `null`을 돌려준다(NODE-020). 반환 타입 `SchemaNode | null`은 그대로다(NODE-020). **행동 변화이므로 이주 안내 대상이다**(NODE-020).

【추론】 형상을 떠난 노드는 떼어진다(detached)(NODE-044). 【추론】 트리는 그 노드를 버리고, 루트는 그 원본을 잠복 원본으로 (절대 경로, 종류)를 키로 든다(NODE-044). 【추론】 소비자가 든 옛 참조는 읽을 수 있다(NODE-044). 【추론】 떼어진 노드의 읽기 멤버는 모두 그 노드가 형상에 있던 마지막 커밋의 값을 돌려주고, 그 뒤로 바뀌지 않는다(NODE-044). 【추론】 옛 참조로 한 쓰기도 이 읽기를 바꾸지 않는다(쓴 값은 루트의 잠복 원본에 있다)(NODE-044).

【추론】 구조 읽기(`children`, 상대 경로의 `find`·`findNodes`)는 그 노드와 함께 떼어진 하위 트리를 본다(NODE-044). 【추론】 예외로 `rootNode`는 살아 있는 루트이고, 트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(NODE-044, SURFACE-053). 【추론】 그래서 절대 경로는 살아 있는 트리에서 풀린다(NODE-044).

【추론】 있던 구독은 유효하다(구독 해제가 된다)(NODE-044). 【추론】 다시 발화하지는 않는다(NODE-044). 【추론】 명령(`focus`·`select`·`refresh`·`remount`)과 상태 진입(`setSubtreeState`·`clearSubtreeState`)은 아무것도 하지 않는다(NODE-044).

【추론】 옛 참조로 한 쓰기는 오류가 아니다(NODE-044). 【추론】 그 쓰기는 루트의 그 (경로, 종류) 잠복 원본을 고치고, 규칙을 평가하지 않으며, 아무것도 내지 않는다(NODE-044). 【추론】 그래서 순차 쓰기와 묶음 쓰기가 같은 원본에 닿는다(NODE-044). 【추론】 노드가 다시 형상에 들면 새 인스턴스를 만든다("재탄생은 새 삶", WRITE-007)(NODE-044). 【추론】 옛 참조는 떼어진 채로 남는다(NODE-044). 【추론】 `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE`(가칭)는 재생성 `reset`이 버린 트리의 노드에 대한 쓰기에만 남긴다(NODE-044).

### 02-node-and-value.md §2.1 노드 트리가 곧 상태, 노드가 드는 칸

**1. 별도의 데이터 모델을 두지 않는다(VALUE-001). 노드 트리가 곧 상태다(VALUE-001).**

소유자 답: "중앙에 값을 두는 걸 허용. 단, 데이터모델을 따로 두는 건 안 돼. react 파이버처럼 node가 동작하도록 했으면 해. 최적화와 라이프사이클 관점에서의 단일화는 동의해."(VALUE-001)

**2. 노드가 드는 칸은 열하나이고, 그 가운데 상태는 둘뿐이다(VALUE-002, WRITE-054).**

(VALUE-002, VALUE-003, VALUE-030, VALUE-037, WRITE-054, SURFACE-061)

| 칸 | 종류 | 내용 |
| -- | ---- | ---- |
| `raw` | 상태 | 원본. 리프와 터미널 노드가 값을 든다. 자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다 |
| `extras` | 상태 | 호스트가 받은, 어떤 조각에도 선언되지 않은 키와 값, 그리고 그 순서(E16). 순서는 받은 순서이며 ECMAScript own-key 순서를 따른다 |
| `active` | 계산 | 이번 커밋의 활성 조각·노드 집합 |
| `local` | 계산 | 활성 자식 `emit`의 합성 — 투영 전 |
| `emit` | 계산 | `local`의 투영 |
| `schema` | 계산(메모) | 노드의 유효 스키마 — 켜진 조각을 병합한 것 |
| 재계산 목록 | 작업 | 이번 정착에서 다시 계산할 자식의 목록. 상호작용 상태 `dirty`와 다른 것이다 |
| `revision` | 원장 | 통지 원장. 커밋 때 일괄 갱신한다(F16) |
| 커밋 번호 | 원장 | 검증 결과의 스탬프. 오래된 결과를 버린다(F28) |
| `diagnostics` | 작업 | 마지막 로드 이후의 작업 기록(ERROR-130. 지속은 14라운드 답 O-2 가). `status`는 `'stable'` 또는 `'degraded'`이고 `cause`를 든다. `degraded` 동안 폼의 제출 경로가 거부한다(17라운드 소유자 답 R17-1 나). 루트에서 관측한다 |
| 경고등(`typeMismatch`) | 계산 | 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수, 공개 형의 판별자 |

**상태는 `raw`와 `extras` 둘뿐이다**(원리 P3(형상은 상태의 순수 함수다), VALUE-002). 나머지는 상태에서 계산되거나 작업의 기록이다(VALUE-002). "노드 트리가 곧 상태"는 이 둘을 노드가 소유한다는 뜻이다(VALUE-002). 폼은 `oneOf`·`anyOf`로 분기를 고르지 않으므로(원리 P1′(폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐)) 수동 분기 선택을 담을 칸이 없다(VALUE-002).

`extras`는 호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서다(VALUE-002). `if` 안에만 적힌 키는 선언이 아니므로 `extras`다(VALUE-002). `extras`는 호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서다(정적. if 안에만 적힌 키도 여기, VALUE-002). 조각이 선언한 키는 그 조각이 모두 꺼지면 잠복 원본이며 게이트도 검증기도 보지 않는다(원리 P1(판정은 검증기의 것이다)·원리 P4(방출은 정책이다), 14라운드, VALUE-002). `schema`는 같은 조각 집합이면 같은 참조다(VALUE-002). 【추론】 경고등은 VALUE-002의 분류로 '계산' 칸이다(VALUE-002). 【추론】 배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다(VALUE-002). 【추론】 자리 순서로 들고, 선언된 아이템 뒤에 방출한다(VALUE-002).

`diagnostics`는 마지막 로드 이후의 기록('stable' 또는 'degraded', cause(예산·식·대상·공유 충돌), exceededBudget, iterations, commit)이고, 다음 로드까지 남고 그 동안 제출 경로가 거부하며, 작업의 기록으로 루트에서 관측한다(VALUE-003, ERROR-130). 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(VALUE-003, ERROR-204). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(VALUE-003, ERROR-204).

**상호작용 상태** `dirty`·`touched`는 현행 유지다(목표 후보 C6(편집 중 상태의 보존과 격리), VALUE-022, GOAL-019).

**3. 저장되는 값은 자식 노드가 없는 노드에만 있다** — 터미널 타입(string·number·boolean·null)과 터미널 전략의 object·array. 자식 노드가 있는 노드의 값은 자식들로부터 계산되어 **그 노드에 메모된다**(VALUE-004). 자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다(VALUE-004).

**4. 노출 표면은 전략과 무관하게 같다(VALUE-005).** `value`, `setValue`, 구독, 이벤트는 자식 노드의 유무에 따라 달라지지 않는다(VALUE-005). 경로 조회도 같다(VALUE-005).

그 결과 레벨마다의 사본, `__draft__`/`__composed__`의 지연 합성, 상향 콜백 그래프, 역류 방지 잠금이 필요 없어진다(VALUE-016).

버린 대안은 다음 셋이며, 어느 것도 택하지 않는다(VALUE-023).

- **1차안 — 루트가 소유하는 JSON 값 트리, 노드는 뷰.**(VALUE-023) 적대적 검토 R12로 기각(VALUE-023).
- **루트가 소유하는 셀 테이블 + 필요할 때 만드는 손잡이 노드.**(VALUE-023) 소유자가 별도의 데이터 모델을 거부했다(VALUE-023). 큰 배열에서 노드 생성을 늦추는 최적화는 이 결정 안에서도 가능하다 — 자식 노드가 실체화되기 전까지 array 노드가 터미널처럼 값을 직접 든다(VALUE-023). 필요 여부는 벤치마크로 정한다(NODE-053, VALUE-023).
- **노드별 소유를 유지하고 사본 동기화를 고친다.**(VALUE-023) 복잡함의 원인이 남는다(VALUE-023).

### 02-node-and-value.md §2.2 방출과 값 읽기

**7. 불변식은 `emit`에만 있다**(E9): 부모의 `emit` = 활성 자식 `emit`의 투영. `raw`에는 그런 불변식이 없다 — 형상에 없는 노드와 비객체 호스트 아래 자식의 원본은 부모의 `emit`에 나타나지 않는다(VALUE-009).

**8. 값 읽기는 셋이다**(S9, SURFACE-050, VALUE-027).

(VALUE-027, VALUE-029)

| 칸 | 공개 이름 | 뜻 |
| -- | --------- | -- |
| `local` | `node.value` | 합성 값. 투영 전 |
| `emit` | `node.outputValue` | 방출 값. 오늘의 `normalizedValue`의 이름 변경. `FormHandle.getValue()`는 루트의 `outputValue`와 같다 |
| 형상에 없는 노드의 `raw` | `node.inactiveValues` | 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다 |

원본 칸 `raw`에는 공개 이름이 없다(VALUE-027). `enhancedValue`는 새 모델에 자리가 없어 사라진다(VALUE-027). 노드에 `getValue()` 메서드는 따로 두지 않는다(`node.value`와 뜻이 다르면 이름만 보고 속는다, VALUE-027).

`value`(local)는 **활성** 자식의 방출 값만 합성한 것이라 꺼진 분기의 값은 `value`에도 없다(VALUE-027). 꺼진 분기의 노드는 형상에 없어 그 입력 구성 요소는 그려지지 않으며, 그 원본은 잠복 원본으로만 남고, 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(VALUE-027, VALUE-029). `value`와 `outputValue`의 차이는 투영뿐이다(VALUE-027). 투영은 `omitEmpty`·`omitTrailing`처럼 원본을 건드리지 않고 방출에서 빈 값·꼬리 값을 빼는 규칙이다(VALUE-027, VALUE-008, VALUE-009). 꺼진 분기와 게이트가 거짓인 노드는 투영이 아니라 형상에서 빠지는 것이라 `value`에도 없다(VALUE-027). 그래서 입력 구성 요소가 받는 `value`는 활성 분기와 무관하게 보이지 않는다(VALUE-027).

**9. `emit`의 참조**는 (자식 `emit` 참조 ∪ `extras` ∪ 호스트 `raw` ∪ 활성 키 집합) 가운데 하나라도 바뀌면 새로 만들고, 아니면 이전 참조를 그대로 둔다(F9, VALUE-012). "같은 값을 두 번 읽으면 같은 참조"가 이것으로 성립한다(VALUE-012). 【추론】 (나) 커밋 단계에서, 이번 정착에 쓰인 잎의 `raw`·`extras`가 직전 커밋의 것과 (가)로 같으면 직전 참조를 둔다(VALUE-012, VALUE-021). 【추론】 쓰기 경계에서 지금 값과 같으면 쓰지 않는 것은 오늘과 같다(VALUE-012). 【추론】 호스트의 `emit`은 VALUE-012대로 만든다(VALUE-012). 【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만, VALUE-012).

`injectTo`의 에지와 `onChange`의 "같은 값이면 통지 없음"은 한 장치이고(목표 G4(하나의 개념에는 하나의 장치)), 참조 비교가 아니라 값 비교다(VALUE-021). 【추론】 (가) "값이 바뀌었다"는 하나의 판정(가칭 `sameValue`, 내부)으로 본다(VALUE-021).

"노드의 메모는 루트 스냅숏의 해당 부분과 같은 참조"는 `omitEmpty`·`omitTrailing`이 투영을 바꾸는 노드에서 거짓이므로, 구조 공유는 `emit` 사이에서만 말한다(VALUE-028).

**10. 읽기는 계산하지 않는다(VALUE-013).** 메모를 쓰는 곳은 작업 루프의 커밋 단계뿐이고(SETTLE-006), 무효화 수단은 조상 방향의 재계산 목록 등록 하나다(VALUE-013).

`extras`는 받은 순서대로 방출된다(P4, 목표 G8(보편적인 관행을 따른다), VALUE-010). 받은 순서이며, 전체 교체는 V의 키 순서를 따르고, `Merge`는 있는 키를 제자리에 두고 새 키를 뒤에 붙인다(VALUE-010). 정수 모양 키(`"2"`, `"10"`)는 ECMAScript가 어떤 순서 규칙에서든 앞에 오름차순으로 놓는다(VALUE-010).

(VALUE-014)

| 동작 | 비용 |
| ---- | ---- |
| `node.value` 등 모든 읽기 | 필드 접근. 계산 없음 |
| 쓰기 1회 | 경로의 각 레벨에서 얕은 복사 한 번. 실측: 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs (TEST-036). 형제 서브트리는 참조를 재사용한다 |
| 재계산 목록에 없는 서브트리 | 통째로 건너뛴다 |
| 쓰기 N회의 배치 | 표시 N번, 작업 루프 1번 |
| 가드와 `controls`의 식 | **변경 키 역색인은 쓰지 않는다**(E13) — 출발점 고정에서 무효다. 유효한 최적화는 (a) 무조건 루트 키만 읽는 가드의 건너뛰기, (b) 조각 끄기의 키 제거를 `delete` 없이 하는 것, (c) 조각이 선언한 키만 패치하는 합성(F13) |

【추론】 객체 호스트의 `local`은 늘 객체다: 방출이 있는 활성 자식의 합성이고, 그런 자식이 없으면 `{}`다(FRAGMENT-016의 "자기 `{}`"와 같다, VALUE-034). 【추론】 배열 호스트의 `local`은 아이템 방출의 배열이고, 아이템이 없으면 `[]`다(VALUE-034). 【추론】 `omitEmpty`(기본 켜짐)의 투영은 빈 `local` — `''`, 키가 없는 `{}`, 아이템이 없는 `[]` — 을 방출하지 않으며, 부모의 합성은 방출이 없는 자식의 키를 두지 않는다(VALUE-034). 【추론】 `omitEmpty`를 끈 호스트는 `{}`·`[]`를 방출한다(VALUE-034). 【추론】 루트는 방출이 없을 때 루트 종류의 빈 그릇을 `outputValue`로 준다: 객체 루트는 `{}`, 배열 루트는 `[]`, 그 밖의 루트는 `undefined`다(VALUE-034). 【추론】 그래서 빈 폼의 `FormHandle.getValue()`와 마지막 칸을 비운 뒤 루트 `onChange`가 받는 값은 오늘처럼 `{}`다(VALUE-034). 【추론】 배열 아이템은 자리가 색인이므로 빠지지 않는다: 방출이 없는 객체 아이템은 `{}`, 배열 아이템은 `[]`, 잎 아이템은 `null`로 그 자리를 채운다(VALIDATE-007: 방출은 JSON 왕복과 같고 배열 중간의 `undefined`는 없다, VALUE-034). 【추론】 `omitTrailing`은 배열 꼬리에서 이렇게 채운 자리를 자른다(VALUE-034). 【추론】 이 투영은 원본과 상태를 바꾸지 않는다(P3, P4, VALUE-034).

- PR: PR-2(객체 호스트)·PR-5(배열)(VALUE-034).
- 무엇: 위 오늘 스위트의 단언과 `items.default` 없는 `push()`를 새 구현으로 돌린다(VALUE-034).
- 통과: 이 블록의 규칙대로 나오고, 오늘과 다른 곳은 LANDING-171과 이주 행이 모두 적고 있다(VALUE-034).
- 실패: 오늘과 다른데 이주 행이 없으면 행을 더하고, 규칙의 결함이면 이 블록을 고친다(VALUE-034).

### 02-node-and-value.md §2.3 형상과 잠복 원본

**5. 노드는 형상에 있거나 없다(VALUE-006).**

- 노드가 **형상에 있다**는 것은 그 노드를 선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아니라는 뜻이다(VALUE-006). 노드 게이트와 조각 게이트는 한 장치의 두 범위다(VALUE-006, CONTROLS-021).
- 형상에 없는 노드의 원본은 기본으로 남는다(VALUE-006). 방출에서 빠지며, 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(VALUE-006, VALUE-029). 작성자나 호출자(Form 속성)가 나감 정책이 참으로 정해진 노드는 나갈 때 한 번 비운다(VALUE-006). 나감은 직전 커밋의 형상에 있었고 이번 최종 형상에 없는 것이며, 하위 트리를 포함하고 공유 노드는 제외한다(VALUE-006). 로드에는 나감이 없다(13라운드 답 2, VALUE-006, WRITE-037).

작성자나 호출자(Form 속성)가 나감 정책(`unsetOnInactive`, 소유자 13라운드 확정)이 참으로 정해진 노드가 나갈 때 한 번 원본을 비운다(VALUE-006). 형상에 없는 노드의 규칙(`controls.derived` 등)은 평가하지 않는다(VALUE-006). 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, VALUE-006, WRITE-033).

노드가 **생긴다**는 것은 그 노드가 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있다는 뜻이다(VALUE-035). 채움(`controls.default` > `default`)은 이 사건에만 일어난다(VALUE-035, SETTLE-005, WRITE-090). 본체나 다른 켜진 조각이 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않는다(VALUE-035). `controls.visible`의 전환은 생성이 아니다(VALUE-035).

**6. 형상에서 빠지는 것은 쓰기가 아니다(VALUE-008). `null`을 포함한 전체 교체는 V에 없는 원본을 지운다(VALUE-008).** 조각이 꺼지거나 노드 게이트가 거짓이 되는 것은 **쓰기가 아니라 방출에서의 제외**이며(P4. 나감의 비움은 형상 변화가 아니라 작성자가 켠 정책의 자동 쓰기다), `omitEmpty`·`omitTrailing`도 원본을 건드리지 않는 투영 규칙이다(VALUE-008).

형상에 없는 노드의 원본은 방출되지 않으므로 검증기가 기각하지 않고 잔여 목록에도 없다 — 설계상 잠복이다(P4, VALUE-017).

- 기본 정책에서 분기 필드의 복원, `controls.active` 재활성화, null 계약이 "원본은 남고 방출에서만 빠진다" 하나로 설명된다(VALUE-025). 나가는 노드를 reset하고 들어오는 노드에 값을 복원하며 타입 호환을 검사하는 절차가 없어진다(R8, 제약 T-23(분기 복원은 자식의 원본 배열 상태를 합성 값보다 우선한다), VALUE-025, GOAL-074).
- 기본 정책에서는 입력 도중 조각이나 노드 게이트가 잠깐 꺼져도 데이터가 지워지지 않고, 다시 켜지면 마지막 입력이 돌아온다(그 노드에 `controls.derived`·`controls.unsetValue`가 없을 때. 있으면 재탄생 에지로 발화한다, VALUE-025). 나감 정책이 참으로 정해진 노드는 나갈 때 비워지므로, 다시 켜지면 생긴 노드로서 채움(`controls.default` > `default`)을 받는다(VALUE-025).

잠복 원본 열거는 **루트 노드의 함수**다(루트가 형상에 없는 노드의 원본을 들고 있으므로 저장 자리와 같다, VALUE-029). 모든 노드는 getter `node.inactiveValues`를 두고, 자기 경로로 루트의 함수를 불러 그 아래의 잠복 원본을 돌려준다(VALUE-029). `FormHandle`에는 더하지 않는다(VALUE-029). 【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다(VALUE-029, WRITE-087).

【추론】 ㄱ core가 스스로 잠복 원본을 파기하는 시점은 더하지 않는다(VALUE-031). `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(VALUE-031, WRITE-094). 잠복 원본이 지워지는 길은 나감 정책, 로드(마운트·`FormHandle.reset()`·`resetSubtree()`), V가 그 경로를 담지 않은 전체 교체 쓰기다(VALUE-031, WRITE-090, WRITE-094). 【추론】 로드와 전체 교체 쓰기에서는 V에 없는 원본이 없음이 되므로, 잠복 원본도 V의 값으로 바뀌거나 지워진다(VALUE-031, WRITE-090, WRITE-094). 【추론】 이 밖에는 ㅁ의 쓰기가 그 경로에 없음을 쓸 때뿐이다(VALUE-031). 【추론】 형상에 없는 노드의 규칙은 평가하지 않으므로 `controls.unsetValue`는 잠복 원본을 지우지 못한다(VALUE-031).

【추론】 제출 후 파기는 두지 않는다(VALUE-031). 【추론】 core는 제출을 모르고, 파기는 폼이 스스로 값을 지우는 일이 되기 때문이다(VALUE-031). 【추론】 민감한 값을 남기지 않는 기본 권고는 나감 정책 `unsetOnInactive`를 켜는 것이다(VALUE-031). 【추론】 호출자가 한 번에 비우려면 `setValue(form.getValue(), SetValueOption.DisableAutomaticWrites)`를 쓴다(VALUE-031). 【추론】 이때 투영으로 빠진 값도 없음이 된다(VALUE-031). 【추론】 열거는 루트 노드의 함수와 getter `node.inactiveValues`다(VALUE-029, VALUE-031).

ㄹ 손대지 않고 저장한 방출 값은 로드 값과 다를 수 있다(VALUE-031). 그 차이는 다섯으로 닫힌다(VALUE-031).

- (a) 형상에 없는 노드의 값(잠복으로 남고 `inactiveValues`로 열거된다, VALUE-031)
- (b) 작성자가 켠 투영(`omitEmpty`·`omitTrailing`, VALUE-031)
- (c) S1의 형 정규화(VALUE-031)
- (d) 로드의 자동 쓰기(없음인 키의 채움, 로드 때 발화하는 `injectTo`·`derived`, 로드된 값으로 평가한 `unsetValue`, VALUE-031)
- (e) 키 순서(미선언 키는 `extras`로 보존되지만 선언 키 뒤에 온다, Q14, VALUE-031)

따로 알리는 경고는 두지 않는다(VALUE-031).

【추론】 ㅁ 비활성 경로에 닿는 쓰기는 거부도 오류도 아니다(VALUE-031). 【추론】 그 쓰기는 루트가 드는 그 경로의 잠복 원본에 반영된다(VALUE-031). 【추론】 노드는 만들지 않고, 규칙도 평가하지 않으며, 방출되지 않는다(VALUE-031). 【추론】 이런 쓰기가 닿는 길은 넷이다: 조상의 `Merge`·전체 교체 쓰기·로드가 그 경로를 담을 때(WRITE-018의 분배), 형상에 없는 대상을 가리킨 `controls.injectTo`(CONTROLS-053), `batch`에서 표시할 때는 형상에 있었으나 정착 뒤 떠난 노드에 표시된 쓰기, 형상을 떠나기 전에 얻은 노드 참조로 한 쓰기(VALUE-031, WRITE-090, WRITE-094). `setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, V가 그 경로를 담으면 이 쓰기도 WRITE-018의 분배로 그 경로의 잠복 원본에 닿는다(VALUE-031, WRITE-090, WRITE-094). 【추론】 형상을 떠난 노드와 그 옛 참조의 읽기·쓰기·재진입은 NODE-044가 정하며, 그래서 순차 쓰기와 배치 쓰기가 같은 원본에 닿는다(VALUE-031).

### 02-node-and-value.md §2.4 null 계약과 정합 상태(경고등)

`setValue(null)`은 키가 없는 전체 교체이므로 자식 원본이 없음이 된다(VALUE-036). 원본 칸 하나로 족하며 셋째 칸도 특수 장치도 없다 — 2라운드 S7(#338 S4와 "null 아래도 원본 유지"의 충돌)은 이렇게 닫힌다(VALUE-036). 3라운드 E9의 "비객체 V는 자식 raw를 건드리지 않는다"와 E18("비객체 호스트의 자식은 비활성")은 **삭제**한다: 비객체 호스트의 자식은 **존재하고 렌더되며** 빈 상태를 보인다(VALUE-036). 실수로 누른 null의 되돌리기는 입력 컴포넌트의 몫이다(VALUE-036). 【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092, VALUE-036). 【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다(VALUE-036). 【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다(VALUE-036).

【추론】 null 계약은 작업 루프의 단계가 아니라 쓰기 종류로 표현한다(VALUE-032). 【추론】 쓰기 종류는 쓰기마다 진입에서 정해진다(VALUE-032). 【추론】 종류는 입력, 호출자(부분 쓰기·배열 연산), 로드, 자동 쓰기다(VALUE-032). 【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다(VALUE-032). 【추론】 표시 단계가 재계산 목록과 함께 그 종류를 기록한다(VALUE-032). 【추론】 같은 기록이 두 곳에 쓰인다: WRITE-013의 판정과 `UpdateValue`의 출처 칸(EVENT-060, VALUE-032). 【추론】 비객체 호스트의 원본을 비우는 것은 입력·호출자의 부분 쓰기뿐이고, 그 자식의 투영된 방출이 생길 때만 비운다(VALUE-032). 【추론】 판정이 값의 변화가 아니라 종류를 보므로, 같은 값을 다시 쓴 의도된 쓰기(S6)도 객체를 만든다(VALUE-032). 【추론】 단계만으로는 모자라다(VALUE-032). 【추론】 자동 쓰기인 `trim`은 정착 단계가 아니라 입력 마침 신호로 들어오기 때문이다(WRITE-078, VALUE-032).

【추론】 `controls.injectTo`는 원인과 무관하게 언제나 자동 쓰기이며 조상의 원본을 바꾸지 않는다(VALUE-032). 【추론】 오늘의 S2 규칙은 옮기지 않는다(VALUE-032). 【추론】 그 규칙은 `injectTo`가 원인 쓰기의 출처를 물려받게 해서, 사용자가 일으킨 `injectTo`면 null 조상을 객체로 만든다(VALUE-032). 【추론】 사용자에게 보이는 변화: 사용자가 일으킨 `injectTo`의 값이 null 조상 아래에 그려지지만 방출되지 않는다(VALUE-032). 【추론】 소유자가 뒤집기를 원하면, 12-5의 출처 칸 덕분에 원인의 출처를 물려주는 구현 비용은 작다(VALUE-032, EVENT-060). 【추론】 이 동작 변화는 소유자 통보 목록에 올린다(VALUE-032).

【추론】 (1) 경고등은 VALUE-002의 분류로 '계산' 칸이다(VALUE-030). 【추론】 경고등은 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수이므로 '상태는 `raw`와 `extras` 둘뿐'(P3)을 지킨다(VALUE-030, VALUE-037). 【추론】 소유자가 말한 '상태'는 사용자에게 보이는 뜻이다(VALUE-030). 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-030, VALUE-037). 【추론】 켜지는 값은 자기 형이 아니고, 없음도 아니고, nullable 노드의 `null`도 아닌 값이다(VALUE-030). 【추론】 수 노드의 `NaN`·`±Infinity`, 정수 노드의 정수 아닌 수, 잘못된 종류를 든 가지 노드도 켜진다(VALUE-030). 【추론】 가상 노드는 켜지지 않는다(ERROR-195에서 거부한다, VALUE-030).

【추론】 루트 노드가 켜진 노드의 경로 집합을 든다(VALUE-030). 【추론】 쓰기 때 더하고 빼며, 로드마다 다시 만든다(VALUE-030). 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다(VALUE-030). 소유자 답(설계서 메모 4)으로 이름은 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(VALUE-030, VALUE-037). 【추론】 모든 노드는 getter `typeMismatches: readonly string[]`로 자기 경로 아래의 켜진 경로를 돌려준다(VALUE-030, SURFACE-061). 【추론】 루트에서 읽으면 트리 전체다(VALUE-030). 【추론】 커밋 번호로 메모해 같은 커밋에서는 같은 참조를 돌려준다(VALUE-030). 【추론】 형상에 없는 노드는 넣지 않는다(VALUE-030). 【추론】 새 이벤트는 없다(VALUE-030). 값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다(VALUE-030, VALUE-037). 【추론】 `FormHandle`에는 더하지 않는다(VALUE-030).

【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다(VALUE-033). 【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다(VALUE-033). 【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다(VALUE-033). 【추론】 해법은 스키마에 nullable을 적는 것이다(VALUE-033). 【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다(VALUE-033).

【추론】 `typeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다(VALUE-037, SURFACE-061). 【추론】 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-037). 【추론】 경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜진다(ERROR-186, VALUE-037). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`는 경고등이 켜질 때마다 한 번 보내고, 켜진 채 다른 어긋난 값이 와도 다시 보내지 않는다(VALUE-037, SURFACE-061). 【추론】 경고등이 꺼졌다 켜지거나, 노드가 형상을 나갔다 들어오거나, 로드로 경로 집합을 다시 만들거나, 게이트가 좁혀 켜지면 다시 보낸다(VALUE-037). 【추론】 쓰기 없이 경고등만 바뀐 노드를 배달하는 통지는 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)다(SETTLE-007, EVENT-045, VALUE-037).

【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, VALUE-037, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(VALUE-037). 【추론】 `received`는 `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'` 가운데 하나다(VALUE-037). 【추론】 `reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`이고, `candidates`는 `'ambiguous'`일 때만 `['string','boolean']`으로 싣는다(VALUE-037). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(VALUE-037). 【추론】 `typeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열이며, 커밋 번호로 메모하고 객체·배열 값의 안쪽 경로는 넣지 않는다(VALUE-037, SURFACE-061). 【추론】 `typeMismatch === false`는 값이 이 노드 유효 목록의 형이거나, 없거나, 노드가 nullable일 때 `null`이라는 뜻일 뿐 검증 통과를 뜻하지 않으며, 이 문구를 `FormTypeInputProps`와 게터의 주석에 같이 적는다(SURFACE-052, VALUE-037, SURFACE-061). 【추론】 게이트가 `null`을 빼는 것은 검증 전용이다(VALUE-037).

【추론】 union은 잎이므로 방출이 없을 때의 자리는 VALUE-034 그대로이며, 루트는 `undefined`이고 배열 아이템 자리는 `null`이다(VALUE-037). 【추론】 그래서 `omitEmpty`가 켜진 union 아이템이 `{}`를 들면 `null`이 방출되고, `{}`를 남기려면 작성자가 `omitEmpty: false`를 적는다(VALUE-037). 【추론】 방출은 원본을 참조 그대로 내며, 객체·배열을 복사하지 않는다(VALUE-012, WRITE-013, VALUE-037). 【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다(VALUE-037). 【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다, VALUE-037). 【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다(VALUE-037). 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(VALUE-037, ERROR-204). 【추론】 프로덕션에서는 그 점검을 하지 않으며, 이 한계를 문서에 적는다(VALUE-037).

【추론】 채움 값(BLUEPRINT-036)은 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어가며, `interpret`(두 번 해석 포함)를 지난다(VALUE-037). 【추론】 그래서 로드된 `{}`는 이미 있는 값이며 `default`로 덮이지 않고, 이는 객체 호스트가 `{}`도 채움을 받는 것(WRITE-082)과 다르다(VALUE-037). 목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(VALUE-037, WRITE-099). 【추론】 그 경고는 `source: 'fill'`, `reason: 'ambiguous'`로 한 번 보낸다(VALUE-037). 【추론】 `default`의 객체·배열은 복사하지 않고 불변으로 다룬다(WRITE-071, VALUE-037).

### 02-node-and-value.md §3.4 전체 교체 쓰기와 null

【추론】 `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(WRITE-019, WRITE-007, WRITE-094).
【추론】 잠복 원본이 지워지는 길은 나감 정책, 로드, V가 그 경로를 담지 않은 전체 교체 쓰기다(WRITE-094).
【추론】 WRITE-090의 멱등은 방출 값·채움·에지에 대한 것이다(WRITE-094).
【추론】 첫 `setValue(getValue())`는 잠복 원본과 투영으로 빠진 원본을 없음으로 만들며(VALUE-031), 둘째 호출부터는 바뀌는 것이 없다(WRITE-094).

- PR: PR-2(쓰기)(WRITE-094).
- 무엇: `omitEmpty` 필드에 `''`가 있고 꺼진 분기에 원본이 있는 폼에서 `setValue(getValue())`를 두 번 부른다(WRITE-094).
- 통과: 첫 호출에서 두 원본이 없음이 되어 `inactiveValues`에서 빠지고 방출 값·채움·에지는 그대로이며, 둘째 호출은 원본을 바꾸지 않고 `UpdateValue`를 내지 않는다(WRITE-094).
- 실패: 결과가 다르면 이 블록이나 WRITE-090의 보충을 고친다(WRITE-094).

2라운드의 "절대 제거하지 않는다"가 남긴 결함 — 레코드 A 뒤에 레코드 B를 로드하면 A의 잠복 값이 분기 전환에서 되살아난다 — 은 **전체 교체가 V에 없는 키를 없음으로 만들면서** 사라진다(WRITE-019). 비활성화(원본 보존)와 전체 교체(원본에도 적용)를 구분한 것이 답이었다(WRITE-019). 남는 잠복은 하나다: 비활성 조각이 선언한 자식의 원본은 방출되지 않으므로 검증기가 기각하지도 잔여 목록에 오르지도 않는다 — 설계상 잠복이다(원리 P4, WRITE-019). core는 이를 열거하는 읽기 전용 API를 두어 렌더 계층이 보여 주거나 지울 수 있게 하며, 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(4라운드 명세 F26, WRITE-019, VALUE-029).

【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다(WRITE-087).
【추론】 항목은 그 노드 아래에서 형상에 없고 원본을 든 노드(잎·터미널, 그리고 잘못된 종류의 값을 든 노드)마다 하나다(WRITE-087).
【추론】 `path`는 절대 JSON Pointer(`node.path`와 같은 표기)다(WRITE-087).
【추론】 `value`는 그 노드가 든 원본이며 복사하지 않는다(WRITE-087).
【추론】 순서는 청사진의 전순서(문서 순서)다(WRITE-087).
【추론】 아래에 잠복 원본이 없으면 모든 노드가 공유하는 얼린 빈 배열 하나를 돌려준다(WRITE-087).
【추론】 배열과 항목 객체는 얼린다(WRITE-087).
【추론】 메모는 커밋 단계에서만 만든다(WRITE-087).
【추론】 잠복 집합이나 잠복 원본이 바뀐 노드의 조상 경로만 다시 만들고, 루트의 함수는 경로로 찾기만 한다(WRITE-087).
【추론】 바뀐 것이 없으면 이전 참조를 그대로 돌려준다(WRITE-087).
【추론】 그래서 "같은 값을 두 번 읽으면 같은 참조"가 성립한다(WRITE-087).
【추론】 같은 항목 객체를 조상들의 배열이 함께 쓴다(절대 경로라서 가능하다)(WRITE-087).

- PR: PR-2 벤치(WRITE-087).
- 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다(WRITE-087).

**null은 키 없는 전체 교체다**(도출 D-1, WRITE-092). 키가 없으므로 모든 자식의 원본이 없음이 된다(WRITE-092).
"null 아래에 원본을 남긴다"는 호출자가 "없다"고 쓴 것을 숨겨 두는 것이므로 원리 P2에 어긋난다(WRITE-092). 실수로 누른 `null`의 되돌리기는 입력 컴포넌트의 몫이다(도출 D-1, WRITE-092). 표준 예제로 남긴다(WRITE-092).

【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092, WRITE-096).
【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다(WRITE-096).
【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다(WRITE-096).
【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다(WRITE-096).

- PR: PR-2(쓰기 종류)(WRITE-096).
- 무엇: `name`에 `default`가 있는 폼에서 `setValue({ user: null })` 뒤와 `{ user: null }`을 로드한 `FormHandle.reset()` 뒤의 `name`의 원본과 방출, 그리고 `setValue(V)`가 낸 `UpdateValue`의 출처 칸을 본다(WRITE-096).
- 통과: `setValue` 뒤 `name`은 없음이고, 로드 뒤 `name`은 채움 값을 들되 방출에 나타나지 않으며, 출처 칸은 호출자 전체 교체다(WRITE-096).
- 실패: 이 블록을 고친다(WRITE-096).

【추론】 억제 비트 `DisableAutomaticWrites`의 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부다(WRITE-097).
【추론】 WRITE-048의 "원장의 쓰기 표에서 둘은 같은 행이다"는 낡은 근거다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기라 쓰기 표에서 reset과 다른 행이며, reset만의 예외를 두지 않는 근거는 모든 배열 통째 쓰기가 위치로 잇는다는 NODE-051이다(WRITE-097).
【추론】 WRITE-085의 "배열 통째 로드"는 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 싣는 배열이며, 로드가 아닌 배열 통째 쓰기의 스냅숏은 WRITE-095가 정한다(WRITE-097).
【추론】 `setValue(undefined)`는 이미 있던 노드를 다시 채우지 않고 비운다(WRITE-097).
【추론】 채움이 일어나는 사건에는 노드 게이트(`controls.active`)가 켜짐도 든다(SETTLE-005, WRITE-097).

- PR: PR-2(채움)(WRITE-097).
- 무엇: 빠진 키에서 참이 되는 `if`와 `controls.active` 게이트를 가진 폼에서 루트 `setValue(undefined)`를 부른다(WRITE-097).
- 통과: 이미 있던 노드는 채우지 않고 비우며, 게이트가 뒤집혀 새로 생기거나 켜진 노드는 채움을 받는다(WRITE-097).
- 실패: 채움 사건의 목록을 고친다(WRITE-097).

## 설계문서

- `design/02-node-and-value.md` §1.8 (NODE-020)
- `design/02-node-and-value.md` §2.1 (VALUE-001, VALUE-002, VALUE-003, VALUE-004, VALUE-005, VALUE-016, VALUE-023)
- `design/02-node-and-value.md` §2.2 (VALUE-009, VALUE-027, VALUE-012, VALUE-028, VALUE-013, VALUE-010, VALUE-014)
- `design/02-node-and-value.md` §2.3 (VALUE-006, VALUE-035, VALUE-008, VALUE-017, VALUE-025, VALUE-029)
- `design/02-node-and-value.md` §2.4 (VALUE-036)
- `design/02-node-and-value.md` §3.4 (WRITE-092)
