# IR-5 — 하이드레이션을 보존하는 렌더 가상화

기준 커밋: `be1a7986756bc326757d0d2055bd92010917ca7d`. 대상은 `@canard/schema-form`의 확인된 IR4-SSR-01 수정입니다. virtualization 기본값과 공개 export, Provider 구현은 유지합니다.

## 범위와 소유자 결정

소유자는 이번 단계에서 SSR 결함을 수정할지 아직 답하지 않았습니다. 코디네이터가 수정을 권고하여 디스패치한 범위로 진행하며, 이를 소유자의 별도 확정으로 기록하지 않습니다. 소유자의 2026-10-30 원문은 “음 허용한다. 조건과 원리를 기반으로 판단하도록 하라”, “이후 작업은 opus가 이어받도록. 판단에 대해서는 맡기겠지만, 스스로를 맹신하지 말도록. 이후는 롱턴 작업을 진행하도록 하라”입니다. 앞 문장의 원래 적용 범위 정정은 기존 request 기록을 유지합니다. D1과 가상화 기본값 판단은 이 수정에 포함하지 않습니다.

## 결함과 설계 검증자의 정정

IO 없는 서버는 입력 40개를 렌더링하지만 IO 있는 클라이언트의 첫 렌더는 eagerCount 20만 입력으로 만들고 나머지 20개를 placeholder로 만들어 하이드레이션이 실패했습니다. 일반 pinned 시험을 `it.fails`에서 `it`로 바꾼 뒤 수정 전 코드에서 React 18/19의 recoverable error, 입력 20개·placeholder 20개·서버 input 재사용 0개를 재현했습니다. off 대조군은 유지했습니다.

원래 초안은 Provider에서 `useSyncExternalStore`로 매니저를 노출하는 안이었으나, 독립 검증자는 React 18에서 문맥 값 변화가 미완료 Suspense 경계에 SyncLane 갱신을 보내 클라이언트 렌더링을 강제할 수 있어 기각했습니다. 채택안은 `useChildFields` 안에서만 서버 스냅숏 null을 읽고 Provider의 문맥 값을 고정합니다.

- 터미널 노드는 null, 브랜치는 폼 매니저를 클라이언트 스냅숏으로 반환합니다. 구독은 모듈 함수와 기존 `NOOP_FUNCTION`을 재사용합니다. 서버와 hydration 렌더는 모든 자식을 그대로 만들고, createRoot는 첫 렌더부터 기존 eager window를 적용합니다.
- React 18 StrictMode는 hydration 뒤 스냅숏 재렌더 전에 effect 정리를 재실행하므로 `cache.clear()` 정리를 제거합니다. 캐시는 실제 훅 인스턴스 수명과 함께 회수되며, 실제 언마운트 뒤의 별도 전역 보유는 없습니다.
- 유효 매니저가 null이지만 폼 매니저가 존재할 때 만든 자식은 layout effect에서 노출 원장에 기록합니다. remount·enabled 전환·입력 변경 뒤에도 이미 하이드레이션한 노드를 다시 지연하지 않습니다. 이후 추가한 항목은 새 게이트 판정을 받습니다.
- IO 부재 경고는 window가 있는 브라우저에서만 출력합니다. 경고 설명은 전체 eager 대체와 지원되는 SSR 동작을 안내합니다.

시간·메모리 비용: 훅마다 안정된 snapshot 콜백과 React 외부 저장소 구독 상태가 추가되고, hydration 뒤 한 번 클라이언트 스냅숏으로 따라잡습니다. 노출 기록은 기존 WeakSet을 재사용하며 새 전역 레지스트리를 만들지 않습니다. 터미널은 스냅숏이 계속 null이어서 매니저 활성화 재렌더를 받지 않습니다. 별도 성능 수치는 이 단계에서 측정하지 않았습니다.

## 수정한 문서

