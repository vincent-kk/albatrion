# 4라운드 레드팀 — 작업 루프 3.1판 (round-4-spec.md §A)

역할: 적대적 검토자. 대상: `round-4-spec.md` §A의 주장 A1-1·A3-1·A4-1·A4-2와 규칙 A2·A4 1–7·A5·A6·A7·A8.
방법: 명세 문장만으로 독립 모델을 새로 지었다 — `spikes/work-loop/redteam4/model.mjs`(256줄, ajv 8 2020으로 가드 컴파일, `proto/loop-v3.mjs`·`redteam3/model.mjs`를 복사하지 않음). 공격은 `redteam4/attacks.mjs`(섹션 id로 실행: `node attacks.mjs 3 7`), 전체 출력은 `redteam4/output.txt`. 현재 라이브러리 증거는 `redteam4/current-null.ts`를 vite-node로 실행했다(`src/core`, 출력은 본문에 인용).
판정 어휘는 §D를 따른다 — **반례 / 모순 / 미정의 / 통과**, 추측은 "추론". 모델은 명세가 답하지 않는 곳에서 읽기를 골라야 했고 그 선택은 `options`(model.mjs:25-35)에 스위치로 남겼다. 이 글은 증거이지 지시가 아니다.

## 요약

| 항목 | 판정 | 한 줄 |
| ---- | ---- | ----- |
| A1-1 | 통과 (+관찰) | 계산은 순수. 다만 그 상태는 공개 API로 재현되지 않는다 — `setValue(getValue())`가 지운 default를 되살린다 |
| A3-1 | 통과 + 모순(문장) | 상한에서도 emit = F(raw). "raw의 순수 함수"는 A1-1의 (raw·selection·extras)와 어긋난다 |
| A4-1 | **반례** | 상호 부정 2-사이클(자기 부정 아님)은 고정점이 없고, 커밋 형상이 상한의 홀짝에 달린다 |
| A4-2 | 통과 + **모순** | 중첩 가드는 감싸는 조각이 꺼지면 평가되지 않는다. 그러나 "빈 중첩 union은 전 분기가 켜지지 않는다"는 host가 `{}`·부재이면 거짓 — k default가 첫 분기를 켠다 |
| A2 | **모순** + 반례 + 미정의 | #338 셋째 시나리오("비우기만 하면 null 유지")가 표에서 도출되지 않는다. batch 여부가 값을 바꾼다. 리스너 쓰기·k default와 플래그의 관계 미정의 |
| A4-3 | 통과 (+미정의) | 가드와 검증기가 같은 값을 본다. 상한 초과 자식의 상태가 부모에 오르지 않는다 |
| A4-4 | **반례** + 미정의 | 상한 홀짝이 emit을 정한다. 바퀴 안 A 갱신(가우스-자이델)·"조각 수"의 범위 미정의 |
| A4-5 | 통과 | 금지 조각 없음 — 모델은 `false`를 읽지 않는다 |
| A4-6 | 미정의 + 관찰 | 자식 재계산 시점(토글마다/바퀴마다) 미정의. 출발점 고정이라 overlay 자식은 매 정착 최소 2회 재계산 |
| A4-7 | 통과 | 키 순서 = 선언 순서, extra 뒤 |
| A5 | **모순** + 미정의 | A2와 같은 #338 모순. `17` 뒤 extras 생존 미정의 |
| A6 | 미정의 + 관찰 | "다르다"의 동치 미정의(NaN·객체 값 입력이 매 키마다 Refresh). 포매터가 만든 DOM 불일치는 규칙 밖 |
| A7 | **반례** + 미정의 | 초기 선택 규칙이 로드 값을 숨긴다. Overwrite 뒤 selection 유지 여부·`required` 계열 에러의 라우팅 미정의 |
| A8 | 통과 + 미정의 | extras 잔여·삭제·분기별 깜빡임은 검증기와 같다. 비활성 조각의 자식 raw는 잔여가 아니어서 보이지 않는다 |
| 비용 | 통과(수치 확인) | 역순 200단 = 40,200 가드/201바퀴, 호스트 안 어느 키를 쳐도 같다. 역색인은 불가 |

