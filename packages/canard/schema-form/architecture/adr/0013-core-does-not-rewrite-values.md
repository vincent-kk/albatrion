# ADR 0013 — core는 값을 고치지 않는다

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| VALUE-029 | 소유자 답(`reviews/round-18-owner-answers.md:22` 12-8 셋째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81; 반환 모양) | 18 |
| VALUE-036 | 원리(`reviews/round-5-derivations.md:40` D-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) | 18 |
| WRITE-001 | 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-2.md:119` 새 원칙) | 5 |
| WRITE-002 | 원리(P4, `adr/0013-core-does-not-rewrite-values.md:30`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 셋째 문장) | 13 |
| WRITE-003 | 소유자 답(`reviews/round-2.md:119` 새 원칙), 소유자 답(`reviews/round-5-derivations.md:7` P1') | 5 |
| WRITE-004 | 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때) | 2 |
| WRITE-005 | 원리(P2, `03-mental-model.md:74`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 비움) | 13 |
| WRITE-006 | 원리(D-4 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`) | 5 |
| WRITE-007 | 편집자 결정(5라운드, ADR 0013 5차 본문 `adr/0013-core-does-not-rewrite-values.md:13`), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1; 채움 행), 소유자 답(`reviews/round-10-owner-answers.md:19` D-6; `controls.injectTo`의 로드 발화), 편집자 결정(9라운드 도출, `07-conclusions.md:276`; `controls.derived` 행의 에지), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`; `controls.derived`의 로드 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21; `controls.unsetValue` 행), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 비움 행), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2; 나감의 비움 행의 하위 트리), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; 리프 입력 행의 `options.trim`), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:11` 반영 칸; 리프 입력 행에 둔 쓰기 종류), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:160`), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; trim 행만 WRITE-078로 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) | 18 |
| WRITE-010 | 소유자 답(`reviews/round-10-owner-answers.md:15` C-11), 소유자 답(`reviews/round-10-owner-answers.md:18` C-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18) | 18 |
| WRITE-011 | 편집자 결정(6라운드 D-11, `06-conclusions.md:112`), 편집자 결정(9라운드, `07-conclusions.md:90` 4.0의 4.1 행) | 9 |
| WRITE-012 | 소유자 답(`reviews/round-10-owner-answers.md:19` D-6), 편집자 결정(4라운드, 에지 발화 F11 `reviews/round-4-spec.md:144`) | 10 |
| WRITE-013 | 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F10·T-12·F24·T-19), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) | 18 |
| WRITE-015 | 소유자 답(`reviews/round-4.md:113` D-7; 호출 단위 비트), 원리(D-5 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`; 범위), 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름), 편집자 결정(6라운드 D-19, `06-conclusions.md:163`; `Merge`의 배열 통째 교체), 16라운드 스웜 수렴(편집자 결정, `adr/0013-core-does-not-rewrite-values.md:8`; 배치 행의 `fn` 안 `reset`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) | 18 |
| WRITE-018 | 편집자 결정(5라운드, ADR 0013 5차 본문 `adr/0013-core-does-not-rewrite-values.md:13`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2; 노드 게이트는 조각 게이트와 같은 장치), 편집자 결정(13라운드, `03-mental-model.md:84`; 로드에는 나감이 없음) | 13 |
| WRITE-019 | 편집자 결정(2라운드 codex 교차검증 반영, `adr/0013-core-does-not-rewrite-values.md:100`), 원리(P4, `adr/0013-core-does-not-rewrite-values.md:78`) | 5 |
| WRITE-021 | 소유자 답(`reviews/round-2.md:118` 로드 → 저장의 왕복), 편집자 결정(2라운드 codex 교차검증 반영, `adr/0013-core-does-not-rewrite-values.md:100`), 원리(P4, `adr/0013-core-does-not-rewrite-values.md:82`) | 5 |
| WRITE-022 | 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16) | 5 |
| WRITE-023 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) | 13 |
| WRITE-024 | 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)) | 10 |
| WRITE-025 | 원리(P2, `adr/0013-core-does-not-rewrite-values.md:36`), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장) | 12 |
| WRITE-026 | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`) | 12 |
| WRITE-028 | 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21), 편집자 결정(12라운드 수용, `07-conclusions.md:251`) | 12 |
| WRITE-031 | 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책; 별도 옵션), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 기본 유지), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15; `controls.children` 항목의 값 키), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리; Form 속성 층), 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:66`; 세부가 포괄을 덮음), 편집자 결정(15라운드 결정 2, `08-design-a-to-z.md:298`; 형용사 형), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:298`; Form 속성은 `boolean`만), 편집자 결정(12라운드 도출, `reviews/round-12-derivation.md:60`; 같은 층은 유지 우선) | 17 |
| WRITE-033 | 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; `children` 그룹 예외) | 17 |
| WRITE-037 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 편집자 결정(13라운드, `adr/0013-core-does-not-rewrite-values.md:10`) | 13 |
| WRITE-092 | 원리(D-1 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) | 18 |

## 결정

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

### 02-node-and-value.md §3.1 core는 받은 값을 고치지 않는다

**core는 받은 값을 고치지 않는다.**(WRITE-001) 유효하지 않은 값은 그대로 들어가고 에러로 보인다(WRITE-001). 입력을 막지 않는다(WRITE-001).

소유자(2026-09-23, 합의 근거; WRITE-001): "그걸 바랐다면 ajv autofix 같은 걸 쓰지 않았을까. 나는 form이 값을 바꾸도록 이전에 설계했고, 이 방식이 사용자에게 혼란을 준다는 걸 느껴서, 값 수정은 안 하고 에러만 보여주는 걸 기본 동작으로 하려고 했다. 빼거나 지우는 건 모두 `&`로 시작하는 명령으로 조작해야 한다."(WRITE-001)

18라운드 S1 반영: WRITE-001에는 이름 붙은 예외(형 정규화)로 적는다(WRITE-001). 18라운드 S1 반영: 이것은 값의 교정이 아니라 JSON·JS 자동 형변환을 통제할 수 있게 구현한 것이므로 WRITE-001의 대상이 아니다(WRITE-001).

**예외는 방출 정책뿐이다 — 비활성 노드의 값은 방출에서 빠지고, `omitEmpty`·`omitTrailing`이 방출을 줄인다.**(WRITE-002) 원본을 지우는 것이 아니라 방출을 계산할 때의 투영이다(GOAL-030, 원리 P4(방출은 정책이다), WRITE-002). 비활성 노드의 원본을 지우는 것은 작성자나 호출자(Form 속성)가 나감 정책 키를 켰을 때뿐이며, 그것은 core의 교정이 아니라 그들이 선언한 자동 쓰기다(원리 P2(원본은 호출자와 작성자만 쓴다), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), WRITE-002).

**비활성화는 쓰기가 아니다** — 조각이 꺼져도 원본은 기본으로 그대로다(원리 P4, 축 4항(JSON Schema 설정은 값을 조작하지 않는다), WRITE-002).

**제약을 입력 단계에서 강제하는 일은 입력 컴포넌트에 위임한다.**(WRITE-003) core는 제약을 유효 스키마로 노출하고(`node.jsonSchema`) 위반은 검증이 알린다(WRITE-003).

형상 계산이 수렴하지 않을 때도 값은 받아들인다(SETTLE-011, WRITE-004).

원본에 쓰는 주체는 사용자 입력, 호출자의 `setValue`·`reset`, 그리고 작성자가 선언한 규칙뿐이다(WRITE-005). 규칙은 노드가 생길 때의 채움과 그 원천 `controls.default`·`default`, 예약 층의 `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 정책이 참으로 정해진 노드의 나감 비움, 그리고 포커스 아웃 `trim`이 자른 값의 쓰기다(WRITE-005, WRITE-078). 포커스 아웃 `trim`이 자른 값의 쓰기도 core의 자동 쓰기(여섯째)이며 작성자가 선언한 `options.trim`의 규칙이다(WRITE-005, WRITE-078). core가 스스로 원본을 "고치는" 일은 없다(WRITE-005).

