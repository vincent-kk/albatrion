---
sidebar_position: 1
---

# 스키마 확장

`@canard/schema-form-antd-mobile-plugin`은 JSON 스키마에 UI 관련 속성을 추가하여 Ant Design Mobile 컴포넌트의 다양한 기능을 활용할 수 있게 해줍니다.

## UI 속성

### 공통 속성

모든 컴포넌트에서 공통적으로 사용할 수 있는 UI 속성들입니다.

| 속성             | 타입                             | 설명                 |
| ---------------- | -------------------------------- | -------------------- |
| `ui:widget`      | `string`                         | 사용할 컴포넌트 타입 |
| `ui:disabled`    | `boolean`                        | 비활성화 여부        |
| `ui:readonly`    | `boolean`                        | 읽기 전용 여부       |
| `ui:placeholder` | `string`                         | 플레이스홀더 텍스트  |
| `ui:size`        | `'small' \| 'middle' \| 'large'` | 컴포넌트 크기        |
| `ui:style`       | `object`                         | 인라인 스타일        |
| `ui:className`   | `string`                         | CSS 클래스명         |

### Input 컴포넌트 속성

```tsx
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      'ui:widget': 'input',
      'ui:type': 'text',
      'ui:placeholder': '이름을 입력하세요',
      'ui:prefix': 'UserOutlined',
      'ui:suffix': 'CheckCircleOutlined',
      'ui:maxLength': 20,
      'ui:showCount': true,
    },
  },
};
```

### Select 컴포넌트 속성

```tsx
const schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      title: '타입',
      'ui:widget': 'select',
      'ui:mode': 'multiple',
      'ui:placeholder': '타입을 선택하세요',
      'ui:allowClear': true,
      'ui:showSearch': true,
      'ui:filterOption': true,
      'ui:optionFilterProp': 'children',
    },
  },
};
```

### DatePicker 컴포넌트 속성

```tsx
const schema = {
  type: 'object',
  properties: {
    date: {
      type: 'string',
      title: '날짜',
      'ui:widget': 'datepicker',
      'ui:showTime': true,
      'ui:format': 'YYYY-MM-DD HH:mm:ss',
      'ui:placeholder': '날짜를 선택하세요',
      'ui:showNow': true,
      'ui:showToday': true,
    },
  },
};
```

### Checkbox 컴포넌트 속성

```tsx
const schema = {
  type: 'object',
  properties: {
    terms: {
      type: 'boolean',
      title: '약관 동의',
      'ui:widget': 'checkbox',
      'ui:indeterminate': false,
      'ui:autoFocus': false,
    },
  },
};
```

### Radio 컴포넌트 속성

```tsx
const schema = {
  type: 'object',
  properties: {
    gender: {
      type: 'string',
      title: '성별',
      'ui:widget': 'radio',
      'ui:buttonStyle': 'outline',
      'ui:optionType': 'button',
      'ui:size': 'middle',
    },
  },
};
```

### Switch 컴포넌트 속성

```tsx
const schema = {
  type: 'object',
  properties: {
    active: {
      type: 'boolean',
      title: '활성화',
      'ui:widget': 'switch',
      'ui:checkedChildren': '활성',
      'ui:unCheckedChildren': '비활성',
      'ui:loading': false,
      'ui:autoFocus': false,
    },
  },
};
```

## 레이아웃 속성

폼의 레이아웃을 조정하기 위한 속성들입니다.

```tsx
const schema = {
  type: 'object',
  'ui:layout': 'vertical', // 'horizontal' | 'vertical' | 'inline'
  'ui:labelCol': { span: 4 },
  'ui:wrapperCol': { span: 20 },
  properties: {
    name: {
      type: 'string',
      title: '이름',
      'ui:widget': 'input',
    },
  },
};
```

## 그룹화

관련된 필드들을 그룹화하기 위한 속성들입니다.

```tsx
const schema = {
  type: 'object',
  properties: {
    personalInfo: {
      type: 'object',
      title: '개인 정보',
      'ui:group': true,
      'ui:groupStyle': {
        border: '1px solid #d9d9d9',
        padding: '16px',
        borderRadius: '4px',
      },
      properties: {
        name: {
          type: 'string',
          title: '이름',
          'ui:widget': 'input',
        },
        email: {
          type: 'string',
          title: '이메일',
          'ui:widget': 'input',
        },
      },
    },
  },
};
```

## 다음 단계

- [예제](./examples.md)에서 다양한 스키마 확장 사례를 살펴보세요
- [튜토리얼](./tutorials.md)에서 단계별로 스키마를 확장하는 방법을 배워보세요
