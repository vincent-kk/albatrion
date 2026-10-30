# IR-5 — 하이드레이션을 보존하는 렌더 가상화

기준 커밋: `be1a7986756bc326757d0d2055bd92010917ca7d`. 대상은 `@canard/schema-form`의 확인된 IR4-SSR-01 수정입니다. virtualization 기본값과 공개 export, Provider 구현은 유지합니다.

## 범위와 소유자 결정

소유자는 이번 단계에서 SSR 결함을 수정할지 아직 답하지 않았습니다. 코디네이터가 수정을 권고하여 디스패치한 범위로 진행하며, 이를 소유자의 별도 확정으로 기록하지 않습니다. 소유자의 2026-10-30 원문은 “음 허용한다. 조건과 원리를 기반으로 판단하도록 하라”, “이후 작업은 opus가 이어받도록. 판단에 대해서는 맡기겠지만, 스스로를 맹신하지 말도록. 이후는 롱턴 작업을 진행하도록 하라”입니다. 앞 문장의 원래 적용 범위 정정은 기존 request 기록을 유지합니다. D1과 가상화 기본값 판단은 이 수정에 포함하지 않습니다.

## 결함과 설계 검증자의 정정

IO 없는 서버는 입력 40개를 렌더링하지만 IO 있는 클라이언트의 첫 렌더는 eagerCount 20만 입력으로 만들고 나머지 20개를 placeholder로 만들어 하이드레이션이 실패했습니다. 일반 pinned 시험을 `it.fails`에서 `it`로 바꾼 뒤 수정 전 코드에서 React 18/19의 recoverable error, 입력 20개·placeholder 20개·서버 input 재사용 0개를 재현했습니다. off 대조군은 유지했습니다.

원래 초안은 Provider에서 `useSyncExternalStore`로 매니저를 노출하는 안이었으나, 독립 검증자는 React 18에서 문맥 값 변화가 아직 하이드레이션되지 않은 Suspense 경계에 SyncLane 갱신을 보내 클라이언트 렌더링을 강제할 수 있어 기각했습니다. 채택안은 `useChildFields` 안에서만 서버 스냅숏 null을 읽고 Provider의 문맥 값을 고정합니다.

- 터미널 노드는 null, 브랜치는 폼 매니저를 클라이언트 스냅숏으로 반환합니다. 구독은 모듈 함수와 기존 `NOOP_FUNCTION`을 재사용합니다. 서버와 hydration 렌더는 모든 자식을 그대로 만들고, createRoot는 첫 렌더부터 기존 eager window를 적용합니다.
- React 18 StrictMode는 hydration 커밋 뒤 effect 정리를 재실행하므로 `cache.clear()` 정리를 제거합니다. 캐시는 실제 훅 인스턴스 수명과 함께 회수되며, 실제 언마운트 뒤의 별도 전역 보유는 없습니다.
- 폼 매니저가 있고 실제 입력이 마운트한 슬롯은 기존 입력 commit layout effect에서 자신의 노드를 노출 원장에 기록합니다. remount·enabled 전환 뒤에도 이미 하이드레이션한 노드를 다시 지연하지 않습니다. 이후 추가한 항목은 새 게이트 판정을 받습니다.
- IO 부재 경고는 window가 있는 브라우저에서만 출력합니다. 경고 설명은 전체 eager 대체와 지원되는 SSR 동작을 안내합니다.

시간·메모리 비용: 훅마다 안정된 snapshot 콜백과 React 외부 저장소 구독 상태가 추가되고, layout에서 hydration을 기록하여 passive 검사에는 null 스냅숏을 유지하고 추가 렌더를 만들지 않습니다. 노출 기록은 기존 WeakSet을 재사용하며 새 전역 레지스트리를 만들지 않습니다. 최초 인계에서는 마운트 비용을 측정하지 않았으며 round 2의 실제 브라우저 비용 대조를 아래에 따로 기록합니다.

## 수정한 문서

FieldInputSlot DETAIL과 VirtualizationManager INTENT·DETAIL을 구현 전에 갱신했습니다. README, 영어·한국어 SPECIFICATION, QUICK_REFERENCE, 에이전트 arrays-and-scale 지식, 패키지 CLAUDE의 CSR 전용 제한을 새 동작으로 바꿨습니다. 서버 필드는 그대로 하이드레이션하고 이후 추가한 브랜치·자식에 게이팅합니다. 최초 인계는 React 18 내부 Suspense 잔여 위험을 명시했고 round 2에서 하이드레이션 자체의 추가 렌더 없음으로 바꿨습니다. 기존 IR-4 결과와 request의 과거 기록은 수정하지 않습니다.

## 회귀 시험과 실패 관찰

