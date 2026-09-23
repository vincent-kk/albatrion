# 10라운드 원문 — 교차 검증 (인용 대조, 갈림 판정, 실행 재현, 실험 재실행)

편집자 주: 검증 에이전트(로컬 opus, 읽기 전용)가 보낸 보고를 그대로 저장했다. 보고가 전송 중 여러 조각으로 왔고 편집자가 이어 붙였다. 내용은 고치지 않았다.

---

로컬의 E8d·E21 주장은 v5 사본에서 그대로 재현됐습니다. 원인은 v5가 한 정착 안에서 에지를 다시 발화시키는 규칙입니다. codex 실험은 SUMMARY와 ROW가 모두 바이트 단위로 같게 재현됐습니다. 세 추정 가운데 채택 규칙을 통과하는 항목은 3번 하나입니다.

**Verdict: pass with conditions.** 추정 완료로 넘길 수 있는 것은 항목 3 하나입니다. 나머지 열여덟은 소유자 목록으로 갑니다. 조건은 두 가지입니다. 아래 비확인 인용 열 개를 종합에 쓰지 않아야 하고, `07-conclusions.md` 정정 둘을 적용해야 합니다.

## 1. 인용 대조

| 파일 | 고유 인용 | 확인 | 확인 아님 |
| --- | --- | --- | --- |
| local | 115 | 115 | 0 |
| claude | 64 | 61 | 3 |
| antigravity | 약 64 (접두 경로만 다른 중복을 합침) | 약 57 | 7 |

없는 줄을 지어낸 인용은 없습니다. 틀린 파일 이름은 antigravity에만 있습니다.

**확인이 아닌 인용**

| 파일 | 인용 (항목) | 판정 | 사실 |
| --- | --- | --- | --- |
| claude | `07-conclusions.md:168` (16) | 줄 어긋남 → 169 | 168은 검증 키워드 행이고, "오늘은 먼저-승 [정책]"은 169의 주석 키워드 행입니다 |
| claude | `round-9-derivation.md:101` (14) | 줄 어긋남 → 103 | 인용문 "G4는 (나)로 기운다"는 103행에 있습니다 |
| claude | `raw-round9-code-facts.md:37` (13) | 부적합 | 37행은 Form 속성과 노드 값의 OR 결합만 말합니다. "중간 조상 전파가 없다"는 `round-9-derivation.md:82`에 있습니다 |
| antigravity | `00-goals.md:91` (7, 18) | 줄 어긋남 → 90/92 | 91행은 빈 줄입니다. G8 제목은 90행, 본문은 92행입니다 |
| antigravity | `round-9-spec.md:121` (8) | 줄 어긋남 → 119–120 | 121은 `&injectTo` 행입니다. `&clearValue`는 119행, `&derived`는 120행입니다 |
| antigravity | `raw-round9-code-facts.md:37` (13) | 부적합 | claude와 같습니다. 맞는 위치는 `round-9-derivation.md:82`입니다 |
| antigravity | `03-mental-model.md:10` (21) | 부적합 | 옛 P2 문구입니다. 새 문구 `07-conclusions.md:70`은 `&clearValue`를 작성자의 정당한 쓰기로 넣습니다. "코어가 고치지 않는다"는 코어에 관한 문장입니다 |
| antigravity | `06-conclusions.md:195` (보조 과제) | 부적합 | 인용 뒷문장 "고정점이 없는 스키마는 지원 범위 밖이다"는 195행에 없습니다. 이 문장은 `adr/0007-settle-cycle.md:57`과 `06-conclusions.md:229`에 있습니다 |
| antigravity | `07-conclusions.md:148` (20) | 부적합 | 인용문은 `round-10-spec.md:42`의 실마리 열에서 왔습니다. 148행은 오히려 이 경고를 "정책"으로 분류합니다 |
| antigravity | `adr/0013-raw-and-write.md:54` (6) | 파일 이름 오류 | 실제 파일에서 54행 내용은 맞습니다 |

**antigravity의 틀린 ADR 파일 이름 (편집자 주 3행 제외)**

