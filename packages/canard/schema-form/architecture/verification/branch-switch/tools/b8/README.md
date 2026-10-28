# B8 mount 단계 장부 장치

Planning method: `seiri:write-plan` 기본 방법. 편집 범위는 이 디렉터리의 신규 진단 도구에 한정됩니다. 제품·시험·배포물·결과 문서는 부모 작업자가 소유합니다.

## 계획과 경계

1. B6의 esbuild `onLoad`/TypeScript AST 패턴을 재사용하여 소스를 수정하지 않는 scratch 번들을 만듭니다. `0eb03ff3b`, `95853ae5f`, `ad0be79ba`, 최종 후보에 같은 계측기를 사용합니다. 함수가 없던 과거 head는 manifest에 부재로 기록합니다.
2. blueprint 스키마 순회, 자식 엔트리, keep/candidate 표식, dependency/watch 및 gate 경로 준비, 예약명 진단, 런타임 트리 생성, 슬롯 준비, 첫 정착을 중첩 타이머의 self 합으로 분할합니다. 경로 조립과 canonical materialization도 별도 잔여 항목으로 남깁니다.
3. 기존 `setupOperation`의 `mount-oneOf-80`을 그대로 사용합니다. unwrapped/coarse wrapped/detailed 순서를 표본마다 순환하고, 부모가 승인한 창에서만 head별 10개 독립 프로세스 × 각 모드 20 warm-ups / 100 samples를 수집합니다. 타이머 오버헤드를 빼지 않으며 세 번들의 총시간을 모두 보존합니다. detailed 모드의 단계별 파서 self는 coarse 장부와 별도로 보고합니다.
4. 이 작업자 검증은 AST 변환·합성 recorder·네 head의 계측 경계 검증뿐입니다. 제품 빌드·scratch 번들 빌드·성능 표본은 부모가 실행합니다. 준비된 번들의 무시간 smoke가 정식 실행의 선행 조건입니다.

Review: `grounded-only`. 기존 B6 builder, canonical mount fixture, surface의 build/mount 경계를 소스로 확인했습니다. 독립 작업자는 사용하지 않습니다. 전역 `.seiri` ledger 대신 배정된 편집 범위 안의 아래 검증 기록을 사용합니다.

## 검증 기록

- [x] G1: 세 과거 head와 후보 작업 트리에서 공통 필수 경계를 찾고 변환 뒤 TypeScript 구문 오류가 없습니다.
      CHECK: `node packages/canard/schema-form/architecture/verification/branch-switch/tools/b8/checkMountTools.mjs`
      EXPECT: `B8_MOUNT_TOOLS_OK`
      EVIDENCE: `BOUNDARIES_OK` 18/31/45개 및 후보 45개, `B8_MOUNT_TOOLS_OK`; 합성 smoke·중복 PID·불완전 표본·손상 장부 거부도 포함합니다.
- [x] G2: 소유한 신규 도구 13파일만 커밋 대상으로 지정하고 기계 로컬 경로를 제외합니다.
      EVIDENCE: `B8_MOUNT_PORTABLE_OK`, `B8_MOUNT_SYNTAX_OK`, 명시적 파일 목록의 Prettier 검사 통과.
- [x] G3: 준비 번들의 canonical 무시간 smoke 명령과 정식 실행 제한을 부모에게 인계합니다.
      EVIDENCE: 준비·실행·요약 명령 인계 완료; 제품 번들 빌드·적재 검증·정식 표본은 부모 실행 항목입니다.

## 실행

준비 CLI에는 각 lane의 패키지 디렉터리와 commit을 전달합니다. `B8_STAGE_PACKAGE`, `B8_B4_PACKAGE`, `B8_B7_PACKAGE`는 각 commit의 archive 패키지이고 `B8_CANDIDATE_PACKAGE`는 최종 후보 패키지입니다. 모든 실행 산출물은 저장소 밖의 새 `B8_MOUNT_RUN`에 둡니다. 기존 설치의 Node 26을 사용하며 설치를 수행하지 않습니다.

```sh
B8_TOOLS=packages/canard/schema-form/architecture/verification/branch-switch/tools/b8
node "$B8_TOOLS/checkMountTools.mjs"
node "$B8_TOOLS/prepareMountLedger.mjs" --root="$B8_MOUNT_RUN" \
  --source="S=$B8_STAGE_PACKAGE" --commit=S=0eb03ff3b \
  --source="B4=$B8_B4_PACKAGE" --commit=B4=95853ae5f \
  --source="B7=$B8_B7_PACKAGE" --commit=B7=ad0be79ba \
  --source="E=$B8_CANDIDATE_PACKAGE" --commit="E=$B8_CANDIDATE_COMMIT"
node "$B8_TOOLS/mountLedger.mjs" --root="$B8_MOUNT_RUN" --smoke
```

부모가 조용한 창을 확보한 뒤 다음을 한 번 실행합니다. `B8_AGENT_PID`는 제외할 실행자 에이전트 프로세스 PID입니다. CPU 검사는 각 표본 프로세스 직전에 5초간 수행하며, 외부 프로세스 1개가 30%를 초과하면 중단합니다. 에이전트 PID와 관측기 자신의 PID만 제외하고 CPU 합계 기준으로 바꾸지 않습니다. 기존 `sampleWindow`와 같이 관측 구간 양끝에 모두 존재한 프로세스의 누적 CPU 차이를 사용합니다.

```sh
node "$B8_TOOLS/mountLedger.mjs" --root="$B8_MOUNT_RUN" --authorized --agent-pid="$B8_AGENT_PID"
node "$B8_TOOLS/summarizeMountLedger.mjs" --root="$B8_MOUNT_RUN"
```

`formal-start.json` 이후 재실행은 거부합니다. 원시·입력 해시·실패 기록을 보존합니다. 요약의 `minimumUs`는 기존 B3/B5와 같은 프로세스 최소값들의 중앙값이고, `medianUs`는 프로세스 중앙값들의 중앙값입니다. 범위·폭은 프로세스 중앙값 기준입니다. 단계 장부는 self 중앙값이며 개별 중앙값의 합은 총합 중앙값과 같지 않습니다. `scopedStages.detailed["gateBudgetPreparation/parsePointerSegments"]`는 예산 색인 안의 파서 self와 호출 수를 제공합니다. 무시간 `pointers` 키는 `[함수, 직접 호출자, 가장 가까운 비파서 경계, 입력 경로]`의 JSON 배열 문자열입니다. source에 없던 단계는 manifest의 `absent`에 명시되고, 존재하지만 호출되지 않은 단계와 구분합니다.

phase delta는 계측 오버헤드를 포함한 진단이며 비계측 총시간의 정확한 분해나 과거 서로 다른 창의 최소값 차이와 동일시하지 않습니다. 새로운 공통 창의 head 차이와 계약·호출 수를 함께 보고 부모가 비용의 정당성을 판정합니다. 최종 A/B 및 채택 관문은 부모의 `prepare.mjs`/`window.mjs`가 담당합니다.
