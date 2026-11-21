# @canard/schema-form-antd-mobile-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design Mobile](https://img.shields.io/badge/antd-mobile-blue.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## 개요

`@canard/schema-form-antd-mobile-plugin`은 Ant Design Mobile 컴포넌트를 제공하는 `@canard/schema-form`용 플러그인입니다.

FieldRenderer는 묶인 Label, Input, ErrorMessage 부품을 조립합니다. LabelRenderer와 ErrorMessageRenderer는 각 루트 요소를 소유하며 LabelRenderer와 ErrorMessageRenderer로 등록됩니다. 플러그인은 입력 틀을 등록하지 않습니다.

---

## 안내사항

⚠️ 이 플러그인은 Ant Design Mobile 환경에서 `@canard/schema-form`을 사용할 때 자주 필요한 핵심 컴포넌트들을 미리 구현해 놓은 것입니다.

📌 플러그인의 목적은 개발 편의성을 높이는 것이므로, 모든 가능한 컴포넌트를 포함하지는 않습니다.

💡 플러그인에 포함되지 않은 FieldInput 컴포넌트가 필요한 경우, `@canard/schema-form`의 공식 가이드를 참고하여 직접 구현하실 수 있습니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-antd-mobile-plugin
```

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

// 플러그인이 전역으로 등록됩니다
registerPlugin(plugin);
```

---

## 지원하는 컴포넌트

이 플러그인은 다음과 같은 Ant Design Mobile 컴포넌트들을 제공합니다:

### **[`FieldInputBooleanSwitch.tsx`](./src/fieldInputs/FieldInputBooleanSwitch.tsx)**

- **역할**: boolean 타입 데이터를 Switch 컴포넌트로 표시
- **적용 조건**: `type`이 `"boolean"`이고 `inputType`이 `"switch"`인 경우
- **추가 사항**: `checked`/`unchecked` 상태에 대한 커스텀 라벨 지원

### **[`FieldInputStringCheckbox.tsx`](./src/fieldInputs/FieldInputStringCheckbox.tsx)**

- **역할**: string 배열을 체크박스 그룹으로 표시
- **적용 조건**: `type`이 `"array"`이고 `inputType`이 `"checkbox"`이며, `items.type`이 `"string"`이고 `enum` 값이 존재하는 경우
- **추가 사항**: 각 체크박스 옵션에 대한 커스텀 라벨 지원

### **[`FieldInputStringSwitch.tsx`](./src/fieldInputs/FieldInputStringSwitch.tsx)**

- **역할**: 두 개의 string 값 사이를 Switch로 토글
- **적용 조건**: `type`이 `"string"`이고 `inputType`이 `"switch"`이며, `enum` 배열에 정확히 2개의 값이 있는 경우
- **추가 사항**: 스위치 상태별 커스텀 라벨 지원

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **역할**: string 또는 number의 단일 선택을 라디오 그룹으로 표시
- **적용 조건**: `type`이 `"string"`, `"number"`, 또는 `"integer"`이고, `inputType`이 `"radio"` 또는 `"radiogroup"`이며, `enum` 값이 존재하는 경우
- **추가 사항**: 라디오 옵션에 대한 커스텀 라벨 지원

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **역할**: 배열 데이터를 동적으로 추가/삭제 가능한 리스트로 표시
- **적용 조건**: `type`이 `"array"`인 경우
- **추가 사항**: 읽기 전용 모드에서는 추가/삭제 버튼이 숨겨짐

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **역할**: 숫자 값을 슬라이더로 입력받기
- **적용 조건**:
  - `type`이 `"number"` 또는 `"integer"`이고 `format`이 `"slider"`인 경우
  - 또는 `type`이 `"array"`이고 `items.type`이 `"number"` 또는 `"integer"`이며 `format`이 `"slider"`인 경우 (범위 슬라이더)
