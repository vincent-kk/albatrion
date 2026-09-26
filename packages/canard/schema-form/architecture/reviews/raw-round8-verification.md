# 8라운드 대조 검증 원문

작성: 대조 검증 편집자(로컬 opus), 2026-09-23 13:19 KST, 기준 커밋 `776a100fe`. 이 파일 말고는 아무것도 고치지 않았습니다. 입력은 모두 틀렸다고 가정하고 파일과 실행으로 확인한 것만 적었습니다.

**입력 상태.**
- `raw-round8-derivation-local.md`(로컬 도출), `raw-round8-derivation-antigravity.md`(antigravity 도출), `raw-round8-naming.md`(이름 짓기), `spikes/round8/*`(실행 프로브)를 읽었습니다.
- **`raw-round8-derivation-claude.md`는 없습니다.** 시작할 때(13:0x)와 쓰기 직전(13:18:50)에 두 번 확인했습니다. 이 검증에는 claude 도출이 들어 있지 않습니다.

**축.** P1–P5·P1′(`03-mental-model.md:9-15`), 도출표(`03:72-94`), 수락 결정(`HANDOFF.md:21-29`), D-1..D-10 소유자 열(`HANDOFF.md:37-46`), G1–G8·C1–C8(`00-goals.md:17-109`), 7라운드 §2 수렴 행(`round-7-convergence.md:32-47`). 주의할 점이 하나 있습니다. `03:107`은 **P2만이 아니라 P2–P5 전체**가 "명시적 답 대기"라고 적습니다. 로컬 보고서는 P2의 대기만 언급합니다.

---

## §1. 실행 (작업 A)

원본 파일을 덮지 않도록 `spikes/round6`·`round7`·`round8`을 scratchpad(`…/scratchpad/r8v/`)에 복사해 새 프로세스로 돌렸습니다. `build-v4e.mjs`의 AJV 경로가 절대 경로(`build-v4e.mjs:10-12`)이므로 복사본에서도 같은 AJV를 씁니다. Node v24.20.0입니다.

| # | 명령 | 종료 코드 | 핵심 줄 |
| - | ---- | --------- | ------- |
| A0 | `cp ../round7/proto/loop-v4d.mjs regen.mjs && node proto/make-v4e.mjs regen.mjs && cmp regen.mjs proto/loop-v4e.mjs` | 0 | `make-v4e: 20 edits applied` → `REGEN_IDENTICAL`. v4e는 v4d에 치환 20건을 더한 것뿐입니다 |
| A1 | `sed 's#v4d#vX#g'` 대 `sed 's#v4e#vX#g'` 뒤 `diff selfcheck-v4d selfcheck-v4e` | 0 | `SELFCHECK_BODY_SAME_modulo_version_names`. 검사 본문과 단언이 같습니다 |
| A2 | `node proto/selfcheck-v4e.mjs` | 1 | PASS 60, `3 FAILURES` = `A4b`, `A4c`, `A4-cap` |
| A3 | `node proto/selfcheck-v4e.mjs old` | 0 | PASS 63, `all v4 scenarios passed` |
| A4 | `node selfcheck-v4d.mjs` / `… old` (round7/proto) | 1 / 0 | 같은 60 PASS + 같은 3 FAIL / 63 PASS |
| A5 | 스위치 줄과 시간 필드를 뺀 뒤 v4e 출력 대 v4d 출력 `diff` | — | new 0줄, old 0줄 차이. **새 실패 없음, v4d와 동일** |
| A6 | `cd regress && node r7-port.mjs old` / `new` | 0 / 0 | `PORT CHECK … 28/28 lines identical`. `cmp r7port-{old,new}-output.txt ../../round7/r7-{old,new}-output.txt` → 37줄·89줄 **바이트 동일** |
| A7 | `node r8.mjs` | 0 | `R8` 181줄 + `SUMMARY` 41줄. `cmp` 결과 보관본 `spikes/round8/r8-output.txt`와 **바이트 동일** |

**P1–P5 대조(A7의 SUMMARY 줄).**

| 프로브 | 주장 | 판정 | 근거 줄 |
| ------ | ---- | ---- | ------- |
| P1 | 커밋 트리가 (스키마, 비파생 원본)의 함수인 것은 level뿐이다 | **확인** | level 6구성 모두 `fn_sameFinal:true`, `iii_batchEqualsSeq:true`. edge 6구성 모두 `false`. level은 `LOAD_EDGE` 셋에서 `iv_active` `[["F"],["F"]]`로 같습니다. edge는 fire `[["F"],["F"]]`, fill `[["F"],[]]`, skip `[["E"],[]]`로 갈립니다 |
| P1 보조 | level은 편집 가능한 입력에서 사용자 편집마다 Refresh를 낸다 | **확인** | level 전 구성 `i_afterEdit:"f(1)"`, `i_refreshD:true`. edge는 `"mine"`, `false` |
| P2 | 모든 상태에서 `setValue(getValue())`가 멱등인 것은 skip뿐이다(ref는 X3L로 이미 탈락) | **확인** | skip `idempotent` 넷 모두 `true`. fire는 `tgtEdited`·`tgtCleared`·`srcEditedThenTgtEdited`가 `false`. fill은 `tgtCleared`만 `false` |
| P3 | first와 last는 순차에서 대칭으로 틀리고 batch에서는 둘 다 맞다 | **확인** | NEW/first `N7_b_then_a.seq:false`, NEW/last `N7_a_then_b.seq:false`. 두 규칙 모두 batch 둘 `true`, `rank_totalOrder_BA.batch:false`. ORDER_HINT는 NEW와 칸마다 같습니다 |
| P4 | lastRound는 `ROUND_CAP` 홀짝에 달리고, base는 무-default 스키마와 같다 | **확인** | lastRound cap25 대 cap24가 X16(`{}` 대 `{"t":"from-C"}`)·N1(`{}` 대 `{"x":1}`)·N9(`{"x":0}` 대 `{"x":1}`) 셋 모두 다릅니다. lastRound 6칸 중 4칸이 `offFragmentAutoWrite` 비어 있지 않음. base 6칸 모두 `offFragmentAutoWrite:[]`, `equalsNoDefaultSchema:true`, 모두 `emit:"<undefined>"` |
| P5 | insertion은 raw의 함수가 아니다 | **확인** | insertion `sameRawDifferentOrder` 셋(`mergeOrder`·`removeThenReAdd`·`callerObjectOrder`) 모두 `true`, sorted는 모두 `false`. 두 모드 모두 `pureInSequence:true`, `integerLikeKeys:["2","10","a","k"]` |

