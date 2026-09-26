# 설계 결정 교차검증 실행 기록

실행일: 2026-09-22. 현재 작업 트리의 `src`를 사용했습니다. 제품 코드는 수정하지 않았습니다.

## 1. AJV 8.17.1

패키지 디렉터리에서 `yarn node architecture/reviews/crosscheck-decisions-ajv.mjs`를 실행했습니다. 종료 코드 0입니다. 스크립트는 `schema-form-ajv8-plugin` 위치에서 AJV를 해석하고 버전이 정확히 8.17.1인지 검사합니다. 옵션은 `strict:false, allErrors:true, useDefaults:false`입니다. 검증 전후 값은 같았습니다.

```text
version=8.17.1
falseProperty {x:"secret"}: valid=false
  instancePath=/x; schemaPath=#/properties/x/false schema
  keyword=false schema; params={}; message=boolean schema is false
falseProperty {}: valid=true
falseProperty {x:null}: valid=false; same false-schema error
notRequired {x:"secret"}: valid=false
  instancePath=""; schemaPath=#/not
  keyword=not; params={}; message=must NOT be valid
notRequired {}: valid=true
notRequired {x:null}: valid=false
  instancePath=""; keyword=not; message=must NOT be valid
  instancePath=/x; keyword=type; params={type:"string"}; message=must be string
requiredAndFalse {x:"secret"}: valid=false; false-schema error at /x
requiredAndFalse {}: valid=false
  instancePath=""; schemaPath=#/required
  keyword=required; params={missingProperty:"x"}; message=must have required property 'x'
requiredAndFalse {x:null}: valid=false; false-schema error at /x
conditionalFalse {mode:"ban",x:"secret"}: valid=false
  instancePath=/x; schemaPath=#/then/properties/x/false schema
  keyword=false schema; params={}; message=boolean schema is false
  instancePath=""; schemaPath=#/if
  keyword=if; params={failingKeyword:"then"}; message=must match "then" schema
conditionalFalse {mode:"ban"}: valid=true
selfNegating {}: valid=true; output={}
selfNegating {x:1}: valid=true; output={x:1}
```

위 표기는 JSON 출력의 공백과 따옴표를 간소화한 것입니다.

## 2. 현재 코드 실행

패키지 디렉터리에서 다음 명령을 각 시나리오별 새 프로세스로 실행했습니다.

```sh
yarn node ../../../node_modules/vite-node/vite-node.mjs --config architecture/spikes/work-loop/vite.spike.config.mjs architecture/reviews/crosscheck-decisions-current.ts selfNegating
```

마지막 인자를 `selfNegatingDeclared`, `falseProperty`, `notRequired`, `conditionalFalse`로 바꿔 반복했습니다. 각 프로세스는 초기화 후 30ms를 기다렸으며 모두 종료 코드 0입니다. `falseProperty`의 동기 예외는 스크립트가 잡아 출력했습니다. 검증기 플러그인 없이 **폼 노드 생성·조건 처리**를 검사한 실행입니다. AJV 검증과 혼동하지 않습니다.

```json
{"name":"selfNegating","value":{},"xExists":false}
{"name":"selfNegatingDeclared","value":{},"xExists":true,"xType":"number"}
{"name":"falseProperty","error":"UNKNOWN_JSON_SCHEMA"}
{"name":"notRequired","value":{"x":"secret","mode":"ban"},"xExists":true,"xType":"string","xValue":"secret"}
{"name":"conditionalFalse","value":{"mode":"ban","x":"secret"},"xExists":true,"xType":"string","xValue":"secret"}
```

`falseProperty` 오류 메시지의 첫 문장: `Unknown JSON Schema type encountered.` / `Received Type: 'undefined'`. selfNegating 두 경우는 `INFINITE_LOOP_DETECTED`를 내지 않았습니다. 일반적인 모든 조건부 스키마가 수렴한다는 증거는 아닙니다.

실행 도구의 시행착오: context-mode batch에서 셸 `for`가 구문 오류를 냈고, `yarn exec vite-node`는 해당 패키지의 실행 경로에서 찾지 못했습니다. 위 명령은 이미 설치된 루트의 vite-node를 `yarn node`로 실행한 최종 재현 명령입니다. 설치는 하지 않았습니다.

## 3. 기존 테스트 기준선

저장소 루트에서 실행했습니다.

```sh
yarn workspace @canard/schema-form test --run src/core/__tests__/VirtualNode.test.ts src/__tests__/scenarios/virtual.render.test.tsx src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx
```

```text
exit 0
processVirtualSchema.test.ts (15 tests)
VirtualNode.test.ts (10 tests)
virtual.render.test.tsx (12 tests)
nullable.object-blank-state.render.test.tsx (8 tests)
ObjectNode.branch.nullable.blankState.test.ts (17 tests)
Test Files  5 passed (5)
Tests       62 passed (62)
```

새 설계의 테스트 통과를 뜻하지 않습니다. S4 폐기 시 실패 예상 및 virtual 이식 가능 수는 테스트 단언을 읽은 추론입니다. 문서·재현 스크립트만 추가한 검토 작업이므로 전체 빌드·lint·typecheck는 실행하지 않았습니다.

## 4. 로컬 코퍼스의 부정 키워드 검색

`rg --files <dir> -g '*.ts' -g '*.tsx' -g '*.json'`로 파일을 열거하고 각 파일 텍스트에서 `/\bnot\s*:/g`, `/\bif\s*:/g`의 일치 수를 합산했습니다. 문서·architecture·생성 번들은 제외했습니다.

| 범위 | 파일 수 | `not:` 수 | `if:` 수 | `not:` 포함 파일 수 |
| --- | ---: | ---: | ---: | ---: |
| src | 651 | 3 | 310 | 1 |
| stories | 54 | 0 | 149 | 0 |
| bench | 7 | 0 | 0 | 0 |

일치한 세 곳은 모두 `src/core/__tests__/ObjectNode.composition.nullUnreachableWarning.test.ts:125,129,152`입니다. 스키마 AST가 아닌 어휘 검색이며, 따옴표로 감싼 키·생성 스키마·외부 고객 스키마는 이 수치로 측정하지 못합니다. `if:` 수는 스키마 수나 부정 가드의 분모가 아닙니다. 로컬 표본에서 명시적 `not:`가 드물다는 관찰만 가능합니다. `else`도 부정 조건이므로 `not:`만으로 부정 가드 전체의 빈도를 계산할 수 없습니다.