`src/__tests__/e2e/virtualization.hydration.render.test.tsx`는 off 대조군, 일반 on, StrictMode, 중첩 40자식 remount, 40항목 배열 push, 사용자 브랜치 Suspense, createRoot 첫 커밋, enabled 전환과 문턱 미만 배열 항목 보존·숨김 항목의 실제 commit 구별 두 모드의 12개 시험을 실행합니다. 별도의 슬롯 소유 시험은 일반·StrictMode에서 hydration 커밋 뒤 슬롯과 사용자 입력의 추가 렌더가 없음을 확인합니다. 일반·StrictMode는 서버 DOM identity와 값을 보존하고 placeholder·recoverable error가 없음을 확인합니다. 배열 push는 기존 40개를 보존하면서 /40 항목만 지연하고 값 41개는 모두 유지합니다. CSR 첫 layout 관측은 입력 20개·placeholder 20개입니다.

React 18 수정 전 제품 코드로 9개 시험을 실행하면 6개가 원래 결함으로 실패하고, off·CSR·잔여 위험 기대 실패는 통과합니다. 환경 경고 시험은 수정 전 서버의 잘못된 경고와 mismatch 문구로 2개 실패·1개 통과했습니다. 독립 회귀 강도 확인으로 cache.clear만 복원하면 StrictMode의 input identity 기대가 실패하고, 노출 원장 기록만 제거하면 중첩 remount·enabled 전환에서 입력이 40→20으로 줄어 실패했습니다. 모든 탐침은 지정된 변경 파일에만 적용하고 즉시 복원했습니다.

초기 시험 수집은 새 worktree의 로컬 workspace dist 부재로 실패했습니다. 기존 common-utils/json/json-schema/react-utils 빌드로 준비했고 설치나 의존 버전 변경은 없었습니다. 사용자 Suspense 픽스처는 처음에 unanchored 입력 맵이 자식까지 매칭하여 서버 입력이 0개였으므로, `^/nested$`로 범위를 고친 뒤 실제 서버 입력 40개 조건에서 재검증했습니다. 이 준비 실패를 결함 재현이나 잔여 위험으로 세지 않습니다.

## 최초 인계의 IR5-SUSPENSE-18과 round 2 수정

최초 인계에서는 React 19만 사용자 브랜치 입력 내부 Suspense의 DOM을 보존했고, React 18은 `This Suspense boundary received an update before it finished hydrating`를 보고하여 기대 실패로 유지했습니다. 독립 검토는 이 갱신이 라이브러리의 null→manager passive 일관성 검사에서 비롯됨을 지적했습니다. Round 2는 layout ref로 검사 값 null을 유지하여 이 추가 렌더를 없앴고, 같은 시험을 React 18에서도 일반 `it`로 복구했습니다. 아래의 최초 인계 관문 수치는 당시 기대 실패를 포함하는 역사이며 round 2와 round 3의 최종 증거는 각 절의 관문입니다.

## 순차 관문

지정 순서로 한 번에 한 프로젝트만 실행하며 결과는 아래에 이어 기록합니다. 기본 모노레포 전체 명령 대신 대상 workspace의 지정 관문을 사용합니다. 선언 기준은 제품 구현 수정 전 동일한 로컬 도구로 생성한 1302개 d.ts의 경로·SHA-256으로 보존했습니다. 배포 dist는 기존 ignore 대상이며 추적된 runtime·adapter가 없으면 강제로 추가하지 않습니다. 빌드 산출물이 추적되어 변경되는 경우에만 소스와 분리한 빌드 커밋으로 보존합니다.

### 준비 관문 보완

첫 전체 unit 실행은 608파일·4011시험이 통과했으나, 선언만 있는 dist에서 buildOutputs 시험이 runtime index.mjs를 찾지 못해 1개 실패했습니다. 이 실행은 통과 관문으로 세지 않습니다. strict production도 빌드 번들을 요구하므로, 로컬 전체 빌드를 준비 단계에 추가하고 unit부터 지정 순서를 다시 시작합니다. 최종 build 관문은 그 순서 끝에서도 따로 실행합니다. 시험 기대나 스킵 조건은 바꾸지 않습니다.

잔여 위험 시험은 정적 도구가 시험 하나를 열거할 수 있도록 일반 `it`에 프로젝트별 `fails` 옵션을 전달합니다. React 18에서만 `it.fails`와 동일한 기대 실패로 실행되며 React 19는 일반 성공을 요구합니다.

### 최초 인계 순차 관문 실행 (round 1)

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

