# Round 5 — 구현 비용·위험·되돌림 비용

분석일: 2026-09-22. 권고나 결정 변경은 하지 않습니다. `HANDOFF.md` §2의 D-1–D-10을 비교하며, 확정 사항은 D-5의 방향, D-7(a)+호출별 수정자, D-8의 전제 철회, D-9(b), D-10(c)로 취급합니다. `round-4.md:151`의 F29–F32가 이전 A7·F22보다 우선합니다. `src`와 기존 프로토타입은 수정하지 않았습니다.

## 1. 표를 읽는 기준

- 구현 비용은 **v4에서 실제 제품 core로 옮길 때 해당 선택이 더하는 작업**입니다. 낮음은 국소 분기·배선, 중간은 쓰기/커밋 단계와 API·검증 연결, 높음은 여러 단계·소유권·호환성 처리를 함께 바꾸는 경우입니다. 인일 추정치는 아닙니다.
- 테스트 수는 **확인한 기존 테스트의 단언·fixture·API 이관 건수**입니다. 런타임 실패 예측과 같지 않습니다. `≥`는 근거 목록의 최소치이며, 모든 간접 fixture 소비자의 완전한 영향 집합이라고 주장하지 않습니다. `0*`는 해당 대안을 직접 구별하는 기존 단언을 찾지 못했다는 뜻입니다. 신규 회귀 테스트가 필요합니다.
- `it.each`는 정적으로 확인한 행 수로 셉니다. D-1의 `waysToNull` 세 행 중 기존 값이 있는 두 행만 변경으로 세었습니다. 한 테스트 본문의 반복문은 별도 테스트로 부풀리지 않았습니다. 결정 간 중복이 있어 열을 합산하면 안 됩니다.
- 소스 전체에서 `rg --files src`, `rg -n --glob '*test*'`로 후보를 찾고 TypeScript AST로 테스트 제목과 선언 위치를 추출했습니다. 재현용 도구와 목록은 `spikes/work-loop/round5/test-inventory.mjs`, `evidence.json`입니다. 줄 번호는 분석 시점 기준입니다. 아래 `src/...`는 패키지 루트 상대 경로, `proto/...`와 `REPORT-*.txt`는 `architecture/spikes/work-loop/` 상대 경로입니다.
- 동기 루프 전환 자체의 공통 비용은 옵션마다 중복 계산하지 않았습니다. T-5의 13개 파일에는 `flushOnMount: false`를 직접 사용하는 테스트 **26개**가 있습니다. F23에 따라 즉시 최종 상태를 단언하고, 비동기 검증·콜백 뒤에도 불변인지 확인하는 형태로 이관해야 합니다. 부록 E에 전부 기재합니다.

| D-n | 옵션 | 구현 비용 낮/중/높 | 바뀌는 테스트 수 | 되돌림 비용 | 얽힌 결정 |
| --- | --- | --- | --- | --- | --- |
| D-1 | null 전체 교체·blank 유지 | 중 | 0, 기존 blank 계약 유지 | 높음 | D-5·D-7·D-8 |
| D-1 | null 아래 이전 raw 보존 | 중 | ≥14 | 높음 | D-5·D-7·D-8 |
| D-2 | A: 단조 활성 | 중 | 0* | 중간 | D-3·D-5·D-8 |
| D-2 | B: 비단조+상한 | 높 | 0* | 중간 | D-3·D-5·D-8·D-10 |
| D-3 | i: 금지 필드 방출 제외 | 높 | 0* | 높음 | D-2·D-4·D-7 |
| D-3 | ii: 필드 표시+검증 에러 | 높 | 0* | 높음 | D-4·D-6·D-10 |
| D-3 | iii: 검증기에만 맡김+잔여 API | 중 | 0* | 높음 | D-4·D-7·D-10 |
| D-4 | Overwrite/Merge 공개·Refresh 자동 | 중 | ≥7 | 중간 | D-1·D-5·D-7·D-9 |
| D-4 | 기존 세부 비트의 의미까지 유지 | 높 | 0, 비트 계약 기준 | 높음 | D-2·D-5·D-7·D-10 |
| D-5 | 주입 기본 켬+disable 속성 | 중 | 0, 기본 동작 기준 | 중간 | D-1·D-7·D-8 |
| D-5 | 전체 교체 주입을 기본 끔 | 중 | ≥8 | 중간 | D-1·D-7·D-8 |
| D-6 | a: & 계열+core 참조 그룹 | 높 | ≥59 | 높음 | D-3·D-4·D-9·D-10 |
| D-6 | b: 렌더 계층으로 이동 | 높 | ≥59 | 높음 | D-4·D-9·D-10 |
| D-6 | c: 현행 virtual 유지 | 중 | 0, virtual 문법 기준 | 높음 | D-3·D-4·D-9 |
| D-7 | a: 로드 계약 유지+호출별 억제(확정) | 중 | 0* | 중간 | D-1·D-4·D-5·D-8 |
| D-7 | b: 직전에도 없던 키만 주입 | 높 | 0*, 문구에 반례 있음 | 높음 | D-1·D-2·D-5·D-8 |
| D-8 | a: 암묵 첫 분기 default(철회 대안) | 중 | 0* | 높음 | D-2·D-5·D-7 |
| D-8 | b: 원본 있는 호스트만 암묵 default | 중 | 0* | 높음 | D-1·D-5·D-7 |
| D-8 | 암묵 default 없음·빈 값 무선택(확정) | 낮 | 0*, 명시 default 유지 | 중간 | D-2·D-5·D-7 |
| D-9 | a: RequestRemount 제거 | 낮 | 3 | 낮음 | D-4·D-6 |
| D-9 | b: 사용자 명령으로 유지(확정) | 중 | 0, 기존 3개 유지 | 높음 | D-4·D-6·D-10 |
| D-10 | a: 파동당 동기 onChange | 중 | 0* + 헬퍼 6개 이관 가능 | 중간 | D-2·D-3·D-9 |
| D-10 | b: 매크로태스크 디바운스 | 중 | 0, 타이밍 계약 유지 | 높음 | D-2·D-3·D-9 |
| D-10 | c: 최외곽 동기 진입당 1회(확정) | 높 | 0* + 헬퍼 6개 이관 가능 | 높음 | D-2·D-3·D-7·D-9 |

D-4의 두 번째 행은 명시적인 별도 이름이 붙은 HANDOFF 선택지가 아니라, 첫 번째 안과 비교할 **현재 내부 비트 계약을 보존하는 기준선**입니다. D-5의 두 번째 행은 `round-3.md:92`에 기록된 이전 방향입니다. D-7의 수정자 없는 (a)는 확정된 (a)+수정자의 부분집합이므로 별도 행으로 부풀리지 않았습니다.

## 2. 구현 기준선과 공통 위험

v4의 노드는 `raw/pendingRaw`, `selection/pendingSelection`, `extras/pendingExtras`, `local/emit/next*`, `fragOn/nextFragOn`, `dirtyKids`, `replaced/absent`, `revision/signals/listeners`를 가집니다(`proto/loop-v4.mjs:100`). 루트는 `initialValue`, `options`, `replacedHosts/computedHosts`, `dispatching/waveQueue`를 추가로 가집니다. 쓰기는 `applyValue:432` → `setValue:529`/`write:552`, 계산은 `computeObject:875`, 주입은 `derive:933`·`transition:993`, 정착은 `settle:1126`, 통지는 `dispatch:1190`입니다.

**v4는 최종 F1–F32 구현이 아닙니다.** 이미 구현되었다고 비용에서 제외하면 안 되는 항목은 다음과 같습니다.

