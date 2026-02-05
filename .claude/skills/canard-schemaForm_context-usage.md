---
name: schema-form-context-usage
description: "@canard/schema-form의 context 기능 전문가. context prop과 @ 참조를 사용한 외부 데이터 연동 및 동적 UI 제어를 안내합니다."
user-invocable: false
---

# Context Usage Skill

@canard/schema-form의 context 기능에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: context-usage
- **용도**: context prop과 @ 참조를 사용한 외부 데이터 연동 가이드
- **트리거**: context, @, 외부 데이터, userRole, permissions, mode 관련 질문

---

## 개요 (Overview)

Form의 `context` prop을 통해 외부 데이터를 폼 내부에서 참조할 수 있습니다. computed 속성에서 `@` 접두사로 context 값에 접근하여 동적 UI 제어가 가능합니다.

---

## 기본 문법

```typescript
// Form에 context 전달
<Form
  jsonSchema={schema}
  context={{
    userRole: 'admin',
    mode: 'edit',
    permissions: { canEdit: true },
  }}
/>

// computed에서 context 참조
computed: {
  visible: '@.userRole === "admin"',
  readOnly: '@.mode === "view"',
  disabled: '(@).permissions?.canEdit !== true',
}

// 단축 문법
'&active': '@.isEnabled === true'
'&visible': '@.showAdvanced'
```

---

## 기본 사용 예제

### 모드 기반 제어

```typescript
// stories/34.ContextNode.stories.tsx 기반
const [mode, setMode] = useState<'view' | 'edit'>('view');

const jsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      computed: {
        readOnly: '@.mode === "view"',
      },
    },
    email: {
      type: 'string',
      title: 'Email',
      computed: {
        disabled: '@.mode === "view"',
      },
    },
    bio: {
      type: 'string',
      title: 'Bio',
      computed: {
        readOnly: '@.mode === "view"',
        disabled: '@.mode === "view"',
      },
    },
  },
};

<Form
  jsonSchema={jsonSchema}
  context={{ mode }}
/>

// mode가 'view'이면: 모든 필드가 readOnly 또는 disabled
// mode가 'edit'이면: 모든 필드가 편집 가능
```

### 사용자 역할 기반 가시성

```typescript
const [userRole, setUserRole] = useState<'admin' | 'user' | 'guest'>('user');

const jsonSchema = {
  type: 'object',
  properties: {
    publicField: {
      type: 'string',
      title: 'Public Field',
      // 모든 사용자에게 표시 (computed 없음)
    },
    userField: {
      type: 'string',
      title: 'User Field',
      computed: {
        active: '@.userRole !== "guest"',  // guest가 아니면 활성화
      },
    },
    adminField: {
      type: 'string',
      title: 'Admin Field',
      computed: {
        active: '@.userRole === "admin"',  // admin만 활성화
      },
    },
    sensitiveData: {
      type: 'string',
      title: 'Sensitive Data',
      computed: {
        active: '@.userRole !== "guest"',      // guest 제외
        readOnly: '@.userRole !== "admin"',   // admin만 편집 가능
      },
    },
  },
};

<Form
  jsonSchema={jsonSchema}
  context={{ userRole }}
/>
```

---

## 중첩 객체 접근

context에 중첩 객체가 있을 때 접근하는 방법:

```typescript
const context = {
  permissions: {
    canEdit: true,
    canDelete: false,
    canPublish: false,
  },
  settings: {
    theme: 'dark',
    locale: 'ko',
  },
};

const jsonSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      computed: {
        // (@)로 감싸서 optional chaining 사용
        readOnly: '(@).permissions?.canEdit !== true',
      },
    },
    deleteButton: {
      type: 'boolean',
      computed: {
        active: '(@).permissions?.canDelete === true',
      },
    },
    publishToggle: {
      type: 'boolean',
      computed: {
        visible: '(@).permissions?.canPublish === true',
        disabled: '(@).permissions?.canEdit !== true',
      },
    },
  },
};

<Form
  jsonSchema={jsonSchema}
  context={context}
/>
```

---

## FormTypeInput에서 context 사용

```typescript
const MyInput: FC<FormTypeInputProps<string, { mode: string; locale: string }>> = ({
  value,
  onChange,
  context,  // context prop으로 직접 접근
}) => {
  return (
    <div>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        readOnly={context.mode === 'view'}
      />
      <span>Locale: {context.locale}</span>
    </div>
  );
};
```

---

