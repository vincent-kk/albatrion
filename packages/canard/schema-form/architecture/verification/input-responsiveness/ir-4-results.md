# IR-4 — 대형 폼 지침과 virtualization SSR 하이드레이션 확인

2026-10-31. 기준은 `c49c0dc666895c599a3638d4ad5f77d6c8d878ea`입니다. 문서와 시험만 변경하며 제품 구현·공개 선언·버전은 변경하지 않습니다. **D1을 이번 단계에서 구현하지 않고 virtualization 기본값을 off로 유지하는 코디네이터 권고**에 따라 작업했습니다. D1 구현 여부와 virtualization 기본값은 아직 소유자 결정이 열려 있으며, 이 기록은 소유자의 확정 결정으로 바꾸지 않습니다.

## Part A — 실제 재현과 보존

공개 Form을 사용하는 [hydration 시험](../../../src/__tests__/e2e/virtualization.hydration.render.test.tsx)을 render(React 19)와 react18 프로젝트에서 실행했습니다. jsdom에서 IntersectionObserver를 undefined로 둔 `renderToString` 결과를 컨테이너에 넣고, 콜백을 전달하지 않는 IntersectionObserver stub을 설치한 뒤 `hydrateRoot`와 `act`로 hydration을 완료했습니다. 문자열 자식 40개, threshold 30, eagerCount 20, backfill None, validationMode None으로 idle·관찰자 reveal을 배제했습니다.

| 조건 | 서버 입력 / placeholder | hydration 뒤 입력 / placeholder | 보존된 서버 입력 | recoverable error | hydration console.error |
| --- | ---: | ---: | ---: | ---: | ---: |
| React 19, off | 40 / 0 | 40 / 0 | 40 | 0 | 0 |
| React 19, on | 40 / 0 | 20 / 20 | 0 | 1 | 0 |
| React 18, off | 40 / 0 | 40 / 0 | 40 | 0 | 0 |
| React 18, on | 40 / 0 | 20 / 20 | 0 | 24 | 2 |

on은 두 프로젝트에서 hydration mismatch 때문에 실패했습니다. React 19는 서버 HTML과 클라이언트 불일치 및 트리 재생성을 보고했고, React 18은 불일치와 전체 루트의 client rendering 전환을 보고했습니다. hydration 뒤 남은 실제 입력은 `value_0`부터 `value_19`까지이며 서버 input 노드는 하나도 재사용되지 않았습니다. 오류 개수는 이 실행의 관측값이며 React 버전 간 안정 계약으로 삼지 않습니다. 구조화한 [관측 원시](raw/ir-4/hydration-observations.json)에 명령·메시지·DOM 수와 값을 보존했습니다.

첫 실행은 의존 workspace의 dist 부재로 수집 단계에서 실패하여 증거에서 제외했습니다. 지정된 로컬 common-utils/json/react-utils/json-schema 빌드 후 같은 명령을 실행했습니다. React 18의 renderToString은 기존 useLayoutEffect 경고도 출력하므로, 서버 렌더가 끝난 시점에 console.error 수집을 비운 뒤 hydration 오류만 관찰했습니다. 이 구분을 적용하기 전 off 시험은 SSR 경고 때문에 실패했으며, 구분 적용 후 off 대조군은 두 프로젝트에서 오류 없이 서버 입력의 동일성과 값을 보존했습니다.

원인은 [Provider](../../../src/providers/VirtualizationContext/components/VirtualizationContextProvider.tsx)의 렌더 중 매니저 생성과 [매니저 create](../../../src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts)의 IO 부재 시 null 반환입니다. 서버는 전량 마운트하고, IO가 있는 클라이언트의 [useChildFields](../../../src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx)는 eagerCount 밖을 DeferredFieldProxy로 구성합니다. 서버의 전량 마운트 경로는 hydration 일치를 보장하지 않습니다.

