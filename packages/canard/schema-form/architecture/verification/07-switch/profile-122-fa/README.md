# 122 F-A — 필드 계층 병합 검증

작업 트리: stage-07, 기준 HEAD `087e5618e35af1a9ccac5439c9f39b58bbba0013`. 원장·공개 API·노드 이벤트 계약은 유지했습니다. F-A만 적용했으며 F-B 이후의 최적화는 포함하지 않았습니다.

작업 중 외부 진단 작업의 문서 커밋으로 현재 HEAD가 be0ad1a45로 이동했습니다. 기준 HEAD와의 차이는 branch-regression-diagnosis-122.md 추가 하나뿐이며 제품 코드는 같습니다. 이 문서는 F-A 패치에서 제외했습니다. 제가 git 쓰기를 수행하지 않았고 패치의 기준은 계속 087e5618e입니다.

SchemaNodeField의 구독·메모를 SchemaNodeProxy로 합치고 필드 전체의 경로 Provider와 BoundedField를 제거했습니다. 한 memo 오류 경계 안에서 errorMessage를 계산하고 선택한 렌더러를 memo로 유지합니다. 갱신 개정은 snapshot ref로 읽습니다. 보고 훅은 path를 인자로 받으며 경로 문맥은 DeferrableNodeProxy의 Placeholder만 사용합니다. 입력 경계의 기존 generation 소비 층은 유지했습니다. 소유 INTENT·DETAIL은 구현보다 먼저 갱신했습니다.

## 런타임 계수

측정기는 121라운드의 scratch `proxy-audit/ra.mjs`와 `entry.tsx`를 tools로 옮긴 것입니다. 작은 평면 폼과 배열 폼 각각을 제어·비제어 입력으로 실행합니다. 평면의 쓰기 12종과 배열의 쓰기 6종을 보존했습니다. React production profiling 런타임의 함수·클래스 호출을 계수하며 제품 소스 문자열을 단언하지 않습니다. fiber는 커밋된 현재 트리를 한 번 순회하여 가장 가까운 node.path·data-path·입력 path에 귀속하고, host·Fragment·memo fiber도 셉니다. 함수 호출 계수와 fiber 방문 계수는 구분합니다.

| 시나리오 | 필드당 fiber HEAD → 변경 | 자기 필드 쓰기당 렌더 HEAD → 변경 | DOM 반영 지연 중앙값 HEAD → 변경, µs |
| --- | --- | --- | --- |
| 평면, 제어 | 24 → 21 | 10 → 10 | 398.69 → 361.17 |
| 평면, 비제어 | 24 → 21 | 10 → 10 | 312.15 → 292.33 |
| 배열, 제어 | 21 → 18 | push의 배열 노드 17 → 17 | 327.81 → 298.31 |
| 배열, 비제어 | 21 → 18 | push의 배열 노드 17 → 17 | 366.79 → 321.90 |

평면의 한 필드 쓰기는 루트까지 포함하면 총 20 → 20회이고, fiber 방문은 68 → 62회입니다. 부모 /o의 x만 바꾸는 쓰기는 총 30 → 30회, 방문 92 → 83회입니다. 형제와 변경되지 않은 자식 필드의 렌더는 0회입니다. 같은 값 쓰기는 총 렌더·방문 모두 0회입니다. 명시 Refresh의 원본 입력 리마운트는 해당 노드만 1회이고 경계는 유지됩니다. 입력 onChange의 리마운트는 0회, 외부 leaf setValue는 해당 입력만 1회입니다. 각 쓰기의 컴포넌트별 렌더·리마운트·새 마운트는 head.json과 change.json에 있습니다.

속도 비용은 자기 쓰기의 렌더 호출 수를 늘리지 않고 fiber 방문을 줄이는 것입니다. 메모리 비용은 필드당 살아 있는 fiber 3개와 필드 전체 오류 경계의 상태를 제거하는 구조적 감소입니다. heap 바이트는 측정하지 않았습니다.

