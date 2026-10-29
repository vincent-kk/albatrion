# B9-1 측정 계약

제품 기준은 `3104b0d9b`입니다. 파일럿은 양보 함수 변경을 확인하는 별도 22행·행당 한 프로세스이며 결과와 코디네이터 판정은 결과 문서에 보존합니다. 정식 A/B는 고정된 제품 후보마다 허가된 창에서 한 번만 실행합니다. 수정 전 창 1은 보존하고, 독립 검토에 따른 새 제품 바이트의 창 2는 새 허가와 새 root를 사용합니다. 런타임·선언·계측 번들·stage 엔진과 타이밍 실행기 해시를 준비 때 고정하고 종료 뒤에도 확인합니다.

## 준비와 실행

`B9_BASELINE`은 기준 소스를 보관한 패키지 디렉터리이며 그 저장소 루트의 `BASELINE_COMMIT`은 정확한 기준 SHA입니다. 기준의 지정 빌드 출력을 함께 보관합니다. `--baseline-commit=<40자리 SHA>`를 생략하면 원래 기준 `3104b0d9b`를 유지합니다. B12 병합 후의 창은 승인된 단계 머리 `1da3485d3`의 전체 SHA를 명시하고, 기록 파일과 일치할 때만 준비합니다. `B9_RUN`은 아직 존재하지 않는 `.noindex` 외부 실행 디렉터리이고 단계와 비정식 예행도 각각 `.noindex` 형제로 만듭니다. `B9_AGENT_PID`는 자체 실행 에이전트 PID입니다. Node 26을 사용하고 새 설치를 하지 않습니다.

```sh
B9_TOOLS=packages/canard/schema-form/architecture/verification/branch-switch/tools/b9-1
node "$B9_TOOLS/checkTools.mjs"
node "$B9_TOOLS/prepare.mjs" --baseline="$B9_BASELINE" --root="$B9_RUN" --candidate-commit="$B9_HEAD"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/window/preflight.mjs "$B9_RUN"
node "$B9_TOOLS/checkLoad.mjs" "$B9_RUN"
# 스모크 뒤 코디네이터에게 창 허가를 질문하고, 허가 뒤에만 실행합니다.
node "$B9_TOOLS/window.mjs" "$B9_RUN" --authorized --agent-pid="$B9_AGENT_PID"
node --import tsx "$B9_TOOLS/summarize.mjs" "$B9_RUN" packages/canard/schema-form/architecture/verification/branch-switch/raw/b9-1
```

스모크는 A/B 공개 22행의 각 2동작, 모든 쓰기 단계 번들의 무시간 값 검사, 실제 legacy oneOf의 120쓰기를 포함합니다. 이전에 빠졌던 siblings-1000 보유량 행도 실제 CLI에서 120쓰기와 세 힙 스냅샷을 예행하고, 같은 inputs 해시의 성공 기록을 정식 시작 전에 확인합니다. 별도 비정식 CLI 예행은 실제 alternate의 한 행·한 프로세스·1예열/1표본으로 경로와 로더를 확인하며 정식 판정에는 넣지 않습니다. 스모크의 inputs 해시가 같아야 정식 시작 마커를 만들 수 있습니다. 시작 마커가 이미 있으면 재실행을 거부합니다. 공용 사전 점검은 자체 에이전트를 제외한 개별 외부 PID의 3초 평균 30% 조건을 유지합니다. 일반 부하는 누적 120초, Spotlight만 남으면 전체 600초까지 기다립니다. 모든 Node 자식은 공용 preload를 통해 시작 전에 점검하며 Bun 자식은 같은 함수를 부모에서 점검합니다.

## 고정된 창

- 기본 비교는 공용 alternate의 22행, 행별 A0·B0 교대, 레인별 10프로세스, 20예열/100표본, `--quality=legacy`입니다. 표본 사이에는 `setImmediate()`로 양보합니다.
- 단계는 oneOf-80·payload-12·siblings-0·siblings-1000의 A/B 각각 3프로세스입니다. B9-0의 ledger와 supplemental을 같은 하위 타이머 경계로 재사용합니다. 단계 값은 쓰기 한 번의 raw self µs이며 타이머 오버헤드를 포함합니다. 서로 다른 창의 B5 절대 µs를 채택 관문으로 쓰지 않습니다.
- Node/Bun 힙은 기존 장치를 쓰고, 보유량도 기존 코퍼스의 네 행을 기록합니다. 제품 dist를 교체하는 힙 구간은 finally에서 원래 바이트를 복원합니다.

## 판정

품질은 모든 legacy 행의 B/A 최소값 중앙비 중앙값 0.95–1.05입니다. TEST-073은 공용 Welch 검정과 -15% 처리량·p<0.05 조건으로 전 프로세스의 주판정 회귀가 0인지 확인하고 early/late도 기록합니다. siblings-1000은 공용 폭 (다) 밖 개선이어야 합니다. 그 행의 primeHost·selectChildren·commitSettlement ledger self와 registerPresenceChanges supplemental self가 각각 A보다 줄어야 합니다. oneOf-80·siblings-0의 ledger 총합 B 중앙값은 A 프로세스 중앙값의 최대값 이하여야 합니다. Node 힙 B 중앙값은 A 최대값 이하여야 하며 TEST-093의 3배 비율은 별도로 재판정합니다.

요약기는 자기 시간 보존, 표본 수, 프로세스 순서·독립성, 원시 재계산과 해시를 검사합니다. 공개 원시에는 전체 수치 표본을 gzip으로 보관하고 기계 로컬 경로는 가립니다. 합성 검사는 누락·불일치 증거와 각 관문의 실패를 거부하며 실제 창을 열지 않습니다. 제품 바이트·공개 계약·제품 보유 메모리는 측정 도구로 바꾸지 않습니다.
