# 03 레거시 코어 이동과 기준선 확인

## 절차와 기준선

HEAD `e5a6c8061`에서 이동 전에 unit·render를 각각 실행해 모두 통과함을 확인했습니다. 02 단계 기준선의 원천 커밋은 `55ed75504`이며 #347·#349 이전 수치이므로 이번 최종 기준선으로 사용하지 않았습니다. 코디네이터가 이동 전에 단독 실행한 명령은 `yarn workspace @canard/schema-form bench:baseline`이고 결과는 `packages/canard/schema-form/architecture/verification/03-node-and-settle/baseline/core-legacy-final.json`입니다. 이 작업에서는 벤치를 재실행하지 않았습니다.

먼저 `src/core/DETAIL.md`에 전환 경계를 기록했습니다. 이어 `git mv`로 `nodes/`, `parsers/`, 옛 `__tests__/`의 항목을 `src/__legacy__/core/`로 옮기고, 새 하네스 `src/core/__tests__/scenarios/`는 그대로 두었습니다. `utils/`는 디렉터리째 옮겼습니다. 옛 주소 shim은 만들지 않았습니다. [이동 파일 목록](./legacy-migration-files.json)에 Git rename에서 추출한 **407파일**의 옛·새 주소를 기록했습니다.

## 이동 전후 시험 수

같은 명령 `npx vitest run --project unit`과 `npx vitest run --project render`로 각각 측정했으며, 전후 모두 통과했습니다.

unit_files_before=242
unit_files_after=242
unit_cases_before=3542
unit_cases_after=3542
render_files_before=52
render_files_after=52
render_cases_before=539
render_cases_after=539

`vite.config.ts`의 `src/**/*.test.tsx` render 글롭이 이동한 DOM 시험을 계속 포함합니다. 이동 전후 render 실행에서 52파일·539시험을 확인했습니다.

## import 수선

- 이동 파일의 상대 import 46곳: `src/core/types` 37곳, `nodeFromJSONSchema` 8곳, `src/types` 1곳.
- 이동한 노드 파일의 별칭 13곳: 옛 `core/nodes` 11곳과 `core/parsers` 2곳을 레거시 주소로 변경했습니다.
- 자리에 남은 `core/index.ts`, `nodeFromJSONSchema.ts`, `types/`의 상대 import 12곳을 레거시 노드 주소로 변경했습니다.
- 계획에 명시된 다른 `src` 소비자의 별칭 5곳과 stories·bench 소비자의 별칭 4곳을 변경했습니다.

계획 목록 밖에서 수정한 파일은 없습니다. `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json`은 오류 0건, `npx eslint "src/**/*.{ts,tsx}"`도 오류 0건으로 끝났습니다.

## 완료 확인

```text
LEGACY_MOVED
TYPECHECK_OK
```

옛 `core/nodes`, `core/parsers` 주소가 없고, 새 레거시 주소가 존재합니다. `core/__tests__`에는 새 `scenarios/`만 남았습니다.