| 쓴 이름 | 나온 줄 | 실제 이름 |
| --- | --- | --- |
| `adr/0013-raw-and-write.md` | 43, 252 | `adr/0013-core-does-not-rewrite-values.md` |
| `adr/0003-expression-system-and-scope.md` | 127, 141, 294 | `adr/0003-ampersand-namespace.md` |
| `adr/0006-state-model-and-node-tree.md` | 266 | `adr/0006-single-value-ownership.md` |
| `adr/0011-rendering-boundary.md` | 280 | `adr/0011-branch-node-composition.md` |

**인용은 맞지만 사실이나 추론이 틀린 곳**

- **antigravity 18.** "현행 `processOverwriteFields`와도 부합"은 틀렸습니다. 오늘 코드는 통째로 교체합니다(`processOverwriteFields.ts:23`, `base[k] = value`).
- **antigravity 20.** "표준 검증기 판정이 필연적으로 기각"은 틀렸습니다. 게이트 둘이 켜져도 `then` 하나만 통과하면 `oneOf`는 통과합니다.
- **antigravity 4.** "`virtual`은 키워드가 아니라 `type`의 값"은 절반만 맞습니다. 오늘은 객체 스키마의 키이기도 합니다(`src/types/jsonSchema.ts:197`).
- **claude 6.** "`fill`이 기본이면 로드 때 `&injectTo`가 발화하지 않아 끌 대상이 없다"는 틀렸습니다. `fill`도 없음인 대상에는 로드 때 씁니다. 그래서 억제 범위는 `fire`를 전제하지 않습니다. `06-conclusions.md:271`은 이것을 `fire`의 귀결로 적었을 뿐입니다.

## 2. 항목별 수렴표와 판정

기준은 명세의 기준 그대로입니다. 강제하는 축 문장이 있어야 추정입니다. G4는 대안이 같은 개념에 둘째 장치를 만들 때만 강제로 칩니다. "불가"는 추정 불가의 줄임입니다.