- **추가 사항**: `presentation.FieldInputProps.lazy`(`false`이면 움직일 때마다 값 반영), `marks`(선택 가능한 값을 마크 위치로 제한). 범위 슬라이더의 숫자 제한과 `multipleOf`는 `items`에 둡니다. 슬라이더 형태는 스키마 타입이 정합니다. 배열 스키마는 숫자 두 개의 배열만 기록하는 범위 슬라이더를, 숫자 스키마는 숫자만 기록하는 단일 핸들 슬라이더를 받으며, `presentation.FieldInputProps.range`는 무시됩니다

`presentation.FieldInputProps.lazy`를 생략하거나 `true`로 두면 확정 시점(키 놓기, 포인터 놓기 또는 라이브러리 변경 완료 이벤트)에 값을 저장하고, `false`이면 이동마다 저장합니다.

### **[`FieldInputTextarea.tsx`](./src/fieldInputs/FieldInputTextarea.tsx)**

- **역할**: 멀티라인 텍스트 입력을 위한 텍스트 영역
- **적용 조건**: `type`이 `"string"`이고 `format` 또는 `inputType`이 `"textarea"`인 경우
- **추가 사항**: `presentation.FieldInputProps`에 `minRows`와 `maxRows`를 지정합니다. 생략값은 스키마 확장을 사용합니다.

### **[`FieldInputString.tsx`](./src/fieldInputs/FieldInputString.tsx)**

- **역할**: 기본 문자열 입력 필드
- **적용 조건**: `type`이 `"string"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `format`이 `"password"`인 경우 비밀번호 입력 필드로 동작

### **[`FieldInputNumber.tsx`](./src/fieldInputs/FieldInputNumber.tsx)**

- **역할**: 숫자 입력을 위한 스테퍼 컴포넌트
- **적용 조건**: `type`이 `"number"` 또는 `"integer"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `minimum`, `maximum`, `multipleOf` 스키마 속성 지원. Stepper의 사용자 정의 `formatter`와 `parser`는 Ant Design Mobile 5.26 이상에서 지원합니다.

### **[`FieldInputBoolean.tsx`](./src/fieldInputs/FieldInputBoolean.tsx)**

