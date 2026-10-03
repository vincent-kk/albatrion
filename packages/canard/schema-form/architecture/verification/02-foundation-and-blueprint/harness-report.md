# 02 기반 하니스 검증 보고서

이 보고서의 실행 결과는 초기 하니스 시점의 기록입니다. 최신 베이스 반영 뒤
코어 러너를 제품의 코어 시험 소유로 옮기고 화면 실행을 분리했습니다.
현재 배치와 13개 하니스 시험의 증거는
[시나리오 러너 소유권 검증](./scenario-runner-placement.md)을 따릅니다.

## 결과

| 검사 | 결과 | 증거 |
| --- | --- | --- |
| unit/render 분리 첫 실행 | 235파일·3,869시험 통과, exit 0 | `projects-unit-render.log` |
| 실제 공개 Form 주입과 DOM 핸들 전달 | 1파일·1시험 통과, exit 0 | `scenario-public-form.log` |
| unit/render 최종 실행 | 기존 시험과 하니스 236파일·3,870시험 통과. 작성 중 blueprint 진입점 부재로 3스위트 수집 실패, 전체 exit 1 | `projects-unit-render-final.log` |
| Storybook Chromium 최종 실행 | 49파일·390시험 통과, exit 0 | `projects-storybook-final.log` |
| 시나리오 패키지 | 4파일·10시험 통과, exit 0 | `scenario-tests.log` |
| 시나리오 패키지 strict | `tsc --noEmit --strict`, exit 0 | `scenario-types.log` |
| 시나리오 패키지 lint | 지정 명령 exit 0 | `scenario-lint.log` |
| schema-form strict | 하니스 오류 없음. 작성 중 blueprint 시험 3개의 `../index` 부재(TS2307)로 exit 2 | `harness-package-types.log` |

이 보고서는 하니스 작업의 증거다. blueprint 구현 중 수집 실패를 전체 02 게이트의
통과로 바꾸지 않는다. 최종 구현 후 패키지 전체 시험·strict 검사는 다시 필요하다.

새 러너 fail-first는 구현 파일을 쓰기 전에 지정 패키지 시험으로 `runScenario`
부재를 확인했다(`scenario-red.log`). 실제 Form 주입 시험은 공개 `Form`과
`FormHandle`을 그대로 받고, 시나리오 패키지는 schema-form의 값이나 형을
가져오지 않는다. 새 엔진은 공개 Form에 연결하지 않았다.

## Storybook의 기존 잘못된 단언

자동화를 켜자 `07.FormRefHandle.stories.tsx`의
`FormTypeInputArrayTerminalRef`에서 별개 문제 셋이 차례로 드러났다.

1. `getByText(/"arr":/)`가 Schema와 Value JSON 두 곳을 찾았다. Value 접근성
   그룹 안으로 범위를 좁혔다. 최초 실패는 `projects-storybook.log`에 있다.
2. clear 버튼도 외곽 ref 핸들 버튼과 Form 내부 입력 버튼 둘이었다. 이 단계는
   외곽 버튼의 `node.setValue([])`를 검증하므로 Form 밖의 버튼만 선택한다.
   사용자 입력의 `node.clear()` 버튼으로 대체하지 않았다. 이 실패는
   `projects-storybook-fixed.log`에 있다.
3. 원래 마지막 단언은 출력 `{arr:[]}`를 기대했지만 기존 스키마는
   `options.omitEmpty:false`를 지정하지 않는다. 기존 엔진의 실제 출력은 `{}`이고
   입력 노드 값은 `[]`다. 출력 `{}`와 실제 FormTypeInput `value` prop의 JSON
   `[]`를 동시에 확인하도록 고쳤다. `data-array-value`는 이 스토리의 입력 표시
   요소에만 추가한 관찰 표식이다.

셋째 판단은 v7 또는 VALUE-034를 근거로 삼지 않았다. 변경하지 않은 기존 코드와
기존 시험의 근거는 다음과 같다.

