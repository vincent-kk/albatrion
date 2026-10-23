# 421라운드 — P1 실제 실행과 보존 실패 기록

2026-10-19. 코디네이터가 실제 완료된 제어부 기록과 새 증거 봉인의 경로·해시를 읽은 기록입니다. 생산자의 원시 산술 관찰과 독립 검산은 구별하며 전체 protocol은 실패입니다.

## 재개와 실제 실행

옛 실행 작업은 같은 질문의 600000ms timeout 세 건 뒤 새 M2가 없어 failed로 끝났으며 controller/엔진/시간 실행은 0회였습니다. 그 완료 메시지를 처리하고 external terminal을 release했습니다. 늦은 HOLD 정리 reply는 exit1 dispatch_inactive였고 다시 시도하지 않았습니다. 이 상태는 보존 대상이며 이후 실행으로 소급 수정하지 않습니다.

새 재개 작업은 actual physical13040파일·1890021427bytes와 기존325경로를 사전에 대조했습니다. 새 witness SHA는 `0de6bfe6c442f31fdb7600a82c7ea2cfe48ec91bfa6b8fab2e58c9d8765ecd79`입니다. 새 질문에 대한 실제 root 답은 2026-10-19T01:35:37Z, 만료는01:45:37Z이며 unchanged controller1회·고정AB다음BA·첫실패중단·재시도금지로 한정했습니다. 기존 M1과 유효 G8은 실제 입력 해시를 대조해 재사용했습니다.

root는 관련 nested terminal의 완료 보고와 idle TUI를 읽고 succeeded/settled를 작업 유휴로 정규화하되 원래 상태를 함께 남겼습니다. 현재 측정 워커는 승인 대기 중인 활성 작업이므로 idle 목록에서 제외했습니다. 전체 관리 워커 목록과 시점별 프로세스 관찰은 OS 전체 무활동이나 noise 부재를 증명하지 않습니다. 실행 창에서는 root가 가벼운 메일 확인만 했습니다.

| 구간 | 실제 저장 기록 |
| --- | --- |
| controller | 정확1회, exit0, P1_CONTROL_WINDOW_CLOSED |
| 자동 quiet | 2026-10-19T01:37:20.248Z–01:38:03.475Z |
| 종료 | last-child-returned, closedByMailboxPolling:false |
| AB child | PID57718, 01:37:20.401Z–01:37:41.861Z, exit0 |
| BA child | PID58079, 01:37:42.017Z–01:38:03.475Z, exit0 |
| AB raw 함수 | import뒤01:37:20.670Z–01:37:41.792Z |
| BA raw 함수 | import뒤01:37:42.288Z–01:38:03.453Z |

quiet 시작은 첫 beforeLaunch hash guard를 포함하며 raw 함수 시각은 OS process birth가 아닙니다. controller1회·엔진2회와 별도 untimed collector/verifier의 프로세스 수를 혼동하지 않습니다. 새 sourceE/trueB 실행은 없습니다.

## 보존 실패와 중단

종료 후 actual physical13040의 bytes·path/link identity와 source/runtime/refs/두 index는 일치했습니다. 그러나 protected325 중 옛 `.seiri/tasks/itemless-aa-order-probe-execution/gates.md` 한 경로의 expected `cb92e1572bd4b2754c2d8e7e0a220bc5f98e7e8f112109f957c8e74107d4e152`와 actual `fd662687f71f6745b37d918bbd767a0bb514ffd867f64ce013182725838ae7cf`가 달랐습니다. mtime은01:38:06.158Z입니다. old G10/G3 자동 met 응답과 checkbox 상태 두 개의 projection이 일치하지만 옛 전체 byte preimage가 없어 전체 byte-exact diff나 변경 전부가 두 줄뿐이라는 주장은 하지 않습니다.

root는 affected G9/G11–13 chain을 중단하고 failed로 종료하도록 답했습니다. 옛 문서를 복구하거나 기대 해시를 바꾸지 않았고 추가 sealed verifier·controller·엔진 실행은 없습니다. G9/G11–13의 실행 및 독립 G14·해석 G15는 이 기록으로 완료되지 않습니다. 현재 raw의 읽기 전용 산술 검토는 실패한 창의 원시 관찰을 보완할 뿐 보존 실패를 치유하지 않습니다.

