# 공개 타입 추론 감사: @canard/schema-form 0.16.0과 신규 소스

총 **73개 소비자 사례**를 두 진입점으로 각각 컴파일했습니다. 경로별로 defaultValue 22개, 핸들러 18개, ref 20개, 제네릭 주입 13개입니다. **독립적인 차이 9건**, 타입 관측 또는 수용 여부가 달라진 사례 28개, 컴파일 수용 여부가 달라진 사례 12개를 확인했습니다. 명시적 `Value` 주입의 핵심 값 경로는 양쪽 모두 정확했습니다. 제품 수정은 적용하지 않았습니다.

## 방법과 환경

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- 브랜치: `feat/schema-form-07b-1`
- HEAD: `d3659173ed385094e146922310635447b41a14d2`
- 최초 시작 시 `git status --porcelain`: 빈 출력. 이번 재개 직전에는 앞서 작성한 이 보고서만 untracked 상태였습니다.
- TypeScript `5.9.2`, `@types/react` `19.2.14`, 레거시 패키지 `0.16.0`
- 레거시 진입점: `node_modules/@canard/schema-form_0.16.0/dist/index.d.ts`. 패키지의 `types`와 `exports["."].types`가 이 파일을 가리키며, `:2`에서 `Form`·`FormHandle`·`FormProps`·`FormChildrenProps`, `:9`에서 `InferValueType`을 내보냅니다. 프로브는 실제로 `'@canard/schema-form_0.16.0'`을 import합니다.
- 신규 진입점: `packages/canard/schema-form/src/index.ts`. `:8`·`:11`·`:77`의 공개 재수출을 따라 실제 신규 소스 타입을 검사합니다.
- 기준 판 파일의 SHA-256: `node_modules/@canard/schema-form_0.16.0/dist/index.d.ts`는 `6d0f5f9fe6e37041137f3ba0b6a438a47507a66002114529ee42bd32bd5d1de8`, 같은 디렉터리의 `package.json`은 `7f97bd949e1ae616913d7afa4b5a95d631ab2a83f47100dd65a0e46604d1b24e`입니다.
- `src/__legacy__`에는 이동된 core·helpers·types만 있고 React Form이 없으므로 **비교 대상으로 사용하지 않았습니다**. 0.16.0 공개판을 기준으로 삼은 것은 원장 관리자의 결정입니다(150라운드 덧붙임, 1.0.0-beta `c257b7928`).
- 양쪽 `@winglet/json-schema`는 같은 `packages/winglet/json-schema/dist/index.d.ts`로 해석됩니다. 해당 워크스페이스 버전도 `0.16.0`입니다. 이 결과는 설치된 선언과 현재 의존성 해석을 기준으로 하며, 과거 의존성 전체를 따로 복원한 환경의 결과가 아닙니다.
- 지정된 앵커를 확인했습니다: 신규 `InferValueType`은 `src/types/value.ts:127`, `InferSchemaNode`는 `src/core/SchemaNode/type.ts:242`, `FormHandle`은 `src/components/Form/type.ts:125`입니다.
- `CLAUDE.md:135`의 `Key Type Utilities`를 읽었습니다. `:138`의 optional·열린 스키마 추론 및 default/ref 주의사항, `:139`의 두 nullable 표기법을 프로브에 반영했습니다.

작업 트리 루트에서 다음 **단일 명령**으로 재현합니다.

```sh
node packages/canard/schema-form/architecture/verification/07b/type-inference-audit/runner.cjs
```

`runner.cjs`는 네 프로브 파일과 공통 fixture를 동일하게 두 번 컴파일합니다. 레거시는 원래 import를 사용하고, 신규는 compiler host의 메모리 안에서 진입점 import만 `../../../../src/index`로 바꿉니다. 타입 구현·스키마·콜백·ref 코드는 바꾸지 않습니다. 양쪽 실제 해석 경로와 공개 심벌 선언 위치도 출력합니다.

프로브의 `@audit` 주석 하나를 한 사례로 집계하며, `inspect(label, expression)`의 expression 타입을 `checker.typeToString`으로 기록합니다. JSX의 해석된 Form 서명에서 `defaultValue`의 검사 타입도 추출합니다. 각 사례의 실제 TypeScript 진단 코드·메시지·위치를 별도로 출력합니다. `inspect`는 인자에 값 타입 제약을 더하지 않는 선언이며, 프로브는 실행하지 않습니다.

`tsconfig.json`은 패키지 tsconfig를 extends합니다. strict·strictNullChecks·strictFunctionTypes·skipLibCheck 등을 유지하고, audit 입력만 include합니다. composite·incremental·declaration·emitDeclarationOnly를 끄고 noEmit을 유지해 빌드 산출물이 생기지 않게 했습니다. 신규 소스의 `process` 선언을 위해 이미 설치된 `node` 타입과 `react` 타입을 지정했습니다. 패키지 tsconfig와 vitest 설정은 편집하지 않았습니다.

양쪽 모두 프로브 밖 환경 진단은 **0개**입니다. 사례 안에서 기대하는 불일치·거부까지 모두 컴파일해 기록하므로, 실행 명령의 종료 코드 0은 모든 사례가 수용된다는 뜻이 아닙니다. 레거시는 53개 수용·20개 거부, 신규는 51개 수용·22개 거부입니다. 전체 사례 결과의 SHA-256은 `2997376a5271d44f41fe7288f880443d5155c8a8c1e8d668327552052df43fa6`입니다.

### 표 읽는 법

표의 `L/`은 작업 트리의 `node_modules/@canard/schema-form_0.16.0/dist/`, `N/`은 패키지 `src/`입니다. `file:19,25`는 같은 파일의 19행과 25행입니다. 파일 위치는 추측한 문서 링크가 아니라 compiler가 추적한 공개 심벌 선언 위치입니다. `InferValueType`을 결정하는 nullable 정규화는 추가로 `L/types/value.d.ts:5`와 `N/types/value.ts:11`을 비교했습니다.

긴 compiler 출력은 다음과 같이 동등한 타입의 약어로만 줄였습니다. 원래 문자열은 재현 명령의 JSON에 있습니다.

