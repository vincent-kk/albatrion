# @winglet/json-schema — 동작 명세

[빠른 시작](../../README.md) · [English](../en/SPECIFICATION.md)

## 범위

스캐너는 스키마 분석과 변환에 사용합니다. 데이터 인스턴스를 검증하는 작업은 별도 검증기가 담당합니다. 런타임 가드는 타입 표기를 판별하고, 추론한 TypeScript 값 타입은 검증을 증명하지 않는 부분 모델입니다. 아래 예제는 각각 독립 실행할 수 있습니다. 패키지는 ES2020 구문의 ESM과 CommonJS를 제공합니다. URI 해석에는 호스트의 URL 구현이 필요합니다.

## 순회와 출력 소유권

노드는 `filter` → `mutate` → `enter` → 참조 처리 → 자식 확정 → `exit` 순서로 처리합니다. filter가 false이면 해당 노드와 후손을 가지치기하고 enter/exit도 호출하지 않습니다. `maxDepth`는 루트 깊이 0부터 경계 깊이를 포함하며, 경계 노드의 처리는 그대로 실행합니다. 자식 출현의 객체 포인터는 부모 처리가 끝난 뒤 첫 자식 방문 전에 확정합니다. 키워드 순서는 어휘 순서, 맵 내부는 자기 키 나열 순서, 목록은 인덱스 순서입니다. 배열 컨테이너 자체는 스키마 노드가 아닙니다. boolean 스키마는 false를 포함해 콜백이 받는 잎입니다.

`path`는 `#`에서 시작하는 이스케이프된 스키마 포인터이고, `dataPath`는 빈 값에서 시작해 properties와 튜플 위치에서 늘어납니다. enter와 exit는 같은 entry 객체를 받으므로 앞선 내용을 보관하려면 별도 스냅샷을 만드세요. 엔진은 enter 뒤에 `references`를 채우며 exit에서 완료된 체인 결과를 읽을 수 있습니다.

스캔은 입력·mutate 반환값·해소기 대상을 쓰지 않고 변환을 기록합니다. 첫 `getValue()`가 결과를 만들어 false까지 캐시합니다. 연산이 없으면 입력과 같은 참조를 반환합니다. 연산이 있으면 평범한 JSON 컨테이너를 복사하고 같은 객체의 반복 출현도 각각 복사합니다. 두 스캐너의 `getValue()`는 동기 함수입니다. 실패한 스캔은 상태를 비우며 성공한 스캔이 없으면 getValue는 undefined입니다. 스캔 중 같은 인스턴스의 scan/getValue는 `scan-in-progress`를 던집니다. 독립 작업에는 다른 인스턴스를 사용하세요.

<!-- example: walk -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema/scanner';

const paths: string[] = [];
const schema = { properties: { name: { type: 'string' }, denied: false } };
const scanner = new JSONSchemaScanner({
  visitor: {
    enter(entry) {
      if (entry.keyword === 'properties') paths.push(entry.dataPath);
      if (typeof entry.schema === 'boolean') return;
      console.assert(typeof entry.schema === 'object');
    },
  },
});
console.assert(scanner.scan(schema).getValue() === schema);
console.assert(paths.join(',') === '/name,/denied');
```

## 변환

mutate에서는 `entry.schema`를 직접 쓰지 말고 교체 값을 반환합니다. undefined만 현재 노드 유지이며 false는 실제 교체입니다. 자식은 교체 값에서 확정합니다. inert 노드도 콜백을 받지만 그 교체는 출력에 기록되지 않으므로 의미 있는 위치만 바꾸려면 `entry.inert`를 확인하세요.

현재 노드의 `$id`, `id`, `$schema`, `$anchor`, `$dynamicAnchor`, `$recursiveAnchor`를 추가·제거·변경하면 `identifier-mutation`입니다. 교체 값 아래에 새로 넣은 식별자는 등록되지 않습니다. 해소기는 생성할 때 제공한 문서를 색인하므로 식별자 구조 변경은 해소기 생성 전에 수행하고, 해소기를 재사용할 동안 공급한 문서를 불변으로 다루세요.

<!-- example: mutate -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema';

const schema = { properties: { name: { type: 'string' }, denied: false } };
const output = new JSONSchemaScanner({
  options: {
    mutate(entry) {
      if (entry.inert || typeof entry.schema === 'boolean') return;
      if (entry.schema.type === 'string')
        return { ...entry.schema, minLength: 1 };
    },
  },
})
  .scan(schema)
  .getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.properties.name.minLength === 1);
console.assert(!('minLength' in schema.properties.name));
```

