# Ⅳ-0 측정 장치

제품 기준은 `b026bd04f`입니다. 제품 소스·manifest·빌드 설정은 수정하지 않습니다. 단계 시작은 `0eb03ff3bb54bf06af95271d157aefece1b9bf32`이며, 준비 과정에서 보관된 소스의 모든 Git blob과 현재 배포 번들의 기존 병합 창 해시를 대조합니다.

## 준비와 관측

기존 설치의 Node 26과 지정 workspace 빌드 산출물을 사용합니다. `IV_ROOT`는 아직 없는 외부 `.noindex` 디렉터리, `IV_START`는 단계 시작의 보관 패키지, `IV_AGENT_PID`는 이 워커의 에이전트 PID입니다.

```sh
IV_TOOLS=packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-0
node "$IV_TOOLS/checkTools.mjs"
node "$IV_TOOLS/prepare.mjs" "$IV_ROOT" "$IV_START"
node "$IV_TOOLS/checkLoad.mjs" "$IV_ROOT"
node "$IV_TOOLS/diagnoseRows.mjs" "$IV_ROOT"
node "$IV_TOOLS/diagnoseDelivery.mjs" "$IV_ROOT"
node "$IV_TOOLS/rehearse.mjs" "$IV_ROOT"
# 코디네이터의 파일럿 창 허가 뒤 실행합니다.
node "$IV_TOOLS/pilot.mjs" "$IV_ROOT" --authorized "$IV_AGENT_PID"
# 파일럿 결과를 보고하고 정식 창 허가를 받은 뒤 실행합니다.
node "$IV_TOOLS/window.mjs" "$IV_ROOT" --authorized "$IV_AGENT_PID"
```

실제 alternate CLI 예행은 한 행·한 프로세스·예열 1/표본 1이며 정식 마커를 만들지 않습니다. 타이머 러너도 같은 조건으로 별도 예행합니다. 공식 창은 22행·S/E 각 10프로세스·20예열/100표본·`quality=legacy`로 한 번만 실행합니다. L 주 레인은 S 역할 프로세스에 들어 있는 0.16.1이며 E 역할의 0.16.1은 보조입니다. 단계는 네 행·S/E 각 3프로세스, 바닥 분해는 두 행·세 동작·각 3프로세스입니다. Node/Bun 힙도 같은 창에 포함합니다. 공용 quiet preload와 3초·개별 PID 30%·일반 120초/Spotlight 600초 정책을 유지합니다. 표본 사이에는 타이밍 밖 `setImmediate()`를 사용합니다.

## 진단의 의미

- 마운트는 쓰기 분모에서 제외합니다. static-first 마운트는 일반 정착 컨텍스트 자체를 만들지 않을 수 있습니다.
- 실제 branch host의 값·선택 변화, 조상 출력 집계, 최소 포함 호스트, 정적 경계 밖 의존을 따로 기록합니다. `qualifies`는 보수적 정적 닫힘이고 `useful`은 그중 비루트 호스트로 닫히는 경우입니다. 루트로 닫힌다는 사실만으로 국소 바퀴의 방문 감소를 주장하지 않습니다.
- 역방향 의존 색인은 watch·파생·게이트 읽기의 합집합입니다. 표현식·게이트의 읽기와 required 간선도 보존합니다. 무관한 외부 원천에서 들어오는 읽기는 허용하되, 조상 객체를 읽거나 범위 밖 소유자를 흔드는 쓰기는 거절합니다. wildcard가 남거나 함수형 injectTo 규칙이 하나라도 있으면 보수적으로 unknown으로 거절하며 실제 injectTo 목적지는 별도 기록합니다.
- computeNode 재귀 호출, 호출별 호스트 바퀴, 바퀴의 라운드를 구분합니다. 빈 종료 라운드와 다음 라운드를 연 빈 변경 집합을 합치지 않습니다. 마지막 빈 라운드는 고정점 확인이므로 자동으로 제거 가능한 비용이 아닙니다.
- 컨텍스트 객체 수, scratch 신규/재사용 수, 제품 소스에서 실행한 new Map/Set 및 PathKeyedMap/PathKeyedSet 수를 셉니다. 정착 뒤 exitFieldNodeChain의 배달 파동 할당은 별도로 보존하고 합계에도 포함합니다. 관측기의 객체는 제외합니다. 일반 객체·배열 전체의 할당 수는 추정하지 않습니다.
- no-op·one-leaf·switch는 같은 fixture의 독립 인스턴스입니다. no-op의 단계 비용을 관측된 바닥 대용값으로, switch와의 차이를 형상 증가분으로 기록합니다. 이 차이를 무조건 제거 가능한 인과적 비용으로 보지 않습니다.
- 세부 self 타이머는 중첩 합을 보존합니다. 같은 프로세스 plain 짝과의 총시간 차이를 enter/exit 쌍 수로 나누는 B9-0 균일 오버헤드 모형으로 selfNetUs를 구하며, 음수도 그대로 남깁니다.

## 검증

```sh
node "$IV_TOOLS/checkTools.mjs"
yarn exec eslint "$IV_TOOLS/**/*.mjs"
yarn exec tsc --allowJs --checkJs --noEmit --skipLibCheck --target es2023 --module nodenext --moduleResolution nodenext --types node "$IV_TOOLS"/**/*.mjs
yarn exec prettier --check "$IV_TOOLS/**/*.mjs"
yarn workspace @canard/schema-form lint
```

제품 typecheck와 배포 산출물 검사는 지정 `yarn workspace @canard/schema-form build`에 포함됩니다. 후처리는 원시 표본만 읽으며 숫자·표본 수·레인 순서·PID 독립성·self 보존과 불변 입력을 재검증합니다. 공개 원시는 로컬 경로를 가리고 CPU 관측을 상위 10개 프로세스의 이름·비율로 축소합니다.

창의 시간 도구를 고정한 뒤 진단만 수정했다면 새 진단 root를 준비해 시계 없는 진단만 다시 실행합니다. 과거 시간 root의 live 도구 해시는 현재 코드와 다르므로 `summarize`를 다시 실행하지 않고, 이미 공개한 압축 원시는 `checkResults.mjs`로 재검산합니다. `publishDiagnostics.mjs`, `publishTimings.mjs`, `renderReport.mjs`는 `--check`로 공개 파일의 결정적 재생성을 확인합니다. 시간 root와 후속 진단 root는 `raw/iv-0/provenance.json`에 분리합니다.
