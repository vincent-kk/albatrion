# B6 후보 3 델타 재검토: 경로 문법 단일 해석기

검토 대상은 `branch-switch-b6` worktree의 `60a9c8e6a..c267a740b`(제품 커밋 `20ec03e1d`)입니다. 커밋은 다섯 개입니다. 후보 2 측정 기록 `295369d50`, 측정 도구 `fd4809dea`, gate-table fixture `9dd5dacfb`, 제품 수정 `20ec03e1d`, 결과 문서 `c267a740b`입니다. 읽기 전용으로 검토했고 yarn·시험·빌드는 실행하지 않았습니다. 작업 트리는 `c267a740b`와 같고 깨끗했습니다. import 모델과 TSDoc은 저장소 시험의 분류 규칙을 옮긴 작은 정적 스크립트로 바뀐 파일만 훑어 확인했습니다.

## 판정

**PASS**입니다. 이전 P1 하나와 P2 여섯은 모두 해결되었거나(1–5, 7) 코디네이터 결정 범위 안에서 정당하게 처리되었고(6의 기존 코드 재사용), 새로 찾은 결함 여덟 건은 모두 P3입니다.

## 이전 결함별 상태

### 1. [P1] import 모델의 검증 구획 일괄 예외: 해결, 확인됨

- `src/__tests__/importModel.test.ts`는 기준 `0b9337cd9`와 차분이 0입니다. `src/DETAIL.md`의 import 모델 문장도 기준 문장과 글자 그대로 같습니다.
- 여섯 시험은 `vi.hoisted` 계수기와 `vi.mock('@/schema-form/helpers/jsonPointer/utils/parsePointerSegments', importOriginal)` 감싸기로 셉니다. 분류 코드의 `readImports`(98–141행)는 import·export 선언, 문자열 인수의 `import()` 호출, `typeof import('…')` 형 노드만 간선으로 셉니다. `vi.mock(…)`은 속성 접근 호출이고 `importOriginal`의 형 인수는 인라인 객체 형이므로 간선이 생기지 않습니다.
- 같은 분류 규칙을 옮긴 정적 스크립트로 기준 이후 바뀐 TypeScript 파일 275개를 검사했고, U·D·S1은 모두 0이었습니다. 같은 스크립트는 이전 헤드의 `settle.pointer-path-work.test.ts` 내용에서 S1 한 건을 잡아 양성 대조가 되었습니다. 기준 이후 INTENT·DETAIL 파일의 추가나 삭제가 없어 fractal 집합이 같으므로, 바뀌지 않은 파일의 판정도 기준과 같습니다.
- 시험은 모두 자기가 세는 소비 쪽 자리(`core/engine/utils/paths`, `settle`, `settle/utils/dependencies`, `blueprint`)의 `__tests__`에 있습니다. 이는 코디네이터 결정의 "소비 동작은 engine fractal" 갈래와 맞습니다. `src/core/engine/DETAIL.md:123-130`이 일곱 파일을 파일마다 한 줄씩 선언하고, 패턴이 아니라 파일 목록이라고 못 박습니다.
- 남은 약점은 새 결함 P3-3(live-paths 시험의 양성 대조 부재)과 P3-7(jsonPointer DETAIL의 역참조 부재)에 적었습니다.

### 2. [P2] 배열 아이템 표지가 `%2A`로 등록되던 문제: 해결, 확인됨

