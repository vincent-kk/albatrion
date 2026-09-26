# 16라운드 원자료 — 스토리 미러 구조와 벤치 방법 (antigravity high, 2026-09-24. 코드 예시는 줄이고 사실·권고는 그대로)

## 1. Storybook 10.x에서 스토리를 vitest로 돌리는 공식 경로
- `@storybook/experimental-addon-test`가 `@storybook/addon-vitest`로 승격(출처: storybook.js.org/docs/writing-tests/test-addon).
- `@storybook/test-runner`(playwright, 스토리북 서버를 띄워 URL 순회)는 유지보수 중이나 오버헤드가 크다. `@storybook/addon-vitest`는 Vite 파이프라인에서 CSF를 직접 테스트로 바꿔 vitest 브라우저 모드(playwright 공급자)에서 병렬 실행하며 스토리북 테스트 패널과 연동. 차세대 공식 권장 경로.
- 호환: addon-vitest 10.x는 vitest ^3.0(설치된 3.2.6)과 Vite 6/7에 호환(npm 메타데이터, Storybook 10 릴리스 가이드).
- addon-vitest는 **브라우저 모드 전제**(`browser.enabled: true`). jsdom에서 스토리를 돌리려면 portable stories(`composeStories`)로 일반 유닛 테스트 방식.
- 권고 설정: vitest `workspace`에 프로젝트 둘 — `unit`(jsdom 또는 node)과 `storybook`(`storybookTest({ configDir })` 플러그인, browser playwright chromium headless, `setupFiles: .storybook/vitest.setup.ts`에서 `setProjectAnnotations([preview])`와 `beforeAll(project.beforeAll)`).

## 2. Portable stories
- import는 `@storybook/react`에서 `composeStories`, `composeStory`, `setProjectAnnotations`(`@storybook/testing-react`는 폐기). 출처: storybook.js.org/docs/writing-tests/portable-stories/vitest.
- `setProjectAnnotations`를 setup에서 1회.
- Storybook 8.2.7부터 `await Story.run()`(마운트 + loaders + play). 전통 방식은 `render(<Story />)` 뒤 `await Story.play({ canvasElement: container })`.
- `@storybook/test`의 `expect`는 vitest 단언 기반이라 vitest에서 그대로 동작. `step`은 스토리북 패널용 래퍼이고 vitest에서는 투명한 비동기 콜백.

## 3. "시나리오 = CSF 스토리" 단일 원천
- 성립한다("Stories are tests"). `play` 안의 `expect`는 스토리북 화면(인터랙션 패널)과 vitest 양쪽에서 같은 결과.
- 단언을 e2e에만 두는 패턴: 스토리는 상호작용만(`play`), 테스트 파일은 `composeStories` → `render(<Story onSubmit={spy} />)` → `await Story.play({ canvasElement })` → 외부 단언.
- 반대 방향(테스트를 원천으로 스토리를 생성)은 안티패턴(Autodocs·HMR·Chromatic 파괴). 예외: 수백 개 데이터 매트릭스는 순수 스키마·데이터 모듈을 공유하고 테스트가 `test.each`로 돌리며 스토리북에는 대표 3–5개만.

## 4. 코어 시나리오와 e2e 시나리오의 공유
- 선례: XState `@xstate/test`(모델 기반 테스트: 전이·입력을 데이터로 두고 헤드리스 드라이버와 UI 드라이버가 각각 해석), Screenplay 패턴·Gherkin.
- 권고: `*.scenario.ts`(순수 데이터: `schema`, `steps: [{ path, action, value, expected }]`) → 코어 러너(`node.find(path).setValue(value)`, React 없음)와 스토리 `play` 어댑터(`userEvent`로 `data-testid`=경로 입력)로 해석.

## 5. 벤치
- npm alias(`"@canard/schema-form-legacy": "npm:@canard/schema-form@<버전>"`)는 yarn 4·npm 표준. 이 모노레포의 `@aileron/benchmark-form/package.json`이 이미 다중 버전(`@canard/schema-form_0.10.0: npm:@canard/schema-form@0.10.0` 등)으로 비교 중.
- vitest bench는 tinybench 엔진(vitest.dev/guide/features/benchmarking). V8 간섭 때문에 `node --expose-gc`로 명시적 GC(`@aileron/benchmark-form` 스크립트가 이미 함).
- 렌더 횟수: `<React.Profiler onRender>`(react.dev/reference/react/Profiler), 그리고 `@aileron/benchmark-form/src/utils/render-trace.tsx`의 경로별 커밋 카운트(`CountingRenderer` + `React.memo`).
- 공정 비교 조건: 노드 수·깊이·원시/객체 비율 1:1, 같은 상호작용 열, 코어(node 환경)와 React 렌더(React 19)를 분리 측정, 워밍업 10회 이상, 표본 100회 이상, 평균 대신 중앙값과 p99.

## 6. 권고 구조 한 장
| 계층 | 위치 | 역할 | 도구 |
|---|---|---|---|
| 단일 원천 | `src/scenarios/*.scenario.ts` | 스키마·초기값·단계 목록(순수 데이터) | 없음 |
| 코어 유닛 | `src/**/*.spec.ts` | 노드 트리만으로 단계를 `setValue`로 해석·단언 | vitest node |
| 스토리 | `stories/**/*.stories.tsx` | 시나리오를 가져와 `<Form>` 렌더 + `play` | Storybook dev |
| 컴포넌트 e2e | 같은 스토리 파일 | `play`를 헤드리스로 | vitest browser + addon-vitest |
| 통합 렌더(선택) | `tests/render/*.test.tsx` | `composeStories` + 외부 spy 단언 | vitest jsdom + RTL |
| 성능 비교 | `bench/**/*.bench.ts` | alias 옛 판 대 새 판, 같은 조건 | vitest bench, `--expose-gc` |
| 렌더 트레이스 | `bench/render-trace.tsx` | 재렌더 번짐 측정 | jsdom, `@aileron/benchmark-form` 패턴 |