| 교정 | v4와 제품 core 사이의 작업 |
| --- | --- |
| F1·F7·F10 | `clearNonObjectAncestors:540`은 자식 emit의 존재 여부를 확인하지 않습니다. `reported` 값 비교 대신 쓰기 출처를 기록하고, 사용자 부분 쓰기만 null 조상을 승격해야 합니다. default·injectTo는 승격하지 않습니다. |
| F2·F3·F12·F13 | `ROUND_CAP=25` 하나를 파생 25/전이 예산으로 분리합니다. 조건부 조각만 세고 자식 budget 상태를 조상에 전파합니다. `sweepOnce:847`의 즉시 반영은 유지하되 토글마다 전체 `compose`하는 비용을 키 단위 패치로 옮깁니다. |
| F4·F5·F6·F9 | 전체 교체의 전이 기준, 자식 overlay 메모, 통과 분기+키 점수, extras·활성 키를 포함한 emit 참조 규칙을 연결합니다. v4 `initialSelection:415`는 통과 여부를 검사하지 않으며 기본 index 0입니다. |
| F8·F26·F28 | 검증기 오류를 잔여 키로 라우팅하고 latent raw 열거를 추가합니다. 검증 결과에 commit 번호를 붙입니다. F26의 revision만으로는 같은 revision의 서로 다른 커밋을 구별할 수 없으므로 F28의 commit stamp가 필요합니다. |
| F11 | `derive:933`의 대상값 비교를 원천 emit의 직전 커밋 대비 변화로 제한합니다. 대상에 사용자가 쓴 값을 매 정착마다 되돌리는 문제와 관련됩니다. |
| F15–F21·F28 | 틱당 파동 예산, 마지막 배달 중 쓰기 거부, 커밋 시 전체 revision 선증가, 파동 시작 시 리스너 고정/해지 확인, batch throw 정착, 마지막 통지값 previous, 활성 변경 배달, 오류 채널, 불변 payload가 필요합니다. v4는 상한을 기록해도 루프를 종료하지 않습니다(`dispatch:1205`). |
| F14·F23·F24·F27 | 캐럿/IME·동기 DOM 검사, 공통 26개 하네스 이관, caller 객체 불변성, 비객체를 버리지 않는 계약을 검증합니다. 브라우저 IME와 React remount의 실제 비용은 이 JS 프로토타입으로 측정할 수 없습니다. |
| F25·F29–F32 | 호출별 load 출처, 암묵 default 제거, setValue 수정자, 최외곽 콜백, Remount 명령을 구현합니다. F31은 F22를 대체합니다. |

`04-inherited-constraints.md`의 T-6에는 revision 직전 증가, T-9에는 F22, “사라지는 장치”에는 틱 초기화 삭제가 남아 있습니다. 본 분석은 각각 F16·F31·F15를 적용했습니다. 이 문서들의 오래된 문장을 별도의 확정 계약으로 세지 않았습니다.

## 3. 결정별 구현·테스트·성능·되돌림

### D-1 — null 전체 교체와 잠복 raw

**유지안, 구현 중.** v4 `applyValue:439`의 비객체 분기에서 자식 `erase:392`와 extras 초기화를 유지합니다. `replaced`를 이용해 활성/무조건 자식 default를 전이 단계에서 채우며 호스트 `raw=null`이 emit을 지배합니다. blank는 새로운 값 저장소가 아니라 로드 계약의 결과입니다(`round-4-spec.md:38`). 이전 라운드의 “셋째 칸 필수”는 현재 안에는 적용되지 않습니다. 다만 `initialValue/defaultValue`의 초기 스냅샷은 reset을 위해 별도로 유지해야 합니다. 부모의 객체 default가 자식 default보다 우선하는 blank 생성, 그 객체 default의 extra 키, null 상태에서 빈 입력의 비승격(F1)은 단순 leaf default 순회만으로 구현되지 않습니다.

**보존안, 구현 중.** null 입력 시 자식 raw·extras·selection을 지우지 않고 호스트 raw만 씁니다. nullable host의 emit 차폐와 부분 입력 승격은 유지합니다. 원본 없이 처음 null을 받은 경우와 이미 편집한 객체를 null로 덮은 경우를 구별해야 하므로 default 전이와 UI의 노출 기준을 다시 정의해야 합니다. 공개 함수 모양은 같지만 null의 값 의미가 달라집니다.

**테스트.** 유지안은 #338 blank 단언을 보존합니다. 보존안에서 확인한 변경은 부록 A의 **11개 선언·14개 실행 케이스**입니다. 예를 들어 `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx:31`의 `refreshes the child inputs to their schema defaults when the object is set to null`은 `edited`가 `because`로 바뀌어야 한다고 고정합니다. 같은 파일 `:53`의 빈 입력 비승격은 양쪽 모두 유지해야 하며 14개에 넣지 않았습니다. minItems의 별도 core 정책 변경은 D-1 변경 수로 추가하지 않았습니다.

**성능.** 이번 600 default leaf의 “null 쓰기+자식 하나 승격”은 clear **109.692 µs**, retain **1.289 µs**입니다. clear는 1,204노드 방문·600주입·3라운드, retain은 3방문·0주입·2라운드입니다. retain 수치는 null 경로만 메모리에서 바꾼 실험이며 새로운 초기화 계약 전체의 속도가 아닙니다. 전체 교체 O(서브트리), 보존 O(호스트+승격 경로)의 차이입니다.

**되돌림: 양쪽 높음.** 보존→삭제는 이전 레코드 값이 다시 나타나던 동작을 중단하고 blank 테스트를 복구해야 합니다. 삭제→보존은 이미 지운 raw를 복구할 수 없어 원본 재로드가 필요합니다. 파일 포맷 마이그레이션은 core에 없지만 이미 저장된 JSON의 의미와 잠복 데이터는 별개입니다. D-7의 멱등성 정의, D-5의 default 억제, D-8의 host 존재 판단을 함께 바꿔야 합니다.

### D-2 — 단조 A / 비단조 B

**A, 구현 중.** `sweepOnce:860`에서 한 번 켜진 조각을 같은 계산의 후속 sweep에서 끄지 않습니다. `fragOn/nextFragOn`, 고정 시작 집합, 전순서, default 전이 단계는 여전히 필요합니다. grow-only이므로 한 계산의 토글 수는 제한되지만, 전체 정착의 derive/transition 예산과 통지 파동 상한은 없어지지 않습니다. 부정 가드의 최종 참/거짓과 활성 집합이 다를 수 있습니다.

**B, 구현 높.** v4의 참/거짓 토글과 `nFrag+1` cap을 출발점으로 F2·F3·F5·F12·F13을 구현합니다. host/루트 `settle.status`, 예산별 카운터, `UpdateSettle` 성격의 통지, 개발 모드의 커밋·통지 후 throw가 필요합니다. 수렴하지 않은 값을 프로덕션에서 관측할 수 있어야 합니다.

**테스트.** 직접 바뀐다고 입증한 기존 테스트는 양쪽 **0***입니다. 현재 `flattenConditions`는 `if.properties`와 `then.required`를 읽습니다(`src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts:44`). 해당 테스트 `.../getFieldConditionMap/__tests__/flattenConditions.test.ts:8`의 `should flatten const if-then-else with single if-then`, `:319`의 `should handle deeply nested if-then-else (3+ levels)`는 기존 지원 범위의 회귀 대상이지 A/B의 차이를 증명하지 않습니다. 새로 부정 순환, 자식 cap 전파, overlay 재계산, 상한 뒤 raw/emit 일치를 고정해야 합니다. 기존 computed 무한루프 검사는 공통 하네스 비용입니다.

**성능.** REPORT-v4 `:173`은 정순 200조각 **2 sweep/400 guard/4.1 ms**, 역순 **201 sweep/40,200 guard/19.0 ms**입니다. F13 전의 전체 재합성 비용입니다. 이번 항상 참인 100조각은 A **1,069.478 µs**, B **1,065.055 µs**, 양쪽 200가드·100리빌드였습니다. 이 작은 차이로 A의 성능 우위를 주장할 수 없습니다. `semantics.mjs`의 `not hasOwn(x)` 실험은 A가 `{x:1}`을 stable로 남기고 B는 2 sweep 뒤 `budget-exceeded`가 되는 차이를 확인합니다.

**되돌림: 양쪽 중간.** 슬롯과 public setValue 형상은 공유할 수 있으나 같은 스키마의 활성 필드·저장 payload가 달라집니다. 가드 반례와 budget 관측 테스트를 교체해야 합니다. D-3의 금지 투영을 가드가 읽으면 추가 순환이 생기며, D-5·D-8의 default 생성이 라운드 수를 늘립니다. D-10은 불안정 종료를 콜백으로 언제 전달하는지 제한합니다.

### D-3 — 금지 조각 세 가지

**i 방출 제외, 구현 높.** v4에는 없는 금지 조각의 선언/활성 정보와 키별 제외 상태를 추가합니다. `compose:789` 또는 `publishHost:911`에서 local과 emit을 나누고, guard가 읽는 값도 같은 투영을 거치게 해야 합니다. raw는 남겨야 하므로 “제거”는 raw 삭제와 구별됩니다. `not:{required:[a,b]}`를 a와 b 각각의 금지로 잘못 해석하면 검증 의미가 바뀝니다. validator의 거절값이 emit에서 사라지는 계약 변경입니다.

