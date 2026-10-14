# 개선-38 — core와 SchemaNode의 관계·위계, 패키지 전체 fractal·organ 전수 고찰

- 성격: 읽기 전용 고찰. 재배치하지 않으며 코드와 문서를 바꾸지 않는다(193라운드 소유자 답, 204C-01).
- 대상: `packages/canard/schema-form/src` 전체. `src/__legacy__`는 동결된 옛 엔진 사본이라 지도에 이름만 두고 판정에서 뺀다.
- 기준 커밋: `feat/schema-form-switch` 85786e710 (2026-10-13).
- 검증: 독립 verifier(opus)가 2026-10-13에 주장 8묶음을 TypeScript 컴파일러 API 기반 스크립트로 대조했고, 틀린 수치·누락 사이클을 이 판에 반영했다(scratchpad `verify38/`).
- 근거 파일(세션 scratchpad, 저장소 밖):
  - `scratchpad/consumer-evidence.md` — 비시험·비레거시 690파일의 import 916문을 fractal 단위로 푼 간선 표, 깊은 import, 사이클, organ 외부 소비자.
  - `scratchpad/filid-digest.md` — filid `fractal_inspect` scan·validate 결과 요약과 파일시스템 재구성 표.
- 규칙 출처: `.claude/rules/filid_fractal-boundaries.md`, `filid_code-placement.md`, `filid_module-documents.md`, `seiri_public-contract.md`, `seiri_structure.md`.

## 0. 한 줄 결론

값 의존은 파일·fractal 어느 수준에서도 비순환이고 core 안에는 형 의존까지 포함해 사이클이 없다(형 전용 사이클 셋은 React 쪽과 `helpers/error`→`app/plugin` 경유에 있다, §4.3). 어긋난 것은 **이름과 소유 관계의 표기**다: `core`라는 이름은 "SchemaNode의 엔진"이라는 소유 관계를 말하지 않고, 겉면 `core/SchemaNode`가 엔진 단계 일곱과 형제로 놓여 있어 어느 것이 부모인지 트리가 말해 주지 않는다. 패키지의 나머지에서는 (1) `app/constants` organ이 소유자 밖 여섯 곳에서 직접 쓰이고, (2) `helpers`가 organ 이름으로 fractal 아홉을 담는 컨테이너이며 그중 둘(`defaultValue`·`dynamicExpression`)은 소비자가 없고, (3) 형 전용 사이클 셋(`components/Form`↔providers 자식 다섯, `SchemaNodeProxy`↔`SchemaNodeInput`·`DeferrableNodeProxy`, `core/blueprint`→`helpers/error`→`app/plugin`→`formTypeDefinitions`→`core`)이 있다. 후보 모양 넷을 §5에 비용과 함께 둔다.

## 1. 방법과 한계

- filid `fractal_inspect`(scan·validate, 네 scope)는 노드 275개(fractal 64, organ 211), 깊이 8을 세었으나 판정은 전부 `indeterminate`다. 사실 저장소(facts store)에 파일 기록이 없어 순환·경계 판정을 내리지 못했고, 위반 65건 중 63건은 "진입점 표면 증거 불확정", 2건은 "순환·경계 분석 불확정"이다. 따라서 **filid의 구조 판정은 이 문서의 근거가 아니다**. 소유자가 말한 대로 filid 통과 여부와 무관하게 설계 수준에서 본다.
- 소비자 증거는 정규식으로 import 문을 풀어 가장 가까운 INTENT.md 보유 디렉터리(fractal)로 올린 것이다. 형 전용 import도 값 import와 같이 셌다. 시험 파일과 `__legacy__`는 뺐다.
- fractal 판정 근거는 규칙 §1의 순서(INTENT.md 존재 → fractal, 조직 이름 또는 잎 → organ)로 적었다. 패키지 안 64개 fractal 전부가 INTENT.md로 분류되고, `app` 하나만 진입점이 없다(filid 설정의 `module-entry-point` 예외).

## 2. 패키지 지도

### 2.1 최상위

