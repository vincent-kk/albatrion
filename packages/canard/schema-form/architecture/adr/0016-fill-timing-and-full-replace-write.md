# ADR 0016 — 채움 시점과 전체 교체 쓰기

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| ERROR-204 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| EVENT-071 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) | 18 |
| EVENT-072 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| WRITE-090 | 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) | 18 |
| WRITE-094 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96) | 18 |
| WRITE-095 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| WRITE-096 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) | 18 |
| WRITE-097 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) | 18 |

## 결정

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

### 02-node-and-value.md §3.6 노드 되돌림과 로드 스냅숏

reset이 로드하는 배열의 아이템 identity는 `setValue(V)`(`Overwrite`)의 통째 교체와 같은 PR-5의 규칙을 따르고 reset만의 예외를 두지 않는다(WRITE-048).
`setValue(V)`는 로드가 아니라 전체 교체 쓰기라 쓰기 표에서 reset과 다른 행이며, reset만의 예외를 두지 않는 근거는 모든 배열 통째 쓰기가 위치로 잇는다는 NODE-051이다(WRITE-048, WRITE-097).
규칙 자체는 NODE-051의 것이다(WRITE-048).
입력은 REACT-019의 입력 초기화로 초기화되므로 안전은 identity 규칙이 아니라 REACT-019의 범위에 기댄다(WRITE-048).
identity가 끊겨 새로 생긴 아이템은 가상화 기록이 없어 다시 지연된다(WRITE-048).

`FormHandle.reset`의 값 출처 규칙(prop)을 노드 `resetSubtree()`(오늘은 노드 생성 때의 값으로, `AbstractNode.ts:1138-1144`)에 옮기지 않는다(WRITE-049).
두 연산은 이름과 대상(폼의 prop 상태 대 노드 하위 트리)이 달라 한 개념의 두 장치가 아니다(WRITE-049).

【추론】 `resetSubtree()`와 게터 `defaultValue`를 남기고, 둘의 출처를 루트가 드는 로드 스냅숏으로 한다(WRITE-085).
【추론】 루트는 로드 스냅숏 하나를 든다(WRITE-085).
【추론】 경로 P에 값 V를 싣는 로드마다 `snapshot = setIn(snapshot, P, V)`로 고친다(WRITE-085).
【추론】 구조를 나눠 쓰므로 V와 스냅숏의 나머지는 복사하지 않고 P 위의 조상 칸만 새로 짓는다(로드 하나에 O(깊이))(WRITE-085).
【추론】 V는 바꾸지 않는 값으로 다룬다(WRITE-085, WRITE-013, WRITE-071).
【추론】 `node.defaultValue`는 `getIn(snapshot, node.path)`다(WRITE-085).
【추론】 로드가 그 경로에 닿기 전까지 같은 참조를 돌려준다(WRITE-085).
【추론】 `node.resetSubtree()`는 진입 하나에서 `clearSubtreeState()`를 한 뒤 `node.defaultValue`를 그 하위 트리에 로드한다(WRITE-085).
【추론】 로드이므로 빠진 키를 채우고(WRITE-090) 새 수명을 시작한다(WRITE-085, SETTLE-046).
【추론】 `FormHandle.reset()`은 커밋된 prop을 로드하고, 그 값이 스냅숏도 된다(WRITE-085, WRITE-049).
【추론】 스냅숏은 core 자신의 로드 기록이며 prop 규칙을 core로 옮긴 것이 아니므로 WRITE-049는 그대로다(WRITE-085, WRITE-049).
【추론】 배열 아이템은 자기 되돌림 값을 지킨다: 스냅숏은 위치가 아니라 신원을 따른다(WRITE-085).
【추론】 배열의 구조 연산은 그 경로의 스냅숏 배열도 고친다(WRITE-085).
【추론】 `remove(i)`·`pop`은 그 자리를 잘라 내고, `push(v)`·삽입은 새 아이템의 생성 값(`v`, 없으면 `undefined`라 되돌림이 채움을 받는다)을 넣는다(WRITE-085).
【추론】 이 비용은 스냅숏 배열에서 O(배열 길이)이며, 그 연산이 이미 하는 재색인과 같은 차수다(WRITE-085).
【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞추고 값은 싣지 않는다(WRITE-085, WRITE-095).
【추론】 배열 통째 로드는 그 경로의 스냅숏을 바꾸며, 로드는 위의 규칙을 그대로 따른다(WRITE-085).
"배열 통째 로드"는 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 싣는 배열이며, 로드가 아닌 배열 통째 쓰기의 스냅숏은 WRITE-095가 정한다(WRITE-085, WRITE-097).
`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(WRITE-085, WRITE-090).

【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞춘다(WRITE-095).
【추론】 없어진 아이템의 자리는 잘라 내고, 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣으며, 값은 싣지 않는다(WRITE-095, WRITE-085, WRITE-099).
【추론】 WRITE-090의 "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다"는 스냅숏의 값에 대한 말이다(WRITE-095).
【추론】 비용은 구조 연산과 같은 O(배열 길이)다(WRITE-095).
실패 장면: `defaultValue={items:['a','b']}`에서 `setValue({items:['x']})` 뒤 `setValue({items:['x','z']})`를 부르면 새 키 `#2`의 `defaultValue`가 사라진 `#1`의 값 `'b'`가 되고 `resetSubtree()`도 `'b'`로 되돌린다(WRITE-095).