- 규칙 표는 아이템 템플릿 행을 이름 대신 `targetItems: true`로 표시합니다(`derive/utils/rules/getDeriveRuleTable.ts:100-106,119-120`). 의존 색인은 그 표지에서만 `joinPointer([...호스트 세그먼트, PointerOperator.Wildcard])`로 템플릿 경로를 만들고, 이름이 `*`인 객체 속성은 `appendSegment`를 거쳐 `%2A`가 됩니다(`settle/utils/dependencies/getDependencyIndex.ts:168-173`). 호스트 세그먼트는 같은 파일 125–136행에서 모든 선언 경로로 미리 채워지므로, 실제 실행에서 경로가 루트로 무너지지 않습니다.
- `derive/utils/evaluate/getRuleTargets.ts:23-30`은 `targetItems`이면 살아 있는 아이템 전체를, 아니면 이름 자식을 고릅니다. 이름이 `*`인 객체 속성의 조각 규칙도 이제 그 속성을 정확히 고릅니다. 규칙 키(`getDeriveRuleKey.ts`)는 대상 경로와 대상 identity를 함께 담으므로, `targetName`이 비어도 노드 자신의 규칙과 겹치지 않습니다.
- 새 시험 `getDependencyIndex.template-targets.test.ts`의 첫째 사례는 `affected('/list/0/x')`가 `/list`를 담고 `/list/0/y`는 담지 않음을 봅니다. 이전 후보처럼 `/list/%2A/x`로 등록했다면 실패하는 단언입니다. 둘째 사례는 이름이 `*`인 속성이 `/group/%2A/sub`로 등록됨을 봅니다.
- 작업자의 "stateKey 자식 색인은 배열이 이름 자식을 갖지 않으므로 별표 표지를 유지한다"는 설명은 코드와 맞습니다. `blueprint/utils/features/buildFeatureNodeIndex.ts:46`이 넣는 `'*'`는 `settle/utils/controls/calculateStateKeys.ts:79-82,94`에서 부모가 `kind === 'array'`일 때만 아이템 전체로 읽히고, 객체 부모에서는 `has(node.name)` 이름 비교로만 맞습니다. 배열 노드의 자식 이름은 `prefixItems`의 숫자 문자열과 아이템 위치뿐이므로 겹침이 없습니다. 호스트 종류로 가르라는 코디네이터 결정과도 일치합니다.
- 제품 코드에서 조립 함수에 리터럴 `'*'`를 넘기는 곳은 없습니다. 검색 결과는 jsonPointer 시험 두 줄뿐입니다.

### 3. [P2] 검증기 경로 해석의 throw: 해결, 확인됨

- `core/engine/validation/utils/route/normalizeValidationIssue.ts:15-26`의 `rewritePointer`는 빈 문자열이 아니면서 `isAbsolutePointer`가 거짓인 값을 해석하지 않고, 해석 자체를 try/catch로 감쌉니다. `PointerSyntaxError`와 `URIError`가 모두 이 안에서 멈춥니다.
- dataPath를 다시 쓸 수 없으면 이슈를 그대로 돌려줍니다. 라우터 `routeValidationIssues.ts:54-55`는 던지지 않는 `parsePointer`로 읽고 절대 경로가 아니면 건너뛰며, 절대 경로라도 이름이 없으면 루트로 대신 배정하지 않습니다. 이는 validation DETAIL의 "주인이 없는 오류" 규칙과 같습니다.
- schemaPath는 다시 쓸 수 없으면 원문을 유지하고, dataPath 라우팅은 그대로 진행됩니다.
- 시험 `core/engine/validation/__tests__/validation.route.malformed-paths.test.ts`는 schemaPath 세 사례와 dataPath 두 사례를 봅니다. 결과 문서는 그 가운데 네 사례가 이전 제품에서 실패했다고 적었고, 코드 추적 결과와 맞습니다.

### 4. [P2] 격리 시험의 틈: 해결, 확인됨

- 시험은 템플릿 리터럴, `startsWith`·`endsWith`·`includes`의 구분자 인수, 구분자 단독 `+` 결합, `'/'` 비교, 경로 구조 정규식을 새로 잡습니다. 다섯 규칙의 탐침 시험과 오탐 방지 시험도 더했습니다. 허용 목록은 `helpers/jsonPointer/` 하나입니다(`src/__tests__/pointerIsolation.test.ts:238`).
- `selectEntryStep.ts`의 두 오류 경로는 `appendSegment(node.path, entry.name)`로 바뀌었습니다. `propagateExternalErrorsToRoot.ts`는 새 `isCanonicalPath`를, `selectNodeSchema.ts`는 새 `readOneOfBranch`를, `collectBlueprintWarnings.ts`는 새 `endsWithBranchIndex`를 씁니다. `resolveReference.ts`의 이중 부정도 풀렸습니다.
- 시험의 이름 정규식에 기대지 않고 제품 트리(`__legacy__`, `__tests__`, `__benchmarks__`, 시험 파일, `helpers/jsonPointer` 제외)를 직접 훑었습니다. 식 옆의 `/` 템플릿, `'/'` 결합, `/` 분할, `/` 접두 검사, `~0`·`~1` 처리는 남아 있지 않습니다. 걸린 것은 문서 주석 안의 소비자 예시(`FormField.tsx:71-74`)와 진단 문구(`fieldNodeFactory.ts:95`)뿐이며 둘 다 경로가 아닙니다.
- 이번 단계에서 새로 생긴 `#` 접두 결합 두 곳은 새 결함 P3-2로 따로 적었습니다.

