# @canard/schema-form-antd5-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design](https://img.shields.io/badge/antd-✔-blue.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-plugin-pink.svg)]()

---

## 패키지 이름 변경 안내

> **알림**: 이 패키지는 이전에 `@canard/schema-form-antd-plugin`으로 배포되었습니다.
> 이전 패키지명은 더 이상 유지보수되지 않습니다. `@canard/schema-form-antd5-plugin`을 사용해 주세요.
>
> 마이그레이션 방법:
>
> ```bash
> # 이전 패키지 제거
> yarn remove @canard/schema-form-antd-plugin
> # 새 패키지 설치
> yarn add @canard/schema-form-antd5-plugin
> ```

---

## 개요

`@canard/schema-form-antd5-plugin`은 Ant Design 컴포넌트를 제공하는 `@canard/schema-form`용 플러그인입니다.

---

## 안내사항

⚠️ 이 플러그인은 Ant Design Mobile 환경에서 `@canard/schema-form`을 사용할 때 자주 필요한 핵심 컴포넌트들을 미리 구현해 놓은 것입니다.

📌 플러그인의 목적은 개발 편의성을 높이는 것이므로, 모든 가능한 컴포넌트를 포함하지는 않습니다.

💡 플러그인에 포함되지 않은 FieldInput 컴포넌트가 필요한 경우, `@canard/schema-form`의 공식 가이드를 참고하여 직접 구현하실 수 있습니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-antd5-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd5-plugin';

// 플러그인이 전역으로 등록됩니다
registerPlugin(plugin);
```

---

## 지원하는 컴포넌트

이 플러그인은 다음과 같은 Ant Design 컴포넌트들을 제공합니다:

### **[`FieldInputBooleanSwitch.tsx`](./src/fieldInputs/FieldInputBooleanSwitch.tsx)**

- **역할**: boolean 타입 데이터를 Switch 컴포넌트로 표시
- **적용 조건**: `type`이 `"boolean"`이고 `inputType`이 `"switch"`인 경우
- **추가 사항**: `checked`/`unchecked` 상태에 대한 커스텀 라벨 지원, 스위치 크기 조절 가능

### **[`FieldInputStringCheckbox.tsx`](./src/fieldInputs/FieldInputStringCheckbox.tsx)**

- **역할**: string 배열을 체크박스 그룹으로 표시
- **적용 조건**: `type`이 `"array"`이고 `inputType`이 `"checkbox"`이며, `items.type`이 `"string"`이고 `enum` 값이 존재하는 경우
- **추가 사항**: 각 체크박스 옵션에 대한 커스텀 라벨 지원

### **[`FieldInputStringSwitch.tsx`](./src/fieldInputs/FieldInputStringSwitch.tsx)**

- **역할**: 두 개의 string 값 사이를 Switch로 토글
- **적용 조건**: `type`이 `"string"`이고 `inputType`이 `"switch"`이며, `enum` 배열에 정확히 2개의 값이 있는 경우
- **추가 사항**: 스위치 상태별 커스텀 라벨 지원, 스위치 크기 조절 가능

### **[`FieldInputUri.tsx`](./src/fieldInputs/FieldInputUri.tsx)**

- **역할**: URI 입력을 위한 특수 입력 필드 (프로토콜 드롭다운 포함)
- **적용 조건**: `type`이 `"string"`이고 `format` 또는 `inputType`이 `"uri"`인 경우
- **추가 사항**: 프로토콜 선택 드롭다운, 기본 프로토콜 목록 지원 (http, https, ftp, mailto, tel), `presentation.FieldInputProps.protocols`로 커스텀 프로토콜 목록 설정

### **[`FieldInputMonth.tsx`](./src/fieldInputs/FieldInputMonth.tsx)**

- **역할**: 월 선택을 위한 DatePicker (월 모드)
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"month"`인 경우
- **추가 사항**: `presentation.FieldInputProps.minimum`·`maximum`(YYYY-MM)으로 선택 가능한 월 제한, YYYY-MM 형식

### **[`FieldInputDate.tsx`](./src/fieldInputs/FieldInputDate.tsx)**

