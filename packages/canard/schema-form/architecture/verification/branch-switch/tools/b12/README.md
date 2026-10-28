# B12 검증 장치

기준은 B11 병합 머리 `4d0fa4a12d5a9062a83c705076f2928e600d671c`입니다. 준비·무시간 스모크는 Node 26에서 수행하며 정식 창은 코디네이터의 허가 뒤 한 번 실행합니다. `B12_BASELINE`은 기준 archive의 빌드된 패키지, `B12_RUN`은 저장소 밖의 새 perf-runs 디렉터리, `B12_SHA`는 커밋된 최종 제품 SHA, `B12_AGENT_PID`는 현재 워커 에이전트 PID입니다.

```sh
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b12/prepare.mjs --baseline="$B12_BASELINE" --root="$B12_RUN" --candidate-commit="$B12_SHA"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b6/checkLoad.mjs "$B12_RUN"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b4-2/delivery.mjs --baseline="$B12_RUN/bundles/A/index.node.mjs" --candidate="$B12_RUN/bundles/B/index.node.mjs" --output="$B12_RUN/delivery"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b4-2/mountDelivery.mjs "$B12_RUN/delivery"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b12/declarations.mjs "$B12_BASELINE" packages/canard/schema-form "$B12_RUN/declarations"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b12/window.mjs "$B12_RUN" --authorized --agent-pid="$B12_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b6/summarize.mjs "$B12_RUN" "$B12_RUN/summary"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/b11/summarizeSelf.mjs "$B12_RUN"
```

prepare는 B11 장치에 선택적 baseline-commit을 전달합니다. B11의 기본 기준은 유지합니다. window는 B11의 22행·레인별 10프로세스·20예열/100표본·legacy quality, B8의 개별 PID 30%/3초 평균·5초 간격·최대 120초 시작 지연, 정식 마커 중복 거부를 그대로 사용합니다. 스모크를 통과한 뒤 정식 시작하고 창 중에는 시험·빌드·다른 창을 실행하지 않습니다.

기존 배달 코퍼스는 두 머리의 모든 기존 관측점을 그대로 비교합니다. 새 기능을 작성할 수 없는 기준 머리에 대하여 B12 장면 일곱은 후보의 공개 계약으로 별도 단언하며 summary의 extensionScenes/extensionPhases에 기록합니다. 각 장면은 before·exit-after-drain·reentry-after-drain의 값·inactiveValues·실제 사건을 보존합니다. 재키 장면도 추가하여 7장면·21관측점을 단언합니다. 기존 비교의 관측 수와 차이 수는 이 확장 수와 구분합니다.

선언 장치는 분산 d.ts의 재수출을 따라 공개 이름 94→97, 새 타입 셋, 경고 멤버 둘, 노드 멤버 onInactive와 controls 키 inactiveValue와 리터럴·호출 시그니처가 살아 있는 키 형도 확인합니다. 릴리스 전 선언 차분 0 면제는 차분의 생략이 아닙니다.