**ii 표시+에러, 구현 높.** emit은 보존하지만 `properties:{a:false}`처럼 입력 스키마가 없는 값에도 편집/삭제 표면을 제공해야 합니다. 기본 선언이 있는 필드는 그 노드에 오류를 붙이고, 선언 자체가 없는 금지 키에는 generic/terminal 표현 또는 별도 항목이 필요합니다. core의 소유 노드·schemaPath→instancePath 연결, 렌더러의 입력 타입 선택까지 추가됩니다. v4의 object/leaf만으로 false-schema 입력의 타입을 정할 수는 없습니다.

**iii 검증기에만, 구현 중.** v4 `declareFragments:252`와 `computeObject:875`에는 금지 조각을 추가하지 않습니다. 기존 노드로 선언되지 않은 값은 `extras`, 비활성 선언값은 해당 자식 raw에 남습니다. F8·F26의 `residual`/`latent` 읽기 및 `removeKey` 삭제 API를 추가합니다. `additionalProperties` 오류는 validator의 `params.additionalProperty` 등을 이용해 실제 키 경로로 정규화해야 합니다. host의 `not` 오류를 임의 자식 오류로 바꾸면 안 됩니다. 비활성 raw는 emit에 없으므로 검증기가 기각한 residual로 간주하지 않습니다.

**테스트.** 세 안 모두 직접 계약을 구별하는 기존 테스트는 **0***입니다. `src/core/__tests__/ObjectNode.composition.nullUnreachableWarning.test.ts:147`의 `type으로 이미 null을 배제한 분기는 셀 수 없는 키워드가 있어도 받아들이지 않는 분기로 세어 경고해야 함`에는 `not`이 있으나 값 방출/잔여 목록이 아니라 경고 횟수를 검사합니다. 이를 영향 테스트로 부풀리지 않았습니다. false-property, not-host 오류, undeclared extra 삭제, latent 삭제, stale 검증 결과 폐기는 신규 계약입니다.

**성능.** v3는 prohibition을 투영에서 제외했습니다(`REPORT-v3.txt:62`). 그러나 v3↔v4는 다른 변경이 섞여 있어 D-3 전용 차이를 계산할 수 없습니다. 이번 600키 쓰기+열거는 keep **1.481 µs**, 100키를 copy/delete로 제외하는 proxy는 **24.244 µs**입니다. 이는 금지 파서·가드·validator를 포함하지 않는 **투영 비용의 예시**이며 F13식 패치의 예측값이 아닙니다. ii/iii의 검증기 비용은 같은 원본을 검증한다면 공통이고, residual 생성은 오류 수+경로 조회에 비례합니다. 실제 residual 구현이 없는 v4로 그 완성 비용을 숫자로 단정할 수 없습니다.

**되돌림: 세 안 모두 높음.** i→ii/iii는 이미 전송·저장 시 빠진 키를 되찾을 수 없습니다. ii→iii는 `/a` 입력노드가 없어지고 residual UI로 바뀔 수 있습니다. iii→ii는 residual 경로 API 소비자를 노드 API로 연결해야 합니다. ii↔iii는 JSON 자체의 필수 마이그레이션 없이 가능하지만 public node/find/오류 경로가 바뀝니다. D-4의 extras 정규화, D-7의 emit round-trip에서 latent 손실, D-10의 검증 stamp, D-6의 표현 전용 노드 소유권과 연결됩니다.

### D-4 — 쓰기 선언과 세부 비트

**Overwrite/Merge+자동 Refresh, 구현 중.** v4 `setValue:529`·`applyValue:432`가 두 경로의 골격입니다. Overwrite는 extras·selection·없는 자식을 초기화하고 Merge는 지정 키만 적용합니다. F7을 위해 `originNode`와 쓰기 이유(input/load/derive/transition/listener)를 내부 write record에 넣어야 합니다. `Refresh`는 공개 강제 비트가 아니라 그 기록과 실제 raw 변경으로 결정합니다. 배열 Merge의 의미는 A2에서 미결이므로 object Merge의 비용을 배열에 그대로 적용하면 안 됩니다.

**기존 세부 비트 의미 유지, 구현 높.** `src/core/types/value.ts:26`의 Replace/EmitChange/Propagate/Refresh/Batch/Isolate/Normalize/PublishUpdateEvent/PreventInjection/Automatic 조합을 새 dirty·settle·dispatch에 번역해야 합니다. 특히 전파/통지를 끄는 조합은 “반환 시 정착된 트리”와 충돌하고, PreventInjection은 reset→injectTo 계약을 바꿉니다. `Normalize`는 D-3의 extras 보존과 충돌합니다. **현재 패키지 public export는 이미 두 옵션뿐**입니다(`src/index.ts:45`, `src/core/types/value.ts:69`); 내부 enum 전체를 현재 Form API라고 부르지 않습니다. 내부/core 소비자와 새 public modifier를 구분해야 합니다.

**테스트.** 새 선언안에서 확인한 변경은 부록 B **7개**입니다. Default로 외부 setValue를 해도 Refresh가 없어야 한다는 5개, Default를 사용하는 정밀 이벤트 큐 1개, 같은 값을 Overwrite해도 UpdateValue를 내야 한다는 1개입니다. 후자는 “raw 변경 시 Refresh/변경 노드만 배달” 계약과 함께 다시 정해야 합니다. 기존 Merge/Overwrite의 최종 값 회귀는 유지합니다. `RefreshAndDefaultValue.test.ts:198`의 sync UpdateValue와 async Refresh 분리 단언은 공통 이벤트 재설계 비용이며 이 7개에 넣지 않았습니다.

**성능.** 600자식에 `{f0:새값}`을 적용하면 Overwrite **37.879 µs/601방문**, Merge **6.392 µs/2방문**입니다. 최종 payload는 각각 1키/600키이므로 동치 작업의 경쟁이 아닙니다. v4 Merge도 `applyValue:489`에서 자식 전체를 순회합니다. API 선언 두 값의 분기 비용보다 순회·지우기·주입 범위가 지배적입니다. 10,000×5 전체 교체는 REPORT-v4 `:295`의 **11.98 ms**가 기준입니다.

**되돌림.** 선언안→호환 비트 추가는 중간: public Overwrite/Merge를 그대로 두고 adapter를 더할 수 있지만 출처 기반 Refresh와 충돌하는 비트에는 명세가 필요합니다. 비트 유지→제거는 높음: core 소비자 옵션 조합·quiet write·reset 동작과 테스트를 고쳐야 합니다. D-1·D-5·D-7은 동일한 write record를 사용하고, D-9는 자동 Refresh로 해결하지 못하는 명시적 remount 수단을 남깁니다.

### D-5 — 로드 default 억제

**기본 주입+disable 속성, 구현 중.** 이름은 후보 `disableDefaultInjection`입니다. v4 `ensureRoot:233`와 `settle:1136`에 boolean이 있지만 `replacedHosts.length>0`만으로 load를 판단하므로 F25와 같지 않습니다. 호출자 defaultValue/reset/Overwrite에서 생성된 write token을 해당 정착의 전이 라운드 끝까지 전달해야 합니다. 리스너·injectTo·사용자 입력에서 생긴 새 정착은 load가 아니므로 suppression을 상속하지 않습니다. batch 안에 서로 다른 suppression 요청이 섞일 때 root boolean 하나로 덮으면 요청 하나가 다른 요청을 오염시킵니다. 요청별/대상별 적용 또는 혼합 제한을 명시하는 작업이 남습니다.

**전체 교체 주입 기본 끔, 구현 중.** 같은 기제를 사용하되 기본 정책이 반대입니다. 여기서는 F25의 초기 로드·reset·Overwrite에 동일하게 적용하는 대안을 비용화했습니다. “데이터 로드만 끄고 빈 폼 생성은 예외”를 두면 별도의 초기화 사건 구분이 더 필요하며 아래 8개 수를 그대로 사용할 수 없습니다.

**테스트.** 기본 켬은 기존 default 테스트의 기본 호출 기대값을 보존합니다. 기본 끔은 부록 C의 **6개 선언·8케이스 이상**을 바꿉니다. 부모 default와 자식 default 병합, 객체 배열의 빠진 child default, nested oneOf/anyOf 초기 default가 포함됩니다. minItems 자동 채움 폐지는 ADR 0013의 별도 변경이므로 여기서는 세지 않았습니다. switch=true와 이후 사용자 전이의 재주입을 구분하는 기존 옵션 테스트는 없으므로 추가가 필요합니다.