- **역할**: 날짜 선택을 위한 DatePicker
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"date"`인 경우
- **추가 사항**: `presentation.FieldInputProps.minimum`·`maximum`(YYYY-MM-DD)으로 선택 가능한 날짜 제한, YYYY-MM-DD 형식

### **[`FieldInputTime.tsx`](./src/fieldInputs/FieldInputTime.tsx)**

- **역할**: 시간 선택을 위한 TimePicker
- **적용 조건**: `type`이 `"string"`이고 `format`이 `"time"`인 경우
- **추가 사항**: HH:mm:00Z 형식으로 시간 저장

### **[`FieldInputMonthRange.tsx`](./src/fieldInputs/FieldInputMonthRange.tsx)**

- **역할**: 월 범위 선택을 위한 DatePicker RangePicker (월 모드)
- **적용 조건**: `type`이 `"array"`이고 `format`이 `"month-range"` 또는 `inputType`이 `"monthRange"`이며, `items.type`이 `"string"`인 경우
- **추가 사항**: `presentation.FieldInputProps.minimum`·`maximum`(YYYY-MM)으로 선택 가능한 월 제한, [시작월, 종료월] 배열 형태로 반환

### **[`FieldInputDateRange.tsx`](./src/fieldInputs/FieldInputDateRange.tsx)**

- **역할**: 날짜 범위 선택을 위한 DatePicker RangePicker
- **적용 조건**: `type`이 `"array"`이고 `format`이 `"date-range"` 또는 `inputType`이 `"dateRange"`이며, `items.type`이 `"string"`인 경우
- **추가 사항**: `presentation.FieldInputProps.minimum`·`maximum`(YYYY-MM-DD)으로 선택 가능한 날짜 제한, [시작일, 종료일] 배열 형태로 반환

### **[`FieldInputTimeRange.tsx`](./src/fieldInputs/FieldInputTimeRange.tsx)**

- **역할**: 시간 범위 선택을 위한 DatePicker RangePicker (시간 모드)
- **적용 조건**: `type`이 `"array"`이고 `format`이 `"time-range"` 또는 `inputType`이 `"timeRange"`이며, `items.type`이 `"string"`인 경우
- **추가 사항**: `presentation.FieldInputProps.minimum`·`maximum`(HH:mm:00Z)으로 선택 가능한 시간 제한, [시작시간, 종료시간] 배열 형태로 반환

### **[`FieldInputRadioGroup.tsx`](./src/fieldInputs/FieldInputRadioGroup.tsx)**

- **역할**: string 또는 number의 단일 선택을 라디오 그룹으로 표시
- **적용 조건**: `type`이 `"string"`, `"number"`, 또는 `"integer"`이고, `inputType`이 `"radio"` 또는 `"radiogroup"`이며, `enum` 값이 존재하는 경우
- **추가 사항**: 라디오 옵션에 대한 커스텀 라벨 지원, 라디오 그룹 크기 조절 가능

### **[`FieldInputStringEnum.tsx`](./src/fieldInputs/FieldInputStringEnum.tsx)**

- **역할**: string 또는 string 배열의 선택을 Select 드롭다운으로 표시
- **적용 조건**:
  - `type`이 `"string"`이고 `enum` 값이 존재하는 경우
  - 또는 `type`이 `"array"`이고 `items.type`이 `"string"`이며 `items.enum` 값이 존재하는 경우
- **추가 사항**: 단일/다중 선택 자동 감지, 옵션별 커스텀 라벨 지원

### **[`FieldInputArray.tsx`](./src/fieldInputs/FieldInputArray.tsx)**

- **역할**: 배열 데이터를 동적으로 추가/삭제 가능한 리스트로 표시
- **적용 조건**: `type`이 `"array"`인 경우
- **추가 사항**: Ant Design 아이콘이 포함된 Add/Remove 버튼, 읽기 전용 모드에서는 추가/삭제 버튼이 숨겨짐

### **[`FieldInputSlider.tsx`](./src/fieldInputs/FieldInputSlider.tsx)**

- **역할**: 숫자 값을 슬라이더로 입력받기
- **적용 조건**: `type`이 `"number"` 또는 `"integer"`이고 `inputType`이 `"slider"`인 경우
- **추가 사항**: `minimum`, `maximum`, `multipleOf` 스키마 속성 지원, `presentation.FieldInputProps.lazy: false`이면 놓을 때가 아니라 움직일 때마다 값 반영

### **[`FieldInputTextarea.tsx`](./src/fieldInputs/FieldInputTextarea.tsx)**

- **역할**: 멀티라인 텍스트 입력을 위한 텍스트 영역
- **적용 조건**: `type`이 `"string"`이고 `format` 또는 `inputType`이 `"textarea"`인 경우
- **추가 사항**: `minRows`, `maxRows`를 통한 자동 크기 조절 지원

### **[`FieldInputUnion.tsx`](./src/fieldInputs/FieldInputUnion.tsx)**

- **역할**: 유효 타입 목록을 기준으로 초안을 해석하는 다중 타입(`union`) 입력 필드
- **적용 조건**: `type`이 `"union"`인 경우
- **추가 사항**: 해석되지 않는 초안을 포커스 해제 전까지 지역 상태로 유지, 객체·배열 값은 읽기 전용으로 표시

### **[`FieldInputString.tsx`](./src/fieldInputs/FieldInputString.tsx)**

- **역할**: 기본 문자열 입력 필드
- **적용 조건**: `type`이 `"string"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `format`이 `"password"`인 경우 비밀번호 입력 필드로 동작, 입력 필드 크기 조절 가능

### **[`FieldInputNumber.tsx`](./src/fieldInputs/FieldInputNumber.tsx)**

