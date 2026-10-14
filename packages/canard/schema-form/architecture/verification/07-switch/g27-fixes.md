# G27 1단계 B1·B3 수정 기록

## 범위와 결과

2026-10-10에 stage-07의 깨끗한 HEAD 작업 트리에서 B1·B3과 소비자가 없는 사건 형 삭제를 처리했습니다. 변경은 형 선언·형 인자·형 단언·문서·주석·ESLint 설정에 한정했으며, 커밋하거나 스테이징하지 않았습니다. CLAUDE.md를 수정하지 않았고 설치·git 쓰기·성능 측정을 실행하지 않았습니다. 각 명령과 빌드 서비스가 스스로 종료한 뒤 다음 명령을 실행했습니다.

B3의 공개 검증기 설명과 시한 주석을 바로잡았습니다. B1에서는 런타임을 바꾸지 않고 제거할 수 있는 단언을 제거했으며, 남긴 단언은 아래 소유자 승인 대기 목록에 기록했습니다. 이 목록은 승인 기록이 아니며, 남긴 단언에 대한 소유자 판단은 열려 있습니다. B2와 다른 G27 지적은 이번 수정 범위에 포함하지 않았습니다.

## B1의 형 정비와 단언 수

`EffectiveSchemaFields`에서 누적 결과의 `required`·`allOf`·`enum`을 읽기 전용 배열로, 생성된 `controls` 봉투를 키로 읽을 수 있는 객체로 선언했습니다. 따라서 `OwnedSchemaValues.add`에 전달하는 일곱 배열은 호출 자리의 `as object` 없이 형 검사에 통과합니다. 약한 소유권 색인과 실행 중 검사는 그대로 유지했습니다.

`MutableNode.childEntries`는 생성 중인 가변 배열로 선언했고 공개 `BlueprintNode.childEntries`의 읽기 전용 계약은 유지했습니다. 공개 청사진을 받아 가변 사본을 만드는 시험 도우미는 입력을 `BlueprintNode`로 선언했습니다. `readSchemaObject`의 `properties` 형을 선언부에 명시하고 `throwBlueprintError`의 함수 변수에도 `never` 반환 서명을 명시하여 자식 스키마와 검사 뒤 의존 경로의 단언을 제거했습니다. 조각의 빈 소속 배열과 경고 작업 배열은 소유 선언에서 형을 정했습니다.

힌트 동결 함수의 이전·다음 입력은 내부에서 키를 직접 색인하지 않고 `getDataProperty`로 읽으므로 `object`로 선언했습니다. 기존 `getDataProperty` 반환 형을 사용하며 새 `any`나 오류를 덮는 단언을 추가하지 않았습니다. 병합 결과 자체의 키 순회에는 아래 목록의 단언이 남습니다.

`schema-merge.mount.test.ts`의 노드를 공개의 넓은 `JSONSchema` 형으로 생성하여 `as never` 네 개를 제거했습니다. 같은 경로·값·잘못된 값과 동일한 경고·리비전·사건 순서 비교를 유지했습니다. 런타임 시험의 사례나 기대값은 추가·삭제·변경하지 않았습니다.

AST의 `as` 표현을 기준으로 세었으며 `as const`는 제외했습니다. HEAD와 `origin/1.0.0-beta`의 파일별 단언 표현을 공백 정규화한 뒤 발생 수까지 대조했습니다. findings의 17건은 위치 수이며, 의존 경로의 같은 줄에 단언 두 개가 있어서 표현 수는 18개입니다.

| 구분 | 결과 |
| --- | --- |
| B1에서 열거한 브랜치 추가 위치 | 17곳 중 13곳을 제거했고 4곳을 유지했습니다. |
| 같은 위치의 단언 표현 | 18개 중 14개를 제거했고 4개를 유지했습니다. |
| 확장된 비시험 금지 범위 전체 | 40개 중 26개를 제거했고 14개를 유지했습니다. |
| 그중 이전부터 있던 단언 표현 | 22개 중 12개를 제거했고 10개를 유지했습니다. |
| 지정된 시험의 `as never` | 네 개 모두 제거했습니다. |

`eslint.config.js`에 `src/core/blueprint/**/*.ts`와 `src/core/nodeFromJSONSchema.ts`를 대상으로 하는 단언 금지 블록을 추가했습니다. 기존 비시험 금지 블록의 시험 제외 관례를 따랐습니다. 추가 범위에는 기존 `any` 규칙을 별도로 확장하지 않았습니다. 수정 전 확장 범위의 ESLint가 실제 단언 때문에 실패함을 확인했고, 최종 전체 ESLint는 오류·경고 없이 종료 코드 0으로 통과했습니다. 남긴 표현에만 국소적인 ESLint 예외와 승인 대기 이유를 두었으며 파일 전체의 규칙을 해제하지 않았습니다.