- **역할**: boolean 값을 체크박스로 표시
- **적용 조건**: `type`이 `"boolean"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `null`과 불리언이 아닌 값은 `indeterminate` 상태로 표시되고, 값이 없는(`undefined`) 경우에는 체크되지 않은 상태로 표시됩니다

---

Ant Design Mobile Switch는 이제 라이브러리의 포인터 조작을 따릅니다. Tab과 `formRef.current.focus(path)`로는 더 이상 이 Switch에 초점을 줄 수 없고, Space와 Enter로는 상태를 바꿀 수 없습니다. 키보드 조작을 유지하려면 키보드를 지원하는 Switch 또는 네이티브 체크박스를 렌더하는 사용자 정의 `FieldInput`을 `fieldInputDefinitions`에 등록하고 코어의 값, 변경 핸들러, 잠금 상태를 전달하세요.

---

## 입력 설정

위의 `lazy`, `marks` 같은 입력별 설정은 `presentation.FieldInputProps`에 둡니다. 폼이 이 객체를 입력 props로 펼쳐 넘깁니다.

```ts
const jsonSchema = {
  type: 'object',
  properties: {
    volume: {
      type: 'number',
      format: 'slider',
      presentation: {
        FieldInputProps: { lazy: false },
      },
    },
  },
};
```

입력별 설정은 입력으로 전달되는 `presentation.FieldInputProps`에 둡니다. 사용자 정의 `options` 키는 오류나 경고 없이 허용하지만 이 내장 입력은 해당 그룹에서 입력 설정을 읽지 않습니다.

## 컴포넌트 우선순위

컴포넌트 선택은 다음 우선순위에 따라 결정됩니다:

1. **In-line 컴포넌트**: 스키마에 `FieldInput` 속성으로 지정된 컴포넌트
2. **FieldInputMap**: Path에 대해 명시적으로 매핑된 컴포넌트
3. **FieldInputDefinition**: 각 컴포넌트의 `test` 조건을 통한 자동 선택
4. **Provider FieldInputDefinition**: 상위 Provider에서 제공된 컴포넌트 정의
5. **Plugin**: 등록된 플러그인의 컴포넌트 (현재 플러그인 포함)
6. **Fallback**: 기본 fallback 컴포넌트

같은 우선순위 내에서는 배열의 앞순서가 우선합니다. 현재 플러그인의 컴포넌트는 다음 순서로 정의되어 있습니다:
`FieldInputBooleanSwitch` → `FieldInputStringCheckbox` → `FieldInputStringSwitch` → `FieldInputRadioGroup` → `FieldInputSlider` → `FieldInputArray` → `FieldInputTextarea` → `FieldInputString` → `FieldInputNumber` → `FieldInputBoolean`

---

## 호환성 안내

`@canard/schema-form-antd-mobile-plugin`은 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

ES2020보다 낮은 버전의 JavaScript 환경에서 사용하시는 경우, 별도의 트랜스파일 과정이 필요합니다.

**지원 환경:**

- Node.js 14.17.0 이상
- 최신 브라우저 (Chrome 91+, Firefox 90+, Safari 14+)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## Form 범위의 컨트롤 식별자

요소 ID는 필드와 Form 사이에서 고유하며 공백을 포함하지 않습니다. ID의 표기는 불투명한 값으로 취급하고 문자열을 덧붙이거나 디코딩·파싱하지 않습니다. `path`는 폼 데이터에 사용하는 JSON Pointer입니다. 사용자 정의 입력은 기본 컨트롤에 `inputId`를 지정하고 추가 요소에는 `getInputId(key)`를 사용합니다. 키는 필수이며 표기가 같은 숫자 키와 문자열 키는 같은 요소를 가리킵니다. 선택지·범위 끝점·thumb·프로토콜 선택기·입력 자체 레이블은 서로 다른 키를 사용합니다. 필드 제목에는 `labelId`를 지정하고 `aria-labelledby`로 연결합니다. 사용자 정의 렌더러도 같은 필드의 `inputId`와 `labelId`를 받습니다. 단일 입력의 레이블은 `inputId`를 가리킵니다. `name`은 말단 이름을 유지하며 라디오의 native name은 `inputId`를 사용하여 필드와 Form을 구별합니다.

```tsx
const Input = ({ inputId, name }: FieldInputProps<string>) => (
  <input id={inputId} name={name} />
);
```

필드 제목의 연결은 UI 라이브러리가 지원하는 id와 ARIA 속성을 따릅니다.

복합 사용자 정의 입력은 `labelId`와 `getInputId`를 명시적으로 소비하고 DOM props에 펼치지 않습니다. getter의 참조는 필드 범위나 경로가 바뀔 때까지 유지됩니다. 말단 이름이나 `path`로 ID를 만들지 않습니다.

해당 Form 안에서 `formElement.querySelector('[data-path="/email"] input')`처럼 조회하거나 컨트롤이 받은 id로 레이블을 연결합니다. Form API가 반환하는 값은 스키마 형태를 유지합니다.

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.

### Switch values and state labels

For a string switch, `enum[0]` is the checked (on) value and `enum[1]` is the unchecked (off) value.

A boolean switch accepts `presentation.FieldInputProps.alias` with optional `checked` and `unchecked` ReactNode labels. Labels use `context.checkboxLabels`, then `alias`, then no state labels. The current state label does not replace the field name.

### 슬라이더

Ant Design Mobile Slider의 손잡이는 Tab 또는 `formRef.current.focus(path)`로 초점을 받을 수 없습니다. 키를 눌러도 손잡이가 움직이거나 값이 저장되지 않습니다. 단일·범위 Slider는 스키마의 숫자 범위와 간격을 따르며 포인터로 값을 바꿀 수 있습니다. 키보드 조작을 유지하려면 키보드를 지원하는 Slider를 렌더하는 사용자 정의 `FieldInput`을 `fieldInputDefinitions`에 등록하고 코어의 값, 변경 핸들러, 잠금 상태를 전달하세요.
