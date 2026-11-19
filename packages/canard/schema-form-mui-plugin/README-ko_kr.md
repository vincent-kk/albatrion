# @canard/schema-form-mui-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Material-UI](https://img.shields.io/badge/MUI-✔-007FFF.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## 개요

`@canard/schema-form-mui-plugin`은 Material-UI (MUI) 컴포넌트를 제공하는 `@canard/schema-form`용 플러그인입니다.

FieldRenderer는 그룹 라벨 없이 묶인 Input과 ErrorMessage 부품을 조립하며, 단독 라벨은 LabelRenderer를 사용합니다. LabelRenderer와 ErrorMessageRenderer는 각 루트 요소를 소유하며 LabelRenderer와 ErrorMessageRenderer로 등록됩니다. 플러그인은 입력 틀을 등록하지 않습니다.

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
import { registerPlugin } from '@canard/schema-form';
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
- **추가 사항**: 프로토콜 선택 드롭다운, 기본 프로토콜 목록 지원 (http, https), `presentation.FieldInputProps.protocols`로 커스텀 프로토콜 목록 설정, mailto/tel 등 단일 콜론 형태 프로토콜 지원. 목록에 없는 스킴을 가진 값은 그 스킴을 유지하며, 드롭다운에 해당 스킴이 추가 선택지로 나타납니다

#### URI scheme preservation

URI 스킴은 RFC 3986 3.1절의 문법으로 구분합니다. 목록에 없는 스킴과 `localhost:3000`, `a:b`도 원래 대소문자와 구분자(`:` 또는 `://`)를 보존합니다. 스킴이 없는 값은 스킴을 덧붙이지 않습니다. 마운트·외부 쓰기·reset·Activity 숨김과 표시는 스킴만 있는 문자열을 포함한 저장 값을 고쳐 쓰지 않습니다. 주소가 있을 때 경로와 스킴 중 하나를 편집해도 나머지는 유지합니다. 주소를 지우거나 빈 주소에서 스킴만 고르면 `undefined`를 기록하고 선택한 스킴은 입력 상태로 보존하여 다음 문자를 그 스킴에 이어 붙입니다. 외부 쓰기와 reset은 저장 값의 스킴을 표시하며 값이 `undefined`이면 마지막 사용자 선택을 유지합니다. 구분자를 생략한 설정은 `http`·`https`·`ftp`에 `://`, 다른 스킴에 `:`를 사용하고 명시한 구분자는 그대로 유지합니다.

### **[`FieldInputMonth.tsx`](./src/fieldInputs/FieldInputMonth.tsx)**

- **역할**: 월 선택을 위한 DatePicker (월 모드)
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"month"`인 경우
- **추가 사항**: MUI X DatePickers 사용, `presentation.FieldInputProps.minimum`과 `maximum`(YYYY-MM)으로 범위 제한 지원(`2024-13`처럼 유효하지 않은 제한값은 무시), YYYY-MM 형식

### **[`FieldInputDate.tsx`](./src/fieldInputs/FieldInputDate.tsx)**

- **역할**: 날짜 선택을 위한 DatePicker
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"date"`인 경우
- **추가 사항**: MUI X DatePickers와 Dayjs 사용, `presentation.FieldInputProps.minimum`과 `maximum`(YYYY-MM-DD)으로 날짜 범위 제한 지원(`2024-02-31`처럼 유효하지 않은 제한값은 무시), YYYY-MM-DD 형식

### **[`FieldInputTime.tsx`](./src/fieldInputs/FieldInputTime.tsx)**