## B3와 사건 형 삭제

코드보다 먼저 core·blueprint·record의 DETAIL을 수정했습니다. core DETAIL은 바인딩 전용 함수가 공개되지 않고, `Validator`가 `ValidatorFactory`라는 이름으로, `ValidateFunction`이 같은 이름으로 `src/types`를 거쳐 공개된다는 현재 계약을 설명합니다. `src/index.ts:79-80`의 공개 수출과 일치합니다.

`src/core/validation/type.ts`에서 PR-7까지의 옛 공개 형을 언급하는 문장을 제거했습니다. `src/types/error.ts`의 `JSONSchemaError` 주석은 렌더 오류의 현재 계약과 validator별 매개변수만 설명합니다. 실행 기록의 처분 행도 옛 형의 레거시 사본, 공개 검증기 재수출, 렌더 계층에 남은 `JSONSchemaError`를 구분하도록 고쳤습니다.

소비자가 없는 `src/core/types/event.ts`를 삭제하고 record DETAIL의 해당 문장을 제거했습니다. core DETAIL도 사건 계약의 소유자를 record로 명시했습니다. 비레거시 소스에서 `types/event`를 가져오는 import는 0건이며 형 검사도 통과했습니다. 레거시 사건 형 사본은 보존했습니다.

## 소유자 승인 대기 목록

다음 위치는 수정된 작업 트리의 행 번호입니다. 브랜치 추가 네 표현과 확장 범위에서 드러난 기존 열 표현을 모두 기록합니다. 현재 계약보다 좁은 형을 선언만으로 약속하거나 분산적인 형 변환으로 오류를 숨기지 않았습니다. 아래에서 필요한 런타임 가드·래퍼·읽기 변경은 두 번들의 바이트 동일성 조건과 충돌하므로 이번에는 실행하지 않았습니다.

| 위치 | 유지한 단언 | 런타임 변경이 필요한 이유 |
| --- | --- | --- |
| `src/core/nodeFromJSONSchema.ts:34` | `props as Parameters<typeof buildSchemaNodeTree<Schema>>[0]` | 공개 판정 함수는 `JSONSchema`를 받지만 청사진의 판정 입력에는 불리언 스키마도 포함됩니다. 공개 서명을 유지한 채 그 차이를 안전하게 없애려면 판정 호출에서 불리언을 거르는 런타임 가드가 필요하며, 호출 대상과 번들 코드가 바뀝니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts:18` | `source as Record<string, unknown>` | 작성된 controls는 아직 `unknown`이고 현재 검사는 비null 객체까지만 보장합니다. 키 색인 계약을 보장하려면 봉투 모양의 추가 검사나 키 읽기 함수 호출이 필요하며 실행 코드가 바뀝니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts:50` | `result as Record<string, unknown>` | 불투명한 두 객체를 받는 병합 함수의 결과는 객체일 뿐 문자열 색인 계약을 갖지 않습니다. 결과를 실제로 검사하거나 키 읽기 방식을 바꿔야 하므로 실행 코드가 바뀝니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:74` | `value as Record<string, unknown>` | 동적으로 읽은 controls의 현재 검사는 비null 객체까지만 보장합니다. 작성된 임의 객체에 문자열 색인 계약을 선언만으로 부여할 수 없으므로 모양 검사나 키 읽기 변경이 필요합니다. |
| `src/core/blueprint/utils/analyze/buildNodes.ts:69` | `schemaType as BlueprintNodeKind` | 가져온 `isArray`의 가드는 읽기 전용 배열을 거짓 가지에서 제거하지 못합니다. 이 모듈에서 단언 없이 종류를 좁히려면 문자열 여부 등의 런타임 검사를 바꿔야 합니다. |
| `src/core/blueprint/utils/analyze/populateNodeChildren.ts:152` | `gate.condition as { propertyName?: string }` | gate의 condition은 불투명한 `unknown`입니다. 판별자 종류만으로 객체의 필드 모양을 선언에서 보장하지 않으므로 실제 객체·필드 검사나 읽기 변경이 필요합니다. |
| `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:42` | `value as Record<string, unknown>` | 가상 필드의 동적 entry는 모양 검증 전에 읽습니다. 스키마 입력으로 좁히려면 먼저 런타임 검사를 추가해야 합니다. |
| `src/core/blueprint/utils/analyze/resolveReference.ts:35` | `context.schema as Record<string, unknown>` | 작성 루트는 불리언도 허용하지만 `getValue`의 입력 계약은 객체·배열입니다. 호출 전 루트 검사를 추가하면 현재 오류 경로와 실행 코드가 바뀝니다. |
| `src/core/blueprint/utils/analyze/resolveReference.ts:35` | `getValue(context.schema as Record<string, unknown>, pointer) as BlueprintSchema \| undefined` | `getValue`의 선언은 객체·배열을 반환하지만 현재 스키마 검사에서는 불리언 참조 대상도 받습니다. 반환 값을 넓게 받아 검증 후 스키마 객체를 별도로 좁히는 런타임 검사가 필요합니다. |
| `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:90` | `gate.condition as { propertyName: string; values: readonly unknown[]; }` | 불투명한 condition에서 판별자의 두 필드를 읽습니다. 생산·소비의 실제 모양을 보장하려면 런타임 검증을 추가해야 합니다. |
| `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:66` | `child as BlueprintSchema` | 무시되는 키워드의 자식은 아직 검증되지 않은 `Object.entries` 값입니다. 추가 스키마 모양 검사 없이 작성 데이터의 실제 형을 약속할 수 없습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:34` | `(isArray(node.schemaType) ? node.schemaType : [node.schemaType]) as readonly SchemaTypeName[]` | 가져온 배열 가드가 읽기 전용 배열을 좁히지 못합니다. 현 소유 모듈의 계약 안에서는 분기 검사를 바꿔야 단언을 제거할 수 있습니다. |
| `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts:39` | `new Function('dependencies', functionBody) as DynamicFunction` | 표준 `Function` 생성자는 구체적인 호출 서명을 반환하지 않습니다. 반환 함수를 형이 지정된 래퍼로 감싸면 함수 정체성과 실행 코드가 바뀝니다. |
| `src/core/blueprint/utils/types/readAllowedTypes.ts:44` | `[...values] as SchemaTypeName[]` | 현재 배열 전체의 `some` 검사는 각 원소를 형 가드로 좁히지 않습니다. 원소별 형 가드로 검사·수집 흐름을 바꾸면 실행 코드가 바뀝니다. |