P5의 "같은 raw"는 `canon`(`r8.mjs:378`)이 키를 정렬한 뒤 비교한 것입니다. 곧 **순서를 뺀 키·값 집합**이 같다는 뜻입니다.

**추가 실행(판정용, 이 검증에서 새로 돌림).**

| # | 명령 | 종료 코드 | 핵심 줄 |
| - | ---- | --------- | ------- |
| X1 | `node scratchpad/rjsf-default.cjs`(설치된 `@rjsf/utils` 6.6.1 + `@rjsf/validator-ajv8`, `retrieveSchema`·`getDefaultFormState`) | 1 | `body_vs_then … "THEN"`, `body_vs_allOf … "BODY"`, `allOf0_vs_allOf1 … "A0"`, `body_vs_oneOf getDefaultFormState.x= "ONEOF0"`. 종료 코드 1은 마지막 줄의 `require('@rjsf/utils/package.json')`이 `ERR_PACKAGE_PATH_NOT_EXPORTED`로 실패한 것입니다. 판정 줄 넷은 그 전에 출력됐고, 버전은 `node_modules/@rjsf/utils/package.json:3` `"version": "6.6.1"`로 확인했습니다 |
| X2 | `node scratchpad/rjsf-order.cjs` | 0 | `in z,a,m -> … a,b,z,m`, `in m,a,z -> … a,b,m,z`. 선언 키 뒤에 받은 순서 그대로 둡니다 |
| X3 | `node -e` `JSON.parse`·전개·`Object.assign` 키 순서 | 0 | `JSON.parse 2,10,z,a,m`, `spread-merge z,a,q`, `assign m,b` |

---

## §2. 판정표 Q1–Q6 (작업 B)

| Q | 판정 | 선택지 | 동의 소스 | 반대 증거 | 인용 |
| - | ---- | ------ | --------- | --------- | ---- |
| Q1 D-11′ | **NARROWED** | a1 에지 / a2 레벨(입력 읽기 전용) | local(NARROWED), antigravity(NARROWED) | antigravity의 "G4가 에지를 지운다"는 성립하지 않음(§3.1). spike P1이 레벨만 가진 성질을 보이지만 축이 요구하지 않는 성질임 | `round-7:32,44,57`, `00-goals:52,54,56`, `03:11`, `04-inherited-constraints.md:3,10`, A7 P1 |
| Q2 D-27 | **NARROWED** | fire / fill (skip 탈락) | local(NARROWED, 초안 P2면 fire) | antigravity의 `03:82` 일반화는 과대 해석(§3.2). P2 멱등성 결과는 D-7 때문에 판정 기준이 아님 | `round-7:34,63`, `03:82,83`, `HANDOFF:43`, `00-goals:38`, `inject-to.md:10`, A7 P2 |
| Q3 D-29 | **NARROWED** | 먼저-승(주석 무리 전체) / 조건부 overlay가 덮음(allOf끼리는 먼저) | 어느 소스와도 완전히 일치하지 않음. local의 DERIVED 먼저-승과 antigravity의 나중-승 모두 전제 하나씩이 틀림 | local의 G8 근거는 allOf 한정이고 설치된 RJSF에 해당 없음(X1). antigravity의 "오늘 본체가 조건부 default를 가린다"는 코드에서 거짓 | `schemaNodeFactory.ts:133`, `constants.ts:8-20,61-69`, `flattenConditions.ts:44-87`, `getCompositionNodeMapList.ts:80-107`, `mergeSchemas.ts`, `@x0k/json-schema-merge merge.js:426-428,489`, X1 |
| Q4 D-31 | **DERIVED** | 원본 B | local, antigravity | 없음. 대가는 §3.4 | `round-7:33,42,65`, `adr/0013:27`, A7 P4 |
| Q5 D-32 | **DERIVED(확신 중)** | 받은 순서(extras는 순서 있는 칸) | local, antigravity | spike P5: raw(순서 없는 집합)의 함수가 아님. 그러므로 상태의 정의를 "순서 있는 칸"으로 적어야 성립함(§3.5) | `03:12,24,34`, `00-goals:65,92`, `adr/0007:55`, A7 P5, X2, X3 |
| Q6 D-22′ | **NARROWED** | signal / Form 바인딩의 AND 차단(형상 예산 한정) | local(NARROWED) | antigravity의 "P1이 차단을 지운다"는 P1의 범위를 넘음. 축 문서가 이 질문을 소유자 질문으로 적어 둠 | `00-goals:19,23`, `03:9,13,112`, `HANDOFF:38`, `Form.tsx:114-125` |

---

## §3. 갈림의 정리

### §3.1 Q1 — 사용자가 `&derived` 필드를 덮어쓸 수 있는가

**원문 확인.**
- `00-goals.md:36-40`에는 `derived`라는 낱말도, 괄호 삽입구도 없습니다. `grep -n derived 00-goals.md`는 0건입니다. `:38`의 전문은 "FE가 표현 층을 더하면 폭넓은 표현이 가능하다. 지금의 동적 표현식 시스템이 주는 표현력은 줄어들지 않는다. 표현 층은 값을 바꿀 수는 있어도 판정에는 닿지 못한다."입니다. antigravity 8라운드 원문의 `:38` 인용은 courier가 고친 뒤의 것이고 원문과 일치합니다. 7라운드 antigravity의 날조 괄호에 기댄 편집자 스케치는 근거를 잃습니다. **local의 "G2가 `&derived`를 이름으로 든다: 거짓"을 확인합니다.**
- `00-goals.md:52-58`의 G4 머리는 "하나의 개념에는 하나의 장치"(`:52`)이고, `:54`는 "특수 경로가 없고", `:56`은 "조건부로 형상을 바꾸는 모든 구문이 같은 장치와 같은 라이프사이클을 탄다"입니다. `:56`은 **형상을 바꾸는 구문**에 관한 문장입니다. 값을 쓰는 `&derived`·`injectTo`에 대한 일반 허가는 아닙니다. 그래도 G4의 단위가 구문이 아니라 **장치**라는 점은 `:52`와 `:56`이 함께 보여 줍니다.

