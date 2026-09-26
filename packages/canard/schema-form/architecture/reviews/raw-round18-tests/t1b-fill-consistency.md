# T1-B — 채움 시점 논리 정합성

경로 기준은 ARCH = `/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/`, PKG = `/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/`입니다. `ledger/…:줄`은 ARCH 아래의 경로입니다. 저장소는 고치지 않았습니다. 오늘 코드 탐침은 `/private/tmp/claude-501/t1b/probe/fill.probe.test.ts`에 두고 PKG 코드로 실행했습니다.

## 요약: 결정됨 11 / 공백 2 / 모순 5

**판정: fail.** 원장은 아직 WRITE-090과 전부 맞지 않습니다.
- 채움 자체는 맞습니다. `setValue(V)`는 있던 노드를 다시 채우지 않고, 쓰기로 생긴 노드만 채웁니다.
- 어긋나는 곳이 넷 남았습니다.
  - 충돌 줄이 빠진 현행 문장이 있습니다. LANDING-042·095, SETTLE-017, SURFACE-039, WRITE-013입니다.
  - 충돌 줄이 새 규칙을 부정확하게 적은 곳이 있습니다. VALUE-031, ERROR-024·129·142, SURFACE-007입니다.
  - 스냅숏이 위치 기준이라, 아이템 수를 바꾸는 `setValue`와 부딪힙니다.
  - 빠진 이주 행이 셋입니다. 모두 오늘 코드를 실행해 확인했습니다.
- 기계 검사 넷(verbatim·sup·ref·owner-cited)은 모두 문제 0이었습니다. 논리 불일치는 이 검사로 잡히지 않습니다.

## 시나리오