- PR: PR-5(배열)(WRITE-095).
- 무엇: 위 실패 장면과, 입력 쓰기·`Merge`로 아이템 수를 바꾼 뒤 각 아이템의 `defaultValue`와 `resetSubtree()`를 본다(WRITE-095).
- 통과: 남은 아이템은 자기 되돌림 값을 지키고, 새 아이템의 `defaultValue`는 `undefined`라 `resetSubtree()`가 채움을 준다(WRITE-095).
- 실패: 스냅숏 배열이 신원과 어긋나면 자리 맞춤을 고친다(WRITE-095).

### 03-settle-and-events.md §2.6 배치의 경계와 값 읽기

`batch(fn)`은 fn 안의 쓰기를 표시만 하고, fn이 끝날 때 정착 한 번·파동 한 번을 낸다(EVENT-013).

**배치는 정착 횟수를 바꾸므로 값이 순차 호출과 다를 수 있다**(EVENT-019). 정착이 출발할 때 예약 층 규칙의 에지 기준점은 직전 커밋이고, 채움은 노드가 생길 때 한 번이다(EVENT-019). 그래서 순차 호출에서 첫 정착이 커밋한 값은 뒤 정착이 덮지 않지만, `batch`로 묶으면 정착이 한 번이라 중간 상태가 커밋되지 않는다(EVENT-019). 반례 E2: 분기 A는 `x`에 `default` `'A'`, 분기 B는 `'B'`일 때, `kind`를 `a`로 쓴 뒤 `b`로 쓰면 순차는 `x = 'A'`, 같은 두 쓰기를 `batch`로 묶으면 `x = 'B'`다(노드 단위 채움에서도 같다, 실행)(EVENT-019). 채움과 `controls.injectTo`의 결과가 이렇게 갈리는 것은 결함이 아니라 축의 귀결이며, `batch`의 문서 주석에 "배치는 정착 횟수를 바꾸므로 채움과 `controls.injectTo`의 결과가 순차 호출과 다를 수 있다"를 적는다(EVENT-019). 같게 만드는 길은 셋(배치 안에서도 쓰기마다 정착, 원본마다 출처 기록, 통지된 값의 철회)이고 모두 목표 G7(반응의 척추를 보존한다)·원리 P3(형상은 상태의 순수 함수다)·원리 P2(원본은 호출자와 작성자만 쓴다)와 부딪친다(EVENT-019, GOAL-012, GOAL-029, GOAL-028).

