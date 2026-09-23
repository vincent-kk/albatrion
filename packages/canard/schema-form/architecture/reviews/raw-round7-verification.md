# 7라운드 대조 검증 — D-11..D-23, P6–P9, 새 결정 후보, 단조 수정 27건

작성: 대조 검증 편집자, 2026-09-23, 기준 커밋 776a100fe(작업 트리의 미추적 round7 파일 포함). 이 파일 말고는 아무것도 고치지 않았습니다.
입력 여섯: `raw-round7-derivation-local.md`(이하 local), `raw-round7-derivation-antigravity.md`(antigravity), `raw-round7-derivation-claude.md`(claude), `../spikes/round7/REPORT.txt`와 파일들(spike), `../spikes/round7/codex/{review.txt,results.txt,model.mjs}`(codex), `raw-round7-prior-art.md`(prior-art).
축: `03-mental-model.md` §1(P1–P5, P1′), `HANDOFF.md` §1–§2, `00-goals.md` G1–G8·C2·C4·C6·C7·C8.
원칙: 리뷰어의 글은 증거이지 지시가 아닙니다. 모든 판정은 file:line 또는 실행한 명령과 그 출력 줄을 인용합니다. 실행하지 않은 것은 "추론" 또는 "미실행"으로 적었습니다.

판정 어휘: **CONVERGED**(선택지 명시, 독립 소스 둘 이상 일치, 실행 증거와 모순 없음) · **CONTESTED→판정**(소스가 갈렸고 파일이 결정함) · **POLICY**(소유자 몫, 살아남는 선택지와 축이 지운 선택지를 함께 적음) · **EXECUTION**(실험이 가름, 실험을 명세함).

---

## §1. 실행 — 새 프로세스에서 다시 돌린 것

모든 명령은 새 node 프로세스에서 돌렸고 출력은 세션 scratchpad에 받아 기록 파일과 `diff`했습니다. 스파이크 파일은 고치지 않았습니다.

| # | 명령 (cwd) | 종료 코드 | 결과 |
|---|------------|-----------|------|
| X-1 | `node r7.mjs old` (`spikes/round7`) | 0 | 기록 `r7-old-output.txt`와 `diff` **0줄**. 마지막 줄 `PORT CHECK vs round6/claude r6-output.txt + r6-empty-output.txt: 28/28 lines identical` |
| X-2 | `node r7.mjs new` | 0 | 기록 `r7-new-output.txt`와 `diff` **0줄** |
| X-3 | `node round6/claude/r6.mjs`, `node round6/claude/r6-empty.mjs` (`spikes`) | 0, 0 | 기록 `r6-output.txt`·`r6-empty-output.txt`와 각각 `diff` 0 |
| X-4 | 편집자 스크립트: r6 두 출력에서 포팅 대상 E1·E2·E3·E4·E6·E7·E9·E10·E12·E13 줄을 뽑아 `r7-old-output.txt`에서 **순서 보존 부분열**로 찾음 | 0 | `ordered subsequence match 28 / 28`. r7의 자체 검사(`r7.mjs:263-281`)는 집합 포함 검사라 순서를 보지 않으므로 별도로 확인했습니다 |
| X-5 | `node proto/selfcheck-v4d.mjs` (`spikes/round7`) | **1** | `3 FAILURES` — A4b(출력 38행), A4c(39행), A4-cap(62행) |
| X-6 | `node proto/selfcheck-v4d.mjs old` | 0 | `all v4 scenarios passed` |
| X-7 | `node ../work-loop/proto/selfcheck-v4c.mjs` | 0 | X-6과의 `diff`: 첫 줄 `switches: {...}` 머리 1줄 추가와 `INFO A3-2b ... time=` 4줄의 시간값만 다름. 나머지 동일 |
| X-8 | `node model.mjs` (`spikes/round7/codex`) | 0 | 기록 `results.txt`와 `diff` **0**. 마지막 줄 `PASS: 16개 실험 그룹, 39개 원천 경로, 모든 자기 단언 통과` |

**E1·E2·E3·E12의 OLD 대 NEW (X-1, X-2 출력 줄).**

| 사례 | OLD | NEW | 판정 |
|------|-----|-----|------|
| E1(a) `load {}` | `x:"T"`, active `else`, rounds 2 | `x:"E"`, active `else`, rounds 3 | **사라짐** — `load {kind:"b"}`(`x:"E"`)와 같아짐 |
| E1(b) `load {}` | `x:"E"`, active `then` | `x:"T"`, active `then`, rounds 3 | **사라짐** — `load {kind:"a"}`(`x:"T"`)와 같아짐 |
| E2 순차 / batch | `x:"A"` / `x:"B"` | `x:"A"` / `x:"B"` | **남음** |
| E3 순차 / batch | `tgt:"f(x)"` / `tgt:"mine"` | 같음 (NATIVE, `EDGE_REF=entry, LOAD_EDGE=fire`) | **남음** |
| E12 `{zzz:1}` | active `["A"]`, emit `{"a":"A","zzz":1}` | active `[]`, emit `{"zzz":1}` | **사라짐** |

EXTRAS(X-2) 가운데 판정에 쓰는 줄: X2 `NEW entry-scope → inEntrySeq x:"B"`(진입 안 순차 = batch), 그 밖의 조합은 모두 `topLevelSeq x:"A"` 대 `batch x:"B"`. X3 `NEW settle-scope → inEntrySeq tgt:"f(y)"`(src는 x — N2), `NEW entry-scope → inEntrySeq tgt:"mine"`. X16 `OLD {"t":"from-C"} stable` 대 `NEW settle/entry-scope emit <undefined>, rounds 25, budget-exceeded, retractions 12`. X9h `ORDER_HINT=false`에서 두 이력이 같은 `F1`, `true`에서 갈림. D-17 재실행: 권장 리스너 `perTick reachAtWrite 13`, `perEntryFeedback reachAtWrite -1`, 되먹임 사슬 `perEntryReachAtFeedbackWave 25, perTickReachAtWave 25`.

**selfcheck NEW의 세 실패는 옛 규칙을 적은 검사입니다(X-5, `proto/selfcheck-v4d.mjs`를 읽음).**

- A4b(`selfcheck-v4d.mjs:277-287`): 단언문이 "the user cannot remove t — injectTo **re-derives it from the inactive c** (E7: declared behaviour)"입니다. 두 옛 규칙, 곧 레벨 발화와 꺼진 조각의 `default`에서 파생하는 것을 적었습니다. NEW에서는 그 앞의 로드부터 수렴하지 않습니다(X-5 출력 37행 `INFO A4b load: ... rounds=25 status=budget-exceeded`, X-6 같은 행 `rounds=3 status=stable`). 이것은 v4d의 결함이 아니라 P6가 들여온 설계상의 귀결이며 §4 D-24로 넘깁니다.
- A4c(`:288-299`): "a partial write un-17s the host but **derive re-injects 17 in round 2**"는 레벨 발화입니다. `adr/0007:79`(F11) "사용자의 부분 쓰기를 되돌리지 않는다"와 정면으로 반대입니다.
- A4-cap(`:488-495`): `write(n, 0)`은 커밋값 0과 같으므로 F11 아래에서 발화할 에지가 없습니다. 검사 입력이 레벨 발화를 전제했습니다. 같은 의도를 `write(n,1)`로 돌린 XA4는 `n 25, rounds 25, budget-exceeded`로 상한 동작이 유지됩니다(X-2).

**codex 모델의 주장 대 출력(X-8, `results.txt` JSON 줄).**

