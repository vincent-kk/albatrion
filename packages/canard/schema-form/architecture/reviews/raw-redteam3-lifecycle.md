# 3라운드 레드팀 — 작업 루프 3차안(A)과 책임 경계(C)

대상: `reviews/round-3-spec.md` §A·§C. 방법: 명세 문장만으로 독립 모델을 만들어(`spikes/work-loop/redteam3/model.mjs`, 263줄, ajv 8 가드) 공격 입력을 실행했다(`spikes/work-loop/redteam3/attacks.mjs`, 전체 출력은 `spikes/work-loop/redteam3/output.txt`). 아래 입·출력은 모두 그 실행 결과를 그대로 옮긴 것이며, 실행하지 않은 지적은 **추론**으로 표시했다. `∅`는 raw 없음(C1의 "없음")이다.

모델이 명세를 읽은 방식(공격의 전제이므로 먼저 적는다):

- 조각 순서 = (키워드 순위 `properties` < `allOf[i]` < `if/then` < `oneOf/anyOf`, 배열 인덱스, 중첩 깊이)의 튜플 비교 — `model.mjs:59`.
- 호스트 계산: 무조건 조각으로 출발, 조각마다 `L := compose(A)`를 새로 만들어 가드 평가, 참이면 켜고 새로 활성이 된 자식에 그 조각이 선언한 `default`를 주입한 뒤 즉시 자식 계산 — `model.mjs:183-210`. 옵션 A(단조)가 기본.
- "이번에 처음 활성"은 두 해석을 모두 둔다: 정착마다(`settle`) / 노드 수명 동안 한 번(`lifetime`) — `model.mjs:187`.
- `compose`는 활성 자식의 `emit`과 호스트 raw의 extra를 합치고, 금지 키는 남긴다(A3-5) — `model.mjs:218`. `project`는 금지 키와 `''`·`{}`를 뺀다(omitEmpty) — `model.mjs:224`.
- 파생: 계산이 끝난 트리에서 활성 노드의 `injectTo`를 평가, 쓰기가 생기면 다시 계산, 상한 25 — `model.mjs:237-253`.
- 쓰기: `setValue`는 전체 교체(V에 없는 자식은 `∅`, extra는 호스트 raw) — `model.mjs:132-151`; 부분 쓰기는 경로 위의 비객체 호스트 raw를 비운다(C3) — `model.mjs:156`.

---

## A. 작업 루프 3차안

### A3-1 (emit은 (스키마, raw)의 함수, 이력 무관) — 반례

**(a) 자동 쓰기가 raw를 이력의 함수로 만든다.** 두 조각이 같은 자식 `x`를 다른 `default`로 선언한다.

```
schema: properties {a, b}
        allOf[0]: if required a → then properties x default 1
        allOf[1]: if required b → then properties x default 2
```

사용자가 쓴 raw는 세 경우 모두 `{a:'x', b:'y'}`다. 실행(`attacks.mjs:14`):

```
a then b : emit={"a":"x","b":"y","x":1}
b then a : emit={"a":"x","b":"y","x":2}
setValue : emit={"a":"x","b":"y","x":1}
```

명세의 문장 "같은 raw는 어떤 쓰기 순서로 도달했든 같은 emit을 낸다"는 raw에 자동 쓰기(default 주입)의 결과를 포함시켜야 참이 되는데, 그러면 "raw가 같다"가 이미 "emit이 같다"를 담고 있어 공허하다. 사용자가 관찰하는 raw(자기가 쓴 값)로는 세 경로가 두 결과로 갈린다. S3-b의 반례(`{a}`·`{b}`·상한)는 사라졌지만, 같은 모양의 이력 의존이 `default`를 통해 남는다. 명세는 같은 자식을 둘 이상의 조각이 선언할 때 어느 `default`를 쓰는지도 적지 않았다(A5는 판별 프로퍼티에 대해서만 "활성 분기의 스키마를 overlay"라고 말한다) — 모델은 "그 자식을 처음 켠 조각의 default"를 택했다(`model.mjs:189`).

**(b) "이번에 처음 활성"이 정의되지 않았고, 두 해석이 각각 다른 규칙을 깬다.** 출발점이 매 정착 고정이므로 조각은 매 정착 "처음" 켜진다. 실행(`attacks.mjs:22`, 스키마 `if required a → then x default 1`, 로드 `{a:'x'}` 뒤 사용자가 x를 제거하고 무관한 z를 타이핑):