일반·StrictMode hydration의 IR4-SSR-01은 수정되어 서버 input을 보존합니다. 최초 인계에 남은 IR5-SUSPENSE-18은 round 2에서 추가 렌더의 원인을 제거하고 일반 성공 시험으로 검증합니다. 새 분기·자식의 게이팅과 기존 CSR 동작은 유지합니다. 코디네이터는 기준 HEAD부터 최종 HEAD까지의 제품·문서·회귀 시험을 두 명의 독립 검토자에게 검토시키고 PR을 개설합니다. 검토자는 루트 AGENTS와 패키지 CLAUDE, 각 소유 INTENT/DETAIL, 이 문서의 지정 workspace 검증 명령을 기준으로 판단해야 합니다. 소유자의 이번 단계 수정 여부와 기존 D1·기본값 결정은 계속 열려 있습니다.

인계 전 검사에서 변경 25개 파일(압축 증거는 풀어서 검사)에 기계 로컬 경로가 없고, Provider·공개 index와 추적된 runtime·adapter에는 차분이 없음을 확인했습니다. request의 기존 바이트 접두부를 보존했고 결과 기록은 이어 쓰기만 했습니다. FCA 감사는 Scan complete: 202 findings이며 새 finding·diagnostic은 0입니다.

## Round 2 — 추가 렌더 제거와 노출 원장 보완

독립 검토의 P1과 원장 범위를 코드에서 확인하고 승인된 설계를 적용했습니다. 로컬 React 18.3.1의 `mountSyncExternalStore`는 hydration 때 서버 스냅숏을 저장하고 passive `updateStoreInstance`에서 Object.is로 현재 getter와 대조합니다. commitRootImpl은 layout effect 뒤 passive effect를 실행합니다. React 19.2.6의 같은 함수와 flushLayoutEffects→flushPassiveEffects도 이 순서를 지킵니다. 따라서 layout에서 hydratedRef를 설정하고 getter를 null로 유지하면 저장한 null과 일치하여 동기 갱신을 만들지 않습니다. CSR은 첫 snapshot부터 매니저이며 기존 게이팅이 유지됩니다.

슬롯의 useSyncExternalStore는 hydration 감지에만 사용합니다. 이후 실제 자식 변경 렌더는 ref와 폼 매니저로 게이팅하며 목록 메모는 snapshot에 의존하므로 hydration 완료만으로 재계산되지 않습니다. 실제 입력으로 커밋한 모든 ungated 자식은 노출 원장에 기록하고, placeholder의 실제 노출은 기존 DeferredFieldProxy가 기록합니다. 문턱 미만 첫 항목도 remount 뒤 다시 지연하지 않습니다.

실패 우선 검증: round 1 코드에서 슬롯/사용자 입력은 일반 hydration 커밋 1→최종 2, StrictMode 2→4였고 React 18 내부 Suspense가 지정 recoverable error로 실패했습니다. threshold 2·eagerCount 0·backfill None의 빈 배열에 두 번 push한 뒤 remount하면 먼저 노출한 항목까지 지연하여 CSR·hydration 두 시험 모두 실패했습니다. 수정 후에는 두 버전에서 일반 1→1·StrictMode 2→2, Suspense 일반 성공, 두 threshold 사례 일반 성공입니다. `FieldInputSlot/DETAIL.md` 계약은 제품 구현 전에 별도 커밋 b4dfc18cb로 남겼습니다.

삭제한 시험은 fieldInputMap 변경을 시도했으나 Provider가 최초 값을 고정하므로 실제 입력 전환을 만들지 못했습니다. 이 시험이 증명하지 않은 주장을 본 기록과 요청 행, DETAIL에서 정정했습니다. 첫 인계의 9개·778개 수치는 당시 실행 역사로 유지하며 무효 사례 1개가 포함된 수치이고, 최종 round 2 결과는 아래에 따로 기록합니다.

## 미결 — 이 단계에서 수정하지 않는 기존 결함

아래 항목은 독립 검토와 코드 대조에서 확인한 기존 경로이며 이번 범위에서 변경하지 않습니다. 별도 재현·수정·검증이 필요합니다.