## 동적 context 업데이트

context가 변경되면 관련 computed 속성이 자동으로 재계산됩니다.

```typescript
const [permissions, setPermissions] = useState({
  canEdit: true,
  canDelete: false,
});

// 권한 토글 버튼
<button onClick={() => setPermissions(prev => ({
  ...prev,
  canEdit: !prev.canEdit,
}))}>
  Toggle Edit Permission
</button>

<Form
  jsonSchema={jsonSchema}
  context={{ permissions }}
/>

// permissions.canEdit이 변경되면
// 관련 computed 속성(readOnly 등)이 자동으로 재계산됨
```

---

## context와 다른 참조 방식 비교

| 참조 방식 | 문법 | 용도 |
|----------|------|------|
| `@.prop` | context 참조 | 외부 데이터 (userRole, mode 등) |
| `../field` | 형제 필드 참조 | 폼 내부 필드 값 |
| `/path/to/field` | 절대 경로 | 폼 내부 다른 위치의 필드 |
| `./field` | 현재 객체 자식 | oneOf/anyOf 조건에서 |

```typescript
computed: {
  // 외부 context 참조
  visible: '@.userRole === "admin"',

  // 형제 필드 참조
  active: '../toggle === true',

  // 절대 경로 참조
  readOnly: '/settings/locked === true',

  // 복합 조건
  disabled: '@.mode === "view" || ../isLocked === true',
}
```

---

## 실제 사용 패턴

### 테넌트 기반 폼 커스터마이징

```typescript
const [tenant, setTenant] = useState({
  id: 'company-a',
  features: {
    advancedMode: true,
    customFields: true,
  },
  branding: {
    primaryColor: '#3498db',
  },
});

const jsonSchema = {
  type: 'object',
  properties: {
    basicField: { type: 'string' },
    advancedField: {
      type: 'string',
      computed: {
        active: '(@).features?.advancedMode === true',
      },
    },
    customData: {
      type: 'object',
      computed: {
        active: '(@).features?.customFields === true',
      },
    },
  },
};

<Form
  jsonSchema={jsonSchema}
  context={tenant}
/>
```

### A/B 테스트 기반 UI

```typescript
const context = {
  experiment: {
    variant: 'B',  // 'A' or 'B'
  },
};

const jsonSchema = {
  type: 'object',
  properties: {
    // Variant A: 기본 입력
    simpleInput: {
      type: 'string',
      computed: {
        active: '(@).experiment?.variant === "A"',
      },
    },
    // Variant B: 고급 입력
    advancedInput: {
      type: 'object',
      computed: {
        active: '(@).experiment?.variant === "B"',
      },
      properties: {
        // ...
      },
    },
  },
};
```

### 다국어 지원

```typescript
const [locale, setLocale] = useState<'ko' | 'en'>('ko');

const jsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: locale === 'ko' ? '이름' : 'Name',
      FormTypeInputProps: {
        placeholder: locale === 'ko' ? '이름을 입력하세요' : 'Enter your name',
      },
    },
  },
};

// 또는 context를 통해 FormTypeInput에서 처리
<Form
  jsonSchema={jsonSchema}
  context={{ locale }}
/>
```

---

## 주의사항

### 1. context 변경과 리렌더링

context 객체가 변경되면 폼 전체가 리렌더링될 수 있습니다. 자주 변경되는 값은 주의가 필요합니다.

```typescript
// ⚠️ 매 렌더링마다 새 객체 생성 (불필요한 리렌더링)
<Form context={{ mode, permissions }} />

// ✅ useMemo로 안정적인 참조 유지
const context = useMemo(
  () => ({ mode, permissions }),
  [mode, permissions]
);
<Form context={context} />
```

### 2. optional chaining

중첩 객체에 접근할 때는 `(@)`로 감싸고 optional chaining을 사용하세요.

```typescript
// ❌ 에러 발생 가능
computed: { visible: '@.permissions.canEdit' }

// ✅ 안전한 접근
computed: { visible: '(@).permissions?.canEdit === true' }
```

### 3. context vs defaultValue

- `context`: UI 제어용 외부 데이터 (readonly)
- `defaultValue`: 폼 초기값

```typescript
// context는 폼 값에 포함되지 않음
<Form
  context={{ userRole: 'admin' }}  // 폼 값에 포함 안 됨
  defaultValue={{ name: '' }}       // 폼 값에 포함됨
/>
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/34.ContextNode.stories.tsx`