| 약어 | 정확한 의미 |
| --- | --- |
| `P` | `Profile = { name: string; count: number }`, 두 키 모두 필수 |
| `O` | `{ name?: string; count?: number } & Record<string, any>`, 두 키 optional·열린 객체 |
| `C` | `{ name?: string; count?: number }`, additionalProperties: false의 닫힌 객체 |
| `W` | `{ name: number; count: string }`, 스키마와 다른 구체 default |
| `R` | `{ readonly name: "Vincent"; readonly count: 1 }` |
| `E_L` | 레거시 내부 `JSONSchemaError[]`: mutable 배열, details가 `Record<string, any>` |
| `E_N` | `readonly ValidationIssue<unknown>[]`: readonly 배열, details가 `Record<string, unknown>` |
| `S_L` | `{ [key: string]: any; 1?: boolean; 2?: boolean; 4?: boolean }` |
| `S_N` | `Readonly<Record<string, true>>` |
| `Q` | `string \| number \| boolean \| any[] \| Record<string, any> \| null \| undefined` |

`O`·`C`의 optional 및 readonly 제거는 양쪽이 공유하는 `packages/winglet/json-schema/dist/types/value.d.ts:60`·`:61`, 열린 객체 선택은 `:76`·`:80`에서 결정합니다. JSON의 `InferDeclaredProperties<...> & ObjectValue`를 `O`로 표시한 이유입니다. `Nullish`는 `null | undefined`와 동등하게 표시했습니다. alias 이름이나 union 나열 순서만 다른 문자열을 독립적인 차이로 세지 않았습니다.

스키마 제약으로 거부된 사례의 `any` 또는 객체 타입은 **오류 회복 중 관측된 타입**입니다. 이를 정상적으로 사용할 수 있는 추론 결과로 평가하지 않았습니다. 기본 ref 프로브는 React 19 타입에 맞게 `useRef<FormHandle<...>>(null)`을 사용하며, 요구된 초기 인자 없는 표기는 R12에서 별도로 검사합니다.

## 경로 1: defaultValue 주입 — 22개