- **역할**: 숫자 입력을 위한 InputNumber 컴포넌트
- **적용 조건**: `type`이 `"number"` 또는 `"integer"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `minimum`, `maximum`, `multipleOf` 스키마 속성 지원, 커스텀 formatter/parser 지원

### **[`FieldInputBoolean.tsx`](./src/fieldInputs/FieldInputBoolean.tsx)**

- **역할**: boolean 값을 체크박스로 표시
- **적용 조건**: `type`이 `"boolean"`인 경우 (다른 조건에 해당하지 않는 fallback)
- **추가 사항**: `undefined` 값에 대한 `indeterminate` 상태 지원

---

## 입력 설정

위의 `protocols`, `lazy`, `minimum`, `maximum` 같은 입력별 설정은 `presentation.FieldInputProps`에 둡니다. 폼이 이 객체를 입력 props로 펼쳐 넘깁니다.

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

0.16.0까지 내장 입력은 `options.minimum`·`maximum`·`lazy`·`protocols`를 읽었습니다. 1.0.0-beta부터 `options`는 닫힌 목록이고 입력별 설정은 `presentation.FieldInputProps`에 두면 입력 props로 펼쳐집니다. 옛 자리는 청사진 오류 `UNKNOWN_GROUP_KEY`가 됩니다.

## 컴포넌트 우선순위

컴포넌트 선택은 다음 우선순위에 따라 결정됩니다:

1. **In-line 컴포넌트**: 스키마에 `FieldInput` 속성으로 지정된 컴포넌트
2. **FieldInputMap**: Path에 대해 명시적으로 매핑된 컴포넌트
3. **FieldInputDefinition**: 각 컴포넌트의 `test` 조건을 통한 자동 선택
4. **Provider FieldInputDefinition**: 상위 Provider에서 제공된 컴포넌트 정의
5. **Plugin**: 등록된 플러그인의 컴포넌트 (현재 플러그인 포함)
6. **Fallback**: 기본 fallback 컴포넌트

같은 우선순위 내에서는 배열의 앞순서가 우선합니다. 현재 플러그인의 컴포넌트는 다음 순서로 정의되어 있습니다:
`FieldInputBooleanSwitch` → `FieldInputStringCheckbox` → `FieldInputStringSwitch` → `FieldInputUri` → `FieldInputMonth` → `FieldInputDate` → `FieldInputTime` → `FieldInputMonthRange` → `FieldInputDateRange` → `FieldInputTimeRange` → `FieldInputRadioGroup` → `FieldInputStringEnum` → `FieldInputArray` → `FieldInputSlider` → `FieldInputTextarea` → `FieldInputUnion` → `FieldInputString` → `FieldInputNumber` → `FieldInputBoolean`

## union 입력 계약

- union 입력은 `type === 'union'`일 때 다음을 읽는다. `schemaType`: 목록이며, 순서에 core의 뜻은 없다. `nullable`, `value`, `misfit`, `required`. `jsonSchema`: `jsonSchema.type`은 켜진 선언의 교집합이며, 형 없는 칸에서는 없을 수 있다. 게이트가 좁힌 목록은 `schemaType`과 `jsonSchema.type`의 교집합이다.
- 보내는 값은 JSON 형이 목록에 있는 값이나 `undefined`다. `null`은 nullable일 때 비우기 조작으로만 보내고, 빈 칸은 `undefined`로 보낸다. `value`는 어긋난 값일 수 있으므로 `onChange`보다 넓은 형이다.
- 치다 만 글과 입력기 조합 중인 글은 입력이 초안으로 들고, 흐려지면 노드 값으로 되돌린다.
- 목록 밖의 값을 보내도 오류가 아니고 버려지지도 않는다. core의 규칙 A가 받아서, 받아 줄 형이 정확히 하나면 그 형으로 바꾸고, 아니면 그대로 두고 경고등을 켠다. 게이트가 목록을 좁힌 동안에는 좁혀진 목록으로 해석한다. 입력은 이 결과를 다음 렌더의 `misfit`으로 안다. `misfit === false`는 검증 통과가 아니다.
- 객체·배열 값은 불변으로 다룬다. 바꿀 때는 새 참조를 보내고, 받은 값을 제자리에서 바꾸지 마라. 값 안에 JSON이 아닌 것(`undefined`인 키, `Date` 등)을 넣지 마라.
- 목록의 순서에 기대지 마라. core가 사용자가 뜻한 형을 골라 준다고 가정하지 마라.
- 이 플러그인의 union 입력은 비우기 조작으로 `null`을 보내지 않는다(빈 칸은 언제나 `undefined`다).
- 이 플러그인의 union 입력은 객체·배열을 만들거나 편집하지 않으며, 받은 객체·배열 값은 읽기 전용으로만 표시한다.

---

## 호환성 안내

`@canard/schema-form-antd5-plugin`은 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

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
