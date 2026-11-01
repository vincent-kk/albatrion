# @canard/schema-form Quick Reference

> 빠른 참조를 위한 치트시트

---

## 목차

1. [설치 및 설정](#설치-및-설정)
2. [경로 문법 (JSONPointer)](#경로-문법-jsonpointer)
3. [Controls](#controls)
4. [조건부 스키마](#조건부-스키마)
5. [FormHandle API](#formhandle-api)
6. [FieldInput](#fieldinput)
7. [ValidationMode](#validationmode)
8. [Virtualization](#virtualization-대형-폼)
9. [노드 타입](#노드-타입)
10. [이벤트 타입](#이벤트-타입)

---

## 설치 및 설정

```bash
# 패키지 설치
yarn add @canard/schema-form

# Validator 플러그인 (필수)
yarn add @canard/schema-form-ajv8-plugin

# UI 플러그인 (선택)
yarn add @canard/schema-form-antd5-plugin
```

```tsx
// 앱 시작 시 플러그인 등록 (1회)
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

registerPlugin(ajvValidatorPlugin);
```

---

## 경로 문법 (JSONPointer)

### 기본 경로

| 문법          | 의미             | 예시                 |
| ------------- | ---------------- | -------------------- |
| `/field`      | 절대 경로 (루트) | `/user/name`         |
| `./field`     | 현재 노드 자식   | `./nested/child`     |
| `../field`    | 형제 필드        | `../siblingField`    |
| `../../field` | 부모의 형제      | `../../anotherField` |

### 특수 문법

| 문법     | 의미              | 사용 가능 컨텍스트  |
| -------- | ----------------- | ------------------- |
| `*`      | 와일드카드        | `fieldInputMap`만   |
| `@.prop` | context 속성 참조 | `controls` 표현식만 |
| `.`      | 현재 노드         | `controls` 표현식   |

### 이스케이프 규칙

| 문자 | 이스케이프 | 예시                                      |
| ---- | ---------- | ----------------------------------------- |
| `/`  | `~1`       | `field/with/slash` → `field~1with~1slash` |
| `~`  | `~0`       | `field~name` → `field~0name`              |

### 예시

```typescript
// fieldInputMap에서 와일드카드 사용
fieldInputMap: {
  '/users/*/name': UserNameInput,     // /users/0/name, /users/1/name 매칭
  '/config/*/value': ConfigValueInput, // /config/theme/value 매칭
}

// controls에서 context 참조
controls: { visible: "@.userRole === 'admin'" }

// 조건부 스키마에서 현재 노드 참조
controls: { active: "./type === 'A'" }
```

---

## Controls

### 속성 종류

`controls` 객체의 키는 닫힌 목록이며 별칭은 없습니다. 목록 밖의 키는 청사진 빌드에서 `UNKNOWN_GROUP_KEY` 오류를 던집니다.

| 속성               | 타입                      | 동작                                         | 값 제거 |
| ------------------ | ------------------------- | -------------------------------------------- | ------- |
| `active`           | `boolean \| string`       | 조건부 활성화                                | ✅ Yes  |
| `visible`          | `boolean \| string`       | 조건부 표시                                  | ❌ No   |
| `readOnly`         | `boolean \| string`       | 읽기 전용                                    | -       |
| `disabled`         | `boolean \| string`       | 비활성화                                     | -       |
| `default`          | 리터럴 값                 | 새로 나타난 노드의 채움 값                   | -       |
| `derived`          | `string`                  | 파생 값 계산                                 | -       |
| `unsetValue`       | `boolean \| string`       | false에서 true로 바뀌면 값을 비움            | -       |
| `resetInteraction` | `boolean \| string`       | false에서 true로 바뀌면 edited/touched 초기화 | -       |
| `unsetOnInactive`  | `boolean \| string`       | 형상을 떠날 때 유지된 값을 버림              | -       |
| `fields`           | `{ targets, controls }[]` | 부모가 자식에게 앞의 아홉 키를 지정          | -       |
| `injectTo`         | `(value, ctx) => 대상 맵` | 값이 바뀔 때마다 다른 노드로 주입            | -       |
| `discriminator`    | `string`                  | oneOf/anyOf 호스트의 분기 태그 속성          | -       |
| `watch`            | `string[]`                | 값 구독 (경로 배열만)                        | -       |

`controls.fields[].controls`와 조각(`oneOf`/`anyOf`/`allOf` 분기, `then`, `else`)의 `controls`에는 앞의 아홉 키(`active`부터 `unsetOnInactive`까지)만 허용됩니다.

### active vs visible 선택

```
숨길 때 값도 제거? → YES → active
                 → NO  → visible
```

| 시나리오                                | 선택      |
| --------------------------------------- | --------- |
| 할인 옵션 체크 해제 시 할인율 필드 제거 | `active`  |
| 단계별 폼 (이전 단계 데이터 유지)       | `visible` |
| 권한 없는 사용자에게 필드 숨김          | `active`  |
| 접기/펼치기 UI                          | `visible` |

### 문법

```typescript
{
  type: 'string',
  controls: {
    active: '../toggle === true',
    visible: "@.userRole === 'admin'",
    derived: '(../price ?? 0) * (../quantity ?? 1)',
    watch: ['../category', '../price'],
  },
}

// 값 주입: 함수는 controls 안에 둡니다
{
  type: 'string',
  controls: { injectTo: (value) => ({ '../nickname': value }) },
}
```

---

## 조건부 스키마

### 키워드 비교

| 키워드         | 동작          | 다중 활성화 | 값 처리                                                  |
| -------------- | ------------- | ----------- | -------------------------------------------------------- |
| `oneOf`        | 배타적 선택   | ❌ 하나만   | 비활성 브랜치 값 제거                                    |
| `anyOf`        | 비배타적 선택 | ✅ 여러 개  | 비활성 브랜치 값 제거                                    |
| `allOf`        | 스키마 병합   | ✅ 모두     | 항상 모든 값 포함                                        |
| `if-then-else` | 조각 게이트   | -           | `then`은 가드 통과 시, `else`는 가드 실패 시 형상에 포함 |

### oneOf 예시

```typescript
{
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'] },
  },
  oneOf: [
    { controls: { active: "./type === 'A'" }, properties: { fieldA: { type: 'string' } } },
    { controls: { active: "./type === 'B'" }, properties: { fieldB: { type: 'number' } } },
  ],
}
```

분기는 게이트가 통과하는 동안에만 켜집니다. 분기 객체의 `controls.active` 표현식을 쓰거나, 호스트에 `controls.discriminator: '<property>'`를 지정하고 각 분기에 그 속성의 `const`/`enum` 태그를 둡니다(`===`로 비교하고 분기의 `controls.active`와 AND). 게이트가 없으면 모든 분기가 켜집니다. `if` 가드는 검증기의 `compileGuard`로 동기 평가하며, 선택된 검증기가 없으면(Form이나 FormProvider의 `validatorFactory`도, 검증기 플러그인도 없으면) `then`과 `else` 모두 꺼진 채로 남습니다.

### anyOf 예시

```typescript
{
  type: 'object',
  properties: {
    hasFeature1: { type: 'boolean' },
    hasFeature2: { type: 'boolean' },
  },
  anyOf: [
    { controls: { active: './hasFeature1' }, properties: { config1: { type: 'string' } } },
    { controls: { active: './hasFeature2' }, properties: { config2: { type: 'string' } } },
  ],
}
```

### nullable 객체 + oneOf (null 분기 패턴)

`type` 없는 분기는 `null`에도 맞으므로, `null`이 검증을 통과하려면 null 분기 하나와 객체 분기의 `type: 'object'`가 필요합니다. null 분기는 검증 전용이라 필드도 조건도 갖지 않습니다.

```typescript
{
  type: ['object', 'null'],
  properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' } },
  oneOf: [
    { type: 'null' },
    { type: 'object', controls: { active: "./kind === 'a'" }, properties: { aValue: { type: 'string' } } },
    { type: 'object', controls: { active: "./kind === 'b'" }, properties: { bValue: { type: 'string' } } },
  ],
}
```

---

## FormHandle API

### 기본 사용

```tsx
const formRef = useRef<FormHandle<typeof schema>>(null);
<Form ref={formRef} jsonSchema={schema} />;
```

### 메서드 요약

`getAttachedFilesMap()`과 `showError()`를 뺀 모든 메서드는 폼의 현재 루트 노드를 대상으로 합니다.

| 메서드                  | 반환 타입                    | 설명                                                     |
| ----------------------- | ---------------------------- | -------------------------------------------------------- |
| `node`                  | `FieldNode \| undefined`     | 현재 루트 노드                                           |
| `getValue()`            | `Value`                      | 현재 출력 값                                             |
| `setValue(v, option?)`  | `void`                       | 폼 값 설정                                               |
| `reset(option?)`        | `void`                       | 커밋된 기본값 다시 불러오기 (자동 쓰기 옵션만 받음)      |
| `validate()`            | `Promise<ValidationIssue[]>` | 검증 실행                                                |
| `getErrors()`           | `ValidationIssue[]`          | 현재 오류 전체                                           |
| `showError(visible?)`   | `void`                       | `true`(기본)는 모든 오류 표시, `false`는 prop으로 되돌림 |
| `findNode(path)`        | `FieldNode \| null`          | 노드 탐색                                                |
| `findNodes(path)`       | `readonly FieldNode[]`       | 와일드카드 탐색                                          |
| `focus(path?)`          | `void`                       | 필드 포커스 (생략하면 루트)                              |
| `select(path?)`         | `void`                       | 필드 값 선택 (생략하면 루트)                             |
| `refresh(path?)`        | `void`                       | 입력이 커밋된 값을 다시 읽게 함                          |
| `remount(path?)`        | `void`                       | 렌더된 하위 트리 다시 마운트                             |
| `getState()`            | `globalState`                | 하나 이상의 노드에서 참인 상호작용 플래그                |
| `setState(s)`           | `void`                       | 모든 노드의 플래그 패치                                  |
| `clearState()`          | `void`                       | 모든 노드의 플래그 지우기                                |
| `submit()`              | `Promise<void>`              | 폼 제출                                                  |
| `getAttachedFilesMap()` | `Map<string, File[]>`        | 첨부 파일                                                |

### 일반적인 패턴

```typescript
// 값 가져오기
const value = formRef.current?.getValue();

// 값 설정
formRef.current?.setValue({ name: 'Alice' });

// 함수형 업데이트
formRef.current?.setValue((prev) => ({ ...prev, name: 'Bob' }));

// 검증 후 제출
const errors = await formRef.current?.validate();
if (errors?.length === 0) {
  // 제출 로직
}

// 특정 필드 접근
const nameNode = formRef.current?.findNode('/name');
nameNode?.setValue('Charlie');
```

---

## FieldInput

### 우선순위 (높은 순)

1. JSON Schema의 `presentation.FieldInput` 속성
2. `fieldInputMap` (경로 기반)
3. Form의 `fieldInputDefinitions`
4. FormProvider의 `fieldInputDefinitions`
5. 플러그인의 `fieldInputDefinitions`

### 정의 방법

```typescript
// 1. 스키마에 직접 지정
{ type: 'string', presentation: { FieldInput: CustomInput } }

// 2. 경로 기반 매핑
<Form fieldInputMap={{ '/email': EmailInput }} />

// 3. 정의 배열
const definitions: FieldInputDefinition[] = [
  { test: { type: 'string', format: 'email' }, Component: EmailInput },
  { test: (hint) => hint.type === 'number', Component: NumberInput },
];
```

### FieldInputProps 주요 속성

| 속성           | 타입          | 설명            |
| -------------- | ------------- | --------------- |
| `value`        | `Value`       | 현재 값         |
| `defaultValue` | `Value`       | 기본값          |
| `onChange`     | `(v) => void` | 값 변경 핸들러  |
| `node`         | `FieldNode`   | 필드 노드       |
| `errors`       | `Error[]`     | 검증 에러       |
| `errorVisible` | `boolean`     | 에러 표시 여부  |
| `readOnly`     | `boolean`     | 읽기 전용       |
| `disabled`     | `boolean`     | 비활성화        |
| `required`     | `boolean`     | 필수 여부       |
| `nullable`     | `boolean`     | null 허용       |
| `watchValues`  | `any[]`       | 구독 값         |
| `context`      | `object`      | 사용자 컨텍스트 |
| `ChildFields`  | `FC[]`        | 자식 컴포넌트   |

---

## ValidationMode

### 모드 종류

| 모드        | 값  | 동작                   |
| ----------- | --- | ---------------------- |
| `None`      | `0` | 검증 비활성화          |
| `OnChange`  | `1` | 값 변경 시 검증        |
| `OnRequest` | `2` | `validate()` 호출 시만 |

### 사용 예시

```typescript
import { ValidationMode } from '@canard/schema-form';

// 값 변경을 그린 다음 화면 뒤 검증
<Form validationMode={ValidationMode.OnChange} />

// 명시적 호출 시만 검증
<Form validationMode={ValidationMode.OnRequest} />

// 둘 다 활성화
<Form validationMode={ValidationMode.OnChange | ValidationMode.OnRequest} />
```

---

## Virtualization (대형 폼)

수백 개 필드 폼의 초기 React 마운트 비용을 줄이는 **옵트인** 렌더 가상화. 화면 밖 필드를 placeholder로 지연 마운트한다(node tree는 전량 유지 → 값/검증/제출 동일 동작).

```typescript
import { Form, VirtualizationBackfill } from '@canard/schema-form';

// 기본값으로 활성화 (threshold 30 / eagerCount 20 / rootMargin '100%' / backfill Idle)
<Form jsonSchema={largeSchema} virtualization />

// 커스텀 옵션
<Form
  virtualization={{
    threshold: 30,      // 자식 30개 이상 branch만 게이팅
    eagerCount: 20,     // 앞 20개는 즉시 마운트
    rootMargin: '100%', // IntersectionObserver 여백 (px 또는 % 만)
    backfill: VirtualizationBackfill.Idle, // 또는 .None (스크롤/명령 시에만 reveal)
    estimateHeight: 40, // placeholder 높이 px, 또는 (node) => number
    Placeholder: FieldSkeleton, // placeholder 안에 렌더할 컴포넌트 (선택)
  }}
/>
```

| 옵션             | 기본값   | 설명                                                  |
| ---------------- | -------- | ----------------------------------------------------- |
| `threshold`      | `30`     | 이 수 이상 자식을 가진 branch만 게이팅                |
| `eagerCount`     | `20`     | 즉시 마운트할 선행 필드 수                            |
| `rootMargin`     | `'100%'` | IntersectionObserver 여백 (px/% 만)                   |
| `backfill`       | `Idle`   | `Idle`=idle 시 점진 마운트, `None`=스크롤/명령 시에만 |
| `estimateHeight` | `40`     | placeholder 공간 예약 높이(px)                        |
| `Placeholder`    | `null`   | placeholder 시각 컴포넌트 (`{node, height}`)          |

- placeholder는 `[data-path][data-deferred]` 박스 — CSS `[data-deferred] { … }` 또는 `Placeholder` 컴포넌트로 스타일링.
- **SSR·하이드레이션**: 서버의 전 필드를 그대로 하이드레이션하며 이후 추가한 브랜치·자식만 게이팅합니다. IO 없는 브라우저는 전체 렌더링(dev 경고), 서버는 경고 없음. 하이드레이션 자체는 사용자 브랜치 입력 내부 Suspense 경계에 갱신을 보내지 않으므로 React 18/19는 서버 DOM을 보존합니다. React 18에서 경계가 하이드레이션되기 전에 도달하는 이후 갱신은 여전히 클라이언트 렌더링으로 전환합니다. 하이드레이션 때 준비했지만 사용자 브랜치 입력이 접힌 탭·아코디언 등에서 나중에 처음 렌더하는 자식은 준비 시 게이트 결정이 고정되어 게이팅하지 않습니다.

---

## 노드 타입

### Terminal Nodes (원시값)

| 노드          | 설명                |
| ------------- | ------------------- |
| `StringNode`  | 문자열, format 검증 |
| `NumberNode`  | 숫자, min/max 제약  |
| `BooleanNode` | 불리언              |
| `NullNode`    | 명시적 null         |

### Branch Nodes (컨테이너)

| 노드         | 설명                    |
| ------------ | ----------------------- |
| `ObjectNode` | 객체, properties 관리   |
| `ArrayNode`  | 배열, push/remove/clear |

### Special Nodes

| 노드          | 설명              |
| ------------- | ----------------- |
| `VirtualNode` | 가상 필드, 그룹화 |

### 타입 가드

```typescript
import { isArrayNode, isObjectNode, isVirtualNode } from '@canard/schema-form';

if (isArrayNode(node)) {
  node.push(); // ArrayNode 메서드 사용 가능
}
```

### 하위 트리 방문

```typescript
node.visitSubtree((child) => {
  if (child.path === '/profile/locked') return false; // 이 노드의 하위를 건너뜀
  if (child.type === 'string') child.setValue(''); // 순회가 끝날 때 한 번에 반영
});
```

| 항목                   | 동작                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| 순서                   | 자기 자신 먼저, 하위는 전위, 형제는 `children` 순                                |
| `false` 반환           | 그 노드의 하위만 건너뜀                                                          |
| 범위                   | 폼 안의 노드는 현재 형상만, 폼에서 빠진 노드는 함께 빠진 하위 트리               |
| 값 쓰기                | 순회 끝(바깥 `batch` 안이면 그 batch 끝)에 한 번 반영, 순회 중 읽기는 순회 전 값 |
| 상태·외부 오류         | 데이터는 바로, 이벤트는 순회 끝(바깥 `batch` 안이면 그 batch 끝)                 |
| `reset`·`resetSubtree` | 순회 안에서도 바로 적용                                                          |
| 예외                   | 리스너 밖에서는 이미 한 쓰기를 반영한 뒤 다시 던짐                               |
| 빠진 노드에 쓰기       | 폼 안의 필드는 바뀌지 않음                                                       |

`FormHandle`에는 `visitSubtree`가 없습니다. `formRef.current?.node`에서 부르십시오.

---

## 이벤트 타입

| 이벤트                       | 설명                                  |
| ---------------------------- | ------------------------------------- |
| `Initialized`                | 노드 초기화 완료                      |
| `UpdatePath`                 | 경로 변경 (배열 재정렬)               |
| `UpdateValue`                | 값 변경                               |
| `UpdateState`                | 상호작용 플래그 변경 (edited, touched) |
| `UpdateGlobalState`          | 트리 전체 상호작용 플래그 변경        |
| `UpdateError`                | 검증 오류 변경                        |
| `UpdateGlobalError`          | 트리 전체 검증 오류 변경              |
| `UpdateChildren`             | 직속 자식 변경                        |
| `UpdateControlledProperties` | controls 상태·watch 값 변경           |
| `Focused`                    | 입력이 포커스를 얻음                  |
| `Blurred`                    | 입력이 포커스를 잃음                  |
| `RequestFocus`               | 포커스 요청                           |
| `RequestSelect`              | 값 선택 요청                          |
| `RequestRefresh`             | 커밋된 값 다시 읽기 요청              |
| `RequestRemount`             | 하위 트리 리마운트 요청               |
| `UpdateJsonSchema`           | 유효 스키마 참조 변경                 |
| `UpdateDiagnostics`          | 루트 정착 진단 변경                   |

### 구독 패턴

```typescript
const unsubscribe = node.subscribe((event) => {
  console.log('Event:', event);
});

// 클린업
unsubscribe();
```

---

## 에러 메시지 커스터마이징

```typescript
{
  type: 'string',
  minLength: 3,
  presentation: {
    errorMessages: {
      minLength: '최소 {limit}자 이상이어야 합니다. 현재: {value}',
      required: '필수 입력 항목입니다',
    },
  },
}

// 다국어 지원
{
  presentation: {
    errorMessages: {
      minLength: {
        ko_KR: '최소 {limit}자 이상',
        en_US: 'At least {limit} characters',
      },
    },
  },
}

// locale 설정
<Form context={{ locale: 'ko_KR' }} />
```

---

## 배열 조작

```typescript
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

arrayNode.push(); // 기본값으로 아이템 추가
arrayNode.push('custom'); // 특정 값으로 추가
arrayNode.remove(0); // 인덱스 0 삭제
arrayNode.clear(); // 전체 삭제 (minItems와 무관 — core는 항목을 채우지 않음)
arrayNode.children?.length; // 현재 항목 노드 수 (하나의 입력으로 렌더된 배열은 children이 null)
arrayNode.children; // 자식 노드 배열
```

---

## Form.Render / Form.Input

```tsx
<Form jsonSchema={schema}>
  {/* 특정 필드만 렌더링 */}
  <Form.Input path="/name" />
  <Form.Input path="/email" />

  {/* 커스텀 렌더링 */}
  <Form.Render path="/password">
    {({ Input, value, errorMessage }) => (
      <div>
        <Input />
        {errorMessage && <span className="error">{errorMessage}</span>}
      </div>
    )}
  </Form.Render>
</Form>
```

---

## 사용 가능한 플러그인

### Validator

| 패키지                            | 설명           |
| --------------------------------- | -------------- |
| `@canard/schema-form-ajv8-plugin` | AJV 8.x (권장) |
| `@canard/schema-form-ajv7-plugin` | AJV 7.x        |
| `@canard/schema-form-ajv6-plugin` | AJV 6.x        |

### UI

| 패키지                                   | 설명              |
| ---------------------------------------- | ----------------- |
| `@canard/schema-form-antd5-plugin`       | Ant Design 5      |
| `@canard/schema-form-antd6-plugin`       | Ant Design 6      |
| `@canard/schema-form-antd-mobile-plugin` | Ant Design Mobile |
| `@canard/schema-form-mui-plugin`         | Material UI       |

---

## 참고 문서

- [한국어 스펙](./ko/SPECIFICATION.md)
- [영어 스펙](./en/SPECIFICATION.md)
- [Claude 스킬](./agents/skills/schema-form-skill/SKILL.md)


### 검증 시점

`OnChange` 쓰기는 다음 프레임 뒤 선행 실행하며 연속 입력은 프레임마다 이월하고 quiet 프레임 뒤 후행 실행합니다. 마지막 실제 자동 실행 시작 기준100ms 상한 뒤에는 watch로 돌아갑니다. 디바운스는 `FieldInput`이 소유합니다. 프레임 API가 없거나 숨긴 문서이면 매크로태스크 fallback을 쓰고100ms stalled-frame 타이머가 프레임 뒤 task와 단일 실행을 경주합니다. 명시적 `validate()`와 제출은 즉시 시작하고 제출은 판정을 기다립니다.

오류는 지금 적격이며 마지막 release 이후 엔진 state·enabled·커밋된 Form 정책의 모든 조합에서 계속 적격일 때 표시합니다. 숨김은 즉시이며 새로 적격해지거나 중간에 부적격했던 오류는 다음 release를 기다립니다. release는 pending true→false 정착, 조용한 post-paint 이력 drop, 수락한 explicit root 판정, 폐기입니다. 조용한 변경은 약2프레임 뒤 표시합니다. renderer/input은 `active && visible`도 검사하고 자식 오류 훅은 enabled를 제외합니다. `OnChange`만 이력을 기록하며 다른 모드는 live 조건을 씁니다. 공개 `batch()` 또는 walk 하나에서는 그 쓰기 시퀀스의 첫 상태만 이력에 기록하고 중간 상태는 별도 이력으로 남기지 않습니다. 한 React batch 안의 서로 다른 공개 호출은 중간 상태도 기록합니다. React-only 복원·remount·mirror·virtualization도 같은 이력을 소비합니다. 현재 stamp의 commit-only 폐기는 targets를 보존하고 cadence에서 최신 commit을 재요청합니다. 새 함수·`Date`·`Map`·class identity를 포함한 context 변경 stream이 이어지면 멎을 때까지 hold합니다.

Always(`true`, `ShowError.Always` 또는 해당 비트를 포함한 mask)를 포함해 최초 마운트·동일 스키마 reset·루트 교체 reset·rebuild·검증기 교체는 하나의 로드 검증 진입점을 다음 프레임 뒤 슬롯에서 실행합니다. `None`은 컴파일하지 않고, `OnRequest`만이면 컴파일만 하며, `OnChange`는 컴파일 후 현재 로드 시작 이후 쓰기 검증 요청이나 명시적 루트 검증이 없을 때 첫 판정을 냅니다. 자동 로드 컴파일 실패는 새 트리를 유지하고 로드마다 `origin: 'validate'` 한 번과 호스트 보고 한 번이며 reset·rebuild는 그 실패로 던지지 않습니다. `validate()`·제출은 즉시 시작하고 실패하면 거부하며 기록의 origin은 `validate`입니다. `if` 게이트의 구성·렌더 중 컴파일은 유지합니다. 첫 판정 전 빈 목록은 unknown으로 다루거나 `validate()`를 기다립니다. 명시적 반환과 제출 값은 호출 시점 snapshot이며 하위 검증은 전체 pending 요청을 보존합니다.

raw `errors`, Form children errors, `FormRender`, `node.errors`, `getErrors()`는 표시와 무관합니다. custom UI는 `errorVisible`과 `useChildFieldErrors().showErrors`를 씁니다. hidden 자식은 값·aggregate 오류를 유지하고 inactive는 값 제거·off-branch issue 제외를 따릅니다. 첫 layout commit을 마친 현행 load는 숨김 중에도 같은-schema reset을 포함한 모든 폼 콜백을 engine chain 끝에 전달하며 show에서 재생하지 않습니다. 준비 전 변경·상태·진단은 버리고 생성 기록만 보관하며, reset으로 은퇴한 load의 기록은 버립니다. 루트 교체 reset은 handler 실패를 각각 격리하고 mount 기록 뒤 build 기록을 binding 교체 전에 전달합니다. React가 숨김과 unmount를 구분하지 않으므로 보유한 핸들·노드는 unmount 뒤에도 전달하지만 검증 캐시 참조는 cleanup에서 해제합니다. 숨김 중 onError만 최신 prop을 사용하고 다른 콜백은 마지막 연결 commit을 사용하며 Form ref는 null입니다. 필드 layout 쓰기·렌더 경고는 show에 도착합니다. `None`·`OnRequest`와 검증 계산 비용은 유지합니다.

한계: hook의 React-only `disabled` 인자는 즉시 reveal합니다. drop 뒤로 미뤄진 state/enabled render(transition·Suspense·time slicing)는 hold를 생략합니다. commit-only stream은 멎을 때까지 hold합니다. release와 paint 사이 task의 쓰기는 released verdict를1~2프레임 표시할 수 있습니다. 한 React batch 안의 미표시 state/enabled/policy 조합도 이력에 포함되며 state 변경은 policy commit보다 먼저 기록됩니다.


## onError record origin

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

`onError?: (record: FormErrorRecord) => void`는 발생마다 해당 기록 하나를 전달합니다. 기록의 필수 `origin`은 발생을 만든 연산을 나타냅니다.

| origin | 연산 |
| --- | --- |
| `load` | 트리 구성·mount·reset·rebuild·검증기 변경과 그 로드 사슬 |
| `write` | 공개 쓰기·배열 동사·상태·batch·맥락·finishInput·외부 오류 및 통지 리스너 |
| `validate` | 자동·명시적 전체 스키마 컴파일·실행, 판정 전달 및 그 리스너 |
| `submit` | SubmitWhileDegraded와 네이티브 submit의 capture에서 처음 드러난 실패 |
| `render` | RenderFailed 경계 및 ChildNodeComponentsOnTerminal 같은 렌더 계층 경고 |

트리 생성 중 만든 기록(블루프린트 진단·DialectMismatch)은 누가 생성을 불렀든 load다; 생성된 트리가 사슬 안에서 낸 기록은 그 사슬을 연 작업의 origin을 따른다.

사슬을 연 가장 바깥 연산이 origin을 정합니다. reset의 onChange 안에서 중첩 쓰기가 나면 `load`이며, 쓰기 사슬의 노드 리스너나 폼 onChange가 reset을 호출하면 `write`입니다. 검증 결과 파동 리스너의 실패는 `validate`이고, 로드 직후 독립 setState 리스너의 실패는 `write`입니다. 최초 commit의 외부 errors 적용은 `load`, errors prop 변경은 `write`입니다. 제출 안의 dispatchValidate가 이미 보고한 실패는 `validate`를 유지합니다. 개발 콘솔의 warnDevelopmentIssue 경고는 기록이 아닙니다. submit()·validate()의 caller에게 거부되는 묶음은 거부 값 하나로 유지하며 개별 onError 기록에는 묶음을 싣지 않습니다. 명시적 validate 중 검증 결과 리스너 실패는 caller가 없는 별도 통로여서 host에 전달하고 validate 자체는 resolve할 수 있습니다. 부른 쪽이 없는 실패는 기존 호스트 채널에 깊이 우선·원소 순서로 잎마다 보냅니다. 비어 있지 않고 모든 index가 own인 배열을 가진 SchemaFormError MultipleErrors만 펼치며 형식이 어긋나거나 읽을 수 없거나 다시 만난 묶음과 그 밖의 값은 그대로 보냅니다. engine 검증 결과 파동·자동 OnChange 검증·load flush의 handler-first 순서와 native submit·load slot의 original-first 순서는 유지합니다. React와 렌더 ErrorBoundary는 던진 값을 그대로 기록합니다. 이미 보고한 오류·핸들러 예외만 담은 유효한 중첩 묶음은 capture를 생략하며 미지·malformed·순환·재방문 중첩 묶음은 기록합니다. 배열 길이는 1..2^32 − 1 정수이며 처음과 마지막 읽기가 같아야 하고 각 순회는 호출 전체에서 원소 점검 예산 1,000,000개를 공유합니다. 읽을 수 없거나 길이가 변하거나 예산을 넘은 묶음은 같은 identity의 잎이므로 host도 묶음을 받을 수 있습니다. capture는 최상위 메타데이터·문자열 변환도 보호하며 읽기 실패 때 원래 값을 고정 fallback 메시지의 기록 하나로 전달합니다. 전달 시점·호출자 거부·재진입·sink 예외 전파는 유지합니다.

`FormErrorRecord.surface` and `aggregate` were removed; `origin` names the operation that produced the record

### 노드 boolean 속성과 로드 기준의 차이

노드 boolean 속성은 `isRequired`, `isActive`, `isVisible`, `isPresent`, `isReadOnly`, `isDisabled`, `isMisfit`입니다. `isPresent`는 `isActive && isVisible`이며 `isDisabled`와는 별개입니다. React props, 스키마 키, `controls` 키는 그대로입니다.

```ts
node.isEdited;    // state[FieldNodeState.Edited]의 truthiness
node.isTouched;   // state[FieldNodeState.Touched]의 truthiness
node.isDivergent; // 현재 폼 출력과 마지막 루트 로드 출력의 같은 경로 값이 다른지
```

`isEdited`와 `isTouched`는 읽기 전용 boolean이며 `UpdateState`에서 다시 읽습니다. Edited는 사용자 입력만 켭니다. `setValue`, 배열 동사, 자동 채움은 켜지 않으며 reset, `clearState`, `controls.resetInteraction`은 상호작용 플래그를 비웁니다. 떼어진 참조는 마지막 커밋의 상호작용 상태를 유지합니다.

`isDivergent`는 현재 루트 출력과 마지막 루트 로드 커밋의 출력에서 노드의 같은 경로 값을 비교합니다. 최초 마운트, 값 또는 명시적 undefined를 받는 폼 reset, rebuild, validator 변경, `root.resetSubtree()`는 최종 출력을 새 기준으로 삼습니다. 첫 커밋 전에는 false입니다. Form `defaultValue` prop 변경만으로는 기준이 이동하지 않습니다. 일반 쓰기와 자식 `resetSubtree()`도 기준을 옮기지 않습니다. 커밋 전 실패는 이전 기준을 유지하며 커밋 뒤 보고된 실패는 degraded 출력을 새 기준으로 삼습니다.

기준값으로 되돌리면 false입니다. 숨긴 노드는 출력에 남고 배열의 빈 자리는 실제 출력 기여 값으로 비교합니다. 배열 아이템은 위치 기준이므로 이동하거나 새로 넣은 아이템은 true일 수 있으며, 그 위치의 기준값과 같은 값을 넣으면 false입니다. 자식 reset은 아이템 정체성을 따라가는 로드 원본을 복원하므로 배열 이동 뒤 또는 범위 밖 의존성이 있으면 복원 뒤에도 true일 수 있습니다. 떼어진 노드는 출력에 기여하지 않으므로 false입니다.

비교는 엔진의 `sameValue`를 따르므로 선언 밖 객체 키를 다른 순서로 복원하면 true일 수 있습니다. 정착 도중에는 `value`·`outputValue`처럼 일시 값을 읽을 수 있습니다. React 소비자는 `UpdateValue`, `UpdatePath`, `UpdateState`에서 다시 읽어야 합니다. 같은 값 reset은 `UpdateValue` 없이도 결과를 바꿀 수 있습니다.

쓰기는 divergence 읽기·비교를 추가하지 않습니다. 루트 로드마다 최종 출력 참조를 보유하는 박스 하나를 만듭니다. getter는 캐시된 두 경로를 O(depth)로 걷고 두 경로 값 중 하나가 Object.is 기준으로 바뀔 때만 비교합니다. 변화 없는 반복 읽기는 NaN도 `sameValue` 호출 0회이며 첫 비교는 바뀌지 않은 참조를 건너뜁니다. 기준은 다음 루트 로드까지 교체된 부분을 보유하고 노드 메모는 자기 경로의 두 값과 결과만 보유합니다.