## 내장 해소기

`resolveReference(schema, options)`는 동기 편의 함수입니다. 콜백이나 스캔 옵션이 필요하면 스캐너와 해소기 생성 함수를 함께 사용합니다. 루트는 생성 시 색인하고, 절대 조회 URI로 등록한 `resources` 문서는 처음 조회할 때 색인합니다. 익명 루트에는 `baseURI`로 주소를 줄 수 있습니다. `$id`는 자원의 기준 URI를 만들며 draft-04는 `id`도 사용합니다. 2019-09와 2020-12에서는 `$anchor`로 정적 조각을 선언합니다. draft-06/07은 조각 이름만 가진 `$id`, draft-04는 `id`도 사용합니다. 앵커와 JSON Pointer는 정규 위치로 해석하므로 같은 위치의 별칭은 같은 순환 정체성을 가집니다. 조각을 한 번 퍼센트 디코딩한 뒤 토큰의 `~1`, `~0`을 해제하며 자기 속성만 따라갑니다.

대상은 호스트 자원에서 의미가 유지되는 사본으로 준비하며, 안전한 이동에 필요하면 참조 문자열을 다시 씁니다. 이 준비는 공개 filter/maxDepth와 무관하게 대상 전체를 조사합니다. 대상·호스트 쌍의 템플릿은 해소기가 캐시하고 인라인 출현마다 복사해 출력의 별칭 공유를 막습니다. 정의 컨테이너는 주소 보관소로 유지합니다.

<!-- example: inline -->

```typescript
import {
  JSONSchemaScanner,
  createReferenceResolver,
} from '@winglet/json-schema';
import type { ReferenceOutcome } from '@winglet/json-schema';

const schema = {
  $id: 'https://schemas.example/root.json',
  properties: { name: { $ref: 'types.json#/$defs/Text' } },
};
const resolver = createReferenceResolver(schema, {
  resources: {
    'https://schemas.example/types.json': {
      $defs: { Text: { type: 'string' } },
    },
  },
});
const outcomes: ReferenceOutcome[] = [];
const scanner = new JSONSchemaScanner({
  options: { resolveReference: resolver },
  visitor: { exit: (entry) => outcomes.push(...(entry.references ?? [])) },
});
const output = scanner.scan(schema).getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.properties.name.type === 'string');
console.assert(outcomes.some((outcome) => outcome.resolved));
console.assert(schema.properties.name.$ref === 'types.json#/$defs/Text');
```

## 비동기 문서 공급

패키지는 스스로 문서를 가져오지 않습니다. 동기 해소기는 루트와 등록 자원만 사용합니다. 비동기 해소기는 등록 자원으로 충족되지 않은 절대 문서 URI를 조각 없이 load에 전달합니다. 없는 문서는 undefined로 반환합니다. 진행 중 요청과 완료·미발견 결과는 해당 해소기에서 URI별로 공유하며 공급 함수의 오류는 전파합니다. 공급 문서 집합이 바뀌면 새 해소기를 만드세요.