옛 workflow binding이 active/execute로 남아 있는 기록을 root가 읽었습니다. root의 정식 runtime pause 요청은 accepted였으나01:42:59.634Z에 관찰한 해당 레코드는 active/execute/generation36이었습니다. root는 적용되었다는 앞선 상태 표현을 즉시 정정했고 accepted와 실제 적용 미확인을 구별하도록 워커에게 전했습니다. 재시도나 config/auth/hook 수정은 하지 않았습니다. 별도 원인 진단에서 실제 기록 선택 경로를 확인하기 전에는 hook의 전체 인과 경로나 결함을 확정하지 않습니다.

## 새 증거와 후속 한계

새 ignored 재개 보고서는 `.seiri/tasks/itemless-aa-order-probe-resume/report.md`, SHA `34c3062953ef53caee276e428ac9312dac8ff291b0439bfcc931ed12439d8e9f`입니다. seal SHA는 `1afc825e07e0c40f4928b824fbb64ea98de5c12ccb9704835c1b0791fad023d5`이며 local32와 새 external13, 합45entry에 selfseal을 더한46파일입니다. root는 seal의 실제45entry bytes·SHA를 자체 대조해 mismatch0을 확인했습니다. 이는 새로운 증거 봉인의 대조이며 이전325 보존 실패와 구분합니다.

| 원시 파일 | SHA256 |
| --- | --- |
| tool/run-ab/raw.json | `5741d0a0e8d7b3278f6ed7552b6f0c954b1a3edc068fc9aab929f263a3e66558` |
| tool/run-ba/raw.json | `5b3ebe00978c7abb6efc2c85ebd267d20a7c454a6984393554a5f765cff205fe` |

측정 후 생산자가 자기 세션의 옛 작업 pause를 한 번 호출해 accepted와 participation-only host ACK를 받은 기록도 별도 보존했습니다. 실제 관찰시각은2026-10-19 01:47:14 UTC이며 global 적용이나 측정 당시 상태를 소급 증명하지 않습니다. 최종 final-report.md SHA는 `b53ad63c16521eec9451ef7c9c3dbf90cdf2b9a2c6c0191343e078ad2c227ad2`, seal-final.json SHA는 `88a539c3e502aa9f64136bbdc79c37509456cf926eb4c6bef72d477de2c33438`입니다. 기존45entry와 selfseal 및 후속기록을 포함한 최종48entry+selfseal=49파일을 root가 자체 대조해 mismatch0을 확인했고 실제 worker_done의 failed를 수용했습니다. 기존 report/seal은 바꾸지 않았으며 같은 terminal은 새 읽기 전용 journal 진단 작업으로 재사용합니다.

생산자의 자체 raw 관찰은38timed행/3800samples/760warmups/preflight84이며 각 raw는 stable34/unsupported4/async4입니다. 독립 검토자는 별도로 모든 표본과 중앙값·비율·고정 순서를 확인해야 합니다. 두 pilot으로 GC/JIT 원인·안정 효과·noise 수용·E 인과·trueB 동치를 주장하지 않습니다.

이번 재개에서는 새 M2의 자연 timeout5건과 actual post-protection assertion1건을 보존했습니다. root의 초기 show-ref raw와 worker의 trimmed for-each-ref 해시는 직렬화가 달라 달랐으며 같은 명령의 trimmed 결과는 원905c8372와 일치했습니다. root가 존재를 가정한 plan/gates.json 읽기 ENOENT도 실제 gates.md를 확인해 바로잡았습니다. context-mode의 workspace 밖 lifecycle 문서 execute_file 읽기는 거절되어 다른 접근이나 허용 설정 변경으로 우회하지 않았고 이미 읽은 lifecycle 규칙만 사용했습니다.

main/origin809ae43424cdb533b9275d1d5efd22b436feb4a6, E없는 main source1be215791f077fc7dc51825a357e916316193ecb, nested282685f27aea0a82c042b4d945e2730dc9d4f9a3를 유지합니다. owner59/60, TEST-027/M3/54/58, PR423 병합·성능 수용과 T14/F·global Filid 미해결은 그대로입니다. 소유자의 두 새 원문은 round-421-owner-answers.md와 owner TSV·landing에 별도 기록했습니다.