**"G4가 둘 중 하나를 지운다"는 성립하지 않습니다.** a1이면 `&derived`와 `injectTo`는 같은 에지 쓰기 장치 위의 두 구문입니다. v4e도 파생을 `derived:true`가 붙은 `injectTo` 규칙으로 구현했고 "구현상 injectTo 와 차이가 없습니다"라고 적습니다(`REPORT.txt` §1(a), `LV4E:605`). 장치가 하나이므로 `:52`에 걸리지 않습니다. antigravity의 "한 개념에 두 장치"는 구문 둘을 장치 둘로 센 것입니다. local의 기각이 맞습니다. 다만 local이 근거로 든 `:56`은 형상 구문에 관한 문장이라 **유추 적용**입니다.

**spike P1은 레벨을 강제하지 않습니다.**
- P3(`03:11`)는 **형상**이 (스키마, 원본 전체, 선택)의 함수라는 문장입니다. a1에서도 형상은 그 시점 원본의 함수입니다. a1이 다른 것은 파생 필드의 **원본 값**이 쓰기 이력에 따라 다르다는 점입니다. 원본은 상태이고(`03:34`), G5(`00-goals:65`)는 "같은 쓰기 순서 → 같은 상태"만 요구합니다. A7에서 edge 구성도 같은 열을 두 번 돌리면 같은 결과를 냅니다.
- 배치와 순차의 갈림(A7 edge `iii_batchEqualsSeq:false`)은 P6 (iii) 기각(`round-7:44`)과 D-13(`round-7:34`)이 이미 받아들인 귀결입니다.
- 그래서 "커밋 트리가 (스키마, 비파생 원본)의 함수"는 **축보다 강한 성질**이고, 레벨만 그것을 가집니다. 이 성질을 목표로 세우는 것 자체가 소유자의 잔여 질문과 같습니다.

**지워지는 것(축 문장으로).**
1. (b) 투영: `round-7:32`.
2. 편집 가능한 입력의 레벨: T-2 "타이핑은 입력을 리마운트하지 않는다"(`04-inherited-constraints.md:10`)와 소유자의 계승 요구(`04:3`). 실행으로 확인했습니다. 편집 가능한 입력에서 레벨은 사용자 편집마다 대상에 Refresh를 냅니다(A7 level `i_refreshD:true`). `04`는 "관찰 + 대응(제안)" 문서이지만 소유자가 계승을 요구한 현상이므로 이 탈락은 유지합니다.
3. 쓴 주체에 따라 방아쇠를 가르는 혼합안: G4 `:54` "특수 경로가 없고".
4. `injectTo`와 로드 규칙이 다른 a1: `round-7:57` "D-27과 한 규칙(G4)".

**남는 한 문장.** "`&derived` 필드의 값은 사용자와 호출자가 무엇을 쓰든 언제나 식의 값이어야 하는가(그 입력은 읽기 전용)?" 예 → a2. 아니오 → a1이며, a1의 로드 동작은 Q2의 답을 그대로 따릅니다.

**Q1과 Q2의 결합(실행 근거).** A7 P1 (iv)에서 에지 모드의 **활성 조각 집합**이 로드 규칙에 따라 달라집니다.
- 로드 `{a:1}`: fire·fill은 `[F]`, skip은 `[E]`이고 raw에 `y:"Y"`가 남습니다.
- 로드 `{a:1, d:'mine'}`: fire는 `[F]`(d가 `f(1)`로 덮임), fill·skip은 `[]`(d = `mine`)입니다.
- 레벨은 세 로드 규칙 모두 `[F]`입니다.

그러므로 a1을 고르면 Q2의 답이 파생 필드의 로드 값뿐 아니라 로드 직후의 형상까지 정합니다. a2를 고르면 Q2는 `injectTo`에만 걸립니다.

### §3.2 Q2 — 마운트·`reset`·전체 교체에서 `injectTo`

**`03:82`의 범위.** `03:82`는 도출표의 한 행입니다. 결정 열이 "로드 시 default는 없음인 키에만 (D-5)"이고, "있는 값을 고치지 않는다"는 그 행의 도출 열입니다. 원리 열은 P2이고, P2(`03:10`)의 해당 문장은 "**core가** 스스로 원본을 '고치는' 일은 없다"입니다. `adr/0013:57`도 "`default` 주입은 core의 유일한 자동 쓰기"라는 문장 안에서 같은 말을 합니다. **두 줄 모두 core의 `default`에 대한 문장입니다.** antigravity가 이것을 모든 쓰기의 원칙으로 읽은 것은 과대 해석입니다. 7라운드 §10.2(`round-7:176`)도 같은 읽기를 적었습니다.

**멱등성은 판정 기준이 아닙니다.** D-7의 소유자 결정은 "(a) + `setValue` 호출 단위 옵션"(`HANDOFF.md:43`)입니다. 버린 (b)가 "직전 커밋에도 없던 키에만 주입", 곧 멱등을 지키는 쪽이었습니다. A7 P2의 비교 줄도 `default` 로드 계약 자체가 네 구성 모두에서 비멱등임을 보여 줍니다(지운 `x`가 `"D"`로 돌아옴). skip만 멱등이라는 사실(A7 P2)은 skip을 살리지 못합니다.