## 명령 검증

다음 명령은 모두 `packages/canard/schema-form`에서 실행했고 스스로 종료했습니다. `npx`에는 설치를 막는 `--no-install`을 사용했습니다. 패키지 관리자 명령은 각각 독립된 호출에서 파이프·리다이렉트·환경 접두사·후속 명령 없이 실행했습니다.

| 명령 | 결과 |
| --- | --- |
| `npx --no-install vitest run --project unit --project render --project react18 --reporter=dot` | 466파일과 3,425건이 통과했으며 실패는 0건입니다. 기존 todo는 1건입니다. |
| `yarn test:production` | 종료 코드 0으로 9파일과 20건이 통과했습니다. |
| `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 종료 코드 0으로 통과했습니다. |
| `npx --no-install eslint "src/**/*.{ts,tsx}"` | 종료 코드 0으로 오류·경고 없이 통과했습니다. |
| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | 종료 코드 0이며 `LEGACY_ISOLATED: 1680 files checked`를 출력했습니다. |

## 두 번들의 바이트 동일성

지정된 core·React 빌더와 기준 manifest를 읽고 고친 작업 트리에서 다시 빌드했습니다. 재현 스크립트와 JSON 증거는 요청된 scratchpad의 `g27-fix/rebuild.mjs`, `g27-fix/bundle-identity.json`에 있습니다. core의 빌드 옵션·resolver·oneOf-40 fixture 확장은 `prepare-patch-bundles.mjs`와 같고, source loader만 HEAD의 `git show` 대신 고친 작업 트리를 읽습니다.

React는 `prepare-react-bundles.mjs`의 작업 트리 경로를 사용하며 원래 기준의 `measure-react-pair-126.entry.tsx`와 `equivalentHarness: true` 옵션을 유지했습니다. 원래 `fb-prepare.mjs`와 동일하게 소비자가 없는 isInteger initializer의 선택적 정규화를 적용했습니다. 이번 산출물에서 제거한 부분은 258바이트이며, 제품 코드를 고쳐 차이를 숨긴 것이 아닙니다. 기준 파일을 수정하지 않았고 두 산출물은 `Buffer.equals`로 비교했습니다. 성능 함수는 실행하지 않았습니다.

| 대상과 기준 | 바이트와 SHA-256 | 판정 |
| --- | --- | --- |
| core와 `S/bundles/g-head.cjs` | 두 파일 모두 548,782바이트이고 SHA-256은 `0e5bf3c3da8c000890926ac7f5a33890dfa42db2666c07ee4c013b9f892ab030`입니다. | 바이트가 완전히 동일합니다. |
| React와 `S/bundles/r133-base.cjs` | 두 파일 모두 962,944바이트이고 SHA-256은 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`입니다. | 바이트가 완전히 동일합니다. |