| 사례 | 레거시 추론 타입 | 신규 추론 타입 | 동일/차이 | round-150 기준 더 정확한 쪽 | 결정하는 타입 정의 (L / N) |
| --- | --- | --- | --- | --- | --- |
| D01 `as const` 스키마, default 없음 | default 검사: `O \| undefined`<br>onChange: `O`<br>통과 | default 검사: `O \| undefined`<br>onChange: `O`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19,25`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54`; `N/types/value.ts:127` |
| D02 일반 객체 스키마, default 없음 | 스키마 거부 후 회복 타입<br>default 검사: `any`<br>onChange: `any`<br>거부 TS2322 | 스키마 거부 후 회복 타입<br>default 검사: `any`<br>onChange: `any`<br>거부 TS2322 | 동일 | 동일: 스키마가 거부되어 유효한 사용이 아님 | `L/components/Form/type.d.ts:15,19,25`<br>`N/components/Form/type.ts:41,48,54` |
| D03 `as const` + 구체 객체 default | default 검사: `P \| undefined`<br>onChange: `P`<br>통과 | default 검사: `P \| undefined`<br>onChange: `P`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54`; `N/components/Form/Form.tsx:32` |
| D04 일반 객체 스키마 + 구체 default | 스키마 거부 후 회복 타입<br>default 검사: `P \| undefined`<br>onChange: `P`<br>거부 TS2322 | 스키마 거부 후 회복 타입<br>default 검사: `P \| undefined`<br>onChange: `P`<br>거부 TS2322 | 동일 | 동일: 스키마가 거부되어 유효한 사용이 아님 | `L/components/Form/type.d.ts:15,19,25`<br>`N/components/Form/type.ts:41,48,54` |
| D05 주입 없이 스키마와 다른 필드 타입 | default 검사: `W \| undefined`<br>onChange: `W`<br>통과 | default 검사: `W \| undefined`<br>onChange: `W`<br>통과 | 동일 | 동일: 주입 값에는 정확하나 스키마 적합성 검사 없음 | `L/components/Form/type.d.ts:19,25`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54`; `N/components/Form/Form.tsx:32` |
| D06 명시 `Value` + 다른 필드 타입 | default 검사: `P \| undefined`<br>거부 TS2322 | default 검사: `P \| undefined`<br>거부 TS2322 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19`<br>`N/components/Form/type.ts:48` |
| D07 nullable 객체 tuple, default 없음 | default 검사: `any`<br>onChange: `any`<br>통과 | default 검사: `O \| null \| undefined`<br>onChange: `O \| null`<br>통과 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19,25`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54`; `N/types/value.ts:127` |
| D08 `nullable: true`, default 없음 | default 검사: `O \| null \| undefined`<br>onChange: `O \| null`<br>통과 | default 검사: `O \| null \| undefined`<br>onChange: `O \| null`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19,25`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54`; `N/types/value.ts:127` |
| D09 nullable 문자열 tuple, default 없음 | default 검사: `any`<br>onChange: `any`<br>통과 | default 검사: `string \| null \| undefined`<br>onChange: `string \| null`<br>통과 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19,25`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54`; `N/types/value.ts:127` |
| D10 readonly 리터럴 객체 default | default 검사: `R \| undefined`<br>onChange: `R`<br>통과 | default 검사: `R \| undefined`<br>onChange: `R`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25`<br>`N/components/Form/type.ts:48,54` |
| D11 nullable 스키마 + `null` default | default 검사: `null \| undefined`<br>onChange: `null`<br>통과 | default 검사: `null \| undefined`<br>onChange: `null`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25`<br>`N/components/Form/type.ts:48,54` |
| D12 nullable 스키마 + `Profile \| null` default | default 검사: `P \| null \| undefined`<br>onChange: `P \| null`<br>통과 | default 검사: `P \| null \| undefined`<br>onChange: `P \| null`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25`<br>`N/components/Form/type.ts:48,54` |
| D13 `FormProps<Schema>`의 잘못된 알려진 필드 | default 타입: `O \| undefined`<br>거부 TS2322 | default 타입: `O \| undefined`<br>거부 TS2322 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19`<br>`N/components/Form/type.ts:48` |
| D14 닫힌 `FormProps<Schema>`의 추가 키 | default 타입: `C \| undefined`<br>거부 TS2353 | default 타입: `C \| undefined`<br>거부 TS2353 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19`<br>`N/components/Form/type.ts:48` |
| D15 nullable `FormProps<Schema>` + `null` | default 타입: `any`<br>통과 | default 타입: `O \| null \| undefined`<br>통과 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48`; `N/types/value.ts:127` |
| D16 `const`만 있는 스키마 | 스키마 거부 후 회복 타입<br>default 검사: `any`<br>onChange: `any`<br>거부 TS2322 | default 검사: `"ready" \| undefined`<br>onChange: `"ready"`<br>통과 | 차이 | 신규: 스키마 수용 및 값 구체화 | `L/components/Form/type.d.ts:15,19,25`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:41,48,54`; `N/types/value.ts:127` |
| D17 inline `oneOf`만 있는 스키마 | 스키마 거부 후 회복 타입<br>default 검사: `any`<br>onChange: `any`<br>거부 TS2322 | default 검사: `{ name?: string } \| { count?: number } \| undefined`<br>onChange: `{ name?: string } \| { count?: number }`<br>통과 | 차이 | 신규: 스키마 수용 및 값 구체화 | `L/components/Form/type.d.ts:15,19,25`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:41,48,54`; `N/types/value.ts:127` |
| D18 `required` 필드가 빠진 default | default 타입: `O \| undefined`<br>통과 | default 타입: `O \| undefined`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48`; `N/types/value.ts:127` |
| D19 `satisfies JSONSchema`, `as const` 없음 | default 검사: `O \| undefined`<br>onChange: `O`<br>통과 | default 검사: `O \| undefined`<br>onChange: `O`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19,25`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54`; `N/types/value.ts:127` |
| D20 `satisfies JSONSchema` + 구체 default | default 검사: `P \| undefined`<br>onChange: `P`<br>통과 | default 검사: `P \| undefined`<br>onChange: `P`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25`<br>`N/components/Form/type.ts:48,54` |
| D21 nullable 객체 `FormProps`의 잘못된 필드 | default 타입: `any`<br>통과 | default 타입: `O \| null \| undefined`<br>거부 TS2322 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48`; `N/types/value.ts:127` |
| D22 nullable 문자열 `FormProps`에 숫자 | default 타입: `any`<br>통과 | default 타입: `string \| null \| undefined`<br>거부 TS2322 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48`; `N/types/value.ts:127` |

D03·D20은 스키마의 키가 optional로 추론되더라도 구체 default의 두 키를 필수로 유지합니다. D05는 그 반대 방향의 한계입니다. `Value`가 스키마와 독립적으로 default에서 추론되므로 잘못된 필드 타입도 그 자체의 정확한 `W`로 수용됩니다. D06처럼 명시 `Value`를 쓰거나 D13처럼 `FormProps<Schema>`로 검사하면 잘못된 알려진 필드를 거부합니다.

## 경로 2: 핸들러 및 값 전달 콜백 — 18개

| 사례 | 레거시 추론 타입 | 신규 추론 타입 | 동일/차이 | round-150 기준 더 정확한 쪽 | 결정하는 타입 정의 (L / N) |
| --- | --- | --- | --- | --- | --- |
| H01 `as const`, 모든 인라인 콜백 | onChange: `O`<br>onSubmit: `O`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `O \| undefined`<br>children.defaultValue: `O \| undefined`<br>통과 | onChange: `O`<br>onSubmit: `O`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `O \| undefined`<br>children.defaultValue: `O \| undefined`<br>통과 | 차이 | 값 동일; 검증·상태는 별도 계약 변경 | `L/components/Form/type.d.ts:11,12,19,25,27,29,31`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:35,36,48,54,56,58,60`; `N/types/value.ts:127` |
| H02 일반 객체 스키마, 모든 인라인 콜백 | 스키마 거부 후 회복 타입<br>onChange: `any`<br>onSubmit: `any`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `any`<br>children.defaultValue: `any`<br>거부 TS2322 | 스키마 거부 후 회복 타입<br>onChange: `any`<br>onSubmit: `any`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `any`<br>children.defaultValue: `any`<br>거부 TS2322 | 차이 | 동일: 스키마가 거부되어 유효한 사용이 아님 | `L/components/Form/type.d.ts:11,12,15,19,25,27,29,31`<br>`N/components/Form/type.ts:35,36,41,48,54,56,58,60` |
| H03 `as const` + 구체 default | onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | 차이 | 값 동일; 검증·상태는 별도 계약 변경 | `L/components/Form/type.d.ts:11,12,19,25,27,29,31`<br>`N/components/Form/type.ts:35,36,48,54,56,58,60` |
| H04 일반 객체 스키마 + 구체 default | 스키마 거부 후 회복 타입<br>onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>거부 TS2322 | 스키마 거부 후 회복 타입<br>onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>거부 TS2322 | 차이 | 동일: 스키마가 거부되어 유효한 사용이 아님 | `L/components/Form/type.d.ts:11,12,15,19,25,27,29,31`<br>`N/components/Form/type.ts:35,36,41,48,54,56,58,60` |
| H05 명시 `Value`, 모든 인라인 콜백 | onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | 차이 | 값 동일; 검증·상태는 별도 계약 변경 | `L/components/Form/type.d.ts:11,12,19,25,27,29,31`<br>`N/components/Form/type.ts:35,36,48,54,56,58,60` |
| H06 nullable 객체 tuple 콜백 | onChange: `any`<br>onSubmit: `any`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `any`<br>children.defaultValue: `any`<br>통과 | onChange: `O \| null`<br>onSubmit: `O \| null`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `O \| null \| undefined`<br>children.defaultValue: `O \| null \| undefined`<br>통과 | 차이 | 신규: nullable 값 구체화 (검증·상태는 별도 계약) | `L/components/Form/type.d.ts:11,12,19,25,27,29,31`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:35,36,48,54,56,58,60`; `N/types/value.ts:127` |
| H07 `nullable: true` 콜백 | onChange: `O \| null`<br>onSubmit: `O \| null`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `O \| null \| undefined`<br>children.defaultValue: `O \| null \| undefined`<br>통과 | onChange: `O \| null`<br>onSubmit: `O \| null`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `O \| null \| undefined`<br>children.defaultValue: `O \| null \| undefined`<br>통과 | 차이 | 값 동일; 검증·상태는 별도 계약 변경 | `L/components/Form/type.d.ts:11,12,19,25,27,29,31`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:35,36,48,54,56,58,60`; `N/types/value.ts:127` |
| H08 구체 default + 함수형 `children`만 | children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:11,12,19`<br>`N/components/Form/type.ts:35,36,48` |
| H09 `formatError`의 `node.value`를 값 union에 전달 | error: `JSONSchemaError`<br>node.value: `Q`<br>context: `{ [x: string]: any; }`<br>통과 | error: `JSONSchemaError<unknown>`<br>node.value: `unknown`<br>context: `{ [x: string]: any; }`<br>거부 TS2322 | 차이 | 레거시: node.value의 허용 값 union 유지 | `L/components/Form/type.d.ts:19,41`<br>`N/components/Form/type.ts:48,84` |
| H10 `const`만 있는 스키마 콜백 | 스키마 거부 후 회복 타입<br>onChange: `any`<br>onSubmit: `any`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `any`<br>children.defaultValue: `any`<br>거부 TS2322 | onChange: `"ready"`<br>onSubmit: `"ready"`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `"ready" \| undefined`<br>children.defaultValue: `"ready" \| undefined`<br>통과 | 차이 | 신규: 스키마 수용 및 값 구체화 | `L/components/Form/type.d.ts:11,12,15,19,25,27,29,31`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:35,36,41,48,54,56,58,60`; `N/types/value.ts:127` |
| H11 inline `oneOf`만 있는 스키마 콜백 | 스키마 거부 후 회복 타입<br>onChange: `any`<br>onSubmit: `any`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `any`<br>children.defaultValue: `any`<br>거부 TS2322 | onChange: `{ name?: string } \| { count?: number }`<br>onSubmit: `{ name?: string } \| { count?: number }`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `{ name?: string } \| { count?: number } \| undefined`<br>children.defaultValue: `{ name?: string } \| { count?: number } \| undefined`<br>통과 | 차이 | 신규: 스키마 수용 및 값 구체화 | `L/components/Form/type.d.ts:11,12,15,19,25,27,29,31`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:35,36,41,48,54,56,58,60`; `N/types/value.ts:127` |
| H12 `type: ['string']` 콜백 | 스키마 거부 후 회복 타입<br>onChange: `any`<br>onSubmit: `any`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `any`<br>children.defaultValue: `any`<br>거부 TS2322 | onChange: `string`<br>onSubmit: `string`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `string \| undefined`<br>children.defaultValue: `string \| undefined`<br>통과 | 차이 | 신규: 스키마 수용 및 값 구체화 | `L/components/Form/type.d.ts:11,12,15,19,25,27,29,31`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:35,36,41,48,54,56,58,60`; `N/types/value.ts:127` |
| H13 nullable 문자열 + 명시 `Value` | onChange: `string \| null`<br>onSubmit: `string \| null`<br>onValidate: `E_L`<br>onStateChange: `S_L`<br>children.value: `string \| null \| undefined`<br>children.defaultValue: `string \| null \| undefined`<br>통과 | onChange: `string \| null`<br>onSubmit: `string \| null`<br>onValidate: `E_N`<br>onStateChange: `S_N`<br>children.value: `string \| null \| undefined`<br>children.defaultValue: `string \| null \| undefined`<br>통과 | 차이 | 값 동일; 검증·상태는 별도 계약 변경 | `L/components/Form/type.d.ts:11,12,19,25,27,29,31`<br>`N/components/Form/type.ts:35,36,48,54,56,58,60` |
| H14 `satisfies`, default 없는 콜백 | onChange: `O`<br>onSubmit: `O`<br>onValidate: `E_L`<br>children.value: `O \| undefined`<br>children.defaultValue: `O \| undefined`<br>통과 | onChange: `O`<br>onSubmit: `O`<br>onValidate: `E_N`<br>children.value: `O \| undefined`<br>children.defaultValue: `O \| undefined`<br>통과 | 차이 | 값 동일; 검증·상태는 별도 계약 변경 | `L/components/Form/type.d.ts:11,12,19,25,27,29`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:35,36,48,54,56,58`; `N/types/value.ts:127` |
| H15 `satisfies` + 구체 default 콜백 | onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_L`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | onChange: `P`<br>onSubmit: `P`<br>onValidate: `E_N`<br>children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | 차이 | 값 동일; 검증·상태는 별도 계약 변경 | `L/components/Form/type.d.ts:11,12,19,25,27,29`<br>`N/components/Form/type.ts:35,36,48,54,56,58` |
| H16 `onValidate` 배열에 `push` | onValidate: `E_L`<br>통과 | onValidate: `E_N`<br>거부 TS2339 | 차이 | 소유자 결정: mutability·상태 계약 | `L/components/Form/type.d.ts:19,27`<br>`N/components/Form/type.ts:48,56` |
| H17 검증 `details.actual`을 `string`에 전달 | details.actual: `any`<br>통과 | details.actual: `unknown`<br>거부 TS2322 | 차이 | 신규가 더 엄격함: 임의 details를 unknown으로 제한 | `L/components/Form/type.d.ts:19,27`<br>`N/components/Form/type.ts:48,56` |
| H18 상태의 숫자 키 읽기 및 `false` 쓰기 | onStateChange: `S_L`<br>state[1]: `boolean \| undefined`<br>통과 | onStateChange: `S_N`<br>state[1]: `true`<br>거부 TS2322, TS2542 | 차이 | 소유자 결정: mutability·상태 계약 | `L/components/Form/type.d.ts:19,31`<br>`N/components/Form/type.ts:48,60` |