### 5. [P2] 소비처를 잃은 파일: 해결, 확인됨

- `getAbsolutePath`, `isRelativePath`, `joinSegment`, `getAbsolutePointer`는 `src`·`bench`·`stories`·`docs` 어디에도 남아 있지 않고, `helpers/jsonPointer/utils/index.ts`도 없습니다.
- jsonPointer index의 이름 스물다섯 개는 모두 fractal 밖 제품 파일 하나 이상이 import합니다. 이번 델타가 새로 만든 파일(`isCanonicalPath`, `isReservedPercentName`, `readFormattedPointerSegment`, `readFormattedNameSegment`, `parsePointerSegment`, `readOneOfBranch`, `endsWithBranchIndex`, `assertAddressableName`)은 모두 organ 안에 있고 소비처가 있습니다. 새 fractal 루트 파일은 없습니다.
- `readPointerSegment.ts`를 세 파일로 나눈 것은 이름 변경 한 줄 외에 본문이 같습니다.

### 6. [P2] 이름이 정확히 `%2A`·`%2E`·`%2E%2E`·`%40`인 속성: 해결, 기존 코드 재사용은 수용

- `assertAddressableName`이 평면 객체(`populateNodeChildren.ts:67`)와 게이트 분기(`populateNodeChildren.ts:153`) 두 통로에서 이 네 이름을 거부합니다. 메시지에는 속성 이름과 규칙이, `details.property`에는 이름이 실립니다. 시험 `blueprint.reserved-percent-names.test.ts`는 네 이름, 분기 안의 이름, 계속 받아들여야 할 여덟 이름을 봅니다. 영문·한글 SPECIFICATION과 blueprint·buildNodes DETAIL이 같은 내용을 적었습니다.
- `FormErrorCode.UnknownJsonSchema` 재사용에 대한 판단은 다음과 같습니다.
  - 이 코드는 제품 25곳이 "스키마를 지원하는 형태로 해석할 수 없음"에 쓰는 범주 코드입니다. 그룹도 `JSON_SCHEMA_ERROR`(스키마 작성 오류)이므로, 소비자가 코드로 가르는 동작인 "작성한 스키마를 고쳐야 한다"는 점에서는 틀리지 않습니다. 메시지와 `details.property`가 원인을 정확히 알려 줍니다.
  - B6 계약은 PR 관문으로 `dist/index.d.ts` 차분 0을 적고 있습니다(`architecture/plan/branch-switch/defect-fixes.md:76`). 새 코드는 `FormErrorCode`의 값과 형을 넓혀 이 관문을 깹니다. 패키지 CLAUDE.md의 "이름 추가는 선언해야 하는 계약 변경"은 일반 규칙이고, B6에는 그보다 좁은 관문이 이미 정해져 있습니다. 따라서 B6 안에서 새 코드를 만드는 일은 작업자가 아니라 소유자가 관문을 바꾸어야 가능한 일입니다.
  - 결론적으로 재사용은 B6에서 옳은 선택입니다. 전용 코드(예: `ReservedPropertyName`)가 더 정확하다는 점은 사실이므로, 소유자가 원하면 B6 관문의 예외로 선언하거나 다음 공개 표면 변경에서 다루는 것이 맞습니다. 공개 오류 표가 이 경우를 담지 못하는 점은 새 결함 P3-5로 적었습니다.

### 7. [P2] TSDoc: 해결, 한 곳 누락

- 기준 이후 추가되거나 바뀐 제품 파일 197개의 내보낸 함수를 구문 트리로 검사했습니다. 새 파일의 함수는 모두 영어 TSDoc에 매개변수마다 `@param`, `@returns`(void 제외)를 갖고, `parseStandardPointer`는 `@throws`를 적었습니다. `PointerOperator`의 네 멤버도 문서 주석을 갖습니다.
- 걸린 것은 기준부터 문서가 비어 있던 기존 함수들과, B6가 매개변수를 더한 `resolveGateOccurrence` 하나입니다(새 결함 P3-6).

### 8. [P3] 사소한 정합성: 해결