| 번호 | local | claude | antigravity | 판정 | 결정적 근거 |
| --- | --- | --- | --- | --- | --- |
| 6 | fire, 추정 | fire, 기울기 | fire, 기울기 | **기울기(높음)** | 아래 주석 |
| 7 | C, 기울기 | C, 기울기 | C, 기울기 | **기울기** | 5항 "고민해볼 필요가 있다"와 `07:78`이 방향을 열어 둡니다. C+나중-승과 F+먼저-승 모두 한 방향이라 G4는 중립입니다 |
| 8 | 예, 기울기/불가 | 불가 | 예, 기울기 | **추정 불가** | `07:125` "순위는 정책"입니다. 부류(명사·동사) 문장 `07:274`는 문법 설명이지 순위 규칙이 아닙니다. local의 C2 논거(E8d)는 v5의 산물입니다(3절) |
| 9 | 불가 (세부는 추정) | 불가 | 불가 | **추정 불가** | 두 순위 모두 G5를 만족합니다. local의 세부 둘은 `07:87`의 글자 그대로 귀결이지만, `07:394`가 미설계로 두었고 codex P4·P7에서 결과를 바꿉니다. 그래서 기울기가 상한입니다 |
| 11 | 아니오, 추정 | 아니오, 기울기 | 아니오, 추정 | **추정** | 아래 주석 |
| 13 | 예, 추정(조건부) | 불가 | 예, 기울기 | **기울기** | 아래 주석 |
| 14 | (나), 기울기 | (나), 기울기 | (나), 기울기 | **기울기** | G4는 장치의 목표이지 문법 모양을 정하지 않습니다. v5 모양은 (나)의 한 형태입니다(`raw-round9-verification.md:52`) |
| 15 | 예, 추정(§3.4 전제) | 예, 기울기 | 예, 추정 | **추정(전제)** | 아래 주석 |
| 16 | 예, 기울기 | 불가 | 예, 기울기 | **기울기** | 통일은 `06:292` 선례로 강하게 당깁니다. 방향(나중-승)은 7·17에 달려 있고, G8(`06:417`, `allOf`끼리 먼저-승)이 반대로 당깁니다 |
| 17 | 예, 기울기 | 예, 기울기 | 예, 기울기 | **기울기** | `07-conclusions.md:169`의 "전순서 [정책]"이 근거입니다. 7이 기울기이므로 이 항목은 이중으로 조건부입니다. 켜진 `then` 여럿에 대한 RJSF 동작은 아무도 실행하지 않았습니다 |
| 18 | 예, 기울기 | 불가 | 예, 기울기 | **기울기** | `control` 키는 키마다 자기 병합 행을 따릅니다. 열린 컨테이너 `options`는 다른 개념이라 G4가 강제하지 않습니다. antigravity의 "현행 코드와 부합"은 틀렸습니다. 오늘은 통째 교체입니다(`processOverwriteFields.ts:23`) |
| 19 | 예, 기울기 | 불가 | 예, 기울기 | **기울기(약함)** | 소유자 문장 둘이 반대로 당깁니다. 1항 "if 블록은 해석하지 않는다"(`round-9-spec.md:19`)와 2항 "제약"(`:20`)입니다 |
| 20 | 예, 추정 | 불가 | 예, 추정 | **추정** | 아래 주석 |
| 21 | 예, 추정 | 예, 기울기(6에 종속) | 아니오, 기울기 | **기울기(6에 종속)** | 아래 주석 |
| 23 | 예, 기울기 | 불가 | 예, 기울기 | **기울기** | 축에 든 §7이 명시합니다. `round-9-spec.md:156` "작성자 의도를 단정하므로 정책으로 남긴다" |
| 2 | 예, 추정 | 불가 | 예, 기울기 | **추정(약함)** | 리프 규칙 `adr/0013-core-does-not-rewrite-values.md:40`과 G4가 근거입니다. 규칙을 두지 않으면 "없음으로 만들기"에 `removeKey`라는 둘째 장치가 남습니다. `06-conclusions.md:316`의 "잔여 키 UI와 함께"는 렌더 계층의 일입니다(`03-mental-model.md:98`, P5). 오늘 `Merge` 동작은 확인하지 않았습니다 |
| 3 | 예, 추정 | 예, 추정 | 예, 추정 | **추정** | 아래 주석 |
| 4 | 예, 기울기 | 불가 | 예, 기울기 | **기울기** | D-6 자체가 "도출은 아니다"입니다(`06-conclusions.md:224`). 키 접두 `&virtual`은 이미 수락된 결정입니다(`06:87`). antigravity의 "`virtual`은 키워드가 아니라 `type`의 값"은 절반만 맞습니다. 오늘은 객체 스키마의 키이기도 합니다(`src/types/jsonSchema.ts:197`) |
| 5 | 바꿈 추정, 이름 불가 | 바꿈 기울기, 이름 불가 | 불가 | **바꿈 기울기(강함), 이름 추정 불가** | `07:274`의 부류 규칙은 6.1 표 아래의 편집자 서술이지 소유자 문장이 아닙니다. 8항 "이름 컨벤션도 맞추고"와 `round-9-spec.md:68`은 강하지만 수사 의문입니다 |

### 판정 주석

**6: 기울기(높음). 침묵은 강제하는 문장이 아닙니다.**
- P2가 로드 예외를 두지 않는 것은 `fire`를 허용할 뿐입니다.
- `06:267`은 P2에 한 문장을 더하면 `fill`이 "특수 경로가 아니라 새 원리의 적용"이 된다고 적었습니다. 06 §5 머리(260행)와 `06:269`는 이 선택을 "제품의 가치"로 분류했습니다.
- `fill`은 한 장치(`&injectTo`)에 로드 모드를 더하는 것입니다. `06:281`에 따르면 G4의 단위는 장치이므로, G4도 강제하지 않습니다.
- 9라운드 뒤에 더해진 것도 이 분류를 뒤집지 못합니다. 6항은 "쓸 수 있다"는 허용 문장입니다. 억제 범위(`round-9-spec.md:104`)는 `fire`의 전제가 아니라 귀결입니다(`06:271`). `fill`도 로드 때 없음인 대상에는 쓰므로, 억제할 대상이 여전히 남습니다. claude가 "끌 대상이 없다"고 추론한 것은 틀렸습니다.
- 07 안에도 모순이 있습니다. `07:204`는 "확신 중(높음)"이라 적었는데, `07:10`의 정의로 "확신 중"은 도출입니다. 그런데 이 줄은 "축이 두 답을 허용한다"는 5.1 표(`07:199`) 안에 있습니다.

