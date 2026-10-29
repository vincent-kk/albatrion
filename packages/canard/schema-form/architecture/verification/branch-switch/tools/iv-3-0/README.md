# Ⅳ-3-0 함수 샘플링 도구

설계 Ⅳ의 승인된 Ⅳ-3-0만 수행합니다. 제품 변경·A/B·성능 창은 없습니다. Node의 기존 비축소 제품 build를 쓰며 Bun에는 같은 V8 장치가 없습니다.

```sh
yarn workspace @canard/schema-form build
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/checkTools.mjs
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/prepare.mjs "$PROFILE_ROOT"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/profile.mjs smoke "$PROFILE_ROOT"
# 코디네이터가 기계 독점 사용을 허가한 뒤에만 실행합니다.
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/rehearse.mjs "$PROFILE_ROOT" --authorized "$PROFILE_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/profile.mjs run "$PROFILE_ROOT" --authorized "$PROFILE_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/publish.mjs "$PROFILE_ROOT"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/checkResults.mjs
```

`PROFILE_ROOT`는 아직 존재하지 않는 외부 `.noindex` 디렉터리입니다. 내부 원시는 `raw.noindex`에 보존합니다. 준비 뒤 입력이 달라지면 새 root가 필요합니다. 스모크는 행당 한 폼·한 동작이며 시계를 읽지 않습니다. 정식 실행은 행당 2,000 예열·20,000 동작, 100동작 블록 중앙값, 500동작마다 타이밍 밖 `setImmediate`입니다. oneOf는 왕복 2쓰기, siblings는 한 쓰기, flat은 `/field_000` 한 잎 쓰기입니다. flat의 조상 조립이 최소화되는 기존 fixture를 재사용하지만 실제 값을 매번 바꾸므로 진짜 no-op은 아닙니다.

공용 quiet gate의 3초 평균·30%·일반 120초/Spotlight 600초 정책을 재사용합니다. 환경 거절은 보존 후 질문하며 자동 재시도하지 않습니다. 함수 이름을 읽을 수 없으면 실행 전에 질문합니다. 표본별 실측 `timeDeltas`로 가중한 self 합을 같은 구간의 평균 벽시계와 ±15%로 비교합니다. 요청 간격 50 µs에서 실패하면 25 µs로 한 번 더 실행하고 여전히 실패하면 보존 후 질문합니다. nominal self는 보조 진단이며 주 수치를 벽시계에 맞춰 정규화하지 않습니다.

`attribute.mjs`는 원시 CpuProfile의 타임스탬프와 벽시계 블록을 맞추고 측정 구간의 leaf 표본만 셉니다. self는 각 표본 다음까지의 실측 간격 합 ÷ 동작 수이며 마지막 표본은 자기 간격을 씁니다. `(program)`·`(idle)`을 self 및 백분율 가중치 분모에서 제외하고 그 비율을 보고합니다. 수기 `branches.json`의 정확한 이름이나 근거 있는 URL·줄을 못 찾은 프레임은 OTHER입니다. 번들 `//#region`은 원본 모듈 근거입니다. 독립 합성 탐침에서는 V8이 인라인된 JavaScript 함수를 자기 이름으로, Map 내장 함수 시간은 호출한 JavaScript self에 귀속했습니다. 실제 행의 프레임은 그대로 보고합니다.

각 행에 수집기를 끈 독립 plain 프로세스를 같은 2,000/20,000 설정으로 하나 더 실행하고 수집기 부담을 평균·중앙값 비율로 적습니다. Ⅳ-0 plain과의 참고 비교에는 이 별도 plain만 씁니다. 요청 간격·실측 평균 간격·표본 수·간격 p10/p50/p90과 양자화 대역 간격 추정도 보고합니다. 관측 대역 간격은 시계의 기본 해상도가 아니며 두 개 이상의 반복 대역이 없으면 식별 불가로 남깁니다. 예행도 전체 프로파일의 첫 간격을 뺀 실측 평균 간격을 보존합니다.

준비 root는 실제 경로로 정규화하며 경로가 달라졌다는 사실만 결과에 적습니다. 준비할 때 제품 소스가 기준과 같은지, dist 수정 시각이 모든 제품 소스보다 늦은지, 수기 프레임 주소의 근거가 맞는지 검사합니다. 귀속 실패도 명시적 중단 결과와 원시를 남깁니다. 후보 1의 계약 변경 승인은 코디네이터의 수정 디스패치에 근거하며 실제 프로파일 허가는 별도로 기다립니다.

검증은 `checkTools.mjs`, 도구 `--allowJs --checkJs`·ESLint·Prettier, 패키지 build·lint입니다. 원시 게시 뒤 `checkResults.mjs`는 입력 해시, 경로 제거, 원시에서의 전체 표 재생성과 결과 문서의 결정적 재생성을 검사합니다. 노출되는 CPU 관측은 상위 10개 프로세스 이름·비율뿐입니다.