`JSONSchemaScannerAsync.scan()`을 기다린 뒤 동기 getValue를 호출합니다. 콜백과 해소기의 resolve는 순차적으로 기다리고 root/child/dialect는 동기입니다. 동기 스캐너는 콜백 반환값을 기다리지 않습니다. async 방문자가 void 콜백 타입에 대입되어도 대기가 필요하면 비동기 스캐너를 사용하세요. 동기 스캐너에 Promise를 돌려주는 사용자 해소기는 잘못된 결과입니다. 가져오기·재시도·인증·취소는 호출자의 공급 함수가 담당합니다.

<!-- example: load -->

```typescript
import {
  JSONSchemaScannerAsync,
  createReferenceResolverAsync,
} from '@winglet/json-schema';
import type { UnknownSchema } from '@winglet/json-schema';

const schema = {
  $id: 'https://schemas.example/root.json',
  properties: { first: { $ref: 'deny.json' }, second: { $ref: 'deny.json' } },
};
const documents: Record<string, UnknownSchema | boolean> = {
  'https://schemas.example/deny.json': false,
};
const requested: string[] = [];
const resolver = createReferenceResolverAsync(schema, {
  load: async (uri) => {
    requested.push(uri);
    return documents[uri];
  },
});
const scanner = new JSONSchemaScannerAsync({
  options: { resolveReference: resolver },
});
await scanner.scan(schema);
const output = scanner.getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(
  output.properties.first === false && output.properties.second === false,
);
console.assert(requested.join(',') === 'https://schemas.example/deny.json');
```

## 사용자 해소기 프로토콜

공개 `ReferenceResolver` 또는 `ReferenceResolverAsync` 타입을 사용합니다. root는 어휘적 문맥을 만들고 선택적인 child는 원래 문서의 자식으로 진입합니다. 문맥이 같으면 같은 객체를 반환하고 child를 생략하면 루트 문맥을 계속 사용합니다. dialect는 유효한 자원 방언을 반환합니다.

resolve는 스키마나 undefined 자체가 아니라 태그 있는 결과를 반환합니다. resolved의 uri는 정규 정체성이므로 같은 대상의 별칭은 같은 uri를 반환해야 순환 추적이 작동합니다. target은 이미 호스트 위치에서 같은 의미여야 하며 엔진은 대상의 식별자 범위로 다시 진입하지 않습니다. 사용자 해소기는 이동·동적 범위 안전성을 책임지므로 이 보장이 필요하면 내장 해소기를 사용하세요. 다음 레지스트리 예제의 정규 대상에는 식별자나 상대 참조가 없습니다.

<!-- example: custom -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema';
import type { ReferenceResolver, UnknownSchema } from '@winglet/json-schema';

const registry = new Map<string, UnknownSchema | boolean>([
  ['urn:example:Text', { type: 'string' }],
]);
const resolver: ReferenceResolver<void> = {
  root: () => undefined,
  dialect: () => '2020-12',
  resolve(reference) {
    const target = registry.get(reference);
    return target === undefined
      ? { status: 'skipped', reason: 'unresolved' }
      : { status: 'resolved', uri: reference, target };
  },
};
const output = new JSONSchemaScanner({
  options: { resolveReference: resolver },
})
  .scan({ $ref: 'urn:example:Text' })
  .getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(output.type === 'string');
