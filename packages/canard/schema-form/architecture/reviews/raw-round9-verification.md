# 9라운드 원문 — 교차 검증 (인용 대조, 재실행, 갈림 판정)

편집자 주: 검증 에이전트(로컬 opus, 읽기 전용)가 보낸 본문을 그대로 저장했다. 편집자는 고치지 않았다.

---

작성: 교차 검증 에이전트(opus). 입력은 `round-9-spec.md`(이하 spec)와 독립 도출 셋(`raw-round9-derivation-local.md`, `raw-round9-derivation-claude.md`, `raw-round9-derivation-antigravity.md`), 그리고 `spikes/round9/`의 프로토타입입니다. 경로는 `architecture/` 기준입니다. 설계 기록은 읽기만 했습니다. 재실행이 덮어쓴 출력 파일 네 개는 시간 측정 줄만 달랐으며, 실행 전 사본으로 되돌려 바이트 일치를 확인했습니다. 탐침은 모두 저장소 밖 임시 디렉터리에서 실행했습니다. 검토자의 글은 증거로만 다루었고, 판정은 원문과 제가 실행한 결과에만 기댑니다.

## 최종 판정

| 도출 | 판정 | 요지 |
| --- | --- | --- |
| 로컬 opus | **신뢰** | 실행 주장 셋이 모두 재현되었습니다. 정정은 둘입니다. `required`가 없을 때 "`kind`가 없는 값을 받아들인다"는 `{x:'s'}`에만 맞고 `{}`는 거부됩니다. `03-mental-model.md:86-87`의 "선택 상태 칸"은 87행 하나입니다 |
| cennad claude | **부분 신뢰** | `&clearValue`·`&pristine`을 전이 단계에 둔 것이 틀렸습니다(§3 (i)). Q1이 지워진 선택 가드를 셋째 가드로 셉니다. N1과 4.14에서 이미 정해진 억제 범위(spec:104)를 놓쳤고, 5.2에서 spec:120·:138을 놓쳤습니다. 옳은 것은 Q5의 삭제 목록, 5.3을 정책으로 둔 읽기, `adr/0008-event-system.md:60`의 배달 집합 누락 지적입니다 |
| cennad antigravity | **부분 신뢰(낮음)** | 줄 어긋남 넷, 근거 부적합 여덟입니다. `&children` 예시 둘은 spec에 없는 창작이고 후보 (나)의 뜻을 바꿨습니다. 루트 잠금 OR를 [도출]로 적었으나 인용한 10항과 오늘 코드가 반대를 말합니다. 5.3을 [도출]과 [확신 중]과 [정책]으로 동시에 적었습니다. 이미 정해진 규칙 A를 다시 묻습니다. 옳은 것은 단계 배치(`&clearValue` 파생, `&pristine` 커밋)와 Q5의 삭제 목록입니다 |

## 1. 인용 대조

방법: 세 원문에서 `경로:줄` 형태와 `spec:줄`, 뒤따르는 `:줄` 형태를 스크립트로 모두 뽑았습니다. 뽑은 줄을 원문과 나란히 출력해 하나씩 읽었습니다. 판정은 네 가지입니다. **확인**은 줄이 있고 주장을 뒷받침하는 경우입니다. **줄 어긋남**은 문장이 다른 줄에 있는 경우입니다. **날조**는 문장이 어디에도 없는 경우입니다. 요청에는 없던 **부적합**을 하나 더 두었습니다. 줄은 실재하지만 그 문장이 주장을 뒷받침하지 않는 경우입니다.

| 도출 | 인용 수(기계 추출, 오차 ±3) | 확인 | 줄 어긋남 | 부적합 | 날조 |
| --- | --- | --- | --- | --- | --- |
| 로컬 | 약 99 | 98 | 1(경미) | 0 | 0 |
| claude | 78 | 75 | 1 | 2 | 0 |
| antigravity | 67 | 55 | 4 | 8 | 0 |

