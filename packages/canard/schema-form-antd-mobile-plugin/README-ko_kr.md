# @canard/schema-form-antd-mobile-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design Mobile](https://img.shields.io/badge/antd-mobile-blue.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-plugin-pink.svg)]()

---

## 개요

`@canard/schema-form-antd-mobile-plugin`은 Ant Design Mobile 컴포넌트를 제공하는 `@canard/schema-form`용 플러그인입니다.

---

## 안내사항

⚠️ 이 플러그인은 Ant Design Mobile 환경에서 `@canard/schema-form`을 사용할 때 자주 필요한 핵심 컴포넌트들을 미리 구현해 놓은 것입니다.

📌 플러그인의 목적은 개발 편의성을 높이는 것이므로, 모든 가능한 컴포넌트를 포함하지는 않습니다.

💡 플러그인에 포함되지 않은 FormTypeInput 컴포넌트가 필요한 경우, `@canard/schema-form`의 공식 가이드를 참고하여 직접 구현하실 수 있습니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-antd-mobile-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

// 플러그인이 전역으로 등록됩니다
registerPlugin(plugin);
```

---

## 지원하는 컴포넌트

이 플러그인은 다음과 같은 Ant Design Mobile 컴포넌트들을 제공합니다:

### **[`FormTypeInputBooleanSwitch.tsx`](./src/formTypeInputs/FormTypeInputBooleanSwitch.tsx)**

- **역할**: boolean 타입 데이터를 Switch 컴포넌트로 표시
- **적용 조건**: `type`이 `"boolean"`이고 `formType`이 `"switch"`인 경우
- **추가 사항**: `checked`/`unchecked` 상태에 대한 커스텀 라벨 지원

### **[`FormTypeInputStringCheckbox.tsx`](./src/formTypeInputs/FormTypeInputStringCheckbox.tsx)**

- **역할**: string 배열을 체크박스 그룹으로 표시
- **적용 조건**: `type`이 `"array"`이고 `formType`이 `"checkbox"`이며, `items.type`이 `"string"`이고 `enum` 값이 존재하는 경우
- **추가 사항**: 각 체크박스 옵션에 대한 커스텀 라벨 지원

### **[`FormTypeInputStringSwitch.tsx`](./src/formTypeInputs/FormTypeInputStringSwitch.tsx)**

- **역할**: 두 개의 string 값 사이를 Switch로 토글
- **적용 조건**: `type`이 `"string"`이고 `formType`이 `"switch"`이며, `enum` 배열에 정확히 2개의 값이 있는 경우
- **추가 사항**: 스위치 상태별 커스텀 라벨 지원

### **[`FormTypeInputRadioGroup.tsx`](./src/formTypeInputs/FormTypeInputRadioGroup.tsx)**

- **역할**: string 또는 number의 단일 선택을 라디오 그룹으로 표시
- **적용 조건**: `type`이 `"string"`, `"number"`, 또는 `"integer"`이고, `formType`이 `"radio"` 또는 `"radiogroup"`이며, `enum` 값이 존재하는 경우
- **추가 사항**: 라디오 옵션에 대한 커스텀 라벨 지원

### **[`FormTypeInputArray.tsx`](./src/formTypeInputs/FormTypeInputArray.tsx)**

- **역할**: 배열 데이터를 동적으로 추가/삭제 가능한 리스트로 표시
- **적용 조건**: `type`이 `"array"`인 경우
- **추가 사항**: 읽기 전용 모드에서는 추가/삭제 버튼이 숨겨짐

### **[`FormTypeInputSlider.tsx`](./src/formTypeInputs/FormTypeInputSlider.tsx)**

- **역할**: 숫자 값을 슬라이더로 입력받기
- **적용 조건**:
  - `type`이 `"number"` 또는 `"integer"`이고 `format`이 `"slider"`인 경우
  - 또는 `type`이 `"array"`이고 `items.type`이 `"number"` 또는 `"integer"`이며 `format`이 `"slider"`인 경우 (범위 슬라이더)
- **추가 사항**: 지연 업데이트 옵션(`lazy`), 마크 표시, 범위 슬라이더 지원

### **[`FormTypeInputTextarea.tsx`](./src/formTypeInputs/FormTypeInputTextarea.tsx)**

- **역할**: 멀티라인 텍스트 입력을 위한 텍스트 영역
- **적용 조건**: `type`이 `"string"`이고 `format` 또는 `formType`이 `"textarea"`인 경우
- **추가 사항**: `minRows`, `maxRows`를 통한 자동 크기 조절 지원

### **[`FormTypeInputString.tsx`](./src/formTypeInputs/FormTypeInputString.tsx)**

- **역할**: 기본 문자열 입력 필드
- **적용 조건**: `type`이 `"string"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `format`이 `"password"`인 경우 비밀번호 입력 필드로 동작

### **[`FormTypeInputNumber.tsx`](./src/formTypeInputs/FormTypeInputNumber.tsx)**

- **역할**: 숫자 입력을 위한 스테퍼 컴포넌트
- **적용 조건**: `type`이 `"number"` 또는 `"integer"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `minimum`, `maximum`, `multipleOf` 스키마 속성 지원

### **[`FormTypeInputBoolean.tsx`](./src/formTypeInputs/FormTypeInputBoolean.tsx)**

- **역할**: boolean 값을 체크박스로 표시
- **적용 조건**: `type`이 `"boolean"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `undefined` 값에 대한 `indeterminate` 상태 지원

---

## 컴포넌트 우선순위

컴포넌트 선택은 다음 우선순위에 따라 결정됩니다:

1. **In-line 컴포넌트**: 스키마에 `FormType` 속성으로 지정된 컴포넌트
2. **FormTypeInputMap**: Path에 대해 명시적으로 매핑된 컴포넌트
3. **FormTypeInputDefinition**: 각 컴포넌트의 `test` 조건을 통한 자동 선택
4. **Provider FormTypeInputDefinition**: 상위 Provider에서 제공된 컴포넌트 정의
5. **Plugin**: 등록된 플러그인의 컴포넌트 (현재 플러그인 포함)
6. **Fallback**: 기본 fallback 컴포넌트

같은 우선순위 내에서는 배열의 앞순서가 우선합니다. 현재 플러그인의 컴포넌트는 다음 순서로 정의되어 있습니다:
`FormTypeInputBooleanSwitch` → `FormTypeInputStringCheckbox` → `FormTypeInputStringSwitch` → `FormTypeInputRadioGroup` → `FormTypeInputArray` → `FormTypeInputSlider` → `FormTypeInputTextarea` → `FormTypeInputString` → `FormTypeInputNumber` → `FormTypeInputBoolean`

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

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.