- **역할**: 시간 선택을 위한 TimePicker
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"time"`인 경우
- **추가 사항**: MUI X DatePickers 사용, 시간대 오프셋 없는 HH:mm:ss 형식으로 시간 저장

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **역할**: string 또는 number의 단일 선택을 라디오 그룹으로 표시
- **적용 조건**: `type`이 `"string"`, `"number"`, 또는 `"integer"`이고, `inputType`이 `"radio"` 또는 `"radiogroup"`이며, `enum` 값이 존재하는 경우
- **추가 사항**: 라디오 옵션에 대한 커스텀 라벨 지원

### **[`FieldInputStringEnum.tsx`](./src/fieldInputs/FieldInputStringEnum.tsx)**

- **역할**: string 값의 선택을 Select 드롭다운으로 표시
- **적용 조건**: `type`이 `"string"`이고 `enum` 값이 존재하는 경우
- **추가 사항**: FormControl과 InputLabel을 활용한 Material Design 스타일, 옵션별 커스텀 라벨 지원 (alias)

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **역할**: 배열 데이터를 동적으로 추가/삭제 가능한 리스트로 표시
- **적용 조건**: `type`이 `"array"`인 경우
- **추가 사항**: Material-UI 아이콘이 포함된 Add/Remove 버튼, 읽기 전용 모드에서는 추가/삭제 버튼이 숨겨짐

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **역할**: 숫자 값을 슬라이더로 입력받기
- **적용 조건**: `type`이 `"number"` 또는 `"integer"`이고 `inputType`이 `"slider"`인 경우
- **추가 사항**: `minimum`, `maximum`, `multipleOf` 스키마 속성 지원, 지연 업데이트 옵션(`presentation.FieldInputProps.lazy`), 마크 표시 옵션, 값 라벨 자동 표시. 폼에 값이 없으면 첫 변경 전까지 thumb와 값 라벨이 숨겨지며, 키보드 포커스를 받은 thumb는 표시됩니다. 이때 보조 기술에는 최솟값 대신 `Not set`을 알리며, `presentation.FieldInputProps.unsetValueText`로 문구를 바꿀 수 있습니다

`presentation.FieldInputProps.lazy`를 생략하거나 `true`로 두면 확정 시점(키 놓기, 포인터 놓기 또는 라이브러리 변경 완료 이벤트)에 값을 저장하고, `false`이면 이동마다 저장합니다.

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
- **추가 사항**: `null`과 불리언이 아닌 값은 `indeterminate` 상태로 표시되고, 값이 없는(`undefined`) 경우에는 체크되지 않은 상태로 표시됩니다. FormControlLabel 사용

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

- React 18.0.0 이상 (20.0.0 미만)
- @mui/material 7.0.0 이상
- @mui/x-date-pickers 8.0.0 이상 (날짜/시간 관련 컴포넌트 사용 시)
- @emotion/react, @emotion/styled (MUI 스타일링 엔진)
- dayjs 1.0.0 이상 (날짜 처리용)

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

복합 사용자 정의 입력은 `labelId`와 `getInputId`를 명시적으로 소비하고 DOM props에 펼치지 않습니다. getter의 참조는 필드 범위나 경로가 바뀔 때까지 유지됩니다. 말단 이름이나 `path`로 ID를 만들지 않습니다.

해당 Form 안에서 `formElement.querySelector('[data-path="/email"] input')`처럼 조회하거나 컨트롤이 받은 id로 레이블을 연결합니다. Form API가 반환하는 값은 스키마 형태를 유지합니다.

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.

### Switch values and state labels

For a string switch, `enum[0]` is the checked (on) value and `enum[1]` is the unchecked (off) value.

A boolean switch accepts `presentation.FieldInputProps.alias` with optional `checked` and `unchecked` ReactNode labels. Labels use `context.checkboxLabels`, then `alias`, then no state labels. The current state label does not replace the field name.

For string switches, use the schema-level `switchLabels: [checkedLabel, uncheckedLabel]` tuple for custom state labels.

### Unset slider values

An unset slider exposes no current value to assistive technology and stores nothing until the user acts.

### Slider constraints

With `multipleOf`, selectable values are multiples of that number within the inclusive bounds. Integer sliders select only integer multiples. Without `multipleOf`, number sliders retain their authored bounds. A range with no selectable value is disabled and stores nothing.