쓰기의 종류는 **호출자가 선언한다.**(WRITE-006) core는 추론하지 않는다(도출 D-4, WRITE-006).

### 02-node-and-value.md §3.2 쓰기 표, 쓰기 종류와 쓰기 옵션

(WRITE-007, WRITE-090)

| 사건 | 종류 | 자식 원본 |
| ---- | ---- | -------- |
| 리프 입력(포커스 아웃 때 `options.trim`이 자른 값의 쓰기 포함), `setValue(V, SetValueOption.Merge)` | 부분 쓰기 | 지정한 것만 바뀐다 |
| `setValue(V)`(기본 `Overwrite`), `defaultValue`, `reset()` | `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고 이미 형상에 있던 노드를 다시 채우지 않으며, 로드는 마운트(`defaultValue`)·`FormHandle.reset()`·`resetSubtree()`뿐이다 | V에 없는 자식의 원본은 **없음**이 된다 |
| `controls.injectTo` | 전체 교체(대상에), 작성자 선언 | 대상에 대해 위와 같다 |
| `controls.derived` | 자기 값 덮기, 작성자 선언 | 의존 값이 바뀔 때(에지). 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 |
| `controls.unsetValue` | 자기 값을 없음으로, 작성자 선언 | 식이 거짓에서 참이 되는 순간. 로드에서는 로드된 값으로 평가해 참이면 지운다 |
| 나감의 비움(선택, 기본 꺼짐) | 나간 노드의 값을 없음으로, 작성자·호출자 선언(정책 키) | 노드가 나갈 때 한 번(하위 트리 포함, 공유 노드 제외). 로드에는 없다. 전이 단계, 최종 형상 기준. 정책 키(`unsetOnInactive`)는 노드 > `controls.children`의 `controls` > 조각의 `controls` > Form 속성, 같은 층은 하나라도 유지면 유지. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, WRITE-033) |
| 배열 `push`/`remove`/`update` | 구조 연산 | 그 아이템만. `push`로 생긴 아이템은 생긴 노드이므로 채움을 받는다 |
| 채움 | 노드 생성 사건, 작성자 선언 | 노드가 **생길 때** **없음**이면 `controls.default` > `default` > 없음. 이미 있던 노드는 다시 채우지 않고 지운 값도 다시 채우지 않는다 |

소유자(12-2 답; WRITE-007): "자동 쓰기 아닙니까? 그리고 trim 전후 값이 같으면 쓰지 않아도 됩니다. 효율적이게."(WRITE-007, WRITE-078)

(WRITE-007)

| 사건 | 종류 | 누가 | 자식 원본에 미치는 것 |
| ---- | ---- | ---- | -------------------- |
| `controls.injectTo` | 전체 교체(대상에) | 작성자 | 원천의 방출 값이 직전 커밋과 다를 때(에지). 로드에서는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의) |
| `controls.derived` | 자기 값 덮기 | 작성자 | 의존 값이 바뀔 때(에지). 로드에서는 직전 값이 없으므로 발화한다(로드는 새 수명, `controls.injectTo`와 같은 읽기). 식이 `undefined`면 쓰지 않는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다(재탄생은 새 삶) |
| `controls.unsetValue` | 자기 값 없음으로 | 작성자 | 식이 거짓→참이 되는 순간. 로드에서는 로드된 값으로 평가해 참이면 지운다(소유자). 입력은 남는다 |
| 채움 | 없음인 키에 한 번 | 노드 생성 사건 | 노드가 **생길 때**(직전 커밋의 형상에 없고 이번 최종 형상에 있을 때) 없음이면 `controls.default` > `default` > 없음. 이미 있던 노드는 새 조각이 켜져도 다시 채우지 않는다. 지운 값은 다시 채워지지 않는다. 채움 값은 그 노드가 처음 채워지는 전이 라운드의 유효 스키마에서 읽는다. 뒤 라운드에 켜진 조각의 `default`는 쓰지 않는다 |

생김은 노드 단위다(WRITE-007). 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있는 노드만 생긴 것이고, 본체·게이트 없는 `allOf` 항목·이미 켜져 있던 다른 조각이 두고 있던 노드는 새 조각이 켜져도 생기지 않는다(WRITE-007).

"없음"과 `''`·`null`·`{}`은 다르다(WRITE-010). 객체 호스트의 없음은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이라, 로드한 V가 그 자리에 `{}`를 주어도 호스트는 `controls.default` > `default`를 받는다(WRITE-010, WRITE-082). 리프에 `undefined`를 쓰면 없음이 된다(WRITE-010). 입력 컴포넌트가 `onChange(undefined)`를 보내도 값이 없음이 된다(소유자 답(`reviews/round-10-owner-answers.md:15` C-11), WRITE-010). `Merge`로 키에 `undefined`를 쓰면 그 키는 없음이 된다(WRITE-010). `extras`의 키도 같고, 따로 `removeKey`를 두지 않는다(소유자 답(`reviews/round-10-owner-answers.md:18` C-2), WRITE-010).

공개 옵션은 비트마스크다 — `SetValueOption.Overwrite | Merge | DisableAutomaticWrites | EnableAutomaticWrites`, Form 속성은 `disableAutomaticWrites`(SURFACE-004, SURFACE-039, WRITE-015).

(WRITE-015, WRITE-090, WRITE-078, WRITE-100)

| 규칙 | 내용 |
| ---- | ---- |
| 기본 | 쓰기 종류는 `Overwrite` — 오늘과 같다 |
| 자리 | `setValue(V, option)`뿐 아니라 **`reset(option)`과 마운트**에도 둔다. 마운트는 `defaultValue`가 로드이므로 Form 속성이 그 자리다 |
| 우선순위 | **호출 옵션 > Form 속성**, 양방향이다. 속성이 켜 둔 억제를 호출이 끌 수 있고 그 반대도 된다. 억제 비트가 둘(`DisableAutomaticWrites`·`EnableAutomaticWrites`)인 이유가 이것이다 — 상속·끄기·켜기 세 상태. 호출에 둘 다 없으면 Form 속성을 따르고, 둘 다 주면 억제가 이긴다 |
| 배치 | 한 배치 안에 서로 다른 억제 값이 섞이면 **억제가 이긴다**(보수적. `fn` 안의 `reset`의 로드는 묶음 밖이다, EVENT-015) |
| 범위 | 억제는 그 호출이 일으킨 예약 층의 자동 쓰기 전부를 막는다 — 채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움, 포커스 아웃 `trim`이 자른 값의 쓰기. 포커스 아웃 `trim`이 자른 값의 쓰기도 자동 쓰기(여섯째)이자 억제 비트의 대상이라 억제를 켠 폼에서는 포커스 아웃 때 자르지 않는다. 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이며, `DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다. `Merge`에 주면 `Merge`가 통째로 준 배열의 아이템 채움과 그 `Merge`가 촉발한 `controls.derived`도 막는다. 로드된 값 자체는 막지 않는다. `controls.active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 뒤이은 사용자 입력·리스너가 일으킨 정착은 다른 호출이므로 억제가 듣지 않는다(4라운드 명세 F25). |
| `Merge` | `Merge`는 V에 없는 키를 로드하지 않는다. V가 통째로 준 배열은 통째 교체다. 그 아이템 가운데 직전 커밋의 형상에 없던 노드는 생긴 노드로서 채움을 받으며, 어떤 아이템이 생긴 것인지는 NODE-051이다. `Merge`에 준 억제 비트는 그 호출이 일으킨 자동 쓰기에 적용되므로 이 채움도 막는다 |

`FormHandle.reset(option?)`은 `DisableAutomaticWrites`·`EnableAutomaticWrites` 두 비트만 받는다(SURFACE-005, WRITE-015). `Overwrite`·`Merge`는 받지 않는다(WRITE-015). `fn` 안의 `reset`의 억제 비트는 그 로드에만 들며, 로드가 `fn`의 쓰기 묶음에 들지 않으므로 배치 규칙('섞이면 억제가 이긴다')은 묶음의 쓰기끼리만 합산한다(WRITE-015).

`Refresh`는 옵션이 아니라 core가 출처로 판단한다(4라운드 명세 F7, WRITE-016). core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다)(WRITE-016).

JSDoc이 "로드"를 정의한다(WRITE-074). 어느 것이든 JSDoc에 "로드"를 정의한다 — `setValue(V, Overwrite)`와 `null`로의 교체는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-074, WRITE-090).

【추론】 (다) 입력 구성 요소가 옵션 없이 `onChange(V)`를 부르면 '입력 쓰기'다(WRITE-091).
【추론】 그 노드의 값이 V가 된다(WRITE-091).
【추론】 잎과 터미널에서는 원본을 바꾼다(WRITE-091).
【추론】 자식이 있는 노드에서는 V에 없는 자식이 없음이 되고, 선언되지 않은 키는 `extras`로 간다(WRITE-091).
【추론】 트리 전체로 보면 그 노드 아래만 바뀌는 부분 쓰기이며 로드가 아니다(WRITE-091).
【추론】 그래서 새 수명이 없고, 지운 키를 다시 채우지 않으며, 채움은 생긴 노드에만 들어간다(WRITE-091).
【추론】 `derived`와 `injectTo`는 평소 에지 규칙을 따른다(WRITE-091).
【추론】 Refresh는 쓴 입력 자신에게 보내지 않는다(계승 제약 T-2(타이핑은 입력을 리마운트하지 않는다), WRITE-091).
【추론】 이 쓰기로 원본이 바뀐 자손에게만 보낸다(EVENT-042의 출처 규칙, WRITE-091).
【추론】 입력은 두 번째 인자로 공개 비트마스크를 넘길 수 있다(오늘도 넘긴다)(WRITE-091).
【추론】 `Merge`를 주면 (나)의 부분 쓰기가 된다(WRITE-091).
【추론】 출처 규칙대로 자기 입력은 Refresh를 받지 않는다(WRITE-091).
【추론】 억제 비트는 그 쓰기가 일으킨 자동 쓰기에 적용된다(WRITE-091).
【추론】 `handleChange`의 바깥 오류 지움과 dirty 표시(REACT-011)는 옵션과 무관하게 그대로다(WRITE-091).

【추론】 (나) `Merge`는 키로 합칠 수 있는 자리에서만 합친다(WRITE-079).
【추론】 그 자리의 값을 통째로 바꾸는 경우는 둘이다(WRITE-079).
【추론】 하나는 V나 V 안의 값이 평범한 객체가 아닌 때다(`null`, `undefined`, 원시 값, 배열, 객체 호스트에 온 배열)(WRITE-079).
【추론】 다른 하나는 그 자리의 노드가 객체 호스트가 아닌 때다(WRITE-079).
【추론】 이는 이미 정한 배열 규칙('통째로 준 배열은 통째 교체')을 일반화한 것이다(WRITE-079).
【추론】 바뀐 자리의 자식 원본은 없음이 되고, 호스트는 받은 값을 든다(`undefined`면 없음)(WRITE-079).
【추론】 이 쓰기는 부분 쓰기이며 로드가 아니다(WRITE-079).
【추론】 그래서 채움은 이 쓰기로 새로 생긴 노드에만 들어간다(WRITE-079).
【추론】 로드가 아닌 쓰기로 온 `null`·비객체 값도 그 자리의 자식 원본을 없음으로 만들지만 새 수명이 아니므로 채움을 받지 않는다(WRITE-090의 '빈 상태' 채움은 로드에만 해당)(WRITE-079).
【추론】 호출자 오류로 던지지 않고 조용히 버리지도 않는다(WRITE-079).
【추론】 그래서 새 코드가 없다(WRITE-079).
【추론】 틀린 종류의 값이면 S1 규칙대로 경고등이 켜지고 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 경고가 간다(WRITE-079, SURFACE-061).

반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`."(WRITE-079)

