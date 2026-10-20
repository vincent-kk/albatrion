# 421라운드 — 자동 journal 경로의 한정 검토

2026-10-19. 생산자의 읽기 전용 진단과 root의 새 증거 봉인 대조를 기록합니다. 독립 agy의 허용된 내부 자료 대조와 거절 범위의 이탈을 구별하며 설치 소스 독립 검증은 수용하지 않습니다. 이 문서는 과거 hook 호출 전체나 plugin 결함을 확정하지 않습니다.

## 생산자 자체 확인과 root 대조

새 codex gpt-6.1-sol/high 작업은 실제 worker_done으로 succeeded를 보고했습니다. 이는 한정된 현재 소스 진단의 완료이며 이전 측정 protocol은 failed입니다. 보고서 `.seiri/tasks/itemless-aa-order-probe-journal-diagnosis/report.md` SHA는 `a5b3b7f52c3ff888a91c95218a58ed70000221b75b24d1128d7590f7f577e35f`, seal SHA는 `dbeeff76226b3e96717fd2390db92cadb4521de8b52495454e27ac155a47aa0d`입니다. root는 신규9entry+selfseal10파일의 실제9entry bytes/SHA를 대조해 mismatch0을 확인하고 external terminal을 release했습니다.

생산자는 현재 Seiri0.7.7의 소스36파일·선택된 생산자 receipt12·guidance3, 유한51입력의 전후 mismatch0을 자체 확인했습니다. 이전 final seal48entry도 자체 대조해 mismatch0이었으며 옛 변경gate actual fd662687은 같고 expected cb92e157은 그대로입니다. 이 합계는 전체325의 새 재검사나 고유96파일의 증명이 아닙니다. 자기 실행은 Bun1.4.3이며 Node 호환표시 v26.3.0을 실제 Node26 실행으로 바꾸어 말하지 않습니다. 제공 hook/controller/gate/엔진 실행과 재현은0입니다.

## 현재 소스와 저장 명령의 합치

진단은 기본 adapter의 이름만 보고 판단하지 않고 실제 Codex hook 설정이 가리키는 bridge와 readable dist를 확인했습니다. 현재 경로는 actor와 paired invocation의 일치 → active binding.task → 해당 task의 gates.md 한 파일 선택 → CHECK 명령의 공백 정규화 SHA256 앞16자리 비교 → EXPECT marker → checkbox/EVIDENCE의 atomic write입니다. 실제 bridge의8anchor와22line근거는 ignored evidence.json에 있습니다. 이 단계의 source 내용과 계산은 생산자의 자체 근거이며 root의 전체 소스 재실행이 아닙니다.

| 옛 gate | 실제 command hash = CHECK hash | 실제 marker |
| --- | --- | --- |
| G10 | `894d39be2fba0108` | P1_FRESH_QUIET_ASSERTED |
| G3 | `3c0649cf65a56007` | P1_CONTROL_WINDOW_CLOSED |

저장된 정확 명령은 공백 정규화 전에도 해당 CHECK와 같았으며 marker에서 계산한 현재 EVIDENCE도 같았습니다. 이 현재 정적 경로는 surviving old binding 가설을 지지합니다. 모든 task 원장의 global scan이나 marker 없는 명령이라는 대안은 현재 소스·실제 문자열과 맞지 않습니다.

## lifecycle의 실제 범위와 역사적 공백

Orca task/dispatch와 새 출력 namespace는 현재 actor hash나 binding.task를 자동 교체하지 않습니다. 현재 pause는 binding을 suspended로 남기며 finish는 binding을 제거합니다. 새 turn도 기존 binding을 유지할 수 있고 worker_done CLI는 정식 workflow finish와 다릅니다. accepted 요청과 paired host ACK·실제 상태 적용을 구별해야 합니다.

이번 진단에서도 첫 비-entry trace-cause step은 옛 bound task 때문에 not applied였습니다. 그 사실만으로 당시 active/suspended 중 무엇이었는지 확정하지 않았습니다. 정식 새 review task start의 switched ACK 뒤 trace-cause를 적용하고 generation39/new task/review/active를 읽었습니다. 새 진단의 finish는 accepted·참여ACK 뒤 generation40/binding null/invocation0을 자체 확인했습니다. 직접 session JSON·hook/config 편집은 없습니다.

역사적 결손은 당시 raw Pre/Post hook envelope와 쓰기 직전 같은 actor의 binding/invocation snapshot, 당시 실제 hook bundle의 SHA입니다. 현재0.7.7의 bytes가 당시와 같았다는 preimage도 없으며 root pause의 과거 미적용 이유 역시 당시 raw 자료 없이 특정하지 않습니다. 다른 writer를 완전히 배제하거나 전체 과거 호출 인과를 입증하지 않습니다. 옛 gate 전체 preimage 부재로 완전 byte-exact diff도 주장하지 않습니다.

