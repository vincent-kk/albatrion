---
sidebar_position: 1
---

# 예제

## 기본 폼

가장 기본적인 Ant Design Mobile 폼 예제입니다.

```tsx
import { Form, FormProvider } from '@canard/schema-form';
import { registerAntdMobilePlugin } from '@canard/schema-form-antd-mobile-plugin';
import 'antd-mobile/es/global';

registerAntdMobilePlugin();

const schema = {
  type: 'object',
  'ui:layout': 'vertical',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      'ui:widget': 'input',
      'ui:placeholder': '이름을 입력하세요',
    },
    email: {
      type: 'string',
      title: '이메일',
      'ui:widget': 'input',
      'ui:type': 'email',
      'ui:placeholder': '이메일을 입력하세요',
    },
    type: {
      type: 'string',
      title: '타입',
      'ui:widget': 'select',
      enum: ['개인', '기업'],
      'ui:placeholder': '타입을 선택하세요',
    },
  },
  required: ['name', 'email', 'type'],
};

function BasicForm() {
  return (
    <FormProvider>
      <Form
        schema={schema}
        onSubmit={(data) => {
          console.log('제출된 데이터:', data);
        }}
      />
    </FormProvider>
  );
}
```

## 고급 폼

더 복잡한 기능을 포함한 폼 예제입니다.

```tsx
const schema = {
  type: 'object',
  'ui:layout': 'horizontal',
  'ui:labelCol': { span: 6 },
  'ui:wrapperCol': { span: 18 },
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
          'ui:prefix': 'UserOutlined',
          'ui:maxLength': 20,
          'ui:showCount': true,
        },
        email: {
          type: 'string',
          title: '이메일',
          'ui:widget': 'input',
          'ui:type': 'email',
          'ui:prefix': 'MailOutlined',
        },
        phone: {
          type: 'string',
          title: '전화번호',
          'ui:widget': 'input',
          'ui:prefix': 'PhoneOutlined',
        },
      },
    },
    preferences: {
      type: 'object',
      title: '선호 설정',
      'ui:group': true,
      properties: {
        notifications: {
          type: 'array',
          title: '알림 설정',
          'ui:widget': 'checkbox',
          items: {
            type: 'string',
            enum: ['이메일', 'SMS', '푸시'],
          },
        },
        theme: {
          type: 'string',
          title: '테마',
          'ui:widget': 'radio',
          'ui:buttonStyle': 'outline',
          enum: ['라이트', '다크'],
        },
      },
    },
    schedule: {
      type: 'object',
      title: '일정',
      properties: {
        startDate: {
          type: 'string',
          title: '시작일',
          'ui:widget': 'datepicker',
          'ui:showTime': true,
          'ui:format': 'YYYY-MM-DD HH:mm:ss',
        },
        endDate: {
          type: 'string',
          title: '종료일',
          'ui:widget': 'datepicker',
          'ui:showTime': true,
          'ui:format': 'YYYY-MM-DD HH:mm:ss',
        },
      },
    },
    isActive: {
      type: 'boolean',
      title: '활성화',
      'ui:widget': 'switch',
      'ui:checkedChildren': '활성',
      'ui:unCheckedChildren': '비활성',
      default: true,
    },
  },
};
```

## 검색 폼

검색 기능이 포함된 폼 예제입니다.

```tsx
const schema = {
  type: 'object',
  'ui:layout': 'inline',
  properties: {
    keyword: {
      type: 'string',
      title: '검색어',
      'ui:widget': 'input',
      'ui:placeholder': '검색어를 입력하세요',
      'ui:prefix': 'SearchOutlined',
    },
    category: {
      type: 'string',
      title: '카테고리',
      'ui:widget': 'select',
      'ui:showSearch': true,
      'ui:filterOption': true,
      'ui:placeholder': '카테고리를 선택하세요',
      enum: ['전체', '제품', '서비스', '기술'],
    },
    dateRange: {
      type: 'array',
      title: '기간',
      'ui:widget': 'daterange',
      'ui:placeholder': ['시작일', '종료일'],
      items: {
        type: 'string',
      },
    },
    status: {
      type: 'string',
      title: '상태',
      'ui:widget': 'radio',
      'ui:buttonStyle': 'outline',
      enum: ['전체', '진행중', '완료', '취소'],
    },
  },
};
```

## 다중 선택 폼

다중 선택이 가능한 폼 예제입니다.

```tsx
const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: '태그',
      'ui:widget': 'select',
      'ui:mode': 'tags',
      'ui:placeholder': '태그를 입력하세요',
      'ui:tokenSeparators': [','],
      items: {
        type: 'string',
      },
    },
    categories: {
      type: 'array',
      title: '카테고리',
      'ui:widget': 'select',
      'ui:mode': 'multiple',
      'ui:showSearch': true,
      'ui:filterOption': true,
      'ui:placeholder': '카테고리를 선택하세요',
      items: {
        type: 'string',
        enum: ['전자', '의류', '식품', '도서', '스포츠'],
      },
    },
  },
};
```

## 다음 단계

- [튜토리얼](./tutorials.md)에서 단계별로 폼을 구현하는 방법을 배워보세요
- [컴포넌트](./components.md)에서 각 컴포넌트의 상세 사용법을 확인하세요
