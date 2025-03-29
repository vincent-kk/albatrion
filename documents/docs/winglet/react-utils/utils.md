---
sidebar_position: 1
---

# 유틸리티

## object

객체 조작 관련 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/react-utils';

const obj = { a: 1, b: { c: 2 } };

// 객체 병합
const merged = utils.object.merge(obj1, obj2);

// 객체 복사
const copied = utils.object.copy(obj);

// 객체 비교
const isEqual = utils.object.isEqual(obj1, obj2);

// 객체 변환
const transformed = utils.object.transform(obj, (value, key) => [
  key.toUpperCase(),
  value,
]);
```

### 입력

- `merge`: 객체 병합
- `copy`: 객체 복사
- `isEqual`: 객체 비교
- `transform`: 객체 변환

## render

렌더링 관련 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/react-utils';

// 조건부 렌더링
const rendered = utils.render.if(condition, Component);

// 리스트 렌더링
const list = utils.render.list(items, (item) => (
  <div key={item.id}>{item.name}</div>
));

// 빈 상태 렌더링
const empty = utils.render.empty(data, EmptyComponent);

// 로딩 상태 렌더링
const loading = utils.render.loading(isLoading, LoadingComponent);
```

### 입력

- `if`: 조건부 렌더링
- `list`: 리스트 렌더링
- `empty`: 빈 상태 렌더링
- `loading`: 로딩 상태 렌더링

## filter

필터링 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/react-utils';

const array = [1, null, 2, undefined, 3];

// null/undefined 제거
const filtered = utils.filter.removeNull(array);

// 빈 값 제거
const nonEmpty = utils.filter.removeEmpty(array);

// 중복 제거
const unique = utils.filter.removeDuplicates(array);

// 타입별 필터링
const numbers = utils.filter.filterByType(array, 'number');
```

### 입력

- `removeNull`: null/undefined 제거
- `removeEmpty`: 빈 값 제거
- `removeDuplicates`: 중복 제거
- `filterByType`: 타입별 필터링