---

## 주장

### A1-1 계산 결과는 (스키마, raw·selection·extras)의 순수 함수 — 통과 (+관찰)

시도: 같은 raw를 다른 이력으로 만든 뒤 emit 비교(1c, 1b). 모델의 compute(model.mjs:145-176)는 `raw`·`selection`·`extras`·상속 overlay만 읽고 `committedActive`는 transition(model.mjs:224-235)만 읽는다. 다른 이력으로 도달한 같은 raw는 같은 emit을 냈다(1c: `a then b`와 `load {a,b}`는 raw가 다르므로 emit도 다르고, raw가 같은 경우는 모두 일치).

관찰 1 — **상태가 공개 API로 재현되지 않는다.** 활성 조각 아래 "없음"인 자식(사용자가 비운 default)은 이력으로만 만들 수 있다. 전체 교체는 (i)로 default를 넣기 때문이다.

```
[A1-1] before {"a":"A"}  after setValue(getValue(), Overwrite) {"a":"A","x":1}
```

현재 라이브러리는 같은 왕복에서 값을 바꾸지 않는다(`current-null.ts`, `reason := undefined` 뒤 `setValue(getValue())` → `{"target":{"note":"n"}}` 유지). 3.1판은 `getValue → setValue` 왕복을 비멱등으로 만든다. T-1–T-9에 없는 동작 변화다.

관찰 2 — A1-1의 입력 목록에 **상속 overlay**가 없다. overlay는 조상 `active`의 함수이므로 결국 raw의 함수지만, 자식 하나만 놓고 보면 (raw, selection, extras)로는 형상이 정해지지 않는다(A4-6 6항이 따로 말한다). 문장 정리 문제.

### A3-1 커밋된 트리는 커밋된 raw의 순수 함수, 상한에서도 — 통과 + 모순(문장)

시도: 상호 injectTo 순환(`t→u+1`, `u→t`)으로 상한을 치게 했다.

```
[A3-1] emit={"t":12,"u":13} raw t,u=[12,13] rounds=25 capped=true  emit = F(raw)? true
```

26번째 라운드의 쓰기는 적용되지 않았다(model.mjs:203 `budget()`이 쓰기 전에 거부). 3라운드 T7의 raw≠emit 어긋남은 사라졌다.

모순(문장): A3-1은 "커밋된 **raw**의 순수 함수"라 하고 A1-1은 "(raw·selection·extras)"라 한다. 선택 가드 union에서 같은 raw가 selection에 따라 다른 emit을 내므로(7: selection 1에서 raw `{a,b,c:∅}` → emit `{}`) A3-1 문장 그대로는 거짓이다. A1-1의 입력 셋을 인용해야 한다.

### A4-1 정순 2바퀴·역순 N+1, 부정 가드 조합은 검증기가 받는 고정점 — **반례**

바퀴 수는 통과다(9: 정순 200단 2바퀴·400 가드, 역순 200단 201바퀴·40,200 가드). 단 "정순 2바퀴"는 **한 바퀴 안에서 A를 즉시 갱신**(가우스-자이델)할 때만 성립한다 — 바퀴 시작 스냅숏으로 평가하면 정순도 N+1바퀴다. A4-3의 "현재 `A`"가 이것을 뜻한다면 문장으로 못 박아야 한다(model.mjs:162 `options.gaussSeidel`).

반례 — **상호 부정 2-사이클.** 자기 부정(`if not required x then x default`)이 아니다: 어느 조각도 자기 키를 부정하지 않는다.

```
F1: if not required y  then declares x      F2: if required x  then declares y      raw {x:1, y:1}
고정점 탐색: A={}→F1 on   A={F1}→F1,F2 on   A={F2}→둘 다 off   A={F1,F2}→F1 off   → 고정점 없음
gaussSeidel=true  cap=4: emit={}         budget-exceeded  ajv=true  ajv(unevaluatedProperties:false)=true
gaussSeidel=true  cap=3: emit={x:1,y:1}  budget-exceeded  ajv=true  ajv(unevaluatedProperties:false)=false
gaussSeidel=false cap=3: emit={y:1}      / cap=5: emit={x:1}
ajv가 raw {x:1,y:1} 자체를 판정하면: true (unevaluatedProperties:false면 false)
```