**지워지는 것.**
- `ref`, 그리고 마운트·노드 reset·`FormHandle.reset`별 규칙: `round-7:63`(P3, G4 `:54`).
- **skip**: G2 `00-goals:38` "지금의 동적 표현식 시스템이 주는 표현력은 줄어들지 않는다"에 걸립니다. 공개 문서는 `injectTo`의 용도를 "Initial copy, default seeding"이라 적습니다(`inject-to.md:10`). 오늘 코드도 마운트에서 원천의 `default`로 대상을 채웁니다(`ObjectNode.branch.nullable.interface.test.ts:355-373`, `'from:seed'` 단언). A7 P2에서 skip은 마운트 `{src:x}`와 전체 교체 `{src:w}`에서 대상이 `<absent>`입니다. 대상의 `default`는 원천에 따라 정할 수 없으므로 스키마 안의 대체 수단이 없습니다. 이 탈락은 `injectTo`를 "동적 표현식 시스템"의 일부로 읽는다는 전제에 섭니다(`adr/0003` 이주 표에서 `&injectTo`가 되는 키이므로 무리한 읽기는 아닙니다).
- **fill (초안 P2 아래)**: `injectTo`의 쓰기는 대상에 대한 전체 교체입니다(`03:43`). fill은 로드일 때만 "없음인 대상에만" 쓰는 둘째 모드를 만들므로 G4 `:54`에 걸립니다. fill을 받칠 축 문장은 없습니다. 위에서 본 대로 `03:82`는 core의 `default`에만 닿습니다.
- **fire (초안 P2 아래)**: D-13(`round-7:34`)을 마운트에 문자 그대로 적용하면 직전 커밋이 없으므로 값이 있는 원천은 모두 "없음에서 바뀜"이고 발화합니다. 규칙을 더할 필요가 없습니다.

**남는 한 문장.** "P2를 확인할 때 '로드(마운트·`reset`·호출자의 전체 교체)에서는 작성자가 선언한 규칙도 호스트가 준 값을 덮지 않는다'는 문장을 넣는가?" 아니오 → fire. 예 → fill(이때 fill은 특수 경로가 아니라 새 원리의 적용이고, `default` 로드 계약과 같은 모양입니다).

### §3.3 Q3 — 같은 자식에 여러 조각의 `default`

**오늘 코드에서 먼저-승이 실제로 어디에 걸리는가.**
- `intersectSchema`는 `processAllOfSchema`로만 들어갑니다. 소스 호출자는 `schemaNodeFactory.ts:133` 하나이고, 이것이 `allOf`를 본체에 병합합니다(`processAllOfSchema.ts:29-55`). 기저 스키마가 앞, `allOf[i]`가 순서대로 뒤입니다. 같은 property는 `distributeSubSchema`가 property의 `allOf`로 내려보내고, 자식 노드 생성 때 다시 먼저-승으로 합쳐집니다.
- `allOf` 안의 `if`·`then`·`else`·`oneOf`·`anyOf`는 무시되고 개발 모드 경고만 납니다(`constants.ts:61-69` `IGNORE_FIELDS`, `processAllOfSchema.ts:38-44`).
- `then`/`else`에서 읽는 것은 `required`·`virtualRequired`뿐입니다(`flattenConditions.ts:44-87`). `then.properties`나 그 `default`를 읽는 소스 코드는 없습니다(`grep -rn -E "(then|else)\??\.(properties|default)" src` 0건).
- `oneOf`/`anyOf` 분기가 본체 `properties`의 키를 다시 선언하면 `COMPOSITION_PROPERTY_REDEFINITION`을 던집니다(`getCompositionNodeMapList.ts:95-107`, 분기 간 중복은 `:80-94`).

그러므로 **오늘 코드에서 `then` default가 이기는 일은 없고, 본체 default와 조건부 default가 맞붙는 일도 없습니다.** 조건부 default는 읽히지 않거나 스키마 오류입니다. 오늘의 먼저-승은 "본체 대 `allOf`"와 "`allOf[i]` 대 `allOf[j]`"에만 걸립니다.

**두 소스의 전제 점검.**
- antigravity "먼저-승이면 본체 `properties`의 `default`가 조건부 조각의 `default`를 영원히 무시한다": **오늘 코드에 대한 서술로는 거짓**입니다(위). 새 설계에서는 참이 됩니다. `adr/0002:53`이 연언 문맥의 조각끼리 기존 프로퍼티에 overlay를 얹게 하고, 본체는 늘 켜진 연언 조각이기 때문입니다. 그래도 G2 표현력의 손실은 아닙니다. 본체 `default`를 빼고 `then`/`else`나 각 분기에 나눠 적으면 같은 동작을 표현할 수 있습니다(local §3.1-6).
- local "G8: json-schema-merge-allof는 첫 값을 쓰고 RJSF는 `retrieveSchema`에서 그 `mergeAllOf`를 쓴다": **설치된 RJSF에는 해당하지 않습니다.** `@rjsf/utils` 6.6.1의 의존은 `@x0k/json-schema-merge`이고 json-schema-merge-allof는 없습니다(`node_modules/@rjsf/utils/package.json` dependencies). 그 라이브러리의 `default`·`title`·`description` 병합기는 `identity`(`merge.js:164,489-491`)이고 `merge(lv, rv)`(`:426-428`)로 불리므로 왼쪽이 이깁니다. 즉 **allOf에서는 먼저-승**입니다. 그런데 `if/then/else`·`oneOf`/`anyOf`·`dependencies`는 `mergeSchemas(본체, 조건부)`로 합치고(`retrieveSchema.ts:150,695,697,901`), `mergeSchemas`는 스칼라 키에서 오른쪽을 씁니다(`mergeSchemas.ts`의 `acc[key] = right`). 실행 X1이 이것을 확인합니다. `then`이 본체를 이기고(`"THEN"`), 활성 `oneOf` 분기가 본체를 이기며(`"ONEOF0"`), 본체가 `allOf`를 이기고(`"BODY"`), `allOf[0]`이 `allOf[1]`을 이깁니다(`"A0"`).