**성능.** 600 default leaf에서 한 키만 제공하는 반복 Overwrite: 켬 **138.462 µs**, 끔 **35.688 µs**입니다. 주입 599→0, 라운드 2→1, 방문 1,202→601입니다. 동일한 결과를 더 싸게 만든 수치가 아니라 결과 데이터가 600키→1키로 달라지는 비용입니다.

**되돌림: 양쪽 중간.** boolean/수정자 형상은 유지할 수 있지만 default 플립은 저장되는 키와 렌더 필드를 바꿉니다. 명시 옵션으로 이전 동작을 고정하는 마이그레이션이 필요합니다. 이미 채워 저장한 값은 나중에 “사용자가 입력한 값인지 자동 default인지” 판별할 수 없습니다. D-7 호출별 수정자와 같은 범위를 공유해야 하며, D-1의 null blank와 D-8의 명시 판별 default도 영향을 받습니다.

### D-6 — virtual 소유권

**a 참조 그룹, 구현 높.** v4 `kind`에 표현 전용 group을 추가하되 raw/local/emit 소유권은 주지 않습니다. `references`, 이름 기반 identity, 참조 노드의 revision 묶음, 읽기 전용 tuple 메모가 필요합니다. setValue는 참조 노드에 배치로 부채질하고 그룹 Refresh·Remount/구독은 참조 갱신과 연결합니다. object 합성·가드·validator에서는 그룹 이름을 제외합니다. 스키마는 `&virtual` 같은 후보로 옮기고 required에는 실제 필드만 둡니다. JSONSchema 판정 원본을 바꾸던 required 펼치기는 제거됩니다.

**b 렌더 계층, 구현 높.** core의 group 슬롯/검색/이벤트는 없어집니다. binding이 참조 lookup, tuple 구독, 여러 필드 setValue의 batch, active wrapper와 focus/refresh를 소유합니다. `/period`를 node.find로 찾거나 setValue하던 계약은 binding API로 이관해야 합니다. core 비용은 줄지만 React 외의 renderer마다 묶음 구현이 필요합니다.

**c 현행 유지, 구현 중.** v4에는 기존 VirtualNode가 없으므로 그대로 복사해 끝나는 낮은 비용이 아닙니다. 형제 참조·이벤트를 새 dispatcher로 연결하고 object 자식 순회에서 virtual을 건너뛰는 규칙을 유지해야 합니다. 기존 `virtualRequired`/required 펼치기는 검증기 원본 불변 ADR 0001과 충돌한 채 남습니다(`round-3.md:99`). 이를 동치 계약 만족으로 표시할 수 없습니다.

**테스트.** 전용 4파일은 실제로 **47개**입니다(렌더12+노드10+전처리10+변환15). 이 가운데 virtual 없는 schema 2개를 제외한 45개, 다른 파일의 virtual fixture 6개, `flattenConditions`의 virtualRequired 계약 8개를 합쳐 a/b에서 확인한 이관 집합은 **59개**입니다(부록 D). 이는 “59개의 최종 DOM 기대값이 바뀐다”는 뜻이 아닙니다. a는 다수의 fixture 문법·검증 변환 단언을 바꾸면서 DOM과 tuple 동작을 보존할 수 있고, b는 core node 계약 자체를 binding 테스트로 옮깁니다. c의 문법별 변경은 0이지만 공통 동기 이벤트 이관은 남습니다.

**성능.** 2참조 쓰기를 batch로 묶은 proxy는 **0.433 µs/1정착**, 각 참조를 따로 쓰면 **0.722 µs/2정착**입니다. tuple 두 값의 읽기·생성은 **0.015 µs**입니다. 이것은 위치(a/b)의 본질적 속도 차이가 아닙니다. binding도 같은 batch를 사용하면 같은 core 경로를 탈 수 있습니다. 그룹 subscribe/React wrapper/required 전처리 전체는 측정하지 않았습니다. REPORT-v4 `:296`의 1,000쓰기 배치 **335 µs/1정착**은 부채질을 한 배치로 묶는 구조의 참고값입니다.

**되돌림: 셋 모두 높음.** a↔b는 find 경로·group 타입·명령/구독을 사용하는 소비자를 바꾸며, a/c는 저장된 스키마의 virtual 키와 required 가상 이름을 마이그레이션합니다. BE validator에 실제 필드 required를 전달해야 하므로 FE 별칭만 바꾸는 것으로 끝나지 않습니다. 일반 JSON 값에는 virtual 키가 없으므로 값 데이터 자체의 필수 마이그레이션은 아닙니다. D-4의 group setValue, D-9의 remount, D-10의 batch 콜백, D-3의 입력 없는 잔여 표현과 연결됩니다.

### D-7 — round-trip 멱등성

**a+호출별 억제, 구현 중, 확정.** `setValue:529`에서 mode와 별도로 suppression 수정자를 받아 write token에 저장하고 D-5와 같은 F25 범위에만 전달합니다. 수정자가 없으면 `replaced`가 전이 기준을 비우므로 삭제된 default 키가 로드에서 다시 생길 수 있습니다. 새 노드별 이력 칸은 필요하지 않습니다. 수정자 없는 원래 (a)는 같은 경로에서 옵션 디코딩/API만 빠진 부분집합입니다.

**b 문구 그대로, 구현 높.** Overwrite 전에 노드별 committed 존재 여부 또는 emit key snapshot을 잡고, erase 뒤 전이 단계에서 후보를 대조해야 합니다. 부모 emit이 null인 경우의 자식 존재, latent raw와 projected absence, batch 중 여러 Overwrite의 “직전”을 정의해야 합니다. **그런데 문구의 조건은 멱등성을 보장하지 않습니다.** default `x='D'`를 사용자가 지운 뒤 commit은 `{keep:1}`입니다. `setValue(getValue())`에서 x는 입력에도 없고 직전 commit에도 없으므로 b의 조건을 통과하여 다시 주입됩니다. `round5/semantics.mjs`에서 literal b를 넣어 `{keep:1}` → `{keep:1,x:'D'}`를 확인했습니다. 문서 `round-4.md:113`의 “멱등”과 조건식이 일치하지 않습니다.

실제로 삭제 의도를 보존하는 별도 대안을 구현한다면 tombstone/삭제 출처, 입력 emit과 기존 raw의 비교, 또는 별도 로드 사건 구분이 필요합니다. 이는 b의 문구를 구현한 것과 다르며 본 보고서는 그 규칙을 선택하지 않습니다. 또한 suppression은 **default 재주입만** 억제합니다. emit에 없는 latent raw까지 Overwrite에서 보존해 주는 옵션은 아닙니다(D-1·D-3·F26).

**테스트.** 양쪽 **0***입니다. grep에서 `setValue(getValue())`의 삭제-key/default round-trip을 직접 고정한 현재 테스트를 찾지 못했습니다. `src/core/__tests__/RefreshAndDefaultValue.test.ts:221`의 `should still publish UpdateValue when setting the same value with Overwrite option`은 scalar 이벤트 횟수라 이 문제의 대체 검사가 아닙니다. 수정자/기본 호출, null/latent, batch 혼합, listener 새 정착을 새로 고정해야 합니다.

**성능.** a의 suppression 켬/끔은 D-5의 **35.688/138.462 µs** 경로가 참고값입니다. 호출별 token 전파 전체 비용은 아직 포함되지 않습니다. b에 필요한 600키 존재 snapshot을 앞에 추가한 proxy는 **184.685 µs**, snapshot 없는 주입 경로는 **138.462 µs**입니다. 차이 **46.223 µs**는 이 구현의 `map+hasOwn` 비용이며 b 전체 알고리즘이나 필수 하한이 아닙니다. 과거 snapshot 없이 boolean 슬롯을 갱신하는 대안은 다른 결과가 날 수 있습니다.

**되돌림.** a→이력 기반은 중간: 수정자 API를 호환 경로로 유지할 수 있으나 default 의미가 바뀝니다. b→a는 높음: tombstone을 별도로 도입했다면 그 메모리 상태·복원·저장 규칙을 없애고 멱등성에 의존하던 소비자를 고쳐야 합니다. D-1의 erase, D-2의 전이, D-5의 Form/호출 우선순위, D-8의 판별 키 생성에 직접 제약을 줍니다.