【추론】 `batch(fn)` 안에서 updater는 이어진다(EVENT-061). 【추론】 같은 노드에 `setValue(p => p + 1)`을 두 번 부르면 2가 더해진다(EVENT-061). 【추론】 updater 꼴이 호출자에게 기대하게 하는 결과다(EVENT-061). 【추론】 updater의 `prev`는 직전 커밋에, 이 배치에서 앞서 표시된 쓰기 가운데 그 노드의 서브트리에 닿은 것을 순서대로 얹은 값이다(EVENT-061). 【추론】 잎의 `prev`는 이 배치에서 그 노드에 마지막으로 표시된 원본(`interpret`를 지난 값)이다(EVENT-061). 【추론】 표시가 없으면 직전 커밋이다(EVENT-061). 【추론】 가지의 `prev`는 커밋된 값에 그 서브트리의 표시들을 경로별로 덮어 얹은 값이다(EVENT-061). 【추론】 정착의 의미는 적용하지 않는다(EVENT-061). 【추론】 채움, `derived`, 투영은 `prev`에 들지 않고, `fn`이 끝난 뒤 정착에서 한 번 적용된다(EVENT-061). 【추론】 updater는 부른 자리에서, 그 쓰기를 표시하는 동안 실행된다(EVENT-061). 【추론】 정착 때 실행하지 않는다(EVENT-061). 【추론】 updater가 던지면 그것은 `fn`의 예외다(EVENT-061). 【추론】 ERROR-004의 진입 규칙대로 모아 두었다가 사슬 머리가 끝날 때 던진다(EVENT-061, ERROR-004). 【추론】 정착 오류가 되지 않는다(EVENT-061). 【추론】 `fn` 안의 평범한 읽기(`value`, `outputValue`, `inactiveValues`, `FormHandle.getValue()`)는 여전히 직전 커밋을 돌려준다(EVENT-061). 【추론】 읽기는 계산하지 않기 때문이다(EVENT-061, VALUE-013). 【추론】 가지의 덮어 얹기는 updater라는 쓰기의 일부이며 읽기가 아니다(EVENT-061). 【추론】 `batch` 밖에서는 두 규칙이 겹친다(EVENT-061). 【추론】 쓰기마다 정착하므로 `prev`는 직전 커밋, 곧 `value`다(EVENT-061). 【추론】 그래서 SURFACE-031의 "`prev`는 `value`다"는 `batch` 밖에서 그대로 맞고, `batch(fn)` 안에서는 이 블록의 규칙이 이긴다(EVENT-061, SURFACE-031). 【추론】 `fn` 안에서 `reset`을 부르면 그 로드는 호출 안에서 곧바로 정착하고, 앞서 표시된 쓰기를 덮는다(EVENT-061, EVENT-015). 【추론】 그래서 그 뒤의 읽기와 updater의 기준은 reset의 커밋이다(EVENT-061). 【추론】 비용은 `batch` 안에서 updater를 부를 때만 든다(EVENT-061). 【추론】 잎은 원본 하나를 읽는다(EVENT-061). 【추론】 가지는 그 서브트리에 앞서 표시된 경로 수에 비례하는 조립이 든다(EVENT-061). 【추론】 평범한 읽기와 `batch` 밖의 쓰기에는 새 비용이 없다(EVENT-061). 【추론】 `batch` 문서 주석에 다음을 적는다: "fn 안의 쓰기는 표시만 되고 fn이 끝날 때 한 번 정착한다. fn 안의 updater `setValue(prev => …)`는 부른 자리에서 실행되고, 앞선 쓰기를 반영한 `prev`를 받아 이어진다(같은 노드에 +1을 두 번 하면 +2). updater가 던지면 fn의 예외로 다뤄진다. 그 밖의 읽기(`value`·`outputValue`·`inactiveValues`·`getValue()`)는 직전 커밋을 돌려준다. 채움·`derived`·투영은 정착에서 적용되므로 `prev`에 들지 않는다. 채움과 `injectTo` 때문에 배치의 결과는 순차 호출과 다를 수 있다."(EVENT-061).

중첩 `batch`는 가장 바깥이 이긴다(EVENT-014).

`fn` 안의 `reset`은 경로와 무관하게 그 로드를 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮고, 재생성 경로에서는 새 루트를 세우는 정착이다)(EVENT-015). `fn`의 나머지 쓰기 묶음은 그대로 끝에서 정착 한 번이며, `reset`의 커밋은 따로 파동을 내지 않고 `fn` 끝의 파동 한 번에 합류하며(두 커밋에서 바뀐 노드의 payload는 EVENT-024의 체인을 따른다. 리스너 안의 `reset`은 EVENT-008대로 다음 파동에 든다), 검증 요청과 `onChange`는 바깥 최외곽 진입의 끝에서 낸다(EVENT-030, 16라운드 스웜 수렴(편집자 결정))(EVENT-015, EVENT-024, EVENT-008). 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-015).

`batch(fn)`·`onChange`·리스너 안의 reset은 경로와 무관하게 그 로드를 호출 안에서 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮는다)(EVENT-015).