**spec 줄 번호 인용.** 세 도출 모두 spec 인용에서 줄 어긋남이 없습니다. antigravity의 축 항목 번호(`:19` 1항, `:22` 4항, `:23` 5항, `:24` 6항, `:26` 8항, `:28` 10항, `:60` 읽기 3)는 모두 맞는 줄입니다. 문제는 줄이 아니라 그 줄이 주장을 뒷받침하는지입니다(아래 부적합 행).

**`06-conclusions.md:139/180/194/291`.** 180(4.9 배달 집합), 194(4.11 원본 B), 291(5.3의 C와 RJSF 6.6.1)은 확인입니다. 139는 줄 어긋남입니다. 139행은 4.4의 질문("판별식이 없는 `oneOf`에서 … `required`를 읽어도 되는가")이며 RJSF 실행과 무관합니다. RJSF 실행 기록은 291행과 417행(8라운드 정정표)에 있습니다.

### 1.1 줄 어긋남과 부적합 (전부)

| 도출 | 인용 | 판정 | 원문의 실제 내용과 맞는 줄 |
| --- | --- | --- | --- |
| antigravity | `06-conclusions.md:139` (RJSF가 조건부 조각의 주석 덮어쓰기를 확인) | 줄 어긋남 | 139행은 4.4의 질문입니다. 맞는 줄은 291, 417입니다 |
| antigravity | `06-conclusions.md:55, 331` (`DisableSchemaDefaults`) | 줄 어긋남 | 55행은 용어 "프로토타입", 331행은 `Overwrite`입니다. 맞는 줄은 271, 333입니다 |
| antigravity | `constants.ts:34-88` (폼 전용 키는 나중-승) | 줄 어긋남 | 34행은 `SPECIAL_FIELDS`의 `pattern`입니다. 이 파일에는 나중-승 목록이 없습니다. 나중-승은 `FIRST_WIN_FIELDS`(8-20행)와 `EXCLUDE_FIELDS`(84-88행) 밖의 기본 동작입니다. spec:134의 범위 8-88이 맞습니다 |
| claude | `checkComputedOptionFactory.ts:24-27` (`rootJSONSchema[f] ?? …` 사슬, "직접 확인") | 줄 어긋남 | 24-27행에는 `rootJSONSchema`가 없습니다. 사슬은 22-26행이고 루트 키는 23행입니다. spec:133과 로컬의 22-26이 맞습니다 |
| 로컬 | `03-mental-model.md:86-87` (선택 상태 칸) | 줄 어긋남(경미) | 선택 상태 칸은 87행입니다. 86행은 "default 주입은 계산 밖의 전이"입니다 |
| antigravity | `round-9-spec.md:32` (예산 초과 시 원본 B 커밋) | 부적합 | 32행은 소유자 요약 발언이고 예산·원본 B를 말하지 않습니다. 근거는 같이 인용한 `06-conclusions.md:194`뿐입니다 |
| antigravity | `03-mental-model.md:12` (표시 계열 AND, "상위가 가리면 하위도 가려진다") | 부적합 | 12행은 P4 "방출은 정책이다"입니다. 가까운 근거는 `adr/0002-guard-fragment-model.md:50`입니다 |
| antigravity | `round-9-spec.md:60` 두 번, `:28` (잠금 계열 누적 OR, [도출]) | 부적합 | 60행은 루트 `readOnly`를 가리킬 뿐 결합자를 말하지 않습니다. 28행 "기존과 같이"는 오히려 오늘의 루트 우선 사슬(루트 `false`도 이김)을 지지합니다. OR 후보의 출처는 spec:133입니다 |
| antigravity | `adr/0005-blueprint-analysis-and-node-sharing.md:45, 62` (분기에서는 켜진 단일 분기의 제약이 overlay) | 부적합 | 45행은 `allOf` 무조건 항목, 62행은 노드 공유입니다. "단일 분기"는 새 모델에서 성립하지 않습니다(§3 (iv)) |
| antigravity | `spikes/round9/REPORT.txt:47-51` (`else: false`가 없으면 다중 통과로 기각) | 부적합 | `oneOf`(47행)에는 맞지만 `anyOf`(49행)는 7개 값 전부 통과입니다 |
| claude | `spikes/round9/REPORT.txt:47`, `:49` (게이트 없는 분기가 모두 동시 활성이라는 형상 주장의 뒷받침) | 부적합 | 두 줄은 검증기의 판정이지 폼의 형상이 아닙니다. claude 자신도 미확인에 적었습니다. 형상은 v5 실행으로 제가 확인했습니다(§3 (iv)) |