## 좁은 예방안과 오류

미래 작업에서는 첫 CHECK와 동결 전에 정식 workflow API로 새 task/ledger 연결과 실제 적용을 확인하고, mutable journal과 동결 입력의 경계를 미리 계약으로 정해야 합니다. 옛 미완료 작업은 정식 pause/전환 기록으로 남기며 이를 완료로 꾸미지 않습니다. 이번 expected 해시를 바꾸거나 active journal을 사후 제외하지 않고 사용된 raw 경로를 지워 재시도하지 않습니다. 새 실행이 필요하면 새 namespace·변경 입력·독립 검토·별도 M2를 먼저 판단합니다.

자체 구문 오류는 파일명 조회의 여분 괄호1건과 functions wrapper의 backtick1건이며 두 경우 모두 해당 nested read/제공 함수 실행 전에 중단됐습니다. 수정은 자기 읽기 코드만 바로잡았습니다. rg no-match1건은 정상 검색 결과이며 read permission denial/read failure는0입니다. 오류 원문과 전체 실패 payload 부재 한계는 read-errors.json에 남았습니다.

원시 수치 검토는 별도 round-421-p1-numeric-review.md의 한정 산술이며 G9/G11–13·G14/G15, 성능·owner59/60·PR423은 닫지 않습니다.

## 독립 검토의 범위 이탈과 root 판정

새 agy gemini-3.8-flash-high의 최종1–5절 전체를 읽었습니다. 자기 Node는 /opt/homebrew/bin/node v26.12.0이었으며 첫 Orca check는 exit1/codesign5/runtime_unavailable로 끝나 추가 IPC·worker_done은0입니다. 허용된 작업 폴더에서 생산자receipt12·지침1·이전final seal48entry의 해시와 두 명령894d39be2fba0108/3c0649cf65a56007 및 marker/EVIDENCE의 일치를 자체 계산했습니다. 이 유한 저장 자료의 독립 대조는 기록합니다.

그러나 검토자는 workspace 밖 package.json을 Node에서 여는 EPERM 뒤 view_file로 같은 설치 소스를 읽었고, 별도 bundle anchor Node 검사의 EPERM 뒤에도 view_file로 bundle을 읽었다고 밝혔습니다. brief는 어떤 추가 거절이든 해당 범위를 멈추고 대체 접근을 하지 말라고 명시했습니다. 따라서 root는 이 두 거절 범위의 대체 읽기를 허용 범위 이탈로 판정하고 설치 소스·bundle의 독립 확인 주장을 수용하지 않습니다. 외부 소스51개 전수 해시를 완료한 것처럼 쓰지 않으며 현재 소스 메커니즘은 생산자의36파일 근거와 저장 자료에 대한 한정 논리로 남깁니다. 이 사유는 기술 검토의 미완료이며 소유자의 성능·정책 판단으로 바꾸어 대행하지 않습니다.

자체 명령 오류에는 두 EPERM 외에 Node 인라인 명령의 backtick이 셸 치환되어 .changeset command not found와 TypeError가 난1건이 있습니다. 조합 문자열을 고친 자기 명령 대조는 성공했지만 이를 처음부터 오류0으로 쓰지 않습니다. 정확한 전체 script 원문은 최종 보고에 모두 제시되지 않았으며 새 재실행을 요구하지 않았습니다. 새 hook/엔진·이전gate 실행·권한/config 수정은 없습니다.

root가 보존한 .seiri/tasks/itemless-aa-order-probe-journal-review/root-captured-final.txt는 최종 전체168행의 terminal stream/fallback 자료입니다. 완전한 hook transcript나 과거 actor envelope가 아닙니다. 최종과 idle을 확인한 뒤 정확 dispatch를 stop/release했고 archive unavailable이었으며 성공한 worker_done을 꾸미지 않았습니다. 원래 보존 실패는 그대로 두고 원장 게시를 위한 허용된 검사만 이어갑니다.

예방 규칙은 새 작업이 옛 frozen journal을 소유한다고 가정하지 않도록 현재 연결·실제 쓰기 경계·동결 전에 확인하라는 운영 요구입니다. 독립 설치 소스 검증이 통과했다거나 자동 guard 구현이 끝났다는 뜻이 아닙니다. 미래 timing/새controller가 필요하면 그때의 구체 도구와 namespace·작업연결 증거를 새 범위로 검토해야 합니다.