【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072). 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072). 【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다(WRITE-099, EVENT-072). 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 내고, `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다(EVENT-072, WRITE-099). 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072).

PR: PR-2(정착)·PR-4(검증)(EVENT-072).
무엇: `OnChange` 폼에서 `batch` 안과 밖에서 `resetSubtree()`를 부르고, 정착 시점, 검증 요청 수, 검증 불가 기록, 경고등 경로 집합을 본다(EVENT-072).
통과: 로드 규칙이 그 하위 트리에만 적용되고, 하위 트리 밖의 기록과 경로는 그대로다(EVENT-072, WRITE-099).
실패: 이 블록을 고친다(EVENT-072).

리스너 안의 `batch`는 바깥 배치의 표시 구간이 이미 끝난 뒤이므로 **자기 배치**다 — 자기 정착 한 번과 파동 한 번을 낸다(EVENT-016). 진입으로는 새 진입이 아니다(EVENT-016). 리스너 안이므로 진입 깊이는 2 이상이고, 그 쓰기는 EVENT-008의 리스너 되먹임으로 세어진다(EVENT-016, EVENT-008).

`batch`의 fn이 throw하면 표시된 쓰기는 정착·통지되고, 그 예외는 모아 두었다가 사슬 머리의 끝에서 던진다(안쪽 `batch`는 정상 반환한다, ERROR-004)(EVENT-017).

### 03-settle-and-events.md §2.10 명령과 다시 그리기

【추론】 명령 넷은 따로 둔 메서드 넷이 아니라 명령 종류를 매개변수로 받는 노드 메서드 하나다(EVENT-063, EVENT-073). 【추론】 메서드는 하나이고 명령 종류마다 그 노드에 요청 사건 하나를 내며 원본을 쓰지 않는다(EVENT-063, EVENT-073). 【추론】 배달은 EVENT-045·LANDING-076이다(EVENT-063, EVENT-045, LANDING-076). 【추론】 `FormHandle` 쪽 대칭 모양(`focus(path)`·`select(path)`를 남길지 같은 모양 하나로 합칠지)은 PR-4 착수 전에 소유자가 정한다(EVENT-063, EVENT-073). 【추론】 `FormHandle` 쪽 모양은 PR-4 착수 전에 소유자가 정하되, 어느 모양이든 `find(path)`한 노드의 명령 메서드를 부르고 노드가 없으면 아무것도 하지 않는다(오늘 `Form.tsx:147-150`과 같음)(EVENT-063, EVENT-073). 【추론】 노드의 공개 `publish`와 publish용 공개 사건 형은 두지 않는다(EVENT-063). 임의 사건을 내는 공개 `publish`는 두지 않되, 명령 종류를 매개변수로 받는 메서드 하나의 이름 후보에 명령 사건에 한정한 `publish` 부활이 들고 이름은 PR-4 착수 전에 소유자가 정한다(EVENT-063, EVENT-073). 【추론】 명령이 대신한다(EVENT-063). 【추론】 두 명령이 버리는 것은 EVENT-039·EVENT-040의 표가 적고, README(PR-8)가 옮긴다(EVENT-063, EVENT-039, EVENT-040). 【추론】 노드 메서드는 PR-4(배달 경로)에서 겉면에 더하고 멤버 목록 시험과 SURFACE-011 행을 함께 고친다(EVENT-063, NODE-010, SURFACE-011). 【추론】 `FormHandle`에 더하는 명령 겉면은 모양이 무엇이든 PR-7이며, 그 모양은 PR-4 착수 전에 소유자가 정한다(EVENT-063, EVENT-073).

소유자(설계서 메모 3): "이 4개 기능을 4개로 분할해서 두지 말고 하나의 메소드에 여러 행위 타입을 파라미터로 받아서 행동하게 해줘."(EVENT-063).

방향: 노드 겉면에 명령 메서드 넷을 따로 두지 않고, 명령 종류를 매개변수로 받는 메서드 하나로 합친다(이름 후보 `action`·`interaction`·`request`, 또는 명령 사건에 한정한 `publish` 부활)(EVENT-073, EVENT-063). 명령의 뜻(요청 사건만 냄, 원본을 쓰지 않음, 실행은 렌더 계층)은 EVENT-063 그대로다(EVENT-073, EVENT-063). 함께 정할 것: 메서드 이름과 명령 종류 값의 형(공개 열거인지 문자열 리터럴인지), `FormHandle` 쪽 대칭 모양(`focus(path)`·`select(path)`를 남길지 같은 모양 하나로 합칠지), SURFACE-058의 겉면 수(명령 4 → 1, 약 57 → 약 54)(EVENT-073, SURFACE-058). 메서드 이름·명령 종류 값의 형·`FormHandle` 대칭 모양은 PR-4 착수 전에 편집자가 권장안을 올리고 소유자가 정한다(EVENT-073).

D-9 수락: `RequestRemount`는 공개 명령으로 남는다(F32)(EVENT-037). 소유자: "내부에서 쓰는 값이 아니라, 사용자가 특정 서브트리의 값을 제어·비제어 컴포넌트와 무관하게 최신화하기 위한 사용자 도구."(EVENT-037).

`setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(EVENT-039, WRITE-090).

(EVENT-039, EVENT-040, WRITE-090, REACT-019, EVENT-042, GOAL-069)