| 미결 | 코드 근거 | 제안한 수정 |
| --- | --- | --- |
| 폐기 렌더의 게이트 결정이 캐시에 남음 | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:141`의 렌더 중 cache.set | 렌더별 사본으로 구성하고 커밋에서만 보유 캐시에 반영합니다. |
| 제거된 가지의 엔트리 잔존과 장기 생존 배열 캐시 증가 | 같은 파일 `:79`의 Map 보유와 `:141`의 삽입, 삭제 경로 부재 | 커밋 시 살아 있는 자식으로 pruning하거나 별도 단조 key와 WeakMap을 사용합니다. |
| 상태를 유지하는 Fast Refresh에서 옛 자식 closure 보유 | 같은 파일 `:88`의 CachedComponent 재사용, `packages/winglet/react-utils/src/hooks/useLazyConstant.ts:67` | 개발 재해석 세대별 컴포넌트 갱신 또는 안정된 컴포넌트가 최신 커밋 값을 읽도록 구조를 바꿉니다. |
| push와 같은 batch의 새 항목 focus/select가 구독 전에 소실 | `src/components/FieldProxy/components/DeferredFieldProxy/DeferredFieldProxy.tsx:46`, `src/core/engine/write/utils/entry/dispatchRequest.ts:31`, `src/hooks/fieldNode/useFieldNodeSubscribe.ts:57` | 노드별 미소비 명령을 기록하고 구독 직후 catch-up하거나 커밋까지 명령을 지연합니다. |
| useReference의 렌더 중 공유 ref 쓰기 | useChildFields `:111`, `packages/winglet/react-utils/src/hooks/useReference.ts:92`, `src/components/FieldProxy/components/FieldInputSlot/FieldInputSlot.tsx:87` | 이벤트가 읽는 값은 커밋 시점에 갱신하는 ref 또는 커밋을 보장하는 이벤트 핸들 구조로 전환합니다. |
| 하이드레이션 때 준비하고 나중에 첫 렌더한 자식의 게이트 생략 | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:96`의 준비 시 deferredManager 고정과 캐시 재사용 | 게이트를 자식의 최초 실제 마운트에서 판정하고 자식별 hydration 감지로 지연된 Suspense hydration도 구별합니다. 이번 단계에서는 수정하지 않습니다. |

## Round 2 마운트 창 이력

첫 7c91c45ee 창은 여섯 비율이 통과했으나 별도 layout effect의 기존 mount-count 위반으로 제품 수정이 필요했습니다. 코디네이터 승인에 따라 이 창을 최종 비용 증거에서 제외하고 [superseded 원시](raw/ir-5-round2/superseded-window-1/round2-complete.json)를 보존했습니다. 값이나 표본은 바꾸지 않았습니다.

## Round 2 첫 관문 시도 — superseded

| 순서 | 명령·검사 | 결과 |
| --- | --- | --- |
| 1 | `test --run --project unit` | 609파일·4012통과·1todo, 실패 0 |
| 2 | `test --run --project render` | 134파일 중 780통과·1실패: arrayMountLayoutEffects가 기존 400회를 기대했으나 새 effect 때문에 600회, 이 시도를 최종 통과로 세지 않음 |

기존 항목당 두 layout effect 계약에 대해 코디네이터가 선택 1을 승인했습니다. 새 effect를 없애고 hydration commit ref를 기존 입력 commit effect에 전달하여 원래 terminalChildren commit 다음에 ref를 기록합니다. CSR의 manager snapshot에는 ref를 전달하지 않습니다. 원래 arrayMountLayoutEffects 기대와 DETAIL의 항목당 2회 계약은 고치지 않았습니다. 수정 뒤 두 React 버전에서 hydration 10개·렌더 수 2개·기존 layout-count 1개, 총 26개 한정 시험이 일반 통과했습니다.

첫 창의 여섯 비율은 당시 7c91c45ee 소스의 측정으로 모두 통과했으나 제품 통합 수정 때문에 최종 비용 증거에서 제외합니다. 원시는 superseded-window-1에 그대로 보존하며 코디네이터 지시에 따라 새 frozen E5와 새 창을 한 번 실행합니다. 최종 관문도 unit부터 다시 시작합니다.

## Round 2 제품의 마운트 비용 — round 3에서 superseded

E4는 be1a79867의 동일한 불변 product/browser bundle을 재사용했고, E5는 기존 commit effect에 통합한 69251a950의 새 bundle입니다. 생산 React 19.2.6·Chromium의 기존 IR-0/IR-1 mountFixture·samplePageWithCpu를 재사용했습니다. 코디네이터가 승인한 새 창은 paired relative로 각 행의 E4/E5 순서를 교차하며 레인마다 3예열·10새페이지(총 36예열·120채택)를 한 번만 실행했고 테스트·빌드는 겹치지 않았습니다. 사전 등록 기준은 off mount-wall, on eager-paint의 레인별 중앙값 비율 E5/E4 ≤1.02입니다.

| 폼 | 가상화 | 지표 | E4 중앙값 ms | E5 중앙값 ms | E5/E4 | 판정 |
| --- | --- | --- | ---: | ---: | ---: | --- |
| flat-500 | off | wallMs | 50.650 | 51.150 | 1.009872 | 통과 |
| flat-500 | on | eagerPaintedMs | 30.700 | 31.550 | 1.027687 | FAIL |
| nested-d5-f4 | off | wallMs | 88.150 | 88.900 | 1.008508 | 통과 |
| nested-d5-f4 | on | eagerPaintedMs | 87.250 | 87.650 | 1.004585 | 통과 |
| array-1000 | off | wallMs | 199.750 | 200.650 | 1.004506 | 통과 |
| array-1000 | on | eagerPaintedMs | 58.750 | 57.950 | 0.986383 | 통과 |