```

## 방언과 inert 위치

기본 폴백은 2020-12입니다. 공개된 Dialect 표가 지원 방언에 이름을 붙이며(Dialect.Draft04부터 Dialect.Draft202012까지), 항목의 값은 같은 문자열이므로 방언을 받는 자리에는 어느 표기든 쓸 수 있습니다. `$ref`는 모든 지원 방언에서, `$dynamicRef`는 2020-12에서만, `$recursiveRef`는 2019-09에서만 인식합니다. 인식한 루트·자원 `$schema`가 방언을 정하며 지원 URI의 HTTP/HTTPS와 마지막 # 차이는 정규화합니다. 해소기의 dialects로 사용자 메타스키마 URI를 지원 방언에 매핑할 수 있습니다. 모르는 선언은 둘러싼 방언 또는 폴백을 따릅니다. 내장 자원은 알려진 선언이 없으면 부모의 방언을 잇습니다. 해소기를 사용하면 그 폴백도 설정하세요. 스캐너의 defaultDialect는 해소기가 방언을 공급하지 않을 때의 폴백입니다.

순회는 draft-04·draft-06·draft-07·2019-09·2020-12의 스키마 위치 합집합을 사용합니다. 해소나 변형이 없을 때 `$schema`는 방문 경로·순서 대신 inert 여부를 바꿉니다. 해당 방언의 스키마 위치가 아닌 노드와 그 후손은 inert=true이며 콜백은 실행하지만 참조·출력 연산을 억제하고 식별자를 색인하지 않습니다. draft-04에서는 boolean 잎도 inert입니다. contains는 draft-06부터, prefixItems는 2020-12에서, 튜플 형태 items는 2019-09까지 활성입니다. 현대 방언에서도 definitions와 스키마 값 dependencies는 스키마 위치이고 문자열 배열 dependencies는 스키마가 아닙니다.

<!-- example: inert -->

```typescript
import { JSONSchemaScanner } from '@winglet/json-schema';

const inactive: string[] = [];
new JSONSchemaScanner({
  options: { defaultDialect: 'draft-04' },
  visitor: {
    enter: (entry) => {
      if (entry.inert) inactive.push(entry.path);
    },
  },
}).scan({ contains: { type: 'string' }, additionalProperties: false });
console.assert(inactive.includes('#/contains'));
console.assert(inactive.includes('#/additionalProperties'));
```

## 어휘 선택

기본 어휘는 합성·조건·객체/배열 applicator·정의 컨테이너·스키마 값 dependencies를 포함합니다. keywords는 전체를 대체하고 additionalKeywords는 선택된 어휘 뒤에 덧붙입니다. 중복은 마지막 서술자의 종류와 위치가 이깁니다. 서술자 dialects는 발견 여부 대신 inert 여부를 정합니다. objectMap은 키를 dataPath에 덧붙이고 schemaMap은 덧붙이지 않습니다. 스키마 목록은 컨테이너 대신 원소를 방문합니다.

색인·이동 검사·공개 순회가 일치하도록 내장 해소기와 스캐너에 같은 어휘 옵션을 주세요. 편의 함수 resolveReference는 어휘를 양쪽에 전달합니다. 사용자 키워드 이름과 맵 키도 JSON Pointer로 이스케이프합니다.

<!-- example: keywords -->

```typescript
import {
  JSONSchemaScanner,
  createReferenceResolver,
} from '@winglet/json-schema';
import type { KeywordDescriptor } from '@winglet/json-schema';

const additionalKeywords: KeywordDescriptor[] = [
  { keyword: 'x/schema', kind: 'schema' },
];
const schema = {
  'x/schema': { type: 'string' },
  properties: { value: { $ref: '#/x~1schema' } },
};
const resolver = createReferenceResolver(schema, { additionalKeywords });
const visited: string[] = [];
const output = new JSONSchemaScanner({
  options: { additionalKeywords, resolveReference: resolver },
  visitor: { enter: (entry) => visited.push(entry.path) },
})
  .scan(schema)
  .getValue();
if (!output || typeof output === 'boolean')
  throw new Error('Expected an object root');
