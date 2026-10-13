# @canard/schema-form-mui-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Material-UI](https://img.shields.io/badge/MUI-✔-007FFF.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## 개요

`@canard/schema-form-mui-plugin`은 Material-UI (MUI) 컴포넌트를 제공하는 `@canard/schema-form`용 플러그인입니다.

---

## 안내사항

⚠️ 이 플러그인은 Ant Design Mobile 환경에서 `@canard/schema-form`을 사용할 때 자주 필요한 핵심 컴포넌트들을 미리 구현해 놓은 것입니다.

📌 플러그인의 목적은 개발 편의성을 높이는 것이므로, 모든 가능한 컴포넌트를 포함하지는 않습니다.

💡 플러그인에 포함되지 않은 FieldInput 컴포넌트가 필요한 경우, `@canard/schema-form`의 공식 가이드를 참고하여 직접 구현하실 수 있습니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-mui-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-mui-plugin';

// 플러그인이 전역으로 등록됩니다
registerPlugin(plugin);
```

---

## 지원하는 컴포넌트

이 플러그인은 다음과 같은 Material-UI 컴포넌트들을 제공합니다:

### **[`FieldInputBooleanSwitch.tsx`](./src/fieldInputs/FieldInputBooleanSwitch.tsx)**

- **역할**: boolean 타입 데이터를 Switch 컴포넌트로 표시
- **적용 조건**: `type`이 `"boolean"`이고 `inputType`이 `"switch"`인 경우
- **추가 사항**: `checked`/`unchecked` 상태에 대한 커스텀 라벨 지원, 스위치 크기 조절 가능 (small, medium)

### **[`FieldInputStringCheckbox.tsx`](./src/fieldInputs/FieldInputStringCheckbox.tsx)**

- **역할**: string 배열을 체크박스 그룹으로 표시
- **적용 조건**: `type`이 `"array"`이고 `inputType`이 `"checkbox"`이며, `items.type`이 `"string"`이고 `enum` 값이 존재하는 경우
- **추가 사항**: 각 체크박스 옵션에 대한 커스텀 라벨 지원

### **[`FieldInputStringSwitch.tsx`](./src/fieldInputs/FieldInputStringSwitch.tsx)**

- **역할**: 두 개의 string 값 사이를 Switch로 토글
- **적용 조건**: `type`이 `"string"`이고 `inputType`이 `"switch"`이며, `enum` 배열에 정확히 2개의 값이 있는 경우
- **추가 사항**: 스위치 상태별 커스텀 라벨 지원

### **[`FieldInputUri.tsx`](./src/fieldInputs/FieldInputUri.tsx)**

- **역할**: URI 입력을 위한 특수 입력 필드 (프로토콜 드롭다운 포함)
- **적용 조건**: `type`이 `"string"`이고 `format` 또는 `inputType`이 `"uri"`인 경우
- **추가 사항**: 프로토콜 선택 드롭다운, 기본 프로토콜 목록 지원 (http, https), `presentation.FieldInputProps.protocols`로 커스텀 프로토콜 목록 설정, mailto/tel 등 단일 콜론 형태 프로토콜 지원

### **[`FieldInputMonth.tsx`](./src/fieldInputs/FieldInputMonth.tsx)**

- **역할**: 월 선택을 위한 DatePicker (월 모드)
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"month"`인 경우
- **추가 사항**: MUI X DatePickers 사용, `minimum`, `maximum` 범위 제한 지원, YYYY-MM 형식

### **[`FieldInputDate.tsx`](./src/fieldInputs/FieldInputDate.tsx)**

- **역할**: 날짜 선택을 위한 DatePicker
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"date"`인 경우
- **추가 사항**: MUI X DatePickers와 Dayjs 사용, `minimum`, `maximum` 날짜 범위 제한 지원, YYYY-MM-DD 형식

### **[`FieldInputTime.tsx`](./src/fieldInputs/FieldInputTime.tsx)**

- **역할**: 시간 선택을 위한 TimePicker
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"time"`인 경우
- **추가 사항**: MUI X DatePickers 사용, HH:mm:00Z 형식으로 시간 저장

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **역할**: string 또는 number의 단일 선택을 라디오 그룹으로 표시
- **적용 조건**: `type`이 `"string"`, `"number"`, 또는 `"integer"`이고, `inputType`이 `"radio"` 또는 `"radiogroup"`이며, `enum` 값이 존재하는 경우
- **추가 사항**: 라디오 옵션에 대한 커스텀 라벨 지원

### **[`FieldInputStringEnum.tsx`](./src/fieldInputs/FieldInputStringEnum.tsx)**