| 디렉터리 | 분류 | 근거 | 진입점 | 소유자 | 외부 소비자(간선) | 비고 |
|---|---|---|---|---|---|---|
| `src` | fractal(루트) | INTENT.md | `index.ts`(이름 수출 71 + `export *` 1) | — | 패키지 밖 | `types/rolled`를 와일드카드로 재수출 |
| `core` | fractal | INTENT.md | `index.ts`(이름 47) | `src` | components 17, providers 13, hooks 4, helpers 3, formTypeDefinitions 1, 루트 1 — 전부 진입점; `types`만 6문 중 4문이 내부 경로(§4.1) | 엔진. §3 |
| `app` | fractal | INTENT.md | **없음**(설정 예외) | `src` | `app/plugin` 진입점으로 8문(루트, providers, Form 3, SchemaNodeInput hooks, helpers/error) | `app/constants`는 organ인데 밖에서 6문이 직접 씀(§4.1) |
| `app/plugin` | fractal | INTENT.md | `index.ts`(4) | `app` | src 루트, providers | 플러그인 등록소 |
| `components` | **컨테이너**(INTENT 없음, organ 이름) | 규칙 §1(4) 조직 이름 `components` | 없음 | `src` | — | fractal 셋을 담음 |
| `components/Form` | fractal | INTENT.md | `index.ts`(14) | `src`(컨테이너 경유) | src 루트 | `providers/RootNodeContext`와 형 상호 import(§4.3) |
| `components/SchemaNode` | fractal | INTENT.md | `index.ts`(3) | `src` | Form | 자식 fractal 셋이 서로 형을 가져옴(§4.3) |
| `components/FallbackComponents` | fractal | INTENT.md | `index.ts`(4) | `src` | app/plugin | |
| `providers` | fractal | INTENT.md | `index.ts`(15, 자식 7개 재수출) | `src` | components, hooks | 자식 fractal 8 |
| `hooks` | organ | INTENT 없음, 조직 이름 | — | `src` | `src/index.ts`가 파일별로 재수출, components가 깊은 경로로 8문 | 공개 훅 5개의 보금자리인데 organ(§4.6) |
| `helpers` | **컨테이너**(INTENT 없음, organ 이름) | 조직 이름 `helpers` | 없음 | `src` | — | fractal 10(자식 포함 23)을 담음(§4.4) |
| `formTypeDefinitions` | fractal | INTENT.md | `index.tsx`(1) | `src` | app/plugin | |
| `errors` | fractal | INTENT.md | `index.ts`(`export *` 6) | `src` | 61문(core 52, providers 4, components 2, app 1, helpers 1, 루트 1) | 와일드카드 진입점(§4.6) |
| `types` | organ | INTENT 없음, 조직 이름 | `index.ts`(루트 소속, `export *` 6) | `src` | 전 영역 74문(피import 3위; 1위 `core/record/index.ts` 281, 2위 `core/blueprint/index.ts` 101) | `types/rolled`만 fractal |
| `__tests__` | 검증 organ | — | — | `src` | — | 렌더 하네스 |
| `__legacy__` | 동결 사본 | filid 무시 목록 | — | — | lint로 `@/schema-form/*` import 금지 | fractal 64, organ 112(파일시스템 기준) |

### 2.2 core 안

| 단위 | 분류 | 파일(비시험) | 목적(INTENT 첫 문장) | 가져오는 곳(문) | 가져다 쓰는 곳 |
|---|---|---|---|---|---|
| `core/types` | organ | 3 | 공개 값·상태·스키마 형 | `app/constants` 2 | record 5, settle 11, dispatch 17, SchemaNode 5, validation 1, 루트 4; **밖**: `types/jsonSchema.ts` 1(§4.2) |
| `core/utils` | organ | 9 | 빈 Map/Set, pathIndex | — | blueprint 2, record 2, settle 9, SchemaNode 2 |
| `core/record` | fractal | 17 | 노드 한 개의 고정 필드 배치·행·런타임 계약·이벤트 비트 | blueprint 3, types 5, utils 2 | settle 165, dispatch 67, behaviors 34, validation 6, SchemaNode 6, navigation 3 |
| `core/blueprint` | fractal | 77 | 작성 스키마 → 선언·조각 분석 | utils 2, helpers(jsonPointer 3·schemaIntersection 2·error 1) 6 | settle 67, behaviors 11, validation 10, SchemaNode 7, record 3, dispatch 2, 루트 1 |
| `core/behaviors`(+종류별 자식 8) | fractal | 56 | 종류·전략별 순수 계산 행 | blueprint 11, record 34 | settle 2, SchemaNode 2 |
| `core/validation` | fractal | 20 | 검증기 캐시·가드·실행·오류 라우팅 | blueprint 10, record 6, types 1 | dispatch 11, SchemaNode 6, settle 2, 루트 3; **밖**: `types/error.ts`가 `@/schema-form/core/validation` 진입점으로 3문 |
| `core/navigation` | fractal | 5 | 경로 탐색·트리 걷기 | record 3 | settle 3, dispatch 3, SchemaNode 1 |
| `core/settle`(+`derive`) | fractal | 195 | 표시·계산·전이·커밋 | record 165, blueprint 67, types 11, utils 9, navigation 3, behaviors 2, validation 2 | dispatch 22, SchemaNode 1 |
| `core/dispatch` | fractal | 58 | 공개 쓰기 진입과 정착 밖 사건의 사슬 | record 67, settle 22, types 17, validation 11, navigation 3, blueprint 2 | SchemaNode 11 |
| `core/SchemaNode` | fractal | 16 | 런타임 클래스 하나 + 공개 형·가드 + 생성 함수 | dispatch 11, blueprint 7, record 6, validation 6, types 5, behaviors 2, utils 2, navigation 1, settle 1 (41문, 13파일; 그중 `SchemaNode.ts`는 10문) + core 밖 errors 2·types 1 | **`core/index.ts` 2문과 `core/nodeFromJSONSchema.ts` 2문뿐** |
| `core/nodeFromJSONSchema.ts` | 루트 파일 | 1 | 공개 생성 함수 | SchemaNode, blueprint, validation | `core/index.ts` |

