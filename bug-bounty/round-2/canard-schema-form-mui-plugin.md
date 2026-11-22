# @canard/schema-form-mui-plugin 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 2건입니다. 1라운드 문서([`../round-1/canard-schema-form-mui-plugin.md`](../round-1/canard-schema-form-mui-plugin.md))의 항목은 고쳐진 것으로 보고 제외했습니다. 재현 테스트는 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/canard-schema-form-mui-plugin/arrayValueInputs.test.tsx`](probes/canard-schema-form-mui-plugin/arrayValueInputs.test.tsx)

- 실행하려면 파일을 `packages/canard/schema-form-mui-plugin/src/__bounty__/r2-ui-plugins/`에 복사한 뒤 `yarn workspace @canard/schema-form-mui-plugin test --run src/__bounty__/r2-ui-plugins/`를 실행합니다.

## 1. 체크박스 그룹이 길이가 같은 외부 쓰기를 화면에 반영하지 않고, 다음 클릭에서 외부 값을 덮어씁니다

- 심각도: 높음. MUI에서는 데이터 손실까지 재현했습니다. 원인은 `@canard/schema-form` 코어에 있으며, 설명은 [`canard-schema-form.md`](canard-schema-form.md)의 3번 항목("길이가 같은 배열 쓰기")에 있습니다.
- 영향받는 입력: `FieldInputStringCheckbox`(체크박스 그룹).
- 재현:
  - "checkbox group shows a same-length value written through FormHandle.setValue": 화면이 `"a"`로 남습니다. 기대값은 `"b"`입니다.
  - "checkbox group shows a value written to an item node": `/checks/0` 노드에 쓴 뒤에도 화면이 `"a"`로 남습니다. 기대값은 `"c"`입니다.
  - "a toggle after an unseen external write keeps the external value": 외부에서 `['b']`를 쓴 뒤 사용자가 `"c"`를 클릭하면 값이 `['a', 'c']`가 됩니다. 기대값은 `['b', 'c']`입니다. 외부에서 쓴 값이 사라집니다.
- 확신도: 높음.

## 2. peer 범위가 플러그인 자신의 의존성 범위보다 넓습니다

- 심각도: 낮음에서 중간. antd5 2라운드 문서 2번 항목과 같은 모양입니다. 호스트가 다음 주 버전을 쓰면 패키지 관리자가 peer 경고 없이 두 번째 사본을 설치하고, 호스트의 테마가 플러그인 입력에 닿지 않습니다.
- 대상: `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`, `@emotion/*`가 모두 `>=` peer와 `^` dependency로 되어 있고, `dayjs`도 peer `>=1`, dependency `^1.0.0`입니다.
- 원인: `packages/canard/schema-form-mui-plugin/package.json`의 `peerDependencies`가 `dependencies`보다 넓습니다.
- 확인 방법: `package.json`의 범위를 semver로 비교했습니다. 동작 재현은 antd5에서만 했습니다.
- 확신도: 범위 불일치 자체는 높음.