```
[settle]   remove x : emit={"a":"x","x":1}            ← 제거한 정착에서 바로 다시 주입
[settle]   type z   : emit={"a":"x","z":"q","x":1}
[lifetime] remove x : emit={"a":"x"}
[lifetime] setValue({a:'x', z:'q'}) : emit={"a":"x","z":"q"}   ← C2 "V에 없는 키에는 default" 위반
```

정착 단위 해석이면 사용자는 default가 있는 조건부 자식을 영원히 지울 수 없다(A3-4C의 `if not required x → x default 1`도 같다: 제거 즉시 `{"x":1}`로 돌아온다). 수명 단위 해석이면 `everActive` 같은 raw 밖의 상태가 생겨 emit이 (스키마, raw)만의 함수가 아니게 되고, C2의 로드 계약과도 어긋난다. — `model.mjs:187`.

**(c) 전순서가 중첩을 무시한다.** 튜플이 키워드 순위를 먼저 비교하므로 `then` 본문 안의 `allOf[0].then`(순위 `allOf`, 깊이 2)이 자기를 감싼 `then`(순위 `if`, 깊이 1)보다 앞에 온다. 실행(`attacks.mjs:55`):

```
fragment order: /properties[0,0,1] < then/allOf[0].then[1,0,2] < then[2,0,1]
raw {q} only (outer then is OFF): emit={"q":"Q","deep":"DEEP"} active=["then/allOf[0].then"]
```

바깥 `then`이 꺼져 있는데 그 안의 조각이 켜져 `deep`이 주입됐다. 명세는 "자식이 서브트리를 가지면 그 안에서 같은 절차가 돈다"고만 말하고, 같은 호스트 안의 중첩 조각이 감싸는 조각에 게이트되는지, 순서가 경로 사전순인지 적지 않았다. 검증기는 이 emit을 통과시키므로(`ajv: ok`) 에러로도 드러나지 않는다. — `model.mjs:76`.

### A3-2 (의존 체인 30단: 정방향 1바퀴, 역방향 최대 30바퀴, "각 바퀴는 켜진 조각의 가드만") — 모순 + 반례(비용)

**모순.** A3 4단계: "이때 **이미 켜진 조각의 가드도** 다시 평가한다." A3-2: "각 바퀴는 **켜진 조각의 가드만** 다시 돈다." 옵션 A에서 켜진 조각의 재평가 결과는 버려지므로(끄지 않는다) 그 평가는 아무 효과가 없고, 역방향 체인을 푸는 것은 **꺼진** 조각의 재평가다. A3-2를 문자 그대로 실행하면 체인이 풀리지 않는다(`attacks.mjs:40`):

```
reverse=true reevalOn=true : rounds=31 guards=930 activeCount=30
reverse=true reevalOn=false: rounds=31 guards=465 activeCount=30
reverse=true, A3-2 literal (only ON guards re-run): rounds=2 guards=31 activeCount=1
```

**반례(비용).** 역방향 체인은 바퀴 r에서 조각 하나가 켜지고 남은 N−r개의 가드를 다시 돌므로 가드 평가가 O(N²)이다. 출발점이 매 정착 고정이므로 이 비용은 체인과 무관한 리프의 **키 입력마다** 다시 든다(`attacks.mjs:60`):

```
N=30  reverse chain, keystroke in note: rounds=31  guards=930   time=1686µs
N=30  forward chain, keystroke in note: rounds=2   guards=60
N=200 reverse chain, keystroke in note: rounds=201 guards=40200 time=274901µs
N=200 forward chain, keystroke in note: rounds=2   guards=400
```

정방향이라도 "A가 바뀌었으면 2로 돌아간다"에 걸려 2바퀴 = 2N 가드가 최소다. 2라운드 §4의 기각 근거("새 방식이 키 입력당 두 자릿수 배 싸다")는 S3 스파이크(직전 활성 집합에서 출발, 바뀐 키의 역색인)를 잰 것이고, 고정 출발점의 전수 재평가는 잰 적이 없다. 이 수치는 모델의 `compose(A)`를 조각마다 새로 만드는 비용을 포함하므로 시간은 상한이지만, 가드 평가 횟수는 명세가 정한 것이다. 30단 체인은 비현실적이라 해도 조각 30개인 호스트에서 1.7 ms/키 입력은 그렇지 않다. 추론: 정착이 동기이므로 이 시간은 타이핑 이벤트 핸들러 안에 그대로 들어간다.

### A3-3 (판별 필드 교착 S2 없음) — 통과

union 호스트의 `k`를 무조건 조각으로 만든 뒤(`model.mjs:104`) 실행했다(`spikes/work-loop/redteam3/a33.mjs`, `oneOf:[{k const 'cat', meow default 'M'}, {k const 'dog', bark}]`):