- 단계 사이에 사이클이 없다(단위별 SCC 없음). 1단계 단위를 건너는 형제 간 상대 import는 비시험 511문(시험 400문)이며, 형제가 함께 움직이면 이 import는 바뀌지 않는다.
- 방향은 `types/utils ← blueprint ← record ← {behaviors, validation, navigation} ← settle ← dispatch ← SchemaNode ← core/index`로 읽힌다(오른쪽이 왼쪽을 가져옴). `blueprint`는 `core/utils`만 가져오고 `record`가 `blueprint`를 형으로 3문 가져오므로, 바닥은 레코드가 아니라 청사진이다. 겉면이 꼭대기다.
- `core/index.ts`는 `SchemaNode`의 이름 39개(그중 바인딩 전용 10개: `buildSchemaNodeTree`·`mountSchemaNode`·`adoptSchemaNodeTree`·`reloadSchemaNodeForm`·`writeSchemaNodeInput`·`finishSchemaNodeInput`·`readSchemaNodeInteractionReset`·`observeSchemaNodeReports`·`interpretSchemaNodeDraft`·`setContext`), `validation`의 넷, `types`의 셋, `nodeFromJSONSchema`를 이름으로 재수출한다. 바인딩 전용 열은 전부 React 쪽(providers/RootNodeContext·FormErrorContext, components/SchemaNodeInput, formTypeDefinitions)에 소비자가 있다.

### 2.3 React 쪽과 공용

- `components`·`providers`·`hooks`·`helpers`는 core를 **진입점 `@/schema-form/core`로만** 쓴다(각 17·13·4·3문, 깊은 경로 0). `app`은 core를 가져오지 않는다. 즉 core 경계는 지켜지고 있다.
- `providers/index.ts`는 자식 fractal 7개를 재수출하고(FormErrorContext는 제외), `components`에는 그런 진입점이 없다. 같은 급의 두 컨테이너가 다른 모양이다.
- `helpers` 아래 소비 관계(비시험): `error` ← blueprint·formTypeInputDefinition·plugin·virtualization, `formTypeInputDefinition` ← ExternalFormContext·FormTypeInputsContext·plugin·SchemaNode(components), `jsonPointer` ← blueprint·dynamicExpression·formTypeInputDefinition·루트, `jsonSchema` ← defaultValue뿐(`jsonSchema`가 거꾸로 `src/types/jsonSchema`를 가져옴), `schemaIdentity` ← RootNodeContext, `schemaIntersection` ← blueprint, `virtualization` ← Form·루트·components/SchemaNode·VirtualizationContext, `warning` ← virtualization. **`defaultValue`와 `dynamicExpression`은 비레거시 소비자가 0**이다(레거시 사본은 자기 복사본을 씀).

## 3. core와 SchemaNode의 관계 — 사실과 해석

사실:

1. 밖에서 core에 닿는 경로는 `core/index.ts`이고(예외는 `src/types`의 4문, §4.1·§4.2), `core/index.ts`가 수출하는 런타임 값의 거의 전부는 `core/SchemaNode`가 조합한 것이다(39/47). 엔진 단계(record·blueprint·behaviors·settle·dispatch·navigation)는 패키지의 다른 어느 곳에서도 직접 가져오지 않는다(`validation`만 `types/error.ts`가 형을 위해 진입점으로 가져옴).
2. `core/SchemaNode`는 엔진 단계 전부를 가져오고(41문, 13파일) 어느 단계도 `SchemaNode`를 가져오지 않는다. 클래스 `SchemaNode`는 필드·게터·한 문장 위임만 가지며(NODE-010) 위임 대상은 `dispatch*`·`find`·`findNodes`·`read*`·`subscribeSchemaNode`다.
3. 정착 지도(LANDING-084·085·087)는 단계마다 `src/core/<stage>/` fractal을 두기로 했고, 193라운드 원장 관리자의 답은 "core 밖 import 0, 서로 수십 곳 import"를 들어 공통 조상 `core` 아래 형제가 FCA상 맞는 자리라고 했다. 소비자 증거는 그 두 사실을 그대로 확인한다.

