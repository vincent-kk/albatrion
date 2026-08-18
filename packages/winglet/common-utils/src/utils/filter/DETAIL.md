# filter contract

## Requirements

- 모든 `isX` 함수는 어떤 입력(순환 참조나 프로토타입이 오염된 객체 포함)에도 예외를 던지지 않고 boolean을 반환한다.
- 대상 전역(`Blob`/`Buffer`/`File`/`SharedArrayBuffer`)이 없는 실행 환경에서도 관련 판별자는 예외 없이 `false`를 반환한다.
- own-속성 기반 판별(`isEmpty`/`isEmptyObject`/`isEmptyPlainObject`)은 `Object.prototype`에 나중에 추가된 속성의 영향을 받지 않는다.

## API Contracts

- `isEmpty(value)`: `null`/`undefined`는 true, 함수는 항상 false. 객체가 아닌 원시값은 `isFalsy` 판정에 위임한다. `Map`/`Set`은 `size === 0`로 판단하고, 그 외 객체는 own enumerable 키가 하나도 없을 때만 true다.
- `isEmptyObject(value)`: own enumerable 키 유무만 확인한다 — `Date`/`Error`/`Map`/`Set`/`WeakMap`/`WeakSet`/`Promise` 인스턴스도 own enumerable 키가 없어 true를 반환한다(문서화된 성능 트레이드오프이며 고칠 계획이 없다).
- `isEmptyPlainObject(value)`: `isPlainObject` 판정을 먼저 통과해야 하므로 위 내장 타입 전부에 false를 반환하는, 더 느리지만 정확한 대안이다.
- `isPlainObject(value)`: 프로토타입이 `null`이거나 `Object.prototype`이거나 그 조부모가 `null`이며, 내부 타입 태그가 `[object Object]`인 경우만 true다 — 커스텀 `Symbol.toStringTag`를 가진 객체는 제외된다.
- `isArrayIndex(value)`: 문자열의 모든 문자가 숫자 문자 코드인지만 검사한다 — 선행 0과 `uint32` 상한을 넘는 문자열도 true이며, 부호·소수점·지수 표기·전각 숫자·공백은 모두 false다.
- `isCloneable(value)`: 내부 타입 태그가 화이트리스트(Object/Array/Date/RegExp/Map/Set/TypedArray류/ArrayBuffer/DataView/Boolean/Number/String/Symbol/Arguments)에 속할 때만 true다 — 함수·WeakMap·WeakSet은 false다.
- `isBuffer`/`isBlob`/`isFile`/`isSharedArrayBuffer`: 대상 전역 생성자를 모듈 스코프에서 한 번 캡처해 두고 `undefined` 가드를 거친 뒤 `instanceof`로 판별한다. `isFile`은 추가로 `isBlob` 결과를 재사용한다.
- `isFalsy`/`isTruthy`: `!value`/`!!value` 그대로이며, boxed primitive(`new Boolean(false)` 등)는 객체이므로 truthy로 취급된다.

## Acceptance Criteria

### empty-prototype-pollution-safety — 빈 값 판별의 프로토타입 오염 내성

- `Object.prototype`에 임의 속성을 추가해도 own 키가 없는 `{}`/`Object.create(null)`은 `isEmptyObject`·`isEmptyPlainObject` 모두에서 여전히 true다.
- own 속성이 있는 객체는 오염 여부와 무관하게 항상 false다.

### empty-object-vs-plain-tradeoff — isEmptyObject·isEmptyPlainObject의 트레이드오프

- `isEmptyObject(new Date())`/`new Error()`/`new Map()`/`new Set()`/`new WeakMap()`/`new WeakSet()`/`new Promise(...)`는 모두 true를 반환한다(own enumerable 키가 없기 때문이며, 성능을 위해 고치지 않기로 한 알려진 사례).
- 동일한 입력 전부에서 `isEmptyPlainObject`는 false를 반환한다.

### array-index-digit-only — isArrayIndex의 자릿수 전용 검사

- `'0'`/`'00'`/`'4294967295'`/`'4294967296'`은 모두 true다(선행 0과 `uint32` 상한 초과 모두 허용, 값 범위는 검증하지 않는다).
- 빈 문자열, `'+1'`, `'1.0'`/`'1.'`, `'1e3'`/`'1e5'`, 전각 숫자 `'１２３'`, `'Infinity'`/`'NaN'`/`'null'`/`'undefined'`, 앞뒤에 문자가 섞인 문자열은 모두 false다.

### falsy-boxed-primitive — isFalsy의 박싱된 원시값 처리

- `false`/`null`/`undefined`/`''`/`0`/`-0`/`NaN`/`0n`은 true다.
- `new Boolean(false)`/`new String('')`/`new Number(0)`은 객체이므로 false를 반환한다(즉 truthy로 판정된다) — `valueOf`/`toString`이 falsy값을 반환해도 마찬가지다.

### blob-environment-guard — isBlob의 환경 가드

- 실제 `Blob` 인스턴스는 true, `null`/`undefined`/일반 객체/배열/`ArrayBuffer`는 false다.
- 전역 `Blob`을 `undefined`로 스텁한 상황에서도 예외 없이 false를 반환한다.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 함수당 한 파일의 flat 컬렉션이 이 fractal의 정본 형태다 — 40개 판별자가 각각 독립적인 tree-shaking 단위로 남아야 한다. 이미 형제 fractal의 내부 파일(array의 `chunk.ts`, object의 `clone.ts`/`cloneLite.ts`/`merge.ts`/`removeUndefined.ts`/`shallowClone.ts`/`stableSerialize.ts`)이 진입점(`index.ts`)이 아니라 개별 판별자 파일을 직접 가져다 쓰고 있다 — 배럴을 거치면 40개 판별자 전체의 재수출 그래프가 번들에 딸려오기 때문이며, 이 직접 import는 이미 정착된 관행이다. zero-peer 승인은 `.filid` 설정의 scoped exempt(common-utils 전체)와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