flat-500 on만 1.027687로 사전 등록 상한을 넘었습니다. +0.850ms이며 허용 상한 31.314ms 대비 E5는 31.550ms입니다. 시작 30초 관찰에서 XProtectRemediatorPirrit(pid 7626)가 58.417351%로 30%를 초과했습니다. paired relative 창으로 보존하고 부하로 행을 삭제하거나 통과로 바꾸지 않았습니다. 최초 질문에는 이전 창의 CPU 초과0을 잘못 적어 즉시 같은 스레드에 실제 초과1을 정정했습니다. 비율·중앙값은 별도 Python 계산으로 원시와 일치함을 확인했습니다.

[공식 집계](raw/ir-5-round2/round2-complete.json), [156페이지 원시](raw/ir-5-round2/mount-pages.json.gz), [frozen 입력](raw/ir-5-round2/inputs.json), [실행기](raw/ir-5-round2/run-mount.mts)에 완료·CPU·hash를 보존합니다. 새 창은 이전 창과 다른 제품이므로 이전 통과 값으로 대체하지 않습니다. 상한 초과 질문을 보내고 독립적인 순차 검증은 unit부터 다시 진행했습니다. 이어지는 코디네이터 답변과 결정은 아래에 기록했습니다.

### 마운트 FAIL 인계 결정과 보조 구간

코디네이터는 최종 제품을 유지하고 추가 측정·튜닝 없이 flat-500 on 행을 사전 등록 규칙의 FAIL로 명시하여 단계 브랜치 PR로 인계하도록 승인했습니다. 소유자에게는 코디네이터가 별도 예외 결정을 요청하며, 이번 승인이 소유자의 예외 수락은 아닙니다. 따라서 비용 관문을 모두 통과했다고 주장하지 않습니다.

기존 원시만으로 같은 index의 E4/E5 페이지를 짝지은 eager-paint 비율 10개와 그 **짝 비율 중앙값**의 percentile bootstrap 95% 구간을 계산했습니다. 20,000회, 고정 seed 460502, 한 번 뽑을 때 짝 비율 10개를 복원추출했으며 보간은 type-7입니다. 이 보조 통계는 사전 등록한 **레인별 중앙값의 비율**을 대체하지 않습니다.

| 페이지 index | 최종 창 E5/E4 | superseded 첫 창 E5/E4 |
| --- | ---: | ---: |
| 0 | 1.013158 | 1.035256 |
| 1 | 0.975232 | 1.016129 |
| 2 | 1.149837 | 1.000000 |
| 3 | 1.101307 | 1.012903 |
| 4 | 1.094771 | 1.012821 |
| 5 | 1.003257 | 1.019481 |
| 6 | 0.990323 | 1.038462 |
| 7 | 1.019355 | 0.975309 |
| 8 | 0.983871 | 1.006390 |
| 9 | 1.105611 | 1.000000 |

| 창 | 규칙의 중앙값 비율 | 짝 비율 중앙값 | bootstrap 95% 구간 | 구간이 1.02를 배제하는가 |
| --- | ---: | ---: | --- | --- |
| final | 1.027687 | 1.016256 | [0.990323, 1.101307] | 아니요 |
| superseded-window-1 | 1.009615 | 1.012862 | [1.000000, 1.025693] | 아니요 |

두 구간 모두 1.02를 포함합니다. **최종 창의 규칙 점추정 1.027687는 여전히 FAIL**이며 구간이 이를 통과로 바꾸지는 않습니다. 두 head의 이 행에서는 처음 노출되는 슬롯(루트·eager 입력)만 useChildFields를 실행하고, 최종 folded 버전은 슬롯마다 layout effect 하나를 없애 동일한 ref 쓰기를 기존 commit에 합칩니다. 첫 창이 더 많은 effect를 실행하면서 1.009615였던 관측도 함께 보존하며, 이를 최종 실패를 지우는 근거로 쓰지 않습니다. [계산 결과](raw/ir-5-round2/paired-bootstrap.json)와 [실행기](raw/ir-5-round2/bootstrap-pairs.py)로 재현할 수 있습니다.

## Round 2 최종 순차 관문