해석(설계 수준):

- **의존 방향으로는 "SchemaNode가 엔진을 소유한다"가 맞다.** 엔진의 유일한 소비자가 겉면이고, 겉면이 엔진의 유일한 출구다. 규칙 §1("한 사용자는 공유 코드가 아니다 — 그 소유자의 organ 또는 자식")을 fractal 단위로 적용하면 엔진 단계 전부는 겉면 fractal의 자식이어야 한다. 지금 트리는 그 소유 관계를 **형제** 모양으로 적어 놓았고, 부모 이름 `core`는 "무엇의 엔진인가"를 말하지 않는다. 소유자의 질문 (3) "`src/core`의 부속들은 SchemaNode의 부속으로 보이는데 왜 평평한가"는 소비자 증거와 일치한다.
- 반대로 **단계의 수와 크기(settle 195파일, blueprint 77, dispatch 58)**는 "겉면의 부속"이라 부르기엔 크다. 겉면 16파일이 엔진 428파일(organ `types`·`utils`까지 440)을 자식으로 거느리면 `SchemaNode` fractal 루트에 문서·진입점·클래스·형·organ `utils`·자식 fractal 아홉이 모이며, 규칙 §4의 문면("fractal 루트는 문서와 진입점, 많아야 하나의 동명 구현")으로는 `type.ts`와 `utils/binding`의 자리가 문제가 되지만, 저장소 filid 설정은 `zero-peer-file`에서 이 패키지를 통째로 면제하고 `structure.allowedPeers`에 `type.ts`를 두므로 도구 판정은 걸리지 않는다. 설계 판단으로만 남는다.
- 현재 이름의 함정은 셋이다: `core/SchemaNode`(런타임 겉면), `components/SchemaNode`(렌더 경계), 공개 형 `SchemaNode`(판별 합집합). `core/SchemaNode/INTENT.md`가 첫 줄에 이름 함정을 적어 두었으나, 소유자가 보기에 `SchemaNode`가 "core 안의 한 칸"으로 읽히는 것이 문제의 핵심이다.
- `validation`은 유일하게 겉면을 거치지 않고 `core/index.ts`가 직접 수출하는 단계다(`retainValidationRoot`·`releaseValidationRoot`·`Validator`·`ValidationIssue`). 어떤 후보 모양에서도 이것은 "엔진 단계이자 공개 계약"이라는 이중 역할을 가지므로 따로 결정이 필요하다.

## 4. 위계가 어긋난 곳 전수

각 항목은 (증거) → (규칙) → (해결 후보) 순이다. "결정 필요"는 소유자 또는 원장 관리자가 고를 일이다.

### 4.1 organ이 소유자 밖에서 쓰이는 곳

1. **`app/constants`** (소유자 `app`, 진입점 없음) — 외부 직접 import 6문: `core/types/state.ts:6`, `core/types/value.ts:9`, `hooks/useSchemaNodeTracker.ts`, `types/error.ts`, `components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx`, `components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx`. 소비자들의 최소 공통 fractal은 `src` 루트다. 규칙 §5: 밖에서 organ 파일을 직접 가져오는 것은 선언 없는 위반이고, `app/DETAIL.md`에 exemption 선언이 없다. 또한 `core/INTENT.md`의 "Never do: 애플리케이션 플러그인 등록소를 가져오지 않는다"는 `app/plugin`에 한한 말이라 `constants`는 문면상 비켜 가지만, core가 app 방향으로 의존하는 유일한 간선이 이것이다. 후보: (a) `app/constants`를 `src/constants`(또는 `types` 곁)로 올린다 — 6문 수정, `app` 문서 갱신; (b) `app`에 진입점을 두고 상수를 이름으로 수출한다 — core→app 의존은 남는다.
2. **`core/types`** (소유자 `core`) — `types/jsonSchema.ts:131`이 인라인 형 표현 `import('../core/types/jsonSchema').JSONSchema<…>`로 `core/types/jsonSchema.ts`를 직접 가리킨다(1문). `types/error.ts`의 3문은 `core/validation` 진입점을 거치므로 형제 fractal 진입점 사용이다. 같은 형을 `core/index.ts`가 `JSONSchema`로 수출하고 있으므로 진입점 경유로 바꾸면 끝난다. 사소하지만 선언 없는 위반이다.

### 4.2 형제 fractal의 내부를 가로지르는 import

- 비시험 코드에서 **형제 fractal의 비진입점 파일을 가로지르는 import는 위 7문(5간선)뿐**이며 그중 6문이 `app/constants/index.ts`, 1문이 `core/types/jsonSchema.ts`다. core 단계들 사이, components 자식들 사이, providers 자식들 사이는 전부 진입점을 거친다.

