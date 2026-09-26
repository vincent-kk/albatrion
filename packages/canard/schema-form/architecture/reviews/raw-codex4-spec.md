# 작업 루프 3.1 및 이벤트 시스템 적대적 검토

**판정: 수정 필요입니다.** 기존 18개 실험 가운데 10개 결함은 해소됐고, 5개는 기존 통과를 유지합니다. 30단 default 체인에는 새 예산 문제가 생겼으며, 자기 부정 순환은 명시적 제한으로 남고, null 아래 자동 쓰기의 승격 규칙은 미정의로 남습니다. 특히 B3의 파동 상한과 무손실 배달은 현재 문장으로 동시에 보장할 수 없습니다.

**질문 3의 답은 조건부 예입니다.** 기본 옵션에서 지정한 nullable 테스트 **31·42·148행의 기대값 세 가지는 모델에서 모두 재현됐습니다.** 31행의 입력 표시는 `undefined → ''` 어댑터를 사용했고, 148행의 `&if`는 해당 경로에서 동등한 kind 가드로 옮겼습니다. DOM·React·실제 `&if` 해석기까지 모델로 검증했다는 뜻은 아닙니다. 별도로 현재 제품의 원본 nullable 테스트 파일을 실행해 **8개 통과**를 확인했습니다. 인접한 53행의 “필드를 비우기만 하면 null 유지”는 A5와 충돌합니다.

## 1. 실행과 해석의 경계

대상은 [round-4-spec.md](./round-4-spec.md) A·B입니다. [round-3.md](./round-3.md) §6 E1–E19와 §8의 결정을 대조했습니다. 3.1이 대체한 E9·E18의 null 보존/자식 비활성 규칙이나 이전 금지 투영을 다시 요구하지 않았습니다. 기존 [raw-codex3-workloop.md](./raw-codex3-workloop.md)의 18개 ID를 모두 유지했습니다.

```sh
yarn node packages/canard/schema-form/architecture/spikes/work-loop/codex4/run.mjs
```

실행 결과는 **48개 관측 실험, PASS, Ajv 8.17.1**입니다. PASS는 반례를 포함한 관측 단언이 재현됐다는 뜻입니다. 명세 승인이나 제품 구현의 통과 판정이 아닙니다. 전체 출력은 [results.jsonl](../spikes/work-loop/codex4/results.jsonl), 실행 진입점은 [run.mjs](../spikes/work-loop/codex4/run.mjs)입니다.

