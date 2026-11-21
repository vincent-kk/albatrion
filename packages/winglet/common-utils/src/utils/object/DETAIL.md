# object contract

## Requirements

- 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)을 불투명한 문자열, 즉 own 데이터 속성으로 취급하는 접근 프리미티브를 제공한다.
- 어떤 프리미티브 호출에서도 대상 객체의 프로토타입과 상속 객체(`Object.prototype` 포함)는 변경되지 않는다.
- 예약 멤버가 아닌 키에 대해서는 일반 프로퍼티 접근과 동일하게 동작하고, 배열 인덱스 접근을 방해하지 않는다.
- `clone`과 `cloneLite`는 own `__proto__` 키를 가진 입력의 클론에서 그 키를 열거 가능한 own 데이터 속성으로 보존하고, 클론의 프로토타입은 입력의 프로토타입과 동일하다.
- 재귀 병합은 merge 자식 모듈이 소유합니다. 부모는 공개 병합 API를 재수출하고 안전한 속성 프리미티브를 제공하며, 병합의 세부 계약은 자식 DETAIL을 따릅니다.

- `shallowClone`과 `removeUndefined`는 prototype-free dictionary의 null 프로토타입을 유지하여 없는 키가 상속된 멤버로 바뀌지 않게 합니다.

- `removeUndefined`와 `sortObjectKeys`도 예약 키를 자기 데이터 속성으로 복사하고 중첩 결과의 프로토타입을 바꾸지 않습니다.
- `sortObjectKeys`가 만드는 사전은 입력이 null 프로토타입이면 같은 null 프로토타입을 사용합니다. 순서만 바꾸는 작업이 없는 키의 상속 조회를 새로 만들지 않습니다.

## API Contracts

- `isReservedName(key)`:
  - 예약 멤버 이름 세 가지에 대해서만 true를 반환한다. 오탐 없이 정확히 세 문자열만 판별하는 것이 계약이다.
  - 성능 민감 순회 루프가 "예약 멤버일 때만 프리미티브 경유" 분기를 만들 때 쓰는 공유 판별자다 — 소비자는 판별을 복제하지 않고 이것을 재사용한다.
- `getDataProperty(target, key)`:
  - key가 예약 멤버면 own 속성일 때만 그 값을 반환하고, own이 아니면 프로토타입 체인을 탐색하지 않고 `undefined`를 반환한다.
  - key가 예약 멤버가 아니면 `target[key]` 일반 접근과 동일하다.
- `setDataProperty(target, key, value)`:
  - key가 예약 멤버면 `__proto__` setter를 트리거하지 않고 열거 가능·쓰기 가능·구성 가능한 own 데이터 속성을 만든다. 대상의 프로토타입은 변하지 않는다.
  - key가 예약 멤버가 아니면 `target[key] = value` 일반 대입과 동일하다.
- `deleteDataProperty(target, key)`:
  - own 속성만 제거한다(JS `delete` 의미론). 예약 멤버 key로 호출해도 프로토타입 체인의 속성은 제거되지 않으며, 반환값은 `delete` 연산 결과와 같다.