자동 쓰기는 비객체 호스트의 원본을 건드리지 않고(4라운드 명세 F10, 계승 제약 T-12(자동 쓰기는 null 조상을 객체로 만들지 않는다)), core는 호출자가 넘긴 객체를 바꾸지 않는다(4라운드 명세 F24, 계승 제약 T-19(`defaultValue`와 `jsonSchema`는 마운트 시 deep clone한다), WRITE-013).

호스트의 원본이 `null`·`17` 같은 잘못된 종류의 값일 때 그 자식은 존재하고 렌더되며 빈 상태를 보인다(WRITE-013). 호스트의 그 원본을 비우는 것은 사용자·호출자의 부분 쓰기뿐이고 **그 자식의 투영된 방출이 존재하게 될 때만** 비운다(WRITE-013). 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이며(WRITE-090, WRITE-092), 채움 값을 드는 것은 로드로 온 `null` 아래 자식이다(WRITE-096, WRITE-013). `setValue({ user: null })` 뒤 사용자가 `name`에 입력하면 `user`가 객체가 되어 방출된다(4라운드 명세 F1, 4라운드 명세 F10, WRITE-013).

터미널 노드가 참조를 들 수 있으므로 `defaultValue`는 분배 시 복사하거나 불변으로 취급한다(4라운드 명세 F24, 계승 제약 T-19, WRITE-071).

