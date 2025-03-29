---
sidebar_position: 1
---

# HOC (Higher-Order Components)

## withPortal

포털 기능을 제공하는 HOC입니다.

```javascript
import { hoc } from '@winglet/react-utils';

const WithPortal = hoc.withPortal(MyComponent, {
  containerId: 'portal-root',
  onMount: () => console.log('포털 마운트'),
  onUnmount: () => console.log('포털 언마운트'),
});

function App() {
  return (
    <div>
      <WithPortal>
        <div>포털로 렌더링될 내용</div>
      </WithPortal>
    </div>
  );
}
```

### 입력

- `Component`: 포털로 렌더링할 컴포넌트
- `options`: 포털 옵션
  - `containerId`: 포털이 렌더링될 컨테이너 ID
  - `onMount`: 포털 마운트 시 실행할 콜백
  - `onUnmount`: 포털 언마운트 시 실행할 콜백

## withUploader

파일 업로드 기능을 제공하는 HOC입니다.

```javascript
import { hoc } from '@winglet/react-utils';

const WithUploader = hoc.withUploader(MyComponent, {
  accept: 'image/*',
  multiple: true,
  maxSize: 5 * 1024 * 1024, // 5MB
  onUpload: (files) => console.log('업로드된 파일:', files),
  onError: (error) => console.error('업로드 에러:', error),
});

function App() {
  return (
    <div>
      <WithUploader>
        <div>파일을 드래그하거나 클릭하여 업로드</div>
      </WithUploader>
    </div>
  );
}
```

### 입력

- `Component`: 업로드 기능이 추가될 컴포넌트
- `options`: 업로드 옵션
  - `accept`: 허용할 파일 타입
  - `multiple`: 다중 업로드 허용 여부
  - `maxSize`: 최대 파일 크기
  - `onUpload`: 업로드 완료 시 실행할 콜백
  - `onError`: 에러 발생 시 실행할 콜백

## withErrorBoundary

에러 바운더리 기능을 제공하는 HOC입니다.

```javascript
import { hoc } from '@winglet/react-utils';

const WithErrorBoundary = hoc.withErrorBoundary(MyComponent, {
  fallback: (error) => (
    <div>
      <h2>에러가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>새로고침</button>
    </div>
  ),
  onError: (error) => {
    console.error('에러 발생:', error);
    // 에러 로깅 서비스에 전송
  },
});

function App() {
  return (
    <div>
      <WithErrorBoundary>
        <MyComponent />
      </WithErrorBoundary>
    </div>
  );
}
```

### 입력

- `Component`: 에러 바운더리로 감싸질 컴포넌트
- `options`: 에러 바운더리 옵션
  - `fallback`: 에러 발생 시 표시할 컴포넌트
  - `onError`: 에러 발생 시 실행할 콜백