**11: 추정(아니오).**
- 질문은 "필요한가"입니다. 이것을 요구할 수 있는 축 문장은 읽기 2와 G2뿐입니다.
- 읽기 2는 4.28이 이미 채웁니다(`07:195`). G2는 오늘 그런 키가 없으므로 요구하지 않습니다(`raw-round9-code-facts.md:29`).
- 새 키를 두면, 규칙 A가 배제한 "빠질 때마다 채움"(`round-9-spec.md:74`)을 둘째 채움 장치로 들이게 됩니다.
- claude는 "두면 안 된다"를 증명하려다 기울기로 낮췄습니다. 질문의 방향을 잘못 읽은 것입니다.

**13: 기울기(예).**
- local의 전제 "4.26을 받는다면"은 13을 함의하지 않습니다. 결합식 `07:155`에는 "조상들"이 있지만, 같은 절의 `07:159`가 중간 조상을 명시적으로 정책으로 뺍니다. 07 안의 긴장입니다.
- 읽기 3 "설계 대상이다"(`round-9-spec.md:60`)는 열어 두는 문장이지 강제하는 문장이 아닙니다.
- §7-7(`round-9-spec.md:160`)은 같은 10항 긴장을 소유자 질문으로 적었습니다.

**15: 추정(예, 전제 있음).**
- `round-9-spec.md:123`은 `&children`이 "자식 집합에 위 상태 키를 건다"라고 뜻을 정합니다.
- 명세는 `round-10-spec.md:5`에서 `round-9-spec.md` §3을 축에 넣었습니다.
- 이 표가 편집자 초안이라는 점(`07:208`)은, 06 5.2의 에지 도출이 선 것과 같은 전제입니다.
- claude는 이 줄을 보지 않았습니다.

**20: 추정(예).**
- 소유자는 읽기 1에서 "oneOf 복수 브랜치 일치 문제"를 해결할 문제로 불렀습니다(`round-9-spec.md:42`).
- 경고는 게이트 결과만 셉니다. 1항이 허락한 "활성화 되는지만 본다" 안입니다. C2는 개발 모드 경고를 채택했습니다.
- 이 기준은 `07:148`이 `else: false` 누락 경고를 도출로 적은 기준과 같습니다.
- 9라운드 종합은 이 경고를 정책으로 옮기면서 이유를 적지 않았습니다(`round-9-derivation.md:138`에는 (c)의 이유만 있습니다). 23은 §7이 이유를 명시했으므로 기울기로 남습니다.
- antigravity의 "필연적으로 기각"은 틀렸습니다. 게이트 둘이 켜져도 `then` 하나만 통과하면 `oneOf`는 통과합니다.

**21: 기울기(예, 6에 종속).**
- local이 인용한 `03:83`(D-7)과 `06:268`은 실제로 있고, 쓰인 대로 말합니다.
- 두 줄이 지우는 것은 v5의 혼합 동작입니다. 마운트는 지우고 `reset`은 남기며, 같은 V가 이력에 따라 갈리는 동작입니다.
- 로드 때 전부 발화하지 않는 안은 지우지 못합니다. 그 안은 `06:267`과 같은 종류의 로드 문장을 요구합니다. 그래서 21은 6과 함께 움직입니다. local도 이 종속을 스스로 적었습니다(local 171행).
- "마운트와 `reset`은 같아야 한다"는 부분 명제만 추정입니다.
- 셋 가운데 claude가 축을 바르게 읽었습니다. antigravity는 옛 P2(`03:10`)를 읽었습니다. 새 P2(`07:70`)는 `&clearValue`를 작성자의 정당한 쓰기로 넣습니다. 게다가 antigravity가 고른 v5 혼합 동작은 D-7이 지우는 바로 그 안입니다.

**3: 추정(예).**
- `06:172-173`의 4.8은 "노드가 없으므로 `null`"이고, 이유는 "공개 API가 객체를 조용히 파괴하면 안 된다"입니다.
- 오늘 `findNodes`도 터미널 커서를 그대로 돌려줍니다(`src/core/nodes/AbstractNode/utils/findNode/findNodes.ts:89-90`). 그래서 `find`와 같은 파괴 경로가 있습니다.
- 같은 경로 문법을 두 조회가 다르게 풀면, 같은 개념에 장치가 둘이 됩니다. 이것이 G4 강제입니다.
- 반대로 당기는 문장은 없습니다. 세 표기가 모두 추정이고, 강제 문장의 인용도 모두 확인입니다.