console.assert(visited.includes('#/x~1schema'));
console.assert(output.properties.value.type === 'string');
```

## 참조 보존과 형제 키워드

정의 바깥의 인라인 가능한 체인은 끝까지 처리하고, 참조 정체성은 현재 조상 경로에서만 활성입니다. 같은 대상을 쓰는 독립 형제는 각각 처리합니다. 결과를 감사하려면 exit의 entry.references를 순회하세요. 각 결과는 작성된 reference와 keyword, 알 수 있으면 정규 uri, resolved 및 보존 이유 skipped를 담습니다. 공개된 ReferenceSkipReason 표가 모든 skipped 값에 이름을 붙입니다(예: ReferenceSkipReason.Relocation).

| skipped      | 의미                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `definition` | 해소기를 쓰는 순회에서 정의 컨테이너 또는 그 후손의 참조입니다. 정의는 주소 보관소로 유지합니다. |
| `cycle`      | 인라인 가능한 정규 대상이 현재 조상 경로에서 이미 활성입니다.                                    |
| `unresolved` | 해소기가 없거나 주소·문서를 찾지 못했습니다.                                                     |
| `dynamic`    | 동적 앵커나 recursive anchor가 필요한 조회이므로 정적으로 고정하지 않습니다.                     |
| `relocation` | 대상을 호스트로 옮겨도 의미와 기존 주소를 보존함을 보장할 수 없습니다.                           |
| `invalid`    | 대상이나 합성 위치가 인라인에 유효하지 않습니다. 잘못된 프로토콜 반환과는 구분합니다.            |

unresolvedReference의 기본은 keep이며 throw는 unresolved 결과만 실패시킵니다. 다른 보존 이유까지 제거하는 옵션은 아닙니다. inert 위치에서는 참조를 처리하지 않아 결과가 없을 수 있습니다.

### draft-07 이하

`$ref`의 형제는 평가에서 무시됩니다. 참조를 남겨도 형제의 자식은 방문하며, definitions와 $defs 아래는 평소의 정의 위치이고 다른 형제의 후손은 inert입니다. 그 inert 영역의 식별자는 색인하지 않습니다. `$ref` 노드 자체의 형제 식별자도 무시합니다.

인라인 전에 다른 자기 키를 분류합니다. `$schema`, definitions, $defs는 유지합니다. 그 외 키는 값이 문자열·숫자·null일 때만 버립니다. 어느 키 아래든 boolean·객체·배열이면 기존 포인터 주소를 없애거나 무시되던 평가를 활성화할 수 있어 참조를 relocation으로 남깁니다. 유지할 키만 있으면 `{ ...유지할 키, allOf: [대상 사본] }`으로 감싸고, 남길 키도 없으면 노드를 대상 사본으로 교체합니다.

<!-- example: relocation -->

```typescript
import {
  JSONSchemaScanner,
  createReferenceResolver,
} from '@winglet/json-schema';

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/Text',
  hidden: false,
  definitions: { Text: { type: 'string' } },
};
const reasons: string[] = [];
const output = new JSONSchemaScanner({
  options: { resolveReference: createReferenceResolver(schema) },
  visitor: {
    exit: (entry) => {
      for (const outcome of entry.references ?? [])
        if (outcome.skipped) reasons.push(outcome.skipped);
    },
  },
})
  .scan(schema)
  .getValue();
console.assert(output === schema);
console.assert(reasons.includes('relocation'));
```

### 2019-09 이상

형제는 유지하고 적용합니다. 다른 키가 없는 단일 참조는 교체하고, 나머지는 인라인한 키워드만 빼고 대상 가지를 기존 allOf 끝에 붙입니다. 기존 allOf가 배열이 아니면 invalid로 보존합니다.

### 내장 해소기의 이동 경계

다음 조건에서는 원래 참조를 보존합니다.

- 대상이 inert 또는 인식되지 않은 스키마 위치에 있거나 그 아래인 경우
- 이동으로 대상 또는 제거할 자원 경계의 방언이 호스트와 달라지는 경우
- 다시 쓸 사본에 `$recursiveRef`가 있거나 제거할 자원이 `$dynamicAnchor`/`$recursiveAnchor` 범위를 가진 경우
- 인식한 스키마 위치와 default/const/enum/examples 데이터 바깥의 참조·식별자를 안전하게 다시 쓸 수 없는 경우
- URI 재작성이 불가능하거나 다른 자원에서 주소 없는 익명 문서를 가리켜야 하는 경우

같은 자원의 식별자 없는 대상은 단순 복사가 가능합니다. 다른 이동은 식별자 경계를 제거하고 참조 URI를 원래 기준에서 다시 씁니다. 데이터 키워드 값은 다시 쓰지 않습니다. `$dynamicRef`의 첫 조각이 `$dynamicAnchor`로 선언된 것이면 dynamic으로 남고, 그 외에는 `$ref`처럼 동작합니다. `$recursiveRef`는 대상에 `$recursiveAnchor`:true가 있으면 dynamic으로 남습니다.

계층이 없는 기준 URI에서는 상대 문서 경로를 구성할 수 없습니다. 절대 참조 또는 계층적인 baseURI를 제공하세요. 이 예제는 미해결 결과를 보여 줍니다.

<!-- example: opaque -->

```typescript
import { createReferenceResolver } from '@winglet/json-schema';

