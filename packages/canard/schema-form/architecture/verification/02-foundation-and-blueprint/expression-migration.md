# 식 컴파일러 소유 이동 검증

LANDING-091에 따라 기존 컴파일러와 경로 등록기를 청사진 소유로 옮겼습니다. 새 계약은 구현 전에 `1f766df2`에 고정되었습니다. 함수 본문 동작, 컴파일 오류 표면, 문자열 경로 문법은 유지했습니다.

## 이동 범위

기존 기준 경로는 `src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/`, 새 기준 경로는 `src/core/blueprint/utils/expressions/`입니다.

| 기존 기준 경로 아래 | 새 기준 경로 아래 | 처리 |
| --- | --- | --- |
| createDynamicFunction/createDynamicFunction.ts | 동일 상대 경로 | 구현 이동, DynamicFunction을 자기 type에서 가져옴 |
| createDynamicFunction/index.ts | 동일 상대 경로 | 함수 및 DynamicFunction 이름 내보내기 |
| createDynamicFunction/type.ts | 동일 상대 경로 | 기존 오버로드 유지, DynamicFunction 정본 수용 |
| createDynamicFunction/utils/getFunctionBody.ts | 동일 상대 경로 | 구현 이동, 매개변수·결과·목적 주석 보완 |
| createDynamicFunction/utils/wrapReturnStatements.ts | 동일 상대 경로 | 구현 그대로 이동 |
| getPathManager/getPathManager.ts | 동일 상대 경로 | 구현 그대로 이동, registry 주석 보완 |
| getPathManager/index.ts | 동일 상대 경로 | 기존 함수·PathManager 내보내기 유지 |
| regex.ts의 JSON_POINTER_PATH_REGEX와 그 private 상수 | regex.ts | SIMPLE_EQUALITY_REGEX는 옛 소유자에 남김 |
| type.ts의 DynamicFunction | createDynamicFunction/type.ts | 옛 경유 재수출 없이 소비자 갱신 |
| createDynamicFunction/__tests__/getFunctionBody.test.ts | createDynamicFunction/__tests__/getFunctionBody.*.test.ts | 4개 행동군으로 분할 |
| createDynamicFunction/__tests__/wrapReturnStatements.test.ts | createDynamicFunction/__tests__/wrapReturnStatements.*.test.ts | 10개 행동군으로 분할 |
| __tests__/createDynamicFunction.test.ts | createDynamicFunction/__tests__/createDynamicFunction.*.test.ts | 9개 행동군으로 분할 |
| __tests__/regex.boundary.test.ts | __tests__/regex.boundary.*.test.ts | 9개 행동군으로 분할 |
| __tests__/regex.context.test.ts | __tests__/regex.context.*.test.ts | 10개 행동군으로 분할 |
| __tests__/regex.exotic-keys.test.ts | 동일 상대 경로 | 그대로 이동 |
| __tests__/regex.extended.test.ts | 동일 상대 경로 | 그대로 이동 |
| __tests__/regex.json-validity.test.ts | 동일 상대 경로 | 그대로 이동 |
| __tests__/regex.test.ts의 pointer describe | __tests__/regex.test.ts | 32개 시험 이동, equality 21개는 옛 소유자에 유지 |

옛 ComputedPropertiesManager·checkComputedOptionFactory·getDerivedValueFactory·getObservedValuesFactory·getConditionIndexFactory·getConditionIndicesFactory·extractConditionInfo와 관련 시험은 청사진 진입점의 이름 내보내기를 사용합니다. 옛 type.ts의 DynamicFunction 경유 재수출과 compiler/path-manager 경유 호환 파일은 만들지 않았습니다. 컴파일러와 PathManager는 형제 진입점을 통해 연결하고, 컴파일러는 자신의 type·utils를 직접 가져옵니다. regex는 청사진 소유 organ으로 두었습니다.

## 검증

이동 전:

```sh
yarn workspace @canard/schema-form test --run --project unit getComputedPropertiesManager
```

결과: 16파일, 543시험 통과(exit 0).

이동·분할·불필요한 시험 보조 선언 정리 후:

```sh
yarn workspace @canard/schema-form test --run --project unit getComputedPropertiesManager blueprint/utils/expressions
yarn workspace @canard/schema-form exec eslint src/core/blueprint/utils/expressions src/core/nodes/AbstractNode/utils/getComputedPropertiesManager --format json
```

결과: **54파일, 543시험 통과**, 3.05초(exit 0). scoped ESLint 오류 0·경고 0. 로그에 보이는 `Simulated Function constructor error`와 SyntaxError 출력은 기존 오류 처리 시험의 의도된 입력이며 해당 시험도 통과했습니다.

분할 전 HEAD의 기존 16개 시험 파일과 이동 후 전체 파일에서 TypeScript AST로 각 `it`/`test` 호출을 추출했습니다. 주석을 제외한 TypeScript printer 결과를 정렬하여 비교한 결과 **543개 호출이 완전히 동일**했습니다. 단언·입력·시험 이름을 바꾸거나 제거하지 않았습니다. 새 소유자에 있는 시험 파일은 46개이며 한 파일의 최대 사례 수는 32입니다. 원래부터 32개를 넘던 옛 소비자의 시험은 이 이동에서 재구성하지 않았습니다.

`yarn workspace @canard/schema-form typecheck`도 실행했습니다. 이 이동 경로에서는 오류가 없었으나 병행 중인 nullable 타입 작업으로 기존 ArrayNode·BooleanNode·NumberNode·ObjectNode·StringNode 생성자에 TS2345 다섯 건이 있어 패키지 전체 결과는 exit 2입니다. 통합 타입 게이트가 완료되었다고 주장하지 않습니다.

## 발견

- filid hook이 옛 계약 문서 제거를 차단했습니다. 첫 `Delete File`의 `createDynamicFunction/DETAIL.md`, 이어 실제 소유 이동을 나타내는 `Update File + Move to`의 `createDynamicFunction/INTENT.md`를 모두 `FCA contract document` 삭제로 보아 거절했습니다. 새 문서 내용은 선행 커밋의 내용으로 보존하는 요청이었습니다. 루트 조정자가 native `git mv`로 실제 문서 소유 이동을 수행하고 목적지의 승인된 계약 내용을 보존하여 네 파일의 이동을 마쳤습니다. 차단된 apply_patch 동작 자체는 도구 제약 발견으로 남깁니다.
- expressions organ 아래 regex/검증 파일을 만들 때 hook이 organ 하위 디렉토리 경고를 냈습니다. 저장소 규칙은 organ 아래 탐색 및 하위 fractal을 허용하므로 전면 평탄화를 위해 소유 구조를 바꾸지 않았습니다. PR 경계의 실제 filid 스캔에서 대조할 발견으로 남깁니다.
- 대형 일괄 patch의 출력이 잘려 첫 시도가 envelope 검사에서 거절되었습니다. 파일별 작은 V4A patch로 나누어 적용했으며, 거절된 일괄 시도에는 파일 변경이 없었습니다.
- 실제 청사진에서의 schemaPath 오류 래핑·controls/watch 컴파일은 청사진 분석기의 별도 검증 범위입니다. 이 이동은 기존 컴파일러 동작 보존만 입증합니다.