### 1.2 `&children` 후보 형태의 출처

- spec이 준 것은 이름뿐입니다. spec:133 "`&children`의 값 형태 후보 둘(제어 종류별 대상+식 / 대상 집합별 제어 묶음)"과 spec:108의 소유자 발언입니다. 구체 문법은 spec 어디에도 없습니다.
- antigravity의 `{ readOnly: { all: true } }`와 `{ properties: { a: { readOnly: true } } }`는 `architecture/` 전체를 검색해 antigravity 원문 67-68행에만 나옵니다. **창작한 예시입니다.** 후보 1에는 spec의 "식"이 빠졌습니다. 후보 2는 spec의 "대상 집합별 제어 묶음"을 `properties`를 흉내 낸 "대상 필드별" 사상으로 바꾸었습니다. 대상을 여러 개 묶는다는 뜻이 사라졌으므로 spec의 후보와 같은 것이 아닙니다.
- claude의 예시(`targets`와 `if`, `paths`와 `control`)도 spec에는 없습니다. 다만 "예:"로 표시했고 spec의 두 뜻을 지킵니다. (가)는 `raw-round9-naming-codex.md:41-43`의 모양과 같습니다.
- v5가 구현한 모양은 `&children: { childName: { '&readOnly': 식, … } }`입니다(`REPORT-proto.txt:90`). 대상 이름별 제어 묶음이므로 후보 (나)의 한 형태입니다.

## 2. 재실행

환경: Node.js v24.20.0입니다(보고서는 v26.8.2). ajv는 8.17.1입니다. 시간 측정 줄 말고는 결과가 같았습니다.

### 2.1 회귀와 Q8 프로브

```
cd architecture/spikes/round9 && node regress/run.mjs     # exit 0
{"modelRegeneration":"byte-identical","precheck":"expected failure",
 "selfcheck":{"new":{"baselineFailures":3,"passed":63,"failures":0},"old":{"baselineFailures":0,"passed":63,"failures":0}},
 "r7":{"new":{"changedRows":12},"old":{"changedRows":2}},
 "r8":{"configurations":31,"rows":181,"summaries":41,"changedSummaries":26},
 "q8":{"checks":108,"rows":21,"passed":true},"edgeCases":26}
cd architecture/spikes/round9 && node r9.mjs              # exit 0, r9-output.txt 바이트 동일
{"summary":{"checks":108,"rows":21,"passed":true}}
```

`REPORT-proto.txt` §3 표의 열 가지 사실을 출력과 대조했습니다.

| 사실 | 판정 | 결정적 출력 |
| --- | --- | --- |
| v4e selfcheck new 60 PASS, 3 FAIL | 확인 | `baselineFailures:3`, 파일에 `FAIL A4b`, `FAIL A4c`, `FAIL A4-cap`과 PASS 60 |
| v4e selfcheck old 63 PASS | 확인 | `old.baselineFailures:0`, PASS 63 |
| v5 selfcheck new 63 PASS, 0 FAIL | 확인 | `new.passed:63, failures:0` |
| v5 selfcheck old 63 PASS, 0 FAIL | 확인 | `old.passed:63, failures:0` |
| Q8 단언 108, 관측행 21 | 확인 | `q8.checks:108, rows:21, passed:true` |
| 경계 단언 26 | 확인 | `edgeCases:26` |
| r7 이식 new 12행, old 2행 바뀜 | 확인 | `r7.new.changedRows:12, old:2` |
| r8 이식 31구성, 181행, 요약 41 중 26 바뀜 | 확인 | `r8` 객체 |
| `loop-v5` 재생성 바이트 동일 | 확인 | `modelRegeneration:"byte-identical"` |
| 모든 `.mjs` 구문 검사 | 확인 | `run.mjs:20`이 `node --check`를 돌리고 실패 없이 끝났습니다 |