| 순서 | 명령·검사 | 결과 |
| --- | --- | --- |
| 1 | `test --run --project unit` | 609파일·4012통과·1todo, 실패 0 |
| 2 | `test --run --project render` | 134파일·781통과(새 Suspense 회귀는 일반 it), 실패 0; 기존 layout-count 기대 유지 |
| 3 | `test --run --project react18` | 134파일·781통과(새 Suspense 회귀는 일반 it), 실패 0; Suspense 기대 실패 없음 |
| 4 | `test:verify --run` | 748파일·4837통과·1todo, 실패 0 |
| 5 | Storybook Chromium 단독 | 100파일·251통과, 실패 0 |
| 6 | 엄격 `test:production` | 10파일·21통과, 실패 0; oneOf-20 freeze 111, 기존 상한 유지 |
| 7 | `lint` | exit 0 |
| 8 | `typecheck` | exit 0 |
| 9 | 최종 `build` | runtime·선언·development/gate-selection 검사·agents 해시·typecheck exit 0; E5 frozen product와 runtime SHA-256 일치 |
| 10 | 공개 선언 의미 대조 | 도달 선언 308개·의미 차이 0·해석 실패 0; 승인한 props JSDoc 주석 한 곳만 바이트 차이 |
| 11 | FCA facts bootstrap·scan·6범위 validate·verification | facts 1674 exact·미해결 0; 불변 be1a 기준 대비 finding·diagnostic 추가 0 |

최종 FCA 세 호출은 스냅숏 `f3cca71dd40e80388221251913f25edf916f51032a0ba4ffd5900c960f901a0a`를 공유합니다. be1a79867의 불변 기준 증거는 같은 도구·설정으로 생성해 원본을 보존한 최초 감사에서 재사용하고 최종 소스 감사를 새로 실행했습니다. scan 위반 201·validate finding 202(기존 error 1 포함)·verification 위반 21·diagnostic 177은 기준과 같습니다. 원래 순환과 불확정 증거가 남아 전체 절대 판정은 FAIL/도구 상태 indeterminate이며, 새 finding·diagnostic 0만 통과입니다. 새 hydration/렌더 수 시험은 각각 10·2개 exact입니다. Scan complete: 202 findings.

[최종 FCA 대조](raw/ir-5-round2/fca-comparison.json)와 압축 원본 세 개, [최종 관문 집계](raw/ir-5-round2/gate-results.json)에 근거를 보존했습니다. 최종 build의 runtime SHA-256은 실제 새 창에서 측정한 E5 product와 일치하므로 이후 기록 커밋이 측정 제품을 바꾸지 않습니다. 공개 선언 308개는 의미 차이 0이고 props JSDoc의 CSR 첫 렌더·SSR 보존 설명만 주석 바이트 차이로 남습니다. agents 14개 해시를 전량 대조했습니다. dist는 기존 ignore 대상이고 추적된 runtime/adapter 산출물 변경이 없어 별도 build 커밋 대상은 없습니다.

최종 인계: 일반·StrictMode·React 18 내부 Suspense의 서버 DOM 보존과 추가 렌더 0, CSR 첫 게이팅, hydration 뒤 추가분 게이팅, 문턱 미만 실제 마운트의 defer-once, 기존 항목당 두 layout effect 계약을 검증했습니다. 제품·타입·렌더·Storybook·production 검증은 통과했으며, **마운트 flat-500 on 한 행은 FAIL**이고 소유자의 비용 예외 판단은 열려 있습니다. 코디네이터는 이 상태를 명시한 단계 브랜치 PR과 독립 검토로 인계하도록 승인했습니다. 위 다섯 기존 결함의 후속 수정은 이번 범위에 포함하지 않았습니다.


## Round 3 — 실제 입력 commit만 원장에 기록

codex 원문과 브리프의 Opus 요약을 코드와 대조했습니다. round 2의 자식 wrapper effect는 FieldProxy가 hidden/disabled로 null을 반환해도 커밋하므로, 실제 입력이 없던 항목을 노출 원장에 기록하는 결함이 있었습니다. threshold 2·eagerCount 0·backfill None에서 처음 숨긴 배열 항목을 만든 뒤 두 번째 항목 추가→배열 remount→첫 항목 표시 시 placeholder여야 하는 공개 API 회귀를 CSR·hydration 두 모드에서 작성했습니다. 수정 전 React 18에서 두 사례가 모두 실패했습니다.

원장 쓰기를 자식 wrapper에서 제거하고 실제 FieldInput이 존재하는 입력 슬롯의 기존 commit layout effect로 옮겼습니다. 그 effect에서 슬롯 자신의 노드를 기록하며 새로운 layout effect는 만들지 않습니다. form manager는 기존 useChildFields 결과로 전달해 추가 context 구독을 만들지 않았고 Provider도 바꾸지 않았습니다. 현재 두-effect 계약과 기존 모든 기대는 유지합니다.

