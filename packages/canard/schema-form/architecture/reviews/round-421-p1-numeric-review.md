# 421라운드 — 실패한 P1 창의 독립 raw 산술 검토

2026-10-19. 새 Orca agy gemini-3.8-flash-high의 실제 최종 1–6절과 뒤 보완 응답을 코디네이터가 읽고 범위를 판정한 기록입니다. 검토자는 자기 Node v24.20.0에서 원시 표본을 계산했으며 이 문서는 root의 검토 기록입니다. 보존 실패가 있어 전체 protocol과 G14/G15는 HOLD입니다.

## 실제 검토와 한계

첫 worker-start는 turn_start_unobserved였지만 이후 실제 파일 읽기·자체 Node 계산과 최종 응답을 관찰했습니다. 초기 자기 terminal의 `orca orchestration check --terminal term_6bcfc895-49fa-4af7-8f92-008cfa00470b --json`은 cwd `/Users/Vincent/Workspace/albatrion`에서 exit1이었고 codesign task_name_for_pid failure5 및 runtime_unavailable의 runtime metadata 읽기 거절을 반환했습니다. 추가 IPC·heartbeat·ask·worker_done은0이며 권한·설정·인증 변경이나 우회는 없습니다.

검토자는 실제 실행 경로 `/Users/Vincent/.nvm/versions/node/v24.20.0/bin/node`에서 자체 읽기 전용 검토 호출16회를 설명했습니다. 제공 script/verifier/driver·엔진 import·내부 child process·Git·브라우저·쓰기는0입니다. 자기 유한32경로의 bytes/SHA와 저장 raw 자체의 표본·계수·상태 속성을 확인했습니다. physical13040/1890021427bytes 전체, 나머지 보호324경로, Git/사전부재/실제 실행 경계는 생산자 저장 기록의 판독이며 검토자 자체 재실행이 아닙니다. 실제 warmup 실행760회와 callback 배달을 다시 수행한 것이 아니라 raw의 정수warmups20·callbackCount·관찰배열·정확성/배수 상태를 읽었습니다.

최초 보고의 자체 실패0은 Node 예외/산술 중단이 없었다는 한정 설명입니다. 후속 확인에서 status를 짧은 문자열 stable과 비교해 other42가 나온 예비 관찰과 숫자warmups의 length가 undefined인 관찰 두 건을 별도 밝혔습니다. 실제 status enum을 읽어34/4/4로 정정하고 warmups 자료형과 값20을 확인했습니다. 기대된 음성 시험이나 생산자의 보존 실패로 이 관찰 오류를 대신하지 않습니다.

최종seal48entry를 검토자가 전수 재해시한 것은 아닙니다. seal 파일 자체와 계수를 읽고 유한32경로를 자체 해시했습니다. root가 별도로 수행한 최종48entry 대조와 구별합니다. 최초의 모든 소스100%보존·G14완결이라는 표현은 이 유한 읽기 전용 범위와 독립 산술에만 한정하며 전역 불변성·host noise·protocol PASS로 채택하지 않습니다.

## 원시 산술

각 raw19행, 합38행의 각100개 samplesMs를 유한 숫자로 확인하고 정렬한49/50인덱스의 평균으로 중앙값을 계산했습니다. 저장 medianMs와 정확 불일치는0입니다. 총3800samples, raw metadata의 warmups 합760, preflight84=stable68/unsupported8/async8, 시간 제외16건을 확인했습니다. 앞16행의 장면·base/candidate 순서는 같고 focal만17/18을 교환했으며 legacy19는 고정입니다. reference timing은0이며 sourceE/trueB 새 실행은 없습니다.

아래 백분율은 각 raw의 독립 중앙값으로 계산한 `(candidate-base)/base*100`이며 full precision입니다. 18개 같은A 라벨쌍·9개 장면순서쌍이고 독립 process 반복18회가 아닙니다.