FieldInputSlot DETAIL과 VirtualizationManager INTENT·DETAIL을 구현 전에 갱신했습니다. README, 영어·한국어 SPECIFICATION, QUICK_REFERENCE, 에이전트 arrays-and-scale 지식, 패키지 CLAUDE의 CSR 전용 제한을 새 동작으로 바꿨습니다. 서버 필드는 그대로 하이드레이션하고 이후 추가한 브랜치·자식에만 게이팅하며, React 18 사용자 브랜치 입력 내부 Suspense의 잔여 위험을 명시합니다. 기존 IR-4 결과와 request의 과거 기록은 수정하지 않습니다.

## 회귀 시험과 실패 관찰

`src/__tests__/e2e/virtualization.hydration.render.test.tsx`는 off 대조군, 일반 on, StrictMode, 중첩 40자식 remount, 40항목 배열 push, 사용자 브랜치 Suspense, createRoot 첫 커밋, enabled 전환, 입력 교체의 9개 시험을 실행합니다. 일반·StrictMode는 서버 DOM identity와 값을 보존하고 placeholder·recoverable error가 없음을 확인합니다. 배열 push는 기존 40개를 보존하면서 /40 항목만 지연하고 값 41개는 모두 유지합니다. CSR 첫 layout 관측은 입력 20개·placeholder 20개입니다.

React 18 수정 전 제품 코드로 9개 시험을 실행하면 6개가 원래 결함으로 실패하고, off·CSR·잔여 위험 기대 실패는 통과합니다. 환경 경고 시험은 수정 전 서버의 잘못된 경고와 mismatch 문구로 2개 실패·1개 통과했습니다. 독립 회귀 강도 확인으로 cache.clear만 복원하면 StrictMode의 input identity 기대가 실패하고, 노출 원장 기록만 제거하면 중첩 remount·enabled 전환에서 입력이 40→20으로 줄어 실패했습니다. 모든 탐침은 지정된 변경 파일에만 적용하고 즉시 복원했습니다.

초기 시험 수집은 새 worktree의 로컬 workspace dist 부재로 실패했습니다. 기존 common-utils/json/json-schema/react-utils 빌드로 준비했고 설치나 의존 버전 변경은 없었습니다. 사용자 Suspense 픽스처는 처음에 unanchored 입력 맵이 자식까지 매칭하여 서버 입력이 0개였으므로, `^/nested$`로 범위를 고친 뒤 실제 서버 입력 40개 조건에서 재검증했습니다. 이 준비 실패를 결함 재현이나 잔여 위험으로 세지 않습니다.

## 잔여 위험 — IR5-SUSPENSE-18

React 19는 사용자 브랜치 입력 내부 Suspense까지 recoverable error 없이 서버 DOM을 보존합니다. React 18은 서버 입력 40개가 존재하는 조건에서 다음 오류를 보고합니다: `This Suspense boundary received an update before it finished hydrating. This caused the boundary to switch to client rendering.` 해당 정상 동작 기대만 React 18에서 `it.fails`로 실행하고 React 19·verify-render에서는 일반 `it`로 실행합니다. 이는 결함 해결 증거가 아니라 계속 관찰하는 잔여 위험입니다. Provider는 수정하지 않았습니다.

## 순차 관문

지정 순서로 한 번에 한 프로젝트만 실행하며 결과는 아래에 이어 기록합니다. 기본 모노레포 전체 명령 대신 대상 workspace의 지정 관문을 사용합니다. 선언 기준은 제품 구현 수정 전 동일한 로컬 도구로 생성한 1302개 d.ts의 경로·SHA-256으로 보존했습니다. 배포 dist는 기존 ignore 대상이며 추적된 runtime·adapter가 없으면 강제로 추가하지 않습니다. 빌드 산출물이 추적되어 변경되는 경우에만 소스와 분리한 빌드 커밋으로 보존합니다.

### 준비 관문 보완

첫 전체 unit 실행은 608파일·4011시험이 통과했으나, 선언만 있는 dist에서 buildOutputs 시험이 runtime index.mjs를 찾지 못해 1개 실패했습니다. 이 실행은 통과 관문으로 세지 않습니다. strict production도 빌드 번들을 요구하므로, 로컬 전체 빌드를 준비 단계에 추가하고 unit부터 지정 순서를 다시 시작합니다. 최종 build 관문은 그 순서 끝에서도 따로 실행합니다. 시험 기대나 스킵 조건은 바꾸지 않습니다.

