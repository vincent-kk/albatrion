# @canard/schema-form 스펙 문서

> JSON Schema 기반 React 폼 렌더링 라이브러리

## 개요

`@canard/schema-form`은 다음 기능을 제공하는 React 기반 폼 라이브러리입니다:

- **JSON Schema 기반 렌더링**: JSON Schema를 기반으로 자동 폼 생성
- **플러그인 기반 검증**: AJV 6/7/8 플러그인을 통한 유연한 검증 시스템
- **FieldInput 시스템**: 우선순위 기반 컴포넌트 선택
- **Controls**: 조건부 필드, 파생 값, 반응형 로직
- **조건부 스키마**: oneOf, anyOf, allOf, if-then-else 지원
- **TypeScript 지원**: 완전한 타입 추론 및 타입 안전성

---

## 목차

1. [설치](#설치)
2. [빠른 시작](#빠른-시작)
3. [아키텍처](#아키텍처)
4. [핵심 API](#핵심-api)
   - [FormProps](#formprops)
   - [FormHandle](#formhandle)
5. [노드 시스템](#노드-시스템)
6. [FieldInput 시스템](#fieldinput-시스템)
7. [Controls](#controls)
8. [조건부 스키마](#조건부-스키마)
9. [JSONPointer 시스템](#jsonpointer-시스템)
10. [검증 시스템](#검증-시스템)
11. [오류 처리](#오류-처리)
12. [플러그인 시스템](#플러그인-시스템)
13. [고급 기능](#고급-기능)
14. [타입 정의](#타입-정의)

---

## 설치

```bash
# yarn 사용
yarn add @canard/schema-form

# Validator 플러그인 설치 (필수)
yarn add @canard/schema-form-ajv8-plugin
# 또는 AJV 7.x
yarn add @canard/schema-form-ajv7-plugin
# 또는 AJV 6.x
yarn add @canard/schema-form-ajv6-plugin
```

### 피어 의존성

- React 18-19
- React DOM 18-19

### 호환성

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

---

## 빠른 시작

### 1. 플러그인 등록

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 앱 시작 시 한 번 등록
registerPlugin(ajvValidatorPlugin);
```

### 2. 기본 사용법

```tsx
import { useState } from 'react';

import { Form } from '@canard/schema-form';

export const App = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
  };

  const [value, setValue] = useState({ name: '', age: 0 });

  return (
    <Form jsonSchema={jsonSchema} defaultValue={value} onChange={setValue} />
  );
};
```

---

## 아키텍처

### 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     애플리케이션                              │
├─────────────────────────────────────────────────────────────┤
│  Form Component                                             │
│  └── JSON Schema 기반 폼 렌더링                               │
├─────────────────────────────────────────────────────────────┤
│  Node System                                                │
│  ├── Terminal Nodes (String, Number, Boolean, Null)         │
│  ├── Branch Nodes (Object, Array)                           │
│  └── Virtual Node (options.virtual 필드 묶음)                 │
├─────────────────────────────────────────────────────────────┤
│  FieldInput System                                       │
│  └── 우선순위 기반 컴포넌트 선택                               │
├─────────────────────────────────────────────────────────────┤
│  Plugin System                                              │
│  ├── Validator Plugins (AJV 6/7/8)                          │
│  └── UI Plugins (Ant Design, MUI 등)                        │
└─────────────────────────────────────────────────────────────┘
```

### 디자인 패턴

| 패턴                 | 용도                                     |
| -------------------- | ---------------------------------------- |
| **Strategy Pattern** | Array/Object 노드의 Branch/Terminal 전략 |
| **Factory Pattern**  | JSON Schema에서 노드 생성                |
| **Observer Pattern** | 노드 상태 변경 구독                      |
| **Plugin Pattern**   | 검증 및 UI 컴포넌트 확장                 |

### core가 스키마로 하는 일

core는 스키마의 **적용 가능성**에는 따르고 **제약**은 강제하지 않습니다. 적용 가능성은 어느 선언이 효력 중인가 — `properties`, `oneOf`/`anyOf` 분기, `if`/`then`/`else`, `controls.active`, 나감 정책 — 이며, core는 값의 모양을 여기에 맞춥니다. 선언이 효력을 잃은 필드는 값에서 빠집니다. 제약 키워드 — `type`, `minimum`, `minLength`, `minItems`, `maxItems`, `enum`, `pattern` 등 — 는 값을 고치거나 거부하는 방식으로 강제하지 않으며, 검증이 위반을 알리고 입력이 사용자를 안내합니다. 그래서 항목이 너무 많은 배열은 모양은 맞되 제약을 어긴 값이며, 너무 긴 문자열과 같은 부류입니다.

---

## 핵심 API

### FormProps

```typescript
interface FormProps<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 이 SchemaForm에서 사용할 JSON Schema */
  jsonSchema: Schema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value;
  /** 모든 FieldInput 컴포넌트에 readOnly 속성 적용 */
  readOnly?: boolean;
  /** 모든 FieldInput 컴포넌트에 disabled 속성 적용 */
  disabled?: boolean;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: Fn<[value: Value]>;
  /** 검증 결과나 외부 오류 목록이 폼 오류 목록을 바꿀 때 호출되는 함수 */
  onValidate?: Fn<[errors: FieldNode['globalErrors']]>;
  /** 폼이 제출될 때 호출되는 함수 */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** 이 SchemaForm의 상태가 변경될 때 호출되는 함수 */
  onStateChange?: Fn<[state: FieldNode['globalState']]>;
  /** 이 폼 인스턴스의 오류 기록(생성·렌더 실패 포함)마다 호출되는 함수 */
  onError?: Fn<[record: FormErrorRecord]>;
  /** 준비가 끝난 뒤 루트 진단이 바뀔 때 호출되는 함수 */
  onDiagnosticsChange?: Fn<[diagnostics: FieldNode['diagnostics']]>;
  /** `controls.unsetOnInactive`의 폼 기본값: 형상에서 빠진 필드의 값을 지움 (노드 자신의 정책이 우선) */
  unsetOnInactive?: boolean;
  /** 명령형 쓰기는 막지 않고 자동 쓰기만 억제하는 폼 기본값 */
  disableAutomaticWrites?: boolean;
  /** FieldInput 정의 목록 */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** FieldInput 경로 매핑 */
  fieldInputMap?: FieldInputMap;
  /** 그룹 렌더러 컴포넌트 */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** 레이블 렌더러 컴포넌트 */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** 입력 렌더러 컴포넌트 */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** 오류 렌더러 컴포넌트 */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** 초기 검증 오류, 기본값은 undefined */
  errors?: FieldNode['globalErrors'];
  /** 커스텀 오류 포맷 함수 */
  formatError?: FieldRendererProps['formatError'];
  /**
   * 오류 표시 조건 (기본값: ShowError.DirtyTouched)
   *   - `true`: 항상 표시
   *   - `false`: 표시 안함
   *   - `ShowError.Dirty`: 값이 변경되었을 때 표시
   *   - `ShowError.Touched`: 입력에서 포커스가 한 번 빠진 뒤 표시
   *   - `ShowError.DirtyTouched`: Dirty와 Touched 조건 모두 충족 시 표시
   */
  showError?: boolean | ShowError;
  /**
   * 검증 실행 모드 (기본값: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: 검증 비활성화
   *  - `ValidationMode.OnChange`: 값 변경 시 검증
   *  - `ValidationMode.OnRequest`: 요청 시 검증
   */
  validationMode?: ValidationMode;
  /** 커스텀 검증기 객체(`compile`과 `compileGuard`); Form 속성 > FormProvider > 플러그인 */
  validatorFactory?: ValidatorFactory;
  /**
   * 대형 폼용 렌더 레벨 가상화(지연 마운트, 기본값: off)
   *  - `true`: 기본 옵션으로 활성화
   *  - `VirtualizationOptions`: 커스텀 옵션으로 활성화
   *  - 화면 밖 필드는 placeholder로 지연되고 뷰포트 근접·idle·focus/select 시 마운트
   *  - node tree는 항상 전량 생성 — 값/검증/제출은 영향 없음
   *  - SSR은 전 필드를 렌더링하고 그대로 하이드레이션; 이후 추가한 브랜치·자식만 IO로 게이팅
   */
  virtualization?: boolean | VirtualizationOptions;
  /** 사용자 정의 context */
  context?: Dictionary;
  /** 자식 컴포넌트 */
  children?:
    | ReactNode
    | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}
```

### FormHandle

`getAttachedFilesMap`과 `showError`를 뺀 모든 멤버는 폼의 현재 루트 노드를 대상으로 합니다. 폼이 트리를 새로 만들면 핸들도 새 루트를 따릅니다.

```typescript
interface FormHandle<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 현재 루트 노드 (첫 마운트 전에는 undefined) */
  node?: InferFieldNode<Schema>;
  /** `path`의 입력에 포커스 (생략하면 루트) */
  focus: Fn<[path?: FieldNode['path']]>;
  /** `path`의 입력 값을 선택 (생략하면 루트) */
  select: Fn<[path?: FieldNode['path']]>;
  /** `path`의 입력이 커밋된 값을 다시 읽게 함 (생략하면 루트) */
  refresh: Fn<[path?: FieldNode['path']]>;
  /** `path`에 렌더된 하위 트리를 다시 마운트 (생략하면 루트) */
  remount: Fn<[path?: FieldNode['path']]>;
  /** 커밋된 기본값을 다시 불러옴; 자동 쓰기 옵션만 받음 */
  reset: Fn<
    [
      option?:
        | typeof SetValueOption.DisableAutomaticWrites
        | typeof SetValueOption.EnableAutomaticWrites,
    ]
  >;
  /** Discard cached analysis and replace this form's tree with reset options. */
  rebuild: FormHandle<Schema, Value>['reset'];
  /** JSONPointer 경로의 노드 찾기 */
  findNode: Fn<[path: FieldNode['path']], FieldNode | null>;
  /** JSONPointer 경로에 맞는 모든 노드 찾기 */
  findNodes: Fn<[path: FieldNode['path']], readonly FieldNode[]>;
  /** 하나 이상의 노드에서 참인 상호작용 플래그 */
  getState: Fn<[], FieldNode['globalState']>;
  /** 모든 노드의 상호작용 플래그 패치 */
  setState: Fn<[state: FieldNode['state']]>;
  /** 모든 노드의 상호작용 플래그 지우기 */
  clearState: Fn;
  /** 현재 출력 값 (배열 출력 필터 적용) */
  getValue: Fn<[], Value>;
  /** 값 설정 */
  setValue: SetStateFnWithOptions<Value>;
  /** 현재 오류 전체 */
  getErrors: Fn<[], FieldNode['globalErrors']>;
  /** 첨부 파일 맵 */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  /** 검증을 실행하고 오류를 반환 */
  validate: Fn<[], Promise<FieldNode['globalErrors']>>;
  /** `true`(기본)는 모든 오류 표시, `false`는 `showError` prop으로 되돌림 */
  showError: Fn<[visible?: boolean]>;
  /** 폼 제출; `useFormSubmit`이 진행 상태를 읽음 */
  submit: TrackableHandlerFunction;
}
```

- 노드가 없는 `path`를 주면 `focus`, `select`, `refresh`, `remount`는 아무것도 하지 않습니다.
- 첫 마운트 전에도 조회는 예외를 던지지 않습니다. `findNode`는 `null`, `findNodes`·`getErrors`·`validate`는 빈 배열, `getState`는 빈 객체를 반환합니다.
- `showError(false)`는 오류를 숨기지 않습니다. 표시 여부를 Form의 `showError` prop에 되돌려 줍니다.
- `reset()`은 첨부 파일 맵도 비우고 `showError(true)`로 켠 표시도 풀어, 오류 표시가 다시 `showError` prop을 따르게 합니다.
- `rebuild(option?)`은 이 스키마 객체의 청사진 캐시를 폐기하고 `reset`과 같은 옵션으로 현재 폼의 트리를 새로 만듭니다. 같은 스키마 객체를 계속 쓰는 다른 폼은 일반 `reset`에서도 기존 트리를 유지하며, 그 폼 자신의 `rebuild`나 새 마운트에서 새 청사진을 받습니다.

### FormChildrenProps

```typescript
interface FormChildrenProps<
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferFieldNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: FieldNode['globalErrors'];
}
```

### AttachedFilesMap

```typescript
// JSONPointer 경로 키로 File[]을 저장 (예: "/attachment" 또는 "/items/0/file")
type AttachedFilesMap = Map<string, File[]>;
```

---

## 노드 시스템

### 노드 타입

**Terminal Nodes** (원시 값):

| 노드          | 설명                                         |
| ------------- | -------------------------------------------- |
| `StringNode`  | 문자열 값, format 검증 지원 (email, date 등) |
| `NumberNode`  | 숫자 값, min/max 제약, 정수 강제             |
| `BooleanNode` | 불리언 값                                    |
| `NullNode`    | 명시적 null 값                               |

**Branch Nodes** (컨테이너 구조):

| 노드         | 설명                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| `ObjectNode` | 키-값 구조, `required`, `additionalProperties` 지원                                        |
| `ArrayNode`  | 순서가 있는 컬렉션과 배열 조작 메서드. `minItems`/`maxItems`는 검증이 알리며 강제하지 않음 |

**Special Nodes**:

| 노드          | 설명                                                      |
| ------------- | --------------------------------------------------------- |
| `VirtualNode` | `options.virtual`에 선언한 형제 필드를 묶는 비스키마 노드 |

### Branch와 Terminal (`options.terminal`)

`object`와 `array` 노드는 기본적으로 branch입니다. 속성이나 항목마다 자식 노드를 만듭니다. `options.terminal: true`를 주면 terminal이 됩니다. 입력 하나가 값 전체를 읽고 쓰며, 자식 노드는 만들지 않습니다. 전략은 스키마에서 한 번, 다음 순서로 정해집니다.

1. `options.terminal`이 `true`든 `false`든 있으면 아래 항목보다 우선합니다.
2. 스키마에 `presentation.FieldInput` 컴포넌트가 있으면 terminal입니다.
3. 그 밖에는 branch입니다.

```typescript
{
  type: 'object',
  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
  options: { terminal: true }, // 지도 선택기 하나가 { lat, lng }를 씁니다
}
```

- 다른 종류는 전략이 고정되어 있습니다. `string`, `number`, `integer`, `boolean`, `null`과 여러 종류를 담은 `type`은 terminal이고, `virtual`은 branch입니다. 고정된 전략과 어긋나는 `options.terminal`은 `TERMINAL_OPTION_UNSUPPORTED`를 던지고, 같은 값을 다시 적은 것은 받아들입니다.
- 게이트 없는 선언은 `controls.active`를 지니지 않은 노드 자신의 스키마, 그 `$ref` 대상, 그 `allOf` 조각입니다. 이들 사이에서는 나중의 `options.terminal`이 이기며, `$ref` 대상은 그것을 가리키는 스키마보다 나중으로 칩니다.
- 전략은 실행 중에 바뀔 수 없습니다. 게이트가 걸린 선언(`then` / `else`, `controls.active`를 지닌 조각, 부모의 `controls.fields` 항목 중 `active`를 지닌 것이 가리키는 자식, `controls.active`나 호스트의 `controls.discriminator`로 고르는 `oneOf` / `anyOf` 분기) 때문에 노드가 어떤 경우에는 branch, 다른 경우에는 terminal이 된다면 스키마가 `TERMINAL_STRATEGY_MISMATCH`를 던집니다.
- 그런 게이트가 없는 `oneOf` / `anyOf` 분기는 호스트의 전략을 정하지 않으며, 그 분기의 `options.terminal`은 무시됩니다.

### 노드 초기화

`<Form>`은 `jsonSchema`와 `defaultValue`로 노드 트리를 만들고 렌더 중에 마운트합니다. 그래서 기다려야 할 초기화 단계가 없습니다. 패키지는 노드를 따로 만드는 팩터리를 내보내지 않으며, 노드는 폼을 통해 얻습니다.

```tsx
import { useEffect, useRef } from 'react';

import { Form, type FormHandle } from '@canard/schema-form';

const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

function ProfileForm() {
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  useEffect(() => {
    const root = formRef.current?.node; // 마운트된 트리의 루트 노드
    formRef.current?.findNode('/name')?.setValue('Ada'); // JSONPointer 경로의 노드
  }, []);

  return (
    <Form
      ref={formRef}
      jsonSchema={jsonSchema}
      onChange={(value) => console.log('Form value changed:', value)}
    />
  );
}
```

| 있는 자리          | 노드를 얻는 법                                                 |
| ------------------ | -------------------------------------------------------------- |
| 폼 밖, ref를 통해  | `formRef.current.node`, `findNode(path)`, `findNodes(path)`    |
| `children` 함수 안 | 인자의 `node` ([children 함수 사용](#children-함수-사용) 참고) |
| FieldInput 안      | `node` prop ([FieldInputProps](#fieldinputprops) 참고)         |

`jsonSchema`나 `defaultValue` 속성만 바뀌면 폼은 지금 트리를 그대로 두고, 두 값은 `reset`이 다시 읽습니다. 폼은 검증기가 바뀔 때와 `reset`이 다른 `jsonSchema`로 실행될 때 트리를 새로 만들고, 같은 스키마의 `reset`은 기존 트리에 값을 다시 불러옵니다. 재생성 전에 보관한 노드는 버려진 트리에 속하므로, 참조를 들고 있지 말고 노드가 필요한 순간에 `formRef.current.node`를 읽거나 `findNode`를 부르십시오.

### 노드 상태 플래그

노드의 상호작용 플래그는 `node.state`에 있으며 키는 `FieldNodeState` enum입니다. 직접 정한 키를 더 둘 수도 있습니다.

```typescript
import { FieldNodeState } from '@canard/schema-form';

node.state[FieldNodeState.Dirty]; // 사용자가 이 필드의 값을 바꾼 뒤 true
node.state[FieldNodeState.Touched]; // 사용자가 이 필드를 떠난(blur) 뒤 true
node.state[FieldNodeState.ErrorVisible]; // 오류 표시를 직접 지정한 값(지정했을 때만)

node.setState({ [FieldNodeState.ErrorVisible]: true }); // 이 노드의 플래그 패치
node.rootNode.globalState; // 하나 이상의 노드에서 참인 플래그
```

| 플래그         | 켜는 곳                       | 효과                                                   |
| -------------- | ----------------------------- | ------------------------------------------------------ |
| `Dirty`        | 사용자 입력이 값을 쓸 때마다  | `ShowError.Dirty`, `ShowError.DirtyTouched`가 사용     |
| `Touched`      | blur, 한 애니메이션 프레임 뒤 | `ShowError.Touched`, `ShowError.DirtyTouched`가 사용   |
| `ErrorVisible` | 사용자가 `setState`로         | `true`나 `false`가 그 노드의 `showError` 정책보다 우선 |

`controls.resetInteraction` 규칙은 조건이 false에서 true로 바뀔 때, 또는 조건이 true인 채로 필드가 로드되거나 형상에 들어올 때 `Dirty`와 `Touched`를 지웁니다. `FormHandle.setState`는 모든 노드를 패치하고, `FormHandle.reset()`과 `clearState()`는 직접 정한 키를 포함해 모든 플래그를 지웁니다.

다른 노드 속성은 필드의 현재 상태를 알려 줍니다.

```typescript
node.errors; // 이 필드에 표시되는 오류 (검증 오류와 외부 오류)
node.active; // 조건(`controls.active`, if/then/else, oneOf)이 필드를 제외하는 동안 false
node.visible; // 모든 active 선언을 합친 뒤의 표시 여부
node.enabled; // active이면서 visible
node.readOnly; // 읽기 전용 (스키마 `readOnly` 포함)
node.disabled; // 비활성화 (`enabled`와 별개)
```

### 하위 트리 방문

`node.visitSubtree(visitor)`는 노드 자신과 그 아래의 모든 노드에 `visitor`를 부릅니다. 폼의 한 구역을 한 번에 읽거나 고칠 때 씁니다.

```typescript
// /profile 아래의 문자열 필드를 모두 비우되, /profile/locked와 그 아래는 그대로 둡니다.
formRef.current?.findNode('/profile')?.visitSubtree((node) => {
  if (node.path === '/profile/locked') return false; // 이 노드의 하위를 건너뜀
  if (node.type === 'string') node.setValue('');
});
```

- **순서.** 노드 자신이 먼저이고, 하위는 전위 순서로, 형제는 `children` 순서로 방문합니다. 터미널 노드는 잎입니다.
- **건너뛰기.** `false`를 돌려주면 그 노드의 하위만 건너뛰고 다음 형제로 이어 갑니다. `undefined`를 포함한 다른 반환값은 자식으로 들어갑니다.
- **범위.** 폼 안의 노드에서는 현재 형상만 방문하므로, 조건이 제외한 필드는 방문하지 않습니다. 두 번 닿는 노드는 한 번만 방문하고, 순회 중에 생긴 노드는 방문된다는 보장이 없습니다. 폼에서 빠진 노드(조건이나 배열 변경으로 필드가 빠지기 전에 보관한 참조)에서 부르면, 그 노드와 함께 빠진 하위 트리를 걷습니다.
- **쓰기.** 순회 중의 값 쓰기는 순회가 끝날 때 한 번에 반영되므로, 순회 중에 읽는 값은 순회 전의 값입니다. 상태와 외부 오류의 변경(`setState`, `setSubtreeState`, `clearSubtreeState`, `setExternalErrors`, `clearExternalErrors`)은 데이터를 바로 바꾸지만, 그 이벤트는 `request`의 이벤트처럼 순회가 끝날 때 한 번 전달됩니다. 바깥 `node.batch(fn)` 안에서는 모두 그 batch의 끝까지 기다립니다. 순회 안의 폼 `reset`과 `resetSubtree()`는 그래도 바로 적용됩니다.
- **폼에서 빠진 노드에 쓰기.** 이런 쓰기는 순회나 batch 안에서도 폼 안의 필드를 바꾸지 않습니다. 그 경로에 같은 종류의 필드가 있으면 아무 일도 하지 않고, 없으면 값을 그 경로에 맡겨 두었다가 그런 필드가 돌아올 때 불러옵니다. 그 경로에 필드가 있는지는 같은 batch나 순회 안의 앞선 변경이 아니라 마지막으로 커밋된 형상으로 판단하므로, 같은 batch나 순회가 그 필드를 막 제거했더라도 이런 쓰기는 버려집니다. 같은 batch나 순회가 제거하는 필드의 참조는 쓰는 때에 아직 폼 안에 있으므로, 그 쓰기는 다른 쓰기와 똑같이 처리됩니다.
- **예외.** visitor가 던지면 이미 한 쓰기를 반영한 뒤 예외를 다시 던집니다. 리스너 안의 순회가 값 쓰기를 했다면, `batch`와 같이 그 예외는 `visitSubtree`를 부른 코드에 닿지 않습니다.
- **비용.** 순회는 쓰기가 있을 때까지 아무것도 열지 않으므로, 읽기만 하는 순회는 추가 비용이 없고 리스너 안에서도 됩니다. 리스너 안의 쓰기는 다른 리스너 쓰기와 같은 규칙을 따릅니다.
- **FormHandle.** `FormHandle`에는 `visitSubtree`가 없습니다. `formRef.current?.node`나 `findNode`로 얻은 노드에서 부르십시오.

---

### 떼어진 노드 참조

활성 트리를 떠난 노드 참조의 읽기는 마지막 커밋 값으로 고정되고 구독은 발화하지 않습니다. 이 참조의 `setValue`와 배열 동사(`push`, `pop`, `insert`, `remove`, `update`, `clear`)는 동결 값, 보유 원본, overlay, 이후 활성 인스턴스를 바꾸지 않습니다. 개발 모드에서는 `FormWarningCode.DetachedNodeWrite`로 경고하며 운영 번들은 침묵합니다. 거부 대상은 이 네 쓰기 계열이며 상태·외부 오류·request·검증 명령은 기존 동작을 유지합니다. `push`와 `insert`는 동결된 배열 길이를, 나머지 배열 동사는 `undefined`를 반환합니다.

비활성 값은 살아 있는 루트나 호스트의 `setValue` JSON에 해당 경로를 담아 씁니다. 이 쓰기는 비활성 노드를 생성하지 않고 보유 overlay와 `inactiveValues`를 갱신합니다. 재진입은 새 노드를 만들고 해당 엔트리의 보유 슬롯과 overlay를 소비합니다.

마이그레이션: 비활성을 건너는 노드 참조는 재진입 뒤 `find`로 다시 얻으십시오. 비활성 값은 살아 있는 호스트의 `setValue` JSON으로 쓰십시오. `find`는 활성 노드가 없는 모든 경로에서 기존과 같이 `null`을 반환합니다.

### 노드의 나감 보존값

`node.onInactive(listener): () => void`는 그 노드 인스턴스에 동기 resolver를 등록하고 해제 함수를 반환합니다. 보존하는 게이트 나감 직전에 직전 커밋 값과 `InactiveValueContext`로 한 번 호출합니다. 폼 언마운트·dispose, 배열 아이템 삭제, 재진입에서 소멸하는 옛 인스턴스에서는 호출하지 않습니다. 재진입의 새 인스턴스에는 다시 등록하십시오.

콜백은 등록 순서대로 모두 실행하고 마지막 `undefined` 아닌 결과를 채택합니다. 결과가 있으면 `controls.inactiveValue`를 실행하지 않고, 모두 `undefined`면 선언을 적용합니다. 어느 콜백이든 던지면 그 노드의 override 전체를 취소하고 원래 보존값을 유지하며 정착 실패로 기록합니다. 나감의 커밋은 완료합니다. 나감을 일으킨 쓰기는 실패한 식과 같이 `FormErrorCode.ExpressionThrew`를 `onError`에 보고한 뒤 던집니다. resolver 안의 `setValue`, 배열 동사, `batch`, `resetSubtree`는 무시합니다. 개발 모드에서는 `FormWarningCode.WriteInInactiveResolver`로 경고하며 운영 번들은 침묵합니다. 거부 대상은 이 네 쓰기 계열이며 상태·외부 오류·request·검증 명령은 기존 동작을 유지합니다.

마이그레이션: cleanup에서 자기 노드에 쓰던 패턴은 `controls.inactiveValue` 또는 `node.onInactive`로 옮기십시오. 둘은 같은 `(value, context) => next` 인터페이스입니다.

## FieldInput 시스템

### FieldInputDefinition

```typescript
type FieldInputDefinition<T = unknown> = {
  test: FieldInputTestFn | FieldInputTestObject;
  Component: ComponentType<InferFieldInputProps<T>>;
};
```

### 테스트 조건

```typescript
// 함수 형태
type FieldInputTestFn = Fn<[hint: FieldInputHint], boolean>;

// 객체 형태: 각 필드가 받아들일 힌트를 좁히며, 생략한 필드는 무엇이든 맞습니다.
// type, schemaType, path, format, inputType은 값 하나 또는 목록 중 아무 값과 맞습니다.
type FieldInputTestObject = Partial<{
  type: FieldNodeType | FieldNodeType[];
  schemaType: FieldNode['schemaType'] | FieldNode['schemaType'][];
  path: string | string[];
  format: string | string[];
  inputType: string | string[];
  required: boolean;
  nullable: boolean;
}>;

// FieldInputHint 객체
type FieldInputHint = {
  type: FieldNodeType; // 노드 종류: 'string', 'number', 'object', 'array', 'virtual', 'union' 등
  schemaType: FieldNode['schemaType']; // 작성한 허용 종류('integer' 포함), virtual 노드는 undefined
  misfit: boolean; // 저장된 값이 허용 종류와 어긋나는지
  path: string;
  required: boolean;
  nullable: boolean;
  jsonSchema: JSONSchema | JSONSchemaWithVirtual;
  format?: string;
  inputType?: string;
};
```

inputType은 정의의 test가 해석하는 문자열 힌트이며 HTML input type과 같지 않습니다.

### FieldInputProps

```typescript
interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends ReadonlyArray<any> = ReadonlyArray<any>,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchema
    : InferJSONSchema<Value>,
  Node extends FieldNode = unknown extends Value
    ? FieldNode
    : InferFieldNode<Schema>,
> {
  jsonSchema: Schema; // FieldInput 컴포넌트의 JSON Schema
  readOnly: boolean; // 읽기 전용 상태
  disabled: boolean; // 비활성화 상태
  required: boolean; // 필수 여부
  node: Node; // 필드 노드
  type: Node['type']; // 노드 종류
  schemaType: Node['schemaType']; // 작성한 허용 종류('integer' 포함), virtual 노드는 undefined
  misfit: Node['misfit']; // 저장된 값이 허용 종류와 어긋나는지
  name: Node['name']; // 노드 이름
  path: Node['path']; // 노드 경로
  nullable: Node['nullable']; // null 허용 여부
  errors: Node['errors']; // 검증 오류
  errorVisible: boolean; // 오류 표시 여부
  watchValues: WatchValues; // controls.watch 경로에서 읽은 값
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildFields: ChildField[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: Context;
  [alt: string]: any;
}
```

### 선택 우선순위

FieldInput은 다음 우선순위로 선택됩니다 (높은 순):

1. **JSON Schema의 presentation.FieldInput 직접 할당**

   ```tsx
   { type: 'string', presentation: { FieldInput: CustomInput } }
   ```

2. **fieldInputMap** (경로 기반)

   ```tsx
   <Form fieldInputMap={{ '/email': EmailInput }} />
   ```

3. **Form의 fieldInputDefinitions**

   ```tsx
   <Form fieldInputDefinitions={[...]} />
   ```

4. **FormProvider의 fieldInputDefinitions**

   ```tsx
   <FormProvider fieldInputDefinitions={[...]} />
   ```

5. **플러그인의 fieldInputDefinitions**
   ```tsx
   registerPlugin({ fieldInputDefinitions: [...] })
   ```

### FieldInputMap

```typescript
type FieldInputMap = {
  [path: string]: ComponentType<FieldInputProps>;
};

// 와일드카드 지원
const formInputMap = {
  '/users/*/name': CustomNameInput, // 배열 인덱스 매칭
  '/config/*/value': ConfigValueInput, // 동적 키 매칭
};
```

---

## Controls

### 속성 종류

```typescript
{
  type: 'string',
  controls: {
    active: boolean | string;            // 활성화 (false면 값 제거)
    visible: boolean | string;           // 표시 (false면 값 유지)
    readOnly: boolean | string;          // 읽기 전용
    disabled: boolean | string;          // 비활성화
    default: any;                        // 새로 나타난 노드의 채움 값
    derived: string;                     // 파생 값
    unsetValue: boolean | string;        // false에서 true로 바뀌면 값을 비움
    resetInteraction: boolean | string;  // false에서 true로 바뀌면 dirty/touched를 비움
    unsetOnInactive: boolean | string;   // 노드가 형상을 떠날 때 유지된 값을 버림
    fields: { targets: string[]; controls: { /* 앞의 아홉 키와 inactiveValue */ } }[];
    injectTo: (value, ctx) => ...;       // 이 노드의 값이 바뀔 때마다 다른 노드로 값을 밀어 넣기
    inactiveValue: literal | ((value, ctx) => next); // 형상을 떠날 때 보존할 값
    discriminator: string;               // oneOf/anyOf 호스트: 분기 태그 속성
    watch: string[];                     // 값 구독 (경로 배열)
  }
}
```

키 목록은 닫혀 있어서 알 수 없는 키가 있으면 청사진 빌드가 코드 `UNKNOWN_GROUP_KEY`인 스키마 오류(`isJSONSchemaError`로 판별)를 던집니다. `controls.fields[].controls`와 조각(`oneOf`/`anyOf`/`allOf` 분기, `then`, `else`)의 `controls` 안에서는 앞의 아홉 키(`active`부터 `unsetOnInactive`까지)와 `inactiveValue`를 허용하며, 나머지 네 키는 던집니다.

닫힌 목록은 `controls`와 `options` 안에만 적용됩니다. 세 묶음 밖에 있는 0.16의 최상위 키(`formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `computed`, `&` 접두어 키, `injectTo`, `terminal`, `virtual`, `placeholder`, `errorMessages`, `propertyKeys`)는 아예 읽지 않으므로, 1.0.0은 이들을 오류도 경고도 없이 무시합니다. 별칭도 경고도 두지 않는 것은 의도된 설계이므로, 0.16에서 옮겨 오는 스키마는 키마다 직접 옮겨야 합니다(README의 마이그레이션 (1.0.0) 절 참고).

### 나갈 때 보존하는 값

`controls.inactiveValue`에는 문자열·`false`·`0`·`null`·객체·배열 등의 리터럴이나 `InactiveValueResolver<V>` 함수를 씁니다. 문자열을 식으로 컴파일하지 않습니다. `node.onInactive(listener)`와 같은 `(value, context) => next` 인터페이스이며, `context`의 필드는 `injectTo`와 같은 `dataPath`, `schemaPath`, `jsonSchema`, `parentValue`, `parentJSONSchema`, `rootValue`, `rootJSONSchema`, 폼 `context`입니다. 값과 스키마는 모두 직전 커밋에서 읽고 `undefined` 반환은 기존 보존값을 유지합니다. 의존 추적은 없습니다. 나감을 일으킨 쓰기가 JSON에 해당 경로의 값을 명시하면 그 값이 우선하며 두 resolver를 실행하지 않습니다. 나가는 서브트리 안의 조상을 whole 입력으로 명시하면 생략된 자손도 덮으며 merge 입력은 명시된 키만 덮습니다. 폼 입력의 merge도 같은 규칙을 따릅니다. 여러 쓰기를 묶은 batch의 merge는 얕으므로 명시된 키는 그 서브트리를 whole로 교체합니다. 명시 덮임은 batch 전체의 합집합이며 뒤의 빈 merge나 부분 merge는 앞선 whole 덮임을 거두지 않습니다. 뒤의 자동 쓰기도 앞선 caller whole 덮임을 거두지 않습니다. 나가는 서브트리 자체가 생략되면 resolver를 실행합니다. 배열 이동 뒤 값과 `dataPath`는 직전 커밋 주소를 사용하고 결과는 현재 주소에 보존합니다.

자동 쓰기가 허용된 정상 보존 게이트 나감에서만 실행합니다. 자동 쓰기 억제·실패/예산 억제·load/reset 범위·실패한 게이트·같은 정착에서만 진입했던 인스턴스의 나감에서는 실행하지 않습니다. `unsetOnInactive`가 참인 나감은 건너뛰며 같은 층에 두 키를 함께 선언하면 `FormWarningCode.InactiveValueWithUnsetOnInactive`로 경고합니다. node → fields → fragment 순으로 가장 가까운 선언 층을 적용하고, 자손 결과는 조상 결과 안의 해당 경로를 덮습니다. 결과는 기존 비활성 JSON 쓰기 규칙을 따르므로 선언 밖 키는 extras로, 형이 맞지 않는 값은 원본으로 보존하고 재진입 때 overlay를 소비합니다.

### 중첩 controls

```typescript
{
  type: 'string',
  controls: {
    active: '../toggle === true',
    visible: "@.userRole === 'admin'",
    derived: '(../price ?? 0) * (../quantity ?? 0)',
    watch: ['../category', '../price'],
  },
}
```

### 경로 참조

| 문법          | 의미                 | 예시                       |
| ------------- | -------------------- | -------------------------- |
| `../field`    | 형제 필드            | `'../category === "A"'`    |
| `../../field` | 부모의 형제          | `'../../parentField'`      |
| `./field`     | 현재 객체의 자식     | `'./nestedChild'`          |
| `/field`      | 절대 경로 (루트에서) | `'/rootField'`             |
| `@.prop`      | context 객체의 속성  | `'@.userRole === "admin"'` |

### 예제

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['standard', 'premium'],
    },
    premiumFeatures: {
      type: 'object',
      controls: {
        active: "../category === 'premium'",
        watch: ['../category'],
      },
      properties: {
        // premium 전용 필드들
      },
    },
    total: {
      type: 'number',
      controls: { derived: '(../price ?? 0) * (../quantity ?? 1)' },
    },
  },
};
```

---

## 조건부 스키마

### oneOf (배타적 선택)

```typescript
{
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'] }
  },
  oneOf: [
    {
      controls: { active: "./type === 'A'" },
      properties: { fieldA: { type: 'string' } }
    },
    {
      controls: { active: "./type === 'B'" },
      properties: { fieldB: { type: 'string' } }
    }
  ]
}
```

분기는 게이트가 통과하는 동안에만 참여합니다. 분기 객체에 `controls.active` 표현식을 주거나, 호스트에 `controls.discriminator: '<property>'`를 지정하고 각 분기에 그 속성의 `const`/`enum` 태그를 둡니다. 태그는 `===`로 비교하며 분기 자신의 `controls.active`와 AND로 결합합니다. 게이트가 없으면 모든 분기가 켜집니다. 모든 분기의 필드가 존재하며 어느 분기가 맞는지는 검증기만 정합니다.

### anyOf (비배타적 선택)

```typescript
{
  type: 'object',
  properties: {
    hasFeature1: { type: 'boolean' },
    hasFeature2: { type: 'boolean' }
  },
  anyOf: [
    {
      controls: { active: './hasFeature1 === true' },
      properties: { config1: { type: 'string' } }
    },
    {
      controls: { active: './hasFeature2 === true' },
      properties: { config2: { type: 'string' } }
    }
  ]
}
```

### oneOf / anyOf 분기의 type

분기는 보통 `type`을 생략하고 부모의 타입을 따릅니다. 노드의 종류는 부모 자신의 `type`이 정하며, 분기의 `type`은 이를 바꾸지 않습니다.

- 부모와 다른 `type`을 선언한 분기도 스키마를 불러올 때 거부되지 않습니다. 폼은 부모의 종류를 유지하고 검증기는 그 분기를 작성된 `type` 그대로 평가하므로, 그 분기는 자기 `type`의 값에만 맞습니다.
- 부모가 선언한 프로퍼티를 게이트 없는 분기(`controls.active`가 없고 `controls.discriminator`가 고르지 않는 분기)가 다시 선언하면 부모 프로퍼티의 `type` 안에 있어야 합니다. 더 좁은 `type`은 허용되고 부모의 것이 이기며, 그 밖의 `type`은 `SHARED_NODE_KIND_CONFLICT`를 던집니다. 게이트 없는 분기들만 선언한 프로퍼티는 종류가 서로 같아야 하며, 다르면 같은 오류를 던집니다. 게이트가 걸린 분기의 프로퍼티는 비교하지 않습니다. 부모가 선언한 프로퍼티면 부모의 `type`이 이기고, 아니면 그 분기의 필드가 자기 종류를 가집니다.
- 판별 태그에는 `kind: { type: 'string', const: 'cat' }`처럼 `type`을 붙여도 됩니다. 분기마다 태그의 종류가 다르거나 태그 값이 겹치면 `DISCRIMINATOR_MISMATCH`, 태그의 `const` / `enum` 값에 공통 값이 없으면 `EMPTY_ENUM_INTERSECTION`을 던지고, 태그 자신의 `type` 밖에 있는 태그 값은 경고 `DISCRIMINATOR_BRANCH_UNREACHABLE`을 냅니다.

이 오류들은 스키마 오류입니다(`isJSONSchemaError`로 판별). 객체 전체를 하나의 입력으로 다루는 경우 — `options.terminal: true`이거나 객체 스키마에 `presentation.FieldInput` 컴포넌트를 지정한 경우 — 에는 자식 노드를 만들지 않으므로 위의 프로퍼티 검사는 그 분기들에 대해 실행되지 않습니다. `DISCRIMINATOR_MISMATCH`, `EMPTY_ENUM_INTERSECTION`과 아래의 `NULL_BRANCH_IGNORED_FOR_FORM` 경고는 그대로 적용되고, `DISCRIMINATOR_BRANCH_UNREACHABLE`은 객체가 만들지 않는 자식 필드를 기준으로 판정하므로 보고되지 않으며, 검증기는 작성된 스키마를 그대로 봅니다.

#### null 분기 패턴

`oneOf`는 정확히 한 분기가 맞아야 하고, `type`이 없는 분기는 `null`에도 맞습니다 — `properties`와 `required`는 객체에만 적용되기 때문입니다. 그래서 nullable 객체가 `oneOf` 아래에서 `null`로 검증을 통과하려면 이 null 분기 패턴이 필요합니다: `{ type: 'null' }` 분기 하나, 그리고 객체 분기마다 `type: 'object'`.

```typescript
{
  type: ['object', 'null'],
  properties: {
    kind: { type: 'string', enum: ['a', 'b'], default: 'a' }
  },
  oneOf: [
    { type: 'null' },
    {
      type: 'object',
      controls: { active: "./kind === 'a'" },
      properties: { aValue: { type: 'string' } }
    },
    {
      type: 'object',
      controls: { active: "./kind === 'b'" },
      properties: { bValue: { type: 'string' } }
    }
  ]
}
```

- null 분기는 검증기를 위한 것입니다. 필드가 없고 활성 분기가 되지 않으며, 거기에 쓴 조건이나 `properties`는 무시되고 개발 환경 경고 `NULL_BRANCH_IGNORED_FOR_FORM`이 나옵니다.
- 객체가 `null`인지는 값이 정하고, 어떤 객체 분기가 보이는지는 분기 조건이 정합니다. 값이 `null`인 동안 선택된 분기의 자식 필드는 default 없이 표시됩니다([Nullable 객체와 배열](#nullable-객체와-배열) 참고). 객체·배열 필드에 종류가 맞지 않는 값이 들어 있을 때도, 폼 표시·노드 데이터·출력 값이 어긋나지 않게 하려는 같은 까닭으로 마찬가지입니다. 예를 들어 객체에 문자열을 로드하면, 자식에 값을 주기 전까지 자식은 default를 받지 않습니다.
- null 분기의 위치는 상관없습니다. 사용 중인 분기의 오류는 해당 필드에 전달됩니다. 객체 값이 `oneOf`를 통과하지 못하면 null 분기도 맞지 않은 다른 분기처럼 자기 불일치("must be null")를 객체에 보고하며, 이 오류는 `oneOf` 오류와 함께 나옵니다.
- `oneOf`가 `null`을 검증할 수 없는 nullable 객체 — 받아 주는 분기가 없거나 여러 개인 경우 — 는 값이 `null`일 때마다 검증에서 실패합니다. 폼은 이를 경고하지 않으므로 스키마를 쓸 때 분기를 확인하십시오. `anyOf`는 이런 주의가 필요 없습니다: null 분기 하나 또는 type 없는 분기만으로 충족됩니다.

### if-then-else

```typescript
{
  type: 'object',
  properties: {
    country: { type: 'string' }
  },
  if: { properties: { country: { const: 'KR' } } },
  then: { properties: { phone: { pattern: '^010-' } } },
  else: { properties: { phone: { pattern: '^\\+' } } }
}
```

`then`의 프로퍼티는 `if` 가드가 통과하는 동안에만, `else`의 프로퍼티는 가드가 실패하는 동안에만 형상에 속합니다. 가드는 검증기의 가드 진입점을 통해 동기로 평가하며, 선택된 검증기가 없으면(Form이나 FormProvider의 `validatorFactory`도, 검증기 플러그인도 없으면) `then`과 `else` 모두 꺼진 채로 남습니다.

### allOf (합성)

```typescript
{
  type: 'object',
  allOf: [
    { properties: { firstName: { type: 'string' } } },
    { properties: { lastName: { type: 'string' } } },
    { required: ['firstName', 'lastName'] }
  ]
}
```

---

## JSONPointer 시스템

### 표준 JSONPointer (RFC 6901)

```typescript
node.find('/path/to/field'); // 루트에서 절대 경로
node.find('./childField'); // 현재 노드에서 상대 경로
```

### 확장 문법

| 문법 | 의미         | 사용 가능 컨텍스트           |
| ---- | ------------ | ---------------------------- |
| `..` | 부모 탐색    | controls 표현식, node.find() |
| `.`  | 현재 노드    | controls 표현식, node.find() |
| `*`  | 와일드카드   | node.find(), FieldInputMap   |
| `@`  | context 참조 | controls 표현식만            |

### 이스케이프 규칙

세그먼트는 다음 순서로 해석합니다.

1. 세그먼트가 정확히 `*`, `..`, `.`, `@`이면 연산자입니다(각각 와일드카드, 부모, 현재, 컨텍스트).
2. 세그먼트가 정확히 `%2A`, `%2E%2E`, `%2E`, `%40`이면 각각 `*`, `..`, `.`, `@`라는 이름의 리터럴 속성입니다.
3. 그 밖의 세그먼트는 `~1` → `/`, `~0` → `~`만 풉니다. `rate%20`처럼 `%`를 포함한 보통 이름은 바뀌지 않습니다.

`#`은 경로 맨 앞에서만 fragment 접두사이며, 중간의 `#` 세그먼트는 보통 이름입니다. 노드 경로, 비활성 값 경로, 보고되는 오류 경로는 예약 이름에 리터럴 퍼센트 표기를 사용합니다. 따라서 `node.find('/branch/%2A')`는 이름이 `*`인 자식을 가리키고, `/branch/*`는 와일드카드로 남습니다.

루트 주소는 빈 문자열 또는 `#`이며, `/`와 `#/`는 각각 루트 아래의 빈 문자열 키를 가리킵니다. 검증기 경로와 fieldInputMap 키에도 같은 규칙을 적용합니다.

알려진 한계: 이름이 정확히 `%2A`, `%2E`, `%2E%2E`, `%40`인 속성은 지원하지 않습니다. 이 이름의 경로는 다시 읽으면 예약 연산자 이름(`*`, `.`, `..`, `@`)이 되어 값 적재, 비활성 값, 검증 배정이 다른 속성을 가리키게 되므로, 폼을 만들 때 `FormErrorCode.ReservedPropertyName`로 스키마를 거부하며 오류는 속성 이름과 이 규칙을 알려 줍니다. 이 네 표기와 정확히 같지 않은 퍼센트 포함 이름에는 규칙 3이 적용됩니다.

검증기와 `$ref`가 제공하는 표준 RFC 6901 포인터는 이 연산자 없이 해석합니다. AJV 경로 `/*`는 이름이 `*`인 속성을 가리키며, 표준 fragment 포인터(`#/...`)는 모든 세그먼트를 퍼센트 디코드합니다.

```typescript
// 특수 문자가 있는 필드명: "field/with~special"
node.find('/field~1with~0special');
```

---

## 검증 시스템

### ValidationMode

```typescript
enum ValidationMode {
  None = 0, // 검증 비활성화
  OnChange = 1, // 값 변경 시 검증
  OnRequest = 2, // 요청 시 검증 (validate() 호출)
}

// 조합 가능
ValidationMode.OnChange | ValidationMode.OnRequest;
```

### 오류 메시지 포맷팅

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      presentation: {
        errorMessages: {
          minLength:
            '이름은 최소 {limit}자 이상이어야 합니다. 현재 값: {value}',
          required: '이름은 필수 입력 항목입니다.',
        },
      },
    },
  },
  required: ['name'],
};
```

### 다국어 지원

```typescript
presentation: {
  errorMessages: {
    minLength: {
      ko_KR: '이름은 최소 {limit}자 이상이어야 합니다.',
      en_US: 'Name must be at least {limit} characters.',
    },
  },
}

// Form에서 context.locale 설정
<Form jsonSchema={schema} context={{ locale: 'ko_KR' }} />
```

---

## 오류 처리

`@canard/schema-form`의 오류는 세 곳으로 전달됩니다.

| 받는 곳 | 전달되는 것 |
| --- | --- |
| `<Form>`의 `onError` prop | 그 폼 인스턴스의 모든 오류 **와** 경고 기록: `level`(`'error'` 또는 `'warning'`), `code`, `message`, 그리고 알 수 있으면 `path`, `schemaPath`, `details`, `error` 자체 |
| `submit()`(`FormHandle.submit`, `useFormSubmit`) | 검증이 실패하면 `ValidationError`(`FormErrorCode.SchemaValidationFailed`)로, 폼 진단이 degraded이면 `SchemaFormError`(`FormErrorCode.SubmitWhileDegraded`)로 거부 |
| `registerPlugin` | `UnhandledError`(`FormErrorCode.RegisterPlugin`)를 던짐 |

오류 클래스는 넷이며 각자 가드가 있습니다: `isJSONSchemaError`(스키마로 폼을 만들 수 없음), `isSchemaFormError`(폼 인스턴스의 실행 중 실패), `isValidationError`(검증이 제출을 거부), `isUnhandledError`(폼 인스턴스 밖의 실패). 네 클래스는 서로 형제이고 가드는 `instanceof`로 판정하므로 맞는 가드는 많아야 하나이며, 사용자 코드나 플러그인이 던진 오류에는 아무것도 맞지 않습니다. 모든 오류는 `code`(`'<GROUP>.<CODE>'`, 예: `'SCHEMA_FORM_ERROR.RENDER_FAILED'`), `group`, `specific`, `details`를 가집니다.

**`code`는 문자열 리터럴이 아니라 `FormErrorCode`·`FormWarningCode` 상수와 비교하십시오.** 이 값들은 상수로만 조달됩니다. 패키지 안에서 코드 이름이 바뀌면 상수를 쓴 처리기는 함께 바뀌거나 컴파일 오류로 알려 주지만, 리터럴은 계속 컴파일되면서 조용히 더는 맞지 않게 됩니다. 둘 다 같은 이름의 union 형을 가진 object enum이므로, `FormErrorCode`는 아무 오류 코드나 담는 변수의 형으로도 쓸 수 있습니다.

```tsx
import { useRef } from 'react';
import {
  Form,
  FormErrorCode,
  FormWarningCode,
  isValidationError,
  useFormSubmit,
  type FormHandle,
} from '@canard/schema-form';

const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

declare function reportToMonitoring(error: unknown): void;

function ProfileForm() {
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
  const { submit, pending } = useFormSubmit(formRef);

  const handleSubmit = async () => {
    try {
      await submit();
    } catch (error) {
      if (isValidationError(error) && error.code === FormErrorCode.SchemaValidationFailed)
        return; // field errors are already on the form; formRef.current?.getErrors() lists them
      throw error;
    }
  };

  return (
    <>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onError={(record) => {
          if (record.code === FormErrorCode.RenderFailed) reportToMonitoring(record.error);
          else if (record.code === FormWarningCode.Misfit) console.info(record.path, record.message);
        }}
      />
      <button onClick={handleSubmit} disabled={pending}>Submit</button>
    </>
  );
}
```

### 코드 일람

값은 발생하는 `error.code` / `record.code` 문자열 그대로입니다.

#### 스키마 오류 — 스키마로 폼을 만들 수 없음 (`isJSONSchemaError`)

| 상수 | `error.code` 값 | 발생 조건 | 비고 |
| --- | --- | --- | --- |
| `FormErrorCode.UnknownJsonSchema` | `'JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA'` | 스키마 분석이 지원하는 형태를 정하지 못함 |  |
| `FormErrorCode.ReservedPropertyName` | `'JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME'` | 속성 이름이 정확히 `%2A`, `%2E`, `%2E%2E`, `%40`임 | `details.property`가 거부된 이름을 담습니다. |
| `FormErrorCode.UnexpectedArraySchema` | `'JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA'` | 스키마 분석이 잘못된 배열 선언을 찾음 |  |
| `FormErrorCode.AllOfTypeRedefinition` | `'JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION'` | 정적 allOf의 type 교집합이 빔 |  |
| `FormErrorCode.ConflictingConstValues` | `'JSON_SCHEMA_ERROR.CONFLICTING_CONST_VALUES'` | 정적 allOf의 const가 충돌 |  |
| `FormErrorCode.InvalidRange` | `'JSON_SCHEMA_ERROR.INVALID_RANGE'` | 정적 allOf의 범위 교집합이 빔 |  |
| `FormErrorCode.EmptyEnumIntersection` | `'JSON_SCHEMA_ERROR.EMPTY_ENUM_INTERSECTION'` | enum·const 교집합이 빔 |  |
| `FormErrorCode.VirtualFieldsNotValid` | `'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID'` | virtual 필드 참조가 잘못됨 |  |
| `FormErrorCode.VirtualFieldsNotInProperties` | `'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_IN_PROPERTIES'` | virtual 필드가 선언된 properties에 없음 |  |
| `FormErrorCode.CreateDynamicFunction` | `'JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION'` | controls 식을 컴파일할 수 없음 |  |
| `FormErrorCode.ObservedValues` | `'JSON_SCHEMA_ERROR.OBSERVED_VALUES'` | 관찰 값 식 분석이 실패 |  |
| `FormErrorCode.UnknownGroupKey` | `'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY'` | controls·options·자식 controls 키가 닫힌 목록 밖 |  |
| `FormErrorCode.DiscriminatorMismatch` | `'JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH'` | 판별자 키나 분기 값이 어긋남 |  |
| `FormErrorCode.SharedNodeKindConflict` | `'JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT'` | 정적 선언과 게이트 없는 분기의 노드 종류가 충돌 |  |
| `FormErrorCode.TerminalStrategyMismatch` | `'JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH'` | 선언들이 노드의 terminal 전략에서 어긋남 |  |
| `FormErrorCode.RecursiveShapeUnbounded` | `'JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED'` | 스키마 분석이 끝없는 재귀 형상을 찾음 |  |
| `FormErrorCode.VirtualFieldsMismatch` | `'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH'` | 선언들이 virtual 필드에서 어긋남 |  |
| `FormErrorCode.ChildrenTargetNotFound` | `'JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND'` | 선언한 자식 이름이 스키마에 없음 |  |
| `FormErrorCode.TerminalOptionUnsupported` | `'JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED'` | 전략이 고정된 종류가 다른 terminal 옵션을 선언 |  |
| `FormErrorCode.InvalidControlShape` | `'JSON_SCHEMA_ERROR.INVALID_CONTROL_SHAPE'` | 알려진 controls·options·자식 controls 키의 모양이 잘못됨 |  |

#### 폼 오류 — 폼 인스턴스의 실행 중 실패 (`isSchemaFormError`)

| 상수 | `error.code` 값 | 발생 조건 | 비고 |
| --- | --- | --- | --- |
| `FormErrorCode.SharedNodeConflict` | `'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT'` | 활성 선언들이 한 노드 종류를 공유할 수 없음 |  |
| `FormErrorCode.BudgetExceeded` | `'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED'` | 정착이 호스트·파생·전이 예산을 넘음 |  |
| `FormErrorCode.ExpressionThrew` | `'SCHEMA_FORM_ERROR.EXPRESSION_THREW'` | 활성 controls 식이 정착 중 예외를 던짐 |  |
| `FormErrorCode.GuardFailed` | `'SCHEMA_FORM_ERROR.GUARD_FAILED'` | 가드 컴파일이나 동기 평가가 실패 |  |
| `FormErrorCode.InjectTargetMissing` | `'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING'` | 동적 주입의 대상이 없음 |  |
| `FormErrorCode.FeedbackLimitExceeded` | `'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED'` | 리스너 되먹임이나 onChange 중첩이 예산을 넘음 |  |
| `FormErrorCode.ListenerThrew` | `'SCHEMA_FORM_ERROR.LISTENER_THREW'` | 구독자나 폼 콜백이 예외를 던짐 |  |
| `FormErrorCode.MultipleErrors` | `'SCHEMA_FORM_ERROR.MULTIPLE_ERRORS'` | 한 디스패치 체인이나 관찰자가 오류를 여럿 냄 |  |
| `FormErrorCode.FormTypeInputMap` | `'SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP'` | 렌더 입력 맵 정규화가 실패 |  |
| `FormErrorCode.InvalidWriteOption` | `'SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION'` | 공개 쓰기가 함께 쓸 수 없는 옵션을 조합 |  |
| `FormErrorCode.DisposedNodeWrite` | `'SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE'` | 폐기된 노드 참조로 씀 |  |
| `FormErrorCode.WriteInObserver` | `'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER'` | onError가 자기 폼에 쓰려 함 |  |
| `FormErrorCode.SubmitWhileDegraded` | `'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED'` | 진단이 degraded인데 제출을 시도 |  |
| `FormErrorCode.ValidatorCompileFailed` | `'SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED'` | 첫 검증 요청에서 전체 스키마 컴파일이 실패 |  |
| `FormErrorCode.ValidatorThrew` | `'SCHEMA_FORM_ERROR.VALIDATOR_THREW'` | 컴파일된 검증기가 검증 중 예외를 던짐 |  |
| `FormErrorCode.RenderFailed` | `'SCHEMA_FORM_ERROR.RENDER_FAILED'` | 주입한 렌더러나 루트 렌더가 예외를 던짐 |  |
| `FormErrorCode.InvalidVirtualNodeValues` | `'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES'` | virtual 노드가 모양이 다른 값을 받음 |  |
| `FormErrorCode.ArrayMethodOnNonArray` | `'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY'` | 배열 전용 명령을 다른 종류의 노드에 호출 |  |
| `FormErrorCode.RecursiveShapeDiverged` | `'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED'` | 재귀 형상 전개가 정착 예산을 넘음 |  |

#### 검증 오류 — 검증이 제출을 거부 (`isValidationError`)

| 상수 | `error.code` 값 | 발생 조건 | 비고 |
| --- | --- | --- | --- |
| `FormErrorCode.SchemaValidationFailed` | `'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED'` | 제출 때 스키마 검증이 실패 | `submit()`이 냄 |

#### 처리되지 않은 오류 — 폼 인스턴스 밖의 실패 (`isUnhandledError`)

| 상수 | `error.code` 값 | 발생 조건 | 비고 |
| --- | --- | --- | --- |
| `FormErrorCode.RegisterPlugin` | `'UNHANDLED_ERROR.REGISTER_PLUGIN'` | 폼 인스턴스 밖의 전역 플러그인 등록이 실패 |  |
| `FormErrorCode.ValidatorBindRefused` | `'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED'` | 플러그인이 폼 밖에서 묶인 검증기 인스턴스를 거부 | AJV 플러그인이 이 `group`·`code`를 단 자체 오류로 던짐; `isUnhandledError`는 알아보지 못하므로 `error.code`로 비교 |

#### 경고 — 보고만 하고 던지지 않음

| 상수 | `error.code` 값 | 발생 조건 | 비고 |
| --- | --- | --- | --- |
| `FormWarningCode.AllOfKeywordIgnoredForForm` | `'SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM'` | 렌더링에서 allOf 키워드를 무시함 |  |
| `FormWarningCode.NullBranchIgnoredForForm` | `'SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM'` | 렌더링에서 null 분기의 조건·properties를 무시함 |  |
| `FormWarningCode.VirtualizationDisabledForForm` | `'SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM'` | IntersectionObserver가 없어 가상화를 끔 |  |
| `FormWarningCode.IfWithoutElseFalse` | `'SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE'` | 조건 분기에 else: false 없는 if가 있음 |  |
| `FormWarningCode.LockOnNonTerminalObject` | `'SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT'` | terminal이 아닌 객체가 잠금을 선언 |  |
| `FormWarningCode.ConditionalSchemaWithoutValidator` | `'SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR'` | 검증기 없이 if 게이트가 있음 |  |
| `FormWarningCode.ValidatorMissing` | `'SCHEMA_FORM_WARNING.VALIDATOR_MISSING'` | 검증을 요청했으나 검증기가 선택되지 않음 |  |
| `FormWarningCode.MultipleGatedBranchesActive` | `'SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE'` | 게이트가 걸린 oneOf 분기가 여럿 활성 |  |
| `FormWarningCode.ResetRebuiltByReference` | `'SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE'` | 스키마 참조가 바뀌어 reset이 트리를 새로 만듦 |  |
| `FormWarningCode.DependentSchemasIgnoredForForm` | `'SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM'` | 폼 형상에서 dependentSchemas를 지원하지 않음 |  |
| `FormWarningCode.ChildNodeComponentsOnTerminal` | `'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL'` | terminal 입력이 빈 자식 노드 컴포넌트를 읽음 |  |
| `FormWarningCode.TerminalSubtreeKeyIgnoredForForm` | `'SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM'` | terminal 하위 트리가 폼이 무시하는 예약 키를 선언 |  |
| `FormWarningCode.DiscriminatorBranchUnreachable` | `'SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE'` | 판별자 태그 값이 허용 목록 밖 |  |
| `FormWarningCode.NonJsonWholeValue` | `'SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE'` | 개발 모드에서 통째 값이 JSON과 호환되지 않음 |  |
| `FormWarningCode.FormTypeTestInvalid` | `'SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID'` | 입력 정의의 test 객체에 모르는 키가 있음 |  |
| `FormWarningCode.Misfit` | `'SCHEMA_FORM_WARNING.MISFIT'` | 값을 활성 type으로 모호함 없이 바꿀 수 없음 |  |
| `FormWarningCode.DialectMismatch` | `'SCHEMA_FORM_WARNING.DIALECT_MISMATCH'` | 스키마 dialect가 선택된 검증기의 dialect와 다름 |  |

---

## 플러그인 시스템

### 플러그인 등록

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(antd5Plugin);
registerPlugin(ajvValidatorPlugin);
```

### 사용 가능한 플러그인

**Validator 플러그인:**

- `@canard/schema-form-ajv8-plugin`: AJV 8.x (최신 JSON Schema 지원)
- `@canard/schema-form-ajv7-plugin`: AJV 7.x
- `@canard/schema-form-ajv6-plugin`: AJV 6.x

**UI 플러그인:**

- `@canard/schema-form-antd5-plugin`: Ant Design 5
- `@canard/schema-form-antd6-plugin`: Ant Design 6
- `@canard/schema-form-antd-mobile-plugin`: Ant Design Mobile
- `@canard/schema-form-mui-plugin`: Material UI

### 플러그인 인터페이스

```typescript
interface SchemaFormPlugin {
  FieldRenderer?: ComponentType<FieldRendererProps>;
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  fieldInputDefinitions?: FieldInputDefinition[];
  validator?: ValidatorPlugin;
  formatError?: FormatError;
}

interface ValidatorPlugin {
  bind?: Fn<[instance: any]>;
  compile(jsonSchema: JSONSchema): ValidateFunction;
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  release?(root: JSONSchema): void;
  readonly dialect?: string;
}
```

기본 그룹 렌더러는 자체 레이블과 메시지를 그리므로 `FormLabelRenderer`와 `FormErrorRenderer`는 컴포지션 API(`Form.Label`, `Form.Error`)나 이를 호출하는 사용자 그룹 렌더러를 통해서만 나타납니다.

렌더러 속성은 폼이 마운트될 때 한 번 읽히므로, 마운트 이후에 렌더러를 교체해도 반영된다고 보장하지 않습니다.

---

## 고급 기능

### 렌더 가상화 (Virtualization)

수백 개 이상 필드를 가진 폼에서는 초기 React 마운트가 지배적 비용이다(node tree 자체는 저렴). `virtualization` prop은 화면 밖 필드의 마운트를 지연한다 — 경량 placeholder로 렌더하다가 뷰포트에 근접하거나, 브라우저 idle 시간, 또는 focus/select 명령 시 실제 컴포넌트로 교체한다(한 번 reveal되면 되돌아가지 않음, defer-once). node tree는 항상 전량 생성되므로 `value`·검증·`getValue()`/`setValue()`·제출은 마운트 여부와 무관하게 동일하다. 모든 FieldInput 플러그인과 호환된다(게이트가 레이아웃 아래에 위치).

```tsx
import { Form, VirtualizationBackfill } from '@canard/schema-form';

<Form
  jsonSchema={largeSchema}
  virtualization={{
    threshold: 30, // 자식 30개 이상인 branch만 게이팅
    eagerCount: 20, // 선행 20개 필드 즉시 마운트
    rootMargin: '100%', // IntersectionObserver 여백 (px 또는 % 만)
    backfill: VirtualizationBackfill.Idle, // 또는 .None (스크롤/명령 시에만)
    estimateHeight: 40, // placeholder 높이(px) 또는 (node) => number
    Placeholder: FieldSkeleton, // placeholder 안에 렌더할 컴포넌트(선택)
  }}
/>;
// 기본값으로 활성화: <Form jsonSchema={largeSchema} virtualization />
```

**VirtualizationOptions**

| 옵션             | 타입                                      | 기본값   | 설명                                                                |
| ---------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------- |
| `threshold`      | `number`                                  | `30`     | 이 수 이상 자식을 가진 branch만 게이팅 대상                         |
| `eagerCount`     | `number`                                  | `20`     | 게이팅된 branch에서 즉시 마운트할 선행 필드 수                      |
| `rootMargin`     | `` `${number}px` `` \| `` `${number}%` `` | `'100%'` | IntersectionObserver rootMargin (px/% 만 허용)                      |
| `backfill`       | `VirtualizationBackfill`                  | `Idle`   | `Idle`=idle 시 나머지 점진 마운트, `None`=스크롤/명령 시에만 reveal |
| `estimateHeight` | `number \| ((node) => number)`            | `40`     | placeholder 공간 예약 높이(px)                                      |
| `Placeholder`    | `ComponentType<{ node, height }>`         | `null`   | placeholder 안에 렌더할 시각 컴포넌트                               |

- **Placeholder 스타일**: placeholder는 `[data-path]`와 `[data-deferred]` 마커를 가진 박스다. CSS 속성 선택자(`[data-deferred] { … }`) 또는 `Placeholder` 컴포넌트로 스타일링하며, 공간 예약은 항상 `estimateHeight`가 담당한다.
- **SSR·하이드레이션 지원**: 서버는 모든 필드를 렌더링하고 클라이언트는 그대로 하이드레이션한다. 하이드레이션 이후 추가된 브랜치·자식에 게이팅을 적용하며 `IntersectionObserver`가 필요하다. IO 없는 브라우저는 전체 렌더링과 개발 경고로 대체하며 서버는 경고하지 않는다.

#### 대형 폼의 입력 응답성

자식 수가 `threshold` 이상인 branch의 구조 변경이 타이핑을 막을 때 `virtualization`을 켠다. [IR-1](../../architecture/verification/input-responsiveness/ir-1-results.md#기본값-결정-자료)의 replace-200 최장 프레임은 off에서 채택 빌드 62.3ms였고(측정한 모든 빌드가 50ms 초과), on에서는 50ms 이상 프레임이 검출되지 않았다. 채택 A 레인의 같은 창 마운트 중앙값(ms)은 첫 화면과 전체 노출의 비용 차이를 보여 준다.

| 폼 | off: 첫 화면(eager paint) / 전체 노출 | on: 첫 화면(eager paint) / 전체 노출 |
| --- | ---: | ---: |
| flat-500 | 51.750 / 51.750 | 31.600 / 174.250 |
| nested-d5-f4 | 89.250 / 89.250 | 89.700 / 89.700 |
| array-1000 | 201.350 / 201.350 | 59.200 / 473.100 |

노출 전의 지연된 입력은 페이지 내 검색·스크린 리더·브라우저 자동완성의 대상이 되지 않는다. 두 backfill 모드 모두 placeholder가 남아 있는 동안 적용되며, Focus/Select 명령은 강제로 노출한다. 서버 렌더링한 필드는 그대로 하이드레이션하고 remount 뒤에도 노출을 유지한다. 이후 추가한 브랜치·자식만 게이팅한다. React 18에서 사용자 브랜치 입력 안의 미완료 Suspense 경계는 여전히 클라이언트 렌더링으로 전환될 수 있다. [IR-5](../../architecture/verification/input-responsiveness/ir-5-results.md)를 참조한다. 기본값은 off다.

- **검증:** 스키마 크기에 따라 비용이 증가한다. 데스크톱 Chromium의 flat-2000 [IR-2 진단](../../architecture/verification/input-responsiveness/ir-2-results.md#원인-분해-진단코디네이터-2026-10-31)은 p95 키 처리 비용의 약 4분의 1을 검증 실행·배달과 두 번째 React 커밋에 귀속했다. 냉 상태 비연타의 검증 켬−끔 input 이벤트 디스패치 차이는 중앙값 약 1.3ms / p95 약 2.9ms였다. 매우 큰 폼은 `validationMode={ValidationMode.OnRequest}`로 요청 또는 제출 시 검증할 수 있다.
- **커스텀 입력 스타일:** 같은 입력 2000개 진단에서 `input { contain: strict; width: 153px; height: 21px; }`는 키당 강제 레이아웃 중앙값을 2.5–3.8ms에서 0.42–0.47ms로 줄였다. 단순 블록 래퍼는 효과가 없었다. containment를 적용한 입력은 크기를 명시하고 레이아웃을 확인한다.
- **소비자 상태:** `onChange`에서 애플리케이션 렌더 비용이 크다면 자체 상태 갱신을 `onChange={(value) => startTransition(() => setValue(value))}`처럼 감싼다. 루트 `onChange`는 설계대로 동기를 유지한다. [IR-0](../../architecture/verification/input-responsiveness/ir-0-results.md#type-onchange-state-plain) E 레인의 이벤트 처리 중앙값/p95는 일반 갱신 0.800/5.100ms, `startTransition` 0.800/4.600ms였고 handler 중앙값/p95는 둘 다 0.400/0.900ms였다. 이 픽스처 수치가 모든 소비자 작업의 개선을 보장하지는 않는다.

### 커스텀 레이아웃 (Form.Render)

```tsx
<Form jsonSchema={jsonSchema}>
  <div className="custom-layout">
    <Form.Render path="/personalInfo/name">
      {({ Input, node }) => (
        <div className="form-field">
          <label>{node.jsonSchema.title}</label>
          <Input />
        </div>
      )}
    </Form.Render>
  </div>
</Form>
```

같은 경로에 바인딩된 두 입력(예: 두 개의 `Form.Input` 컴포넌트나 두 개의 `Input` 슬롯)은 타이핑하는 동안 서로를 미러링하지 않습니다. 타이핑은 Refresh를 일으키지 않고 각 입력이 자신의 초안을 소유하므로, 다른 입력은 값을 바꾸는 `setValue`, `reset`, 폼 핸들의 `refresh(path)`처럼 Refresh가 닿을 때까지 자신의 글자를 그대로 보여 줍니다.

### 배열 조작

```tsx
const arrayNode = node.find('/items') as ArrayNode;

arrayNode.push(); // 기본값으로 항목 추가
arrayNode.push('custom'); // 커스텀 값으로 항목 추가
arrayNode.remove(index); // 인덱스의 항목 제거
arrayNode.insert(index, 'custom'); // [0, length] 범위의 인덱스에 항목 삽입, 새 길이 반환 (length는 push와 같고 범위 밖은 무동작)
arrayNode.clear(); // 모든 항목 제거

arrayNode.children?.length; // 현재 항목 노드 수 (하나의 입력으로 렌더된 배열은 children이 null)
arrayNode.children; // 자식 노드 배열
```

### 배열 한도 (`minItems` / `maxItems`)

core는 채우지도 막지도 않습니다. 배열에는 로드되거나 쓰인 항목만 있습니다.

- `minItems`는 항목을 만들지 않습니다. 마운트, reset, 분기 재활성화 어느 때에도 그렇습니다. `[]`로 로드된 배열은 `[]`로 남고, `minItems`보다 항목이 적은 default나 `defaultValue`는 주어진 그대로 쓰입니다.
- `maxItems`는 쓰기를 거부하지 않습니다. `push()`는 항상 덧붙이고 새 길이를 돌려주며, 더 긴 배열을 넣는 `setValue`도 적용됩니다. `prefixItems` 뒤의 `items: false`도 push를 막지 않습니다.
- 두 한도는 유효 스키마(`node.jsonSchema`)에 남고, 위반은 검증이 방출 값(`outputValue`) 기준으로 알립니다.
- 기본 배열 입력은 `minItems`만큼 빈 슬롯을 UI로만 그리고 값은 쓰지 않으며, 슬롯에 입력하면 그때 그 자리가 쓰입니다. `maxItems`에 이르면 추가 버튼을 숨깁니다. 제거 버튼은 `minItems`와 상관없이 보이고, `prefixItems`는 읽지 않습니다. 범위를 지켜야 하는 사용자 입력은 `node.jsonSchema`와 `node.children`을 읽어 자기 컨트롤을 끕니다.

### 배열 출력 필터 (`omitTrailing` / `omitEmpty`)

배열 스키마는 `options` 아래에 출력 필터를 지정할 수 있습니다. 이 필터는 배열이 **내보내는 값** — 부모 전파, 루트 validation, 외부 표면(`onChange`, `getValue()`, `submit`) — 만 정제하며, 자식 노드와 raw `node.value`는 모든 항목을 유지하므로 사용자가 추가한 빈 행이 그대로 렌더링됩니다.

```tsx
const jsonSchema = {
  type: 'array',
  items: { type: 'string' },
  options: { omitTrailing: true },
};
// 사용자가 행 3개를 추가하고 첫 번째만 채우면
// node.value: ['first', undefined, undefined]
// getValue() / onChange / validation 값은: ['first']
```

- `omitTrailing` (opt-in): **후행** 연속 `undefined` 항목만 제거합니다. 선행·중간 `undefined`는 보존되어 error `dataPath`와 validation index 정합이 유지됩니다 — `[1, undefined, 2]`는 그대로 방출됩니다.
- `omitEmpty` (기본 활성): 빈 배열을 부모 전파 경로에서 `undefined`로 변환합니다. 필터 순서는 `omitTrailing → omitEmpty`라서 전부 빈 배열은 부모에서 `undefined`로 수렴합니다 (루트 폼은 `[]`를 방출).
- `null`은 빈 값이 아닙니다: 두 필터 모두 값이 `null`인 nullable 배열을 건드리지 않습니다 — [Nullable 객체와 배열](#nullable-객체와-배열) 참고.
- `node.value`는 raw를 유지하고, 정제된 출력은 `node.outputValue`로 노출됩니다. validation은 정제된 값 기준이라 후행 빈 항목은 `minItems`에 세지 않고, 선행·중간 빈 항목은 셉니다.
- reset은 배열이 로드된 값을 되돌리며 `minItems`를 위해 항목을 만들지 않습니다. 일반 `setValue(undefined)`는 전부 비웁니다 — 배열을 빼고 부모를 교체하는 쓰기도 같습니다: `setValue({ other: 1 })`는 배열을 비우고, `SetValueOption.Merge`는 그대로 둡니다. 기본값이 `null`인 배열은 `null`로 reset됩니다.

### 객체 옵션 (`propertyOrder` / `virtual`)

객체 스키마는 `options` 아래에 키 두 개를 더 받습니다.

```typescript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  options: {
    propertyOrder: ['endDate', 'startDate'], // { endDate, startDate, name } 순서로 내보냄
    virtual: { period: { fields: ['startDate', 'endDate'] } },
  },
}
```

- `propertyOrder`는 내보내는 객체 값의 키 순서이며 화면 순서가 아닙니다. 나열한 키가 먼저 오고, 그다음 나머지 선언 프로퍼티가 선언 순서로, 마지막으로 선언 밖 키가 들어온 순서로 옵니다. 값에 없는 키는 건너뛰며, 정수처럼 보이는 키는 JavaScript가 항상 맨 앞에 둡니다.
- `virtual`은 가상 필드 묶음에 이름을 붙입니다. 각 항목은 `fields`에 하나의 가상 노드로 모을 형제 프로퍼티를 나열하고, 그 노드 자신의 `presentation`·`controls` 같은 키를 함께 둘 수 있습니다. 가상 노드를 `type: 'virtual'` 스키마로 작성하는 경우는 없습니다.

### Value Injection (injectTo)

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      controls: {
        injectTo: (value: string) => ({
          '../target': `injected: ${value}`,
        }),
      },
    },
    target: { type: 'string' },
  },
};
```

### 파일 첨부

```tsx
const FileInput = ({ onFileAttach, onChange }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    onFileAttach(file);
    onChange({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  return <input type="file" onChange={handleChange} />;
};

// 제출 시 파일 가져오기
const files = formRef.current.getAttachedFilesMap();
```

### 폼 제출

```tsx
import { isValidationError, useFormSubmit } from '@canard/schema-form';

const { submit, pending } = useFormSubmit(formRef);

const handleClick = async () => {
  try {
    await submit();
    alert('제출 완료!');
  } catch (error) {
    if (isValidationError(error)) {
      console.log('검증 실패:', error.details);
    }
  }
};
```

Enter는 Form의 `form` 요소를 통해 제출합니다. 텍스트류 필드가 둘 이상이면 브라우저는 폼에 제출 버튼이 있을 때만 Enter로 제출합니다(암묵적 제출은 이를 막는 필드만 세므로, 텍스트 필드 하나와 체크박스 하나는 그대로 제출됩니다).

### children 함수 사용

`Form` 컴포넌트의 `children`을 함수로 전달하면 폼의 상태와 노드에 접근할 수 있습니다.

```tsx
<Form jsonSchema={jsonSchema} defaultValue={{ name: '', email: '' }}>
  {({ value, errors, node }) => (
    <div className="form-container">
      {/* 자동 생성된 폼 필드 */}
      <Form.Render />

      {/* 현재 폼 값 미리보기 */}
      <div className="preview">
        <h3>현재 입력 값:</h3>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>

      {/* 에러 요약 표시 */}
      {errors.length > 0 && (
        <div className="error-summary">
          <h3>검증 오류:</h3>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 노드를 통한 프로그래매틱 제어 */}
      <button onClick={() => node?.find('/name')?.setValue('기본 이름')}>
        이름 초기화
      </button>
    </div>
  )}
</Form>
```

**children 함수 props:**

| prop     | 타입                         | 설명                            |
| -------- | ---------------------------- | ------------------------------- |
| `value`  | `InferValueType<Schema>`     | 현재 폼 값                      |
| `errors` | `readonly ValidationIssue[]` | 전체 검증 에러 목록             |
| `node`   | `InferFieldNode<Schema>`     | 루트 노드 (프로그래매틱 접근용) |

---

## 타입 정의

### 타입 유틸리티

```typescript
import {
  FormHandle,
  InferFieldNode,
  InferValueType,
} from '@canard/schema-form';

// 스키마에서 값 타입 추론
type FormValue = InferValueType<typeof jsonSchema>;

// 스키마에서 노드 타입 추론
type RootNode = InferFieldNode<typeof jsonSchema>;

// 타입 안전한 폼 핸들
const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
```

`InferValueType`은 스키마에 `as const`가 필요합니다. 없으면 `type`이 `string`으로 넓어져 결과가 `any`로 떨어집니다. `as const`가 있으면 `properties`와 `items`를 재귀 순회하며, 모든 필드를 **optional**로 만들고 `Record<string, any>`와 교차한 타입을 냅니다:

```typescript
const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
  required: ['name'],
} as const;

type FormValue = InferValueType<typeof jsonSchema>;
// { name?: string } & Record<string, any>
```

- `required`에 있어도 optional로 유지됩니다. 폼이 런타임에 필드를 제외할 수 있기 때문입니다 (`controls.active`가 false, `options.omitEmpty` 등).
- 객체 타입은 열려 있습니다 — JSON Schema의 기본값입니다. 그래서 `oneOf`/`anyOf`, `if`/`then`/`else`, `patternProperties`가 기여하는 키가 거부되지 않습니다. `additionalProperties: false`를 지정하면 추론 타입이 닫힙니다.

정확한 형태를 알고 있다면 직접 정의해 두 번째 타입 인자로 넘기세요:

```typescript
interface SignUpValue {
  name: string;
}

<Form<typeof jsonSchema, SignUpValue> jsonSchema={jsonSchema} onChange={(v) => v.name} />;
const formRef = useRef<FormHandle<typeof jsonSchema, SignUpValue>>(null);
```

### Nullable 스키마

```typescript
const schema = {
  type: 'object',
  properties: {
    // 필수 필드 (non-nullable)
    name: { type: 'string' },
    // 선택 필드 (nullable) - as const 사용
    nickname: { type: ['string', 'null'] as const },
  },
};

// FieldInput에서 nullable 조건
const definitions = [
  { test: { type: 'string', nullable: true }, Component: NullableInput },
  { test: { type: 'string', nullable: false }, Component: RequiredInput },
];
```

`nullable: true`는 공식 지원하는 OpenAPI 3.0 호환 표기입니다. `type`에 `'null'`을 추가하는 것과 동등하여, `{ type: 'string', nullable: true }`는 `{ type: ['string', 'null'] }`를 뜻합니다. 이 표기를 사용해도 경고나 오류가 발생하지 않습니다.

### Nullable 객체와 배열

nullable 객체·배열(`type: ['object', 'null']`, `type: ['array', 'null']`)은 서로 다른 세 상태를 가지며, 폼이 스스로 한 상태를 다른 상태로 바꾸지 않습니다.

| 값          | 의미             | 부모가 받는 값                                                   |
| ----------- | ---------------- | ---------------------------------------------------------------- |
| `null`      | 객체/배열이 없음 | `null` — `omitEmpty`의 대상이 아님                               |
| `{}` / `[]` | 있고 비어 있음   | `omitEmpty`(기본)로 생략, `options: { omitEmpty: false }`면 유지 |
| `undefined` | 설정되지 않음    | 키가 생략됨                                                      |

**`null`은 의도로만 바뀝니다.**

- `defaultValue`·스키마 `default: null`, 노드 자신이나 조상을 통한 `setValue(null)`로 `null`이 됩니다.
- 노드 자신에 객체/배열을 대입하거나 — `setValue({})`, `setValue([])`, 키를 담은 `setValue({ ... }, SetValueOption.Merge)` — **값을 담은 쓰기**가 활성 자손에 도착하면 객체/배열이 됩니다: 사용자 입력, `setValue`, 배열 `push`, 사용자가 일으킨 `injectTo`. 필드가 이미 보여 주는 값을 그대로 확정하는 것도 쓰기입니다.
- 폼이 스스로 만든 값으로는 `null`이 유지됩니다: 자식의 `default`, `controls.derived`, `oneOf`/`anyOf` 분기 복원, `controls.active`에 의한 재활성화, reset 중의 자식 복원, 그리고 그런 값만으로 구동된 `injectTo`(`default`나 derived 값만 가진 source).
- 값 없는 쓰기로도 `null`이 유지됩니다: 필드 비우기, null 배열의 `pop()`/`remove()`/`update()`/`clear()`와 0이 아닌 인덱스의 `insert()`, `setValue({}, SetValueOption.Merge)`. 비운 필드는 기억되어 이후 노드가 만들어질 때 반영됩니다.

필드를 *비운다*는 것은 그 노드가 `undefined`를 emit한다는 뜻입니다. 기본 `omitEmpty`에서 빈 문자열은 비우기이고, `false`·`0`·`null`은 값입니다. `options: { omitEmpty: false }`이면 빈 문자열도 값입니다. 비활성 필드에 쓴 값은 누구에게도 도착하지 않습니다.

reset은 노드가 무엇을 갖고 있든 기본값을 복원합니다: 기본값이 `null`이면 `null`로, 아니면 기본 객체로.

**`null`인 동안** 출력은 스키마가 무엇을 담고 있든 — 배열, default, derived, `oneOf`/`anyOf`, controls로 게이트된 필드·virtual 필드 — `null`입니다. 객체의 자식 필드는 계속 렌더되며, `null`인 동안 자식 default나 객체 default는 나타나지 않습니다. `controls.derived`나 `injectTo`가 쓴 값은 객체를 만들지 않고 그 필드에 표시됩니다. 로드·reset·쓰기 중 어떤 경로로 `null`이 되었든 같고, `null`로 버린 데이터는 되살아나지 않습니다. 이 규칙과, 종류가 틀린 값을 로드했을 때의 같은 규칙은 폼에 보이는 것, 노드 데이터, 출력 값이 서로 어긋나지 않게 하기 위한 것입니다. 자신이 `null`인 nullable **배열**에는 아이템이 없습니다.

**무엇이 되는가:** 자식 필드에 입력하면 객체는 그 입력값을 담은 객체로 승격됩니다. 승격으로 새로 생긴 필드(예를 들어 입력값이 여는 분기의 필드)만 default를 받으며, 이미 있던 필드는 값을 채울 때까지 빈 상태를 유지합니다. 배열의 쓰기는 빈 배열을 기준으로 합니다. 배열에는 병합이 없습니다: `setValue([], SetValueOption.Merge)`는 대입이며 `[]`를 만듭니다.

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    closed: {
      type: ['object', 'null'],
      properties: {
        reason: { type: 'string', default: 'completed' },
        note: { type: 'string' },
      },
    },
  },
};
// <Form jsonSchema={jsonSchema} defaultValue={{ closed: null }} />
// getValue()                     → { closed: null }   (필드에 default가 표시되지 않음)
// note에 "done" 입력             → { closed: { note: 'done' } }
// setValue({ closed: null })     → { closed: null }   (필드에 다시 default가 표시되지 않음)
```

- **nullable이 아닌** 객체에 `null`을 대입하면 `{}`가 됩니다.
- `setValue(undefined)`는 `null`이 아닙니다: 서브트리를 — 모든 필드와 모든 배열 아이템을 — 비우며 자식 default를 복원하지 않습니다.
- 폼은 검증을 통과시키려고 값을 바꾸지 않습니다. `null`의 유효성은 스키마가 결정합니다. `type`을 선언하지 않은 `oneOf` 분기는 모두 `null`에 매치되므로 어떤 검증기에서도 `null`은 그 `oneOf`를 통과하지 못합니다. [null 분기 패턴](#null-분기-패턴) — `{ type: 'null' }` 분기와 객체 분기의 `type: 'object'` — 을 쓰거나 `anyOf`를 쓰십시오.

### 노드 타입 가드

```typescript
import { isArrayNode, isObjectNode, isVirtualNode } from '@canard/schema-form';

if (isArrayNode(node)) {
  node.push(); // ArrayNode 메서드 사용 가능
}
```

---

## 모범 사례

1. **플러그인을 앱 시작 시 등록** - 최상위 레벨에서 한 번만
2. **FieldInputDefinitions 캐싱** - 컴포넌트 외부에서 정의
3. **ValidationMode 최적화** - 필요에 따라 OnChange 또는 OnRequest 선택
4. **TypeScript as const 사용** - 스키마 타입 추론을 위해
5. **controls.watch 활용** - 반응형 폼 로직 구현
6. **Form.Render로 커스텀 레이아웃** - 복잡한 UI 요구사항 충족

---

## 라이선스

MIT License

---

## 버전

현재: package.json 참조