```
init {}                      → emit={} active=[] ajv=false
init {"k":"cat"}             → emit={"k":"cat","meow":"M"} active=["oneOf[0]"] ajv=true
init {"k":"zzz","name":"n"}  → emit={"name":"n","k":"zzz"} active=[] ajv=false
init {"k":""}                → emit={} local={"k":""} active=[] ajv=false
cat→dog                      → emit={"k":"dog"} raw={…,"meow":"M",…} active=["oneOf[1]"]
```

교착은 없다 — `k`는 항상 존재하고 분기 가드 `{required:[k], properties:{k:{const}}}`가 `L`에서 `k`를 본다. 어느 분기에도 맞지 않는 `zzz`는 원본이 보존되고 검증기가 기각한다(codex 권고와 일치). 다만 A5의 "항상 방출된다"는 `k`의 raw가 없을 때 거짓이다(빈 폼의 `emit={}`). 존재와 방출은 다른 말이다. `k=''`는 가드가 `L`을 보므로 const에 실패해 분기가 꺼지고, emit에서는 `omitEmpty`로 빠져 검증기가 `oneOf`를 기각한다 — 형상과 판정이 일치한다.

### A3-4 (비객체 호스트의 공허한 참 S8 없음. 가드는 항상 객체인 L을 본다) — 반례 (한 단계 위에서 되살아난다)

호스트 자신의 `L`은 객체다. 그러나 `L`의 **항목**은 자식의 `emit`(투영 후)이고, ADR 0002 규칙 6이 요구하는 "끌어올린 조건"은 정확히 그 항목을 들여다본다. 실행(`attacks.mjs:104`):

```
guard {properties:{addr:{required:['zip']}}} on {}                → true   (공허)
                                             on {"addr":{}}       → false
                                             on {"addr":null}     → true   (공허)
                                             on {"addr":{"zip":"1"}} → true
init {"addr":null} → L={"addr":null,"zipNote":"has zip"} active=["allOf[0].then"] emit={"addr":null,"zipNote":"has zip"}
```

`addr`가 null이면 부모의 끌어올린 가드가 공허하게 참이 되어 `zipNote`가 주입된다. S8이 말한 "빈 중첩 union에서 모든 분기가 켜진다"는 union 호스트 자신의 `L={}`로 막혔지만, 부모가 자식을 들여다보는 가드(규칙 6의 표준 관용구)에서는 같은 공허함이 그대로 남는다. `{addr:{}}`는 `L`이 투영 전이라 `{}`로 보여 막힌다 — null만 뚫린다. A6의 "null 호스트의 가드는 `L={}`"가 **부모 쪽 가드가 보는 자식 값**에는 적용되지 않기 때문이다.

같은 자리의 두 번째 문제 — **가드가 보는 값과 검증기가 보는 값이 갈린다.** A3는 `L`이 투영 전이라고 정한다. 리프는 `local = emit = raw`이므로 `''`는 `L`에 그대로 있다(`attacks.mjs:99`):

```
schema: properties {a}; allOf[0]: if required a → then properties b default 'B', required [b]
raw {a:''} → local={"a":"","b":"B"} emit={"b":"B"} active=["allOf[0].then"]
guard `required a` on L: true   on emit: false
validator input {"b":"B"} → ok
```

폼은 `a`가 "있다"고 보고 조각을 켜 `b`를 그리며 필수로 표시한다. 검증기는 `a`가 없는 emit을 받아 `if`를 거짓으로 보고 `then`을 적용하지 않는다. ADR 0007의 합의 근거(소유자: "가드는 방출 값을 보는 게 맞다. 빈 문자열을 '있다'고 보는 게 오히려 이상하다")와 결정("가드는 방출 값을 본다. 검증기가 보는 값과 같다. 형상과 판정이 어긋날 수 없다")에 정면으로 어긋난다. S9의 해법이 A3-4의 대가로 ADR 0007의 원칙 하나를 지웠는데 명세는 그것을 적지 않았다.

### A3 4단계 옵션 A (단조) — 반례

`then`과 `else`가 **동시에** 켜진다. 실행(`attacks.mjs:73`):