- `clone(target, maxDepth?)`:
  - 일반 객체·배열로 이루어진 그래프는 순환을 포함해 깊은 입력도 명시적 프레임으로 복제합니다. 깊이 제한은 전체 루트에서 계산하고 경계의 값은 참조로 유지합니다. 재귀 및 프레임 탐색 모두 한 분기를 끝까지 방문한 뒤 다음 분기로 이동해, 제한 안의 공유 참조는 먼저 방문한 깊이를 기준으로 복제합니다. 사용자 getter·생성자·Proxy와 내장 객체만으로 이어지는 깊은 경로의 호출 스택은 이 보장 밖입니다.
  - Array·Date·RegExp·Map·Set의 하위 클래스도 원래 프로토타입과 내장 슬롯을 유지합니다. 원래 프로토타입의 생성자가 그 프로토타입을 직접 선언하면 기본 내장 생성자를 Reflect.construct로 호출하고, 하위 클래스 생성자 본문은 실행하지 않습니다. 검증할 수 없는 프로토타입은 내장 슬롯을 만든 뒤 프로토타입을 복원합니다. Map·Set 하위 클래스는 기본 내장 반복자로 모든 내부 항목을 복제합니다. 사용자 반복자의 필터는 원본과 클론의 외부 순회에만 적용합니다. 추가 own 속성의 기존 복제 범위는 바꾸지 않습니다.
  - own `__proto__` 키는 상속된 키이므로 열거 가능한 own 데이터 속성으로 정의되어 복제된다 — 프로토타입 대입이 아니다. 그 값은 다른 키와 같은 규칙으로 깊은 복제된다.
  - 새로 만든 복제 대상에서는 프로토타입 체인이 대입을 가로채지 않는 키를 일반 대입으로 복사한다. 체인이 가로채는 키(`__proto__`, 상속 접근자, 상속 읽기 전용 속성)는 상속된 setter를 실행하지 않도록 열거 가능·쓰기 가능·구성 가능한 own 데이터 속성으로 정의한다. 내장 객체의 복제처럼 대상이 이미 own 속성을 가질 수 있으면 대상의 키를 직접 확인하고, 대상의 own 키는 쓰기 가능할 때만 대입한다.
  - 가로채는 키 목록과 박스 프로토타입 경유 여부는 프로토타입마다 한 번 계산해 모듈 상태에 캐시한다. `Object.prototype`과 `null`은 조회 없이 `__proto__`만 가로챈다고 본다. 이 캐시 덕분에 일반 객체와 클래스 인스턴스의 키 경로에 키마다의 체인 조회가 더해지지 않는다. 알려진 한계: 캐시는 무효화되지 않는다. 어떤 프로토타입을 처음 복제한 뒤 그 체인에 추가된 setter·getter·읽기 전용 속성은 보이지 않으므로, 이후 복제는 그 키를 대입한다. 그래서 추가된 setter는 실행되고, 추가된 getter 전용 접근자나 읽기 전용 속성은 `clone`이 `TypeError`를 던지게 한다. 체인에서 제거된 접근자는 같은 결과를 내는 정의로 처리된다. 무효화 대신 키마다 체인을 조회하면 클래스 인스턴스 복제가 약 6% 느려져 이 한계를 택했다.
  - 박싱된 Number·String·Boolean은 같은 원시값과 프로토타입을 가진 새 박스로 복제한다. 프로필 계산은 체인의 각 프로토타입을 타입 태그로 판별하므로 다른 realm의 박스 프로토타입도 박스로 인식하고, 값의 박스 여부는 이런 체인을 가진 입력에서만 값의 타입 태그로 확인한다. 태그만 위조되어 원시값 슬롯이 없는 값은 박스로 만들지 않고 일반 객체처럼 복제한다.
  - Error의 자기 cause와 errors는 깊게 복제하며 원래 열거 가능 여부를 보존합니다. 복제 범위에 속하는 모든 자기 속성의 열거 가능 여부는 로컬과 다른 realm에서 같습니다. 비열거 메타데이터를 새 열거 표면으로 드러내거나 열거 가능한 메타데이터를 숨기지 않습니다.
  - `AggregateError`는 `message`와 함께 `errors`를 깊게 복제하며 생성자의 인자 규칙을 유지합니다. 다른 Error는 생성자에 `message`만 넘깁니다. 생성자가 만든 속성의 열거성은 원본의 복제 대상 속성에 맞춥니다.
- `cloneLite(target, maxDepth?)`:
  - 깊은 비순환 객체·배열은 명시적 작업 프레임으로 복제해 호출 스택의 한도에 묶이지 않습니다. 유한한 깊이 제한이 없으면 현재 경로의 순환에 RangeError를 던집니다. 유한한 깊이 제한은 원본 루트에서 계산하고 경계 밖 값은 참조를 유지합니다.
  - own `__proto__` 키는 데이터 속성으로 복제된다 — 프로토타입 대입이 아니다.
  - `maxDepth`, 희소 배열, 중첩 구조, 비지원 타입 참조 반환 동작은 기존 계약 그대로다.
  - 일반 키 경로의 성능이 존재 이유다: 예약 멤버 분기는 키가 `__proto__`일 때만 발생한다.