(3, model.mjs:157-172) 검증기는 인스턴스 전체에 `if`를 한 번 적용하므로 고정점이 필요 없다. 폼의 형상 반복은 다른 의미론이고, "부정 가드 + 다른 조각의 활성 조합"이 일반적으로 고정점에 닿는다는 문장은 이 두 조각으로 깨진다. 커밋 형상은 (i) 상한의 홀짝, (ii) 바퀴 안 갱신 방식에 달리고, `unevaluatedProperties:false`가 있으면 **유효/무효가 홀짝으로 뒤집힌다.** "자기 부정 스키마는 지원 범위 밖"이라는 배제 문장은 이 사이클을 덮지 못한다 — 배제를 "부정 가드가 다른 조각의 선언 키를 읽는 모든 순환"으로 넓히거나, 지원 범위를 정적으로 검출하는 규칙을 적어야 한다(추론: 선언 키 → 가드 참조 키 그래프의 부정 간선 순환 검출은 청사진 시점에 가능하다).

### A4-2 끌어올린 가드의 `{addr:null}` 참은 G1, 빈 중첩 union은 전 분기가 켜지지 않는다 — 통과 + **모순**

중첩 조각의 게이트는 통과: 감싸는 `then`이 꺼진 동안 안쪽 가드는 평가되지 않았고(`guards evaluated 1`), 켜지면 3바퀴로 둘 다 켜지며 ajv와 일치한다(A4-2).

모순 — "빈 중첩 union은 자기 `{}`로 자기 조각을 결정하므로 전 분기가 켜지지 않는다":

```
[A4-2u] init={"pet":{}}  → emit={"pet":{"kind":"cat","meow":"m"}} pet.active=[oneOf[0]]  rounds=2
        init={"pet":null} → emit={"pet":null}                      pet.active=[]          rounds=1
        init={}           → emit={"pet":{"kind":"cat","meow":"m"}} pet.active=[oneOf[0]]  rounds=2
```

host가 `null`일 때만 참이다. host가 `{}`이거나 **부재**이면 A7의 k default(첫 분기 값)가 로드 계약 (i)로 들어가 첫 분기가 켜지고, 그 분기의 default까지 딸려 온다. 빈 입력 `{}`에서 폼이 `{pet:{kind:'cat',meow:'m'}}`을 방출한다 — 호출자가 쓰지 않은 중첩 객체 하나가 통째로 생긴다. A4-2가 말한 "빈"이 null만 뜻한다면 그렇게 적어야 하고, `{}`·부재를 뜻한다면 A7의 k default와 모순이다. 7번 항목(P2)과 함께 볼 것.

---

## 규칙

### A2 원본을 바꾸는 사건 — **모순** + 반례 + 미정의

**모순 — #338 셋째 시나리오는 표의 귀결이 아니다.** 명세는 "#338 null 계약은 이 표의 귀결이다"라 하고, A5는 "자식에 부분 쓰기가 오면 호스트의 `raw`가 비워지고 `emit`이 객체가 된다"고 한다. 현재 테스트 `nullable.object-blank-state.render.test.tsx:53-61`("keeps null when the user only empties a field")은 null 호스트 아래 `reason`을 비운 뒤 `{target:null}`을 요구한다. 하네스의 `clear`는 `''`를 보고한다(`renderForm.tsx:155,449-453`) — 리프 입력, 즉 부분 쓰기다.

```
모델(5):  null host, user clears reason ("")  → emit={}   raw={"host":{"note":"∅","reason":""}}   (host가 객체로 승격, {} → omitEmpty)
현재(current-null.ts):  clear reason under null → getValue={"target":null} reason.value=""
                        then type note           → getValue={"target":{"note":"again"}}
```

3.1판 문장대로면 `{}`(또는 `{target:{}}`)이고 현재 계약은 `{target:null}`이다. 승격 조건을 "빈 값이 아닌 부분 쓰기"로 좁히든 테스트를 바꾸든, 지금 문장은 자기가 귀결이라 부른 테스트와 어긋난다(model.mjs:108 `promote`).

