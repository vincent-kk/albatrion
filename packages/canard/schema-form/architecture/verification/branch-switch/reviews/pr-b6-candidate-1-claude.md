# B6 독립 검토 — 경로 문법 단일 해석기와 별표 장치 제거

검토 대상은 `branch-switch-b6` worktree의 `0b9337cd9..60a9c8e6a`(제품 후보 `be49b6c67`)입니다. 읽기 전용으로 검토했고, 이 머신의 측정 창 때문에 yarn·시험·빌드는 실행하지 않았습니다. 아래 판정은 코드 추적과 원시 JSON 대조에 근거합니다.

## 판정

**FAIL** — import 모델 시험에 검증 코드 전체를 D·S1에서 빼는 일괄 예외가 들어가 459C-03과 루트 CLAUDE.md 원칙 5를 정면으로 어기므로, 이 결함을 고치기 전에는 병합할 수 없습니다.

## 결함

### 1. [P1, 확인됨] import 모델에 검증 구획 일괄 예외가 추가되었습니다

- 위치: `packages/canard/schema-form/src/__tests__/importModel.test.ts:162-170`(예외 분기), `:9`(머리 주석), `:183-201`(예외를 고정하는 새 시험), `packages/canard/schema-form/src/DETAIL.md:12`("검증 구획은 검증하는 내부 파일을 직접 가져올 수 있으며 D·S1의 배치 위반으로 취급하지 않는다"), `architecture/verification/branch-switch/b6-results.md:193`.
- 무엇이 바뀌었는지: `classifyImport`가 가져오는 쪽 경로에 `__tests__`·`__benchmarks__`·`fixtures` 마디가 하나라도 있으면, 대상이 index가 아닌 한 D와 S1 판정을 모두 건너뜁니다. 여섯 시험만이 아니라 저장소의 모든 시험·벤치·fixture가 어느 fractal의 내부든 옆이나 아래로 직접 가져올 수 있게 됩니다. 시험별 배치 선언은 어디에도 없습니다. 여섯 시험(`pointerSyntaxCache.test.ts`, `getDependencyIndex.live-paths.test.ts`, `getDependencyIndex.pointer-work.test.ts`, `settle.pointer-path-work.test.ts`, `settle.pointer-slot-work.test.ts`, `settle.pointer-watch-work.test.ts`)은 DETAIL 어디에도 선언되어 있지 않습니다.
- 왜 문제인지: `architecture/reviews/round-459-closing.md:12`의 459C-03은 "importModel.test.ts의 U/D/S1 = 0 기대값에는 verification 전체 예외를 넣지 않고 배치로 푼다"고 정했습니다. 루트 CLAUDE.md 원칙 5는 "The verification-file exemption in filid_fractal-boundaries §5 does not lift §3"이라고 적고, filid §3도 검증 코드에 같은 규칙을 적용합니다. 이 변경은 그 금지를 그대로 넣었습니다. 앞으로 어떤 시험이 다른 fractal 내부에 붙어도 가드가 잡지 못합니다. PR 본문 초안(`b6-pr-body.md`)도 이 변경을 언급하지 않습니다.
- 고치는 법:
  1. `importModel.test.ts`에서 162-170행의 예외 분기, 9행의 주석 줄, 183-201행의 `permits concrete verification probes…` 시험을 지웁니다. 277행의 B1·B7 예외는 기준에도 있던 것이므로 그대로 둡니다.
  2. `src/DETAIL.md:12`의 "검증 구획은 … U 우회를 허용하지 않는다." 두 문장을 지우고 기준 문장으로 되돌립니다.
  3. 여섯 시험의 `import * as segmentGrammar|grammar from '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments'`를, 같은 변경의 `core/engine/blueprint/__tests__/blueprint.owned-inline-path-work.test.ts:6-25`가 이미 쓰는 `vi.hoisted` 계수기와 `vi.mock(path, importOriginal)` 감싸기로 바꿉니다. 그러면 import 간선이 생기지 않고, positive control은 감싼 함수의 호출 수로 유지합니다.
  4. `src/core/engine/DETAIL.md`의 기존 B8 선언(branchless-differential의 `vi.mock`) 옆에 이 일곱 파일(위 여섯과 `blueprint.owned-inline-path-work.test.ts`)이 `helpers/jsonPointer` 내부를 `vi.mock`으로 계수하는 이유를 파일마다 한 줄씩 선언합니다. 코디네이터가 옆 방향 `vi.mock` 선언을 받아들이지 않으면, 시험의 자리를 옮기는 배치안이 필요하며 이는 코디네이터가 정합니다.
  5. 검증: `importModel.test.ts`가 예외 없이 `D=0, S1=0`이어야 하고, 일곱 시험과 그 positive control이 통과해야 합니다. `b6-results.md:193`의 서술도 고쳐야 합니다.