잔여 위험 시험은 정적 도구가 시험 하나를 열거할 수 있도록 일반 `it`에 프로젝트별 `fails` 옵션을 전달합니다. React 18에서만 `it.fails`와 동일한 기대 실패로 실행되며 React 19는 일반 성공을 요구합니다.

### 최종 순차 관문 실행

| 순서 | 명령·검사 | 결과 |
| --- | --- | --- |
| 1 | `yarn workspace @canard/schema-form test --run --project unit --reporter=dot` | 609파일 통과, 4012통과·1todo, 실패 0, exit 0 |
| 2 | `yarn workspace @canard/schema-form test --run --project render --reporter=json` | 133파일 통과, 778통과, 실패 0, exit 0 |
| 3 | `yarn workspace @canard/schema-form test --run --project react18 --reporter=json` | 133파일 통과, 778통과(이 중 IR5-SUSPENSE-18 기대 실패 1개), 실패 0, exit 0 |


### 공개 JSDoc 범위 보완 — 코디네이터 답변

공개 virtualization prop의 원본 JSDoc에도 SSR 금지 설명이 남아 있어 질문했고, 코디네이터가 현재 동작으로 고치도록 승인했습니다. Provider와 공개 이름·타입·시그니처는 유지합니다. 최종 선언 관문은 **exports·types·signatures 의미 차이 0**으로 판정하고, `components/Form/components/FormCore/types/props.d.ts`의 JSDoc 주석 바이트 차이를 별도로 공개합니다. 소유자의 별도 단계 결정이 미응답인 사실은 그대로입니다.

의존 workspace 빌드 전의 최초 선언은 같은 환경 대조로 쓸 수 없었습니다. 의존 준비 후 기준 훅 소스를 복원하여 선언 1307개를 다시 생성·보존했고 훅을 즉시 복구했습니다. 최종 비교는 이 동일한 해석 환경에서 공개 진입점이 참조하는 선언을 순회하여 수행합니다. 사설 훅과 경고 포매터의 주석 차이는 공개 계약에 포함하지 않습니다.

두 render 프로젝트에서 기존 deferred-mount·StrictMode·DeferredFieldProxy 명령·rekey·controls-focus·features-scale/composite·매니저 시험에 해당하는 10파일·74시험이 각각 통과함을 JSON 보고서에서 대조했습니다. 수정된 virtualization 시험 파일은 hydration 회귀 하나뿐이며, 나머지 기존 파일에는 차분이 없습니다.

| 순서 | 명령·검사 | 결과 |
| --- | --- | --- |
| 4 | `yarn workspace @canard/schema-form test:verify --run --reporter=json` | verify-unit·verify-render 합계 747파일 통과, 4834통과·1todo, 실패 0, exit 0 |
| 5 | `yarn workspace @canard/schema-form test --run --project storybook --reporter=json` | Chromium 단독 실행, 100파일·251통과, 실패 0, exit 0 |
| 6 | `yarn workspace @canard/schema-form test:production` | 10파일·21시험 통과, 실패 0, oneOf-20 distinct freeze 111(기존 상한 유지), exit 0 |
| 7 | `yarn workspace @canard/schema-form lint` | exit 0 |
| 8 | `yarn workspace @canard/schema-form typecheck` | exit 0 |
| 9 | `yarn workspace @canard/schema-form build` | runtime 세 형식·development flag·gate selection 검사·선언·14개 agents 해시·typecheck 모두 exit 0 |
| 10 | 공개 선언 그래프·토큰 대조 | 진입점에서 도달하는 308개 선언의 export·타입·시그니처 의미 차이 0, 해석 실패 0. 공개 바이트 차이는 props.d.ts의 SSR JSDoc 한 곳뿐 |

공개 바이트 차이 경로는 `components/Form/components/FormCore/types/props.d.ts`이며 CSR 전용 금지 설명을 서버 필드 보존·이후 추가분 게이팅·React 18 사용자 Suspense 제한으로 바꾼 주석만 다릅니다. 루트 index와 공개 이름 97개는 유지됩니다. 사설 useChildFields의 hydration 설명은 공개 선언 그래프 밖에 있습니다.