### 4.3 fractal 사이의 사이클(형 전용; 값 간선만 보면 파일·fractal 어느 수준에도 사이클 0)

1. `components/Form` ↔ `providers` 자식 다섯: `Form/components/FormContents.tsx:27`이 `RootBinding` 형을 가져오고 `FormContents.tsx:22`가 `@/schema-form/providers`를 값으로 가져오며, `RootNodeContext/type.ts:1`·`RootNodeContextProvider.tsx:14`·`WorkspaceContextProvider.tsx:5`·`VirtualizationContextProvider.tsx:5`·`FormTypeRendererProvider.tsx:7`·`FormTypeInputsContextProvider.tsx:5`가 `FormProps`(·`FormHandle`) 형을 되가져온다(되돌아가는 간선 6문 + 27행 1문 = 7문). `providers/index.ts`의 재수출을 실제 의존으로 세면 강하게 연결된 묶음은 fractal 11개다. 전부 `import type`이라 런타임 사이클은 아니지만 규칙 §6(DAG)과 seiri structure §1에는 사이클이다. 후보: `FormProps`·`FormHandle`을 소비자들의 최소 공통 fractal인 `src` 루트의 `types` organ(이미 `types/rolled/form`이 있음)으로 올리거나, `RootBinding`을 providers 쪽 공개 형으로 두고 Form이 그것만 가져오게 한다.
2. `components/SchemaNode/SchemaNodeProxy` ↔ `SchemaNodeInput` (+ `DeferrableNodeProxy`): `SchemaNodeProxy.tsx:23`이 `SchemaNodeInputWrapper` 값을, `SchemaNodeInput/type.ts:11`·`SchemaNodeInputWrapper.tsx:19`·`SchemaNodeInput/hooks/useChildNodeComponents.tsx:18`·`DeferrableNodeProxy/type.ts:6`이 `SchemaNodeProxyProps` 형을 되가져온다(4문). 후보: `SchemaNodeProxyProps`를 부모 `components/SchemaNode/type.ts`로 올린다(부모가 이미 `ChildNodeComponent` 형을 자식에서 재수출하고 있어 방향이 뒤집혀 있음).
3. core를 지나는 형 전용 사이클: `core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts:2`가 `helpers/error`를 값으로 → `helpers/error/formatErrorMessage/formatRegisterPluginError.ts:1`이 `import type { SchemaFormPlugin } from '@/schema-form/app/plugin'` → `app/plugin/PluginManager.ts:11`이 `formTypeDefinitions`를 값으로 → `formTypeDefinitions/FormTypeInputUnion.tsx:6`이 `@/schema-form/core`를 값으로. 묶음은 fractal 25개이고 `formatRegisterPluginError.ts:1` 한 줄(형 import)을 끊으면 사라진다. 후보: `SchemaFormPlugin` 형을 `src/types`로 올리거나 helpers/error가 구조적 형을 받게 한다.
4. 부모↔자식 상호 import 17쌍(`core`↔`core/SchemaNode` 등)은 부모 진입점이 자식을 재수출하고 자식이 부모의 organ(`core/types`·`core/utils`)을 쓰는 모양이라 규칙 §5가 허용한다. 사이클로 세지 않는다.

### 4.4 컨테이너와 fractal이 섞인 수준, 이름이 소유 관계를 말하지 않는 곳

1. **`helpers`**: organ 이름(규칙 §1 기본 목록)인데 INTENT 없는 컨테이너로 fractal 10개(자식 포함 23)를 담는다. 규칙 §4 "fractal 수준에는 자식 fractal과 관용 이름 구획 둘뿐"에 따르면 `helpers`는 구획이어야 하지만 실제로는 독립 계약을 가진 모듈(`jsonPointer`·`schemaIntersection`·`virtualization`·`warning`)의 집이다. 같은 급 `components`도 INTENT 없는 컨테이너이고, `providers`는 INTENT와 진입점이 있는 fractal이다 — 세 컨테이너가 세 모양이다.
2. **`helpers/defaultValue`·`helpers/dynamicExpression`**: 소비자 0(비시험·외부 시험·레거시 모두). 옛 엔진 시절의 모듈이 새 트리에 남은 것이며, `helpers/jsonSchema`의 유일한 소비자가 `defaultValue/getDefaultValue/getDefaultValue.ts:1`이라 `jsonSchema`도 전이적으로 미사용이다(`INTENT.md`는 "현재 헬퍼 계약"이라 적음). 셋을 지우면 29파일(비시험 코드 12, 시험 3, INTENT/DETAIL 7쌍 14)이다. 결정 필요: 삭제(`__legacy__`가 자기 사본을 가짐) 또는 공개 계약으로 유지 선언.
3. **`core`라는 이름**: §3. 소유 관계를 말하지 않는다.
4. **`types` 셋**: `src/types`(organ, 74문 피import, 패키지 3위), `core/types`(organ), `types/rolled`(fractal). 이름이 같고 역할이 다르다.
5. **`hooks`**: organ인데 공개 훅 5개(`useSchemaNodeSubscribe`·`useSchemaNodeTracker`·`useFormSubmit`·`useChildNodeErrors`·`useChildNodeComponentMap`)의 집이고 `src/index.ts`가 파일별로 재수출한다. 소유자가 루트라 규칙상 허용이지만 "독립 계약이 있는 디렉터리는 fractal"(규칙 §2)에 가깝다. `components/SchemaNode/SchemaNodeInput/hooks`는 같은 이름의 진짜 organ이다.
6. **`core/nodeFromJSONSchema.ts`**: fractal 루트에 놓인 비동명 구현 파일이며 `core/SchemaNode`를 직접 가져오는 2문의 출처다. 규칙 §4 문면은 루트에 "많아야 하나의 동명 구현"만 허용하지만, filid 설정은 이 패키지를 `zero-peer-file`에서 면제하므로 도구는 걸지 않는다(설계 판단). 후보: `core/SchemaNode`나 새 겉면 fractal로 옮기고 `core/index.ts`가 재수출.