양쪽의 FormProps 콜백을 심벌로 열거했습니다. 공통은 `onChange`·`onSubmit`·`onValidate`·`onStateChange`·`children`·`formatError`입니다. root `Value`를 직접 전달하는 `onChange`·`onSubmit`뿐 아니라 `children.value`·`children.defaultValue`와 `formatError`의 노드 값도 검사했습니다. `onValidate`는 양쪽 모두 root 값이 아니라 오류 배열을 전달합니다.

신규의 `onError`·`onDiagnosticsChange`는 root `Value`를 전달하는 제네릭 콜백이 아니라 오류 record·diagnostics 콜백이며, 대응하는 레거시 prop도 없습니다. 존재는 기록하되 값 추론의 비교 사례로 만들지 않았습니다. `onStateChange`도 값 콜백은 아니지만 기존 콜백 계약 변화가 드러나므로 보조 관측에 포함했습니다.

## 경로 3: FormHandle ref — 20개

| 사례 | 레거시 추론 타입 | 신규 추론 타입 | 동일/차이 | round-150 기준 더 정확한 쪽 | 결정하는 타입 정의 (L / N) |
| --- | --- | --- | --- | --- | --- |
| R01 인자 없는 `FormHandle` 타입 + ref | getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>통과 | getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>통과 | 동일 | 동일: any로 정확한 값 타입 소실 | `L/components/Form/type.d.ts:19,25,88`<br>`N/components/Form/type.ts:48,54,141` |
| R02 `FormHandle<typeof schema>` + ref | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19,25,88`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54,141`; `N/types/value.ts:127` |
| R03 일반 객체 스키마의 ref | 스키마 거부 후 회복 타입<br>getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>거부 TS2344, TS2322 | 스키마 거부 후 회복 타입<br>getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>거부 TS2344, TS2322 | 동일 | 동일: 스키마가 거부되어 유효한 사용이 아님 | `L/components/Form/type.d.ts:15,19,25,88`<br>`N/components/Form/type.ts:41,48,54,141` |
| R04 문서 주의 사례: 구체 default + 스키마 ref, 주입 없음 | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | 동일 | 동일: default 필수 키가 optional로 넓어짐 | `L/components/Form/type.d.ts:19,25,88`; `L/types/value.d.ts:10`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/types/value.ts:127`; `N/components/Form/Form.tsx:32` |
| R05 일반 객체 스키마 + 구체 default + ref | 스키마 거부 후 회복 타입<br>getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>거부 TS2344, TS2322 | 스키마 거부 후 회복 타입<br>getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>거부 TS2344, TS2322 | 동일 | 동일: 스키마가 거부되어 유효한 사용이 아님 | `L/components/Form/type.d.ts:15,19,25,88`<br>`N/components/Form/type.ts:41,48,54,141` |
| R06 ref에만 `Value` 주입, Form은 추론 | getValue(): `P`<br>onChange: `P`<br>default 검사: `P \| undefined`<br>통과 | getValue(): `P`<br>onChange: `P`<br>default 검사: `P \| undefined`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/components/Form/Form.tsx:32` |
| R07 Form과 ref 모두 `Value` 주입 | getValue(): `P`<br>onChange: `P`<br>default 검사: `P \| undefined`<br>통과 | getValue(): `P`<br>onChange: `P`<br>default 검사: `P \| undefined`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25,88`<br>`N/components/Form/type.ts:48,54,141` |
| R08 스키마 ref의 잘못된 `setValue` 필드 | getValue(): `O`<br>default 검사: `O \| undefined`<br>거부 TS2322 | getValue(): `O`<br>default 검사: `O \| undefined`<br>거부 TS2322 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,88,89`<br>`N/components/Form/type.ts:48,141,142` |
| R09 스키마 ref의 빠진 `required` 필드 | getValue(): `O`<br>default 검사: `O \| undefined`<br>통과 | getValue(): `O`<br>default 검사: `O \| undefined`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19,88,89`<br>`N/components/Form/type.ts:48,141,142` |
| R10 nullable 객체 tuple ref | getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>통과 | getValue(): `O \| null`<br>onChange: `O \| null`<br>default 검사: `O \| null \| undefined`<br>통과 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19,25,88,89`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54,141,142`; `N/types/value.ts:127` |
| R11 `nullable: true` ref | getValue(): `O \| null`<br>default 검사: `O \| null \| undefined`<br>통과 | getValue(): `O \| null`<br>default 검사: `O \| null \| undefined`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19,88,89`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,141,142`; `N/types/value.ts:127` |
| R12 초기 인자가 없는 `useRef<FormHandle<...>>()` | getValue(): `O`<br>default 검사: `O \| undefined`<br>거부 TS2554 | getValue(): `O`<br>default 검사: `O \| undefined`<br>거부 TS2554 | 동일 | 동일: React 타입의 초기 인자 요구 | `L/components/Form/type.d.ts:19,88`<br>`N/components/Form/type.ts:48,141` |
| R13 구체 default + callback ref | getValue(): `P`<br>default 검사: `P \| undefined`<br>통과 | getValue(): `P`<br>default 검사: `P \| undefined`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,88`<br>`N/components/Form/type.ts:48,141` |
| R14 nullable 문자열 ref에 숫자 `setValue` | getValue(): `any`<br>default 검사: `any`<br>통과 | getValue(): `string \| null`<br>default 검사: `string \| null \| undefined`<br>거부 TS2345 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19,88,89`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,141,142`; `N/types/value.ts:127` |
| R15 객체 ref의 `getValue()`와 `node.value` | getValue(): `O`<br>node.value: `ObjectValue \| null \| undefined`<br>default 검사: `O \| undefined`<br>통과 | getValue(): `O`<br>node.value: `Record<string, unknown> \| null \| undefined`<br>default 검사: `O \| undefined`<br>통과 | 차이 | getValue 동일; node 임의 키는 신규가 더 엄격함 | `L/components/Form/type.d.ts:19,79,88`; `L/core/types/node.d.ts:15`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,129,141`; `N/core/SchemaNode/type.ts:242`; `N/types/value.ts:127` |
| R16 nullable `Value`를 Form과 ref에 주입 | getValue(): `P \| null`<br>default 검사: `P \| null \| undefined`<br>통과 | getValue(): `P \| null`<br>default 검사: `P \| null \| undefined`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,88`<br>`N/components/Form/type.ts:48,141` |
| R17 nullable 문자열 ref의 노드 값 | getValue(): `any`<br>node.value: `string \| null \| undefined`<br>default 검사: `any`<br>통과 | getValue(): `string \| null`<br>node.value: `string \| null \| undefined`<br>default 검사: `string \| null \| undefined`<br>통과 | 차이 | 신규: nullable 값 구체화 | `L/components/Form/type.d.ts:19,79,88`; `L/core/types/node.d.ts:15`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,129,141`; `N/core/SchemaNode/type.ts:242`; `N/types/value.ts:127` |
| R18 `satisfies`, default 없는 ref | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | 동일 | 동일: optional·열린 스키마 추론 | `L/components/Form/type.d.ts:19,25,88`; `L/types/value.d.ts:10`<br>`N/components/Form/type.ts:48,54,141`; `N/types/value.ts:127` |
| R19 `satisfies` + 구체 default + ref | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | getValue(): `O`<br>onChange: `O`<br>default 검사: `O \| undefined`<br>통과 | 동일 | 동일: default 필수 키가 optional로 넓어짐 | `L/components/Form/type.d.ts:19,25,88`; `L/types/value.d.ts:10`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/types/value.ts:127`; `N/components/Form/Form.tsx:32` |
| R20 구체 default + 인자 없는 `FormHandle` 타입 | getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>통과 | getValue(): `any`<br>onChange: `any`<br>default 검사: `any`<br>통과 | 동일 | 동일: any로 정확한 값 타입 소실 | `L/components/Form/type.d.ts:19,25,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/components/Form/Form.tsx:32` |