### 2. [P2, 코드 차이 확인됨, 관측 영향은 실행하지 않아 미확정] 배열 아이템 템플릿의 파생 대상 경로가 리터럴 별표로 바뀌었습니다

- 위치: `packages/canard/schema-form/src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:164`, 원인 `src/core/engine/derive/utils/rules/getDeriveRuleTable.ts:88`.
- 무엇이 잘못되었는지: fragment 층 파생 규칙은 배열 아이템 템플릿을 `targetName: '*'`라는 문자열 표지로 가리킵니다. 기준은 `declaration.path + '/' + escapeSegment('*')`로 `/list/*`(와일드카드)를 만들었습니다. 지금은 `appendSegment(declaration.path, '*')`가 `formatSegment`를 거쳐 `/list/%2A`(이름이 `*`인 리터럴 속성)를 만듭니다. 그래서 아이템의 `controls.watch`가 아이템 안을 가리키면(`./x` 등) 의존 trie에 `PointerOperator.Wildcard`가 아니라 이름 `'*'` 자식으로 등록됩니다. `affected('/list/0/x')`는 `isCanonicalArrayIndex`일 때 Wildcard 자식만 따라가므로 이 owner를 찾지 못합니다.
- 왜 문제인지: 이름이 `*`인 키가 없는 보통 스키마에서 의존 색인 내용이 기준과 달라집니다. 이는 관문의 "그 밖의 차이는 0"에 어긋납니다. derive 원천 수집이 변경 경로의 조상(`/list`)을 늘 넣기 때문에 파생 재계산 자체는 가려질 수 있습니다. 하지만 `registerRecalculation`과 `ordinaryOwners`의 쓰임에는 영향이 남을 수 있으며, 실행으로 확인하지 못했습니다.
- 고치는 법: `getDependencyIndex.ts:164`를 다음처럼 바꿉니다. 문자열 `'*'` 비교를 피하려면 `getDeriveRuleTable.ts:88`의 표지를 `targetName: '*'` 대신 별도 필드(예: `targetItems: true`)로 바꾸고 `getRuleTargets.ts:27`도 그 필드로 가릅니다. 템플릿 경로는 `populateNodeChildren.ts:268`과 같은 `joinPointer([...this.pathSegments(declaration.path), PointerOperator.Wildcard])`로 만듭니다.
- 검증: 수정 전에 실패하는 시험을 하나 둡니다. `list: { type: 'array', oneOf: [{ items: { type: 'object', properties: { x: {…}, y: {…} }, controls: { watch: ['./x'] } }, controls: { derived: … } }] }`에서 `getDependencyIndex(blueprint).affected('/list/0/x', root)`가 `/list`를 포함해야 합니다.

### 3. [P2, 그럴듯함] 검증기 schemaPath를 새로 파싱하면서 검증 전체가 `ValidatorThrew`로 바뀔 수 있습니다

- 위치: `src/core/engine/validation/utils/route/normalizeValidationIssue.ts:15-18`, `src/helpers/jsonPointer/utils/parseStandardPointer.ts:20-21,25`, `src/core/engine/validation/utils/run/runFieldNodeValidation.ts:20-35`.
- 무엇이 잘못되었는지: 기준은 schemaPath를 해석하지 않았습니다. 지금은 schemaPath가 있으면 `parseStandardPointer`를 부릅니다. 이 함수는 `/`나 `#/`로 시작하지 않는 문자열(예: 사용자 검증기 플러그인의 `'minLength'`, `'other.json#/…'`)에서 `PointerSyntaxError`를 던지고, fragment의 잘못된 `%`에서는 `URIError`를 던집니다. 그 호출이 `runFieldNodeValidation`의 try 안에 있어서, 이슈 하나의 schemaPath 형식 때문에 모든 이슈가 사라지고 검증 실행이 `ValidatorThrew`가 됩니다. 공개 `ValidationIssue.schemaPath`는 형식을 강제하지 않는 `string`입니다.
- 고치는 법: `normalizeValidationIssue.ts`에서 schemaPath는 `isAbsolutePointer(issue.schemaPath)`일 때만 정규화합니다. 정규화는 try/catch로 감싸 실패하면 원래 schemaPath를 유지합니다. dataPath도 같은 방식으로 원문을 유지합니다.
- 검증: `compile: () => () => [{ dataPath: '/name', schemaPath: 'minLength', message: 'm' }]`와 `schemaPath: '#/properties/100%'`를 반환하는 공개 Form 시험에서, `/name` 노드가 이슈를 받고 `ValidatorThrew`가 나지 않아야 합니다.

