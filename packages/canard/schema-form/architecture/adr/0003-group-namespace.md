# ADR 0003 — 예약 층: 그룹 객체 셋 `controls`·`options`·`presentation`으로 값과 UI를 제어한다

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| CONTROLS-001 | 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`reviews/round-9-spec.md:26` 축8), 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0003-group-namespace.md:30`; 인라인 `FormTypeInput`의 암묵 터미널) | 17 |
| CONTROLS-002 | 소유자 답(`00-goals.md:144` G2), 소유자 답(`reviews/round-15-decisions.md:13` 5) | 15 |
| CONTROLS-003 | 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`), 소유자 답(`reviews/round-15-decisions.md:12` 4) | 15 |
| CONTROLS-004 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) | 17 |
| CONTROLS-005 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) | 17 |
| CONTROLS-006 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91) | 18 |
| CONTROLS-009 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:14` 6) | 15 |
| CONTROLS-010 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) | 17 |
| CONTROLS-011 | 소유자 답(`reviews/round-15-decisions.md:15` 7), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 편집자 결정(17라운드, ADR 0014 4판 채택; `PRESENTATION_KEY_SUSPECT`(가칭)) | 17 |
| CONTROLS-012 | 소유자 답(`reviews/round-15-decisions.md:14` 6), 소유자 답(`reviews/round-15-decisions.md:15` 7) | 15 |
| CONTROLS-013 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-10-owner-answers.md:27` E-18) | 15 |
| CONTROLS-014 | 소유자 답(`reviews/round-9-spec.md:25` 축7), 소유자 답(`reviews/round-15-decisions.md:13` 5) | 15 |
| CONTROLS-015 | 소유자 답(`adr/0003-group-namespace.md:46` 소유자 인용, ADR 안의 기록), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2) | 10 |
| CONTROLS-016 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-apply-spec.md:46` 숏컷 폐지), 소유자 답(`reviews/round-15-apply-spec.md:79` 숏컷 폐지), 소유자 답(`03-mental-model.md:37` 숏컷 폐지) | 15 |
| CONTROLS-017 | 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`) | 15 |
| CONTROLS-018 | 소유자 답(`reviews/round-15-decisions.md:10` 2), 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`) | 15 |
| CONTROLS-019 | 소유자 답(`reviews/round-15-decisions.md:10` 2), 소유자 답(`reviews/round-15-decisions.md:11` 3) | 15 |
| CONTROLS-020 | 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) | 10 |
| CONTROLS-021 | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) | 13 |
| CONTROLS-022 | 소유자 답(`reviews/round-9-spec.md:64` 예약 층의 뜻), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) | 10 |
| CONTROLS-023 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙) | 13 |
| CONTROLS-024 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2), 편집자 결정(13라운드, 네 층과 같은 층의 유지 우선 `reviews/round-13-owner-review.md:66`) | 17 |
| CONTROLS-025 | 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1) | 10 |
| CONTROLS-026 | 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환), 편집자 결정(9라운드 도출, `07-conclusions.md:276`) | 12 |
| CONTROLS-027 | 소유자 답(`reviews/round-15-decisions.md:11` 3), 편집자 결정(4라운드, 에지 발화 F11 `reviews/round-4-spec.md:144`) | 15 |
| CONTROLS-028 | 소유자 답(`reviews/round-10-owner-answers.md:29` E-21), 소유자 답(`reviews/round-10-owner-answers.md:39` E-21 되물음), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(13라운드, 둘째 발화원은 나감 `reviews/round-13-owner-review.md:65`) | 13 |
| CONTROLS-029 | 소유자 답(`reviews/round-12-owner-answers.md:15` 7 "input을 초기화"), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장), 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5) | 12 |
| CONTROLS-030 | 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15), 소유자 답(`reviews/round-10-owner-answers.md:21` D-14), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; children 그룹은 예외), 소유자 답(`reviews/round-15-decisions.md:14` 6) | 15 |
| CONTROLS-031 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-14-owner-answers.md:7` O-1) | 14 |
| CONTROLS-032 | 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:115`; 선언이 여럿일 때) | 17 |
| CONTROLS-033 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) | 10 |
| CONTROLS-034 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) | 10 |
| CONTROLS-035 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) | 10 |
| CONTROLS-036 | 소유자 답(`reviews/round-10-owner-answers.md:15` C-11) | 10 |
| CONTROLS-037 | 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:65`), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책) | 13 |
| CONTROLS-038 | 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:65`), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책) | 13 |
| CONTROLS-039 | 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-15-decisions.md:10` 2), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2) | 17 |
| CONTROLS-040 | 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:66`), 편집자 결정(13라운드, 13라운드 답 2로 닫힘 `07-conclusions.md:238`) | 13 |
| CONTROLS-041 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) | 13 |
| CONTROLS-042 | 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) | 10 |
| CONTROLS-043 | 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-12-owner-answers.md:21` §9 조각 식의 경로 기준) | 15 |
| CONTROLS-044 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어) | 13 |
| CONTROLS-045 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-10-owner-answers.md:25` E-13), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리), 소유자 답(`reviews/round-12-owner-answers.md:7` 1 Form 속성 `false`) | 13 |
| CONTROLS-046 | 편집자 결정(13라운드, 원장 §7 `03-mental-model.md:227`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-69; CONTROLS-082로 확정) | 18 |
| CONTROLS-047 | 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`) | 15 |
| CONTROLS-048 | 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`00-goals.md:143` G2), 소유자 답(`reviews/round-15-decisions.md:13` 5) | 15 |
| CONTROLS-049 | 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`), 소유자 답(`reviews/round-15-decisions.md:9` 1) | 15 |
| CONTROLS-050 | 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) | 15 |
| CONTROLS-051 | 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:21` 8), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) | 17 |
| CONTROLS-052 | 17라운드 스웜 수렴(편집자 결정, `adr/0003-group-namespace.md:147`), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:116` 터미널 전략) | 17 |
| VALIDATE-004 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(2라운드, `adr/0001-validator-input-invariant.md:10` S1), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 깊은 사본) | 18 |
| VALIDATE-005 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)) | 1 |
| VALUE-006 | 원리(`03-mental-model.md:72` P4), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2, 보충의 하위 트리 문장), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) | 17 |
| WRITE-031 | 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책; 별도 옵션), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 기본 유지), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15; `controls.children` 항목의 값 키), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리; Form 속성 층), 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:66`; 세부가 포괄을 덮음), 편집자 결정(15라운드 결정 2, `08-design-a-to-z.md:298`; 형용사 형), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:298`; Form 속성은 `boolean`만), 편집자 결정(12라운드 도출, `reviews/round-12-derivation.md:60`; 같은 층은 유지 우선) | 17 |

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

### 04-controls.md §1.1 두 층과 예약 그룹

방향은 소유자가 발의했다 — "form의 표시 제어의 자유권은 모두 & 키워드로 모으고, 이들은 FE에 귀속, 유효성 검증에 개입하지 않도록 한다." 그 `&`는 15라운드에 그룹 객체로 바뀌었고 뜻은 같다(CONTROLS-002).

값·형상을 바꾸는가 아니면 보이는 것만 바꾸는가, 그리고 때에 따라 바뀌는가 아니면 정적인가(CONTROLS-003). "코어가 읽는가"는 구현의 경계라 기준이 아니다(CONTROLS-003).

(CONTROLS-001)

| 층 | 무엇 | 하는 일 | 하지 않는 일 |
| --- | --- | --- | --- |
| JSON Schema 층 | 표준 키워드 전부. 맨 키는 모두 이 층의 것이다 | 검증기에 그대로 간다. 폼은 노드 트리의 모양을 정하는 문법(`type`, `properties`, `items`, `prefixItems`, `if/then/else`, `allOf` 항목, `oneOf`·`anyOf`의 분기)와 표준 `readOnly`만 읽는다(원리 P1′(폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐), SCHEMA-001, SCHEMA-003). 모르는 맨 키는 확장 키워드로 보아 검증기에 넘기고 폼은 읽지 않는다 | 값을 채우지도 바꾸지도 지우지도 않는다. 표준 `default`는 노드가 생길 때 채움의 원천으로만 읽히고, 표준 `readOnly`는 잠금으로 읽힌다 |
| 예약 층 | 폼 전용 키 전부. 그룹 객체 셋 안에만 있다. `controls`(값·형상을 때에 따라 바꾸는 규칙과 정책. 정착 루프가 읽는다), `options`(값·형상의 정적 설정. 청사진과 투영이 읽는다), `presentation`(보이는 것. 렌더 계층만 읽는다(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층이 청사진에 넘기는 판정 함수가 정한다, 17라운드 스웜 수렴(편집자 결정))). `controls`·`options` 안의 모르는 키는 청사진 오류다. `presentation`의 모르는 키는 플러그인 자유 칸이다. | 값과 UI를 제어한다(축 6항(`controls`의 키는 값을 제어하는 층이다)). 게이트, 잠금과 숨김, 값의 출처, 에지에서의 동작, 자식 집합 제어, 명시 판별, 정적 형상, 표현 | 판정에 닿지 못한다(목표 G2(폼의 동작은 세 층으로 나뉘고, 아래층은 위층을 모른다)). 검증기는 예약 층의 키를 보지 않는다 |

예약 층의 `controls`에는 게이트·잠금·숨김·값 규칙·자식 제어·판별·의존 선언을 두고, `options`에는 `terminal`, `virtual`, `propertyKeys`, `omitEmpty`, `omitTrailing`, `trim`을 둔다(CONTROLS-001). `trim`은 포커스 아웃 때 문자열 동작 행의 `finishInput` 칸이 판단한다(17라운드 소유자 답 R17-3)(CONTROLS-001). `presentation`에는 `formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, 플러그인 자유 칸을 둔다(CONTROLS-001). 평면 `&` 축약은 없다(15라운드, CONTROLS-016. 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다)(CONTROLS-001). 검증기에 넘기기 전에 키워드 위치의 그룹 객체 셋을 지운다(규칙 하나)(CONTROLS-001, VALIDATE-004). 오늘 맨 키로 쓰는 `disabled`·`visible`·`active`는 `controls`로, `terminal`·`virtual`·`propertyKeys`는 `options`로, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`와 플러그인의 `options` 자유 칸은 `presentation`으로 옮긴다(이주)(CONTROLS-001). `options.trim`은 `options`에 남는다(17라운드 소유자 답 R17-3)(CONTROLS-001). `options.virtual`은 그대로 두되 오늘의 `required` 재작성(가상 이름을 실제 자식 이름으로 펼침)은 버린다(CONTROLS-001).

`discriminator`의 단계는 키마다 단계를 적은 키 표가 정한다(CONTROLS-001, CONTROLS-009, CONTROLS-031). `watch`의 단계도 키마다 단계를 적은 키 표가 정한다(CONTROLS-001, CONTROLS-009, CONTROLS-032). 그룹의 읽는 이는 그룹을 가르는 기준이 아니다(CONTROLS-001, CONTROLS-009, CONTROLS-003).

(CONTROLS-009, CONTROLS-010, CONTROLS-011)

| 그룹 | 뜻 | 읽는 이 | 키 |
| --- | --- | --- | --- |
| `controls` | 값·형상을 **때에 따라** 바꾸는 규칙과 정책 | 정착 루프 | `active` `visible` `readOnly` `disabled` `default` `derived` `injectTo` `unsetValue` `resetInteraction` `unsetOnInactive` `children` `discriminator` `watch` |
| `options` | 값·형상의 **정적** 설정 | 청사진과 투영 | `terminal` `virtual` `propertyKeys` `omitEmpty` `omitTrailing` `trim`(포커스 아웃 때 문자열 동작 행이 자른다, 17라운드 소유자 답 R17-3) |
| `presentation` | 보이는 것 | 렌더 계층만(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수가 정한다) | `formType` `FormTypeInput` `FormTypeInputProps` `FormTypeRendererProps` `errorMessages`, 플러그인 자유 칸(`trim`은 `options`의 키다. `presentation`에 적은 `trim`은 `controls`·`options`의 키 이름이라 개발 모드 경고 `PRESENTATION_KEY_SUSPECT`(가칭)의 대상이다, ERROR-164) |

`options.trim`은 포커스 아웃 때 저장값을 자른다(17라운드 소유자 답 R17-3)(CONTROLS-010, CONTROLS-004). 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층이 넘기는 판정이다(17라운드 스웜 수렴(편집자 결정), 소유자 통보 1 허용)(CONTROLS-011). 그룹 이름은 명사이고 수는 뜻을 따른다(CONTROLS-012). 셀 수 있는 항목의 지도는 복수(`controls`, `options`. JSON Schema가 `properties`·`$defs`처럼 이름 붙은 항목의 지도를 복수로 쓰는 관례와 같다), 하나의 면은 단수(`presentation`)(CONTROLS-012). 병합은 그룹 단위로 병합표를 적용한다(15라운드)(CONTROLS-013, SCHEMA-008, SCHEMA-009, SCHEMA-010, SCHEMA-012, SCHEMA-013, SCHEMA-039).

### 04-controls.md §1.2 제어 선언의 철자와 대체 표현

JSON Schema 층의 표현은 예약 층의 표현으로 대체할 수 있어야 한다(축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다))(CONTROLS-014). `if/then/else`의 조각은 조각 객체의 `controls.active`로, 표준 `default`는 `controls.default`로, 표준 `readOnly`는 `controls.readOnly`로, `oneOf`·`anyOf` 분기의 `const`·`enum`은 `controls.discriminator`로 옮길 수 있다(CONTROLS-014).

제어 키는 `controls` 안에만 적는다(CONTROLS-016). 평면 `&키` 축약과 `computed` 별칭은 없다(15라운드)(CONTROLS-016). 그룹이 "이 키는 폼의 것"이라는 표시를 하므로 `&`가 하던 둘째 일은 사라졌고, 남은 평평한 철자 하나를 위해 우선순위 규칙·이중 타입·이중 문서를 치르는 것은 목표 G4(하나의 개념에 하나의 장치)에 걸린다(CONTROLS-016). 서버 스키마에 넘길 때는 그룹 셋을 지우면 끝이고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다(CONTROLS-016).

표준 키워드와 `controls`의 키는 다른 층의 두 선언이다(CONTROLS-017). `controls.readOnly`는 표준 `readOnly`의 표현식 판이고, `controls.default`는 표준 `default`보다 앞서는 채움의 원천(값)이다(CONTROLS-017). 그룹 아래라 이름이 같아도 구별된다(CONTROLS-017).

### 04-controls.md §1.3 검증과 코어의 경계

`controls.active`가 거짓이어서 값이 방출에서 빠진 결과를 검증기가 어떻게 판정하는지는 스키마 작성자의 책임이다(CONTROLS-015). 소유자: "active를 쓰면 값이 제거되는데, 그건 사용자 책임으로 생각한다. 어쨌거나 유효성 검증에 직접 개입하는 건 아니니."(CONTROLS-015). 잘못된 스키마에 대해 폼은 개발 모드에서 고지할 의무만 진다(소유자 답 A-2)(CONTROLS-015). 컨벤션을 어긴 양의 순환 스키마에는 A-2의 고지 의무를 적용하지 않는다(답 19가 이긴다)(CONTROLS-015, TEST-061).

BE가 같은 스키마를 자기 검증기에 넣을 때: 미지 키워드를 무시하는 검증기면 아무것도 하지 않아도 되고, strict면 같은 그룹 셋을 지운다(CONTROLS-047).

【추론】 (1) core는 `app/plugin`을 가져오지 않는다(CONTROLS-075). 【추론】 검증기는 VALIDATE-044의 순서로 바인딩 계층이 골라 트리 생성 인자로 넘긴다(CONTROLS-075, VALIDATE-044). 【추론】 보고기·터미널 판정 함수가 이미 쓰는 통로와 같다(CONTROLS-075). 【추론】 core만 쓰는 호스트는 `nodeFromJSONSchema`의 선택 인자로 직접 넘긴다(오늘도 있다, `src/core/nodeFromJSONSchema.ts:23`)(CONTROLS-075). 【추론】 `PluginManager`의 검증기 칸은 바인딩 계층이 읽는 등록소로 남는다(CONTROLS-075). 【추론】 PR-4의 경계 린트는 새 fractal(`src/core/{blueprint,record,behaviors,navigation,settle,dispatch,validation,SchemaNode}/**`)에 건다(CONTROLS-075). 【추론】 `src/core/**` 전체로 넓히는 것은 PR-7이다(CONTROLS-075). 【추론】 타입 쪽 의존은 GOAL-088에서 다룬다(CONTROLS-075, GOAL-088).

### 04-controls.md §1.4 표현 층과 인라인 입력

터미널 판정은 렌더 계층의 판정 함수로 옮겨 core는 React 구성 요소를 판정하지 않는다(17라운드 스웜 수렴(편집자 결정), 통보 1은 17라운드 소유자 답으로 허용)(CONTROLS-052). 인라인 `FormTypeInput`을 꽂은 객체·배열 노드가 터미널이 되는 암묵 규칙은 소유자가 의도된 기능이라 한 것이므로(NODE-027) 유지하되 렌더 계층의 기능으로 옮긴다(CONTROLS-052). 렌더 계층(React 바인딩)이 노드 선언의 `presentation.FormTypeInput`이 있고 `null`이 아닌지를 보는 판정 함수를 청사진에 넘기고, 청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다(CONTROLS-052, NODE-028). 이 순서는 두 행을 가진 종류(object·array)에만 적용되고, 행이 하나인 종류는 전략을 그 행에서 정한다(CONTROLS-052, NODE-047). core는 `presentation`을 그룹 객체로 병합하고 검증기 앞에서 지울 뿐 그 안의 키를 읽지도 해석하지도 않으며(원리 P5(core는 렌더러를 모른다)), core만 쓰는 호스트에는 암묵 규칙이 없다(17라운드 스웜 수렴(편집자 결정), 소유자 통보 1 허용)(CONTROLS-052, GOAL-031).

【추론】 (2) 인라인 구성 요소를 담은 스키마는 직렬화할 수 없고, 이를 풀 장치를 두지 않는다(CONTROLS-076). 【추론】 직렬화할 수 있는 길은 `presentation.formType`과 `formTypeInputMap`·`formTypeInputDefinitions`다(CONTROLS-076). 【추론】 core는 스키마를 직렬화하지 않는다(CONTROLS-076). 【추론】 사본은 `presentation`을 지우고, 같은 스키마 비교는 JSON 밖 칸을 참조로 본다(CONTROLS-076, VALIDATE-004, LANDING-039).

【추론】 `alias`·`placeholder`는 그룹 키가 아니다(CONTROLS-081). 【추론】 둘 다 오늘처럼 `FormTypeInputProps` 안의 키이며, `FormTypeInputProps`가 `presentation`으로 옮겨 가므로 `presentation.FormTypeInputProps.alias`·`presentation.FormTypeInputProps.placeholder`가 된다(CONTROLS-081, CONTROLS-051). 【추론】 렌더 계층은 이 둘을 해석하지 않고 오늘처럼 입력 구성 요소의 prop으로 펼쳐 넘긴다(CONTROLS-081). 【추론】 `presentation`의 스키마 타입에는 `className`·`style`과 함께 문서화된 선택 키로 남긴다(선택 키가 하나도 없는 타입은 GOAL-088을 따른다)(CONTROLS-081). 【추론】 맨 키 `placeholder`는 폼 키가 아니다(CONTROLS-081). 【추론】 맨 키 `placeholder`는 JSON Schema 층의 모르는 키로 검증기에 가고 폼은 읽지 않는다(CONTROLS-081). 【추론】 `errorMessages`는 이미 `presentation.errorMessages`로 정해졌고, `presentation`은 통째로 검증기 앞에서 지워진다(CONTROLS-081, CONTROLS-051, LANDING-031).

### 04-controls.md §1.5 제어 선언의 부류와 단계

부류가 형과 동작을 예측하게 한다(CONTROLS-019). 형용사는 참인 동안 유지되는 상태, 명사는 값의 출처, 동사는 참이 되는 순간의 동작, 선언은 구조다(CONTROLS-019).

(CONTROLS-019)

| 부류 | 형 | 키 |
| --- | --- | --- |
| 형용사 | `boolean` 또는 식→`boolean`. 참인 동안 | `active` `visible` `readOnly` `disabled` `unsetOnInactive` |
| 명사 | 값의 출처 | `default`(값), `derived`(식→값), `injectTo`(함수→`{ 경로: 값 }`. 남에게 주는 값의 출처) |
| 동사 | `boolean` 또는 식→`boolean`. 참이 되는 순간 | `unsetValue` `resetInteraction` |
| 선언 | 구조 | `children`(배열), `discriminator`(문자열), `watch`(문자열 배열) |

형용사·동사 키와 `controls.derived`의 문자열 값은 언제나 식이다(CONTROLS-018). 문자열 상수는 `"'KRW'"`처럼 따옴표 안에 적는다(CONTROLS-018). `controls.default`는 값이고, 선언 부류의 문자열은 식이 아니다(`discriminator`는 키 이름, `watch`는 경로)(CONTROLS-018, CONTROLS-019, CONTROLS-031, CONTROLS-032).

단계는 작업 루프(표시 → 계산 → 파생 → 전이 → 커밋 → 통지 → 검증)의 이름이다(CONTROLS-020, SETTLE-001).

### 04-controls.md §1.6 식의 기준점과 값 읽기

**식의 기준점(15라운드).**(CONTROLS-043) 모든 JSON Pointer는 그것을 선언한 노드를 기준으로 푼다(CONTROLS-043). 노드는 그 자체로 행위의 원천이자 네임스페이스다(CONTROLS-043). `oneOf`·`allOf`·`then` 조각, `controls.children` 항목, `controls.discriminator`가 만드는 게이트는 모두 호스트 스키마 안의 선언이므로 호스트가 기준이다(CONTROLS-043). 조각은 같은 네임스페이스의 다른 표현 위치이지 다른 네임스페이스가 아니다(소유자)(CONTROLS-043). `if` 부속 스키마가 검증기에 의해 호스트 인스턴스에 대고 평가되는 것과 같은 자리다(CONTROLS-043). 5차 본문이 조각 식의 기준을 "호스트의 직계 자식 자리"로 두었던 것은 편집자의 도출이었고 이 판에서 되돌렸다(CONTROLS-043). `.`·`..`는 폼의 확장 표기이므로 폼이 정당하고 일관되게 처리한다(소유자 12라운드)(CONTROLS-043). 자식에 적던 식을 `controls.children`으로 옮기면 `../x`를 `./x`로 고친다(CONTROLS-043).

【추론】 (1) 문법: 식은 JavaScript 식 하나이거나 `{ … }`로 감싼 문장 몸통(값은 `return`으로 낸다)이다(CONTROLS-080). 【추론】 청사진이 경로 토큰을 뽑아 인자 배열 참조로 바꾸고 `new Function`으로 컴파일한다(CONTROLS-080). 【추론】 오늘의 토크나이저 `JSON_POINTER_PATH_REGEX`와 `getFunctionBody`를 그대로 옮긴다(CONTROLS-080). 【추론】 형용사·동사 키의 식은 `!!`로 불리언이 된다(CONTROLS-080). 【추론】 식은 작성된 스키마 위치마다 한 번 컴파일하고, 그 위치의 모든 노드(배열 아이템 포함)가 결과를 공유한다(CONTROLS-080). 【추론】 컴파일 실패는 이미 정한 대로 청사진 오류다(CONTROLS-080). 【추론】 문자열 상수와 식의 구분은 CONTROLS-018대로다(CONTROLS-080, CONTROLS-018).

【추론】 (2) 전역 이름: 허용 목록도 차단 목록도 두지 않는다(CONTROLS-080). 【추론】 식 몸통은 오늘처럼 JS 전역 스코프를 본다(CONTROLS-080). 【추론】 계약상 식의 입력은 경로 토큰과 `@`뿐이다(CONTROLS-080). 【추론】 시간·난수·바깥 가변 상태를 읽는 식은 결정적이지 않아 지원 범위 밖이며, 폼은 이를 막지 않는다(CONTROLS-080). 【추론】 스키마 안의 식은 코드이므로 신뢰할 수 없는 출처의 스키마는 오늘처럼 지원 범위 밖이다(CONTROLS-080).

【추론】 (3) 토큰: 경로 토큰은 오늘 그대로 `./p`, `../p`(되풀이할 수 있다), `/p`다(CONTROLS-080). 【추론】 `#/p`는 `/p`와 같다(RFC 6901의 URI 조각 표기)(CONTROLS-080). 【추론】 `#` 단독과 `(/)`는 루트의 값이다(CONTROLS-080). 【추론】 `@`는 맥락이다(CONTROLS-080). 【추론】 `@/p`는 경로가 아니다(CONTROLS-080). 【추론】 맥락 안의 값은 `@.x`나 `@['x']`처럼 JS로 읽는다(CONTROLS-080). 【추론】 기준점은 CONTROLS-043대로다(CONTROLS-080, CONTROLS-043). 【추론】 경로 조각 안의 `[n]`은 색인이 아니라 이름의 일부다(CONTROLS-080).

【추론】 (4) `*`: 식과 `controls.watch`의 경로에서 `*` 조각은 지원하지 않는다(CONTROLS-080). 【추론】 쓰면 청사진 오류(식 컴파일 실패와 같은 분류)다(CONTROLS-080). 【추론】 `*`는 `findNodes`와 `formTypeInputMap` 키의 표기로만 남는다(CONTROLS-080). 【추론】 같은 표현은 배열 전체를 읽어서 한다(예: `(../items).some(i => i.price > 0)`)(CONTROLS-080).

【추론】 (5) 경로가 읽는 값: 경로는 방출 트리의 값을 읽는다(CONTROLS-080). 【추론】 루트의 방출 값(`outputValue`)에서 그 절대 경로를 따라 JSON Pointer처럼 내려간 값이며, 조상의 투영이 뺀 키는 `undefined`다(CONTROLS-080). 【추론】 계산 단계의 게이트에게 방출 트리는 이번 계산의 현재 상태이고, 바퀴 안이면 그 바퀴의 G다(CONTROLS-080, FRAGMENT-016). 【추론】 게이트, 상태 키, `derived`, `unsetValue`, `resetInteraction`, `watch`의 `watchValues`가 모두 이 규칙 하나를 따른다(CONTROLS-080). 【추론】 `controls.unsetOnInactive`의 식은 직전 커밋의 방출 트리를 읽는다(17라운드 통보 2)(CONTROLS-080, CONTROLS-024, WRITE-038). 【추론】 원본과 잠복 원본은 식이 읽지 못한다(CONTROLS-080). 【추론】 잠복 원본은 `node.inactiveValues`로만 읽는다(CONTROLS-080). 【추론】 노드가 없는 곳도 값 수준으로 읽힌다(CONTROLS-080). 【추론】 `extras`의 키, 터미널 노드 안(`./tags/0`)이 그렇다(CONTROLS-080). 【추론】 합성 노드를 읽는 식은 그 하위 트리 전체에 기댄다(CONTROLS-080). 【추론】 따라서 역의존 조회는 값이 바뀐 노드의 경로와 그 조상·자손 경로를 읽는 식을 모두 찾는다(CONTROLS-080, SETTLE-017). 【추론】 식의 경로는 객체의 자기 키와 배열의 색인으로만 내려가고 원시 값 아래는 `undefined`다(CONTROLS-080, BLUEPRINT-036). 【추론】 그래서 union 값이 `"abc"`일 때 `./slot/length`는 `undefined`다(CONTROLS-080, CONTROLS-085).

【추론】 (6) 비활성·없는 노드: 형상에 없는 노드(게이트가 거짓인 노드, 꺼진 분기의 노드)는 방출이 없으므로 `undefined`로 읽힌다(CONTROLS-080). 【추론】 청사진에 자리가 없는 경로도 오류나 경고 없이 (5)의 규칙으로 읽는다(CONTROLS-080). 【추론】 선언되지 않은 키면 `extras`의 값, 아니면 `undefined`다(CONTROLS-080).

【추론】 (7) 배열: 색인은 `/n` 조각으로 읽는다(`../items/0/price`, 아이템 안에서 형제는 `../1`)(CONTROLS-080). 【추론】 길이는 배열의 방출 값에 JS로 `(../items).length`를 쓴다(CONTROLS-080). 【추론】 방출 값이므로 `omitTrailing`이 뺀 꼬리 아이템은 길이에 들지 않는다(CONTROLS-080). 【추론】 RFC 6901의 `-`와 음수 색인은 없다(`(../items).at(-1)`을 쓴다)(CONTROLS-080). 【추론】 아이템이 자기 색인을 읽는 문법은 두지 않는다(CONTROLS-080).

【추론】 (8) `@` 맥락: `@`의 값은 폼의 맥락 객체다(CONTROLS-080). 【추론】 `FormProvider`의 맥락과 Form 속성 `context`를 얕게 병합하고 같은 키는 Form 속성이 이긴다(CONTROLS-080). 【추론】 둘 다 없으면 `{}`다(CONTROLS-080). 【추론】 식에게는 읽기 전용이고 `controls.injectTo`의 대상이 될 수 없다(CONTROLS-080). 【추론】 맥락이 바뀌는 것은 입력이 바뀌는 것이다(CONTROLS-080). 【추론】 바인딩이 바뀐 맥락을 루트에 전하면 정착 하나가 돈다(CONTROLS-080). 【추론】 원본은 표시하지 않고, 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산 목록에 넣는다(CONTROLS-080). 【추론】 바뀜의 기준은 오늘처럼 스냅숏이라, 깊이 같은 값은 같은 참조로 본다(CONTROLS-080). 【추론】 `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게 이 변경은 에지다(CONTROLS-080). 【추론】 기준점은 SETTLE-004대로 따르고, 같음 판정은 SETTLE-043을 따른다(CONTROLS-080, SETTLE-004, SETTLE-043). 【추론】 `injectTo`는 자기 방출 값의 에지에만 발화하므로 맥락 변경으로는 발화하지 않는다(CONTROLS-080). 【추론】 로드 때는 로드 시점의 맥락으로 평가한다(CONTROLS-080).

【추론】 (3) 틀린 형을 게이트와 식이 볼 때, 폼은 값을 가르지 않는다(CONTROLS-074). 【추론】 게이트와 식은 형이 틀린 값을 거르지 않은 방출 트리 하나를 읽되(CONTROLS-080 (5)), 객체가 아닌 원본을 든 객체 호스트 자신의 게이트 입력은 FRAGMENT-016대로 `{}`다(CONTROLS-074, CONTROLS-080, FRAGMENT-016). 【추론】 `if` 게이트의 판정(수 아닌 값에 `minimum`이 참)은 검증기의 JSON Schema 의미이며 폼이 바꾸지 않는다(CONTROLS-074). 【추론】 작성자 안내에 "`if` 서브스키마에 `type`을 함께 적는다"를 넣는다(CONTROLS-074). 【추론】 `controls` 식이 틀린 형에서 던지면 이미 정한 대로 `EXPRESSION_THREW`, `degraded`, 제출 거부가 된다(CONTROLS-074). 【추론】 검증기 유무와 무관하다(R17-1)(CONTROLS-074). 【추론】 식 언어 명세(CONTROLS-080)에 "식은 형이 틀린 값을 만날 수 있고, 던지면 식 실패다. `typeof`로 지킨다"를 적는다(CONTROLS-074).

【추론】 게이트와 식은 어긋난 값도 거르거나 변환하지 않고 보므로, `['number','string']` 판별 키에 기본 입력으로 친 `"1"`은 `const: 1` 분기를 켜지 않는다(CONTROLS-085, CONTROLS-074, FRAGMENT-008). 【추론】 식의 경로는 객체의 자기 키와 배열의 색인으로만 내려가고 원시 값 아래는 `undefined`다(CONTROLS-085, CONTROLS-080, BLUEPRINT-036). 【추론】 그래서 union 값이 `"abc"`일 때 `./slot/length`는 `undefined`다(CONTROLS-085).

### 04-controls.md §1.7 제어 키의 동작

(CONTROLS-021, CONTROLS-022, CONTROLS-023, CONTROLS-024, CONTROLS-025, CONTROLS-026, CONTROLS-027, CONTROLS-028, CONTROLS-029, CONTROLS-030, CONTROLS-031, CONTROLS-032, VALUE-029)

| 키 | 뜻 | 단계 | 부류 |
| --- | --- | --- | --- |
| `active` | 게이트. 거짓이면 그 노드는 형상에 없다 — 숨겨지고 방출에서 빠진다. 원본은 기본으로 남아 `node.inactiveValues`로 읽는다. 나감 정책 키를 켜면 나갈 때 한 번 비운다(CONTROLS-024). 노드 스키마에 쓰면 노드 게이트, 조각 객체에 쓰면 조각 게이트이며, 두 범위는 한 장치다. 거짓에서 참이 되면 노드가 생기므로 그때 없음이면 채운다 | 계산 — 호스트 바퀴 안에서 `if` 가드와 같이 평가 | 형용사 |
| `visible` | 거짓이면 숨기기만 한다. 방출은 그대로다. 전환은 노드 생성이 아니다 | 계산의 끝 | 형용사 |
| `readOnly`, `disabled` | 잠금. 그 노드에만 걸린다. 값·형상·방출을 바꾸지 않는다 | 계산의 끝에서 한 번(코어에 글로벌 없음) | 형용사 |
| `unsetOnInactive` | 나감 정책이 참으로 정해진 노드가 나갈 때 원본을 한 번 비운다. 기본 꺼짐. 네 층(노드 > `children` 항목의 `controls` > 조각의 `controls` > Form 속성), 같은 층은 하나라도 유지면 유지. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, WRITE-033) | 전이 | 형용사(어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋의 것이며 나가는 순간 새로 평가하지 않는다. Form 속성은 `boolean`만) |
| `default` | 노드가 생길 때 값이 없음이면 채우는 원천. 표준 `default`보다 앞선다(`controls.default` > `default` > 없음). 이미 있던 노드는 다시 채우지 않는다 | 전이 | 명사(값) |
| `derived` | 의존 값이 바뀌는 에지에서 자기 값을 다시 계산해 원본을 덮는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 | 파생 | 명사(식) |
| `injectTo` | 자기 방출 값이 직전 커밋과 다를 때(에지) 다른 노드를 덮는다. 로드에는 직전 값이 없으므로 발화한다. 이름은 원천에 적고 대상을 가리키므로 방향을 남긴다(`inject`만 남기면 방향이 읽히지 않는다. 15라운드) | 파생 | 명사(함수) |
| `unsetValue` | 식이 거짓에서 참이 되는 에지에서 자기 값을 없음으로 만든다. 로드에서는 로드된 값으로 평가해 참이면 지운다. 지운 뒤의 입력은 남는다. 참에서 거짓이 되면 아무 일도 하지 않는다(값을 되살리지 않는다). 둘째 발화원은 정책이 참으로 정해진 노드의 나감이다(WRITE-030) | 파생(식), 전이(나감) | 동사 |
| `resetInteraction` | 식이 참이 되면 `dirty`·`touched`를 초기화한다. 값은 건드리지 않는다. 옛 이름 `pristine` | 커밋 | 동사 |
| `children` | 부모가 이름으로 가리킨 직계 자식에 제어를 건다. 형태는 `[{ targets: [...], controls: { readOnly, disabled, visible, active, default, derived, unsetValue, resetInteraction, unsetOnInactive } }]`이다. `targets`와 `controls`를 나누고, `controls`에는 상태 키뿐 아니라 값 키도 둔다(소유자 답 14·15). 안쪽 `controls`는 닫힌 목록이며 `children`·`injectTo`·`discriminator`·`watch`는 들지 않는다. 한 홉짜리 장치라 손자에 걸려면 자식 스키마에 `controls.children`을 적는다 | 안쪽 `controls`의 각 키가 위 행의 단계를 따른다 | 선언 |
| `discriminator` | 작성자가 union 호스트에 적은 판별 키 이름(`"discriminator": "kind"`). 청사진이 각 분기의 그 키의 `const`·`enum`을 읽어 분기별 `active: "./kind === 값"`으로 바꾸고 그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 O-1). 분기 스키마(`kind: { const }`, `required`)는 고치지 않는다(FRAGMENT-008) | 청사진 — 상태와 작업 루프를 바꾸지 않는다 | 선언 |
| `watch` | 의존 경로 선언. 값과 형상을 바꾸지 않는다. 경로의 값은 공개 prop `watchValues`(위치 배열)로 입력에 전달된다. 선언이 여럿이면 의존은 합집합, `watchValues`는 유효 스키마의 것(나중 승) | 청사진과 표시 | 선언 |

잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`가 있다(CONTROLS-021, VALUE-029). 로드에서 `active`가 거짓인 노드는 생기지 않고, 런타임에서는 거짓→참에 노드가 생겨 채움을 받는다(CONTROLS-021). `visible`은 형상·값·방출을 바꾸지 않는다(CONTROLS-022). `readOnly`·`disabled`는 그 노드의 입력을 잠그며 자손에 내려가지 않는다(CONTROLS-023).

`unsetOnInactive`에서 어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋(그 노드가 형상에 있던 마지막 커밋)의 것이다(CONTROLS-024). 로드에는 나감이 없다(CONTROLS-024). 로드에서는 형상의 모든 노드가 생긴 노드이고, 런타임에서 `default`는 생긴 노드에만 채운다(CONTROLS-025). `derived`의 식이 `undefined`면 쓰지 않는다(CONTROLS-026). 로드에서 `derived`는 직전 값이 없어 발화한다(CONTROLS-026). `injectTo`는 원천의 방출 값이 바뀔 때 대상에 전체 교체를 쓴다(CONTROLS-027). `resetInteraction`은 `unsetValue`와 같은 시점 규칙을 따른다(CONTROLS-029). `children`의 형태는 `controls: { children: [{ targets: ['name', 'email'], controls: { readOnly: './locked', unsetValue: '...' } }] }`이며, 안쪽 `controls`에는 상태 키뿐 아니라 값 키(`default`, `derived`, `unsetValue`, `resetInteraction`, `unsetOnInactive`)도 둔다(소유자 답 14·15)(CONTROLS-030). `children`의 자리는 객체 노드다(CONTROLS-030).

`discriminator`는 그 키의 분기 선언을 **게이트 없는 선언으로도 취급해 끌어올린다**(14라운드 확정)(CONTROLS-031). 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다(CONTROLS-031). 존재만 더하는 선언이며 제약은 교차하지 않는다 — 게이트 없는 분기와 같은 문맥, 편집자 도출(CONTROLS-031). 어느 분기에도 그 키의 `const`·`enum`이 없거나, 분기 선언의 종류가 서로 다르거나, `const`·`enum` 값이 두 분기에 겹치면 청사진 오류다(CONTROLS-031).

`watch`는 식이 읽는 경로를 정적으로 알 수 없을 때 작성자가 적는다(CONTROLS-032). 경로의 값은 순서대로 공개 prop `watchValues`로 입력에 전달된다(`src/types/formTypeInput.ts:59`)(CONTROLS-032). 선언이 여럿이면 의존은 모든 선언의 합집합(청사진, 정적)이고 `watchValues`는 유효 스키마의 `controls.watch`(켜진 선언 가운데 전순서에서 나중 것)이며 한 선언 안의 순서와 중복은 그대로다(17라운드 스웜 수렴(편집자 결정))(CONTROLS-032). `watch`의 형은 문자열 배열이며 단일 문자열은 받지 않는다(CONTROLS-032, CONTROLS-019).

### 04-controls.md §1.8 값 조작의 구분

없는 값 채우기는 채움(`controls.default`·`default`)이다(CONTROLS-033).

있는 값 바꾸기는 `controls.derived`(자기)와 `controls.injectTo`(남)다(CONTROLS-034).

있는 값 지우기는 `controls.unsetValue`(원본에서)와 `controls.active: false`(방출에서)다(CONTROLS-035).

런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다(소유자 답 11)(CONTROLS-036).

없음으로 만드는 장치는 `controls.unsetValue` 하나이고 발화원이 둘이다(CONTROLS-037).

### 04-controls.md §1.9 비활성 시 값 비우기

하나는 식의 거짓→참이고, 다른 하나는 정책이 참으로 정해진 노드의 나감이다(CONTROLS-038).

정책 키(`unsetOnInactive`, 이름은 소유자 13라운드 확정)는 형용사 형(`boolean` 또는 식→`boolean`, 15라운드 결정 2)이며 Form 속성은 `boolean`만이다(CONTROLS-039).

노드 자신 > `children` 항목의 `controls` > 조각 객체의 `controls` > Form 속성 순으로 세부가 포괄을 덮고, 같은 층에 여럿이면 하나라도 유지면 유지한다(CONTROLS-040).

기본은 유지다(13라운드 답 2)(CONTROLS-041).

### 04-controls.md §1.10 조각과 자식 제어

조각 객체(예: `allOf` 항목)에 둔 제어 키는 그 조각이 켜져 있는 동안 그 조각이 직접 선언한 호스트의 직계 자식에 걸린다(더 깊은 자손에는 그 자손을 직접 선언한 안쪽 조각의 `controls`가 걸린다)(CONTROLS-042). 조각 객체의 `controls.active`는 조각 게이트다(CONTROLS-042). 거짓이면 그 조각의 선언과 제약이 빠지지만, 다른 켜진 조각이 선언한 같은 노드는 존재한다(CONTROLS-042).
나감의 정책은 꺼지는 순간에도 적용한다(CONTROLS-042, WRITE-032).
조각 객체(`allOf` 항목, 분기, `then`)의 `controls.active`는 그 조각의 게이트이고, 그 밖의 제어 키(`controls.readOnly` 등)는 그 조각이 직접 선언한 호스트의 직계 자식에 조각이 켜진 동안 걸린다(조각 범위 제어)(CONTROLS-042).

조각 범위 제어와 `controls.children`은 조상에서 내려오는 상속이 아니라 명시한 대상에 거는 제어다(CONTROLS-044).
상태 키가 아닌 나감의 비움 정책 `unsetOnInactive`만은 나가는 객체·분기에 켠 정책이 함께 나가는 하위 트리로 내려간다(17라운드 소유자 답 R17-2 ㄴ, WRITE-033)(CONTROLS-044).
나감의 비움 정책 `unsetOnInactive`는 상태 키가 아니며, 13라운드 답 1의 둘째 예외로 함께 나가는 하위 트리에 내려간다(17라운드 소유자 답 R17-2 ㄴ, WRITE-033)(CONTROLS-044).

【추론】 PR-1·PR-2가 쓰는 부분은 (1)–(5)이고, PR-6이 쓰는 부분은 (6)–(7)이다(CONTROLS-073).
【추론】 (1) 대상 해석: `targets`의 이름은 그 `children` 선언을 가진 호스트 청사진의 직계 자식 이름으로 푼다(CONTROLS-073).
【추론】 자식 이름은 본체와 모든 조각 선언의 합집합이고, 끌어올린 판별 키와 가상 이름을 포함한다(CONTROLS-073).
【추론】 조각에서만 선언된 자식도 가리킬 수 있다(CONTROLS-073).
【추론】 같은 이름에 종류가 다른 노드가 여럿이면 모두에 걸린다(CONTROLS-073).
【추론】 (2) 청사진 오류: 청사진에 없는 이름이거나, 호스트의 전략이 터미널이라 자식 노드가 없으면 청사진 오류다(CONTROLS-073).
【추론】 (3) 형상에 없는 대상: 청사진에 있으나 지금 형상에 없는 대상은 오류가 아니다(CONTROLS-073).
【추론】 그 항목은 대상이 형상에 있는 동안만 효력을 가진다(CONTROLS-073).
【추론】 항목 자신의 `controls.active`는 (4)의 게이트로서 호스트에서 평가되어 대상의 존재를 정하며, 이 문장의 대상이 아니다(CONTROLS-073).
【추론】 그래서 `controls.children` 대상이 형상에 없을 때의 코드는 생기지 않는다(CONTROLS-073).
【추론】 (4) 항목 게이트의 전순서 자리: 항목의 `controls.active`는 노드 게이트와 같은 장치이므로 노드 게이트의 자리 규칙을 따른다(CONTROLS-073).
【추론】 곧 그 `children` 선언을 담은 조각(본체면 본체) 바로 뒤, 그 조각의 노드 게이트들 다음에 항목 순서대로 든다(CONTROLS-073).
【추론】 (5) 예산 셈: 호스트 바퀴와 전이 라운드 식의 '노드 게이트 수'는 `controls.active`를 가진 `children` 항목을 대상 수와 무관하게 항목마다 하나로 센다(CONTROLS-073, SETTLE-041).
【추론】 (6) 대상별 식: 항목 `controls`의 식은 기준점이 호스트이고 항목마다 한 번 평가되어 모든 대상에 같은 값으로 걸린다(CONTROLS-073).
【추론】 대상마다 다른 식은 항목을 나눠 적는다(CONTROLS-073).
【추론】 (7) 값 키: 값 키(`default`, `derived`, `unsetValue`, `resetInteraction`, `unsetOnInactive`)는 각 대상 노드에 그 키를 적은 것처럼 동작하되 층은 `children` 항목 층이다(CONTROLS-073).
【추론】 같은 대상에서는 조각의 `controls` < `children` 항목 < 노드 자신이다(CONTROLS-073).
【추론】 같은 층이면 전순서에서 나중이 이기고 한 배열 안이면 뒤 항목이 이긴다(CONTROLS-073).
【추론】 다만 `unsetOnInactive`는 CONTROLS-040대로 같은 층에 여럿이면 하나라도 유지면 유지한다(CONTROLS-073).
【추론】 `derived`는 대상마다 같은 값을 쓴다(CONTROLS-073).
【추론】 상태 키는 층 순서가 아니라 로컬 결합을 따른다(CONTROLS-073).
【추론】 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고(OR), 표시(`active`·`visible`)는 모두 참이어야 켜진다(AND)(CONTROLS-073).
【추론】 CONTROLS-046이 그대로다(CONTROLS-073, CONTROLS-082).

【추론】 조각 객체(`allOf` 항목, 분기, `then`/`else`)의 `controls`에 둘 수 있는 키는 `controls.children` 항목의 닫힌 목록과 같다: `active` `visible` `readOnly` `disabled` `default` `derived` `unsetValue` `resetInteraction` `unsetOnInactive`(CONTROLS-077).
【추론】 `active`는 조각 게이트이고, 나머지는 조각 범위 제어다(CONTROLS-077).
【추론】 `children`·`injectTo`·`discriminator`·`watch`는 청사진 오류다(CONTROLS-077).
【추론】 값 키는 조각이 켜져 있는 동안, 그 조각이 직접 선언한 호스트의 직계 자식마다 따로 걸린다(CONTROLS-077).
【추론】 각 대상에게는 조각 층의 선언으로 작용하며, 같은 값이나 같은 식이 대상 모두에 쓰인다(CONTROLS-077).
【추론】 식의 기준점은 호스트다(CONTROLS-077).
【추론】 `default`는 켜진 조각의 대상 노드가 생길 때 채움 원천이 된다(CONTROLS-077).
【추론】 그 순위는 노드 자신의 `controls.default` > `children` 항목 > 조각의 `controls.default` > 표준 `default`(유효 스키마) > 없음이다(CONTROLS-077).
【추론】 같은 층이면 조각 전순서에서 나중이 이긴다(CONTROLS-077).
【추론】 대상마다 다른 기본값은 조각 안의 자식 선언에 적는다(CONTROLS-077).
【추론】 `unsetValue`는 식 하나가 거짓→참이 되는 에지에서 대상 모두를 없음으로 만든다(CONTROLS-077).
【추론】 로드에서는 로드된 값으로 평가한다(CONTROLS-077).
【추론】 생긴 대상 노드에서 참이면 채우지 않는다(CONTROLS-077).
【추론】 `resetInteraction`은 식이 참이 되면 대상 모두의 `dirty`·`touched`를 비운다(커밋 단계)(CONTROLS-077).
【추론】 같은 대상에 여러 자동 쓰기가 겹치면 SETTLE-004의 순위와 층을 그대로 따른다(CONTROLS-077, SETTLE-004).
【추론】 조각이 켜지고 꺼지는 순간의 에지 기준은 FRAGMENT-050을 따른다(CONTROLS-077, FRAGMENT-050).
【추론】 새 오류 코드는 없다(기존 청사진 오류의 모르는 키 부류)(CONTROLS-077).

### 04-controls.md §1.11 노드 상태와 잠금

코어에는 글로벌이 없다(소유자 13라운드 답 1: "글로벌 readOnly 나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외.")(CONTROLS-045). 표준 `readOnly`와 `controls`의 키는 그 노드에만 걸린다(CONTROLS-045). 루트 스키마의 키는 루트 노드의 로컬 키이며, 오늘 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리는 사라진다(이주)(CONTROLS-045). 조상의 상태는 자손에 상속되지 않는다(소유자 답 13)(CONTROLS-045). 그래서 터미널이 아닌 객체 노드를 대상으로 한 잠금은 입력이 없으므로 효과가 없고(표준 `readOnly`는 청사진 경고), 배열 노드의 잠금은 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다(CONTROLS-045). `active`·`visible`은 구조상 하위 트리를 가린다(SCHEMA-010, CONTROLS-045). 자손을 거는 길은 부모의 `controls.children`과 켜진 조각의 `controls`뿐이다(CONTROLS-044, CONTROLS-045). Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금이며 코어의 상태가 아니다(원리 P5(core는 렌더러를 모른다), CONTROLS-045).
**로컬**은 노드 자신의 키와 `controls`의 식이다(CONTROLS-045).
오늘 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리와 README의 "Priority System"은 사라진다(CONTROLS-045).

로컬 층 안에서 상태 키가 여럿 겹칠 때(표준 `readOnly`, `controls.readOnly`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목)는 선언은 합집합·제한은 교집합의 원리대로 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다(CONTROLS-046).
코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(소유자 13라운드)(CONTROLS-046, CONTROLS-082).
이 결합은 18C-69의 편집자 결정(18라운드)으로 확정되어 소유자 확인을 기다리지 않는다(CONTROLS-046, CONTROLS-082).

【추론】 한 노드 위에서 로컬 선언이 겹칠 수 있는 자리는 넷이다: 노드 자신의 표준 `readOnly`, 자기 `controls.readOnly`·`controls.disabled`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목(CONTROLS-082).
【추론】 이것들이 겹치면 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고, 표시(`active`·`visible`)는 모두 참이어야 켜진다(CONTROLS-082).
【추론】 CONTROLS-046을 그대로 확정한다(CONTROLS-082).
【추론】 어느 자리의 `false`도 다른 자리의 잠금을 풀지 않는다(CONTROLS-082).
【추론】 어느 자리의 참도 다른 자리가 끈 표시를 되살리지 않는다(CONTROLS-082).
【추론】 결과는 선언의 순서와 자리에 따라 달라지지 않는다(CONTROLS-082).
【추론】 코어에 글로벌은 없다(CONTROLS-082).
【추론】 Form 속성의 전체 잠금은 렌더 계층이 이 결과 위에 OR한다(CONTROLS-045, 13라운드 답 1)(CONTROLS-082).
【추론】 이 결합은 잠금 키와 표시 키에만 적용한다(CONTROLS-082).
【추론】 값을 쓰는 규칙(`derived`·`injectTo`·`unsetValue`)이 한 노드에 겹치면, 값은 하나만 쓸 수 있으므로 층에서 세부가 이긴다(SETTLE-004)(CONTROLS-082).
【추론】 `unsetOnInactive`는 CONTROLS-040을 따른다(CONTROLS-082).
【추론】 D-7(SCHEMA-009, "조각의 주석이 본체를 덮음"에 대한 답)은 주석 키에 대한 답이다(CONTROLS-082).
【추론】 원장은 표준 `readOnly`를 주석이 아니라 상태 키, 곧 노드의 잠금으로 읽는다(CONTROLS-082).
【추론】 SCHEMA-003(13라운드 소유자 답 1로 닫힘)이 그렇게 적고, 병합표는 상태 키를 주석과 따로 적는다(SCHEMA-010)(CONTROLS-082).
【추론】 그래서 D-7은 잠금에 닿지 않고, 이 결합은 소유자 답과 어긋나지 않는다(CONTROLS-082).

(CONTROLS-070)

| 키워드 | 현재 | 새 설계 | 변화 | 근거 |
| ------ | ---- | ------- | ---- | ---- |
| `&readOnly`·`&disabled` | FormTypeInput 구현에 위임한다 | 유지 | 유지 | 동일 / CONTROLS-048 |

【추론】 잠금은 세 층이 나눠 맡는다(CONTROLS-083).
【추론】 (1) core는 노드의 잠금 상태만 계산한다(CONTROLS-083).
【추론】 쓰기를 거부하지 않으므로 공개 `setValue`와 자동 쓰기(`derived`·`injectTo`·채움)는 잠긴 노드에도 적용된다(CONTROLS-083).
【추론】 잠금은 값·형상·방출을 바꾸지 않는다(CONTROLS-083).
【추론】 (2) 렌더 계층은 실효 잠금(core의 잠금 OR Form 속성의 전체 잠금)을 입력 구성 요소의 `readOnly`·`disabled` prop으로 넘긴다(CONTROLS-083).
【추론】 실효 잠금이 켜진 동안에는 `handleChange`가 입력 쓰기를 버린다(CONTROLS-083).
【추론】 오늘은 노드의 잠금만 보고 버리므로(`src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:51`) 이 판단에 Form 속성의 잠금을 더한다(CONTROLS-083).
【추론】 (3) 잠긴 모양을 그리고 입력을 막는 것은 입력 구성 요소(`FormTypeInput`) 구현의 몫이다(CONTROLS-083).
【추론】 오늘과 같다(CONTROLS-083).

### 04-controls.md §1.13 포커스 아웃 값 다듬기

`trim`은 15라운드 결정 4대로 `options`의 닫힌 목록에 둔다(CONTROLS-004).

포커스 아웃 때 저장값을 자르며 입력마다 자르지 않는다(입력 중에 공백을 칠 수 있어야 한다)(CONTROLS-005).

판단은 문자열 동작 행의 `finishInput` 칸에 두고, 어댑터는 타입을 모르는 입력 마침 신호(`finishInput`)만 보낸다(CONTROLS-006).
그래서 React 어댑터에 문자열 전용 논리가 들어가지 않는다(CONTROLS-006).
【추론】 `trim`은 union 행의 `finishInput`이 맡으며, 현재 값이 문자열이면 자르고 그 결과를 `interpret`에 넘기고, 문자열이 아니면 아무것도 하지 않으며, 경고는 없다(CONTROLS-006).

### 04-controls.md §1.14 기존 키의 이주와 제거

- **남는다:**(CONTROLS-048) `controls` 식 시스템 전체 — JSON Pointer로 다른 노드의 값을 읽는 동적 함수와 CONTROLS-019의 키(CONTROLS-048). G2(FE 표현력 유지)의 근거다(CONTROLS-048). 오늘의 `computed` 컨테이너는 `controls`라는 이름으로 남는다(CONTROLS-048).

(CONTROLS-048)

| 키워드 | 현재 | 새 설계 | 변화 | 근거 |
| ------ | ---- | ------- | ---- | ---- |
| 표현식 문법과 참조 형식 | `#/path`·`./path`·`../path`·`/path`·`@`·`#`를 `new Function`으로 컴파일한다 | **JSON Pointer 동적 함수 전체 유지** | 유지 | `ComputedPropertiesManager/utils/regex.ts:84-101`, `createDynamicFunction.ts:41` / CONTROLS-048 |

- **흡수된다:**(CONTROLS-049) `&if`와 `computed.if`는 조각 범위의 `controls.active`로 흡수된다(CONTROLS-049). 분기 객체에 `&if`를 쓰던 스키마는 같은 식을 그 분기 객체의 `controls.active`로 옮긴다(CONTROLS-049). 기준점은 둘 다 호스트라 식은 그대로다(CONTROLS-049). JSON의 `if`가 이미 조각 게이트이므로 `&if`를 두면 같은 게이트의 셋째 철자가 되어 G4에 걸린다(CONTROLS-049).

- **사라진다:**(CONTROLS-050) 평면 `&키` 축약 전부(CONTROLS-050). 분기의 `const`·`enum`을 판별식으로 자동 감지하는 것(`getExpressionFromSchema.ts:35-51`)(CONTROLS-050). 폼은 `oneOf`·`anyOf`로 분기를 고르지 않는다(원리 P1′(폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐), CONTROLS-050). 판별이 필요하면 작성자가 `controls.discriminator`나 분기별 `controls.active`를 적는다(CONTROLS-050).

- **이주 항목:**(CONTROLS-051) `computed` → `controls`(별칭 없음), `&X` → `controls.X`, `&if`·`computed.if` → 분기 객체의 `controls.active`, 판별식 자동 감지 → `controls.discriminator` 또는 분기별 `controls.active`, `&pristine`·맨 키 `pristine` → `controls.resetInteraction`, `injectTo` → `controls.injectTo`, 맨 키 `disabled`·`visible`·`active` → `controls.*`, 루트 스키마 키 다섯의 특수 처리 제거, 맨 키 `terminal`·`virtual`·`propertyKeys` → `options.*`, 맨 키 `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`와 `options`의 플러그인 자유 칸 → `presentation.*`, `options.trim`은 `options`에 남고 포커스 아웃 때 문자열 동작 행이 자른다(17라운드 소유자 답 R17-3), 자식의 식을 `controls.children`으로 옮길 때 `../x` → `./x`, 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError` → `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`, Form 속성 `CustomFormTypeRenderer` → `FormTypeGroupRenderer`(같은 이름의 Form 속성 셋이 새로 생긴다), `ChildNodeComponentProps`와 `FormGroupProps`의 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록) → `FormTypeGroupRenderer`(CONTROLS-051).

【추론】 `virtualRequired`는 새 설계에 없고, 대체도 없다(CONTROLS-078).
【추론】 이 키를 만드는 곳은 `processVirtualSchema`의 `required` 재작성뿐이고(`src/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema/utils/transformCondition.ts:40-52`), 읽는 곳은 `BranchStrategy/utils`의 조건 사전뿐이다(`src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts:55,87`)(CONTROLS-078).
【추론】 새 설계는 재작성을 하지 않고(LANDING-019), 만드는 쪽과 읽는 쪽을 모두 PR-1에서 걷어 낸다(LANDING-081)(CONTROLS-078).
【추론】 따라서 `options`의 닫힌 목록에 넣지 않는다(CONTROLS-078).
【추론】 작성자가 맨 키로 적은 `virtualRequired`는 JSON Schema 층의 모르는 키로 검증기에 가며, 폼은 읽지 않는다(CONTROLS-001)(CONTROLS-078).

### 05-validation-and-errors.md §1.2 스키마 사본과 폼 전용 키

키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다(VALIDATE-004). 지우는 이유는 판정이 아니라 컴파일이다(VALIDATE-004). 작성된 스키마 자체는 변형하지 않고 검증기에 넘길 사본에서만 지운다(VALIDATE-001, VALIDATE-004). 오늘은 여섯 키(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)만 지우고 `&` 키·`computed`·`virtual`·`terminal` 등은 검증기까지 가므로, 그룹 셋으로 옮기는 것이 이주 항목이다(VALIDATE-004). 서버 스키마에 넘길 때도 같은 셋을 지우면 되고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다(VALIDATE-004).

**허용되는 스키마 변형은 하나다 — 폼 전용 키를 키워드 위치에서만 제거하는 것.**(VALIDATE-004) 현재 `stripSchemaExtensions`가 하는 일이고(`JSONSchemaScanner`로 위치를 구분한다) 그대로 둔다(목록은 그룹 객체 셋으로 닫힌다)(VALIDATE-004). 제거가 필요한 이유는 판정이 아니라 **검증기의 컴파일**이다: 폼 전용 키의 값에 순환하거나 깊은 객체가 있으면(`presentation.FormTypeInputProps`의 자기 참조, 개발 빌드의 React 엘리먼트) `ajv.compile`이 스택 초과로 죽는다(실행)(VALIDATE-004).

소비자의 커스텀 키는 라이브러리가 열거할 수 없으므로 지우지 않는다 — strict 모드는 기본이 아니다(VALIDATE-005, CONTROLS-001). 맨 키 가운데 폼이 모르는 것은 지우지 않는다(VALIDATE-005). 그것은 JSON Schema 층의 것(확장 키워드)이고 검증기의 몫이다(VALIDATE-005).

`options.virtual` 처리는 12라운드에 닫혔다: `options.virtual`은 제거 목록에 들고 `required` 재작성은 버린다(VALIDATE-034).

소유자(12라운드 8)는 "우리는 투명한 jsonSchema 를 추구하므로, virtual 여부와 무관한 실제 필드 명시를 요구하는 바이다"라고 답했다(VALIDATE-034).

- `&if`만으로 분기를 구분한 기존 스키마는 폼에서도 invalid가 된다(VALIDATE-036). 의도된 파괴적 변경이다(VALIDATE-036).

- `ENHANCED_KEY`, enhancer, `preprocessSchema`의 마커 주입, `__processCompositionValue__`의 마커 기록, `transformErrors`의 마커 필터가 모두 사라진다(VALIDATE-010). 이슈 #342 §3.1·§3.3·§3.4가 함께 사라진다(VALIDATE-010).
- `nodeFromJSONSchema`를 직접 부르는 경로와 `<Form>` 경로가 같은 계약을 갖게 된다(지금은 다르다)(VALIDATE-010).

## 설계문서

- `design/02-node-and-value.md` §2.3 (VALUE-006)
- `design/02-node-and-value.md` §3.8 (WRITE-031)
- `design/04-controls.md` §1.1 (CONTROLS-002, CONTROLS-003, CONTROLS-001, CONTROLS-009, CONTROLS-010, CONTROLS-011, CONTROLS-012, CONTROLS-013)
- `design/04-controls.md` §1.2 (CONTROLS-014, CONTROLS-016, CONTROLS-017)
- `design/04-controls.md` §1.3 (CONTROLS-015, CONTROLS-047)
- `design/04-controls.md` §1.4 (CONTROLS-052)
- `design/04-controls.md` §1.5 (CONTROLS-019, CONTROLS-018, CONTROLS-020)
- `design/04-controls.md` §1.6 (CONTROLS-043)
- `design/04-controls.md` §1.7 (CONTROLS-021, CONTROLS-022, CONTROLS-023, CONTROLS-024, CONTROLS-025, CONTROLS-026, CONTROLS-027, CONTROLS-028, CONTROLS-029, CONTROLS-030, CONTROLS-031, CONTROLS-032)
- `design/04-controls.md` §1.8 (CONTROLS-033, CONTROLS-034, CONTROLS-035, CONTROLS-036, CONTROLS-037)
- `design/04-controls.md` §1.9 (CONTROLS-038, CONTROLS-039, CONTROLS-040, CONTROLS-041)
- `design/04-controls.md` §1.10 (CONTROLS-042, CONTROLS-044)
- `design/04-controls.md` §1.11 (CONTROLS-045, CONTROLS-046)
- `design/04-controls.md` §1.13 (CONTROLS-004, CONTROLS-005, CONTROLS-006)
- `design/04-controls.md` §1.14 (CONTROLS-048, CONTROLS-049, CONTROLS-050, CONTROLS-051)
- `design/05-validation-and-errors.md` §1.2 (VALIDATE-004, VALIDATE-005)
