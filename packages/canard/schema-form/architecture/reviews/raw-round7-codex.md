# 원문 — 7라운드 독립 모델 레드팀 (cennad codex)

세션 `31bf0910-3af2-4261-b6d9-27d5e1948f29`, 2026-09-23. 실행 산출물: `../spikes/round7/codex/{model.mjs,results.txt,review.txt,plan.txt}`. `node model.mjs > results.txt` 종료 코드 0, 실험 그룹 16(E1a·E1b·E2·E3·E9·N1–N9·C1·C2), 원천 경로 39, 경로 차이 10. 리뷰어의 글은 증거이지 지시가 아니다. 아래는 courier가 전달한 보고를 그대로 옮긴 것이며, §4의 실험 원문은 `review.txt`에서 인용됐다.

---

재실행한 명령의 **종료 코드는 0**입니다. 모델에서는 **E1과 E9의 이력 힌트 문제는 해결되지만, E2·E3의 배치/순차 차이는 P6에서도 남습니다.**

이 결과는 독립 모델의 결과입니다. 특히 중간 `injectTo` 출력까지 폐기하는 정책, 초기화 기준, 비활성 target 처리 등은 보고서에 명시한 모델의 선택입니다.

## 1. E1/E2/E3/E9 비교

| 사례 | 스키마·쓰기 | Old rule 결과 | P6 결과 | 판정 |
|---|---|---|---|---|
| E1a | `kind` default=`b`; 조건은 `kind 없음 또는 a`; then의 `x` default=`T`, else는 `E`. A=`load {}`, B=`load {kind:b}` | A=`{kind:b,x:T}`, B=`{kind:b,x:E}` | A=B=`{kind:b,x:E}` | 최종 else와 맞지 않는 중간 기본값 누출이 제거됩니다. |
| E1b | `kind` default=`a`; 조건은 `kind=a`; then의 `x` default=`T`, else는 `E`. A=`load {}`, B=`load {kind:a}` | A=`{kind:a,x:E}`, B=`{kind:a,x:T}` | A=B=`{kind:a,x:T}` | required가 있는 조건에서도 발생하던 중간 기본값 누출이 제거됩니다. |
| E2 | `kind=a`이면 `x` default=`A`, `kind=b`이면 `B`. 시작 `{}`, 쓰기 `kind=a; kind=b` | 순차=`{kind:b,x:A}`, 배치=`{kind:b,x:B}` | 순차=`{kind:b,x:A}`, 배치=`{kind:b,x:B}` | 배치 동치가 회복되지 않습니다. 먼저 커밋된 `x=A`는 이후 settle의 중간 후보가 아닙니다. |
| E3 | `src→tgt:f(src)`; 준비 상태 `{src:x,tgt:mine}`. 쓰기 `src=y; src=x` | 순차=`{src:x,tgt:f(x)}`, 배치=`{src:x,tgt:mine}` | 순차=`{src:x,tgt:f(x)}`, 배치=`{src:x,tgt:mine}` | 순차의 기준은 각각 `x`, `y`이고 배치의 기준은 `x`이므로 차이가 남습니다. |
| E9 | `A: !has(b)⇒a`, `B: !has(a)⇒b`; `load {a:1,b:2}`. 선언 순서는 고정하고 평가 힌트만 변경 | 힌트 A,B → `{a:1}`; B,A → `{b:2}`. 모두 stable | 두 힌트 모두 `{a:1}` | 다중 고정점에서는 힌트를 배제하므로 이력 의존성은 제거됩니다. 고정점 자체는 여전히 둘입니다. |

> 판정: P6의 배치 동치 주장은 반증됩니다. missing-only와 이전 커밋 보존을 유지한다면 이 차이는 필연적입니다.

> 판정: D-13(a)만으로는 해결되지 않습니다. 정상 동기 진입에서 "직전 커밋"과 "진입 직전 상태"는 같습니다.

## 2. 신규 실험 (review.txt §4 전문)