### 4. [P2, 확인됨] 격리 시험이 경로 조립과 연산자 비교를 일부만 잡으며, 실제 잔여 지점이 남아 있습니다

- 시험의 한계(`src/__tests__/pointerIsolation.test.ts`):
  - 160-171행의 결합 규칙은 `+` 이항식만 보고, 왼쪽 텍스트가 `path|pointer|…`일 때만 잡습니다. 그래서 템플릿 리터럴(`` `${a}/${b}` ``)과 `base + '/' + key`를 놓칩니다.
  - 150-158행과 104-111행은 피연산자나 수신자 이름이 정규식에 맞을 때만 잡습니다.
  - 99-103행은 `startsWith('/')`를 검사하지 않습니다.
  - 정규식 리터럴로 경로를 구조 분해하는 것도 검사하지 않습니다.
- 지금 남은 제품 지점:
  - `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:237-238,284-285`는 `` `${node.path}/${entry.name}` ``로, 소비자에게 나가는 `SchemaFormError` details `path`를 디코드된 이름으로 조립합니다. 이름이 `*`이면 `/x/*`(와일드카드)가 되고, `a/b`이면 이스케이프되지 않습니다. 계약 28행과 SPECIFICATION의 "reported error paths use the literal percent form"과 어긋납니다.
  - `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:70`의 `dataPath.startsWith(SEPARATOR)`.
  - `src/core/engine/settle/utils/compute/selectNodeSchema.ts:20`의 `ONE_OF_BRANCH_PREFIX` 정규식 분해.
  - `src/core/engine/derive/utils/evaluate/getRuleTargets.ts:27`의 `rule.targetName === '*'`.
  - `src/core/engine/settle/utils/controls/calculateStateKeys.ts:82,94`의 `.has($.Wildcard)`.
  - `src/core/engine/blueprint/buildNodes/utils/references/resolveReference.ts:27`의 `!(stripFragment(reference, false) !== reference)`는 `reference[0] !== '#'`를 시험 회피 형태로 쓴 이중 부정입니다.
- 왜 문제인지: 계약 35행의 격리 규칙(밖에서 `'/'` 결합 금지, 원문 연산자 비교 금지)이 완결되지 않았습니다. `b6-results.md:34-40`의 "변경 후 검출 0"은 그 검사기의 패턴에만 해당하는 수치입니다.
- 고치는 법:
  1. `selectEntryStep.ts`의 네 줄을 `appendSegment(node.path, entry.name)`로 바꿉니다. 이 값은 이미 107·296·312행에서 같은 식으로 계산합니다.
  2. 격리 시험에 TemplateExpression 검사를 더합니다. 조건은 `head`나 span 문자열에 `/`가 있고, 그 앞이나 뒤 식의 텍스트가 `path|pointer|name|segment`에 맞는 경우입니다.
  3. `startsWith`·`endsWith`의 구분자 인수 검사와, `/…\/(oneOf|properties|items)…/` 같은 경로 구조 정규식 검사를 더합니다.
  4. `propagateExternalErrorsToRoot.ts:70`은 `isAbsolutePath`로, `resolveReference.ts:27`은 `parseStandardPointer`의 예외로 맡기거나 `isAbsolutePointer`로 바꿉니다.
  5. `getRuleTargets.ts`·`calculateStateKeys.ts`·`buildFeatureNodeIndex.ts:46`의 `'*'` 이름 표지는 결함 2와 함께 별도 표지로 바꿉니다.
- 검증: 강화한 시험이 수정 전 위 지점들에서 실패하고 수정 뒤 통과해야 합니다.

### 5. [P2, 확인됨] 이번 변경으로 소비처를 잃은 파일이 남아 있습니다