**판정 NARROWED.**
- **지워지는 것:** `default` 혼자 나머지 주석 키워드와 다른 방향을 따르는 안. 오늘 코드는 `default`를 `title`·`readOnly`·`format` 등과 한 무리로 둡니다(`constants.ts:8-20`, `default`는 `:13`). RJSF도 두 경로 모두 키워드를 가리지 않습니다. 따로 두면 G4 `:52,:54`의 특수 경로가 됩니다. v4e의 `resolveDefault`(`LV4E:1346`)와 `round-4-spec.md:36`의 나중-승은 `default` 하나에만 걸려 있으므로 이 탈락에 해당합니다.
- **약해지는 것:** 전순서 전체의 나중-승. `allOf` 사이와 본체 대 `allOf`에서 실행된 선례(X1)가 모두 먼저-승이고, 나중-승이 지키는 목표를 두 소스 모두 제시하지 못했습니다. 다만 실행한 라이브러리가 하나뿐이라 G8로 완전히 지우지는 않습니다.
- **남는 둘:** (F) 주석 키워드 무리 전체에 먼저-승(오늘의 allOf 동작을 모든 조각으로 넓힘). (C) 조건부 조각(`then`/`else`, 활성 분기)이 켜지면 그 주석 키워드가 본체와 `allOf`를 덮고, 무조건 조각끼리는 먼저-승(RJSF 모양).
- **"조건부 overlay가 기본을 특수화한다"는 전제는 축에 없습니다.** `00-goals.md`에 그런 문장이 없습니다. `adr/0002:53`은 overlay를 "교차"로만 정의하고 주석 키워드의 방향은 말하지 않습니다. `adr/0005:109`는 "정책을 그대로 둘지는 소유자가 정한다"고 남겼습니다. 그러므로 이것은 소유자가 세울 새 목표입니다. G8 증거(X1)는 그 목표 쪽으로 기웁니다. G4는 조각 종류에 따라 방향이 갈리는 것에 저항합니다. 그래서 어느 쪽도 도출되지 않습니다.

**남는 한 문장.** "조건부 조각(`then`/`else`, `oneOf`/`anyOf`의 활성 분기)이 켜지면, 그 조각이 선언한 주석 키워드(`default`·`title`·`readOnly` …)가 본체의 같은 키워드를 덮는가?" 예 → (C). 아니오 → (F).

어느 쪽이든 배치 ≠ 순차는 남습니다(A7 P3, 두 규칙이 대칭으로 틀림). "선언 순서"가 전순서인지 소스 순서인지(`REPORT.txt` OPEN-4, A7 `rank_totalOrder_BA.batch:false`)는 이 질문과 별개로 남습니다. v4e는 `properties`의 default를 두 규칙 모두 바닥으로 두므로(OPEN-4) 본체 대 조건부 조각은 스파이크에서 한 번도 실행되지 않았습니다. 이 검증의 X1이 그 대결을 실행한 유일한 증거이며, 대상은 우리 엔진이 아니라 RJSF입니다.

### §3.4 Q4 — 비수렴 시 커밋

**판정 DERIVED B.**
- **lastRound를 지우는 문장은 D-12입니다**(`round-7:33`): "중간 라운드에서 켜졌다 꺼진 조각의 주입은 커밋 전에 버린다". A7 P4에서 lastRound는 6칸 중 4칸에서 최종 형상에서 꺼진 조각의 주입을 커밋합니다. X16 cap24 `offFragmentAutoWrite ["/t=\"from-C\""]`, `active []`. N1 cap24 `/x=1`. N9 cap25 `/x=0`, cap24 `/x=1`입니다. 커밋 내용도 `ROUND_CAP`의 홀짝에 따라 셋 모두 달라집니다.
- 커밋 거부와 직전 커밋: `adr/0013:27` "형상 계산이 수렴하지 않을 때도 값은 받아들인다"(수락, `HANDOFF:27`)와 `round-7:65`로 이미 지워졌습니다.
- 호스트 국소 B: 진동 관여자를 가리려면 가드가 무엇을 읽는지 알아야 합니다. P1′(`03:15`)에 걸립니다(local §4.2).
- 일관된 최대 부분집합: 지수 탐색이므로 G6 `00-goals:75`에 걸립니다.
- **P6 (i)(`round-7:42`)은 가르지 못합니다.** local이 맞습니다. 비수렴이면 "최종 형상의 함수"인 자동 쓰기 집합이 정의상 없습니다. B는 빠뜨림으로 P6 (i)을 어깁니다(A7 base `wantedDefaultMissing` `then:c`·`F:x`·`one:x`). antigravity의 "B만이 P6 (i)을 만족한다"는 근거가 불충분합니다.

**소유자가 알아야 할 대가(local §4.4, 실행으로 확인).** 지원 범위 밖 구석이 하나만 있어도 그 정착의 **모든** 자동 쓰기가 빠집니다. 관여하지 않은 필드의 `default`와 `injectTo`도 빠집니다. A7 base 여섯 칸 모두 `emit:"<undefined>"`입니다. 마운트라면 기본값 없는 폼이 됩니다. base 커밋 뒤 다음 쓰기가 같은 순환에 다시 들어간다는 것은 실행하지 않은 추론입니다(`REPORT.txt` P4 판정). `inject-to.md:38`의 "earlier hops in the chain still apply"와도 어긋나므로 이주 안내(C8)에 올려야 합니다.

### §3.5 Q5 — `extras` 방출 순서

**P3는 이 질문에 닿지 않습니다.** P3(`03:11`)의 대상은 "어떤 조각이 켜져 있고 어떤 자식이 존재하는지"이고, 키 순서는 형상이 아닙니다. 닿는 문장은 **P4**(`03:12`) "방출 값은 원본과 형상의 투영"입니다. 방출 순서는 상태의 함수여야 합니다.

**상태는 무엇인가.** `03:24`는 `extras`를 "호스트가 받은, 어디에도 선언되지 않은 키"로, `03:34`는 상태를 `raw`·`selection`·`extras` 셋으로 적습니다. 순서가 칸에 드는지는 말하지 않습니다. 그래서 두 정의가 모두 축과 양립합니다.
- **순서 있는 칸**(받은 객체의 own-key 순서가 상태): insertion이 P4를 만족합니다. A7 P5에서 같은 쓰기 열은 늘 같은 순서를 냅니다(`pureInSequence:true`). G5 `00-goals:65`도 만족합니다.
- **순서 없는 칸**(키·값 집합이 상태): insertion은 P4를 어깁니다. A7 P5에서 같은 집합이 세 가지 쓰기 열로 서로 다른 순서를 냅니다. sorted만 P4를 만족합니다.