### D-8 — 암묵 판별 default와 무선택

**a 첫 분기 암묵값, 구현 중.** blueprint에서 판별 k의 explicit default가 없을 때 첫 branch의 const/enum 값을 default 후보로 만듭니다. 계산 중 raw를 바꾸지 않고 전이 단계로 보내야 합니다. 그 값이 중첩 호스트를 실체화하고 다음 라운드에서 branch default를 생성합니다.

**b host 원본 조건부 암묵값, 구현 중.** a의 fallback에 load 입력의 host 존재 표식을 더합니다. object host는 분배 뒤 `raw===undefined`가 정상이라 raw 하나로 판정할 수 없습니다. `absent`도 자식 자동 주입으로 바뀔 수 있어 “로드에 host 키가 있었다”는 스냅샷/출처가 필요합니다. 여기서 b는 **암묵 fallback만 제한하며 explicit default는 D-5를 따르는 해석**입니다. explicit default까지 막는 해석은 별도 동작이며 D-5의 ≥8개 영향 집합과 겹칩니다.

**철회안, 구현 낮, 확정.** 암묵 fallback을 만들지 않습니다. 판별 k는 존재하되 undefined이고 어떤 분기도 활성화하지 않습니다. 선택 가드도 빈 값이면 `selection=-1` 같은 무선택 상태를 가집니다. v4 `makeNode:123`, `erase:405`, `initialSelection:415`의 0 기본값을 수정해야 하므로 “v4 그대로”는 아닙니다. F6의 키 점수는 **판별식 없는 union**에서만 적용하며, 비어 있지 않은 입력에 대해 통과 분기를 먼저 찾고 동점은 문서 순서로 풉니다. 빈 값 예외는 F29가 우선합니다.

**테스트.** 현재 구현의 `oneOfIndex=-1`은 `ComputedPropertiesManager.ts:106`, 초기 연결의 index 확인은 `BranchStrategy.ts:735`에 있습니다. 각 옵션을 구별하는 “값 없음+판별 default 없음”의 기존 명시 테스트는 **0***입니다. `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:52`의 `first branch (index 0)`, `:129`의 `const-discriminated branch (index 2)`와 부록 C의 explicit default 테스트는 계속 유지해야 합니다. default가 있는 기존 테스트를 암묵값 규칙의 근거로 세지 않았습니다.

**성능.** 이번 빈 2필드 union은 암묵 fallback 없음 **0.302 µs/1라운드/0주입**, 첫 값 fallback proxy **0.585 µs/2라운드/1주입**입니다. b는 host 없음에서 전자, host 있음에서 후자의 경로에 존재 판정이 더해집니다. 다만 반복 Overwrite에서 v4가 `{kind:'a',a:'A'}`를 `{kind:'a'}`로 만드는 전이 결함을 `semantics.mjs`에서 확인했습니다. `replaced`를 첫 라운드 뒤 지우는 `settle:1147`와 기존 fragOn 비교가 원인 경로입니다. 따라서 이 숫자는 branch default 전체 복원 비용의 측정이 아닙니다. F4를 충족하는 구현에는 추가 전이 기록/주입이 필요합니다.

**되돌림.** a/b→무선택은 높음: 이전에 자동 생성·저장된 discriminator를 삭제할지 실제 사용자 입력으로 유지할지 core는 알 수 없습니다. 무선택→a/b는 중간: 함수 signature 변화 없이 가능해도 첫 렌더 필드·validation·저장값이 달라집니다. D-5/D-7의 억제는 explicit/implicit default를 우회 주입할 구실이 아니며, D-1의 null과 D-2의 전이 예산에도 영향을 줍니다.

### D-9 — RequestRemount

**제거, 구현 낮.** public event/명령 타입·tracker mask·wrapper version 구독을 제거합니다. v4에는 Refresh 비트 하나만 있으므로 추가 명령 배달 구현을 피할 수 있습니다. 하지만 사용자의 임의 입력 컴포넌트 내부 상태 초기화 수단이 사라집니다.

**유지, 구현 중, 확정.** 값 변경 없는 signal-only entry를 dispatcher에 넣고 revision(mask)을 올립니다. `commit:1054`의 signal-only 경로와 `dispatch:1190`에 public 명령을 연결합니다. renderer는 현재 `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:84`의 tracker와 `:89`의 Wrapper key 증가를 유지합니다. 값 슬롯을 지우거나 default를 재주입하지 않습니다. focus/select와 달리 deferred subtree를 자동 reveal할지까지 Remount에 부여한 결정은 없습니다(T-3·T-18). RequestRefresh와 RequestRemount는 대상과 목적을 합치지 않습니다.

**테스트.** 제거하면 부록 F의 **3개**가 바뀝니다. 핵심은 `src/__tests__/scenarios/refresh.uncontrolled-value.render.test.tsx:278`의 `publishing RequestRemount remounts the subtree (Wrapper key bump)`입니다. 다른 두 개는 해당 비트의 revision을 실제로 사용하는 ledger 테스트입니다. 유지하면 이 3개를 보존하고 signal-only/파동 중 구독·해지/해당 subtree만 remount를 추가 검증합니다.

**성능.** v4에는 실제 Remount 명령이나 React가 없어 완전한 remount 시간을 측정할 수 없습니다. dispatcher listener fan-out proxy는 0 listener **0.279 µs**, 1,000 listener **3.087 µs**입니다. 차이 **2.808 µs**는 JS 배달 경로 참고값일 뿐 DOM remount 견적이 아닙니다. REPORT-v4 `:298`의 1,001구독자에서 경로상 2통지 **1.45 µs**, `:299`의 60,002통지 **14.44 ms**도 실제 전달 집합 크기를 구별해야 함을 보여 줍니다.

**되돌림.** 제거→복구는 낮음: 추가 API·renderer 배선을 되살리며 JSON 마이그레이션은 없습니다. 유지→제거는 높음: 이미 사용자가 이 탈출구에 의존하면 공개 API 삭제이며 사용자 컴포넌트별 대체 초기화가 필요합니다. D-4의 자동 Refresh, D-6의 group subtree, D-10의 signal-only entry가 onChange를 불러야 하는지와 연결됩니다. 값이 바뀌지 않는 명령은 값 콜백의 별도 호출 이유가 되지 않는다는 기준을 검증해야 합니다.

### D-10 — 루트 콜백의 경계

**a 파동당 동기, 구현 중.** `dispatch:1217`의 root-entry별 콜백을 wave마다 하나로 압축해야 합니다. 재진입한 여러 커밋의 root entry가 같은 wave에 여러 개 들어갈 수 있어 v4 코드를 그대로 “파동당 1회”라고 부를 수 없습니다. wave의 최종 emit·commit 번호를 모으고 검증도 그 경계와 맞춥니다.

**b 매크로태스크, 구현 중.** 루트에 timer handle, pending emit, 검증 commit 번호를 두고 새 변경마다 취소·재예약합니다. 현재 `AbstractNode.ts:1219`의 afterMicrotask 경로와 같은 시간 계약입니다. unmount/cancel, delayed validation, listener throw와 timer 오류 경로가 필요합니다. 동기 node 구독까지 지연시키는 안은 아닙니다.

**c 최외곽 동기 진입, 구현 높, 확정.** root별 `entryDepth`, `pendingRootChange`, 최종 emit/commit 번호, callback-drain 상태가 필요합니다. 외부 쓰기/명령/배치가 진입을 만들고 nested listener writes는 현재 진입에 합쳐집니다. `dispatching`만으로는 dispatch가 끝난 뒤 호출되는 onChange의 재진입까지 표현할 수 없습니다. 마지막 wave가 끝나고 한 번 콜백·검증 요청을 수행하며, 연속된 외부 `setValue(A); setValue(B)`는 두 진입입니다. `batch`로 감싸면 하나입니다. F15의 틱당 파동 cap은 이 entryDepth와 별개이며 매크로태스크로 예산을 초기화하는 것은 **onChange 디바운스**가 아닙니다.

**테스트.** root 콜백에 대해 a/b/c의 차이를 정확한 즉시 횟수로 고정한 기존 테스트는 **0***입니다. `src/core/__tests__/ObjectNode.propagate.batch.detailed.test.ts:178`의 `should count handleChange callback invocations`는 `<10`, `:216`의 `should analyze handleChange frequency with multiple child changes`는 `<15`라 세 대안을 구별하지 못합니다. `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.test.tsx:498`의 `빠른 연속 변경에도 최신값만 처리된다`는 주입 props 콜백이므로 root debounce 계약으로 세지 않았습니다.