| 장면 | AB 차이(%) | BA 차이(%) |
| --- | ---: | ---: |
| root-itemless-N1000 | 124.14439460971252 | 55.37776879212459 |
| root-itemless-N8000 | -5.544574780054745 | -10.81655839814096 |
| nested-itemless-N1000 | -10.389338664025827 | 14.317216625780752 |
| nested-itemless-N8000 | -1.3817051018231687 | 2.0275267172994456 |
| root-BN-N1000 | 0.046428099480499294 | -2.6779378568562695 |
| root-BN-N8000 | -0.6272923509715513 | -0.06519886327349333 |
| root-terminal-N1000 | 93.5937366488717 | -26.520392624460136 |
| root-terminal-N8000 | -35.96721951222894 | -30.198561184210536 |
| object-B0-N1000 | 0.1954764396826877 | 16.311986575662267 |

| 초점 | base 중앙값(ms) | candidate 중앙값(ms) | C/B | 빠른 라벨·위치 |
| --- | ---: | ---: | ---: | --- |
| AB | 1.1937500000003638 | 1.1960834999990766 | 1.001954764396827 | base·17 |
| BA | 0.935021000001143 | 1.0875415000009525 | 1.1631198657566226 | base·18 |

같은 base 라벨이 다른 위치에서 더 낮은 중앙값을 보였으므로 강한 결정론적 동일 위치 예측과 맞지 않는 원시 관찰입니다. 이는 실패한 창에서 읽은 한정 산술이며 일반적 순서 독립성·통계적 안정 효과·GC/JIT 원인·noise 수용·E 인과·trueB 동치 또는 성능 수용을 입증하지 않습니다. 새 helper URL/callsite가 같지 않은 옛 창과 절대값을 연결하지 않습니다. 작은 AB 차이와 표본 변동을 지워 안정된 효과라고 하지 않습니다.

## 원시 해시와 기록 보존

AB raw SHA는 `5741d0a0e8d7b3278f6ed7552b6f0c954b1a3edc068fc9aab929f263a3e66558`, BA는 `5b3ebe00978c7abb6efc2c85ebd267d20a7c454a6984393554a5f765cff205fe`입니다. 자동 창·고정argv·PID·Node binary와 protected325중1개 불일치는 실행 기록의 사실과 일치하며 옛 전체 gate preimage 부재도 인정했습니다.

root가 최종 1–6절을 읽은 뒤 터미널 스트림에서 보존한 ignored `.seiri/tasks/itemless-aa-order-probe-numeric-review/root-captured-final.txt`는251행·22279bytes, SHA `7c5ea63050421a541f733232aacea1b5adc0d6f909aa93e7c3b23e8b16bbfb09`입니다. 별도 보완 응답은 root-captured-clarification-tail.txt에 남았습니다. 후자의 시작은 호출6 중간이며 호출1–5/6앞부분은 retained stream에서 유실되어 전체16호출의 정확 argv 원문을 모두 복구했다고 하지 않습니다. 호출13·14의 사람이 읽는 script 본문에서 유한100개 단언·중앙 두값·중앙값 정확대조와 각9장면 비율식을 확인했습니다. 이를 실행하거나 누락 원문을 만들어 채우지 않았습니다. Orca exact transcript는 없어 이 자료는 root가 보존한 stream/fallback 관찰입니다.

첫 capture는 뒤 prompt가 이미 확인 요청 문구로 바뀌어 idle 단독prompt 경계 검사에서 중단되었고 어떤 부분 파일도 쓰지 않았습니다. 실제 관찰된 뒤 확인 요청 경계로 원래251행을 보존했습니다. 보완 요청은 새 산술·명령·해시·IPC 없이 기존 기록 설명만 요구했습니다.

최종 응답과 보완 뒤 idle을 확인하고 root가 정확 dispatch를 stop한 뒤 release했습니다. 결과는 closed_agent_terminal과 archive unavailable이었으며 성공한 worker_done을 꾸미지 않았습니다. 검토 판정은 grounded-only이고 old325 보존 실패·G9/G11–13 미완료·G14/G15와 owner59/60·PR423·성능 수용 보류는 그대로입니다.