`precheck`(v4e에 `selection` 칸이 있어 단언이 실패함)도 예상대로 실패했습니다.

### 2.2 ajv 스파이크

```
cd packages/canard/schema-form && node architecture/spikes/round9/oneof-if.mjs   # 기록된 oneof-if-output.txt와 diff 없음
```

spec §3.2 표의 여섯 행(올바른 값 v1, 누락 값 v2, 어느 조건에도 없는 값 v5 `{kind:'c'}`)이 출력과 모두 맞습니다. draft-07과 2020-12의 판정 차이는 0건입니다.

### 2.3 (c) `if`에서 `required`를 뺀 사본

`oneof-if.mjs`를 `$TMPDIR`에 복사해 두 분기의 `if`에서 `required: ['kind']`만 지웠습니다. `ajv`는 패키지 경로에서 불러왔습니다.

| 스키마 | `{}` (v6) | `{x:'s'}` (v7) | v1 / v2 / v5 |
| --- | --- | --- | --- |
| A `oneOf` + `if/then`만 | 거부 | **통과** | 원본과 같음 |
| B `oneOf` + `else: false` | 거부 | **통과** | 원본과 같음 |
| C `anyOf` + `if/then`만 | **거부** | 통과 | 원본과 같음 |
| D `anyOf` + `else: false` | 거부 | **통과** | 원본과 같음 |
| F `allOf` + `if/then` | **거부** | **거부** | 원본과 같음 |
| G 최상위 `if/then` | **거부** | 통과 | 원본과 같음 |

가드 단독 판정(`{properties:{kind:{const:'a'}}}`): `{}` 참, `{kind:'a'}` 참, `{x:'s'}` 참입니다. `required`를 넣으면 거짓, 참, 거짓입니다. 로컬 0절 표와 같습니다.

판정: **로컬 주장 (c)는 부분적으로 맞습니다.** spec §3.2 표의 세 열은 `required`가 없어도 그대로입니다. 갈리는 곳은 조건 프로퍼티가 없는 값이며, 그 열이 표에 없습니다. `required`가 없으면 `else: false`를 붙인 B와 D가 `{x:'s'}`를 받아들입니다. 그래서 `REPORT.txt:51`의 "B=D=E"가 깨집니다(E는 v7을 거부합니다). 빈 값에서는 두 가드가 모두 참이 되어 폼이 두 분기를 모두 켭니다. 로컬의 "`kind`가 없는 값을 검증기가 받아들인다"는 `{x:'s'}`에만 맞습니다. `{}`는 두 `then`의 `required`에 걸려 거부됩니다.

### 2.4 (a) 채움 규칙 A의 단위: v5는 조각 단위와 노드 단위가 섞여 있습니다

코드: `proto/loop-v5.mjs`의 `wantedDefaults`입니다.

```js
const born = loaded || (!child.unconditional && (child.declaredBy ?? []).some(i => now[i] && !was[i]));
```

`born`은 "이 노드를 선언한 조각 가운데 하나가 이번에 꺼짐에서 켜짐이 되었는가"만 봅니다. 다른 켜진 조각이 이미 그 노드를 두고 있었는지는 보지 않습니다. 예외는 `unconditional`뿐이며, `build-v5.mjs`는 본체 `properties`(`id === 'base'`)에만 이 표시를 붙입니다. 실행(`$TMPDIR/probe-v5.mjs`, 기본 스위치) 결과는 아래와 같습니다.