`afterMicrotask`는 현재 root 경로가 유일한 제품 소비자입니다. a/c에서 내부 helper를 제거한다면 부록 G의 **6개**는 새 dispatcher 계약으로 이관합니다. 그중 `:8`의 즉시 미호출, `:19`의 취소/합치기, `:33`의 macro 순서는 바뀌는 시간 계약입니다. helper를 유지한 채 root에서만 끊는 경우 이 6개가 저절로 실패하지 않으므로 표에서는 root 0*와 분리했습니다. 공통 F23의 26개와 async validation stale-result 검사는 별도입니다.

**성능.** 1외부 write에서 listener가 네 번 더 써 5wave를 만드는 이번 proxy: a **1.509 µs/콜백5**, c **1.509 µs/콜백1**, b **2.233 µs/동기콜백0**입니다. b는 timer 취소·예약 CPU만 쟀고 대기 지연과 뒤의 콜백/validator 실행은 포함하지 않았습니다. c는 외부 runner의 끝에서 콜백을 한 번 호출하는 proxy라 전체 F15–F21 재진입 구현 비용이 아닙니다. 동일한 단순 콜백에서 a/c 시간이 같아도 비싼 실제 검증 요청은 5회/1회로 갈릴 수 있습니다. round-2 `:29`의 비배치 현재 **1,117 ms/1,000쓰기**는 timer 바닥을 포함하므로 순수 core의 1,000배 차이로 읽지 않습니다.

**되돌림.** a→c는 중간: 콜백 signature는 같아도 중간값 관측 횟수와 side effect가 바뀝니다. b↔c는 높음: 반환 전 콜백/검증 요청 여부와 React effect 순서를 소비자가 관측합니다. 데이터 스키마 마이그레이션은 없지만 타이머 대기·배치·재진입·검증 경합 테스트를 다시 써야 합니다. D-2의 budget 통지, D-3 residual의 신선도, D-7 요청 출처 경계, D-9 signal-only dispatch를 함께 고정해야 합니다.

## 4. D-7·D-9·D-10이 요구하는 API 표면

아래 이름과 TypeScript는 **후보 스케치**이며 확정 API가 아닙니다. 현재 `FormHandle.setValue`는 `src/components/Form/type.ts:122`, 함수값을 받는 setter 타입은 `src/types/formTypeInput.ts:202`, core의 updater 실행은 `AbstractNode.ts:355`입니다. 기존 updater 입력과 void 반환은 보존할 수 있습니다.

```ts
type WriteMode = 'Overwrite' | 'Merge';
type ValueInput<T> = T | null | undefined
  | ((previous: T | null | undefined) => T | null | undefined);

// Candidate: object options. Numeric flag modifier is another encoding.
interface SetValueOptions {
  mode?: WriteMode;                    // default: Overwrite
  disableDefaultInjection?: boolean;   // candidate name, F25/F30 scope only
}
interface ValueNode<T> {
  value: T | undefined;
  setValue(value: ValueInput<T>, options?: SetValueOptions): void;
}
interface FormHandle<T> {
  getValue(): T | undefined;
  setValue(value: ValueInput<T>, options?: SetValueOptions): void;
  batch(work: () => void): void;
}
interface FormOptions<T> {
  disableDefaultInjection?: boolean;   // D-5 candidate, defaults to false
  onChange?: (value: T | undefined) => void; // synchronous, outer entry boundary
  onListenerError?: (error: unknown, nodePath: string) => void; // F21 candidate
}

// Candidate shape retaining the existing public command vocabulary.
interface CommandNode {
  publish(type: NodeEventType.RequestRemount): void;
  revision(mask?: NodeEventType): number;
  subscribe(listener: (event: NodeEvent) => void): () => void;
}
// Optional convenience candidate; not an additional owner decision.
interface RemountHandle {
  remount(path: string): void;
}

type CommitId = number;
interface ValidationSnapshot {
  commitId: CommitId;                   // distinct from listener revision
  errors: readonly JSONSchemaError[];
}
interface SettleSnapshot {
  status: 'stable' | 'budget-exceeded';
  // Candidate diagnostic discriminator, not fixed spelling.
  budget?: 'host' | 'derive' | 'transition' | 'wave';
}
```

구체적으로 추가/유지해야 하는 표면은 다음과 같습니다.

1. **D-7:** Form handle과 core node의 setValue 양쪽에서 mode+default 억제를 표현합니다. 기존 public numeric enum을 object options로 대체하면 source break이므로 overload/새 modifier bit를 포함한 호환 인코딩 작업이 따로 있습니다. `PreventInjection`과 같은 이름을 재사용하면 기존 “injectTo 차단”과 뜻이 충돌합니다. Form=true와 per-call=false의 우선순위, Merge에 modifier가 왔을 때의 의미, batch 혼합의 적용 범위는 아직 문서만으로 확정되지 않습니다. 스케치는 이 빈칸을 결정한 것이 아닙니다.
2. **D-9:** RequestRemount라는 공개 명령, 값이 없어도 올라가는 revision, 해지 가능한 구독, renderer의 subtree remount 수신부를 유지합니다. `remount(path)` convenience는 선택 사항입니다. core가 React key나 DOM을 직접 조작하는 API는 필요하지 않습니다.
3. **D-10:** onChange 함수의 필수 인자는 기존처럼 값 하나일 수 있습니다. 호출 시점과 집계 단위가 계약이며 Promise 반환을 기다리는 API가 아닙니다. `batch(work)`가 여러 외부 쓰기를 한 수정으로 묶는 공개 수단입니다. commitId는 validation freshness를 위해 내부적으로 반드시 필요하지만 onChange의 두 번째 인자로 공개해야 한다는 결정은 없습니다. validation/residual을 공개 snapshot으로 노출할 때만 stamp도 함께 노출하는 스케치입니다.
4. onChange 자체가 다시 setValue할 때 새 진입으로 볼지, 값 변화가 없는 진입에서도 “정확히 한 번”을 적용할지, 초기 mount 콜백의 기준은 F31만으로 완전히 정해지지 않았습니다. 구현에는 재진입 종료 규칙이 필요합니다. 이 미정 부분 때문에 c의 비용을 높으로 분류했습니다. 여기서 임의로 API 계약을 확정하지 않습니다.

D-3과의 접점도 구체적인 표면이 필요합니다. 후보는 아래와 같습니다. residual과 latent는 같은 컬렉션이 아닙니다.

```ts
interface ResidualEntry {
  path: string;
  value: unknown;
  errors: readonly JSONSchemaError[];
}
interface ResidualSnapshot {
  commitId: CommitId;
  entries: readonly ResidualEntry[];
}
interface LatentEntry { path: string; value: unknown }
interface ValueInspection {
  residual(path?: string): ResidualSnapshot;
  latent(path?: string): readonly LatentEntry[];
  removeKey(path: string): void; // partial write; can also clear latent storage
}
```

## 5. 측정 기록과 한계

기존 보고서는 Node v24.20.0/darwin arm64, 2초 warm-up, 11 samples(대형 v4 9), case별 새 프로세스입니다(`REPORT-v4.txt:4`, `REPORT-v3.txt:4`). 이번 quick probe는 Node **v26.8.2**, case별 별도 Node 프로세스, **200 ms warm-up + 최소60 ms×9표본의 중앙값**입니다. 원시 표본·작업 카운터는 `round5/results.json`, 실행은 `node packages/canard/schema-form/architecture/spikes/work-loop/round5/measure.mjs`입니다. 의미 반례는 `.../round5/semantics.mjs`로 재현합니다. 설치·네트워크·production src 변경은 없습니다.

기존 v3/v4 수치 중 결정 비용 해석에 필요한 기준은 다음과 같습니다.

| 작업 | v3 | v4 | 근거와 해석 |
| --- | --- | --- | --- |
| 평면 일반 키 입력 | 1.35 µs | 1.39 µs | REPORT-v4:291. 변경 경로만 방문할 때의 기준 |
| 200조건, 무관 입력, small | 6.89 µs | 10.24 µs | REPORT-v4:292. guard 장부·전체 평가 포함 |
| 조건 하나 토글, small | 88.82 µs | 108.29 µs | REPORT-v4:293. 전이/구성 변경 포함 |
| 10,000×5 전체 쓰기 | 7.58 ms | 11.98 ms | REPORT-v4:295. 약58% 증가를 어느 D 하나에 귀속할 수 없음 |
| 1,000쓰기 배치 | 244 µs | 335 µs | REPORT-v4:296. 각기 1정착 |
| 60,002개 구독자 전체 통지 | — | 14.44 ms | REPORT-v4:299. 위 11.98 ms보다 약2.46 ms 증가 |