지연은 각 시나리오에서 외부 leaf setValue를 8번만 실행한 관측치입니다. 쓰기 호출 직전부터 실제 input.value setter 또는 연결된 입력의 host 삽입 직후까지 커밋 내부에서 측정합니다. 타이머·이펙트 종료 대기는 포함하지 않습니다. 전체 시험과 겹친 초기 표본은 폐기했고, 시험 종료 뒤 HEAD와 변경판을 순서대로 실행한 최종 표본만 저장했습니다. 시간 벤치마크나 통계적 성능 판정은 실행하지 않았습니다.

## 새 시험과 HEAD 대조

- renderCounts.test.ts: 필드당 fiber 21개 단언은 HEAD의 실제 24개 때문에 실패했습니다. 제어·비제어의 자기 쓰기당 렌더 10회와 형제·부모 쓰기의 다른 필드 렌더 0회는 계약 단언으로 양쪽에서 통과했습니다.
- rendererBoundary.test.tsx: renderer·formatError의 RENDER_FAILED는 원래 오류 identity·path·componentStack·surface sink·보고 콜백·console 전달을 유지했습니다. 정상 입력의 Refresh는 해당 입력만 교체하고 모든 경계 instance를 유지했습니다. 실패한 경계는 Refresh와 피어 쓰기로 복구되지 않았으며 렌더러 실패는 Remount로 복구되었습니다. 7개 계약 사례가 React 19·18 각각 HEAD와 변경판에서 통과했습니다.
- HEAD 최종 사전 검사: 1개 실패, 16개 통과. 변경 뒤 동일 검사: 17개 통과. 도구 정리 뒤 계수 시험 3개도 다시 통과했습니다.

## 지정 검증

명령은 모두 패키지 디렉터리에서 실행했습니다. 패키지 관리자 명령은 별도의 호출에서 파이프·리다이렉트·환경 변수 접두사 없이 실행했습니다.

| 명령 | 결과 |
| --- | --- |
| npx vitest run --project unit --project render --project react18 --reporter=dot | exit 0; 461개 파일, 3,398개 통과, 기존 todo 1개; 64.56초 |
| yarn test:production | exit 0; 패키지 스크립트의 NODE_ENV=production 및 configLoader runner/cache false 적용; 9개 파일, 20개 통과 |
| npx tsc --noEmit --composite false --rootDir . -p tsconfig.json | exit 0 |
| npx eslint "src/**/*.{ts,tsx}" | exit 0 |
| node architecture/verification/07-switch/tools/check-legacy-isolation.mjs | exit 0; LEGACY_ISOLATED, 1,675개 파일 |
| git diff --check | exit 0 |

기존 개발 모드 경고와 Node/Storybook 안내는 테스트 결과에 남아 있습니다. 설치·git 쓰기·타이밍 벤치마크는 수행하지 않았습니다. 마지막 빌드 서비스는 stdin EOF 후 exit 0으로 종료했습니다. 변경은 작업 트리에 남겼습니다.

## 재실행과 후속 타이밍 자산

prepare-branch1-bundles.mjs의 `--react-fa both`는 HEAD와 작업 트리의 별도 production CJS를 만듭니다. 변경된 제품 파일은 HEAD 빌드에 섞이지 않고, 삭제된 SchemaNodeField도 역사적 경로로 해석합니다. Form·노드 팩토리·blueprint·equivalentFixtures와 작은 React mount 하네스를 내보내므로 후속 세션에서 같은 자산으로 React 또는 core를 측정할 수 있습니다. React 계수용 instrumentation은 실행 시 메모리에만 적용하며 번들은 계측하지 않습니다.

- 패치: 지정 scratchpad의 fa.patch. 소스·소유 문서·시험·측정 도구·이 검증 기록을 포함합니다.
- 번들: 지정 scratchpad/bundles/fa-head.cjs, fa-change.cjs. 저장 위치는 S/bundles로 한정했습니다.
- 측정 결과: head.json, change.json. 측정 당시 번들의 SHA-256을 포함합니다.

번들 생성 명령: `node architecture/verification/07-switch/tools/prepare-branch1-bundles.mjs --react-fa both`.
측정 명령: `node architecture/verification/07-switch/tools/measure-react-render-counts.mjs head architecture/verification/07-switch/profile-122-fa/head.json` 및 같은 형식의 change 명령입니다. 시험은 current/--counts-only 모드로 현재 소스를 새로 번들링하고 지연 루프 없이 런타임 계수만 단언합니다.