## 3. local의 실행 주장

**방법.** 사본은 `$TMPDIR/r10verify/`에 두었습니다. 바꾼 것은 `build-v5.mjs`의 검증기 경로 하나로, 절대 경로로 바꿨습니다. 스크립트는 local의 것을 쓰지 않고 새로 짰습니다(`/tmp/claude-501/r10verify/round9/vexp.mjs`).

### (a) E8d·E8e: 재현됨

장면은 `t`에 `&derived`(`dep×10`)와 `&clearValue: t > 50`을 둔 것이고, `dep`를 1에서 6으로 바꿨습니다.

```
clear-wins  (d,i,c+last / c,d,i+first) : budget-exceeded, 25 rounds, raw {dep:6, t:10}
clear-loses (c,d,i+last / d,i,c+first) : stable, 2 rounds, raw {dep:6, t:60}  (조건 참, 지움 없음)
E8e (&injectTo 판, src 1→6)             : 위와 같은 쌍 (t:10 예산 초과 / t:60 안정)
대조군 (조건이 대상이 아닌 flag를 읽음)   : clear-wins {t 없음} / clear-loses {t:60}, 둘 다 stable 2 rounds
```

- **v5에서 local의 주장은 사실입니다.** 어느 순위에서도 의도대로 끝나지 않습니다. `t:10`은 원본 B의 커밋으로, `dep=6`과 어긋난 옛 값입니다.
- **원인 귀속도 맞습니다.** 원인은 두 가지가 겹친 것입니다. `&clearValue`의 직전 불리언 `clearWas`는 `commit()` 안에서만 갱신됩니다(`loop-v5.mjs:1469` 함수, 1475행). `&derived`의 에지는 직전 커밋과 비교하므로(`07:87`) 한 정착 안에서 라운드마다 다시 발화합니다. 그래서 파생(t=60)과 지움(t 없음)이 번갈아 돕니다.
- **v6에서는 결과가 달라집니다.** codex의 v6 모델은 승자를 소비합니다. 같은 장면을 네 조합(clear-wins/loses × dropped/requeued)으로 돌렸더니 모두 stable, 3 rounds, raw `{dep:6}`였습니다. `t`가 지워진 채 안정됩니다.
- **결론.** E8d는 순위(8번)를 가르는 증거가 아니라, 정착 안의 에지 소비 규칙(11.2, 9번의 세부)을 가르는 증거입니다. local이 8번에서 쓴 C2 논거("예 쪽은 신호, 아니오 쪽은 조용한 소실")는 v5의 산물입니다.

### (b) E21: 재현됨

조건은 `&clearValue: clear === true`, 로드 값은 `{clear:true, x:'loaded'}`이고, 기본 스위치로 돌렸습니다.

```
mount                              : x 없음 (노드 생성 에지)
setValue(V), 직전 clear=true       : x = "loaded"
reset()                            : x = "loaded"
clear=false 쓴 뒤 setValue(V)       : x 없음
다시 setValue(V), 직전 clear=true   : x = "loaded"
억제 마운트(disableAutomaticWrites) : x = "loaded"
```

- v5 안에서 마운트와 `reset`이 다릅니다. 같은 전체 교체가 직전 조건 값(이력)에 따라 갈립니다. local의 기술과 정확히 같습니다.
- 원인은 두 가지입니다. 노드 생성은 직전 값이 없어 에지로 봅니다(`r9.mjs:63`). 전체 교체와 `reset`은 노드를 새로 만들지 않고 커밋된 `clearWas`와 비교합니다(`r9.mjs:165`의 기대와 같습니다).
- codex의 P5(`LOAD_EDGE_CLEAR=held`)도 같은 모양입니다. load는 지우고, reset과 replace는 `"v"`를 남깁니다.

## 실험 재실행 (codex, `spikes/round10/`)

