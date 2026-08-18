# hash contract

## Requirements

- `Murmur3`는 문자열·`ArrayBuffer`·`Uint8Array` 입력에 대해 32비트 MurmurHash3(x86_32) 해시를 계산하며, 여러 번의 `hash()` 호출로 데이터를 증분 처리한 결과와 전체 데이터를 한 번에 처리한 결과가 같다.
- `Murmur3.hash(data, seed?)` 정적 메서드는 `new Murmur3(data, seed).result()`와 동일한 값을 반환하는 원샷 편의 메서드다.
- `polynomialHash(target, length?)`는 Java `String.hashCode()`와 동일한 31 기반 다항식 해시를 계산해 지정한 길이의 base36 문자열로 반환하며, 같은 입력·길이에는 항상 같은 값을 낸다.

## API Contracts

- `new Murmur3(data?, seed = 0)` / `.hash(input)` / `.reset(seed = 0)` / `.result()`: `hash`는 인스턴스를 반환해 체이닝 가능하고, `input`이 문자열·`ArrayBuffer`·`Uint8Array`가 아니면 `TypeError`를 던진다. `reset`은 `seed`가 `number`가 아니면 `TypeError`를 던진다.
- `result()`는 부호 없는 32비트 정수(`>>> 0`)를 반환하며, 시드가 다르면 같은 입력도 다른 값을 낸다.
- 정렬된 `Uint8Array`가 32바이트 이상이면 `DataView` 기반 최적화 경로를 타지만, 비정렬 경로와 동일한 해시 값을 낸다 — 정렬 여부가 결과에 영향을 주지 않는다.
- `polynomialHash(target, length = 7)`는 해시를 base36으로 인코딩한 뒤 `padStart(length, '0').slice(-length)`로 하위 자릿수를 유지한다 — `length`가 0 이하이면 빈 문자열을 반환한다.

## Acceptance Criteria

### murmur3-reference-fidelity — Murmur3 알고리즘 정합성

- 시드 0에서 공개된 MurmurHash3 x86_32 레퍼런스 벡터(`''`→`0`, `'a'`→`1009084850`, `'abc'`→`3017643002` 등)와 정확히 일치한다.
- 정렬된 입력과 정렬되지 않은 동일 바이트 입력이 같은 해시를 낸다(길이 36·40·48·100에서 검증).
- 꼬리 바이트의 최상위 비트가 설정되어(k1이 음수 int32가 되는 경우) 있어도 블록이 유실되지 않는다.

### murmur3-incremental-api — 증분 해싱 API

- 문자열·`Uint8Array`·`ArrayBuffer` 각각에서 여러 번 나눠 `hash()`한 결과가 한 번에 해싱한 결과와 같다(4바이트 경계가 아닌 지점에서 나눠도 동일).
- `reset(seed)`는 상태를 초기화하고, 인자를 생략하면 시드 0으로 되돌아간다.
- 생성자·`hash()`·`reset()`은 지원하지 않는 입력 타입에 `TypeError`를 던진다.

### polynomial-hash-determinism — polynomialHash 결정성과 길이 처리

- 동일한 입력과 길이에 대해 항상 동일한 base36 문자열을 반환한다.
- 기본 길이는 7이며, 요청한 길이로 하위 자릿수를 유지한 채 `0`으로 좌측 패딩한다(예: `length=3`이면 마지막 3자리만 남는다).
- `length`가 0 이하이면 빈 문자열을, 정수가 아니면 정수부만 사용해 처리한다.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 함수/클래스당 한 파일의 flat 컬렉션이 이 fractal의 정본 형태다 — `Murmur3`와 `polynomialHash` 둘 다 root에 남아 엔트리 포인트가 이름으로 재수출한다. organ 재배치는 파일이 두 개뿐인 배럴의 깊이만 늘리고, 배럴 경유 시 재수출 그래프가 번들에 딸려오므로 개별 파일이 필요한 소비자의 직접 import도 같은 이유로 허용된다.

## Last Updated

2026-08-18 — 최초 계약 작성
