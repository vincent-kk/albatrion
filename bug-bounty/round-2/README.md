# 버그 바운티 2라운드 결과

2라운드는 1라운드에서 확인한 79건([`../round-1/README.md`](../round-1/README.md))이 모두 고쳐졌다고 가정하고, 그와 겹치지 않는 새 버그와 1라운드 버그 종류의 새로운 사례를 찾았습니다.

- 기준 커밋: `bab9be60a` (브랜치 `1.0.0/bugbounty`).
- 결과: 16개 패키지에서 63건을 확인했습니다. 이 중 schema-form 3번 항목(코어의 배열 새로고침 누락)은 UI 플러그인 4개 문서에도 증상별로 나눠 적었으므로, 원인 기준으로는 59건입니다.
- 모든 항목은 실패하는 재현 테스트(또는 타입 검사)로 확인했고, 탐색 에이전트가 보고한 재현을 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 정적 검사로만 확인한 항목은 각 문서에 그렇게 적었습니다.

## 방법

- 탐색 에이전트 9개가 영역을 나눠 맡았습니다. schema-form 엔진과 컴파일, schema-form React 계층, 검증과 AJV 플러그인, 배포 산출물, common-utils와 style-utils, json과 json-schema, promise-modal, UI 플러그인 4개, react-utils와 data-loader와 agents-assets-sync입니다.
- 1라운드 문서와 그 "버그가 아니라고 확인한 가설" 목록은 다시 보고하지 않게 했고, 1라운드 버그 종류가 새 위치에 나타난 경우는 새 항목으로 받았습니다.
- 참조 구현과의 차등 테스트를 함께 썼습니다. lodash, es-toolkit, fast-json-patch, dataloader, postcss, 순수 AJV와 결과를 비교했습니다.
- 1라운드에서 다루지 않은 배포 산출물(`exports`, ESM과 CommonJS, peer 범위, 이중 패키지, 프로덕션 빌드, 선언 파일)을 새로 살폈습니다.

## 패키지별 문서

| 패키지 | 건수 | 문서 |
| --- | --- | --- |
| `@canard/schema-form` | 12 | [canard-schema-form.md](canard-schema-form.md) |
| `@canard/schema-form-ajv8-plugin` | 2 | [canard-schema-form-ajv8-plugin.md](canard-schema-form-ajv8-plugin.md) |
| `@canard/schema-form-ajv7-plugin` | 1 | [canard-schema-form-ajv7-plugin.md](canard-schema-form-ajv7-plugin.md) |
| `@canard/schema-form-ajv6-plugin` | 1 | [canard-schema-form-ajv6-plugin.md](canard-schema-form-ajv6-plugin.md) |
| `@canard/schema-form-antd5-plugin` | 2 | [canard-schema-form-antd5-plugin.md](canard-schema-form-antd5-plugin.md) |
| `@canard/schema-form-antd6-plugin` | 2 | [canard-schema-form-antd6-plugin.md](canard-schema-form-antd6-plugin.md) |
| `@canard/schema-form-mui-plugin` | 2 | [canard-schema-form-mui-plugin.md](canard-schema-form-mui-plugin.md) |
| `@canard/schema-form-antd-mobile-plugin` | 3 | [canard-schema-form-antd-mobile-plugin.md](canard-schema-form-antd-mobile-plugin.md) |
| `@lerx/promise-modal` | 7 | [lerx-promise-modal.md](lerx-promise-modal.md) |
| `@winglet/style-utils` | 2 | [winglet-style-utils.md](winglet-style-utils.md) |
| `@winglet/common-utils` | 9 | [winglet-common-utils.md](winglet-common-utils.md) |
| `@winglet/data-loader` | 1 | [winglet-data-loader.md](winglet-data-loader.md) |
| `@winglet/react-utils` | 5 | [winglet-react-utils.md](winglet-react-utils.md) |
| `@winglet/json` | 8 | [winglet-json.md](winglet-json.md) |
| `@winglet/json-schema` | 1 | [winglet-json-schema.md](winglet-json-schema.md) |
| `@slats/agents-assets-sync` | 5 | [slats-agents-assets-sync.md](slats-agents-assets-sync.md) |

## 우선순위

심각도가 높은 항목입니다. 모두 데이터가 조용히 틀리거나 사라지는 문제입니다.