- `resolvePointer`는 연산자 바로 뒤의 끝 빈 이름만 버리고(`resolvePointer.ts:33-39`), 절대 경로는 그보다 앞에서 돌아가므로 단독 빈 세그먼트에는 영향이 없습니다. 시험 `pointerResolution.test.ts`의 여섯 사례가 붙었습니다.
- `getDeriveSourceNodes`는 연산자가 든 경로만 건너뜁니다. 별칭 export, 중복 import, `encoded` 변수명, 이력 어휘도 고쳐졌습니다.
- 후보 1 절의 1밀리초 차이는 후보 1·2 절을 고치지 말라는 지시대로 남겼습니다.

### 지시 8–10의 확인

- **gate-table fixture의 `mockClear` 두 줄**은 별도 커밋 `9dd5dacfb`이고 그 파일의 두 줄만 바꿉니다. 분류는 `records`와 `current`만 읽고 `mock.calls`를 읽지 않으며, spy는 밖으로 나가지 않고, `mockClear`는 구현을 지우지 않습니다. 따라서 무해합니다.
- **측정 도구의 사전 점검**은 `fd4809dea`에서 외부 CPU 합계 30 % 분기를 지우고, 프로세스마다 30 %를 넘으면 무거운 목록에 넣도록 바뀌었습니다. 합계는 `externalCpuPercent`로 기록만 됩니다. 표본기 자체의 기준(프로세스 50 %, 특정 이름 10 %)은 그대로이고, B4-2 도구도 합계를 판정하지 않으므로 선례와 맞습니다.
- **결과 문서**의 후보 3 절은 여덟 결함과 해결, 실패 우선 시험 이름, 관문 결과를 적고 측정 표를 비워 둡니다. `c267a740b`는 45줄 추가뿐이라 후보 1·2 절을 건드리지 않았고, 철회 두 건(검증 구획 예외 서술, getAbsolutePointer cap 분류)은 새 절의 "철회하는 서술"이 대신합니다. 델타의 추가 줄 전체에 기계 로컬 경로가 없고, 커밋에 공동 저자나 세션 줄이 없습니다. production 프로젝트의 `blueprint.owned-inline-counts` oneOf-20 117 > 111은 기존 실패로 적혀 있으며, 그 시험 파일은 기준 이후 바뀌지 않았습니다.

## 새 결함

모두 P3이며 병합을 막지 않습니다.

### P3-1. [확인됨] 진단 소비자가 있으면 루트 노드의 라운드마다 전체 포인터를 해석합니다

- 위치: `src/core/engine/settle/utils/compute/utils/readOneOfBranch.ts:23`, 호출 `src/core/engine/settle/utils/compute/selectNodeSchema.ts:35-38`, 소비자 판정 `src/providers/RootNodeContext/utils/createRootLoad.ts:39-40`.
- 무엇이 문제인지: 기준은 정규식 한 번이었지만, 지금은 활성 선언마다 캐시 없는 `parsePointerSegments`를 부릅니다. `<Form>`은 production이 아니면 보고기가 없어도 `hasConsumer()`가 참이므로, 개발 모드의 모든 폼에서 루트 노드를 다시 계산할 때마다 이 해석이 일어납니다.
- P3인 이유: 수용 기준 `settle/DETAIL.md:728`은 "출하 모드"로 한정되어 있고, 비용 차수도 정규식과 같습니다. 다만 호출 수 시험은 보고기 없이 트리를 만들어 이 분기를 지나지 않으므로 이 경로를 잡지 못합니다.
- 고치는 법: `readOneOfBranch`가 두 번째 인수로 `segments: readonly PointerSegment[]`를 받게 바꾸고, `selectNodeSchema.ts:38`에서 `getCachedPointerSegments(node.runtime, declaration.schemaPath)`의 결과를 넘깁니다. `settle.pointer-path-work.test.ts`의 oneOf-80 사례를 `errorReporter: { hasConsumer: () => true, report: () => {} }`로 한 번 더 돌려 decoder 호출 0을 단언합니다.

### P3-2. [확인됨] `#` 접두를 jsonPointer 밖에서 비교하고 조립합니다

