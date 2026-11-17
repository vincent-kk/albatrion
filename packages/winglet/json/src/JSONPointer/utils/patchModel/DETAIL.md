# patchModel — DETAIL

## Requirements

- RFC 6902가 정의한 여섯 연산 이름과 여섯 패치 형태를 타입·상수로 제공한다.
- 런타임 값이 필요한 것은 `Operation` 하나뿐이다. 나머지는 전부 타입이며 컴파일 후 사라진다.
- 이 fractal은 `patch` 및 그 자식 fractal에 의존하지 않는다 — 의존은 단방향으로 이쪽을 향한다.

## API Contracts

entry point는 `index.ts`이며 이름 지정 재export만 담는다.

| 심볼                  | 종류              | 계약                                                                      |
| --------------------- | ----------------- | ------------------------------------------------------------------------- |
| `Operation`           | const + 동명 타입 | `add`·`replace`·`remove`·`move`·`copy`·`test`. 값으로도 타입으로도 쓰인다 |
| `Patch`               | 타입              | 아래 여섯 형태의 유니온. 패치 문서 한 건을 나타낸다                       |
| `TestPatch<Value>`    | 타입              | `path`의 값이 `value`와 같은지 단언                                       |
| `AddPatch<Value>`     | 타입              | `path`에 `value` 삽입. 배열의 마지막 세그먼트가 `-`면 append              |
| `ReplacePatch<Value>` | 타입              | `path`의 기존 값을 `value`로 덮어씀                                       |
| `RemovePatch`         | 타입              | `path`의 값 삭제. 대상이 존재해야 함                                      |
| `CopyPatch`           | 타입              | `from`의 값을 `path`로 복사, 원본 유지                                    |
| `MovePatch`           | 타입              | `from`의 값을 `path`로 이동, 원본 삭제                                    |

`BasePatch`(`op`·`path`)는 비공개다 — 여섯 형태의 공통 필드일 뿐 소비자가 직접 다룰 대상이 아니다.

공유 패치 어휘는 적용 구현과 분리하여 자식에서 부모 패치 배럴로 되돌아가는 의존을 만들지 않습니다. 패키지 진입점으로 패치를 구성하는 소비자도 런타임 연산 이름을 사용할 수 있도록 `Operation`을 공개합니다.

## Acceptance Criteria

### operation-runtime — 연산 이름은 런타임에 남는다

- `Operation.ADD`가 컴파일 결과물에서 문자열 `'add'`로 평가된다.
- `isolatedModules` 설정에서 `@winglet/json` 빌드가 통과한다.

### patch-discriminated — 패치 유니온은 `op`로 좁혀진다

- `patch.op === Operation.MOVE`로 좁힌 뒤 `patch.from`에 타입 오류 없이 접근된다.
- `patch.op === Operation.REMOVE`로 좁힌 뒤 `patch.value` 접근이 타입 오류가 된다.

### no-back-dependency — patch 방향으로 의존하지 않는다

- 이 fractal의 어떤 파일도 `patch` 또는 그 자식 fractal을 import하지 않는다.
- `structure_validate`의 `dag` scope에서 `patchModel`이 포함된 순환이 보고되지 않는다.

## Last Updated

패치 어휘·공개 형 또는 단방향 의존 경계가 바뀔 때 갱신합니다.