- 위치: `src/helpers/jsonPointer/utils/index.ts:1-5`(organ 안의 index), `utils/getAbsolutePointer.ts`, `utils/isRelativePath.ts`, `utils/joinSegment.ts`, `utils/__tests__/getAbsolutePointer.test.ts`, `utils/__tests__/isRelativePath.test.ts`.
- 무엇이 잘못되었는지: 기준에서는 `jsonPointer/index.ts`가 `./utils`를 가져왔고, `getAbsolutePath`는 `collectDeriveConvergenceTargets` 등 제품 네 곳이 썼습니다. 지금은 제품 소비처가 0입니다. `getAbsolutePath`는 루트를 `'/'`로 돌려주는 옛 의미를 담고 있어 소유자 결정(루트는 `''`와 `#`뿐)과 맞지 않습니다.
- 왜 문제인지: 루트 CLAUDE.md 원칙 6과 seiri_reuse-first §3("Remove what YOUR change orphaned")을 어깁니다. 패키지 CLAUDE.md도 "Compartments are organs: no `index.ts` inside them"이라고 적습니다. `b6-results.md:224`는 getAbsolutePointer 시험의 cap 초과를 "무관한 기존 finding"으로 분류했지만, 실제로는 이 변경이 그 코드를 죽은 코드로 만들었습니다.
- 고치는 법: 위 여섯 파일을 지우고, `b6-results.md:224`의 분류를 고칩니다.
- 검증: 모든 소스에서 `grep -rn "getAbsolutePath\|isRelativePath\|joinSegment"`의 결과가 0이어야 하고, typecheck가 통과해야 합니다.

### 6. [P2, 코드 추적으로 확인됨] 알려진 한계가 문서보다 넓습니다

- 위치: `src/helpers/jsonPointer/utils/formatSegment.ts:14-15`, `src/core/engine/settle/utils/loadValues/readFieldNodeDefaultValue.ts:14-24`, `getLoadValue.ts:20-23`, 문서 `docs/en/SPECIFICATION.md:827`, `docs/ko/SPECIFICATION.md:825`, `src/helpers/jsonPointer/DETAIL.md:19`.
- 무엇이 잘못되었는지: 이름이 정확히 `%2A`인 속성의 노드 경로는 `/%2A`인데, 엔진 내부가 이 경로를 다시 파싱하면 이름 `*`가 됩니다. 그래서 문자열로 가리킬 수 없는 데서 그치지 않습니다.
  - `readFieldNodeDefaultValue`는 load snapshot에서 `'%2A'`가 아닌 `'*'` 키를 읽습니다.
  - 슬롯 경로(`getSlotPathNames`), presence 등록(`registerPresenceChanges.ts:59-63`), 검증 라우팅도 같은 잘못된 이름을 씁니다.
  - 형제로 `*`와 `%2A`가 함께 있으면 두 노드의 경로가 모두 `/%2A`로 겹칩니다.
  - 기준에서는 모두 정상이었습니다.
- 왜 문제인지: 소유자가 받아들인 한계는 "문자열 경로로 가리킬 수 없음"입니다. 값 적재와 경로 키 저장소의 오동작까지 받아들였는지는 문서에 없습니다.
- 고치는 법:
  - 최소안은 세 문서의 한계 문장에 "이 네 이름의 속성은 폼 속성으로 지원하지 않으며, defaultValue 적재·비활성 값·검증 배정이 예약 연산자 이름으로 해석되고, `*` 형제와 경로가 겹친다"를 추가하는 것입니다.
  - 청사진 단계에서 경고하거나 거부할지는 소유자가 정해야 합니다.
- 검증: 문서를 갱신한 것을 확인합니다. 소유자가 거부를 택하면 해당 시험을 추가합니다.

### 7. [P2, 확인됨] 새 함수 파일 19개에 TSDoc 매개변수와 결과 설명이 없습니다

