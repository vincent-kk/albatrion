# 115라운드 배포 번들 분해 보고서

2026-10-07에 커밋 `546b8f537`을 분석했습니다. 이 문서는 [114라운드 닫기](../../reviews/round-114-closing.md)의 114C-01(다)와 [TEST-075](../../ledger/test.md)의 크기 예산에 대한 측정 보고입니다. 축소를 구현하거나 병합을 수용한 기록은 아닙니다. TEST-075가 요구하는 Vincent의 수용은 별도로 남습니다.

측정 분리선 A에서는 장부상 증가 43,367 B 중 신규 기능 운반체에 14,515 B(33.47%)를 배분하고, 동일 기능 구현과 공유 코드가 섞인 잔여에 28,852 B(66.53%)를 배분했습니다. 분리선 B에서는 각각 21,908 B와 21,459 B입니다. 이 두 결과는 아래에 정의한 스텁 제거 순서의 회계이며, 기능을 보존한 두 엔진 사이의 인과적 비용을 유일하게 증명한 수치는 아닙니다. 후보를 함께 제거한 축소 상한은 4,550 B입니다.

## 1. 분석 범위와 기준판 재측정

작업 중인 저장소의 `src`를 읽거나 빌드하지 않았습니다. 지정된 저장소에서 다음 명령으로 확정된 두 패키지 트리만 내보냈으며, 분석용 코드와 번들은 모두 임시 경로에 두었습니다. 저장소에 쓰는 파일은 이 보고서 하나입니다. Git 쓰기와 설치는 하지 않았습니다.

```sh
git archive 546b8f537 packages/canard/schema-form packages/aileron | tar -x -C /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundle-115
```