Suspense 안에 Probe를 넣고 layout commit을 정확히 1회 기대하여 경계가 서버 DOM으로만 남는 경우도 검출합니다. 두 프로젝트의 한정 hydration 12개·렌더 수 2개·기존 layout-count 1개, 합계 30개가 통과했습니다. 숨김 항목은 실제 입력을 한 번도 마운트하지 않았으므로 이후 표시할 때 원장에 의해 게이트가 생략되지 않고 placeholder로 남습니다.

공개 문서는 하이드레이션 자체의 갱신 없음과 React 18에서 아직 하이드레이션되지 않은 경계로 들어가는 이후 갱신의 client rendering 전환을 구별했습니다. 준비만 된 자식을 탭·아코디언에서 나중에 처음 렌더하면 비게이트 결정이 유지되는 기존 제한은 고치지 않고 DETAIL·README·영어/한국어 SPECIFICATION과 미결 목록에 남겼습니다. 후속안은 자식별 hydration 감지와 최초 실제 마운트 시 gate 판정입니다. 최초 기록의 스냅숏 재렌더 표현과 현재 존재하지 않는 terminal 재렌더 설명도 바로잡았습니다.


### Round 3 준비 실패의 정정

새 숨김 항목 픽스처는 처음에 children 없는 `Form.Render`를 써서 런타임 한정 시험은 통과했으나 준비 build의 typecheck가 실패했습니다. 이 시도는 통과 증거로 세지 않습니다. 기존 시험의 기대는 건드리지 않고 새 픽스처를 공개 `Form.Input path="/items"`로 고친 뒤 round 2 제품에서 두 실패를 다시 재현했습니다. round 3 소스를 복원하여 두 버전 30개 한정 시험과 전체 준비 build exit 0을 다시 확인했습니다. 준비용 smoke는 프로토콜 검사일 뿐 공식 표본에 포함하지 않습니다.

### Round 3 최종 제품의 마운트 비용

측정 E5 소스는 `f7ab4800e1d4c11ec0138faec822ca64b3deaeef`이며 실제 입력 commit으로 원장을 옮긴 제품입니다. E4는 `be1a7986756bc326757d0d2055bd92010917ca7d`의 이전 창과 동일한 불변 product/browser 바이트입니다. production React 19.2.6·Chromium 145.0.7632.6·900×700에서 기존 mountFixture/samplePageWithCpu로 paired relative 창 한 번을 실행했습니다. 각 행·레인 3예열·10새페이지, 총 36예열·120채택이며 시험·빌드는 겹치지 않았습니다. 시작 30초 CPU 관찰에서 30% 초과 프로세스는 0개였습니다. 레인별 중앙값의 E5/E4 ≤1.02라는 규칙은 그대로입니다.

| 폼 | 가상화 | 지표 | E4 중앙값 ms | E5 중앙값 ms | E5/E4 | 판정 |
| --- | --- | --- | ---: | ---: | ---: | --- |
| flat-500 | off | wallMs | 50.550 | 51.150 | 1.011869 | 통과 |
| flat-500 | on | eagerPaintedMs | 31.550 | 31.450 | 0.996830 | 통과 |
| nested-d5-f4 | off | wallMs | 88.000 | 89.400 | 1.015909 | 통과 |
| nested-d5-f4 | on | eagerPaintedMs | 87.650 | 88.750 | 1.012550 | 통과 |
| array-1000 | off | wallMs | 199.650 | 201.900 | 1.011270 | 통과 |
| array-1000 | on | eagerPaintedMs | 58.800 | 57.850 | 0.983844 | 통과 |

여섯 행 모두 사전 등록 관문을 통과했습니다. 이전 round 2의 flat-500 on FAIL과 bootstrap 구간, 코디네이터의 당시 예외 인계 결정은 다른 제품의 역사로 보존하며 현행 제품의 비용 판정에 재사용하지 않습니다. 이전 창의 원시를 삭제하거나 바꾸지 않았습니다. [공식 집계](raw/ir-5-round3/round3-complete.json)·[156페이지 원시](raw/ir-5-round3/mount-pages.json.gz)·[동결 입력](raw/ir-5-round3/inputs.json)·[실행기](raw/ir-5-round3/run-mount.mts)에 표본과 CPU·hash를 보존했고 별도 Python 중앙값 재계산도 일치했습니다. off는 wallMs, on은 eagerPaintedMs이며 bootstrap으로 규칙을 바꾸지 않았습니다.


### Round 3 최종 순차 관문과 제품 일치

공식 창이 끝난 뒤 아래 순서로 하나씩 실행했으며 전부 exit 0·실패 0입니다. 준비 중 children 없는 Form.Render 형 오류는 위에서 별도 실패로 기록했으며 이 관문 표는 고친 새 픽스처에 대한 최종 실행입니다.