**반례 — batch가 값을 바꾼다.** 전이 (ii)는 커밋 단위다. 같은 두 쓰기를 한 정착에 넣으면 주입이 없고, 두 커밋으로 나누면 있다.

```
[1a] 사용자가 x를 비움 → raw {a:'A', x:∅}
     a:=∅ ; settle ; a:='A' ; settle   → emit={"a":"A","x":1}   (x 되살아남)
     a:=∅ ; a:='A' ; settle             → emit={"a":"A"}         (그대로)
[1a2] 한 정착 안에서 injectTo가 F를 다시 켠 경우도 주입 없음, 두 커밋이면 주입
```

B2는 `batch(fn)`을 "표시만 하고 정착 한 번"으로 설명한다 — 통지 횟수의 문제로 읽히지만 raw가 달라진다. A2 (ii)에 "커밋 사이"를 명시하고 B2에 이 귀결을 적어야 한다(model.mjs:230).

**반례(경계) — default 사슬이 라운드 예산을 먹는다.** 전이 주입은 라운드마다 한 단계씩 나간다(A3 "파생과 같은 라운드 예산"). 정순 조건부 default 사슬은 깊이만큼 라운드를 쓴다.

```
[1e] N=24 rounds=24 ok | N=25 rounds=25 ok | N=26 rounds=25 capped=true p26=undefined | N=30 같음
```

비순환 스키마가 로드에서 `budget-exceeded`로 끝나고 키가 빠진다. 3라운드 T7의 "비순환 30단 injectTo"와 같은 종류지만 `default`는 훨씬 흔하다. 추론: 전이는 순환을 만들 수 없으므로(없음인 자식에만 쓰고 한 조각은 한 번만 OFF→ON) 파생과 예산을 나눌 이유가 없다 — 전이만 따로 "조각 수" 상한을 두면 사슬 깊이 제한이 사라진다.

**반례(경미) — injectTo가 `undefined`를 쓰면 전이와 핑퐁.** 기준선이 "직전 커밋"이라 같은 정착의 매 라운드에 같은 조각이 OFF→ON으로 보인다(1f: rounds=25 capped). 작성자가 선언한 동작이므로 지원 범위 밖으로 적어도 되지만, 기준선을 "직전 라운드"로 바꾸면 사라진다.

**통과** — (b) 사용자가 비운 뒤 형제 쓰기는 되살리지 않는다(1b, Merge도 같음). (c) 두 조각의 다른 default: 한 커밋 안에서는 전순서 마지막(2), 두 커밋이면 먼저 켜진 쪽(1) — 규칙대로다. `a then b`(x:1)와 `load {a,b}`(x:2)가 다르다는 것은 명세가 인정한 이력 의존이다.

**미정의 — `disableDefaultInjection`.** (1) 로드 커밋의 통지 파동에서 리스너가 쓴 값이 조각을 켜면 주입된다(1d: `listener Merge → t` → `x:1`). 명세는 "사용자 쓰기가 일으킨 전이"라 했는데 리스너·injectTo 쓰기가 사용자 쓰기인지 말하지 않는다. "초기값 조작 비활성화"를 켠 앱의 onChange 동기화가 default를 되살릴 수 있다. (2) union k의 합성 default(첫 분기 값)도 이 플래그에 걸린다(1d 첫 줄 `kind:∅`, 어느 분기도 켜지지 않음) — A7의 "default"가 로드 계약의 default인지 명시가 없다. (3) `reset()`은 통과(1d 셋째 줄: 주입 없음, defaultValue만). (4) 표의 (i) "전체 교체 직후"가 A3 파이프라인의 어느 칸인지 없다 — 모델은 전체 교체가 `committedActive`를 비워 전이 단계가 (i)를 겸하게 했다(model.mjs:106,123). 이 읽기라야 "호스트가 null이어도 (i)는 적용된다"가 성립한다.

### A4-3 가드 입력 = 검증기가 볼 값 — 통과 (+미정의)

