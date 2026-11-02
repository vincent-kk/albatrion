# C 측정 설계와 경계

## 고정 입력과 통로

F 기준1c44a823bdd9214ff79e2d60549c8a9c8339fb80, R의 B 기준5d1348ed16054efa1ec431945eb00472f4eef7f1을 scratch에서 각각 빌드했습니다. 기존 benchmark-form의 closing browser-bench 통로, production React와900×700 viewport, 입력 DOM 삽입 후 첫 rAF·full reveal·node 교체 단언을 유지합니다. baseline/control은 제품과 browser bundle 바이트가 같습니다. 설치 없이 기존 의존성을 사용했고 제품 worktree에서 측정 variant를 빌드하지 않았습니다.

## G — 전체 compile 상한

기준 readFieldNodeGuard→readValidationEntry는 compile(copy) 뒤 compileGuard를 호출합니다. scratch oracle은 guard-only 조회 시 같은 copy와 guard cache를 만들되 전체 compile을 미루며 첫 전체 검증 요청에서 같은 copy를 compile합니다. None과 OnChange의 if-flat-500을 baseline/oracle/control 각20회·3예열로 측정했습니다. 기존 nested-if mount fixture는 없어 새 합성 셀은 더하지 않았습니다.

두 mode·두 초기 kind(a/b)·세 build의12페이지에서 실제 guard 판정, kind=b→a 전환, 유효 minLength, root 값·오류와 첫 rAF/최종 필드 ID 집합을 정확히 비교했습니다. OnChange의 oracle 전체 검증은 paint 이후 유지합니다. 이 동등성의 범위는 측정 fixture이며 임의 외부 validator·duplicate ID·실패 재시도 계약을 고쳤다는 뜻이 아닙니다.

사전 규칙은 None first-paint 중앙값10% 및16.7ms 이상, control차이2배 엄격 초과 절감과 모든 측정 셀의 중앙값0.5ms 초과 퇴보 없음입니다. 첫 paint와 longest mount task를 함께 확인하며 control폭은 max(0.3ms,3%)입니다. 무효 group은 한 번 재시도하고 두 번째도 무효면 VOID입니다. 이번 전체 실행은 첫 시도에서 유효했고 G는 design-eligible입니다. 실제 공개 plugin 순서 계약의 변경은 별도 설계·PR에서 검토합니다(VALIDATE-044, 470C-04).

## F — 첫 프레임의 겹치지 않는 분해

array-1000-on/off의 None mode를 각20회·3예열로 측정했습니다. createRootLoad 입구부터 반환까지는 엔진 생성과 초기 mount를 포함합니다. provider 함수 시작부터 마지막 layout effect까지의 envelope에서 그 엔진 시간을 빼 React·DOM commit 구간으로 잡고, root.render 이후 provider 전까지와 commit부터 harness 첫 rAF까지도 별도로 보존합니다. 실행별 네 구간 합은 harness firstPaintedMs와 일치하며 구간별 중앙값/p95는 서로 더하지 않습니다. 뒤의 idle reveal commit은 첫 프레임에서 제외합니다.

## R — 동기 call과 뒤의 React commit

closing의 handle.rebuild 호출 경계·1초 slot·node 교체 검사·double-rAF를 유지하며 fresh page당 rebuild1회를 B/F와 F/B 순으로 교대해 build당30회·3예열로 수집했습니다. blueprint 무효화·createRootLoad·adoptFieldNodeTree·mount·resetRootLoad 은퇴/버퍼 보고·scheduleLoadValidation 예약을 User Timing으로 잽니다. 후속 React commit은 callDuration 밖의 별도 envelope입니다. B에 없는 validation 예약은 부재로 구분하며 시계 해상도 아래0 관측을 비용0으로 해석하지 않습니다. build당5회 CPU profile은 별도 진단이며 저장소에는 넣지 않습니다.

F·R은1ms이면서 전체의10% 이상인 제거 가능한 비용을 입증한 경우만 후속 변경 후보로 삼습니다. 큰 필수 단계의 시간만으로는 제거를 정당화하지 않으며 어떤 후속 변경도 별도 사전 oracle을 거칩니다(470C-02·03).

## 창과 보존

전체 실행은30초 quiet start와 lazy-b의 lock/overlap 규칙을 사용해 일곱 Node 프로세스를 순차 실행했습니다. 각 프로세스 시작·실행 중 경쟁과 종료 영수증을 보존하고 기존 C5 bootstrap 수용을 바꾸지 않습니다. raw/full-run-inputs.json.gz는 고정 hash와 도구 SHA를, raw/measurement-tools.json.gz·raw/instrumentation.json.gz는 비식별화 도구/계측 diff를 보존합니다. 비식별화 소스는 증거이며 재실행 전 실제 로컬 의존성 경로를 연결해야 합니다.