1. schema-form 1번: `$ref` 대상 스키마 자신의 `controls.active`가 경로를 읽으면 필드가 켜지지 않아, 아무 진단 없이 값과 제출 결과에서 빠집니다.
2. schema-form 2번: 두 곳에서 참조한 `$defs` 템플릿의 `derived`와 `visible`이 첫 번째 위치에서만 반응해, 틀린 파생 값이 제출됩니다.
3. schema-form 3번: 길이가 같은 배열 쓰기가 배열 전체를 편집하는 입력(4개 UI 플러그인의 체크박스 그룹, 다중 선택, 범위 입력 등)에 반영되지 않고, 다음 사용자 편집이 외부 값을 덮어씁니다.
4. json 1번: 기본 immutable 모드의 `applyPatch`가 루트로 `move`나 `copy`를 한 뒤 입력 문서를 직접 수정합니다.
5. agents-assets-sync 1번: 복사나 삭제가 권한 오류로 실패해도 종료 코드 0과 함께 성공으로 보고됩니다.
6. style-utils 1번: Shadow DOM 스코프의 `StyleManager`를 공개 API로 해제할 수 없어 호스트마다 메모리가 새고, README 예제도 동작하지 않습니다.

그다음은 json 2번(조상 위치로의 `move`), agents-assets-sync 2번(대소문자나 유니코드 정규화만 바뀐 이름이 `--force`에서 지워짐)이고, 중간 심각도로 schema-form 4번과 5번, promise-modal 1번과 7번, AJV 플러그인 3개의 `%` 이름 가드, antd-mobile 1번, common-utils 1번과 2번, react-utils 1번, json 3번, agents-assets-sync 3번이 있습니다.

## 여러 패키지에 걸친 종류

2라운드에서 새로 드러난 종류입니다. 같은 종류의 다른 사례를 찾을 때 출발점이 됩니다.

- `$ref` 같은 간접 참조가 판단 기준 위치를 바꿈: schema-form 1, 2, 9번.
- 경로와 이름의 표기 차이(인코딩, 대소문자, 정규화, BOM, 빈 조각): AJV 플러그인 3개의 `%` 이름 가드, schema-form 8번과 12번, json 8번, agents-assets-sync 2번과 5번.
- effect에서만 일어나는 일: Activity 숨김이 정리 함수를 실행하는 문제(promise-modal 5번, react-utils 1번)와 서버 렌더링에서 빠지는 상태(schema-form 6번과 11번).
- 패키지 사본이 둘 이상인 환경: schema-form 7번, promise-modal 6번과 7번, 그리고 peer 범위가 dependency 범위보다 넓은 문제(UI 플러그인 4개, react-utils 5번).
- Shadow DOM: promise-modal 1번과 3번, style-utils 1번.
- 재귀 깊이: schema-form 5번, json 7번.
- 오류가 사라지거나 상태가 고정됨: agents-assets-sync 1번, common-utils 2번과 5번.
- 복사나 불변성 보장을 우회함: json 1번부터 3번, common-utils 1번.

## 재현 테스트와 확인 범위

- 재현 테스트는 [`probes/`](probes/) 아래에 패키지별로 있습니다. 이 폴더에서는 별칭과 상대 경로가 풀리지 않아 그대로 실행되지 않으므로(편집기의 TypeScript 오류도 이 때문입니다), 각 문서에 적힌 대로 패키지의 `src/__bounty__/<폴더>/`에 복사해 실행합니다.
- 재현 폴더에는 통과하는 대조 테스트와, 실패하지만 버그 항목이 아닌 측정용이나 가설용 테스트가 일부 섞여 있습니다. 어느 것이 그런지는 각 문서의 재현 테스트 절에 적었습니다.
- 확인 범위의 한계:
  - schema-form 1, 2, 5, 9번은 Form과 같은 트리 생성 경로(`nodeFromJSONSchema`)로 확인했고, Form을 렌더하는 수준의 재현은 하지 않았습니다.
  - UI 플러그인 테스트는 schema-form의 `dist` 빌드를 씁니다. 빌드 이후 바뀐 소스가 원인 파일과 무관하다는 것을 확인했습니다.
  - antd6의 날짜 범위 입력은 jsdom에 `ResizeObserver`가 없어 확인하지 못했습니다.
  - antd6, MUI, antd-mobile의 peer 범위와 react-utils 5번은 정적 검사로만 확인했습니다.
  - schema-form 5번의 오버플로 깊이는 실행마다 200단계에서 300단계 사이로 달라집니다.