```
schema: properties {mode}
  allOf[0]: if not required extra → then {fallback default 'F'}
                                   else {properties {mode, extra}, additionalProperties false}
  allOf[1]: if mode == 'full'     → then {extra default 'E'}
raw {mode:'full'}
monotone=true : emit={"mode":"full","fallback":"F","extra":"E"}  active=[allOf[0].then, allOf[1].then, allOf[0].else]  rounds=3
                ajv: must NOT have additional properties / must match "else" schema
monotone=false: emit={"mode":"full","extra":"E"}                active=[allOf[1].then, allOf[0].else]  rounds=3
                ajv: ok
```

1바퀴: `L={mode}`에서 `not required extra`가 참 → `fallback` 주입; 이어 `mode=='full'` 참 → `extra` 주입. 2바퀴: `not required extra`가 거짓이 됐지만 끄지 않고, 그 부정인 `else`가 참이 되어 켜진다. 결과는 한 `if`의 `then`과 `else`가 모두 활성인 형상이다 — ADR 0002는 `else`의 가드를 "`if`의 부정"으로 정의했으므로 이 상태는 모델 안에서 표현 불가능해야 한다. 검증기는 emit을 기각하고, 옵션 B는 3바퀴 만에 검증기가 받아들이는 고정점에 닿는다.

**얼마나 흔한가.** 발동 조건은 (1) 부정 가드(`not required k`)를 가진 조각이 (2) 자기 뒤에 평가되는 조각의 `default` 주입으로 거짓이 되는 것이다. 요청받은 관용구 `if not required x → then required y`는 `default`를 주입하지 않으므로 갈리지 않는다(`attacks.mjs:82`: 단조·비단조 모두 `emit={}`, `y` 필수 에러 — 일치). ADR 0007이 대표 진동으로 든 `if not required x → x default 1`도 단조에서는 `{"x":1}`로 정착하고 검증기가 받아들인다(`attacks.mjs:86`). 즉 옵션 A의 어긋남은 "부정 가드 + 다른 조각의 default"의 교집합에서만 나고, 그 교집합에서는 **`then`/`else` 동시 활성**이라는 모델 밖의 형상을 만든다. 명세의 "그 어긋남은 검증기의 에러로 드러난다"는 사용자가 아무것도 입력하지 않은 폼(`{mode:'full'}` 로드 직후)에 에러가 뜬다는 뜻이다.

### A3-5 (금지 조각은 A에 들어가되 compose에 영향 없음, 투영에서만 제외) — 통과

`if required a → then properties a:false`, raw `{a:'here'}`(`attacks.mjs:93`): `local={"a":"here"} emit={}`, 가드는 `a`를 보고 조각은 켜진 채 고정, ajv(emit) ok. S5의 진동은 없다. 다만 `ajv(local)`은 기각이므로 A8에 따라 `node.value`가 돌려주는 값은 검증기가 기각하는 값이다 — A8 항목에서 다룬다.

### A4 (파생 단계, 상한 25, "마지막 라운드의 트리로 고정") — 모순

**상한에서 raw와 트리가 갈린다.** `t.injectTo: u := t+1`, `u.injectTo: t := u+1`(`attacks.mjs:128`):

```
{"rounds":26,"capped":true} raw={"t":26,"u":26} emit={"t":25,"u":25}  raw == emit ? false
```

"값은 받아들이고 마지막 라운드의 트리로 고정한다"를 그대로 하면 마지막 라운드의 쓰기는 raw에 들어갔고 트리는 그 전 계산이다. 커밋된 트리의 `emit`이 `F(스키마, raw)`가 아니게 되어 A3-1과 모순이다. 마지막 쓰기를 버리면 "값은 받아들인다"가 거짓이 된다. 둘 중 무엇인지 명세가 정해야 한다. — `model.mjs:252`.

**꺼진 조각 안의 주입자가 남긴 값.** `if not required t → then c default 'C', c.injectTo t := 'from-'+c`(`attacks.mjs:133`):

```
default /c := "C"; injectTo /c -> /t := "from-C" (round 0)
emit={"t":"from-C"} active=[]           ← c는 비활성, t는 c가 쓴 값
user removes t: emit={"t":"from-C"}     ← 조각이 다시 켜지고 c가 다시 쓴다
```

수렴은 하고(1라운드) 트리도 일관된다(local·emit·active가 같은 raw에서 나온다). 그러나 사용자는 `t`를 지울 수 없다. 스키마 작성자의 문제로 볼 수도 있어 반례가 아니라 기록으로 남긴다.

**`injectTo`가 호스트에 비객체를 쓸 때의 쓰기 종류가 없다.** `src.injectTo: host := 17`(`attacks.mjs:138`). 모델은 전체 교체로 다뤄 `host`의 자식 raw를 지웠다(`raw host={"a":"∅","b":"∅"}`). 부분 쓰기라면 자식 raw가 남는다. C1의 세 종류 가운데 `injectTo`가 어디인지 명세가 적지 않았다 — 미정의.