그러므로 이 선택은 **모델링**이고 P 축은 강제하지 않습니다. 가르는 문장은 G8(`00-goals:92`)입니다.
- ECMAScript 객체는 순서 있는 맵입니다. `JSON.parse`는 문서 순서를, 전개와 `Object.assign`은 "있는 키는 제자리, 새 키는 뒤"를 지킵니다(X3).
- JSON Schema 폼의 선례로 RJSF 6.6.1이 선언 키 뒤에 받은 순서를 그대로 둡니다(X2). 같은 키 집합이 다른 순서로 나옵니다.
- 오늘 코드도 같습니다(`BranchStrategy.ts:230-236,246` → `@winglet/common-utils` `sortObjectKeys.ts:274-292`).
- 데이터 키를 정렬하는 선례는 찾지 못했습니다. 다만 조사한 라이브러리는 RJSF 하나입니다.
- insertion이 해치는 목표도 찾지 못했습니다. G6(`:75`)은 오히려 정렬 비용 쪽을 약하게 불리하게 봅니다.

**판정 DERIVED(확신 중) — 받은 순서.** 조건이 하나 붙습니다. `03:24`의 `extras`를 "호스트가 받은 선언되지 않은 키와 **그 순서**"로 적어야 P4가 성립합니다. 이것은 G8에서 나오는 정의 보강이지 소유자의 가치 판단이 아닙니다. round-6 #44의 "삽입 순서 = 이력"은 `round-7:94`가 금한 "원본마다 출처를 기록하는 넷째 상태"와 다릅니다. 순서는 이미 있는 칸의 내용이지 새 칸이 아닙니다.

**다시 열리는 조건.** 소유자가 "방출은 키·값 **집합**만의 함수"를 원리로 세우면 sorted로 뒤집힙니다. 조사를 넓혀 JSON Schema 폼 생태계에서 정렬이 주류임이 드러나도 뒤집힙니다.

**두 모드 공통의 제약.** 정수 모양 키는 엔진이 앞에 오름차순으로 놓으므로 선언 키보다 앞섭니다(A7 `integerLikeKeys`, X3 `2,10,z,a,m`). 규칙은 "ECMAScript own-key 순서"로 적어야 하고, `adr/0007:55`의 "스키마 선언 순서, extra는 뒤"에는 예외 한 줄이 필요합니다.

### §3.6 Q6 — `budget-exceeded`일 때 제출 차단

**원문.** `00-goals.md:19`는 "폼의 유효성 판정은 독립 표준 검증기가 … 내리는 판정과 같다"입니다. `:23`은 "폼이 더 엄격해지는 것은 허용되지만, 표준 판정에 AND로 덧붙는 형태로만이다"입니다.

- antigravity의 "P1(`03:9`)이면 차단은 검증기 밖의 판정이라 지워진다"는 P1의 범위를 넘습니다. P1의 등식은 **값의 판정**에 관한 것입니다. `budget-exceeded`는 값이 아니라 엔진의 정착 상태에 관한 사실입니다. 검증기 판정에 AND로 얹는 제출 관문은 `:23`의 모양에 맞습니다.
- 축 문서 자신이 이 질문을 소유자에게 남겼습니다. `03:112` "D-2의 상한 초과를 제출 차단으로 볼 것인가"입니다. D-2의 소유자 열도 "프로덕션 관측"이며 확정 대기입니다(`HANDOFF:38`).

**지워지는 것.**
1. 검증 에러 목록에 섞는 차단: P1 `03:9`, G1 `:19`.
2. core가 막는 차단: 제출은 Form 바인딩의 API입니다(`Form.tsx:114-125`, 관문은 검증기 에러뿐 `:117-123`). P5(`03:13`)상 core는 그것을 모릅니다.
3. `settle`의 모든 비정상 상태에서 막는 차단: 통지 예산(파동·`onChange` 중첩)은 커밋된 `emit`을 바꾸지 않습니다(`adr/0008:62,93`). 이 탈락은 ADR 증거에 기대므로 축 등급보다 약합니다.

**남는 한 문장.** "Form의 `submit`이 검증기 통과와 별개로 '형상이 정착하지 않았다'(형상 예산 초과)는 폼 자신의 조건으로 제출을 거절하는가?" 예 → 바인딩 계층의 AND 차단. 아니오 → signal. signal 쪽 기울기(local §6.1-4)는 인정하지만 지우지는 못합니다. Q4가 B이면 비수렴 폼은 기본값이 없는 상태가 되므로 두 답은 함께 읽어야 합니다.

### §3.7 소유자 가치 질문 — "작성자가 선언한 규칙이 로드한 데이터를 덮어도 되는가"

- **P2가 이미 답하는가.** 초안 P2(`03:10`)는 작성자를 순위 없는 쓰기 주체로 적고, "고치지 않는다"는 core에만 겁니다. `03:82`와 `adr/0013:57`도 core의 `default`에만 걸립니다(§3.2). 그러므로 초안 P2는 **허가**합니다. 여기에 D-13을 마운트에 문자 그대로 적용하면 fire가 나오므로, 초안 축 아래의 답은 "예"입니다. 이 점에서 local이 맞습니다.
- 동시에 antigravity의 "P2는 우선순위를 정하지 않는다"도 틀리지 않습니다. P2가 허가할 뿐 선호를 말하지 않는다는 것은 `round-7:169` "허용과 선호는 다르다"와 같은 읽기입니다. 결정적인 사실은 **P2 자체가 확인 대기**라는 점입니다(`03:107`, `round-7:75`). 그러므로 이 가치 질문은 소유자가 P2를 확인하면서 로드 우선순위 문장을 넣을지로 정해집니다.