| 명령 | 하는 일 | 버리는 것 | 범위 |
| ---- | ------- | --------- | ---- |
| `RequestRefresh` | 입력의 `key`를 바꿔 비제어 입력이 커밋된 값을 다시 읽게 한다(`SchemaNodeInput.tsx:94,120`). 자식 노드 프록시를 마운트한 입력(컨테이너)은 다시 마운트하지 않는다. 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 낸 Refresh는 core가 로드된 노드 모두에 내므로 그 자식들이 저마다 받고(로드는 값이 같아도 원본을 새로 쓰므로 EVENT-042의 '그 밖의 쓰기가 원본을 바꾸면 낸다'에 든다), 컨테이너 하나에 명시로 보낸 `refresh`는 아무것도 다시 마운트하지 않는다(서브트리는 `remount`로 한다. 범위 칸의 '그 노드의 입력 하나'에서 나온다)(REACT-019, 16라운드 스웜 수렴(편집자 결정)) | 그 입력의 캐럿·선택·IME 조합 상태 | 그 노드의 입력 하나 |
| `RequestRemount` | 래퍼의 `key=version`을 바꿔 서브트리를 리마운트한다(`SchemaNodeProxy.tsx:84,89`, 제약 T-18(`RequestRemount`는 래퍼의 `key=version`으로 서브트리를 강제 리마운트한다)) | 서브트리의 React 로컬 상태, 비제어 DOM 값, 이펙트 상태 전부 | 서브트리 |

`Refresh`는 "가벼운 도구"가 아니라 **범위가 좁은 리마운트**다(EVENT-041). 소비자가 자기 입력의 `onChange` 안에서 `refresh`를 부르면 캐럿이 날아가는 것은 명시 호출의 귀결이며, 그렇게 문서화한다(EVENT-041).

core가 스스로 `Refresh`를 보내는 규칙은 바뀌지 않는다 — 쓰기의 출처로 판단하고 타이핑에는 보내지 않는다(A6 + F7, 제약 T-2(타이핑은 입력을 리마운트하지 않는다))(EVENT-042, GOAL-053).

【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 EVENT-042대로 원본이 실제로 바뀐 노드에만 Refresh를 내고, 쓴 입력 자신은 제외한다(EVENT-071, EVENT-042). 【추론】 "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071).

- PR: PR-2(정착의 Refresh 대상)·PR-7(입력의 다시 마운트)(EVENT-071).
- 무엇: 입력 중에 리스너가 `setValue(getValue())`를 부르는 장면과, 잎 하나만 바꾼 `setValue(V)`에서 `RequestRefresh`를 받는 노드를 센다(EVENT-071).
- 통과: 앞 장면은 0회, 뒤 장면은 바뀐 잎만 1회이며, 캐럿과 IME 상태가 남는다(EVENT-071).
- 실패: 원본이 바뀌지 않은 노드가 Refresh를 받으면 정착의 Refresh 대상을 고친다(EVENT-071).

### 05-validation-and-errors.md §2.8 진단 기록의 지속과 초기화

**다음 로드까지 남는다.**(ERROR-135)

【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(ERROR-030, ERROR-135, ERROR-164, ERROR-172, ERROR-196, ERROR-202, ERROR-204). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(ERROR-030, ERROR-135, ERROR-164, ERROR-172, ERROR-196, ERROR-202, ERROR-204).

지속은 14라운드 답 O-2 가다(ERROR-136).

원인을 넷으로 넓힌 것과 그 동안의 제출 거부는 17라운드 소유자 답 R17-1 나다(10라운드 B-1의 제출 비차단을 대체한다)(ERROR-137).

【추론】 `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다(ERROR-204).

- PR: PR-2(진단)(ERROR-204).
- 무엇: 한 하위 트리의 예산 초과로 `degraded`가 된 폼에서 다른 하위 트리의 `resetSubtree()`, 루트 `setValue(V)`, `FormHandle.reset()`을 차례로 부르고 `diagnostics`, 경고 중복 키, 제출 거부를 본다(ERROR-204).
- 통과: 앞의 둘 뒤에는 `degraded`, 중복 키, 제출 거부가 그대로 남고, `FormHandle.reset()` 뒤에는 `stable`이며 중복 키가 비었다(ERROR-204).
- 실패: 초기화하는 로드의 목록을 고친다(ERROR-204).

## 설계문서

- `design/02-node-and-value.md` §3.3 (WRITE-090)
- `design/02-node-and-value.md` §3.4 (WRITE-094, WRITE-096, WRITE-097)
- `design/02-node-and-value.md` §3.6 (WRITE-095)
- `design/03-settle-and-events.md` §2.6 (EVENT-072)
- `design/03-settle-and-events.md` §2.10 (EVENT-071)
- `design/05-validation-and-errors.md` §2.8 (ERROR-204)
