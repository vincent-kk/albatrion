# filters contract

## Requirements

- 각 판별자는 인자로 받은 스키마 객체를 변경하지 않고 boolean을 반환하며, TypeScript 타입가드로 좁혀진 타입을 제공한다.
- nullable 계열 판별자는 `type`이 배열이고 그 배열에 `'null'`이 포함된 경우에만 true를 반환한다 — 단일 `'null'` 타입은 nullable로 취급하지 않는다.
- `isCompatibleSchemaType`은 `number`/`integer`를 서로 호환 타입으로, `[...types, 'null']`을 `[...types]`와 호환으로 취급하며 좌우 인자 순서에 대해 대칭이다.
- `isIdenticalSchemaType`은 JSON Schema 배열 `type` 표기와 OpenAPI 3.0 `nullable: true` 표기를 동등하게 비교하고, 배열 `type`은 순서·중복 개수와 무관하게 원소 집합이 같으면 동일로 판정한다.

## API Contracts

- `is<Type>Schema(schema)` / `isNonNullable<Type>Schema(schema)` / `isNullable<Type>Schema(schema)`: 각각 `schema is <Type>Schema` 타입가드다. 겸용 판별자는 non-nullable과 nullable 판별자의 논리합이다.
- `isCompatibleSchemaType(left, right)`: 두 스키마의 `type`이 호환되면 true를 반환한다. 둘 중 하나라도 `type`이 없으면 false, `type: []`(빈 배열)은 무엇과도 호환되지 않는다.
- `isIdenticalSchemaType(left, right)`: 두 스키마의 `type`(및 nullable 표기)이 사실상 동일하면 true를 반환한다.
- `hasNullInType(schema)`: `type`이 배열이고 `'null'`을 포함하면 true를 반환한다 — 내부 `utils` organ 소유, 이름으로 재수출.

## Acceptance Criteria

### type-compatibility — 스키마 타입 호환성 비교

- 동일한 단일 타입, `number`/`integer` 상호 호환(양방향), `type`이 없는 경우 false, `type: []`끼리도 false로 판정됨을 검증한다.
- `[...types, 'null']`과 `[...types]`, 단일 타입과 `[type]`, 단일 타입과 `[type, 'null']`이 순서와 무관하게 호환으로 판정됨을 검증한다.

### type-identity — 스키마 타입 동일성 비교

- 동일한 단일 타입은 true, 다른 단일 타입이거나 `type`이 없으면 false로 판정됨을 검증한다.
- 배열 `type`은 순서가 달라도 원소 집합과 길이가 같으면 동일로, 길이가 다르거나 원소가 다르면 다른 것으로 판정된다.
- 단일 타입과 원소 1개짜리 배열 타입은 동일로, `nullable: true`와 `[type, 'null']`은 동등하게 판정되지만 단일 `'null'`과 `[type, 'null']`은 다른 것으로 판정된다.

## Boundary Exemptions

### `*.ts` — 스키마 타입별 flat 판별자 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 스키마 타입별 판별자 파일이 root에 flat하게 놓여 있고, 각 파일은 해당 타입의 base·nullable·겸용 세 변형을 함께 export한다. organ으로 재배치하면 한 타입의 세 변형이 서로 다른 위치로 흩어져 오히려 응집도가 깨진다. 배럴 경유 시 재수출 그래프가 번들에 그대로 딸려오므로, 개별 판별자만 필요한 소비자의 직접 import도 같은 이유로 허용된다.

## Last Updated

2026-08-18 — 최초 계약 작성
