# DR-16·DR-17 검증 결과

DR-16은 이미 보고한 원인과 handler 오류만 담은 유효한 중첩 묶음의 capture 중복을 막습니다. DR-17은 caller가 없는 실패를 기존 host 채널에 깊이 우선·원소 순서의 잎으로 전달합니다. caller에게 거부하는 묶음 하나와 onError 발생 기록, React/ErrorBoundary의 thrown-value 로그는 유지합니다.

기준은 61457653ae19dfb1f11b97e29355fa3cd6af8f24입니다. 960bcd79a에서 작성한 red 증거는 보존하며, records-only DR-6 이후 새 기준으로 충돌 없이 rebase했습니다. ledger·FCA 비교는 새 기준에서 다시 수행했습니다.

## 회귀와 mutation

- 최초 red: unit 4 failed / 19 passed와 새 helper 부재 collection failure; render 7 failed / 23 passed / 3 skipped; React 18 7 failed / 26 passed. 조건별 정확한 이름과 허용 실패 이유는 raw criteria·red JSON에 있습니다.
- 깊이 50,000 known nesting은 기준에서도 보고하므로 coordinator의 후속 답변에 따라 red 회귀로 분류했습니다. 최종 onError 0회 조건은 유지합니다.
- accessor 보충 red: details/errors/index/length 읽기 실패 8건 failed, sink 예외 전파 guard 2건 passed.
- 최종 focused: unit 46 passed, render 30 passed / 3 skipped, React 18 33 passed.
- 원래 mutation 10개와 입력 guard 제거 2개를 최종 구현에서 실행했습니다. 요구한 named assertions가 모두 failed이며 source SHA-256가 각 실행 뒤 정확히 복원됐고 최종 focused green으로 확인했습니다.

## 전체 게이트

| Project | Passed | Failed | Skipped | Todo |
| --- | ---: | ---: | ---: | ---: |
| unit | 4158 | 0 | 0 | 1 |
| render | 1014 | 0 | 7 | 0 |
| react18 | 1012 | 0 | 9 | 0 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| verify-unit | 4202 | 0 | 0 | 1 |
| verify-render | 1014 | 0 | 7 | 0 |
| 합계 | 11675 | 0 | 23 | 2 |

lint는 경고 0으로 통과했고 typecheck와 정식 build도 통과했습니다. build의 DEVELOPMENT_FLAG_OK와 배포 파일 3개의 GATE_SELECTION_DIST_OK를 확인했습니다. importModel은 unit 프로젝트로 별도 실행하여 통과했습니다. 7개 프로젝트와 별도 importModel은 동시에 실행하지 않았습니다.

공개 선언은 root exports 97개·reachable signatures 916개이며 semantic 차이·새 public export·미해결 alias가 없습니다. package.json의 버전은 기준의 0.16.0 그대로이며 runtime bundles와 adapters의 tracked 변경은 없습니다.

## 원장·FCA·검토

- sup-insert로 DR16C-01 1개와 DR17C-01 4개를 추가했습니다. 대상은 ERROR-008·019·028과 EVENT-046이며 quote 75 두 문장은 review 원문에 그대로 보존했습니다. 기존 결정과 인용문은 삭제하지 않았습니다.
- ledger 26개 check는 모두 exit 0입니다. 기준의 기존 token missing 397과 plan/doc-coverage 진단은 그대로이며, sup 인용 수만 3640 → 3645입니다.
- FCA structural findings 566 → 553, failed 26 → 21, diagnostics 306 → 293입니다. verification violations 30은 같습니다. 경로 root prefix만 정규화한 정확한 multiset 비교에서 새 finding·diagnostic은 0입니다. 기존 위반과 indeterminate가 남으므로 전체 FCA PASS를 주장하지 않습니다.
- 독립 검토의 F1(입력 검사 예외 누출)과 F2(caller 거부 문구 범위)는 수정 후 별도 재검토에서 모두 종결됐습니다. 모든 reviewer terminal을 release했습니다.

## 채널과 예외

| 경로 | 이전 host 모양 | 현재 host 모양·순서 |
| --- | --- | --- |
| native submit (validator/compile/degraded) | 거부 묶음 하나 | 원인 잎 뒤 handler 잎 |
| load flush·reset | 전달 값이 묶음이면 한 번 | 각 전달 값을 잎마다, 기존 호출 순서 유지 |
| capture의 handler 실패 | handler 묶음 하나 | handler 잎마다 |
| load slot | 원소별 또는 malformed drop | 깊이 우선 잎별; malformed는 자체 보고; non-bundle compile skip 유지 |
| engine validation-result wave | 원인 묶음 하나, handler 먼저 | handler 잎 뒤 원인 잎 |
| automatic OnChange failure | 기존 handler-first | handler 잎 뒤 원인 잎 |
| React·ErrorBoundary | 던진 값 그대로 | 동일 |

명시적 validate라도 결과 파동의 리스너 실패는 caller가 없는 별도 통로이므로 host에 전달하고 validate 자체는 resolve할 수 있습니다. caller에게 거부되는 submit·validate 실패에 host 보고를 추가하지 않는다는 설명과 구별합니다.

유효한 묶음은 SchemaFormError MultipleErrors와 nonempty·own-index 배열만 인정합니다. malformed·재방문·읽을 수 없는 묶음은 같은 identity의 잎 하나입니다. accessor 보충은 새 중첩 검사 면에서 details/errors/index/length를 읽다가 던지는 경우를 닫았습니다. host shape reader는 방문 전에 own 원소를 임시 snapshot으로 읽어 부분 전달을 막고 sink callback 예외는 전파합니다. capture의 기존 top-level duck-typed 접근은 그대로이며 임의 top-level getter까지 무조건 비예외인 계약으로 넓히지 않습니다. frame·visited·snapshot의 시간과 호출별 임시 메모리는 O(N)이고 영구 노드 필드는 추가하지 않습니다.

## 현행 문서와 증거

현행 설명은 FormErrorContext·RootNodeContext·FormCore·Form·write·engine·core·errors의 module contract, 두 README, 한·영 Specification, QUICK_REFERENCE, agent knowledge의 troubleshooting·validation-and-state에서 수정했습니다. 패키지 skills와 docs/agents의 host/bundle 설명도 검색해 같은 조건부 caller 거부 문구를 반영했습니다.

raw/dr-16-17/manifest.json은 프로젝트별 실제 count와 artifact hash를 담습니다. 같은 디렉터리의 JSON/gzip에는 최초 red, 최종 green, mutation별 failed assertion·원복 hash, 전체 gate JSON·log, ledger 양쪽 log, FCA 양쪽 raw artifact와 독립 검토·재검토를 보존했습니다. machine path prefix만 placeholder로 정규화했으며 gzip mtime은 0입니다.