- `src/core/nodes/ArrayNode/utils/resolveArrayValueFilter/resolveArrayValueFilter.ts:17`
  은 `options?.omitEmpty !== false`로 기본 생략을 켜며 21행은 `omitEmptyArray`를
  출력 필터로 선택한다.
- `src/core/nodes/ArrayNode/utils/omitEmptyArray/omitEmptyArray.ts:7`은 빈 배열을
  부모에게 전달할 때 `undefined`로 바꾼다.
- `src/core/nodes/ArrayNode/ArrayNode.ts:79`의 기존 계약은 필터가 부모 전달
  경로에만 있고 입력의 raw `value`는 유지됨을 명시한다.
- `src/core/__tests__/ArrayNode.terminal.test.ts:38`은 `setValue([])` 뒤
  `arrayNode.value`가 실제 `[]`임을 검증한다.
- `src/core/__tests__/ArrayNode.omitTrailing.test.ts:91`은 빈 배열의 부모
  프로퍼티 생략을, 98행의 대조 시험은 `omitEmpty:false`일 때 `[]` 보존을 검증한다.

이 기존 시험들은 unit 최종 실행에서 통과했다. 공개 Form·노드 구현·스키마 옵션은
바꾸지 않았으며 스토리의 잘못된 관찰 대상과 출력 단언을 바로잡았다.

## 설정과 범위

- `unit`: Node, `src/**/*.{spec,test}.ts`, DOM 시험 제외.
- `render`: jsdom, `.test.tsx`와 실제 DOM을 쓰는 VirtualizationManager 시험.
- `storybook`: addon-vitest, headless Chromium, 기존 49파일.
- 글롭은 `src/__legacy__/**`와 새 blueprint 시험을 포함하며 설계 기록인
  `architecture/spikes/**`는 포함하지 않는다.
- addon-vitest 10.4.1과 browser 3.2.6을 고정하고 test-runner 0.24.4를 제거했다.
  Yarn은 skip-build로 실행했다. 기존 peer 경고는 `dependency-install.log`에 있다.
- union/fill/narrowing family는 빈 배열이다. 0개 시나리오는 scaffold이며
  엔진 동작 검증 수로 부풀리지 않는다.

## 변경 파일 — 하니스 소유분

저장소 루트: `package.json`, `yarn.lock`.

schema-form:

- `.storybook/main.ts`, `.storybook/vitest.setup.ts`
- `CLAUDE.md`의 Render-Level Test Harness 절
- `package.json`의 scenario workspace 개발 의존
- `vite.config.ts`
- `stories/07.FormRefHandle.stories.tsx`
- `src/__tests__/scenarioHarness.render.test.tsx`
- 이 보고서와 `story-disposition.md`, 명령 로그

새 `packages/aileron/schema-form-scenarios`:

- `.gitignore`, `eslint.config.js`, `package.json`, `tsconfig.json`, `vite.config.ts`
- `index.ts`, `src/types.ts`, `src/constants/registration.ts`
- `src/components/ScenarioForm.tsx`
- `src/components/__tests__/ScenarioForm.test.tsx`
- `src/utils/runScenario.ts`
- `src/utils/registerScenarioHandle.ts`
- `src/utils/findScenarioHandle.ts`
- `src/utils/playScenario.ts`
- `src/utils/__tests__/runScenario.test.ts`
- `src/utils/__tests__/playScenario.test.ts`
- `src/union/empty.scenario.ts`
- `src/fill/empty.scenario.ts`
- `src/narrowing/empty.scenario.ts`
- `src/__tests__/emptyFamilies.test.ts`

INTENT/DETAIL은 코드 전 선행 커밋에 있다. node_modules·dist·coverage는 패키지
gitignore로 제외했다. 생성 배포 자산은 커밋 대상이 아니며 패키지 판은 올리지 않았다.