통과: `a:''`는 가드에도 검증기에도 없다(2a: F off, ajv `then` 미적용 일치). 사용자는 빈 입력을 보므로 "텍스트가 보이는데 없다"는 상황은 `omitEmpty`로는 생기지 않는다. 다만 **중첩 호스트가 전부 빈 값이면 `{}`로 투영되어 통째로 빠진다** — `required o`가 거짓이 되는데 화면에는 o 그룹이 렌더돼 있다(2a 셋째 줄). 검증기와는 일치하므로 P1 기준 통과, UX 기준 관찰.

미정의: 상한 초과 자식을 읽는 부모. 부모는 자식의 마지막 바퀴 투영을 본다 — 2b에서 자식 emit `{}`(raw는 `{x:1,y:1}`), 부모 가드 `properties.c.required[x,y]`는 c 부재로 공허히 참, `both` 켜짐. **부모의 `settle`은 `stable`이다.** 상태가 조상으로 오르지 않으므로 루트만 구독하는 소비자는 하위 상한 초과를 모른다. B4가 `UpdateSettle`을 낸다지만 어느 노드에서인지 §A는 말하지 않는다.

상속 overlay + 자식 가드가 overlay 키를 읽는 경우의 재계산 상한(2c): 부모 바퀴 ≤ N_p+1, 바퀴마다 overlay 조각 토글 ≤ K, 토글마다 자식 재계산 1회(각 ≤ N_c+1 바퀴 × N_c 가드) → 정착당 자식 가드 평가 ≤ (N_p+1)·K·(N_c+1)·N_c. overlay를 거친 자기 부정은 3바퀴에 `budget-exceeded`로 끝났다(2c 마지막 줄) — 이 경우 자식 재계산은 부모 바퀴 수(3)에 묶였다.

### A4-4 옵션 B와 상한 — **반례** + 미정의

반례는 A4-1과 같다(3). 추가로 미정의 둘: (1) "한 바퀴에 모든 조각의 가드를 평가"할 때 앞 조각의 토글이 뒤 조각의 G에 반영되는가(가우스-자이델) — 반영되면 정순 2바퀴, 아니면 N+1바퀴이고 상한 초과 시의 emit도 달라진다(3: 같은 cap=3에서 `{x,y}` vs `{y}`). (2) "조각 수"에 무조건 조각이 드는가 — 홀짝이 바뀌므로 emit이 바뀐다(3: cap 3/4/5).

### A4-5 금지 조각 없음 — 통과

모델은 `false` 서브스키마를 선언으로 읽지 않는다(model.mjs:58). 진동·공허 참 없음. 기각된 값의 처리는 A8로 넘어간다.

### A4-6 상속 overlay — 미정의 + 관찰

미정의: 부모 바퀴에서 overlay 조각이 토글될 때 자식을 **즉시** 재계산하는지(같은 바퀴의 뒤 가드가 새 자식 emit을 본다), 바퀴 끝에 하는지. 4의 작은 사례에서는 둘이 같은 결과였지만 가우스-자이델 여부와 같은 종류의 미정의다(model.mjs:29,182).

관찰 1 — **출발점 고정이 overlay 자식을 매 정착 2회 이상 재계산시킨다.** 부모의 A는 무조건 집합에서 시작하므로 직전 커밋에 켜져 있던 overlay도 출발점에는 없다. 자식의 커밋된 emit은 overlay가 켜진 채 계산된 것이라 첫 가드가 읽기 전에 overlay 없이 한 번, 토글 뒤 한 번 다시 계산한다.

```
[4] 부모 a 한 글자 (P 이미 켜짐, 변화 없음): computes=4 sweeps=5 guards=5  (조각 2개짜리 스키마)
    K=6 overlay 조각(역순 사슬 뒤): 자식 computes=9, 부모 sweeps=2, 부모 cap=14
```

자식 재계산 횟수는 부모의 상한(바퀴 수)이 아니라 토글 수에 묶인다 — 부모 바퀴 2회에 자식 9회. 모델의 재설정은 model.mjs:151.

관찰 2 — 로드 시 overlay default(q)와 그것에 의존하는 자식 default(r)는 라운드 두 개를 쓴다(2c `rounds=2`). A2의 사슬 예산 문제가 중첩으로도 닿는다.