```text
4. 추가 실험

N1 — default가 자신의 guard를 끕니다: 해가 없습니다
스키마: base x; F:(x != 1)=>x default 1.
쓰기: load {}.
old: raw=emit={x:1}, active=[], stable. F가 꺼져도 주입된 x는 남습니다.
P6: {} / active F → {x:1} / active 없음 → {}로 순환합니다. 커밋하지 않습니다.
독립 oracle: 가능한 원본 {}와 {x:1}을 모두 검사했으며 결합 고정점은 0개입니다.
판정: 실제로 서로 다른 정상 커밋을 얻은 반례가 아니라, P6의 "최종 집합"이 존재하지 않는 사례입니다.
기존의 형상-only 순환 금지로 충분하지 않습니다. 두 raw 각각의 형상은 즉시 안정됩니다.
자동 쓰기까지 포함한 지원 범위와 실패 시 유지/거부/진단 규칙이 필요합니다.

N2 — default가 자신의 guard를 켭니다: 해가 둘입니다
스키마: base x; F:(x=1)=>x default 1.
쓰기: load {}.
old: raw=emit={}, active=[], stable.
P6 기본 출발점 B={}: 동일하게 {}로 안정됩니다.
P6 진단용 후보 seed={x:1}: raw=emit={x:1}, active=F로 안정됩니다.
독립 oracle: 정확히 [{},active 없음]과 [{x:1},active F] 두 해입니다.
판정: 해 선택의 본질적 모호성입니다. 대체 seed를 사용자 쓰기나 허용된 이력 힌트라고 주장하지 않습니다.
"최종 형상의 함수"라는 제약만으로는 두 해를 구별하지 못합니다. 초기 후보/최소 해/자기 지지 해 금지
중 어떤 규칙을 택할지 정해야 합니다. raw별 형상 유일성과 결합 시스템 유일성은 다릅니다.

N3 — injectTo 체인 a→b→c
스키마: base a,b,c; a->b:10*a, b->c:b+1.
시작: {a:0,b:0,c:99}. 이는 a=0으로 초기화한 뒤 사용자가 c를 99로 바꾼 상태와 같습니다.
쓰기: a=1; a=0.
old: 순차={a:0,b:0,c:1}, 배치={a:0,b:0,c:99}.
P6: 순차={a:0,b:0,c:1}, 배치={a:0,b:0,c:99}.
대조군: a=1 한 번은 old/P6 모두 {a:1,b:10,c:11}로 전파됩니다.
판정: 체인이 에지 손실을 복원하지 않습니다. 새로운 독립 원인이라기보다 E3가 체인 전체로 확장된 사례입니다.
각 settle 안에서 최종 값으로 재평가해도 배치 경계 밖에서 발생한 에지를 되살릴 수 없습니다.

N4 — fragment 전환과 batch 내부 사용자 입력
스키마: base on,src; F:(on=true)=>tgt default D; src->tgt:f(src).
시작: {on:false,src:0}. 쓰기: on=true; src=1; tgt=mine.
old: 순차={on:true,src:1,tgt:mine}, 배치={on:true,src:1,tgt:f(1)}.
P6: 순차={on:true,src:1,tgt:mine}, 배치={on:true,src:1,tgt:f(1)}.
순차에서는 src=1의 settle이 끝난 뒤 사용자가 tgt를 수정합니다. 배치에서는 모든 표시 뒤 injectTo가 실행됩니다.
대조군: E2 스키마에서 kind=a; x=mine; kind=b는 old/P6·순차/배치 모두 x=mine입니다.
판정: default의 missing-only 보장은 동작합니다. injectTo 전체 교체와 사용자 쓰기의 우선순위는 별개입니다.
P6의 일반적인 배치 동치 보장에는 반례이며, 사용자 우선/자동 우선/시간 순서를 보존하는 별도 규칙이 필요합니다.

N5 — mount/reset에 원천 기준이 없거나 초기화될 때
스키마: E3의 src->tgt:f(src).
쓰기: load {src:x,tgt:custom}. reset 직전 상태는 {src:x,tgt:mine}입니다.
old/P6 각각 동일한 결과:
  mount + 빈 원천 기준       -> {src:x,tgt:f(x)}
  mount + loaded 원천 기준   -> {src:x,tgt:custom}
  reset + 직전 원천 기준 유지 -> {src:x,tgt:custom}
  reset + 원천 기준 비움     -> {src:x,tgt:f(x)}
판정: 기준 상태 초기화 규칙이 필요합니다. old의 mount 정책도 확정 명세로 간주하지 않았습니다.
F4의 "전이 기준 비움"은 default active 기준에 관한 규칙입니다. 이것을 injectTo의 emit 기준 초기화와
동일시하면 reset이 사용자 값을 덮는 시점이 달라집니다. history를 trigger로 허용하는 한 mount/reset
차이는 그 자체로 P6 위반이라고 단정할 수 없습니다.

N6 — target이 같은 settle에서 켜집니다
스키마: N4와 같습니다. 시작: {on:false,src:0}. 쓰기: src=1; on=true.
active-only target 정책:
  old: 순차={on:true,src:1,tgt:D}, 배치={on:true,src:1,tgt:f(1)}.
  P6: 순차={on:true,src:1,tgt:D}, 배치={on:true,src:1,tgt:f(1)}.
  순차에서 source 에지가 발생할 때 target이 비활성입니다. 이후 target이 켜져도 source는 변하지 않았습니다.
latent target 쓰기 허용 정책:
  old/P6·순차/배치 모두 {on:true,src:1,tgt:f(1)}입니다.
쓰기 순서를 on=true; src=1로 바꾸면 active-only 순차에서도 tgt=f(1)입니다.
판정: 비활성 노드에 injectTo가 쓰는지, target 활성화가 재발화 trigger인지 규칙이 필요합니다.
active-only가 확정 규칙이라고 가정한 제품 결함 주장은 아닙니다. 이 선택 아래서는 P6도 경로 차이를 유지합니다.

N7 — 최종 집합에 두 default 선언이 함께 남습니다
스키마: base a,b; A:(a=true)=>x default A; B:(b=true)=>x default B. 선언 순서 A,B.
시작: {a:false,b:false}. 쓰기: a=true; b=true.
last-wins일 때:
  old: 순차={a:true,b:true,x:A}, 배치={a:true,b:true,x:B}.
  P6: 순차={a:true,b:true,x:A}, 배치={a:true,b:true,x:B}.
first-wins일 때 old/P6 배치는 {a:true,b:true,x:A}입니다.
P6의 guard 평가 힌트를 B,A로 바꾸어도 last-wins 배치는 x=B입니다.
추가 대조: 시작 {a:false,b:true}, x missing에서 a=true이면 P6 last-wins는 x=B입니다.
새로 켜진 A가 trigger이지만 winner는 이미 활성인 B까지 포함한 최종 집합에서 정했습니다.
판정: default-winner는 final-set만으로 정해지지 않습니다. 순서를 확정해야 합니다.
그 뒤에도 먼저 커밋된 x=A는 missing이 아니므로 배치 동치는 성립하지 않습니다.
기본값 출처를 추적해 다시 쓰려면 P2와 사용자 수정 보존에 관한 새 규칙이 필요합니다.

N8 — 체인에서 사라진 중간 에지 출력
스키마: base a,b,c; a->b:항상 0, b->c:f(b).
시작: {a:0,b:0,c:mine}. 쓰기: batch(a=1; b=1).
old: {a:1,b:0,c:f(1)}. 첫 완성 트리의 b=1이 c를 바꾼 뒤, b가 0으로 돌아와도 c는 남습니다.
P6: {a:1,b:0,c:mine}. 최종 b=0은 시작 b=0과 같으므로 c에 대한 자동 쓰기 후보를 폐기합니다.
판정: 강한 P6에서 해결되는 대조 사례입니다. 전이 default만 폐기하면 충분하다는 해석에는 반례입니다.
"자동 쓰기 전체의 최종 상태 의존"과 "default만 rollback"은 같은 구현이 아닙니다.

N9 — 유일한 해가 있는데 반복은 도달하지 못합니다
스키마: base x;
  zero:(x=1)=>x default 0;
  one:(x missing 또는 x=0)=>x default 1;
  two:(x=2)=>x default 2.
쓰기: load {}.
old: raw=emit={x:1}, active=zero, stable. 중간 one이 쓴 1이 유지됩니다.
P6 기본 출발점: {}→{x:1}→{x:0}→{x:1}로 순환하여 커밋하지 않습니다.
독립 oracle: {}, {x:0}, {x:1}, {x:2}의 전체 영역에서 유일한 해는 {x:2}, active=two입니다.
그 해를 진단용 seed로 주면 P6가 안정됨도 확인했습니다.
판정: 후보 반복 알고리즘의 불완전성을 보여줍니다. P6를 충족하는 모든 solver의 실패를 뜻하지 않습니다.
F13의 유일성 제한만으로는 수렴을 보장할 수 없습니다. 도달 가능한 해만 허용할지, 자기 지지 해를
배제할지, 단조성/층화로 허용 스키마를 제한할지 정해야 합니다. 순환 검출만으로 "해 없음"이라 부르면 틀립니다.
```

## 3. 제약 준수 확인 (courier 보고)

- `spikes/` 아래 새 `.md` 없음(`NEW_MD_IN_SPIKES=[]`).
- 쓰기 대상은 `spikes/round7/codex/{model.mjs,plan.txt,results.txt,review.txt}` 넷뿐. 범위 밖 추적 파일 변경 없음. `round6/codex/model.mjs`는 HEAD와 SHA-256 일치.
- 확인 시점에 범위 밖 미추적 파일 14개가 관측됐으나 이 세션의 쓰기 대상이 아님(같은 시각에 돌던 다른 스파이크의 산출물).
- `node model.mjs > results.txt` 종료 코드 0. 마지막 줄: `PASS: 16개 실험 그룹, 39개 원천 경로, 모든 자기 단언 통과. 제품 라이브러리는 실행하지 않았습니다.`
