---
name: schema-form-expert
description: "@canard/schema-form 라이브러리 전문가. Q&A, 사용 예제, 트러블슈팅을 제공하며 모든 보조 스킬을 오케스트레이션합니다."
user-invocable: false
---

# Schema Form Expert Skill

@canard/schema-form 전문가 스킬입니다. 이 스킬은 schema-form 라이브러리에 대한 질문에 답변하고, 사용 예제를 제공하며, 트러블슈팅을 도와줍니다.

## 스킬 정보 (Skill Info)

- **이름**: schema-form-expert
- **용도**: @canard/schema-form 라이브러리 Q&A 및 가이드
- **트리거**: `/schema-form` 커맨드 또는 schema-form 관련 질문

---

## 보조 스킬 (Supplementary Skills)

기능별 상세 가이드는 다음 보조 스킬 문서를 참조하세요:

| 스킬 | 파일 | 트리거 키워드 |
|------|------|--------------|
| Computed Properties | `computed-properties.md` | watch, active, visible, readOnly, disabled, pristine, derived |
| Conditional Schema | `conditional-schema.md` | oneOf, anyOf, allOf, if-then-else, &if |
| FormTypeInput | `formtype-input.md` | FormTypeInput, FormTypeInputProps, formTypeInputDefinitions |
| Validation | `validation.md` | validate, ValidationMode, errorMessages, formatError |
| InjectTo | `inject-to.md` | injectTo, 필드 간 값 주입, 순환 참조 |
| Array Operations | `array-operations.md` | ArrayNode, push, remove, clear, prefixItems |
| Form Handle | `form-handle.md` | FormHandle, useRef, getValue, setValue, validate, reset |
| JSONPointer | `jsonpointer.md` | JSONPointer, 경로, .., ., *, @ |
| Plugin System | `plugin-system.md` | registerPlugin, 플러그인 개발, UI 플러그인 |
| Form.Render | `form-render.md` | Form.Render, Form.Input, Form.Label, 커스텀 레이아웃 |
| Virtual Schema | `virtual-schema.md` | virtual, VirtualNode, 필드 그룹화 |
| State Management | `state-management.md` | NodeState, dirty, touched, globalState, onStateChange |
| Context Usage | `context-usage.md` | context, @, userRole, permissions, mode |
| Event System | `event-system.md` | event, subscribe, 이벤트, UpdateValue, 구독, 배칭 |
| Troubleshooting | `troubleshooting.md` | 에러, 문제, 동작 안함, 버그, 디버깅 |
| Performance | `performance-optimization.md` | 성능, 최적화, 느림, Strategy, 메모리, 대량 |
| Testing Guide | `testing-guide.md` | 테스트, test, 단위 테스트, 컴포넌트 테스트 |

---

## 지식 베이스 (Knowledge Base)

### 핵심 아키텍처

1. **노드 시스템**
   - Terminal Nodes: StringNode, NumberNode, BooleanNode, NullNode
   - Branch Nodes: ObjectNode, ArrayNode (BranchStrategy/TerminalStrategy)
   - VirtualNode: 조건부/계산 필드

2. **FormTypeInput 우선순위** (높은 순)
   1. JSON Schema의 `FormTypeInput` 속성
   2. `formTypeInputMap` 경로 매핑
   3. Form의 `formTypeInputDefinitions`
   4. FormProvider의 `formTypeInputDefinitions`
   5. 플러그인의 `formTypeInputDefinitions`

3. **JSONPointer 확장**
   - `..` : 부모 탐색 (computed, node.find()에서만)
   - `.` : 현재 노드 (computed, node.find()에서만)
   - `*` : 와일드카드 (FormTypeInputMap에서만)
   - `@` : 컨텍스트 참조 (computed에서만)

### 주요 인터페이스