- **역할**: string 또는 string 배열의 선택을 Select 드롭다운으로 표시
- **적용 조건**: `type`이 `"string"`이고 `enum` 값이 존재하는 경우
- **추가 사항**: FormControl과 InputLabel을 활용한 Material Design 스타일, 옵션별 커스텀 라벨 지원 (alias)

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **역할**: 배열 데이터를 동적으로 추가/삭제 가능한 리스트로 표시
- **적용 조건**: `type`이 `"array"`인 경우
- **추가 사항**: Material-UI 아이콘이 포함된 Add/Remove 버튼, 읽기 전용 모드에서는 추가/삭제 버튼이 숨겨짐

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **역할**: 숫자 값을 슬라이더로 입력받기
- **적용 조건**: `type`이 `"number"` 또는 `"integer"`이고 `inputType`이 `"slider"`인 경우
- **추가 사항**: `minimum`, `maximum`, `multipleOf` 스키마 속성 지원, 지연 업데이트 옵션(`presentation.FieldInputProps.lazy`), 마크 표시 옵션, 값 라벨 자동 표시

### **[`FieldInputTextarea.tsx`](./src/fieldInputs/FieldInputTextarea.tsx)**

- **역할**: 멀티라인 텍스트 입력을 위한 텍스트 영역
- **적용 조건**: `type`이 `"string"`이고 `format` 또는 `inputType`이 `"textarea"`인 경우
- **추가 사항**: `minRows`, `maxRows`를 통한 자동 크기 조절 지원

### **[`FieldInputString.tsx`](./src/fieldInputs/FieldInputString.tsx)**

- **역할**: 기본 문자열 입력 필드
- **적용 조건**: `type`이 `"string"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `format`이 `"password"`인 경우 비밀번호 입력 필드로 동작, Material-UI TextField 사용

### **[`FieldInputNumber.tsx`](./src/fieldInputs/FieldInputNumber.tsx)**

- **역할**: 숫자 입력을 위한 TextField 컴포넌트 (number type)
- **적용 조건**: `type`이 `"number"` 또는 `"integer"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `minimum`, `maximum`, `multipleOf` 스키마 속성 지원

### **[`FieldInputBoolean.tsx`](./src/fieldInputs/FieldInputBoolean.tsx)**

- **역할**: boolean 값을 체크박스로 표시
- **적용 조건**: `type`이 `"boolean"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `undefined` 값에 대한 `indeterminate` 상태 지원, FormControlLabel 사용

---

## 입력 설정

위의 `protocols` 같은 입력별 설정은 `presentation.FieldInputProps`에 둡니다. 폼이 이 객체를 입력 props로 펼쳐 넘깁니다.

```ts
const jsonSchema = {
  type: 'object',
  properties: {
    homepage: {
      type: 'string',
      format: 'uri',
      presentation: { FieldInputProps: { protocols: ['https'] } },
    },
  },
};
```

0.16.0까지 Uri 입력은 `protocols` prop이 없으면 `options.protocols`를 읽었습니다. 1.0.0-beta부터 `options`는 닫힌 목록이고 입력별 설정은 `presentation.FieldInputProps`에 두면 입력 props로 펼쳐집니다. 옛 자리는 청사진 오류 `UNKNOWN_GROUP_KEY`가 됩니다.

## 컴포넌트 우선순위

컴포넌트 선택은 다음 우선순위에 따라 결정됩니다:

1. **In-line 컴포넌트**: 스키마에 `FieldInput` 속성으로 지정된 컴포넌트
2. **FieldInputMap**: Path에 대해 명시적으로 매핑된 컴포넌트
3. **FieldInputDefinition**: 각 컴포넌트의 `test` 조건을 통한 자동 선택
4. **Provider FieldInputDefinition**: 상위 Provider에서 제공된 컴포넌트 정의
5. **Plugin**: 등록된 플러그인의 컴포넌트 (현재 플러그인 포함)
6. **Fallback**: 기본 fallback 컴포넌트

같은 우선순위 내에서는 배열의 앞순서가 우선합니다. 현재 플러그인의 컴포넌트는 다음 순서로 정의되어 있습니다:
`FieldInputBooleanSwitch` → `FieldInputStringCheckbox` → `FieldInputStringSwitch` → `FieldInputUri` → `FieldInputMonth` → `FieldInputDate` → `FieldInputTime` → `FieldInputRadioGroup` → `FieldInputStringEnum` → `FieldInputArray` → `FieldInputSlider` → `FieldInputTextarea` → `FieldInputString` → `FieldInputNumber` → `FieldInputBoolean`

---

## 호환성 안내

`@canard/schema-form-mui-plugin`은 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

ES2020보다 낮은 버전의 JavaScript 환경에서 사용하시는 경우, 별도의 트랜스파일 과정이 필요합니다.

**지원 환경:**

- Node.js 14.17.0 이상
- 최신 브라우저 (Chrome 91+, Firefox 90+, Safari 14+)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

**의존성 요구사항:**

- React 18.0.0 이상 (19.0.0 미만)
- @mui/material 7.0.0 이상
- @mui/x-date-pickers 8.0.0 이상 (날짜/시간 관련 컴포넌트 사용 시)
- @emotion/react, @emotion/styled (MUI 스타일링 엔진)
- dayjs 1.0.0 이상 (날짜 처리용)

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.