| # | 경우 | 원장이 정하는 결과 | 근거(ID, path:line) | 판정 |
| --- | --- | --- | --- | --- |
| 1 | 로드 목록 | WRITE-090은 로드를 마운트·`reset()`·`resetSubtree()`로 정합니다. 옛 목록 14곳에 충돌 줄이 붙었지만, 목록이 어긋난 현행 문장이 아직 있습니다. | WRITE-090 `ledger/write.md:1347`. 미정리: SURFACE-039 `surface.md:611`, LANDING-042 `landing.md:730`, LANDING-095 `landing.md:1433`, SETTLE-017 `settle.md:277`, WRITE-013 `write.md:286`, VALUE-031 `value.md:465,480`. `resetSubtree`가 빠진 목록: LANDING-041 `:717`, ERROR-040 `error.md:793`, EVENT-032 `event.md:500`, EVENT-015 `event.md:289`. 충돌 줄이 폼 수준 목록에 `resetSubtree`를 넣은 곳: ERROR-024 `error.md:573`, ERROR-129 `:1944`, ERROR-142 `:2104`, SURFACE-007 `surface.md:196` | 모순 |
| 2.1 | `setValue(getValue())` | 방출 값·채움·에지(derived·injectTo)·검증·`onChange`는 멱등입니다. 첫 호출은 잠복 원본과 투영으로 빠진 원본을 없음으로 만들므로 `value`·`inactiveValues`·UpdateValue가 달라집니다. Refresh 범위는 정해지지 않았습니다. dirty·touched·오류는 바뀌지 않습니다. | WRITE-090 `write.md:1349`, EVENT-031 `event.md:486`, SETTLE-043 `settle.md:651`, WRITE-012 `write.md:273`과 VALUE-031 `value.md:471-472`, WRITE-019 `write.md:372`이 맞섭니다. 상태: VALUE-022 `value.md:325`(C6), REACT-011 `react.md:177` | 모순 |
| 2.2 | `setValue({a: undefined})`, `a`에 `default: 'x'` | `a`는 없음으로 남습니다. 오늘과 같습니다(탐침 P2). | WRITE-090 `write.md:1348`, WRITE-010 `write.md:244` | 결정됨 |
| 2.3 | `setValue({kind:'b'})`로 분기 전환 | 새 분기의 노드는 생긴 노드라 채웁니다. 옛 분기의 노드는 형상에서 나갑니다. 로드가 아니므로 나감 정책이 적용됩니다. 원본은 V에 없으면 없음이 되고, V에 있으면 잠복으로 남습니다. 같은 종류의 공유 노드는 남고 채우지 않습니다. | WRITE-090 `:1346`, SETTLE-005 `settle.md:123`, WRITE-007 행 `write.md:180`, WRITE-019 `:372`, WRITE-037 `write.md:595`, VALUE-031 `value.md:478` | 결정됨 |
| 2.4 | 아이템 1개인 배열에 `setValue({items:[{},{}]})` | 배열은 다시 만들지 않고 위치로 잇습니다. 아이템 1은 키를 이어받고 원본이 `{}`가 되며, 채우지 않으므로 방출은 `{}`입니다. 아이템 2는 새 키로 생겨 채움을 받습니다. "새 아이템"은 직전 커밋의 형상에 없던 키로 정의됩니다. | NODE-051 `node.md:795-805`와 충돌 줄 `:818`, WRITE-090 `:1348` | 결정됨(이주 행 누락은 #6) |
| 2.5 | `setValue(null)` 뒤 `setValue({...})` | null인 동안 자식은 형상에 남습니다. 다시 객체가 되어도 채우지 않습니다. | VALUE-036 `value.md:569`, WRITE-036 `write.md:583`, WRITE-090 `:1351`, WRITE-092 `write.md:1396` | 결정됨(문구 모순은 #7) |
| 2.6 | 루트 `setValue(undefined)` | 원본이 모두 없음이 되고, 있던 노드는 채우지 않습니다. 비움으로 게이트가 뒤집혀 생긴 노드는 채움을 받고, 에지 규칙은 발화합니다. | WRITE-090 `:1348-1349` | 결정됨(문구는 #11) |
| 3a | 상태와 검증 | `setValue`는 dirty·touched·바깥 오류를 건드리지 않습니다(그 일은 `handleChange`만 합니다). OnChange 검증은 emit이 바뀔 때만 한 번 합니다. 로드의 검증 예외는 reset에만 있습니다. 18C-20의 `batch` 안 즉시 정착도 reset만의 규칙입니다. | VALUE-022 `:325`, REACT-011 `:177`, EVENT-031 `:486`, EVENT-032 `:500`, LANDING-041 `landing.md:717`, EVENT-061 `event.md:898` | 결정됨 |
| 3b | `diagnostics`·경고 중복 키·`stable` 복귀 | 이 항목들에는 충돌 줄만 남았습니다. 새 목록은 `resetSubtree`를 폼 수준 초기화에 넣고, 호출자가 어떻게 `stable`로 돌아오는지는 적지 않습니다. | ERROR-024·129·142, SURFACE-007(위 줄번호), VALUE-003 `value.md:96`, ERROR-135 `error.md:2017` | 공백 |
| 4 | 스냅숏 | `setValue`는 스냅숏과 `defaultValue`를 바꾸지 않고, 구조 연산은 스냅숏을 고칩니다. 그런데 스냅숏이 경로로 찾는 값이라, 아이템 수를 바꾸는 비구조 통째 쓰기 뒤에는 신원과 어긋납니다. | WRITE-090 `:1352`, WRITE-085 `write.md:1249-1263`, LANDING-155 `landing.md:2171`, NODE-051 `:799-800` | 모순 |
| 5 | `DisableAutomaticWrites` | 값 V는 그대로 씁니다. 그 쓰기로 생긴 노드의 채움, derived·injectTo·unsetValue, 나감의 비움을 끕니다. CONTROLS 영역에는 이 비트를 다루는 항목이 없습니다. SURFACE-039는 범위를 "(로드와 `Merge`)"로 적고 충돌 줄이 없습니다. | WRITE-090 `:1353`, WRITE-015 `write.md:316`과 충돌 줄 `:330`, SURFACE-039 `surface.md:611` | 결정됨(누락은 #10) |
| 6a | 입력 `onChange(v, Overwrite)`의 Refresh | 자기 입력에는 보내지 않고, 원본이 바뀐 자손에게만 보냅니다. | WRITE-090 `:1350`, WRITE-091 `write.md:1378-1379`, EVENT-039 `event.md:599`·REACT-019 `react.md:297`의 충돌 줄 | 결정됨 |
| 6b | 입력 쓰기의 채움 | 그 쓰기로 생긴 노드만 채웁니다. | WRITE-090 `:1348`, WRITE-091 `:1373` | 결정됨 |
| 7a | 낡은 LANDING 행 | LANDING-042·095는 "setValue도 로드"라는 전제 위에 서 있는데, 충돌 줄이 없습니다. LANDING-118은 `중복(→ WRITE-017)`인데 WRITE-017은 대체되었습니다. | `landing.md:730`, `:1433`, `:1725`, `09-landing-and-test-strategy.md:94` | 모순 |
| 7b | 빠진 이주 행 | 셋이 빠졌습니다: `setValue(null)` 아래 자식, 입력 Overwrite의 자기 입력 재마운트, 배열 통째 `setValue`에서 남는 아이템을 채우지 않는 것. | LANDING-139 `:1983`, LANDING-140 `:1994`, LANDING-164 `landing.md:2305`, 탐침 P3·P3c·P5·P8 | 공백 |
| 7c | 소유자의 "`undefined`는 이주 행 없음" | 참입니다. 오늘 루트·객체 호스트·잎(Overwrite)·가상 노드·배열 모두 채움 없이 비웁니다. | 탐침 P1·P1b·P4·P7, `PKG/src/core/__tests__/ArrayNode.setValueUndefined.test.ts:33-41`, `PKG/src/core/nodes/ObjectNode/DETAIL.md:21` | 결정됨 |
| 8 | TEST | `setValue`를 로드로 단언하는 현행 TEST 항목은 없습니다. | TEST-069 `test.md:1119`(로드 일반), TEST-017 `test.md:337`(중립) | 결정됨 |
| 9 | D-1 null 계약 | 규칙(WRITE-092·VALUE-036)은 맞습니다. 그러나 채움 값이 있다고 적은 보충, 뜻이 흔들린 낱말 "빈 상태", 호출자 전체 교체가 빠진 종류 목록이 남았습니다. | WRITE-013 `write.md:286`, VALUE-036 `value.md:569`, VALUE-032 `value.md:496`, EVENT-060 `event.md:862` | 모순 |

## 공백과 모순

### 1 — 모순(높음) — 호출자 `setValue(V)`의 Refresh 범위를 두 가지로 읽을 수 있음 (2.1·7a, 열린 점 3)

**근거 (confirmed).**
- LANDING-042 `landing.md:730`의 새 설계 칸은 "reset과 같은 입력 판정이다"입니다.
- 그 전제는 `09-landing-and-test-strategy.md:94`의 "호출자의 전체 교체 `setValue(V)`(`Overwrite`)도 로드이므로 다섯째의 입력 판정…"입니다. 이 문장은 RESTATES로 LANDING-042·REACT-019·REACT-024에 연결됩니다.
- LANDING-095 `landing.md:1433`에도 "`setValue(V)`의 같은 입력 판정"이 있습니다. 둘 다 충돌 줄이 없습니다.
- 반대 쪽 근거:
  - REACT-019 `react.md:280`의 "로드된 노드 모두"에 충돌 줄 `:297`이 붙어, `setValue`는 로드에서 빠졌습니다.
  - EVENT-039 `event.md:591`은 "로드는 값이 같아도 원본을 새로 쓰므로"라고 로드에만 예외를 둡니다.
  - 일반 규칙은 GOAL-053 보충 `goal.md:779`의 "그 밖의 쓰기가 raw를 바꾸면 낸다"입니다.
  - WRITE-090 `:1349`는 `setValue(getValue())`가 멱등이라고 적습니다.

**실패 장면.** 사용자가 입력하는 중에 리스너가 `setValue(getValue())`를 부릅니다. LANDING-042로 읽으면 모든 잎 입력이 다시 마운트되어 캐럿과 IME 상태를 잃습니다. 출처 규칙으로 읽으면 아무 일도 없습니다.

**고칠 문장 안.**
- 새 결정: "로드가 아닌 쓰기(`setValue(V)` 포함)는 ADR 0007 §3대로 원본이 실제로 바뀐 노드에만 Refresh를 낸다(쓴 입력 자신은 제외). '값이 같아도 낸다'는 로드의 새 수명에만 해당한다."
- LANDING-042·095에 충돌 줄을 답니다.
- 이주 행을 더합니다. 오늘은 Overwrite가 하위 트리 전체를 다시 마운트하고, 새 설계에서는 바뀐 노드만 다시 마운트합니다.
- 판단: 원리로 도출할 수 있습니다(출처 규칙의 문자 그대로의 읽기, T-2, 멱등, 속도 우선). 다만 16라운드 스웜 결정을 뒤집고 다시 마운트되는 범위가 달라지므로 소유자 통보 목록에 올리기를 권합니다.

### 2 — 모순(중간) — "트리 전체 순회는 로드에서만" 예산과 비로드 전체 교체 (1·3)

**근거 (confirmed).**
- SETTLE-017 `settle.md:277`: "트리 전체 순회는 로드에서만 허용한다."
- 그런데 WRITE-090 `:1348`에서 루트 `setValue(V)`는 로드가 아니면서도 모든 노드의 원본을 다시 써야 합니다.
- 충돌 줄이 없어, PR-2가 순회 수를 시험하면 루트 `setValue(V)`가 예산 위반이 됩니다.

**고칠 문장 안.** "트리 전체 순회는 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만 허용한다." 충돌 줄로 적습니다. 원리로 도출할 수 있습니다(비용은 호출자가 쓴 크기에 비례, G6).

### 3 — 모순(중간) — `setValue(getValue())`의 멱등과 잠복·투영 원본의 비움; VALUE-031 충돌 줄이 불완전함 (2.1, 열린 점 5)

**근거 (confirmed).**
- VALUE-031 `value.md:471-472`: "호출자가 한 번에 비우려면 `setValue(form.getValue(), …DisableAutomaticWrites)`를 쓴다. 이때 투영으로 빠진 값도 없음이 된다."
- WRITE-019 `write.md:372`: 전체 교체가 V에 없는 키를 없음으로 만듭니다.
- 충돌 줄 `value.md:489`는 `setValue(V)`를 로드 목록에서 빼기만 합니다. 전체 교체로서 잠복 원본을 여전히 지운다는 말이 없어서, `:471`과 WRITE-019와 맞섭니다.
- 같은 가정이 `:465`와 `:480`("조상의 `Merge`나 로드")에도 남았습니다.

**실패 장면.** `omitEmpty` 필드에 `''`가 있거나 꺼진 분기에 원본이 있을 때 `setValue(getValue())`를 부르면, 그 원본이 없음이 되고 UpdateValue가 납니다. 두 번째 호출부터는 변화가 없습니다(f∘f = f).

**고칠 문장 안.**
- VALUE-031 충돌 줄을 이렇게 바꿉니다: "…`setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(WRITE-019, WRITE-007). 지워지는 길은 나감 정책, 로드, V가 그 경로를 담지 않은 전체 교체 쓰기다." `:480`에도 같은 줄을 둡니다.
- WRITE-090의 '멱등'에 범위를 적습니다: "방출 값·채움·에지에 대해 멱등이다. 첫 호출은 잠복 원본과 투영으로 빠진 원본을 없음으로 만든다(VALUE-031)."
- 원리로 도출할 수 있습니다.

### 4 — 모순(중간) — 스냅숏이 위치를 따라가 신원과 어긋남 (4)

**근거 (confirmed, 규칙 추적).**
- WRITE-085 `write.md:1258`: "스냅숏은 위치가 아니라 신원을 따른다."
- 그런데 `defaultValue`는 경로로 찾습니다: `getIn(snapshot, node.path)`(`:1252`).
- `:1262`에서 비구조 쓰기는 스냅숏을 건드리지 않고, WRITE-090 `:1352`에서 `setValue`도 건드리지 않습니다.
- NODE-051 `node.md:799-800`에서 통째 쓰기는 아이템을 새로 만들거나 없앱니다.

**실패 장면.**
1. `defaultValue={items:['a','b']}`로 시작합니다.
2. `setValue({items:['x']})`로 `#1`이 사라집니다.
3. `setValue({items:['x','z']})`로 새 키 `#2`가 1번 자리에 생깁니다.
4. `#2.defaultValue`는 사라진 `#1`의 값 `'b'`가 되고, `resetSubtree()`도 `'b'`로 되돌립니다.

답 전에는 `setValue`가 "배열 통째 로드"(`:1263`)라 스냅숏을 새로 맞췄으므로 이 문제가 없었습니다. 입력 쓰기와 `Merge`의 배열 쓰기에는 이미 있던 결함입니다.

**고칠 문장 안.** "아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 스냅숏 배열의 자리를 맞춘다. 없어진 자리는 잘라 내고, 새 아이템의 자리에는 `undefined`를 넣는다. 값은 싣지 않는다." 비용은 구조 연산과 같은 O(길이)입니다. 원리로 도출할 수 있습니다. 다만 소유자 문장 "스냅숏을 바꾸지 않는다"와 글자가 부딪히므로 통보가 필요합니다.

### 5 — 공백(중간) — 전체 교체가 `diagnostics`에 하는 일 (3b, 열린 점 1)

**근거 (confirmed).**
- ERROR-129 `error.md:1936`의 원래 목록은 "루트 전체 교체"였으므로 폼 수준의 로드만 뜻했습니다.
- 그런데 충돌 줄 `error.md:1944`, `:573`, `:2104`, `surface.md:196`은 목록을 "마운트·`reset()`·`resetSubtree()`"로 바꿉니다. 하위 트리의 로드가 폼 인스턴스 단위의 기록(ERROR-024 `:565` "폼 인스턴스의 로드", "`diagnostics`와 같은 단위")을 비우게 됩니다.
- ERROR-142는 `setValue`로 `stable`에 돌아오던 길이 없어졌는데, 대신할 길을 적지 않습니다.

**실패 장면.** 한 하위 트리에서 `resetSubtree()`를 부르면, 다른 곳의 예산 초과로 생긴 `degraded`가 풀려 제출이 다시 허용됩니다.

**고칠 문장 안.** "`diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다. `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다. `degraded`에서 돌아오는 길은 `reset()`이다."
- 도출 근거: VALUE-003 `:96` "마지막 로드 이후의 작업 기록", ERROR-135 `:2017`, 14라운드 답 O-2.
- 원리로 도출할 수 있습니다. 호스트가 값을 둔 채 회복하던 길이 사라지므로 통보를 권합니다.

### 6 — 공백(중간) — 이주 행 셋이 빠짐 (7b, 열린 점 4)

모두 오늘 코드를 실행해 확인했습니다.

- **(가) 호출자의 `setValue(null)`.**
  - 오늘: null인 동안 자식이 기본값을 듭니다(탐침 P3에서 `o/a = "x"`, S4 `PKG/src/core/nodes/ObjectNode/DETAIL.md:19`). 자식 쓰기로 객체가 돌아오면 기본값이 나타납니다(P3c에서 `{"o":{"a":"x","c":3}}`, S5 `:20`).
  - 새 설계: 채우지 않습니다.
  - 호스트에 `setValue({...})`로 돌아오는 경우는 오늘도 채우지 않으므로 차이가 없습니다(P3: `{"o":{"c":2}}`).
  - LANDING-139 `:1983`은 입력과 `Merge`로 만든 null만 다룹니다.
- **(나) 입력의 `onChange(v, Overwrite)`.**
  - 오늘: 자기 입력이 다시 마운트됩니다. 근거는 `Overwrite = Replace | Merge`(`PKG/src/core/types/value.ts:65`), `Merge`에 든 `Refresh`(`:63`), 옵션을 그대로 넘기는 `SchemaNodeInput.tsx:50-53`, `key={version}`(`:121`), 그리고 RequestRefresh가 오면 번호를 올리는 `useFormTypeInputControl.ts:37`입니다. 탐침 P5에서 Overwrite는 RequestRefresh 1회, 기본 입력 옵션은 0회였습니다. 저장소 스토리 15곳이 이 호출을 씁니다.
  - 새 설계: 다시 마운트하지 않습니다.
  - LANDING-140은 `Merge`만 다룹니다.
- **(다) 배열 통째 `setValue`.**
  - 오늘: 아이템을 다시 만들어 모두 채웁니다(P8: `[{"a":"x"},{"a":"x"}]`).
  - 새 설계: 남은 아이템은 채우지 않습니다(`[{}, {"a":"x"}]`).
  - LANDING-164는 상태가 위치를 따라가는 것만 다룹니다.
- **고칠 문장 안.** 세 가지를 LANDING 이주 행으로 더합니다. 사실 기록이므로 원리로 도출할 수 있습니다.

### 7 — 모순(중간) — null 계약의 문구 (9, 2.5)

**근거 (confirmed).**
- WRITE-013 보충 `write.md:286`(`08:274`): "`setValue({ user: null })` 뒤 `name`의 채움 값은 방출에 나타나지 않고". 새 규칙에서는 채움 값 자체가 없습니다(WRITE-090 `:1351`).
- VALUE-036 `value.md:569`의 "빈 상태를 보인다"에서 "빈 상태"는 #338의 채운 빈 상태를 뜻하던 낱말입니다(WRITE-014 `write.md:296`, WRITE-092 보충 "'빈 상태' 채움은 로드에만"). 채움 문장이 WRITE-090으로 옮겨 가면서 한정어가 사라졌습니다.
- VALUE-032 `:496`의 종류 목록(입력, 호출자(부분 쓰기·배열 연산), 로드, 자동 쓰기)과 EVENT-060 `:862`의 출처 값에는 로드를 떠난 `setValue(V)`가 들 자리가 없습니다.

**고칠 문장 안.**
- WRITE-013에 충돌 줄: "로드가 아닌 쓰기로 온 null 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092)."
- VALUE-036에 같은 충돌 줄이나 보충. 로드로 온 null은 채웁니다.
- VALUE-032·EVENT-060에 '호출자 전체 교체'를 더합니다.
- 원리로 도출할 수 있습니다.

### 8 — 공백(낮음) — `resetSubtree()`가 로드가 되면서 로드에 걸린 규칙들이 비어 보임 (1)

**근거 (confirmed).** 다음 규칙은 로드를 마운트·reset으로만 적거나 로드 일반으로 적어, `resetSubtree`에 적용되는지 알 수 없습니다.
- 로드 뒤 OnChange 검증: LANDING-041 `:717`, ERROR-040 `:793`, EVENT-032 `:500`.
- `batch` 안의 즉시 정착: EVENT-015 `:289`.
- "한 로드에 한 번": VALIDATE-048 `validate.md:739`.
- "로드마다 다시 만든다": VALUE-030 `value.md:446`.

18C-44 때부터 있던 문제이지만, WRITE-090이 목록을 못 박으면서 드러났습니다.

**고칠 문장 안.** 각 규칙에 "`resetSubtree()`는 그 하위 트리에만 적용한다" 또는 "적용하지 않는다"를 적습니다. 원리로 도출할 수 있습니다(편집자 결정).

### 9 — 공백(낮음) — SETTLE-046이 나뉘면서 F4의 에지 문장을 잃음 (열린 점 2·6)

**근거 (confirmed).**
- SETTLE-027 `settle.md:422` 첫 문장 "전체 교체는 에지와 생김의 기준(직전 커밋)을 비운다(F4)"는 WRITE-090으로 갔습니다.
- 그러나 WRITE-090은 생김만 말하고 에지는 말하지 않습니다. 그래서 SETTLE-046 `:724`의 "그래서"가 기댈 앞 문장이 없습니다.

**고칠 문장 안.** "로드는 에지와 생김의 기준을 비운다. 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋을 기준으로 한다." 원리로 도출할 수 있습니다.

### 10 — 모순(낮음) — 충돌 줄 정리에서 빠진 곳

**근거 (confirmed).**
- SURFACE-039 `surface.md:611`: 범위가 "(로드와 `Merge`)"이고 제목이 "로드 시"입니다.
- WRITE-048 `write.md:721`: "쓰기 표에서 둘은 같은 행이다"라는 낡은 근거가 남았습니다.
- WRITE-085 `:1255`는 대체된 WRITE-017과 나뉜 SETTLE-027을 가리킵니다. `:1263`의 "배열 통째 로드"도 낡은 표현입니다.
- FRAGMENT-054 `fragment.md:801`은 나뉜 VALUE-015·WRITE-014를 가리킵니다.
- WRITE-010 보충 `write.md:246-249`에 대체된 18C-17의 줄이 남았습니다. HANDOFF §3에 따르면 지울 줄입니다.
- LANDING-118 `landing.md:1725`는 `중복(→ WRITE-017)`인데 그 대상이 대체되었습니다.
- 원장 밖이지만 `reviews/round-18-closing-summary.md:76-87`의 A5도 대체된 결론을 그대로 적고 있습니다.

**고칠 문장 안.** 충돌 줄을 달거나 가리킴을 WRITE-090·VALUE-036·WRITE-092로 바꿉니다. LANDING-118은 `대체됨(→ WRITE-090)`으로 바꿉니다. 원리로 도출할 수 있습니다.

### 11 — 모순(낮음) — WRITE-090 안의 표현

**근거 (confirmed).**
- `:1349`의 "`setValue(undefined)`는 채움 없이 비우고"와 `:1348`의 "새로 생긴 노드만 채움"이 부딪힙니다. 예: `if`가 빠진 키에서 참이 되어 새 분기가 생기면 그 분기는 채웁니다.
- `:1346`의 채움 사건 목록에 노드 게이트(`controls.active`)가 켜지는 경우가 없습니다. SETTLE-005는 일반 규칙으로 이 경우도 다룹니다.

**고칠 문장 안.** "이미 있던 노드를 다시 채우지 않고 비운다." 목록 끝에는 "노드 게이트가 켜짐"을 더합니다.

## 열린 점

1. **diagnostics.** 전체 교체 쓰기는 `diagnostics`와 중복 키를 비우지 않습니다. 그 쓰기의 정착이 예산을 넘으면 `degraded`를 적을 뿐입니다. 복귀는 `reset()`입니다. 원리로 도출할 수 있고(#5), `resetSubtree`를 뺄지는 편집자가 명시해야 합니다.
2. **`injectTo`·`derived`.** 현행 항목은 평범한 에지 규칙을 지지합니다(CONTROLS-084 충돌 `controls.md:1329`, WRITE-012 `:273`). `06:266`의 장면은 `sentence-classified.tsv`에서 `OUT 예시`로 분류되어 규칙이 아닙니다. 그 아래에서 `setValue(getValue())`는 방출이 그대로라 에지가 없으므로 멱등입니다. 원리로 도출할 수 있고, 문장은 #9로 보강합니다.
3. **Refresh 범위.** 정해지지 않았습니다(#1). 원장은 원본이 바뀐 노드만으로 도출하기를 지지하며, 소유자 통보를 권합니다.
4. **이주 행.** 두 주장 모두 오늘 코드에서 참이고, 둘 다 행이 필요합니다. 배열 쪽 행도 하나 더 필요합니다(#6).
5. **충돌 줄로 둔 판단.**
   - 동의: NODE-051, EVENT-064, CONTROLS-084. 규칙이 그대로 살고, 충돌 줄이 이긴 쪽(`reviews/round-18-owner-answers.md:26`)을 바르게 적습니다.
   - 부분 동의: ERROR-129·024·142. 방식은 맞지만, 새 목록이 `resetSubtree`를 폼 수준 초기화에 끌어들이고 복귀 길을 적지 않습니다(#5).
   - 동의하지 않음: VALUE-031. 충돌 줄이 전체 교체의 잠복 비움을 지워 버려 `:471`·WRITE-019와 모순이 되고, `:465`·`:480`을 빠뜨렸습니다(#3).
6. **새 조각.**
   - VALUE-035: 완전합니다. 닫은 사람에 옮겨 간 문장의 "원리(`03:90`)"가 남은 것은 사소합니다.
   - VALUE-036: 글은 완전하지만 "빈 상태"의 뜻이 바뀌었습니다(#7).
   - WRITE-092: 완전합니다.
   - SETTLE-046: F4의 에지 문장을 잃었습니다(#9).
   - CONTROLS-084: 완전합니다. 멱등 문단은 WRITE-090이 받았습니다.
   - (덤) WRITE-091: 완전합니다.

## 확인하지 못한 것

- 문장 단위 검사와 토큰 검사(`bundle`, `sentence-check`, `tokens`)는 돌리지 않았습니다.
- P5는 노드 이벤트 수와 코드 경로로 확인했습니다. 실제 DOM의 다시 마운트는 렌더 하니스로 보지 않았습니다.
- 새 설계 쪽 결과(P3c·P8의 대응값)는 원장 규칙을 추적한 것입니다. 프로토타입으로 실행하지 않았습니다.
- 18C-88에 따라 루트 `value`가 오늘의 `undefined`에서 `{}`로 바뀝니다. 채움과 무관한 변화라 이주 행을 확인하지 않았습니다.
- `09`·ADR 원문은 필요한 줄만 읽었습니다.