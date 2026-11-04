# B6 측정 준비와 실행 계약

B4-2 도구와 원시 증거는 수정하지 않습니다. B6은 결함 수정이므로 목표 행의 개선을 요구하지 않습니다. 새 도구는 CLI로 호출되며, 준비된 입력의 바이트 해시와 일회성 시작 마커가 실행 가능 여부를 결정합니다.

## 재사용과 조정

- `buildStages.mjs`: B4-2의 같은 계측 경계를 유지합니다. 삭제된 별표 장치 네 단계만 실제로 부재할 수 있으며 manifest에 기록합니다. 없는 함수에 타이머를 만들지 않고, 장부의 해당 항목은 0입니다. 일반 슬롯 함수는 실제 입력 그래프에 있는 경우 계속 계측합니다.
- `prepare.mjs`: root가 확인한 제품 커밋을 인수로 요구하며 깨끗한 제품 소스와 동일한 공개 선언을 확인합니다. A는 지정된 stage 커밋의 archive와 `BASELINE_COMMIT` 표식을 요구합니다. 제품 커밋 완료와 root의 준비 확인 뒤에만 한 번 실행합니다.
- `checkLoad.mjs`: 준비된 A/B 각각의 22행을 두 번씩 무시간 실행하여 44동작씩 검증하고, legacy의 호환 18행 36동작도 확인합니다. 측정기가 resolve하는 AJV8 플러그인 산출물의 존재와 해시를 기록합니다. 정식 표본이나 워밍업으로 사용하지 않습니다.
- `window.mjs`: 명시적 `--authorized`와 Node 26이 필요합니다. B4-2의 22행, 역할별 10개 프로세스, 20회 워밍업, 100표본, `--quality=legacy`, 단계 장부, 보충 계측, Node/Bun 힙과 슬롯 보존량을 유지합니다. 별표 장치가 존재해야 성공하는 `wildcardCost.mjs`는 실행하지 않습니다.
- `summarize.mjs`: B4-2의 원시 표본·품질·해시·단계 조정 검사를 유지합니다. 채택 관문은 품질, TEST-073 주판정 악화 0, `switch-oneOf-80` 및 `switch-siblings-0` 장부 합계가 각각 A 중앙값+A 자체 프로세스 중앙값 폭 이내, Node 노드당 힙 B 중앙값≤A 최대입니다. 개별 단계·배달·진입·비계측 시간과 Bun 힙은 진단으로 보고하며 별도 채택 관문을 추가하지 않습니다.
- B4-2의 `verifyInputs.mjs`, `stages.mjs`, `recorder.mjs`, `retention.mjs`, `delivery.mjs`, `mountDelivery.mjs`는 그대로 재사용합니다. 준비된 단계 번들에는 B6 계측기가 적용되며 실행기는 그대로입니다.

## root 실행 순서

아래 명령은 저장소 루트에서 실행합니다. 먼저 기존 설치의 Node 26과 Bun을 PATH로 선택하고, `B6_A_PACKAGE`를 빌드된 A archive 패키지, `B6_CANDIDATE_COMMIT`을 root가 확인한 최종 제품 커밋, `B6_RUN`을 새 외부 실행 디렉터리로 설정합니다. 실행 디렉터리 이름은 기존 장치와 같은 `perf-runs/YYYYMMDDTHHMM-<7자리 SHA>-<이름>` 형식입니다. 설치나 새 worktree를 만들지 않습니다.

```sh
B6_TOOLS=packages/canard/schema-form/architecture/verification/branch-switch/tools/b6
B4_TOOLS=packages/canard/schema-form/architecture/verification/branch-switch/tools/b4-2
node --version
bun --version
node "$B6_TOOLS/checkTools.mjs"
yarn workspace @canard/schema-form-ajv8-plugin build
node "$B6_TOOLS/prepare.mjs" --baseline="$B6_A_PACKAGE" --root="$B6_RUN" --candidate-commit="$B6_CANDIDATE_COMMIT"
node "$B6_TOOLS/checkLoad.mjs" "$B6_RUN"
node "$B4_TOOLS/delivery.mjs" --baseline="$B6_RUN/bundles/A/index.node.mjs" --candidate="$B6_RUN/bundles/B/index.node.mjs" --output="$B6_RUN/delivery"
node "$B4_TOOLS/mountDelivery.mjs" "$B6_RUN/delivery"
```

배달 비교는 72장면/430관측점, mount 비교는 6장면/12관측점이어야 하며 차이는 0이어야 합니다. 이 72장면에는 이름이 `*`인 속성이 없습니다. 별표 동작 변경 11건과 예약 이름 경로 변경은 제품 시험으로 별도 검증하고, PR 본문에 시험 이름과 기대값 변경을 적어야 합니다. 코퍼스를 확대하거나 원래 행을 교체하지 않습니다.

다른 측정 창이 없다는 코디네이터 승인 후 root만 다음을 실행합니다.

```sh
node "$B6_TOOLS/window.mjs" "$B6_RUN" --authorized
node "$B6_TOOLS/summarize.mjs" "$B6_RUN" "$B6_RUN/summary"
```

창 진입은 5초 CPU 관측과 기존 B4-2 방해 프로세스 검사를 통과해야 합니다. 추가로 관측된 외부 프로세스 CPU 합계가 30%를 넘으면 정식 표본 없이 종료 코드 3을 반환합니다. root는 이 경우에만 2분 간격으로 사전 검사를 재시도하고 30분이 지나면 코디네이터에게 보고합니다. `formal-start.json` 생성 이후에는 재실행하지 않습니다. 중단·실패·품질 미달 원시는 보존하며 임의로 새 창을 열지 않습니다.

요약 JSON과 배달·mount 요약 및 차이 목록을 `raw/b6/`로 복사합니다. 명령 로그, 절대 경로가 든 원시 manifest 외부 필드, 실행용 번들, heap snapshot은 외부 실행 디렉터리에 둡니다. `b6-results.md`와 최종 PR 본문은 root가 작성합니다.

## 준비 단계 검증

```sh
node "$B6_TOOLS/checkTools.mjs"
```

이 명령은 합성 데이터로 장부 악화·힙 증가·TEST-073 악화·품질 미달·요약 변조·입력 변경·미승인 창 진입을 검사하며 정식 성능 표본을 실행하지 않습니다. 합성 검증은 실제 B 번들의 빌드나 제품 관문을 대신하지 않습니다.

## 환경 실패

검증 구성요건의 458C-03을 적용합니다. 준비물 누락이나 외부 고부하로 중단된 창은 판정 불가·환경 실패로 원시를 보존합니다. 코디네이터 확인 뒤 누락된 플러그인을 빌드하고 A/B 각 22행 44동작의 무시간 적재 점검을 통과시킨 다음 같은 고정 구성의 새 디렉터리에서 새 창 한 번만 엽니다. 중단 표본은 새 창의 판정에 합치지 않습니다. 정상 완료나 품질 미달 창을 임의로 다시 여는 규칙이 아닙니다.