### A5 (판별 프로퍼티는 union이 소유) — 미정의 (세 입력)

1. **분기마다 `k`의 `default`가 다르다.** `oneOf:[{k const 'a' default 'a', x default 'X'}, {k const 'b' default 'b', y default 'Y'}]`(`attacks.mjs:145`): 모델의 `k` 스키마는 `{enum:['a','b']}`이고 default가 없어 빈 폼은 `emit={}`, ajv는 `oneOf` 기각. A5의 "분기가 활성이면 그 분기의 k 스키마를 overlay"는 활성 **뒤**의 이야기이고, 활성 **전**에 어느 default를 쓰는지(첫 분기? 없음?)가 없다. C2의 "없는 키에 default"와 만나면 답이 필요하다.
2. **값 union** `oneOf:[{type:'string'}, {type:'object', properties:{k const 'o', v}}]`(`attacks.mjs:149`): B 3단계는 후보를 찾지 못해 `select`가 되고, A5의 "union 호스트의 무조건 자식"에서 호스트가 object가 아니다. 모델은 C3 경로로 `'hello'`를 호스트 raw에 들었다. 2라운드가 "원시값 union은 청사진 밖"이라 적었으나 3차안이 이를 닫지 않았다.
3. **`anyOf`에서 두 분기가 같은 `k` 값**(`attacks.mjs:153`, `[{k:'a', x}, {k:'a', y}, {k:'z', z}]`): B 4단계대로 `select`로 떨어져 세 번째 분기까지 판별식을 잃는다. 검증기에는 `{k:'a', x, y}`가 유효한(anyOf) 입력이지만 폼은 사용자 선택으로만 형상을 정한다. 명세대로 동작하므로 반례는 아니다 — 서로소가 아닌 `anyOf`를 "겹치는 분기만 select, 나머지는 판별"로 다룰지는 미정의.

### A6 (null 계약: 부모 null 아래 자식 raw 유지, S4 폐기) — 모순

**C1과 양립하지 않는다.** C1: "`setValue(V)` … V에 없는 자식의 raw는 지워진다(초기값이 아니라 없음이 된다)." A6: "부모가 `null`이 되면 자식의 raw는 **유지된다**." 부모를 null로 만드는 쓰기는 `setValue(null)`, 즉 전체 교체이고 `null`에는 어떤 자식도 없다. 실행(`attacks.mjs:159`, `{note:'typed', keep:'K1'}` → `setValue(null)` → 부분 쓰기 `note:='Z'`):

```
A6 읽기 (자식 유지): after null raw={"note":"typed","keep":"K1"} emit=null  → write note: emit={"note":"Z","keep":"K1"}
C1 읽기 (전체 교체): after null raw={"note":"D","keep":"∅"}      emit=null  → write note: emit={"note":"Z"}
```