- Ajv는 기존 workspace의 ajv8 플러그인 위치를 기준으로 `ajv/dist/2020`을 해석했습니다. 원본 스키마를 `strict:false, allErrors:true`로 검증했고 `useDefaults`, `coerceTypes`, `removeAdditional`은 켜지 않았습니다.
- [WorkLoop.mjs:67](../spikes/work-loop/codex4/WorkLoop.mjs#L67)은 null·scalar를 포함한 전체 교체에서 잠복 자식까지 비웁니다. `extras`는 별도 저장합니다.
- [WorkLoop.mjs:141](../spikes/work-loop/codex4/WorkLoop.mjs#L141)의 계산은 매번 무조건 조각에서 시작합니다. 모든 조각을 전순서로 순회하고, 앞 조각의 변경이 뒤 가드에 보이는 순차 바퀴를 사용합니다. `compute` 전후 저장 상태가 같다는 단언을 매 라운드 실행합니다.
- [WorkLoop.mjs:167](../spikes/work-loop/codex4/WorkLoop.mjs#L167)의 default 쓰기는 계산 밖에 있습니다. 이전 커밋의 active와 비교하고, 없음인 자식에만 마지막 활성 default를 씁니다. 객체 default `{}`의 무효 반복 쓰기는 생략합니다.
- **로드 순서의 선택:** A3에는 A2(i)의 전용 단계가 없습니다. 모델은 첫 형상 계산으로 활성 선언을 얻고 그 직후 (i)를 적용하며, 이후 라운드는 (ii)를 적용합니다. 첫 계산을 1라운드로 셉니다. 다른 순서를 적용한 비교 실행도 아래 A2에 공개했습니다. 이 선택에 의존하는 결과를 무조건적인 명세 반례로 확대하지 않습니다.
- 상속 overlay는 부모 활성 선언을 자식의 계산 입력으로 전달합니다. 최적화된 dirty 순회 대신 필요한 자식을 재계산합니다. 복사 참조 최적화, 성능, 실제 렌더, 전체 배열 연산은 구현하지 않았습니다.
- union은 실험에 필요한 단순 서로소 const 판별식과 수동 선택을 모델링했습니다. E14 전체의 `$ref`/반복 allOf 정규화, 다원소 enum, 재귀 nullable 후보 발견은 구현·검증하지 않았습니다. 이 영역은 통과 판정에 포함하지 않습니다.
- `x-omitEmpty`·`x-omitTrailing`은 기존 실험과 같은 모델용 표기입니다. 전자는 빈 문자열·null·빈 컨테이너, 후자는 배열 끝 null을 제외합니다. 제품의 모든 omit 옵션과 같다는 주장은 하지 않습니다.
- [Dispatcher.mjs:20](../spikes/work-loop/codex4/Dispatcher.mjs#L20)은 커밋별 FIFO, 커밋 시점 복사 payload, 노드별 revision을 사용합니다. batch 및 React 통합은 모델 밖입니다. 모순인 파동 상한에서는 25회에 **진단용 정지**하고 pending을 보존합니다. 이것을 B3을 전부 만족하는 구현이라고 주장하지 않습니다.
- 파일·줄 표기는 이 모델의 실제 단언/기록 위치입니다. **추론**은 실행 관측을 넘어서는 해석이나 권고에만 붙였습니다.

## 2. 기존 18개 실험의 이식 판정

“통과 유지”는 이전부터 결함이 없었던 실험이며, “명시적 제한”은 결함의 제거가 아닙니다.

| 기존 ID | 3.1 판정 | 실제 관측 | 근거 |
| --- | --- | --- | --- |
| A3-1-select | 해소 | 같은 자식 raw에서 selection 0/1 → `{a:1}` / `{b:2}`. 이제 selection이 함수 입력에 있습니다. | [legacy-experiments.mjs:15](../spikes/work-loop/codex4/legacy-experiments.mjs#L15) |
| A3-1-value-guards | 통과 유지 | 두 입력 순서 × 세 이전 active 이력 모두 `{a:'x'}`. | [legacy-experiments.mjs:25](../spikes/work-loop/codex4/legacy-experiments.mjs#L25) |
| A3-2-chain | 새 문제로 대체 | default 30단은 정·역순 모두 25라운드에서 p24까지만 생성하고 budget-exceeded. 값을 미리 주면 2/31바퀴입니다. | [legacy-experiments.mjs:36](../spikes/work-loop/codex4/legacy-experiments.mjs#L36) |
| A3-nested-activation | 통과 유지 | `seed → child.token → done`의 최종 값은 같습니다. default 쓰기 분리로 3라운드가 필요합니다. | [legacy-experiments.mjs:41](../spikes/work-loop/codex4/legacy-experiments.mjs#L41) |
| A3-3-A3-4-host | 통과 유지 | 빈 객체는 첫 판별값 cat과 meow를 얻습니다. null·17의 자기 가드는 {}를 읽어 분기가 꺼집니다. | [legacy-experiments.mjs:48](../spikes/work-loop/codex4/legacy-experiments.mjs#L48) |
| option-open | 해소 | `{seed:true,a:'A',x:1}`의 잠복 raw에서 emit은 `{seed:true,x:1}`, Ajv 통과. | [legacy-experiments.mjs:53](../spikes/work-loop/codex4/legacy-experiments.mjs#L53) |
| option-closed | 해소 | unevaluatedProperties:false에서도 같은 emit, Ajv 통과. | [legacy-experiments.mjs:53](../spikes/work-loop/codex4/legacy-experiments.mjs#L53) |
| option-cycle | 잔존, 명시적 제한 | 자기 부정은 budget-exceeded. 의미 없는 allOf:{} 추가로 마지막 emit과 Ajv 판정이 달라집니다. | [legacy-experiments.mjs:61](../spikes/work-loop/codex4/legacy-experiments.mjs#L61) |
| A3-5-prohibition | 해소 | false 선언은 a를 지우지 않습니다. `{a:'kept',b:1}`을 Ajv가 기각하며 순환하지 않습니다. | [legacy-experiments.mjs:66](../spikes/work-loop/codex4/legacy-experiments.mjs#L66) |
| A4-cap | 해소 | 토글과 긴 단조 파생에서 마지막 완료 raw=emit. pending 쓰기를 적용하지 않습니다. | [legacy-experiments.mjs:76](../spikes/work-loop/codex4/legacy-experiments.mjs#L76) |
| A5-prohibited-selector | 해소 | `{kind:'cat',a:1}`로 판별값 유지, 금지는 Ajv 오류입니다. | [legacy-experiments.mjs:81](../spikes/work-loop/codex4/legacy-experiments.mjs#L81) |
| A6-C1-null | 해소 | `{note:'typed',keep:'K1'} → null → note='Z'`는 `{note:'Z'}`. K1이 돌아오지 않습니다. | [legacy-experiments.mjs:87](../spikes/work-loop/codex4/legacy-experiments.mjs#L87) |
| A6-automatic | 미정의 잔존 | default는 null을 유지합니다. 자식 대상 injectTo가 조상 null을 승격하는지는 명시되지 않았습니다. 승격 해석의 결과는 `{note:'automatic'}`입니다. | [legacy-experiments.mjs:95](../spikes/work-loop/codex4/legacy-experiments.mjs#L95) |
| A7-notify | 통과 유지 | 첫 파동 payload `[1,1,1]`, live value `[1,2,2]`; 다음 파동 payload `[2,2,2]`. | [legacy-experiments.mjs:102](../spikes/work-loop/codex4/legacy-experiments.mjs#L102) |
| C1-write-kinds | 해소 | 부분 쓰기는 SECRET 유지, 전체 교체는 삭제, reset은 초기 raw 복원. emit 재로드는 잠복 raw를 복원하지 않습니다. | [legacy-experiments.mjs:111](../spikes/work-loop/codex4/legacy-experiments.mjs#L111) |
| C2-load | 해소 | 없음만 D 주입. '', null, {}, 0, false 보존. extra=42 별도 유지, 배열 raw와 emit 분리. | [legacy-experiments.mjs:122](../spikes/work-loop/codex4/legacy-experiments.mjs#L122) |
| C1-activation-default | 해소 | on=false→true 전이에서 child=D. 계산 중 쓰기가 아닌 다음 라운드에 반영됩니다. | [legacy-experiments.mjs:127](../spikes/work-loop/codex4/legacy-experiments.mjs#L127) |
| C3-host-type | 통과 유지 | 17·'broken'·[]를 그대로 방출하고 Ajv 기각. note='Z' 뒤 과거 keep 없이 객체 복구. | [legacy-experiments.mjs:137](../spikes/work-loop/codex4/legacy-experiments.mjs#L137) |

## 3. A2 — 전이 주입과 disableDefaultInjection

### 통과: 활성 유지 중 삭제, 재활성화, default 충돌

실행 입력과 출력은 다음과 같습니다.

```text
on=true 로드                  → {on:true,x:'D'}
같은 활성 상태에서 x=undefined → {on:true}
on=false 후 on=true           → {on:true,x:'D'}

disableDefaultInjection=true:
on=true 로드                  → {on:true}
같은 on=true 다시 쓰기         → {on:true}
on=false 후 on=true           → {on:true,x:'D'}
reset()                      → {on:true}

같은 전이에서 두 활성 선언:
x.default='first', 'last'     → x='last'
```

근거: [attack-experiments.mjs:14](../spikes/work-loop/codex4/attack-experiments.mjs#L14), [attack-experiments.mjs:23](../spikes/work-loop/codex4/attack-experiments.mjs#L23). “사용자 쓰기면 무조건 주입”으로 구현하지 않았습니다. **실제 OFF→ON 전이**가 있을 때만 주입합니다. 빈 값을 지운 활성 필드가 즉시 되살아나는 기존 위험은 이 조건에서 해소됐습니다.

### 미정의: 로드 주입 (i)의 시점과 이전 active의 결합

명세 [31행](./round-4-spec.md#L31)은 “(i) 전체 교체 직후”를 정하지만, [43–48행](./round-4-spec.md#L43)의 단계에는 (i)가 없고 전이는 “직전 커밋의 active”와 비교합니다.

```text
schema:
  properties.kind.default = 'a'
  if kind='a' then properties.x.default='X'

새 모델에 Overwrite({})                           → {kind:'a',x:'X'}
이전에 {kind:'a',x:'old'}를 커밋한 뒤 Overwrite({}) → {kind:'a'}
kind의 무조건 default를 첫 계산 전에 주입하는 비교 → {kind:'a',x:'X'}
```

근거: [attack-experiments.mjs:32](../spikes/work-loop/codex4/attack-experiments.mjs#L32). 두 번째 실행에서는 첫 계산 시 kind가 없어 분기가 꺼지고, kind 주입 뒤 켜져도 **직전 커밋에서는 이미 켜져 있었기 때문에** (ii)가 x를 채우지 않습니다. 첫 라운드에만 적용한 (i)도 이미 지나갔습니다.

**판정은 미정의입니다.** “전체 교체 직후”를 계산 전 로드 단계로 해석하면 이 입력의 결과가 달라집니다. 현재 단계표만으로 둘 중 하나를 배제할 수 없습니다. 동일 문제는 부모가 상속한 선언의 default 로드에도 생길 수 있습니다.

**추론:** 로드 default의 형상 발견과 재계산 범위, 전체 교체 뒤 전이의 비교 기준, 각 쓰기의 라운드 예산을 하나의 순서로 정해야 합니다. “같은 전체 교체 정착 안”이라는 disable 옵션의 억제 범위도 그 순서를 따라야 합니다.

## 4. A4 — 투영 가드, 옵션 B, 중첩·상속

### A4-1·A4-2: 통과 범위

이전 active를 출발점으로 쓰지 않는 실험은 여섯 이력에서 같은 결과였습니다([legacy-experiments.mjs:25](../spikes/work-loop/codex4/legacy-experiments.mjs#L25)). 부모가 비활성인 중첩 then은 켜지지 않았고, 부모를 활성화한 뒤에만 내부 자기 부정이 상한에 도달했습니다([attack-experiments.mjs:76](../spikes/work-loop/codex4/attack-experiments.mjs#L76)). 조각을 평면 목록으로 독립 실행하는 이전 위험을 재도입하지 않았습니다.

### A4-3: 투영된 입력과 호스트 {} 예외는 통과

```text
raw = {x:'', tail:['a',null]}
x는 omitEmpty, tail은 omitTrailing
가드 required x / tail.minItems=2
→ local={x:'',tail:['a',null]}, emit={tail:['a']}
→ y·z default 분기 모두 OFF
```

근거: [attack-experiments.mjs:41](../spikes/work-loop/codex4/attack-experiments.mjs#L41). 가드는 실제 투영 후 값을 보았습니다.

호스트 자체 raw가 null 또는 17인 실행은 가드 입력을 모두 {}로 유지했습니다. `required kind`는 Ajv에서 null에 직접 넣으면 true, {}에는 false입니다([attack-experiments.mjs:48](../spikes/work-loop/codex4/attack-experiments.mjs#L48)). 이는 명세가 선언한 예외이며 검증기 불일치 자체를 결함으로 세지 않았습니다.

끌어올린 `properties.addr.required(kind)`는 부모 값 `{addr:null}`에서 true이고, 자식 union의 자기 가드는 {}에서 모두 false였습니다. null을 {}로 전체 교체하면 첫 판별값만 선택되어 한 분기만 켜졌습니다([attack-experiments.mjs:58](../spikes/work-loop/codex4/attack-experiments.mjs#L58)). **A4-2의 G1과 빈 중첩 union 주장은 이 범위에서 통과**입니다. 부모 가드의 통과와 전체 union 스키마의 유효성은 별개입니다.

### A4-4 / 주장 A4-1: 고정점과 예산을 구분해야 합니다

명세 [66행](./round-4-spec.md#L66):

> 정순 의존 체인은 2바퀴, 역순 N단은 N+1바퀴다.

기존 30단 실험을 그대로 이식했습니다.

```text
입력 {p0:0}, p_i 존재 → p_(i+1).default=i+1

정순: 25라운드 → {p0:0,...,p24:24}, budget-exceeded, 마지막 계산 2바퀴
역순: 25라운드 → p0 및 p1~p24만, budget-exceeded, 마지막 계산 26바퀴
p0~p30을 미리 입력한 대조: 정순 2바퀴 / 역순 31바퀴, stable
```

근거: [legacy-experiments.mjs:36](../spikes/work-loop/codex4/legacy-experiments.mjs#L36). **기존 default 의존 체인에 대한 무조건적인 해소 주장에는 반례**입니다. default가 계산 밖으로 이동했으므로 raw가 없는 다음 값을 한 바퀴 안에서 생성할 수 없습니다. A2(i)를 계산 앞의 1회 추가 주입으로 해석하면 경계가 한 단계 달라질 수 있지만 30단 문제 자체는 없어지지 않습니다.

**추론:** A4-1은 “필요한 raw가 이미 있는 순수 계산”의 바퀴 수로 한정해야 합니다. default 생성 깊이는 별도의 라운드 예산을 소비한다고 명시해야 합니다. 상한에서 멈추는 것 자체가 A3 위반이라는 주장은 아닙니다.

자기 부정 실험의 결과도 확인했습니다.

```text
if not required x then {x.default:1, required:x}, 입력 {}
→ 마지막 emit {x:1}, sweeps=3, budget-exceeded, Ajv valid

동일 스키마에 의미 없는 allOf:[{}] 추가
→ 마지막 emit {}, sweeps=4, budget-exceeded, Ajv invalid
```

근거: [legacy-experiments.mjs:61](../spikes/work-loop/codex4/legacy-experiments.mjs#L61). 조각 수의 계산 방식/청사진 정규화에 따라 이 패딩이 제거될 수 있습니다. 이 모델은 빈 allOf 조각을 셉니다. **지원 범위 밖이라는 선언과 상태 노출은 개선이며, 고정점이 생겼다는 뜻은 아닙니다.** 상한에서 마지막 A를 택하면 패리티와 정규화가 관측값에 영향을 줄 수 있습니다.

### A4-5: false/not의 선언 제거는 통과

같은 호스트 `a:false`는 a의 값을 지우지 않았고, union 판별값 금지도 kind를 지우지 않았습니다. Ajv가 해당 값을 기각합니다([legacy-experiments.mjs:66](../spikes/work-loop/codex4/legacy-experiments.mjs#L66), [legacy-experiments.mjs:81](../spikes/work-loop/codex4/legacy-experiments.mjs#L81)). 이전 금지 투영의 자기 진동과 “판별 키 항상 방출”의 우선순위 문제는 이 방식으로 해소됩니다. false만 선언한 키는 입력 노드 대신 extra가 되며 A8에서 다뤘습니다.

### A4-6: 상속 overlay 전달은 통과, 자기 피드백은 상한

```text
on=false, child={}      → child={own:'O'}
on=true                → child={own:'O',extra:'E'}
다시 on=false           → child={own:'O'}, 잠복 extra raw='E'
```

근거: [attack-experiments.mjs:64](../spikes/work-loop/codex4/attack-experiments.mjs#L64). 부모의 on/off가 자식을 다시 계산하게 했고, overlay 해제는 원본을 지우지 않았습니다.

다음 실행은 자식까지 걸친 자기 부정입니다.

```text
입력 child.x=1
부모: not(child has x)이면 child.x 선언 overlay
가드 입력 child={}      → ON
가드 입력 child={x:1}   → OFF
가드 입력 child={}      → ON
→ budget-exceeded, sweeps=3
```

근거: [attack-experiments.mjs:70](../spikes/work-loop/codex4/attack-experiments.mjs#L70). **반례를 숨기는 안정 판정은 하지 않았습니다.** A4-1의 지원 제외가 이처럼 자손 선언을 거치는 자기 부정에도 적용되는지 명시할 필요가 있습니다. 단순 overlay 승격으로 순환이 제거되지는 않습니다.

### A4-7: 값·키 순서는 검사 범위에서 통과

스키마 전순서로 활성 키를 조합하고 extra를 뒤에 둡니다. 정·역순 체인의 JSON 키 순서가 각 선언 순서를 따랐고, 금지/omit은 raw를 지우지 않았습니다. 모든 키 제거는 새 객체 구성으로 처리했습니다([legacy-experiments.mjs:36](../spikes/work-loop/codex4/legacy-experiments.mjs#L36), [legacy-experiments.mjs:122](../spikes/work-loop/codex4/legacy-experiments.mjs#L122)). 참조 재사용 최적화와 JavaScript 정수형 프로퍼티 순서까지 검증한 것은 아닙니다.

## 5. A5·A6와 nullable 요구

### 요청한 세 단언: 모두 재현

| 원본 테스트 | 모델 입력 → 출력 | 결과·근거 |
| --- | --- | --- |
| 31행 | `{target:{note:'typed',reason:'edited'}} → {target:null}`; emit은 `{target:null}`, 입력 표시 note='', reason='because' | **통과**, [attack-experiments.mjs:126](../spikes/work-loop/codex4/attack-experiments.mjs#L126) |
| 42행 | 위 null 상태에서 `target/note='again'` → `{target:{note:'again',reason:'because'}}` | **통과**, [attack-experiments.mjs:129](../spikes/work-loop/codex4/attack-experiments.mjs#L129) |
| 148행 | seed의 kind=b, bValue=x → null → note='typed' → kind=a → kind=b → `{target:{kind:'b',note:'typed',bValue:'B'}}` | **통과**, [attack-experiments.mjs:149](../spikes/work-loop/codex4/attack-experiments.mjs#L149) |

148행의 원본 `&if: "./kind === 'a'/'b'"`를 모델의 kind const 가드로 옮겼습니다. null 아래의 중간 분기 렌더 여부까지 동등하다고 주장하지 않습니다. 요청한 복원 경로에서는 이전 x가 삭제되고 재활성화 때 B가 주입됩니다.

`disableDefaultInjection=true` 대조에서는 reason이 주입되지 않아 승격 결과가 `{target:{note:'again'}}`입니다([attack-experiments.mjs:133](../spikes/work-loop/codex4/attack-experiments.mjs#L133)). 따라서 세 단언의 성립 조건은 기본값 false입니다.

### A5 반례: “부분 쓰기는 항상 승격”은 기존 빈 입력 계약을 잃습니다

명세 [72행](./round-4-spec.md#L72):

> 자식에 부분 쓰기가 오면 호스트의 raw가 비워지고 emit이 객체가 된다.

인접한 원본 [53–60행](../../src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx#L53)은 null 상태의 reason을 비운 뒤에도 null을 요구합니다. E1과 A2에 따라 비우기는 undefined 부분 쓰기입니다.

```text
초기 {target:null}, reason default='because'
target/reason=undefined
3.1 문자 그대로의 모델 → {target:{}}
기존 테스트의 기대값     → {target:null}
```

근거: [attack-experiments.mjs:137](../spikes/work-loop/codex4/attack-experiments.mjs#L137). 이것은 지정된 세 단언의 실패가 아니라 **그 옆의 기존 계약에 대한 새 회귀**입니다. “null == 17”의 일관성을 유지하면서 이 동작을 보존하려면 빈 입력의 승격 조건을 따로 결정해야 합니다.

### A5 모순: null에는 항상 type 오류가 나지 않습니다

명세 [72행](./round-4-spec.md#L72)은 null·17·문자열을 묶고 “검증기가 type 에러를 낸다”고 합니다. 반면 [38행](./round-4-spec.md#L38)은 nullable #338 계약을 유지한다고 합니다.

실제로 `type:['object','null']` 스키마에서 null은 Ajv valid, 17은 type 오류였습니다([attack-experiments.mjs:48](../spikes/work-loop/codex4/attack-experiments.mjs#L48)). **해당 타입을 허용하지 않는 경우에만** type 오류라고 고쳐야 합니다. 저장/승격 규칙이 같다는 것과 유효성까지 같다는 것은 다릅니다.

### A6: 타이핑 비교는 통과, 비교 대상의 생명주기는 미정의

실행한 비교는 다음과 같습니다([attack-experiments.mjs:159](../spikes/work-loop/codex4/attack-experiments.mjs#L159)).

```text
committedRaw='ab', reported='ab' → Refresh 없음
committedRaw='D', reported='old' → Refresh
committedRaw=undefined, reported='' → 직접 비교하면 Refresh
입력이 한 번도 mount되지 않은 노드에 외부 쓰기 → reported 값이 없음
```

이것은 비교식의 실행이며 실제 Refresh 이벤트/DOM의 검증은 아닙니다.

명세의 “그 노드의 입력이 방금 보고한 값”은 사용자 입력이 없는 `reset()`, injectTo, 숨겨진 필드, 다중 뷰에서는 정의되지 않습니다. UI가 방금 보고한 ''를 core가 undefined로 정규화하는 경우도 비교 전후를 정해야 합니다.

**추론:** 보고값의 저장 시점, core 정규화 이후 값인지, Refresh 뒤 보고값 갱신 여부, 비교 방식과 미마운트 처리까지 정해야 T-2를 검증할 수 있습니다. 현재 문구만으로 전체 Refresh 계약을 통과시키지 않습니다.

자식 대상 `injectTo` 역시 **대상에는 전체 교체**이지만 조상에게는 어떤 승격 사건인지 빠져 있습니다. default 전용 쓰기는 null을 유지했습니다. `injectTo('/note','automatic')`을 자식 쓰기 경로로 보낸 모델은 null을 객체로 바꿨습니다([legacy-experiments.mjs:95](../spikes/work-loop/codex4/legacy-experiments.mjs#L95)). 3.1에 예전 “모든 자동 쓰기는 null 조상을 복구하지 않는다”를 임의로 복구하지 않았습니다.

## 6. A7 — 선택·reset·에러 라우팅

**통과:** 단순 const 판별식 소유권, 첫 분기 default, 수동 선택 상태, 값 키를 많이 덮는 통과 분기 선택, reset의 초기 선택 복원입니다. `{b:2}`에서 초기 선택 1 → 수동 0 → reset 1을 실행했습니다([attack-experiments.mjs:107](../spikes/work-loop/codex4/attack-experiments.mjs#L107)). oneOf의 형상 선택은 Ajv 검증 통과를 보장하지 않습니다. 두 열린 분기가 모두 통과하면 oneOf 오류가 남는 것도 확인했습니다.

**미정의 입력:** `oneOf:[{required:['a']},{required:['b']}]`에 `{}`를 로드하면 통과 분기가 없습니다. A7의 “통과 분기 중 가장 많이 선언한 분기”로는 초기 selection을 정할 수 없습니다. 모델의 fallback 0은 이 공백을 넘기기 위한 선택이며 명세의 답으로 제시하지 않습니다. reset이 무슨 초기 선택으로 돌아가는지도 그 결정에 달렸습니다.

**미정의 범위, 넓게 읽으면 반례:** [83행](./round-4-spec.md#L83)의 “oneOf/anyOf 아래 분기 경로의 에러”와 괄호의 “const × N, oneOf”가 각각 전체 집합인지 예시인지 불명확합니다.

```text
선택 kind='a', name='x'
a 분기: name.minLength=3
b 분기: kind='b', required age

Ajv:
 /name minLength (활성 a 분기의 실제 입력 오류)
 / required age  (비활성 b)
 /kind const    (비활성 b)
 / oneOf

분기 경로 전체를 판별 노드로 라우팅 → 네 오류 모두 /kind
```

근거: [attack-experiments.mjs:118](../spikes/work-loop/codex4/attack-experiments.mjs#L118). 이 해석은 name 입력에서 고칠 오류도 판별값으로 옮깁니다. const·union 집계만 뜻했다면 나머지 오류의 대상이 미정의입니다.

**추론:** 판별 실패/union 집계, 활성 분기의 실제 필드 오류, 비활성 분기의 탈락 설명을 구분할 필요가 있습니다. 선택 가드에서도 실제 필드 오류를 무조건 호스트로 옮길 것인지 정해야 합니다. E14 전체 알고리즘은 이 검토에서 실행 통과를 주장하지 않습니다.

## 7. A8 — residual과 삭제

**통과한 경로:** `properties:{x:false}, not:{required:['y']}, additionalProperties:false`에 `{x:1,y:2}`를 로드했습니다. 입력 노드는 없고 extras에 두 값이 남았습니다. Ajv의 /x false-schema와 루트 additionalProperties(y)로 각각 경로를 알 수 있으며, removeKey 두 번 뒤 {}는 통과했습니다([attack-experiments.mjs:84](../spikes/work-loop/codex4/attack-experiments.mjs#L84)). 전체 폼을 교체하지 않고 해당 키를 지웠습니다.

**미정의 입력:** `not:{required:['a','b']}`에 extra 두 개 `{a:1,b:2}`를 주면 Ajv는 아래 오류만 줍니다.

```json
{"instancePath":"","schemaPath":"#/not","keyword":"not","params":{}}
```

a나 b 어느 하나를 지워도 통과하지만 검증기는 “어느 키를 기각했다”는 답을 주지 않습니다([attack-experiments.mjs:91](../spikes/work-loop/codex4/attack-experiments.mjs#L91)). A8은 이 경우 residual의 경로·값·에러를 한 키에 붙일지, 양쪽에 붙일지, 호스트 오류로만 둘지 답하지 않습니다. residual 목록의 실제 라우터는 모델에 넣지 않고 Ajv가 제공하는 근거를 노출했습니다.

또한 **비활성 선언 키와 extra는 다릅니다.** `if required a then declare b`에 `{b:'latent',extra:7}`를 넣으면 b는 저장되지만 emit에서 빠지고, 검증기는 extra만 기각합니다([attack-experiments.mjs:98](../spikes/work-loop/codex4/attack-experiments.mjs#L98)). A8으로 잠복 b가 자동 노출되지는 않습니다. 이는 E16에 남은 쟁점이며 “입력의 모든 잔여 데이터를 복구한다”는 넓은 설명으로 대체하면 안 됩니다.

## 8. B3 — 루트 디스패처 여섯 규칙

| 규칙 | 판정 | 실행한 공격·관측 |
| --- | --- | --- |
| 1 순서 | 통과 | child를 먼저 커밋 입력에 넣어도 root→child. signal-only는 signalA→signalB publish 순서. [event-experiments.mjs:13](../spikes/work-loop/codex4/event-experiments.mjs#L13) |
| 2 배달 집합 | 통과 범위·미정의 | 변경 노드와 시그널 노드의 합집합, 동일 노드 Focus+Refresh는 한 번 배달. pending 여러 커밋을 합칠지와 batch 통합은 미검증. |
| 3 원장 | 통과 범위·미정의 | 노드의 첫 콜백에서 revision=1, detached는 0. 검증 스탬프로 쓰기에는 커밋과 통지 사이의 공백이 있습니다. [event-experiments.mjs:64](../spikes/work-loop/codex4/event-experiments.mjs#L64) |
| 4 파동 | **모순** | 일반 재진입의 payload 고정은 통과. 25 상한과 남은 통지 무손실 배달은 동시에 만족 불가. [event-experiments.mjs:41](../spikes/work-loop/codex4/event-experiments.mjs#L41) |
| 5 분리 | 통과 | 부모 콜백에서 child 분리 → child 콜백 없음, pending 시그널 폐기, revision 미증가. [event-experiments.mjs:21](../spikes/work-loop/codex4/event-experiments.mjs#L21) |
| 6 격리 | 통과 | 첫 리스너 throw를 보고한 뒤 다음 root 리스너 실행. [event-experiments.mjs:21](../spikes/work-loop/codex4/event-experiments.mjs#L21) |

### B3-4의 모순은 유한 입력에서도 드러납니다

명세 [108행](./round-4-spec.md#L108)의 세 조건입니다.

> 리스너 안의 쓰기는 즉시 동기로 정착·커밋되고 그 통지는 현재 파동이 끝난 뒤 다음 파동이다.

> 한 동기 호출 안의 파동 수 상한 25.

> 넘으면 남은 통지를 버리지 않고 마지막 파동까지 배달한 뒤 settle에 기록하고 개발 모드에서 throw.

리스너 `payload n → setValue(n+1)`를 실행했습니다.

```text
25파동 배달 뒤: live=26, revision=25, pending=1
pending을 배달하면: 다시 새 커밋과 다음 pending 발생
```

근거: [event-experiments.mjs:41](../spikes/work-loop/codex4/event-experiments.mjs#L41). 모델은 여기서 진단 목적으로 중단했습니다.

무한 리스너가 아니라 **26에서 멈추는 리스너**도 실행했습니다. 25파동 뒤 pending=1이며, 전부 배달하려면 총 26파동이 필요했습니다([event-experiments.mjs:49](../spikes/work-loop/codex4/event-experiments.mjs#L49)).

**모순 판정:** 계속 배달하면 상한 위반이며, 종료하면 이미 커밋된 통지를 모두 배달했다는 계약을 만족하지 못합니다. “마지막 파동까지”라는 문장은 무한 연쇄에 마지막 파동을 만들어 주지 않습니다. 개발 모드 throw는 그 뒤이므로 종료 장치가 되지 못합니다.

**추론:** 상한에서 다음 쓰기를 거절할지, 후속 태스크로 배달을 이월할지, 명시적으로 통지를 합칠지 결정해야 합니다. 각각 현재의 “즉시 커밋”, “동기 통지”, “커밋별 payload” 중 다른 부분을 바꾸므로 구현자가 임의 선택할 사안이 아닙니다.

### B2와의 문장 충돌, listener 집합의 미정의

B2 [97행](./round-4-spec.md#L97)은 “쓰기 하나는 동기로 정착하고 동기로 통지한다”고 합니다. 그러나 리스너 안의 write2·write3 호출은 각 통지가 오기 전에 반환합니다.

```text
write2-return, write3-return, notify2, notify3, outer-return
```

근거: [event-experiments.mjs:35](../spikes/work-loop/codex4/event-experiments.mjs#L35). **추론:** B3의 예외가 우선한다고 해석할 수 있으므로 실행 불가능한 별도 모순은 아닙니다. B2의 동기 통지 보장은 “최외곽 호출 반환 전”이라고 범위를 좁혀야 합니다.

고정되는 대상이 노드 집합인지 리스너 집합인지도 다릅니다. 콜백 중 새로 구독한 리스너를 같은 파동에 부를지는 명시되지 않았습니다. 모델은 리스너 배열도 스냅샷하여 late 리스너가 다음 파동부터 받도록 했습니다([event-experiments.mjs:79](../spikes/work-loop/codex4/event-experiments.mjs#L79)). 이 선택을 T-6 통과의 증거로 사용하지 않습니다.

### B3-3과 A3 비동기 검증: 커밋 식별자가 부족합니다

root의 첫 리스너에서 아직 통지되지 않은 child를 2, 이어서 3으로 커밋했습니다. 두 커밋의 검증을 통지 전에 시작한다고 해석하면 둘 다 child.revision=0입니다. 이후 원래 child 통지와 두 후속 통지를 배달한 최종 revision은 3입니다([event-experiments.mjs:64](../spikes/work-loop/codex4/event-experiments.mjs#L64)).

**실행 관측:** 서로 다른 현재 커밋이 동일 revision으로 찍힙니다.

**추론:** 네이티브 Promise가 파동 종료 후 완료되면 두 결과 모두 stale로 버려 최종 값 3의 검증도 사라질 수 있습니다. 동기/custom 완료라면 값 2의 결과를 값 3에 받아들일 수 있습니다. 이 모델은 실제 비동기 검증 엔진을 구현하지 않았으므로 후자의 동작을 제품에서 발생한 버그라고 주장하지 않습니다.

**미정의 입력:** 리스너 안에서 연속 커밋한 노드의 검증을 언제 시작하고 어느 커밋 번호로 식별합니까? A3의 “통지 → 검증”을 큐의 해당 커밋 배달 뒤로 명확히 연기하거나, commit version과 notification revision을 구분해야 합니다.

## 9. B4 — payload 연결과 settle

### 통과: 커밋별 FIFO라면 previous/current는 연결됩니다

리스너 한 번 안에서 두 번 더 쓰게 했습니다.

```text
커밋1: previous=0, current=1
커밋2: previous=1, current=2
커밋3: previous=2, current=3
```

호스트 local과 emit을 모두 담아 위 연결을 단언했습니다([event-experiments.mjs:35](../spikes/work-loop/codex4/event-experiments.mjs#L35)). live value가 먼저 3이 되어도 커밋1 payload를 3으로 덮어쓰지 않았습니다. 기존 세 리스너 실험도 통과했습니다([legacy-experiments.mjs:102](../spikes/work-loop/codex4/legacy-experiments.mjs#L102)).

**미정의:** 여러 커밋을 다음 파동의 한 노드 이벤트로 합칠 수 있는지 명시가 없습니다. 마지막 payload `2→3`만 배달하면 이전 배달 `0→1` 뒤의 연결이 끊깁니다. `1→3`으로 새로 만들면 실제 한 커밋의 payload라는 문장을 바꿉니다. 이 둘은 실행 결과로 단정하지 않은 **추론**이며, 모델은 커밋별 FIFO를 선택했습니다.

payload 객체에 대한 소비자 mutation도 범위가 필요합니다. 첫 리스너가 `payload.current.n=99`를 쓰면, 같은 객체를 받는 두 번째 리스너는 99를 보고 live 값은 1입니다([event-experiments.mjs:71](../spikes/work-loop/codex4/event-experiments.mjs#L71)). **이것만으로 명세의 불가능성을 주장하지 않습니다.** immutable/read-only 소비자 계약, freeze 또는 격리 복사로 방어할 수 있습니다. 해당 보장의 적용 범위가 현재 문장에는 없습니다.

### 미정의: settle 변화와 예산 종류

`{status:'stable',sweeps:2} → {status:'stable',sweeps:1}`은 status만 보면 같고 객체 전체로 보면 다릅니다([event-experiments.mjs:84](../spikes/work-loop/codex4/event-experiments.mjs#L84)). A1이 객체로 정의한 점에 따르면 전체 변경을 UpdateSettle로 알리는 해석이 자연스럽습니다. 다만 §8 D-2의 “상태 변화”가 status 변화만 뜻했는지와 맞춰야 합니다.

더 큰 빈칸은 **호스트 바퀴**, **정착 라운드**, **통지 파동**의 세 상한입니다. A1의 settle은 호스트만 가지며 status와 sweeps만 있습니다. B3의 상한을 어느 호스트에 쓰는지, leaf-root에서는 어디에 쓰는지, 그 기록 자체의 UpdateSettle을 상한 뒤 어떻게 배달하는지 정하지 않았습니다. 모델은 파동 초과를 별도 진단값으로 노출했고 규정되지 않은 settle 상태를 발명하지 않았습니다.

## 10. 나머지 주장과 결론의 범위

| 주장 | 판정 | 근거·한계 |
| --- | --- | --- |
| A1-1 순수 계산 | 통과 범위 | 모든 모델 라운드에서 compute 전후 raw/selection/extras 불변 단언. 이력 차이는 default 쓰기를 통한 상태 차이로 나타납니다. 참조 최적화는 아래 모순을 고쳐야 합니다. |
| A3-1 마지막 완료 raw와 계산 일치 | 통과 범위 | 토글 및 긴 단조 inject에서 raw=emit을 확인했습니다. [legacy-experiments.mjs:76](../spikes/work-loop/codex4/legacy-experiments.mjs#L76). 최종 &derived 재평가 전체는 미검증입니다. |
| A4-1 바퀴 수·고정점 | 반례/제한 필요 | preloaded 체인은 2/N+1. default 체인은 25라운드 상한에서 멈추며, 상속 자기 피드백도 고정점에 닿지 않습니다. |
| A4-2 lifted-null/빈 union | 통과 | 부모 가드와 자식 {} 예외를 함께 실행했습니다. [attack-experiments.mjs:58](../spikes/work-loop/codex4/attack-experiments.mjs#L58) |
| B2-1 같은 핸들러 렌더와 캐럿 | 미검증 | 동기 디스패처 모델은 React의 caret/IME/T-1 증명이 아닙니다. 현재 nullable 테스트도 이 주장을 검사하지 않습니다. |
| B2-2 1,000 통지=렌더 한 번 | 미검증 | batch/React commit 계측을 실행하지 않았습니다. 동기성만으로 해당 렌더 횟수를 증명하지 않습니다. |

**A1 참조 규칙의 모순:** [17행](./round-4-spec.md#L17)의 “emit의 참조는 자식 emit의 참조가 하나라도 바뀌었을 때만 바뀐다”는 extras·호스트 raw·활성 키 집합의 변경을 빠뜨립니다.

```text
{a:1,extra:1} → extra=2 → {a:1,extra:2}
선언 자식 a의 상태는 동일
```

근거: [attack-experiments.mjs:164](../spikes/work-loop/codex4/attack-experiments.mjs#L164). 모델은 값 변화만 확인했습니다. **추론:** 자식 emit이 같다는 이유로 호스트 참조를 재사용하면 새 extra를 표현할 수 없고, 기존 객체를 패치하면 B4의 이전 커밋 payload를 훼손할 수 있습니다. 참조 규칙의 필요조건을 자식 emit에만 제한하는 문장을 고쳐야 합니다.

## 11. 재현 검증 기록

- 모델: 위 `yarn node …/codex4/run.mjs`, **48개 실험의 관측 단언 통과**, Ajv **8.17.1**.
- `yarn workspace @canard/schema-form lint`: 종료 코드 0.
- `yarn workspace @canard/schema-form typecheck`: 종료 코드 0.
- `yarn workspace @canard/schema-form test --run src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx`: **1파일·8테스트 통과**. nullable oneOf에서 두 분기가 null을 허용한다는 기존 경고가 출력됐습니다.
- `yarn workspace @canard/schema-form test --run`: **180초 제한으로 ETIMEDOUT**, 전체 결과 미확정. 이를 실패 테스트 개수나 전체 통과로 바꾸어 보고하지 않습니다.
- 제품 소스·스키마 명세는 수정하지 않았습니다. 실행 모델, 관측 결과, 계획, 이 보고서만 추가했습니다. 빌드 산출물과 커밋은 만들지 않았습니다.

**수정 우선순위에 대한 추론:** B3의 종료 계약, A2 로드 단계의 순서, A5의 빈 입력 승격을 먼저 결정하는 편이 좋습니다. 그 뒤 union 무통과 선택·필드 에러 라우팅, residual의 루트 오류 소유권, Refresh/검증 스탬프의 생명주기를 구체화해야 합니다. 지정된 nullable 세 단언의 통과만으로 이 나머지 계약까지 확정할 수는 없습니다.

