# U11 React 실행 결과 및 원장 관리자 인계

2026-10-03, stage-07 HEAD `1043c7f31`의 U11 작업 파일을 대상으로 실행했습니다. 설치나 git 쓰기는 하지 않았으며 기존 React 18 별칭 의존과 lockfile 변경은 유지했습니다.

| PKG에서 실행한 명령 | 결과 |
| --- | --- |
| `npx vitest run --project react18 --reporter=dot` | 실패: 70파일 중 69 통과·1 실패, 433사례 중 431 통과·2 실패(EVENT-070만) |
| `npx vitest run --project render --reporter=dot` | 실패: 70파일 중 69 통과·1 실패, 433사례 중 431 통과·2 실패 |
| `npx vitest run --project react18 --project render --reporter=dot -t "EVENT-070"` | 실패: 두 판의 layout/passive 네 단언이 watchdog에 도달 |
| `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 통과 |
| `npx eslint "src/**/*.{ts,tsx}" "stories/**/*.{ts,tsx}"` | 통과 |

`Form.reactVersions.test.tsx`의 68C-10 버전/JSX 런타임 확인 및 REACT-017·ERROR-115/116·TEST-024 StrictMode/`renderToString` 확인은 두 프로젝트에서 모두 통과했습니다(총 6사례). 두 프로젝트는 같은 `renderTests` 배열과 같은 제외 목록을 사용하며 별도 시험 제외는 없습니다.

## EVENT-070 — 원장 관리자/소유자 판정 대기

`Form.effectFeedback.test.tsx`에 스파이크의 watchdog 200회 및 React 자체 중단 단언을 그대로 이식했습니다. React 18 layout 201회·passive 202회, React 19 layout/passive 각각 201회입니다. 각 사례에서 `writes < 200` 단언이 실패합니다. 시험 완화·skip·제외 및 core의 진입 간 예산 변경은 하지 않았습니다. 설계 기록인 스파이크는 보존했습니다. React가 순환을 끊지 않는 결과이므로 EVENT-070·68C-09가 요구한 원장 관리자 판정 대상입니다.

## React 18 StrictMode 가상화 — 추가 호환성 실패를 수정함

- `src/__tests__/e2e/deferred-mount.test.tsx`: `TEST-021 intersection reveals the settled field under StrictMode` — placeholder가 관찰자에 등록되지 않아 observer가 undefined입니다.
- 같은 파일: `TEST-021 StrictMode idle backfill completes without duplicate mount changes` — 미노출 경로가 남습니다.
- `src/__tests__/scenarios/deferred-mount.strict.render.test.tsx`: `gates fields and keeps placeholders registered across the simulated remount` — 재마운트 뒤 등록 판정 실패입니다.
- 같은 파일: `idle backfill drains every placeholder after the disconnect/resume cycle` — placeholder 17개가 남습니다.

원인은 StrictMode 모의 정리에서 가상화 등록부를 비운 뒤 React 18이 DOM ref를 재생하지 않는 점입니다. `DeferrableNodeProxy`의 layout effect에서 placeholder 등록을 멱등적으로 복구하는 최소 수정을 했습니다. DETAIL 계약을 먼저 갱신했고 기존 단언을 변경하지 않았습니다. 수정 전 위 네 사례가 React 18에서 실패했으며, 수정 후 해당 두 파일은 React 18·19 모두 통과했습니다(4파일 실행, 22사례). 관찰자 등록·idle backfill 복구 외의 동작은 추가하지 않았습니다.

## 이중 인스턴스 방지

Vite 별칭과 dedupe 외에 CommonJS require도 React 18을 읽도록 optimizer에서 React/ReactDOM 및 Testing Library의 react/dom/user-event를 함께 묶었습니다. dom을 함께 묶기 전에는 user-event가 다른 dom 설정을 읽어 `act` 경고가 발생했고, 같은 번들로 묶은 후 해당 입력 시험이 통과했습니다. jsdom의 web optimizer는 `react-dom/server`를 React 18의 `server.browser` 구현으로 해석해 Node stream의 브라우저 외부화 오류를 피하며 `renderToString` API를 확인합니다.

기존 `.github/workflows/performance-benchmarks.yml`에는 의존 빌드 단계가 있고 schema-form 테스트 단계는 없었습니다. 그 빌드 직후 두 렌더 프로젝트 실행 단계를 추가했습니다. 현행 실패를 숨기지 않으므로 CI도 위 실패를 보고합니다.

브라우저의 EVENT-065 실패 및 세 통과 게이트와 소유자 확인표는 [browser-gates.md](./browser-gates.md)에 기록했습니다. U11은 전체 초록 조건과 소유자 확인을 아직 충족하지 못했습니다.