merge가 조상의 안전한 속성 프리미티브를 읽고 부모가 merge를 재수출하는 집계 왕복은 저장소 원칙 4의 위로 열린 참조입니다. 개별 파일 의존을 유지하면서 두 소유 경계만 순환 판정에서 예외로 두며, 프리미티브가 merge 구현에 역으로 의존하도록 바꾸지 않습니다.

## Acceptance Criteria

### clone-reserved — clone 예약 멤버 정합

- own `__proto__`를 가진 입력의 클론이 그 키를 한 단계와 두 단계 중첩 모두에서 열거 가능한 own 키로 보존하고 프로토타입이 `Object.prototype`이다.
- 복제된 `__proto__` 값은 원본과 참조를 공유하지 않는다.
- 기존 clone 스위트가 전량 통과하고, 일반 키 경로 bench에 유의미한 회귀가 없다.

다른 realm의 내장 객체도 슬롯이 있는 새 값으로 복제합니다. Date·RegExp·Map·Set·ArrayBuffer·SharedArrayBuffer·DataView·Error와 AggregateError의 슬롯을 보존하고, 컬렉션의 순환 참조는 복제 캐시로 연결합니다. 슬롯이 없는 위조 태그는 일반 객체 복제를 유지합니다. Error 태그도 생성자를 호출하기 전에 네이티브 Error 생성자를 잇는 프로토타입 계보를 확인하므로 태그만 지정한 평범한 객체나 클래스의 생성자를 실행하지 않습니다. 명시적인 Error 태그를 가진 실제 Error 하위 형은 계보와 생성자 의미를 유지합니다. 변경 가능한 name 속성으로 AggregateError를 판정하지 않으며, 원래 프로토타입 계보에 맞는 생성자 인자를 전달합니다. 슬롯 없는 Error 태그 객체는 isCloneable의 지원 태그가 아니어도 이 복제 함수 안에서 평범한 객체로 복제합니다. Map·Set·Date·RegExp의 추가 own 속성은 로컬 realm과 마찬가지로 복제 범위가 아닙니다. Blob·File 생성자가 새 객체에 만든 호스트 내부 symbol은 원본에서 덮어쓰지 않으므로 바이트 읽기가 유지됩니다. vm에는 Web API 생성자가 없으므로 Blob·File의 vm 검증은 호스트 생성자를 전달한 하위 클래스로 수행합니다.

### clone-fidelity — clone 내장 상태와 상속 속성 정합

- 상속 setter를 가리는 own 데이터 속성은 setter를 실행하지 않고 같은 값의 own 데이터 속성으로 복제된다.
- 박싱된 원시값의 복제는 같은 `valueOf()` 값을 내고, `AggregateError`의 복제는 `message`와 복제된 `errors`를 유지한다.

### serialization-surface — 직렬화 공개 경계

- 일반 JSON 직렬화는 플랫폼 API를 사용하고, 패키지는 graph codec과 목적별 fingerprint 생성기만 object/root에서 이름을 명시한 내보내기로 제공합니다. 별도 package subpath는 추가하지 않습니다.
- graph token 생성은 serialization 내부가 소유하며 fingerprint runtime은 graph encoder나 parser에 의존하지 않습니다.
- 0.16.0에서 제거한 범용 serializer 이름과 구현 helper는 공개 object/root 배럴에 노출하지 않습니다.

### reserved-primitives — 예약 멤버 접근 프리미티브 (RC-7)

- 예약 멤버 3종 × (읽기·쓰기·삭제) × (own 있음·없음) 전 조합에서 own 데이터 속성 의미론을 지킨다.
- 읽기는 체인으로 넘어가지 않고, 쓰기는 대상 프로토타입을 바꾸지 않으며, `Object.prototype`은 오염되지 않는다.
- 일반 키와 배열 인덱스는 일반 접근과 동일하게 동작한다.

### clone-lite-reserved — cloneLite 예약 멤버 정합 (RC-4 단위)