### 4.5 organ 안의 fractal, 깊이

- `core/blueprint/utils/expressions/createDynamicFunction`·`getPathManager`는 organ `utils` 안에 들어 있는 fractal이다(규칙 §2 "organ 안의 하위 디렉터리에 문서가 있으면 자기 fractal"이라 허용). 다만 `blueprint/utils`는 하위 디렉터리 36개, `settle/utils`는 29개를 품어 사실상 컨테이너다. 깊이는 최대 8(filid 요약), 예: `core/blueprint/utils/effectiveSchema/utils/…`.
- `helpers/jsonPointer/index.ts`는 `export * from './utils'`로 organ 전체를 수출한다 — organ 내부가 곧 공개 표면이 된 경우.

### 4.6 진입점 모양

- `export *` 진입점 7개: `src/index.ts`(`./types/rolled`), `errors`(6개 파일 전부), `helpers/defaultValue`, `helpers/dynamicExpression`, `helpers/error`, `helpers/jsonPointer`(`./utils`), `types/rolled`. organ 배럴 둘도 같다: `app/constants/index.ts`(`./bitmask`·`./control`·`./style` — §4.1의 외부 6문이 실제로 들어오는 표면)와 `types/index.ts`(6파일). seiri public-contract §2는 이름 재수출을 요구한다.
- `app`은 진입점 없이 설정 예외로 산다. `app/plugin`은 진입점이 있으나 `app/constants`가 없다(§4.1).

### 4.7 검증 파일 배치

- `core/__tests__`에 59파일(그중 `*.test.*` 36), 자식 fractal 안에 `*.test.*` 240파일. 루트 시험은 core 공개 표면을 검증하는 것이어서 규칙(verification-records §6)에 맞는다. 다만 엔진을 겉면 아래로 옮기는 후보(§5 B)에서는 이 59파일의 "검증 대상의 가장 가까운 디렉터리"가 바뀐다.

## 5. 후보 모양과 이동 비용

비용 단위는 바뀌는 import 문 수(비시험 / 시험), 바뀌는 설정, 바뀌는 문서다. 공개 d.ts는 어느 후보에서도 바뀌지 않는다(`src/index.ts`가 이름으로 재수출). 측정값: `@/schema-form/core` 별칭 import 40문(시험 22), `@/schema-form/core/…` 3문(시험 2), `src/index.ts`의 `./core` 1문, 시험의 상대 경로 5문; core 1단계 단위를 건너는 상대 import 511문(시험 400; 함께 움직이면 0 변경); `eslint.config.js`에 `src/core` 경로 glob 12줄 + 주석·메시지 3줄; core 계열 INTENT/DETAIL 20쌍.

### 후보 A — 자리는 두고 소유 관계를 문서와 이름 한 줄로 적는다

- 모양: 변경 없음. `core/INTENT.md`에 "이 fractal은 `SchemaNode` 겉면의 엔진이며 단계 fractal은 겉면의 부속이다"를 적고, `core/DETAIL.md`에 §2.2의 방향 그래프를 둔다.
- 고치는 것: §4.1·4.2·4.3·4.4(2)·4.4(6)·4.6은 별개 소작업으로 처리 가능(아래 "공통 소작업").
- 비용: import 0, 설정 0, 문서 2.
- 못 고치는 것: 소유자가 "지금 구조는 용납하지 않는다"고 했으므로 이것만으로는 끝나지 않는다. 비교 기준선으로만 둔다.