| 사례 | 순서 | 결과 | 규칙 A(노드 단위)의 기대 |
| --- | --- | --- | --- |
| a1: 게이트 가진 `allOf` 조각 둘이 `x`를 공유(`default` P, Q) | 로드 `{a:1}`, `x` 지움, `b:=1` | `x='P'`, 없음, **`x='Q'` 다시 채움** | 채우지 않음 |
| a2: 본체 `x`(기본값 없음) + `then`의 `default` T | 로드 `kind=off`, `kind:=on` | `x` 없음 | 같음 |
| a3: 게이트 없는 `allOf` 항목 `x`(U) + `then`의 T | 로드, `x` 지움, `kind:=on` | `x='U'`, 없음, **`x='T'` 다시 채움** | 채우지 않음 |
| a4: 본체 `x`(B) + `then`의 T | 로드, `x` 지움, `kind:=on` | `x` 없음 | 같음 |
| 노드 게이트 `x`의 `&active: G.show`(D) | 로드 `show=false`, `x` 지움, `show:=true` | 로드 때 raw `x='D'`(방출 제외), 없음, **다시 채우지 않음** | 미정(spec 공백) |

결론입니다. v5는 본체 노드에서만 노드 단위이고, 조건부 조각끼리 공유한 노드(a1)와 게이트 없는 `allOf` 항목의 노드(a3)에서는 조각 단위로 다시 채웁니다. a3은 spec:105 "게이트 없는 조각은 무조건(오늘의 `allOf` 항목)"과도 어긋납니다. 본체와 게이트 없는 `allOf` 항목이 다르게 동작하기 때문입니다. 노드 게이트는 거꾸로입니다. 거짓에서 참이 되어도 생성으로 보지 않고, 로드 때 꺼져 있어도 채웁니다. 로컬의 "`&active`가 거짓에서 참이 되는 것도 생성이다 [확신 중]"은 v5와 다릅니다. 어느 쪽이 맞는지는 spec이 정하지 않았습니다(§4의 2번).

### 2.5 (b) 같은 대상에 쓰는 `&injectTo`와 `&derived`

8라운드 `loop-v4e.mjs`를 저장소 밖에서 import해 로컬의 탐침을 다시 만들었습니다(`a`가 `t`에 주입, `t`는 `b`에서 파생, 로드 `{a:1, b:1, t:'orig'}`).

| 모형 | 로드 | 뒤이은 `batch`(a, b 동시 변경) | 순차 변경 |
| --- | --- | --- | --- |
| v4e, 원본 B 커밋 | 25라운드 `budget-exceeded`, `t='orig'` | 25라운드 `budget-exceeded` | 2라운드 `stable`, 마지막 쓰기 |
| v4e, 마지막 라운드 커밋 | 25라운드 `budget-exceeded`, `t='der:1'` | 25라운드, `t='der:3'` | 2라운드 `stable` |
| v5, 대상별 승자 하나 | 2라운드 `stable`, `t='inj:1'` | 2라운드 `stable`, `t='inj:3'` | 2라운드 `stable` |

판정: **로컬 주장 (b)는 재현되었습니다.** 순환이 없는 스키마인데도 규칙을 차례로 적용하면 로드만으로 예산을 다 씁니다. 대상별로 하나만 고르면 2라운드에 수렴합니다. v5의 승자는 스위치가 정합니다. `DERIVE_ORDER`와 `WRITE_CONFLICT`의 네 조합에서 모두 `stable`이고, `t`는 조합에 따라 `inj:1` 또는 `der:1`입니다. 같은 정착에서 `&derived`와 `&clearValue`가 한 대상에 쓰면 기본 스위치에서 `&clearValue`가 이깁니다(`b:=2`에서 `t` 없음, 2라운드).

## 3. 갈림 판정