임시 루트는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundle-115`입니다. 설치된 도구만 저장소의 `node_modules` 연결로 재사용했습니다. 공통 build factory는 내보낸 `packages/aileron/script/build/rolldown.bundle.mjs`를 사용했고, 저장소 dist를 지우는 패키지 설정 함수는 호출하지 않았습니다. 부모 TypeScript 설정의 방출 관련 옵션은 같은 커밋의 `tsconfig.base.json`을 읽어 임시 설정에 복원했습니다. 공개 의존성은 외부로 남겼습니다. 분석과 관련 없는 5 MB 초과 내보내기 자료는 읽지 않고 임시 사본에서 제거했고, 분석 스크립트·출력·보고서는 각각 5 MB 이하입니다.

| 측정 | HEAD 재측정 B | BF 별칭 0.16.0 재측정 B | 장부의 0.16.0 기준 B |
| --- | ---: | ---: | ---: |
| minify ESM raw | 264,898 | 122,052 | 미기록 |
| minify gzip, 고정 파일명 헤더 포함 | 80,390 | 35,066 | 37,023 |
| 비축소 ESM raw | 577,590 | 247,510 | 미기록 |
| 비축소 ESM gzip, 고정 파일명 헤더 포함 | 117,063 | 49,062 | 51,632 |

현재 ESM의 SHA-256은 `2877b1221fced37620ef441d50efed6b0094835e37e4f43b5e5a66f4613c72d1`입니다. 이는 [G26 원시 자료](profile-114-g26/bundle.json)의 해시와 같고, raw 577,590 B와 minify raw 264,898 B도 같습니다. 출력 그래프의 모듈 528개에서 `src/__legacy__`는 0개입니다. 따라서 현재 결과는 G26의 80,390 B·117,063 B를 그대로 재현하며, 레거시 동봉이 증가 원인은 아닙니다.

BF 별칭의 ESM은 `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/node_modules/@canard/schema-form_0.16.0/dist/index.mjs`를 읽었습니다. 이 파일의 SHA-256은 `78362ee2e5b7c0bdca5f9b80f7490c32a54ea344565e97c2b4088080a3c861b2`이고, 같은 축소 방법으로 35,066 B입니다. 장부의 37,023 B와 1,957 B 차이가 나므로 장부 기준을 재현했다고 주장하지 않습니다. `bundle:false`로도 35,215 B이고, `target:es2020`·neutral 플랫폼·NODE_ENV 바인딩 유지로는 35,066 B여서 이 차이가 해소되지 않았습니다. 과거 배포 파일이나 당시 도구 조건이 달랐는지는 이번 자료만으로 확정하지 못했습니다. 예산 판정에는 37,023 B를 유지하고, 실제 별칭과의 같은 방법 비교에는 35,066 B를 사용합니다.

따라서 예산상 증가는 43,367 B이고, 설치된 BF 별칭 대비 같은 방법의 증가는 45,324 B입니다. 그 차이 1,957 B는 기준 자료 불일치이며 새 엔진의 기능이나 구현으로 임의 배분하지 않았습니다.

## 2. 숫자를 만든 방법

M0는 rolldown 1.2.0의 패키지 ESM 빌드 옵션으로 생성한 단일 번들을 esbuild 0.25.9의 `bundle:true, minify:true, format:esm, packages:external`로 축소하고 시스템 `gzip -9`로 압축하는 방법입니다. 원래 G26과 같은 방출물이 나오는 것을 SHA-256으로 확인했습니다. 순수 크기 비교에서는 파일명과 수정 시간의 영향을 없애기 위해 gzip에 바이트를 stdin으로 넣었습니다. 장부 표에는 `index.min.mjs`의 파일명 헤더 14 B와 `index.mjs`의 헤더 10 B를 각각 더했습니다. 동일 헤더를 붙이면 모든 실험의 크기 차이는 그대로입니다.

M1은 실제 rolldown 소스맵을 esbuild 소스맵으로 합성한 뒤, 축소 출력의 각 생성 열 구간을 다음 매핑 열까지 해당 소스 모듈에 귀속하는 방법입니다. UTF-8 바이트를 세었으며, 매핑이 없는 구간은 따로 남겼습니다. 소스맵을 켜도 축소 코드가 M0와 같음을 확인했습니다. M1의 숫자는 축소 전 크기나 gzip 배분이 아니라 실제 minify 출력 위치에 귀속한 바이트입니다. 최적화로 합쳐지거나 인라인된 표현식은 소스맵이 가리키는 원천에 귀속되므로, 그 모듈을 제거해서 절약할 수 있는 크기와는 다릅니다.

M2는 rolldown이 이미 도달 가능한 코드만 남긴 결과에서 선택한 모듈 영역을 측정용 스텁으로 바꾸는 방법입니다. 각 영역의 최상위 선언 이름을 유지하고, 그 구현을 빈 함수로 바꿉니다. esbuild에 `treeShaking:false`를 주어 다른 영역의 미사용 선언도 유지하므로 호출 관계의 연쇄 제거를 억제합니다. 이 대조군은 gzip 80,382 B이며 M0의 80,390 B보다 8 B 작습니다. 따라서 표의 직접 감소량은 M2 대조군과 같은 M2 변형의 차이고, 비중의 분모는 보고된 M0 80,390 B입니다. 8 B를 숨겨 M0를 정확히 분할했다고 주장하지 않습니다.

M3는 원천 파일을 고치지 않고 rolldown load 플러그인에서 선택 영역의 값 export를 빈 함수로 제공한 뒤, 정상 트리 셰이킹으로 다시 번들링하는 방법입니다. 이 경우 그 영역만 호출하던 하위 의존성도 사라집니다. 표의 연쇄 감소량은 M0와 M3의 gzip 차이이며, 특정 영역의 독립적인 점유량이 아닙니다. `components`를 없애면 Form이 불러오던 코어도 빠지고, `dispatch`를 없애면 쓰기·정착 코드도 빠지는 것이 그 예입니다.

M4는 서로 겹치지 않게 정한 신규 기능 모듈 집합을 M2에서 순서대로 누적 제거하는 방법입니다. 앞 단계 gzip에서 다음 단계 gzip을 빼면 합산 가능한 회계가 됩니다. 독립 제거량을 더하지 않았습니다. 마지막에는 남은 `Object.freeze(x)`를 측정용으로 `(x)`로 바꾸었습니다. 제거 순서와 기능 소유 범위가 바뀌면 사전이 달라지므로, 분리선 A와 B를 모두 제시합니다.

M5는 축소 후보마다 M0와 비교하는 측정용 제거 또는 AST 스텁 방법입니다. 실행하지 않는 번들 크기 실험이며 기능 보존은 검증하지 않았습니다. 이 보고서의 상한은 해당 코드를 삭제하거나 빈 구현으로 만들었을 때 관찰한 감소량입니다. 일반적인 리팩터링에서 이 값을 그대로 달성할 수 있다는 보장은 아닙니다.

## 3. 영역별 minify 출력과 gzip 감소량

아래의 raw는 M1이고 두 gzip 열은 각각 M2와 M3입니다. 모든 gzip 비중은 영역을 하나씩 제거한 차이를 전체 크기로 나눈 값입니다. 압축 사전과 연쇄 도달성 때문에 이 열을 더해 100%를 만들 수 없습니다. 특히 M3가 M2보다 큰 것은 영역의 글자 자체가 더 크다는 뜻이 아닙니다.

| 책임 영역 | M1 minify 출력 B | 전체 minify raw 비중 | M2 직접 gzip 감소 B | 전체 gzip 대비 | M3 연쇄 gzip 감소 B |
| --- | ---: | ---: | ---: | ---: | ---: |
| `core/settle` | 115,764 | 43.70% | 33,039 | 41.10% | 36,053 |
| `core/blueprint` | 45,388 | 17.13% | 13,340 | 16.59% | 14,360 |
| `core/dispatch` | 21,560 | 8.14% | 5,615 | 6.98% | 43,968 |
| `core/behaviors` | 10,991 | 4.15% | 2,953 | 3.67% | 3,134 |
| `components` | 10,586 | 4.00% | 3,378 | 4.20% | 21,573 |
| `providers` | 8,567 | 3.23% | 2,410 | 3.00% | 18,026 |
| `core/validation` | 7,798 | 2.94% | 2,577 | 3.21% | 2,728 |
| `helpers` | 7,433 | 2.81% | 3,601 | 4.48% | 3,780 |
| `formTypeDefinitions` | 6,941 | 2.62% | 1,995 | 2.48% | 2,211 |
| `core/SchemaNode` | 6,500 | 2.45% | 1,754 | 2.18% | 65,645 |
| `core/record` | 5,089 | 1.92% | 1,776 | 2.21% | 2,044 |
| `errors` | 4,438 | 1.68% | 813 | 1.01% | 996 |
| `core/utils` | 4,362 | 1.65% | 1,448 | 1.80% | 1,448 |
| `hooks` | 1,929 | 0.73% | 517 | 0.64% | 582 |
| `app` | 1,505 | 0.57% | 371 | 0.46% | 3,377 |
| `core/navigation` | 899 | 0.34% | 254 | 0.32% | 272 |
| `core/types` | 444 | 0.17% | 161 | 0.20% | 161 |
| `types` | 157 | 0.06% | 48 | 0.06% | 51 |
| 소스맵 미귀속 영역 | 4,547 | 1.72% | 적용하지 않았습니다. | 적용하지 않았습니다. | 적용하지 않았습니다. |
| M1 합계 | 264,898 | 100.00% | 합산하지 않습니다. | 합산하지 않습니다. | 합산하지 않습니다. |

핵심 직접 기여는 `core/settle` 33,039 B(41.10%), `core/blueprint` 13,340 B(16.59%), `core/dispatch` 5,615 B(6.98%)입니다. `errors/formErrorCode.ts` 한 모듈의 M1 귀속은 3,932 B이고, 그 모듈 전체를 M3 스텁으로 바꾼 감소는 860 B입니다. 오류 테이블은 실제 디스패치 코드가 읽으므로 죽은 export로 분류하지 않았습니다.

### 3.1 settle의 단계별 분해

`derive/`와 `utils/derivation/`을 derivation으로 묶었습니다. 물리적으로 commit 아래 있는 배달 집합 계산은 별도 delivery로 분리했습니다. delivery에는 `markCommitDeliveries.ts`와 `commit/utils/`의 `isSameDeliveryValue`, `createWatchDeliveryIndex`, `getWatchDeliveryPaths`, `readSettlementSource`만 넣었으며 commit에 중복 산입하지 않았습니다. 실제 리스너 호출인 `dispatch/.../deliverWave.ts`는 dispatch에 남겼습니다. `other`는 latent·detached·controls·context·structure·paths·pathIndex·settlement·dispose 등 보조 책임을 포함합니다.

| settle 단계 | M1 minify 출력 B | 전체 minify raw 비중 | M2 직접 gzip 감소 B | 전체 gzip 대비 |
| --- | ---: | ---: | ---: | ---: |
| load | 7,652 | 2.89% | 2,221 | 2.76% |
| write | 12,318 | 4.65% | 3,373 | 4.20% |
| compute | 16,877 | 6.37% | 4,831 | 6.01% |
| derivation | 14,311 | 5.40% | 4,134 | 5.14% |
| gates | 10,176 | 3.84% | 3,010 | 3.74% |
| transition | 11,857 | 4.48% | 3,321 | 4.13% |
| commit | 12,665 | 4.78% | 3,577 | 4.45% |
| delivery | 6,631 | 2.50% | 1,932 | 2.40% |
| errors | 370 | 0.14% | 123 | 0.15% |
| other | 22,907 | 8.65% | 6,553 | 8.15% |
| M1 settle 합계 | 115,764 | 43.70% | 33,039 | 41.10% |

### 3.2 큰 개별 모듈

다음 표는 M1에서 큰 모듈을 순서대로 보여줍니다. 전체 527개 소스 모듈의 목록은 부록 A에 실었습니다.

| 소스 모듈 | M1 minify 출력 B |
| --- | ---: |
| `src/core/settle/utils/compute/selectChildren.ts` | 5,695 |
| `src/core/settle/utils/commit/markCommitDeliveries.ts` | 4,634 |
| `src/errors/formErrorCode.ts` | 3,932 |
| `src/core/SchemaNode/SchemaNode.ts` | 3,526 |
| `src/core/settle/utils/gates/getGateRegistry.ts` | 3,272 |
| `src/core/settle/utils/commit/commitSettlement.ts` | 3,266 |
| `src/core/blueprint/utils/analyze/populateNodeChildren.ts` | 3,022 |
| `src/core/settle/utils/transition/transitionSettlement.ts` | 2,922 |
| `src/core/settle/utils/gates/evaluateGate.ts` | 2,911 |
| `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts` | 2,720 |
| `src/core/blueprint/utils/analyze/collectDeclarations.ts` | 2,684 |
| `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts` | 2,528 |
| `src/core/settle/utils/compute/computeNode.ts` | 2,387 |
| `src/core/blueprint/utils/analyze/collectDeriveConvergenceTargets.ts` | 2,324 |
| `src/core/settle/utils/write/markWrite.ts` | 2,211 |
| `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts` | 2,182 |
| `src/core/settle/utils/write/getDependencyIndex.ts` | 2,086 |
| `src/core/dispatch/utils/chain/exitSchemaNodeChain.ts` | 2,059 |
| `src/core/settle/utils/commit/commitExitPolicyValues.ts` | 2,023 |
| `src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts` | 1,896 |
| `src/core/settle/utils/derivation/runDeriveRounds.ts` | 1,890 |
| `src/core/blueprint/blueprint.ts` | 1,860 |
| `src/core/settle/utils/structure/applyArraySlots.ts` | 1,851 |
| `src/providers/RootNodeContext/RootNodeContextProvider.tsx` | 1,851 |
| `src/core/settle/utils/commit/updateInactiveValuesMemo.ts` | 1,820 |

## 4. 신규 기능과 동일 기능 구현의 증가분

0.16.0에도 oneOf·if 분기 처리, 스키마 전처리, 식 컴파일, 주입, revision 읽기, 오류 보고와 일부 `Object.freeze`가 있었습니다. 따라서 그 기능이 등장하는 코드 전부를 새 기능으로 간주하지 않았습니다. 새로 별도 청사진을 만드는 계약, 모든 선언 문맥의 조각 표, 투영 값을 읽는 게이트 모델, 불변 revision 원장, 잠복 원본과 이탈한 참조 읽기, 커밋별 degraded 진단을 운반하는 구체적인 모듈을 선택했습니다.

분리선 A는 혼합 모듈을 가능한 한 잔여에 남깁니다. `selectChildren`은 일반 자식 선택과 게이트 바퀴가 섞이므로 게이트 몫에서 제외했습니다. 청사진의 일반 type 연산·`resolveReference`·`readSchemaObject`·`isLiteralDefault`와 기존 식 생성기·effectiveSchema 병합은 잔여에 남겼습니다. `collectDeriveConvergenceTargets`와 `features/`의 속도 최적화도 잔여에 남겼습니다. 전이 전체를 신규로 잡지 않고 latent·detached 운반체와 `updateInactiveValuesMemo`만 신규 잠복·참조 계약에 넣었습니다. 부록 B에는 정확한 파일 집합을 실었습니다.

| 신규 계약과 장부 ID | M2 단독 제거 감소 B | M4 앞 단계 대비 감소 B | 누적 제거 뒤 gzip B, 파일명 헤더 제외 |
| --- | ---: | ---: | ---: |
| 조각 열거와 선언 문맥: `BLUEPRINT-004`·`FRAGMENT-006`·`FRAGMENT-011` | 1,485 | 1,485 | 78,883 |
| 투영 게이트 등록·평가와 고정점 지원: `FRAGMENT-016`·`FRAGMENT-017`·`SETTLE-003`·`SETTLE-026` | 3,010 | 2,989 | 75,894 |
| 분리된 청사진 분석·선언 인덱스: `BLUEPRINT-001`·`BLUEPRINT-030` | 5,891 | 5,787 | 70,107 |
| 불변 revision 원장: `EVENT-007`·`SETTLE-006` | 378 | 304 | 69,803 |
| 잠복 원본·이탈한 참조의 읽기: `FRAGMENT-015`·`FRAGMENT-054`·`WRITE-087` | 2,666 | 2,510 | 67,293 |
| 커밋 진단·오류 기록·사슬 끝 보고: `ERROR-034`·`ERROR-172` | 1,331 | 1,299 | 65,994 |
| 남은 운영 불변 운반체의 freezing: `EVENT-024`·`WRITE-087` | 351 | 141 | 65,853 |
| 선택한 신규 운반체 합계 | 합산하지 않습니다. | 14,515 | 65,853 |

운영 번들에서 개발 모드의 payload·blueprint 동결은 이미 제거되었습니다. freezing 행의 단독 351 B는 모든 남은 `Object.freeze`를 제거한 차이이고, M4의 141 B는 앞의 신규 모듈을 이미 제거한 뒤 남은 동결의 차이입니다. 0.16.0에도 네 곳의 동결이 있으므로 이 행을 순수하게 처음 생긴 동결 문법의 비용이라고 해석하지 않습니다. 확장된 불변 계약을 운반하는 코드에 대한 측정상의 배분이며, 기존 빈 값·표 동결과의 작은 겹침도 있습니다. 그 계약을 삭제하는 것은 축소 후보의 4,550 B에 넣지 않았습니다.

M4 대조군 80,368 B에서 신규 운반체 14,515 B를 제거하면 65,853 B가 남습니다. 고정 파일명 헤더와 M0/M2 대조군 차이 8 B를 복원한 잔여는 65,875 B입니다. 따라서 설치된 기준판과 같은 방법의 비교는 `45,324 = 14,515 + 30,809` B이고, 장부상 비교는 `43,367 = 14,515 + 28,852` B입니다. 두 비교의 잔여가 1,957 B 다른 이유는 0.16.0 기준 자료 차이입니다.

잔여에는 현재의 load·write·compute·derivation·commit·delivery·validation·React 연결, 기존 의미를 처리하는 병합과 식 생성기, 경로 인덱스와 성능 지름길이 있습니다. 기존 기능을 다른 자료 구조와 단계로 구현한 몫은 여기에 들어갑니다. 그러나 게이트 바퀴의 일부처럼 신규 계약과 기존 기능을 함께 처리하는 모듈도 여기에 있으므로, 이 잔여 전부가 순수한 동일 기능 구현 증가라고 단정할 수 없습니다. 실제 기능을 지킨 축소 구현이나 같은 표면의 기능별 빌드를 만들지 않은 상태에서 완전한 인과 분해를 얻을 수는 없습니다.

분리선 B는 혼합 `selectChildren`과 일반 type·참조 처리 등을 포함한 청사진 분석, 전이 모듈 전체까지 신규 계약의 운반체로 배분한 민감도 실험입니다. 같은 누적 제거 순서에서 신규 21,908 B, 장부상 구현·공유 잔여 21,459 B가 나왔습니다. 두 분리선의 차이는 7,393 B입니다. 그러므로 14,515–21,908 B와 21,459–28,852 B라는 범위는 소유 범위 선택에 대한 민감도이지 통계적 신뢰구간이나 엄밀한 상하한이 아닙니다. 본 보고서의 기본 회계는 보수적으로 혼합 모듈을 잔여에 둔 A입니다.

## 5. 코드 수준 축소 후보와 상한

아래는 M5로 한 번에 한 후보를 제거한 gzip 차이입니다. 모든 소스는 그대로 두고 번들러 플러그인이나 임시 생성 코드의 AST만 바꿨습니다. 오류의 코드·details·기능 계약을 보존하려면 실제 구현에서 공유 도우미, 짧은 메시지 또는 일반 경로를 남겨야 하므로 측정 상한 전체가 실제 절감으로 이어지지는 않습니다.

| 후보와 위치 | 제거 또는 스텁의 방법 | 단독 gzip 감소 상한 B | 의미와 남은 조건 |
| --- | --- | ---: | --- |
| 도달하지 않는 export: `getDefaultValue`, `convertExpression`, `stripSchema`, `nodeFromJSONSchema` | 해당 네 소스 모듈의 값 export를 M3 스텁으로 바꿨습니다. | 0 | 이 대표적인 미도달 구현들은 현재 entry 번들에 이미 없으므로 배포 크기를 더 줄이지 못했습니다. |
| 통째 재내보내기: `errors/index.ts`, `types/index.ts`, `helpers/jsonPointer/index.ts` 등 | 런타임 `export *`를 원천 모듈의 명시된 값 export 목록으로 바꿔 재번들링했습니다. | 0 | 순수 ESM의 미사용 export는 이미 제거됩니다. 명시 export는 경계 관리에는 도움이 되지만 이번 번들 크기 이득은 없습니다. |
| 개발 전용 분기 | NODE_ENV를 production으로 명시 정의한 빌드와 비교했습니다. | 0 | 운영 결과에는 NODE_ENV 조건이 남지 않았습니다. 추가 제거 대상이 확인되지 않았습니다. |
| test 전용 수렴 확인: `core/settle/utils/derivation/runDeriveRounds.ts` | source transform에서 test 조건의 if를 없애고 재번들링했습니다. | 0 | 현재 비축소 운영 결과에서도 test 실패 메시지가 없고, 축소 결과도 같았습니다. |
| 같은 트리 판별: `deliverWave.ts:isWaveNode`와 `markCommitDeliveries.ts:isTreeNode` | 두 번째 함수의 구현 대신 첫 함수에 대한 참조를 넣었습니다. | 4 | 동일한 함수 몸체가 두 번 있지만 gzip이 이미 대부분의 중복을 공유합니다. |
| 이탈 참조 캡처: `finalizeExits.ts`와 `finalizePerished.ts`의 순회 callback | 뒤쪽의 같은 332자 callback 몸체 하나를 빈 callback으로 바꿨습니다. | 46 | 실제 공유 함수와 context 전달 비용을 다시 넣어야 합니다. 두 callback 전부를 삭제한 값을 중복 제거 이득으로 사용하지 않았습니다. |
| 두 중복 후보의 동시 제거 | 위 두 변경을 함께 적용했습니다. | 48 | 단독 4 B와 46 B의 합과 다르므로 48 B를 사용합니다. |
| 오류 생성자의 긴 메시지: `SchemaFormError`·`JSONSchemaError` 등 30곳 | 두 번째 인자의 문자열 또는 template을 빈 문자열로 바꿨습니다. | 531 | 메시지와 그 안의 보간은 진단 기능이므로 실제 변경에는 짧은 설명과 필수 문맥을 남겨야 합니다. |
| 긴 오류 포맷터: `helpers/error/formatErrorMessage/`의 현재 포함 모듈 9개 | 그 하위 모듈들을 M3 스텁으로 바꿨습니다. | 1,391 | 운영에 남은 상세 메시지 경로이며, 개발 전용 잔존으로 분류하지 않았습니다. 일반 오류 메시지를 남기면 절감량은 더 작습니다. |
| `formatRegisterPluginError.ts` | 이 포맷터 하나만 M3 스텁으로 바꿨습니다. | 424 | 포맷터 묶음 상한과 중복되는 값입니다. |
| `formatFormTypeInputMapError.ts` | 이 포맷터 하나만 M3 스텁으로 바꿨습니다. | 288 | 포맷터 묶음 상한과 중복되는 값입니다. |
| `formatDynamicFunctionError.ts` | 이 포맷터 하나만 M3 스텁으로 바꿨습니다. | 236 | 포맷터 묶음 상한과 중복되는 값입니다. |
| 정적 최초 로드 지름길: `loadStaticFirstTree`, `commitStaticFirstNode`, `assembleStaticFirstNode`, `finishStaticFirstLoad` 등과 `StaticFirstLoadCapability` | 해당 8개 모듈을 M3 스텁으로 바꿨습니다. | 1,629 | 같은 폼을 일반 로드 경로로 처리하도록 실제 fallback을 구현해야 하며, G26 마운트 성능 목표를 다시 확인해야 합니다. 스텁 결과의 성능이나 동작은 검증하지 않았습니다. |
| 파생 수렴 지름길: `DeriveConvergenceTargets`, `collectDeriveConvergenceTargets` | 해당 두 모듈을 M3 스텁으로 바꿨습니다. | 972 | 확인 라운드를 생략하는 최적화이므로 일반 라운드로 복귀했을 때의 갱신 비용을 다시 확인해야 합니다. |
| 오류 코드 테이블: `errors/formErrorCode.ts` | 모듈 전체의 값 export를 M3 스텁으로 바꿨습니다. | 860 | `createFormErrorRecord`와 `readFormErrorCode`가 실제로 읽습니다. 코드 식별과 분류 계약을 잃으므로 죽은 export 삭제 후보로 채택하지 않았고 동시 축소 상한에도 넣지 않았습니다. |
| 후보들의 동시 제거 | 정적 최초 로드·파생 수렴 지름길·오류 포맷터·오류 문자열·중복 몸체의 초과분을 함께 제거했습니다. | 4,550 | 서로 겹친 단독 값을 더하지 않고 한 번의 재번들링 결과를 측정했습니다. |

`FORM_ERROR_CODE_TABLE`은 타입 선언용으로만 쓰는 표가 아닙니다. 전체 코드와 오류 종류를 런타임에서 찾는 두 함수에 연결되어 있습니다. 또한 현재 entry에 이름을 직접 export하지 않는 내부 도우미라도 Form 또는 SchemaNode가 도달하면 살아 있는 코드입니다. “공개 export 목록에 없다”는 이유만으로 그 도우미를 죽은 코드라고 판단하지 않았습니다.

동시 후보의 gzip은 고정 헤더를 붙이면 75,840 B입니다. 최대 4,550 B(5.66%)가 줄어도 장부 기준보다 38,817 B 큽니다. 이 값은 기능 경로를 비운 실험 상한이고 배포 가능한 수정의 예측값이 아닙니다. freezing, 오류 코드 표 전체, 게이트·청사진·revision 기능 전체의 삭제는 이 축소 후보 합계에서 제외했습니다.

## 6. 결론

현재 80,390 B 중 큰 직접 gzip 기여는 settle 33,039 B, blueprint 13,340 B, dispatch 5,615 B입니다. 37,023 B 예산 대비 43,367 B의 증가를 분리선 A로 배분하면 신규 기능 운반체 14,515 B와 구현·공유 잔여 28,852 B입니다. 혼합 모듈까지 신규 운반체에 포함하는 B에서는 신규 21,908 B와 잔여 21,459 B로 바뀌므로, 순수 동일 기능 구현 비용이 하나의 정확한 숫자로 증명되었다고 판단할 수는 없습니다. 설치된 BF 별칭은 같은 방법으로 35,066 B이며 장부 기준과 1,957 B 불일치합니다. 축소 후보의 동시 제거 상한은 4,550 B입니다. 이 자료로 축소 범위와 증가의 수용 여부를 Vincent가 정해야 하며, 이번 분석은 그 판단을 대신하지 않았습니다.

## 부록 A. 전체 모듈의 minify 출력 귀속

다음은 M1의 527개 소스 모듈 전체입니다. src 경로는 커밋 546b8f537의 내보낸 사본을 뜻합니다. 이 열의 합 260,351 B에 미귀속 4,547 B를 더하면 minify raw 264,898 B와 일치합니다. 모듈별 gzip 값을 raw 비율로 배분하지 않았습니다.

| 책임 영역 | 소스 모듈 | M1 minify 출력 B |
| --- | --- | ---: |
| `app` | `src/app/plugin/PluginManager.ts` | 1,106 |
| `app` | `src/app/plugin/registerPlugin.ts` | 365 |
| `app` | `src/app/constants/style.ts` | 34 |
| `components` | `src/components/Form/components/FormContents.tsx` | 1,710 |
| `components` | `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx` | 1,608 |
| `components` | `src/components/SchemaNode/SchemaNodeProxy/components/SchemaNodeField.tsx` | 893 |
| `components` | `src/components/SchemaNode/DeferrableNodeProxy/DeferrableNodeProxy.tsx` | 801 |
| `components` | `src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx` | 766 |
| `components` | `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts` | 660 |
| `components` | `src/components/FallbackComponents/FormGroupRenderer.tsx` | 627 |
| `components` | `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts` | 561 |
| `components` | `src/components/SchemaNode/SchemaNodeInput/hooks/useTerminalChildren.ts` | 441 |
| `components` | `src/components/Form/utils/submitForm.ts` | 394 |
| `components` | `src/components/Form/components/FormGroup.tsx` | 280 |
| `components` | `src/components/Form/components/FormRender.tsx` | 267 |
| `components` | `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInputWrapper.tsx` | 255 |
| `components` | `src/components/Form/components/FormChildrenRenderer.tsx` | 200 |
| `components` | `src/components/Form/components/FormLabel.tsx` | 197 |
| `components` | `src/components/Form/components/FormInput.tsx` | 189 |
| `components` | `src/components/Form/components/FormError.tsx` | 186 |
| `components` | `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx` | 139 |
| `components` | `src/components/Form/Form.tsx` | 95 |
| `components` | `src/components/Form/components/FormRootProxy.tsx` | 77 |
| `components` | `src/components/Form/util.ts` | 77 |
| `components` | `src/components/Form/index.ts` | 69 |
| `components` | `src/components/FallbackComponents/FormErrorRenderer.tsx` | 44 |
| `components` | `src/components/FallbackComponents/FormInputRenderer.tsx` | 24 |
| `components` | `src/components/FallbackComponents/FormLabelRenderer.tsx` | 17 |
| `components` | `src/components/SchemaNode/SchemaNodeInput/type.ts` | 9 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts` | 2,528 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/value/assembleArray.ts` | 1,092 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts` | 633 |
| `core/behaviors` | `src/core/behaviors/utils/options/getStaticChoices.ts` | 595 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts` | 592 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/projection/omitTrailingArray.ts` | 493 |
| `core/behaviors` | `src/core/behaviors/utils/parse/isMember.ts` | 333 |
| `core/behaviors` | `src/core/behaviors/utils/parse/convert.ts` | 332 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/value/holeValue.ts` | 281 |
| `core/behaviors` | `src/core/behaviors/utils/parse/interpret.ts` | 262 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts` | 258 |
| `core/behaviors` | `src/core/behaviors/behaviors.ts` | 252 |
| `core/behaviors` | `src/core/behaviors/utils/options/isOmittedEmpty.ts` | 250 |
| `core/behaviors` | `src/core/behaviors/utils/parse/utils/number/parseNumber.ts` | 184 |
| `core/behaviors` | `src/core/behaviors/virtualBehavior/utils/tuple/assembleVirtualTuple.ts` | 184 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/projection/projectBranchArray.ts` | 143 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/projection/projectTerminalArray.ts` | 141 |
| `core/behaviors` | `src/core/behaviors/booleanBehavior/booleanBehavior.ts` | 136 |
| `core/behaviors` | `src/core/behaviors/numberBehavior/numberBehavior.ts` | 135 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/terminal/objectTerminalBehavior.ts` | 135 |
| `core/behaviors` | `src/core/behaviors/stringBehavior/stringBehavior.ts` | 135 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/terminal/arrayTerminalBehavior.ts` | 134 |
| `core/behaviors` | `src/core/behaviors/unionBehavior/unionBehavior.ts` | 134 |
| `core/behaviors` | `src/core/behaviors/utils/slots/projectEmpty.ts` | 134 |
| `core/behaviors` | `src/core/behaviors/virtualBehavior/virtualBehavior.ts` | 134 |
| `core/behaviors` | `src/core/behaviors/nullBehavior/nullBehavior.ts` | 133 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/branch/objectBranchBehavior.ts` | 133 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/branch/arrayBranchBehavior.ts` | 132 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/utils/keys/writeObjectKey.ts` | 116 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/utils/projectObject.ts` | 112 |
| `core/behaviors` | `src/core/behaviors/utils/slots/finishStringInput.ts` | 106 |
| `core/behaviors` | `src/core/behaviors/utils/slots/rejectArrayOperation.ts` | 103 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/utils/omitEmptyObject.ts` | 100 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/plan/copyArraySlots.ts` | 77 |
| `core/behaviors` | `src/core/behaviors/virtualBehavior/utils/tuple/readVirtualValue.ts` | 63 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/arrayBehavior.ts` | 42 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/objectBehavior.ts` | 42 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/plan/isValidArrayIndex.ts` | 41 |
| `core/behaviors` | `src/core/behaviors/utils/slots/declareBlueprintChildren.ts` | 35 |
| `core/behaviors` | `src/core/behaviors/utils/slots/declareNoChildren.ts` | 31 |
| `core/behaviors` | `src/core/behaviors/arrayBehavior/utils/projection/omitEmptyArray.ts` | 28 |
| `core/behaviors` | `src/core/behaviors/objectBehavior/utils/objectKeyCounts.ts` | 15 |
| `core/behaviors` | `src/core/behaviors/utils/slots/assembleRaw.ts` | 12 |
| `core/behaviors` | `src/core/behaviors/utils/slots/projectIdentity.ts` | 12 |
| `core/behaviors` | `src/core/behaviors/utils/slots/finishNoInput.ts` | 10 |
| `core/behaviors` | `src/core/behaviors/virtualBehavior/utils/value/projectNoEmit.ts` | 10 |
| `core/behaviors` | `src/core/behaviors/utils/slots/interpretIdentity.ts` | 8 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/populateNodeChildren.ts` | 3,022 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/collectDeclarations.ts` | 2,684 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/collectDeriveConvergenceTargets.ts` | 2,324 |
| `core/blueprint` | `src/core/blueprint/blueprint.ts` | 1,860 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts` | 1,643 |
| `core/blueprint` | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts` | 1,541 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/buildNodes.ts` | 1,539 |
| `core/blueprint` | `src/core/blueprint/utils/features/getFeatureNodeIndex/utils/buildFeatureNodeIndex.ts` | 1,487 |
| `core/blueprint` | `src/core/blueprint/utils/diagnostics/constant.ts` | 1,397 |
| `core/blueprint` | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts` | 1,389 |
| `core/blueprint` | `src/core/blueprint/utils/types/resolveNodeStrategy.ts` | 1,366 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts` | 1,294 |
| `core/blueprint` | `src/core/blueprint/utils/diagnostics/validateControlGroups.ts` | 1,278 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts` | 1,245 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts` | 1,230 |
| `core/blueprint` | `src/core/blueprint/utils/types/inferAllowedTypes.ts` | 1,208 |
| `core/blueprint` | `src/core/blueprint/utils/types/resolveNodeTypes.ts` | 1,196 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts` | 1,183 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/getTemplateKey.ts` | 1,092 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/collectSchemaCapabilities.ts` | 1,054 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts` | 970 |
| `core/blueprint` | `src/core/blueprint/utils/expressions/regex.ts` | 822 |
| `core/blueprint` | `src/core/blueprint/utils/types/inferLiteralTypes.ts` | 765 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts` | 741 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts` | 647 |
| `core/blueprint` | `src/core/blueprint/utils/itemEntry/getItemEntry.ts` | 556 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts` | 555 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/resolveReference.ts` | 550 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts` | 545 |
| `core/blueprint` | `src/core/blueprint/utils/itemEntry/getItemEntry/utils/getItemSchemaPath.ts` | 543 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts` | 531 |
| `core/blueprint` | `src/core/blueprint/utils/diagnostics/validateChildTargets.ts` | 484 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/isLiteralDefault.ts` | 438 |
| `core/blueprint` | `src/core/blueprint/utils/types/readAllowedTypes.ts` | 423 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts` | 399 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts` | 395 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/collectStaticSchemas.ts` | 390 |
| `core/blueprint` | `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts` | 331 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/registerBlueprintDependency.ts` | 325 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/collectGateEvaluationReads.ts` | 323 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts` | 292 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/applyTypeContribution.ts` | 252 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/hasCompleteExpressionReads.ts` | 245 |
| `core/blueprint` | `src/core/blueprint/utils/features/DeriveConvergenceTargets.ts` | 242 |
| `core/blueprint` | `src/core/blueprint/utils/types/intersectAllowedTypes.ts` | 221 |
| `core/blueprint` | `src/core/blueprint/utils/features/getFeatureNodeIndex/getFeatureNodeIndex.ts` | 208 |
| `core/blueprint` | `src/core/blueprint/utils/types/unionAllowedTypes.ts` | 206 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts` | 205 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts` | 201 |
| `core/blueprint` | `src/core/blueprint/utils/declarations/copyBlueprintDeclarations.ts` | 200 |
| `core/blueprint` | `src/core/blueprint/utils/diagnostics/throwBlueprintError.ts` | 178 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/createBlueprintGate.ts` | 173 |
| `core/blueprint` | `src/core/blueprint/utils/expressions/getPathManager/getPathManager.ts` | 173 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup/utils/freezeCreatedHintObjects.ts` | 153 |
| `core/blueprint` | `src/core/blueprint/utils/types/foldAllowedTypes.ts` | 141 |
| `core/blueprint` | `src/core/blueprint/utils/expressions/createDynamicFunction/utils/getFunctionBody.ts` | 136 |
| `core/blueprint` | `src/core/blueprint/utils/features/StaticFirstLoadCapability.ts` | 130 |
| `core/blueprint` | `src/core/blueprint/utils/expressions/createDynamicFunction/utils/wrapReturnStatements.ts` | 124 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/validateShape.ts` | 65 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/readSchemaObject.ts` | 34 |
| `core/blueprint` | `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/CompleteExpressionReads.ts` | 15 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/constant.ts` | 15 |
| `core/blueprint` | `src/core/blueprint/utils/effectiveSchema/utils/OwnedSchemaValues.ts` | 14 |
| `core/dispatch` | `src/core/dispatch/utils/chain/exitSchemaNodeChain.ts` | 2,059 |
| `core/dispatch` | `src/core/dispatch/utils/chain/adoptSchemaNodeChain.ts` | 1,795 |
| `core/dispatch` | `src/core/dispatch/utils/chain/flushQueuedEvents.ts` | 1,119 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchValidate.ts` | 911 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchMount.ts` | 906 |
| `core/dispatch` | `src/core/dispatch/utils/report/readReferenceOnlySchemaPaths.ts` | 874 |
| `core/dispatch` | `src/core/dispatch/utils/report/collectChainRecords.ts` | 841 |
| `core/dispatch` | `src/core/dispatch/utils/chain/markBatchArrayOperation.ts` | 733 |
| `core/dispatch` | `src/core/dispatch/utils/chain/flushBatchWrites.ts` | 701 |
| `core/dispatch` | `src/core/dispatch/utils/report/createFormErrorRecord.ts` | 553 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 541 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchClearSubtreeState.ts` | 520 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchFinishInput.ts` | 520 |
| `core/dispatch` | `src/core/dispatch/utils/chain/deliverWave.ts` | 491 |
| `core/dispatch` | `src/core/dispatch/utils/entry/utils/clearSchemaNodeFormErrors.ts` | 467 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchSetSubtreeState.ts` | 446 |
| `core/dispatch` | `src/core/dispatch/utils/chain/enterSchemaNodeChain.ts` | 427 |
| `core/dispatch` | `src/core/dispatch/utils/chain/utils/compareDocumentOrder.ts` | 391 |
| `core/dispatch` | `src/core/dispatch/utils/chain/utils/replaceAtPath.ts` | 354 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchSetState.ts` | 352 |
| `core/dispatch` | `src/core/dispatch/utils/report/deliverChainRecords.ts` | 308 |
| `core/dispatch` | `src/core/dispatch/utils/report/reportValidationFailure.ts` | 308 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchResetForm.ts` | 291 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchResetSubtree.ts` | 275 |
| `core/dispatch` | `src/core/dispatch/utils/chain/refuseListenerFeedback.ts` | 271 |
| `core/dispatch` | `src/core/dispatch/utils/chain/restoreAdoptedExternalErrors.ts` | 258 |
| `core/dispatch` | `src/core/dispatch/utils/report/reportOwnerlessError.ts` | 250 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchBatch.ts` | 243 |
| `core/dispatch` | `src/core/dispatch/utils/chain/queueNonSettleEvent.ts` | 239 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchUpdate.ts` | 229 |
| `core/dispatch` | `src/core/dispatch/utils/report/finishQueuedErrors.ts` | 223 |
| `core/dispatch` | `src/core/dispatch/utils/chain/deliverValidationWave.ts` | 220 |
| `core/dispatch` | `src/core/dispatch/utils/chain/runDeliveryWaves.ts` | 219 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchSetExternalErrors.ts` | 216 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchRemove.ts` | 211 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchPush.ts` | 207 |
| `core/dispatch` | `src/core/dispatch/utils/read/subscribeSchemaNode.ts` | 207 |
| `core/dispatch` | `src/core/dispatch/utils/chain/readBatchValue.ts` | 197 |
| `core/dispatch` | `src/core/dispatch/utils/report/clearWarningKeys.ts` | 195 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchClear.ts` | 189 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchPop.ts` | 185 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchRequest.ts` | 182 |
| `core/dispatch` | `src/core/dispatch/utils/chain/composeBatchValue.ts` | 179 |
| `core/dispatch` | `src/core/dispatch/utils/read/readSchemaNodeRevision.ts` | 175 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchClearExternalErrors.ts` | 164 |
| `core/dispatch` | `src/core/dispatch/utils/chain/resolveSchemaNodeChainRoot.ts` | 147 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchWriteInput.ts` | 143 |
| `core/dispatch` | `src/core/dispatch/utils/report/readFormErrorCode.ts` | 136 |
| `core/dispatch` | `src/core/dispatch/utils/chain/captureChainError.ts` | 115 |
| `core/dispatch` | `src/core/dispatch/utils/report/assertNotInDelivery.ts` | 108 |
| `core/dispatch` | `src/core/dispatch/utils/report/dedupeWarningRecord.ts` | 102 |
| `core/dispatch` | `src/core/dispatch/utils/entry/dispatchContextChange.ts` | 72 |
| `core/dispatch` | `src/core/dispatch/utils/report/bundleChainErrors.ts` | 70 |
| `core/dispatch` | `src/core/dispatch/utils/read/readSchemaNodeInteractionReset.ts` | 25 |
| `core/navigation` | `src/core/navigation/utils/query/findNodes.ts` | 526 |
| `core/navigation` | `src/core/navigation/utils/query/utils/getSchemaNodePath.ts` | 346 |
| `core/navigation` | `src/core/navigation/utils/query/find.ts` | 27 |
| `core/record` | `src/core/record/utils/SchemaNodeRevisionLedger.ts` | 981 |
| `core/record` | `src/core/record/utils/captureSchemaNodeChange.ts` | 799 |
| `core/record` | `src/core/record/SchemaNodeEventType.ts` | 754 |
| `core/record` | `src/core/record/utils/publishGlobalStateDeltas.ts` | 506 |
| `core/record` | `src/core/record/utils/indexSchemaNodeWarning.ts` | 442 |
| `core/record` | `src/core/record/utils/markSchemaNodeEvent.ts` | 396 |
| `core/record` | `src/core/record/utils/clearSchemaNodeChanges.ts` | 324 |
| `core/record` | `src/core/record/utils/accumulateGlobalStateDeltas.ts` | 262 |
| `core/record` | `src/core/record/utils/shallowPatch.ts` | 218 |
| `core/record` | `src/core/record/utils/updateSchemaNodeNameAndPath.ts` | 178 |
| `core/record` | `src/core/record/SchemaNodeRequestType.ts` | 138 |
| `core/record` | `src/core/record/utils/patchSchemaNodeInteractionState.ts` | 70 |
| `core/record` | `src/core/record/type.ts` | 21 |
| `core/SchemaNode` | `src/core/SchemaNode/SchemaNode.ts` | 3,526 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/schemaNodeFactory.ts` | 1,465 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts` | 329 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/interpretSchemaNodeDraft.ts` | 327 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/guards.ts` | 248 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/requireRuntimeSchemaNode.ts` | 165 |
| `core/SchemaNode` | `src/core/SchemaNode/type.ts` | 150 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/observeSchemaNodeReports.ts` | 113 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/mountSchemaNode.ts` | 33 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/adoptSchemaNodeTree.ts` | 32 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/reloadSchemaNodeForm.ts` | 29 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/writeSchemaNodeInput.ts` | 26 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/setContext.ts` | 25 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/finishSchemaNodeInput.ts` | 16 |
| `core/SchemaNode` | `src/core/SchemaNode/utils/binding/readSchemaNodeInteractionReset.ts` | 16 |
| `core/settle/commit` | `src/core/settle/utils/commit/commitSettlement.ts` | 3,266 |
| `core/settle/commit` | `src/core/settle/utils/commit/commitExitPolicyValues.ts` | 2,023 |
| `core/settle/commit` | `src/core/settle/utils/commit/updateInactiveValuesMemo.ts` | 1,820 |
| `core/settle/commit` | `src/core/settle/utils/commit/commitGlobalState.ts` | 1,082 |
| `core/settle/commit` | `src/core/settle/utils/commit/updateCommittedRuleValue.ts` | 844 |
| `core/settle/commit` | `src/core/settle/utils/commit/commitDeriveRules.ts` | 742 |
| `core/settle/commit` | `src/core/settle/utils/commit/collectNonJsonPaths.ts` | 675 |
| `core/settle/commit` | `src/core/settle/utils/commit/finalizeDeriveTrace.ts` | 404 |
| `core/settle/commit` | `src/core/settle/utils/commit/isTypeMismatch.ts` | 403 |
| `core/settle/commit` | `src/core/settle/utils/commit/snapshotExitedPolicies.ts` | 397 |
| `core/settle/commit` | `src/core/settle/utils/commit/pruneCommittedRuleKeys.ts` | 293 |
| `core/settle/commit` | `src/core/settle/utils/commit/effectiveType.ts` | 260 |
| `core/settle/commit` | `src/core/settle/utils/commit/conversionCandidates.ts` | 234 |
| `core/settle/commit` | `src/core/settle/utils/commit/receivedType.ts` | 222 |
| `core/settle/compute` | `src/core/settle/utils/compute/selectChildren.ts` | 5,695 |
| `core/settle/compute` | `src/core/settle/utils/compute/computeNode.ts` | 2,387 |
| `core/settle/compute` | `src/core/settle/utils/compute/selectNodeSchema.ts` | 1,204 |
| `core/settle/compute` | `src/core/settle/utils/compute/hasRecursiveExpansion.ts` | 1,142 |
| `core/settle/compute` | `src/core/settle/utils/compute/primeHost.ts` | 937 |
| `core/settle/compute` | `src/core/settle/utils/compute/updateOutput.ts` | 901 |
| `core/settle/compute` | `src/core/settle/utils/compute/utils/hasIndependentLeafDefaults.ts` | 652 |
| `core/settle/compute` | `src/core/settle/utils/compute/publishStateKeys.ts` | 620 |
| `core/settle/compute` | `src/core/settle/utils/compute/sameValue.ts` | 548 |
| `core/settle/compute` | `src/core/settle/utils/compute/preserveReferences.ts` | 467 |
| `core/settle/compute` | `src/core/settle/utils/compute/enterSchemaNode.ts` | 444 |
| `core/settle/compute` | `src/core/settle/utils/compute/getVirtualReferenceIndex.ts` | 347 |
| `core/settle/compute` | `src/core/settle/utils/compute/utils/getRecursiveRelativeSpan.ts` | 326 |
| `core/settle/compute` | `src/core/settle/utils/compute/hasSharedConflict.ts` | 306 |
| `core/settle/compute` | `src/core/settle/utils/compute/utils/computeStableNode.ts` | 228 |
| `core/settle/compute` | `src/core/settle/utils/compute/dirtyChildren.ts` | 205 |
| `core/settle/compute` | `src/core/settle/utils/compute/scheduleRelocatedGates.ts` | 168 |
| `core/settle/compute` | `src/core/settle/utils/compute/createChildNode.ts` | 151 |
| `core/settle/compute` | `src/core/settle/utils/compute/flushPendingOutput.ts` | 111 |
| `core/settle/compute` | `src/core/settle/utils/compute/relocatedGates.ts` | 38 |
| `core/settle/delivery` | `src/core/settle/utils/commit/markCommitDeliveries.ts` | 4,634 |
| `core/settle/delivery` | `src/core/settle/utils/commit/utils/createWatchDeliveryIndex.ts` | 1,394 |
| `core/settle/delivery` | `src/core/settle/utils/commit/utils/readSettlementSource.ts` | 338 |
| `core/settle/delivery` | `src/core/settle/utils/commit/utils/getWatchDeliveryPaths.ts` | 215 |
| `core/settle/delivery` | `src/core/settle/utils/commit/utils/isSameDeliveryValue.ts` | 50 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts` | 2,720 |
| `core/settle/derivation` | `src/core/settle/derive/utils/rules/getDeriveRuleTable.ts` | 2,182 |
| `core/settle/derivation` | `src/core/settle/utils/derivation/runDeriveRounds.ts` | 1,890 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/evaluateResetInteraction.ts` | 1,083 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts` | 738 |
| `core/settle/derivation` | `src/core/settle/utils/derivation/getDeriveState.ts` | 532 |
| `core/settle/derivation` | `src/core/settle/utils/derivation/collectDeriveSourcePaths.ts` | 504 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/getInjectTarget.ts` | 479 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/chooseDeriveWrite.ts` | 419 |
| `core/settle/derivation` | `src/core/settle/utils/derivation/utils/applyDeriveWrite.ts` | 380 |
| `core/settle/derivation` | `src/core/settle/derive/utils/rank/compareDeriveWrites.ts` | 315 |
| `core/settle/derivation` | `src/core/settle/derive/utils/rules/utils/getWatchPaths.ts` | 307 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/evaluateScopedExpression.ts` | 299 |
| `core/settle/derivation` | `src/core/settle/derive/utils/rank/getDeriveChildEntry.ts` | 297 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/getInjectToContext.ts` | 267 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/getDeriveSourceNodes.ts` | 244 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/getRuleTargets.ts` | 243 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/readDeriveDependency.ts` | 214 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/getVirtualWriteFailure.ts` | 195 |
| `core/settle/derivation` | `src/core/settle/derive/utils/edges/getDeriveRuleKey.ts` | 186 |
| `core/settle/derivation` | `src/core/settle/derive/utils/rank/getDeriveSourceOrder.ts` | 180 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/getInjectEntries.ts` | 166 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/addActiveRuleKey.ts` | 134 |
| `core/settle/derivation` | `src/core/settle/derive/utils/evaluate/utils/getSelectedDeclarationIds.ts` | 132 |
| `core/settle/derivation` | `src/core/settle/utils/derivation/captureDeriveBaseline.ts` | 125 |
| `core/settle/derivation` | `src/core/settle/derive/utils/rank/kindRank.ts` | 46 |
| `core/settle/derivation` | `src/core/settle/derive/utils/rank/layerRank.ts` | 34 |
| `core/settle/errors` | `src/core/settle/utils/errors/recordSettlementFailure.ts` | 370 |
| `core/settle/gates` | `src/core/settle/utils/gates/getGateRegistry.ts` | 3,272 |
| `core/settle/gates` | `src/core/settle/utils/gates/evaluateGate.ts` | 2,911 |
| `core/settle/gates` | `src/core/settle/utils/gates/flushPendingGateReads.ts` | 1,455 |
| `core/settle/gates` | `src/core/settle/utils/gates/getGateBudgetCap.ts` | 1,046 |
| `core/settle/gates` | `src/core/settle/utils/gates/readProjectedValue.ts` | 768 |
| `core/settle/gates` | `src/core/settle/utils/gates/resolveGateOccurrence.ts` | 349 |
| `core/settle/gates` | `src/core/settle/utils/gates/getGateExpression.ts` | 221 |
| `core/settle/gates` | `src/core/settle/utils/gates/bindGateHostPath.ts` | 154 |
| `core/settle/load` | `src/core/settle/utils/load/loadStaticFirstTree.ts` | 1,755 |
| `core/settle/load` | `src/core/settle/utils/load/finishStaticFirstLoad.ts` | 1,446 |
| `core/settle/load` | `src/core/settle/utils/load/alignArraySnapshotSlots.ts` | 1,055 |
| `core/settle/load` | `src/core/settle/utils/load/assembleStaticFirstNode.ts` | 608 |
| `core/settle/load` | `src/core/settle/utils/load/isMissingStaticInput.ts` | 420 |
| `core/settle/load` | `src/core/settle/utils/load/canLoadStaticFirstTree.ts` | 335 |
| `core/settle/load` | `src/core/settle/utils/load/setLoadValue.ts` | 318 |
| `core/settle/load` | `src/core/settle/utils/load/commitStaticFirstNode.ts` | 305 |
| `core/settle/load` | `src/core/settle/utils/load/readStaticFirstWarning.ts` | 298 |
| `core/settle/load` | `src/core/settle/utils/load/getStaticObjectEntries.ts` | 200 |
| `core/settle/load` | `src/core/settle/utils/load/clearSubtreeState.ts` | 195 |
| `core/settle/load` | `src/core/settle/utils/load/loadSchemaNodeAtMount.ts` | 163 |
| `core/settle/load` | `src/core/settle/utils/load/resetSchemaNodeSubtree.ts` | 162 |
| `core/settle/load` | `src/core/settle/utils/load/resetSchemaNodeForm.ts` | 153 |
| `core/settle/load` | `src/core/settle/utils/load/getLoadValue.ts` | 142 |
| `core/settle/load` | `src/core/settle/utils/load/readSchemaNodeDefaultValue.ts` | 97 |
| `core/settle/other` | `src/core/settle/utils/structure/applyArraySlots.ts` | 1,851 |
| `core/settle/other` | `src/core/settle/utils/structure/arrangeSchemaNodeItems.ts` | 1,643 |
| `core/settle/other` | `src/core/settle/utils/controls/getControlLayers.ts` | 1,613 |
| `core/settle/other` | `src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts` | 1,513 |
| `core/settle/other` | `src/core/settle/utils/controls/calculateStateKeys.ts` | 1,460 |
| `core/settle/other` | `src/core/settle/utils/settlement/finishSettlement.ts` | 1,216 |
| `core/settle/other` | `src/core/settle/utils/settlement/createSettlementContext.ts` | 1,171 |
| `core/settle/other` | `src/core/settle/utils/latent/distributeLatentValue.ts` | 1,109 |
| `core/settle/other` | `src/core/settle/utils/latent/readLatentSlotSource.ts` | 702 |
| `core/settle/other` | `src/core/settle/utils/latent/readRawTree.ts` | 651 |
| `core/settle/other` | `src/core/settle/utils/latent/setLatentRaw.ts` | 612 |
| `core/settle/other` | `src/core/settle/utils/context/changeSchemaNodeContext.ts` | 537 |
| `core/settle/other` | `src/core/settle/utils/paths/expandTemplatePaths.ts` | 520 |
| `core/settle/other` | `src/core/settle/utils/controls/readSchemaNodeWatchValues.ts` | 494 |
| `core/settle/other` | `src/core/settle/utils/structure/utils/rekeyCommittedRules.ts` | 494 |
| `core/settle/other` | `src/core/settle/utils/pathIndex/getRuntimePathStores.ts` | 460 |
| `core/settle/other` | `src/core/settle/utils/latent/hasLatentUnder.ts` | 453 |
| `core/settle/other` | `src/core/settle/utils/context/getContextOwners.ts` | 430 |
| `core/settle/other` | `src/core/settle/utils/detached/captureDetachedSchemaNodeReads.ts` | 395 |
| `core/settle/other` | `src/core/settle/utils/structure/utils/rekeyPairedPathStore.ts` | 373 |
| `core/settle/other` | `src/core/settle/utils/latent/restoreLatentState.ts` | 360 |
| `core/settle/other` | `src/core/settle/utils/dispose/disposeSchemaNodeTree.ts` | 358 |
| `core/settle/other` | `src/core/settle/utils/paths/resolveDependencyPath.ts` | 317 |
| `core/settle/other` | `src/core/settle/utils/latent/captureArrayLatent.ts` | 284 |
| `core/settle/other` | `src/core/settle/utils/latent/getLatentOrder.ts` | 284 |
| `core/settle/other` | `src/core/settle/utils/controls/readExitLayerPolicy.ts` | 283 |
| `core/settle/other` | `src/core/settle/utils/paths/bindTemplatePath.ts` | 269 |
| `core/settle/other` | `src/core/settle/utils/controls/readStateDependency.ts` | 238 |
| `core/settle/other` | `src/core/settle/utils/latent/captureOwnLatent.ts` | 236 |
| `core/settle/other` | `src/core/settle/utils/latent/getLatentPathIndex.ts` | 206 |
| `core/settle/other` | `src/core/settle/utils/detached/hasLivePathKind.ts` | 204 |
| `core/settle/other` | `src/core/settle/utils/controls/getControlExpression.ts` | 192 |
| `core/settle/other` | `src/core/settle/utils/latent/indexLatentDescendant.ts` | 185 |
| `core/settle/other` | `src/core/settle/utils/controls/getCommittedDeclarationKey.ts` | 180 |
| `core/settle/other` | `src/core/settle/utils/latent/getEnteredLatentKeys.ts` | 175 |
| `core/settle/other` | `src/core/settle/utils/structure/utils/rekeyLatentMetadata.ts` | 165 |
| `core/settle/other` | `src/core/settle/utils/walkOwnedSchemaNodes.ts` | 156 |
| `core/settle/other` | `src/core/settle/utils/controls/readLatentExitPolicy.ts` | 144 |
| `core/settle/other` | `src/core/settle/utils/latent/indexEnteredLatentKey.ts` | 139 |
| `core/settle/other` | `src/core/settle/utils/detached/readSchemaNodeTypeMismatches.ts` | 122 |
| `core/settle/other` | `src/core/settle/utils/controls/getExitPolicyKey.ts` | 119 |
| `core/settle/other` | `src/core/settle/utils/dispose/assertSchemaNodeWritable.ts` | 115 |
| `core/settle/other` | `src/core/settle/utils/detached/readSchemaNodeInactiveValues.ts` | 114 |
| `core/settle/other` | `src/core/settle/utils/detached/readSchemaNodeTypeMismatch.ts` | 107 |
| `core/settle/other` | `src/core/settle/utils/declarations/getDeclaredChildNames.ts` | 106 |
| `core/settle/other` | `src/core/settle/utils/latent/HostLatent.ts` | 73 |
| `core/settle/other` | `src/core/settle/utils/detached/emptyDetachedReads.ts` | 42 |
| `core/settle/other` | `src/core/settle/utils/paths/isCanonicalArrayIndex.ts` | 37 |
| `core/settle/transition` | `src/core/settle/utils/transition/transitionSettlement.ts` | 2,922 |
| `core/settle/transition` | `src/core/settle/utils/transition/finalizeExits.ts` | 1,451 |
| `core/settle/transition` | `src/core/settle/utils/transition/captureLatentDescendants.ts` | 872 |
| `core/settle/transition` | `src/core/settle/utils/transition/finalizePerished.ts` | 683 |
| `core/settle/transition` | `src/core/settle/utils/transition/restoreSourceB.ts` | 667 |
| `core/settle/transition` | `src/core/settle/utils/transition/restoreArrayStructure.ts` | 660 |
| `core/settle/transition` | `src/core/settle/utils/transition/captureExitedRaw.ts` | 644 |
| `core/settle/transition` | `src/core/settle/utils/transition/collectFillDescendants.ts` | 631 |
| `core/settle/transition` | `src/core/settle/utils/transition/withdrawDetachedFills.ts` | 589 |
| `core/settle/transition` | `src/core/settle/utils/transition/prunePerishedPaths.ts` | 480 |
| `core/settle/transition` | `src/core/settle/utils/transition/readDepartingAncestorPolicy.ts` | 468 |
| `core/settle/transition` | `src/core/settle/utils/transition/pruneArrayTailPaths.ts` | 445 |
| `core/settle/transition` | `src/core/settle/utils/transition/readDefault.ts` | 295 |
| `core/settle/transition` | `src/core/settle/utils/transition/hasWrongKindBranchAncestor.ts` | 275 |
| `core/settle/transition` | `src/core/settle/utils/transition/isReplacedLivePath.ts` | 231 |
| `core/settle/transition` | `src/core/settle/utils/transition/applyExitClearing.ts` | 170 |
| `core/settle/transition` | `src/core/settle/utils/transition/isMissingRaw.ts` | 132 |
| `core/settle/transition` | `src/core/settle/utils/transition/writeLatentRaw.ts` | 92 |
| `core/settle/transition` | `src/core/settle/utils/transition/hasRecursiveFill.ts` | 78 |
| `core/settle/transition` | `src/core/settle/utils/transition/readUnsetPolicy.ts` | 60 |
| `core/settle/transition` | `src/core/settle/utils/transition/getTransitionCap.ts` | 12 |
| `core/settle/write` | `src/core/settle/utils/write/markWrite.ts` | 2,211 |
| `core/settle/write` | `src/core/settle/utils/write/getDependencyIndex.ts` | 2,086 |
| `core/settle/write` | `src/core/settle/utils/write/writeSchemaNode.ts` | 1,367 |
| `core/settle/write` | `src/core/settle/utils/write/DirtyPathSet.ts` | 1,347 |
| `core/settle/write` | `src/core/settle/utils/write/releaseSettlementScratch.ts` | 1,063 |
| `core/settle/write` | `src/core/settle/utils/write/registerRecalculation.ts` | 747 |
| `core/settle/write` | `src/core/settle/utils/write/interpretSchemaNodeInput.ts` | 673 |
| `core/settle/write` | `src/core/settle/utils/write/getSettlementScratch.ts` | 666 |
| `core/settle/write` | `src/core/settle/utils/write/pruneLatentRaw.ts` | 403 |
| `core/settle/write` | `src/core/settle/utils/write/staticSpec.ts` | 373 |
| `core/settle/write` | `src/core/settle/utils/write/nextExtras.ts` | 369 |
| `core/settle/write` | `src/core/settle/utils/write/releaseWrongKindHosts.ts` | 331 |
| `core/settle/write` | `src/core/settle/utils/write/assertVirtualWriteShape.ts` | 191 |
| `core/settle/write` | `src/core/settle/utils/write/markWrongKindAncestors.ts` | 158 |
| `core/settle/write` | `src/core/settle/utils/write/arrayExtras.ts` | 153 |
| `core/settle/write` | `src/core/settle/utils/write/hasDistributedChildInput.ts` | 138 |
| `core/settle/write` | `src/core/settle/utils/write/isPlain.ts` | 42 |
| `core/types` | `src/core/types/value.ts` | 232 |
| `core/types` | `src/core/types/state.ts` | 212 |
| `core/utils` | `src/core/utils/pathIndex/utils/PathStoreIndex.ts` | 1,667 |
| `core/utils` | `src/core/utils/pathIndex/utils/utils/NumericPathIndex.ts` | 900 |
| `core/utils` | `src/core/utils/pathIndex/PathKeyedMap.ts` | 553 |
| `core/utils` | `src/core/utils/pathIndex/PathKeyedSet.ts` | 526 |
| `core/utils` | `src/core/utils/emptyReadonlyMap.ts` | 191 |
| `core/utils` | `src/core/utils/pathIndex/utils/utils/isCanonicalArraySlot.ts` | 189 |
| `core/utils` | `src/core/utils/emptyReadonlySet.ts` | 176 |
| `core/utils` | `src/core/utils/pathIndex/utils/getStoreKeyPaths.ts` | 160 |
| `core/validation` | `src/core/validation/utils/route/routeValidationIssues.ts` | 1,360 |
| `core/validation` | `src/core/validation/utils/copy/createValidatorCopy.ts` | 1,056 |
| `core/validation` | `src/core/validation/utils/run/requestSchemaNodeValidation.ts` | 973 |
| `core/validation` | `src/core/validation/utils/route/isOffUnionBranchIssue.ts` | 940 |
| `core/validation` | `src/core/validation/utils/run/assertValidationRootReady.ts` | 526 |
| `core/validation` | `src/core/validation/utils/cache/readValidationEntry.ts` | 525 |
| `core/validation` | `src/core/validation/utils/read/readSchemaNodeErrors.ts` | 519 |
| `core/validation` | `src/core/validation/utils/guard/compileEntryGuards.ts` | 436 |
| `core/validation` | `src/core/validation/utils/guard/readSchemaNodeGuard.ts` | 336 |
| `core/validation` | `src/core/validation/utils/lifetime/evictValidationRoot.ts` | 272 |
| `core/validation` | `src/core/validation/utils/run/runSchemaNodeValidation.ts` | 184 |
| `core/validation` | `src/core/validation/utils/route/updateSchemaNodeGlobalErrors.ts` | 150 |
| `core/validation` | `src/core/validation/utils/lifetime/releaseValidationRoot.ts` | 138 |
| `core/validation` | `src/core/validation/utils/guard/isValidator.ts` | 135 |
| `core/validation` | `src/core/validation/utils/lifetime/retainValidationRoot.ts` | 120 |
| `core/validation` | `src/core/validation/utils/lifetime/recentReleaseList.ts` | 94 |
| `core/validation` | `src/core/validation/utils/route/normalizeIssueDataPath.ts` | 19 |
| `core/validation` | `src/core/validation/utils/cache/validationEntries.ts` | 15 |
| `errors` | `src/errors/formErrorCode.ts` | 3,932 |
| `errors` | `src/errors/JSONSchemaError.ts` | 131 |
| `errors` | `src/errors/ValidationError.ts` | 126 |
| `errors` | `src/errors/SchemaFormError.ts` | 125 |
| `errors` | `src/errors/UnhandledError.ts` | 124 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputArray.tsx` | 1,390 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputUnion.tsx` | 1,140 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputStringCheckbox.tsx` | 746 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputStringRadio.tsx` | 664 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputStringEnum.tsx` | 619 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputNumber.tsx` | 511 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputString.tsx` | 472 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputDateFormat.tsx` | 453 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputBoolean.tsx` | 380 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputUnion/utils/readUnionDisplay.ts` | 288 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputObject.tsx` | 127 |
| `formTypeDefinitions` | `src/formTypeDefinitions/FormTypeInputVirtual.tsx` | 113 |
| `formTypeDefinitions` | `src/formTypeDefinitions/index.tsx` | 38 |
| `helpers` | `src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts` | 1,896 |
| `helpers` | `src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts` | 656 |
| `helpers` | `src/helpers/jsonPointer/utils/getAbsolutePointer.ts` | 561 |
| `helpers` | `src/helpers/error/formatErrorMessage/formatRegisterPluginError.ts` | 427 |
| `helpers` | `src/helpers/virtualization/resolveVirtualizationOptions/resolveVirtualizationOptions.ts` | 366 |
| `helpers` | `src/helpers/schemaIdentity/isSameSchema.ts` | 310 |
| `helpers` | `src/helpers/warning/warningCode.ts` | 300 |
| `helpers` | `src/helpers/formTypeInputDefinition/formTypeInputMap.ts` | 209 |
| `helpers` | `src/helpers/formTypeInputDefinition/utils/formTypeTestFnFactory.ts` | 208 |
| `helpers` | `src/helpers/error/formatValidationError/utils/replacePattern.ts` | 182 |
| `helpers` | `src/helpers/warning/warnDevelopmentIssue.ts` | 179 |
| `helpers` | `src/helpers/error/formatValidationError/utils/getErrorMessage.ts` | 173 |
| `helpers` | `src/helpers/virtualization/VirtualizationManager/scheduleIdle.ts` | 172 |
| `helpers` | `src/helpers/error/formatValidationError/formatValidationError.ts` | 163 |
| `helpers` | `src/helpers/formTypeInputDefinition/utils/pathExactMatchFnFactory.ts` | 159 |
| `helpers` | `src/helpers/formTypeInputDefinition/regex.ts` | 136 |
| `helpers` | `src/helpers/jsonPointer/enum.ts` | 120 |
| `helpers` | `src/helpers/schemaIntersection/utils/intersectMultipleOf.ts` | 117 |
| `helpers` | `src/helpers/schemaIntersection/utils/intersectEnum.ts` | 92 |
| `helpers` | `src/helpers/error/formatErrorMessage/utils/formatBulletList.ts` | 84 |
| `helpers` | `src/helpers/jsonPointer/utils/stripFragment.ts` | 81 |
| `helpers` | `src/helpers/schemaIdentity/isRenderTerminal.ts` | 73 |
| `helpers` | `src/helpers/error/formatErrorMessage/formatDynamicFunctionError.ts` | 70 |
| `helpers` | `src/helpers/formTypeInputDefinition/utils/withFormTypeInputErrorBoundary.tsx` | 67 |
| `helpers` | `src/helpers/schemaIdentity/isRenderAtomic.ts` | 65 |
| `helpers` | `src/helpers/jsonPointer/utils/isAbsolutePath.ts` | 64 |
| `helpers` | `src/helpers/error/formatErrorMessage/utils/getErrorMessage.ts` | 62 |
| `helpers` | `src/helpers/virtualization/resolveVirtualizationOptions/type.ts` | 59 |
| `helpers` | `src/helpers/error/formatErrorMessage/formatFormTypeInputMapError.ts` | 52 |
| `helpers` | `src/helpers/schemaIntersection/utils/intersectConst.ts` | 48 |
| `helpers` | `src/helpers/schemaIntersection/utils/validateRange.ts` | 48 |
| `helpers` | `src/helpers/schemaIntersection/utils/intersectMaximum.ts` | 44 |
| `helpers` | `src/helpers/schemaIntersection/utils/intersectMinimum.ts` | 44 |
| `helpers` | `src/helpers/error/formatErrorMessage/formatVirtualizationDisabledWarning.ts` | 38 |
| `helpers` | `src/helpers/schemaIntersection/utils/constant.ts` | 32 |
| `helpers` | `src/helpers/error/formatErrorMessage/utils/createDivider.ts` | 30 |
| `helpers` | `src/helpers/error/formatErrorMessage/utils/formatMultiLine.ts` | 28 |
| `helpers` | `src/helpers/error/formatErrorMessage/utils/constants.ts` | 18 |
| `hooks` | `src/hooks/useFormSubmit.ts` | 890 |
| `hooks` | `src/hooks/useChildNodeErrors.ts` | 614 |
| `hooks` | `src/hooks/useSchemaNodeTracker.ts` | 138 |
| `hooks` | `src/hooks/useSchemaNodeSubscribe.ts` | 117 |
| `hooks` | `src/hooks/useChildNodeComponentMap.ts` | 113 |
| `hooks` | `src/hooks/useSchemaNode.ts` | 57 |
| `providers` | `src/providers/RootNodeContext/RootNodeContextProvider.tsx` | 1,851 |
| `providers` | `src/providers/FormTypeRendererContext/FormTypeRendererProvider.tsx` | 930 |
| `providers` | `src/providers/ExternalFormContext/ExternalFormContextProvider.tsx` | 811 |
| `providers` | `src/providers/FormErrorContext/utils/createFormErrorService.ts` | 755 |
| `providers` | `src/providers/RootNodeContext/utils/resetRootLoad.ts` | 740 |
| `providers` | `src/providers/RootNodeContext/utils/createRootLoad.ts` | 554 |
| `providers` | `src/providers/FormTypeRendererContext/useFormTypeRendererContext.ts` | 469 |
| `providers` | `src/providers/RootNodeContext/utils/applyFormErrors.ts` | 355 |
| `providers` | `src/providers/FormErrorContext/reportErrorToHost.ts` | 293 |
| `providers` | `src/providers/FormTypeInputsContext/FormTypeInputsContextProvider.tsx` | 289 |
| `providers` | `src/providers/RootNodeContext/utils/flushRootLoad.ts` | 242 |
| `providers` | `src/providers/WorkspaceContext/WorkspaceContextProvider.tsx` | 196 |
| `providers` | `src/providers/VirtualizationContext/VirtualizationContextProvider.tsx` | 183 |
| `providers` | `src/providers/RootNodeContext/utils/subscribeRootLoad.ts` | 177 |
| `providers` | `src/providers/FormErrorContext/FormErrorContextProvider.tsx` | 151 |
| `providers` | `src/providers/InputControlContext/InputControlContextProvider.tsx` | 131 |
| `providers` | `src/providers/FormErrorContext/useBoundaryReporter.ts` | 129 |
| `providers` | `src/providers/RootNodeContext/useLiveNode.ts` | 91 |
| `providers` | `src/providers/VirtualizationContext/VirtualizationContext.ts` | 22 |
| `providers` | `src/providers/ExternalFormContext/useExternalFormContext.ts` | 14 |
| `providers` | `src/providers/FormErrorContext/FormErrorContext.ts` | 14 |
| `providers` | `src/providers/FormErrorContext/FormErrorPathContext.ts` | 14 |
| `providers` | `src/providers/FormErrorContext/useFormErrorContext.ts` | 14 |
| `providers` | `src/providers/FormTypeInputsContext/useFormTypeInputsContext.ts` | 14 |
| `providers` | `src/providers/InputControlContext/useInputControlContext.ts` | 14 |
| `providers` | `src/providers/RootNodeContext/useRootNodeContext.ts` | 14 |
| `providers` | `src/providers/VirtualizationContext/useVirtualizationContext.ts` | 14 |
| `providers` | `src/providers/WorkspaceContext/useWorkspaceContext.ts` | 14 |
| `providers` | `src/providers/RootNodeContext/RootBindingContext.ts` | 12 |
| `providers` | `src/providers/ExternalFormContext/ExternalFormContext.ts` | 10 |
| `providers` | `src/providers/FormTypeInputsContext/FormTypeInputsContext.ts` | 10 |
| `providers` | `src/providers/FormTypeRendererContext/FormTypeRendererContext.ts` | 10 |
| `providers` | `src/providers/InputControlContext/InputControlContext.ts` | 10 |
| `providers` | `src/providers/RootNodeContext/RootNodeContext.ts` | 10 |
| `providers` | `src/providers/WorkspaceContext/WorkspaceContext.ts` | 10 |
| `types` | `src/types/error.ts` | 157 |

## 부록 B. 신규 기능 측정의 파일 집합과 증거

각 목록은 실제 소스 그래프에서 선택한 모듈이며 중복된 모듈을 두 단계에 넣지 않았습니다. freezing만 마지막 남은 코드에 적용한 AST 변환입니다.

### 조각 열거와 선언 문맥

- `src/core/blueprint/utils/analyze/collectStaticSchemas.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/createBlueprintGate.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/collectDeclarations.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/declarations/getDeclaredChildNames.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/controls/getCommittedDeclarationKey.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/derive/utils/evaluate/utils/getSelectedDeclarationIds.ts`를 측정용 스텁으로 바꿨습니다.

### 투영 게이트 등록·평가와 고정점 지원

- `src/core/settle/utils/gates/bindGateHostPath.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/gates/resolveGateOccurrence.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/gates/getGateExpression.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/gates/getGateRegistry.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/gates/readProjectedValue.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/gates/evaluateGate.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/gates/flushPendingGateReads.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/gates/getGateBudgetCap.ts`를 측정용 스텁으로 바꿨습니다.

### 분리된 청사진 분석·선언 인덱스

- `src/core/blueprint/utils/diagnostics/constant.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/diagnostics/throwBlueprintError.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/diagnostics/validateControlGroups.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/collectSchemaCapabilities.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/collectGateEvaluationReads.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/getTemplateKey.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/declarations/copyBlueprintDeclarations.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/populateVirtualNodes.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/populateNodeChildren.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/buildNodes.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/CompleteExpressionReads.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/hasCompleteExpressionReads.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/registerBlueprintDependency.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/validateShape.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/diagnostics/validateChildTargets.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/blueprint.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/itemEntry/getItemEntry/utils/getItemSchemaPath.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/itemEntry/getItemEntry.ts`를 측정용 스텁으로 바꿨습니다.

### 불변 revision 원장

- `src/core/record/utils/SchemaNodeRevisionLedger.ts`를 측정용 스텁으로 바꿨습니다.

### 잠복 원본·이탈한 참조의 읽기

- `src/core/settle/utils/latent/indexLatentDescendant.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/getLatentPathIndex.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/setLatentRaw.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/indexEnteredLatentKey.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/HostLatent.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/restoreLatentState.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/hasLatentUnder.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/getLatentOrder.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/distributeLatentValue.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/detached/hasLivePathKind.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/detached/emptyDetachedReads.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/commit/updateInactiveValuesMemo.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/detached/captureDetachedSchemaNodeReads.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/captureOwnLatent.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/getEnteredLatentKeys.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/readLatentSlotSource.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/readRawTree.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/latent/captureArrayLatent.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/detached/readSchemaNodeInactiveValues.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/detached/readSchemaNodeTypeMismatch.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/detached/readSchemaNodeTypeMismatches.ts`를 측정용 스텁으로 바꿨습니다.

### 커밋 진단·오류 기록·사슬 끝 보고

- `src/core/settle/utils/errors/recordSettlementFailure.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/assertNotInDelivery.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/bundleChainErrors.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/createFormErrorRecord.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/readFormErrorCode.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/collectChainRecords.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/reportOwnerlessError.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/deliverChainRecords.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/finishQueuedErrors.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/reportValidationFailure.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/clearWarningKeys.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/dedupeWarningRecord.ts`를 측정용 스텁으로 바꿨습니다.
- `src/core/dispatch/utils/report/readReferenceOnlySchemaPaths.ts`를 측정용 스텁으로 바꿨습니다.

### 남은 운영 불변 운반체의 freezing

앞선 모듈 제거 뒤 남은 코드의 `Object.freeze(x)` 호출을 `(x)`로 바꿨습니다.

### 분리선 B에서 신규 쪽으로 추가 배분한 혼합 모듈

투영 게이트 등록·평가와 고정점 지원에는 다음 모듈을 더 포함했습니다.

- `src/core/settle/utils/compute/selectChildren.ts`를 추가로 측정용 스텁으로 바꿨습니다.

분리된 청사진 분석·선언 인덱스에는 다음 모듈을 더 포함했습니다.

- `src/core/blueprint/utils/types/intersectAllowedTypes.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/types/unionAllowedTypes.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/types/readAllowedTypes.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/readSchemaObject.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/types/resolveNodeStrategy.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/types/foldAllowedTypes.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/resolveReference.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/types/inferLiteralTypes.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/types/inferAllowedTypes.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/types/resolveNodeTypes.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/isLiteralDefault.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/blueprint/utils/analyze/collectDeriveConvergenceTargets.ts`를 추가로 측정용 스텁으로 바꿨습니다.

잠복 원본·이탈한 참조의 읽기에는 다음 모듈을 더 포함했습니다.

- `src/core/settle/utils/transition/getTransitionCap.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/readUnsetPolicy.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/writeLatentRaw.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/isReplacedLivePath.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/captureExitedRaw.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/captureLatentDescendants.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/readDepartingAncestorPolicy.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/applyExitClearing.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/restoreArrayStructure.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/withdrawDetachedFills.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/prunePerishedPaths.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/pruneArrayTailPaths.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/finalizePerished.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/finalizeExits.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/restoreSourceB.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/isMissingRaw.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/readDefault.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/hasWrongKindBranchAncestor.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/collectFillDescendants.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/hasRecursiveFill.ts`를 추가로 측정용 스텁으로 바꿨습니다.
- `src/core/settle/utils/transition/transitionSettlement.ts`를 추가로 측정용 스텁으로 바꿨습니다.

### 재현 자료

분석 스크립트는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundle-115/analyze.mjs`이고 SHA-256은 `8a2ceedb7720ce4dcf8be2b4725c3413e02176e08e1f31b7f134d046f066b5a1`입니다. `base`, `areas`, `direct`, `features`, `reductions`, `refine`, `details` 모드는 각각 현재 기준·연쇄 제거·직접 제거·분리선 A·축소 후보·초과 중복 제거·개별 후보를 재측정합니다. 분리선 B의 선택 목록과 원시 결과는 `out/features-broad.json`에 고정했습니다. B를 다시 측정할 때에는 이 JSON의 각 단계 모듈 목록을 같은 M4 순서로 사용하면 됩니다. 각 분석 호출에 설정한 제한은 최대 400초이고 실제 분석 명령은 수초 내에 종료했습니다. 지속 서버나 watcher를 띄우지 않았고 rolldown build는 close했으며, esbuild와 gzip은 일회성 CLI로 자연 종료했습니다.

원시 근거는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundle-115/out/base.json`, `areas.json`, `direct.json`, `features.json`, `features-broad.json`, `reductions.json`, `inventory.json`에 있습니다. 소스맵은 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundle-115/out/mapped.min.mjs.map`에 있고 축소 코드는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundle-115/out/base.min.mjs`에 있습니다. 이 임시 자료는 저장소에 추가하지 않았습니다. 보고서에는 임시 자료가 사라져도 확인할 수 있도록 숫자, 분리선, 제거 방법과 전체 모듈 목록을 함께 남겼습니다.