**실제로 이 답에 걸리는 질문.**
- **Q2 전부.** 아니오(데이터가 위) → fill, 예 → fire. skip은 어느 쪽이든 G2로 지워집니다.
- **Q1 절반.** 아니오 → a2가 지워지고 a1 + fill이 남습니다. 레벨은 로드한 파생 값을 덮기 때문입니다(A7 P1 (iv) level, `{a:1,d:'mine'}` → d = `f(1)`). 예 → Q1의 한 문장이 그대로 남습니다.
- **Q3–Q6은 무관합니다.** Q4의 B가 작성자 쓰기까지 빼는 것은 로드 권한이 아니라 D-12에서 나옵니다.
- antigravity의 "Q1과 Q2 둘 다 직접 의존"은 Q1에 대해 과합니다. "예"여도 Q1은 닫히지 않습니다.

### §3.8 D-21 정정 확인

- `findNode.ts:86`은 `if (cursor.group === 'terminal') return cursor;`로, 세그먼트 처리 중 터미널에 닿으면 남은 세그먼트를 버리고 그 노드를 돌려줍니다. `:68`의 `return null`은 세그먼트를 시작할 때 커서가 이미 터미널인 경우에만 닿습니다. **현행은 별칭입니다. 확인합니다.**
- `findNode.test.ts:147-149`(`src/core/nodes/AbstractNode/utils/__tests__/`)의 단언은 `expect(nestedResult).toEqual(nestedResult)`입니다. 항상 통과합니다. **확인합니다.**
- `round-7-convergence.md:39`의 D-21 행에는 "정정(8라운드 이름 짓기, 편집자 확인) … 따라서 **행동 변화이며 이주 안내(C8) 대상**"이 들어 있습니다. **확인합니다.**

---

## §4. 이름 짓기 파일 점검 (작업 C)

**형제 관례 인용 12건.**

| # | 인용 | 판정 | 비고 |
| - | ---- | ---- | ---- |
| 1 | `value.ts:29-45` 비트 멤버가 동사형 PascalCase | 확인 | `src/core/types/value.ts`. `Replace`…`PreventInjection`이 `:29-45`. 사이의 `Batch`·`Isolate`도 같은 꼴 |
| 2 | `value.ts:63-65` `Overwrite = Replace \| Merge` | 확인 | `:63` Merge, `:65` Overwrite |
| 3 | `value.ts:69-74`, `src/index.ts:44-45` Public 부분집합 재명명 | 확인 | `index.ts:44` `PublicNodeEventType as NodeEventType`, `:45` `PublicSetValueOption as SetValueOption` |
| 4 | `value.ts:46-47` `Automatic` 출처 비트 | 확인 | |
| 5 | `Form/type.ts:77,84`, `types/error.ts:13`, `core/types/state.ts:9` 속성·enum 짝 | 확인 | `showError`·`ShowError`, `validationMode`·`ValidationMode` |
| 6 | `AbstractNode.ts:316,355,635,666,770,794,816` `x`/`setX` | 확인 | 일곱 줄 모두 해당 getter·setter |
| 7 | `event.ts:53-55`, `Form/type.ts:58`, `RootNodeContextProvider.tsx:113` 칸·이벤트·콜백 짝 | 확인 | `:113`은 `UpdateGlobalState` 검사 줄 |
| 8 | `Form/type.ts:52-58` 콜백 꼴 | 확인 | |
| 9 | `AbstractNode.ts:71` `'branch' \| 'terminal'`, `types/error.ts:275` | **부분** | `:71`은 확인. `error.ts:275`는 타입이 아니라 JSDoc `@example 'required' \| 'email' \| 'minLength'`이어서 "코드의 문자열 리터럴 유니언"의 근거로는 약함 |
| 10 | `jsonSchema.ts:229,298` | 확인 | `:229` `FormTypeInput`, `:298` `'&readOnly'` |
| 11 | `AbstractNode.ts:101-103,486-500`, `:490,499` | 확인 | `:102` "which branch", `:490` `oneOfIndex`, `:499` `anyOfIndices` |
| 12 | `event.ts:70-71` `RequestSelect`, `Form/type.ts:114-115` | 확인 | `:71` `RequestSelect`, `type.ts:114` `select`, `:115` `reset: Fn` |

**"기본값이 켜진 긍정 비트 하나는 비트마스크로 표현할 수 없다"(`naming:50`): 과장입니다.** 오늘 `setValue`의 옵션을 생략하면 0이 아니라 `SetValueOption.Overwrite`가 됩니다(`AbstractNode.ts:358`). 그 합성값에는 `EmitChange`·`PublishUpdateEvent`·`Refresh`·`Propagate` 같은 긍정 비트가 켜져 있습니다(`value.ts:51,63,65`). 기본이 켜진 긍정 비트는 이미 이 저장소에 있습니다. 파일의 둘째 문장이 말하는 실제 제약은 더 좁습니다. 호출자가 명시적 옵션(`Merge` 등)을 줄 때도 그 비트가 살아 있으려면 모든 공개 합성 멤버가 그것을 품어야 하고, 끄려면 비트 빼기(`& ~X`)가 필요한데 공개 관용구에 비트 빼기가 없다는 것입니다. **결론(비트 둘)은 이와 무관하게 성립합니다.** 상속·끄기·켜기 세 상태(`adr/0013:52` 양방향 우선순위)는 비트 하나로 담을 수 없기 때문입니다. 첫 문장을 "공개 관용구 안에서는"으로 좁혀 적기를 권합니다.

**"오늘의 `ResetOptions`는 내보내지 않는다"(`naming:75`): 확인합니다.**
- `src/index.ts`에 `ResetOption` 문자열이 없습니다(`grep` 종료 코드 1).
- 진입점의 와일드카드는 `:77` `export type * from './types/rolled'` 하나입니다. `types/rolled/`의 세 파일(`form`·`formTypeRenderer`·`jsonSchema`)에도 `ResetOption`이 없습니다.
- 빌드 산출물에서도 `ResetOptions`는 `dist/core/types/value.d.ts:66`에만 있고 `dist/index.d.ts`에는 없습니다.
- 7필드도 확인했습니다(`value.ts:83-97`). 사용처는 `value.ts`와 `AbstractNode.ts`(`__reset__` `:1063`)뿐입니다.