### A4-7 local/emit 합성 — 통과

`{zz:1, b, c, a, yy:2}` 로드 → emit 키 `["a","b","c","zz","yy"]`(A4-7). "delete를 쓰지 않는다"는 구현 세부라 모델로 시험하지 않았다.

### A5 비객체 호스트 — **모순** + 미정의

모순은 A2에 적은 #338 셋째 시나리오와 같다.

두 뷰(5): `getValue()={"host":17}`, `node.find('/host/note').value=undefined`, `reason='because'`, 검증기 `/host must be object,null`. 명세대로다. 현재 라이브러리는 `17`을 버리고 `{}`를 낸다(`current-null.ts`: `target := 17 → getValue={}`) — 3.1판은 잘못된 종류의 값을 **보존해 방출**하므로 동작 변화이고 T-1–T-9에 없다(관찰).

미정의 — extras의 생존. `{note, reason, zz}` → `17` → note 타이핑. "키가 없으므로 모든 자식이 없음"은 자식만 말한다. 모델은 두 읽기를 스위치로 뒀다(model.mjs:31,119-120).

```
[5] extras 지움:  emit={"host":{"note":"typed","reason":"because"}}
    extras 유지:  emit={"host":{"note":"typed","reason":"because","zz":"extra"}}
```

통과 — null 호스트와 all-default 객체 호스트는 구별된다(`{"host":null}` vs `{"host":{"reason":"because"}}`), 자식 뷰는 같다.

### A6 비제어 입력의 재읽기 — 미정의 + 관찰

미정의 — "다르다"의 동치. 하네스의 숫자 입력은 비우면 `NaN`을 보고한다(`renderForm.tsx:166` `valueAsNumber`).

```
[6] NaN 보고 → refresh(===)=["/n"]   refresh(Object.is)=[]
    배열 값 입력이 매번 새 배열 보고 → 참조 비교면 매 키마다 Refresh → 리마운트 → T-2 위반
```

값 동치·참조 동치·`Object.is` 가운데 무엇인지 적어야 한다. 객체·배열을 보고하는 입력(태그 편집기, 날짜 범위)에는 참조 비교가 곧 T-2 위반이다.

관찰 — "커밋된 raw ≠ 보고한 값"이 거짓인데 DOM이 낡은 경우: 입력이 포매터로 `12a`를 `12`로 고쳐 보고하면 raw=`12`=보고 값, Refresh 없음, DOM은 `12a`(6 첫 줄). 규칙은 보고 값만 알고 DOM을 모른다 — "보고한 값은 DOM의 값과 같다"는 입력 컴포넌트의 의무를 T-2나 렌더 계층 규칙에 적어야 한다. injectTo가 방금 보고한 값과 같은 값을 쓰는 경우는 통과(Refresh 없음, DOM 정확).

### A7 union — **반례** + 미정의

반례 — **초기 선택 규칙이 로드 값을 숨긴다.** 선택 가드 union `oneOf:[{a,b},{c}]`에 `{c:'C'}`를 로드하면 "값 키를 가장 많이 선언한 통과 분기"는 분기 0이다(`properties`만 있는 분기는 무엇이든 통과).

```
[7] selection initial for {c:"C"} = 0  emit={}        ← c는 자식 raw에 있으나 방출되지 않음
    reset() (defaultValue {c:"C"}):   selection=0 emit={}
```

E17이 "호스트가 요구하는 키를 선언한 조각"에 가중을 두지만 **V에 실제로 있는 키**에는 두지 않는다. 규칙에 "V의 키를 가장 많이 선언한" 항을 앞세워야 한다(model.mjs:95-100).

미정의 — (1) 사용자가 selection=1을 고른 뒤 `setValue({a,b}, Overwrite)`: selection은 그대로이고 a·b는 비활성 자식 raw로 가서 emit `{}`(7). 전체 교체가 selection을 초기화하는지 명세는 `reset()`만 말한다. (2) 에러 라우팅: 명세는 "(`const` × N, `oneOf`)"만 든다. k가 없는 인스턴스의 에러는 `required` × N + `oneOf`다.