### 후보 B — 엔진을 겉면 아래로: `src/core/SchemaNode/{record, blueprint, behaviors, validation, navigation, settle, dispatch}`

- 모양: 단계 fractal 일곱과 organ `types`·`utils`를 `core/SchemaNode/` 아래로 옮긴다. `SchemaNode.ts`는 루트의 동명 구현으로 남고, `type.ts`·`utils/{binding,guards,schemaNodeFactory,…}`는 자식 organ `surface/`(이름은 결정 필요)로 내려간다. `core/`는 `index.ts`+`nodeFromJSONSchema.ts`만 남거나(얇은 껍데기), `core` 자체를 없애고 `src/SchemaNode`로 올린다.
- 고치는 것: §3의 소유 관계가 트리에 드러난다("엔진은 SchemaNode의 부속"). 소유자 질문 (3)에 직접 답한다.
- 비용: 형제 간 상대 import 511문은 그대로. `core/SchemaNode`의 13파일이 형제를 가리키던 `../dispatch` 등 41문이 `./dispatch`로 바뀐다. `core`를 유지하면 별칭 import 0 변경, 없애면 44문(시험 29). `eslint.config.js` 15줄(friend-zone·assertion 금지 범위). INTENT/DETAIL 체인 20쌍의 상위 경로 갱신. `core/__tests__` 59파일의 자리 재판정. 깊이 +1(최대 9).
- 위험: `SchemaNode` fractal 루트가 자식 디렉터리 9개 + 문서 + 클래스 + `type.ts` + organ을 가진다. filid 설정(`zero-peer-file` 면제, `allowedPeers`의 `type.ts`)으로 도구는 걸지 않지만, 규칙 §4의 뜻("루트는 문서와 진입점")에서 가장 멀어지는 모양이다. 이름 함정(`core/SchemaNode` vs `components/SchemaNode`)은 그대로다.

### 후보 C — core를 "엔진 + 겉면" 두 자식으로 나눈다: `src/core/{engine, surface}` (또는 `src/node/{engine, surface}`)

- 모양: `core/engine/{record, blueprint, behaviors, validation, navigation, settle, dispatch, types, utils}`에 진입점 하나를 두고, `core/surface/{SchemaNode.ts, type.ts, guards, schemaNodeFactory, binding/}`가 그 진입점만 가져온다. `core/index.ts`는 `surface`와 `engine`의 공개 계약(`validation`의 넷, `JSONSchema`)을 재수출한다. `nodeFromJSONSchema.ts`는 `surface`로.
- 고치는 것: "엔진과 겉면"의 관계가 이름으로 드러나고(소유자 질문 (1)·(3)), §4.4(6)의 루트 파일 문제가 함께 풀린다. 단계 일곱이 "엔진의 단계"라는 한 묶음으로 읽힌다.
- 비용: 형제 간 511문 그대로. `surface`→`engine` 41문(13파일)이 `../engine` 진입점 경유로 바뀌며 **`engine/index.ts`에 이름 67개**(dispatch 26, blueprint 11, validation 7, record 6, settle 5, types 5, behaviors 3, navigation 2, utils 2)를 적어야 한다. 별칭 import 0 변경(`core` 유지). eslint 12줄. 문서 2쌍 추가(engine·surface INTENT/DETAIL), 20쌍 경로 갱신. 깊이 +1.
- 위험: `engine/index.ts`가 큰 재수출 표가 되어 "진입점은 선언, 내부는 구현"(public-contract §3)은 지키지만 유지 비용이 생긴다. `validation`의 이중 역할(공개 계약이기도 함)을 `engine` 진입점이 함께 수출해야 한다.

### 후보 D — 평평함을 유지하되 단계를 파이프라인 묶음으로 나눈다: `src/core/{analysis, runtime, surface}`

- 모양: `analysis/{blueprint}`, `runtime/{record, behaviors, validation, navigation, settle, dispatch, types, utils}`, `surface/{SchemaNode…}`. 각 묶음에 진입점.
- 고치는 것: 정착 지도(ADR 0007 "표시 → 계산 → 파생 → 전이 → 커밋, 그 뒤 통지와 검증")의 단계 순서가 디렉터리에 드러난다.
- 비용: C와 같은 종류이나 묶음이 둘이라 진입점 표가 둘(`analysis`는 blueprint의 33, `runtime`은 미산정)이고 `runtime`→`analysis` 간선 settle 67·behaviors 11·validation 10·record 3·dispatch 2문이 진입점 경유로 바뀐다. 문서 3쌍 추가.
- 위험: `blueprint`를 `settle`이 67문으로 쓰므로 `analysis`를 따로 떼는 이득이 작고, `blueprint`가 `core/utils`를 2문 가져오는데 `utils`가 `runtime`에 들어가므로 `analysis`↔`runtime`이 묶음 수준에서 서로 의존한다. 셋 중 비용 대비 이득이 가장 낮다.