const schema = { $ref: 'child.json' };
const resolver = createReferenceResolver(schema, {
  baseURI: 'urn:example:root',
  resources: { 'urn:example:child.json': { type: 'string' } },
});
const context = resolver.root(schema);
const relative = resolver.resolve('child.json', '$ref', context);
const absolute = resolver.resolve('urn:example:child.json', '$ref', context);
console.assert(
  relative.status === 'skipped' && relative.reason === 'unresolved',
);
console.assert(absolute.status === 'resolved');
```

## 상한과 오류

limits.referenceChain은 한 위치의 교체 체인을 기본 32로, limits.inlinedNodes는 스캔에서 인라인되는 전체 스키마 노드를 기본 1,000,000으로 제한합니다. 이는 maxDepth와 별개이고 공개 방문에서 잘린 대상의 전체 준비도 수행할 수 있습니다.

JSONSchemaScanError의 code로 실패를 구분합니다. 공개된 JSONSchemaScanErrorCode 표가 모든 code에 이름을 붙이므로, 문자열을 직접 쓰지 말고 JSONSchemaScanErrorCode.SchemaCycle 같은 항목과 비교합니다. 사용자 콜백과 load의 예외는 그대로 전파됩니다.

| code                      | 의미                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| `duplicate-identifier`    | 서로 다른 위치가 같은 식별자를 선언했습니다.                                 |
| `reference-chain-limit`   | 한 위치의 교체 체인 상한을 넘었습니다.                                       |
| `inlined-node-limit`      | 스캔의 인라인 노드 상한을 넘었습니다.                                        |
| `unresolved-reference`    | throw 정책에서 참조를 찾지 못했습니다.                                       |
| `invalid-resolver-result` | 프로토콜 태그·URI·대상이 잘못되었거나 동기 해소기가 thenable을 반환했습니다. |
| `identifier-mutation`     | mutate가 현재 노드의 식별자 키워드를 바꿨습니다.                             |
| `schema-cycle`            | 순회 또는 평범한 컨테이너 복제에 물리 순환이 있습니다.                       |
| `scan-in-progress`        | 실행 중 같은 인스턴스의 scan/getValue를 호출했습니다.                        |

<!-- example: errors -->

```typescript
import {
  JSONSchemaScanError,
  JSONSchemaScanErrorCode,
  JSONSchemaScanner,
} from '@winglet/json-schema';