문서 주의 사례 R04는 **양쪽 모두 컴파일에 성공**했습니다. 구체 default의 `P`가 그대로 유지되는 대신, ref의 기본 `Value = O`로 Form의 값 경로도 넓어져 `onChange`와 `getValue()`가 `O`가 되었습니다. R19의 `satisfies` 스키마도 같습니다. 타입이 어긋나 반드시 거부된다는 문서 설명과는 다른 실제 결과입니다. R06에서는 ref에만 `Profile`을 주입해도 Form의 `Value`가 정확한 `P`로 추론됩니다. R20처럼 무인자 `FormHandle` 타입을 쓰면 구체 default가 있어도 `any`가 됩니다.

## 경로 4: 명시적 제네릭 주입 — 13개

| 사례 | 레거시 추론 타입 | 신규 추론 타입 | 동일/차이 | round-150 기준 더 정확한 쪽 | 결정하는 타입 정의 (L / N) |
| --- | --- | --- | --- | --- | --- |
| G01 `as const` + 명시 객체 `Value` | getValue(): `P`<br>default 검사: `P \| undefined`<br>onChange: `P`<br>onSubmit: `P`<br>통과 | getValue(): `P`<br>default 검사: `P \| undefined`<br>onChange: `P`<br>onSubmit: `P`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25,29,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,58,141`; `N/components/Form/Form.tsx:32` |
| G02 일반 객체 스키마 + 명시 `Value` | 스키마 거부 후 회복 타입<br>getValue(): `P`<br>default 검사: `P \| undefined`<br>onChange: `P`<br>거부 TS2344 | 스키마 거부 후 회복 타입<br>getValue(): `P`<br>default 검사: `P \| undefined`<br>onChange: `P`<br>거부 TS2344 | 동일 | 동일: 스키마가 거부되어 유효한 사용이 아님 | `L/components/Form/type.d.ts:15,19,25,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:41,48,54,141`; `N/components/Form/Form.tsx:32` |
| G03 nullable tuple + `Profile \| null` | getValue(): `P \| null`<br>default 검사: `P \| null \| undefined`<br>onChange: `P \| null`<br>통과 | getValue(): `P \| null`<br>default 검사: `P \| null \| undefined`<br>onChange: `P \| null`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/components/Form/Form.tsx:32` |
| G04 nullable flag + `Profile \| null` | getValue(): `P \| null`<br>default 검사: `P \| null \| undefined`<br>onChange: `P \| null`<br>통과 | getValue(): `P \| null`<br>default 검사: `P \| null \| undefined`<br>onChange: `P \| null`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/components/Form/Form.tsx:32` |
| G05 nullable 문자열 + `string \| null` | getValue(): `string \| null`<br>default 검사: `string \| null \| undefined`<br>onChange: `string \| null`<br>통과 | getValue(): `string \| null`<br>default 검사: `string \| null \| undefined`<br>onChange: `string \| null`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/components/Form/Form.tsx:32` |
| G06 명시 `Value`와 다른 default | default 검사: `P \| undefined`<br>거부 TS2322 | default 검사: `P \| undefined`<br>거부 TS2322 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48`; `N/components/Form/Form.tsx:32` |
| G07 명시 `Value`와 다른 ref | getValue(): `string`<br>default 검사: `P \| undefined`<br>거부 TS2322 | getValue(): `string`<br>default 검사: `P \| undefined`<br>거부 TS2322 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,141`; `N/components/Form/Form.tsx:32` |
| G08 명시 handle `Value`와 다른 setter 값 | getValue(): `P`<br>default 검사: `P \| undefined`<br>거부 TS2322 | getValue(): `P`<br>default 검사: `P \| undefined`<br>거부 TS2322 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,88,89`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,141,142`; `N/components/Form/Form.tsx:32` |
| G09 명시 `FormProps<Schema, Value>` | default 검사: `P \| undefined`<br>default 타입: `P \| undefined`<br>onChange: `P`<br>onSubmit: `P`<br>children.value: `P \| undefined`<br>통과 | default 검사: `P \| undefined`<br>default 타입: `P \| undefined`<br>onChange: `P`<br>onSubmit: `P`<br>children.value: `P \| undefined`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:12,19,25,29`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:36,48,54,58`; `N/components/Form/Form.tsx:32` |
| G10 객체 스키마에 `Value = string` 주입 | getValue(): `string`<br>default 검사: `string \| undefined`<br>onChange: `string`<br>통과 | getValue(): `string`<br>default 검사: `string \| undefined`<br>onChange: `string`<br>통과 | 동일 | 동일: 주입 값에는 정확하나 스키마 적합성 검사 없음 | `L/components/Form/type.d.ts:19,25,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/components/Form/Form.tsx:32` |
| G11 `Form<Schema>`만 지정, `Value` 없음 | getValue(): `O`<br>default 검사: `O \| undefined`<br>onChange: `O`<br>통과 | getValue(): `O`<br>default 검사: `O \| undefined`<br>onChange: `O`<br>통과 | 동일 | 동일: default 필수 키가 optional로 넓어짐 | `L/components/Form/type.d.ts:19,25,88`; `L/types/value.d.ts:10`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,141`; `N/types/value.ts:127`; `N/components/Form/Form.tsx:32` |
| G12 명시 `FormChildrenProps<Schema, Value>` | children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | children.value: `P \| undefined`<br>children.defaultValue: `P \| undefined`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:11,12`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:35,36`; `N/components/Form/Form.tsx:32` |
| G13 `satisfies` + 명시 `Value` | getValue(): `P`<br>default 검사: `P \| undefined`<br>onChange: `P`<br>onSubmit: `P`<br>통과 | getValue(): `P`<br>default 검사: `P \| undefined`<br>onChange: `P`<br>onSubmit: `P`<br>통과 | 동일 | 동일: 구체·명시 Value 보존 또는 불일치 거부 | `L/components/Form/type.d.ts:19,25,29,88`; `L/components/Form/Form.d.ts:106`<br>`N/components/Form/type.ts:48,54,58,141`; `N/components/Form/Form.tsx:32` |

수용 가능한 스키마에서 `Form<Schema, Value>`와 `FormHandle<Schema, Value>`의 두 번째 인자를 주입하면 양쪽 모두 default 검사·`onChange`·`onSubmit`·`getValue()`에 명시 타입을 유지합니다. 함수형 자식의 값은 prop 자체가 optional이므로 `Value | undefined`입니다. G06·G07·G08은 값 또는 ref의 불일치를 양쪽 모두 거부합니다. G02는 Value가 아니라 넓어진 스키마의 `type: string` 제약 때문에 거부되고, `as const` 없이 `satisfies`를 사용하는 G13은 수용됩니다.

## 소비자 영향 순 차이 목록 — 독립적인 9건

한 원인이 여러 경로에 나타난 경우 한 건으로 묶었습니다. 아래 순서는 기존 소비자의 컴파일 영향과 round-150의 외부 값 경로 우선순위를 기준으로 합니다.

1. **onValidate 배열의 mutable → readonly 변경** — H01·H03·H05·H14·H15 등에서 `E_L → E_N`. H16의 `errors.push(...)`는 레거시에서 통과하고 신규에서 TS2339로 거부됩니다. `L/components/Form/type.d.ts:27` → `N/components/Form/type.ts:56`, 실제 globalErrors 선언은 `N/core/SchemaNode/type.ts:98`입니다.
   **방향: needs the owner's decision** — 값 타입의 정밀도 향상과 별개인 공개 mutability 계약 변경이므로 기존 콜백 호환성을 복원할지 readonly 계약을 유지할지 결정해야 합니다.

2. **formatError의 node.value가 허용 값 union → unknown으로 넓어짐** — H09의 `Q → unknown` 때문에 기존 값 union에 전달하던 코드가 신규에서 TS2322로 거부됩니다. 구체 default나 명시 Form Value와 연동되지 않는다는 한계는 양쪽 공통이지만, 신규가 기존 값 범주까지 잃었습니다. `L/types/formTypeRenderer.d.ts:41`·`:43`, `L/core/nodes/AbstractNode/AbstractNode.d.ts:117` → `N/types/formTypeRenderer.ts:46`·`:47`, `N/core/SchemaNode/type.ts:177`입니다.
   **방향: follow legacy** — round-150의 외부 값 전달 콜백 우선 원칙상 React 바인딩의 콜백에서 기존 허용 값 범주를 유지하는 방향을 제안합니다. 코어 타입 변경은 적용하지 않았습니다.

3. **readonly nullable type tuple의 any fallback을 신규가 제거** — D07·D09·D15·D21·D22·H06·R10·R14·R17. 레거시 정규화는 `readonly string[]`를 일반 `string[]`로 바꾸면서 구체 kind를 잃고, 신규는 tuple 원소를 유지합니다. 신규는 `O | null` 또는 `string | null`을 내며 D21·D22의 잘못된 default, R14의 숫자 setter를 거부합니다. `L/types/value.d.ts:5`·`:8` → `N/types/value.ts:11`·`:14`·`:127`입니다.
   **방향: keep new** — 외부 검사·콜백·ref에 null을 포함한 구체 타입을 유지하며, 명시 Value 주입은 양쪽에서 동일하게 정확합니다.

4. **onStateChange의 flag 객체 계약 변경** — H18에서 `S_L → S_N`, `state[1]`은 `boolean | undefined → true`. 레거시에서 허용되는 `state[1] = false`는 신규에서 TS2322·TS2542로 거부됩니다. `L/components/Form/type.d.ts:31`, `L/core/nodes/AbstractNode/AbstractNode.d.ts:201` → `N/components/Form/type.ts:60`, `N/core/SchemaNode/type.ts:90`입니다.
   **방향: needs the owner's decision** — 숫자 flag의 optional boolean에서 readonly한 true 키 집합으로 바뀐 별도 공개 계약이며, root Value의 정밀도로 우열을 정할 수 없습니다.

5. **검증 details의 any → unknown 변경** — H17의 `details.actual`은 레거시 `any`, 신규 `unknown`이며 문자열 sink가 신규에서 TS2322로 거부됩니다. `L/types/error.d.ts:273` → `N/core/validation/type.ts:16`입니다. `formatError`의 오류 타입 역시 기존 `JSONSchemaError`와 신규 `JSONSchemaError<unknown>`으로 출력되지만, 이 콜백의 renderer details는 신규에서도 `Record<string, any>`입니다(`N/types/error.ts:38`).
   **방향: keep new** — validator별 임의 details를 any로 신뢰하는 것은 더 정확한 값 추론이 아니며, 확인 후 사용하는 unknown이 더 엄격합니다.

6. **const-only 스키마의 공개 Form 수용 및 literal 추론** — D16·H10. 레거시는 `JSONSchema` 제약으로 TS2322 거부 후 any 회복 타입을 내고, 신규는 수용하여 `"ready"`를 추론합니다. `L/types/jsonSchema.d.ts:23`·`L/types/value.d.ts:10` → `N/core/types/jsonSchema.ts:6`·`:10`, `N/types/value.ts:110`·`:127`입니다.
   **방향: keep new** — 신규에서 유효한 공개 스키마 사용을 지원하며, 선택한 literal의 정보도 보존합니다.

7. **inline oneOf-only 스키마의 공개 Form 수용 및 branch 값 union** — D17·H11. 레거시는 스키마 제약으로 거부하고, 신규는 `{ name?: string } | { count?: number }`를 추론합니다. `L/types/jsonSchema.d.ts:23`·`L/types/value.d.ts:10` → `N/core/types/jsonSchema.ts:6`·`N/types/value.ts:93`·`:138`입니다.
   **방향: keep new** — 스키마 기반 추론이 optional인 것은 허용 범위이며, 지원되는 분기들의 값 정보를 any보다 더 많이 유지합니다.

8. **single-member type array의 공개 Form 수용 및 string 추론** — H12의 `type: ['string'] as const`. 레거시는 스키마 제약으로 TS2322 거부 후 any 회복 타입을 내고, 신규는 수용하여 string 콜백을 내줍니다. `L/types/jsonSchema.d.ts:23` → `N/core/types/jsonSchema.ts:10`; 값 정규화는 `L/types/value.d.ts:5` → `N/types/value.ts:11`입니다.
   **방향: keep new** — 하나의 명시 kind를 그대로 유지하는 신규의 수용과 추론이 더 정확합니다.

9. **FormHandle.node.value의 객체 임의 키 any → unknown 변경** — R15의 `ObjectValue | Nullish → Record<string, unknown> | null | undefined`. 두 버전의 `getValue()`는 동일한 `O`입니다. `L/core/types/node.d.ts:15`, `L/core/nodes/AbstractNode/AbstractNode.d.ts:117` → `N/core/SchemaNode/type.ts:242`·`:125`·`:126`입니다. R17의 문자열 노드 값은 alias 표기만 다르고 양쪽 모두 `string | null | undefined`입니다.
   **방향: keep new** — 객체의 실제 필드 스키마를 반영하지 못하는 한계는 공통이며, 임의 키를 any로 읽게 하는 기존 타입은 더 정확한 타입이 아닙니다. 우선 경로인 handle의 제네릭 getValue 정확성은 유지됩니다.

28개 변경 사례 ID: `D07`, `D09`, `D15`, `D16`, `D17`, `D21`, `D22`, `H01`, `H02`, `H03`, `H04`, `H05`, `H06`, `H07`, `H09`, `H10`, `H11`, `H12`, `H13`, `H14`, `H15`, `H16`, `H17`, `H18`, `R10`, `R14`, `R15`, `R17`.

12개 수용 여부 변경 사례 ID: `D16`, `D17`, `D21`, `D22`, `H09`, `H10`, `H11`, `H12`, `H16`, `H17`, `H18`, `R14`.

## 양쪽이 동일하게 틀리거나 느슨한 사례 및 공통 한계

- **구체 default + 기본 schema ref가 정확한 필수 키를 잃음** — R04·R19, 및 Schema만 명시한 G11. 입력 `P`가 있어도 콜백과 getter가 optional·열린 `O`입니다. 레거시가 더 정확하지 않으므로 신규만의 회귀로 분류하지 않았습니다. R06·R07의 Value 주입은 이 관측에서 정확한 `P`를 보존했습니다.
- **무인자 FormHandle 타입의 any가 default까지 넓힘** — R01·R20. R20의 구체 `P` default에도 검사·콜백·getter가 모두 any입니다.
- **Value 미주입 시 스키마와 다른 default를 수용** — D05. 검사·콜백이 `W`를 정확하게 추론하지만 스키마의 필드 타입과의 상관 제약은 없습니다. G10의 명시적인 `Value = string`도 객체 스키마와 독립적으로 수용됩니다. 따라서 정확한 Value 타입 추론과 스키마 적합성 검사를 같은 보장으로 해석할 수 없습니다.
- **schema 기반 optional·열린 추론** — D01·D18·D19·R02·R09·R18. required 키가 없어도 허용하고 추가 키는 any입니다. 닫힌 스키마의 추가 키는 D14에서 거부됩니다. 이는 round-150 원칙과 현재 문서상 허용된 느슨함입니다.
- **raw 스키마 객체의 type: string 확장** — D02·D04·H02·H04·R03·R05·G02는 양쪽 모두 스키마를 거부합니다. 이 실패를 정상적인 any 추론으로 평가해서는 안 됩니다. 반면 D19·D20·H14·H15·R18·R19·G13은 `as const` 없이 `satisfies JSONSchema`로 kind literal을 보존하여 수용됩니다. 따라서 문서의 “as const 스키마에서만 의미 있음”은 필요한 조건을 너무 좁게 설명합니다.
- **초기 인자 없는 useRef는 React 타입 단계에서 거부** — R12의 TS2554는 양쪽에서 동일합니다. R02는 같은 FormHandle 타입과 `null` 초기 인자로 수용되어 Form의 ref 문제와 구분됩니다.
- **literal 또는 null-only default의 좁은 Value** — D10은 readonly literal `R`, D11은 `null`로 고정됩니다. default 표현식의 정보는 정확하게 보존하지만 이후 편집 가능한 모든 값의 형태를 자동으로 찾아내는 보장은 아닙니다. nullable 전체 값이 필요하면 D12·G03·G05처럼 union Value를 제공해야 합니다.
- **formatError의 node가 Form Value와 제네릭으로 연결되지 않음** — H09는 양쪽 모두 구체 default의 `P`를 전달받지 않습니다. 그 공통 한계와 신규의 추가적인 unknown 확장은 구분했습니다.

## 제품 수정 전에 필요한 소유자 결정

`onValidate`의 mutable 배열 호환성을 유지할지 readonly 오류 계약을 유지할지, `onStateChange`의 숫자 flag 객체 호환성을 유지할지 true 키 집합을 공개 계약으로 확정할지 결정이 필요합니다. 감사에서는 결과와 방향만 기록했고 어느 정책도 적용하지 않았습니다.

커밋·stash·checkout·브랜치 전환, yarn·npm·gh 실행, 제품 소스·패키지 tsconfig·vitest 설정 변경을 수행하지 않았습니다. 감사 산출물 8개만 작성했습니다.

## 종료 시 git status --porcelain

```text
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit.md
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/
```

디렉터리 안의 개별 파일까지 확인한 `git status --porcelain --untracked-files=all`:

```text
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit.md
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/default.probes.tsx
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/fixtures.ts
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/generic.probes.tsx
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/handlers.probes.tsx
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/ref.probes.tsx
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/runner.cjs
?? packages/canard/schema-form/architecture/verification/07b/type-inference-audit/tsconfig.json
```
