# 1.0.0-beta 버그 바운티 결과

`1.0.0-beta` 브랜치의 커밋 `1c77ced57`을 기준으로 진행한 버그 바운티에서 문제로 확인된 항목을 패키지별로 기록합니다. 확인된 문제는 16개 패키지에서 모두 79건입니다. 진행 중에 올라온 커밋 `6e331f482`는 `FieldInputBridge`의 상태 인덱스를 상수로 바꾼 정리 작업이라 동작과 이 문서의 줄 번호에 영향이 없습니다.

## 확인 방법

- 탐색은 9개 영역으로 나눠 진행했습니다. schema-form 값 처리, schema-form 배열과 경로, schema-form 검증과 AJV 플러그인, schema-form React 계층, json과 json-schema, common-utils와 style-utils, promise-modal, react-utils·data-loader·agents-assets-sync, UI 플러그인 네 종입니다.
- 각 항목은 버그가 있으면 실패하는 재현 테스트로 확인했고, 메인 세션에서 같은 테스트를 다시 실행해 같은 이유로 실패하는 것을 확인했습니다.
- 버그의 기준은 패키지 문서(README, `docs/`, `docs/agents/`, `INTENT.md`, `DETAIL.md`, JSDoc, `.changeset/`), 공개 타입, 패키지가 따른다고 밝힌 표준, 또는 기본적인 올바름(예외, 멈춤, 잘못되거나 낡은 값, 정리 뒤의 콜백, 데이터 유실)을 어기는 것입니다.
- 기존 테스트가 현재 동작을 의도적으로 고정하고 있는데 문서나 표준과 어긋나는 경우는 "계약 충돌"로 표시했습니다. 이런 항목은 코드와 문서 중 어느 쪽을 고칠지 먼저 정해야 합니다.

## 패키지별 문서

| 패키지 | 건수 | 문서 |
|---|---|---|
| `@canard/schema-form` | 8 | [canard-schema-form.md](canard-schema-form.md) |
| `@canard/schema-form-ajv8-plugin` | 5 | [canard-schema-form-ajv8-plugin.md](canard-schema-form-ajv8-plugin.md) |
| `@canard/schema-form-ajv7-plugin` | 2 | [canard-schema-form-ajv7-plugin.md](canard-schema-form-ajv7-plugin.md) |
| `@canard/schema-form-ajv6-plugin` | 2 | [canard-schema-form-ajv6-plugin.md](canard-schema-form-ajv6-plugin.md) |
| `@canard/schema-form-antd5-plugin` | 6 | [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md) |
| `@canard/schema-form-antd6-plugin` | 6 | [canard-schema-form-antd6-plugin.md](canard-schema-form-antd6-plugin.md) |
| `@canard/schema-form-mui-plugin` | 6 | [canard-schema-form-mui-plugin.md](canard-schema-form-mui-plugin.md) |
| `@canard/schema-form-antd-mobile-plugin` | 3 | [canard-schema-form-antd-mobile-plugin.md](canard-schema-form-antd-mobile-plugin.md) |
| `@lerx/promise-modal` | 8 | [lerx-promise-modal.md](lerx-promise-modal.md) |
| `@winglet/style-utils` | 5 | [winglet-style-utils.md](winglet-style-utils.md) |
| `@winglet/common-utils` | 7 | [winglet-common-utils.md](winglet-common-utils.md) |
| `@winglet/data-loader` | 2 | [winglet-data-loader.md](winglet-data-loader.md) |
| `@winglet/react-utils` | 2 | [winglet-react-utils.md](winglet-react-utils.md) |
| `@winglet/json` | 7 | [winglet-json.md](winglet-json.md) |
| `@winglet/json-schema` | 4 | [winglet-json-schema.md](winglet-json-schema.md) |
| `@slats/agents-assets-sync` | 6 | [slats-agents-assets-sync.md](slats-agents-assets-sync.md) |

## 먼저 볼 항목 (심각도 높음)

- `@canard/schema-form` 1번: `derived`와 `unsetValue`가 의존 대상이 빠질 때 다시 평가되지 않아, 낡은 값이 제출되고 나중에 사용자 입력을 덮어씁니다.
- `@canard/schema-form` 2번: React 19 `Activity`로 파일 입력을 숨기면 첨부 파일이 사라집니다.
- `@canard/schema-form-ajv8-plugin` 1번과 2번: 루트 스키마에 `$id`가 있으면 비활성 분기 오류가 표시되고, 필드 오류가 부모로 옮겨집니다.
- `@winglet/style-utils` 1번부터 3번: `StyleManager`가 `@media` 중괄호를 잃고 선택자 목록의 첫 선택자에만 스코프를 붙이며, `compressCss`가 `calc()`를 깨뜨립니다. promise-modal의 스타일 주입에도 영향을 줍니다.
- `@winglet/data-loader` 1번: 문서가 권장하는 즉시 실행 스케줄러를 쓰면 모든 `load()`가 끝나지 않습니다.
- `@winglet/json` 1번: `applyPatch`의 배열 `move`가 요소를 덮어쓰고 구멍을 남겨 데이터를 손상시킵니다.
- `@canard/schema-form-antd5-plugin`과 `-antd6-plugin` 1번: 시간 범위 입력의 `minimum`/`maximum`이 모든 날짜를 비활성화합니다.
- `@slats/agents-assets-sync` 1번과 2번(중간에서 높음): manifest 키의 `..`로 설치 루트 밖에 파일을 쓸 수 있고, TTY의 `--force`가 확인 없이 파일을 지웁니다.

## 여러 패키지에 걸친 문제

- 읽기 전용 선택 위젯이 새 선택을 화면에 보여 주지만 값은 그대로인 문제는 네 UI 플러그인 모두에 있습니다.
- 값 수준의 `false` 스키마와 URI 인코딩된 속성 이름의 `rejectedKey` 문제는 세 AJV 플러그인 모두에 있습니다.
- Boolean 체크박스의 미정 상태에 대한 README 불일치는 네 UI 플러그인 모두에 있습니다.
- URI 스킴이 목록의 첫 항목으로 바뀌는 문제는 antd5, antd6, MUI 플러그인에 있습니다.

## 재현 테스트

- 확인에 쓴 재현 테스트는 [`probes/`](probes/) 아래에 패키지별로 보관했습니다. 일부 파일에는 통과하는 대조 테스트도 함께 들어 있습니다.
- 재현 테스트는 상대 경로로 패키지 내부를 가져오므로, 이 폴더에서는 실행되지 않습니다. 실행하려면 해당 패키지의 `src/__bounty__/<임의 이름>/` 아래로 복사한 뒤, 그 패키지의 테스트 명령으로 실행합니다. 예: `yarn workspace @canard/schema-form test --run --project unit src/__bounty__/probe/values.findings.test.ts`.
- `@slats/agents-assets-sync`의 기존 종단 간 테스트는 `src/` 아래 파일이 `dist/`보다 새로우면 스스로 건너뛰므로, 재현 테스트를 그 패키지에 둔 동안에는 기존 종단 간 테스트 결과를 믿지 말아야 합니다.