각 빌드가 띄운 esbuild 서비스 한 개씩은 stdin을 닫은 뒤 스스로 종료 코드 0으로 종료했습니다. 검사나 빌드 산출물은 scratchpad에만 두었습니다.

## 변경 파일과 리뷰 범위

리뷰 범위는 HEAD 대비 미커밋 변경 36파일이며 이 기록을 포함합니다. 아래 경로는 패키지 루트 기준입니다. 삭제 파일은 표에서 별도로 밝혔습니다.

| 경로 | 변경 내용 |
| --- | --- |
| `architecture/verification/07-switch/g27-fixes.md` | 수정·검증 증거와 소유자 승인 대기 목록을 기록했습니다. |
| `architecture/plan/07-switch/log.md` | 공개 오류 형의 실제 처분을 바로잡았습니다. |
| `eslint.config.js` | 청사진과 core 호스트 진입의 비시험 단언 금지 범위를 추가했습니다. |
| `src/core/DETAIL.md` | 공개 검증기와 사건 계약의 현재 소유자를 명시했습니다. |
| `src/core/record/DETAIL.md` | 삭제한 사건 형 파일을 설명하는 문장을 제거했습니다. |
| `src/core/blueprint/DETAIL.md` | 실행을 바꾸지 않는 형 정비와 승인 대기 경계를 명시했습니다. |
| `src/core/__tests__/schema-merge.mount.test.ts` | 넓은 스키마 형으로 생성하여 `as never` 네 개를 제거했습니다. |
| `src/core/blueprint/utils/analyze/__tests__/fixtures/countChildEnumeration.ts` | 도우미가 받는 공개 청사진 입력 형을 선언했습니다. |
| `src/core/blueprint/utils/analyze/buildNodes.ts` | 자식 배열 단언을 제거하고 종류 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/analyze/collectDeclarations.ts` | 가변 조각 선언에서 소속 배열의 형을 정했습니다. |
| `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/registerBlueprintDependency.ts` | 검증 뒤 문자열 경로의 단언 두 개를 제거했습니다. |
| `src/core/blueprint/utils/analyze/populateNodeChildren.ts` | 자식 스키마 단언 두 개를 제거하고 판별자 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts` | 생성 중인 자식 배열의 가변성 단언과 불필요한 형 import를 제거했습니다. |
| `src/core/blueprint/utils/analyze/populateVirtualNodes.ts` | 자식 배열 단언을 제거하고 가상 스키마 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/analyze/readSchemaObject.ts` | properties 입력의 형을 선언부에서 구체화했습니다. |
| `src/core/blueprint/utils/analyze/resolveReference.ts` | 유지한 참조 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/analyze/type.ts` | 생성 중인 childEntries의 가변 배열 형을 선언했습니다. |
| `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts` | 유지한 판별자 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts` | 작업 배열 형을 선언부에서 정하고 자식 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/diagnostics/throwBlueprintError.ts` | 함수 변수에 `never` 반환 서명을 명시했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts` | 소유 배열의 `as object` 세 개를 제거했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts` | 소유 배열의 `as object` 두 개를 제거했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts` | 누적 controls 형을 선언에서 사용하고 작성 controls 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts` | 소유 enum 배열의 단언을 제거했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts` | 두 입력 단언을 제거하고 결과 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup/utils/freezeCreatedHintObjects.ts` | 이전·다음 입력 형을 선언에서 정하고 재귀 호출의 단언 두 개를 제거했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts` | 유지한 읽기 전용 배열 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts` | 누적 스키마 형을 사용해 소유 배열 단언을 제거하고 controls 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/effectiveSchema/utils/type.ts` | 누적 소유 배열과 controls 봉투의 선언 형을 추가했습니다. |
| `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts` | 유지한 생성 함수 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/blueprint/utils/types/inferLiteralTypes.ts` | 검사 뒤 리터럴 형의 단언 두 개를 제거했습니다. |
| `src/core/blueprint/utils/types/readAllowedTypes.ts` | 유지한 형 이름 배열 단언의 승인 대기 이유를 명시했습니다. |
| `src/core/nodeFromJSONSchema.ts` | 유지한 공개 판정 함수의 연결 단언과 승인 대기 이유를 명시했습니다. |
| `src/core/types/event.ts` | 코드 소비자가 없는 옛 사건 형 파일을 삭제했습니다. |
| `src/core/validation/type.ts` | PR-7까지의 시한 문장을 제거했습니다. |
| `src/types/error.ts` | 렌더 오류와 validator별 매개변수의 현재 계약을 설명했습니다. |

리뷰에서 판단할 핵심은 승인 대기 단언의 처리이며, 해당 예외를 승인된 것으로 간주하지 않았습니다. 동작 변경이나 가드 추가는 이번 바이트 동일성 조건을 벗어나므로 별도 결정이 필요합니다.
