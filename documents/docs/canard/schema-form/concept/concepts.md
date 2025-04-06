---
sidebar_position: 1
---

# 기본 개념

## 스키마 기반 폼

`@canard/schema-form`은 JSON 스키마를 기반으로 폼을 생성합니다. 스키마는 폼의 구조, 유효성 검증 규칙, UI 표현을 정의합니다.

### 스키마 구조

```tsx
const schema = {
  type: 'object', // 최상위 타입
  properties: {
    // 폼 필드 정의
    name: {
      type: 'string',
      title: '이름',
      description: '실명을 입력해주세요',
    },
  },
  required: ['name'], // 필수 필드 지정
};
```

## 노드 시스템

폼의 각 필드는 내부적으로 노드로 표현됩니다. 노드는 다음과 같은 타입이 있습니다:

- `StringNode`: 문자열 입력 필드
- `NumberNode`: 숫자 입력 필드
- `BooleanNode`: 불리언 입력 필드
- `ArrayNode`: 배열 입력 필드
- `ObjectNode`: 객체 입력 필드
- `VirtualNode`: 실제 입력 필드가 없는 가상 노드

## 상태 관리

폼의 상태는 다음과 같은 요소들로 구성됩니다:

1. **값 상태**

   - 각 필드의 현재 값
   - 초기값
   - 수정된 값

2. **유효성 상태**

   - 필드별 유효성 검증 결과
   - 전체 폼의 유효성 상태

3. **UI 상태**
   - 포커스 상태
   - 에러 메시지
   - 로딩 상태

## 이벤트 시스템

폼은 다음과 같은 주요 이벤트를 지원합니다:

- `onChange`: 값 변경 시
- `onSubmit`: 폼 제출 시
- `onValidate`: 유효성 검증 시
- `onError`: 에러 발생 시

## 플러그인 시스템

플러그인을 통해 폼의 기능을 확장할 수 있습니다:

```tsx
import { registerPlugin } from '@canard/schema-form';

registerPlugin({
  name: 'my-plugin',
  setup: (form) => {
    // 플러그인 로직
  },
});
```

## 다음 단계

- [API 참조](./api.md)에서 각 컴포넌트와 훅의 상세 API를 확인하세요
- [커스터마이징](./customization.md)에서 폼의 스타일과 동작을 커스터마이즈하는 방법을 알아보세요