## FCA 대조와 빌드 산출물

`filid:scan`의 facts bootstrap → scan summary → documents/nodes/entry-points/boundaries/dag/verification 전체 validate → verification files를 기준·수정 각각 실행했습니다. 기준은 같은 worktree에서 이 작업의 변경 파일만 원래 HEAD 바이트로 되돌린 상태이며, 별도 백업한 수정 바이트는 검사 직후 전량 복원하고 일치시켰습니다. facts는 기준 1672개·수정 1673개를 exact로 채웠고 미해결·거절·attestation 대기는 0입니다.

| FCA 지표 | 기준 | 수정 | 새 항목 |
| --- | ---: | ---: | ---: |
| scan violation | 201 | 201 | 0 |
| validate finding | 202 | 202 | 0 |
| verification violation | 21 | 21 | 0 |
| diagnostics | 177 | 177 | 0 |

스냅숏은 기준 `bb15e3388cb4b1bc70b0eec78ca1a71a625e4e3e52d9592a2afa62c70bf59f3b`, 수정 `aee7a35b7f96ed432c49fed43dfe9c8ce63d8ed0f4754c313e59268e9aa8ce00`이며 각 상태의 세 호출은 같은 hash를 공유합니다. validate의 202개는 warning 200·info 1·error 1입니다. 기존 error는 FieldProxy → FieldInputSlot → FieldProxy 순환입니다. 기존 문서 진단 177개와 동적 시험 열거의 불확정 증거도 남습니다. 도구의 두 상태는 모두 indeterminate이며, 확인된 기존 순환을 포함하므로 전체 감사의 절대 판정은 FAIL입니다. 이번 브리프의 **기준 대비 새 finding·diagnostic 0 관문만 통과**했다고 판정하며 전체 구조가 깨끗하다고 주장하지 않습니다. 새 시험 두 파일은 9·3케이스로 exact 판정되어 상한 안입니다.

[대조표](raw/ir-5/fca-comparison.json)와 같은 디렉터리의 압축 원본 6개는 기계 경로를 package:/repo:로 정규화한 증거입니다. [관문 집계](raw/ir-5/gate-results.json)에 실제 통과 수와 공개 선언 검사 범위를 보존했습니다. 기존 기록은 고치지 않았습니다.

최종 build가 runtime 세 형식, 전체 선언, agents-hashes를 재생성했습니다. 14개 agents 자산의 실제 경로·SHA-256을 manifest와 전량 대조했고 일치했습니다. dist와 agents-hashes는 기존 ignore 대상이며 추적된 runtime·adapter 변경은 0입니다. 따라서 소스 커밋과 섞일 빌드 변경이 없고 별도 build 커밋을 만들 파일도 없습니다. 산출물을 강제로 추적하지 않습니다.

## 인계 범위

일반·StrictMode hydration의 IR4-SSR-01은 수정되어 서버 input을 보존합니다. IR5-SUSPENSE-18은 React 18에 남아 있으며 공개 문서와 JSDoc에 명시했습니다. 새 분기·자식의 게이팅과 기존 CSR 동작은 유지합니다. 코디네이터는 기준 HEAD부터 최종 HEAD까지의 제품·문서·회귀 시험을 두 명의 독립 검토자에게 검토시키고 PR을 개설합니다. 검토자는 루트 AGENTS와 패키지 CLAUDE, 각 소유 INTENT/DETAIL, 이 문서의 지정 workspace 검증 명령을 기준으로 판단해야 합니다. 소유자의 이번 단계 수정 여부와 기존 D1·기본값 결정은 계속 열려 있습니다.

인계 전 검사에서 변경 25개 파일(압축 증거는 풀어서 검사)에 기계 로컬 경로가 없고, Provider·공개 index와 추적된 runtime·adapter에는 차분이 없음을 확인했습니다. request의 기존 바이트 접두부를 보존했고 결과 기록은 이어 쓰기만 했습니다. FCA 감사는 Scan complete: 202 findings이며 새 finding·diagnostic은 0입니다.