- 위치: `normalizeValidationIssue.ts:20`, `readOneOfBranch.ts:33`. 둘 다 이번 단계에서 새로 생겼습니다. `resolveReference.ts:71`의 `'#' + pointer`는 기준부터 있던 것입니다.
- 무엇이 문제인지: 원문의 첫 글자를 `'#'`와 비교하고 `'#' + joinPointer(...)`로 fragment 주소를 조립합니다. B6 계약은 jsonPointer를 경로 문자열의 유일한 해석기이자 조립기로 정하지만, 격리 시험은 `#`를 검사하지 않습니다.
- 고치는 법: `src/helpers/jsonPointer/utils/joinPointerWithPrefixOf.ts`에 `joinPointerWithPrefixOf(reference: string, segments: readonly PointerSegment[]): string`(반환값 `(reference[0] === '#' ? '#' : '') + joinPointer(segments)`, 전체 TSDoc 포함)을 두고 index에 이름으로 내보냅니다. 두 위치를 이 함수로 바꾸고, `pointerIsolation.test.ts`의 원문 비교 목록(`['*', '..', '.', '@', '/']`)에 `'#'`를 더합니다. 시험이 초록이어야 합니다.

### P3-3. [그럴듯함] live-paths 시험에 감싸기 양성 대조가 없습니다

- 위치: `src/core/engine/settle/utils/dependencies/__tests__/getDependencyIndex.live-paths.test.ts:11-27`, 단언 `:56,63,73,117`.
- 무엇이 문제인지: 이 파일은 `not.toHaveBeenCalled()`만 단언합니다. 이전에는 내부 모듈을 import했으므로 경로가 바뀌면 적재가 실패했습니다. 지금은 `vi.mock`의 경로 문자열이 아무 모듈에도 걸리지 않아도 시험이 초록으로 남을 수 있습니다. 다른 다섯 파일은 첫 사례에서 `toHaveBeenCalledTimes(1)`로 감싸기가 걸렸음을 확인합니다.
- 고치는 법: `import { parsePointer } from '@/schema-form/helpers/jsonPointer';`를 더하고, 52행의 `decoder.mockClear();` 한 줄을 `decoder.mockClear(); parsePointer('/positive-control'); expect(decoder).toHaveBeenCalledTimes(1); decoder.mockClear();` 네 문장으로 바꿉니다.

### P3-4. [그럴듯함, 기준부터 있던 검사] 빈 이름 자식을 겨누는 조각 규칙이 호스트를 겨눕니다

- 위치: `derive/utils/evaluate/getRuleTargets.ts:23,28`, `settle/utils/dependencies/getDependencyIndex.ts:165`, `settle/utils/dependencies/getContextOwners.ts:45`. 원인은 `derive/utils/rules/getDeriveRuleTable.ts:119`의 `targetName: entry.name`입니다.
- 무엇이 문제인지: 조각이 이름이 빈 문자열인 자식을 기여하면서 `derived`·`unsetValue` 같은 규칙을 가지면 행의 `targetName`은 `''`입니다. 세 곳이 `targetName`을 참·거짓으로 가르므로, 이 행은 노드 자신의 규칙처럼 호스트를 대상으로 삼고 의존 색인에는 watch가 등록되지 않습니다. 이 검사는 기준에도 있었지만, 이번 단계에서 소유자가 `/`와 `#/`를 빈 이름 자식으로 정해 빈 이름이 정식 주소가 되었고, 이번 델타가 바로 이 세 줄을 고쳤습니다.
- 고치는 법: 세 곳의 `rule.targetName` 참·거짓 검사를 `rule.targetName !== undefined`로 바꾸고, `getRuleTargets.ts:28`도 `rule.targetName !== undefined && hasOwnProperty(children, rule.targetName)`로 바꿉니다. 시험은 `{ type: 'object', properties: { source: { type: 'string' } }, allOf: [{ properties: { '': { type: 'string' } }, controls: { derived: './source' } }] }`에서 source를 쓴 뒤 빈 이름 자식의 값이 바뀌고 루트 값이 객체로 남는지 봅니다. 이 수정을 B6에 넣을지 다음 단계로 넘길지는 코디네이터가 정합니다.

### P3-5. [확인됨] 공개 오류 표가 새 거부 사유를 담지 않습니다