round-2 `:38`의 복사·패치 **1.29 µs** 대 전량 재구성 **134 µs**, `:39`의 dirty 목록 **3.23 µs** 대 전체 flag scan **55.5 µs**, `:44`의 1,020→1,021 own-key 절벽 **1.02→141 µs**는 장부의 존재보다 **합성 방법과 객체 형상**이 비용을 좌우할 수 있음을 보여 줍니다. 200가드 생성 **23.0 ms** 중 **22.4 ms**가 컴파일이며 현재 구현 **13.4 ms**보다 큽니다(`round-2.md:31`). D-2/D-3의 가드 증가는 입력 경로뿐 아니라 초기화 비용도 늘립니다.

이번 probe는 완성 대안들을 동일 기능으로 비교한 제품 벤치마크가 아닙니다. null/A 변형은 원본 문자열의 정해진 한 지점을 메모리에서 바꿔 import했고 기존 파일은 그대로입니다. D-3 projection, D-6 참조 부채질, D-7 snapshot, D-9 listener fan-out, D-10 callback wrapper는 **부분 비용 proxy**입니다. 실행하지 않은 parser/validator/React/실제 IME/데이터 마이그레이션 비용을 숫자로 꾸미지 않았습니다. 큰 폼·실제 validator·브라우저 검증은 이 보고서의 수치가 보장하지 않습니다.

## 6. 검증 범위

현재 테스트는 정적 검색·본문 대조로 분석했으며 production 테스트 스위트를 실행해 옵션별 실패 수를 관측한 것은 아닙니다. 구현되지 않은 대안의 예상 실패 수를 실제 Vitest 결과라고 표시하지 않았습니다. 보고서·scratch만 변경하는 작업이라 package build/lint/typecheck 전체 실행은 생략하고, 측정 스크립트 실행·의미 반례·인용 위치·집계·src 해시 불변성을 확인합니다. src 파일명과 바이트를 정렬하여 합친 SHA-256 기준값은 `ddc52d1b2a86adafa2eec0f7425d17b22a96237060e56208d00a9f0001bd8701`입니다.

다음 부록은 표의 숫자를 재현할 수 있는 정확한 테스트 제목과 위치입니다. 동일 테스트가 여러 결정에 등장하면 각 결정에서는 한 번만 셉니다.

실행 확인: `round5/verify.mjs`가 옵션 24행, 부록 인용 118건의 파일·선언 줄·제목, 7개 집계, 21개 측정의 9표본 중앙값, src 해시 일치를 확인했습니다. `semantics.mjs`는 D-7(b)의 비멱등 반례와 v4의 반복 로드 전이 차이를 재현했습니다. `git diff --check`에는 오류가 없었습니다. 표의 최소 영향 수는 정적 판정이며, 이 검증이 production 테스트 실패 수를 증명하지는 않습니다.

## 부록 A. D-1 raw 보존 시 바뀌는 최소 14케이스

`blankState:101/120`은 세 입력 경로 중 기존 데이터를 덮는 노드/루트 setValue의 두 행씩이며, 최초 null 생성 행은 이 변경 수에서 제외합니다. `:137`은 false/true 두 행입니다.

| 위치 | 테스트 제목 | 케이스 |
| --- | --- | --- |
| `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:101` | %s: 자식이 스키마 기준 새 상태를 가져야 함 | 2 |
| `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:120` | %s: 풀린 값이 새 객체에 같은 쓰기를 한 값과 같아야 함 | 2 |
| `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:137` | minItems 배열 자식도 경로와 무관하게 같은 상태여야 함 (terminal: %s) | 2 |
| `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:193` | derived 배열·자체 default를 가진 객체·null default 객체 자식도 경로와 무관하게 같은 상태여야 함 | 1 |
| `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:260` | 중첩 객체의 oneOf 분기도 경로와 무관하게 초기 분기로 돌아가야 함 | 1 |
| `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:318` | nullable 노드 자신이 객체 default를 가지면 빈 양식은 그 default를 따라야 함 | 1 |
| `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:363` | 노드 자신의 default가 중첩 객체에 준 조각과 properties 밖의 키도 풀린 값에 포함되어야 함 | 1 |
| `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx:31` | refreshes the child inputs to their schema defaults when the object is set to null | 1 |
| `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx:42` | promotes to exactly what the blank form shows plus the user write | 1 |
| `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx:148` | [default-after-null] a branch restore stays blank while nothing was reset | 1 |
| `src/core/__tests__/ObjectNode.branch.defaultAfterNull.test.ts:79` | [default-after-null] keeps the restores blank while nothing was reset | 1 |

## 부록 B. D-4 명시 쓰기/자동 Refresh의 최소 7케이스

| 위치 | 테스트 제목 | 케이스 |
| --- | --- | --- |
| `src/components/__tests__/SchemaNodeProxy.refresh.test.tsx:118` | should NOT publish RequestRefresh when SetValueOption.Default is used | 1 |
| `src/core/__tests__/RefreshAndDefaultValue.test.ts:58` | should NOT publish RequestRefresh when SetValueOption.Default is used | 1 |
| `src/core/__tests__/RefreshAndDefaultValue.test.ts:221` | should still publish UpdateValue when setting the same value with Overwrite option | 1 |
| `src/core/__tests__/RefreshAndDefaultValue.test.ts:1299` | should handle setValue with SetValueOption.Default correctly (no RequestRefresh) | 1 |
| `src/core/__tests__/VirtualNode.test.ts:281` | should NOT publish RequestRefresh when setValue with Default option | 1 |
| `src/__tests__/scenarios/refresh.uncontrolled-value.render.test.tsx:66` | a non-Refresh setValue updates the node value but the uncontrolled DOM keeps the old value | 1 |
| `src/core/__tests__/AbstractNode.test.ts:550` | event queue for node | 1 |

## 부록 C. D-5 초기 로드 주입 기본 끔의 최소 8케이스

| 위치 | 테스트 제목 | 케이스 |
| --- | --- | --- |
| `src/__tests__/scenarios/default-value.render.test.tsx:226` | seeds primitives, object, arrays and null from schema.default (DOM + tree) | 1 |
| `src/__tests__/scenarios/default-value.render.test.tsx:310` | merges {name:"ron"} with child defaults — parent default wins per overlapping key, child fills the rest (DOM + tree) | 1 |
| `src/__tests__/scenarios/default-value.render.test.tsx:375` | uses an object-array schema.default (1 row) filling omitted child defaults | 1 |
| `src/core/__tests__/BranchStrategy.oneOf.initialDefault.test.ts:59` | preserves defaults from a nested %s during initial activation | 2 |
| `src/core/__tests__/BranchStrategy.anyOf.initialDefault.test.ts:49` | preserves defaults from a nested %s during initial activation | 2 |
| `src/core/__tests__/BranchStrategy.anyOf.initialDefault.test.ts:88` | preserves nested defaults for multiple initially active anyOf branches | 1 |

## 부록 D. D-6 fixture·API·전처리 이관 최소 59케이스

