---
sidebar_position: 1
---

# FormProps 참조

## Form 컴포넌트

### Props

| Prop                       | 타입                        | 설명                              |
| -------------------------- | --------------------------- | --------------------------------- |
| `jsonSchema`               | `JsonSchema`                | 폼의 구조를 정의하는 JSON 스키마  |
| `defaultValue`             | `Value`                     | 폼의 초기값                       |
| `readOnly`                 | `boolean`                   | 읽기 전용 모드 활성화             |
| `disabled`                 | `boolean`                   | 비활성화 모드 활성화              |
| `onChange`                 | `(value: Value) => void`    | 값 변경 시 호출되는 콜백 함수     |
| `onValidate`               | `(errors: Error[]) => void` | 유효성 검증 시 호출되는 콜백 함수 |
| `formTypeInputDefinitions` | `FormTypeInputDefinition[]` | 커스텀 폼 타입 입력 정의          |
| `formTypeInputMap`         | `FormTypeInputMap`          | 폼 타입 입력 매핑                 |
| `CustomFormTypeRenderer`   | `React.ComponentType`       | 커스텀 폼 타입 렌더러             |
| `errors`                   | `Error[]`                   | 외부에서 주입된 에러 메시지       |
| `formatError`              | `(error: Error) => string`  | 에러 메시지 포맷팅 함수           |
| `showError`                | `boolean`                   | 에러 메시지 표시 여부             |
| `validationMode`           | `ValidationMode`            | 유효성 검증 모드                  |
| `ajv`                      | `Ajv`                       | AJV 인스턴스                      |
| `context`                  | `Record<string, unknown>`   | 사용자 정의 컨텍스트              |

### FormHandle

Form 컴포넌트의 ref를 통해 접근할 수 있는 메서드들입니다:

| 메서드                                                                          | 설명                        |
| ------------------------------------------------------------------------------- | --------------------------- |
| `focus(dataPath: string)`                                                       | 지정된 경로의 필드에 포커스 |
| `select(dataPath: string)`                                                      | 지정된 경로의 필드를 선택   |
| `reset(defaultValue?: Value)`                                                   | 폼을 초기값으로 리셋        |
| `getValue()`                                                                    | 현재 폼 값을 가져옴         |
| `setValue(value: Value \| ((prev: Value) => Value), options?: SetValueOptions)` | 폼 값을 설정                |
| `validate()`                                                                    | 폼 유효성 검증 실행         |

## FormProvider

### Props

| Prop       | 타입        | 설명          |
| ---------- | ----------- | ------------- |
| `children` | `ReactNode` | 자식 컴포넌트 |

## 노드 타입

### StringNode

문자열 입력을 위한 노드 타입입니다.

### NumberNode

숫자 입력을 위한 노드 타입입니다.

### BooleanNode

불리언 입력을 위한 노드 타입입니다.

### ArrayNode

배열 입력을 위한 노드 타입입니다.

### ObjectNode

객체 입력을 위한 노드 타입입니다.

### VirtualNode

가상 노드 타입입니다.

## 유틸리티 함수

### registerPlugin

새로운 플러그인을 등록합니다.

```tsx
registerPlugin({
  name: string,
  setup: (form: FormHandle) => void
})
```

## 타입 정의

### JsonSchema

JSON 스키마 타입 정의입니다.

### FormTypeInputDefinition

폼 타입 입력 정의 타입입니다.

### FormTypeInputMap

폼 타입 입력 매핑 타입입니다.

### ValidationMode

유효성 검증 모드 타입입니다.

## 다음 단계

- [커스터마이징](./customization.md)에서 폼의 스타일과 동작을 커스터마이즈하는 방법을 알아보세요
- [예제](./examples.md)에서 다양한 사용 사례를 살펴보세요