| id | review.txt의 주장 | results.txt | 일치 |
|----|-------------------|-------------|------|
| E1a·E1b | P6에서 empty = explicit | `p6.empty` = `p6.explicit` = `{kind:b,x:E}` / `{kind:a,x:T}` | 예 |
| E9 | 힌트 차이 해소, 고정점은 둘 | `p6.forward` = `p6.reverse` = `{a:1}` | 예 |
| E2·E3 | 남음 | `p6.sequential` ≠ `p6.batch` (E2 `x:A`/`x:B`, E3 `f(x)`/`mine`) | 예 |
| N1 | 결합 고정점 없음 | `p6.status "candidate-cycle"`, `fixedPoints: []` | 예 |
| N2 | 결합 고정점 둘 | `fixedPoints` 두 개(`{}` / `{x:1}, active F`) | 예 |
| N9 | 유일 해가 있으나 반복이 도달 못 함 | `p6 candidate-cycle`, `fixedPoints: [{x:2}, active two]` | 예 |
| N5 | mount·reset 기준 네 조합이 결과를 가름 | `mountAbsent f(x)`, `mountLoaded custom`, `resetRetained custom`, `resetEmpty f(x)` (old = p6) | 예 |
| N6 | active-only는 경로 차이, latent 쓰기는 전부 `f(1)` | `activeTarget.p6.sequential tgt:D` 대 `batch tgt:f(1)`; `latentTarget` 네 칸 모두 `f(1)` | 예 |
| N7 | last-wins에서 순차 A·배치 B, first-wins 배치 A | 해당 JSON 그대로 | 예 |
| N8 | 강한 P6만 해결 | `old c:f(1)` 대 `p6 c:mine` | 예 |
| C2 | 39경로 중 10경로 분할 차이 | `paths 39`, `divergentPaths` 10개 | 예 |

codex가 적은 "디스크를 바꾸지 않는 mutation probe 두 개"(`review.txt:247-252`)는 파일이 없어 재실행하지 않았습니다.

---

## §2. 판정표

| 항목 | 판정 | 선택지 | 일치하는 소스 | 반대하는 증거·소스 | 인용 |
|------|------|--------|---------------|--------------------|------|
| D-11 | CONVERGED(핵심) + **POLICY로 좁혀짐**(방아쇠) | 핵심: (a) 작성자 선언 쓰기로 원본을 쓴다. 남는 질문: "사용자가 파생 필드를 덮어쓸 수 있는가" — 에지(a1, 현재 코드) / 레벨(a2, 입력은 읽기 전용으로) | local(a), antigravity(a), claude(a 쪽 기울기) | 6라운드 전제 "`readOnly`로 막힌다"는 **거짓**(§3.2) | `03:10`, `03:12`, `adr/0006:46`, `AbstractNode.ts:541-551` |
| D-12 | CONVERGED | (a) 최종 활성 집합, 중간 주입 폐기 | local, antigravity, claude, spike(E1), codex(E1a·E1b) | 없음. 새 문제는 D-24..D-26으로 | X-2 E1, X-8 E1a·E1b, `03:25`, `03:45` |
| └ #61 | D-29로 분리 | — | local, claude, codex N7 | — | `adr/0005:109` |
| D-13 | CONTESTED→**(b)** | 기준점은 직전 커밋. 6라운드 (a)의 문자 그대로는 (b)와 같은 기준점이다. 배치 ≠ 순차는 설계의 귀결로 문서화 | local, claude, codex, spike | antigravity((a)가 E2·E3를 고친다) — **실행에 반증됨** | X-2 E2·E3·X2·X3, X-8 E2·E3·C2, `00-goals:86`, `adr/0008:72` |
| └ #17 | D-27로 분리(POLICY) | — | — | — | — |
| D-14 | CONVERGED | (a) `required`·`dependentRequired`를 읽지 않음. `adr/0005:81` 5단계의 "`required`에 포함"도 뺀다 | local, antigravity, claude | 없음 | `03:15`, `adr/0002:127`, `adr/0005:81` |
| └ 동점 | POLICY | 첫 분기 / 분기 없음 | local, claude(POLICY) | — | X-2 `X10/X12 TIE=none → e10 active []` |
| D-15 | **EXECUTION** | 출발점 실험 뒤 결정(§3.5). 실패하면 최소 출발점 + 개발 모드 경고(C2) + 프로덕션 신호는 D-22 | local, claude | antigravity(POLICY (a)/(c)) — 출발점 선택지를 보지 않음 | `adr/0002:68`, `03:34`, `03:85` |
| D-16 | CONVERGED | dev·prod 모두 커밋 → 검증 요청 → `onChange`. dev는 최외곽 진입 끝에서 throw | local, antigravity, claude | 6라운드 검증 #11의 처방("throw가 `onChange`를 취소")은 기각 | X-3 E5, `adr/0007:92`, `adr/0008:89` |
| D-17 | CONVERGED | (a) + 파동 예산 단위를 틱에서 "최외곽 진입의 되먹임 사슬"로 | claude, antigravity, local(방향 동의) | 없음. 바인딩 계층 확인만 미실행 | X-2 D-17 재실행 줄, `00-goals:65`, `03:13` |
| D-18 | POLICY | `disableDefaultInjection` / `disableLoadDefaults` / `disableInitialDefaults`; `mode` 대 `write`; 리터럴 대소문자. 지워진 것: `injectDefaults` 3상태 | local, antigravity, claude | — | `HANDOFF.md:40`, prior-art `:28`, `adr/0013:54` |
| D-19 | CONVERGED | 통째 교체. 통째로 받은 배열의 아이템과 `push()` 아이템은 로드 | local, claude, prior-art(폼 3종 침묵, `_.merge`만 인덱스 병합), RFC 7396 원문(편집자 확인) | antigravity(POLICY) — 모순을 제시하지 않음 | `00-goals:92`, `03:42`, `03:83-84`, RFC 7396 §2 |
| D-20 | POLICY(좁혀짐) | `selectBranch` / `setSelection`. 지워진 것: `select` 유지 | local, antigravity, claude | — | `00-goals:115`, `Form/type.ts:114`, prior-art `:73` |
| D-21 | CONVERGED("노드 없음") + CONTESTED→**`null`** | 터미널 아래 경로는 노드가 없고 `null`을 돌려준다 | local, claude(`null`); antigravity·6라운드(`undefined`) | 파일이 `null`로 결정(§3.4) | `AbstractNode.ts:253`, `Form/type.ts:116`, `findNode.ts:60,63,68,70,85` |
| D-22 | CONVERGED(최소) + POLICY(표면) | (c) 탈락. core 수준 관측(루트 `settle` 읽기 + `UpdateSettle`) 도출. `FormProps` 표면·이름·제출 차단은 정책. #19는 떼어 도출로 | local, claude, antigravity((c) 탈락) | — | `adr/0008:91`, `HANDOFF.md:37`, `00-goals:104` |
| D-23 | CONVERGED(사상) + POLICY(이름) | `getValue()` = 루트 emit, `node.value` = 투영 전 값, `enhancedValue`는 자리 없음. 이름과 updater 존속은 정책 | local, claude, antigravity | — | `03:9`, `adr/0006:48`, `AbstractNode.ts:718,734-740,1221` |
| P6 (i) | CONVERGED(전이 주입) | 전이 주입은 최종 형상 기준 | 전원 + spike + codex | 고정점 문제 발생 → D-24..D-26 | X-2 E1·X15, X-8 E1a·E1b·N8 |
| P6 (ii) | CONVERGED(재진술) | 이력은 방아쇠로만. F13 힌트는 **제거**(단서 복원은 구현 불가) | claude, local(재진술), spike X9h, codex E9 | local은 "정적 검사 가능한 조건으로 다시 쓰기"를 제안 — §3.8 | `03:83,85,86`, X-2 X9h |
| P6 (iii) | **기각** | 배치 ≡ 순차는 축 안에서 불가능 | local, claude, codex, spike | antigravity(재진술로 봄) — 반증됨 | X-2 E2·E3, X-8 C2 `divergentPaths` 10 |
| P7 | CONTESTED→**재진술**(예산 다섯) + 새 내용(로드 값 누락 신호) | — | local(귀결), claude(재진술) | antigravity(새 내용) — 근거가 ADR 문언뿐(§3.7) | `HANDOFF.md:37`, `adr/0008:62,93`, `00-goals:52` |
| P8 | CONVERGED(재진술) | — | local, antigravity, claude | — | `03:13`, `00-goals:115` |
| P9 | CONTESTED→**단사형은 재진술, 전단사형은 새 내용** | — | claude(단사 재진술), antigravity(구조는 재진술) | local(새 원리) | `00-goals:54`, `adr/0006:42` |