---

## §5. 인용 대조 (작업 D)

| # | 소스 | 인용 | 판정 | 비고 |
| - | ---- | ---- | ---- | ---- |
| 1 | local | `00-goals:56` G4 "같은 장치와 같은 라이프사이클" | 확인(적용 범위 넓힘) | 문장은 형상 구문에 관한 것. `&derived`·`injectTo`에는 유추 적용 |
| 2 | local | `03:82`는 D-5(core `default`)에 걸린 줄 | 확인 | |
| 3 | local | `round-7:33` D-12 "커밋 전에 버린다" | 확인 | |
| 4 | local | `inject-to.md:10` "Initial copy, default seeding" | 확인 | `docs/agents/skills/schema-form-skill/knowledge/inject-to.md` |
| 5 | local | `AbstractNode.ts:526-532`, `:541-551` 에지 재계산·`Overwrite \| Automatic` 쓰기 | 확인 | |
| 6 | local | `ObjectNode.branch.nullable.interface.test.ts:355-373` 마운트 `'from:seed'` | 확인 | `src/core/__tests__/` |
| 7 | local | `value.ts:51`(Default에 `PreventInjection` 없음), `:55-61` Reset 계열 | 확인 | `src/core/types/value.ts`. `AbstractNode.ts:1087-1092`가 `StableReset`을 씀도 확인 |
| 8 | local | `constants.ts:8-20`, `default` `:13` | 확인 | |
| 9 | local | `sortObjectKeys.ts:284-292` | 확인(경로 불완전) | 파일은 `packages/winglet/common-utils/src/utils/object/sortObjectKeys.ts` |
| 10 | local | `Form.tsx:114-125`, `:116-117` | 확인 | |
| 11 | local | "RJSF는 `retrieveSchema`에서 json-schema-merge-allof의 `mergeAllOf`로 합친다" | **틀림(설치 버전 기준)** | `@rjsf/utils` 6.6.1은 `@x0k/json-schema-merge`를 씀. 조건부 조각은 `mergeSchemas`로 오른쪽이 이김(X1) |
| 12 | local | `00-goals:103` C2 | 확인 | |
| 13 | antigravity | `00-goals.md:38` 인용문(교정본) | 확인 | 글자 그대로 일치 |
| 14 | antigravity | `03:82`·`adr/0013:57` "있는 값을 고치지 않는다"를 호출자 데이터 주권으로 | 문구 확인, **적용 틀림** | 두 줄 모두 core `default`(D-5)에 한정 |
| 15 | antigravity | `round-7:94` raw에 출처 태그 없음 | 확인 | "원본마다 출처를 기록 … 넷째 상태, P3 위반" |
| 16 | antigravity | `round-4-spec.md:34` "`reset()`은 `injectTo`를 일으킨다", `:36` 나중-승 | 확인 | |
| 17 | antigravity | `adr/0005:109`, `adr/0002:51` | 확인 | `:109`는 먼저-승 관찰과 "소유자가 정한다" |
| 18 | antigravity | `processFirstWinFields.ts:16-27` | 확인 | |
| 19 | antigravity | `adr/0007:55` "extra는 뒤에 삽입 순서" | 확인 | |
| 20 | antigravity | `adr/0013:27`, `adr/0007:41` | 확인 | |
| 21 | antigravity | `ComputedPropertiesManager.ts:92,208,260` | 확인 | |
| 22 | antigravity | `C2 00-goals.md:102` | **1줄 어긋남** | C2는 `:103`, `:102`는 C1 |
| 23 | antigravity | `round-7:133` "215행(Q14 잠정)" | **1줄 어긋남** | 215행은 `:132` |
| 24 | antigravity | `raw-round7-verification.md:262` "유령 자동 쓰기 영구 잔류" | 확인(의역) | 원문은 "최종 형상이 원하지 않는 자동 쓰기를 커밋할 수 있습니다(X16)". "영구"는 antigravity의 말 |

요약하면 24건 가운데 글자 그대로 확인이 18건, 확인이지만 적용 범위나 경로에 단서가 붙는 것이 3건(1·9·24), 1줄 어긋남이 2건(22·23), 틀림이 1건(11)입니다. 14는 문구는 맞고 적용이 틀린 경우입니다.

---

## §6. 확인하지 못한 것

- **claude 도출(`raw-round8-derivation-claude.md`)은 없어서 넣지 못했습니다.** 도착하면 §2의 "동의 소스" 열을 다시 봐야 합니다.
- Q3의 G8 증거는 RJSF 한 라이브러리의 실행입니다. JSON Forms·uniforms·vjsf 등은 보지 않았습니다. json-schema-merge-allof README의 "first possible value" 문구는 열어 보지 않았습니다(설치돼 있지 않음).
- Q5의 "데이터 키를 정렬하는 JSON Schema 폼 라이브러리는 없다"는 RJSF 하나로만 확인했습니다.
- 우리 엔진(v4e)에서 본체 `properties` default 대 조건부 조각 default의 대결은 실행되지 않았습니다(`REPORT.txt` OPEN-4). X1은 RJSF의 동작입니다.
- 레벨 파생의 읽기 전용 입력 경로(`REPORT.txt` OPEN-1), 여러 원천 파생과 비활성 원천(OPEN-2), `EDGE_COMPARE 'write'`와 호스트 원천·리스너 쓰기 조합(OPEN-3)은 실행하지 않았습니다.
- base 커밋 뒤 다음 쓰기가 같은 순환에 다시 들어간다는 추론(P4 판정)은 실행하지 않았습니다.
- local이 인용한 7라운드 `REPORT` 줄 번호(`:33`, `:48`, `:94`, `:103`, `:121-124`, `:209`)와 `LV4C:1121`, 외부 이슈 번호(RJSF #5292·#3258, formio.js #5428·#3196), final-form-calculate README는 대조하지 않았습니다.
- `sortObjectKeys` 정렬 비용(G6)은 측정하지 않았습니다.