브리프대로 결함을 고치지 않고 on 시험을 이유가 포함된 `it.skip` 설명 문자열로 보존했습니다. off 대조군은 실행되는 통과 시험입니다. 재현 시 해당 `it.skip`만 `it`로 바꾼 뒤 원시의 두 명령을 실행하면 오류와 DOM 진단을 확인할 수 있습니다. skip은 수정 완료나 지원 증거가 아닙니다. **결함 수정 전까지 서버 렌더링 페이지에서 virtualization을 켜지 않는 지침**을 유지합니다.

## Part B — 바꾼 사용자·에이전트 문서

| 문서 | 반영 내용 |
| --- | --- |
| [README](../../../README.md#virtualization-for-very-large-forms) | virtualization 절에 단계 수치와 네 가지 조절 수단을 추가하고 근거가 다른 기존 마운트 요약을 대체했습니다. |
| [영어 SPECIFICATION](../../../docs/en/SPECIFICATION.md#render-level-virtualization) | 같은 조건·비용·SSR 제한과 검증·스타일·소비자 상태 지침을 영어로 추가했습니다. |
| [한국어 SPECIFICATION](../../../docs/ko/SPECIFICATION.md#렌더-가상화-virtualization) | 같은 지침과 측정 범위를 한국어로 추가했습니다. |
| [arrays-and-scale](../../../docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md#input-responsiveness-at-scale) | 에이전트가 찾는 대형 폼 지식에 수치와 실제 SSR 결과를 영어로 추가했습니다. |

IR-1 기본값 결정 자료의 **채택 A** 마운트 중앙값을 사용했습니다. flat-500 off eager/all 51.750/51.750ms → on 31.600/174.250ms, array-1000 201.350/201.350ms → 59.200/473.100ms이며 nested-d5-f4는 89.250/89.250ms → 89.700/89.700ms입니다. 미채택 AB를 채택 결과로 인용하지 않습니다. replace-200 off 최장 55.9–64.8ms와 on ≥50ms 검출 0은 정숙 관찰을 통과한 창의 전 레인 결과입니다. IR-1 같은 창의 마운트 비교와 다른 창의 절대 수치를 섞어 효과를 계산하지 않습니다. placeholder 동안 페이지 내 검색·보조 기술·자동완성의 제한과 Focus/Select 강제 노출도 명시했습니다.

IR-2 데스크톱 Chromium flat-2000 원인 분해 진단의 약 4분의 1·중앙값 약 1.3ms/p95 약 2.9ms는 AJV 단독이 아니라 검증 실행·배달과 두 번째 React 커밋의 귀속입니다. OnRequest로 요청/제출 시 검증하는 기존 수단을 안내했습니다. `contain: strict`와 명시적 입력 크기의 레이아웃 중앙값 약 2.5→0.45ms, 단순 블록 래퍼 무효도 진단 범위로 한정했습니다. 제품 CSS는 바꾸지 않습니다.

IR-0 E의 type-onchange-state plain/transition 이벤트 처리 중앙값/p95는 0.800/5.100ms와 0.800/4.600ms이며 handler는 둘 다 0.400/0.900ms입니다. 루트 onChange 동기를 유지한 채 소비자의 상태 갱신만 startTransition으로 감싸는 예를 보였습니다. 임의의 무거운 소비자 작업을 측정했다거나 항상 빨라진다고 주장하지 않습니다.

## 미결 항목

- **IR4-SSR-01:** IO 부재 SSR과 IO 활성 hydration 사이에 virtualization 게이트가 달라 서버 DOM이 교체됩니다. known-defect skip을 활성화해 통과시킬 제품 수정은 별도 결정·작업이며 이번 범위에 포함하지 않습니다.
- **소유자 결정:** D1 구현 여부와 virtualization 기본값. 현재 단계는 코디네이터 권고인 D1 미구현·기본 off를 따릅니다.

## 관문

최종 관문 결과는 아래에 이어 기록합니다. agents-hashes는 지정 `build:hashes` 단독 명령으로 재생성하며, dist 산출물은 저장소의 기존 ignore 정책에 따라 소스 커밋에 넣지 않습니다.

### 최종 실행 결과 — 2026-10-31

| 명령·검사 | 관측 결과 |
| --- | --- |
| `yarn workspace @canard/schema-form lint` | exit 0 |
| `yarn workspace @canard/schema-form typecheck` | exit 0 |
| `yarn workspace @canard/schema-form test --run --project render` | 133파일 통과, 770통과·1skip, 실패 0 |
| `yarn workspace @canard/schema-form test --run --project react18` | 133파일 통과, 770통과·1skip, 실패 0 |
| `yarn workspace @canard/schema-form test --run --project unit src/__tests__/publicSurface.test.ts` | 1파일·2시험 통과, 97이름 공개 표면 스냅숏 유지 |
| `yarn workspace @canard/schema-form build:types` | 1054개 선언 파일, 2087개 import 보정, exit 0 |
| `yarn workspace @canard/schema-form build:hashes` | 14개 agents 자산의 manifest 생성, exit 0 |
| 독립 SHA-256 대조 | manifest의 14개 경로·내용 해시가 docs/agents 전량과 일치, `IR4_AGENT_HASHES_OK files=14` |
| 기준 대비 제품 소스·공개 선언 차분 | 새 시험 외 src 차분 0, 선언 빌드 입력 동일·시험 제외 확인, 기준 소스로 재생성한 1054개 d.ts의 경로·바이트 해시 차분 0 |
| 문서 수치·링크·기록 검사 | 대상 네 문서의 수치와 단계 링크 확인, `git diff --check` 통과, 기존 request 원문은 그대로 접두부로 보존, 추가분의 기계 로컬 경로 0 |

두 전체 렌더 프로젝트의 skip 1개는 이번에 실제 실패를 확인한 SSR 결함이며, 시험을 통과로 바꾸지 않았습니다. 전체 실행에는 기존 validator 미선택 등의 경고가 출력되었고 실패는 없었습니다. 새 skip 이후 제품/시험 본문은 변경하지 않았으므로 이 전체 실행 증거를 최종 소스에 사용했습니다.

선언 바이트 비교는 변경 상태의 dist 선언 해시를 보존한 뒤 새 시험 파일만 일시적으로 옮겨 src를 기준 커밋과 동일하게 만들고, 같은 단독 `build:types`를 실행한 결과입니다. 시험은 즉시 복원했고 1054개 선언의 경로·SHA-256이 모두 같았습니다(`IR4_DECLARATION_BYTE_DIFF_ZERO files=1054`). index.d.ts의 SHA-256은 `ed3bfe4d2c42fab94543b2afeca4f4d904e987ae7e865385116218b3d4614b3d`입니다. 선언 tsconfig가 __tests__를 제외한다는 것도 별도로 확인했습니다.

최종 arrays-and-scale 자산의 SHA-256은 `ac170c1dbb9749db547950a776881e222fd807cf57eeeb1eb4291d690b43366b`입니다. dist/agents-hashes.json은 기존 ignore 대상이고 추적된 런타임·adapter 산출물 변경이 없으므로 별도 build 커밋에 넣을 파일은 없습니다. source 커밋에는 문서·시험·관측 기록만 포함합니다. 지정한 패키지 범위 관문을 실행했으며 모노레포 전체·production·Storybook 재실행은 이번 문서/시험 인계의 관문으로 주장하지 않습니다.

판정: 브리프의 작업과 작업자 관문 완료. IR4-SSR-01과 두 소유자 결정은 열려 있으며, 코디네이터의 독립 검증과 PR 개설로 인계합니다.

### 선언 계수 정정 — 2026-10-31

위 표와 비교 설명에서 빌드 도구가 출력한 보정 대상 1054개를 전체 선언 개수로 잘못 적었습니다. 독립 경로·바이트 해시 비교의 실제 출력은 **`IR4_DECLARATION_BYTE_DIFF_ZERO files=1302`**이며 dist 하위 d.ts 1302개 전체가 동일합니다. 1054는 build:types의 import 보정 대상 파일 수이고 보정 import 수는 2087입니다. 공개 index.d.ts 해시·제품 차분 0·공개 표면 시험 판정은 그대로입니다. 앞의 1054개 전체 비교라는 표현과 marker는 이 정정으로 대체하며 기존 기록은 보존합니다.