| 순서 | 명령·검사 | 결과 |
| --- | --- | --- |
| 1 | `test --run --project unit` | 609파일·4012통과·1todo, 실패 0 |
| 2 | `test --run --project render` | 134파일·783통과, 실패 0 |
| 3 | `test --run --project react18` | 134파일·783통과, 실패 0 |
| 4 | `test:verify --run` | 748파일·4839통과·1todo, 실패 0 |
| 5 | `test --run --project storybook (Chromium 단독)` | 100파일·251통과, 실패 0 |
| 6 | `엄격 test:production` | 10파일·21통과, 실패 0; oneOf-20 distinct freeze 111, 기존 상한 유지 |
| 7 | `lint` | exit 0 |
| 8 | `typecheck` | exit 0 |
| 9 | `build` | runtime 세 형식·선언·development flag/gate selection 검사·agents14개 해시·typecheck exit 0 |
| 10 | 공개 선언 토큰 대조 | 공개 진입점 도달 308개, export·type·signature 의미 차이 0·해석 실패 0; props JSDoc만 주석 바이트 차이 |
| 11 | FCA facts→scan→6범위 validate→verification | facts1674 exact·미해결0; be1a 불변 기준 대비 새 finding·diagnostic0 |

verify-unit은 614파일·4056통과·1todo, verify-render는 134파일·783통과입니다. hydration12개와 슬롯 렌더 수2개, 기존 layout-count1개는 양 프로젝트에서 모두 일반 성공입니다. Suspense Probe는 실제 커밋 1회를 요구하므로 아직 hydrate하지 않은 경계가 DOM identity만 유지하는 경우도 통과하지 못합니다. 숨김 CSR·hydration 두 회귀는 실제 입력을 만들지 않은 wrapper를 원장에 쓰던 round 2 제품에서는 실패하고 고친 제품에서는 placeholder를 유지합니다. 기존 arrayMountLayoutEffects의 기대는 그대로입니다.

공개 바이트 차이는 `components/Form/components/FormCore/types/props.d.ts` 한 곳의 승인된 SSR/CSR JSDoc뿐입니다. 사설 훅의 tuple과 인자 변경은 공개 도달 그래프 밖이며 공개 index·Provider는 그대로입니다. 최종 `dist/index.mjs` SHA-256은 `26266aad8a72b5876ace3b1c47e9c501d83d7ac2b13c7d32bea4e1c40e16350d`로 실제 새 창의 frozen E5 product와 일치합니다. 모든 제품 소스는 측정한 f7ab4800e와 동일하며 이후 커밋은 결과 기록만 추가합니다. agents14개 파일의 경로·SHA-256을 manifest와 전량 일치시켰고, tracked runtime/adapter 변경은 없어 별도 build 커밋 대상이 없습니다.

FCA 세 호출은 스냅숏 `c95b6b2ac750a40941c1b3ae70c89ace66cd7d7ccb76367359ef447f7025ae7a`를 공유합니다. 동일 도구·설정의 불변 be1a 기준과 압축 원본의 finding·diagnostic 객체를 전량 대조했습니다. scan 위반201·validate finding202(warning200·info1·기존 error1)·verification 위반21·진단177이 유지되며 새 항목은 0입니다. 기존 FieldProxy↔FieldInputSlot 순환과 열거 불확정은 남아 전체 절대 판정은 FAIL, 도구 상태는 indeterminate입니다. 차분 관문만 통과이며 깨끗한 전체 감사라고 주장하지 않습니다. 새 hydration12개·렌더 수2개는 exact로 상한 안입니다. Scan complete: 202 findings.

[최종 관문 집계](raw/ir-5-round3/gate-results.json), [빌드 동일성](raw/ir-5-round3/build-identity.json), [FCA 대조](raw/ir-5-round3/fca-comparison.json)에 근거를 보존했습니다. 같은 디렉터리에 다섯 JSON 시험 보고서와 한정 시험, production 출력, FCA 전체 세 압축 원본을 기계 경로 없이 보존합니다. 기존 두 round 원시는 변경하지 않았고 request의 IR-4까지 기준 바이트 접두부를 보존했습니다.

Round 3 인계는 숨김 항목의 잘못된 원장 기록 수정, 실제 Suspense commit1, 기존 두 effect 계약과 일반/StrictMode 추가 렌더0, CSR·hydration 뒤 게이팅, 여섯 비용 행 전체 통과를 포함합니다. 하이드레이션 중 준비만 된 자식의 나중 첫 마운트 게이트 생략과 React 18의 경계 hydration 전 이후 갱신 제한, 표의 기존 여섯 후속 항목은 남깁니다. 소유자의 이번 단계 별도 수정 판단과 D1·가상화 기본 off 결정은 계속 별도이며 코디네이터의 독립 검토와 PR 개설로 인계합니다.