const scanner = new JSONSchemaScanner({
  options: { unresolvedReference: 'throw' },
});
let caught = false;
try {
  scanner.scan({ $ref: '#/missing' });
} catch (error) {
  if (!(error instanceof JSONSchemaScanError)) throw error;
  caught = true;
  console.assert(error.code === JSONSchemaScanErrorCode.UnresolvedReference);
}
console.assert(caught && scanner.getValue() === undefined);
```

## 깊이 안전의 범위

순회와 평범한 객체·배열의 복제는 호출 스택 재귀를 사용하지 않습니다. 반복 별칭은 순환으로 보지 않고, 실제 조상 순환은 schema-cycle입니다. 희소 배열의 구멍과 자기 **proto** 데이터 키는 유지하고 평범한 컨테이너의 symbol 키는 복사하지 않습니다. 비평범한 값은 범용 복제기로 위임하므로 클래스 인스턴스·사용자 getter·콜백·공급 함수까지 깊이 안전을 보장하는 것은 아닙니다. 깊이 자체의 고정 상한 대신 메모리와 명시한 참조 예산이 적용됩니다. 데이터 키워드 안의 순환은 실제로 사본을 만들 때 발견될 수 있으며, 변환 없는 getValue는 복제 없이 입력을 반환합니다.

## 스키마 가드와 추론

가드는 type을 판별합니다. 겸용 가드는 nullable 배열 표기와 일반 타입을 모두 받고 number 가드는 integer도 받습니다. nullable 전용 가드는 type 배열의 null을 확인하며, OpenAPI nullable:true는 가드의 기준이 아닙니다. 비교 함수는 별도 정책으로 OpenAPI nullable:true를 정규화합니다. hasNullInType은 순수 type:null이 아니라 배열 안의 null을 검사합니다.

<!-- example: guards -->

```typescript
import {
  hasNullInType,
  isCompatibleSchemaType,
  isIdenticalSchemaType,
  isStringSchema,
} from '@winglet/json-schema/filter';

console.assert(isStringSchema({ type: ['string', 'null'] }));
console.assert(!hasNullInType({ type: 'null' }));
console.assert(
  isIdenticalSchemaType(
    { type: ['string', 'null'] },
    { type: 'string', nullable: true },
  ),
);
console.assert(!isIdenticalSchemaType({ type: 'number' }, { type: 'integer' }));
console.assert(isCompatibleSchemaType({ type: 'number' }, { type: 'integer' }));
```

리터럴 정보를 유지하려면 as const를 사용하세요. InferValueType은 부분 값을 위한 모델이므로 required를 포함한 객체 키는 optional이고, additionalProperties:false가 없으면 열린 객체입니다. 읽기 전용 스키마에서도 값은 가변입니다. 적용하지 않는 합성·참조 제약을 정적으로 검증했다고 가정하지 말고, 검증된 필수 형태가 필요하면 별도 값 타입과 검증을 사용하세요. InferJSONSchema는 값 타입에서 스키마 계열을 선택하며 객체의 properties를 자동 생성하지 않습니다.

<!-- example: types -->

```typescript
import type { InferJSONSchema, InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: { id: { type: 'number' } },
  required: ['id'],
  additionalProperties: false,
} as const;
type Value = InferValueType<typeof schema>;
const partial: Value = {};
partial.id = 1;
const nameSchema: InferJSONSchema<string> = { type: 'string', minLength: 1 };
console.assert(nameSchema.type === 'string');
```

유한한 prefixItems는 optional 위치의 가변 튜플입니다. items:false는 닫고, 생략/true는 any[] rest, 스키마는 접두부 뒤 rest의 형을 정합니다. minItems는 추론에 쓰지 않습니다. 넓어진 prefixItems와 구식 items 배열은 이 유한 튜플 추론 대상이 아니며, 모델링하지 않은 형태는 넓은 폴백을 사용합니다. 재귀 타입은 TypeScript의 일반적인 인스턴스화 한도를 확장하지 않습니다.

<!-- example: tuple -->

```typescript
import type { InferValueType } from '@winglet/json-schema';

const schema = {
  type: 'array',
  prefixItems: [{ type: 'string' }, { type: 'number' }],
  items: false,
} as const;
type Pair = InferValueType<typeof schema>;
const empty: Pair = [];
const pair: Pair = ['name', 1];
pair[0] = 'changed';
console.assert(empty.length === 0 && pair[0] === 'changed');
```