| 갈림 | 세 도출 | 원문과 실행 | 판정 |
| --- | --- | --- | --- |
| (i) `&clearValue`의 단계 | antigravity 파생, claude 전이, 로컬 **파생**(Q1 표 50행) | `adr/0007-settle-cycle.md:33`의 전이는 "직전 커밋의 `active`와 비교해 꺼짐에서 켜짐이 된 조각의 없음인 자식에 `default`"입니다. 조각 활성의 변화로 정의되고 예산이 "조각 수"입니다. 파생(`:32`)은 완성된 트리에서 작성자의 규칙을 평가해 씁니다. 에지는 파생의 `injectTo`도 이미 씁니다(4.3). 그래서 claude의 논거 "직전 커밋과의 비교"는 두 단계를 가르지 못합니다. `03-mental-model.md`의 정착 순환(§3이 아니라 §4, 59-60행)도 같습니다. v5는 `reconcileDerive`에서 `&clearValue`를 `&derived`·`&injectTo`와 같은 후보 목록에 넣고 대상별로 해소합니다 | **파생.** 같은 대상 해소(§2.5)가 셋을 한 단계에 두기를 요구합니다. claude가 `&pristine`을 전이에 둔 것은 더 분명히 틀렸습니다. `adr/0007-settle-cycle.md:40`은 "원본을 쓰는 것은 파생과 전이뿐"이고 `:137`은 "`setState`(dirty/touched)는 쓰기가 아니다"입니다. `&pristine`은 커밋입니다(로컬, antigravity) |
| (ii) 5.3 주석 키워드 | antigravity [도출](Q6 184행)이면서 [확신 중](84행)이고 [정책](96행), 로컬 [확신 중], claude [정책] | 5항(spec:23)의 의무 문장은 "제약(jsonSchema 조건)을 최신화"이고, 예시는 유효성 조건입니다. 주석·커스텀 필드에 대해서는 마지막 문장이 "유효성 조건 외 커스텀 필드 병합 방법에 대해서 고민해볼 필요가 있다"입니다. 방향을 열어 둡니다. v5 실행: 로드 때 `then`이 켜져 있으면 `then`의 `default`가 본체를 이깁니다(`x='T'`). 런타임에 켜지면 본체 노드는 생기지 않으므로 채우지 않습니다(a4) | **정책이며, C 쪽 [확신 중]이 상한입니다.** 5항의 글은 승자 방향을 정하지 않습니다. antigravity의 [도출]은 과장입니다. 규칙 A 아래에서 5.3의 `default` 부분은 "생성 순간의 원천 선택"으로 좁아집니다(로컬의 지적, 실행 확인) |
| (iii) 같은 대상 경합 | 로컬: 채움이 가장 낮음 [도출], `&clearValue`가 채움을 이김 [도출], 나머지는 정책. v5: 스위치. claude: 두 질문 모두 정책. antigravity: 차례 적용(`&clearValue` → `&derived` → `&injectTo`), 나중 선언이 이김 | 채움은 "없음일 때만"(spec:74)이므로 다른 쓰기가 있으면 성립하지 않습니다. v5에서도 `log.has(c)`이면 채우지 않습니다. `&clearValue`와 채움은 claude의 제안(채우고 같은 라운드에 지움)과 로컬의 규칙(지운 노드는 채우지 않음)이 같은 결과를 냅니다. spec:74 "지운 값은 다시 채워지지 않는다"와도 맞습니다. v5도 같습니다(P2 `initialTrue`). 대상별 해소 자체는 실행이 요구합니다(§2.5) | **도출되는 것은 셋입니다.** 대상별로 라운드마다 하나만 적용합니다(실행). 채움이 가장 낮습니다. `&clearValue`가 채움을 이깁니다. claude의 둘째 정책 질문은 답이 이미 정해져 있어 지울 수 있습니다. antigravity의 차례 적용안은 대상별 해소가 없으면 로드에서 v4e처럼 예산을 다 씁니다. `&derived`·`&injectTo`·`&clearValue` 사이의 순위는 정책입니다 |
| (iv) 게이트 없는 `oneOf`·`anyOf` 분기 | claude: 모두 동시 활성. 로컬: 존재만 더하고 제약은 교차하지 않음. antigravity: 켜진 단일 분기의 제약이 overlay | v5 실행: `oneOf: [{kind:{const:'a'}, x}, {kind:{const:'b'}, y}]`, 로드 `{kind:'b', y:1}`에서 두 분기 모두 활성(`activeIds`에 둘 다)이고 `stable`입니다. 공유 노드 `kind`의 스키마는 **첫 선언 `{const:'a'}` 그대로**이고 값은 `'b'`입니다. 교차도 규칙도 없습니다. v5는 Q4 병합을 구현하지 않았습니다(`REPORT-proto.txt:229`) | **존재에서는 claude와 로컬이 같고 실행이 뒷받침합니다.** 제약에서는 로컬만 규칙을 냈습니다. 교차하면 `const` 둘이 공집합이 되므로 로컬의 규칙이 옳은 쪽입니다(검증기보다 좁은 힌트를 막음). 다만 실행으로 확인하지는 않았습니다. antigravity의 "단일 분기"는 새 모델과 맞지 않습니다. v5의 "첫 선언 스키마"는 틀린 힌트를 내는 공백입니다(§4의 6번) |