C1 읽기의 결과는 정확히 S7이 기록한 현재 계약(#338 S4, "blank로 되돌린다")이다 — `note`는 default `'D'`, `keep`은 없음, 이후 `{note:'Z'}`만 방출. 즉 A6이 폐기한다고 한 동작을 C1이 그대로 다시 만든다. `null`을 전체 교체의 예외로 적거나, "null이 되는 쓰기"를 세 종류 밖의 네 번째로 두어야 한다. (현재 라이브러리의 S4 동작은 2라운드 RL이 실행으로 확인했고 여기서 다시 돌리지 않았다.)

**null 호스트 안의 default 주입은 성립한다.** `if not required a → then d default 'D'`, 호스트 null(`attacks.mjs:168`): `emit=null raw={"a":"∅","d":"D"} active=[then]` — 조각은 켜지고 raw는 쓰였으나 emit은 null. 이어 `a:='A'` 부분 쓰기로 호스트가 객체가 되면 `emit={"a":"A"}`, `d`는 조각이 꺼져 잠복. "자동 쓰기는 null 조상을 객체로 만들지 않는다"는 지켜진다. 다만 그 raw 쓰기가 dirty·revision을 올려 눈에 보이지 않는 통지가 나는지는 미정의(추론).

**`omitEmpty`가 부모를 지울 때**(`attacks.mjs:172`, `addr` 필수, `addr.zip` 필수): `{addr:{}}`와 `{addr:{zip:''}}`는 모두 `emit={}`로 `required addr` 에러. C2의 "왕복이 `''`를 잃는 것은 작성자가 omitEmpty를 끄는 것으로 해결"과 일치하므로 통과. 단, 그 에러는 필드 `zip`이 아니라 부모 `addr`에 붙는다 — 사용자에게 보이는 자리가 한 단계 위다(추론).

### A7 (같은 파동의 보장은 payload에 한정; `node.value`는 현재 커밋) — 미정의

실행(`attacks.mjs:183`): 파동 1의 리스너 1이 동기 `setValue(2)`를 하면 리스너 2는 `payload={"n":1.5}`, `getValue()={"n":2}`, `node.value={"n":2}`를 본다. 명세대로다. 문제는 A8과 합쳐질 때다: payload는 **local**(투영 전)이고 소비자의 `onChange`가 원하는 것은 **emit**이다. emit은 payload에 없고 `getValue()`는 현재 커밋이므로, 파동 1의 emit을 얻을 방법이 없다 — 투영이 무언가를 바꾼 노드에서는 payload로도 복원할 수 없다. "루트 `onChange`의 인자는 무엇인가"(payload인 local인가, 그 시점의 emit인가)를 명세가 답하지 않는다.

### A8 (`node.value`·payload = 투영 전 로컬 메모, `getValue()` = emit) — 모순(문장) + 미정의

**문장.** "`node.value`와 `UpdateValue` payload는 `local`이 아니라 **투영 전의 로컬 메모**를 돌려준다." 용어 절에서 로컬 메모 = `local`이다. 문장이 자기 정의와 충돌한다(`emit`이 아니라 `local`을 돌려준다는 뜻으로 읽었다).

**A3-5와의 결합.** 금지 조각이 켜진 호스트의 `node.value`는 `{"a":"here"}`이고 검증기는 이 값을 기각한다(`attacks.mjs:93`, `ajv(local): boolean schema is false`). 필드 수준 에러를 `node.value`에 붙이는 소비자는 자기가 보는 값과 판정된 값이 다른 노드를 갖는다 — 명세는 "이 둘이 참조가 다른 곳은 투영이 무언가를 바꾼 노드뿐"이라고만 적었고, 그 노드에서 에러가 어느 값에 대한 것인지는 없다.

**local은 바뀌고 emit은 같을 때.** `addr.zip := ''`(`attacks.mjs:178`): `local={"a":"x","addr":{}}`, `emit={"a":"x"}`, 이전 emit과 내용은 같고 참조는 다르다("이전 emit을 복사하고 바뀐 키만 패치" — 복사 자체가 새 참조). 루트 `onChange`가 참조 변화로 발화하면 값이 같은 통지가 나가고, 내용 비교로 막으면 "같은 값을 두 번 읽으면 같은 참조"를 위해 비교 비용이 든다. 어느 쪽인지 미정의. ADR 0006 "바뀐 자식이 없으면 이전 참조"는 자식(`addr`의 local)이 바뀌었으므로 여기에 답하지 않는다.

---

## 추가 공격 (지정된 각도)

### 중첩 호스트 — 미정의

ADR 0002 규칙 6: "`then`은 직계 자식이 아닌 자손에도 조각을 얹을 수 있어야 한다." A3는 조각이 "선언한 **자식**"만 말한다. 부모 조각이 손자를 선언하는 스키마(`attacks.mjs:112`):

```
allOf[0]: if required flag → then properties { child: { properties: { q default 'Q' } } }
child: properties {p}; allOf[0]: if required q → then r default 'R'
raw {flag:'on', child:{p:'P'}} → emit={"flag":"on","child":{"p":"P"}}
child fragments: ['/properties','allOf[0].then']  child children: ['p','r']  child overlays: [{properties:{q:…}}]
```

`child` 호스트에는 `q`를 켜는 조각이 없다. `q`의 존재는 부모의 `active`에 달려 있는데, 자식은 부모보다 **먼저** 계산되고(상향 완료) 자식의 `A`는 "무조건 조각의 집합"에서 출발한다 — 부모 조각이 켜졌다는 사실을 자식이 어떻게 아는지 명세에 없다. 자식이 부모의 `active`를 읽으면 규칙 6이 금한 상향 참조이고, 부모가 자식을 다시 계산시키며 "이 조각을 켜라"를 넘기면 A3의 절차 밖의 입력이다. 모델은 이를 표현하지 못해 `q`가 생기지 않았다.

### 배열 — 미정의 + 통과(비용)

- 아이템이 object 호스트이면 A3가 그대로 돈다. 아이템 9,999의 키 입력(`attacks.mjs:119`, 10,000 아이템, 아이템마다 조각 1): dirty 목록으로 `computes=4 guards=2`. 경로 길이에 비례한다. 배열 `local`의 복사(10,000 슬롯)는 명세대로 든다("이전 local을 복사하고 바뀐 키만 패치").
- `contains`, `prefixItems`, `items: false`, `minContains`: A3는 object 호스트만 말한다. 배열 호스트의 "조각"이 무엇인지(위치별 스키마? `contains`는 가드인가?) — 미정의. 모델은 `items` 하나만 안다.
- 아이템 가드가 배열의 다른 아이템이나 부모를 보는 조건은 규칙 6으로 불가능하므로 "형제 아이템 간 조건"은 배열 위 공통 조상으로 끌어올려야 하는데, 끌어올린 가드는 배열 전체(`items`)를 입력으로 받는다 — 10,000 아이템 배열의 가드가 키 입력마다 전체 배열을 본다(추론, 측정하지 않음).

### 비용 총평 — 반례(A3-2 항목의 수치)

고정 출발점 × 단조 재순회 × 동기 정착의 곱이 키 입력당 `(바퀴 수) × (조각 수)` 가드 평가다. 최선 2N, 최악 N²/2. 2라운드가 "바뀐 키의 역색인(13 ns)"으로 얻은 비용 모델(ADR 0006 표)은 출발점이 직전 커밋일 때의 것이고, 3차안에서는 쓸 수 없다 — 출발점이 고정이면 "입력의 참조가 바뀐 가드만 다시 계산"할 수 없기 때문이다. ADR 0006의 그 행은 3차안과 함께 고쳐야 한다.

---

## C. 책임 경계

### C1 (세 종류의 쓰기; `setValue(getValue())`는 no-op가 아님) — 통과 + 미정의

실행(`attacks.mjs:192`): 레코드 A `{kind:'b', b:'SECRET'}` 로드 → `setValue({kind:'a', a:'NEW', extra:1})` → `kind:='b'`: `emit={"kind":"b","base":"BASE","extra":1}`, `b`는 `∅`. codex의 반례(잠복 값 부활)는 막힌다. `setValue({kind:'a'})` → `getValue()={"kind":"a","base":"BASE","a":"A0"}` — 문서가 예고한 대로 V와 다르다.

미정의: (1) `injectTo`·`&derived`·배열 구조 연산(`push`/`remove`)·`reset()`이 세 종류 가운데 어디인지 — `injectTo`는 A4c에서 결과가 갈렸다. (2) "부분 쓰기 = 사용자 입력"인데 사용자가 필드를 **비우는** 입력이 `''`인지 `없음`인지 — A3-1b의 재주입 여부가 여기에 달렸다.

### C2 (로드 계약: 없는 키에 default, extra 보관·방출, omit은 방출 정책, `preserveDefaultValue` 없음) — 미정의

**"스키마가 선언하지 않은 키"의 경계.** 꺼진 조각이 선언한 키는 선언된 것인가. 실행(`attacks.mjs:197`, `if kind=='b' → then e default 'DEF'`, 로드 `{kind:'a', e:'EXTRA'}`):

```
load:    emit={"kind":"a"}                 host.raw=undefined  e.raw="EXTRA"   ← e는 자식 노드로 분배됐고 방출에서 빠진다
kind:=b: emit={"kind":"b","e":"EXTRA"}
```

모델은 ADR 0013("주입된 값은 모든 노드의 원본으로 분배된다. 꺼진 조각의 노드도 포함")대로 `e`를 자식 노드에 뒀다. 그러면 `kind:'a'`인 채 저장하면 `e`가 사라진다 — S6(로드 → 저장 왕복)이 "선언은 됐으나 꺼진 키"에서 되살아난다. 반대로 `e`를 extra로 호스트 raw에 두면 `kind:='b'`에서 자식 `e`(default `'DEF'`)와 호스트 raw의 `e`(`'EXTRA'`)가 **같은 키의 두 소유자**가 된다. C2와 A1("자식이 있는 노드의 raw는 잘못된 종류의 값이 주입됐을 때만 채워진다")은 extra의 보관 위치에서도 이미 어긋난다 — extra는 잘못된 종류의 값이 아닌데 호스트 raw에 들어간다.

**default 주입과 C1의 "없음".** C2는 "없는 키에 default"라 하고 C1은 "V에 없는 자식은 없음이 된다"고 한다. 둘을 합치면 `setValue(V)`는 V에 없는 모든 default 키를 즉시 채운다 — 위 C1 실행의 `base:"BASE"`, `a:"A0"`. 사용자가 default 키를 지우는 유일한 길은 `''`를 쓰는 것이고, 그러면 `omitEmpty`가 방출에서 빼되 raw에는 남는다. 의도라면 적어야 한다.

### C3 (잘못된 종류의 값: raw:=17, 자식 비활성, emit 17; 부분 쓰기가 호스트 raw를 비운다) — 통과 + 미정의

실행(`attacks.mjs:201`, `host: {a, b default 'BD'}`에 `{a:'A', b:'B', x:'EXTRA'}` 로드 → `setValue(host, 17)` → 부분 쓰기 `host/a := 'A2'`):

```
setValue(host,17): emit={"host":17} raw host={"a":"∅","b":"∅"}   ajv: /host must be object
partial host/a   : emit={"host":{"a":"A2","b":"BD"}}
```

명세대로다: 17이 들어가고 검증기가 `type` 에러를 내며, 부분 쓰기 하나로 호스트가 객체로 돌아온다. 형제 `b`는 `setValue(17)`이 전체 교체여서 지워졌고 다음 정착에서 default `'BD'`로 다시 채워진다(A3-1b의 정착 단위 해석). extra `x`는 사라졌다. 미정의: `b`가 `'B'`(원본 유지)여야 하는지 `'BD'`(전체 교체 뒤 default)여야 하는지는 C1과 C2가 합쳐져 후자를 내지만, C3의 "자식이 다시 산다"는 문구는 전자처럼 읽힌다. 또 `raw:=17`이 `setValue`가 아니라 `injectTo`로 왔을 때(A4c) 형제의 운명이 다르다.

### C4 ("원본을 바꾸는 예외는 없다. 방출은 정책이다") — 모순

"원본을 바꾸는 예외는 없다"와 A3 3단계의 "`default`가 주입된다 — 이것은 raw 쓰기이므로"가 양립하지 않는다. default 주입은 core가 원본에 하는 쓰기이고, 작성자가 명시한 쓰기(`injectTo`·`derived`)가 아니라 조각이 켜질 때 core가 정한 시점에 core가 한다. A3-1b가 보였듯 정착 단위 해석에서는 사용자가 지운 값을 core가 되돌린다 — 정확히 ADR 0013이 버리기로 한 부류("core가 값을 바꿔버리는 건 예외 상황이 너무 많다")다. C4가 성립하려면 default 주입을 "원본을 바꾸는 유일한 예외"로 명시하거나, default를 방출 정책(raw 없음 → emit에 default)으로 옮겨야 한다. 후자는 A3-1(a)의 이력 의존도 함께 없앤다(추론 — 실행하지 않음).

---

## 요약표

| 항목 | 판정 | 근거 |
| ---- | ---- | ---- |
| A3-1 | 반례 | 같은 사용자 raw `{a,b}`가 쓰기 순서에 따라 `x:1`/`x:2`; "처음 활성" 미정의; 중첩 조각이 감싸는 조각과 무관하게 켜짐 |
| A3-2 | 모순 + 반례 | "켜진 가드만"이면 역방향 체인 미해결(activeCount=1); 키 입력당 가드 O(N²), N=30에서 930회·1.7 ms |
| A3-3 | 통과 | 교착 없음. "항상 방출"만 부정확 |
| A3-4 | 반례 | 끌어올린 가드가 `{addr:null}`에서 공허하게 참; 가드는 `''`를 있다고 보고 검증기는 없다고 봄 |
| A3 4단계 옵션 A | 반례 | `then`·`else` 동시 활성, ajv 기각, 옵션 B는 통과 |
| A3-5 | 통과 | 진동 없음 |
| A4 | 모순 | 상한에서 raw `{26,26}` vs emit `{25,25}`; `injectTo`의 쓰기 종류 미정의 |
| A5 | 미정의 | 분기별 default, 값 union, 겹치는 `anyOf` |
| A6 | 모순 | C1 전체 교체가 S4를 재현 |
| A7 | 미정의 | 파동 1의 emit을 얻을 길이 없음 |
| A8 | 모순(문장) + 미정의 | "local이 아니라 로컬 메모"; 참조만 바뀌는 emit의 통지 |
| C1 | 통과 + 미정의 | 잠복 값 차단 확인; `injectTo`·구조 연산의 종류 |
| C2 | 미정의 | 꺼진 조각의 키가 extra인가 — 두 소유자 또는 S6 재발 |
| C3 | 통과 + 미정의 | 형제의 운명이 쓰기 종류에 달림 |
| C4 | 모순 | default 주입은 원본 쓰기 |