| 위치 | 테스트 제목 | 케이스 |
| --- | --- | --- |
| `src/__tests__/scenarios/virtual.render.test.tsx:86` | renders only the virtual wrapper when the virtual field owns a custom FormTypeInput | 1 |
| `src/core/__tests__/VirtualNode.test.ts:16` | 가상 노드가 정상적으로 생성되어야 함 | 1 |
| `src/core/__tests__/VirtualNode.test.ts:51` | 가상 노드의 값이 참조 노드의 값에 따라 변경되어야 함 | 1 |
| `src/core/__tests__/VirtualNode.test.ts:92` | 가상 노드의 값 변경 시 참조 노드의 값이 변경되어야 함 | 1 |
| `src/core/__tests__/VirtualNode.test.ts:128` | 가상 노드의 이벤트가 정상적으로 발생해야 함 | 1 |
| `src/core/__tests__/VirtualNode.test.ts:180` | 가상 노드의 기본값이 정상적으로 설정되어야 함 | 1 |
| `src/core/__tests__/VirtualNode.test.ts:214` | 가상 노드의 자식 노드가 정상적으로 생성되어야 함 | 1 |
| `src/core/__tests__/VirtualNode.test.ts:247` | should publish RequestRefresh when setValue with Overwrite option | 1 |
| `src/core/__tests__/VirtualNode.test.ts:281` | should NOT publish RequestRefresh when setValue with Default option | 1 |
| `src/core/__tests__/VirtualNode.test.ts:315` | should propagate value changes to reference nodes when setValue is called | 1 |
| `src/core/__tests__/VirtualNode.test.ts:355` | should publish UpdateValue on reference nodes when virtual node setValue is called | 1 |
| `src/core/__tests__/AbstractNode.test.ts:550` | event queue for node | 1 |
| `src/core/__tests__/ObjectNode.branch.nullable.interface.test.ts:92` | virtual 그룹을 통한 쓰기도 null을 풀어야 함 | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:8` | should handle multiple mutations on same schema | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:140` | should handle normal schema | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:229` | should handle deeply nested if-then-else structures | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:295` | should handle mixed virtual and non-virtual fields in required | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:350` | should handle schemas without if property | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:370` | should handle empty virtual fields array | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:393` | should handle non-existent virtual keys in required | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:422` | should handle schemas without required arrays | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts:452` | should handle complex nested structures with multiple virtual transformations | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.oneOf.test.ts:121` | should handle oneOf with virtual required fields | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.oneOf.test.ts:185` | should handle complex oneOf with nested conditions and virtual required | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.oneOf.test.ts:365` | should handle oneOf with mixed virtual required and regular required | 1 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.oneOf.test.ts:426` | should handle oneOf with conditional virtual required in else clause | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:24` | should transform virtual fields in required array | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:46` | should handle multiple virtual fields | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:76` | should handle mixed virtual and non-virtual required fields | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:99` | should avoid duplicate required fields | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:127` | should transform virtual fields in then clause | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:158` | should transform virtual fields in else clause | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:189` | should transform nested then/else with virtual fields | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:242` | should handle both then and else clauses together | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:287` | should transform all virtual fields appropriately | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:343` | should handle empty virtual fields array | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:363` | should handle virtual property without matching required field | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:385` | should return null when virtual exists but no conditions are met | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:402` | should handle schema without properties | 1 |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts:419` | should preserve original schema properties | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:542` | should include virtualRequired fields in then block | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:578` | should include virtualRequired fields in else block | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:615` | should include virtualRequired fields in both then and else blocks | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:654` | should handle multiple virtualRequired fields | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:693` | should handle virtualRequired fields without required fields | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:725` | should handle nested if-then-else with virtualRequired fields | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:779` | should handle empty virtualRequired arrays | 1 |
| `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__/flattenConditions.test.ts:816` | should handle virtualRequired fields only in nested else block | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:42` | renders a [data-path] wrapper for the virtual node with referenced fields nested inside | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:69` | does not render referenced real fields as direct object children | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:132` | aggregates both real fields after editing them, while object value omits the virtual key | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:151` | updates only the edited slot of the aggregation | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:165` | propagates a virtual setValue(Overwrite) to real fields and their DOM inputs | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:184` | clears referenced real fields when virtual is set to undefined(Overwrite) | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:217` | primes the aggregation and nested DOM from defaultValue (two-phase) | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:264` | renders the active virtual wrapper and its nested fields | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:280` | removes the virtual wrapper AND its nested real fields when deactivated, keeping the tree node | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:299` | remounts the previously hidden real-field inputs on re-activation | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:318` | converges without infinite-loop errors across active toggles | 1 |

## 부록 E. F23 공통 두 단계 하네스 26케이스

| 위치 | 테스트 제목 | 케이스 |
| --- | --- | --- |
| `src/__tests__/scenarios/multi-render-split-brain.render.test.tsx:92` | initial mount: both string locations agree (two-phase: sync then flush) | 1 |
| `src/__tests__/scenarios/nullable.render.test.tsx:80` | primes array-syntax string/number defaults to null two-phase (sync + post-flush) | 1 |
| `src/__tests__/scenarios/array.prefixItems-terminal.render.test.tsx:442` | mounts the tuple slots synchronously, then settles their defaults | 1 |
| `src/__tests__/scenarios/composition.oneOf.switch.render.test.tsx:207` | primes the node tree for a non-zero default-selected branch synchronously | 1 |
| `src/__tests__/scenarios/composition.oneOf.switch.render.test.tsx:231` | renders a default-selected non-zero oneOf branch field on first paint | 1 |
| `src/__tests__/scenarios/composition.anyOf.render.test.tsx:64` | primes a default-active anyOf branch into the DOM at first paint | 1 |
| `src/__tests__/scenarios/composition.anyOf.render.test.tsx:75` | settles the single default-active branch into the DOM after the cascade | 1 |
| `src/__tests__/scenarios/composition.anyOf.render.test.tsx:95` | settles two default-active branches together after the cascade | 1 |
| `src/__tests__/scenarios/composition.nested-branch.render.test.tsx:98` | primes the outer physical branch AND its inner standard branch on first render (two-phase) | 1 |
| `src/__tests__/scenarios/virtual.render.test.tsx:217` | primes the aggregation and nested DOM from defaultValue (two-phase) | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:52` | first branch (index 0) | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:88` | non-first branch (index 2) | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:129` | const-discriminated branch (index 2) | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:172` | nested object oneOf branch | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:215` | keeps a single branch schema default through the cascade (no clobber) | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:259` | keeps multiple branch defaults (branch index 1) after flush | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:309` | keeps a form defaultValue-seeded branch field after flush | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:358` | keeps a const-discriminated branch default through the cascade | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:407` | converges a doubly-nested oneOf branch and persists its default | 1 |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx:478` | converges the active nested branch and omits the inactive one | 1 |
| `src/__tests__/scenarios/computed.readonly-disabled.render.test.tsx:226` | settles computed flags into the DOM after the cascade drains | 1 |
| `src/__tests__/scenarios/computed.visibility.render.test.tsx:273` | settles to the visible field present in the DOM after the cascade drains | 1 |
| `src/__tests__/scenarios/computed.derived.render.test.tsx:391` | reflects the derived value in the DOM only after the cascade fully drains (two-phase) | 1 |
| `src/__tests__/scenarios/computed.derived.render.test.tsx:438` | surfaces INFINITE_LOOP_DETECTED for a diverging circular pair without hanging | 1 |
| `src/__tests__/scenarios/composition.allOf-ifThenElse.render.test.tsx:30` | merges properties from every allOf branch into one object (DOM + tree) | 1 |
| `src/__tests__/harness.smoke.test.tsx:129` | supports two-phase (synchronous-then-flushed) assertions | 1 |

## 부록 F. D-9 제거 시 변경 3케이스

| 위치 | 테스트 제목 | 케이스 |
| --- | --- | --- |
| `src/__tests__/scenarios/refresh.uncontrolled-value.render.test.tsx:278` | publishing RequestRemount remounts the subtree (Wrapper key bump) | 1 |
| `src/core/nodes/AbstractNode/utils/EventCascadeManager/__tests__/EventCascadeManager.test.ts:83` | advances synchronously for dispatch() | 1 |
| `src/core/nodes/AbstractNode/utils/EventCascadeManager/__tests__/EventCascadeManager.test.ts:131` | sums every bit for the BIT_MASK_ALL default and terminates | 1 |

## 부록 G. D-10 debounce helper 제거 시 이관 6케이스

| 위치 | 테스트 제목 | 케이스 |
| --- | --- | --- |
| `src/core/nodes/AbstractNode/utils/__tests__/afterMicrotask.test.ts:8` | should execute handler after microtask | 1 |
| `src/core/nodes/AbstractNode/utils/__tests__/afterMicrotask.test.ts:19` | should cancel previous task when called multiple times | 1 |
| `src/core/nodes/AbstractNode/utils/__tests__/afterMicrotask.test.ts:33` | should execute handler with correct timing | 1 |
| `src/core/nodes/AbstractNode/utils/__tests__/afterMicrotask.test.ts:48` | should handle multiple different handlers independently | 1 |
| `src/core/nodes/AbstractNode/utils/__tests__/afterMicrotask.test.ts:63` | should maintain closure over handler variables | 1 |
| `src/core/nodes/AbstractNode/utils/__tests__/afterMicrotask.test.ts:79` | should only execute the last scheduled task when rapidly called | 1 |