### 3.1 편집자 사전 판단 다섯 가지

| 항목 | 로컬 | claude | antigravity | 증거와 뒷받침되는 확신 |
| --- | --- | --- | --- | --- |
| 5.5 지워짐 | 지워짐 | 지워짐 | 지워짐 | spec §3.2 "폼은 `oneOf`/`anyOf`를 읽지 않는다", spec:138 "`selection` 칸 없음". v5에 칸·API·점수가 없고 `precheck`가 v4e와의 차이를 확인합니다. **셋이 일치하며 도출입니다** |
| 5.1 `fire` | 바뀜 → `fire` [확신 중] | "그대로"(확신 중, `fire` 쪽) | 바뀜, `fire` 쪽이지만 정책 | 셋 모두 `fire` 쪽입니다. spec:104는 억제 범위를 `&derived`·`&injectTo`까지 이미 넓혔습니다. 이것은 `06-conclusions.md:271`이 "`fire`를 고를 때 따라오는 귀결"로 적은 문장입니다. v5도 `LOAD_EDGE=fire`입니다. 다만 소유자의 예/아니오(`06-conclusions.md:272`)는 아직 없습니다. **[확신 중], 높은 쪽입니다.** claude의 "그대로"는 판정 이름만 다르고 실질은 같습니다 |
| 5.2 에지 | 바뀜 → 에지 [도출] | 그대로(정책) | 바뀜, 에지 [확신 중] | spec §3.4(:120) "의존 값이 바뀌면 자기 값을 다시 계산해 덮는다"와 spec:138 "`&derived`·`&injectTo`는 에지"는 "이미 정해진 것" 절에 있습니다. claude는 두 줄을 인용하지 않았습니다. **§3.4를 확정으로 읽으면 도출입니다.** 표 이름이 "원장 초안"이므로 그 전제를 적어야 합니다. 공개 문서 `expressions.md:47`의 레벨 약속은 이주 대상입니다 |
| 5.3 C | 켜진 조각이 덮음 [확신 중] | 그대로(정책) | C [도출]과 [확신 중]이 섞임 | 위 (ii)와 같습니다. **정책이며, C 쪽 [확신 중]이 상한입니다** |
| 5.6 첫째 유지 | 유지 [도출] | "그대로 … 양방향 유지 여부는 그대로"(판단 없음) | 유지 [도출] | spec:104가 `DisableAutomaticWrites`·`EnableAutomaticWrites` 두 비트와 Form 속성을 함께 정했습니다. 10항(spec:28)은 "기존과 같이"입니다. v5 P6 "per-load false는 Form 기본 true를 덮는다"가 실행으로 확인합니다. **도출입니다.** claude는 spec:104를 놓쳤습니다 |

## 4. spec에 더하거나 고칠 문장