- 위치: `src/helpers/jsonPointer/utils/{appendFormattedSegment,appendSegment,bindPointerTemplate,formatSegment,getChildPointer,hasPointerOperator,isAbsolutePointer,isDescendantPath,joinPointer,parsePointer,parsePointerSegments,parseSegment,parseStandardPointer,readPointerSegment,rebasePointer,resolvePointer}.ts`, `src/core/engine/utils/paths/getCachedPointerSegments.ts`, `src/core/engine/settle/utils/slots/getSlotPathNames.ts`, `src/core/engine/validation/utils/route/normalizeValidationIssue.ts`.
- 무엇이 잘못되었는지: 모두 한 줄 요약만 있고 `@param`·`@returns`가 없습니다. 실패 조건도 적혀 있지 않습니다. 예를 들어 `parseStandardPointer`가 던지는 조건이 없습니다. 같은 칸의 형제(`isAbsolutePath.ts`, `getAbsolutePointer.ts`)는 모든 칸을 채웁니다. `constants/PointerOperator.ts`의 네 멤버에도 문서 주석이 없습니다.
- 왜 문제인지: seiri_code-comments §3·§4를 어깁니다.
- 고치는 법: 각 함수에 `@param`(유효한 입력의 조건)과 `@returns`를 적고, `parseStandardPointer`·`resolvePointer`에는 `@throws`나 실패 조건을 적습니다.

### 8. [P3] 사소한 정합성 문제

- `src/helpers/jsonPointer/utils/resolvePointer.ts:28`은 상대 포인터의 마지막 빈 이름을 언제나 버립니다. 그래서 `'./a/'`가 `/host/a`가 됩니다. 기준(`resolveDependencyPath`, `getAbsolutePath`)은 `/host/a/`(a의 빈 이름 자식)였고, 절대 경로 `/a/`는 지금도 빈 이름을 유지하므로 한 줄 규칙과 어긋납니다. 고치려면 바로 앞 세그먼트가 연산자일 때만 건너뛰게 합니다(`index > 0 && typeof parsed.segments[index - 1] !== 'string'`).
- `src/core/engine/derive/utils/evaluate/getDeriveSourceNodes.ts:25`의 `return []`는 경로 하나에 연산자가 있으면 이미 모은 원천까지 모두 버립니다. 지금 입력은 구체 경로뿐이라 실제로는 도달하지 않지만, 기준처럼 그 경로만 건너뛰도록 `node = undefined; break;`로 바꾸는 편이 맞습니다.
- `src/helpers/jsonPointer/utils/readPointerSegment.ts`는 함수 셋을 내보내므로 seiri_function-boundaries §3에 걸립니다. `index.ts:9`의 `parseSegment as parsePointerSegment` 별칭은 파일 이름과 계약 이름이 다른 이름 함정입니다.
- `resolveReference.ts:3-7`은 같은 모듈을 두 import 문으로 가져옵니다. `getLoadValue.ts:20`·`readStateDependency.ts:47`의 변수 `encoded`는 이제 디코드된 이름이라 이름이 오해를 부릅니다. `parseStandardPointer.ts:4`의 "Preserve the existing …"는 이력 어휘입니다.
- `b6-results.md:101`의 창 시작 04:39:12.910은 원시 `window.json`의 `quietSince` 04:39:12.909와 1밀리초 다릅니다.

## 확인한 것

