# 443라운드 재마운트 동등성 결함 검사

같은 스키마를 갱신한 U와 U의 공개 출력으로 새로 마운트한 F를 비교하는 검사를 추가했습니다. 전체 기본 실행의 새 실패 17개와 verify 실행의 새 실패 13개를 그대로 보존했습니다. 이는 stage-8 통과 선언이 아닙니다. 모든 finding은 **1차 분류, 미확정 — 코디네이터·소유자 판정 대기**이며 이 PR 뒤 소유자와의 마지막 검증에서 확정합니다. 제품 코드와 공개 export는 변경하지 않았습니다.

이 문서에서 소스 경로는 schema-form 패키지 기준이며, `<ns>`는 작업 증거 묶음 `defect-check-443`입니다. 증거 묶음은 저장소 밖의 검토 자료이고 추적 시험은 그 파일을 import하거나 장치 절대 경로에 의존하지 않습니다.

패키지 관례에 따라 위 원시 실행에서 실패한 장면만 finding ID와 판정·수정 대기 상태를 주석으로 붙여 `it.fails`로 고정했습니다. 통과한 장면은 `it`를 유지하며, 기대값·마스크·관찰 코드는 바꾸지 않습니다. 각 수정 PR은 해당 finding의 `it.fails`를 반드시 `it`로 되돌려야 합니다. 수정 뒤에도 `it.fails`가 남으면 예상 실패가 통과하여 suite가 실패하므로 후속 수정을 강제합니다. 이 고정은 finding의 미확정 분류나 원시 재현 결과를 바꾸지 않습니다.

고정 후 전체 기본 실행은 5,282개 중 통과 5,281·실패 0·기존 todo 1(138.065초), 전체 verify는 4,320개 중 통과 4,319·실패 0·기존 todo 1(116.306초)이며 모두 종료 코드 0입니다. 통과 수에는 새로 고정한 예상 실패가 각각 17건·13건 포함됩니다. 원시 결과는 `<ns>/runs/full-default-pinned-final.json`과 `full-verify-pinned-final.json`에 있습니다. 기본 첫 실행의 기존 Storybook IME 클릭 시간 초과 2건은 별도 보존했고, 코디네이터의 425C-02 절차에 따라 두 파일을 무변경 재실행해 5/5 통과한 뒤 전체 기본을 다시 실행했습니다.

## 불변식과 관찰