1. **§3.1 채움의 단위.** "노드가 생긴다는 것은 그 노드가 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있다는 뜻이다. 다른 켜진 조각이나 본체, 게이트 없는 `allOf` 항목이 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않는다." v5는 a1과 a3에서 이 문장과 다르게 동작하므로 고쳐야 합니다(`wantedDefaults`의 `born`).
2. **§3.1 노드 게이트.** "노드 스키마의 `&active`가 거짓에서 참이 되는 것은 생성인가"와 "로드 때 노드 게이트가 거짓인 노드를 채우는가"를 적어야 합니다. spec:105는 노드 게이트와 조각 게이트를 한 키로 통합했지만 v5는 둘을 다르게 다룹니다. 로컬은 생성으로 읽습니다.
3. **§3.2 표의 조건.** 표 위에 "각 분기의 `if`는 조건 프로퍼티를 `required`에 넣는다(`oneof-if.mjs:17`)"를 적습니다. "조건 프로퍼티가 없는 값" 열(`{}`, `{x:'s'}`)을 더합니다. `required`가 없으면 `oneOf`/`anyOf` + `else: false`가 `{x:'s'}`를 받아들이고, 빈 값에서 모든 가드가 참입니다(§2.3). 93행의 귀결은 "`else: false`와 `if`의 `required`가 함께 필수"로 고칩니다. 개발 모드 경고 후보에 "`if`에 `required`가 없음"을 더할지는 P1′와 닿으므로 정책으로 남깁니다.
4. **§3.4 단계 열.** 표에 단계 열을 더합니다. `&active`는 계산, `&derived`·`&injectTo`·`&clearValue`는 파생, `&default`·`default`는 전이(생성), `&pristine`은 커밋입니다. `&pristine`의 부류 "동작(전이 시점)"은 전이 단계와 헷갈리므로 "동작(에지)"로 바꿉니다. 원본을 쓰지 않기 때문입니다(`adr/0007-settle-cycle.md:137`).
5. **같은 대상 규칙.** "파생 단계는 라운드마다 후보를 모아 대상별로 하나만 적용한다. 채움은 가장 낮고, `&clearValue`는 채움을 이긴다. `&derived`·`&injectTo`·`&clearValue` 사이의 순위는 소유자가 정한다." 근거는 §2.5의 실행입니다.
6. **게이트 없는 분기의 유효 스키마.** "게이트 없는 `oneOf`·`anyOf` 분기는 존재만 더하고 그 분기의 제약은 공유 노드에 교차하지 않는다"를 Q4의 한 행으로 적습니다. v5의 첫 선언 스키마(`{const:'a'}`)는 값 `'b'`에 틀린 힌트를 냅니다.
7. **Q3 루트 규칙의 변화 표시.** AND/OR 후보는 오늘의 루트 우선 사슬(`checkComputedOptionFactory.ts:22-26`, 루트 `false`가 노드의 식을 덮음)을 바꿉니다. 10항은 "기존과 같이"입니다. 그래서 이 변화를 소유자 질문으로 명시해야 합니다. antigravity처럼 도출로 적으면 안 됩니다.
8. **바꿀 문장 목록에 하나 추가.** `adr/0008-event-system.md:60`의 배달 집합에 "유효 스키마가 바뀐 노드"가 없습니다(claude의 지적, 확인). 4.9의 도출과 맞추려면 더해야 합니다.

## 5. 미확인

- r8 이식의 바뀐 요약 26행 각각의 이유(`regress/CHANGES.txt`)는 하나씩 검토하지 않았습니다. 개수만 확인했습니다.
- v5 코드는 `wantedDefaults`, `resolveDefault`, `reconcileDerive`와 `build-v5.mjs`만 읽었습니다. 제어 결합(`CONTROL_COMBINE`)은 r9 P4의 단언 통과로만 확인했습니다.
- 게이트 없는 분기의 제약을 교차하지 않는 규칙은 실행하지 않았습니다. v5에 병합이 없습니다.
- 인용 추출은 정규식 기반입니다. 확장자 없는 인용(antigravity의 `adr/0003:26`)은 손으로 확인했습니다(확인). 인용 수에는 ±3 정도의 오차가 있을 수 있습니다. "부적합"은 제 읽기에 따른 판정입니다.
- `&children` 예시의 출처는 `architecture/` 안에서만 검색했습니다.
- `&pristine`의 새 이름 후보(claude의 `&resetTouched`, antigravity의 `&resetInteraction`)는 평가하지 않았습니다.
- Node.js 판이 보고서(v26.8.2)와 다릅니다(v24.20.0). 결과는 시간 측정 줄 말고는 같았습니다.