- **세그먼트 규칙** — `parseSegment`는 정확한 `*`·`..`·`.`·`@`만 고유 심볼로, 정확한 `%2A`·`%2E%2E`·`%2E`·`%40`만 리터럴로 읽습니다. 그 밖에는 `~`가 있을 때만 winglet `unescapePath`로 `~1`·`~0`을 풀며, `%`가 든 보통 이름은 바꾸지 않고 할당도 하지 않습니다. 중간의 `#`은 이름이고, 배열 입력은 첫 원소 `#`만 절대로 봅니다. `/`와 `#/`는 빈 이름이고 루트는 `''`와 `#`입니다.
- **표준 파서** — `parseStandardPointer`는 fragment만 퍼센트 디코드하고(디코드 뒤 tilde 순서), 연산자를 만들지 않습니다. AJV `/branch/*`는 `/branch/%2A`로 정규화되어 이름 `*`로 라우팅됩니다. `$ref`는 표준 파서로 이름을 찾고 정본 형식의 schemaPath를 만듭니다.
- **이관한 소비처** — findNodes와 그 문자열·배열·fragment 입력, `resolvePointer`와 기준 `resolveDependencyPath`·`getAbsolutePath`·`collectGateEvaluationReads`의 동치성을 대조했습니다. 차이는 결함 8과 소유자 결정의 슬래시뿐입니다. fieldInputMap의 `hasWildcardPath`는 기준 정규식과 동치이고, `pathExactMatchFnFactory`는 `/`와 `#/`를 빈 이름에만 맞춥니다. 노드 경로 조립(`fieldNodeFactory`, `updateFieldNodeNameAndPath`)과 slots·load value·derive·inject 읽기도 확인했습니다. presence 이름은 형식화한 뒤 다시 파싱하므로 이중 이스케이프가 없습니다.
- **캐시 수명** — runtime FIFO 256, 의존 색인의 `preparedSegments`, GateRegistry의 세그먼트, watch 멤버십은 모두 문자열을 키로 한 순수 문법이라 청사진·후보 교체 뒤에도 낡은 값을 돌려줄 수 없습니다. state 의존 계획은 호스트 identity와 hostPath로 다시 묶으므로 배열 재키에서도 맞습니다.
- **호출 수 시험** — `settle.pointer-path-work.test.ts`는 `parsePointerSegments` 모듈 자체를 spy하고 positive control이 fractal 내부 호출까지 잡는 것을 보입니다. mount 뒤 첫 실제 쓰기부터 여섯 번 모두 0을 단언하고, 사전 쓰기로 데우지 않습니다.
- **장치 제거** — 제품 소스에는 `literalStar`·`containsLiteralStar`·`literalStarRaw`가 없고 runtime 형에서도 지워졌습니다. 장치 전용 시험(`setLatentRaw.test.ts`, `markCandidateDescendants.literalStar.test.ts`, `retained-slot-wildcard`의 두 케이스, `latent-candidate-ownership-policy`의 control 케이스)은 지워졌습니다. 내부를 참조하던 시험(array-clear, scalar-latent-scope, retained-slot-capture, recursive-cost)은 장치 단언만 빠지고 공개 단언이 유지되었습니다.
- **공개 기대값 11건** — 바뀐 값은 publication 3, lifetimes 5, packed-array 2, policies 1이며 `b6-results.md:58-70`의 표와 계약 39행이 일치합니다. packed-array의 두 케이스는 재진입 값이 `held`에서 `patched`로, policies의 keep=true는 `[{path:'/group/%2A/x',value:'held'}]`와 재진입 `{'*':{x:'held'}}`로 바뀌었습니다. mixed-storage는 경로 표기만 바뀌었습니다.
- **새 시험** — 리터럴 별표 시험(`surface.pointer-literal-star.test.ts`)과 빈 이름 공개 시험 셋(`__tests__/e2e/pointer.empty-name.test.tsx`)은 공개 결과를 단언합니다. 빈 이름 시험 셋은 루트 index만 가져옵니다.
- **문서와 경계** — 영문·한글 SPECIFICATION의 세 줄 규칙, 슬래시 규칙, 알려진 한계 문장을 확인했습니다. 공개 `src/index.ts`의 차분은 0입니다. jsonPointer index의 모든 이름에 제품 소비처가 있습니다. 커밋에 공동 저자나 세션 줄이 없고, 변경 파일에 기계 로컬 절대 경로가 없습니다.
- **결과 문서의 후보 1 수치** — 22행 표(A·A′·B·B/A·폭)가 `results.summary.json`과 모두 일치합니다. 장부(oneOf 173.6875/6.708/172.1455 µs, 형제 0 82.479/3.4165/88.0415 µs), unwrapped 72.604에서 75.5205로, Node 힙 1,439.0146/1,897.6413/1,439.0834, legacy 품질 0.997845, 판정 `채택 조건 미충족`도 원시와 일치합니다.

## 확인하지 못한 것

- yarn typecheck·lint·test·build는 실행하지 않았습니다. 시험 통과, 11건 새 값이 일반 슬롯 경로의 실제 결과라는 점, 수정 전 실패 여부는 실행으로 검증하지 않았습니다.
- 결함 2의 관측 영향(파생이나 재계산이 실제로 빠지는지)과 결함 3의 실제 검증기 출력 사례는 실행으로 확인하지 못했습니다.
- 후보 2 절의 정식 측정(`b6-results.md:207-209`)은 아직 비어 있으므로 성능 관문은 판정할 수 없습니다. 후보 2 원시(`raw/b6/candidate-2/`)의 수치 대조는 하지 않았습니다.
- watch 값 메모가 빈 context 객체 identity를 재사용하도록 바뀐 동작(`readFieldNodeWatchValues.ts:51-101`)이 공개 관측에 차이를 내는지는 배달 비교 주장 외에는 확인하지 못했습니다.
- DETAIL이 코드보다 먼저 바뀌었는지는 같은 커밋 안의 순서라 판별할 수 없었습니다. `dist/index.d.ts` 차분 0은 결과 문서의 주장만 보았습니다.