장면 S=(schema, initialValue, writes, context)에 대해 U를 독립 컴파일·마운트하고 초기 상태와 모든 쓰기 접두사를 검사합니다. 정착 뒤 U.root.outputValue를 F의 입력으로 사용하여 같은 설정으로 독립 컴파일·마운트합니다. React에서는 FormHandle.getValue()가 같은 출력 채널입니다. 청사진·검증기를 공유하지 않습니다. 근거는 [VALUE-031 ㄹ](../ledger/value.md#value-031)입니다.

공개 API로 raw·value·outputValue·undeclaredValues, 붙은 경로와 자식 순서, 타입, 유효 jsonSchema, active·visible·enabled·readOnly·disabled·required·nullable·watchValues·misfit(s), 현재 오류와 globalErrors, 배열 길이를 비교합니다. undefined·부재 키·희소 배열을 구별하되 객체 신원과 별명 공유는 비교하지 않습니다(VALUE-012·028). 각 분기에 독립적인 고유 boolean 키워드를 부여하여 공개 유효 스키마에서 oneOf 선택과 anyOf 동시 선택을 관찰합니다.

명시 validate 전의 OnChange 자동 오류도 별도 비교합니다(EVENT-002, VALIDATE-006). F가 degraded이거나 U가 처음 degraded로 바뀌는 접두사는 실패입니다. 이후 U에 남은 과거 degraded 이력만 별도로 기록합니다(VALUE-003, ERROR-204). F의 경고 (code,path)는 U의 누적 경고에 포함되어야 하며 원시 reporter 기록을 남깁니다.

React는 현재 DOM의 value·checked·selected·disabled·readOnly 프로퍼티와 폼 영역 구조를 비교하고 ShowError.Always로 오류를 드러냅니다. defaultValue/defaultChecked 같은 초기 속성과 마운트 추적 속성은 현재 UI 관찰에서 제외합니다. readonly UI가 거절한 쓰기는 무시 내역에 기록합니다.

### 정당한 제외와 제한된 마스크

| 제외 필드 | 근거 |
| --- | --- |
| dirty·touched와 해당 집계 비트 | VALUE-022: 사용자 입력 이력 |
| revision·커밋 번호·검증 세대 | EVENT-007·024, SETTLE-006: 배달/커밋 이력 |
| 배달·listener·onChange 이력, payload.previous | EVENT-002·024·026 |
| 노드 참조·배열 identity key·DOM React identity | NODE-044·051: 구조 연산 및 재진입 신원 |
| defaultValue와 로드 스냅숏 | WRITE-085: U와 F의 되돌림 기준이 다름 |
| inactiveValues | VALUE-029·VALUE-031(a): 출력에 없는 잠복 원본 |
| 과거 경고 중복과 diagnostics의 과거 commit/iterations | ERROR-204: 폼 로드 동안 누적 기록 |

raw와 undeclaredValues는 제외하지 않습니다. 형 정규화(VALUE-031(c), WRITE-052)와 키/자식 순서는 엄격 비교합니다. 현재 계산 상태·형상·misfit·유효 스키마·watch를 이력이라는 이유로 지우지 않습니다.

VALUE-031(b)의 omitEmpty·omitTrailing과 (d)의 로드 자동 쓰기는 차이를 보기 전에 작성한 고정 경로/채널/예측값/조항으로만 마스크합니다. U 유효 옵션을 F 생성 전에 확인하고 식 판독 경로와의 겹침을 거절합니다. 계산 상태·형상·유효 스키마·watch·misfit는 마스크할 수 없습니다. 일반 생성 말뭉치의 마스크 수는 0입니다. derived·injectTo·unsetValue 대상 직접 편집은 생성하지 않고 일괄 쓰기에서 현재 출력으로 보존합니다. 이 수명 차이는 코어의 손으로 작성한 세 장면에서 고정 기대값으로 확인합니다(CONTROLS-026~028, SETTLE-046·048). 마스크 밖 차이는 새 제외로 자동 승격하지 않습니다.

## 생성기와 실행

seed는 443이며 LCG를 사용합니다. 16개 문법 계열에서 기본 128장면/800접두사, verify 1,024장면/6,400접두사를 만듭니다. 자료를 순회하는 덮음 검사는 54개 기능과 28개 필수 쌍을 검증합니다. 한글자 `*`, `*x`, `~`, `/` 이름과 네 상태 키의 16개 쌍도 포함합니다.

if/then/else·dependentSchemas·oneOf·anyOf, discriminator·or·includes·문맥/상대/절대 경로, items·prefixItems·additionalItems·중첩 배열·재귀 참조, union·nullable·extras, virtual·injectTo·derived·unsetValue·watch·overlay·omitEmpty·default·unsetOnInactive·resetInteraction을 조합합니다. 쓰기는 잎/분기/루트 bulk·merge·동일값·문맥·batch·이탈 노드 참조·push/pop/insert/remove/update/clear·resetSubtree·null·잘못된 kind·자동 쓰기 비활성화를 포함합니다.

React는 고정 간격 대신 기능/쌍 덮음을 만족하는 결정적 탐욕 표본 15장면/94접두사를 프로젝트마다 고릅니다. verify 표본은 1,024장면 안에서 다시 선택합니다. 손으로 작성한 표적 32장면도 전부 재생합니다. 기존 render adapter를 재사용하고 문맥 변경만 rerender를 추가했습니다. legacy array-valued items는 draft7, 나머지는 2020 검증기를 사용하며 U/F와 코어/React에서 같은 선택 규칙을 사용합니다.

| 실행 | 시험 | 통과 | 실패 | 기존 todo | 실제 시간 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 전체 기본 프로젝트 | 5,282 | 5,264 | 17 | 1 | 155.117초 |
| 전체 verify 프로젝트 | 4,320 | 4,306 | 13 | 1 | 124.719초 |
| 새 검사만 unit·render·react18 | 43 | 26 | 17 | 0 | 9.481초 |

60초 목표는 새 기본 검사 전체에 적용되며 React 18까지 포함하여 충족했습니다. 전체 기존 suite 시간과 혼동하지 않습니다. 타입 검사·lint·패키지 build는 종료 코드 0입니다. build의 DEVELOPMENT_FLAG_OK 및 세 런타임 번들의 GATE_SELECTION_DIST_OK가 통과했고 번들 변경은 없습니다. 실패하는 시험은 모두 새 remount 검사이며 기존 시험의 신규 실패는 없습니다. 로그/원시 JSON은 `<ns>/runs/`, 종료 코드와 소스 트리를 고정한 증거는 `<ns>/gates/`에 있습니다.

```sh
yarn workspace @canard/schema-form test --run --project=unit --project=render --project=react18 remount-equivalence
yarn workspace @canard/schema-form test:verify --run remount-equivalence
yarn workspace @canard/schema-form test --run
yarn workspace @canard/schema-form test:verify --run
```

## 발견 항목

두 최종 전체 실행의 불일치 접두사 241건을 아래 7항목으로 연결했고 미분류는 0입니다. 이는 독립 결함 개수가 아닙니다. `<ns>/findings/mismatch-manifest.json`은 원시 시험 JSON의 assertion·접두사·모든 U/F 차이를 찾아가는 색인입니다. 아래 분류는 전부 **1차 분류, 미확정 — 코디네이터·소유자 판정 대기**입니다.

| ID | 1차 분류 | 관찰 차이 | 최소 재현 자료 | 추정 영역(원인 확정 아님) |
| --- | --- | --- | --- | --- |
| D443-01 | (i) 제품 결함 후보 | literal-star 소유자의 visible/readOnly/disabled가 U=true, F=false | `<ns>/findings/D443-01.md` | `src/core/engine/settle/utils/templatePaths/expandTemplatePaths.ts:34`, `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:361` |
| D443-02 | (i) 제품 결함 후보 | overlay 투영 뒤 바깥 상태/게이트 독자가 이전 결과에 남음 | `<ns>/findings/D443-02.md` | `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:37` |
| D443-03 | (i) 제품 결함 후보 | 옮긴 게이트의 값 변경 뒤 /p/child가 U에만 없음 | `<ns>/findings/D443-03.md` | `src/core/engine/settle/utils/gates/getGateRegistry.ts:173` |
| D443-04 | (i) 후보 | string items의 undefined→null 출력 왕복에서 F에만 misfit/경고 | `<ns>/findings/D443-04.md` | `src/core/engine/behaviors/arrayBehavior/utils/value/holeValue.ts:37` |
| D443-05 | (ii) 정당한 차이 후보(U7) | type overlay 뒤 U 문자열 2/type 오류, F 숫자 2/오류 없음 | `<ns>/findings/D443-05.md` | `src/core/engine/behaviors/unionBehavior/unionBehavior.ts:11` |
| C443-01 | (ii) 정당한 차이 후보 | omitEmpty의 raw/value만 빈 문자열/undefined로 다름 | `<ns>/findings/C443-01.md` | `src/core/engine/behaviors/utils/slots/projectEmpty.ts:7` |
| C443-02 | (ii) 정당한 차이 후보 | omitTrailing 뒤 U에만 꼬리 /1 노드가 남음 | `<ns>/findings/C443-02.md` | `src/core/engine/behaviors/arrayBehavior/utils/projection/omitTrailingArray.ts:19` |

D443-01~03의 근거는 CONTROLS-080·SETTLE-020/021/045입니다. 반대 가설은 공개 계약이 이 계산 상태/형상의 이력 차이를 허용한다는 것이며, 현재 원장 근거는 확인되지 않았습니다. D443-05는 VALUE-031(c)·WRITE-052에 따라 정규화를 엄격 비교했습니다. 반대 가설은 overlay가 기존 원본을 보존하는 별도 계약입니다.

D443-05 반대 가설의 원장 근거는 소유자 답 U7(architecture/ledger/settle.md:142)과 WRITE-099(architecture/ledger/write.md:1673)입니다. G2 type 표적은 U7 때문에 U의 방출이 바뀌지 않아 투영 전용 독자 누락을 보일 수 없습니다.

D443-04는 승인된 misfit 엄격 비교에 따라 (i) 후보로 두었습니다. 반대 가설은 VALUE-034의 빈자리 null 방출이 F의 misfit 차이를 허용하므로 (ii)라는 것입니다. C443-01은 VALUE-031 ㄴ의 omitEmpty 투영이 근거입니다. 원본 S5는 루트 게이트 `./cfg === ""`를 읽지만 상태/watch 독자는 없고, 해당 접두사의 형상·게이트·계산 상태·오류·DOM은 같습니다. 반대 가설은 raw/value가 식 판독 계약의 일부이므로 이 차이 자체가 결함이라는 것입니다. C443-02는 같은 ㄴ의 omitTrailing 투영이 근거이며, 반대 가설은 출력 투영 뒤에도 형상 동등성을 요구하므로 남는 /1이 결함이라는 것입니다. 새 마스크를 추가하지 않아 세 항목도 계속 red입니다.

D443-04는 VALUE-034(architecture/ledger/value.md:576)와 VALUE-033이 함께 만드는 차이이며 VALUE-031 ㄹ의 닫힌 다섯에 없습니다. 원장 판정 대상이고 엔진 수정 대상이 아닙니다.

### 공개 검토용 최소 장면

다음은 축소한 핵심 입력입니다. 값 없는 setValue는 setValue(undefined)이며, 쓰기 없는 장면도 접두사 0에서 비교합니다. 자세한 채널별 U/F 값과 11개 변형은 위 finding 자료에 있습니다.

```js
// D443-01: key는 visible, readOnly, disabled 각각입니다.
const star = {
  type: 'object', properties: {
    on: { type: 'boolean' },
    side: { type: 'object', properties: {
      x: { type: 'string', controls: { active: '../../on === true' } },
    } },
    '*': { type: 'string', controls: { [key]: "../side/x === 'v'" } },
  },
};
// initialValue={on:true,side:{x:'v'}}; /on.setValue(undefined).
// 문맥 변형: on 선언 제거, active='(@).on === true',
// context={on:true}에서 context={}로 변경합니다.

// D443-02
const overlay = {
  type: 'object', properties: {
    source: { type: 'object', properties: {
      flag: { type: 'boolean' }, data: { type: 'string', options: { omitEmpty: false } },
    }, allOf: [{ controls: { active: './flag === true' },
      properties: { data: { options: { omitEmpty: true } } } }] },
    observer: { type: 'object', properties: {
      state: { type: 'string', controls: { visible: "../../source/data === ''" } },
    } },
  },
};
// initialValue={source:{data:''}}; /source/flag.setValue(true).
// 게이트 변형은 observer/gate/leaf.active='../../../source/data === ""'.

// D443-03
const relocated = { type: 'object', properties: {
  p: { type: 'object', properties: {
    child: { type: 'string', controls: { active: '#/later === true' } },
  } },
}, allOf: [{ controls: { active: './mode === "x"' },
  properties: { later: { type: 'boolean' } } }] };
// initialValue={mode:'x'}; /later.setValue(true).

// D443-04: schema={type:'array',items:{type:'string'}},
// initialValue=[undefined], writes=[].

// D443-05
const typeOverlay = { type: 'object', properties: {
  source: { type: 'object', properties: {
    flag: { type: 'boolean' }, data: { type: ['string', 'number'] },
  }, allOf: [{ controls: { active: './flag === true' },
    properties: { data: { type: 'number' } } }] },
} };
// initialValue={source:{data:'2'}}; /source/flag.setValue(true).

// C443-01: schema={type:'string'}, initialValue='', writes=[].
// C443-02: schema={type:'array',items:{type:'string'},
// options:{omitTrailing:true}}, initialValue=['x',undefined], writes=[].
```

11개 장면에 대해 쓰기·스키마 가지·초깃값·문맥을 한 항목씩 삭제하고 빈 문자열/0/false 단순화를 시도했습니다. 총 968회 검사를 거쳐 마지막 단일 후보가 모두 기각되는 1-minimal을 확인했습니다. 전역 최적 최소성을 뜻하지 않습니다. 각 최소 장면을 render·react18·verify-render에서 재생한 33개 재현 확인은 모두 통과했습니다. 이는 목표 불일치가 재현됨을 확인하는 임시 프로브이며 원래 계약 시험의 실패를 해제하지 않습니다. 임시 프로브는 소스 밖으로 옮겼습니다.

## 알려진 네 틈과 검사 한계

| 알려진 틈 | 결과 |
| --- | --- |
| `*` 이름 필드의 상태 키 독자 | 문자 * 4개 표적에서 재현(*x 대조군 4개 통과), 생성 말뭉치 family 3·6·7·8·14·15에서 재현, D443-01 |
| overlay 투영 전용 변화 | 바깥 상태·게이트·빈값·꼬리·타입의 4개 표적, D443-02/04/05 및 C443-02 |
| 옮긴 게이트의 첫 locate 뒤 경로 | cousin 값 전용 shallow·deep 2개 표적에서 재현, D443-03. /current/primer 값 전용 변형과 있음 대조군은 통과하여 재현되지 않음 |
| 조상 dirty 반복 | 16장면 모두 동등, 반복 결함 미재현 |

마지막 틈은 소유 깊이 0/2·읽는 거리 1/2·문맥 여부·순방향/역방향을 교차했습니다. 같은 settle tick에서 record 계수를 읽었고 깊이0은 ancestorRechecks=0/gateWheelSteps=3, 깊이2는 3/6을 명시 기대표로 모두 확인했습니다. 깊이0의 0은 실제 선택 경로이므로 미도달로 오판하지 않습니다. 이 그리드의 통과는 다른 입력에서 반복 결함이 없다는 증명이 아닙니다.

네 번째 틈인 조상 dirty 반복은 재현되지 않았으며, G4 그리드 16행 중 재검사 루프에 도달하는 행은 8개입니다.

생성 공간은 유한하며 함수식 전체·임의 비동기 검증·실제 브라우저 레이아웃/IME/선택 유지·모든 외부 UI 플러그인·전체 JSON Schema 의미·모든 연산 순열은 덮지 않습니다. React는 15개 덮음 표본이며 1,024개 전체를 렌더하지 않습니다. 자동 쓰기 대상 직접 편집의 수명 기대는 코어 세 장면으로 제한합니다. 퇴화·경고의 누적 이력과 현재 오류는 위 규칙으로 구별하므로 완전한 이력 일치를 주장하지 않습니다.

PR 시점 FCA 패키지 전체 검사는 기존 FieldProxy 순환과 getAbsolutePointer 시험 58 semantic cases 때문에 FAIL이며 동적 테이블 때문에 분석 완전성은 INDETERMINATE입니다. 새 remount 파일을 지목하는 위반은 없었습니다. 원시 결과와 후속 조치는 `<ns>/gates/filid-report.md`에 남겼으며 이 검사 작업에서 기존 제품/시험을 고치지는 않았습니다.