**방법.** `spikes/` 전체를 `$TMPDIR/r10full/canard/schema-form/architecture/spikes/`로 복사했고, `diff -rq`로 원본과 같음을 확인했습니다. 검증기 플러그인은 `$TMPDIR/r10full/canard/schema-form-ajv8-plugin`에 심볼릭 링크로 두었습니다. 그래서 복사본을 한 바이트도 고치지 않았고, 상대 경로가 그대로 풀립니다(ajv는 플러그인 자체의 `node_modules`에서 해석됩니다).

REPORT.txt 머리의 명령을 순서대로 돌렸고, 다섯 모두 exit 0입니다.

```
node proto/make-v6.mjs; node r10.mjs; node policy-check.mjs; node verify.mjs; node write-report.mjs
```

**산출물 대조 (원본과 바이트 비교)**

| 산출물 | 결과 |
| --- | --- |
| `r10-output.txt` (SUMMARY 21줄, ROW 2,904줄) | 같음 |
| `REPORT.txt` 전체 ("스위치 값별 측정" 표 14줄 포함) | 같음 |
| `policy-check-output.txt` | 같음 |
| `verification.txt` (matrix sha256 `639907…2dad`) | 같음 |
| `compat/r9-output.txt`, `compat/r9b-output.txt` | 같음. round9 원본 출력과도 같음 |
| `round9-run/r9-output.txt`, `r9b-output.txt` | 같음 |
| `round9-run/regress/selfcheck-*.txt` 네 개 | `time=…us` 줄만 다름. 시간 값을 지우면 round10 기록과도, round9 원본과도 같음 |

`verify.mjs` 안에서 `r10.mjs`를 두 번 돌린 출력도 바이트 단위로 같았습니다.

**`EXPERIMENT=false` 경로: 9라운드 수치를 그대로 냅니다.**

| 9라운드 수치 | v6(`EXPERIMENT=false`)에서 | 근거 |
| --- | --- | --- |
| 프로브 108 (r9) | 출력이 round9와 바이트 단위로 같음 | `verify.mjs` compat |
| 단언 52·탐침 13 (r9b) | 출력이 round9와 바이트 단위로 같음 | `verify.mjs` compat |
| 회귀 63 (new/old) | 두 모드 모두 PASS 63, FAIL 0. 출력은 스위치 목록 첫 줄만 다르고 나머지 104줄이 같음 | 제가 추가로 실행 |
| 경계 26 | `{"edgeCases":26,"passed":true}`, 출력이 v5와 바이트 단위로 같음 | 제가 추가로 실행 |

- **`verify.mjs`의 빈틈.** 이 스크립트는 회귀 63과 경계 26을 원본 v5(`round9/regress/run.mjs`)로만 돌립니다. v6의 `EXPERIMENT=false`는 r9·r9b에만 씁니다. 그래서 import 두 줄만 v6로 바꾼 사본을 임시 트리에서 돌렸습니다. `selfcheck-v5.mjs`는 파일 이름으로 실행 여부를 판단하므로(782행), 사본을 같은 이름으로 `regress6/`에 두었습니다.
- **`verification.txt`의 9라운드 기록 (재실행 값과 같음).** selfcheck new는 PASS 63과 기존 v4e 실패 3, old는 PASS 63과 실패 0입니다. q8은 108, corrections는 52와 13, edgeCases는 26입니다. r8은 구성 31·행 181·요약 41·바뀐 요약 17이고, r7은 바뀐 행이 new 12·old 2입니다. round9 파일 31개는 실행 전후로 바뀌지 않았습니다.
- **`policy-check.mjs`의 `assertions: 10`.** 30행에 하드코딩된 숫자이지만, 코드를 세면 4개 사례 × 2와 2개 사례 × 1로 실제 10개입니다.

**해석의 경계**

- `CLEAR_PRIORITY`의 clear-wins와 clear-loses는 모든 집계가 같습니다(예산 초과 48/48, 조용한 소실 0/0).
- `silentWriteLosses=0`은 명시적인 패자 버림을 "설명된 손실"로 세는 정의에서 나온 값입니다(REPORT.txt 50행 부근). local이 말하는 "조용한 소실"을 반박하지 않습니다.
- 예산 초과는 P8에서만 났습니다(96/96).
- 승자 소비 규칙(v6)은 07에 없는 실험 규칙입니다. 이 재실행은 산출물이 재현된다는 것을 확인했을 뿐이며, 정책을 판정하지 않습니다.

