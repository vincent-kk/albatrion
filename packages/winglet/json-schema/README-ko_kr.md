# @winglet/json-schema

[English](README.md) · 한국어

스키마를 순회하고 변환하며, 의미를 보존할 수 있는 참조를 인라인하는 도구입니다. 타입 가드는 스키마의 `type`을 판별합니다. 데이터 인스턴스의 유효성은 별도의 검증기로 확인하세요.

## 설치

```sh
yarn add @winglet/json-schema
```

## 참조 인라인 시작하기

동기 일괄 변환에는 `resolveReference`를 사용합니다. 이 예제는 입력을 바꾸지 않고 boolean 대상을 복사합니다. 보존이 필요한 참조는 결과에 남을 수 있습니다.

<!-- example: quick -->

```typescript
import { resolveReference } from '@winglet/json-schema';

const schema = {
  $defs: { Allowed: false },
  properties: { value: { $ref: '#/$defs/Allowed' } },
};
const output = resolveReference(schema);
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.properties.value === false);
console.assert(schema.properties.value.$ref === '#/$defs/Allowed');
```

## 작업에 맞는 경로

- 방문·필터·변형이 필요하면 `JSONSchemaScanner`와 `createReferenceResolver`를 함께 사용합니다. 해소기를 설정하지 않으면 참조를 인라인하지 않습니다.
- 문서 공급이나 콜백을 기다려야 하면 `JSONSchemaScannerAsync`와 `createReferenceResolverAsync`를 사용합니다. 문서 공급은 호출자가 제공한 `load` 함수가 담당합니다. 패키지는 스스로 네트워크나 파일에 접근하지 않습니다.
- 스키마 타입 판별은 `@winglet/json-schema/filter`, 동기 순회는 `/scanner`, 비동기 순회는 `/async-scanner` 하위 경로에서도 가져올 수 있습니다. 해소기 구성 함수는 루트에서 가져옵니다.

## 동작과 한계 읽기

[상세 명세](docs/ko/SPECIFICATION.md)가 방문 시점, 출력 소유권, 방언과 `inert`, 사용자 해소기, 참조 보존 이유, 오류와 깊이 안전의 범위를 설명합니다. 설치된 선언은 정확한 시그니처의 기준입니다.

boolean 노드를 처리한 뒤 객체 필드를 읽고, 참조 결과는 `exit`의 `entry.references`에서 확인하세요. `getValue()`는 변환 연산이 없으면 원본을 그대로 반환하므로 그 결과가 항상 소유한 사본이라고 가정하지 마세요.

## 에이전트 지침

패키지에 포함된 사용 지침은 [스킬](docs/agents/skills/json-schema-skill/SKILL.md)에서 시작합니다.

## 라이선스

MIT.