```typescript
// FormProps
interface FormProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  jsonSchema: Schema;
  defaultValue?: Value;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: SetStateFn<Value>;
  onValidate?: Fn<[jsonSchemaError: JsonSchemaError[]]>;
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  onStateChange?: Fn<[state: NodeStateFlags]>;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  formTypeInputMap?: FormTypeInputMap;
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  errors?: JsonSchemaError[];
  formatError?: FormTypeRendererProps['formatError'];
  showError?: boolean | ShowError;
  validationMode?: ValidationMode;
  validatorFactory?: ValidatorFactory;
  context?: Dictionary;
  children?: ReactNode | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}

// FormHandle
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  focus: Fn<[dataPath: SchemaNode['path']]>;
  select: Fn<[dataPath: SchemaNode['path']]>;
  reset: Fn;
  findNode: Fn<[path: SchemaNode['path']], SchemaNode | null>;
  findNodes: Fn<[path: SchemaNode['path']], SchemaNode[]>;
  getState: Fn<[], NodeStateFlags>;
  setState: Fn<[state: NodeStateFlags]>;
  clearState: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  getErrors: Fn<[], JsonSchemaError[]>;
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  showError: Fn<[visible: boolean]>;
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}

// FormTypeInputProps
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  jsonSchema: Schema;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: Node;
  type: Node['schemaType'];
  name: Node['name'];
  path: Node['path'];
  nullable: Node['nullable'];
  errors: Node['errors'];
  errorVisible: boolean;
  watchValues: WatchValues;
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildNodeComponents: ChildNodeComponent[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: Context;
  [alt: string]: any;
}
```

### Computed Properties

```typescript
computed: {
  watch: string | string[];     // 값 구독
  active: boolean | string;     // 활성화 (false면 값 제거)
  visible: boolean | string;    // 표시 (false면 값 유지)
  readOnly: boolean | string;   // 읽기 전용
  disabled: boolean | string;   // 비활성화
  pristine: boolean | string;   // 상태 초기화
  derived: string;              // 파생 값
}

// 단축 문법
'&active': '../toggle === true'
'&visible': "@.userRole === 'admin'"
'&derived': '(../price ?? 0) * (../quantity ?? 0)'
```

**active vs visible 선택 기준:**
- `active`: 숨길 때 **값도 제거** → 조건부 필드, 결제 방법별 필드
- `visible`: 숨겨도 **값 유지** → 접기/펼치기 UI, 단계별 폼

### 조건부 스키마

```typescript
// oneOf (배타적 선택)
oneOf: [
  { '&if': "./type === 'A'", properties: { fieldA: {...} } },
  { '&if': "./type === 'B'", properties: { fieldB: {...} } },
]

// anyOf (비배타적 선택)
anyOf: [
  { '&if': './hasFeature1', properties: { config1: {...} } },
  { '&if': './hasFeature2', properties: { config2: {...} } },
]

// if-then-else
if: { properties: { country: { const: 'KR' } } },
then: { properties: { phone: { pattern: '^010-' } } },
else: { properties: { phone: { pattern: '^\\+' } } }
```

### ValidationMode

```typescript
enum ValidationMode {
  None = 0,      // 검증 비활성화
  OnChange = 1,  // 값 변경 시
  OnRequest = 2, // validate() 호출 시
}

// 조합
ValidationMode.OnChange | ValidationMode.OnRequest
```

### 플러그인

```typescript
// 사용 가능한 플러그인
@canard/schema-form-ajv8-plugin  // AJV 8.x 검증
@canard/schema-form-ajv7-plugin  // AJV 7.x 검증
@canard/schema-form-ajv6-plugin  // AJV 6.x 검증
@canard/schema-form-antd5-plugin // Ant Design 5 UI
@canard/schema-form-antd6-plugin // Ant Design 6 UI
@canard/schema-form-antd-mobile-plugin // Ant Design Mobile UI
@canard/schema-form-mui-plugin   // Material UI

// 등록
import { registerPlugin } from '@canard/schema-form';
registerPlugin(plugin);
```

---

## 응답 가이드라인 (Response Guidelines)

### 질문 유형별 응답

1. **개념 질문**: 해당 보조 스킬 문서 참조하여 설명
2. **사용법 질문**: 코드 예제와 함께 설명
3. **트러블슈팅**: 원인 분석 → 해결 방법 제시
4. **비교 질문**: 표 또는 목록으로 차이점 정리

### 질문-스킬 매핑

| 질문 유형 | 참조할 스킬 |
|----------|------------|
| "computed visible이 뭐예요?" | `computed-properties.md` |
| "oneOf 조건을 어떻게 설정하나요?" | `conditional-schema.md` |
| "커스텀 입력 컴포넌트 만들기" | `formtype-input.md` |
| "에러 메시지를 커스터마이징하려면?" | `validation.md` |
| "필드 A가 변경되면 필드 B도 업데이트" | `inject-to.md` |
| "배열에 아이템을 추가하려면?" | `array-operations.md` |
| "외부에서 폼 값을 가져오려면?" | `form-handle.md` |
| "경로 문법이 어떻게 되나요?" | `jsonpointer.md` |
| "커스텀 플러그인 개발" | `plugin-system.md` |
| "폼 레이아웃을 직접 구성하려면?" | `form-render.md` |
| "여러 필드를 하나로 묶으려면?" | `virtual-schema.md` |
| "dirty, touched 상태 관리" | `state-management.md` |
| "외부 데이터로 필드 제어" | `context-usage.md` |