---

## §3. 갈린 곳의 판정

### 3.1 D-13 — 배치와 순차는 같아야 하는가

**판정: (b) "직전 커밋"이 기준점이고, 6라운드 (a) "이 정착의 시작 상태"는 문자 그대로 같은 상태를 가리킵니다. 배치와 순차의 값 차이는 설계의 귀결이며 G5 위반이 아닙니다. 6라운드 묶음 #5·#16의 "원리 위반(G5)·(P3)" 분류는 과장입니다.**

근거는 다음 넷입니다.

1. **배치의 정의가 한 쓰기 묶음이다.** G7 "배치는 … '쓰기 묶음 → 정착 1회 → 통지 1회'로 강해진다"(`00-goals.md:86`). `adr/0007:38` "배치는 표시 N번에 계산·커밋 1번, 통지 1번이다". `adr/0008:72` "`batch(fn)`은 fn 안의 쓰기를 표시만 하고, fn이 끝날 때 정착 한 번·파동 한 번을 낸다".
2. **정착은 언제나 직전 커밋에서 출발한다.** `adr/0008:62` "리스너 안의 쓰기는 즉시 동기로 정착·커밋되고". 그러므로 최상위 진입이든 리스너 쓰기든 "이 정착의 시작 상태"는 직전 커밋입니다. spike의 `EDGE_REF='commit'`과 round-6의 EMULATED 래퍼가 같은 결과를 냅니다(X-2 `X3c identical: true`).
3. **어떤 기준점도 E2를 고치지 못한다.** 실행 세 개가 같은 결론입니다. spike는 스위치 네 조합 모두 `topLevelSeq x:"A"` 대 `batch x:"B"`입니다(X-2 X2). codex는 E2·E3·N3·N4·N7에서 P6로도 차이가 남고, 39경로 중 10경로가 갈립니다(X-8 C2). 이유는 codex가 적은 세 성질의 양립 불가능입니다(`review.txt:265-268`). (1) 순차 정착마다 새 조각의 없음인 `default`를 커밋한다(`03:45`). (2) 커밋된 값은 뒤의 전환에서 덮지 않는다(`adr/0013:57` "있는 값은 고치지 않는다"). (3) 배치와 순차가 같다. (1)과 (2)는 축이고, (3)은 축이 아닙니다.
4. **G5는 타이밍에 관한 문장이다.** G5는 "같은 스키마와 같은 쓰기 순서는 **타이밍과 무관하게** 같은 상태를 낸다"(`00-goals.md:65`)입니다. `batch`는 타이밍이 아니라 호출자가 선언한 쓰기 단위입니다. 새 설계에는 틱이나 마이크로태스크로 쓰기를 묶는 장치가 없습니다(D-10, `adr/0008:89`). G5를 "배치로 묶든 아니든 같다"로 읽으면 1과 3 때문에 축이 자기모순이 됩니다. 새 설계에서 실제로 타이밍이 결과를 가르는 곳은 틱당 파동 상한(#18)뿐이고, 그것은 D-17이 고칩니다.

**antigravity의 반대는 실행에 반증됩니다.** antigravity는 "(b)는 G5·G7과 모순, (a)가 유일"(`raw-round7-derivation-antigravity.md:71-77`)이라 했지만, spike의 NEW 기본(`EDGE_REF=entry`)도 E2·E3를 그대로 냅니다(X-2).

**남은 변형 (a′) "최외곽 진입의 시작 상태"도 탈락합니다.** spike가 이것을 `EDGE_REF='entry'`로 구현했습니다. 이 변형은 리스너 쓰기처럼 **한 진입 안의** 순차에서만 (b)와 달라집니다.
- 자동 쓰기 로그를 정착 범위로 두면 낡은 파생값이 남습니다. X3 `NEW settle-scope → src x, tgt f(y)`는 직전 커밋 기준(`f(x)`)과도 배치(`mine`)와도 다릅니다(spike N2).
- 로그를 진입 범위로 두면 한 진입 안에서 배치와 같아집니다(X2 `inEntrySeq x:"B"`, X3 `tgt:"mine"`). 그 대신 이미 커밋·통지된 자동 쓰기를 뒤 정착이 철회합니다(spike N3). 이는 수락 결정 "core는 받은 값을 고치지 않는다"(`adr/0013:24`, `HANDOFF.md:26`)와 G5 "원인과 결과의 순서가 뒤집히지 않는다"(`00-goals.md:68`)에 걸립니다.

**6라운드 묶음 #5에 대한 귀결.** 6라운드 대조 검증 자신은 #5의 처방을 "`batch`의 JSDoc과 `adr/0008:72`에 '배치는 정착 횟수를 바꾸므로 전이 주입의 결과가 달라질 수 있다'를 적는다"(`raw-round6-verification.md:17`)로 두었습니다. #16은 "F9의 문장을 좁히고 배치가 에지를 삼킨다는 점을 F11 옆에 적는다"(`:28`)였습니다. 종합 문서가 이 둘을 "원리 위반 (G5)"·"(P3)"으로 올리고(`round-6-coherence.md:40-41`) D-13 (a)가 G5를 회복한다고 권고했습니다(`:180`). 그 격상과 권고가 과장이었습니다. #5·#16은 "설계 귀결, 문서화"로 되돌려야 합니다.

**소유자에게 남는 것은 선택이 아니라 확인 하나입니다.** G5의 "같은 쓰기 순서"가 정착 단위이고 `batch`는 쓰기 하나로 센다는 읽기에 동의하는지입니다. `00-goals.md:3`이 목표 전체를 소유자 확인 대상으로 두었기 때문입니다.

### 3.2 D-11 — 전제 확인과 좁혀진 질문

**claude의 코드 인용을 모두 열어 확인했습니다.** 결과는 §6 표의 C1–C6입니다.

- 파생 노드의 `readOnly`는 자기 식에서만 옵니다. 기본값은 `false`(`ComputedPropertiesManager.ts:92`)이고, `__readOnly__`가 있을 때만 갱신됩니다(`:208`). 식은 `'readOnly'` 이름으로만 찾습니다(`:260`, `checkComputedOptionFactory.ts:21-28`). `derived`는 별도 함수입니다(`ComputedPropertiesManager.ts:265`).
- `grep`으로 결합을 찾았으나 없습니다. `readOnly`를 세우는 곳은 `ComputedPropertiesManager.ts:208` 하나이고, `isDerivedDefined`·`getDerivedValue`를 쓰는 파일 어디에도 `readOnly` 대입이 없습니다.
- 입력은 `readOnly`나 `disabled`일 때만 막힙니다(`SchemaNodeInput.tsx:51`).
- claude가 "미확인"으로 남긴 `__updateComputedProperties__` 호출처를 `grep`으로 닫았습니다. 호출처는 `AbstractNode.ts:532`(의존 값 변화), `:556`(초기화), `:587`(재귀), `BranchStrategy.ts:200`(호스트 자신, `Isolate`), `:512`·`:578`(분기 전환)뿐입니다. 사용자 입력 경로에는 없습니다.

그러므로 6라운드 선택지 (a)의 괄호 "사용자 입력은 `readOnly`로 막힌다"(`round-6-coherence.md:178`)는 현재 코드에서 거짓입니다.

**핵심 질문 "원본을 쓰는가"는 (a)로 도출됩니다.** 두 선택지가 축 문장을 고치는 무게가 다르기 때문입니다.
- (a)는 P2의 **열거**(`03:10` "주체는 넷뿐")에 하나를 더합니다. 같은 줄의 머리 "원본은 호출자와 작성자만 쓴다"와 `03:66` "원본을 쓰는 것은 파생과 전이뿐"이 이미 그것을 품고 있습니다.
- (b)는 P4의 **정의**를 바꿉니다. "방출 값은 원본과 형상의 투영이다"(`03:12`)와 불변식 "부모의 `emit` = 활성 자식 `emit`의 투영"(`adr/0006:46`)이 깨집니다. claude도 인정했듯 (b)이면 가드가 파생값을 보아야 하므로 파생 계산을 호스트 바퀴 안으로 옮겨야 합니다(`03:74`).

**방아쇠(레벨 대 에지)는 축이 정하지 못합니다.** local은 G4 "하나의 개념에는 하나의 장치"로 에지 파생을 지웁니다. 에지 파생은 `injectTo`와 같은 장치가 되기 때문입니다(`raw-round7-derivation-local.md:79`). claude는 G3 "같은 개념을 평가하는 장치는 하나다"로 레벨 파생을 지웁니다. 파생과 `injectTo`는 한 개념이므로 같은 발화 규칙이어야 한다는 것입니다(`raw-round7-derivation-claude.md:84`). 같은 목표 문장이 반대 방향으로 쓰였으므로 그 문장은 결정하지 않습니다.

- 레벨(a2)은 T-2 "타이핑은 입력을 리마운트하지 않는다"(`04-inherited-constraints.md:10`)와 부딪칩니다. 단, 파생 노드의 입력을 읽기 전용으로 두면 부딪치지 않습니다.
- 에지(a1)는 오늘 코드의 동작입니다. 사용자의 편집이 다음 의존 변화까지 남습니다(`AbstractNode.ts:526-532,541-551`).

**증거 하나를 더합니다.** 공개 문서는 레벨 쪽을 약속합니다. `docs/agents/skills/schema-form-skill/knowledge/expressions.md:47`에는 "`derived` continuously computes the field's value … and **overwrites user edits**"라고 적혀 있고, `inject-to.md:3`은 둘을 "once per change … stay user-editable" 대 "continuous and overwrites edits"로 가릅니다. 코드는 에지입니다. 어느 쪽을 고르든 둘 중 하나는 이주 안내(C8) 대상입니다.

**결론: D-11은 "원본을 쓴다"까지 도출되고, 소유자에게는 "사용자가 파생 필드를 덮어쓸 수 있는가"만 남습니다.** 이 질문은 D-27(로드 때 발화)과 한 규칙으로 정해야 합니다(G4 `00-goals.md:54`, `03:84`).

### 3.3 D-19 — G8과 선행 사례가 도출하는가

**판정: 도출됩니다(통째 교체).**

- G8은 "독자적인 방식은 보편적인 방식이 목표를 해칠 때에만 택한다"(`00-goals.md:92`)입니다.
- JSON 병합 표준 RFC 7396을 편집자가 직접 받아 확인했습니다. 원문은 "it is not possible to patch part of a target that is not an object, such as to replace just some of the values in an array"(§2, 원문 189-193행)이고, 이 RFC는 7386을 대체합니다. local은 7396, claude는 7386을 적었는데 규칙은 같습니다. 둘 다 원문을 읽지 않았다고 스스로 밝혔습니다.
- prior-art는 RHF·Formik·Final Form이 배열 인덱스 병합을 문서화하지 않음을 인용으로 보였습니다. `_.merge`만 재귀 병합입니다(`raw-round7-prior-art.md:38-46`).
- 통째 교체가 해치는 목표는 없습니다. 아이템 identity(R13)는 `Overwrite`에도 똑같이 걸린 미결입니다(`adr/0011:89`).

**antigravity의 POLICY는 모순을 제시하지 않습니다.** 근거는 `03:99`가 이 질문을 "원리가 아직 답하지 않은 것"에 올렸다는 사실뿐입니다(`raw-round7-derivation-antigravity.md:193`). 목록에 올라 있다는 것은 선택지가 축과 양립한다는 증거가 아닙니다.

**아이템이 로드인지도 도출됩니다.** 통째로 받은 배열의 아이템과 `push(v)` 아이템은 값을 통째로 받은 노드입니다. 따라서 `03:42`, `03:83` "전체 교체는 전체 교체다", `03:84`와 G4 "특수 경로가 없고"(`00-goals.md:54`)에 따라 로드 계약이 듭니다. local과 claude가 일치합니다(local 확신 중, claude 높음). E7의 `items[0].x "D"`는 결함이 아니라 규칙대로입니다(X-2 E7 NEW 동일).

### 3.4 D-21 — `null`인가 `undefined`인가

**판정: `null`입니다. 파일이 정합니다.**

- 노드 조회의 현행 어휘는 `null`입니다. `AbstractNode.find(pointer?): SchemaNode | null`(`AbstractNode.ts:253`), `FormHandle.findNode: Fn<[path], SchemaNode | null>`(`Form/type.ts:116`), 그리고 `findNode`는 못 찾으면 `null`을 돌려줍니다(`findNode.ts:60,63,68,70,85`).
- `adr/0011:88`은 계약을 "터미널 아래 경로는 **없음**인가 별칭인가"로만 묻고 반환 표현을 정하지 않습니다.
- antigravity와 prior-art가 근거로 든 lodash `_.get`의 `undefined`(`raw-round7-prior-art.md:82-84`)는 **값** 읽기의 관례입니다. **노드** 조회에 관한 것이 아닙니다.
- 같은 개념("노드 없음")에 표현 둘을 두면 G4(`00-goals.md:52`)에 어긋납니다.

그러므로 6라운드 권고의 `undefined`(`round-6-coherence.md:188`)는 `null`로 고칩니다.

### 3.5 D-15 — EXECUTION인가 POLICY인가

**판정: EXECUTION입니다.** 출발점이라는 선택지가 P3와 양립하기 때문입니다.

- 원본은 상태이지 이력이 아닙니다("상태는 `raw`·`selection`·`extras` 셋뿐" `03:34`). `adr/0002:68`이 금한 것은 **직전 커밋의 활성 집합**을 읽는 것입니다. 원본이 지지하는 출발점은 그것을 읽지 않습니다.
- 축이 고정한 것은 "출발점 고정"뿐이고(`03:85`), 어느 출발점인지는 D-2 도출의 설계 선택입니다. D-2는 확정 대기입니다(`HANDOFF.md:37`).
- antigravity의 POLICY((a)/(c))는 출발점 선택지를 보지 않았습니다.
- 6라운드가 (a)의 근거로 든 "P1과 어긋난다"(`round-6-coherence.md:182`)는 성립하지 않습니다. 최소 고정점에서는 가드와 검증기가 같은 방출 `{}`를 보므로 P1이 지켜집니다. 잃는 것은 판정이 아니라 데이터입니다(claude §5).

**실험 명세.** 두 변형을 모두 돌려야 합니다. 편집자가 E9를 손으로 따라가 보니(추론, 미실행) 두 변형의 결과가 갈렸기 때문입니다.
- S1(local): 출발점에 "선언한 키가 원본에 있는 조건부 조각"을 더합니다. E9 `{a:1,b:2}`에서 A와 B가 모두 켜진 채 출발하고, 가우스-자이델 첫 바퀴에서 A가 꺼지고 B가 남아 `{b:2}`에 정착합니다. 지금의 `{a:1}`과 다릅니다.
- S2(claude): 최소 고정점에 이른 뒤, 선언 키가 원본에 있는 꺼진 조각을 검증기 가드로 한 번 켜 봅니다. E9에서는 B의 가드가 거짓이라 `{a:1}`이 유지됩니다.

| 항목 | 내용 |
|------|------|
| 대상 | `spikes/round7/proto/loop-v4d.mjs`의 사본에 스위치 `START_SET = 'minimal' \| 'S1' \| 'S2'`를 더한다(P6 스위치와 함께 돌려야 D-24..D-26과의 상호작용이 보인다) |
| 사례 | E8(자기 순환 `{x:'v'}`), E8b(상호 순환 `{a:1,b:2}`), E9, E1, E12–E14, X15, X16, codex N1·N2·N9 등가 스키마 |
| 회귀 | `selfcheck-v4d.mjs`(NEW 기준 예상 실패 A4b·A4c·A4-cap 외 0), `loop-v4b`의 기존 63 + D-8의 14 시나리오 |
| 비용 | `run-cost.sh`의 11개 케이스와 `adr/0007:113-119`의 키 입력·판별식 뒤집기·조건 200개. 케이스마다 새 프로세스, 5회, 중앙값의 중앙값 |
| 채택 기준 | E8 → `{x:'v'}`, E8b → `{a:1,b:2}`, **E9 불변**(`{a:1}`), 회귀 0, 호스트 바퀴가 "조건부 조각 수 + 1" 안, 비용이 5회 폭 안 |
| 실패 기준 | 회귀가 나거나, 사용자가 끈 조각이 잠복 원본만으로 되살아나는 사례(local), 또는 E9가 바뀜 |
| 실패 시 | 최소 출발점 유지. 개발 모드 경고는 C2(`00-goals.md:103`)로 도출. 프로덕션 신호는 D-22 채널. `adr/0013:63`("형상은 그 값으로 수렴한다")과 `adr/0007:57`을 고친다 |

주의할 연결이 하나 있습니다. S2를 채택하면 **원본으로만 지탱되는** 조각은 켜지지만, D-25는 **`default`로만 지탱되는** 조각을 켜지 않습니다. 이 비대칭은 원본은 상태이고 `default` 주입은 사건이라는 차이(`03:34`, `03:86`)로 정당화됩니다. 그래도 소유자가 한 문장으로 확인해야 합니다.

### 3.6 D-17 — 진입 사슬 단위는 도출인가

**판정: 도출입니다(CONVERGED).**

- G5 "타이밍과 무관하게"(`00-goals.md:65`)에 따라 틱 단위 예산은 탈락합니다. 같은 쓰기 순서가 한 틱에 몰리느냐로 결과가 갈리기 때문입니다.
- P5 "core는 … React도 … 모른다"(`03:13`)에 따라 "React 레이아웃 이펙트를 세기 위해"(`round-4-spec.md:148`)라는 틱 단위의 이유도 탈락합니다.
- (b) 미루기는 G5의 "동기"와 `adr/0008:68`에 걸리고, (c)는 문턱만 옮깁니다.

**spike 실행이 이 판정을 지지합니다(X-2 D-17 줄).**
- 권장 스토어 리스너가 있을 때 틱 단위는 13번째 쓰기에서 상한에 닿고 그 리스너 쓰기부터 거부합니다.
- 진입 사슬 단위는 30회 내내 닿지 않습니다.
- 진짜 되먹임 사슬(리스너가 자기를 30번 다시 씀)은 두 셈법 모두 25번째 파동에서 잡습니다.

따라서 단위를 바꿔도 core가 막아야 할 순환은 여전히 막힙니다.

**local의 EXECUTION은 바인딩 계층의 질문으로 줄어듭니다.** React 이펙트를 거친 진입 간 순환이 React 자신의 한도에 막히는지는 아무도 실행하지 않았습니다. 그 답은 바인딩 계층에 틱 단위 가드를 둘지만 정하고, core 규칙을 바꾸지 않습니다(claude §7). local이 우려한 T-4의 문제 서술은 "`injectTo`·derived의 되먹임이 탭을 멈춘다"(`04-inherited-constraints.md:12`)입니다. 이것은 진입 안의 되먹임이므로 라운드 상한과 진입 사슬 파동 상한이 잡습니다.

**남는 것은 둘이고 둘 다 도출입니다.**
- 되먹임 쓰기의 프로덕션 거부는 `adr/0013`의 예외 목록에 신호와 함께 적어야 합니다(M1, C2).
- spike OPEN-4의 경계(파동 25 대 26)는 ±1의 문언 문제이고 단조 수정입니다. 같은 틱의 뒤 사용자 쓰기 문제는 진입 사슬 단위에서 사라집니다.

### 3.7 P7 — 새 원리인가

**판정: 예산 다섯에 대해서는 재진술입니다.**

- 관측 요구 자체는 이미 축과 원장에 있습니다. D-2 "정착 상태 칸과 루트 통지로 프로덕션 관측"(`HANDOFF.md:37`), 파동 상한의 "`settle` 기록"(`adr/0008:62`), `onchange-cap-exceeded`(`adr/0008:93`)입니다.
- 이것을 한 칸에 같은 모양으로 두는 것은 G4 "하나의 개념에는 하나의 장치"(`00-goals.md:52`)의 적용입니다.
- antigravity가 "새 내용"이라 한 근거는 "축은 `'stable'|'budget-exceeded'`만 규정"(`raw-round7-derivation-antigravity.md:295`)입니다. 그런데 인용한 `adr/0006:34`는 ADR 문언이고 축이 아닙니다. `03:28`도 "정상 / budget-exceeded"라는 서술일 뿐 값 집합을 닫지 않습니다.
- `budget-exceeded:<which>`라는 표기는 설계입니다(local).

**"로드한 값이 방출에서 빠지면 같은 칸이 신호"라는 절은 예산이 아니므로 새 내용입니다.** 이것은 D-15에 달립니다(local과 claude 일치).

### 3.8 P6 세 부분

**(i) 최종 형상 기준의 전이 주입은 CONVERGED입니다.**
- 실행이 E1을 없앱니다(X-2 E1, X-8 E1a·E1b). `injectTo`에도 적용하면 X15의 숨은 `d(X)`도 사라집니다(X-2 X15). codex N8은 `default`만 되돌리는 약한 해석이 부족함을 보입니다(X-8 N8).
- 비용은 spike가 측정해 5회 폭 안이라고 적었습니다(`REPORT.txt` §6). 편집자는 비용을 다시 재지 않았습니다.
- 대가도 있습니다. 자동 쓰기가 가드를 뒤집으면 "최종 형상"은 자동 쓰기와 함께 푸는 고정점이 되어, 없거나(N1·X16) 여럿이거나(N2) 반복으로 닿지 않을(N9) 수 있습니다. §4 D-24..D-26이 이것을 다룹니다.

**(ii) "이력은 방아쇠로만"은 재진술입니다.** 도출표가 이미 그렇게 씁니다(`03:83`, `:85`, `:86`).

F13 힌트의 처방은 편집자가 정했습니다. 6라운드 §7 205행의 처방은 "고정점이 유일한 스키마에서는"이라는 단서를 복원하는 것이었는데, 이 조건은 런타임에 판정할 수 없습니다. 가드의 뜻을 폼이 해석해야 하기 때문입니다(`03:15`, `adr/0005:50-52` "가드가 무엇을 읽는지는 기본적으로 뽑지 않는다").
- local은 이 조건을 "부정을 포함한 순환이 없는 호스트"라는 정적 조건으로 다시 쓰자고 했습니다. 그러나 그것도 가드 안의 `not`/`required` 구조를 읽어야 하므로 같은 문제가 남습니다.
- 도출되는 처방은 힌트 제거입니다. spike의 `ORDER_HINT=false`가 두 이력의 결과를 같게 만들고(X-2 X9h), codex P6도 인증 없는 힌트를 쓰지 않습니다(X-8 E9).
- 힌트를 없애면 역순 사슬에서 비용이 듭니다(`adr/0002:74` N+1바퀴). 되살릴지는 Q15에서 측정으로 정합니다.

**(iii) "배치 ≡ 순차"는 기각입니다.** 근거는 §3.1입니다.

### 3.9 D-12의 #61

**판정: D-12 (a)로 "승자는 최종 형상의 유효 스키마가 가진 `default`"까지 도출되고, 먼저-승 대 나중-승만 정책으로 남습니다.**

- local과 claude는 이 도출에서 일치합니다. 주입값이 `node.jsonSchema`의 `default`와 다르면 한 개념에 두 장치가 생기기 때문입니다(G3 `00-goals.md:48`, G4 `:52`).
- codex N7이 같은 방향을 실행으로 보입니다. 승자를 최종 활성 선언 전체에서 고르고, 순서 규칙은 따로 정해야 합니다.
- 먼저-승 대 나중-승은 이미 `adr/0005:109`가 소유자 몫으로 남긴 정책입니다. 현재 코드는 먼저-승입니다(`FIRST_WIN_FIELDS`에 `'default'`, `intersectSchema/utils/constants.ts:13`). 프로토타입은 나중-승입니다(`round-4-spec.md:36`, `LV4C:1121`).
- 이것을 §4 D-29로 둡니다.

---

## §4. 새 결정 후보 (§6에 없던 것)

번호는 잠정입니다. "도출"은 축에서 닫힌다는 뜻이고, "소유자"는 정책이라는 뜻입니다.

| id | 질문 | 출처 | 분류 | 근거와 선택지 |
|----|------|------|------|---------------|
| D-24 | **자동 쓰기를 포함한 고정점이 없을 때** (자기 가드를 끄는 `default`) | codex N1, spike X16·selfcheck A4b | **도출** | `adr/0007:57` "고정점이 없는 스키마는 지원 범위 밖"과 D-2에 따라 지원 밖이고 `budget-exceeded`입니다. 행동 변화가 있습니다. v4c에서 `stable`이던 스키마가 예산 초과가 됩니다(X-2 X16). 이 사실은 이주 안내(C8)에 올립니다 |
| D-25 | **고정점이 여럿일 때 무엇을 고르는가** (자기 가드를 켜는 `default`) | codex N2 | **도출** | 결과는 B(명시적 쓰기를 표시한 원본)에서 시작한 반복의 극한입니다. `default`는 "조각이 꺼짐 → 켜짐으로 바뀐 직후"의 사건(`03:45`, `03:86`)이므로 자기 조각을 켜는 원인이 될 수 없습니다. 자기 지지 `default`(N2의 `{x:1}`)는 상태에서 오지 않으므로 P3(`03:11`)가 배제합니다. codex도 그 seed를 "사용자 쓰기나 허용된 이력 힌트가 아니다"로 적었습니다(`review.txt:147`). D-15 S2와의 비대칭은 §3.5 끝을 보십시오 |
| D-26 | **해는 있으나 반복이 닿지 못할 때** | codex N9 | **도출(D-25에 종속)** | N9의 유일한 해 `{x:2}`는 자기 지지 `default`이므로 D-25에서 허용되지 않습니다. 따라서 N9는 D-24의 경우가 됩니다. `adr/0007:57`의 지원 범위를 "고정점의 존재"가 아니라 **"B에서 시작한 반복이 예산 안에 수렴하는가"**로 다시 적어야 합니다. 그래야 판정이 절차로 정해지고 지수 탐색이 필요 없습니다(G6) |
| D-27 | **마운트·`reset`에서 `injectTo`가 발화하는가** (#17, D-13에서 분리) | 6라운드 #17, codex N5, spike OPEN-2·X3L | **소유자** | 살아남는 것은 셋입니다. `fire`(전체 교체 때 모두 발화, F4의 대칭, `round-4-spec.md:34` "`reset()`은 `injectTo`를 일으킨다"), `skip`(로드한 대상 값 유지), `fill`(없음인 대상만, 로드 계약과 같은 모양). 셋 다 이력과 무관합니다(X-2 X3L). **지워지는 것**은 둘입니다. `ref`는 결과가 리셋 전 이력에 달리므로 P3에 걸립니다(X-2 X3L `ref: resetWhereSrcUnchanged custom` 대 `afterReset f(x)`). 마운트·노드 reset·`FormHandle.reset`에 서로 다른 규칙을 두는 것(현재 코드, claude §3 #17)은 G4 `00-goals.md:54`와 `03:84`에 걸립니다. claude는 `fill`/`skip` 쪽으로 기웁니다(`03:82` "있는 값을 고치지 않는다"). D-11의 방아쇠와 한 규칙으로 정합니다. "무엇이 로드인가"(push, `injectTo`가 만든 전체 교체)는 D-19의 도출을 따릅니다 |
| D-28 | **비활성 대상에 `injectTo`가 쓰는가, 대상이 켜지면 다시 발화하는가** | codex N6 | **도출(확신 중)** | 비활성 대상에도 씁니다(잠복 원본). 근거는 셋입니다. `03:43`이 `injectTo`를 "전체 교체(대상에) … 위와 같다"로 호출자의 전체 교체와 같게 두고, 호출자의 전체 교체는 "꺼진 조각의 노드까지 포함해 모든 노드의 원본으로 분배"됩니다(`adr/0013:63`). 비활성화는 쓰기가 아닙니다(`03:88`). 대상 활성화는 원천이 바뀐 것이 아니므로 재발화하지 않습니다(F11). 이 규칙이면 N6의 네 경로가 모두 `f(1)`로 같아집니다(X-8 N6 `latentTarget`). 소유자 확인을 권합니다 |
| D-29 | **같은 자식에 여러 조각의 `default`가 있을 때 승자** (#61) | 6라운드 #61, codex N7 | **갈림**: 기준은 도출, 순서는 소유자 | 최종 형상의 유효 스키마 `default`(§3.9). 먼저-승(현재 코드·`adr/0005:109`의 관찰) 대 나중-승(프로토타입·`round-4-spec.md:36`)은 `adr/0005:109`의 기존 소유자 질문입니다. 어느 쪽이든 배치 ≠ 순차는 남습니다(X-8 N7) |
| D-30 | **자동 쓰기 로그의 수명** | spike OPEN-1 | **도출** | 정착 범위입니다. D-13 (b)와 함께 쓰면 진입 안 순차가 v4c와 같습니다(X-2 X2·X3 `NEW settle-scope, EDGE_REF=commit`). 진입 범위는 통지된 값을 철회하므로(spike N3) `adr/0013:24`와 `00-goals.md:68`에 걸립니다 |
| D-31 | **수렴하지 않을 때 무엇을 커밋하는가** | spike OPEN-3 | **소유자** | 살아남는 것은 둘입니다. 마지막으로 완료된 라운드(E7 규칙 `adr/0007:41`과 같은 모양, G4 쪽 기울기)와 자동 쓰기를 모두 뺀 B입니다. B는 P6 (i)의 "자동 쓰기는 최종 형상의 함수" 쪽으로 기웁니다. 앞쪽은 최종 형상이 원하지 않는 자동 쓰기를 커밋할 수 있습니다(X-2 X16 `raw {}` · `active [then]`). **지워지는 것**: 커밋 거부(codex 모델의 `committed:null`)는 `adr/0013:27` "형상 계산이 수렴하지 않을 때도 값은 받아들인다"와 `adr/0007:9`에 걸립니다. 상태 이름은 P7 표기와 묶습니다 |
| D-32 | **`extras`의 방출 순서** | 6라운드 #44·C22, local §5 | **소유자** (Q14와 함께) | 삽입 순서를 상태로 볼지(순서 있는 칸), 결정적 정렬로 둘지의 모델링 선택입니다. local은 "원본으로 받은 객체의 순서는 상태, 그 뒤 추가된 키의 순서는 이력"이라 봅니다. 비용(G6)도 함께 봐야 합니다. 축이 지우는 선택지는 없습니다 |
| D-33 | **"값이 바뀌었다"의 비교 기준** (`injectTo` 에지와 `onChange` 공통) | spike OPEN-6·N4, 6라운드 #62(§7 216행) | **도출(값 비교) + 비용은 EXECUTION** | 원본을 바꾸지 않은 사건이 자동 쓰기를 일으키면 결과가 이력에 달립니다(claude §3 5, `03:83`). `adr/0008:103` "같은 값 다시 쓰기 +0"과 D-10의 "한 수정에 한 통지"(`03:91`)도 값 비교 쪽입니다. G4에 따라 두 곳의 판정은 한 장치입니다. 객체 원천의 deepEqual 비용은 G6로 측정해야 합니다. 현재 코드는 같은 값을 다시 써도 `injectTo`가 발화합니다(claude가 문자열·객체 노드에서 읽기로 확인, 수·불리언·null 노드는 미확인) |
| D-34 | **원천이 비활성일 때 `injectTo`가 읽는 값** | spike OPEN-7, X15 | **도출(확신 중)** | F11은 "원천의 **emit**"(`adr/0007:79`)이고, 비활성 노드는 방출에서 빠집니다(P4 `03:12`). 따라서 없음으로 읽습니다. v4c·v4d는 활성 여부를 무시하고 리프 emit을 읽습니다. spike는 투영값을 읽어도 X16에 고정점이 없다고 추론했습니다(미실행) |
| D-35 | **FE 전용 키의 이름과 `computed` 컨테이너의 존폐** | claude §15 208행, local §4 | **소유자** | `adr/0003:30`이 미결로 둔 이름·구조 결정인데 §6에 D 항목이 없습니다. §7 208행이 이것을 전제합니다 |
| D-36 | **공개 쓰기·배열 API 목록** (`write`, `removeKey`, `push`/`remove`/`update`/`pop`/`clear`) | local §4, claude §15 218·219행 | **소유자(작음)** | 목록을 확정하는 일은 API 표면 결정입니다. `removeKey`는 잔여 키 UI 미결(`03:98`)과 묶여 있습니다 |

---

## §5. 단조 수정 27건 — 대조 결과

표기: **free**는 지금 적용할 수 있습니다. **free\***는 §2에서 CONVERGED된 D-nn의 결론대로 지금 적을 수 있습니다(소유자가 도출 묶음을 받는 전제). **blocked**는 적힌 D-nn이나 축 문장 확인을 기다립니다. 행 번호는 `round-6-coherence.md`의 줄입니다.

| 줄 | 대상 | 판정 | 이유 |
|----|------|------|------|
| 198 | `adr/0008:74` 진입 깊이 | free | `round-4-spec.md:151`(F18)의 같은 문장도 함께 고칩니다(claude) |
| 199 | `adr/0001:32` 스탬프 | free | — |
| 200 | `adr/0004` 에러 라우팅 + 폼 수준 sink | blocked by **D-22**(표면) + Q12 | sink의 모양이 D-22의 표면입니다. 라우팅 규칙은 Q12 결정입니다 |
| 201 | `adr/0006:34` `settle.status` 값 집합 | blocked by **D-15**, **D-31** | 예산 다섯의 목록은 P7 재진술로 적을 수 있으나, 예산 아닌 신호(D-15)와 비수렴 상태(D-31)가 값 집합을 바꿉니다 |
| 202 | `03:10`·`03:45` P2 행 | blocked by **축 문장 확인** | 내용은 D-11 핵심(원본을 쓴다)으로 정해졌습니다. P2는 "명시적 답 대기"인 축 문장입니다(`03:107`) |
| 203 | 쓰기 표에 `selection`·`extras` 열 | blocked by **D-20**, **D-32** | 이름(D-20), `extras` 순서(D-32), 부분 쓰기가 분기를 켜는가(U-2, `adr/0002:163`) |
| 204 | `round-4-spec.md:36` 대 `adr/0005:109` | blocked by **D-29** | 기준은 도출됐고, 먼저/나중은 정책입니다 |
| 205 | `adr/0002:72`·`adr/0007:47` F13 | free (**처방 교체**) | "고정점이 유일한"의 복원은 런타임에 판정할 수 없습니다. P3에서 도출되는 처방은 힌트 제거입니다(§3.8, X-2 X9h) |
| 206 | `adr/0007:57` 문장 | blocked by **D-15** | 양의 순환의 서술은 D-15에 달립니다. 지원 범위를 절차적으로 다시 적는 것은 D-24·D-26(도출)으로 지금 할 수 있습니다 |
| 207 | `adr/0003:25` `&pristine` | free (존속) | G2 "표현력은 줄어들지 않는다"(`00-goals.md:38`)와 C6(`:107`)으로 존속이 도출됩니다(claude). local의 "선택"은 반대 근거를 대지 않았습니다 |
| 208 | `adr/0003:30-32` `&` 이주 목록 | blocked by **D-35** | 이름·구조 결정이 §6 밖에 있습니다 |
| 209 | `00-goals.md:59` G4 좁히기 | blocked by **축 문장 확인** | 목표 문장의 변경입니다(`00-goals.md:3`) |
| 210 | `02-target-overview.md` 다시 그리기 | blocked by **D-15**, **D-27**, **D-31** (순서) | 전이·에지·예산의 그림이 들어가므로 정책 항목이 닫힌 뒤 한 번에 그립니다 |
| 211 | 이주 충격 목록 | blocked by **D-18**, **D-20**, **D-23**(이름) | `find`(D-21)·배열 `Merge`(D-19)·X16의 행동 변화(D-24)·파생 문서와 코드의 어긋남(§3.2)은 지금 적을 수 있습니다 |
| 212 | `03:56`·`03:57` | free | — |
| 213 | `adr/0007:41` 파생 상한 throw | free\* (D-16) | throw는 검증 요청·`onChange` 뒤, 최외곽 진입 끝에서 |
| 214 | `open-questions.md:66` Q9 | free | — |
| 215 | `adr/0007:55` 대 Q14 | 부분: "잠정" 표시는 free, 닫기는 blocked by **D-32** | — |
| 216 | `adr/0008:91` 참조 대 값 비교(#62) | blocked by **D-33**(비용 측정) | 방향은 값 비교로 도출됩니다. 비용 측정이 남았습니다 |
| 217 | `adr/0013:42`·`adr/0006:58` 주입 시점 | free\* (D-12) | "전체 교체 뒤 정착의 **최종** 활성 집합에서, 호스트가 null이어도"(local 문구 + `round-4-spec.md:38`) |
| 218 | `adr/0008:91` `write`·`removeKey` | blocked by **D-36** | — |
| 219 | 배열 API 어휘 | 부분: 합집합으로 한 곳에 적기는 free, 목록 확정은 blocked by **D-36** | — |
| 220 | `adr/0002:26`·`03:15` P1′ 괄호 | blocked by **축 문장 확인** | 소유자 원칙 문장입니다. 내용은 `adr/0005:90`의 소유자 인용이 받칩니다 |
| 221 | `03:28` | free\* (D-16, D-22 최소) | "루트 `settle` 읽기와 `UpdateSettle` 구독으로 관측, `onChange`로는 보이지 않을 수 있다" |
| 222 | `adr/0013:59` D-7 범위 | free | 수락된 결정의 문언을 넓히므로 소유자에게 알립니다(claude) |
| 223 | `03:41`·`adr/0013:55` | free\* (D-19) | "`Merge`는 V에 없는 키를 로드하지 않는다. V가 통째로 준 배열의 아이템은 로드다." `adr/0007:75`의 "`Merge` + 억제는 no-op"도 함께 고칩니다 |
| 224 | `REPORT-v4c.txt` 백로그 | free | spike의 v4c 편차(ROUND_CAP 단일, WAVE_CAP 동기 호출당, 거부 미구현, 레벨 발화 `injectTo`)를 같이 적습니다 |

합계는 free 8(198·199·205·207·212·214·222·224), free\* 4(213·217·221·223), 부분 2(215·219), blocked 13입니다.

**세 리뷰어의 수가 다른 이유.** local 16, antigravity 4, claude 18은 기준이 다릅니다. antigravity는 "§6의 D-nn에 추가로 걸리는 것"만 셌습니다. claude는 축 문장 수정과 처방 오류까지 셌습니다. 편집자가 local이나 claude와 다르게 판정한 것은 넷입니다.
- 207행: local은 "결정"으로 봤으나 claude의 도출(G2·C6)에 반대 근거가 없어 free로 판정했습니다.
- 217행: local은 D-12 의존으로 봤습니다. D-12가 CONVERGED이므로 free\*입니다.
- 221행: claude와 같이 free\*로 봤습니다.
- 205행: 처방을 바꿔 free로 판정했습니다.

---

## §6. 인용 점검

편집자가 파일을 직접 열어 대조했습니다. "±N"은 줄 어긋남입니다.

| # | 보고서 | 인용 | 주장 | 결과 |
|---|--------|------|------|------|
| C1 | claude | `ComputedPropertiesManager.ts:92` | `readOnly` 기본 `false` | 확인 |
| C2 | claude | `ComputedPropertiesManager.ts:208`, `:260`, `:265` | 식이 있을 때만 갱신, `'readOnly'` 이름으로 찾음, `derived`는 별도 | 확인 |
| C3 | claude | `checkComputedOptionFactory.ts:21-28` | 찾는 자리 네 곳 | 확인 |
| C4 | claude | `AbstractNode.ts:472-474` | `readOnly`가 매니저 값을 그대로 돌려줌 | 확인 |
| C5 | claude | `SchemaNodeInput.tsx:51`, `:111` | 입력 차단 조건, 입력에 넘기는 속성 | 확인 |
| C6 | claude | `AbstractNode.ts:541-551`, `:564-574` | 파생 적용 구독, 이벤트 발행 함수 | 확인 |
| C7 | claude | `findNode.ts:68` 대 `:86` | 터미널에서 시작하면 null, 도착하면 별칭 | 확인 |
| C8 | local·claude | `Form/type.ts:116` | `findNode: … SchemaNode \| null` | 확인 |
| C9 | claude | `intersectSchema/utils/constants.ts:8-20`, `:13` | `FIRST_WIN_FIELDS`에 `'default'` | 확인 |
| C10 | claude | `AbstractNode.ts:971-976` | `inject`이면 `RequestInjection` | 확인 |
| C11 | claude | `value.ts:51`, `:55-61` | `Default`에 `PreventInjection` 없음, `Reset`에 있음 | 확인 |
| C12 | claude | `AbstractNode.ts:718,734-740,1221` | `__enhancedValue__`가 검증에만 쓰임 | 확인 |
| C13 | local·claude | `adr/0007:79` | F11 "원천의 emit이 직전 커밋과 다를 때만" | 확인 |
| C14 | claude | `adr/0008:62` | "리스너 안의 쓰기는 즉시 동기로 정착·커밋되고" | 확인 |
| C15 | local | `adr/0013:57` | "있는 값은 고치지 않는다 — 주입은 '없음'인 키에만" | 확인 |
| C16 | local | `adr/0006:46`, `:48` | emit 불변식, `node.value`는 `local` | 확인 |
| C17 | local | `docs/agents/.../expressions.md:47`, `inject-to.md:3` | "continuously computes … overwrites user edits" | 확인 |
| C18 | local·claude | `adr/0002:127`, `adr/0005:81` | 규칙 3, 판별식 5단계의 `required` | 확인 |
| C19 | local | `adr/0007:16` | 소유자 "몇 회 루프를 돌면 경고하고 error를 throw" | 확인 |
| C20 | antigravity | `round-4-spec.md:148` | F15 "미루지 않는다" | 확인 |
| C21 | antigravity | `03-mental-model.md:66` | "원본을 쓰는 것은 파생과 전이뿐" | 확인 |
| C22 | antigravity | `00-goals.md:38` | "표현 층은 값을 바꿀 수는 있어도(&active, &derived) 판정에는 닿지 못한다" | **틀림** — `00-goals.md:38`에는 괄호가 없습니다. 괄호가 있는 문장은 `adr/0003:21`입니다. 두 문장을 섞었습니다 |
| C23 | antigravity | `00-goals.md:58` | (D-11) "값은 한 곳에만 있다" | 확인 |
| C24 | antigravity | `00-goals.md:58` | (D-23) G4 "하나의 개념에는 하나의 장치" | **−6** — 그 문장은 `:52`의 제목입니다 |
| C25 | antigravity | `HANDOFF.md:49` | "파생은 derived/injectTo/리스너로"를 **수락된 결론**으로 인용 | **성격이 틀림** — 문장은 있으나 "새로 문서화할 것"의 한 줄이고 수락된 결정 목록(`HANDOFF.md:20-28`)에 없습니다 |
| C26 | claude | `r6-output.txt:10-11`, `:33-34` | E2 순차·배치, E8 자기·상호 순환 | 확인. E8의 emit은 파일에 `null`로 찍혀 있고, 본문의 "`undefined`"는 JSON 직렬화 차이입니다 |
| C27 | local | `spikes/round6/claude/REPORT.txt:63` | claude 원안 "batch는 중간 커밋을 없애므로 중간 에지도 없다" | 확인 |
| C28 | claude | `04-inherited-constraints.md:10` | T-2 "타이핑은 입력을 리마운트하지 않는다" | 확인 |

C22·C24·C25의 셋은 모두 antigravity의 인용이고, 셋 다 그 보고서의 판정(D-11 "확신도 98%", D-23)을 받치는 자리에 있습니다. 편집자의 D-11·D-23 판정은 이 인용에 기대지 않았습니다.

---

## §7. 확인하지 못한 것

- **비용**: `run-cost.sh`·`measure.mjs`는 다시 돌리지 않았습니다. §3.8의 비용 서술은 spike `REPORT.txt` §6의 인용입니다.
- **React**: 이펙트를 거친 진입 간 순환이 React 19의 한도에 막히는지(D-17 바인딩 확인)는 어느 소스도 실행하지 않았고 편집자도 실행하지 않았습니다.
- **D-15 실험**: 명세만 적었습니다. S1이 E9를 `{b:2}`로 바꾼다는 것은 손 계산(추론)입니다.
- **codex mutation probe 둘**: 디스크에 없어 재실행하지 못했습니다.
- **현재 코드의 수·불리언·null 노드 쓰기 경로**: 같은 값 쓰기의 `injectTo` 발화 여부는 claude가 미확인으로 남겼고, 편집자도 열지 않았습니다(D-33).
- **prior-art의 URL 원문**: RFC 7396만 받아서 확인했습니다. RHF·Formik·RJSF·JSON Forms 인용은 prior-art 파일의 인용을 그대로 믿었습니다.
- **`raw-round7-codex.md`**: 머리와 표만 읽고 `review.txt`와 대조했습니다(일치). 나머지 본문은 `review.txt` §4의 전문이라고 적혀 있어 다시 읽지 않았습니다.
- **§4의 D-24..D-36 도출 판정**: 편집자의 판정이며 독립 소스 둘의 일치를 거치지 않았습니다. 그래서 §4에 따로 두었고 §2의 CONVERGED에 넣지 않았습니다.