```
[7] errors for {}          : required@#/oneOf/0/required, required@#/oneOf/1/required, oneOf@#/oneOf
    errors for {kind:"zzz"}: const@#/oneOf/0/…/const, const@#/oneOf/1/…/const, oneOf@#/oneOf
```

`required`의 instancePath는 호스트다. 규칙이 키워드로 고르면 이 셋은 호스트에 남고 판별 노드는 비어 있다. "schemaPath가 `oneOf/i` 아래인 모든 에러"로 적어야 한다.

k default = 첫 분기 값: 규칙으로 선언된 것이므로 P2 위반이라 부르지는 않겠다. 다만 빈 폼이 `{kind:'cat'}`을 내고(ajv 유효), 플래그를 켜면 `{}`(ajv 무효)다. A4-2의 중첩 사례처럼 호출자가 쓰지 않은 값이 방출에 생기는 유일한 통로이며, `disableDefaultInjection`의 문서에 "판별식 default도 꺼진다"를 적어야 한다.

### A8 잔여 키 — 통과 + 미정의

통과 — extras의 기각 키는 경로·값·에러와 함께 나오고 `removeKey`로 사라진다(8: `/zz must NOT have additional properties`). 분기 하나에만 `unevaluatedProperties:false`가 있으면 분기에 따라 잔여가 나타났다 사라진다(8: cat에서 잔여, dog에서 없음) — 검증기의 판정 그대로이므로 P1 기준 통과.

미정의 — **비활성 조각이 선언한 자식 raw.** `removeKey`가 extras와 자식 raw에 같은 이름으로 걸리지만 뜻이 다르다: extras는 영구 삭제, 자식 raw는 "없음"이 되어 조각이 켜지면 default가 되살아난다(8: x 삭제 → a 입력 → `x:1`; 삭제 안 하면 `x:5` 유지). 그리고 이 키는 방출되지 않으므로 검증기가 기각할 수 없고, 잔여 목록에 오르지 않는다 — 사용자는 볼 수도 지울 수도 없는데 조각이 켜지면 나타난다(S6 패턴이 잔여 UI로도 풀리지 않는다). 추론: 잔여는 검증 결과에서 나오는데 검증은 비동기(A3)이므로 잔여 목록은 커밋과 같은 시점에 존재하지 않는다 — `residual`이 어느 revision의 것인지 명세에 없다.

### 비용 (9번 공격) — 통과(수치 확인)

```
[9] N=30  정순: guards=60     sweeps=2    | 역순: guards=930    sweeps=31
    N=200 정순: guards=400    sweeps=2    | 역순: guards=40,200 sweeps=201   (ms는 모델 값, 참고만)
```

키 입력은 사슬과 무관한 `note`였다. 출발점 고정이라 **호스트 안 어느 키를 쳐도** 역순 200단은 40,200회다 — 3라운드 수치와 같다. E13의 역색인은 "무조건 루트 키만 읽는 가드"에만 쓰이고 사슬 가드는 조건부 키를 읽으므로 적용되지 않는다. 추론: 직전 커밋의 `active`를 **출발점이 아니라 바퀴 순서의 힌트**로만 쓰면(먼저 켜져 있던 조각부터 평가) 결과는 같고 역순 사슬이 2바퀴로 준다 — P3(이력을 읽지 않는다)와 충돌하지 않는 최적화다.

---

## 실행 파일

- `spikes/work-loop/redteam4/model.mjs` — 3.1 명세 모델(256줄). 미정의 지점의 읽기는 `options`로 노출.
- `spikes/work-loop/redteam4/attacks.mjs` — 섹션 1a·1a2·1b·1c·1d·1e·1f·2a·2b·2c·3·4·5·6·7·8·9·A4-2·A4-2u·A4-7·A1-1·A3-1.
- `spikes/work-loop/redteam4/output.txt` — 전체 출력.
- `spikes/work-loop/redteam4/current-null.ts` — 현재 `src/core` 실행(vite-node). null 호스트 아래 `''` 쓰기, `17` 교체, `setValue(getValue())` 왕복.