- 위치: `docs/en/SPECIFICATION.md:963`, `docs/ko/SPECIFICATION.md:961`.
- 무엇이 문제인지: 표의 `UnknownJsonSchema` 설명은 "schema analysis cannot determine a supported shape"뿐이고 비고 칸이 비어 있습니다. 코드로 오류를 찾는 소비자는 예약 이름 거부를 표에서 찾을 수 없습니다.
- 고치는 법: 영문 표의 비고 칸에 "Also raised when a property name is exactly `%2A`, `%2E`, `%2E%2E` or `%40`; `details.property` names it."를, 한글 표의 비고 칸에 "속성 이름이 정확히 `%2A`, `%2E`, `%2E%2E`, `%40`일 때도 발생하며 `details.property`가 그 이름을 담습니다."를 적습니다.
- 범위 기록: 가상 노드 이름(`options.virtual`의 키)도 `populateVirtualNodes.ts:109,139`에서 같은 방식으로 경로가 되지만 거부하지 않습니다. 코디네이터가 거부를 속성 이름으로 한정했으므로 결함이 아니라 기록으로 남깁니다.

### P3-6. [확인됨] `resolveGateOccurrence`의 새 매개변수에 문서가 없습니다

- 위치: `src/core/engine/settle/utils/gates/resolveGateOccurrence.ts:12-27`. B6가 더한 `readSegments`에 `@param`이 없어 seiri_code-comments 3절에 어긋납니다.
- 고치는 법: TSDoc에 `@param readSegments - Segment reader for canonical host and target addresses; the default decodes with parsePointerSegments, and a caller may pass a prepared reader to reuse retained syntax.`를 더합니다.

### P3-7. [확인됨] jsonPointer DETAIL에 내부 모듈을 감싸는 시험의 역참조가 없습니다

- 위치: `src/helpers/jsonPointer/DETAIL.md`.
- 무엇이 문제인지: filid 경계 규칙 5절은 내부 접근 선언을 소유 fractal의 DETAIL에 두라고 적습니다. 지금 선언은 소비 쪽 `core/engine/DETAIL.md:123-130`에만 있어, jsonPointer에서 `utils/parsePointerSegments.ts`나 `utils/formatSegment.ts`를 옮기는 사람은 일곱 시험이 그 경로 문자열에 묶여 있음을 알 수 없습니다. 코디네이터가 engine DETAIL 선언을 정했으므로 선언 위치 자체는 결함이 아닙니다.
- 고치는 법: jsonPointer DETAIL에 "`utils/parsePointerSegments.ts`와 `utils/formatSegment.ts`의 경로는 engine 시험 일곱 개가 `vi.mock`으로 감싼다. 목록은 `src/core/engine/DETAIL.md`에 있다."는 한 줄을 더합니다.

### P3-8. [확인됨] 도달하지 않는 잘못된 기본값이 남아 있습니다

- 위치: `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:170`의 `this.preparedSegments.get(declaration.path) ?? []`.
- 무엇이 문제인지: 지금은 125–136행 때문에 도달하지 않지만, 도달하면 템플릿 경로가 루트의 `/*`가 됩니다.
- 고치는 법: `this.pathSegments(declaration.path)`로 바꿉니다.

## 확인하지 못한 것

- yarn typecheck·lint·test·build·test:verify는 실행하지 않았습니다. 결과 문서의 관문 수치, `dist/index.d.ts` 해시 동일, 배달 비교 차이 0, 변경 전 실패 17건은 작업자의 기록만 보았습니다.
- production 프로젝트의 oneOf-20 117 > 111이 기준에서도 같은 값으로 실패한다는 주장은 실행으로 확인하지 못했습니다. 시험 파일이 기준 이후 바뀌지 않았다는 것까지만 확인했습니다.
- import 모델 0은 저장소 시험이 아니라 같은 분류 규칙을 옮긴 정규식 기반 스크립트로 확인했습니다. 정규식이 놓칠 수 있는 `typeof import(…)` 형 노드는 따로 검색했고 jsonPointer 내부를 가리키는 것은 없었습니다.
- `vi.mock`이 해석되지 않는 경로를 오류 없이 받는지는 vitest를 실행해 확인하지 않았으므로 P3-3은 그럴듯함으로 남깁니다.
- P3-4의 실제 동작, 곧 호스트에 파생 값이 쓰이는지는 실행하지 않았습니다.
- 후보 2 측정 원시(`raw/b6/candidate-2/`)와 결과 문서 후보 2 절의 수치 대조는 이번 범위가 아니어서 하지 않았습니다.