### 공통 소작업(어느 후보와도 함께 갈 수 있는 것, 각각 독립 커밋)

| 항목 | 출처 | 비용 |
|---|---|---|
| `app/constants` → `src/constants`(또는 `types`)로 올리기 | §4.1(1) | import 6문, app 문서 1 |
| `types/jsonSchema.ts`가 `@/schema-form/core` 진입점 경유 | §4.1(2) | 1문 |
| `FormProps`·`FormHandle`을 루트 `types`로, 또는 `RootBinding`만 providers 공개 형으로 | §4.3(1) | 형 import 7문, 문서 2 |
| `SchemaNodeProxyProps`를 `components/SchemaNode/type.ts`로 | §4.3(2) | 형 import 4문, 문서 1 |
| `SchemaFormPlugin` 형을 `src/types`로(core→helpers/error→app/plugin 형 사이클 끊기) | §4.3(3) | 형 import 1문, 문서 1 |
| `helpers/defaultValue`·`dynamicExpression`·`jsonSchema` 삭제 또는 유지 선언 | §4.4(2) | 결정 필요; 삭제 시 29파일(코드 15, 문서 14) |
| `helpers`·`components` 컨테이너를 fractal(진입점 보유)로 올리거나 그대로 "구획"으로 선언 | §4.4(1) | 결정 필요 |
| `hooks`를 fractal로(INTENT+index) | §4.4(5) | 문서 1, `src/index.ts` 재수출 5줄 |
| `export *` 진입점 7개(+organ 배럴 2개)를 이름 재수출로 | §4.6 | 각 1파일 |
| `helpers/jsonPointer/index.ts`의 `export * from './utils'` | §4.5 | 1파일 |

## 6. 권고와 소유자 결정 사항

- 권고: **후보 C**. 소유자가 물은 "엔진과 겉면인가, 노드가 엔진을 소유하는가"에 둘 다 "그렇다"로 답하는 모양이고(겉면이 엔진을 소유하며 둘은 한 fractal `core`의 자식), B처럼 겉면 루트에 아홉 자식을 쌓지 않으며(설계 판단; 도구 판정은 B도 통과), D보다 가로지르는 간선이 적다. 비용의 핵심은 `engine/index.ts`의 이름 67개이며 형제 간 511문과 별칭 44문은 손대지 않는다.
- 결정 필요 1: `core`라는 이름을 둘지(`src/core/{engine,surface}`) `node`로 바꿀지. 바꾸면 별칭·상대 import 44문(시험 29)과 eslint 15줄이 더 든다.
- 결정 필요 2: `validation`의 공개 계약 넷을 `engine` 진입점이 수출할지, `surface`가 받아 넘길지.
- 결정 필요 3: `helpers/defaultValue`·`dynamicExpression`·`jsonSchema` 삭제 여부.
- 결정 필요 4: `helpers`·`components`를 fractal로 올릴지 구획으로 선언할지(`providers`와 모양을 맞추는 것이 목적).
- 결정 필요 5: `app/constants`의 새 자리(`src/constants` 또는 `types`).
- 절차: 재배치는 07 머지 뒤 filid restructure(읽기 전용 계획 → 승인 → 외부 실행 → 사후 조건)로 하고 INTENT/DETAIL이 코드보다 먼저 바뀐다(193라운드 답 (4)). 이 문서는 그 계획의 입력이다.

## 부록 — 재현 명령

- 간선 표·사이클·organ 외부 소비자: scratchpad `consumer-evidence.md`(정규식 import 해석, 690파일).
- filid: `fractal_inspect scan`·`validate` on `packages/canard/schema-form/src`(스냅숏 `0d697381…`), 요약은 scratchpad `filid-digest.md`.
- 별칭 import 수: `grep -rn "from '@/schema-form/core" src --include='*.ts' --include='*.tsx'`(레거시·시험 제외/포함 각각).
- 형제 간 상대 import 수: `grep -rhoE "from '(\.\./)+(record|blueprint|settle|dispatch|navigation|validation|behaviors|SchemaNode|types|utils)('|/)" src/core`에 `--exclude-dir=__tests__`를 주면 591이고, 그중 같은 단위 안의 `../utils/…` 90을 빼면 단위를 건너는 511이다(시험 포함 시 1,140). 검증 스크립트: scratchpad `verify38/{collect,boundary,scc2,coreunits}.js`(TypeScript 컴파일러 API로 import 해석).
- `helpers` 소비자: 각 자식에 대해 `grep -rlE "schema-form/helpers/<name>|from '(\.\./)+<name>('|/)"`(레거시·시험 제외).