## 4. local이 제안한 07 정정 둘

**(i) 확인.**
- `07-conclusions.md:205`(5.1의 7번 행)는 주석 키워드의 예로 "(`title`, `readOnly` 등)"을 듭니다.
- 같은 문서의 4.27 병합표는 주석 행(`:169`)에 `title`·`description`·`format`·`default`·`&default`만 둡니다. 표준 `readOnly`는 상태 키 행(`:170`, 4.26의 AND/OR)에 둡니다. `07:157`도 표준 `readOnly`와 `&readOnly`를 OR로 결합합니다.
- JSON Schema 명세에서 `readOnly`가 메타데이터 주석이라는 점과는 별개로, 07 안에서 모순입니다.
- 이 오류는 `round-9-spec.md:134`(Q4 목록의 "주석 키워드(`title`·`description`·`readOnly`…)")에서 왔고, antigravity 7번의 귀결에도 이어졌습니다.

**(ii) 확인.** `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/constants.ts:8-20`의 `FIRST_WIN_FIELDS`는 다음 열한 개입니다.

```
title, description, $comment, examples, default, readOnly, writeOnly, format,
additionalProperties, patternProperties, prefixItems
```

- 검증 계열 셋(`additionalProperties`, `patternProperties`, `prefixItems`)이 섞여 있습니다. 새 표에서는 교차(`07:168`)로 갑니다.
- 4.27에서 상태 키인 `readOnly`도 섞여 있습니다. 새 표에서는 OR(`07:170`)로 갑니다.
- `07:178`의 "주석 키워드는 먼저-승, 나머지는 나중-승으로 섞여 있다"는 부정확합니다. 특수 목록(`type`·`enum`·`required`·`properties` 등)은 교차하고, 무시 목록(`if`·`then`·`oneOf` 등)은 경고만 냅니다(`raw-round9-code-facts.md:22-24`). 나중-승은 그 밖의 키뿐입니다(`processOverwriteFields.ts:22-23`).

**새 이주 항목 하나.** `allOf` 항목끼리 표준 `readOnly`가 겹치면 오늘은 먼저-승이고, 새 표에서는 OR입니다. 예를 들어 `[{readOnly:false},{readOnly:true}]`는 false에서 true로 바뀝니다. 9절의 6(`07:358`)에는 "같은 노드의 표준 `readOnly`와 `&readOnly`가 택일에서 OR"만 있고 이 경우가 없습니다.

## 5. 최종 목록 (명세 §2의 채택 규칙 적용)

**(A) 추정 완료: 1개**

- **3. `findNodes`도 터미널 아래 경로에 노드 없음.** 세 표기 모두 추정이고, 강제 문장의 인용은 모두 확인입니다. 강제 문장은 `06-conclusions.md:172-173`(4.8, P2·G4 "공개 API가 객체를 조용히 파괴하면 안 된다")과 `00-goals.md:54`(G4 "특수 경로가 없고")입니다. 오늘의 `findNodes.ts:89-90`에 같은 별칭 경로가 있어 같은 이유가 그대로 적용됩니다. antigravity 귀결의 `adr/0006-state-model-and-node-tree.md`는 틀린 파일 이름이지만, 강제 문장에는 쓰이지 않았습니다.

**(B) 방향은 셋이 같지만 강제되지 않음: 6개**

| 번호 | 방향 | 표기 | 제 판정 |
| --- | --- | --- | --- |
| 6 | `fire` | 추정 1, 기울기 2 | 기울기(높음) |
| 7 | C (켜진 조각이 이김) | 기울기 3 | 기울기 |
| 11 | 아니오 | 추정 2, 기울기 1 | 추정. claude가 질문 방향을 잘못 읽음 |
| 14 | (나) | 기울기 3 | 기울기 |
| 15 | 상태 키만 | 추정 2, 기울기 1 | 추정, `round-9-spec.md` §3.4를 전제 |
| 17 | 나중 조각이 이김 | 기울기 3 | 기울기 |

**(C) 수렴하지 않음: 12개**