- own `__proto__`를 가진 입력의 클론이 모든 own 키를 보존하고 프로토타입이 입력과 동일하다.
- 기존 cloneLite 스위트(깊이 제한, 희소 배열, 중첩)가 전량 통과한다.
- 일반 키 경로 bench에 유의미한 회귀가 없다.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 함수당 한 파일의 flat 컬렉션이 이 fractal의 정본 형태다 — 하위 organ 재배치는 배럴 깊이만 늘리고 tree-shaking 단위를 바꾸지 못한다. 배럴 경유 시 재수출 그래프가 번들에 딸려오므로, 개별 파일이 필요한 소비자의 직접 import도 같은 이유로 허용된다.

### `getDataProperty.ts` — merge 내부의 안전한 읽기

- **Consumers**: `**/packages/winglet/common-utils/src/utils/object/merge/utils/mergeWithOptions.ts`, `**/packages/winglet/common-utils/src/utils/object/merge/__benchmarks__/merge-restructure/createMergeImplementation.ts`
- **Direct import**: `allowed`
- **Reason**: object 진입점은 merge를 재수출하므로 merge 재귀 구현이 그 진입점을 가져오면 순환 의존이 생깁니다. 측정 로더도 같은 함수 참조를 주입해야 하므로 직접 읽습니다.

### `setDataProperty.ts` — merge 내부의 안전한 쓰기

- **Consumers**: `**/packages/winglet/common-utils/src/utils/object/merge/utils/mergeWithOptions.ts`, `**/packages/winglet/common-utils/src/utils/object/merge/__benchmarks__/merge-restructure/createMergeImplementation.ts`
- **Direct import**: `allowed`
- **Reason**: object 진입점은 merge를 재수출하므로 merge 재귀 구현이 그 진입점을 가져오면 순환 의존이 생깁니다. 측정 로더도 같은 함수 참조를 주입해야 하므로 직접 읽습니다.

## Known Limits

- Error 하위 클래스는 기록된 Error 생성자 정책에 따라 생성자 본문을 한 번 실행합니다. 원래 생성자의 초기화 의미와 AggregateError의 인자 규칙을 유지하기 위한 선택입니다. 생성자 실행을 피해야 하는 호출자는 필요한 message·name·stack·cause 데이터를 기본 Error에 명시적으로 옮긴 뒤 복제합니다.
- ArrayBuffer 하위 클래스는 기본 slice·species를 통해 생성자 본문을 한 번 실행합니다. 이를 피하려면 기본 Uint8Array 뷰의 slice로 바이트를 기본 ArrayBuffer에 복사한 뒤 복제합니다.
- TypedArray 하위 클래스는 기본 slice·species에서 생성자 본문을 한 번 실행하며 프로토타입과 선택된 바이트를 보존합니다. 결과의 byteOffset은 0입니다. 정확한 프로토타입 확인은 일반 뷰 복제마다 집합 방식에서 약 15ns를 더하고, 조회 한 번과 상수 비교만 사용하는 방식도 성능 허용 범위를 넘으므로 희소한 하위 클래스의 생성자 미실행 보장을 추가하지 않습니다. 생성자·slice·species 실행을 피하려면 해당 기본 TypedArray의 뷰를 명시적으로 만든 뒤 복제하고, 필요할 때 결과의 프로토타입을 원래 프로토타입으로 복원합니다.
- DataView 하위 클래스의 생성자는 실행하지 않지만 복제 결과는 기본 DataView이므로 하위 프로토타입과 상속 메서드를 보존하지 않습니다. DataView에는 slice·species 경로가 없습니다. 전체 버퍼의 독립 복사와 원래 byteOffset·byteLength는 유지합니다. 하위 프로토타입이 필요하면 기본 DataView 뷰를 복제한 뒤 결과에 원래 프로토타입을 명시적으로 복원합니다. 두 뷰 계열은 위의 생성자 미실행·프로토타입 보존 계약에 포함하지 않습니다.

## Last Updated

객체 연산과 예약 멤버의 own 데이터 계약이 바뀌면 갱신합니다.