### 응답 형식

```markdown
## [질문 요약]

### 답변
[핵심 설명]

### 예제 코드
```tsx
// 관련 예제
```

### 참고
- 관련 스킬: [스킬 이름] (`파일명.md`)
- 관련 스토리: [스토리 파일명]
- 주의사항: [있다면]
```

---

## 참조 문서 (Reference Documents)

스펙 문서 위치: `packages/canard/schema-form/docs/`

| 파일 | 내용 |
|------|------|
| `ko/SPECIFICATION.md` | 한국어 전체 스펙 |
| `en/SPECIFICATION.md` | 영어 전체 스펙 |
| `claude/skills/*.md` | 기능별 상세 가이드 (13개 보조 스킬) |

---

## 예제 응답 (Example Responses)

### 질문: FormTypeInput 우선순위가 어떻게 되나요?

```markdown
## FormTypeInput 우선순위

FormTypeInput 선택은 다음 우선순위를 따릅니다 (높은 순):

1. **JSON Schema의 직접 할당**
   ```tsx
   { type: 'string', FormTypeInput: CustomInput }
   ```

2. **formTypeInputMap** (경로 기반)
   ```tsx
   <Form formTypeInputMap={{ '/email': EmailInput }} />
   ```

3. **Form의 formTypeInputDefinitions**
   ```tsx
   <Form formTypeInputDefinitions={[...]} />
   ```

4. **FormProvider의 formTypeInputDefinitions**
   ```tsx
   <FormProvider formTypeInputDefinitions={[...]} />
   ```

5. **플러그인의 formTypeInputDefinitions**
   ```tsx
   registerPlugin({ formTypeInputDefinitions: [...] })
   ```

### 참고
- 관련 스킬: FormTypeInput (`formtype-input.md`)
- 동일 조건에서 먼저 정의된 것이 우선
```

### 질문: computed에서 형제 필드를 참조하는 방법

```markdown
## Computed에서 형제 필드 참조

`..` (부모 탐색)을 사용하여 형제 필드를 참조합니다.

### 예제
```tsx
const schema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['A', 'B'],
    },
    details: {
      type: 'string',
      computed: {
        // ../category = 부모로 이동 후 category 참조
        active: "../category === 'A'",
        watch: '../category',
      },
    },
  },
};
```

### 경로 참조 규칙
- `../field` : 형제 필드
- `../../field` : 부모의 형제
- `./field` : 현재 객체의 자식 (배열 아이템에서)
- `/field` : 절대 경로 (루트에서)
- `@.prop` : context 객체의 속성

### 참고
- 관련 스킬: Computed Properties (`computed-properties.md`), JSONPointer (`jsonpointer.md`)
```

---

## 구현 가이드 (Implementation Guide)

이 스킬을 Claude Code에서 사용하려면:

1. `.claude/skills/` 디렉토리에 스킬 파일들을 복사
2. 또는 프로젝트의 `.claude/` 디렉토리에 배치

```bash
# 프로젝트 루트에서 전체 스킬 복사
mkdir -p .claude/skills
cp packages/canard/schema-form/docs/claude/skills/*.md .claude/skills/
```

### 스킬 파일 목록

```
.claude/skills/
├── schema-form-expert.md      # 메인 전문가 스킬 (이 파일)
├── computed-properties.md     # Computed Properties 가이드
├── conditional-schema.md      # 조건부 스키마 가이드
├── formtype-input.md          # FormTypeInput 시스템 가이드
├── validation.md              # 검증 시스템 가이드
├── inject-to.md               # InjectTo 가이드
├── array-operations.md        # 배열 조작 가이드
├── form-handle.md             # FormHandle API 가이드
├── jsonpointer.md             # JSONPointer 확장 문법 가이드
├── plugin-system.md           # 플러그인 시스템 가이드
├── form-render.md             # 커스텀 레이아웃 가이드
├── virtual-schema.md          # Virtual Schema 가이드
├── state-management.md        # 상태 관리 가이드
└── context-usage.md           # Context 사용 가이드
```