| 번호 | 갈림 | 제 판정 |
| --- | --- | --- |
| 8 | local·antigravity는 예, claude는 방향 없음 | 추정 불가 |
| 9 | 셋 모두 추정 불가, 방향 없음 | 추정 불가 |
| 13 | local·antigravity는 예, claude는 방향 없음 | 기울기 |
| 16 | local·antigravity는 예, claude는 방향 없음 | 기울기 |
| 18 | local·antigravity는 예, claude는 방향 없음 | 기울기 |
| 19 | local·antigravity는 예, claude는 방향 없음 | 기울기(약함) |
| 20 | local·antigravity는 예(추정), claude는 방향 없음 | 추정 |
| 21 | local·claude는 예, antigravity는 아니오 | 기울기(6에 종속) |
| 23 | local·antigravity는 예, claude는 방향 없음 | 기울기 |
| 2 | local·antigravity는 예, claude는 방향 없음 | 추정(약함) |
| 4 | local·antigravity는 예, claude는 방향 없음 | 기울기 |
| 5 | 바꾸는 쪽이 둘(local·claude), antigravity는 방향 없음. 최종 이름은 셋 모두 추정 불가 | 바꿈 기울기(강함), 이름 추정 불가 |

합계는 1 + 6 + 12 = 19로 명세 §1.3과 맞습니다. 제 판정이 추정인데 채택 규칙에 걸려 소유자 목록으로 가는 것은 11, 15, 20, 2입니다. 소유자가 확인만 하면 되는 후보로 따로 표시할 것을 권합니다.

## Fix spec (worker용, 문서 편집)

1. `packages/canard/schema-form/architecture/07-conclusions.md:205`에서 "주석 키워드(`title`, `readOnly` 등)"를 "주석 키워드(`title`, `description` 등)"로 바꿉니다. 검증은 아래 명령이 205행을 내지 않으면 됩니다.

   ```
   grep -n 'title`, `readOnly' 07-conclusions.md
   ```

2. 같은 파일 178행의 "주석 키워드는 먼저-승, 나머지는 나중-승으로 섞여 있다(`intersectSchema/utils/constants.ts:8-88`)"를 아래 문장으로 바꿉니다.

   > 먼저-승 목록(`intersectSchema/utils/constants.ts:8-20`)에는 주석 키워드와 함께 검증 계열 `additionalProperties`·`patternProperties`·`prefixItems`와 상태 키 `readOnly`가 섞여 있고, 특수 목록(`type`·`enum`·`required` 등)은 교차하며, 나머지는 나중-승이다(`processOverwriteFields.ts:22-23`)

3. 같은 파일 9절의 6(358행) 끝에 이 문장을 더합니다.

   > `allOf` 항목끼리 겹친 표준 `readOnly`가 먼저-승에서 OR로 바뀌는 것(4.26·4.27)

4. 원문 보존 파일(`raw-round10-derivation-*.md`)은 고치지 않습니다. 종합(`round-10-derivation.md`)에서는 §1의 비확인 인용 열 개를 쓰지 않고, 맞는 줄로 대신 인용합니다.

## 미확인

- 켜진 `then` 여럿이 같은 주석을 겹칠 때의 RJSF 6.6.1 동작(17)은 확인하지 못했습니다. RJSF의 `readonly` 전파(13)는 `SchemaField.js:77`과 `ObjectField.js:237` 두 줄만 확인했고 실행하지 않았습니다.
- 오늘의 `Merge`가 선언되지 않은 키에 쓴 `undefined`를 어떻게 다루는지(2)는 확인하지 못했습니다. 오늘 `src`에 `removeKey`는 없습니다.
- `&derived`의 식이 자기 값을 읽을 때의 뜻(11)은 확인하지 못했습니다.
- local의 E8a·E8b·E9는 대조군 하나로만 간접 확인했고, 따로 재현하지 않았습니다.
- codex `r10-output.txt`의 개별 ROW가 뜻하는 바는 검토하지 않았습니다. 재생성 결과가 같다는 것까지만 확인했습니다.
- 보조 과제(1번)의 세 서술은 판정 대상이 아니어서 인용 대조만 했습니다.
- 임시 트리는 `/tmp/claude-501/r10verify/`와 `/tmp/claude-501/r10full/`에 있습니다. 저장소 파일은 바꾸지 않았습니다.