### 02-node-and-value.md §3.3 채움과 로드

채움(`controls.default` > `default`)은 노드가 생길 때만 일어난다: 마운트, `FormHandle.reset()`, `resetSubtree()`, 분기가 켜짐, 배열 아이템이 생김(WRITE-090, WRITE-097).
로드는 마운트, `FormHandle.reset()`(커밋된 prop), `resetSubtree()`(그 하위 트리)뿐이며, 로드는 새 수명이라 형상의 모든 노드를 생긴 노드로 치고 없음인 값이 채움을 받는다(WRITE-090, SETTLE-048).
`setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, 이미 형상에 있던 노드를 다시 채우지 않고 그 쓰기로 새로 생긴 노드만 채움을 받는다(WRITE-090).
그래서 `setValue(undefined)`는 채움 없이 비우고, `setValue(getValue())`는 멱등이다(WRITE-090, WRITE-094).
`Overwrite`를 준 입력 쓰기는 다른 입력 쓰기처럼 자기 입력에 Refresh를 보내지 않는다(WRITE-090).
`setValue(null)` 뒤 자식이 다시 객체가 되어도 노드가 새로 생기지 않으면 채우지 않는다(WRITE-090).
`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(배열의 구조 연산이 스냅숏을 고치는 WRITE-085의 규칙은 그대로다)(WRITE-090, WRITE-095).
`DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다(WRITE-090).
`setValue(undefined)`와 입력의 `onChange(undefined, SetValueOption.Overwrite)`는 오늘처럼 채움 없이 비우므로 이주 행이 없다(WRITE-090).

소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; WRITE-090): "잠깐. default 나 defaultValue 가 영향을 주는건 "최초 로드시" 와 "브랜치가 꺼졌다 켜졌을때 값이 없는 경우" 뿐 아닌가? 그러니까 정말 최초에만 영향을 주는거고, undefined 가 오면 명시적으로 해당 필드는 비워야 하지 않나?" "defaultValue의 동작을 생각하면 이 값으로 계속 되돌아가는건 너무 이상한 동작으로 보이는데?" "4번 B 안 확정."(WRITE-090)

【추론】 core는 `default`가 없는 자리에 타입별 빈 값을 만들지 않는다(WRITE-089).
【추론】 채움의 원천은 `controls.default` > `default` > 없음뿐이다(VALUE-035, SCHEMA-002, WRITE-089).
【추론】 `Form`이 `defaultValue` 없이 서거나 `reset`될 때 루트에 로드하는 값은 없음이며, 빈 호스트와 루트가 무엇을 방출하는지는 VALUE-034가 정한다(WRITE-089).
【추론】 그래서 오늘의 `getEmptyValue` 경로는 새 설계에 없고, 빈 폼의 `FormHandle.getValue()`는 VALUE-034대로 오늘처럼 `{}`다(WRITE-089).

【추론】 호스트(객체, 배열)의 채움 값 D는 `controls.default` > `default` 순이다(WRITE-082).
【추론】 D는 그 호스트가 처음 채워지는 라운드의 유효 스키마에서 읽는다(WRITE-082).
【추론】 호스트가 생길 때 없음이면, D는 그 호스트에 대한 쓰기로 들어간다(WRITE-082).
【추론】 분배는 그 호스트에 대한 쓰기와 같다(WRITE-082).
【추론】 D의 키는 해당 자식의 원본이 된다(더 깊이 재귀)(WRITE-082).
【추론】 선언되지 않은 키는 `extras`로 가고, D가 객체가 아니면 호스트가 그 값을 든다(WRITE-082).
【추론】 객체 호스트가 없음이라는 것은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이다(상태 둘에서 계산, 원리 P3(형상은 상태의 순수 함수다), WRITE-082).
【추론】 그래서 로드한 V가 그 자리에 `{}`를 주어도 호스트는 D를 받는다(WRITE-082).
【추론】 채움은 부모부터 순회한다(WRITE-082).
【추론】 그래서 D가 준 키의 자손은 이미 없음이 아니어서 자기 `default`를 받지 않는다(WRITE-082).
【추론】 D에 없는 자손은 없음으로 남아, 자기 차례에 `controls.default` > `default`를 받는다(WRITE-082).
【추론】 채움은 자동 쓰기이므로 억제 비트의 대상이고, 원본 B의 자동 쓰기 기록에 든다(WRITE-082).
【추론】 D는 복사하거나 불변으로 다룬다(4라운드 명세 F24(core는 호출자가 넘긴 객체를 바꾸지 않는다), WRITE-082).
【추론】 분배된 값은 잎마다 `interpret`를 지난다(WRITE-082).
【추론】 꺼진 조각의 자손에도 쓰기의 분배 규칙대로 들어가 잠복 원본이 된다(WRITE-018과 같은 분배, WRITE-082).

ㄴ `push`는 로드가 아니다(WRITE-088). `push`는 구조 연산이다(WRITE-088). 만든 아이템은 생긴 노드로서 채움을 받는다(`controls.default` > `default` > 없음)(WRITE-088). `push(v)`면 원본은 `v`이고, 없음인 자손에만 채움이 간다(WRITE-088).

주입된 값은 꺼진 조각의 노드와 노드 게이트(`controls.active`)가 거짓인 노드까지 포함해 모든 노드의 원본으로 분배되고, 형상은 그 값으로 수렴한다(WRITE-018, SETTLE-029). 노드 게이트는 조각 게이트와 같은 장치이므로 두 경우가 같게 동작한다(SETTLE-003, WRITE-018).
꺼진 조각의 값과 게이트가 거짓인 노드의 값은 **방출에서** 빠진다(WRITE-018). 기본은 원본을 지우지 않는다(원리 P4, WRITE-018). 로드에는 나감이 없으므로 나감 정책 키를 켜도 주입된 값은 지워지지 않는다(WRITE-037, WRITE-018). `controls.visible: false`로 숨긴 필드와 스키마가 선언하지 않은 키는 방출된다(WRITE-018). 스키마가 선언하지 않은 키는 `extras`에 받은 순서로 방출된다(WRITE-018). 숨김은 렌더링에만 닿는다(WRITE-018).
나머지는 검증이 에러로 알린다(WRITE-018).

(a)("첫 의도된 쓰기 전까지 `getValue()`가 주입된 값을 그대로 돌려준다")는 택하지 않는다 — 첫 편집에서 기본값이 나타나고 미선언 키가 빠지는 점프가 생긴다(WRITE-021). (b)의 셋 가운데 둘은 **기본 계약이 되었다**: 로드한 값에 없는 키에만 채움(`controls.default` > `default`)이 들어가는 것과, 미선언 키를 호스트의 별도 칸(`extras`)에 보존하는 것(3라운드 명세 E16, WRITE-021). 남은 하나("손대지 않은 값에는 `omitEmpty`·`omitTrailing`을 건너뛴다")는 이력 의존이므로 채택하지 않는다 — 방출은 상태의 투영이다(원리 P4, WRITE-021). `preserveDefaultValue`라는 이름은 사라지고 그 자리에 억제 비트 `DisableAutomaticWrites`가 남는다(WRITE-021).

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

### 02-node-and-value.md §3.7 값 조작 셋과 예약 층

값 조작 셋의 대응은 다음과 같다(WRITE-030).

- 없는 값 채우기 = 채움(`controls.default`·`default`)(WRITE-030).
- 있는 값 바꾸기 = `controls.derived`(자기), `controls.injectTo`(남)(WRITE-030).
- 있는 값 지우기 = `controls.unsetValue`(원본에서), `controls.active: false`(방출에서)(WRITE-030).

런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다(WRITE-030).
`controls.derived`·`controls.injectTo`의 식이 `undefined`를 돌려주면 쓰지 않는다(그 라운드의 후보가 아니다)(WRITE-030).
없음으로 만드는 장치는 `controls.unsetValue` 하나이고 발화원이 둘이다 — 식의 거짓→참, 그리고 정책이 참으로 정해진 노드의 나감(목표 G4(하나의 개념에는 하나의 장치))(WRITE-030).
소유자는 읽기 2에서 "없는 값을 채우는 것과 있는 값을 바꾸는 것, 있는 값을 제거하는 것 모두 원리상 가능해야 한다."라고 했다(WRITE-030).

`controls.derived`는 원본을 쓴다(WRITE-011).

`controls.derived`의 덮어쓰기는 레벨과 혼합안으로 하지 않는다(WRITE-060).
입력을 열어 둔 채 매번 덮어쓰는 레벨은 사용자 편집마다 입력을 리마운트하므로 계승 제약 T-2 "타이핑은 입력을 리마운트하지 않는다"에 걸린다(실행으로 확인)(WRITE-060).
쓴 주체에 따라 방아쇠를 가르는 혼합안은 G4 "특수 경로가 없다"에 걸린다(WRITE-060).
`injectTo`와 로드 규칙이 다른 에지는 G4에 걸린다(WRITE-060).
D-11′(사용자가 파생 필드를 덮어쓸 수 있는가)는 에지다(WRITE-060).

`controls.injectTo`는 작성자가 선언한 전체 교체이고 런타임에는 **원천의 방출이 직전 커밋과 다를 때만** 발화한다(WRITE-012, SETTLE-028).
로드에는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의)(WRITE-012).

`controls.unsetValue`는 로드 정착 안에서 참이면 지운다(WRITE-028).
로드 정착에서 `controls.unsetValue`의 직전 값은 거짓이다(WRITE-028).
같은 정착 안의 채움이나 파생으로 참이 되어도 지운다(소유자 답 21 "현재 데이터를 기준으로")(WRITE-028).
런타임에는 경계에서만 움직인다(WRITE-028).
거짓→참에서 지우고, 참→거짓에서는 아무 일도 하지 않는다(값을 되살리지 않는다)(WRITE-028).

**형상에 없는 노드의 규칙은 평가하지 않는다**(원리 P4(방출은 정책이다): 형상 변화는 쓰기가 아니다)(WRITE-029).
그 노드가 형상 밖에 있는 동안의 원천 변화는 에지가 아니고, 노드가 (다시) 생기면 그 노드의 `controls.unsetValue`·`controls.derived`·`controls.injectTo`의 에지는 거짓→참으로 본다(직전 값이 없다)(WRITE-029).
비활성 원천의 방출이 사라지는 것도 다른 노드의 `controls.injectTo`에 에지가 아니다(WRITE-029).

### 02-node-and-value.md §3.8 나감의 비움

(WRITE-037, WRITE-078)

| 사건 | 종류 | 누가 | 자식 원본에 미치는 것 |
| ---- | ---- | ---- | -------------------- |
| 나감의 비움(선택, 기본 꺼짐) | 나간 노드의 값을 없음으로 | 작성자 또는 호출자(정책 키를 켠 곳. Form 속성 층은 호출자) | 노드가 **나갈 때**(직전 커밋의 형상에 있었고 이번 최종 형상에 없을 때, 하위 트리 포함) 한 번. 선언이 하나라도 켜져 있으면 나가지 않는다(공유 노드). 로드에는 나감이 없다. 전이 단계, 최종 형상 기준. 다섯째 자동 쓰기(억제 비트·원본 B의 대상). 기본은 유지(P4: 방출에서만 빠지고 원본은 남는다 — 소유자 13라운드: "onChange로 넘어가는 값에서 지워지는 게 기본값이면 된다") |

나감 정책 키 `unsetOnInactive`(이름은 소유자 13라운드 확정. 철자는 노드의 `controls.unsetOnInactive`, Form 속성 `unsetOnInactive`)는 형용사 형(`boolean` 또는 식→`boolean`, 15라운드 결정 2. Form 속성은 `boolean`만)이며 네 층에서 세부가 포괄을 덮는다: 노드 자신 > `controls.children` 항목의 `controls` > 조각의 `controls` > Form 속성(WRITE-031).
같은 층에 여럿이면 하나라도 유지면 유지한다(되돌릴 수 없는 쓰기는 만장일치)(WRITE-031).
자리는 둘이다: 노드의 `controls.unsetOnInactive`(그리고 `children` 항목·조각의 `controls`), Form 속성 `unsetOnInactive`(WRITE-031).
Form 속성은 노드 문맥이 없으므로 `boolean`만이다(WRITE-031).
13라운드는 이름과 기본값만 정했다(17라운드 스웜 수렴(편집자 결정))(WRITE-031).

나감의 정책은 직전 커밋에서 그 노드에 걸려 있던 선언(그때 켜져 있던 조각의 `controls`, 부모의 `controls.children` 항목, 노드 자신의 키)으로 정한다(원리 P3(형상은 상태의 순수 함수다))(WRITE-032).
조각 층은 그 조각이 꺼지는 순간에도 적용된다(WRITE-032).

어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋(그 노드가 형상에 있던 마지막 커밋)의 것이다(WRITE-038).
식은 다른 형용사 키처럼 노드가 형상에 있는 동안 계산된 값을 가지며 나감에서는 그 값을 쓴다(WRITE-038).
나가는 순간 형상 밖의 노드를 새로 평가하지 않으므로(WRITE-029의 '형상에 없는 노드의 규칙은 평가하지 않는다', 12라운드 §9 소유자 동의) 식은 나감을 일으킨 변화를 보지 못한다(보게 하려면 12라운드 §9에 예외가 필요하다. 소유자 통보 2 허용: "예. 허용해야 합니다.")(WRITE-038).
Form 속성 층은 정착이 시작될 때 core가 든 값이며 속성의 바뀜은 나감이 아니다(WRITE-038).
Form 속성 층은 정착이 시작될 때 core가 든 값(React가 마지막으로 커밋한 속성)이며, 속성이 바뀌는 것은 쓰기도 나감도 아니고 이미 잠복한 원본을 거슬러 비우지 않는다(WRITE-038).
Form 속성 층은 네 층의 가장 아래(포괄) 층이며 참일 때 로컬을 덮는 전체 잠금(`readOnly`·`disabled`)과 다르다(WRITE-038).

나가는 객체·분기에 켠 `unsetOnInactive`는 함께 나가는 하위 트리로 내려간다(17라운드 소유자 답 R17-2 ㄴ: "해당 브랜치가 꺼질떄, 하위 트리노드가 모두 꺼진다고 봐야할거같아". 13라운드 답 1의 둘째 예외)(WRITE-033).
이것은 13라운드 답 1("모든 control 필드는 자체 노드만 지원. children 그룹은 예외")에 둔 둘째 예외다(WRITE-033).
나가는 노드의 비움 여부는 그 노드와 그 위의 **나가는** 조상들을 가까운 순서로 보아, 직전 커밋의 위 층 가운데 하나라도 명시된 첫 마디가 정하고(한 마디의 같은 층에 여럿이면 하나라도 유지면 유지), 끝까지 없으면 Form 속성이 정한다(WRITE-033).
나가는 노드의 비움 여부는 그 노드와 그 위의 **나가는** 조상들을 가까운 순서로 보아, 직전 커밋에서 세 층(노드 자신 > 그 노드를 가리키는 `controls.children` 항목의 `controls` > 그 노드를 직접 선언한 조각의 `controls`) 가운데 하나라도 명시된 첫 마디가 정하고(한 마디의 같은 층에 여럿이면 하나라도 유지면 유지), 끝까지 없으면 Form 속성이 정한다(WRITE-033).
그래서 자손이 스스로 적은 선언이 가까운 순서로 이긴다(자손의 `false`는 남긴다)(WRITE-033).
나가지 않는 조상의 정책은 내려가지 않는다(WRITE-033).
나가지 않는 조상과 나가지 않는 선언의 정책은 내려가지 않는다(WRITE-033).

세부 셋은 다음과 같다(WRITE-034).

- (가) 노드는 남고 그 노드를 선언한 조각만 꺼지는 "선언의 나감"(판별 union의 공유 객체 `addr` 아래 A 분기에만 있는 `zip`)도 사슬의 한 마디로 센다(WRITE-034). 그 층은 나가는 선언 안의 자기 키 > 나가는 선언 또는 나가는 노드의 부모 선언에 속한 `children` 항목 > 그 선언을 호스트의 직계 자식으로 적은 조각이며, 나가지 않는 선언의 층은 세지 않는다(WRITE-034).
- (나) 앞서 자기 게이트로 나가 원본을 든 채 잠복한 자손도 조상이 비움으로 나가는 순간 같은 사슬로 정해 비운다(WRITE-034). 잠복 자손 자신의 층은 직전 커밋에 효력이 있던 선언만 세므로 명시한 유지는 이긴다(WRITE-034). 앞선 호출에서 `DisableAutomaticWrites`로 억제된 잠복 원본도 뒤의 다른 호출에서는 비운다(WRITE-034).
- (라) 선언의 나감에서는 `extras`를 건드리지 않는다(WRITE-034).

남는 순서 의존 하나(조각에 명시한 유지가 조상보다 먼저 꺼진 경우)는 조각 범위 규칙의 귀결이다(WRITE-034).

함께 닫힌 것(17라운드 스웜 수렴(편집자 결정)): 비움으로 정해진 노드는 `raw`(잘못된 종류의 값 포함)와 `extras`를 모두 없음으로 한다(WRITE-035).
두 상태에는 자기 층이 없으므로 그 노드의 해석된 정책을 따른다(WRITE-035).

쓰기로 원본이 없어진 소멸(배열 아이템 `remove`, 통째 교체, 로드)은 나감이 아니다(WRITE-036).
`controls.children` 항목의 `controls.active: false`는 노드 게이트다(WRITE-036).
쓰기로 원본 자체가 없어져 노드가 사라지는 것(배열 아이템 `remove`, 통째 교체로 짧아진 배열, 로드)은 나감이 아니라 소멸이며 비움의 대상도, 억제 비트·원본 B의 기록 대상도 아니다(WRITE-036).
비객체 호스트 아래 자식은 존재하므로 나감이 아니다(WRITE-036).
부모 `controls.children` 항목의 `controls.active: false`(항목 게이트)는 노드 게이트와 같은 장치라 그 노드 자신의 나감이며 층(자기 키 > 그 항목을 포함한 `children` 항목 > 조각)을 그대로 센다(17라운드 스웜 수렴(편집자 결정))(WRITE-036).

노드 게이트 `controls.active: false`도 같은 장치라 `controls.active`는 정책대로 비우고 `controls.visible`은 언제나 보존한다(WRITE-039).

비용: 나감의 비움은 나간 하위 트리를 위에서 아래로 한 번 순회하며 조상의 정책을 인자로 내려보낸다(노드당 상수, 위로 거슬러 오르지 않는다)(WRITE-040).
청사진이 "하위 트리에 정책 선언 없음"을 미리 표시하면 Form 속성이 꺼져 있을 때 순회를 건너뛴다(WRITE-040).
꺼진 조각이 선언한 하위 트리와 잠복 하위 트리의 순회가 더해지며(노드당 상수), 이것은 SETTLE-017의 비용의 상한(재계산 목록과 자동 쓰기 기록만 순회한다)에 둔 예외다(WRITE-040, SETTLE-017).

### 02-node-and-value.md §3.9 core가 값을 바꾸던 곳

(WRITE-022, WRITE-023, WRITE-024, WRITE-025, WRITE-026)

| 오늘의 동작 | 새 원칙에서 |
| ---------- | ---------- |
| 배열을 `minItems`까지 채우기, `maxItems` 초과 `push` 차단 | **입력 컴포넌트로.** core는 제약을 유효 스키마로 노출하고 위반은 검증이 알린다 |
| nullable이 아닌 객체의 `null`을 `{}`로 바꾸기(S7), 비객체 값 버리기 | **폐기.** 보존·방출하고 type 에러를 낸다. 동작 변화로 기록한다(F27, GOAL-075) |
| `Normalize`의 미선언 키 제거 | **폐기.** 미선언 키는 `extras` 칸에 보존하고 받은 순서로 방출한다(E16) |
| 분기 전환·`active` 전이의 reset — 오늘의 동작(12·14라운드 탐침): 꺼지면 원본을 지우고, 다시 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 되돌린다. 뒤의 전체 교체는 이 복원 값을 바꾸지 않는다. `oneOf` 전환에서 둘 다 없으면 앞 분기의 같은 이름·같은 타입 터미널 값을 잇는다 | **기본은 폐기.** 원본을 두고 방출에서만 뺀다. 같은 종류의 노드를 공유하므로 값이 남는다(BLUEPRINT-010). 원본까지 지우려면 작성자가 나감 정책 키를 켠다. 그때도 로드 값으로 복원하지 않고, 다시 생긴 노드는 채움(`controls.default` > `default`)을 받는다(WRITE-002, WRITE-090, SETTLE-005) |
| 조각이 켜질 때의 `default` 주입 | **채움으로 바뀐다.** 노드가 생길 때 한 번, 노드 단위, 원천은 `controls.default` > `default`(SETTLE-005) |
| `computed.derived`, `injectTo` | **남는다.** 예약 층의 `controls.derived`·`controls.injectTo`가 되며, 작성자가 명시한 쓰기이므로 이 원칙의 대상이 아니다. `controls.unsetValue`가 같은 부류로 더해진다 |
| 참조 그룹(`options.virtual`) | **현행 유지**(`options.virtual`로 유지하되 `required` 재작성은 버리고 `options` 그룹째 검증기 앞에서 지워진다, VALIDATE-034). 소유자: "virtual 은 스키마로 선언되는건 아니니까 그냥 둡시다. 유효성검증도 영향 없고." 참조 그룹 노드로의 전환(D-6)은 하지 않는다 |

오늘의 동작(꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값, 없으면 `default`로 복원)은 이주 항목이다(WRITE-041). 소유자: "onChange로 넘어가는 값에서 지워지는 게 기본값이면 된다."(WRITE-041). 13라운드 답 2의 되물음("차이는 재전환시 값의 잔류 여부인건가?")의 답: 차이는 셋이다(WRITE-041). 다시 켜질 때 옛 값이 되살아나는가, 꺼진 동안 읽히는가(잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`), 그 원본이 메모리에 남는가(WRITE-041, VALUE-029).

## 설계문서

- `design/02-node-and-value.md` §2.3 (VALUE-029)
- `design/02-node-and-value.md` §2.4 (VALUE-036)
- `design/02-node-and-value.md` §3.1 (WRITE-001, WRITE-002, WRITE-003, WRITE-004, WRITE-005, WRITE-006)
- `design/02-node-and-value.md` §3.2 (WRITE-007, WRITE-010, WRITE-015, WRITE-013)
- `design/02-node-and-value.md` §3.3 (WRITE-018, WRITE-021)
- `design/02-node-and-value.md` §3.4 (WRITE-019, WRITE-092)
- `design/02-node-and-value.md` §3.7 (WRITE-011, WRITE-012, WRITE-028)
- `design/02-node-and-value.md` §3.8 (WRITE-037, WRITE-031, WRITE-033)
- `design/02-node-and-value.md` §3.9 (WRITE-022, WRITE-023, WRITE-024, WRITE-025, WRITE-026)
