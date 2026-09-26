# 16라운드 원자료 — 테스트·벤치 인벤토리 (scout, 2026-09-24)

## 1. 테스트 실행기와 설정
| 항목 | 값 |
|---|---|
| 실행기 | vitest |
| 설정 | `packages/canard/schema-form/vite.config.ts`, 환경 `jsdom`, include `**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`, 커버리지 reporter만(text·json·html), 임계값 없음 |
| 스크립트 | `"test": "vitest"` |
| 벤치 설정 | `vitest.bench.config.ts`, 환경 `node`, include `bench/**/*.bench.ts`, `outputJson: bench/.results/latest.json` |

## 2. 테스트 파일 구조 (`src`)
- 총 234파일, 99,711줄. `core/__tests__` 87, `__tests__/scenarios` 44(`.render.test.tsx`), `AbstractNode/.../ComputedPropertiesManager/.../__tests__` 14, `AbstractNode/utils/__tests__` 14, `intersectSchema/utils/__tests__` 13, `helpers/jsonSchema/__tests__` 8, 나머지 helpers·core 하위 2–6개씩. `hooks/` 테스트 디렉터리 없음.
- 부류: 코어 유닛(DOM 없음) 216파일, React 렌더 사용 18파일, 시나리오 `src/__tests__/scenarios/*.render.test.tsx`, 개별 함수 `helpers/**/__tests__`.

## 3. React 렌더 사이클 모사
- `@testing-library/react` 18파일, `render(` 7파일, `act`·`waitFor` 16파일.
- `<Form>` 전체 마운트 13파일 142테스트: `core/__tests__/IfThenElse.onChange.realReact.test.tsx`(2), `core/__tests__/NullableFormScenarios.test.tsx`(12), `components/__tests__/SchemaNodeProxy.refresh.test.tsx`(37), scenarios: `refSchema-context-provider`(13), `formType-resolution`(13), `upload-file`(9), `default-value.input-immutability`(2), `renderProp.value`(10), `terminal-mode`(15), `controlled-interaction`(13), `multi-render-split-brain`(10), `override-props`(2), `composition.oneOf.concurrentMount`(4).

## 4. 내부 표면 의존(파일 수)
| 키워드 | 파일 수 |
|---|---|
| `.jsonSchema`(노드 속성) | 5 |
| `computed` | 56 |
| `&if` | 57 |
| `&active` | 8 |
| `oneOfIndex` | 22 |
| `normalizedValue` | 26 |
| `setValue(` | 134 |
| `FormTypeRendererProps` | 29 |
| `CustomFormTypeRenderer` | 8 |
| `FormGroup` | 19 |

## 5. 플러그인 패키지
ajv6 4, ajv7 4, ajv8 8(validator·datapath·transformErrors), antd-mobile·antd5·antd6·mui 0.

## 6. 벤치·릴리스
- `bench/*.bench.ts` 7(`branch-strategy-init`, `compute-recalculate`, `event-cascade`, `find-node`, `nodeFromJSONSchema`, `object-pending-read`, `render-delay`), `bench/README.md`. 스크립트 `bench`, `bench:baseline`(→ `bench/.results/baseline.json`), `bench:compare`, `bench:watch`.
- 문서: `adr/0009`, `reviews/raw-scout-perf-baseline.md`, `spikes/guard-cost/crosscheck-tinybench.mjs`.
- "release" 이름의 테스트·스크립트 없음.

## 종합(수치)
옛 표면에 묶인 부류: `&if`·`&active` 65파일, `computed` 56, `oneOfIndex` 22, `normalizedValue` 26, `.jsonSchema` 5. 공개 계약만 쓰는 부류: `<Form>` 마운트 13파일 142테스트, 플러그인 계약 테스트(`FormTypeRendererProps` 29, `CustomFormTypeRenderer` 8, `FormGroup` 19)는 이름 변경만 따라가면 된다. `setValue(` 134파일의 옵션 비트 사용은 개별 검토 필요. CI 실행 명령은 미확인.
